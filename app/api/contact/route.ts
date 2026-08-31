/**
 * Contact Messages — Public API
 * POST /api/contact — submit contact form
 * Creates customer if needed, stores message, sends notification
 */

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { ContactMessageRepository } from '@/lib/db';
import { notificationService } from '@/lib/services/notificationService';
import { successResponse, badRequest, internalServerError } from '@/lib/api';

const ContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  phone: z.string().min(8, 'Phone is required').max(20).transform(v => v.trim()),
  email: z.string().email('Invalid email').optional().or(z.literal('')).transform(v => (v ? v.trim() : null)),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

function normalizePhone(p: string): string {
  return p.replace(/\s+/g, ' ').trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return badRequest('Invalid JSON body');

    const parsed = ContactSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return badRequest(first.message, { issues: parsed.error.issues });
    }

    const { name, phone, email, message } = parsed.data;
    const phoneNorm = normalizePhone(phone);
    const emailNorm = email && email.length > 0 ? email.toLowerCase() : null;
    const nameTrim = name.trim();

    const admin = createAdminClient();
    const contactRepo = new ContactMessageRepository(admin);

    // ── Find or create customer ─────────────────────────
    let customerId: string | null = null;
    let isExistingCustomer = false;

    // 1) try by phone exact
    if (phoneNorm) {
      const { data: byPhone } = await admin
        .from('customers')
        .select('id, name, email, phone')
        .eq('phone', phoneNorm)
        .maybeSingle();
      if (byPhone?.id) {
        customerId = byPhone.id;
        isExistingCustomer = true;
      }
    }
    // 2) try by phone digits-only fallback if not found
    if (!customerId && phoneNorm) {
      const digits = phoneNorm.replace(/\D/g, '');
      if (digits.length >= 8) {
        const { data: allByPhone } = await admin.from('customers').select('id, phone').limit(100);
        // naive scan for digit match (since Supabase can't easily do regex normalize)
        const found = (allByPhone ?? []).find((c: any) => (String(c.phone ?? '').replace(/\D/g, '') === digits));
        if (found) {
          customerId = found.id;
          isExistingCustomer = true;
        }
      }
    }
    // 3) try by email if still not found
    if (!customerId && emailNorm) {
      const { data: byEmail } = await admin
        .from('customers')
        .select('id')
        .ilike('email', emailNorm)
        .maybeSingle();
      if (byEmail?.id) {
        customerId = byEmail.id;
        isExistingCustomer = true;
      }
    }

    // 4) create new customer if none found
    if (!customerId) {
      const { data: newCust, error: createErr } = await admin
        .from('customers')
        .insert({
          name: nameTrim,
          phone: phoneNorm,
          email: emailNorm,
        })
        .select('id')
        .single();
      if (createErr) throw createErr;
      customerId = newCust.id;
      isExistingCustomer = false;
      // notify new customer (best-effort)
      try {
        await notificationService.notifyNewCustomer(customerId!, nameTrim, emailNorm ?? '');
      } catch (e) {
        console.error('notifyNewCustomer failed:', e);
      }
    }

    // ── Create contact message ──────────────────────────
    const { data: created, error: msgErr } = await contactRepo.create({
      customer_id: customerId,
      name: nameTrim,
      phone: phoneNorm,
      email: emailNorm,
      message: message.trim(),
      status: 'new',
      is_customer: isExistingCustomer,
      is_starred: false,
    } as any);

    if (msgErr) throw msgErr;

    // ── Notify admins (message type) ────────────────────
    try {
      await notificationService.createIfEnabled({
        type: 'message',
        priority: 'medium',
        title: `New message from ${nameTrim}`,
        message: `${phoneNorm}${emailNorm ? ` · ${emailNorm}` : ''} — ${message.slice(0, 120)}${message.length > 120 ? '…' : ''}`,
        metadata: {
          contactMessageId: created.id,
          customerId,
          name: nameTrim,
          phone: phoneNorm,
          email: emailNorm,
          isExistingCustomer,
        },
      });
    } catch (e) {
      console.error('Failed to create message notification:', e);
    }

    return successResponse(
      {
        id: created.id,
        customerId,
        isExistingCustomer,
        message: 'Message sent successfully',
      },
      201
    );
  } catch (err: any) {
    console.error('POST /api/contact error:', err);
    return internalServerError(err?.message ?? 'Failed to send message');
  }
}

// GET is not public for contact; redirect hint
export async function GET() {
  const { NextResponse } = await import('next/server');
  return NextResponse.json(
    { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET /api/admin/contact-messages to list messages. POST /api/contact to create.' } },
    { status: 405 }
  );
}

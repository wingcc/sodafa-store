"use client";
import React, { useState, useRef } from "react";
import { CloseSVG, SendSVG, PhoneSVG, MailSVG, MapPinSVG, ClockSVG, InstagramSVG, FacebookSVG, TikTokSVG, WhatsAppIcon } from "../common/icons";
import type { SiteConfig } from "../common/types";

interface ContactModalProps {
  site: SiteConfig;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export default function ContactModal({ site, onClose, showToast }: ContactModalProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const waUrl = `https://wa.me/${site.whatsappStore}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form?.checkValidity()) { form?.reportValidity(); return; }
    setSending(true);

    const formData = new FormData(form);
    const name = (formData.get('name') as string || '').trim();
    const phone = (formData.get('phone') as string || '').trim();
    const email = (formData.get('email') as string || '').trim();
    const message = (formData.get('message') as string || '').trim();

    // Basic client validation (mirrors /api/contact)
    if (name.length < 2 || phone.length < 8 || message.length < 10) {
      form.reportValidity();
      setSending(false);
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("البريد الإلكتروني غير صحيح");
      setSending(false);
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email: email || undefined,
          message,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message || 'Failed to send');
      }
      setSent(true);
      showToast("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.");
      form.reset();
      setTimeout(() => { setSent(false); setSending(false); onClose(); }, 1800);
    } catch (err: any) {
      // Fallback: still try to notify admin so nothing is lost
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'message',
            title: 'New contact message (fallback)',
            message: `From ${name} (${phone}${email ? ', ' + email : ''}): ${message.slice(0, 100)}${message.length > 100 ? '...' : ''} — ${String(err?.message ?? '')}`,
            priority: 'medium',
          }),
        });
        setSent(true);
        showToast("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.");
        form.reset();
        setTimeout(() => { setSent(false); setSending(false); onClose(); }, 1800);
      } catch {
        showToast(err?.message || "فشل الإرسال، حاولي مرة أخرى أو عبر واتساب");
        setSending(false);
      }
    }
  };

  return (
    <div className="modal open" id="contactModal">
      <div className="ovl" onClick={onClose} />
      <div className="modal-box cm-box">
        <button className="m-close" onClick={onClose} aria-label="إغلاق">
          <CloseSVG />
        </button>

        <div className="cm-form">
          <h3>أرسلي لنا رسالة</h3>
          <p>املئي النموذج وسنرد عليك في أقرب وقت ممكن</p>

          <form id="cForm" ref={formRef} onSubmit={handleSubmit} noValidate>
            <div className="f-row">
              <div className="f-field">
                <label htmlFor="cfName">الاسم الكامل</label>
                <input type="text" id="cfName" name="name" placeholder="أدخلي اسمك الكامل" required />
              </div>
              <div className="f-field">
                <label htmlFor="cfPhone">رقم الهاتف</label>
                <input type="tel" id="cfPhone" name="phone" placeholder="+212 6XX XXX XXX" required />
              </div>
            </div>
            <div className="f-field">
              <label htmlFor="cfEmail">البريد الإلكتروني <span style={{ fontWeight: 400, opacity: 0.6, fontSize: '0.85em' }}>(اختياري)</span></label>
              <input type="email" id="cfEmail" name="email" placeholder="example@email.com" />
            </div>
            <div className="f-field">
              <label htmlFor="cfMsg">الرسالة</label>
              <textarea id="cfMsg" name="message" rows={4} placeholder="اكتبي رسالتك هنا..." required />
            </div>
            <button
              type="submit"
              className={`btn btn-send${sent ? " sent" : ""}`}
              disabled={sending}
            >
              {sent ? "✓ تم إرسال رسالتك بنجاح" : sending ? "جارٍ الإرسال..." : <><SendSVG />إرسال الرسالة</>}
            </button>
          </form>
        </div>

        <div className="cm-side">
          <div className="pat" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h3>معلومات التواصل</h3>
            <div className="cinfo">
              <span className="icb"><PhoneSVG /></span>
              <div><b>الهاتف</b><a className="gold" href={`tel:${site.phoneTel}`} dir="ltr">{site.phoneDisplay}</a></div>
            </div>
            <div className="cinfo">
              <span className="icb"><MailSVG /></span>
              <div><b>البريد الإلكتروني</b><a className="gold" href={`mailto:${site.email}`} dir="ltr">{site.email}</a></div>
            </div>
            <div className="cinfo">
              <span className="icb"><MapPinSVG /></span>
              <div><b>العنوان</b><span>{site.address}</span></div>
            </div>
            <div className="cinfo">
              <span className="icb"><ClockSVG /></span>
              <div><b>ساعات العمل</b><span>{site.hoursContact}</span></div>
            </div>

            <h4>تابعينا على</h4>
            <div className="social-row">
              <a href={site.instagram} target="_blank" rel="noopener" aria-label="Instagram"><InstagramSVG /></a>
              <a href={site.facebook} target="_blank" rel="noopener" aria-label="Facebook"><FacebookSVG /></a>
              {site.tiktok && <a href={site.tiktok} target="_blank" rel="noopener" aria-label="TikTok"><TikTokSVG /></a>}
            </div>

            <a className="btn btn-wa" href={waUrl} target="_blank" rel="noopener" style={{ marginTop: "1.5rem", width: "100%", padding: ".95rem" }}>
              <WhatsAppIcon size={19} />تواصلي معنا عبر واتساب
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

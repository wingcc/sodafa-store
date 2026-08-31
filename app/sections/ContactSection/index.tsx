"use client";

import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import type { SiteConfig } from "../common/types";

// ── Inline icons (Tailwind-friendly, no external deps) ──
function SendIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
    </svg>
  );
}
function PhoneIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .95.68l1.5 4.49a1 1 0 0 1-.5 1.21l-2.26 1.13a11 11 0 0 0 5.52 5.52l1.13-2.26a1 1 0 0 1 1.21-.5l4.49 1.5A1 1 0 0 1 21 15v3.28a2 2 0 0 1-2 2h-1C9.72 20.28 3 13.56 3 5.28V5Z" />
    </svg>
  );
}
function MailIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
    </svg>
  );
}
function MapPinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z" />
      <circle cx={12} cy={10} r={3} />
    </svg>
  );
}
function ClockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7v5l3.2 1.9" />
    </svg>
  );
}
function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" className={className} aria-hidden>
      <path d="M5 12.5 10 17l9-9" />
    </svg>
  );
}
function SparkleIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="M19 13l.9 2.1L22 16l-2.1.9L19 19l-.9-2.1L16 16l2.1-.9L19 13Z" />
      <path d="M5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14Z" />
    </svg>
  );
}
function WhatsAppGlyph({ className = "w-[19px] h-[19px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.9-5.2c-.6-1-.9-2-.6-2.6.2-.5.8-1.4 1.3-1.5.4 0 .7 0 .9.5l.7 1.6c.1.3 0 .6-.2.8l-.5.6c-.2.2-.2.4-.1.7.5.9 2 2.4 3.2 2.9.3.1.5.1.7-.1l.7-.8c.2-.3.5-.3.8-.2l1.7.8c.4.2.6.4.6.6 0 .2 0 .5-.1.8Z" />
    </svg>
  );
}
function InstagramGlyph({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5.2" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.4" cy="6.6" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FacebookGlyph({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5h1.65V4.6c-.3-.04-1.3-.13-2.4-.13-2.4 0-4 1.46-4 4.13v2.3H7.6V14h2.7v8h3.2Z" />
    </svg>
  );
}
function TikTokGlyph({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 3c.4 2 1.7 3.4 3.9 3.6v2.9c-1.5 0-2.8-.4-3.9-1.2v5.6c0 3.9-2.7 6.1-5.7 6.1-3.2 0-5.9-2.3-5.9-5.7 0-3.6 3.1-6 6.5-5.6v3c-1.7-.4-3.4.6-3.4 2.5 0 1.6 1.2 2.8 2.8 2.8 1.6 0 2.8-1.1 2.8-3V3h2.9Z" />
    </svg>
  );
}

// ── Component ──
interface ContactSectionProps {
  site: SiteConfig;
}

export const ContactSection = ({ site }: ContactSectionProps) => {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const isFr = locale === "fr";
  const tr = (ar: string, fr: string, en: string) => (isAr ? ar : isFr ? fr : en);
  const dir = isAr ? "rtl" : "ltr";

  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const waUrl = `https://wa.me/${String(site.whatsappStore || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(site.whatsappMessage || "مرحبا، أريد الاستفسار")}`;
  const telUrl = `tel:${site.phoneTel}`;
  const mailUrl = `mailto:${site.email}`;

  function validate() {
    const e: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) e.name = "الرجاء إدخال اسم صحيح (حرفين على الأقل)";
    if (!formData.phone.trim()) e.phone = "رقم الهاتف مطلوب";
    else if (!/^[\d+\s\-()]{8,16}$/.test(formData.phone.replace(/\s/g, ""))) e.phone = "رقم هاتف غير صحيح";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "البريد الإلكتروني غير صحيح";
    if (!formData.message.trim() || formData.message.trim().length < 10) e.message = "الرسالة قصيرة جداً (10 أحرف على الأقل)";
    return e;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          message: formData.message.trim(),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        const msg = json?.error?.message || "Failed to send. Please try again or contact us on WhatsApp.";
        // surface field errors if API returns details
        if (json?.error?.details?.issues) {
          const fieldErrors: Record<string, string> = {};
          for (const iss of json.error.details.issues) {
            const path = String(iss.path?.[0] ?? "");
            if (path) fieldErrors[path] = iss.message;
          }
          if (Object.keys(fieldErrors).length) {
            setErrors(fieldErrors);
            return;
          }
        }
        throw new Error(msg);
      }
    } catch (err: any) {
      // Fallback notify admins via old channel so nothing is lost
      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "message",
            title: "New contact message (fallback)",
            message: `From ${formData.name} (${formData.phone}${formData.email ? ", " + formData.email : ""}): ${formData.message.slice(0, 120)} — ${String(err?.message ?? "")}`,
            priority: "medium",
          }),
        });
      } catch {}
      // Still show success to user if fallback succeeded? No — show error inline
      setErrors((p) => ({ ...p, _form: err?.message ?? "Failed to send message" }));
      return;
    } finally {
      setSending(false);
    }
    setSubmitted(true);
    setFormData({ name: "", phone: "", email: "", message: "" });
    setTimeout(() => setSubmitted(false), 4200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (errors._form) setErrors((p) => { const n={...p}; delete n._form; return n; });
  };

  return (
    <section
      id="contact"
      dir={dir}
      className="relative isolate overflow-hidden bg-[#FCFBF7] py-12 sm:py-16 lg:py-[72px]"
      style={
        {
          // brand tokens fallback if store.css not loaded
          ["--brand" as string]: "#1E7A57",
          ["--brand-deep" as string]: "#07231A",
          ["--brand-deep2" as string]: "#11402F",
          ["--brand-tint" as string]: "#EAF4EE",
          ["--brand-soft" as string]: "#CDE8DB",
          ["--accent" as string]: "#C6A15B",
          ["--accent-soft" as string]: "#E8CE93",
          ["--ink" as string]: "#122A20",
          ["--muted" as string]: "#5A6B5F",
        } as React.CSSProperties
      }
    >
      {/* ── Background decor: blobs + grid ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* radial blobs */}
        <div className="absolute -top-28 -right-28 h-[520px] w-[520px] rounded-full bg-[#EAF4EE] opacity-70 blur-[1px]" style={{ background: "radial-gradient(circle at 30% 30%, #EAF4EE 0%, #FCFBF7 70%)" }} />
        <div className="absolute -bottom-40 -left-40 h-[560px] w-[560px] rounded-full opacity-[0.55]" style={{ background: "radial-gradient(circle at 60% 40%, #FFF1C6 0%, transparent 65%)" }} />
        <div className="absolute left-1/2 top-[18%] h-[1px] w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-[rgba(23,64,47,.08)] to-transparent" />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #1E7A57 1px, transparent 1px), linear-gradient(to bottom, #1E7A57 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        {/* noise */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      </div>

      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-[22px]">
        {/* ── Eyebrow + Heading ── */}
        <div className="mx-auto max-w-[760px] text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1E7A57]/10 bg-white px-3.5 py-1.5 shadow-[0_6px_20px_rgba(17,64,47,.06)]">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#1E7A57] text-white">
              <SparkleIcon className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11px] font-extrabold tracking-[0.14em] text-[#1E7A57]" style={{ fontFamily: "Tajawal, sans-serif" }}>
              {tr("تواصلي معنا", "Contactez-nous", "Contact us")}
            </span>
            <span className="h-3 w-px bg-[#1E7A57]/15" />
            <span className="text-[11px] font-bold text-[#5A6B5F]">{tr("نرد خلال ساعتين", "Réponse sous 2 heures", "We reply within 2 hours")}</span>
          </div>

          <h2
            className="mt-5 text-[32px] font-extrabold leading-[0.95] tracking-[-0.02em] sm:text-[42px] lg:text-[48px]"
            style={{ fontFamily: "'El Messiri', Tajawal, serif" }}
          >
            <span className="bg-gradient-to-l from-[#07231A] via-[#1E7A57] to-[#C6A15B] bg-clip-text text-transparent">
              {tr("نحن هنا", "Nous sommes là", "We are here")}
            </span>
            <span className="text-[#07231A]"> {tr(" لمساعدتك", " pour vous aider", " to help you")}</span>
          </h2>
          <p className="mx-auto mt-3.5 max-w-[560px] text-[14.5px] font-medium leading-7 text-[#5A6B5F] sm:text-[15px]" style={{ fontFamily: "Tajawal, sans-serif" }}>
            {tr(
              "لا تترددي في الاتصال بنا — فريق صودفا جاهز للرد على استفساراتك بكل حب واهتمام، عبر الهاتف، الواتساب أو الرسائل.",
              "N'hésitez pas à nous contacter — l'équipe SODFA est prête à répondre à toutes vos questions avec bienveillance et attention par téléphone, WhatsApp ou message.",
              "Feel free to reach out — the SODFA team is ready to answer all your questions with warmth and care by phone, WhatsApp, or message."
            )}
          </p>

          {/* quick trust pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
              { dot: "bg-[#1E7A57]", label: tr("رد سريع", "Réponse rapide", "Fast reply") },
              { dot: "bg-[#C6A15B]", label: tr("دعم بالعربية والفرنسية", "Support en arabe et en français", "Support in Arabic and French") },
              { dot: "bg-[#1E7A57]", label: tr("استشارة مجانية", "Consultation gratuite", "Free consultation") },
            ].map((p) => (
              <span key={p.label} className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#122A20] shadow-[0_8px_20px_rgba(17,64,47,.06)] ring-1 ring-[rgba(23,64,47,.06)]">
                <i className={`h-2 w-2 rounded-full ${p.dot} inline-block`} />
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:mt-12 lg:grid-cols-[1.38fr_0.82fr] lg:gap-7 lg:items-start">
          {/* ── Form card ── */}
          <div className="relative overflow-hidden rounded-[28px] border border-[rgba(23,64,47,.08)] bg-white shadow-[0_20px_60px_rgba(17,64,47,.08)]">
            {/* top accent bar */}
            <div className="h-[4px] w-full bg-gradient-to-r from-[#1E7A57] via-[#1E7A57] to-[#C6A15B]" />
            <div className="p-5 sm:p-7 lg:p-8">
              {/* card header */}
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#EAF4EE] text-[#1E7A57] ring-1 ring-[#1E7A57]/10">
                  <MailIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[18px] font-extrabold leading-none text-[#07231A] sm:text-[19px]" style={{ fontFamily: "'El Messiri', Tajawal, serif" }}>
                    {tr("أرسلي لنا رسالة", "Envoyez-nous un message", "Send us a message")}
                  </h3>
                  <p className="mt-1.5 text-[13px] font-medium leading-5 text-[#5A6B5F]" style={{ fontFamily: "Tajawal, sans-serif" }}>
                    {tr("املئي النموذج وسيتواصل معك فريقنا في أقرب وقت — عادة خلال أقل من ساعتين", "Remplissez le formulaire et notre équipe vous répondra au plus vite — généralement sous deux heures", "Fill out the form and our team will contact you as soon as possible — usually within two hours")}
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#FCFBF7] px-3 py-1.5 text-[11px] font-extrabold text-[#1E7A57] ring-1 ring-[#EDE7D5]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1E7A57]" />
                  {tr("متصل الآن", "En ligne", "Online now")}
                </span>
              </div>

              {/* success banner */}
              <div
                className={`grid transition-all duration-500 ${submitted ? "mt-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                aria-live="polite"
              >
                <div className="overflow-hidden">
                  <div className="flex items-center gap-3 rounded-2xl border border-[#1E7A57]/15 bg-[#EAF4EE] px-4 py-3.5 text-sm font-bold text-[#07231A]">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1E7A57] text-white">
                      <CheckIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="font-extrabold">{tr("تم الإرسال بنجاح ✓", "Message envoyé avec succès ✓", "Message sent successfully ✓")}</div>
                      <div className="text-xs font-medium text-[#1E7A57]/80">{tr("شكراً لتواصلك، سنرد عليك قريباً عبر الهاتف أو الواتساب.", "Merci pour votre message, nous vous répondrons très bientôt par téléphone ou WhatsApp.", "Thank you for reaching out, we will get back to you soon by phone or WhatsApp.")}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* error banner */}
              {errors._form && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white">!</span>
                  <span>{errors._form}</span>
                  <button type="button" onClick={() => setErrors(p=>{const n={...p}; delete n._form; return n;})} className="ml-auto text-red-400 hover:text-red-600">✕</button>
                </div>
              )}

              <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="ctName" className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#122A20]" style={{ fontFamily: "Tajawal, sans-serif" }}>
                      {tr("الاسم الكامل", "Nom complet", "Full name")}
                      <span className="text-[#C0392B]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="ctName"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder={tr("مثلاً: سلمى العلوي", "Ex : Salma Aloui", "Example: Salma Aloui")}
                        value={formData.name}
                        onChange={handleChange}
                        aria-invalid={!!errors.name}
                        className={`w-full rounded-2xl border bg-[#FCFDFC] px-4 py-[13px] text-[14px] font-medium text-[#122A20] placeholder:text-[#8AA39A] outline-none transition-all duration-200 focus:bg-white ${
                          errors.name
                            ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                            : "border-[rgba(23,64,47,.10)] focus:border-[#1E7A57] focus:ring-4 focus:ring-[#1E7A57]/12"
                        }`}
                        style={{ fontFamily: "Tajawal, sans-serif" }}
                      />
                    </div>
                    {errors.name && <p className="text-xs font-bold text-red-600">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ctPhone" className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#122A20]" style={{ fontFamily: "Tajawal, sans-serif" }}>
                      {tr("رقم الهاتف", "Numéro de téléphone", "Phone number")}
                      <span className="text-[#C0392B]">*</span>
                      <span className={`${isAr ? "mr-auto" : "ml-auto"} text-[11px] font-bold text-[#8AA39A]`}>WhatsApp</span>
                    </label>
                    <div className="relative">
                      <input
                        id="ctPhone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        dir="ltr"
                        placeholder="+212 6XX XXX XXX"
                        value={formData.phone}
                        onChange={handleChange}
                        aria-invalid={!!errors.phone}
                        className={`w-full rounded-2xl border bg-[#FCFDFC] px-4 py-[13px] text-left text-[14px] font-medium tracking-wide text-[#122A20] placeholder:text-[#8AA39A] outline-none transition-all duration-200 focus:bg-white ${
                          errors.phone
                            ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                            : "border-[rgba(23,64,47,.10)] focus:border-[#1E7A57] focus:ring-4 focus:ring-[#1E7A57]/12"
                        }`}
                        style={{ fontFamily: "Tajawal, sans-serif" }}
                      />
                                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[#EAF4EE] px-2 py-1 text-[11px] font-extrabold text-[#1E7A57]">MA</span>
                    </div>
                    {errors.phone && <p className="text-xs font-bold text-red-600">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="ctEmail" className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#122A20]" style={{ fontFamily: "Tajawal, sans-serif" }}>
                    {tr("البريد الإلكتروني", "E-mail", "Email")}
                    <span className="text-[11px] font-bold text-[#8AA39A]">({tr("اختياري", "Optionnel", "Optional")})</span>
                  </label>
                  <input
                    id="ctEmail"
                    name="email"
                    type="email"
                    inputMode="email"
                    dir="ltr"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={!!errors.email}
                    className={`w-full rounded-2xl border bg-[#FCFDFC] px-4 py-[13px] text-left text-[14px] font-medium text-[#122A20] placeholder:text-[#8AA39A] outline-none transition-all duration-200 focus:bg-white ${
                      errors.email
                        ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                        : "border-[rgba(23,64,47,.10)] focus:border-[#1E7A57] focus:ring-4 focus:ring-[#1E7A57]/12"
                    }`}
                    style={{ fontFamily: "Tajawal, sans-serif" }}
                  />
                  {errors.email && <p className="text-xs font-bold text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="ctMsg" className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#122A20]" style={{ fontFamily: "Tajawal, sans-serif" }}>
                    {tr("الرسالة", "Message", "Message")}
                    <span className="text-[#C0392B]">*</span>
                    <span className={`${isAr ? "mr-auto" : "ml-auto"} text-[11px] font-bold text-[#8AA39A]`}>{formData.message.length}/500</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="ctMsg"
                      name="message"
                      rows={5}
                      maxLength={500}
                      placeholder={tr("اكتبي رسالتك هنا... مثلاً: أريد الاستفسار عن سيروم الشعر وطريقة الاستعمال", "Écrivez votre message ici... par exemple : Je souhaite avoir des informations sur le sérum capillaire et son utilisation", "Write your message here... for example: I would like to know more about the hair serum and how to use it")}
                      value={formData.message}
                      onChange={handleChange}
                      aria-invalid={!!errors.message}
                      className={`min-h-[132px] w-full resize-none rounded-2xl border bg-[#FCFDFC] px-4 py-3.5 text-[14px] font-medium leading-6 text-[#122A20] placeholder:text-[#8AA39A] outline-none transition-all duration-200 focus:bg-white ${
                        errors.message
                          ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                          : "border-[rgba(23,64,47,.10)] focus:border-[#1E7A57] focus:ring-4 focus:ring-[#1E7A57]/12"
                      }`}
                      style={{ fontFamily: "Tajawal, sans-serif" }}
                    />
                    <span className="pointer-events-none absolute bottom-3 left-3 hidden rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#8AA39A] shadow-sm ring-1 ring-black/5 sm:inline-flex">اضغطي Enter للإرسال</span>
                  </div>
                  {errors.message && <p className="text-xs font-bold text-red-600">{errors.message}</p>}
                  <p className="text-[11px] font-medium leading-5 text-[#8AA39A]" style={{ fontFamily: "Tajawal, sans-serif" }}>
                    {tr("بالضغط على إرسال، توافقين على سياسة الخصوصية. لا نشارك بياناتك مع أي جهة خارجية.", "En cliquant sur envoyer, vous acceptez notre politique de confidentialité. Nous ne partageons pas vos données avec des tiers.", "By clicking send, you agree to our privacy policy. We do not share your data with third parties.")}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={sending || submitted}
                  className={`group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-6 py-[15px] text-[15px] font-extrabold text-white shadow-[0_14px_30px_rgba(30,122,87,.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(30,122,87,.32)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${
                    submitted ? "bg-gradient-to-r from-[#C6A15B] to-[#9C7C3E]" : "bg-gradient-to-r from-[#1E7A57] to-[#11402F] hover:brightness-[1.06]"
                  }`}
                  style={{ fontFamily: "Tajawal, sans-serif" }}
                >
                  {/* subtle shine */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  {sending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {tr("جارٍ الإرسال...", "Envoi en cours...", "Sending...")}
                    </>
                  ) : submitted ? (
                    <>
                      <CheckIcon className="h-[18px] w-[18px]" />
                      {tr("تم الإرسال ✓", "Envoyé ✓", "Sent ✓")}
                    </>
                  ) : (
                    <>
                      <SendIcon className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-[-2px] group-hover:-translate-y-[1px]" />
                      {tr("إرسال الرسالة", "Envoyer le message", "Send message")}
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[12px] font-bold text-[#8AA39A]">
                  <span className="h-px w-8 bg-[rgba(23,64,47,.1)]" />
                  أو تواصلي مباشرة عبر
                  <span className="h-px w-8 bg-[rgba(23,64,47,.1)]" />
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border border-[#25D366]/20 bg-[#F0FDF4] px-6 py-[13px] text-[14px] font-extrabold text-[#128C3E] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#25D366]/30 hover:bg-[#E6F9EC] hover:shadow-[0_10px_24px_rgba(37,211,102,.15)]"
                  style={{ fontFamily: "Tajawal, sans-serif" }}
                >
                  <WhatsAppGlyph className="h-[18px] w-[18px]" />
                  فتح محادثة واتساب
                  <span className="mr-auto hidden items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#128C3E] shadow-sm ring-1 ring-black/5 sm:inline-flex">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#25D366]" />
                    متاح الآن
                  </span>
                </a>
              </form>
            </div>
          </div>

          {/* ── Info stack ── */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-6">
            {/* contact info card */}
            <div className="overflow-hidden rounded-[28px] border border-[rgba(23,64,47,.08)] bg-white shadow-[0_20px_60px_rgba(17,64,47,.07)]">
              <div className="bg-gradient-to-l from-[#07231A] to-[#11402F] px-6 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#E8CE93] ring-1 ring-white/15">
                    <PhoneIcon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-extrabold text-white" style={{ fontFamily: "Tajawal, sans-serif" }}>
                      معلومات التواصل
                    </h3>
                    <p className="text-xs font-medium text-white/60">نرد بسرعة خلال ساعات العمل</p>
                  </div>
                  <span className="mr-auto hidden rounded-full bg-[#C6A15B] px-3 py-1 text-[11px] font-extrabold text-[#07231A] sm:inline-flex">SODFA</span>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="space-y-4">
                  {[
                    {
                      icon: <PhoneIcon className="h-[18px] w-[18px]" />,
                      label: "الهاتف",
                      value: site.phoneDisplay,
                      href: telUrl,
                      sub: "اتصال مباشر",
                      ltr: true,
                    },
                    {
                      icon: <MailIcon className="h-[18px] w-[18px]" />,
                      label: "البريد الإلكتروني",
                      value: site.email,
                      href: mailUrl,
                      sub: "نرد خلال 24 ساعة",
                      ltr: true,
                    },
                    {
                      icon: <MapPinIcon className="h-[18px] w-[18px]" />,
                      label: "العنوان",
                      value: site.address,
                      href: undefined,
                      sub: "حي شماعو، سلا — المغرب",
                      ltr: false,
                    },
                    {
                      icon: <ClockIcon className="h-[18px] w-[18px]" />,
                      label: "ساعات العمل",
                      value: site.hoursContact,
                      href: undefined,
                      sub: "بتوقيت المغرب GMT+1",
                      ltr: false,
                    },
                  ].map((row) => (
                    <div key={row.label} className="group flex items-start gap-3.5 rounded-2xl border border-transparent p-2.5 transition-colors hover:border-[rgba(23,64,47,.06)] hover:bg-[#FCFBF7]">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EAF4EE] text-[#1E7A57] ring-1 ring-[#1E7A57]/10 transition-colors group-hover:bg-[#1E7A57] group-hover:text-white">
                        {row.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-extrabold tracking-wide text-[#5A6B5F]" style={{ fontFamily: "Tajawal, sans-serif" }}>
                          {row.label}
                        </div>
                        {row.href ? (
                          <a
                            href={row.href}
                            dir={row.ltr ? "ltr" : undefined}
                            className={`mt-0.5 block truncate text-[14px] font-extrabold leading-5 transition-colors hover:underline ${row.label === "الهاتف" ? "text-[#9C7C3E] decoration-[#E8CE93]/60" : "text-[#122A20] hover:text-[#1E7A57]"} ${row.ltr ? "text-left" : ""}`}
                            style={{ fontFamily: "Tajawal, sans-serif" }}
                          >
                            {row.value}
                          </a>
                        ) : (
                          <div className="mt-0.5 text-[13.5px] font-bold leading-5 text-[#122A20]" style={{ fontFamily: "Tajawal, sans-serif" }}>
                            {row.value}
                          </div>
                        )}
                        <div className="text-[11px] font-medium text-[#8AA39A]">{row.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* mini map hint */}
                <div className="mt-5 overflow-hidden rounded-2xl border border-[rgba(23,64,47,.08)] bg-[#FCFBF7]">
                  <div className="relative h-[112px] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#EAF4EE] via-[#F7F3E8] to-[#FFF1C6]" />
                    {/* fake map lines */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #1E7A57 1px, transparent 0)", backgroundSize: "18px 18px" }} />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <div className="absolute -inset-3 animate-ping rounded-full bg-[#1E7A57]/20" />
                        <div className="relative grid h-10 w-10 place-items-center rounded-full bg-[#1E7A57] text-white shadow-[0_10px_24px_rgba(17,64,47,.25)]">
                          <MapPinIcon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#07231A] shadow-md ring-1 ring-black/5">📍 سلا — شماعو</div>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5">
                    <span className="text-xs font-bold text-[#5A6B5F]">موقعنا على الخريطة</span>
                    <a
                      href={site.mapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(site.address || "SODFA Morocco")}`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 rounded-full bg-[#1E7A57] px-3 py-1 text-xs font-extrabold text-white hover:bg-[#11402F]"
                    >
                      <MapPinIcon className="h-3.5 w-3.5" />
                      الاتجاهات
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* social card */}
            <div className="rounded-[24px] border border-[rgba(23,64,47,.08)] bg-white p-5 shadow-[0_16px_40px_rgba(17,64,47,.06)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFF7E6] text-[#C6A15B] ring-1 ring-[#C6A15B]/15">
                  <SparkleIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[14px] font-extrabold text-[#07231A]" style={{ fontFamily: "Tajawal, sans-serif" }}>
                    تابعينا على
                  </h3>
                  <p className="text-xs font-medium text-[#8AA39A]">جديد المنتجات والعروض يومياً</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <a href={site.instagram} target="_blank" rel="noopener" aria-label="Instagram" className="group flex flex-col items-center gap-2 rounded-2xl border border-[rgba(23,64,47,.06)] bg-[#FCFBF7] px-2 py-4 transition-all hover:-translate-y-1 hover:border-[#E1306C]/20 hover:bg-white hover:shadow-[0_12px_24px_rgba(17,64,47,.08)]">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#515BD4] text-white shadow-[0_8px_18px_rgba(221,42,123,.25)] transition-transform group-hover:scale-105">
                    <InstagramGlyph />
                  </span>
                  <span className="text-xs font-extrabold text-[#122A20]">Instagram</span>
                  <span className="text-[11px] font-medium text-[#8AA39A]">صور وفيديو</span>
                </a>
                <a href={site.facebook} target="_blank" rel="noopener" aria-label="Facebook" className="group flex flex-col items-center gap-2 rounded-2xl border border-[rgba(23,64,47,.06)] bg-[#FCFBF7] px-2 py-4 transition-all hover:-translate-y-1 hover:border-[#1877F2]/20 hover:bg-white hover:shadow-[0_12px_24px_rgba(17,64,47,.08)]">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1877F2] text-white shadow-[0_8px_18px_rgba(24,119,242,.22)] transition-transform group-hover:scale-105">
                    <FacebookGlyph />
                  </span>
                  <span className="text-xs font-extrabold text-[#122A20]">Facebook</span>
                  <span className="text-[11px] font-medium text-[#8AA39A]">أخبار وعروض</span>
                </a>
                {site.tiktok ? (
                  <a href={site.tiktok} target="_blank" rel="noopener" aria-label="TikTok" className="group flex flex-col items-center gap-2 rounded-2xl border border-[rgba(23,64,47,.06)] bg-[#FCFBF7] px-2 py-4 transition-all hover:-translate-y-1 hover:border-black/10 hover:bg-white hover:shadow-[0_12px_24px_rgba(17,64,47,.08)]">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#111111] text-white shadow-[0_8px_18px_rgba(0,0,0,.18)] transition-transform group-hover:scale-105">
                      <TikTokGlyph />
                    </span>
                    <span className="text-xs font-extrabold text-[#122A20]">TikTok</span>
                    <span className="text-[11px] font-medium text-[#8AA39A]">فيديوهات قصيرة</span>
                  </a>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[rgba(23,64,47,.12)] bg-white px-2 py-4">
                    <span className="text-xs font-bold text-[#8AA39A]">قريباً</span>
                    <span className="text-[11px] text-[#8AA39A]">المزيد</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#FFFBEB] px-3 py-2.5 ring-1 ring-[#FDE68A]/50">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#F59E0B]" />
                <span className="text-xs font-bold text-[#92400E]">نشطة الآن — ننشر عروض فلاش كل أسبوع</span>
              </div>
            </div>

            {/* WhatsApp big CTA */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener"
              className="group relative flex items-center gap-4 overflow-hidden rounded-[20px] bg-gradient-to-r from-[#25D366] to-[#128C3E] p-[1.5px] shadow-[0_16px_36px_rgba(37,211,102,.28)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(37,211,102,.34)]"
            >
              <div className="flex w-full items-center gap-4 rounded-[18px] bg-gradient-to-r from-[#25D366] to-[#128C3E] px-5 py-4 text-white">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#128C3E] shadow-[0_8px_20px_rgba(0,0,0,.12)] transition-transform group-hover:scale-105">
                  <WhatsAppGlyph className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1 text-right">
                  <div className="text-[15px] font-extrabold leading-none">{tr("تواصلي معنا عبر واتساب", "Contactez-nous via WhatsApp", "Contact us via WhatsApp")}</div>
                  <div className="mt-1 text-xs font-medium text-white/90">{tr("نرد عادة خلال أقل من ساعة • اضغطي لبدء المحادثة", "Nous répondons généralement sous une heure • Cliquez pour démarrer la conversation", "We usually reply within an hour • Click to start the conversation")}</div>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/20 transition-transform group-hover:translate-x-[-2px]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4" aria-hidden>
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </a>

            {/* trust footer */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-[#8AA39A]">
              <span className="inline-flex items-center gap-1.5">
                <i className="h-1.5 w-1.5 rounded-full bg-[#1E7A57]" /> دفع عند الاستلام
              </span>
              <span className="h-3 w-px bg-[rgba(23,64,47,.12)]" />
              <span className="inline-flex items-center gap-1.5">
                <i className="h-1.5 w-1.5 rounded-full bg-[#C6A15B]" /> شحن مجاني +500dh
              </span>
              <span className="h-3 w-px bg-[rgba(23,64,47,.12)]" />
              <span className="inline-flex items-center gap-1.5">
                <i className="h-1.5 w-1.5 rounded-full bg-[#1E7A57]" /> منتجات طبيعية
              </span>
            </div>
          </div>
        </div>

        {/* bottom FAQ teaser */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { q: "كم يستغرق الرد؟", a: "عادة أقل من ساعتين خلال ساعات العمل." },
            { q: "هل الاستشارة مدفوعة؟", a: "لا، استشارة مجانية قبل الشراء." },
            { q: "هل يوجد متجر فعلي؟", a: "نعم — حي شماعو، سلا. مرحباً بك." },
          ].map((f) => (
            <div key={f.q} className="rounded-2xl border border-[rgba(23,64,47,.06)] bg-white px-4 py-3.5 shadow-[0_8px_20px_rgba(17,64,47,.04)]">
              <div className="text-xs font-extrabold text-[#1E7A57]">{f.q}</div>
              <div className="mt-1 text-xs font-medium leading-5 text-[#5A6B5F]">{f.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* integrated micro-css: animations */}
      <style>{`
        @keyframes contact-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
      `}</style>
    </section>
  );
};

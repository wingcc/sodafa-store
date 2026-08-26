"use client";

import React, { useState } from "react";
import type { SiteConfig } from "../common/types";
import { SendSVG, PhoneSVG, MailSVG, MapPinSVG, ClockSVG, WhatsAppIcon, InstagramSVG, FacebookSVG, TikTokSVG } from "../common/icons";

interface ContactSectionProps {
  site: SiteConfig;
}

export const ContactSection = ({ site }: ContactSectionProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Send notification to admin
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'message',
        title: 'New contact message',
        message: `From ${formData.name} (${formData.phone}${formData.email ? ', ' + formData.email : ''}): ${formData.message.slice(0, 100)}${formData.message.length > 100 ? '...' : ''}`,
        priority: 'medium',
      }),
    }).catch(() => {});

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", phone: "", email: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const waUrl = `https://wa.me/${site.whatsappStore}`;
  const telUrl = `tel:${site.phoneTel}`;
  const mailUrl = `mailto:${site.email}`;

  return (
    <section id="contact" className="contact-section">
      <div className="wrap">
        <div className="sec-head rv">
          <span className="eyebrow">تواصلي معنا</span>
          <h2>نحن هنا لمساعدتك</h2>
          <p>لا تترددي في الاتصال بنا — فريقنا جاهز للرد على استفساراتك</p>
        </div>

        <div className="contact-grid rv" data-d="120">
          {/* Contact Form */}
          <div className="contact-form-card">
            <h3>أرسلي لنا رسالة</h3>
            <form id="contactForm" noValidate onSubmit={handleSubmit}>
              <div className="f-row">
                <div className="f-field">
                  <label htmlFor="ctName">الاسم الكامل</label>
                  <input
                    type="text"
                    id="ctName"
                    name="name"
                    placeholder="أدخلي اسمك الكامل"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="f-field">
                  <label htmlFor="ctPhone">رقم الهاتف</label>
                  <input
                    type="tel"
                    id="ctPhone"
                    name="phone"
                    placeholder="+212 6XX XXX XXX"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="f-field">
                <label htmlFor="ctEmail">البريد الإلكتروني</label>
                <input
                  type="email"
                  id="ctEmail"
                  name="email"
                  placeholder="example@email.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="f-field">
                <label htmlFor="ctMsg">الرسالة</label>
                <textarea
                  id="ctMsg"
                  name="message"
                  rows={5}
                  placeholder="اكتبي رسالتك هنا..."
                  required
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>
              <button
                type="submit"
                className="btn btn-main contact-send"
                disabled={submitted}
              >
                <SendSVG />
                {submitted ? "تم الإرسال ✓" : "إرسال الرسالة"}
              </button>
            </form>
          </div>

          {/* Contact Info Side */}
          <div className="contact-info-side">
            <div className="contact-info-card">
              <h3>معلومات التواصل</h3>

              <div className="cinfo">
                <span className="icb"><PhoneSVG /></span>
                <div>
                  <b>الهاتف</b>
                  <a className="gold" href={telUrl} dir="ltr">{site.phoneDisplay}</a>
                </div>
              </div>

              <div className="cinfo">
                <span className="icb"><MailSVG /></span>
                <div>
                  <b>البريد الإلكتروني</b>
                  <a className="gold" href={mailUrl} dir="ltr">{site.email}</a>
                </div>
              </div>

              <div className="cinfo">
                <span className="icb"><MapPinSVG /></span>
                <div>
                  <b>العنوان</b>
                  <span>{site.address}</span>
                </div>
              </div>

              <div className="cinfo">
                <span className="icb"><ClockSVG /></span>
                <div>
                  <b>ساعات العمل</b>
                  <span>{site.hoursContact}</span>
                </div>
              </div>
            </div>

            <div className="contact-social-card">
              <h3>تابعينا على</h3>
              <div className="social-row">
                <a href={site.instagram} target="_blank" rel="noopener" aria-label="Instagram">
                  <InstagramSVG />
                </a>
                <a href={site.facebook} target="_blank" rel="noopener" aria-label="Facebook">
                  <FacebookSVG />
                </a>
                {site.tiktok && (
                  <a href={site.tiktok} target="_blank" rel="noopener" aria-label="TikTok">
                    <TikTokSVG />
                  </a>
                )}
              </div>
            </div>

            <a className="btn btn-wa contact-wa-btn" href={waUrl} target="_blank" rel="noopener">
              <WhatsAppIcon size={19} />
              تواصلي معنا عبر واتساب
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

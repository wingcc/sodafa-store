"use client";
import React from "react";
import { MapPinSVG, ClockSVG, WhatsAppIcon, MailSVG } from "../common/icons";
import type { SiteConfig } from "../common/types";

interface StoreVisitSectionProps {
  site: SiteConfig;
  onOpenContact: () => void;
}

export default function StoreVisitSection({ site, onOpenContact }: StoreVisitSectionProps) {
  const waUrl = `https://wa.me/${site.whatsappStore}`;

  return (
    <section id="store">
      <div className="dark-band store-band" id="storeBand">
        <div className="deco d1" />
        <div className="deco d2" />
        <div className="pat" />

        <div className="wrap store-grid">
          <div className="rv">
            <span className="store-badge"><i />📍 عندنا محل حقيقي</span>
            <h2>تفضّلي زورينا</h2>
            <p className="desc">
              أهلاً وسهلاً بكل وحدة بغات تزورنا 🌿 بابنا مفتوح ليك. بغيتي تشوفي المنتج بعينيك قبل ما تشري؟ مرحبا بك في صودفا — عنوان حقيقي وثقة كاملة.
            </p>

            <div className="cinfo">
              <span className="icb"><MapPinSVG /></span>
              <div><b>العنوان</b><span>{site.address}</span></div>
            </div>

            <div className="cinfo">
              <span className="icb wa">
                <WhatsAppIcon size={20} />
              </span>
              <div>
                <b>الهاتف / واتساب</b>
                <a className="gold" href={waUrl} target="_blank" rel="noopener" dir="ltr">{site.phoneDisplay}</a>
              </div>
            </div>

            <div className="cinfo">
              <span className="icb"><ClockSVG /></span>
              <div><b>أوقات العمل</b><span>{site.hoursStore}</span></div>
            </div>

            <div className="store-btns">
              <a className="btn btn-gold" href={site.mapsUrl} target="_blank" rel="noopener">
                <MapPinSVG />
                احصلي على الاتجاهات
              </a>
              <button className="btn btn-ghost-light" onClick={onOpenContact}>
                <MailSVG />
                تواصلي معنا
              </button>
            </div>
          </div>

          <div className="map-wrap rv" data-d="150">
            <div className="map-glow" />
            <div className="map-frame">
              <iframe
                id="mapFrame"
                title="موقع صودفا"
                src={site.mapsEmbed}
                loading="lazy"
                allowFullScreen
              />
              <div className="map-tag">
                <span className="mt-r">
                  <span className="dot" />📍 الموقع الحقيقي
                </span>
                <b>{site.addressShort}</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
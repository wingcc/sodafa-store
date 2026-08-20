"use client";
import React from "react";
import type { AboutConfig, FounderConfig } from "../common/types";

interface AboutSectionProps {
  about: AboutConfig;
  founder?: FounderConfig;
}

export default function AboutSection({ about, founder }: AboutSectionProps) {
  const founderLogo = founder?.logo || about?.img || "";
  const aboutImg = founderLogo || "/assets/Image/founder.png";
  const aboutImgAlt = founder?.name ? `مؤسس — ${founder.name}` : "مؤسِّسة SODFA";

  // Bold-wrap specific words matching original RENDER.about
  const founderName = founder?.name || "لوجين";
  const p1Html = (about.p1 || "").replace(new RegExp(founderName, "g"), `<b>${founderName}</b>`);
  const p2Html = (about.p2 || "")
    .replace(/الدفع عند الاستلام/, "<b>الدفع عند الاستلام</b>")
    .replace(/إمكانية الإرجاع/, "<b>إمكانية الإرجاع</b>");

  return (
    <section id="about">
      <div className="wrap">
        <div className="about-card rv">
          <div className="about-img">
            <img loading="lazy" src={aboutImg} alt={aboutImgAlt} />
            <span className="about-badge">{about.badge}</span>
          </div>
          <div className="about-body">
            <span className="qmark">&quot;</span>
            <span className="eyebrow">{about.eyebrow}</span>
            <h2>{about.title}</h2>
            <p dangerouslySetInnerHTML={{ __html: p1Html }} />
            <p dangerouslySetInnerHTML={{ __html: p2Html }} />
            <div className="about-sig">{founder?.name || about?.sig || ""}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

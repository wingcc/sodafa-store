"use client";
import React from "react";
import { PlaySVG } from "../common/icons";
import type { VideoConfig, SiteConfig } from "../common/types";

interface VideoSectionProps {
  video: VideoConfig;
  site: SiteConfig;
  onOpenVideo: () => void;
}

export default function VideoSection({ video, site, onOpenVideo }: VideoSectionProps) {
  return (
    <section id="video">
      <div className="wrap">
        <div className="sec-head rv">
          <span className="eyebrow">{video.eyebrow}</span>
          <h2>{video.title}</h2>
          <p>{video.desc}</p>
        </div>

        <div
          className="player rv"
          id="player"
          role="button"
          tabIndex={0}
          aria-label="تشغيل الفيديو التوضيحي"
          onClick={onOpenVideo}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpenVideo()}
        >
          <img
            src={video.poster || site.videoUrl}
            alt="الفيديو التوضيحي لتركيبة SODFA"
            loading="lazy"
          />
          <div className="play-wrap">
            <div className="play-btn">
              <PlaySVG />
            </div>
          </div>
          <div className="play-cap">{video.caption}</div>
        </div>
      </div>
    </section>
  );
}

"use client";
import React, { useState } from "react";
import { CloseSVG } from "./icons";

interface VideoModalProps {
  onClose: () => void;
}

const STEPS = [
  { num: "١", title: "الاستخلاص على البارد", desc: "نستخلص الزيوت الأربعة دون حرارة للحفاظ على الفيتامينات والأحماض الدهنية كاملة." },
  { num: "٢", title: "المزج بنسب مدروسة", desc: "يمزج خبراء التركيب الزيوت الأربعة بتوازن دقيق يعزز امتصاص الفروة لكل عنصر." },
  { num: "٣", title: "التعبئة في زجاج كهرماني", desc: "نعبئ السيروم في زجاج داكن يحمي الزيوت من الأكسدة ويحفظ فعاليتها لفترة أطول." },
  { num: "٤", title: "التغذية من الجذور", desc: "مع كل استخدام، تتغلغل القطرة لتغذي البصيلة، فتقل الفراغات وتعود الكثافة واللمعان." },
];

export default function VideoModal({ onClose }: VideoModalProps) {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 350);
  };

  return (
    <div className={`modal${open ? " open" : ""}`} id="videoModal" data-page="videoModal" role="dialog" aria-modal="true" aria-label="الفيديو التوضيحي">
      <div className="ovl" onClick={handleClose} />
      <div className="modal-box">
        <button className="m-close" onClick={handleClose} aria-label="إغلاق">
          <CloseSVG />
        </button>
        <h3>كيف تعمل تركيبة SODFA؟</h3>
        <div id="videoHolder" style={{ display: "none" }} />
        <p style={{ color: "var(--muted)", fontSize: ".95rem", marginBottom: "1.6rem" }}>
          رحلة الزيت من البذرة إلى قطرة العناية اليومية — في أربع خطوات.
        </p>
        <div>
          {STEPS.map((step, i) => (
            <div key={i} className="step">
              <div className="n">{step.num}</div>
              <div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

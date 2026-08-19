"use client";
import React, { useEffect, useState } from "react";

export default function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="preloader" className={`preloader${done ? " done" : ""}`} data-page="preloader" aria-hidden="true">
      <div className="pl-logo"><b>ص</b></div>
    </div>
  );
}

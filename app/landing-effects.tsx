"use client";

import { useEffect } from "react";

// Efek progresif landing: nav shadow saat scroll, scroll-reveal via IntersectionObserver,
// dan smooth-scroll untuk anchor internal. Tanpa efek pun konten tetap tampil (reveal fallback).
export function LandingEffects() {
  useEffect(() => {
    // Nav shadow on scroll
    const nav = document.getElementById("topNav");
    const onScroll = () => {
      if (!nav) return;
      if (window.scrollY > 20) {
        nav.classList.add("shadow-sm", "bg-surface/95");
        nav.classList.replace("py-4", "py-3");
      } else {
        nav.classList.remove("shadow-sm", "bg-surface/95");
        nav.classList.replace("py-3", "py-4");
      }
    };
    window.addEventListener("scroll", onScroll);

    // Scroll reveal
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("active")),
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
    );
    document.querySelectorAll<HTMLElement>(".reveal").forEach((el, index) => {
      if (el.parentElement?.classList.contains("grid")) {
        el.style.transitionDelay = `${(index % 3) * 0.15}s`;
      }
      observer.observe(el);
    });

    // Smooth scroll anchor internal
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const onAnchor = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    };
    anchors.forEach((a) => a.addEventListener("click", onAnchor));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      anchors.forEach((a) => a.removeEventListener("click", onAnchor));
    };
  }, []);

  return null;
}

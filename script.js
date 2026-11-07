// ============ Alfiyan Ra'uf — Portfolio interactions ============
(function () {
  "use strict";

  // ---------- Navbar: background on scroll + mobile menu ----------
  const nav = document.getElementById("nav");
  const navLinks = document.getElementById("navLinks");
  const navToggle = document.getElementById("navToggle");

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Buka menu");
    })
  );

  // ---------- Highlight link of the section in view ----------
  const hasIO = "IntersectionObserver" in window;
  const linkById = {};
  navLinks.querySelectorAll("a").forEach((a) => (linkById[a.getAttribute("href").slice(1)] = a));
  if (hasIO) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const link = linkById[e.target.id];
          if (link && e.isIntersecting) {
            Object.values(linkById).forEach((l) => l.classList.remove("is-active"));
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));
  }

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll(".reveal");
  if (hasIO) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- Count-up stats (format angka Indonesia: 7,42) ----------
  const counters = document.querySelectorAll(".count");
  const format = (value, decimals) =>
    value.toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const render = (el, value) => {
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    el.textContent = (el.dataset.prefix || "") + format(value, decimals) + (el.dataset.suffix || "");
  };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animateCount = (el) => {
    const target = parseFloat(el.dataset.target);
    if (reduceMotion) return render(el, target);
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      render(el, target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (hasIO) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target);
            co.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach((c) => render(c, parseFloat(c.dataset.target)));
  }

  // ---------- FAQ accordion ----------
  const faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach((item) => {
    const btn = item.querySelector(".faq__q");
    const panel = item.querySelector(".faq__a");
    btn.addEventListener("click", () => {
      const wasOpen = btn.getAttribute("aria-expanded") === "true";
      faqItems.forEach((other) => {
        other.querySelector(".faq__q").setAttribute("aria-expanded", "false");
        other.querySelector(".faq__a").style.maxHeight = null;
      });
      if (!wasOpen) {
        btn.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  // ---------- Contact form -> WhatsApp ----------
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");
  const WA_NUMBER = "6281221902065";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    form.querySelectorAll("input").forEach((i) => i.classList.remove("is-invalid"));
    if (!name || !emailOk) {
      if (!name) form.elements.name.classList.add("is-invalid");
      if (!emailOk) form.elements.email.classList.add("is-invalid");
      statusEl.textContent = "Mohon isi nama dan email dengan benar.";
      return;
    }

    const val = (k) => (data.get(k) || "").toString().trim() || "-";
    const text = [
      "Halo Alfiyan, saya ingin berdiskusi.",
      "",
      "Nama: " + name,
      "Email: " + email,
      "Bisnis/Perusahaan: " + val("business"),
      "Budget iklan per bulan: " + val("budget"),
      "Pesan: " + val("message"),
    ].join("\n");

    statusEl.textContent = "Membuka WhatsApp…";
    window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    form.reset();
  });
})();
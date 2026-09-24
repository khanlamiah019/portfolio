// ===========================================================
// Lamiah Khan · Portfolio v2 · shared behavior
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {
  // ---- Taskbar clock ----
  const clockEl = document.querySelector(".tb-clock");
  if (clockEl) {
    const tick = () => {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      clockEl.textContent = `${h}:${m} ${ampm}`;
    };
    tick();
    setInterval(tick, 15000);
  }

  // ---- Project image carousels (shared with v1) ----
  document.querySelectorAll(".shot-frame").forEach(frame => {
    const images = Array.from(frame.querySelectorAll(".shot-stage img"));
    const caption = frame.querySelector(".shot-caption");
    const dotsWrap = frame.querySelector(".shot-dots");
    const prevBtn = frame.querySelector('[data-dir="prev"]');
    const nextBtn = frame.querySelector('[data-dir="next"]');
    if (images.length <= 1) {
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
    }

    let index = 0;
    function render() {
      images.forEach((img, i) => img.classList.toggle("active", i === index));
      if (caption) caption.textContent = images[index].dataset.caption || "";
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach((dot, i) => dot.classList.toggle("active", i === index));
      }
    }
    function go(newIndex) { index = (newIndex + images.length) % images.length; render(); }

    if (dotsWrap) {
      images.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Show image ${i + 1}`);
        dot.addEventListener("click", () => go(i));
        dotsWrap.appendChild(dot);
      });
    }
    if (prevBtn) prevBtn.addEventListener("click", () => go(index - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => go(index + 1));
    render();
  });

  // ---- Skill bars fill in when scrolled into view ----
  const fillBars = document.querySelectorAll(".skill-fill[data-width]");
  if (fillBars.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const bars = entry.target.querySelectorAll(".skill-fill[data-width]");
        bars.forEach((bar, i) => {
          setTimeout(() => { bar.style.width = bar.dataset.width; }, i * 90);
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });

    document.querySelectorAll(".subwin").forEach(panel => {
      if (panel.querySelector(".skill-fill[data-width]")) observer.observe(panel);
    });
  }

  // ---- Project windows materialize in as you scroll to them ----
  const revealTargets = document.querySelectorAll(".reveal-in");
  if (revealTargets.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    revealTargets.forEach(el => revealObserver.observe(el));
  }

  // ---- Dock chat bubble sequence: typing indicator -> welcome -> scroll messages ----
  const bubble2 = document.getElementById("dock-speech");
  if (bubble2) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const appearDelay = reduceMotion ? 0 : 650; // matches .bubble-2 CSS animation-delay
    const typingDuration = reduceMotion ? 0 : 850;

    // Shows the "..." typing indicator for ~0.5s before revealing each new
    // message, same as the very first Hi -> typing -> Welcome sequence, so
    // every transition (not just the first) has that pause built in.
    let currentText = "";
    let pendingSwap = null;
    const TYPING_HTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
    function setBubbleText(text) {
      if (currentText === text) return;
      currentText = text;
      clearTimeout(pendingSwap);
      if (reduceMotion) {
        bubble2.textContent = text;
        return;
      }
      bubble2.innerHTML = TYPING_HTML;
      pendingSwap = setTimeout(() => {
        bubble2.textContent = text;
      }, 500);
    }

    const sectionMessages = [
      { id: "project-folders", text: "Click Folders or Bottom Tabs to View Projects!" },
      { id: "publications", text: "Check out my Publication!" },
      { id: "connect", text: "Thanks for Visiting! Stay in touch!" },
    ];

    function watchSectionsForMessages() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const match = sectionMessages.find(s => s.id === entry.target.id);
          if (match) setBubbleText(match.text);
        });
      }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });

      sectionMessages.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) observer.observe(el);
      });
    }

    setTimeout(() => {
      bubble2.textContent = "Welcome to my Portfolio! Feel free to Scroll Down!";
      currentText = "Welcome to my Portfolio! Feel free to Scroll Down!";
      watchSectionsForMessages();
    }, appearDelay + typingDuration);
  }
});

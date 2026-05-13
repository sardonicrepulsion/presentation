    const slides = [
      {
        eyebrow: "Účel",
        title: "Task management pre AI agentov",
        subtitle: "SRcore riadi projekty a tasky v prostredí, kde prácu vykonávajú agenti a výsledok musí prejsť cez kontrolované workflow.",
        bullets: ["Tasky majú jasné statusy, linky, pinovanie a archív", "Procesné dáta pokrývajú processing, review a testing", "Zápisy sú auditované a napojené na GitHub, webhooky a recurring tasks"],
        labels: ["tasks", "AI agents", "workflow"],
        image: svgAgentTasks("Task management pre AI agentov", "#7c3aed", "#06b6d4"),
        imageAlt: "Diagram workflow taskov pre AI agentov",
        visual: "diagram"
      },
      {
        eyebrow: "Dashboard",
        title: "Rýchly prehľad stavu práce",
        subtitle: "Dashboard zhŕňa aktuálny stav taskov a aktivitu systému bez potreby prechádzať do detailov.",
        bullets: ["Summary cards pre tokens, tasks, projects, times…", "Status breakdown a recent tasks pre operatívny prehľad", "Time tracking agregovaný podľa projektu a stage"],
        labels: ["dashboard", "status", "time tracking"],
        image: "./screens/dashboard.png",
        imageAlt: "Dashboard so summary kartami a prehľadmi"
      },
      {
        eyebrow: "Tasky",
        title: "Task list a pracovná queue",
        subtitle: "Tasky sa dajú čítať cez zoznam a archív úloh.",
        bullets: ["Task list ukazuje aktuálnu pracovnú queue a základný prehľad úloh", "New task riadky majú rýchle akcie Ready, On-hold a Cancel"],
        labels: ["tasks", "queue"],
        image: "./screens/tasks.png",
        imageAlt: "Zoznam taskov"
      },
      {
        eyebrow: "Workflow",
        title: "Detail tasku a stavové pravidlá",
        subtitle: "Workflow má jasné statusy a pri prechode do done kontroluje, či má task potrebné dáta.",
        bullets: ["Statusy pokrývajú new, ready, in-progress, in-review, testing, done, on-hold a canceled", "Done vyžaduje metriky pre processing, review a testing a rozdielny processing/review model", "Dlhodobejšie in-progress tasky sa po čase presunú na on-hold a zapíšu marker do note"],
        labels: ["statusy", "done gate", "SLA"],
        image: "./screens/task-detail.png",
        imageAlt: "Detail tasku s workflow informáciami"
      },
      {
        eyebrow: "Editácia",
        title: "Tasky majú štruktúrované dáta",
        subtitle: "Editácia tasku pokrýva základné polia aj procesné dáta, ktoré sú potrebné pre kontrolované uzavretie práce.",
        bullets: ["Task môže niesť estimate_hours, checklist a process runs", "PR number a branch name sa dajú uložiť cez API alebo auto-linknúť z GitHub webhooku", "Editácia drží procesné údaje pokope pre kontrolované uzavretie práce"],
        labels: ["checklist", "process", "PR link"],
        image: "./screens/task-edit.png",
        imageAlt: "Editačný formulár tasku"
      },
      {
        eyebrow: "Projekty",
        title: "Projekty s počtami a archívom",
        subtitle: "Projektová vrstva zhŕňa tasky a dáva prehľad o tom, čo je otvorené, hotové alebo archivované.",
        bullets: ["API vracia task_count_total, task_count_open a task_count_done pre každý projekt", "Projekt má archived flag, project_url a github_url", "Detail projektu obsahuje tasks count row a 12-week velocity sparkline"],
        labels: ["projects", "velocity", "archive"],
        image: "./screens/projects.png",
        imageAlt: "Zoznam projektov v SRcore"
      },
      {
        eyebrow: "Detail projektu",
        title: "Projekt detail prepája kontext práce",
        subtitle: "Detail projektu je praktické miesto na orientáciu v konkrétnom projekte a jeho taskoch.",
        bullets: ["Projekt je dostupný cez slug alebo ID", "UI zobrazuje počty taskov a súvisiace projektové informácie"],
        labels: ["detail", "tasks", "velocity"],
        image: "./screens/project-detail.png",
        imageAlt: "Detail projektu s taskmi a velocity"
      },
      {
        eyebrow: "Katalógy",
        title: "Kategórie a prístupové dáta",
        subtitle: "SRcore drží aj podporné katalógy, ktoré majú vplyv na editáciu taskov a riadenie prístupu.",
        bullets: ["Kategórie sa dajú čítať cez API a admin ich vie vytvárať alebo upravovať", "Používatelia sú mapovaní z Central Login a majú role user, agent, admin alebo auditor", "Audit log je dostupný pre admin/auditor cez samostatnú route"],
        labels: ["categories", "users", "audit"],
        image: "./screens/categories.png",
        imageAlt: "Katalóg kategórií"
      },
      {
        eyebrow: "Modely",
        title: "Modelový katalóg pre AI workflow",
        subtitle: "Modely sú súčasťou canonical dát a používajú sa aj pri pravidlách uzatvárania taskov.",
        bullets: ["Claude Opus 4.7, Sonnet 4.6 a Haiku 4.5 sú aktívne modely", "OpenAI/Codex riadky sú vedené ako deprecated", "Done guard kontroluje, že processing a review nepoužili rovnaký model"],
        labels: ["models", "Claude", "done guard"],
        image: "./screens/models.png",
        imageAlt: "Modelový katalóg"
      },
      {
        eyebrow: "Bezpečnosť",
        title: "Auth, audit a podpísané payloady",
        subtitle: "Zápisy sú chránené cez roly, CSRF pri browser cookie flow a audit log pre povolené aj odmietnuté operácie.",
        bullets: ["App shell aj /api/* sú za SSO/JWT bránou, verejné sú len health, version, GitHub webhook a sanitizované /api/public/projects", "Write endpointy zapisujú allowed, denied aj high-risk vetvy do audit logu", "Inbound aj outbound webhooky používajú HMAC-SHA256 podpisy"],
        labels: ["SSO/JWT", "CSRF", "HMAC"],
        image: "./screens/settings.png",
        imageAlt: "Nastavenia aplikácie"
      },
      {
        eyebrow: "Integrácie",
        title: "Automatizácia bez ručných prepisov",
        subtitle: "Integrácie dopĺňajú task workflow o automatické linkovanie, notifikácie a pravidelné úlohy.",
        bullets: ["GitHub webhook auto-linkuje PR number a branch name podľa commit messages alebo PR title/body", "Outbound webhook dispatcher posiela task.done event na admin-konfigurované URL", "Cron workery riešia recurring tasks a Telegram alerty pre stale tasky"],
        labels: ["GitHub", "webhooks", "cron"],
        image: "./screens/more.png",
        imageAlt: "More obrazovka s prístupom k administrácii"
      },
      {
        eyebrow: "Záver",
        title: "Ďakujem za pozornosť",
        subtitle: "Priestor na otázky k task workflow, AI agentom a prevádzke SRcore.",
        bullets: [],
        labels: ["Q&A", "SRcore", "AI agents"],
        image: svgClosing("Ďakujem za pozornosť", "#7c3aed", "#06b6d4"),
        imageAlt: "Jednoduchý záverečný symbol",
        visual: "diagram"
      }
    ];

    const state = { index: 0, isAnimating: false, shouldFocusAfterNavigation: false };
    const slideEl = document.getElementById("slide");
    const visualCard = document.querySelector(".visual-card");
    const slideImage = document.getElementById("slideImage");
    const slideEyebrow = document.getElementById("slideEyebrow");
    const slideTitle = document.getElementById("slideTitle");
    const slideSubtitle = document.getElementById("slideSubtitle");
    const slideBullets = document.getElementById("slideBullets");
    const slideLabels = document.getElementById("slideLabels");
    const dotsEl = document.getElementById("dots");
    const progressBar = document.getElementById("progressBar");
    const counter = document.getElementById("counter");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const hintPrevBtn = document.getElementById("hintPrevBtn");
    const hintNextBtn = document.getElementById("hintNextBtn");
    const hintHomeBtn = document.getElementById("hintHomeBtn");
    const hintEndBtn = document.getElementById("hintEndBtn");
    const fullscreenBtn = document.getElementById("fullscreenBtn");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lastInteractionWasKeyboard = false;
    let touchStartX = 0;
    let touchStartY = 0;

    function renderDots() {
      dotsEl.innerHTML = "";
      slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.className = "dot";
        dot.type = "button";
        dot.setAttribute("aria-label", `Prejsť na slajd ${index + 1}`);
        dot.addEventListener("click", () => goToSlide(index));
        dotsEl.appendChild(dot);
      });
    }

    function renderSlide(animate = true) {
      const slide = slides[state.index];
      const fillContent = () => {
        visualCard.classList.toggle("is-diagram", slide.visual === "diagram");
        setSlideImage(slide);
        slideImage.alt = slide.imageAlt || `Ukážka: ${slide.title}`;
        slideEyebrow.textContent = slide.eyebrow;
        slideTitle.textContent = slide.title;
        slideSubtitle.textContent = slide.subtitle;

        slideBullets.innerHTML = "";
        slide.bullets.forEach((item) => {
          const li = document.createElement("li");
          li.innerHTML = `<span class="bullet-icon">✓</span><span>${escapeHtml(item)}</span>`;
          slideBullets.appendChild(li);
        });

        slideLabels.innerHTML = "";
        slide.labels.forEach((label) => {
          const pill = document.createElement("span");
          pill.className = "pill";
          pill.textContent = label;
          slideLabels.appendChild(pill);
        });

        const percent = ((state.index + 1) / slides.length) * 100;
        progressBar.style.width = `${percent}%`;
        counter.textContent = `${state.index + 1} / ${slides.length}`;
        prevBtn.disabled = state.index === 0;
        nextBtn.disabled = state.index === slides.length - 1;
        hintPrevBtn.disabled = state.index === 0;
        hintNextBtn.disabled = state.index === slides.length - 1;
        hintHomeBtn.disabled = state.index === 0;
        hintEndBtn.disabled = state.index === slides.length - 1;

        [...dotsEl.children].forEach((dot, index) => {
          dot.classList.toggle("active", index === state.index);
          dot.setAttribute("aria-current", index === state.index ? "step" : "false");
        });
      };

      if (!animate || prefersReducedMotion.matches) {
        const shouldFocus = state.isAnimating;
        slideEl.classList.remove("fade-out", "fade-in");
        fillContent();
        if (shouldFocus) finishNavigation();
        else state.isAnimating = false;
        return;
      }

      slideEl.classList.remove("fade-in");
      slideEl.classList.add("fade-out");
      window.setTimeout(() => {
        fillContent();
        slideEl.classList.remove("fade-out");
        slideEl.classList.add("fade-in");
        finishWhenFadeInEnds();
      }, 180);
    }

    function goToSlide(index) {
      const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
      if (nextIndex === state.index || state.isAnimating) return;
      state.index = nextIndex;
      state.isAnimating = true;
      state.shouldFocusAfterNavigation = lastInteractionWasKeyboard;
      renderSlide(true);
    }

    function nextSlide() { goToSlide(state.index + 1); }
    function prevSlide() { goToSlide(state.index - 1); }

    function finishWhenFadeInEnds() {
      const fallback = window.setTimeout(finishNavigation, 380);
      slideEl.addEventListener("animationend", (event) => {
        if (event.target !== slideEl || event.animationName !== "fadeIn") return;
        window.clearTimeout(fallback);
        finishNavigation();
      }, { once: true });
    }

    function finishNavigation() {
      state.isAnimating = false;
      if (state.shouldFocusAfterNavigation) {
        slideTitle.focus({ preventScroll: true });
      }
      state.shouldFocusAfterNavigation = false;
    }

    function setSlideImage(slide) {
      slideImage.onerror = () => {
        slideImage.onerror = null;
        slideImage.alt = `Chýba obrázok: ${slide.imageAlt || slide.title}`;
        slideImage.src = toSvgDataUri(missingImageSvg(slide.title));
      };
      slideImage.src = resolveImageSource(slide.image);
    }

    function resolveImageSource(image) {
      const value = String(image || "").trim();
      if (value.startsWith("<svg")) return toSvgDataUri(value);
      return value;
    }

    function toSvgDataUri(svg) {
      return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
    }

    function missingImageSvg(title) {
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="431" height="937" viewBox="0 0 431 937" role="img" aria-label="Chýba obrázok">
          <rect width="431" height="937" fill="#f8fafc"/>
          <rect x="34" y="356" width="363" height="178" rx="28" fill="#e2e8f0"/>
          <path d="M175 438l36 36 58-74" fill="none" stroke="#64748b" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
          <text x="215" y="572" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="#334155">${escapeHtml(title)}</text>
        </svg>`;
    }

    function escapeHtml(text) {
      return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function preloadSlideImages() {
      slides.forEach((slide) => {
        const source = resolveImageSource(slide.image);
        if (!source || source.startsWith("data:")) return;
        const image = new Image();
        image.src = source;
      });
    }

    function shouldIgnoreKeyNavigation(event) {
      const target = event.target;
      if (!target) return false;
      const tagName = target.tagName;
      if (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(tagName)) return true;
      return event.key === " " && tagName === "BUTTON";
    }

    prevBtn.addEventListener("click", prevSlide);
    nextBtn.addEventListener("click", nextSlide);
    hintPrevBtn.addEventListener("click", prevSlide);
    hintNextBtn.addEventListener("click", nextSlide);
    hintHomeBtn.addEventListener("click", () => goToSlide(0));
    hintEndBtn.addEventListener("click", () => goToSlide(slides.length - 1));

    document.addEventListener("keydown", () => {
      lastInteractionWasKeyboard = true;
    }, { capture: true });

    document.addEventListener("pointerdown", () => {
      lastInteractionWasKeyboard = false;
    }, { capture: true });

    document.addEventListener("keydown", (event) => {
      if (shouldIgnoreKeyNavigation(event)) return;
      if (["ArrowRight", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        nextSlide();
      }
      if (["ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault();
        prevSlide();
      }
      if (event.key === "Home") {
        event.preventDefault();
        goToSlide(0);
      }
      if (event.key === "End") {
        event.preventDefault();
        goToSlide(slides.length - 1);
      }
    });

    slideEl.addEventListener("touchstart", (event) => {
      if (event.changedTouches.length !== 1) return;
      lastInteractionWasKeyboard = false;
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    }, { passive: true });

    slideEl.addEventListener("touchend", (event) => {
      if (event.changedTouches.length !== 1) return;
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if (Math.abs(deltaX) < 58 || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) return;
      if (deltaX < 0) nextSlide();
      else prevSlide();
    }, { passive: true });

    fullscreenBtn.addEventListener("click", async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (error) {
        console.warn("Fullscreen nie je dostupný:", error);
      }
    });

    function svgAgentTasks(title, c1, c2) {
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="760" height="760" viewBox="0 0 760 760" role="img" aria-label="${title}">
          <defs>
            <linearGradient id="agentFlow" x1="92" y1="88" x2="668" y2="676" gradientUnits="userSpaceOnUse">
              <stop stop-color="${c1}"/>
              <stop offset="1" stop-color="${c2}"/>
            </linearGradient>
            <filter id="agentShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="28" stdDeviation="30" flood-color="#020617" flood-opacity="0.34"/>
            </filter>
          </defs>
          <rect x="44" y="54" width="672" height="652" rx="54" fill="#0f172a" opacity="0.30"/>
          <circle cx="220" cy="228" r="132" fill="${c1}" opacity="0.18"/>
          <circle cx="560" cy="556" r="154" fill="${c2}" opacity="0.16"/>

          <g filter="url(#agentShadow)">
            <rect x="138" y="112" width="484" height="118" rx="34" fill="url(#agentFlow)"/>
            <rect x="178" y="148" width="210" height="20" rx="10" fill="#ffffff" opacity="0.72"/>
            <rect x="178" y="184" width="138" height="16" rx="8" fill="#ffffff" opacity="0.40"/>
            <path d="M546 151l26 26-26 26" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity="0.82"/>
          </g>

          <path d="M380 246v56" stroke="#93c5fd" stroke-width="16" stroke-linecap="round" opacity="0.78"/>
          <path d="M380 302l-20-20M380 302l20-20" stroke="#93c5fd" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" opacity="0.78"/>

          <g filter="url(#agentShadow)">
            <rect x="104" y="318" width="174" height="138" rx="30" fill="#ffffff" opacity="0.92"/>
            <circle cx="156" cy="372" r="22" fill="${c1}" opacity="0.86"/>
            <rect x="194" y="354" width="48" height="14" rx="7" fill="#0f172a" opacity="0.62"/>
            <rect x="132" y="416" width="116" height="14" rx="7" fill="#0f172a" opacity="0.28"/>
          </g>

          <g filter="url(#agentShadow)">
            <rect x="293" y="318" width="174" height="138" rx="30" fill="#ffffff" opacity="0.92"/>
            <path d="M344 374l22 22 50-56" fill="none" stroke="${c2}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="322" y="416" width="116" height="14" rx="7" fill="#0f172a" opacity="0.28"/>
          </g>

          <g filter="url(#agentShadow)">
            <rect x="482" y="318" width="174" height="138" rx="30" fill="#ffffff" opacity="0.92"/>
            <path d="M548 344h42M548 382h42M548 420h42" stroke="${c1}" stroke-width="14" stroke-linecap="round"/>
            <circle cx="522" cy="344" r="8" fill="#0f172a" opacity="0.54"/>
            <circle cx="522" cy="382" r="8" fill="#0f172a" opacity="0.54"/>
            <circle cx="522" cy="420" r="8" fill="#0f172a" opacity="0.54"/>
          </g>

          <path d="M278 388h15M467 388h15" stroke="#93c5fd" stroke-width="14" stroke-linecap="round" opacity="0.82"/>

          <g filter="url(#agentShadow)">
            <rect x="190" y="548" width="380" height="96" rx="30" fill="#ffffff" opacity="0.92"/>
            <rect x="232" y="580" width="150" height="16" rx="8" fill="#0f172a" opacity="0.48"/>
            <rect x="232" y="612" width="250" height="14" rx="7" fill="#0f172a" opacity="0.24"/>
            <path d="M517 574l20 20-20 20" fill="none" stroke="${c2}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
          </g>

          <path d="M380 456v68" stroke="#93c5fd" stroke-width="16" stroke-linecap="round" opacity="0.78"/>
          <path d="M380 524l-20-20M380 524l20-20" stroke="#93c5fd" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" opacity="0.78"/>
        </svg>`;
    }

    function svgClosing(title, c1, c2) {
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="760" height="760" viewBox="0 0 760 760" role="img" aria-label="${title}">
          <defs>
            <linearGradient id="closingGradient" x1="150" y1="124" x2="610" y2="636" gradientUnits="userSpaceOnUse">
              <stop stop-color="${c1}"/>
              <stop offset="1" stop-color="${c2}"/>
            </linearGradient>
            <filter id="closingShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="28" stdDeviation="30" flood-color="#020617" flood-opacity="0.32"/>
            </filter>
          </defs>
          <rect x="72" y="84" width="616" height="592" rx="58" fill="#0f172a" opacity="0.28"/>
          <circle cx="380" cy="330" r="182" fill="url(#closingGradient)" filter="url(#closingShadow)"/>
          <circle cx="380" cy="330" r="124" fill="#ffffff" opacity="0.16"/>
          <path d="M296 328l55 55 118-132" fill="none" stroke="#ffffff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="214" y="548" width="332" height="28" rx="14" fill="#ffffff" opacity="0.40"/>
          <rect x="278" y="600" width="204" height="22" rx="11" fill="#ffffff" opacity="0.24"/>
        </svg>`;
    }

    preloadSlideImages();
    renderDots();
    renderSlide(false);

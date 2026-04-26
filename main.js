(function () {
  "use strict";

  var STORAGE_KEY = "vrtx-checklist-v1";
  var CALM_KEY = "vrtx-calm-v1";

  var sections = [
    { id: "intro", label: "Start" },
    { id: "reality", label: "Reality" },
    { id: "permissions", label: "Perms" },
    { id: "path", label: "Paths" },
    { id: "checklist", label: "Check" },
    { id: "message", label: "Message" },
    { id: "faq", label: "FAQ" }
  ];

  var permissions = [
    {
      name: "Administrator",
      why: "Bypasses almost all channel overrides — nuclear option. Owners avoid this unless they fully trust you."
    },
    {
      name: "Manage Server",
      why: "Vanity URL, community settings, discovery — high impact on server identity."
    },
    {
      name: "Manage Roles",
      why: "You can grant yourself more power if hierarchy allows — very sensitive."
    },
    {
      name: "Manage Channels",
      why: "Structure of the server — mistakes are visible to everyone."
    },
    {
      name: "Kick / Ban Members",
      why: "Classic mod tools — usually enough for day-to-day order."
    },
    {
      name: "Moderate Members",
      why: "Timeouts — great first step before full mod."
    }
  ];

  var checklistItems = [
    "I know exactly which channels or tasks need elevated perms (not just \"I want admin\").",
    "I've been active positively for a while — not a same-day ask.",
    "I'm OK starting with a scoped role (e.g. mod / category-only / bot manager).",
    "I won't argue in public if the owner says no or \"later\" — I'll accept and keep contributing.",
    "I understand the owner may audit logs — my actions should look boring and responsible."
  ];

  var faq = [
    {
      q: "Why won't they give Administrator?",
      a: "One misclick or compromised account can wreck channels, roles, invites, or bans. Scoped roles limit blast radius."
    },
    {
      q: "What should ASAP ask for first?",
      a: "The smallest set: e.g. \"Moderate Members\" + \"Manage Messages\" in specific channels, if that's the actual need."
    },
    {
      q: "Does being friends guarantee admin?",
      a: "No. Good servers separate friendship from destructive permissions. Trust is shown through behavior over time."
    },
    {
      q: "Can I use this site as proof I'm responsible?",
      a: "Not really — owners care about your history in *their* server. This page is just a structured way to think before you ask."
    }
  ];

  var messages = {
    humble:
      "Hey — I've been helping out in the server for a bit and I wanted to ask something carefully.\n\n" +
      "I'm not asking for full Administrator. If there's ever a need for extra permissions for [specific task], " +
      "I'd be grateful if we could talk about a **scoped role** (only what's needed). Totally understand if the answer is no or not yet.\n\n" +
      "Thanks for running the place.",
    technical:
      "Hi — for [task / bot / event], I'd need a custom role with only these Discord permissions toggled: [list].\n\n" +
      "I'd want it placed **below** [trusted role] in the hierarchy, and I'm happy to write a short note in staff pins explaining what it's for. " +
      "No Administrator flag unless you explicitly want that — I'm aiming for least privilege.",
    short:
      "Quick ask: could we add a **scoped mod** role for ASAP (timeouts + delete msgs) instead of Administrator? Happy to wait if you're not ready."
  };

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function initRail() {
    var list = $("#railList");
    if (!list) return;
    sections.forEach(function (s) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + s.id;
      a.setAttribute("data-smooth", "");
      a.title = s.label;
      a.setAttribute("aria-label", s.label);
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function initScrollProgress() {
    var fill = $("#scrollProgress");
    if (!fill) return;
    function onScroll() {
      var doc = document.documentElement;
      var scrollTop = doc.scrollTop || document.body.scrollTop;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max <= 0 ? 100 : (scrollTop / max) * 100;
      fill.style.width = pct + "%";
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initSectionObserver() {
    var links = $all(".rail-list a");
    var map = {};
    links.forEach(function (a, i) {
      map[sections[i].id] = a;
    });

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = en.target.id;
          Object.keys(map).forEach(function (k) {
            map[k].classList.toggle("active", k === id);
          });
        });
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
    );

    sections.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
  }

  function smoothLinks() {
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-smooth]");
      if (!t || !t.getAttribute("href") || t.getAttribute("href").charAt(0) !== "#") return;
      var id = t.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: document.body.classList.contains("calm-mode") ? "auto" : "smooth", block: "start" });
    });
  }

  function initHero() {
    var stat = $("#statSections");
    if (stat) stat.textContent = String(sections.length);

    var start = $("#btnStart");
    if (start) {
      start.addEventListener("click", function () {
        var el = document.getElementById("reality");
        if (el) {
          el.scrollIntoView({
            behavior: document.body.classList.contains("calm-mode") ? "auto" : "smooth",
            block: "start"
          });
        }
      });
    }

    var jump = $("#btnJumpChecklist");
    if (jump) {
      jump.addEventListener("click", function () {
        var el = document.getElementById("checklist");
        if (el) {
          el.scrollIntoView({
            behavior: document.body.classList.contains("calm-mode") ? "auto" : "smooth",
            block: "start"
          });
        }
      });
    }
  }

  function initFlipCards() {
    $all("[data-flip]").forEach(function (card) {
      function toggle() {
        card.classList.toggle("is-flipped");
      }
      card.addEventListener("click", toggle);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  function initPermTable() {
    var body = $("#permBody");
    if (!body) return;

    permissions.forEach(function (p) {
      var tr = document.createElement("tr");
      var copyLine = p.name + " — " + p.why;
      tr.innerHTML =
        "<td><strong>" +
        escapeHtml(p.name) +
        "</strong></td>" +
        "<td>" +
        escapeHtml(p.why) +
        "</td>" +
        "<td><button type=\"button\" class=\"btn-mini\" data-copy=\"" +
        escapeAttr(copyLine) +
        "\">Copy</button></td>";
      body.appendChild(tr);
    });

    body.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-copy]");
      if (!btn) return;
      copyText(btn.getAttribute("data-copy"));
    });
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  function initPathTabs() {
    var tabs = $all(".path-tab");
    var panels = {
      gradual: { tab: $("#tabGradual"), panel: $("#panelGradual") },
      scoped: { tab: $("#tabScoped"), panel: $("#panelScoped") }
    };

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var path = tab.getAttribute("data-path");
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
        Object.keys(panels).forEach(function (key) {
          var p = panels[key];
          var on = key === path;
          if (p.panel) {
            p.panel.classList.toggle("active", on);
            p.panel.hidden = !on;
          }
        });
      });
    });
  }

  function loadChecks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveChecks(obj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {}
  }

  function initChecklist() {
    var ul = $("#checklist");
    if (!ul) return;
    var state = loadChecks();

    checklistItems.forEach(function (text, i) {
      var id = "chk-" + i;
      var li = document.createElement("li");
      var label = document.createElement("label");
      label.className = "check-item" + (state[id] ? " is-done" : "");
      label.setAttribute("for", id);

      var input = document.createElement("input");
      input.type = "checkbox";
      input.id = id;
      input.checked = !!state[id];

      var span = document.createElement("span");
      span.textContent = text;

      label.appendChild(input);
      label.appendChild(span);
      li.appendChild(label);
      ul.appendChild(li);

      input.addEventListener("change", function () {
        state[id] = input.checked;
        label.classList.toggle("is-done", input.checked);
        saveChecks(state);
      });
    });

    var reset = $("#btnResetChecks");
    if (reset) {
      reset.addEventListener("click", function () {
        state = {};
        saveChecks(state);
        $all("#checklist input[type=checkbox]").forEach(function (inp) {
          inp.checked = false;
          var lab = inp.closest(".check-item");
          if (lab) lab.classList.remove("is-done");
        });
      });
    }
  }

  function initMessageBuilder() {
    var sel = $("#toneSelect");
    var ta = $("#messageOut");
    var btn = $("#btnCopyMessage");
    if (!sel || !ta || !btn) return;

    function sync() {
      var key = sel.value;
      ta.value = messages[key] || messages.humble;
    }

    sel.addEventListener("change", sync);
    sync();

    btn.addEventListener("click", function () {
      copyText(ta.value.trim());
    });
  }

  function copyText(text, toastEl) {
    var globalEl = $("#globalToast");
    var inlineToast = toastEl || $("#copyToast");
    function show(msg) {
      if (globalEl) {
        globalEl.textContent = msg;
        globalEl.classList.add("is-visible");
        clearTimeout(show._gt);
        show._gt = setTimeout(function () {
          globalEl.classList.remove("is-visible");
          globalEl.textContent = "";
        }, 2200);
      }
      if (inlineToast) {
        inlineToast.textContent = msg;
        clearTimeout(show._t);
        show._t = setTimeout(function () {
          inlineToast.textContent = "";
        }, 2500);
      }
    }

    if (!text) {
      show("Nothing to copy.");
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          show("Copied to clipboard.");
        },
        function () {
          fallbackCopy(text, show);
        }
      );
    } else {
      fallbackCopy(text, show);
    }
  }

  function fallbackCopy(text, show) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      show("Copied to clipboard.");
    } catch (e) {
      show("Copy failed — select text manually.");
    }
    document.body.removeChild(ta);
  }

  function initFaq() {
    var root = $("#faqAccordion");
    if (!root) return;

    faq.forEach(function (item, i) {
      var wrap = document.createElement("div");
      wrap.className = "accordion-item";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "acc-btn";
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML =
        "<span>" +
        escapeHtml(item.q) +
        '</span><span class="acc-icon" aria-hidden="true">+</span>';

      var panel = document.createElement("div");
      panel.className = "acc-panel";
      panel.innerHTML = "<p>" + escapeHtml(item.a) + "</p>";

      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        $all(".acc-btn", root).forEach(function (b) {
          b.setAttribute("aria-expanded", "false");
        });
        $all(".acc-panel", root).forEach(function (p) {
          p.classList.remove("open");
        });
        if (!open) {
          btn.setAttribute("aria-expanded", "true");
          panel.classList.add("open");
        }
      });

      wrap.appendChild(btn);
      wrap.appendChild(panel);
      root.appendChild(wrap);
    });
  }

  function initFab() {
    var fab = $("#fabTop");
    if (!fab) return;
    function toggle() {
      fab.classList.toggle("visible", window.scrollY > 420);
    }
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
    fab.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: document.body.classList.contains("calm-mode") ? "auto" : "smooth" });
    });
  }

  function initCalmMode() {
    var btn = $("#focusMode");
    if (!btn) return;
    try {
      if (localStorage.getItem(CALM_KEY) === "1") {
        document.body.classList.add("calm-mode");
        btn.setAttribute("aria-pressed", "true");
      }
    } catch (e) {}

    btn.addEventListener("click", function () {
      var on = !document.body.classList.contains("calm-mode");
      document.body.classList.toggle("calm-mode", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      try {
        if (on) localStorage.setItem(CALM_KEY, "1");
        else localStorage.removeItem(CALM_KEY);
      } catch (e) {}
    });
  }

  initRail();
  initScrollProgress();
  initSectionObserver();
  smoothLinks();
  initHero();
  initFlipCards();
  initPermTable();
  initPathTabs();
  initChecklist();
  initMessageBuilder();
  initFaq();
  initFab();
  initCalmMode();
})();

(function () {

  /* ================= LOADER ================= */
  function hideLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;

    loader.classList.add("hide");
    document.body.classList.remove("loading");

    setTimeout(() => {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 700);
  }

  window.addEventListener("load", () => setTimeout(hideLoader, 700));
  setTimeout(hideLoader, 3000);


  /* ================= SERVER STATUS ================= */
  const API_URL = "https://api.mcstatus.io/v2/status/bedrock/SpartaMC.ma:19132";
  const POLL_MS = 5000;

  let lastPlayers = null;
  let lastOnline = null;

  function setStatusUI(state) {
    const dot = document.getElementById("serverDot");
    if (!dot) return;

    dot.classList.remove("online", "offline", "loading");

    if (state === "loading") {
      dot.classList.add("loading");
      dot.dataset.tooltip = "Checking server status...";
      return;
    }

    if (state === "online") {
      dot.classList.add("online");
      dot.dataset.tooltip = "Server Online";
      return;
    }

    dot.classList.add("offline");
    dot.dataset.tooltip = "Server Offline";
  }

  function animatePlayersIfChanged(val) {
    const el = document.getElementById("players");
    if (!el) return;

    el.textContent = String(val);
    el.style.transition = "transform 180ms ease, opacity 180ms ease";
    el.style.transform = "scale(1.15)";
    el.style.opacity = "0.85";

    setTimeout(() => {
      el.style.transform = "scale(1)";
      el.style.opacity = "1";
    }, 180);
  }

  async function fetchServerStatus() {
    const playersEl = document.getElementById("players");

    if (lastOnline === null) setStatusUI("loading");

    try {
      const r = await fetch(API_URL, { cache: "no-store" });
      const d = await r.json();

      const online = !!d?.online;
      const players = online ? (d?.players?.online ?? 0) : 0;

      if (online !== lastOnline) {
        setStatusUI(online ? "online" : "offline");
        lastOnline = online;
      }

      if (playersEl) {
        if (lastPlayers === null) {
          playersEl.textContent = players;
          lastPlayers = players;
        } else if (players !== lastPlayers) {
          animatePlayersIfChanged(players);
          lastPlayers = players;
        }
      }
    } catch {
      setStatusUI("offline");
      if (playersEl) animatePlayersIfChanged(0);
      lastOnline = false;
      lastPlayers = 0;
    }
  }

  fetchServerStatus();
  setInterval(fetchServerStatus, POLL_MS);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) fetchServerStatus();
  });
  window.addEventListener("focus", fetchServerStatus);


  /* ================= COPY IP ================= */
  const copyBtn = document.getElementById("copyIp");
  const toast = document.getElementById("copyToast");
  const IP = "SpartaMC.ma";

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const input = document.createElement("input");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      return true;
    }
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      await copyText(IP);
      if (toast) {
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 1600);
      }
    });
  }


  /* ================= MOBILE MENU ================= */
  const burger = document.getElementById("burger");
  const menu = document.querySelector(".menu");
  const dropdown = document.querySelector(".dropdown");

  if (burger && menu) {

    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = menu.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", open);
    });

    if (dropdown) {
      const dropdownLink = dropdown.querySelector("a");
      if (dropdownLink) {
        dropdownLink.addEventListener("click", (e) => {
          if (window.innerWidth <= 800) {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle("is-open");
          }
        });
      }
    }

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".navbar") && menu.classList.contains("is-open")) {
        menu.classList.remove("is-open");
        burger.classList.remove("is-open");
        document.body.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
        if (dropdown) dropdown.classList.remove("is-open");
      }
    });
  }


  /* ================= PAGE ANIMATIONS ================= */
  document.body.classList.add("page-enter");

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented) return; // 🔥 الحل الأساسي

    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    if (a.target === "_blank") return;
    if (href.startsWith("http")) return;

    e.preventDefault();
    document.body.classList.add("page-leave");

    setTimeout(() => {
      window.location.href = href;
    }, 220);
  });


  /* ================= SCROLL REVEAL ================= */
  const revealEls = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-zoom"
  );

  if (revealEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => obs.observe(el));
  }

})();


/* ================= REPORT PLAYER ================= */
function togglePlayer() {
  const isPlayer = reportType.value === "player";
  playerField.classList.toggle("show", isPlayer);
  const inp = playerField.querySelector("input");
  if (inp) inp.required = isPlayer;
}

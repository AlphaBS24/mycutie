const L = [
  ["❤️", "Will you be my favorite person?", "Aww, I knew you’d say yes! ❤️"],
  [
    "💗",
    "Will you let me make you smile every day?",
    "Your smile is my favorite thing in the world! 🥹",
  ],
  [
    "🌹",
    "Will you go on a million dates with me?",
    "Date nights with you? Forever, please! 💕",
  ],
  [
    "🌍",
    "Will you travel the world with me?",
    "Our next destination: EVERYWHERE, together!",
  ],
  [
    "🫶",
    "Will you stay by my side through everything?",
    "You and me against the world. Always. ❤️",
  ],
  [
    "👵👴",
    "Will you grow old with me?",
    "Can’t wait to annoy you when we’re 80! 😂",
  ],
  [
    "🏡",
    "Will you build a beautiful future with me?",
    "I can’t imagine my future without you. 🥺",
  ],
  [
    "🌌",
    "Will you choose me in every lifetime?",
    "In every universe, it’s always you. 💫",
  ],
  [
    "💍",
    "Will you be mine forever and ever?",
    "One last question, my love... ❤️",
  ],
];
const HUES = [345, 325, 5, 200, 265, 28, 150, 250, 350];
const M = [
  "Good answer BUT WRONG ONE!",
  "Nice Try",
  "Another chance!",
  "Last chance!",
  "Try Again!",
  "Like... REALLYYY?!",
];
const card = document.getElementById("card");
const $ = (id) => document.getElementById(id);

// ---------- SOUND (WebAudio, no files needed) ----------
let AC = null,
  muted = false;
function ac() {
  if (!AC) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (C) AC = new C();
  }
  if (AC && AC.state == "suspended") AC.resume();
  return AC;
}
function tone(f, t = 0, d = 0.15, type = "sine", v = 0.15, to) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const o = c.createOscillator(),
    g = c.createGain(),
    s = c.currentTime + t;
  o.type = type;
  o.frequency.setValueAtTime(f, s);
  if (to) o.frequency.exponentialRampToValueAtTime(to, s + d);
  g.gain.setValueAtTime(0.0001, s);
  g.gain.exponentialRampToValueAtTime(v, s + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, s + d);
  o.connect(g);
  g.connect(c.destination);
  o.start(s);
  o.stop(s + d + 0.05);
}
function noise(d = 0.5, v = 0.2, ft = "lowpass", ff = 900, t = 0) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const b = c.createBuffer(
      1,
      Math.max(1, Math.floor(c.sampleRate * d)),
      c.sampleRate,
    ),
    a = b.getChannelData(0);
  for (let i = 0; i < a.length; i++)
    a[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / a.length, 3);
  const s = c.createBufferSource(),
    f = c.createBiquadFilter(),
    g = c.createGain();
  s.buffer = b;
  f.type = ft;
  f.frequency.value = ff;
  g.gain.value = v;
  s.connect(f);
  f.connect(g);
  g.connect(c.destination);
  s.start(c.currentTime + t);
}
let fwT0 = 0;
// Optional real sound files: site/sounds/minecraft-firework.mp3 (launch) and firework-explode.mp3 (explosion)
const SND = {
  launch: new Audio("sounds/minecraft-firework.mp3"),
  explode: new Audio("sounds/firework-explode.mp3"),
};
const ok = { launch: true, explode: true };
for (const k in SND) {
  SND[k].preload = "auto";
  SND[k].addEventListener("error", () => {
    ok[k] = false;
  });
}
function play(k, vol, fallback) {
  if (muted) return;
  if (!ok[k]) {
    fallback();
    return;
  }
  const a = SND[k].cloneNode();
  a.volume = Math.min(1, Math.max(0, vol));
  a.play().catch(() => fallback());
}
const sfx = {
  pop() {
    tone(660, 0, 0.1, "triangle");
    tone(990, 0.07, 0.12, "triangle");
  },
  yes() {
    [523, 659, 784, 1047].forEach((f, i) =>
      tone(f, i * 0.07, 0.22, "sine", 0.16),
    );
  },
  no() {
    tone(420, 0, 0.22, "square", 0.07, 160);
  },
  tick() {
    tone(1400, 0, 0.03, "square", 0.03);
  },
  magic() {
    [392, 523, 659, 784, 1047, 1319].forEach((f, i) =>
      tone(f, i * 0.14, 0.5, "sine", 0.12),
    );
  },
  fanfare() {
    [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) =>
      tone(f, i * 0.13, 0.45, "triangle", 0.16),
    );
  },
  boom() {
    const fade = () => 1 - (Date.now() - fwT0) / 5000;
    const vol = fade();
    if (vol <= 0.03) return;
    // 1) launch
    play("launch", 0.7 * vol, () =>
      tone(500, 0, 0.6, "sine", 0.03 * vol, 1500),
    );
    // 2) explosion after the launch sound
    const wait =
      ok.launch && isFinite(SND.launch.duration)
        ? Math.min(SND.launch.duration * 1000, 1500)
        : 650;
    setTimeout(() => {
      const v = fade();
      if (v <= 0.03) return;
      play("explode", 0.8 * v, () => {
        tone(95, 0, 0.5, "sine", 0.14 * v, 45);
        noise(0.9, 0.07 * v, "lowpass", 500);
        for (let i = 0; i < 9; i++)
          noise(0.04, 0.05 * v, "highpass", 3500, 0.1 + Math.random() * 1.0);
      });
    }, wait);
  },
};
const hue = (h) => document.documentElement.style.setProperty("--h", h);
const dots = (n) =>
  `<div class="dots">${Array.from({ length: 10 }, (_, k) => `<span class="${k <= n ? "on" : ""}${k == n && n < 9 ? " cur" : ""}"></span>`).join("")}</div>`;

function intro() {
  clearNo();
  hue(340);
  card.className = "card in";
  card.innerHTML = `<div class="emoji">🥰</div><h1>Hey My Cutie! ❤️</h1><p>I love you so much, can you answer some questions for me please? 🥺</p><button class="yes" id="go">I’m ready for it! →</button>`;
  go.onclick = () => {
    ac();
    sfx.pop();
    show(0);
  };
}

let flyNo = null,
  lastNo = 0;
function clearNo() {
  if (flyNo) {
    flyNo.remove();
    flyNo = null;
  }
}
function setupNo(msgEl, yesEl, noEl, max) {
  let n = 0;
  const dodge = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    lastNo = Date.now();
    sfx.no();
    msgEl.textContent = "";
    void msgEl.offsetWidth;
    msgEl.textContent = M[n % M.length];
    n++;
    yesEl.style.fontSize = Math.min(18 + n * 4, max) + "px";
    const vw = document.documentElement.clientWidth,
      vh = window.innerHeight;
    if (!noEl.classList.contains("fly")) {
      const r = noEl.getBoundingClientRect();
      noEl.style.left = r.left + "px";
      noEl.style.top = r.top + "px";
      noEl.classList.add("fly");
      document.body.appendChild(noEl);
      flyNo = noEl;
    }
    const bw = noEl.offsetWidth,
      bh = noEl.offsetHeight,
      m = 10;
    const cx0 = parseFloat(noEl.style.left) + bw / 2,
      cy0 = parseFloat(noEl.style.top) + bh / 2;
    const px = ev.clientX || cx0,
      py = ev.clientY || cy0;
    const d = Math.max(90, Math.min(220, Math.min(vw, vh) * 0.3));
    const yr = yesEl.getBoundingClientRect();
    const ov = (x, y) =>
      x < yr.right + 8 &&
      x + bw > yr.left - 8 &&
      y < yr.bottom + 8 &&
      y + bh > yr.top - 8;
    let x = 0,
      y = 0;
    for (let t = 0; t < 40; t++) {
      const a = Math.random() * 6.283,
        dist = d * (0.7 + Math.random() * 0.6);
      x = Math.min(Math.max(cx0 + Math.cos(a) * dist - bw / 2, m), vw - bw - m);
      y = Math.min(Math.max(cy0 + Math.sin(a) * dist - bh / 2, m), vh - bh - m);
      const far = Math.hypot(x + bw / 2 - px, y + bh / 2 - py) > 90;
      if (far && !ov(x, y)) break;
    }
    if (ov(x, y)) {
      for (let t = 0; t < 120; t++) {
        x = m + Math.random() * Math.max(vw - bw - 2 * m, 0);
        y = m + Math.random() * Math.max(vh - bh - 2 * m, 0);
        if (!ov(x, y) && Math.hypot(x + bw / 2 - px, y + bh / 2 - py) > 90)
          break;
      }
    }
    noEl.style.left = x + "px";
    noEl.style.top = y + "px";
  };
  noEl.addEventListener("pointerdown", dodge, { passive: false });
  noEl.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  noEl.addEventListener("keydown", (e) => {
    if (e.key == "Enter" || e.key == " ") dodge(e);
  });
}

function show(i) {
  clearNo();
  document.body.classList.remove("epic");
  hue(HUES[i]);
  const [e, q] = L[i];
  card.className = "card in";
  card.innerHTML = `${dots(i)}<span class="badge">LEVEL ${i + 1} / 10</span><div class="emoji">${e}</div><div class="msg" id="msg"></div><div class="q">${q}</div><div class="btns"><button class="yes" id="yes">YES 💖</button><button class="no" id="no">NO</button></div>`;
  yes.onclick = () => answer(i);
  setupNo(msg, yes, no, Math.min(60, Math.floor(innerWidth / 9)));
}

function answer(i) {
  if (Date.now() - lastNo < 600) return;
  clearNo();
  sfx.yes();
  card.className = "card in";
  card.innerHTML = `${dots(i)}<div class="emoji">${L[i][0]}</div><div class="reply">${L[i][2]}</div><button class="yes" id="nx">Next ➜</button>`;
  nx.onclick = () => {
    sfx.pop();
    i == 8 ? epic() : show(i + 1);
  };
  burst(12);
}

function epic() {
  clearNo();
  document.body.classList.add("epic");
  card.className = "card epic-card";
  card.innerHTML = `${dots(9)}<span class="badge">LEVEL 10 — THE BIG QUESTION</span><div class="ring">💍</div><div class="sub" id="sub"></div><div class="big" id="big"></div><div class="msg" id="msg"></div><div class="btns" id="bb" style="visibility:hidden"><button class="yes" id="yes">YES 💖💍</button><button class="no" id="no">NO</button></div>`;
  sfx.magic();
  burst(30);
  const a = "Every love story is beautiful…",
    b = "Will you marry me?";
  let k = 0;
  sub.textContent = a;
  sub.className = "sub fadein";
  setTimeout(() => {
    const t = setInterval(() => {
      big.textContent = b.slice(0, ++k);
      sfx.tick();
      if (k >= b.length) {
        clearInterval(t);
        bb.style.visibility = "visible";
        bb.className = "btns fadein";
        burst(25);
      }
    }, 110);
  }, 1800);
  yes.onclick = () => {
    if (Date.now() - lastNo < 600) return;
    finale();
  };
  setupNo(msg, yes, no, Math.min(70, Math.floor(innerWidth / 7)));
}

function finale() {
  clearNo();
  card.className = "card epic-card";
  card.innerHTML = `<div class="ring">💍</div><div class="big" style="min-height:0;font-size:clamp(30px,9vw,46px)">SHE SAID YES!!! ❤️</div><h2 class="fadein" style="font-size:clamp(19px,5.8vw,24px)">I LOVE YOU FOREVER!<br>Our forever starts now. ♾️</h2><p class="fadein">You are my today, all of my tomorrows, and every dream in between. ❤️</p>`;
  fwT0 = Date.now();
  sfx.fanfare();
  fireworks();
  burst(80);
  setInterval(() => burst(8), 900);
}

function burst(n) {
  for (let k = 0; k < n; k++) {
    const h = document.createElement("div");
    h.className = "heart";
    h.textContent = ["❤️", "💖", "💕", "💗", "✨"][k % 5];
    h.style.left = Math.random() * 100 + "vw";
    h.style.fontSize = 14 + Math.random() * 28 + "px";
    h.style.animationDuration = 3 + Math.random() * 4 + "s";
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 8000);
  }
}
setInterval(() => burst(1), 700);

function fireworks() {
  const c = $("fx"),
    x = c.getContext("2d");
  const fit = () => {
    c.width = innerWidth;
    c.height = innerHeight;
  };
  fit();
  addEventListener("resize", fit);
  let P = [];
  const boom = () => {
    sfx.boom();
    const cx = Math.random() * c.width,
      cy = Math.random() * c.height * 0.6,
      col = `hsl(${Math.random() * 360},100%,65%)`;
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * 6.283,
        s = 1 + Math.random() * 5;
      P.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        l: 1,
        col,
      });
    }
  };
  setInterval(boom, 450);
  boom();
  boom();
  (function loop() {
    x.globalCompositeOperation = "destination-out";
    x.fillStyle = "rgba(0,0,0,.18)";
    x.fillRect(0, 0, c.width, c.height);
    x.globalCompositeOperation = "lighter";
    P = P.filter((p) => p.l > 0);
    for (const p of P) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.vx *= 0.99;
      p.l -= 0.012;
      x.globalAlpha = Math.max(p.l, 0);
      x.fillStyle = p.col;
      x.beginPath();
      x.arc(p.x, p.y, 2.2, 0, 6.283);
      x.fill();
    }
    x.globalAlpha = 1;
    requestAnimationFrame(loop);
  })();
}
intro();

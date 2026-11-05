(() => {
  const $ = (id) => document.getElementById(id);
  const BADGE_COLORS = ['#ff9a6b', '#f97c3c', '#ffb48a', '#e2602a'];
  let deck = [];
  let index = 0;
  let locked = false;

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  function showPage(name) {
    document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
    $('page-' + name).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- Build quiz deck (สุ่มรูปจาก /images) ---------- */
  function buildDeck() {
    const total = Math.min(CONFIG.totalQuestions, QUESTIONS.length);
    const usedFixed = QUESTIONS.map((q) => q.image).filter(Boolean);
    let pool = PHOTOS.filter((p) => !usedFixed.includes(p));
    if (CONFIG.shuffleImages) pool = shuffle(pool);
    deck = QUESTIONS.slice(0, total).map((q) => ({
      ...q,
      image: q.image || pool.shift() || PHOTOS[0],
      choices: CONFIG.shuffleChoices ? shuffle(q.choices.slice(0, 4)) : q.choices.slice(0, 4),
    }));
    // preload
    deck.forEach((q) => { const img = new Image(); img.src = q.image; });
  }

  function renderQuestion() {
    const q = deck[index];
    $('q-num').textContent = index + 1;
    $('q-total').textContent = deck.length;
    $('q-progress').style.width = `${(index / deck.length) * 100}%`;
    $('q-hearts').textContent = '💗'.repeat(index) + '🤍'.repeat(deck.length - index);
    $('q-img').src = q.image;
    $('q-text').textContent = q.question;

    const box = $('q-choices');
    box.innerHTML = '';
    q.choices.slice(0, 4).forEach((text, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice';
      btn.id = `choice-${i + 1}`;
      btn.innerHTML = `<span class="badge" style="background:${BADGE_COLORS[i]}">${'ABCD'[i]}</span><span></span>`;
      btn.lastChild.textContent = text;
      btn.addEventListener('click', (e) => pick(btn, e));
      box.appendChild(btn);
    });
  }

  function pick(btn, e) {
    if (locked) return;
    locked = true;
    btn.classList.add('picked');
    burst(e.clientX, e.clientY, 10);
    const card = $('q-card');
    setTimeout(() => {
      card.classList.add('leave');
      setTimeout(() => {
        index++;
        card.classList.remove('leave');
        if (index >= deck.length) {
          $('q-progress').style.width = '100%';
          showMessage();
        } else {
          renderQuestion();
          card.classList.add('enter');
          setTimeout(() => card.classList.remove('enter'), 450);
        }
        locked = false;
      }, 300);
    }, 250);
  }

  function showMessage() {
    $('msg-body').innerHTML = '';
    BIRTHDAY_MESSAGE.forEach((t) => {
      const p = document.createElement('p');
      p.textContent = t;
      $('msg-body').appendChild(p);
    });
    showPage('message');
    rainConfetti(80);
  }

  /* ---------- YouTube component ---------- */
  function YouTubeEmbed(videoId) {
    const wrap = document.createElement('div');
    wrap.className = 'video-wrap';
    const src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
    wrap.innerHTML = `<iframe src="${src}" title="เพลงของขวัญวันเกิด"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen></iframe>`;
    return wrap;
  }

  function showVideo() {
    const mount = $('yt-player');
    mount.innerHTML = '';
    mount.appendChild(YouTubeEmbed(CONFIG.youtubeId));
    showPage('video');
    rainConfetti(120);
  }

  /* ---------- Effects ---------- */
  const EMOJIS = ['🧡', '🌼', '✨', '🍑', '💛', '🎈', '🧁', '⭐'];
  function startFloaters() {
    const box = $('floaters');
    const count = window.innerWidth < 640 ? 12 : 22;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'floater';
      s.textContent = EMOJIS[i % EMOJIS.length];
      s.style.left = Math.random() * 100 + '%';
      s.style.fontSize = 14 + Math.random() * 22 + 'px';
      s.style.animationDuration = 12 + Math.random() * 14 + 's';
      s.style.animationDelay = -Math.random() * 20 + 's';
      box.appendChild(s);
    }
  }

  function rainConfetti(n) {
    const colors = ['#ffb48a', '#f97c3c', '#ffcfb1', '#ffffff', '#ffd23f', '#ff8a5c'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      const size = 6 + Math.random() * 8;
      Object.assign(c.style, {
        left: Math.random() * 100 + 'vw',
        width: size + 'px',
        height: size * 1.6 + 'px',
        background: colors[i % colors.length],
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        animationDuration: 2.5 + Math.random() * 2.5 + 's',
        animationDelay: Math.random() * 0.8 + 's',
      });
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 6000);
    }
  }

  function burst(x, y, n) {
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.textContent = EMOJIS[i % 3 === 0 ? 0 : (i % EMOJIS.length)];
      Object.assign(s.style, {
        position: 'fixed', left: x + 'px', top: y + 'px', zIndex: 60, pointerEvents: 'none',
        fontSize: '18px', transition: 'transform .7s ease-out, opacity .7s ease-out',
      });
      document.body.appendChild(s);
      const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 70;
      requestAnimationFrame(() => {
        s.style.transform = `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) scale(1.4)`;
        s.style.opacity = '0';
      });
      setTimeout(() => s.remove(), 750);
    }
  }

  /* ---------- Init ---------- */
  $('wife-name').textContent = CONFIG.wifeName;
  $('from-name').textContent = CONFIG.fromName;
  startFloaters();

  $('btn-start').addEventListener('click', () => {
    buildDeck();
    index = 0;
    renderQuestion();
    showPage('quiz');
  });
  $('btn-gift').addEventListener('click', showVideo);
  $('btn-replay').addEventListener('click', () => {
    $('yt-player').innerHTML = '';
    showPage('cover');
  });
})();

/* ============================================================
   MAIN.JS — Happy Birthday 22 Tahun
   Fitur: Confetti, Age Counter, Scroll Reveal, Wish Wall,
          Web Audio Player, IntersectionObserver count-up
   ============================================================ */

'use strict';

/* ----------------------------------------------------------
   PERFORMANCE PROFILE — Adaptive untuk mobile/iOS/low-end
   ---------------------------------------------------------- */
const getPerformanceProfile = () => {
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isMobile = window.matchMedia('(max-width: 820px)').matches || navigator.maxTouchPoints > 1;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const lowEnd = memory <= 4 || cores <= 4;

    if (prefersReduced || (isIOS && lowEnd)) {
        return {
            name: 'minimal',
            confettiCount: 36,
            confettiFrameStep: 3,
            sparkleCount: 10,
            petalCount: 5,
            enableCursorHearts: false,
            keepBalloonRespawn: false
        };
    }

    if (isMobile || lowEnd || isIOS) {
        return {
            name: 'reduced',
            confettiCount: 72,
            confettiFrameStep: 2,
            sparkleCount: 20,
            petalCount: 9,
            enableCursorHearts: false,
            keepBalloonRespawn: true
        };
    }

    return {
        name: 'full',
        confettiCount: 140,
        confettiFrameStep: 1,
        sparkleCount: 36,
        petalCount: 16,
        enableCursorHearts: true,
        keepBalloonRespawn: true
    };
};

const PERF = getPerformanceProfile();

/* ----------------------------------------------------------
   UTILITAS — Hitung umur dari tanggal lahir
   ---------------------------------------------------------- */
const BIRTH_DATE = new Date(2004, 3, 6); // April 6, 2004

const calcAge = () => {
    const now = new Date();
    let age = now.getFullYear() - BIRTH_DATE.getFullYear();
    const m = now.getMonth() - BIRTH_DATE.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < BIRTH_DATE.getDate())) age--;
    return age;
};

const calcMonths = () => {
    const now = new Date();
    return (now.getFullYear() - BIRTH_DATE.getFullYear()) * 12
        + (now.getMonth() - BIRTH_DATE.getMonth());
};

const calcDays = () => {
    const now = new Date();
    const diff = now - BIRTH_DATE;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const calcHours = () => calcDays() * 24;

/* ----------------------------------------------------------
   HERO — Tampilkan umur dinamis
   ---------------------------------------------------------- */
const renderAge = () => {
    const ageEl = document.getElementById('hero-age');
    if (ageEl) ageEl.textContent = calcAge();
};

/* ----------------------------------------------------------
   HERO FX — Sparkles + Rose Petals
   ---------------------------------------------------------- */
const initHeroLayers = () => {
    const sparkleLayer = document.getElementById('sparkle-layer');
    const petalLayer = document.getElementById('petal-layer');
    if (!sparkleLayer || !petalLayer) return;

    for (let i = 0; i < PERF.sparkleCount; i++) {
        const s = document.createElement('span');
        s.className = 'sparkle';
        s.style.left = `${Math.random() * 100}%`;
        s.style.top = `${Math.random() * 100}%`;
        s.style.setProperty('--twinkle-dur', `${(Math.random() * 1.8 + 1.4).toFixed(2)}s`);
        s.style.setProperty('--twinkle-delay', `${(Math.random() * 2.5).toFixed(2)}s`);
        s.style.transform = `scale(${(Math.random() * 0.85 + 0.55).toFixed(2)})`;
        sparkleLayer.appendChild(s);
    }

    for (let i = 0; i < PERF.petalCount; i++) {
        const p = document.createElement('span');
        p.className = 'petal';
        p.style.left = `${Math.random() * 100}%`;
        p.style.setProperty('--fall-dur', `${(Math.random() * 6 + 8).toFixed(2)}s`);
        p.style.setProperty('--fall-delay', `${(Math.random() * 7).toFixed(2)}s`);
        p.style.setProperty('--drift', `${Math.floor(Math.random() * 50) - 25}px`);
        p.style.opacity = `${(Math.random() * 0.35 + 0.45).toFixed(2)}`;
        petalLayer.appendChild(p);
    }
};

/* ----------------------------------------------------------
   TYPING LOVE MESSAGE
   ---------------------------------------------------------- */
const initTypingMessage = () => {
    const typingEl = document.getElementById('typing-note');
    const input = document.getElementById('name-input');
    if (!typingEl) return;

    const defaultName = input?.placeholder?.trim() || 'Sayang';
    const receiver = input?.value?.trim() || defaultName;
    const message = `Di umur ${receiver} ke-22 ini, semoga Mutiah selalu merasa dicintai, dihargai, dan ditemani. Hari ini tentang Mutiah, besok juga tetap tentang kebahagiaan Mutiah pastinya.`;
    let index = 0;

    const type = () => {
        if (index > message.length) {
            typingEl.classList.add('done');
            return;
        }
        typingEl.textContent = message.slice(0, index);
        index += 1;
        setTimeout(type, 22 + Math.random() * 34);
    };

    setTimeout(type, 650);
};

/* ----------------------------------------------------------
   MEMORY SLIDESHOW
   ---------------------------------------------------------- */
const initMemorySlideshow = () => {
    const slides = Array.from(document.querySelectorAll('.memory-slide'));
    const dots = Array.from(document.querySelectorAll('.memory-dot'));
    const visuals = Array.from(document.querySelectorAll('.memory-visual'));
    if (!slides.length || !dots.length) return;

    const tryLoadImage = (src) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => resolve(null);
        img.src = src;
    });

    const resolvePhotoSource = async (src) => {
        if (!src) return null;

        const direct = await tryLoadImage(src);
        if (direct) return direct;

        const base = src.replace(/\.[^.]+$/, '');
        const candidates = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

        for (const ext of candidates) {
            const candidate = `${base}${ext}`;
            const loaded = await tryLoadImage(candidate);
            if (loaded) return loaded;
        }

        return null;
    };

    const applyPhotos = () => {
        visuals.forEach((visual) => {
            const src = visual.dataset.photo;
            if (!src) return;

            resolvePhotoSource(src).then((resolvedSrc) => {
                if (!resolvedSrc) return;
                visual.style.backgroundImage = `linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(125, 43, 74, 0.18)), url(${resolvedSrc})`;
                visual.style.backgroundSize = 'cover';
                visual.style.backgroundPosition = 'center';
                visual.style.backgroundRepeat = 'no-repeat';
            });
        });
    };

    let current = 0;
    let timer = null;

    const showSlide = (idx) => {
        current = (idx + slides.length) % slides.length;
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === current);
            slide.setAttribute('aria-hidden', i === current ? 'false' : 'true');
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === current);
            dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
        });
    };

    const startAuto = () => {
        if (timer) clearInterval(timer);
        timer = setInterval(() => showSlide(current + 1), 4200);
    };

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            showSlide(i);
            startAuto();
        });
    });

    showSlide(0);
    startAuto();
    applyPhotos();
};

/* ----------------------------------------------------------
   CURSOR HEART TRAIL
   ---------------------------------------------------------- */
const initCursorHearts = () => {
    if (!PERF.enableCursorHearts) return;

    let last = 0;

    const spawnHeart = (x, y) => {
        const heart = document.createElement('span');
        heart.className = 'cursor-heart';
        heart.textContent = Math.random() > 0.5 ? '❤' : '♡';
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        heart.style.color = Math.random() > 0.5 ? '#E8437A' : '#FF85A1';
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 820);
    };

    window.addEventListener('pointermove', (event) => {
        const now = performance.now();
        if (now - last < 90) return;
        last = now;
        spawnHeart(event.clientX, event.clientY);
    });
};

/* ----------------------------------------------------------
   FINAL SURPRISE REVEAL
   ---------------------------------------------------------- */
const initFinalReveal = () => {
    const reveal = document.getElementById('final-reveal');
    const openBtn = document.getElementById('open-reveal');
    const closeBtn = document.getElementById('close-reveal');
    const finalTitle = document.getElementById('final-title');
    const input = document.getElementById('name-input');
    if (!reveal || !closeBtn || !finalTitle) return;

    const resolveName = () => {
        const typed = input?.value?.trim();
        const fallback = input?.placeholder?.trim() || 'Mutiah';
        return typed || fallback;
    };

    const openReveal = () => {
        finalTitle.textContent = `I Love You, ${resolveName()}`;
        reveal.classList.add('show');
        reveal.setAttribute('aria-hidden', 'false');
    };

    if (openBtn) {
        openBtn.addEventListener('click', openReveal);
    }

    setTimeout(() => {
        if (!reveal.classList.contains('show')) openReveal();
    }, 18000);

    const closeReveal = () => {
        reveal.classList.remove('show');
        reveal.setAttribute('aria-hidden', 'true');
    };

    closeBtn.addEventListener('click', closeReveal);
    reveal.addEventListener('click', (e) => {
        if (e.target === reveal) closeReveal();
    });
};

/* ----------------------------------------------------------
   CONFETTI — Canvas Particle System
   ---------------------------------------------------------- */
const initConfetti = () => {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = [
        '#FFB6C8', '#FF85A1', '#E8437A', '#F2C4D8',
        '#FFD6E0', '#E8A0B4', '#C2698F', '#ffffff',
        'rgba(255,133,161,0.85)', 'rgba(232,67,122,0.7)'
    ];

    const rand = (min, max) => Math.random() * (max - min) + min;

    class Particle {
        constructor() { this.reset(true); }
        reset(initial = false) {
            this.x = rand(0, canvas.width);
            this.y = initial ? rand(-canvas.height, 0) : rand(-60, -10);
            this.size = rand(4, 12);
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.vx = rand(-1.5, 1.5);
            this.vy = rand(1.2, 3.5);
            this.angle = rand(0, Math.PI * 2);
            this.spin = rand(-0.08, 0.08);
            this.isRect = Math.random() > 0.5;
            this.alpha = 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.angle += this.spin;
            if (this.y > canvas.height + 20) this.reset();
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = this.color;
            if (this.isRect) {
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.5);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    const particles = Array.from({ length: PERF.confettiCount }, () => new Particle());
    let frameCounter = 0;
    let paused = false;

    document.addEventListener('visibilitychange', () => {
        paused = document.hidden;
    });

    const loop = () => {
        if (paused) {
            requestAnimationFrame(loop);
            return;
        }

        frameCounter += 1;
        if (frameCounter % PERF.confettiFrameStep !== 0) {
            requestAnimationFrame(loop);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(loop);
    };
    loop();
};

/* ----------------------------------------------------------
   PERSONALIZED MESSAGE — Real-time name update
   ---------------------------------------------------------- */
const initMessage = () => {
    const input = document.getElementById('name-input');
    const spans = document.querySelectorAll('.recipient-name');
    if (!input || !spans.length) return;

    // Ambil default dari konten yang sudah ditulis di HTML agar tidak ketimpa "Kamu".
    const defaultName =
        spans[0].textContent.trim()
        || input.getAttribute('data-default-name')?.trim()
        || input.placeholder.trim()
        || 'Sayang';

    const update = () => {
        const val = input.value.trim() || defaultName;
        spans.forEach(s => { s.textContent = val; });
    };

    input.addEventListener('input', update);
};

/* ----------------------------------------------------------
   STATS — Count-up Animation via IntersectionObserver
   ---------------------------------------------------------- */
const initStats = () => {
    const targets = [
        { id: 'stat-years', value: calcAge() },
        { id: 'stat-months', value: calcMonths() },
        { id: 'stat-days', value: calcDays() },
        { id: 'stat-hours', value: calcHours() },
    ];

    // Easing: easeOutExpo
    const easeOutExpo = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const animateCount = (el, target) => {
        const duration = 2200;
        const start = performance.now();
        const step = now => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutExpo(progress);
            el.textContent = Math.floor(eased * target).toLocaleString('id-ID');
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString('id-ID');
        };
        requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const id = el.id;
            const found = targets.find(t => t.id === id);
            if (found) {
                animateCount(el, found.value);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.4 });

    targets.forEach(t => {
        const el = document.getElementById(t.id);
        if (el) observer.observe(el);
    });
};

/* ----------------------------------------------------------
   WISH WALL — localStorage, add, delete, load
   ---------------------------------------------------------- */
const STORAGE_KEY = 'birthday_wishes_2026';

const loadWishes = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
};

const saveWishes = (wishes) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
};

const formatTime = (isoStr) => {
    const d = new Date(isoStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const initWishWall = () => {
    const input = document.getElementById('wish-input');
    const btn = document.getElementById('wish-submit');
    const container = document.getElementById('wishes-container');
    if (!input || !btn || !container) return;

    const renderEmpty = () => {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.id = 'empty-state';
        empty.innerHTML = `<span class="empty-icon">✨</span><p>Jadilah yang pertama memberikan ucapan!</p>`;
        container.appendChild(empty);
    };

    const removeEmpty = () => {
        const e = document.getElementById('empty-state');
        if (e) e.remove();
    };

    const createCard = (wish, prepend = false) => {
        removeEmpty();
        const card = document.createElement('article');
        card.className = 'wish-card';
        card.dataset.id = wish.id;
        card.innerHTML = `
      <p class="wish-text">${escapeHtml(wish.text)}</p>
      <div class="wish-meta">
        <span class="wish-time">${formatTime(wish.time)}</span>
        <button class="btn-delete" aria-label="Hapus ucapan" title="Hapus">×</button>
      </div>`;

        card.querySelector('.btn-delete').addEventListener('click', () => deleteWish(wish.id, card));

        if (prepend && container.firstChild) {
            container.insertBefore(card, container.firstChild);
        } else {
            container.appendChild(card);
        }

        // Slide-in animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => { card.classList.add('slide-in'); });
        });
    };

    const deleteWish = (id, card) => {
        card.classList.add('fade-out');
        card.addEventListener('transitionend', () => {
            card.remove();
            const wishes = loadWishes().filter(w => w.id !== id);
            saveWishes(wishes);
            if (container.children.length === 0) renderEmpty();
        }, { once: true });
    };

    const submitWish = () => {
        const text = input.value.trim();
        if (!text) return;
        const wish = { id: Date.now().toString(), text, time: new Date().toISOString() };
        const wishes = [wish, ...loadWishes()];
        saveWishes(wishes);
        createCard(wish, true);
        input.value = '';
        input.focus();
    };

    btn.addEventListener('click', submitWish);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submitWish(); });

    // Load existing
    const existing = loadWishes();
    if (existing.length === 0) {
        renderEmpty();
    } else {
        existing.forEach(w => createCard(w));
    }
};

// Escape HTML untuk keamanan XSS
const escapeHtml = (str) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

/* ----------------------------------------------------------
   WEB AUDIO — Birthday Tune
   ---------------------------------------------------------- */
const initAudio = () => {
    const btn = document.getElementById('music-btn');
    if (!btn) return;

    // Frekuensi not musik
    const notes = {
        C4: 261.63,
        D4: 293.66,
        E4: 329.63,
        F4: 349.23,
        G4: 392.00,
        A4: 440.00,
        B4: 493.88,
        C5: 523.25,
        D5: 587.33,
        E5: 659.25,
        F5: 698.46,
        G5: 783.99,
    };

    // Melodi Happy Birthday to You (nada + durasi beat)
    const melody = [
        [notes.G4, 1], [notes.G4, 0.5], [notes.A4, 1.5], [notes.G4, 1.5], [notes.C5, 1.5], [notes.B4, 3],
        [notes.G4, 1], [notes.G4, 0.5], [notes.A4, 1.5], [notes.G4, 1.5], [notes.D5, 1.5], [notes.C5, 3],
        [notes.G4, 1], [notes.G4, 0.5], [notes.G5, 1.5], [notes.E5, 1.5], [notes.C5, 1.5], [notes.B4, 1.5], [notes.A4, 3],
        [notes.F5, 1], [notes.F5, 0.5], [notes.E5, 1.5], [notes.C5, 1.5], [notes.D5, 1.5], [notes.C5, 3],
    ];

    let audioCtx = null;
    let playing = false;
    let loopTimer = null;
    const activeOscillators = new Set();

    const beatSeconds = 0.33;

    const playNote = (freq, durationSec, startAt) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startAt);

        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.linearRampToValueAtTime(0.2, startAt + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationSec * 0.95);

        osc.start(startAt);
        osc.stop(startAt + durationSec);
        activeOscillators.add(osc);
        osc.onended = () => activeOscillators.delete(osc);
    };

    const scheduleMelody = () => {
        const start = audioCtx.currentTime + 0.03;
        let cursor = start;

        melody.forEach(([freq, beat]) => {
            const durationSec = beat * beatSeconds;
            playNote(freq, durationSec, cursor);
            cursor += durationSec;
        });

        const loopDelay = (cursor - start) * 1000;
        loopTimer = setTimeout(() => {
            if (playing) scheduleMelody();
        }, loopDelay + 80);
    };

    const stopAll = () => {
        if (loopTimer) {
            clearTimeout(loopTimer);
            loopTimer = null;
        }
        activeOscillators.forEach((osc) => {
            try {
                osc.stop();
            } catch {
                // Oscillator mungkin sudah selesai; aman diabaikan.
            }
        });
        activeOscillators.clear();
    };

    btn.addEventListener('click', () => {
        if (!playing) {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            playing = true;
            btn.classList.add('playing');
            btn.setAttribute('aria-label', 'Hentikan musik');
            btn.querySelector('.music-icon').textContent = '⏸';
            scheduleMelody();
        } else {
            playing = false;
            stopAll();
            btn.classList.remove('playing');
            btn.setAttribute('aria-label', 'Putar musik ulang tahun');
            btn.querySelector('.music-icon').textContent = '🎵';
        }
    });

    btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
};

/* ----------------------------------------------------------
   BALLOON POP — Klik balon untuk efek pecah
   ---------------------------------------------------------- */
const initBalloonPop = () => {
    const hero = document.getElementById('hero');
    const container = hero?.querySelector('.balloons-container');
    const balloons = container?.querySelectorAll('.balloon');
    if (!hero || !container || !balloons.length) return;

    let popAudioCtx = null;

    const playPopSound = () => {
        if (!popAudioCtx) {
            popAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        const triggerPop = () => {
            const now = popAudioCtx.currentTime;
            const osc = popAudioCtx.createOscillator();
            const gain = popAudioCtx.createGain();
            const filter = popAudioCtx.createBiquadFilter();

            // Square + fast pitch drop memberi karakter "pop" yang lebih jelas di speaker mobile.
            osc.type = 'square';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.07);

            filter.type = 'highpass';
            filter.frequency.setValueAtTime(220, now);

            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.28, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(popAudioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.1);
        };

        if (popAudioCtx.state === 'suspended') {
            popAudioCtx.resume().then(triggerPop).catch(() => {
                // Jika resume gagal, skip bunyi tanpa mengganggu interaksi UI.
            });
            return;
        }

        triggerPop();
    };

    const randomBalloonStyle = (el) => {
        const palette = ['#FFB6C8', '#FF85A1', '#F2C4D8', '#FFD6E0', '#E8437A', '#E8A0B4'];
        el.style.setProperty('--col', palette[Math.floor(Math.random() * palette.length)]);
        el.style.left = `${Math.floor(Math.random() * 90) + 5}%`;
        el.style.setProperty('--dur', `${Math.floor(Math.random() * 9) + 8}s`);
        el.style.setProperty('--delay', `${(Math.random() * 1.2).toFixed(2)}s`);
        el.style.setProperty('--drift', `${Math.floor(Math.random() * 61) - 30}px`);
    };

    const spawnBalloon = () => {
        if (!PERF.keepBalloonRespawn) return; // Disable balloon respawn if not allowed
        const newBalloon = document.createElement('div');
        newBalloon.className = 'balloon';
        randomBalloonStyle(newBalloon);
        container.appendChild(newBalloon);
        bindPop(newBalloon);
    };

    const makeBurst = (x, y, color) => {
        const burst = document.createElement('div');
        burst.className = 'balloon-burst';
        burst.style.left = `${x}px`;
        burst.style.top = `${y}px`;

        for (let i = 0; i < 12; i++) {
            const frag = document.createElement('span');
            const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.4;
            const dist = 16 + Math.random() * 28;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;

            frag.className = 'balloon-fragment';
            frag.style.background = color;
            frag.style.setProperty('--dx', `${dx}px`);
            frag.style.setProperty('--dy', `${dy}px`);
            frag.style.setProperty('--rot', `${(Math.random() - 0.5) * 360}deg`);
            frag.style.animationDelay = `${Math.random() * 0.06}s`;
            burst.appendChild(frag);
        }

        hero.appendChild(burst);
        setTimeout(() => burst.remove(), 650);
    };

    const bindPop = (balloon) => {
        balloon.addEventListener('click', () => {
            if (balloon.classList.contains('popped')) return;

            const rect = balloon.getBoundingClientRect();
            const heroRect = hero.getBoundingClientRect();
            const centerX = rect.left - heroRect.left + rect.width / 2;
            const centerY = rect.top - heroRect.top + rect.height / 2;
            const color = getComputedStyle(balloon).backgroundColor;

            balloon.classList.add('popped');
            playPopSound();
            makeBurst(centerX, centerY, color);

            setTimeout(() => {
                balloon.remove();
            }, 220);

            // Spawn balon baru setelah jeda pendek agar suasana tetap ramai.
            setTimeout(spawnBalloon, 700 + Math.random() * 900);
        });
    };

    balloons.forEach(bindPop);
};

/* ----------------------------------------------------------
   SCROLL REVEAL — IntersectionObserver untuk semua section
   ---------------------------------------------------------- */
const initScrollReveal = () => {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });
    revealEls.forEach(el => obs.observe(el));
};

/* ----------------------------------------------------------
   FOOTER ACTIONS — Back to top
   ---------------------------------------------------------- */
const initFooterActions = () => {
    const backBtn = document.getElementById('back-to-top');
    if (!backBtn) return;

    backBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

/* ----------------------------------------------------------
   INIT — Jalankan semua setelah DOM siap
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add(`perf-${PERF.name}`);

    renderAge();
    initConfetti();
    initHeroLayers();
    initBalloonPop();
    initMessage();
    initTypingMessage();
    initStats();
    initMemorySlideshow();
    initWishWall();
    initAudio();
    initCursorHearts();
    initFinalReveal();
    initScrollReveal();
    initFooterActions();
});
/* ============================================================
   MAIN.JS — Happy Birthday 22 Tahun
   Fitur: Confetti, Age Counter, Scroll Reveal, Wish Wall,
          Web Audio Player, IntersectionObserver count-up
   ============================================================ */

'use strict';

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

    // Minimum 120 partikel
    const particles = Array.from({ length: 140 }, () => new Particle());

    const loop = () => {
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
   INIT — Jalankan semua setelah DOM siap
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    renderAge();
    initConfetti();
    initMessage();
    initStats();
    initWishWall();
    initAudio();
    initScrollReveal();
});
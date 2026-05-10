'use strict';

/* ─── STARFIELD + ÉTOILES FILANTES ─── */
(function () {
    const cv = document.getElementById('starfield');
    const cx = cv.getContext('2d');
    let W, H, stars = [], shooters = [];

    function resize() {
        W = cv.width  = window.innerWidth;
        H = cv.height = window.innerHeight;
        initStars();
    }

    function initStars() {
        stars = [];
        const n = Math.floor(W * H / 5800);
        for (let i = 0; i < n; i++) {
            stars.push({
                x: Math.random() * W, y: Math.random() * H,
                r: Math.random() * 1.4 + 0.2,
                a: Math.random() * 0.75 + 0.15,
                spd: Math.random() * 0.018 + 0.004,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    function spawnShooter() {
        const angle = Math.PI / 5 + Math.random() * Math.PI / 8;
        const speed = 9 + Math.random() * 8;
        shooters.push({
            x: Math.random() * W * 0.7,
            y: Math.random() * H * 0.4,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            a: 1,
            trail: []
        });
    }

    let t = 0, shootTimer = 0;
    function draw() {
        cx.clearRect(0, 0, W, H);
        t += 0.008;
        shootTimer++;

        if (shootTimer % 180 === 0) spawnShooter();

        for (const s of stars) {
            const alpha = s.a * (0.55 + 0.45 * Math.sin(t + s.phase));
            cx.beginPath();
            cx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            cx.fillStyle = `rgba(190,215,255,${alpha})`;
            cx.fill();
            s.y += s.spd;
            if (s.y > H) { s.y = -2; s.x = Math.random() * W; }
        }

        for (let i = shooters.length - 1; i >= 0; i--) {
            const s = shooters[i];
            s.trail.push({ x: s.x, y: s.y });
            if (s.trail.length > 22) s.trail.shift();
            s.x += s.vx; s.y += s.vy; s.a -= 0.018;
            if (s.a <= 0 || s.x > W + 50 || s.y > H + 50) { shooters.splice(i, 1); continue; }

            for (let j = 1; j < s.trail.length; j++) {
                const prog = j / s.trail.length;
                cx.beginPath();
                cx.moveTo(s.trail[j-1].x, s.trail[j-1].y);
                cx.lineTo(s.trail[j].x, s.trail[j].y);
                cx.strokeStyle = `rgba(200,240,255,${prog * s.a * 0.7})`;
                cx.lineWidth = prog * 2.2;
                cx.stroke();
            }
            cx.beginPath();
            cx.arc(s.x, s.y, 2, 0, Math.PI * 2);
            cx.fillStyle = `rgba(255,255,255,${s.a})`;
            cx.shadowBlur = 12; cx.shadowColor = '#00e5ff';
            cx.fill();
            cx.shadowBlur = 0;
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
    setTimeout(spawnShooter, 1200);
    setTimeout(spawnShooter, 3500);
})();

/* ─── FEUX D'ARTIFICE ─── */
(function () {
    const cv = document.getElementById('fireworks');
    const cx = cv.getContext('2d');
    let W, H, rockets = [], raf = null, stopTimer = null;

    function resize() {
        W = cv.width  = window.innerWidth;
        H = cv.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const COLORS = [
        '#00e5ff','#9b50ff','#ff9500','#ff3b5c','#00ff88',
        '#ffdd00','#ff69b4','#7df9ff','#bf5fff','#ffaa00'
    ];

    function newRocket() {
        return {
            x: W * 0.1 + Math.random() * W * 0.8,
            y: H + 10,
            vy: -(11 + Math.random() * 8),
            vx: (Math.random() - .5) * 2.5,
            targetY: H * 0.08 + Math.random() * H * 0.45,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            trail: [], exploded: false, particles: []
        };
    }

    function explode(r) {
        const n = 90 + Math.floor(Math.random() * 70);
        const col2 = COLORS[Math.floor(Math.random() * COLORS.length)];
        for (let i = 0; i < n; i++) {
            const angle = (i / n) * Math.PI * 2 + Math.random() * 0.15;
            const spd   = 2.5 + Math.random() * 5;
            r.particles.push({
                x: r.x, y: r.y,
                vx: Math.cos(angle) * spd * (0.7 + Math.random() * 0.6),
                vy: Math.sin(angle) * spd * (0.7 + Math.random() * 0.6),
                a: 1, r: 1.5 + Math.random() * 2.5,
                color: Math.random() < 0.15 ? '#fff' : (Math.random() < .5 ? r.color : col2),
                decay: 0.014 + Math.random() * 0.016,
                sparkle: Math.random() < 0.35
            });
        }
        r.shockwave = { r: 0, a: 0.7 };
    }

    let frameN = 0;
    function loop() {
        frameN++;
        cx.fillStyle = 'rgba(4,5,15,0.18)';
        cx.fillRect(0, 0, W, H);

        if (frameN % 22 === 0 && rockets.length < 14) rockets.push(newRocket());

        for (let i = rockets.length - 1; i >= 0; i--) {
            const r = rockets[i];
            if (!r.exploded) {
                r.trail.push({ x: r.x, y: r.y });
                if (r.trail.length > 14) r.trail.shift();
                r.x += r.vx; r.y += r.vy; r.vy += 0.2;
                for (let j = 1; j < r.trail.length; j++) {
                    const p = j / r.trail.length;
                    cx.beginPath();
                    cx.moveTo(r.trail[j-1].x, r.trail[j-1].y);
                    cx.lineTo(r.trail[j].x,   r.trail[j].y);
                    cx.strokeStyle = `rgba(255,210,120,${p * 0.75})`;
                    cx.lineWidth = p * 3; cx.stroke();
                }
                cx.beginPath(); cx.arc(r.x, r.y, 3.5, 0, Math.PI * 2);
                cx.fillStyle = '#fff'; cx.shadowBlur = 18; cx.shadowColor = r.color;
                cx.fill(); cx.shadowBlur = 0;
                if (r.y <= r.targetY || r.vy >= 0) { r.exploded = true; explode(r); }
            } else {
                if (r.shockwave && r.shockwave.a > 0) {
                    const sw = r.shockwave;
                    sw.r += 7; sw.a -= 0.055;
                    cx.beginPath(); cx.arc(r.x, r.y, sw.r, 0, Math.PI * 2);
                    cx.strokeStyle = `rgba(255,255,255,${sw.a})`;
                    cx.lineWidth = 2.5; cx.stroke();
                }
                let alive = false;
                for (const p of r.particles) {
                    if (p.a <= 0) continue;
                    alive = true;
                    p.x += p.vx; p.y += p.vy;
                    p.vy += 0.055; p.vx *= 0.985; p.a -= p.decay;
                    const alpha = p.sparkle
                        ? p.a * (0.5 + 0.5 * Math.sin(frameN * 0.35 + p.vx * 8))
                        : p.a;
                    cx.beginPath(); cx.arc(p.x, p.y, p.r * Math.max(0.1, p.a), 0, Math.PI * 2);
                    cx.fillStyle = p.color; cx.globalAlpha = Math.max(0, alpha);
                    cx.shadowBlur = 7; cx.shadowColor = p.color;
                    cx.fill(); cx.globalAlpha = 1; cx.shadowBlur = 0;
                }
                if (!alive) rockets.splice(i, 1);
            }
        }
        /* ── texte central ── */
        const elapsed = frameN / 60; // secondes approximatives
        const fadeIn   = Math.min(1, elapsed / 1.5);          // apparaît en 1.5s
        const fadeOut  = Math.max(0, 1 - Math.max(0, elapsed - 9) / 2); // disparaît à partir de 9s
        const alpha    = fadeIn * fadeOut;

        if (alpha > 0) {
            /* halo derrière le texte */
            const haloR = 260 + 20 * Math.sin(frameN * 0.04);
            const halo  = cx.createRadialGradient(W/2, H/2, 0, W/2, H/2, haloR);
            halo.addColorStop(0,   `rgba(4,5,15,${alpha * 0.75})`);
            halo.addColorStop(0.6, `rgba(4,5,15,${alpha * 0.4})`);
            halo.addColorStop(1,   'rgba(4,5,15,0)');
            cx.fillStyle = halo;
            cx.beginPath(); cx.arc(W/2, H/2, haloR, 0, Math.PI * 2);
            cx.fill();

            /* "Merci pour tout" */
            const pulse = 1 + 0.04 * Math.sin(frameN * 0.06);
            const fs    = Math.min(W / 8, 72);
            cx.save();
            cx.globalAlpha = alpha;
            cx.font        = `900 ${Math.round(fs * pulse)}px 'Orbitron', monospace`;
            cx.textAlign   = 'center';
            cx.textBaseline = 'middle';
            cx.shadowBlur  = 40; cx.shadowColor = '#9b50ff';
            /* dégradé texte */
            const tg = cx.createLinearGradient(W/2 - 300, 0, W/2 + 300, 0);
            tg.addColorStop(0,   '#00e5ff');
            tg.addColorStop(0.5, '#ffffff');
            tg.addColorStop(1,   '#9b50ff');
            cx.fillStyle = tg;
            cx.fillText('Merci pour tout', W/2, H/2 - 28);

            /* "et ..." avec les points qui s'animent */
            const dotCount = Math.floor((frameN / 18) % 4); // 0 à 3 points
            const dots     = '.'.repeat(dotCount);
            cx.font        = `400 ${Math.round(fs * 0.42)}px 'Space Mono', monospace`;
            cx.shadowBlur  = 20; cx.shadowColor = '#ff9500';
            cx.fillStyle   = `rgba(255,149,0,${alpha * (0.7 + 0.3 * Math.sin(frameN * 0.08))})`;
            cx.fillText(`et ${dots}`, W/2, H/2 + 42);
            cx.restore();
        }

        raf = requestAnimationFrame(loop);
    }

    function launch(duration) {
        if (raf) { cancelAnimationFrame(raf); clearTimeout(stopTimer); }
        cx.clearRect(0, 0, W, H);
        rockets = []; frameN = 0;
        rockets.push(newRocket()); rockets.push(newRocket()); rockets.push(newRocket());
        loop();
        stopTimer = setTimeout(() => {
            cancelAnimationFrame(raf); raf = null;
            setTimeout(() => cx.clearRect(0, 0, W, H), 3000);
        }, duration);
    }

    /* auto-lancement dès l'entrée sur le site */
    window.addEventListener('load', () => setTimeout(() => launch(12000), 400));

    /* bouton relancer */
    const btn = document.getElementById('btnFire');
    btn.addEventListener('click', function () {
        launch(12000);
        this.textContent = '🎆 Feux en cours…';
        this.disabled = true;
        setTimeout(() => {
            this.textContent = '🎆 Relancer les feux d\'artifice';
            this.disabled = false;
        }, 13000);
    });
})();

/* ─── GAME ─── */
(function () {
    const cv      = document.getElementById('gc');
    const cx      = cv.getContext('2d');
    const GW      = cv.width;
    const GH      = cv.height;

    const elScore  = document.getElementById('sScore');
    const elLives  = document.getElementById('sLives');
    const elLevel  = document.getElementById('sLevel');
    const btnStart = document.getElementById('btnStart');
    const btnPause = document.getElementById('btnPause');

    const C = {
        cyan:   '#00e5ff',
        purple: '#9b50ff',
        amber:  '#ff9500',
        red:    '#ff3b5c'
    };

    let mode = 'idle';
    let score = 0, lives = 3, level = 1;
    let packets = [], sparks = [], floats = [];
    let frame = 0, raf = null;
    let spawnEvery = 90, spd = 1.3;

    function hud() {
        elScore.textContent = score;
        elLives.textContent = lives;
        elLevel.textContent = level;
    }

    function reset() {
        score = 0; lives = 3; level = 1;
        packets = []; sparks = []; floats = [];
        frame = 0; spawnEvery = 90; spd = 1.3;
        hud();
    }

    function hexPath(x, y, r, rot) {
        cx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = rot + i * Math.PI / 3 - Math.PI / 6;
            i === 0
                ? cx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a))
                : cx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
        }
        cx.closePath();
    }

    function newPacket() {
        const gold   = Math.random() < 0.11;
        const violet = !gold && Math.random() < 0.2;
        const sz     = gold ? 28 : 18 + Math.random() * 11;
        return {
            x: sz + Math.random() * (GW - sz * 2),
            y: -sz * 2,
            sz, gold, violet,
            rot: 0, rotspd: (Math.random() - .5) * 0.045,
            spd: spd + Math.random() * 1.6,
            wob: 0, wobdir: Math.random() < .5 ? 1 : -1,
            pulse: Math.random() * Math.PI * 2
        };
    }

    function explode(x, y, col, n) {
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2 + Math.random() * .6;
            const v = 2.2 + Math.random() * 3.8;
            sparks.push({
                x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
                r: 1.8 + Math.random() * 2.5, a: 1,
                col, decay: .032 + Math.random() * .022
            });
        }
    }

    function floatTxt(x, y, txt, col) {
        floats.push({ x, y, txt, col, a: 1, vy: -1.6 });
    }

    function drawGrid() {
        cx.save();
        cx.strokeStyle = 'rgba(0,229,255,.038)';
        cx.lineWidth = .5;
        for (let x = 0; x <= GW; x += 40) { cx.beginPath(); cx.moveTo(x,0); cx.lineTo(x,GH); cx.stroke(); }
        for (let y = 0; y <= GH; y += 40) { cx.beginPath(); cx.moveTo(0,y); cx.lineTo(GW,y); cx.stroke(); }
        cx.restore();
    }

    function drawScan() {
        const sy = (frame * 1.4) % (GH + 60) - 30;
        const g  = cx.createLinearGradient(0, sy - 30, 0, sy + 30);
        g.addColorStop(0, 'rgba(0,229,255,0)');
        g.addColorStop(.5, 'rgba(0,229,255,.042)');
        g.addColorStop(1, 'rgba(0,229,255,0)');
        cx.fillStyle = g;
        cx.fillRect(0, sy - 30, GW, 60);
    }

    function drawDanger() {
        const g = cx.createLinearGradient(0, GH - 52, 0, GH);
        g.addColorStop(0, 'rgba(255,59,92,0)');
        g.addColorStop(1, 'rgba(255,59,92,.13)');
        cx.fillStyle = g;
        cx.fillRect(0, GH - 52, GW, 52);
        cx.save();
        cx.strokeStyle = 'rgba(255,59,92,.28)';
        cx.lineWidth = 1;
        cx.setLineDash([7,5]);
        cx.beginPath(); cx.moveTo(0, GH - 8); cx.lineTo(GW, GH - 8); cx.stroke();
        cx.setLineDash([]);
        cx.restore();
    }

    function drawPacket(p) {
        const col = p.gold ? C.amber : p.violet ? C.purple : C.cyan;
        p.pulse += .09;
        cx.save();
        cx.shadowBlur  = 14 + 5 * Math.sin(p.pulse);
        cx.shadowColor = col;
        hexPath(p.x, p.y, p.sz, p.rot);
        const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.sz);
        if (p.gold) {
            g.addColorStop(0, 'rgba(255,200,0,.28)');
            g.addColorStop(1, 'rgba(255,149,0,.04)');
        } else if (p.violet) {
            g.addColorStop(0, 'rgba(155,80,255,.22)');
            g.addColorStop(1, 'rgba(155,80,255,.03)');
        } else {
            g.addColorStop(0, 'rgba(0,229,255,.18)');
            g.addColorStop(1, 'rgba(0,229,255,.02)');
        }
        cx.fillStyle = g; cx.fill();
        hexPath(p.x, p.y, p.sz, p.rot);
        cx.strokeStyle = col; cx.lineWidth = p.gold ? 2.2 : 1.6; cx.stroke();
        hexPath(p.x, p.y, p.sz * .52, p.rot + .35);
        cx.globalAlpha = .38;
        cx.strokeStyle = col; cx.lineWidth = .8; cx.stroke();
        cx.globalAlpha = 1;
        cx.beginPath(); cx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        cx.fillStyle = col; cx.fill();
        if (p.gold) {
            cx.globalAlpha = .88;
            cx.fillStyle = '#fff';
            cx.font = `bold ${Math.floor(p.sz * .68)}px monospace`;
            cx.textAlign = 'center'; cx.textBaseline = 'middle';
            cx.fillText('★', p.x, p.y);
        }
        cx.restore();
    }

    function drawOverlay(msg1, col1, msg2, col2) {
        cx.save();
        cx.fillStyle = col1;
        cx.font = `bold 28px 'Orbitron', monospace`;
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.shadowBlur = 28; cx.shadowColor = col1;
        cx.fillText(msg1, GW / 2, GH / 2 - 36);
        if (msg2) {
            cx.font = `13px 'Orbitron', monospace`;
            cx.fillStyle = col2 || C.cyan;
            cx.shadowColor = col2 || C.cyan;
            cx.fillText(msg2, GW / 2, GH / 2 + 10);
            cx.font = `10px 'Space Mono', monospace`;
            cx.fillStyle = 'rgba(100,150,200,.65)';
            cx.shadowBlur = 0;
            cx.fillText('Appuyez sur DÉMARRER pour rejouer', GW / 2, GH / 2 + 46);
        }
        cx.restore();
    }

    function loop() {
        if (mode !== 'playing') return;
        frame++;
        cx.clearRect(0, 0, GW, GH);
        drawGrid(); drawScan(); drawDanger();

        if (frame % spawnEvery === 0) {
            const n = level >= 5 ? 3 : level >= 3 ? 2 : 1;
            for (let i = 0; i < n; i++) packets.push(newPacket());
        }

        const nl = score >= 100 ? Math.floor(score / 100) + 1 : 1;
        if (nl > level) {
            level = nl;
            spd = 1.3 + (level - 1) * 0.3;
            spawnEvery = Math.max(38, 90 - (level - 1) * 11);
            hud();
        }

        for (let i = packets.length - 1; i >= 0; i--) {
            const p = packets[i];
            p.y   += p.spd;
            p.rot += p.rotspd;
            p.wob  = (p.wob || 0) + 0.028 * p.wobdir;
            p.x   += Math.sin(p.wob) * 0.45;
            p.x    = Math.max(p.sz, Math.min(GW - p.sz, p.x));
            if (p.y > GH + p.sz) {
                packets.splice(i, 1);
                lives--;
                hud();
                cv.style.boxShadow = '0 0 24px rgba(255,59,92,.55)';
                setTimeout(() => { cv.style.boxShadow = ''; }, 340);
                if (lives <= 0) {
                    mode = 'over';
                    cx.clearRect(0, 0, GW, GH);
                    drawGrid();
                    drawOverlay('GAME OVER', C.red, `Score Final : ${score}`, C.cyan);
                    btnStart.textContent = '▶ Rejouer';
                    btnStart.disabled = false;
                    btnPause.disabled  = true;
                    return;
                }
                continue;
            }
            drawPacket(p);
        }

        for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i];
            s.x += s.vx; s.y += s.vy;
            s.vy += 0.09; s.vx *= .97; s.a -= s.decay;
            if (s.a <= 0) { sparks.splice(i, 1); continue; }
            cx.save();
            cx.globalAlpha = s.a;
            cx.shadowBlur = 7; cx.shadowColor = s.col;
            cx.beginPath(); cx.arc(s.x, s.y, s.r * s.a, 0, Math.PI * 2);
            cx.fillStyle = s.col; cx.fill();
            cx.restore();
        }

        for (let i = floats.length - 1; i >= 0; i--) {
            const f = floats[i];
            f.y += f.vy; f.a -= .026;
            if (f.a <= 0) { floats.splice(i, 1); continue; }
            cx.save();
            cx.globalAlpha = f.a;
            cx.font = `bold 13px 'Orbitron', monospace`;
            cx.fillStyle = f.col; cx.textAlign = 'center';
            cx.shadowBlur = 8; cx.shadowColor = f.col;
            cx.fillText(f.txt, f.x, f.y);
            cx.restore();
        }

        raf = requestAnimationFrame(loop);
    }

    cv.addEventListener('click', function (e) {
        if (mode !== 'playing') return;
        const r  = cv.getBoundingClientRect();
        const sx = GW / r.width, sy = GH / r.height;
        const mx = (e.clientX - r.left) * sx;
        const my = (e.clientY - r.top)  * sy;
        for (let i = packets.length - 1; i >= 0; i--) {
            const p  = packets[i];
            const dx = mx - p.x, dy = my - p.y;
            if (Math.sqrt(dx * dx + dy * dy) < p.sz * 1.25) {
                const pts = p.gold ? 30 : p.violet ? 20 : 10;
                score += pts;
                hud();
                const col = p.gold ? C.amber : p.violet ? C.purple : C.cyan;
                explode(p.x, p.y, col, p.gold ? 22 : 13);
                floatTxt(p.x, p.y - 22, `+${pts}`, col);
                packets.splice(i, 1);
                break;
            }
        }
    });

    btnStart.addEventListener('click', function () {
        if (mode === 'idle' || mode === 'over') {
            reset(); mode = 'playing';
            btnStart.textContent = '■ Stop';
            btnPause.disabled = false;
            loop();
        } else if (mode === 'playing') {
            cancelAnimationFrame(raf); mode = 'idle';
            btnStart.textContent = '▶ Démarrer';
            btnPause.disabled = true; btnPause.textContent = '⏸ Pause';
            cx.clearRect(0, 0, GW, GH); drawGrid();
            drawOverlay('APPUYEZ SUR DÉMARRER', 'rgba(0,229,255,.65)', null, null);
        }
    });

    btnPause.addEventListener('click', function () {
        if (mode === 'playing') {
            cancelAnimationFrame(raf); mode = 'paused';
            btnPause.textContent = '▶ Reprendre';
            cx.save();
            cx.fillStyle = 'rgba(4,5,15,.72)';
            cx.fillRect(0, 0, GW, GH);
            cx.restore();
            drawOverlay('PAUSE', 'rgba(0,229,255,.8)', null, null);
        } else if (mode === 'paused') {
            mode = 'playing'; btnPause.textContent = '⏸ Pause'; loop();
        }
    });

    cx.clearRect(0, 0, GW, GH);
    drawGrid();
    drawOverlay('APPUYEZ SUR DÉMARRER', 'rgba(0,229,255,.65)', null, null);
    cx.font = `10px 'Space Mono', monospace`;
    cx.fillStyle = 'rgba(90,130,170,.6)';
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText('Capturez les hexagones — ne les laissez pas tomber !', GW / 2, GH / 2 + 48);
})();

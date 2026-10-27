// Interactive Stormi: click = meow, hover = purr, drag her into the box or onto the
// character preview, or drag a cloud / star / moon sticker onto her.
function initStormi() {
    const stormi = document.getElementById('stormi');
    const boxBack = document.getElementById('stormi-box-back');
    const boxFront = document.getElementById('stormi-box-front');
    const preview = document.getElementById('character-preview');
    const sceneStormi = document.getElementById('scene-stormi');

    // Shared with the START scenes (js/sfx.js); the purr only plays after the visitor's first click
    const meow = sfx.meow;
    const purr = sfx.purr;

    // Frames are 32x32; walk, sit and play face right
    const ANIMS = {
        idle: { file: 'idle.png', frames: 6, dur: 1.8 },
        purr: { file: 'purr.png', frames: 4, dur: 0.8 },
        held: { file: 'held.png', frames: 2, dur: 1.2 },
        walk: { file: 'walk.png', frames: 6, dur: 0.6 },
        sit: { file: 'sit.png', frames: 4, dur: 1.4 },
        knead: { file: 'knead.png', frames: 4, dur: 0.9 },
        play: { file: 'play.png', frames: 4, dur: 0.8 },
        sleep: { file: 'sleep.png', frames: 4, dur: 4 }
    };
    const SIZE = 96;   // 32px sprite at 3x

    let state = 'idle';      // what she is doing
    let place = 'floor';     // floor | box | stage (inside the character preview)
    let x = 0, y = 0;
    let busyTimer = null;    // ends a reaction (knead / play)
    let wanderTimer = null;
    let snoreTimer = null;   // repeats her snore while she sleeps

    const floorY = () => Math.round(window.innerHeight * 0.95) - SIZE;
    const homeX = () => Math.round(window.innerWidth * 0.97) - SIZE;

    function show(name, faceLeft = false) {
        const a = ANIMS[name];
        state = name;
        stormi.style.backgroundImage = `url('assets/images/sprites/stormi/${a.file}')`;
        stormi.style.backgroundPosition = '0 0';
        stormi.style.setProperty('--frames', a.frames);
        stormi.style.setProperty('--dur', a.dur + 's');
        stormi.classList.add('playing');
        stormi.classList.toggle('face-left', faceLeft);
    }

    function moveTo(nx, ny) {
        x = nx;
        y = ny;
        stormi.style.left = x + 'px';
        stormi.style.top = y + 'px';
    }

    // The cardboard box sits in the bottom-left corner
    function placeBox() {
        const bx = Math.round(window.innerWidth * 0.03) + 48;
        [boxBack, boxFront].forEach(layer => {
            layer.style.left = bx + 'px';
            layer.style.top = floorY() + 'px';
        });
        return { x: bx, y: floorY() };
    }

    // Same cartoon snore as Lhenna's pajamas scene, pitched up so it sounds like a small cat
    function startSnore() {
        const snore = () => sfx.snore.rate(1.35, sfx.snore.play());
        snore();
        snoreTimer = setInterval(snore, 3000);
    }

    function stopSnore() {
        clearInterval(snoreTimer);
        snoreTimer = null;
    }

    function settle() {
        stopSnore();
        clearTimeout(busyTimer);
        purr.stop();
        show('idle');
        scheduleWander();
    }

    // ─── Wandering: now and then she strolls a little along the floor ───
    function scheduleWander() {
        clearTimeout(wanderTimer);
        wanderTimer = setTimeout(wander, 15000 + Math.random() * 20000);
    }

    function wander() {
        if (place !== 'floor' || state !== 'idle' || stormi.matches(':hover')) return scheduleWander();
        const min = 40, max = window.innerWidth - SIZE - 40;
        const target = Math.max(min, Math.min(max, x + (Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * 160)));
        const distance = Math.abs(target - x);
        stormi.style.setProperty('--walk-time', (distance / 60) + 's');
        stormi.classList.add('walking');
        show('walk', target < x);
        moveTo(target, y);
        busyTimer = setTimeout(() => {
            stormi.classList.remove('walking');
            show('sit', target < x);
            busyTimer = setTimeout(settle, 3000);
        }, (distance / 60) * 1000);
    }

    // The navbar Stormi meows too
    const logo = document.querySelector('.stormi-logo');
    if (logo) logo.addEventListener('click', () => meow.play());

    // ─── Hover + click ───
    stormi.addEventListener('mouseenter', () => {
        if (state !== 'idle') return;
        show('purr');
        if (!purr.playing()) purr.play();
    });
    stormi.addEventListener('mouseleave', () => {
        if (state !== 'purr') return;
        purr.stop();
        show('idle');
    });

    // ─── Dragging (mouse + touch) ───
    let drag = null;

    function pointerDown(e) {
        e.preventDefault();
        drag = { startX: e.clientX, startY: e.clientY, offX: e.clientX - x, offY: e.clientY - y, moved: false };
        try { stormi.setPointerCapture(e.pointerId); } catch (err) { /* pointer already released */ }
    }

    function pointerMove(e) {
        if (!drag) return;
        if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 5) return;
        if (!drag.moved) {
            drag.moved = true;
            stopSnore();
            clearTimeout(busyTimer);
            clearTimeout(wanderTimer);
            purr.stop();
            stormi.classList.remove('walking', 'falling');
            stormi.classList.add('dragging');
            place = 'floor';
            show('held');
        }
        moveTo(e.clientX - drag.offX, e.clientY - drag.offY);
    }

    function pointerUp(e) {
        if (!drag) return;
        const wasDrag = drag.moved;
        drag = null;
        stormi.classList.remove('dragging');
        if (!wasDrag) {
            meow.play();
            if (state === 'sleep') settle();   // clicking wakes her up
            return;
        }
        drop(e.clientX, e.clientY);
    }

    stormi.addEventListener('pointerdown', pointerDown);
    stormi.addEventListener('pointermove', pointerMove);
    stormi.addEventListener('pointerup', pointerUp);

    const inside = (rect, px, py) => px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom;

    function drop(px, py) {
        // Into the box
        if (inside(boxBack.getBoundingClientRect(), px, py)) {
            const box = placeBox();
            place = 'box';
            moveTo(box.x, box.y);
            show('idle');
            return;
        }
        // Onto the character preview: she joins Lhenna there
        if (inside(preview.getBoundingClientRect(), px, py)) {
            goToStage();
            document.dispatchEvent(new CustomEvent('stormi-visit'));
            return;
        }
        // Anywhere else: she lands on the floor
        stormi.classList.add('falling');
        moveTo(Math.max(0, Math.min(window.innerWidth - SIZE, x)), floorY());
        show('held');
        setTimeout(() => {
            stormi.classList.remove('falling');
            settle();
        }, 380);
    }

    // ─── The preview and the START scenes use the in-scene Stormi, so this one steps out ───
    function goToStage() {
        stopSnore();
        clearTimeout(busyTimer);
        clearTimeout(wanderTimer);
        purr.stop();
        place = 'stage';
        stormi.hidden = true;
    }

    function comeHome() {
        place = 'floor';
        stormi.hidden = false;
        stormi.classList.remove('walking', 'falling');
        moveTo(homeX(), floorY());
        settle();
    }

    document.addEventListener('stormi-leave', goToStage);
    document.addEventListener('stormi-home', comeHome);
    sceneStormi.addEventListener('click', () => {
        meow.play();
        document.dispatchEvent(new CustomEvent('stormi-home'));
    });

    // ─── Stickers dropped on her ───
    function moveSticker(el, left, top) {
        const parent = el.offsetParent ? el.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };
        el.style.left = (left - parent.left) + 'px';
        el.style.top = (top - parent.top) + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
    }

    document.addEventListener('sticker-drop', e => {
        const sticker = e.detail;
        const kind = sticker.dataset.sound;
        if (place === 'stage' || stormi.hidden || !['cloud', 'star', 'moon'].includes(kind)) return;

        const s = sticker.getBoundingClientRect();
        const cx = s.left + s.width / 2, cy = s.top + s.height / 2;
        const me = stormi.getBoundingClientRect();
        if (!inside({ left: me.left - 20, right: me.right + 20, top: me.top - 20, bottom: me.bottom + 20 }, cx, cy)) return;

        stopSnore();
        purr.stop();
        clearTimeout(busyTimer);
        clearTimeout(wanderTimer);
        if (place === 'box') {
            // hop out of the box first
            place = 'floor';
            moveTo(x + SIZE + 16, floorY());
        }

        if (kind === 'cloud') {
            // kneading the cloud under her paws, purring
            moveSticker(sticker, x + SIZE / 2 - s.width / 2, y + SIZE - s.height / 2);
            show('knead');
            purr.play();
            busyTimer = setTimeout(settle, 6000);
        } else if (kind === 'star') {
            // batting at the star above her
            moveSticker(sticker, x + 26 * 3 - s.width / 2, y - s.height / 3);
            show('play');
            busyTimer = setTimeout(settle, 5000);
        } else if (kind === 'moon') {
            // curls up on the moon until someone clicks her
            moveSticker(sticker, x + SIZE / 2 - s.width / 2, y + SIZE - s.height * 0.6);
            show('sleep');
            startSnore();
        }
    });

    // ─── Start in the corner, box in the other corner ───
    placeBox();
    moveTo(homeX(), floorY());
    settle();
    window.addEventListener('resize', () => {
        const box = placeBox();
        if (place === 'box') moveTo(box.x, box.y);
        else if (place === 'floor') moveTo(Math.min(x, window.innerWidth - SIZE), floorY());
    });
}

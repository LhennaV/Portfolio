// ▶ START scenes: each outfit plays a little scene with its prop, and Stormi walks in to join
function initScene() {
    const PROPS = 'assets/images/sprites/props/';
    const STORMI = 'assets/images/sprites/stormi/';
    const FX = { sweat: 0, note: 1, sparkle: 2, heart: 3, z: 4, code: 5 };   // icon order in fx.png

    // held: drawn over Lhenna (32x56 frames). side: stands to her right.
    // move: how Lhenna moves. fx: icon that floats up, and where (in sprite pixels).
    // sound: plays every `every` ms after `delay` (only `times` times if set, then `then` once)
    const SCENES = {
        gym: {
            held: { file: 'prop-dumbbells.png' }, move: 'move-squat', fx: 'sweat', fxAt: [21, 6],
            sound: { name: 'thud', delay: 600, every: 1200 }   // bottom of each squat
        },
        hoodie: {
            held: { file: 'prop-desk.png', frames: 2, dur: 1.2 }, move: 'move-bob', fx: 'code', fxAt: [12, 20],
            sound: { name: 'typing', delay: 200, every: 1200 }
        },
        dress: {
            held: { file: 'prop-brush.png' },
            side: { file: 'prop-easel.png', frames: 4, dur: 3.2, once: true },
            fx: 'sparkle', fxAt: [44, 4],
            sound: { name: 'brush', delay: 800, every: 800, times: 3, then: 'sparkle' }   // one swish per stroke
        },
        casual: {
            held: { file: 'prop-console.png', frames: 2, dur: 0.6 }, move: 'move-bob', fx: 'note', fxAt: [6, 24],
            sound: { name: 'game', delay: 200, every: 1200 }
        },
        pajamas: {
            held: { file: 'prop-pillow.png' }, move: 'move-sway', fx: 'z', fxAt: [21, 0],
            sound: { name: 'snore', delay: 300, every: 2400 }
        }
    };

    // Stormi's sprites face right; she walks in from the right, so she is flipped to face Lhenna
    const STORMI_ANIMS = {
        walk: { file: 'walk.png', frames: 6, dur: 0.6, flip: true },
        sit: { file: 'sit.png', frames: 4, dur: 1.4, flip: true },
        purr: { file: 'purr.png', frames: 4, dur: 0.8, flip: false }
    };

    const stage = document.getElementById('stage');
    const lhenna = stage.querySelector('.character-sprite');
    const prop = document.getElementById('scene-prop');
    const side = document.getElementById('scene-side');
    const stormi = document.getElementById('scene-stormi');
    const fxLayer = document.getElementById('scene-fx');
    const button = document.getElementById('scene-start');

    let outfit = null;
    let running = false;
    let visiting = false;    // the one Stormi is here (in a scene, or dropped onto the preview)
    let timers = [];
    let stormiTimers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const every = (fn, ms) => timers.push(setInterval(fn, ms));
    const stormiLater = (fn, ms) => stormiTimers.push(setTimeout(fn, ms));

    function clearStormi() {
        stormiTimers.forEach(clearTimeout);
        stormiTimers = [];
        sfx.steps.stop();
        sfx.purr.stop();
        stormi.hidden = true;
        stormi.classList.remove('playing');
    }

    // Stormi walks out of the corner and into the stage
    function bringStormi() {
        if (visiting) return;
        visiting = true;
        document.dispatchEvent(new CustomEvent('stormi-leave'));
    }

    function setStrip(el, { file, frames = 1, dur = 1, w = 32, h = 56, once = false }, folder) {
        el.style.backgroundImage = `url('${folder + file}')`;
        el.style.backgroundPosition = '0 0';
        el.style.setProperty('--frames', frames);
        el.style.setProperty('--w', w);
        el.style.setProperty('--h', h);
        el.style.setProperty('--dur', dur + 's');
        el.classList.toggle('playing', frames > 1 && !once);
        el.hidden = false;
        if (once) {
            // play through once and hold the last frame (the finished painting)
            let frame = 0;
            const step = setInterval(() => {
                frame++;
                el.style.backgroundPosition = `calc(${-frame * w} * var(--px)) 0`;
                if (frame >= frames - 1) clearInterval(step);
            }, (dur * 1000) / frames);
            timers.push(step);
        }
    }

    function setStormi(name) {
        const anim = STORMI_ANIMS[name];
        setStrip(stormi, { ...anim, w: 32, h: 32 }, STORMI);
        stormi.classList.toggle('face-left', anim.flip);
    }

    function floatFx(name, [x, y]) {
        const icon = document.createElement('div');
        icon.className = 'scene-fx-icon';
        icon.style.left = `calc(${x + Math.round(Math.random() * 4 - 2)} * var(--px))`;
        icon.style.top = `calc(${y} * var(--px))`;
        icon.style.backgroundPosition = `calc(${-FX[name] * 8} * var(--px)) 0`;
        fxLayer.appendChild(icon);
        icon.addEventListener('animationend', () => icon.remove());
    }

    function start() {
        const scene = SCENES[outfit];
        if (!scene) return;
        stop({ sendHome: false });
        running = true;
        stage.classList.add('scene-on');
        button.textContent = '■ STOP';

        setStrip(prop, scene.held, PROPS);
        if (scene.side) setStrip(side, scene.side, PROPS);
        if (scene.move) lhenna.classList.add(scene.move);
        every(() => floatFx(scene.fx, scene.fxAt), 1100);
        sfx.start.play();
        playSceneSound(scene.sound);

        // Stormi walks in from off-stage, sits next to Lhenna, then purrs on and off
        bringStormi();
        clearStormi();
        setStormi('walk');
        stormi.style.transition = 'none';
        stormi.style.left = 'calc(64 * var(--px))';
        stormi.getBoundingClientRect();           // apply the start position before animating
        stormi.style.transition = '';
        stormi.style.left = 'calc(31 * var(--px))';
        sfx.steps.play();
        stormiLater(() => {
            sfx.steps.stop();
            sfx.meow.play();
            setStormi('sit');
            stormiLater(purrLoop, 2500);
        }, 2400);
    }

    function playSceneSound({ name, delay = 0, every: interval, times, then }) {
        if (!times) {
            later(() => {
                sfx[name].play();
                every(() => sfx[name].play(), interval);
            }, delay);
            return;
        }
        for (let i = 0; i < times; i++) later(() => sfx[name].play(), delay + i * interval);
        if (then) later(() => sfx[then].play(), delay + times * interval);
    }

    function purrLoop() {
        setStormi('purr');
        sfx.purr.play();
        stormiLater(() => {
            sfx.purr.stop();
            setStormi('sit');
            stormiLater(purrLoop, 4000);
        }, 3200);
    }

    // sendHome: false when a new scene replaces this one (Stormi stays)
    function stop({ sendHome = true } = {}) {
        timers.forEach(t => { clearTimeout(t); clearInterval(t); });
        timers = [];
        running = false;
        lhenna.classList.remove('move-squat', 'move-bob', 'move-sway');
        [prop, side].forEach(el => { el.hidden = true; el.classList.remove('playing'); });
        fxLayer.innerHTML = '';
        button.textContent = '▶ START';
        if (sendHome) {
            clearStormi();
            stage.classList.remove('scene-on');
            if (visiting) {
                visiting = false;
                document.dispatchEvent(new CustomEvent('stormi-home'));
            }
        }
    }

    button.addEventListener('click', () => {
        if (!running) return start();
        sfx.stop.play();
        stop();
    });

    // Stormi dropped onto the preview: she sits with Lhenna (no scene needed)
    document.addEventListener('stormi-visit', () => {
        visiting = true;
        if (running) return;
        stage.classList.add('scene-on');
        clearStormi();
        setStormi('sit');
        sfx.meow.play();
        stormi.style.transition = 'none';
        stormi.style.left = 'calc(31 * var(--px))';
        stormiLater(purrLoop, 1500);
    });

    // Clicking her in the preview sends her back to her corner
    document.addEventListener('stormi-home', () => {
        if (!visiting) return;
        visiting = false;
        clearStormi();
        if (!running) stage.classList.remove('scene-on');
    });

    // Scenes follow the outfit: no outfit = nothing to play; a new outfit restarts the scene
    document.addEventListener('character-change', e => {
        const changed = e.detail.outfit !== outfit;
        outfit = e.detail.outfit;
        button.disabled = !outfit;
        button.title = outfit ? '' : 'pick an outfit first';
        if (!outfit) stop();
        else if (running && changed) start();
    });
}

// Character Creator Logic
function initCharacterCreator() {
    // Nothing is picked at the start; clicking a picked option again takes it off
    const currentCharacter = { hair: null, outfit: null, expression: null, accessory: null };
    const CATEGORIES = [
        { key: 'hair', selector: '.hair-btn', data: 'hair' },
        { key: 'outfit', selector: '.outfit-btn', data: 'outfit' },
        { key: 'expression', selector: '.expr-btn', data: 'expr' },
        { key: 'accessory', selector: '.acc-btn', data: 'acc' }
    ];

    CATEGORIES.forEach(({ key, selector, data }) => {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.dataset[data];
                currentCharacter[key] = currentCharacter[key] === value ? null : value;
                (currentCharacter[key] ? sfx.select : sfx.deselect).play();
                // Highlight the active button with soft RPG style
                buttons.forEach(b => {
                    const active = b.dataset[data] === currentCharacter[key];
                    b.classList.toggle('bg-[#7C3AED]', active);
                    b.classList.toggle('text-white', active);
                    b.classList.toggle('bg-[#F7F5FF]', !active);
                    b.classList.toggle('text-[#7C3AED]', !active);
                });
                updateCharacterPreview();
            });
        });
    });

    // Stack the sprite layers for the current picks
    const SPRITES = 'assets/images/sprites/lhenna/';
    function setLayer(id, file) {
        const layer = document.getElementById(id);
        if (file) {
            layer.src = SPRITES + file;
            layer.hidden = false;
        } else {
            layer.hidden = true;
        }
    }

    // Each outfit is a side of me: it sets the dialogue line and the stats card
    const MODES = {
        gym: {
            name: 'GRIND MODE',
            line: 'deadlines are just cardio. capstone + side projects, one rep at a time.',
            class: 'designer + dev', weapon: 'discipline (and a playlist)', weakness: 'leg day',
            hp: 70, status: 'grinding ✦'
        },
        hoodie: {
            name: 'DEV MODE',
            line: 'html, css, js, tailwind, alpine.js, leaflet.js, and learning react. homesure and gtrack are my builds.',
            class: 'frontend dev', weapon: 'vs code', weakness: 'bugs (cry first, then fix)',
            hp: 85, status: 'shipping code ✦',
            work: { label: 'see what i built', heading: 'dev mode · what i built', ids: ['homesure', 'gtrack'] }
        },
        dress: {
            name: 'DESIGNER MODE',
            line: 'figma, always figma. wireframes to prototypes to interfaces that feel like a warm hug. trybe and mindease are my designs.',
            class: 'ui/ux designer', weapon: 'figma', weakness: 'misaligned pixels',
            hp: 100, status: 'in my element ✦',
            work: { label: 'see what i designed', heading: 'designer mode · what i designed', ids: ['trybe', 'mindease'] }
        },
        casual: {
            name: 'EVERYDAY ME',
            line: 'gaming, pinterest rabbit holes, purple everything, and getting judged by stormi.',
            class: 'designer + dev', weapon: 'pinterest', weakness: 'online shopping',
            hp: 90, status: 'vibing ✦'
        },
        pajamas: {
            name: 'SLEEPY MODE',
            line: 'certified sleepy kid since birth. i can fall asleep anywhere, anytime, no questions asked.',
            class: 'professional napper', weapon: 'pillow', weakness: 'sleep (obviously)',
            hp: 30, status: 'zzz... ✦'
        }
    };

    // RPG-style typing for the dialogue line; a new line cancels the one still typing
    let typingTimer = null;
    function typeLine(text) {
        const el = document.getElementById('mode-line');
        clearTimeout(typingTimer);
        let index = 0;
        (function type() {
            el.textContent = text.slice(0, ++index);
            if (index < text.length) typingTimer = setTimeout(type, 25);
        })();
    }

    // Shown before an outfit is picked (the original stats card)
    const NO_MODE = {
        name: 'CHARACTER SELECT',
        line: 'pick an outfit to see a different side of me. each one changes my stats ✦',
        class: 'designer + dev', weapon: 'figma', weakness: 'sleep',
        hp: 100, status: 'figuring it out ✦'
    };

    let currentMode;
    function updateMode(outfit) {
        if (outfit === currentMode) return;
        currentMode = outfit;
        const mode = MODES[outfit] || NO_MODE;
        document.getElementById('mode-name').textContent = '[' + mode.name + ']';
        typeLine(mode.line);
        const link = document.getElementById('mode-link');
        link.hidden = !mode.work;
        if (mode.work) link.textContent = '> ' + mode.work.label;
        document.getElementById('stat-class').textContent = mode.class;
        document.getElementById('stat-weapon').textContent = mode.weapon;
        document.getElementById('stat-weakness').textContent = mode.weakness;
        document.getElementById('stat-hp').style.width = mode.hp + '%';
        document.getElementById('stat-status').textContent = mode.status;
    }

    // DEV and DESIGNER modes each open their own projects in the Work window
    document.getElementById('mode-link').addEventListener('click', () => {
        window.openWorks(MODES[currentMode].work);
    });

    function updateCharacterPreview() {
        const { hair, outfit, expression, accessory } = currentCharacter;
        setLayer('layer-hair-back', hair && `hair-${hair}-back.png`);
        setLayer('layer-outfit', outfit && `outfit-${outfit}.png`);
        setLayer('layer-expression', expression && `expr-${expression}.png`);
        setLayer('layer-hair', hair && `hair-${hair}.png`);
        setLayer('layer-accessory', accessory && accessory !== 'none' && `acc-${accessory}.png`);
        updateMode(outfit);
        // js/scene.js listens to this to pick the START scene
        document.dispatchEvent(new CustomEvent('character-change', { detail: { ...currentCharacter } }));
    }

    updateCharacterPreview();
}

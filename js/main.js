// Desktop Interactive Elements Handler
class DesktopElements {
    constructor() {
        this.elements = document.querySelectorAll('.desktop-element');
        this.draggedElement = null;
        this.offsetX = 0;
        this.offsetY = 0;

        // Initialize Howler.js sounds
        // Note: Add actual sound files to assets/sounds/ folder
        this.sounds = {
            mushroom: new Howl({
                src: ['assets/sounds/mushroom.mp3', 'assets/sounds/mushroom.wav'],
                volume: 0.5,
                onloaderror: () => console.log('Mushroom sound not found - using placeholder')
            }),
            star: new Howl({
                src: ['assets/sounds/star.mp3', 'assets/sounds/star.wav'],
                volume: 0.5,
                onloaderror: () => console.log('Star sound not found - using placeholder')
            }),
            moon: new Howl({
                src: ['assets/sounds/moon.mp3', 'assets/sounds/moon.wav'],
                volume: 0.5,
                onloaderror: () => console.log('Moon sound not found - using placeholder')
            }),
            cloud: new Howl({
                src: ['assets/sounds/cloud.mp3', 'assets/sounds/cloud.wav'],
                volume: 0.5,
                onloaderror: () => console.log('Cloud sound not found - using placeholder')
            }),
            butterfly: new Howl({
                src: ['assets/sounds/butterfly.mp3', 'assets/sounds/butterfly.wav'],
                volume: 0.5,
                onloaderror: () => console.log('Butterfly sound not found - using placeholder')
            }),
            sparkle: new Howl({
                src: ['assets/sounds/sparkle.mp3', 'assets/sounds/sparkle.wav'],
                volume: 0.5,
                onloaderror: () => console.log('Sparkle sound not found - using placeholder')
            }),
            heart: new Howl({
                src: ['assets/sounds/heart.mp3', 'assets/sounds/heart.wav'],
                volume: 0.5,
                onloaderror: () => console.log('Heart sound not found - using placeholder')
            })
        };

        this.init();
    }

    init() {
        this.elements.forEach(element => {
            // Click event for sound and animation
            element.addEventListener('click', (e) => this.handleClick(e, element));

            // Drag events
            element.addEventListener('mousedown', (e) => this.handleDragStart(e, element));
        });

        // Global drag events
        document.addEventListener('mousemove', (e) => this.handleDrag(e));
        document.addEventListener('mouseup', () => this.handleDragEnd());

        // Touch support for mobile
        this.elements.forEach(element => {
            element.addEventListener('touchstart', (e) => this.handleTouchStart(e, element));
        });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        document.addEventListener('touchend', () => this.handleDragEnd());
    }

    handleClick(e, element) {
        // Prevent click during drag
        if (element.classList.contains('dragging')) return;

        // Play sound with Howler.js
        const soundType = element.dataset.sound;
        if (this.sounds[soundType]) {
            try {
                this.sounds[soundType].play();
            } catch (error) {
                console.log(`Could not play ${soundType} sound:`, error);
            }
        }

        // Add animation class
        element.classList.add('clicked');

        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove('clicked');
        }, 1000);
    }

    handleDragStart(e, element) {
        e.preventDefault();
        this.draggedElement = element;

        // Get the current position of the element
        const rect = element.getBoundingClientRect();

        // Calculate offset based on where we clicked on the element
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;

        // Store the parent element to calculate relative position
        this.parentElement = element.offsetParent;

        element.classList.add('dragging', 'cursor-grabbing', 'opacity-80', 'z-[1000]', 'scale-105');
        element.classList.remove('cursor-grab');
    }

    handleDrag(e) {
        if (!this.draggedElement) return;

        e.preventDefault();

        // Calculate position relative to the parent container
        const parentRect = this.parentElement ? this.parentElement.getBoundingClientRect() : { left: 0, top: 0 };

        // Calculate new position
        const x = e.clientX - parentRect.left - this.offsetX;
        const y = e.clientY - parentRect.top - this.offsetY;

        // Set position directly without bounds for now (elements can move freely)
        this.draggedElement.style.left = x + 'px';
        this.draggedElement.style.top = y + 'px';
        this.draggedElement.style.right = 'auto';
        this.draggedElement.style.bottom = 'auto';
    }

    handleDragEnd() {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging', 'cursor-grabbing', 'opacity-80', 'z-[1000]', 'scale-105');
            this.draggedElement.classList.add('cursor-grab');
            this.draggedElement = null;
        }
    }

    handleTouchStart(e, element) {
        const touch = e.touches[0];
        const rect = element.getBoundingClientRect();

        this.draggedElement = element;
        this.offsetX = touch.clientX - rect.left;
        this.offsetY = touch.clientY - rect.top;

        // Store the parent element to calculate relative position
        this.parentElement = element.offsetParent;

        element.classList.add('dragging', 'cursor-grabbing', 'opacity-80', 'z-[1000]', 'scale-105');
        element.classList.remove('cursor-grab');
    }

    handleTouchMove(e) {
        if (!this.draggedElement) return;

        e.preventDefault();
        const touch = e.touches[0];

        // Calculate position relative to the parent container
        const parentRect = this.parentElement ? this.parentElement.getBoundingClientRect() : { left: 0, top: 0 };

        // Calculate new position
        const x = touch.clientX - parentRect.left - this.offsetX;
        const y = touch.clientY - parentRect.top - this.offsetY;

        // Set position directly
        this.draggedElement.style.left = x + 'px';
        this.draggedElement.style.top = y + 'px';
        this.draggedElement.style.right = 'auto';
        this.draggedElement.style.bottom = 'auto';
    }
}

// Floating Window Handler
class FloatingWindow {
    constructor(windowId, openBtnSelector, closeBtnId, titlebarId) {
        this.window = document.getElementById(windowId);
        this.openBtn = document.querySelector(openBtnSelector);
        this.closeBtn = document.getElementById(closeBtnId);
        this.titlebar = document.getElementById(titlebarId);

        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;

        this.init();
    }

    init() {
        // Open window
        if (this.openBtn) {
            this.openBtn.addEventListener('click', () => {
                this.window.classList.remove('hidden');
                this.window.classList.add('flex');
            });
        }

        // Close window
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.window.classList.add('hidden');
                this.window.classList.remove('flex');
            });
        }

        // Dragging
        if (this.titlebar) {
            this.titlebar.addEventListener('mousedown', (e) => this.startDrag(e));
            document.addEventListener('mousemove', (e) => this.drag(e));
            document.addEventListener('mouseup', () => this.stopDrag());
        }
    }

    startDrag(e) {
        this.isDragging = true;
        const rect = this.window.getBoundingClientRect();
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;
    }

    drag(e) {
        if (!this.isDragging) return;

        const x = e.clientX - this.offsetX;
        const y = e.clientY - this.offsetY;

        this.window.style.left = x + 'px';
        this.window.style.top = y + 'px';
    }

    stopDrag() {
        this.isDragging = false;
    }
}

// FAQ Data
const faqData = [
    { q: "what do you use to design?", a: "figma, always figma." },
    { q: "are you available for freelance?", a: "yes please i need money." },
    { q: "what's your design process like?", a: "vibe first, structure second. always." },
    { q: "what kind of projects do you work on?", a: "ui/ux design and frontend dev. mostly web apps, sometimes passion projects." },
    { q: "do you work well in teams?", a: "hell nah." },
    { q: "what's your strongest skill?", a: "turning a vague idea into something that actually looks and feels good." },
    { q: "how do you handle feedback?", a: "openly, but only if it's constructive. being mean to me makes me cry." },
    { q: "are you still studying or working?", a: "stuDYING." },
    { q: "what tools do you know?", a: "figma, html, css, js, leaflet.js, and slowly adding more." },
    { q: "do you have experience with real projects?", a: "yes. eduspace, homesure, and gtrack. all currently in progress." },
    { q: "are you a designer or a developer?", a: "yes." },
    { q: "why is everything purple?", a: "i don't make the rules." },
    { q: "do you have a cat?", a: "i have a daughter. her name is stormi." },
    { q: "what are you working on right now?", a: "too many things. send help." },
    { q: "do you sleep enough?", a: "i sleep everywhere. quantity over quality." },
    { q: "how do you handle bugs?", a: "cry first, then fix it." },
    { q: "can i steal your portfolio design?", a: "i will know." },
    { q: "what's your favorite color?", a: "do you even have to ask." },
    { q: "coffee or tea?", a: "sleep." },
    { q: "how long does it take you to finish a design?", a: "depends. is spotify cooperating?" },
    { q: "what inspires you?", a: "pinterest, stormi, and mild chaos." },
    { q: "do you enjoy coding?", a: "i enjoy it when it works." },
    { q: "what's your biggest flex?", a: "i made a pixel art cat out of rectangles." },
    { q: "what happens if you click everything on this site?", a: "you'll find out. 👀" },
    { q: "are you open to collabs?", a: "depends on the vibe." },
    { q: "what's your dream project?", a: "something purple. obviously." },
    { q: "any advice for aspiring designers?", a: "just start. it doesn't have to be perfect." }
];

// Guestbook functionality
function initGuestbook() {
    const nameInput = document.getElementById('guestbook-name');
    const messageInput = document.getElementById('guestbook-message');
    const postButton = document.getElementById('post-guestbook');
    const entriesContainer = document.getElementById('guestbook-entries');

    // Listen to guestbook entries in real-time
    if (window.guestbookDB) {
        window.guestbookDB.listenToEntries((entries) => {
            renderGuestbookEntries(entries);
        });
    }

    // Handle post button click
    postButton.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !message) {
            alert('Please fill in both name and message!');
            return;
        }

        if (message.length > 500) {
            alert('Message is too long! Keep it under 500 characters.');
            return;
        }

        // Disable button while posting
        postButton.disabled = true;
        postButton.textContent = 'posting...';

        if (window.guestbookDB) {
            const result = await window.guestbookDB.addEntry(name, message);

            if (result.success) {
                // Clear inputs
                nameInput.value = '';
                messageInput.value = '';
                // Success feedback
                postButton.textContent = 'posted! ✓';
                setTimeout(() => {
                    postButton.textContent = 'post';
                    postButton.disabled = false;
                }, 2000);
            } else {
                alert('Failed to post. Please try again!');
                postButton.textContent = 'post';
                postButton.disabled = false;
            }
        } else {
            alert('Firebase not configured yet. Please add your Firebase config!');
            postButton.textContent = 'post';
            postButton.disabled = false;
        }
    });
}

function renderGuestbookEntries(entries) {
    const container = document.getElementById('guestbook-entries');

    if (entries.length === 0) {
        container.innerHTML = '<p class="font-mono text-lg text-gray-400 text-center py-8">no messages yet. be the first! 💜</p>';
        return;
    }

    container.innerHTML = entries.map(entry => {
        const date = entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp);
        const timeAgo = getTimeAgo(date);

        return `
            <div class="bg-white p-4 pixel-border-thin">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-base font-bold text-gray-800">${escapeHtml(entry.name)}</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="2" width="2" height="2" fill="#FF9EB5"/>
                            <rect x="6" y="2" width="2" height="2" fill="#FF9EB5"/>
                            <rect x="1" y="3" width="7" height="2" fill="#FF9EB5"/>
                            <rect x="2" y="5" width="5" height="2" fill="#FF9EB5"/>
                            <rect x="3" y="7" width="3" height="2" fill="#FF9EB5"/>
                            <rect x="4" y="9" width="1" height="1" fill="#FF9EB5"/>
                        </svg>
                    </div>
                    <span class="font-mono text-sm text-gray-400">${timeAgo}</span>
                </div>
                <p class="font-mono text-lg text-gray-700">${escapeHtml(entry.message)}</p>
            </div>
        `;
    }).join('');
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DesktopElements();

    // Initialize Guestbook
    initGuestbook();

    // Initialize Work Window
    new FloatingWindow('work-window', '.nav-btn:first-child', 'work-close', 'work-titlebar');

    // Initialize Links Window (3rd button - index 2)
    const linksBtn = document.querySelectorAll('.nav-btn')[2];
    new FloatingWindow('links-window', null, 'links-close', 'links-titlebar');
    if (linksBtn) {
        linksBtn.addEventListener('click', () => {
            document.getElementById('links-window').classList.remove('hidden');
            document.getElementById('links-window').classList.add('flex');
        });
    }

    // Initialize FAQ Window (4th button - index 3)
    const faqBtn = document.querySelectorAll('.nav-btn')[3];
    new FloatingWindow('faq-window', null, 'faq-close', 'faq-titlebar');

    // Generate FAQ accordion
    const faqList = document.getElementById('faq-list');
    faqData.forEach((item, index) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'bg-white pixel-border-thin mb-2 overflow-hidden';
        faqItem.innerHTML = `
            <button class="faq-question w-full text-left px-4 py-3 font-pixel text-xs text-gray-800 hover:bg-[#EDE9FE] transition-colors flex items-center justify-between" data-index="${index}">
                <span>${item.q}</span>
                <span class="faq-arrow text-purple-500">▼</span>
            </button>
            <div class="faq-answer hidden px-4 py-3 bg-[#F7F5FF] border-t-2 border-[#C4B5F4]">
                <p class="font-mono text-lg text-gray-700 leading-relaxed">${item.a}</p>
            </div>
        `;
        faqList.appendChild(faqItem);
    });

    // FAQ accordion functionality
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const arrow = this.querySelector('.faq-arrow');
            const isOpen = !answer.classList.contains('hidden');

            if (isOpen) {
                answer.classList.add('hidden');
                arrow.textContent = '▼';
            } else {
                answer.classList.remove('hidden');
                arrow.textContent = '▲';
            }
        });
    });

    if (faqBtn) {
        faqBtn.addEventListener('click', () => {
            document.getElementById('faq-window').classList.remove('hidden');
            document.getElementById('faq-window').classList.add('flex');
        });
    }

    // Initialize About Window (2nd button - index 1)
    const aboutBtn = document.querySelectorAll('.nav-btn')[1];
    new FloatingWindow('about-window', null, 'about-close', 'about-titlebar');
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            document.getElementById('about-window').classList.remove('hidden');
            document.getElementById('about-window').classList.add('flex');
        });
    }

    // Character Creator Logic
    let currentCharacter = {
        hair: 'long',
        outfit: 'gym',
        expression: 'blank',
        accessory: 'none'
    };

    // Hair buttons
    document.querySelectorAll('.hair-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentCharacter.hair = this.dataset.hair;
            // Highlight active button with soft RPG style
            document.querySelectorAll('.hair-btn').forEach(b => {
                b.classList.remove('bg-[#7C3AED]', 'text-white');
                b.classList.add('bg-[#F7F5FF]', 'text-[#7C3AED]');
            });
            this.classList.remove('bg-[#F7F5FF]', 'text-[#7C3AED]');
            this.classList.add('bg-[#7C3AED]', 'text-white');
        });
    });

    // Outfit buttons
    document.querySelectorAll('.outfit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentCharacter.outfit = this.dataset.outfit;
            document.querySelectorAll('.outfit-btn').forEach(b => {
                b.classList.remove('bg-[#7C3AED]', 'text-white');
                b.classList.add('bg-[#F7F5FF]', 'text-[#7C3AED]');
            });
            this.classList.remove('bg-[#F7F5FF]', 'text-[#7C3AED]');
            this.classList.add('bg-[#7C3AED]', 'text-white');
        });
    });

    // Expression buttons
    document.querySelectorAll('.expr-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentCharacter.expression = this.dataset.expr;
            document.querySelectorAll('.expr-btn').forEach(b => {
                b.classList.remove('bg-[#7C3AED]', 'text-white');
                b.classList.add('bg-[#F7F5FF]', 'text-[#7C3AED]');
            });
            this.classList.remove('bg-[#F7F5FF]', 'text-[#7C3AED]');
            this.classList.add('bg-[#7C3AED]', 'text-white');
        });
    });

    // Accessory buttons
    document.querySelectorAll('.acc-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentCharacter.accessory = this.dataset.acc;
            document.querySelectorAll('.acc-btn').forEach(b => {
                b.classList.remove('bg-[#7C3AED]', 'text-white');
                b.classList.add('bg-[#F7F5FF]', 'text-[#7C3AED]');
            });
            this.classList.remove('bg-[#F7F5FF]', 'text-[#7C3AED]');
            this.classList.add('bg-[#7C3AED]', 'text-white');
        });
    });

    function updateCharacterPreview() {
        // Typewriter animation is static now - no need to update
        console.log('Character updated:', currentCharacter);
    }

    // RPG Typewriter Animation
    function typewriterEffect() {
        const text = 'pixel art in progress...';
        const element = document.getElementById('typewriter-text');
        let index = 0;

        function type() {
            if (index < text.length) {
                element.textContent = text.substring(0, index + 1);
                index++;
                setTimeout(type, 100); // Type one character every 100ms
            } else {
                // After typing is complete, wait 2 seconds then restart
                setTimeout(() => {
                    element.textContent = '';
                    index = 0;
                    setTimeout(type, 500); // Wait half a second before restarting
                }, 2000);
            }
        }

        type();
    }

    // Initialize with default selection (Soft RPG style)
    const longHairBtn = document.querySelector('.hair-btn[data-hair="long"]');
    if (longHairBtn) {
        longHairBtn.classList.remove('bg-[#F7F5FF]', 'text-[#7C3AED]');
        longHairBtn.classList.add('bg-[#7C3AED]', 'text-white');
    }

    const gymBtn = document.querySelector('.outfit-btn[data-outfit="gym"]');
    if (gymBtn) {
        gymBtn.classList.remove('bg-[#F7F5FF]', 'text-[#7C3AED]');
        gymBtn.classList.add('bg-[#7C3AED]', 'text-white');
    }

    const blankBtn = document.querySelector('.expr-btn[data-expr="blank"]');
    if (blankBtn) {
        blankBtn.classList.remove('bg-[#F7F5FF]', 'text-[#7C3AED]');
        blankBtn.classList.add('bg-[#7C3AED]', 'text-white');
    }

    const noneBtn = document.querySelector('.acc-btn[data-acc="none"]');
    if (noneBtn) {
        noneBtn.classList.remove('bg-[#F7F5FF]', 'text-[#7C3AED]');
        noneBtn.classList.add('bg-[#7C3AED]', 'text-white');
    }

    // Start typewriter animation
    typewriterEffect();

    // Easter Egg Hearts - handle click (not drag)
    const hearts = ['heart-red', 'heart-pink', 'heart-light'];
    const windows = ['ethan-window', 'people-window', 'family-window'];

    hearts.forEach((heartId, index) => {
        const heart = document.getElementById(heartId);
        let isDragging = false;

        heart.addEventListener('mousedown', () => {
            isDragging = false;
        });

        heart.addEventListener('mousemove', () => {
            isDragging = true;
        });

        heart.addEventListener('mouseup', () => {
            if (!isDragging) {
                // Only open window if not dragging
                document.getElementById(windows[index]).classList.remove('hidden');
                document.getElementById(windows[index]).classList.add('flex');
            }
        });
    });

    // Initialize Easter Egg Windows
    new FloatingWindow('ethan-window', null, null, 'ethan-titlebar');
    new FloatingWindow('people-window', null, null, 'people-titlebar');
    new FloatingWindow('family-window', null, null, 'family-titlebar');

    // Close buttons for Easter Egg windows
    document.querySelector('.ethan-close').addEventListener('click', () => {
        document.getElementById('ethan-window').classList.add('hidden');
        document.getElementById('ethan-window').classList.remove('flex');
    });

    document.querySelector('.people-close').addEventListener('click', () => {
        document.getElementById('people-window').classList.add('hidden');
        document.getElementById('people-window').classList.remove('flex');
    });

    document.querySelector('.family-close').addEventListener('click', () => {
        document.getElementById('family-window').classList.add('hidden');
        document.getElementById('family-window').classList.remove('flex');
    });
});

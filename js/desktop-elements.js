// Desktop Interactive Elements Handler
class DesktopElements {
    constructor() {
        this.elements = document.querySelectorAll('.desktop-element');
        this.draggedElement = null;
        this.offsetX = 0;
        this.offsetY = 0;

        // Initialize Howler.js sounds
        // Sound files live in assets/sounds/
        this.sounds = {
            mushroom: new Howl({
                src: ['assets/sounds/mushroom.wav'],
                volume: 0.5,
                onloaderror: () => console.log('Mushroom sound not found - using placeholder')
            }),
            star: new Howl({
                src: ['assets/sounds/star.wav'],
                volume: 0.5,
                onloaderror: () => console.log('Star sound not found - using placeholder')
            }),
            moon: new Howl({
                src: ['assets/sounds/moon.wav'],
                volume: 0.5,
                onloaderror: () => console.log('Moon sound not found - using placeholder')
            }),
            cloud: new Howl({
                src: ['assets/sounds/cloud.wav'],
                volume: 0.5,
                onloaderror: () => console.log('Cloud sound not found - using placeholder')
            }),
            butterfly: new Howl({
                src: ['assets/sounds/butterfly.wav'],
                volume: 0.5,
                onloaderror: () => console.log('Butterfly sound not found - using placeholder')
            }),
            sparkle: new Howl({
                src: ['assets/sounds/sparkle.wav'],
                volume: 0.5,
                onloaderror: () => console.log('Sparkle sound not found - using placeholder')
            }),
            heart: new Howl({
                src: ['assets/sounds/heart.wav'],
                volume: 0.5,
                onloaderror: () => console.log('Heart sound not found - using placeholder')
            }),
            flower: new Howl({
                src: ['assets/sounds/flower.wav'],
                volume: 0.5,
                onloaderror: () => console.log('Flower sound not found - using placeholder')
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
            // js/stormi.js listens for this to react when a sticker lands on Stormi
            document.dispatchEvent(new CustomEvent('sticker-drop', { detail: this.draggedElement }));
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

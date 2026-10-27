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

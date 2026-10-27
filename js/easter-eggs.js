// Easter Egg Hearts + their photo windows
function initEasterEggs() {
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
}

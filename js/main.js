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

    initFaq();

    // Initialize About Window (2nd button - index 1)
    const aboutBtn = document.querySelectorAll('.nav-btn')[1];
    new FloatingWindow('about-window', null, 'about-close', 'about-titlebar');
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            document.getElementById('about-window').classList.remove('hidden');
            document.getElementById('about-window').classList.add('flex');
        });
    }

    initScene();
    initCharacterCreator();
    initEasterEggs();
    initStormi();
    initWorks();
    loadSiteImages();
});

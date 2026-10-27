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
    { q: "what tools do you know?", a: "figma, html, css, js, tailwind, alpine.js, leaflet.js, react, and slowly adding more." },
    { q: "do you have experience with real projects?", a: "yes. homesure (live at homesure.site), gtrack, and trybe, my newest. check the work window." },
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

// FAQ window + accordion
function initFaq() {
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
}

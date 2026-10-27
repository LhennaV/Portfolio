// Work window: project list (featured + "more") and a case-study view.
// Projects come from Supabase (edited on admin.html); js/projects.js is the fallback.
function initWorks() {
    const container = document.getElementById('works');
    const scroller = container.parentElement;
    let list = projects;
    let viewingStudy = false;

    const tag = t => `<span class="px-3 py-1 bg-[#E9D5FF] text-purple-700 font-mono text-sm rounded-full pixel-border-thin">${t}</span>`;
    const linkBtn = l => `<a href="${l.url}" target="_blank" rel="noopener" class="inline-block font-mono text-base bg-[#9F7AEA] text-white px-4 py-2 pixel-button hover:bg-[#8B5CF6] transition-all duration-100">${l.label} ↗</a>`;

    function cover(p, height) {
        if (!p.cover) {
            return `<div class="w-full ${height} bg-[#EDE9FE] flex items-center justify-center pixel-border-thin mb-4">
                <span class="font-pixel text-xs text-[#7C3AED]">figma concept ✦</span>
            </div>`;
        }
        return `<div class="w-full ${height} bg-[#EDE9FE] pixel-border-thin mb-4 overflow-hidden">
            <img src="${p.cover}" alt="${p.title} screenshot" loading="lazy" class="w-full h-full object-cover object-top">
        </div>`;
    }

    function featuredCard(p) {
        return `<div class="bg-white p-4 pixel-border-thin">
            <button class="works-open block w-full text-left" data-id="${p.id}">
                ${cover(p, 'h-[200px]')}
            </button>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                <h3 class="font-pixel text-lg text-gray-800">${p.title}</h3>
                <span class="font-mono text-sm text-[#7C3AED]">✦ ${p.status}</span>
            </div>
            <p class="font-mono text-sm text-gray-600 mb-1">${p.role} · ${p.timeline}</p>
            <p class="font-mono text-base text-gray-700 mb-3 leading-relaxed">${p.summary}</p>
            <div class="flex flex-wrap gap-2 mb-4">${p.tags.map(tag).join('')}</div>
            <div class="flex flex-wrap gap-3">
                <button class="works-open font-mono text-base bg-[#7C3AED] text-white px-4 py-2 pixel-button hover:bg-[#6D28D9] transition-all duration-100" data-id="${p.id}">read case study</button>
                ${p.links.map(linkBtn).join('')}
            </div>
        </div>`;
    }

    function smallCard(p) {
        const hasStudy = Boolean(p.sections);
        return `<div class="bg-white p-4 pixel-border-thin flex flex-col">
            ${hasStudy ? `<button class="works-open block w-full text-left" data-id="${p.id}">${cover(p, 'h-[120px]')}</button>` : cover(p, 'h-[120px]')}
            <h3 class="font-pixel text-sm text-gray-800 mb-1">${p.title}</h3>
            <p class="font-mono text-sm text-gray-600 mb-2">${p.role}${p.timeline ? ' · ' + p.timeline : ''}</p>
            <p class="font-mono text-base text-gray-700 mb-3 leading-relaxed flex-1">${p.summary}</p>
            <div class="flex flex-wrap gap-2 mb-3">${p.tags.map(tag).join('')}</div>
            <div class="flex flex-wrap gap-3">
                ${hasStudy ? `<button class="works-open font-mono text-base bg-[#7C3AED] text-white px-4 py-2 pixel-button hover:bg-[#6D28D9] transition-all duration-100" data-id="${p.id}">case study</button>` : ''}
                ${p.links.map(linkBtn).join('')}
            </div>
        </div>`;
    }

    // filter: { heading, ids } shows only those projects (used by the customizer modes)
    let currentFilter = null;
    function showList(filter = null) {
        currentFilter = filter;
        viewingStudy = false;
        if (filter) {
            const picked = filter.ids.map(id => list.find(p => p.id === id)).filter(Boolean);
            container.innerHTML = `
                <p class="font-pixel text-xs text-[#7C3AED] mb-4">&gt; ${filter.heading.toUpperCase()}</p>
                <div class="grid grid-cols-1 gap-6 mb-6">${picked.map(featuredCard).join('')}</div>
                <button class="works-all font-pixel text-xs text-[#7C3AED] hover:underline">&gt; show all works</button>`;
            scroller.scrollTop = 0;
            return;
        }
        const featured = list.filter(p => p.featured);
        const more = list.filter(p => !p.featured);
        container.innerHTML = `
            <p class="font-pixel text-xs text-[#7C3AED] mb-4">&gt; FEATURED</p>
            <div class="grid grid-cols-1 gap-6 mb-10">${featured.map(featuredCard).join('')}</div>
            <p class="font-pixel text-xs text-[#7C3AED] mb-4">&gt; MORE</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${more.map(smallCard).join('')}</div>`;
        scroller.scrollTop = 0;
    }

    function showCaseStudy(id) {
        const p = list.find(x => x.id === id);
        if (!p) return showList();
        viewingStudy = true;

        const meta = [['role', p.role], ['team', p.team], ['timeline', p.timeline], ['status', p.status]]
            .filter(([, v]) => v)
            .map(([k, v]) => `<div><span class="font-pixel text-xs text-[#7C3AED]">${k.toUpperCase()}:</span> <span class="font-mono text-lg text-gray-700">${v}</span></div>`)
            .join('');

        const sections = (p.sections || []).map(s => `
            <h4 class="font-pixel text-xs text-[#7C3AED] mt-6 mb-3">&gt; ${s.title.toUpperCase()}</h4>
            <ul class="space-y-2">${s.points.map(pt => `<li class="font-mono text-lg text-gray-700 leading-snug flex gap-2"><span class="text-[#9F7AEA]">✦</span><span>${pt}</span></li>`).join('')}</ul>`).join('');

        const phones = (p.gallery || []).filter(g => g.phone);
        const wide = (p.gallery || []).filter(g => !g.phone);
        const figure = g => `<figure>
            <img src="${g.src}" alt="${p.title}: ${g.caption}" loading="lazy" class="w-full pixel-border-thin bg-white">
            <figcaption class="font-mono text-sm text-gray-500 mt-1 text-center">${g.caption}</figcaption>
        </figure>`;

        container.innerHTML = `
            <button class="works-back font-pixel text-xs text-[#7C3AED] hover:underline mb-5">&lt; back to works</button>
            <h3 class="font-pixel text-xl text-gray-800 mb-2">${p.title}</h3>
            <p class="font-mono text-xl text-gray-600 mb-4">${p.tagline}</p>
            ${cover(p, 'h-[260px]')}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 bg-white p-4 pixel-border-thin mb-4">${meta}</div>
            <div class="flex flex-wrap gap-2 mb-4">${p.tags.map(tag).join('')}</div>
            <h4 class="font-pixel text-xs text-[#7C3AED] mt-6 mb-3">&gt; THE PROBLEM</h4>
            <p class="font-mono text-lg text-gray-700 leading-snug">${p.problem}</p>
            ${sections}
            ${p.stack ? `<h4 class="font-pixel text-xs text-[#7C3AED] mt-6 mb-3">&gt; TECH</h4><p class="font-mono text-lg text-gray-700 leading-snug">${p.stack}</p>` : ''}
            ${phones.length ? `<h4 class="font-pixel text-xs text-[#7C3AED] mt-8 mb-3">&gt; SCREENS</h4><div class="grid grid-cols-2 sm:grid-cols-3 gap-4">${phones.map(figure).join('')}</div>` : ''}
            ${wide.length ? `<div class="grid grid-cols-1 gap-4 ${phones.length ? 'mt-4' : 'mt-8'}">${wide.map(figure).join('')}</div>` : ''}
            <div class="flex flex-wrap gap-3 mt-8">${p.links.map(linkBtn).join('')}</div>
            <button class="works-back font-pixel text-xs text-[#7C3AED] hover:underline mt-8 block">&lt; back to works</button>`;
        scroller.scrollTop = 0;
    }

    container.addEventListener('click', e => {
        const open = e.target.closest('.works-open');
        if (open) return showCaseStudy(open.dataset.id);
        if (e.target.closest('.works-back')) showList(currentFilter);
        if (e.target.closest('.works-all')) showList();
    });

    // Open the Work window from elsewhere on the page, optionally filtered
    window.openWorks = (filter = null) => {
        const workWindow = document.getElementById('work-window');
        workWindow.classList.remove('hidden');
        workWindow.classList.add('flex');
        showList(filter);
    };

    // The navbar Work button and the intro button always show every project
    document.querySelectorAll('.nav-btn:first-child, [data-open="work-window"]').forEach(btn => {
        btn.addEventListener('click', () => showList());
    });

    showList();

    // Swap in the database version once it loads (unless a case study is already open)
    loadProjects().then(data => {
        if (!data) return;
        list = data;
        if (!viewingStudy) showList(currentFilter);
    });
}

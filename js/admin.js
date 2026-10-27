// Admin page: edit projects, site images, and guestbook in Supabase.
// Only Lhenna's account can save; the database rules (supabase/schema.sql) enforce it.
const ADMIN_EMAIL = 'vlhennamariii@gmail.com';
const BUCKET = 'portfolio';

const $ = id => document.getElementById(id);
// Escape text for HTML, including inside attribute quotes
const esc = text => String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function setStatus(message, isError = false) {
    const el = $('status');
    el.textContent = message;
    el.className = 'text-lg mb-4 min-h-[1.5rem] ' + (isError ? 'text-red-600' : 'text-[#7C3AED]');
}

// ─── Login ────────────────────────────────────────────────
async function showSession() {
    const { data: { session } } = await sb.auth.getSession();
    const email = session && session.user.email;
    $('login-view').hidden = Boolean(email);
    $('admin-view').hidden = !email;
    $('session').hidden = !email;
    if (!email) return;

    $('session-email').textContent = email;
    if (email !== ADMIN_EMAIL) {
        setStatus('this account can view, but saving is only allowed for ' + ADMIN_EMAIL, true);
    }
    openTab('projects');
}

$('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    setStatus('logging in...');
    const { error } = await sb.auth.signInWithPassword({
        email: $('login-email').value.trim(),
        password: $('login-password').value
    });
    if (error) return setStatus(error.message, true);
    setStatus('');
    showSession();
});

$('logout').addEventListener('click', async () => {
    await sb.auth.signOut();
    setStatus('logged out');
    showSession();
});

// ─── Tabs ─────────────────────────────────────────────────
const TABS = { projects: renderProjects, images: renderSiteImages, guestbook: renderGuestbook };

function openTab(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('tab-on', t.dataset.tab === name));
    document.querySelectorAll('.tab-panel').forEach(p => { p.hidden = p.id !== 'tab-' + name; });
    TABS[name]();
}

document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => openTab(t.dataset.tab)));

// ─── Uploads ──────────────────────────────────────────────
async function uploadImage(file, folder) {
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
    const path = `${folder}/${Date.now()}-${safeName}`;
    const { error } = await sb.storage.from(BUCKET).upload(path, file, { cacheControl: '31536000' });
    if (error) throw error;
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// ─── Projects: list ───────────────────────────────────────
let projectRows = [];

async function renderProjects() {
    const panel = $('tab-projects');
    panel.innerHTML = '<p class="text-lg text-gray-500">loading projects...</p>';
    const { data, error } = await sb.from('projects').select('*').order('sort_order');
    if (error) return setStatus(error.message, true);
    projectRows = data;

    panel.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h2 class="font-pixel text-xs text-[#7C3AED]">&gt; PROJECTS</h2>
            <button id="new-project" class="btn btn-main pixel-button">+ new project</button>
        </div>
        <p class="text-lg text-gray-500 mb-4">featured = big card on top. hidden = not shown on the site. use ▲ ▼ to change the order.</p>
        <div class="space-y-3">
            ${data.map((p, i) => `
                <div class="bg-white p-3 pixel-border-thin flex flex-wrap items-center gap-3">
                    <div class="flex flex-col">
                        <button class="move text-[#7C3AED] leading-none" data-i="${i}" data-dir="-1" aria-label="move up" ${i === 0 ? 'disabled' : ''}>▲</button>
                        <button class="move text-[#7C3AED] leading-none" data-i="${i}" data-dir="1" aria-label="move down" ${i === data.length - 1 ? 'disabled' : ''}>▼</button>
                    </div>
                    ${p.cover_url ? `<img src="${esc(p.cover_url)}" alt="" class="w-20 h-12 object-cover object-top pixel-border-thin">` : '<div class="w-20 h-12 bg-[#EDE9FE] pixel-border-thin"></div>'}
                    <div class="flex-1 min-w-[10rem]">
                        <p class="font-pixel text-xs">${esc(p.title)}</p>
                        <p class="text-base text-gray-500">${p.featured ? '★ featured' : 'more row'}${p.published ? '' : ' · hidden'}</p>
                    </div>
                    <button class="edit btn pixel-button" data-id="${esc(p.id)}">edit</button>
                </div>`).join('')}
        </div>`;

    $('new-project').addEventListener('click', () => editProject(null));
    panel.querySelectorAll('.edit').forEach(b => b.addEventListener('click', () => editProject(b.dataset.id)));
    panel.querySelectorAll('.move').forEach(b => b.addEventListener('click', () => moveProject(+b.dataset.i, +b.dataset.dir)));
}

async function moveProject(i, dir) {
    const a = projectRows[i], b = projectRows[i + dir];
    if (!a || !b) return;
    // Renumber everything in steps of 10 so swaps always work
    const order = projectRows.map(p => p.id);
    [order[i], order[i + dir]] = [order[i + dir], order[i]];
    const updates = order.map((id, k) => sb.from('projects').update({ sort_order: (k + 1) * 10 }).eq('id', id));
    const results = await Promise.all(updates);
    const failed = results.find(r => r.error);
    if (failed) return setStatus(failed.error.message, true);
    setStatus('order saved ✓');
    renderProjects();
}

// ─── Projects: editor ─────────────────────────────────────
// sections are typed as:  ## heading  then  - point  lines
const sectionsToText = sections => (sections || [])
    .map(s => `## ${s.title}\n` + s.points.map(pt => `- ${pt}`).join('\n'))
    .join('\n\n');

function textToSections(text) {
    const sections = [];
    text.split('\n').forEach(line => {
        const l = line.trim();
        if (l.startsWith('##')) sections.push({ title: l.replace(/^#+\s*/, ''), points: [] });
        else if (l.startsWith('-') && sections.length) sections[sections.length - 1].points.push(l.replace(/^-\s*/, ''));
    });
    return sections.filter(s => s.title);
}

// links are typed as:  label | url
const linksToText = links => (links || []).map(l => `${l.label} | ${l.url}`).join('\n');
const textToLinks = text => text.split('\n')
    .map(l => l.split('|').map(x => x.trim()))
    .filter(([label, url]) => label && url)
    .map(([label, url]) => ({ label, url }));

let gallery = [];

async function editProject(id) {
    let p = { id: '', featured: false, published: true, tags: [], sections: [], links: [] };
    gallery = [];
    if (id) {
        const { data, error } = await sb.from('projects').select('*, project_images(*)').eq('id', id).single();
        if (error) return setStatus(error.message, true);
        p = data;
        gallery = (data.project_images || []).sort((a, b) => a.sort_order - b.sort_order)
            .map(img => ({ url: img.url, caption: img.caption || '', phone: img.phone }));
    }

    const panel = $('tab-projects');
    const field = (key, label, value, hint = '') => `
        <label class="label" for="f-${key}">${label}</label>
        <input id="f-${key}" class="field" value="${esc(value)}">
        ${hint ? `<p class="text-base text-gray-500 mt-1">${hint}</p>` : ''}`;
    const area = (key, label, value, rows, hint = '') => `
        <label class="label" for="f-${key}">${label}</label>
        <textarea id="f-${key}" class="field" rows="${rows}">${esc(value)}</textarea>
        ${hint ? `<p class="text-base text-gray-500 mt-1">${hint}</p>` : ''}`;

    panel.innerHTML = `
        <button id="back" class="font-pixel text-xs text-[#7C3AED] hover:underline mb-4">&lt; all projects</button>
        <div class="bg-white p-5 pixel-border-thin">
            <h2 class="font-pixel text-xs text-[#7C3AED]">&gt; ${id ? 'EDIT ' + esc(p.title).toUpperCase() : 'NEW PROJECT'}</h2>

            ${id ? '' : field('id', 'ID', '', 'short name used in links, lowercase with dashes, e.g. "my-app". can\'t be changed later.')}
            ${field('title', 'TITLE', p.title || '')}
            ${field('tagline', 'TAGLINE', p.tagline || '', 'one line under the title')}
            ${area('summary', 'SUMMARY', p.summary || '', 3, 'shown on the card')}
            <div class="grid sm:grid-cols-2 gap-x-4">
                <div>${field('role', 'ROLE', p.role || '')}</div>
                <div>${field('team', 'TEAM', p.team || '')}</div>
                <div>${field('timeline', 'TIMELINE', p.timeline || '')}</div>
                <div>${field('status', 'STATUS', p.status || '')}</div>
            </div>
            ${field('tags', 'TAGS', (p.tags || []).join(', '), 'separate with commas')}
            <div class="flex flex-wrap gap-6 mt-4 text-lg">
                <label><input type="checkbox" id="f-featured" ${p.featured ? 'checked' : ''}> featured (big card on top)</label>
                <label><input type="checkbox" id="f-published" ${p.published ? 'checked' : ''}> show on the site</label>
            </div>

            <label class="label">COVER IMAGE</label>
            <div class="flex flex-wrap items-center gap-3">
                <img id="cover-preview" src="${esc(p.cover_url || '')}" alt="" class="w-40 h-24 object-cover object-top pixel-border-thin bg-[#EDE9FE]" ${p.cover_url ? '' : 'hidden'}>
                <label class="btn btn-light pixel-button cursor-pointer">upload cover<input type="file" id="cover-file" accept="image/*" hidden></label>
            </div>
            <input id="f-cover_url" type="hidden" value="${esc(p.cover_url || '')}">

            <p class="font-pixel text-xs text-[#7C3AED] mt-8">&gt; CASE STUDY</p>
            <p class="text-base text-gray-500">leave these empty for a small card without a case study</p>
            ${area('problem', 'THE PROBLEM', p.problem || '', 3)}
            ${area('sections', 'SECTIONS', sectionsToText(p.sections), 10, 'start a section with "## heading", then one "- point" per line')}
            ${area('stack', 'TECH', p.stack || '', 2)}
            ${area('links', 'LINKS', linksToText(p.links), 3, 'one per line: label | url')}

            <label class="label">SCREENSHOTS</label>
            <div id="gallery" class="space-y-2"></div>
            <label class="btn btn-light pixel-button cursor-pointer inline-block mt-3">+ upload screenshots<input type="file" id="gallery-files" accept="image/*" multiple hidden></label>

            <div class="flex flex-wrap gap-3 mt-8">
                <button id="save" class="btn btn-main pixel-button">save</button>
                ${id ? '<button id="delete" class="btn btn-danger pixel-button">delete project</button>' : ''}
            </div>
        </div>`;

    renderGallery();

    $('back').addEventListener('click', renderProjects);
    $('cover-file').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        setStatus('uploading cover...');
        try {
            const url = await uploadImage(file, 'projects/' + (id || 'new'));
            $('f-cover_url').value = url;
            $('cover-preview').src = url;
            $('cover-preview').hidden = false;
            setStatus('cover uploaded. click save to keep it.');
        } catch (err) { setStatus(err.message, true); }
    });
    $('gallery-files').addEventListener('change', async e => {
        const files = [...e.target.files];
        for (const [n, file] of files.entries()) {
            setStatus(`uploading ${n + 1} of ${files.length}...`);
            try {
                const url = await uploadImage(file, 'projects/' + (id || 'new'));
                const img = new Image();
                img.src = url;
                await img.decode().catch(() => {});
                gallery.push({ url, caption: '', phone: img.naturalHeight > img.naturalWidth });
            } catch (err) { return setStatus(err.message, true); }
        }
        renderGallery();
        setStatus('uploaded. add captions, then click save.');
    });
    $('save').addEventListener('click', () => saveProject(id));
    if (id) $('delete').addEventListener('click', () => deleteProject(id, p.title));
}

function renderGallery() {
    const box = $('gallery');
    if (!gallery.length) {
        box.innerHTML = '<p class="text-base text-gray-500">no screenshots yet</p>';
        return;
    }
    box.innerHTML = gallery.map((g, i) => `
        <div class="flex flex-wrap items-center gap-3 bg-[#F7F5FF] p-2 pixel-border-thin">
            <img src="${esc(g.url)}" alt="" class="w-14 h-14 object-cover object-top">
            <input class="field flex-1 min-w-[8rem] g-caption" data-i="${i}" value="${esc(g.caption)}" placeholder="caption">
            <label class="text-base"><input type="checkbox" class="g-phone" data-i="${i}" ${g.phone ? 'checked' : ''}> phone</label>
            <button class="g-move text-[#7C3AED]" data-i="${i}" data-dir="-1" aria-label="move up">▲</button>
            <button class="g-move text-[#7C3AED]" data-i="${i}" data-dir="1" aria-label="move down">▼</button>
            <button class="g-remove btn btn-danger pixel-button" data-i="${i}">remove</button>
        </div>`).join('');
    box.querySelectorAll('.g-caption').forEach(el => el.addEventListener('input', () => { gallery[el.dataset.i].caption = el.value; }));
    box.querySelectorAll('.g-phone').forEach(el => el.addEventListener('change', () => { gallery[el.dataset.i].phone = el.checked; }));
    box.querySelectorAll('.g-move').forEach(el => el.addEventListener('click', () => {
        const i = +el.dataset.i, j = i + +el.dataset.dir;
        if (j < 0 || j >= gallery.length) return;
        [gallery[i], gallery[j]] = [gallery[j], gallery[i]];
        renderGallery();
    }));
    box.querySelectorAll('.g-remove').forEach(el => el.addEventListener('click', () => {
        gallery.splice(+el.dataset.i, 1);
        renderGallery();
    }));
}

async function saveProject(existingId) {
    const v = key => $('f-' + key).value.trim();
    const id = existingId || v('id').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
    if (!id) return setStatus('add an id first', true);
    if (!v('title')) return setStatus('add a title first', true);

    const row = {
        id,
        title: v('title'),
        tagline: v('tagline') || null,
        summary: v('summary') || null,
        role: v('role') || null,
        team: v('team') || null,
        timeline: v('timeline') || null,
        status: v('status') || null,
        tags: v('tags').split(',').map(t => t.trim()).filter(Boolean),
        featured: $('f-featured').checked,
        published: $('f-published').checked,
        cover_url: v('cover_url') || null,
        problem: v('problem') || null,
        sections: textToSections($('f-sections').value),
        stack: v('stack') || null,
        links: textToLinks($('f-links').value),
        updated_at: new Date().toISOString()
    };
    if (!existingId) {
        const last = projectRows[projectRows.length - 1];
        row.sort_order = last ? last.sort_order + 10 : 10;
    }

    setStatus('saving...');
    const { error } = await sb.from('projects').upsert(row);
    if (error) return setStatus(error.message, true);

    // Replace the screenshot list with what's on screen
    const del = await sb.from('project_images').delete().eq('project_id', id);
    if (del.error) return setStatus(del.error.message, true);
    if (gallery.length) {
        const ins = await sb.from('project_images').insert(gallery.map((g, k) => ({
            project_id: id, url: g.url, caption: g.caption || null, phone: g.phone, sort_order: (k + 1) * 10
        })));
        if (ins.error) return setStatus(ins.error.message, true);
    }
    setStatus(`saved ${row.title} ✓`);
    renderProjects();
}

async function deleteProject(id, title) {
    if (!confirm(`delete "${title}"? this can't be undone. (tip: uncheck "show on the site" to hide it instead)`)) return;
    const { error } = await sb.from('projects').delete().eq('id', id);
    if (error) return setStatus(error.message, true);
    setStatus(`deleted ${title}`);
    renderProjects();
}

// ─── Site images ──────────────────────────────────────────
const IMAGE_SLOTS = {
    'about-me': 'about window: "who i am" photo',
    'about-stormi': 'about window: "the real me" photo',
    'about-minecraft': 'about window: "where i\'m going" photo'
};

async function renderSiteImages() {
    const panel = $('tab-images');
    panel.innerHTML = '<p class="text-lg text-gray-500">loading images...</p>';
    const { data, error } = await sb.from('site_images').select('*');
    if (error) return setStatus(error.message, true);
    const byKey = Object.fromEntries(data.map(r => [r.key, r]));

    panel.innerHTML = `
        <h2 class="font-pixel text-xs text-[#7C3AED] mb-2">&gt; SITE IMAGES</h2>
        <p class="text-lg text-gray-500 mb-4">replace a photo and it changes on the site right away.</p>
        <div class="grid sm:grid-cols-3 gap-4">
            ${Object.entries(IMAGE_SLOTS).map(([key, label]) => {
                const row = byKey[key];
                return `<div class="bg-white p-3 pixel-border-thin">
                    <div class="w-full aspect-[3/4] bg-[#EDE9FE] pixel-border-thin overflow-hidden mb-2">
                        ${row ? `<img src="${esc(row.url)}" alt="" class="w-full h-full object-cover">` : ''}
                    </div>
                    <p class="text-base text-gray-600 mb-2">${label}</p>
                    <input class="field mb-2 alt" data-key="${key}" value="${esc(row ? row.alt : '')}" placeholder="description (alt text)">
                    <label class="btn btn-light pixel-button cursor-pointer inline-block">replace photo<input type="file" class="slot-file" data-key="${key}" accept="image/*" hidden></label>
                </div>`;
            }).join('')}
        </div>`;

    panel.querySelectorAll('.slot-file').forEach(input => input.addEventListener('change', async () => {
        const file = input.files[0];
        if (!file) return;
        const key = input.dataset.key;
        setStatus('uploading...');
        try {
            const url = await uploadImage(file, 'site');
            const alt = panel.querySelector(`.alt[data-key="${key}"]`).value.trim() || null;
            const { error: err } = await sb.from('site_images').upsert({ key, url, alt, updated_at: new Date().toISOString() });
            if (err) throw err;
            setStatus('photo replaced ✓');
            renderSiteImages();
        } catch (err) { setStatus(err.message, true); }
    }));
    panel.querySelectorAll('.alt').forEach(input => input.addEventListener('change', async () => {
        const key = input.dataset.key;
        if (!byKey[key]) return;
        const { error: err } = await sb.from('site_images').update({ alt: input.value.trim() || null }).eq('key', key);
        setStatus(err ? err.message : 'description saved ✓', Boolean(err));
    }));
}

// ─── Guestbook moderation ─────────────────────────────────
async function renderGuestbook() {
    const panel = $('tab-guestbook');
    panel.innerHTML = '<p class="text-lg text-gray-500">loading messages...</p>';
    const { data, error } = await sb.from('guestbook').select('*').order('created_at', { ascending: false });
    if (error) return setStatus(error.message, true);

    panel.innerHTML = `
        <h2 class="font-pixel text-xs text-[#7C3AED] mb-2">&gt; GUESTBOOK (${data.length})</h2>
        <p class="text-lg text-gray-500 mb-4">the site shows the latest 10. delete spam or anything mean here.</p>
        <div class="space-y-2">
            ${data.map(m => `
                <div class="bg-white p-3 pixel-border-thin flex items-start gap-3">
                    <div class="flex-1">
                        <p class="text-lg"><b>${esc(m.name)}</b> <span class="text-gray-400 text-base">${new Date(m.created_at).toLocaleString()}</span></p>
                        <p class="text-lg text-gray-700">${esc(m.message)}</p>
                    </div>
                    <button class="gb-delete btn btn-danger pixel-button" data-id="${m.id}">delete</button>
                </div>`).join('')}
        </div>`;

    panel.querySelectorAll('.gb-delete').forEach(b => b.addEventListener('click', async () => {
        if (!confirm('delete this message?')) return;
        const { error: err } = await sb.from('guestbook').delete().eq('id', b.dataset.id);
        if (err) return setStatus(err.message, true);
        setStatus('message deleted');
        renderGuestbook();
    }));
}

// ─── Start ────────────────────────────────────────────────
if (!sb) {
    setStatus('could not load supabase. check your internet connection.', true);
} else {
    showSession();
}

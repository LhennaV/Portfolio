// Supabase: database for projects, site images, and the guestbook.
// The anon key is meant to be public; Row Level Security (supabase/schema.sql)
// makes sure visitors can only read, and only add guestbook messages.
const SUPABASE_URL = 'https://aazwazoxxfiazognvjtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhendhem94eGZpYXpvZ252anR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMDQxODQsImV4cCI6MjEwODY4MDE4NH0.jvRM6iZnagnBJ6-7NNSy1-QzowBhZf1Jdipajy9E9JM';

const sb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Projects from the database, in the same shape as js/projects.js.
// Returns null if Supabase is unreachable or empty, so the site falls back to js/projects.js.
async function loadProjects() {
    if (!sb) return null;
    const { data, error } = await sb
        .from('projects')
        .select('*, project_images(*)')
        .order('sort_order');
    if (error || !data || !data.length) {
        if (error) console.log('Using built-in projects:', error.message);
        return null;
    }
    return data.map(p => ({
        id: p.id,
        featured: p.featured,
        title: p.title,
        tagline: p.tagline,
        summary: p.summary,
        cover: p.cover_url,
        role: p.role,
        team: p.team,
        timeline: p.timeline,
        status: p.status,
        tags: p.tags || [],
        problem: p.problem,
        sections: p.sections && p.sections.length ? p.sections : null,
        stack: p.stack,
        links: p.links || [],
        gallery: (p.project_images || [])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(img => ({ src: img.url, caption: img.caption, phone: img.phone }))
    }));
}

// Swap in images managed from the admin page: <img data-site-image="about-me">
async function loadSiteImages() {
    if (!sb) return;
    const { data, error } = await sb.from('site_images').select('key, url, alt');
    if (error || !data) return;
    data.forEach(({ key, url, alt }) => {
        document.querySelectorAll(`img[data-site-image="${key}"]`).forEach(img => {
            img.src = url;
            if (alt) img.alt = alt;
        });
    });
}

// Guestbook storage, used by js/guestbook.js
window.guestbookDB = sb && {
    async addEntry(name, message) {
        const { error } = await sb.from('guestbook').insert({ name, message });
        if (error) {
            console.error('Error adding entry:', error);
            return { success: false, error: error.message };
        }
        return { success: true };
    },

    // Latest 10 messages, refreshed live whenever someone signs
    listenToEntries(callback) {
        const refresh = async () => {
            const { data, error } = await sb
                .from('guestbook')
                .select('id, name, message, created_at')
                .order('created_at', { ascending: false })
                .limit(10);
            if (error) {
                console.error('Error loading guestbook:', error);
                return;
            }
            callback(data.map(e => ({ id: e.id, name: e.name, message: e.message, timestamp: new Date(e.created_at) })));
        };
        refresh();
        sb.channel('guestbook')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guestbook' }, refresh)
            .subscribe();
    }
};

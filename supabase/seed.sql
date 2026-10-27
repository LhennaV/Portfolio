-- Starter content: current projects, About photos, and guestbook messages copied from Firebase.
-- Run AFTER schema.sql (Supabase → SQL Editor). Safe to re-run: it skips rows that already exist.

insert into public.projects (id, sort_order, featured, title, tagline, summary, cover_url, role, team, timeline, status, tags, problem, sections, stack, links)
values ('trybe', 10, true, 'Trybe', 'curiosity killed the cat. trybe brought it back.', 'a mobile-first app for trading the hobby gear you no longer use for gear for the next hobby you want to try.', 'assets/images/projects/trybe/desktop-feed.png', 'product design + frontend', '2-person team (with Tristan Reboredo on backend)', 'oct 2026 – ongoing', 'in development · prototype complete', array['UI/UX', 'Figma', 'Mobile-first', 'Next.js', 'TypeScript', 'Supabase']::text[], 'people pick up hobbies, buy the gear, then move on, so the tools sit in a cabinet losing value. meanwhile, trying something new means buying fresh equipment that might not pay off. trybe lets people swap what they no longer use for what they need next.', '[{"title":"what i designed","points":["a pinterest-style discovery feed, browsable by hobby category, where every post clearly shows if its gear is \"up for trade\" or just for inspiration","the full trade flow: propose an item-for-item swap, balance an uneven trade with cash or an extra item, and counter-offer inside the chat","trust and safety built into the flow: ratings, trade history, account age, a \"new trader\" badge, safe public meetup spots, and an inspect-before-you-swap checklist","cancel, block, and report flows, plus edge cases, across 9 flows on both mobile and desktop"]},{"title":"research that shaped it","points":["carousell: sellers pre-set trade markups like \"trades+5\", which became trybe''s \"looking for\" field","depop: buyers check review count, rating, and account age first, so every trybe profile shows all three","facebook marketplace: safe exchange zones and inspection reminders became part of the meetup step"]},{"title":"accessibility","points":["light, dark, and high-contrast versions of every theme","a custom logo concept, brand colors, and a consistent phosphor icon set"]}]'::jsonb, 'planned build: next.js, typescript, tailwind css, supabase (auth, database, realtime chat), vercel, installable as a pwa.', '[{"label":"figma prototype","url":"https://www.figma.com/design/yR5GCWiMt5l1xueLRZGW6o/Trybe"},{"label":"github","url":"https://github.com/LhennaV/Trybe"}]'::jsonb)
on conflict (id) do nothing;

insert into public.project_images (project_id, url, caption, phone, sort_order)
select * from (values
    ('trybe', 'assets/images/projects/trybe/mobile-feed.png', 'discovery feed', true, 10),
    ('trybe', 'assets/images/projects/trybe/mobile-post.png', 'post + tools up for trade', true, 20),
    ('trybe', 'assets/images/projects/trybe/mobile-propose.png', 'propose a trade', true, 30),
    ('trybe', 'assets/images/projects/trybe/mobile-chat.png', 'counter-offer chat', true, 40),
    ('trybe', 'assets/images/projects/trybe/mobile-meetup.png', 'safe meetup checklist', true, 50),
    ('trybe', 'assets/images/projects/trybe/mobile-profile.png', 'trust signals on profiles', true, 60),
    ('trybe', 'assets/images/projects/trybe/themes-dark.png', 'dark theme', false, 70)
) as v(project_id, url, caption, phone, sort_order)
where not exists (select 1 from public.project_images where project_id = 'trybe');

insert into public.projects (id, sort_order, featured, title, tagline, summary, cover_url, role, team, timeline, status, tags, problem, sections, stack, links)
values ('homesure', 20, true, 'HomeSure', 'verified housing rental and listing system with demand analytics', 'a property platform for sta. maria, bulacan that fights rental fraud and low-quality listings, with an interactive barangay map.', 'assets/images/projects/homesure/home.png', 'design + frontend dev', 'capstone project, group', 'jan 2025 – ongoing', 'live', array['Figma', 'HTML', 'CSS', 'JavaScript', 'Leaflet.js']::text[], 'online property search is full of fake listings and unverified sellers, which makes renting risky. homesure only shows listings from verified owners, so renters can trust what they see.', '[{"title":"what we built","points":["property listing management with seller verification","separate account flows for renters and landlords","search and filtering by location and price","demand analytics for tracking rental trends","a barangay-level map built with leaflet.js, so renters can explore listings by area"]}]'::jsonb, 'built with html, css, and javascript, with leaflet.js for the map overlays. designed in figma.', '[{"label":"visit homesure.site","url":"https://homesure.site"}]'::jsonb)
on conflict (id) do nothing;

insert into public.project_images (project_id, url, caption, phone, sort_order)
select * from (values
    ('homesure', 'assets/images/projects/homesure/home.png', 'landing page with the sta. maria barangay map', false, 10)
) as v(project_id, url, caption, phone, sort_order)
where not exists (select 1 from public.project_images where project_id = 'homesure');

insert into public.projects (id, sort_order, featured, title, tagline, summary, cover_url, role, team, timeline, status, tags, problem, sections, stack, links)
values ('gtrack', 30, true, 'GTrack', 'gcash transaction management', 'a digital audit log for gcash cash-in and cash-out businesses. built with love for someone special.', 'assets/images/projects/GTrack Photo.png', 'ui/ux design + frontend lead', '2-person team', 'apr 2025 – ongoing', 'in development', array['Figma', 'Blade', 'Tailwind CSS', 'Alpine.js']::text[], 'gcash outlets track cash-in, cash-out, and fees by hand, which makes end-of-day totals slow and error-prone.', '[{"title":"what i did","points":["designed the ui/ux in figma: user flows, wireframes, layouts, and interactive prototypes","led frontend development, turning the designs into responsive interfaces","kept the interface simple for fast cash-in/cash-out logging, service charge tracking, balance monitoring, and end-of-day reports"]}]'::jsonb, 'frontend built with laravel blade, tailwind css, and alpine.js.', '[{"label":"figma","url":"https://www.figma.com/design/csy0D8GyqELHmkDRXk7Hzu/GTrack?node-id=0-1&p=f&t=uMm2HpgYmXsKXbHC-0"}]'::jsonb)
on conflict (id) do nothing;

insert into public.project_images (project_id, url, caption, phone, sort_order)
select * from (values
    ('gtrack', 'assets/images/projects/GTrack Photo.png', 'gtrack interface', false, 10)
) as v(project_id, url, caption, phone, sort_order)
where not exists (select 1 from public.project_images where project_id = 'gtrack');

insert into public.projects (id, sort_order, featured, title, tagline, summary, cover_url, role, team, timeline, status, tags, problem, sections, stack, links)
values ('mindease', 40, false, 'MindEase', 'a gentle mental wellness app concept', 'journaling, emoji mood tracking with weekly/monthly graphs, an ai chat companion, a breathing button that breathes with you, and quick access to crisis hotlines.', 'assets/images/projects/mindease/home.png', 'ui/ux design', 'personal project', 'jan – feb 2025', 'figma prototype', array['UI/UX', 'Figma', 'Mobile', 'Web']::text[], 'checking in with your feelings is easy to skip when the tools feel clinical. mindease is a soft, low-pressure space for daily emotional support.', '[{"title":"what i designed","points":["a quick daily check-in: pick an emoji mood and add an optional note","a journal with text notes, tags, and voice notes","weekly and monthly insights that turn moods into graphs you can export","an ai chat companion with a supportive, conversational tone","a calm space with a breathing button that breathes with you, plus daily affirmations","crisis support with direct access to mental health hotlines"]}]'::jsonb, null, '[{"label":"figma","url":"https://www.figma.com/design/rMXThOw1lLauXQK3CGvAlk/MindEase?node-id=0-1&t=cjrfuSESobvWZFjw-1"}]'::jsonb)
on conflict (id) do nothing;

insert into public.project_images (project_id, url, caption, phone, sort_order)
select * from (values
    ('mindease', 'assets/images/projects/mindease/home.png', 'home + daily check-in', true, 10),
    ('mindease', 'assets/images/projects/mindease/journal.png', 'journal', true, 20),
    ('mindease', 'assets/images/projects/mindease/insights.png', 'weekly insights', true, 30),
    ('mindease', 'assets/images/projects/mindease/ai-chat.png', 'ai chat companion', true, 40),
    ('mindease', 'assets/images/projects/mindease/calm-space.png', 'calm space', true, 50)
) as v(project_id, url, caption, phone, sort_order)
where not exists (select 1 from public.project_images where project_id = 'mindease');

insert into public.projects (id, sort_order, featured, title, tagline, summary, cover_url, role, team, timeline, status, tags, problem, sections, stack, links)
values ('eduspace', 50, false, 'EduSpace', 'room scheduling system', 'a room scheduling system designed to make booking and managing educational spaces simple and stress-free.', 'assets/images/projects/EduSpace Photo.png', 'ui/ux design', null, null, null, array['UI/UX', 'Figma']::text[], null, '[]'::jsonb, null, '[{"label":"figma","url":"https://www.figma.com/design/ZrjQ19shEBsHez8wsHeyRh/EduSpace?node-id=95-408&t=uMm2HpgYmXsKXbHC-0"}]'::jsonb)
on conflict (id) do nothing;

insert into public.site_images (key, url, alt) values
    ('about-me', 'assets/images/me/my picture.png', 'Lhenna'),
    ('about-stormi', 'assets/images/stormi/pic of stormi.png', 'Stormi'),
    ('about-minecraft', 'assets/images/misc/minecraft.png', 'Minecraft')
on conflict (key) do nothing;

-- Guestbook messages copied from Firebase
insert into public.guestbook (name, message, created_at)
select * from (values
    ('LILI', 'hi lhenna, this is your bestie eli......... you know that i always just here for you no matter what happen okay??me and althia are your protectorrrrr', '2026-06-10T06:56:22.396Z'::timestamptz),
    ('chenna cute roblox gods not noob just pro', 'galingggg 🌝💛', '2026-06-15T11:56:08.766Z'::timestamptz),
    ('Althia', 'hi bes :))', '2026-06-10T07:22:15.019Z'::timestamptz),
    ('ur pretty bestie :))', 'hi bes…
i miss you both so much when life feels a little bit heavier. you guys are my pahinga, my constant (hope u guys knew that) i love u both so much!! mwa mwa chup chup 😙', '2026-06-10T07:34:15.876Z'::timestamptz),
    ('meow', 'i love the style', '2026-06-09T20:30:08.537Z'::timestamptz),
    ('meow', 'meow meow', '2026-07-12T17:36:12.792Z'::timestamptz),
    ('Ethan', 'Soo prettyyyy ♥️', '2026-06-10T11:56:56.208Z'::timestamptz)
) as v(name, message, created_at)
where not exists (select 1 from public.guestbook);

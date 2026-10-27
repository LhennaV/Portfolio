// All project content lives here. The Work window (js/works.js) is generated from this list.
// featured: true  -> big card on top, with a case study
// featured: false -> small card in the "more" row
const projects = [
    {
        id: 'trybe',
        featured: true,
        title: 'Trybe',
        tagline: 'curiosity killed the cat. trybe brought it back.',
        summary: 'a mobile-first app for trading the hobby gear you no longer use for gear for the next hobby you want to try.',
        cover: 'assets/images/projects/trybe/desktop-feed.png',
        role: 'product design + frontend',
        team: '2-person team (with Tristan Reboredo on backend)',
        timeline: 'oct 2026 – ongoing',
        status: 'in development · prototype complete',
        tags: ['UI/UX', 'Figma', 'Mobile-first', 'Next.js', 'TypeScript', 'Supabase'],
        problem: 'people pick up hobbies, buy the gear, then move on, so the tools sit in a cabinet losing value. meanwhile, trying something new means buying fresh equipment that might not pay off. trybe lets people swap what they no longer use for what they need next.',
        sections: [
            {
                title: 'what i designed',
                points: [
                    'a pinterest-style discovery feed, browsable by hobby category, where every post clearly shows if its gear is "up for trade" or just for inspiration',
                    'the full trade flow: propose an item-for-item swap, balance an uneven trade with cash or an extra item, and counter-offer inside the chat',
                    'trust and safety built into the flow: ratings, trade history, account age, a "new trader" badge, safe public meetup spots, and an inspect-before-you-swap checklist',
                    'cancel, block, and report flows, plus edge cases, across 9 flows on both mobile and desktop'
                ]
            },
            {
                title: 'research that shaped it',
                points: [
                    'carousell: sellers pre-set trade markups like "trades+5", which became trybe\'s "looking for" field',
                    'depop: buyers check review count, rating, and account age first, so every trybe profile shows all three',
                    'facebook marketplace: safe exchange zones and inspection reminders became part of the meetup step'
                ]
            },
            {
                title: 'accessibility',
                points: [
                    'light, dark, and high-contrast versions of every theme',
                    'a custom logo concept, brand colors, and a consistent phosphor icon set'
                ]
            }
        ],
        stack: 'planned build: next.js, typescript, tailwind css, supabase (auth, database, realtime chat), vercel, installable as a pwa.',
        gallery: [
            { src: 'assets/images/projects/trybe/mobile-feed.png', caption: 'discovery feed', phone: true },
            { src: 'assets/images/projects/trybe/mobile-post.png', caption: 'post + tools up for trade', phone: true },
            { src: 'assets/images/projects/trybe/mobile-propose.png', caption: 'propose a trade', phone: true },
            { src: 'assets/images/projects/trybe/mobile-chat.png', caption: 'counter-offer chat', phone: true },
            { src: 'assets/images/projects/trybe/mobile-meetup.png', caption: 'safe meetup checklist', phone: true },
            { src: 'assets/images/projects/trybe/mobile-profile.png', caption: 'trust signals on profiles', phone: true },
            { src: 'assets/images/projects/trybe/themes-dark.png', caption: 'dark theme' }
        ],
        links: [
            { label: 'figma prototype', url: 'https://www.figma.com/design/yR5GCWiMt5l1xueLRZGW6o/Trybe' },
            { label: 'github', url: 'https://github.com/LhennaV/Trybe' }
        ]
    },
    {
        id: 'homesure',
        featured: true,
        title: 'HomeSure',
        tagline: 'verified housing rental and listing system with demand analytics',
        summary: 'a property platform for sta. maria, bulacan that fights rental fraud and low-quality listings, with an interactive barangay map.',
        cover: 'assets/images/projects/homesure/home.png',
        role: 'design + frontend dev',
        team: 'capstone project, group',
        timeline: 'jan 2025 – ongoing',
        status: 'live',
        tags: ['Figma', 'HTML', 'CSS', 'JavaScript', 'Leaflet.js'],
        problem: 'online property search is full of fake listings and unverified sellers, which makes renting risky. homesure only shows listings from verified owners, so renters can trust what they see.',
        sections: [
            {
                title: 'what we built',
                points: [
                    'property listing management with seller verification',
                    'separate account flows for renters and landlords',
                    'search and filtering by location and price',
                    'demand analytics for tracking rental trends',
                    'a barangay-level map built with leaflet.js, so renters can explore listings by area'
                ]
            }
        ],
        stack: 'built with html, css, and javascript, with leaflet.js for the map overlays. designed in figma.',
        gallery: [
            { src: 'assets/images/projects/homesure/home.png', caption: 'landing page with the sta. maria barangay map' }
        ],
        links: [
            { label: 'visit homesure.site', url: 'https://homesure.site' }
        ]
    },
    {
        id: 'gtrack',
        featured: true,
        title: 'GTrack',
        tagline: 'gcash transaction management',
        summary: 'a digital audit log for gcash cash-in and cash-out businesses. built with love for someone special.',
        cover: 'assets/images/projects/GTrack Photo.png',
        role: 'ui/ux design + frontend lead',
        team: '2-person team',
        timeline: 'apr 2025 – ongoing',
        status: 'in development',
        tags: ['Figma', 'Blade', 'Tailwind CSS', 'Alpine.js'],
        problem: 'gcash outlets track cash-in, cash-out, and fees by hand, which makes end-of-day totals slow and error-prone.',
        sections: [
            {
                title: 'what i did',
                points: [
                    'designed the ui/ux in figma: user flows, wireframes, layouts, and interactive prototypes',
                    'led frontend development, turning the designs into responsive interfaces',
                    'kept the interface simple for fast cash-in/cash-out logging, service charge tracking, balance monitoring, and end-of-day reports'
                ]
            }
        ],
        stack: 'frontend built with laravel blade, tailwind css, and alpine.js.',
        gallery: [
            { src: 'assets/images/projects/GTrack Photo.png', caption: 'gtrack interface' }
        ],
        links: [
            { label: 'figma', url: 'https://www.figma.com/design/csy0D8GyqELHmkDRXk7Hzu/GTrack?node-id=0-1&p=f&t=uMm2HpgYmXsKXbHC-0' }
        ]
    },
    {
        id: 'mindease',
        featured: false,
        title: 'MindEase',
        tagline: 'a gentle mental wellness app concept',
        summary: 'journaling, emoji mood tracking with weekly/monthly graphs, an ai chat companion, a breathing button that breathes with you, and quick access to crisis hotlines.',
        cover: 'assets/images/projects/mindease/home.png',
        role: 'ui/ux design',
        team: 'personal project',
        timeline: 'jan – feb 2025',
        status: 'figma prototype',
        tags: ['UI/UX', 'Figma', 'Mobile', 'Web'],
        problem: 'checking in with your feelings is easy to skip when the tools feel clinical. mindease is a soft, low-pressure space for daily emotional support.',
        sections: [
            {
                title: 'what i designed',
                points: [
                    'a quick daily check-in: pick an emoji mood and add an optional note',
                    'a journal with text notes, tags, and voice notes',
                    'weekly and monthly insights that turn moods into graphs you can export',
                    'an ai chat companion with a supportive, conversational tone',
                    'a calm space with a breathing button that breathes with you, plus daily affirmations',
                    'crisis support with direct access to mental health hotlines'
                ]
            }
        ],
        gallery: [
            { src: 'assets/images/projects/mindease/home.png', caption: 'home + daily check-in', phone: true },
            { src: 'assets/images/projects/mindease/journal.png', caption: 'journal', phone: true },
            { src: 'assets/images/projects/mindease/insights.png', caption: 'weekly insights', phone: true },
            { src: 'assets/images/projects/mindease/ai-chat.png', caption: 'ai chat companion', phone: true },
            { src: 'assets/images/projects/mindease/calm-space.png', caption: 'calm space', phone: true }
        ],
        links: [
            { label: 'figma', url: 'https://www.figma.com/design/rMXThOw1lLauXQK3CGvAlk/MindEase?node-id=0-1&t=cjrfuSESobvWZFjw-1' }
        ]
    },
    {
        id: 'eduspace',
        featured: false,
        title: 'EduSpace',
        tagline: 'room scheduling system',
        summary: 'a room scheduling system designed to make booking and managing educational spaces simple and stress-free.',
        cover: 'assets/images/projects/EduSpace Photo.png',
        role: 'ui/ux design',
        tags: ['UI/UX', 'Figma'],
        links: [
            { label: 'figma', url: 'https://www.figma.com/design/ZrjQ19shEBsHez8wsHeyRh/EduSpace?node-id=95-408&t=uMm2HpgYmXsKXbHC-0' }
        ]
    }
];

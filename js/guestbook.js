// Guestbook functionality
function initGuestbook() {
    const nameInput = document.getElementById('guestbook-name');
    const messageInput = document.getElementById('guestbook-message');
    const postButton = document.getElementById('post-guestbook');
    const entriesContainer = document.getElementById('guestbook-entries');

    // Listen to guestbook entries in real-time
    if (window.guestbookDB) {
        window.guestbookDB.listenToEntries((entries) => {
            renderGuestbookEntries(entries);
        });
    }

    // Handle post button click
    postButton.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !message) {
            alert('Please fill in both name and message!');
            return;
        }

        if (message.length > 500) {
            alert('Message is too long! Keep it under 500 characters.');
            return;
        }

        // Disable button while posting
        postButton.disabled = true;
        postButton.textContent = 'posting...';

        if (window.guestbookDB) {
            const result = await window.guestbookDB.addEntry(name, message);

            if (result.success) {
                // Clear inputs
                nameInput.value = '';
                messageInput.value = '';
                // Success feedback
                postButton.textContent = 'posted! ✓';
                setTimeout(() => {
                    postButton.textContent = 'post';
                    postButton.disabled = false;
                }, 2000);
            } else {
                alert('Failed to post. Please try again!');
                postButton.textContent = 'post';
                postButton.disabled = false;
            }
        } else {
            alert('Guestbook is offline right now. Please try again later!');
            postButton.textContent = 'post';
            postButton.disabled = false;
        }
    });
}

function renderGuestbookEntries(entries) {
    const container = document.getElementById('guestbook-entries');

    if (entries.length === 0) {
        container.innerHTML = '<p class="font-mono text-lg text-gray-400 text-center py-8">no messages yet. be the first! 💜</p>';
        return;
    }

    container.innerHTML = entries.map(entry => {
        const date = entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp);
        const timeAgo = getTimeAgo(date);

        return `
            <div class="bg-white p-4 pixel-border-thin">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-base font-bold text-gray-800">${escapeHtml(entry.name)}</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="2" width="2" height="2" fill="#FF9EB5"/>
                            <rect x="6" y="2" width="2" height="2" fill="#FF9EB5"/>
                            <rect x="1" y="3" width="7" height="2" fill="#FF9EB5"/>
                            <rect x="2" y="5" width="5" height="2" fill="#FF9EB5"/>
                            <rect x="3" y="7" width="3" height="2" fill="#FF9EB5"/>
                            <rect x="4" y="9" width="1" height="1" fill="#FF9EB5"/>
                        </svg>
                    </div>
                    <span class="font-mono text-sm text-gray-400">${timeAgo}</span>
                </div>
                <p class="font-mono text-lg text-gray-700">${escapeHtml(entry.message)}</p>
            </div>
        `;
    }).join('');
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================
// 📦 1. Initialization & Setup
// ==========================

document.addEventListener('DOMContentLoaded', function () {
    createParticles();
    animateStats();
    displayBooks('motivated'); // load initial books
});

function toggleChat() {
    document.getElementById('chatContainer').classList.toggle('hidden');
}

function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("active");
}


// ==========================
// ✨ 2. Utility: Particles & Stats
// ==========================

function createParticles() {
    const container = document.getElementById('particles');
    const count = 50;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.width = p.style.height = Math.random() * 10 + 5 + 'px';
        p.style.animationDelay = Math.random() * 6 + 's';
        p.style.animationDuration = (Math.random() * 4 + 4) + 's';
        container.appendChild(p);
    }
}

function animateStats() {
    const animate = (el, target) => {
        let current = 0;
        const step = target / 120;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current);
        }, 16);
    };
    setTimeout(() => {
        animate(document.getElementById('booksRead'), 47);
        animate(document.getElementById('readingStreak'), 23);
    }, 1000);
}

// ==========================
// 📚 3. Search Books Section
// ==========================

async function searchBooks(query = null) {
    const input = query || document.getElementById('bookSearch').value.trim();
    if (!input) return;

    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '🔄 Searching...';

    const apiKey = 'AIzaSyDbsHA0zkC91FyZOwvXG12EnjB9wRvdBAU';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(input)}&maxResults=12&key=${apiKey}`;

    trackBookSearch(query); // Just after a search happens

    try {
        const res = await fetch(url);
        const data = await res.json();

        resultsContainer.innerHTML = '';

        if (!data.items || !data.items.length) {
            resultsContainer.innerHTML = '❌ No books found.';
            return;
        }

        data.items.forEach(book => {
            const info = book.volumeInfo;
            if (!info) return;

            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
                <div class="book-cover">
                    <img src="${info.imageLinks?.thumbnail || 'https://via.placeholder.com/128x180'}" />
                </div>
                <div class="book-info">
                    <div class="book-title">${info.title || 'Untitled'}</div>
                    <div class="book-author">by ${info.authors?.join(', ') || 'Unknown'}</div>
                    <div class="book-price">${book.saleInfo?.listPrice?.amount ? `₹${book.saleInfo.listPrice.amount}` : '₹—'}</div>
                    <p>${info.description?.slice(0, 100) || 'No summary available.'}</p>
                </div>
            `;
            resultsContainer.appendChild(card);
        });
    } catch (err) {
        resultsContainer.innerHTML = '⚠️ Error fetching books.';
        console.error(err);
    }
}

function clearSearch() {
    document.getElementById('bookSearch').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

// ==========================
// 🎯 4. Mood-Based Discovery
// ==========================

let activeMood = null;

document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const selectedMood = this.dataset.mood;
        const container = document.getElementById('moodBooks');
        
        // const mood = this.dataset.mood;
        trackMoodClick(selectedMood); // Inside mood button's click event

        if (activeMood === selectedMood) {
            // Toggle off: remove active + animate fade-out
            this.classList.remove('active');
            container.classList.add('fade-out');

            setTimeout(() => {
                container.innerHTML = '';
                container.classList.remove('fade-out');
            }, 400); // Match CSS fadeOut duration

            activeMood = null;
        } else {
            // Toggle new mood
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            activeMood = selectedMood;
            fetchMoodBooks(selectedMood);
        }
    });
});

async function fetchMoodBooks(mood) {
    const container = document.getElementById('moodBooks');
    container.innerHTML = '🔄 Fetching mood books...';

    const apiKey = 'AIzaSyDbsHA0zkC91FyZOwvXG12EnjB9wRvdBAU';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(mood)}&maxResults=5&key=${apiKey}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        container.innerHTML = '';

        if (!data.items || !data.items.length) {
            container.innerHTML = '❌ No books found.';
            return;
        }

        data.items.forEach(book => {
            const info = book.volumeInfo;
            if (!info) return;

            const bookCard = document.createElement('div');
            bookCard.className = 'book-card animate-in';
            bookCard.innerHTML = `
                <div class="book-cover">
                    <img src="${info.imageLinks?.thumbnail || 'https://via.placeholder.com/128x180'}" />
                </div>
                <div class="book-info">
                    <div class="book-title">${info.title}</div>
                    <div class="book-author">by ${info.authors?.join(', ') || 'Unknown'}</div>
                    <p>${info.description?.slice(0, 100) || 'No summary available.'}</p>
                </div>
            `;
            container.appendChild(bookCard);
        });
    } catch (error) {
        container.innerHTML = '⚠️ Error fetching books.';
        console.error(error);
    }
}

// ==========================
// 💬 5. Chatbot & Voice Support
// ==========================

// 📤 Handle user sending a message
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    const chat = document.getElementById('chat-messages');

    // 🟦 Create user message bubble
    const userMsg = document.createElement('div');
    userMsg.className = 'user-msg';
    userMsg.textContent = message;
    chat.appendChild(userMsg);

    input.value = '';
    chat.scrollTop = chat.scrollHeight;

    // ⏳ Simulate typing delay
    setTimeout(() => {
        const aiResponse = generateAIResponse(message);
        const aiMsg = document.createElement('div');
        aiMsg.className = 'ai-msg';
        aiMsg.textContent = aiResponse;
        chat.appendChild(aiMsg);
        chat.scrollTop = chat.scrollHeight;
    }, 1000);
}

// 💬 Trigger on Enter key
document.getElementById('chatInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});

// 🎙️ Voice Input → Convert to text then send
function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Voice recognition not supported.');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = e => {
        const text = e.results[0][0].transcript;
        document.getElementById('chatInput').value = text;
        sendMessage();
    };

    recognition.onerror = e => console.error('Voice error:', e);
    recognition.start();
}

// 🔄 Auto-suggest mood based on user input
function autoSuggestMood(moodType) {
    // Remove active class from all
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));

    // Find the mood button and trigger click
    const btn = document.querySelector(`.mood-btn[data-mood="${moodType}"]`);
    if (btn) {
        btn.classList.add('active');
        fetchMoodBooks(moodType);

        // Optionally scroll to mood section
        document.getElementById('mood').scrollIntoView({ behavior: 'smooth' });
    }
}

// ==========================
// 🤖 6. Feature cards Functioning
// ==========================

// Goal-Based Discovery
// const goalBookMap = {
//     focus: ["Atomic Habits", "Deep Work", "The One Thing"],
//     communication: ["How to Win Friends", "Talk Like TED", "Crucial Conversations"],
//     confidence: ["The Confidence Code", "Can't Hurt Me", "You Are a Badass"],
//     finance: ["Rich Dad Poor Dad", "The Psychology of Money", "The Intelligent Investor"],
//     mindfulness: ["Ikigai", "The Power of Now", "The Art of Happiness"]
// };

// function findGoalBooks() {
//     const input = document.getElementById('goalInput').value.toLowerCase();
//     const container = document.getElementById('goalResults');
//     container.innerHTML = '';

//     let matched = null;
//     for (const key in goalBookMap) {
//         if (input.includes(key)) {
//             matched = goalBookMap[key];
//             break;
//         }
//     }

//     if (!matched) {
//         container.innerHTML = `<p style="color:#999;">😕 Sorry, I couldn't match that goal. Try a keyword like "confidence" or "focus".</p>`;
//         return;
//     }

//     matched.forEach(title => {
//         const card = document.createElement('div');
//         card.className = 'book-card';
//         card.innerHTML = `
//             <div class="book-title">${title}</div>
//             <div class="book-author">✨ Goal-Based Pick</div>
//             <p style="font-size: 0.9rem; color: #666;">One of the best books to help you grow in this area.</p>
//         `;
//         container.appendChild(card);
//     });
// }


// ==========================
// 🤖 7. AI Responses & Personalization
// ==========================

function generateAIResponse(message) {
    const msg = message.toLowerCase();

    // 🔹 If the input is clearly a known mood type
    if (msg.includes('calm') || msg.includes('peaceful') || msg.includes('soothing')) {
        return "Here are some calming reads: *Ikigai* and *The Power of Now*. 🧘‍♂️";
    }

    if (msg.includes('romantic')) {
        return "Feeling romantic? Try *Me Before You* or *The Notebook* 💕";
    }

    if (msg.includes('motivate') || msg.includes('motivated') || msg.includes('inspire')) {
        return "For a boost of inspiration: *Atomic Habits* or *Can't Hurt Me* 💪";
    }

    // 🧠 Fallback: trigger auto mood redirection
    if (msg.includes('recommend') || msg.includes('book') || msg.includes('read')) {
        autoSuggestMood('calm');
        return "Sounds like you need something calming. Let me show you a few... 🧘‍♂️";
    }
    if (msg.includes('thriller') || msg.includes('suspense')) {
        autoSuggestMood('thriller');
        return "Thrillers coming right up! Get ready for some suspense... 🔍";
    }
    if (msg.includes('heartbreaking') || msg.includes('sad')) {
        autoSuggestMood('sad');
        return "Looking for something emotional? How about *The Fault in Our Stars* or *A Walk to Remember*? 😢";
    }

    if( msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return "Hello there! 👋 How can I help you today? You can ask for book recommendations or mood-based suggestions.";
    }

    // 🤖 Fallback for unknown input
    return "Hmm... I didn’t catch that. Try saying things like 'I need something romantic' or 'recommend a thriller'.";
}


// ==========================
// 🤖 8. Dark Mode Toggle
// ==========================

document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
});

window.addEventListener('scroll', () => {
    const discover = document.getElementById('discover');
    const nav = document.querySelector('nav');
    const discoverTop = discover.getBoundingClientRect().top;

    // When Discover section is near top of viewport
    if (discoverTop <= 60) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

function launchTools(toolId) {
    const target = document.getElementById(`${toolId}-discovery`);
    if (target) {
        target.classList.remove('hidden');
        target.scrollIntoView({ behavior: 'smooth' });
    } else {
        alert("Coming soon! 🚧");
    }
}

// ==========================
// 🤖 9. Analytics
// ==========================

// 📊 Simulated Local Analytics Storage
let analyticsData = JSON.parse(localStorage.getItem("booksAnalytics")) || {
    booksRead: 0,
    genreCount: {},
    lastVisit: null,
    streak: 1,
    moodClicks: {}
};

// 🎯 Track searched book (from search bar)
function trackBookSearch(keyword) {
    analyticsData.booksRead++;
    const genre = keyword.toLowerCase();
    analyticsData.genreCount[genre] = (analyticsData.genreCount[genre] || 0) + 1;
    saveAnalytics();
}

// 🎯 Track mood button click
function trackMoodClick(mood) {
    if (typeof mood === 'object') return; // skip tracking if bad input
    analyticsData.moodClicks[mood] = (analyticsData.moodClicks[mood] || 0) + 1;
    saveAnalytics();
}

// 📅 Track visit streak
function updateReadingStreak() {
    const today = new Date().toDateString();
    if (analyticsData.lastVisit) {
        const last = new Date(analyticsData.lastVisit);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (last.toDateString() === yesterday.toDateString()) {
            analyticsData.streak++;
        } else if (last.toDateString() !== today) {
            analyticsData.streak = 1;
        }
    }
    analyticsData.lastVisit = today;
    saveAnalytics();
}

// 💾 Save analytics
function saveAnalytics() {
    localStorage.setItem("booksAnalytics", JSON.stringify(analyticsData));
    updateAnalyticsUI();
}

// 📈 Update the UI
function updateAnalyticsUI() {
    document.getElementById("booksRead").textContent = analyticsData.booksRead;

    // Favorite Genre
    const sortedGenres = Object.entries(analyticsData.genreCount).sort((a, b) => b[1] - a[1]);
    document.getElementById("favoriteGenre").textContent = sortedGenres[0]?.[0] || "—";

    // Streak
    document.getElementById("readingStreak").textContent = analyticsData.streak;

    // Mood Tone
    const sortedMoods = Object.entries(analyticsData.moodClicks).sort((a, b) => b[1] - a[1]);
    const moodEmojis = {
    calm: "🧘 Calm",
    motivated: "🔥 Motivated",
    heartbreak: "💔 Heartbroken",
    romantic: "💕 Romantic",
    happy: "😊 Happy",
    thriller: "😱 Thriller",
    lost: "😔 Lost",
    adventure: "🗺️ Adventure"
};
    const moodKey = sortedMoods[0]?.[0];
    document.getElementById("moodTone").textContent = moodEmojis[moodKey] || "—";
}

// ⚡ On Page Load
window.addEventListener('DOMContentLoaded', () => {
    updateReadingStreak();
    updateAnalyticsUI();
});

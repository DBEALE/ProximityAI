document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-card');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.reveal-card');
    hiddenElements.forEach(el => observer.observe(el));

    // Mobile Menu Toggle (Basic)
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
            if (nav.style.display === 'flex') {
                nav.style.position = 'absolute';
                nav.style.top = '80px';
                nav.style.left = '0';
                nav.style.width = '100%';
                nav.style.background = '#0f172a';
                nav.style.padding = '20px';
                nav.style.flexDirection = 'column';
                nav.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
            }
        });
    }

    // Chatbot Logic
    const chatWidget = document.querySelector('.chat-widget');
    const toggleBtn = document.querySelector('.chat-toggle-btn');
    const closeBtn = document.querySelector('.chat-close-btn');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const messagesContainer = document.getElementById('chat-messages');

    // Remove rigid state (steps). We just have a conversation now.
    let isChatActive = false;
    let transcript = "";

    function toggleChat() {
        chatWidget.classList.toggle('open');
        const isOpen = chatWidget.classList.contains('open');

        if (isOpen && !isChatActive) {
            initChat();
        }
    }

    if (toggleBtn) toggleBtn.addEventListener('click', toggleChat);
    if (closeBtn) closeBtn.addEventListener('click', toggleChat);

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        // Basic protection against HTML injection (though sender='bot' is trusted)
        msgDiv.textContent = text;

        // Convert newlines to breaks if needed, or keeping textContent for safety
        // For better formatting with newlines:
        msgDiv.innerHTML = text.replace(/\n/g, '<br>');

        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Append to transcript
        transcript += `${sender.toUpperCase()}: ${text}\n`;
    }

    function initChat() {
        isChatActive = true;
        chatInput.disabled = false;
        sendBtn.disabled = false;

        // Initial greeting
        setTimeout(() => {
            // We can let the backend handle the greeting, or do it here. 
            // Let's do a hardcoded frontend greeting to be instant.
            addMessage("Hello! I am the Proximity AI Senior Consultant. How can I assist you in transforming your business today?", 'bot');
        }, 500);
    }

    async function handleUserInput() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatInput.value = '';
        chatInput.disabled = true; // Disable while waiting

        // Simulate thinking for realism
        addMessage("...", 'bot-thinking'); // We could add a thinking bubble class, but standard bubble works for temp

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();

            // Remove thinking bubble (last child)
            messagesContainer.removeChild(messagesContainer.lastChild);

            addMessage(data.response, 'bot');

            // Optional: Backup full transcript to server periodically or at end?
            // For now, we skip auto-sending transcript unless user explicit 'contact' flow triggers it, 
            // but for simplicity we keep it chat-only for this demo.

        } catch (err) {
            console.error('Chat error:', err);
            // Remove thinking bubble
            if (messagesContainer.lastChild.textContent === "...") {
                messagesContainer.removeChild(messagesContainer.lastChild);
            }
            addMessage("I apologize, but I am having trouble connecting to my knowledge base. Please try again.", 'bot');
        } finally {
            chatInput.disabled = false;
            chatInput.focus();
        }
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', handleUserInput);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserInput();
        });
    }
});

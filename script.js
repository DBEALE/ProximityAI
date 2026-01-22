document.addEventListener('DOMContentLoaded', () => {
    // Background Particles
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const mouse = {
            x: null,
            y: null,
            radius: 150
        };

        window.addEventListener('mousemove', (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
        });

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 2 + 1;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
                this.color = 'rgba(139, 92, 246, 0.5)'; // Primary Violet
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouse.radius) {
                    this.x += directionX;
                    this.y += directionY;
                } else {
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 10;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 10;
                    }
                }
            }
        }

        function init() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            particles = [];
            let numberOfParticles = (canvas.width * canvas.height) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                particles.push(new Particle(x, y));
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].draw();
                particles[i].update();
            }
            connect();
            requestAnimationFrame(animate);
        }

        function connect() {
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        opacityValue = 1 - (distance / 100);
                        ctx.strokeStyle = `rgba(6, 182, 212, ${opacityValue * 0.2})`; // Secondary Cyan
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        window.addEventListener('resize', () => {
            init();
        });

        init();
        animate();
    }

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

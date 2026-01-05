// Frases románticas
const messages = [
    "Hay algo en tu forma de estar que hace que todo alrededor se sienta más ligero y agradable.",
    
    "No sé cómo lo logras, pero cada vez que apareces, el ambiente cambia de una manera especial.",
    
    "Tu manera de hablar tiene esa calma que uno no encuentra fácilmente en otras personas.",
    
    "Es curioso cómo incluso los detalles más simples se vuelven interesantes cuando tú estás presente.",
    
    "Tu sonrisa tiene la capacidad de transformar cualquier momento en algo más bonito.",
    
    "Tu forma de ser tiene ese encanto que no se puede explicar, solo sentir."
];

let discoveredMessages = new Set();
let musicPlayer;
let isPlaying = false;
let hoverTimers = {};
let shakeCounters = {};
let dragStartY = 0;
let currentSection = 1;

// Función para cambiar de sección
function goToSection(sectionNumber) {
    const currentSec = document.getElementById(`section${currentSection}`);
    const nextSec = document.getElementById(`section${sectionNumber}`);
    
    currentSec.classList.remove('active');
    currentSec.classList.add('fade-out');
    
    setTimeout(() => {
        currentSec.style.display = 'none';
        currentSec.classList.remove('fade-out');
        
        nextSec.style.display = 'block';
        setTimeout(() => {
            nextSec.classList.add('active');
            
            // Inicializar scratch cards si es la sección 2
            if (sectionNumber === 2) {
                initializeScratchCardsNow();
            }
            // Inicializar juego de globos si es la sección 4
            if (sectionNumber === 4) {
                initializeBalloonGame();
            }
        }, 50);
        
        currentSection = sectionNumber;
    }, 500);
}

// Función para iniciar la experiencia
function startExperience() {
    // Ocultar overlay
    const overlay = document.getElementById('startOverlay');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 500);
    
    // Iniciar música
    if (musicPlayer) {
        musicPlayer.play().then(() => {
            isPlaying = true;
            document.getElementById('musicButton').classList.add('playing');
        }).catch((error) => {
            console.log('Error al reproducir:', error);
        });
    }
}

// Inicializar al cargar
window.addEventListener('load', () => {
    musicPlayer = document.getElementById('musicPlayer');
    
    // Inicializar canvas de partículas
    initParticleCanvas();
    
    startHeartAnimation();
    startStarAnimation();
    
    for (let i = 0; i < 2; i++) {
        setTimeout(() => createFloatingHeart(), i * 200);
    }
    
    // Inicializar interacciones de las tarjetas
    initializeDragCards();
    initializeScratchCards();
    initializeShakeCards();
    initializeCardHoverEffects();
});

// Sistema de partículas para pantalla de inicio
function initParticleCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 80;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Conectar partículas cercanas
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance / 120)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Agregar efecto de corazones al pasar el mouse sobre cualquier tarjeta
function initializeCardHoverEffects() {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            createFloatingHeart();
        });
    });
}

// Inicializar tarjetas arrastrables
function initializeDragCards() {
    const dragCards = document.querySelectorAll('.drag-card');
    dragCards.forEach(card => {
        const index = parseInt(card.dataset.index);
        let touchStartY = 0;
        let isDragging = false;
        
        // Eventos para escritorio
        card.addEventListener('dragstart', (e) => {
            if (card.classList.contains('unlocked')) return;
            dragStartY = e.clientY;
            card.style.opacity = '0.7';
        });
        
        card.addEventListener('drag', (e) => {
            if (card.classList.contains('unlocked')) return;
            if (e.clientY === 0) return;
            
            const dragDistance = dragStartY - e.clientY;
            if (dragDistance > 100) {
                unlockCard(card, index);
            }
        });
        
        card.addEventListener('dragend', () => {
            card.style.opacity = '1';
        });
        
        // Eventos táctiles para móviles
        card.addEventListener('touchstart', (e) => {
            if (card.classList.contains('unlocked')) return;
            touchStartY = e.touches[0].clientY;
            isDragging = true;
            card.style.opacity = '0.7';
            card.style.transition = 'transform 0.1s ease';
        }, { passive: false });
        
        card.addEventListener('touchmove', (e) => {
            if (!isDragging || card.classList.contains('unlocked')) return;
            e.preventDefault(); // Prevenir scroll de la página
            
            const touchCurrentY = e.touches[0].clientY;
            const dragDistance = touchStartY - touchCurrentY;
            
            // Aplicar transformación visual mientras arrastra
            if (dragDistance > 0) {
                card.style.transform = `translateY(-${Math.min(dragDistance, 120)}px)`;
            }
            
            // Desbloquear si arrastró suficiente
            if (dragDistance > 100) {
                isDragging = false;
                unlockCard(card, index);
                card.style.transform = '';
            }
        }, { passive: false });
        
        card.addEventListener('touchend', () => {
            isDragging = false;
            card.style.opacity = '1';
            card.style.transform = '';
            card.style.transition = '';
        }, { passive: false });
    });
}

// Inicializar tarjetas con efecto raspadita (solo event listeners)
function initializeScratchCards() {
    // No inicializar el canvas aquí porque las tarjetas están ocultas
    // Se inicializará cuando la sección se muestre
}

// Inicializar el canvas de scratch cards cuando son visibles
function initializeScratchCardsNow() {
    const scratchCards = document.querySelectorAll('#section2 .scratch-card');
    scratchCards.forEach(card => {
        const index = parseInt(card.dataset.index);
        const canvas = card.querySelector('.scratch-canvas');
        
        // Verificar si ya fue inicializado
        if (canvas.dataset.initialized === 'true') return;
        canvas.dataset.initialized = 'true';
        
        const ctx = canvas.getContext('2d');
        const messageDiv = document.getElementById(`message${index}`);
        
        // Configurar el tamaño del canvas dinámicamente
        const rect = card.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Configurar el mensaje de fondo (solo poner el texto, no mostrarlo todavía)
        messageDiv.textContent = messages[index];
        
        // Dibujar capa de raspadita
        ctx.fillStyle = '#c4c4c4';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Añadir texto "Raspa aquí" UNA VEZ
        ctx.fillStyle = '#888';
        ctx.font = 'bold 20px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText('✨ Raspa aquí ✨', canvas.width / 2, canvas.height / 2);
        
        let isScratching = false;
        let scratchedPercent = 0;
        
        const scratch = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;
            
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, 2 * Math.PI);
            ctx.fill();
            
            // Calcular porcentaje raspado
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let transparent = 0;
            for (let i = 0; i < imageData.data.length; i += 4) {
                if (imageData.data[i + 3] === 0) transparent++;
            }
            scratchedPercent = (transparent / (imageData.data.length / 4)) * 100;
            
            if (scratchedPercent > 50) {
                canvas.style.opacity = '0';
                card.classList.add('unlocked');
                card.querySelector('.card-hint').style.display = 'none';
                createParticles();
                createFloatingHeart();
            }
        };
        
        canvas.addEventListener('mousedown', () => { isScratching = true; });
        canvas.addEventListener('mouseup', () => { isScratching = false; });
        canvas.addEventListener('mousemove', (e) => { if (isScratching) scratch(e); });
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isScratching = true; });
        canvas.addEventListener('touchend', () => { isScratching = false; });
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (isScratching) scratch(e); });
    });
}

// Inicializar tarjetas para sacudir
function initializeShakeCards() {
    const shakeCards = document.querySelectorAll('.shake-card');
    shakeCards.forEach(card => {
        const index = parseInt(card.dataset.index);
        shakeCounters[index] = 0;
        const counter = card.querySelector('.shake-counter');
        
        card.addEventListener('click', () => {
            if (card.classList.contains('unlocked')) return;
            
            shakeCounters[index]++;
            counter.textContent = `${shakeCounters[index]}/5`;
            
            // Animación de sacudida
            card.style.animation = 'shake 0.3s ease';
            setTimeout(() => {
                card.style.animation = '';
            }, 300);
            
            if (shakeCounters[index] >= 5) {
                unlockCard(card, index);
                counter.style.display = 'none';
            }
        });
    });
}

// Función universal para desbloquear tarjetas
function unlockCard(cardElement, index) {
    if (cardElement.classList.contains('unlocked')) return;
    
    cardElement.classList.add('unlocked');
    
    const cardMessage = document.getElementById(`message${index}`);
    cardMessage.textContent = messages[index];
    cardMessage.classList.remove('hidden');
    
    discoveredMessages.add(index);
    
    createParticles();
    createFloatingHeart();
}

// Toggle de música
function toggleMusic() {
    if (!musicPlayer) return;
    
    if (isPlaying) {
        musicPlayer.pause();
        isPlaying = false;
        document.getElementById('musicButton').classList.remove('playing');
    } else {
        musicPlayer.play();
        isPlaying = true;
        document.getElementById('musicButton').classList.add('playing');
    }
}

// Mostrar mensaje al hacer clic en tarjeta
function showMessage(cardElement, index) {
    // Si ya está desbloqueada, no hacer nada
    if (cardElement.classList.contains('unlocked')) {
        return;
    }
    
    // Desbloquear tarjeta
    cardElement.classList.add('unlocked');
    
    // Mostrar mensaje en la tarjeta
    const cardMessage = document.getElementById(`message${index}`);
    cardMessage.textContent = messages[index];
    cardMessage.classList.remove('hidden');
    
    // Agregar a descubiertos
    discoveredMessages.add(index);
    
    // Efectos
    createParticles();
    createFloatingHeart();
}

// Función para tarjetas con doble click
function showMessageDoubleClick(cardElement, index) {
    if (cardElement.classList.contains('unlocked')) {
        return;
    }
    
    cardElement.classList.add('unlocked');
    
    const cardMessage = document.getElementById(`message${index}`);
    cardMessage.textContent = messages[index];
    cardMessage.classList.remove('hidden');
    
    discoveredMessages.add(index);
    
    createParticles();
    createFloatingHeart();
}

// Funciones para tarjetas con mantener presionado
function startHold(cardElement, index) {
    if (cardElement.classList.contains('unlocked')) {
        return;
    }
    
    holdCard = cardElement;
    const progressBar = cardElement.querySelector('.hold-progress');
    progressBar.style.display = 'block';
    progressBar.style.animation = 'fillProgress 2s linear';
    
    holdTimer = setTimeout(() => {
        showMessageHold(cardElement, index);
    }, 2000);
}

function cancelHold() {
    if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
    }
    if (holdCard) {
        const progressBar = holdCard.querySelector('.hold-progress');
        progressBar.style.display = 'none';
        progressBar.style.animation = 'none';
        holdCard = null;
    }
}

function showMessageHold(cardElement, index) {
    if (cardElement.classList.contains('unlocked')) {
        return;
    }
    
    cardElement.classList.add('unlocked');
    
    const cardMessage = document.getElementById(`message${index}`);
    cardMessage.textContent = messages[index];
    cardMessage.classList.remove('hidden');
    
    const progressBar = cardElement.querySelector('.hold-progress');
    progressBar.style.display = 'none';
    
    discoveredMessages.add(index);
    
    createParticles();
    createFloatingHeart();
}

// Crear partículas
function createParticles() {
    const particles = ['✨', '💫', '⭐', '🌟', '💖', '💕', '💗', '💝'];
    const container = document.body;
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = Math.random() * window.innerHeight + 'px';
        particle.style.fontSize = (Math.random() * 20 + 15) + 'px';
        
        container.appendChild(particle);
        
        setTimeout(() => particle.remove(), 2000);
    }
}

// Crear corazón flotante
function createFloatingHeart() {
    const hearts = ['💕', '💖', '💗', '💓', '💝', '❤️', '💜', '💙'];
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * window.innerWidth + 'px';
    heart.style.fontSize = (Math.random() * 30 + 20) + 'px';
    heart.style.animationDuration = (Math.random() * 2 + 3) + 's';
    heart.style.animationDelay = Math.random() * 1 + 's';
    
    document.getElementById('heartsContainer').appendChild(heart);
    
    setTimeout(() => heart.remove(), 5000);
}

// Crear estrellas
function startStarAnimation() {
    const starsContainer = document.getElementById('starsContainer');
    
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
    }
}

// Animación continua de corazones
function startHeartAnimation() {
    setInterval(() => {
        if (Math.random() > 0.85) {
            createFloatingHeart();
        }
    }, 1500);
}

// ========== JUEGO DE GLOBOS ==========
const balloonWords = [
    "Hermosa",
    "Inteligente",
    "Especial",
    "Única",
    "Radiante",
    "Encantadora",
    "Increíble",
    "Maravillosa"
];

const balloonColors = [
    '#ff6b9d', '#ffa726', '#667eea', '#f093fb',
    '#ff9a9e', '#a18cd1', '#fbc2eb', '#fa709a'
];

let poppedCount = 0;

function initializeBalloonGame() {
    const container = document.getElementById('balloonsContainer');
    poppedCount = 0;
    
    // Crear globos
    balloonWords.forEach((word, index) => {
        setTimeout(() => {
            createBalloon(word, index, container);
        }, index * 600);
    });
}

function createBalloon(word, index, container) {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    
    const randomX = Math.random() * (container.offsetWidth - 100);
    balloon.style.left = randomX + 'px';
    balloon.style.bottom = '-120px';
    
    const color = balloonColors[index % balloonColors.length];
    
    balloon.innerHTML = `
        <div class="balloon-body" style="background: ${color};">
            🎈
        </div>
        <div class="balloon-string"></div>
    `;
    
    container.appendChild(balloon);
    
    // Animación de flotar
    setTimeout(() => {
        balloon.style.animation = `floatUp ${8 + Math.random() * 4}s linear infinite`;
    }, 50);
    
    // Click para explotar
    balloon.addEventListener('click', () => {
        if (!balloon.classList.contains('popped')) {
            popBalloon(balloon, word, container);
        }
    });
}

function popBalloon(balloon, word, container) {
    balloon.classList.add('popped');
    poppedCount++;
    
    // Crear partículas
    for (let i = 0; i < 12; i++) {
        createBalloonParticle(balloon, container);
    }
    
    // Mostrar palabra
    showRevealedWord(word, balloon, container);
    
    // Remover globo
    setTimeout(() => {
        balloon.remove();
    }, 400);
    
    // Verificar si todos los globos fueron explotados
    if (poppedCount === balloonWords.length) {
        setTimeout(() => {
            showFinalMessage();
        }, 1000);
    }
}

function createBalloonParticle(balloon, container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.textContent = ['✨', '💖', '💕', '⭐', '💫'][Math.floor(Math.random() * 5)];
    
    const rect = balloon.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    particle.style.left = (rect.left - containerRect.left + 40) + 'px';
    particle.style.top = (rect.top - containerRect.top + 50) + 'px';
    particle.style.position = 'absolute';
    
    container.appendChild(particle);
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = 50 + Math.random() * 50;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;
    
    particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
    ], {
        duration: 800,
        easing: 'ease-out'
    });
    
    setTimeout(() => particle.remove(), 800);
}

function showRevealedWord(word, balloon, container) {
    const wordEl = document.createElement('div');
    wordEl.className = 'revealed-word';
    wordEl.textContent = word;
    
    const rect = balloon.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    wordEl.style.left = (rect.left - containerRect.left + 40) + 'px';
    wordEl.style.top = (rect.top - containerRect.top + 50) + 'px';
    
    container.appendChild(wordEl);
    
    setTimeout(() => wordEl.remove(), 2000);
}

function showFinalMessage() {
    document.getElementById('finalContinueBtn').classList.remove('hidden');
    createParticles();
    
    for (let i = 0; i < 10; i++) {
        setTimeout(() => createFloatingHeart(), i * 200);
    }
}

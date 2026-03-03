document.addEventListener('DOMContentLoaded', () => {
    // --- Carousel Logic ---
    const c = document.getElementById('carousel');
    if (!c) return;
    const slides = Array.from(c.querySelectorAll('.slide'));
    if (!slides.length) return;
    const prev = c.querySelector('.prev');
    const next = c.querySelector('.next');
    let i = 0;
    let anim = false;
    let queued = 0;
    const DISPLAY_MS = 4000; // Un poco más lento para leer
    const FADE_MS = 500;
    let auto;
    let resume;

    function setActive(x) {
        slides.forEach((el, idx) => el.classList.toggle('active', idx === x));
    }

    function doAnim(cur, ne, dir) {
        anim = true;
        ne.classList.add('active');
        // Simplified animation classes for robustness
        setTimeout(() => {
            cur.classList.remove('active');
            anim = false;
            if (queued) {
                const d = queued;
                queued = 0;
                nextBy(d);
            }
        }, FADE_MS);
    }

    function nextBy(delta) {
        if (anim) { queued = delta; return; }
        const nx = (i + delta + slides.length) % slides.length;
        const cur = slides[i];
        const ne = slides[nx];
        doAnim(cur, ne, delta > 0 ? 'right' : 'left');
        i = nx;
    }

    function startAuto() {
        clearInterval(auto);
        auto = setInterval(() => { nextBy(1); }, DISPLAY_MS);
    }

    function pauseAuto() {
        clearInterval(auto);
        clearTimeout(resume);
        resume = setTimeout(() => { startAuto(); }, 5000);
    }

    setActive(i);
    startAuto();
    if (prev) prev.addEventListener('click', () => { nextBy(-1); pauseAuto(); });
    if (next) next.addEventListener('click', () => { nextBy(1); pauseAuto(); });
});

document.addEventListener('DOMContentLoaded', () => {
    // --- Form Logic (Multi-step) ---
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    const step1 = form.querySelector('.step-1');
    const step2 = form.querySelector('.step-2');
    const nextBtn = document.getElementById('cf-next');
    const prevBtn = document.getElementById('cf-prev');
    const statusEl = document.createElement('div');
    statusEl.className = 'cf-status';
    form.appendChild(statusEl);

    // Inputs
    const nombreEl = document.getElementById('cf-nombre');
    const emailEl = document.getElementById('cf-email');
    const celEl = document.getElementById('cf-cel');
    const asuntoEl = document.getElementById('cf-asunto');
    const mensajeEl = document.getElementById('cf-mensaje');

    // State
    const state = { nombre: '', email: '', celular: '' };

    function showStep(step) {
        if (!step1 || !step2) return;
        if (step === 1) { step1.hidden = false; step2.hidden = true; }
        else { step1.hidden = true; step2.hidden = false; }
    }

    function setError(input, msg) {
        input.classList.add('input-error');
        let tip = input.nextElementSibling;
        if (!tip || !tip.classList.contains('error-tip')) {
            tip = document.createElement('div');
            tip.className = 'error-tip';
            input.parentNode.insertBefore(tip, input.nextSibling);
        }
        tip.textContent = msg;
    }

    function clearError(input) {
        input.classList.remove('input-error');
        const tip = input.nextElementSibling;
        if (tip && tip.classList.contains('error-tip')) tip.remove();
    }

    // Validations
    function validateStep1() {
        let valid = true;
        if (nombreEl.value.trim().length < 2) { setError(nombreEl, 'Mínimo 2 caracteres'); valid = false; } else clearError(nombreEl);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) { setError(emailEl, 'Email inválido'); valid = false; } else clearError(emailEl);
        if (!/^[+]?\d{7,15}$/.test(celEl.value.trim())) { setError(celEl, 'Celular inválido'); valid = false; } else clearError(celEl);
        return valid;
    }

    function validateStep2() {
        let valid = true;
        if (!asuntoEl.value.trim()) { setError(asuntoEl, 'Requerido'); valid = false; } else clearError(asuntoEl);
        if (!mensajeEl.value.trim()) { setError(mensajeEl, 'Requerido'); valid = false; } else clearError(mensajeEl);
        return valid;
    }

    // Events
    if (nextBtn) nextBtn.addEventListener('click', () => {
        if (validateStep1()) {
            state.nombre = nombreEl.value.trim();
            state.email = emailEl.value.trim();
            state.celular = celEl.value.trim();
            showStep(2);
        }
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
        showStep(1);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateStep2()) {
            statusEl.className = 'cf-status err';
            statusEl.textContent = 'Revisa los campos.';
            return;
        }

        const to = 'juanestebanmonteroarias7@gmail.com';
        const subject = encodeURIComponent(asuntoEl.value || 'Contacto desde la web');
        const body = encodeURIComponent(
            `Nombre: ${state.nombre}\nEmail: ${state.email}\nCelular: ${state.celular}\n\n${mensajeEl.value}`
        );
        
        try {
            window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
            statusEl.className = 'cf-status ok';
            statusEl.textContent = 'Abriendo tu cliente de correo...';
        } catch {
            statusEl.className = 'cf-status err';
            statusEl.textContent = 'Error al iniciar el envío.';
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // --- Facebook Embed Mock ---
    const fbEmbed = document.getElementById('fb-embed');
    if (fbEmbed) {
        const avatarEl = fbEmbed.querySelector('.fb-avatar');
        if(avatarEl) {
            const img = document.createElement('img');
            img.src = 'https://graph.facebook.com/100095494389070/picture?type=large';
            img.alt = 'Facebook Profile';
            avatarEl.appendChild(img);
        }
        fbEmbed.addEventListener('click', () => {
            window.open('https://www.facebook.com/people/Kids-Kinder-Preescolar/100095494389070/', '_blank');
        });
    }

    // --- Instagram Embed Mock ---
    const igEmbed = document.getElementById('ig-embed');
    if (igEmbed) {
        const avatarEl = igEmbed.querySelector('.ig-avatar');
        if(avatarEl) {
            // Placeholder icon if no API
            avatarEl.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;">📸</div>';
        }
        // Mock grid items for visual completeness
        const gridEl = igEmbed.querySelector('.ig-grid');
        if(gridEl) {
            for(let k=0; k<6; k++) {
                const item = document.createElement('div');
                item.className = 'ig-item';
                // Using a placeholder color instead of broken image
                item.style.background = '#ddd'; 
                gridEl.appendChild(item);
            }
        }
        igEmbed.addEventListener('click', () => {
            window.open('https://www.instagram.com/kidskinderpreescolar/', '_blank');
        });
    }
});
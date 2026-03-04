document.addEventListener('DOMContentLoaded', () => {
    // --- Popup Modal ---
    const popupModal = document.getElementById('popup-modal');
    const closePopup = document.getElementById('close-popup');
    
    // Show popup when page loads
    setTimeout(() => {
        popupModal.style.display = 'flex';
    }, 500); // Small delay to ensure page is loaded
    
    closePopup.addEventListener('click', () => {
        popupModal.style.display = 'none';
    });
    
    // Close popup when clicking on the overlay (but not inside the container)
    popupModal.addEventListener('click', (e) => {
        if (e.target === popupModal) {
            popupModal.style.display = 'none';
        }
    });
    
    // Prevent closing when clicking inside the popup container
    const popupContainer = document.querySelector('.popup-container');
    popupContainer.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
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

// Update form validation to submit directly without multi-step
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    const statusEl = document.createElement('div');
    statusEl.className = 'cf-status';
    form.appendChild(statusEl);

    // Get all input elements
    const nombreEl = document.getElementById('cf-nombre');
    const emailEl = document.getElementById('cf-email');
    const celEl = document.getElementById('cf-cel');
    const asuntoEl = document.getElementById('cf-asunto');
    const mensajeEl = document.getElementById('cf-mensaje');

    // Validation functions
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

    function validateForm() {
        let valid = true;
        
        if (!nombreEl.value.trim()) { 
            setError(nombreEl, 'Campo requerido'); 
            valid = false; 
        } else clearError(nombreEl);
        
        if (!emailEl.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) { 
            setError(emailEl, 'Email inválido'); 
            valid = false; 
        } else clearError(emailEl);
        
        if (!celEl.value.trim()) { 
            setError(celEl, 'Campo requerido'); 
            valid = false; 
        } else clearError(celEl);
        
        if (!asuntoEl.value.trim()) { 
            setError(asuntoEl, 'Campo requerido'); 
            valid = false; 
        } else clearError(asuntoEl);
        
        if (!mensajeEl.value.trim()) { 
            setError(mensajeEl, 'Campo requerido'); 
            valid = false; 
        } else clearError(mensajeEl);
        
        return valid;
    }

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            statusEl.className = 'cf-status err';
            statusEl.textContent = 'Por favor completa todos los campos.';
            return;
        }

        // Prepare data to send
        const formData = {
            nombre: nombreEl.value.trim(),
            email: emailEl.value.trim(),
            celular: celEl.value.trim(),
            asunto: asuntoEl.value.trim(),
            mensaje: mensajeEl.value.trim()
        };

        // Create mailto link with all the information
        const to = 'juanestebanmonteroarias7@gmail.com';
        const subject = encodeURIComponent(formData.asunto);
        const body = encodeURIComponent(
            `Nombre: ${formData.nombre}\nEmail: ${formData.email}\nCelular: ${formData.celular}\n\n${formData.mensaje}`
        );
        
        try {
            window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
            statusEl.className = 'cf-status ok';
            statusEl.textContent = 'Abriendo tu cliente de correo...';
            
            // Clear form after successful submission attempt
            form.reset();
        } catch (error) {
            statusEl.className = 'cf-status err';
            statusEl.textContent = 'Error al iniciar el envío.';
        }
    });
});

// Add functionality for gallery modals and image rotation
document.addEventListener('DOMContentLoaded', () => {
    // Image rotation for specific sections
    const rotateImages = (containerClass, imageSources, intervalTime = 5000) => {
        const containers = document.querySelectorAll(containerClass);
        containers.forEach(container => {
            const mainImage = container.querySelector('.salon-main-image');
            let currentIndex = 0;
            
            if (!mainImage) return;
            
            const updateImage = () => {
                mainImage.src = imageSources[currentIndex];
                currentIndex = (currentIndex + 1) % imageSources.length;
            };
            
            // Change image periodically
            setInterval(updateImage, intervalTime);
        });
    };
    
    // Aulas Amplias images
    rotateImages('.salon-amplias', [
        'img/Sala_Amarilla.jpg',
        'img/Sala_Azul.jpg', 
        'img/Sala_Naranja.jpg',
        'img/Sala_Roja.jpg'
    ], 3000);
    
    // Zona de Juegos images
    rotateImages('.salon-juegos', [
        'img/9.jpg',
        'img/Juegos2.jpg',
        'img/Juegos3.jpg'
    ], 4000);
    
    // Arte y Creatividad images
    rotateImages('.salon-arte', [
        'img/Sala_Artes.jpg',
        'img/Sala_Artes2.jpg'
    ], 5000);
    
    // Auditorio images
    rotateImages('.salon-auditorio', [
        'img/Auditorio.jpg',
        'img/Auditorio2.jpg'
    ], 5000);
    
    // Card click handlers for galleries and image modals
    const ampliasCard = document.querySelector('.salon-amplias');
    const juegosCard = document.querySelector('.salon-juegos');
    const comedorCard = document.querySelector('.salon-comedor');
    const arteCard = document.querySelector('.salon-arte');
    const auditorioCard = document.querySelector('.salon-auditorio');
    const tecnologiaCard = document.querySelector('.salon-tecnologia');
    
    const galleryModal = document.getElementById('gallery-modal');
    const imageModal = document.getElementById('image-modal');
    const galleryImagesContainer = document.querySelector('.gallery-images');
    const modalImage = document.getElementById('modal-image');
    const closeGallery = document.getElementById('close-gallery');
    const closeImage = document.getElementById('close-image');
    
    // Close buttons functionality
    closeGallery.addEventListener('click', () => {
        galleryModal.style.display = 'none';
    });
    
    closeImage.addEventListener('click', () => {
        imageModal.style.display = 'none';
    });
    
    // Close modals when clicking on overlay
    galleryModal.addEventListener('click', (e) => {
        if (e.target === galleryModal) {
            galleryModal.style.display = 'none';
        }
    });
    
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });
    
    // Aulas Amplias Gallery
    ampliasCard.addEventListener('click', () => {
        galleryImagesContainer.innerHTML = '';
        const images = [
            'img/Sala_Amarilla.jpg',
            'img/Sala_Amarilla2.jpg',
            'img/Sala_Azul.jpg',
            'img/Sala_Azul2.jpg',
            'img/Sala_Naranja.jpg',
            'img/Sala_Naranja2.jpg',
            'img/Sala_Roja.jpg',
            'img/Sala_Roja2.jpg'
        ];
        
        images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Imagen de aula amplia';
            galleryImagesContainer.appendChild(img);
        });
        
        galleryModal.style.display = 'block';
    });
    
    // Zona de Juegos Gallery
    juegosCard.addEventListener('click', () => {
        galleryImagesContainer.innerHTML = '';
        const images = [
            'img/9.jpg',
            'img/Juegos2.jpg',
            'img/Juegos3.jpg'
        ];
        
        images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Imagen de zona de juegos';
            galleryImagesContainer.appendChild(img);
        });
        
        galleryModal.style.display = 'block';
    });
    
    // Comedor Image Modal
    comedorCard.addEventListener('click', () => {
        modalImage.src = 'img/Cafeteria.jpg';
        modalImage.alt = 'Imagen del comedor';
        imageModal.style.display = 'block';
    });
    
    // Arte y Creatividad Gallery
    arteCard.addEventListener('click', () => {
        galleryImagesContainer.innerHTML = '';
        const images = [
            'img/Sala_Artes.jpg',
            'img/Sala_Artes2.jpg'
        ];
        
        images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Imagen de arte y creatividad';
            galleryImagesContainer.appendChild(img);
        });
        
        galleryModal.style.display = 'block';
    });
    
    // Auditorio Gallery
    auditorioCard.addEventListener('click', () => {
        galleryImagesContainer.innerHTML = '';
        const images = [
            'img/Auditorio.jpg',
            'img/Auditorio2.jpg'
        ];
        
        images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Imagen del auditorio';
            galleryImagesContainer.appendChild(img);
        });
        
        galleryModal.style.display = 'block';
    });
    
    // Tecnología y Desarrollo Image Modal
    tecnologiaCard.addEventListener('click', () => {
        modalImage.src = 'img/Sala_Informatica.jpg';
        modalImage.alt = 'Imagen de sala informática';
        imageModal.style.display = 'block';
    });
});
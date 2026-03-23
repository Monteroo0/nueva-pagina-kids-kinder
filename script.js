document.addEventListener('DOMContentLoaded', () => {
    // --- Popup Modal ---
    const popupModal = document.getElementById('popup-modal');
    const closePopup = document.getElementById('close-popup');
    const popupContainer = document.querySelector('.popup-container');
    const POPUP_STEP_MS = 500;
    let popupOpeningTimer;
    let popupClosingTimer;
    let isPopupClosing = false;

    if (popupModal && closePopup && popupContainer) {
        function clearPopupTimers() {
            clearTimeout(popupOpeningTimer);
            clearTimeout(popupClosingTimer);
        }

        function openPopup() {
            clearPopupTimers();
            isPopupClosing = false;
            popupModal.classList.add('is-mounted');

            requestAnimationFrame(() => {
                popupModal.classList.add('is-overlay-visible');
            });

            popupOpeningTimer = setTimeout(() => {
                if (!isPopupClosing) {
                    popupModal.classList.add('is-popup-visible');
                }
            }, POPUP_STEP_MS);
        }

        function closePopupModal() {
            if (isPopupClosing) return;

            isPopupClosing = true;
            clearPopupTimers();
            popupModal.classList.remove('is-popup-visible');

            popupClosingTimer = setTimeout(() => {
                popupModal.classList.remove('is-overlay-visible');

                popupClosingTimer = setTimeout(() => {
                    popupModal.classList.remove('is-mounted');
                    isPopupClosing = false;
                }, POPUP_STEP_MS);
            }, POPUP_STEP_MS);
        }

        window.addEventListener('load', () => {
            openPopup();
        }, { once: true });

        closePopup.addEventListener('click', closePopupModal);

        // Close popup when clicking on the overlay (but not inside the container)
        popupModal.addEventListener('click', (e) => {
            if (e.target === popupModal) {
                closePopupModal();
            }
        });

        // Prevent closing when clicking inside the popup container
        popupContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
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

    function doAnim(cur, ne) {
        anim = true;
        ne.classList.add('active', 'is-entering');
        setTimeout(() => {
            cur.classList.remove('active');
            ne.classList.remove('is-entering');
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
        doAnim(cur, ne);
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

// Smooth scroll for internal section links
document.addEventListener('DOMContentLoaded', () => {
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        link.addEventListener('click', (event) => {
            event.preventDefault();

            const header = document.querySelector('.site-header');
            const headerOffset = header ? header.offsetHeight : 0;
            const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset - 12;

            window.scrollTo({
                top: Math.max(targetTop, 0),
                behavior: 'smooth'
            });
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNavPanel = document.getElementById('mobile-nav-panel');
    if (!menuToggle || !mobileNavPanel) return;

    const mobileLinks = mobileNavPanel.querySelectorAll('a[href^="#"]');

    function setMenuState(isOpen) {
        document.body.classList.toggle('mobile-menu-open', isOpen);
        menuToggle.classList.toggle('is-open', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú principal' : 'Abrir menú principal');
        mobileNavPanel.setAttribute('aria-hidden', String(!isOpen));
    }

    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        setMenuState(!isOpen);
    });

    mobileLinks.forEach((link) => {
        link.addEventListener('click', () => {
            setMenuState(false);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setMenuState(false);
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 960) {
            setMenuState(false);
        }
    });
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
        const to = 'kidskinder@hotmail.com';
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
        const FADE_MS = 500;
        const containers = document.querySelectorAll(containerClass);
        containers.forEach(container => {
            const imageContainer = container.querySelector('.salon-image-container');
            const mainImage = imageContainer ? imageContainer.querySelector('.salon-main-image') : null;

            if (!imageContainer || !mainImage || imageSources.length <= 1) return;

            const primarySlide = document.createElement('div');
            primarySlide.className = 'salon-image-slide active';
            const secondarySlide = document.createElement('div');
            secondarySlide.className = 'salon-image-slide';

            const primaryImage = mainImage.cloneNode(true);
            const secondaryImage = mainImage.cloneNode(true);

            primarySlide.appendChild(primaryImage);
            secondarySlide.appendChild(secondaryImage);
            mainImage.remove();
            imageContainer.insertBefore(primarySlide, imageContainer.firstChild);
            imageContainer.insertBefore(secondarySlide, imageContainer.querySelector('.image-overlay'));

            let currentIndex = 0;
            let activeSlideIndex = 0;

            const slides = [primarySlide, secondarySlide];
            const images = [primaryImage, secondaryImage];

            const updateImage = () => {
                const nextIndex = (currentIndex + 1) % imageSources.length;
                const currentSlide = slides[activeSlideIndex];
                const nextSlideIndex = activeSlideIndex === 0 ? 1 : 0;
                const nextSlide = slides[nextSlideIndex];
                const nextImage = images[nextSlideIndex];

                nextImage.src = imageSources[nextIndex];
                nextImage.alt = primaryImage.alt;
                nextSlide.classList.add('active', 'is-entering');

                setTimeout(() => {
                    currentSlide.classList.remove('active');
                    nextSlide.classList.remove('is-entering');
                    currentIndex = nextIndex;
                    activeSlideIndex = nextSlideIndex;
                }, FADE_MS);
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
        'img/9.png',
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
    const galleryModal = document.getElementById('gallery-modal');
    const imageModal = document.getElementById('image-modal');
    const galleryImagesContainer = document.querySelector('.gallery-images');
    const imageSlides = Array.from(document.querySelectorAll('.image-slide'));
    const modalImages = imageSlides.map((slide) => slide.querySelector('img'));
    const closeGallery = document.getElementById('close-gallery');
    const closeImage = document.getElementById('close-image');
    const prevGalleryBtn = document.querySelector('.gallery-nav-prev');
    const nextGalleryBtn = document.querySelector('.gallery-nav-next');
    const responsiveGallery = window.matchMedia('(max-width: 960px)');
    const GALLERY_FADE_MS = 500;

    if (!galleryModal || !imageModal || !galleryImagesContainer || imageSlides.length < 2 || modalImages.some((img) => !img) || !closeGallery || !closeImage || !prevGalleryBtn || !nextGalleryBtn) {
        return;
    }
    
    const galleryLayouts = ['layout-amplias', 'layout-juegos', 'layout-arte', 'layout-auditorio'];
    const MODAL_STEP_MS = 500;
    const galleriesByCard = {
        '.salon-amplias': {
            images: [
                'img/Sala_Amarilla.jpg',
                'img/Sala_Amarilla2.jpg',
                'img/Sala_Azul.jpg',
                'img/Sala_Azul2.jpg',
                'img/Sala_Naranja.jpg',
                'img/Sala_Naranja2.jpg',
                'img/Sala_Roja.jpg',
                'img/Sala_Roja2.jpg'
            ],
            alt: 'Imagen de aula amplia',
            layoutClass: 'layout-amplias'
        },
        '.salon-juegos': {
            images: [
                'img/9.png',
                'img/Juegos2.jpg',
                'img/Juegos3.jpg'
            ],
            alt: 'Imagen de zona de juegos',
            layoutClass: 'layout-juegos'
        },
        '.salon-cafeteria': {
            images: ['img/Cafeteria.jpg'],
            alt: 'Imagen de la cafeteria'
        },
        '.salon-arte': {
            images: [
                'img/Sala_Artes.jpg',
                'img/Sala_Artes2.jpg'
            ],
            alt: 'Imagen de arte y creatividad',
            layoutClass: 'layout-arte'
        },
        '.salon-auditorio': {
            images: [
                'img/Auditorio.jpg',
                'img/Auditorio2.jpg'
            ],
            alt: 'Imagen del auditorio',
            layoutClass: 'layout-auditorio'
        },
        '.salon-tecnologia': {
            images: ['img/Sala_Informatica.jpg'],
            alt: 'Imagen de sala informatica'
        }
    };

    const galleryState = {
        images: [],
        alt: '',
        index: 0,
        animating: false,
        activeSlide: 0
    };
    let galleryOpenTimer;
    let galleryCloseTimer;
    let imageOpenTimer;
    let imageCloseTimer;
    let isGalleryClosing = false;
    let isImageClosing = false;

    const clearGalleryLayout = () => {
        galleryImagesContainer.classList.remove(...galleryLayouts);
    };

    function clearManagedModalTimers(type) {
        if (type === 'gallery') {
            clearTimeout(galleryOpenTimer);
            clearTimeout(galleryCloseTimer);
            return;
        }

        clearTimeout(imageOpenTimer);
        clearTimeout(imageCloseTimer);
    }

    function openManagedModal(modalEl, type) {
        clearManagedModalTimers(type);

        if (type === 'gallery') {
            isGalleryClosing = false;
        } else {
            isImageClosing = false;
        }

        modalEl.classList.add('is-mounted');

        requestAnimationFrame(() => {
            modalEl.classList.add('is-overlay-visible');
        });

        const timer = setTimeout(() => {
            const isClosing = type === 'gallery' ? isGalleryClosing : isImageClosing;
            if (!isClosing) {
                modalEl.classList.add('is-popup-visible');
            }
        }, MODAL_STEP_MS);

        if (type === 'gallery') {
            galleryOpenTimer = timer;
        } else {
            imageOpenTimer = timer;
        }
    }

    function closeManagedModal(modalEl, type, onClosed) {
        const isClosing = type === 'gallery' ? isGalleryClosing : isImageClosing;
        if (isClosing) return;

        if (type === 'gallery') {
            isGalleryClosing = true;
        } else {
            isImageClosing = true;
        }

        clearManagedModalTimers(type);
        modalEl.classList.remove('is-popup-visible');

        const firstTimer = setTimeout(() => {
            modalEl.classList.remove('is-overlay-visible');

            const secondTimer = setTimeout(() => {
                modalEl.classList.remove('is-mounted');

                if (typeof onClosed === 'function') {
                    onClosed();
                }

                if (type === 'gallery') {
                    isGalleryClosing = false;
                } else {
                    isImageClosing = false;
                }
            }, MODAL_STEP_MS);

            if (type === 'gallery') {
                galleryCloseTimer = secondTimer;
            } else {
                imageCloseTimer = secondTimer;
            }
        }, MODAL_STEP_MS);

        if (type === 'gallery') {
            galleryCloseTimer = firstTimer;
        } else {
            imageCloseTimer = firstTimer;
        }
    }

    function updateGalleryButtons() {
        const hideButtons = galleryState.images.length <= 1;
        prevGalleryBtn.classList.toggle('is-hidden', hideButtons);
        nextGalleryBtn.classList.toggle('is-hidden', hideButtons);
    }

    function showGalleryImage(index) {
        galleryState.index = index;
        modalImages[galleryState.activeSlide].src = galleryState.images[index];
        modalImages[galleryState.activeSlide].alt = galleryState.alt;
        updateGalleryButtons();
    }

    function openImageSlider(images, altText, startIndex = 0) {
        galleryState.images = images;
        galleryState.alt = altText;
        galleryState.index = startIndex;
        galleryState.animating = false;
        galleryState.activeSlide = 0;
        imageSlides.forEach((slide, index) => {
            slide.classList.toggle('active', index === 0);
            slide.classList.remove('is-entering');
        });
        showGalleryImage(startIndex);
        openManagedModal(imageModal, 'image');
    }

    function closeImageSlider() {
        closeManagedModal(imageModal, 'image', () => {
            galleryState.images = [];
            galleryState.alt = '';
            galleryState.index = 0;
            galleryState.animating = false;
            galleryState.activeSlide = 0;
            imageSlides.forEach((slide, index) => {
                slide.classList.toggle('active', index === 0);
                slide.classList.remove('is-entering');
            });
            updateGalleryButtons();
        });
    }

    function animateGalleryBy(delta) {
        if (galleryState.animating || galleryState.images.length <= 1) return;

        galleryState.animating = true;
        const currentSlideIndex = galleryState.activeSlide;
        const nextSlideIndex = currentSlideIndex === 0 ? 1 : 0;
        const currentSlide = imageSlides[currentSlideIndex];
        const nextSlide = imageSlides[nextSlideIndex];
        const nextIndex = (galleryState.index + delta + galleryState.images.length) % galleryState.images.length;

        modalImages[nextSlideIndex].src = galleryState.images[nextIndex];
        modalImages[nextSlideIndex].alt = galleryState.alt;

        nextSlide.classList.add('active', 'is-entering');

        setTimeout(() => {
            currentSlide.classList.remove('active');
            nextSlide.classList.remove('is-entering');
            galleryState.index = nextIndex;
            galleryState.activeSlide = nextSlideIndex;
            galleryState.animating = false;
            updateGalleryButtons();
        }, GALLERY_FADE_MS);
    }

    const openGallery = (images, altText, layoutClass) => {
        galleryImagesContainer.innerHTML = '';
        clearGalleryLayout();
        if (layoutClass) galleryImagesContainer.classList.add(layoutClass);

        images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = altText;
            galleryImagesContainer.appendChild(img);
        });

        openManagedModal(galleryModal, 'gallery');
    };
    closeGallery.addEventListener('click', () => {
        closeManagedModal(galleryModal, 'gallery');
    });

    closeImage.addEventListener('click', closeImageSlider);

    prevGalleryBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        animateGalleryBy(-1);
    });

    nextGalleryBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        animateGalleryBy(1);
    });

    galleryModal.addEventListener('click', (e) => {
        if (e.target === galleryModal) {
            closeManagedModal(galleryModal, 'gallery');
        }
    });

    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            closeImageSlider();
        }
    });

    document.addEventListener('keydown', (event) => {
        const imageIsOpen = imageModal.classList.contains('is-mounted');
        const galleryIsOpen = galleryModal.classList.contains('is-mounted');
        if (!imageIsOpen && !galleryIsOpen) return;

        if (event.key === 'Escape') {
            if (galleryIsOpen) {
                closeManagedModal(galleryModal, 'gallery');
            }
            if (imageIsOpen) {
                closeImageSlider();
            }
        } else if (event.key === 'ArrowLeft' && imageIsOpen) {
            animateGalleryBy(-1);
        } else if (event.key === 'ArrowRight' && imageIsOpen) {
            animateGalleryBy(1);
        }
    });

    Object.entries(galleriesByCard).forEach(([selector, config]) => {
        const card = document.querySelector(selector);
        if (!card) return;

        card.addEventListener('click', () => {
            if (responsiveGallery.matches || config.images.length === 1) {
                openImageSlider(config.images, config.alt);
                return;
            }

            openGallery(config.images, config.alt, config.layoutClass);
        });
    });
});

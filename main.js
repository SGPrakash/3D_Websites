import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene setup
let scene, camera, renderer;
let currentTheme = 'cyber';

function initScene() {
    scene = new THREE.Scene();
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#bg'),
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
    pointLight2.position.set(10, -10, -10);
    scene.add(pointLight2);
}

// Theme configurations
const themes = {
    cyber: {
        colors: {
            primary: 0x64ffda,
            secondary: 0x0a192f
        },
        particleCount: 150,
        particleSize: 0.15,
        particleSpeed: 0.05,
        particleType: 'cube',
        rotationSpeed: 0.01,
        particleOpacity: 0.8
    },
    galaxy: {
        colors: {
            primary: 0xbd93f9,
            secondary: 0x282a36
        },
        particleCount: 200,
        particleSize: 0.1,
        particleSpeed: 0.03,
        particleType: 'sphere',
        rotationSpeed: 0.005,
        particleOpacity: 0.9
    },
    matrix: {
        colors: {
            primary: 0x50fa7b,
            secondary: 0x282a36
        },
        particleCount: 300,
        particleSize: 0.12,
        particleSpeed: 0.08,
        particleType: 'text',
        rotationSpeed: 0.002,
        particleOpacity: 0.7
    }
};

class ParticleSystem {
    constructor(theme) {
        this.particles = [];
        this.theme = theme;
        this.init();
    }

    init() {
        // Clear existing particles
        this.particles.forEach(p => scene.remove(p));
        this.particles = [];

        // Create new particles
        for (let i = 0; i < this.theme.particleCount; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        let geometry;
        const size = this.theme.particleSize * (0.5 + Math.random() * 0.5);

        switch (this.theme.particleType) {
            case 'cube':
                geometry = new THREE.BoxGeometry(size, size, size);
                break;
            case 'text':
                geometry = new THREE.PlaneGeometry(size * 2, size * 2);
                break;
            default:
                geometry = new THREE.SphereGeometry(size, 8, 8);
        }

        const material = new THREE.MeshPhongMaterial({
            color: Math.random() > 0.5 ? this.theme.colors.primary : this.theme.colors.secondary,
            emissive: this.theme.colors.primary,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: this.theme.particleOpacity,
            shininess: 50
        });

        const particle = new THREE.Mesh(geometry, material);
        
        // Set initial position based on theme
        if (this.theme.particleType === 'text') {
            particle.position.set(
                THREE.MathUtils.randFloatSpread(100),
                THREE.MathUtils.randFloat(0, 100),
                THREE.MathUtils.randFloatSpread(50)
            );
            particle.velocity = new THREE.Vector3(0, -this.theme.particleSpeed, 0);
        } else if (this.theme.particleType === 'sphere') {
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const radius = 20 + Math.random() * 30;
            
            particle.position.x = radius * Math.sin(theta) * Math.cos(phi);
            particle.position.y = radius * Math.sin(theta) * Math.sin(phi);
            particle.position.z = radius * Math.cos(theta);
            
            particle.velocity = new THREE.Vector3(
                Math.cos(phi) * this.theme.particleSpeed * 0.05,
                Math.sin(phi) * this.theme.particleSpeed * 0.05,
                Math.sin(theta) * this.theme.particleSpeed * 0.05
            );
        } else {
            particle.position.set(
                THREE.MathUtils.randFloatSpread(80),
                THREE.MathUtils.randFloatSpread(80),
                THREE.MathUtils.randFloatSpread(80)
            );
            particle.velocity = new THREE.Vector3(
                THREE.MathUtils.randFloatSpread(this.theme.particleSpeed),
                THREE.MathUtils.randFloatSpread(this.theme.particleSpeed),
                THREE.MathUtils.randFloatSpread(this.theme.particleSpeed)
            );
        }

        particle.originalY = particle.position.y;
        particle.rotationSpeed = {
            x: THREE.MathUtils.randFloatSpread(this.theme.rotationSpeed),
            y: THREE.MathUtils.randFloatSpread(this.theme.rotationSpeed),
            z: THREE.MathUtils.randFloatSpread(this.theme.rotationSpeed)
        };

        scene.add(particle);
        this.particles.push(particle);
    }

    update() {
        this.particles.forEach(particle => {
            if (currentTheme === 'matrix') {
                particle.position.y -= this.theme.particleSpeed;
                if (particle.position.y < -100) {
                    particle.position.y = 100;
                    particle.position.x = THREE.MathUtils.randFloatSpread(100);
                }
            } else if (currentTheme === 'galaxy') {
                const radius = Math.sqrt(
                    particle.position.x ** 2 + 
                    particle.position.z ** 2
                );
                
                const angle = Math.atan2(particle.position.z, particle.position.x) + 
                             this.theme.particleSpeed * 0.01;
                
                particle.position.x = Math.cos(angle) * radius;
                particle.position.z = Math.sin(angle) * radius;
                
                particle.position.y += particle.velocity.y;
                if (Math.abs(particle.position.y - particle.originalY) > 10) {
                    particle.velocity.y *= -1;
                }
            } else {
                particle.position.add(particle.velocity);
                
                ['x', 'y', 'z'].forEach(axis => {
                    if (particle.position[axis] > 50) particle.position[axis] = -50;
                    if (particle.position[axis] < -50) particle.position[axis] = 50;
                });
            }

            particle.rotation.x += particle.rotationSpeed.x;
            particle.rotation.y += particle.rotationSpeed.y;
            particle.rotation.z += particle.rotationSpeed.z;
        });
    }
}

let particleSystem;

function animate() {
    requestAnimationFrame(animate);

    if (particleSystem) {
        particleSystem.update();
    }

    // Static camera position - no mouse tracking
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize everything
initScene();
particleSystem = new ParticleSystem(themes[currentTheme]);
animate();

// Theme switching
function updateTheme(themeName) {
    if (themeName === currentTheme) return;
    currentTheme = themeName;
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === themeName) {
            btn.classList.add('active');
        }
    });

    particleSystem = new ParticleSystem(themes[themeName]);
}

// Add event listeners
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        updateTheme(btn.dataset.theme);
    });
});

// Settings panel functionality
document.addEventListener('DOMContentLoaded', function() {
    const settingsToggle = document.getElementById('settings-toggle');
    const controlPanel = document.querySelector('.control-panel');
    const closeBtn = document.querySelector('.close-btn');

    settingsToggle.addEventListener('click', () => {
        controlPanel.classList.toggle('hidden');
    });

    closeBtn.addEventListener('click', () => {
        controlPanel.classList.add('hidden');
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!controlPanel.contains(e.target) && !settingsToggle.contains(e.target)) {
            controlPanel.classList.add('hidden');
        }
    });

    // Color switching functionality
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const color = btn.dataset.color;
            const colorMap = {
                teal: { primary: '#64ffda', rgb: '100, 255, 218' },
                purple: { primary: '#bd93f9', rgb: '189, 147, 249' },
                orange: { primary: '#ffb86c', rgb: '255, 184, 108' },
                pink: { primary: '#ff79c6', rgb: '255, 121, 198' },
                blue: { primary: '#8be9fd', rgb: '139, 233, 253' }
            };
            
            if (colorMap[color]) {
                document.documentElement.style.setProperty('--primary-color', colorMap[color].primary);
                document.documentElement.style.setProperty('--primary-color-rgb', colorMap[color].rgb);
            }
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // CCTV Price Estimator
    const cctvForm = document.getElementById('cctv-estimator-form');
    if (cctvForm) {
        cctvForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateCCTVPrice();
        });
    }

    function calculateCCTVPrice() {
        // Get form values
        const propertyType = document.getElementById('property-type').value;
        const cameraCount = document.getElementById('camera-count').value;
        const cameraQuality = document.getElementById('camera-quality').value;
        const storage = document.getElementById('storage').value;
        const area = document.getElementById('area').value || 1000;

        // Get additional features
        const nightVision = document.getElementById('night-vision').checked;
        const mobileApp = document.getElementById('mobile-app').checked;
        const motionDetection = document.getElementById('motion-detection').checked;
        const remoteMonitoring = document.getElementById('remote-monitoring').checked;

        // Validate required fields
        if (!propertyType || !cameraCount || !cameraQuality || !storage) {
            alert('Please fill in all required fields');
            return;
        }

        // Pricing structure (Competitive Indian market rates)
        const basePrices = {
            cameras: {
                hd: { 2: 4500, 4: 8500, 8: 16000, 16: 30000, custom: 38000 },
                fhd: { 2: 6000, 4: 11500, 8: 22000, 16: 42000, custom: 52000 },
                '4k': { 2: 9000, 4: 17000, 8: 32000, 16: 60000, custom: 75000 }
            },
            storage: {
                '1tb': 1500,
                '2tb': 2500,
                '4tb': 4000,
                '8tb': 6500
            },
            propertyMultiplier: {
                home: 1.0,
                office: 1.1,
                warehouse: 1.3,
                retail: 1.15
            }
        };

        // Calculate equipment cost
        let equipmentCost = basePrices.cameras[cameraQuality][cameraCount] || basePrices.cameras[cameraQuality].custom;
        equipmentCost += basePrices.storage[storage];
        equipmentCost *= basePrices.propertyMultiplier[propertyType];

        // Calculate installation cost (based on area and camera count)
        const cameraCountNum = cameraCount === 'custom' ? 20 : parseInt(cameraCount);
        let installationCost = (cameraCountNum * 800) + (Math.ceil(area / 1000) * 1000);

        // Calculate additional features cost
        let featuresCost = 0;
        if (nightVision) featuresCost += cameraCountNum * 300;
        if (mobileApp) featuresCost += 1000;
        if (motionDetection) featuresCost += cameraCountNum * 200;
        if (remoteMonitoring) featuresCost += 2500;

        // Calculate total
        const totalCost = equipmentCost + installationCost + featuresCost;

        // Display results
        document.getElementById('equipment-cost').textContent = `₹${equipmentCost.toLocaleString()}`;
        document.getElementById('installation-cost').textContent = `₹${installationCost.toLocaleString()}`;
        document.getElementById('features-cost').textContent = `₹${featuresCost.toLocaleString()}`;
        document.getElementById('total-cost').textContent = `₹${totalCost.toLocaleString()}`;

        // Show the estimate
        document.getElementById('price-estimate').classList.remove('hidden');
        
        // Scroll to estimate
        document.getElementById('price-estimate').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Add floating animation to service cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe service cards and other animated elements
    document.querySelectorAll('.service-card, .feature-card, .testimonial-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Enhanced Auto-scrolling Ad Banner with YAML Configuration
class EnhancedAdBanner {
    constructor() {
        this.adsData = null;
        this.settings = null;
        this.currentSlide = 0;
        this.adInterval = null;
        this.progressInterval = null;
        this.slides = [];
        this.indicators = [];
        
        this.init();
    }

    async init() {
        try {
            await this.loadConfiguration();
            this.generateSlides();
            this.setupEventListeners();
            this.startAutoScroll();
        } catch (error) {
            console.error('Failed to initialize ad banner:', error);
            this.fallbackToStaticAds();
        }
    }

    async loadConfiguration() {
        try {
            const response = await fetch('ads-config.yml');
            const yamlText = await response.text();
            const config = this.parseYAML(yamlText);
            
            this.adsData = config.ads;
            this.settings = config.settings;
        } catch (error) {
            throw new Error('Failed to load ads configuration: ' + error.message);
        }
    }

    parseYAML(yamlText) {
        // Simple YAML parser for our specific structure
        const lines = yamlText.split('\n');
        const config = { ads: [], settings: {} };
        let currentAd = null;
        let currentSection = null;
        let inFeatures = false;

        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#')) continue;

            if (line === 'ads:') {
                currentSection = 'ads';
                continue;
            }
            if (line === 'settings:') {
                currentSection = 'settings';
                continue;
            }

            if (currentSection === 'ads') {
                if (line.startsWith('- id:')) {
                    if (currentAd) config.ads.push(currentAd);
                    currentAd = { features: [] };
                    currentAd.id = parseInt(line.split(':')[1].trim());
                    inFeatures = false;
                } else if (currentAd) {
                    if (line === 'features:') {
                        inFeatures = true;
                    } else if (inFeatures && line.startsWith('-')) {
                        currentAd.features.push(line.substring(1).trim().replace(/"/g, ''));
                    } else if (line.includes(':')) {
                        const [key, value] = line.split(':').map(s => s.trim());
                        currentAd[key] = value.replace(/"/g, '');
                    }
                }
            } else if (currentSection === 'settings' && line.includes(':')) {
                const [key, value] = line.split(':').map(s => s.trim());
                if (value === 'true') config.settings[key] = true;
                else if (value === 'false') config.settings[key] = false;
                else if (!isNaN(value)) config.settings[key] = parseInt(value);
                else config.settings[key] = value.replace(/"/g, '');
            }
        }
        
        if (currentAd) config.ads.push(currentAd);
        return config;
    }

    generateSlides() {
        const adContent = document.getElementById('ad-content');
        const adIndicators = document.getElementById('ad-indicators');
        
        if (!adContent || !adIndicators) return;

        // Clear existing content
        adContent.innerHTML = '';
        adIndicators.innerHTML = '';

        this.adsData.forEach((ad, index) => {
            // Create slide
            const slide = document.createElement('div');
            slide.className = `ad-slide ${index === 0 ? 'active' : ''}`;
            slide.style.backgroundImage = `url(${ad.image})`;
            slide.style.backgroundColor = ad.background_color;

            slide.innerHTML = `
                <div class="ad-text-content">
                    <h2 class="ad-title">${ad.title}</h2>
                    <h3 class="ad-subtitle">${ad.subtitle}</h3>
                    <p class="ad-description">${ad.description}</p>
                    <div class="ad-features">
                        ${ad.features.map(feature => `<div class="ad-feature">${feature}</div>`).join('')}
                    </div>
                    <a href="${ad.cta_action}" class="ad-cta">${ad.cta_text}</a>
                </div>
                <div class="ad-image-content">
                    <img src="${ad.image}" alt="${ad.title}" class="ad-image" onerror="this.style.display='none'">
                </div>
            `;

            adContent.appendChild(slide);

            // Create indicator
            const indicator = document.createElement('span');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.addEventListener('click', () => this.goToSlide(index));
            adIndicators.appendChild(indicator);
        });

        this.slides = document.querySelectorAll('.ad-slide');
        this.indicators = document.querySelectorAll('.indicator');
    }

    setupEventListeners() {
        // Control buttons
        const prevBtn = document.getElementById('ad-prev');
        const nextBtn = document.getElementById('ad-next');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());

        // Hover pause functionality
        const adBanner = document.getElementById('enhanced-ad-banner');
        if (adBanner && this.settings.pause_on_hover) {
            adBanner.addEventListener('mouseenter', () => this.stopAutoScroll());
            adBanner.addEventListener('mouseleave', () => this.startAutoScroll());
        }

        // CTA click handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ad-cta')) {
                this.handleCTAClick(e.target);
            }
        });
    }

    handleCTAClick(ctaElement) {
        const href = ctaElement.getAttribute('href');
        
        if (href.startsWith('tel:')) {
            window.location.href = href;
        } else if (href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        } else if (href.startsWith('http')) {
            window.open(href, '_blank');
        }
    }

    goToSlide(index) {
        this.stopAutoScroll();
        this.showSlide(index);
        this.startAutoScroll();
    }

    showSlide(index) {
        if (index === this.currentSlide) return; // Prevent unnecessary transitions
        
        // Remove active class from indicators
        this.indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Handle current slide transition out
        if (this.slides[this.currentSlide]) {
            this.slides[this.currentSlide].classList.remove('active');
            this.slides[this.currentSlide].classList.add('prev');
        }
        
        // Update current slide index
        const previousSlide = this.currentSlide;
        this.currentSlide = index;
        
        // Clean up all slides first
        setTimeout(() => {
            this.slides.forEach((slide, i) => {
                if (i !== this.currentSlide && i !== previousSlide) {
                    slide.classList.remove('active', 'prev');
                }
            });
        }, 50);
        
        // Show new slide with slight delay to ensure smooth transition
        setTimeout(() => {
            if (this.slides[this.currentSlide]) {
                this.slides[this.currentSlide].classList.remove('prev');
                this.slides[this.currentSlide].classList.add('active');
            }
            if (this.indicators[this.currentSlide]) {
                this.indicators[this.currentSlide].classList.add('active');
            }
        }, 100);
        
        // Clean up previous slide after transition
        setTimeout(() => {
            if (this.slides[previousSlide]) {
                this.slides[previousSlide].classList.remove('prev');
            }
        }, 700); // After CSS transition completes (0.6s + 100ms buffer)
        
        this.resetProgressBar();
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
    }

    previousSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
    }

    startAutoScroll() {
        if (this.adInterval) return;
        
        const interval = this.settings?.auto_scroll_interval || 5000;
        this.adInterval = setInterval(() => this.nextSlide(), interval);
        
        if (this.settings?.show_progress_bar) {
            this.startProgressBar();
        }
    }

    stopAutoScroll() {
        if (this.adInterval) {
            clearInterval(this.adInterval);
            this.adInterval = null;
        }
        this.stopProgressBar();
    }

    startProgressBar() {
        const progressFill = document.querySelector('.ad-progress-fill');
        if (!progressFill) return;

        const interval = this.settings?.auto_scroll_interval || 5000;
        progressFill.style.transition = `width ${interval}ms linear`;
        progressFill.style.width = '100%';
    }

    stopProgressBar() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    resetProgressBar() {
        const progressFill = document.querySelector('.ad-progress-fill');
        if (!progressFill) return;

        progressFill.style.transition = 'none';
        progressFill.style.width = '0%';
        
        setTimeout(() => {
            if (this.adInterval) {
                this.startProgressBar();
            }
        }, 50);
    }

    fallbackToStaticAds() {
        // Fallback to static ads if YAML loading fails
        const staticAds = [
            {
                title: "🚀 Limited Time Offer!",
                subtitle: "Get 30% OFF on CCTV Installation",
                description: "Professional CCTV installation with FREE maintenance for 1 year.",
                cta_text: "Call Now: 8742326660",
                cta_action: "tel:8742326660",
                background_color: "#1e3a8a",
                features: ["HD 4K Resolution", "24/7 Monitoring", "Mobile App", "Free Maintenance"]
            }
        ];
        
        this.adsData = staticAds;
        this.settings = { auto_scroll_interval: 5000, pause_on_hover: true };
        this.generateSlides();
        this.setupEventListeners();
        this.startAutoScroll();
    }
}

// Initialize Enhanced Ad Banner
document.addEventListener('DOMContentLoaded', function() {
    new EnhancedAdBanner();
});

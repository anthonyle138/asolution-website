/**
 * Three.js Particle Background System
 * Solo Leveling Shadow Monarch Aesthetic
 * Optimized for performance with fallbacks
 */

(function() {
    'use strict';

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        console.log('Particles disabled: reduced motion preferred');
        return;
    }

    // Configuration
    const CONFIG = {
        particleCount: getParticleCount(),
        particleSize: 2.5,
        particleColor: 0xb829f8, // Neon purple
        particleOpacity: 0.6,
        particleSpeed: 0.2,
        mouseInfluence: 0.15,
        rotationSpeed: 0.0005
    };

    // Determine particle count based on device
    function getParticleCount() {
        const width = window.innerWidth;
        if (width < 480) return 600;  // Mobile small
        if (width < 768) return 1000; // Mobile
        if (width < 1024) return 1200; // Tablet
        return 1800; // Desktop
    }

    // Three.js variables
    let scene, camera, renderer, particles, particleGeometry, particleMaterial;
    let mouseX = 0, mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    // Initialize Three.js scene
    function init() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) {
            console.error('Particles canvas not found');
            return;
        }

        // Create scene
        scene = new THREE.Scene();

        // Create camera
        camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 500;

        // Create renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance

        // Create particle system
        createParticles();

        // Event listeners
        document.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('resize', onWindowResize, false);

        // Start animation
        animate();
    }

    // Create particle system using BufferGeometry for performance
    function createParticles() {
        particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(CONFIG.particleCount * 3);
        const velocities = new Float32Array(CONFIG.particleCount * 3);
        const opacities = new Float32Array(CONFIG.particleCount);

        // Initialize particle positions, velocities, and opacities
        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;

            // Random positions in 3D space
            positions[i3] = (Math.random() - 0.5) * 2000; // x
            positions[i3 + 1] = (Math.random() - 0.5) * 2000; // y
            positions[i3 + 2] = (Math.random() - 0.5) * 1000; // z (depth)

            // Random velocities for floating motion
            velocities[i3] = (Math.random() - 0.5) * CONFIG.particleSpeed;
            velocities[i3 + 1] = Math.random() * CONFIG.particleSpeed * 0.5; // Slight upward drift
            velocities[i3 + 2] = (Math.random() - 0.5) * CONFIG.particleSpeed * 0.5;

            // Random opacity for depth effect
            opacities[i] = 0.2 + Math.random() * 0.6; // 0.2 to 0.8
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        particleGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

        // Create material with additive blending for glow effect
        particleMaterial = new THREE.PointsMaterial({
            color: CONFIG.particleColor,
            size: CONFIG.particleSize,
            transparent: true,
            opacity: CONFIG.particleOpacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        // Create particle system
        particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);
    }

    // Mouse move handler
    function onMouseMove(event) {
        mouseX = (event.clientX - windowHalfX) * 0.1;
        mouseY = (event.clientY - windowHalfY) * 0.1;
    }

    // Window resize handler
    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        // Recreate particles with new count if needed
        const newCount = getParticleCount();
        if (newCount !== CONFIG.particleCount) {
            CONFIG.particleCount = newCount;
            scene.remove(particles);
            particleGeometry.dispose();
            particleMaterial.dispose();
            createParticles();
        }
    }

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Update particle positions
        const positions = particleGeometry.attributes.position.array;
        const velocities = particleGeometry.attributes.velocity.array;

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;

            // Apply velocity
            positions[i3] += velocities[i3];
            positions[i3 + 1] += velocities[i3 + 1];
            positions[i3 + 2] += velocities[i3 + 2];

            // Wrap around screen boundaries
            if (positions[i3] > 1000) positions[i3] = -1000;
            if (positions[i3] < -1000) positions[i3] = 1000;
            if (positions[i3 + 1] > 1000) positions[i3 + 1] = -1000;
            if (positions[i3 + 1] < -1000) positions[i3 + 1] = 1000;
            if (positions[i3 + 2] > 500) positions[i3 + 2] = -500;
            if (positions[i3 + 2] < -500) positions[i3 + 2] = 500;
        }

        particleGeometry.attributes.position.needsUpdate = true;

        // Subtle rotation
        particles.rotation.y += CONFIG.rotationSpeed;

        // Camera parallax with mouse (subtle)
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // Render scene
        renderer.render(scene, camera);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (particleGeometry) particleGeometry.dispose();
        if (particleMaterial) particleMaterial.dispose();
        if (renderer) renderer.dispose();
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

import * as THREE from 'https://esm.sh/three@0.157.0';
import { OrbitControls } from 'https://esm.sh/three@0.157.0/examples/jsm/controls/OrbitControls.js?alias=three:three';
import gsap from 'https://esm.sh/gsap@3.12.2';
import { ScrollTrigger } from 'https://esm.sh/gsap@3.12.2/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Configuration
const CONFIG = {
    canvasId: 'canvas-3d',
    bgColor: 0xf8f9fa, // Matches --bg-off-white
    fogColor: 0xf8f9fa,
    houseColor: 0x2C3E50, // --primary-light
    accentColor: 0xC0A062 // --accent
};

class Scene3D {
    constructor() {
        this.container = document.getElementById('canvas-container-3d');
        if (!this.container) return;

        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.init();
        this.createHouse();
        this.addEffectiveLights();
        this.setupScrollAnimation();
        this.animate();

        window.addEventListener('resize', () => this.onResize());
        this.onResize(); // Initial check
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.bgColor);
        this.scene.fog = new THREE.Fog(CONFIG.fogColor, 10, 50);

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
        this.camera.position.set(8, 5, 8);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Controls (optional, restricted)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.enableZoom = false;
        this.controls.enablePan = false;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
    }

    createHouse() {
        this.houseGroup = new THREE.Group();
        this.currentSceneGroup = this.houseGroup; // For animation compatibility

        // Materials (Original "Cute" Palette)
        const foundationMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.9 });
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.8 }); // White
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x0c2461, roughness: 0.6, metalness: 0.1 }); // Blue
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 }); // Brown

        // Base
        const base = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.2, 4.2), foundationMat);
        base.position.y = 0.1;
        base.receiveShadow = true;
        this.houseGroup.add(base);

        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.5, 3.5), wallMat);
        body.position.y = 1.35;
        body.castShadow = true;
        body.receiveShadow = true;
        this.houseGroup.add(body);

        // Roof (Cone)
        const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.8, 4), roofMat);
        roof.position.y = 3.5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        this.houseGroup.add(roof);

        // Chimney
        const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.6), foundationMat);
        chimney.position.set(1.2, 3.2, -0.5);
        chimney.castShadow = true;
        this.houseGroup.add(chimney);

        // Door
        const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 0.1), woodMat);
        doorFrame.position.set(0, 0.9, 1.76);
        this.houseGroup.add(doorFrame);

        // Windows using helper
        this.addWindow(1, 1.5, 1.76);
        this.addWindow(-1, 1.5, 1.76);
        this.addWindow(1.76, 1.5, 0, Math.PI / 2);
        this.addWindow(-1.76, 1.5, 0, Math.PI / 2);

        this.scene.add(this.houseGroup);
    }

    addWindow(x, y, z, rotY = 0) {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
        frame.position.set(x, y, z);
        frame.rotation.y = rotY;
        this.houseGroup.add(frame);

        const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshStandardMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.6,
            roughness: 0,
            metalness: 0.9
        }));
        glass.position.set(x, y, z + (rotY ? 0 : 0.06));
        if (rotY) glass.position.x += 0.06;
        glass.rotation.y = rotY;
        this.houseGroup.add(glass);
    }

    addEffectiveLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        this.scene.add(dirLight);
    }

    setupScrollAnimation() {
        // Stop auto rotation when scrolling starts interacting
        ScrollTrigger.create({
            trigger: "body",
            start: "top top",
            onEnter: () => {
                this.controls.autoRotate = false;
            },
            onLeaveBack: () => {
                this.controls.autoRotate = true;
            }
        });

        // Rotate House on Scroll
        if (this.currentSceneGroup) {
            gsap.to(this.currentSceneGroup.rotation, {
                y: Math.PI * 2,
                ease: "none",
                scrollTrigger: {
                    trigger: "body",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1
                }
            });
        }

        // Camera zoom/movement effect
        gsap.to(this.camera.position, {
            z: 12,
            y: 8,
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: "#about",
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });
    }

    onResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);

        // Adjust camera distance based on screen width
        if (this.width < 768) {
            this.camera.position.z = 11; // Move back on mobile
        } else {
            this.camera.position.z = 8;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Scene3D();
});

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
        this.createRandomScene();
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

    createRandomScene() {
        this.currentSceneGroup = new THREE.Group();
        this.scene.add(this.currentSceneGroup);

        const scenes = [
            this.createHouse.bind(this),
            this.createSkyscraper.bind(this),
            this.createCrane.bind(this)
        ];

        const randomScene = scenes[Math.floor(Math.random() * scenes.length)];
        // const randomScene = scenes[2]; // Debug: force specific scene
        randomScene();
    }

    createHouse() {
        const group = this.currentSceneGroup;
        // Materials
        const foundationMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.9 });
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.8 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x0c2461, roughness: 0.6, metalness: 0.1 });
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 });

        // Base
        const base = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.2, 4.2), foundationMat);
        base.position.y = 0.1;
        base.receiveShadow = true;
        group.add(base);

        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.5, 3.5), wallMat);
        body.position.y = 1.35;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.8, 4), roofMat);
        roof.position.y = 3.5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        // Details (Chimney, Door, Windows)
        // ... (Simplified for brevity, or kept if essential)
        this.addHouseDetails(group, foundationMat, woodMat);
    }

    addHouseDetails(group, foundationMat, woodMat) {
        // Chimney
        const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.6), foundationMat);
        chimney.position.set(1.2, 3.2, -0.5);
        chimney.castShadow = true;
        group.add(chimney);

        // Door
        const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 0.1), woodMat);
        doorFrame.position.set(0, 0.9, 1.76);
        group.add(doorFrame);

        this.addWindow(group, 1, 1.5, 1.76);
        this.addWindow(group, -1, 1.5, 1.76);
    }

    createSkyscraper() {
        const group = this.currentSceneGroup;

        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x3498db,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.8
        });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.4, metalness: 0.8 });

        // Base
        const base = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 3), metalMat);
        base.position.y = 0.25;
        base.receiveShadow = true;
        group.add(base);

        // Tower
        const towerHeight = 7;
        const tower = new THREE.Mesh(new THREE.BoxGeometry(2, towerHeight, 2), glassMat);
        tower.position.y = 0.5 + towerHeight / 2;
        tower.castShadow = true;
        group.add(tower);

        // Structural reinforcing (Grid)
        for (let i = 1; i < towerHeight; i += 1.5) {
            const ring = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 2.1), metalMat);
            ring.position.y = 0.5 + i;
            group.add(ring);
        }

        // Antenna
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 2), metalMat);
        antenna.position.y = 0.5 + towerHeight + 1;
        group.add(antenna);
    }

    createCrane() {
        const group = this.currentSceneGroup;
        const paintMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.7 }); // Yellow
        const concreteMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6, roughness: 0.9 });

        // Foundation
        const base = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 2), concreteMat);
        base.position.y = 0.25;
        base.receiveShadow = true;
        group.add(base);

        // Tower (Mast)
        const mastHeight = 8;
        const mastGeo = new THREE.BoxGeometry(0.3, mastHeight, 0.3);
        const mast = new THREE.Mesh(mastGeo, paintMat);
        mast.position.y = 0.5 + mastHeight / 2;
        mast.castShadow = true;
        group.add(mast);

        // Jib (Arm)
        const jibLength = 5;
        const jib = new THREE.Mesh(new THREE.BoxGeometry(jibLength, 0.3, 0.3), paintMat);
        jib.position.set(1.5, 0.5 + mastHeight - 0.5, 0);
        group.add(jib);

        // Counterweight
        const counter = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 0.6), concreteMat);
        counter.position.set(-1, 0.5 + mastHeight - 0.5, 0);
        group.add(counter);

        // Cable & Hook
        const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3), new THREE.MeshStandardMaterial({ color: 0x000000 }));
        cable.position.set(3, 0.5 + mastHeight - 0.5 - 1.5, 0);
        group.add(cable);

        const hook = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), paintMat);
        hook.position.set(3, 0.5 + mastHeight - 0.5 - 3, 0);
        group.add(hook);
    }

    addWindow(group, x, y, z, rotY = 0) {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
        frame.position.set(x, y, z);
        frame.rotation.y = rotY;
        group.add(frame);
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

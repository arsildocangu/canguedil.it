import * as THREE from 'https://esm.sh/three@0.157.0';
import { OrbitControls } from 'https://esm.sh/three@0.157.0/examples/jsm/controls/OrbitControls.js?alias=three:three';
import gsap from 'https://esm.sh/gsap@3.12.2';
import { ScrollTrigger } from 'https://esm.sh/gsap@3.12.2/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Configuration
const CONFIG = {
    fogColor: 0x0b0f14,
    accentColor: 0xC0A062, // --accent
    steelColor: 0x2C3E50, // --primary-light
    concreteColor: 0x7f8c8d,
    mobileBreakpoint: 768
};

class Scene3D {
    constructor() {
        this.container = document.getElementById('canvas-container-3d');
        if (!this.container) return;

        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

        if (!this.init()) {
            return;
        }

        this.createConstructionSite();
        this.addEffectiveLights();

        if (!this.reducedMotion) {
            this.setupScrollAnimation();
            this.animate();
        } else {
            this.renderOnce();
        }

        window.addEventListener('resize', () => this.onResize());
        this.onResize(); // Initial check
    }

    init() {
        this.clock = new THREE.Clock();

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = null;
        this.scene.fog = new THREE.Fog(CONFIG.fogColor, 14, 70);

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
        this.camera.position.set(10, 6.5, 11);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        try {
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch (error) {
            console.warn('WebGL renderer unavailable, disabling 3D.', error);
            return false;
        }
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.05;
        this.container.appendChild(this.renderer.domElement);

        // Controls (optional, restricted)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.enableZoom = false;
        this.controls.enablePan = false;
        this.controls.autoRotate = !this.reducedMotion;
        this.controls.autoRotateSpeed = 0.5;

        return true;
    }

    createConstructionSite() {
        this.siteGroup = new THREE.Group();
        this.currentSceneGroup = this.siteGroup;

        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x0f141a,
            roughness: 1,
            metalness: 0
        });
        const steelMat = new THREE.MeshStandardMaterial({
            color: CONFIG.steelColor,
            roughness: 0.55,
            metalness: 0.65
        });
        const craneMat = new THREE.MeshStandardMaterial({
            color: CONFIG.accentColor,
            roughness: 0.6,
            metalness: 0.2
        });
        const concreteMat = new THREE.MeshStandardMaterial({
            color: CONFIG.concreteColor,
            roughness: 0.95,
            metalness: 0
        });

        // Ground
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.siteGroup.add(ground);

        // Main building skeleton
        const building = this.createBuildingSkeleton({ steelMat, concreteMat });
        building.position.set(-2.2, 0, 1.0);
        this.siteGroup.add(building);

        // Crane
        const crane = this.createCrane({ craneMat, concreteMat });
        crane.position.set(6.8, 0, -1.5);
        this.siteGroup.add(crane);

        // Background skyline (simple blocks for "palazzi")
        const skyline = this.createSkyline({ steelMat });
        skyline.position.set(0, 0, -22);
        this.siteGroup.add(skyline);

        // Small material stacks
        const stacks = this.createMaterialStacks({ concreteMat, steelMat });
        stacks.position.set(2.4, 0, 6.0);
        this.siteGroup.add(stacks);

        this.scene.add(this.siteGroup);
    }

    createBuildingSkeleton({ steelMat, concreteMat }) {
        const group = new THREE.Group();

        const base = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.55, 7.2), concreteMat);
        base.position.y = 0.275;
        base.receiveShadow = true;
        group.add(base);

        const floors = 9;
        const floorHeight = 0.8;
        const width = 5.8;
        const depth = 5.4;
        const columnSize = 0.18;
        const beamSize = 0.14;

        const totalHeight = floors * floorHeight;
        const columnGeo = new THREE.BoxGeometry(columnSize, totalHeight, columnSize);
        const x0 = width / 2 - columnSize / 2;
        const z0 = depth / 2 - columnSize / 2;

        const corners = [
            [x0, z0],
            [x0, -z0],
            [-x0, z0],
            [-x0, -z0]
        ];

        corners.forEach(([x, z]) => {
            const col = new THREE.Mesh(columnGeo, steelMat);
            col.position.set(x, 0.55 + totalHeight / 2, z);
            col.castShadow = true;
            group.add(col);
        });

        const beamXGeo = new THREE.BoxGeometry(width, beamSize, beamSize);
        const beamZGeo = new THREE.BoxGeometry(beamSize, beamSize, depth);

        for (let i = 0; i <= floors; i += 1) {
            const y = 0.55 + i * floorHeight;

            const beamTop = new THREE.Mesh(beamXGeo, steelMat);
            beamTop.position.set(0, y, z0);
            beamTop.castShadow = true;
            group.add(beamTop);

            const beamBottom = new THREE.Mesh(beamXGeo, steelMat);
            beamBottom.position.set(0, y, -z0);
            beamBottom.castShadow = true;
            group.add(beamBottom);

            const beamLeft = new THREE.Mesh(beamZGeo, steelMat);
            beamLeft.position.set(-x0, y, 0);
            beamLeft.castShadow = true;
            group.add(beamLeft);

            const beamRight = new THREE.Mesh(beamZGeo, steelMat);
            beamRight.position.set(x0, y, 0);
            beamRight.castShadow = true;
            group.add(beamRight);

            // Partial slabs on alternating floors
            if (i > 0 && i % 2 === 0) {
                const slab = new THREE.Mesh(new THREE.BoxGeometry(width - 0.25, 0.07, depth - 0.25), concreteMat);
                slab.position.set(0, y + 0.06, 0);
                slab.receiveShadow = true;
                slab.castShadow = true;
                group.add(slab);
            }
        }

        // Core shaft (elevator/stairs)
        const core = new THREE.Mesh(new THREE.BoxGeometry(1.8, totalHeight * 0.75, 1.6), concreteMat);
        core.position.set(0.6, 0.55 + (totalHeight * 0.75) / 2, -0.5);
        core.castShadow = true;
        core.receiveShadow = true;
        group.add(core);

        // Outline edges (subtle "blueprint" feel)
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(width, totalHeight, depth)),
            new THREE.LineBasicMaterial({ color: CONFIG.accentColor, transparent: true, opacity: 0.25 })
        );
        edges.position.set(0, 0.55 + totalHeight / 2, 0);
        group.add(edges);

        return group;
    }

    createCrane({ craneMat, concreteMat }) {
        const group = new THREE.Group();

        const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.55, 2.4), concreteMat);
        base.position.y = 0.275;
        base.receiveShadow = true;
        group.add(base);

        const mastHeight = 12;
        const mast = new THREE.Mesh(new THREE.BoxGeometry(0.38, mastHeight, 0.38), craneMat);
        mast.position.y = 0.55 + mastHeight / 2;
        mast.castShadow = true;
        group.add(mast);

        this.crane = {
            turntable: new THREE.Group(),
            trolley: new THREE.Group(),
            cable: null,
            hook: null,
            jibLength: 9.2
        };

        this.crane.turntable.position.y = 0.55 + mastHeight;
        group.add(this.crane.turntable);

        const jib = new THREE.Mesh(new THREE.BoxGeometry(this.crane.jibLength, 0.22, 0.22), craneMat);
        jib.position.x = this.crane.jibLength / 2 - 0.6;
        jib.castShadow = true;
        this.crane.turntable.add(jib);

        const counterJibLength = 3.6;
        const counter = new THREE.Mesh(new THREE.BoxGeometry(counterJibLength, 0.22, 0.22), craneMat);
        counter.position.x = -(counterJibLength / 2);
        counter.castShadow = true;
        this.crane.turntable.add(counter);

        const counterWeight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.65), concreteMat);
        counterWeight.position.set(-counterJibLength + 0.6, -0.35, 0);
        counterWeight.castShadow = true;
        this.crane.turntable.add(counterWeight);

        // Trolley + hook
        this.crane.trolley.position.set(1.2, -0.25, 0);
        this.crane.turntable.add(this.crane.trolley);

        const trolleyBody = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.32, 0.45), craneMat);
        trolleyBody.castShadow = true;
        this.crane.trolley.add(trolleyBody);

        const cableMat = new THREE.MeshStandardMaterial({ color: 0x0b0f14, roughness: 0.9, metalness: 0.1 });
        const cableGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 10);
        this.crane.cable = new THREE.Mesh(cableGeo, cableMat);
        this.crane.cable.position.y = -0.5;
        this.crane.trolley.add(this.crane.cable);

        this.crane.hook = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.26), concreteMat);
        this.crane.hook.position.y = -1.05;
        this.crane.hook.castShadow = true;
        this.crane.trolley.add(this.crane.hook);

        return group;
    }

    createSkyline({ steelMat }) {
        const group = new THREE.Group();
        const silhouetteMat = new THREE.MeshStandardMaterial({
            color: 0x0b0f14,
            roughness: 0.9,
            metalness: 0.2
        });

        const buildings = [
            { x: -14, w: 6, d: 6, h: 10 },
            { x: -6, w: 5, d: 5, h: 14 },
            { x: 3, w: 7, d: 6, h: 12 },
            { x: 12, w: 5, d: 5, h: 16 },
            { x: 19, w: 8, d: 6, h: 11 }
        ];

        buildings.forEach((b) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), silhouetteMat);
            mesh.position.set(b.x, b.h / 2, 0);
            group.add(mesh);

            const edges = new THREE.LineSegments(
                new THREE.EdgesGeometry(new THREE.BoxGeometry(b.w, b.h, b.d)),
                new THREE.LineBasicMaterial({ color: CONFIG.accentColor, transparent: true, opacity: 0.12 })
            );
            edges.position.copy(mesh.position);
            group.add(edges);
        });

        // Far tower for depth
        const far = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3.6, 20, 10), steelMat);
        far.position.set(-22, 10, -10);
        group.add(far);

        return group;
    }

    createMaterialStacks({ concreteMat, steelMat }) {
        const group = new THREE.Group();

        const palletMat = new THREE.MeshStandardMaterial({ color: 0x2b2f35, roughness: 0.95, metalness: 0 });
        const pallet = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, 1.2), palletMat);
        pallet.position.y = 0.09;
        pallet.receiveShadow = true;
        group.add(pallet);

        const blocks = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 1.0), concreteMat);
        blocks.position.y = 0.18 + 0.35;
        blocks.castShadow = true;
        group.add(blocks);

        for (let i = 0; i < 6; i += 1) {
            const rebar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 10), steelMat);
            rebar.rotation.z = Math.PI / 2;
            rebar.position.set(0, 1.0 + i * 0.06, 0.28 - i * 0.05);
            group.add(rebar);
        }

        return group;
    }

    addEffectiveLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.15);
        dirLight.position.set(7, 14, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1536;
        dirLight.shadow.mapSize.height = 1536;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 80;
        dirLight.shadow.camera.left = -18;
        dirLight.shadow.camera.right = 18;
        dirLight.shadow.camera.top = 18;
        dirLight.shadow.camera.bottom = -18;
        this.scene.add(dirLight);

        const fill = new THREE.DirectionalLight(0xffffff, 0.35);
        fill.position.set(-9, 7, -10);
        this.scene.add(fill);

        const hemi = new THREE.HemisphereLight(0x9bb6ff, 0x0b0f14, 0.35);
        this.scene.add(hemi);
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

        // Rotate Scene on Scroll
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
            z: 15,
            y: 9,
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
        if (this.width < CONFIG.mobileBreakpoint) {
            this.camera.position.z = 16; // Move back on mobile
        } else {
            this.camera.position.z = 11;
        }

        if (this.reducedMotion) {
            this.renderOnce();
        }
    }

    updateScene() {
        if (!this.crane) {
            return;
        }

        const t = this.clock.getElapsedTime();

        // Subtle turntable motion (keeps the scene alive without being distracting)
        this.crane.turntable.rotation.y = Math.sin(t * 0.18) * 0.25;

        // Trolley motion along the jib
        const minX = 1.2;
        const maxX = this.crane.jibLength - 1.2;
        const range = (maxX - minX) / 2;
        const mid = minX + range;
        this.crane.trolley.position.x = mid + Math.sin(t * 0.35) * range;

        // Cable length / hook bob
        const cableLength = 2.3 + (Math.sin(t * 0.55) * 0.6 + 0.6);
        this.crane.cable.scale.y = cableLength;
        this.crane.cable.position.y = -cableLength / 2;
        this.crane.hook.position.y = -(cableLength + 0.35);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateScene();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    renderOnce() {
        this.updateScene();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Scene3D();
});

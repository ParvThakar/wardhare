import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

interface Hardware3DViewerProps {
  selectedId: string;
  onSelectPart: (id: string) => void;
  isExploded?: boolean;
}

// ============================================================================
// Procedural Canvas Texture Generators (Zero Broken Assets, Razor-Sharp Detail)
// ============================================================================

function createPcbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark matte circuit board substrate
  ctx.fillStyle = '#06131a';
  ctx.fillRect(0, 0, 1024, 1024);

  // Ground plane copper grid
  ctx.strokeStyle = '#09212c';
  ctx.lineWidth = 1;
  const step = 32;
  for (let x = 0; x < 1024; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y < 1024; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // High-frequency gold electrical bus lines & traces
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#cca74a';
  for (let i = 0; i < 48; i++) {
    const startX = 200 + (i % 12) * 45;
    const startY = 150 + Math.floor(i / 12) * 50;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + 60, startY + 60);
    ctx.lineTo(startX + 180, startY + 60);
    ctx.stroke();

    // Solder pad via dots
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(startX + 180, startY + 60, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cyan high-speed PCIe & RAM differential pair traces
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 16; i++) {
    const y = 520 + i * 14;
    ctx.beginPath();
    ctx.moveTo(350, y);
    ctx.lineTo(420, y + 25);
    ctx.lineTo(780, y + 25);
    ctx.stroke();
  }

  // Silkscreen engineering markings & component labels
  ctx.fillStyle = '#86a6b0';
  ctx.font = 'bold 16px "DM Mono", monospace';
  ctx.fillText('WARDHARE APEX Z790-E GAMING WIFI', 60, 80);
  ctx.font = '12px "DM Mono", monospace';
  ctx.fillText('PCIe 5.0 x16 / DUAL-CHANNEL DDR5 7800+ (OC)', 60, 105);
  ctx.fillText('LGA1700 SOCKET / 20+1+2 DIGITAL VRM', 60, 125);
  ctx.fillText('M.2_1 PCIe 5.0 NVMe x4', 320, 480);
  ctx.fillText('PCIEX16(G5)_PRIMARY', 380, 680);
  ctx.fillText('CHIPSET PCH DMI 4.0 x8', 720, 880);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createCpuTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Nickel-plated copper heatspreader base
  ctx.fillStyle = '#b8c2cc';
  ctx.fillRect(0, 0, 512, 512);

  // Brushed metal effect
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let i = 0; i < 512; i += 4) {
    ctx.fillRect(0, i, 512, 2);
  }

  // Laser-etched text
  ctx.fillStyle = '#2d3748';
  ctx.font = 'bold 26px "DM Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('WARDHARE CORE PRO', 256, 170);
  ctx.font = 'bold 36px "DM Mono", monospace';
  ctx.fillText('i9-14900KS', 256, 220);
  ctx.font = '18px "DM Mono", monospace';
  ctx.fillText('6.2GHz BOOST • 24-CORE / 32-THREAD', 256, 260);
  ctx.fillText('MALAYSIA • LGA1700 UNLOCKED', 256, 290);
  ctx.font = '14px "DM Mono", monospace';
  ctx.fillText('S/N: WH-99482-T014900KS', 256, 330);

  // Gold alignment pin marker (triangle at bottom-left)
  ctx.fillStyle = '#cca74a';
  ctx.beginPath();
  ctx.moveTo(35, 475);
  ctx.lineTo(65, 475);
  ctx.lineTo(35, 445);
  ctx.closePath();
  ctx.fill();

  // 2D DataMatrix code simulation
  ctx.fillStyle = '#1a202c';
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if ((r + c) % 2 === 0 || (r * c) % 3 === 0) {
        ctx.fillRect(400 + c * 10, 400 + r * 10, 8, 8);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createGpuBackplateTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Gunmetal brushed aluminum finish
  ctx.fillStyle = '#0f1720';
  ctx.fillRect(0, 0, 1024, 512);

  // Brushed directional grain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let y = 0; y < 512; y += 3) {
    ctx.fillRect(0, y, 1024, 1);
  }

  // Geometric beveled borders and armor lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 5;
  ctx.strokeRect(16, 16, 992, 480);

  // Diagonal chamfer lines
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(340, 16);
  ctx.lineTo(420, 496);
  ctx.moveTo(370, 16);
  ctx.lineTo(450, 496);
  ctx.stroke();

  // GPU Core retention X-bracket zone (square with 4 mounting screw holes)
  ctx.fillStyle = '#0b1117';
  ctx.fillRect(140, 160, 180, 180);
  ctx.strokeStyle = '#cca74a';
  ctx.lineWidth = 3;
  ctx.strokeRect(140, 160, 180, 180);

  // X bracket diagonal lines
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(140, 160);
  ctx.lineTo(320, 340);
  ctx.moveTo(320, 160);
  ctx.lineTo(140, 340);
  ctx.stroke();

  // 4 chrome tension screws
  ctx.fillStyle = '#cbd5e1';
  [[155, 175], [305, 175], [155, 325], [305, 325]].forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Flow-through ventilation window (honeycomb hex grid on the right)
  ctx.fillStyle = '#05080c';
  ctx.fillRect(660, 60, 320, 392);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.strokeRect(660, 60, 320, 392);

  ctx.fillStyle = '#0c1a24';
  for (let x = 680; x < 960; x += 28) {
    for (let y = 80; y < 430; y += 24) {
      const offsetX = ((y / 24) % 2) * 14;
      ctx.beginPath();
      ctx.arc(x + offsetX, y, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Laser engraved typography
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px "DM Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('GEFORCE RTX', 480, 210);

  ctx.fillStyle = '#58e5ee';
  ctx.font = 'bold 24px "DM Mono", monospace';
  ctx.fillText('WARDHARE 4090 OC', 480, 248);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '15px "DM Mono", monospace';
  ctx.fillText('24GB GDDR6X • 384-BIT • ADA LOVELACE', 480, 285);
  ctx.fillText('PCIe 5.0 READY • 450W TGP • DUAL BIOS', 480, 310);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createGpuLogoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#050a0f';
  ctx.fillRect(0, 0, 512, 128);

  // Glowing side logo
  ctx.fillStyle = '#58e5ee';
  ctx.font = 'bold 44px "DM Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GEFORCE RTX', 256, 75);

  ctx.fillStyle = '#22d3ee';
  ctx.font = 'bold 16px "DM Mono", monospace';
  ctx.fillText('WARDHARE ARCHITECTURE', 256, 105);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createGpuFanHubTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#58e5ee';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(128, 128, 110, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#58e5ee';
  ctx.font = 'bold 96px "DM Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⌬', 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createRamTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#121924';
  ctx.fillRect(0, 0, 512, 256);

  // Geometric grooved lines
  ctx.strokeStyle = '#223042';
  ctx.lineWidth = 3;
  for (let i = 40; i < 500; i += 30) {
    ctx.beginPath();
    ctx.moveTo(i, 40);
    ctx.lineTo(i + 40, 210);
    ctx.stroke();
  }

  ctx.fillStyle = '#58e5ee';
  ctx.font = 'bold 20px "DM Mono", monospace';
  ctx.fillText('WARDHARE DDR5', 40, 100);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px "DM Mono", monospace';
  ctx.fillText('7200MHz CL34 1.4V XMP 3.0', 40, 130);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createSsdTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#082b26';
  ctx.fillRect(0, 0, 512, 128);

  ctx.fillStyle = '#58e5ee';
  ctx.font = 'bold 16px "DM Mono", monospace';
  ctx.fillText('WARDHARE PRO 990 M.2 NVMe PCIe 5.0 x4', 20, 45);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '13px "DM Mono", monospace';
  ctx.fillText('2000GB • READ: 14,500 MB/s • WRITE: 12,000 MB/s', 20, 80);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Data marker definition for 3D screen projection
interface HudMarker {
  id: string;
  name: string;
  category: string;
  worldPos: THREE.Vector3;
  color: string;
}

export const Hardware3DViewer: React.FC<Hardware3DViewerProps> = ({
  selectedId,
  onSelectPart,
  isExploded: externalExploded = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [internalExploded, setInternalExploded] = useState<boolean>(externalExploded);
  const isExploded = externalExploded !== undefined ? internalExploded : internalExploded;
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [cameraView, setCameraView] = useState<'isometric' | 'top' | 'front' | 'orbit'>('isometric');
  const [showHudMarkers, setShowHudMarkers] = useState<boolean>(true);
  const [markerCoords, setMarkerCoords] = useState<{ [id: string]: { x: number; y: number; visible: boolean } }>({});

  // Stable references to prevent scene reloads
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const onSelectPartRef = useRef(onSelectPart);
  onSelectPartRef.current = onSelectPart;
  const isExplodedRef = useRef(isExploded);
  isExplodedRef.current = isExploded;

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const componentsRef = useRef<{ [key: string]: THREE.Group }>({});
  const targetPositionsRef = useRef<{ [key: string]: { assembled: THREE.Vector3; exploded: THREE.Vector3 } }>({});
  const animatedFansRef = useRef<(THREE.Mesh | THREE.Group)[]>([]);
  const dataBusParticlesRef = useRef<THREE.Points | null>(null);

  // Interaction controls
  const isDraggingRef = useRef(false);
  const previousPointerPosRef = useRef({ x: 0, y: 0 });
  const touchStartDistRef = useRef(0);
  const targetCameraPosRef = useRef(new THREE.Vector3(0, 16, 26));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  // Sync external exploded prop if changed
  useEffect(() => {
    setInternalExploded(externalExploded);
  }, [externalExploded]);

  // Marker items with world anchor references
  const hudMarkers: HudMarker[] = useMemo(
    () => [
      { id: 'cpu', name: 'CPU Processor', category: 'LGA1700 Core', worldPos: new THREE.Vector3(-1.8, 3.8, -2.5), color: '#6fc3ff' },
      { id: 'cooling', name: 'AIO Liquid Pump', category: '360mm Hydro', worldPos: new THREE.Vector3(-1.8, 8.2, -2.5), color: '#22d3ee' },
      { id: 'gpu', name: 'RTX 4090 GPU', category: 'PCIe 5.0 x16', worldPos: new THREE.Vector3(-0.5, 3.6, 8.5), color: '#ff8a3d' },
      { id: 'ram', name: 'Dual DDR5 Memory', category: '7200 MT/s', worldPos: new THREE.Vector3(4.5, 4.2, -2.5), color: '#b26bff' },
      { id: 'storage', name: 'M.2 NVMe SSD', category: 'Gen 5 x4', worldPos: new THREE.Vector3(-5.5, 2.2, 1.2), color: '#3dffa8' },
      { id: 'motherboard', name: 'ATX Mainboard', category: 'Z790 Chipset', worldPos: new THREE.Vector3(-0.5, -0.6, -1.0), color: '#2ee6b6' },
      { id: 'psu', name: '850W Power Supply', category: 'ATX 3.0 Gold', worldPos: new THREE.Vector3(-7.5, -3.2, 6.5), color: '#ffd24a' },
    ],
    []
  );

  // --------------------------------------------------------------------------
  // ONE-TIME THREE.JS MOUNT & INITIALIZATION (Zero double-reload)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Clean any residual child elements to ensure zero duplicate canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 16, 26);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with high-fidelity ACES Filmic Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting Architecture
    const ambientLight = new THREE.AmbientLight(0xdcf8fa, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x58e5ee, 2.8);
    keyLight.position.set(18, 30, 22);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    fillLight.position.set(-18, 14, -14);
    scene.add(fillLight);

    const rimCyanLight = new THREE.PointLight(0x22d3ee, 3.5, 45);
    rimCyanLight.position.set(0, -6, 12);
    scene.add(rimCyanLight);

    const accentPurpleLight = new THREE.PointLight(0xa855f7, 2.5, 35);
    accentPurpleLight.position.set(-10, 8, -8);
    scene.add(accentPurpleLight);

    // Root interactive rotation group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    // Registry for parts and animated fans
    const comps: { [key: string]: THREE.Group } = {};
    const targets: { [key: string]: { assembled: THREE.Vector3; exploded: THREE.Vector3 } } = {};
    const fanMeshes: (THREE.Mesh | THREE.Group)[] = [];

    // Shared procedural textures
    const pcbTexture = createPcbTexture();
    const cpuTexture = createCpuTexture();
    const gpuTexture = createGpuBackplateTexture();
    const gpuLogoTexture = createGpuLogoTexture();
    const gpuFanHubTexture = createGpuFanHubTexture();
    const ramTexture = createRamTexture();
    const ssdTexture = createSsdTexture();

    // ========================================================================
    // 1. MOTHERBOARD (ATX Dark PCB with Realistic Circuits & Steel Armor)
    // ========================================================================
    const moboGroup = new THREE.Group();
    moboGroup.userData = { id: 'motherboard', name: 'ATX Z790 Motherboard' };

    // Multi-layer PCB substrate
    const pcbGeo = new THREE.BoxGeometry(14, 0.38, 16);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x091c24,
      map: pcbTexture,
      roughness: 0.38,
      metalness: 0.2,
    });
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.receiveShadow = true;
    moboGroup.add(pcbMesh);

    // Dual Heavy VRM Heatsinks with heatpipe
    const vrmMat = new THREE.MeshStandardMaterial({
      color: 0x111c24,
      metalness: 0.88,
      roughness: 0.22,
    });
    const topVrm = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.5, 2.0), vrmMat);
    topVrm.position.set(-2.0, 0.9, -6.0);
    topVrm.castShadow = true;
    moboGroup.add(topVrm);

    const leftVrm = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.5, 5.8), vrmMat);
    leftVrm.position.set(-5.6, 0.9, -2.4);
    leftVrm.castShadow = true;
    moboGroup.add(leftVrm);

    // Nickel heatpipe connecting VRMs
    const vrmPipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.0, 1.3, -5.2),
      new THREE.Vector3(-4.8, 1.4, -5.2),
      new THREE.Vector3(-4.8, 1.3, -3.0),
    ]);
    const vrmPipe = new THREE.Mesh(
      new THREE.TubeGeometry(vrmPipeCurve, 24, 0.16, 12, false),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.15 })
    );
    moboGroup.add(vrmPipe);

    // Solid-State VRM Capacitors (Bank of silver cylinders)
    const capGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.55, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });
    for (let i = 0; i < 7; i++) {
      const cap1 = new THREE.Mesh(capGeo, capMat);
      cap1.position.set(-4.2, 0.45, -5.0 + i * 0.7);
      moboGroup.add(cap1);

      const cap2 = new THREE.Mesh(capGeo, capMat);
      cap2.position.set(-1.0 + (i % 4) * 0.7, 0.45, -4.6);
      moboGroup.add(cap2);
    }

    // LGA1700 CPU Socket Assembly
    const socketBase = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.35, 3.8),
      new THREE.MeshStandardMaterial({ color: 0xb48b30, metalness: 0.95, roughness: 0.18 })
    );
    socketBase.position.set(-1.8, 0.3, -2.5);
    moboGroup.add(socketBase);

    // Socket Lever
    const lever = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 3.6, 12),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98, roughness: 0.1 })
    );
    lever.rotation.z = Math.PI / 2;
    lever.position.set(-1.8, 0.52, -4.3);
    moboGroup.add(lever);

    // PCIe 5.0 Steel Armor Slots (Primary x16 + Secondary x8)
    const steelPcieMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.92,
      roughness: 0.18,
    });
    const pcieSlot1 = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.65, 0.65), steelPcieMat);
    pcieSlot1.position.set(-0.5, 0.48, 1.2);
    moboGroup.add(pcieSlot1);

    const pcieSlot2 = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.55, 0.55), steelPcieMat);
    pcieSlot2.position.set(-0.5, 0.45, 5.8);
    moboGroup.add(pcieSlot2);

    // 4x DDR5 DIMM Retention Slots
    const dimmSlotMat = new THREE.MeshStandardMaterial({ color: 0x182430, metalness: 0.5, roughness: 0.4 });
    [-0.9, -0.3, 0.3, 0.9].forEach((ox) => {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.45, 5.6), dimmSlotMat);
      slot.position.set(2.5 + ox, 0.38, -2.5);
      moboGroup.add(slot);
    });

    // PCH Chipset Heatsink with Glowing Wardhare Badge
    const chipset = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.9, 3.6),
      new THREE.MeshStandardMaterial({ color: 0x0f1821, metalness: 0.8, roughness: 0.25 })
    );
    chipset.position.set(3.6, 0.65, 4.2);
    moboGroup.add(chipset);

    const chipsetLed = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.08, 0.35),
      new THREE.MeshBasicMaterial({ color: 0x58e5ee })
    );
    chipsetLed.position.set(3.6, 1.12, 4.2);
    moboGroup.add(chipsetLed);

    // Rear I/O Shield Block with Ports
    const ioShield = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 2.4, 7.8),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.2 })
    );
    ioShield.position.set(-6.6, 1.3, -4.0);
    moboGroup.add(ioShield);

    comps['motherboard'] = moboGroup;
    targets['motherboard'] = {
      assembled: new THREE.Vector3(0, 0, 0),
      exploded: new THREE.Vector3(0, 0, 0),
    };
    rootGroup.add(moboGroup);

    // ========================================================================
    // 2. CPU SILICON DIE & LASER-ENGRAVED IHS
    // ========================================================================
    const cpuGroup = new THREE.Group();
    cpuGroup.userData = { id: 'cpu', name: 'Intel i9-14900KS CPU' };

    // Nickel-plated copper IHS with procedural markings
    const cpuIhsGeo = new THREE.BoxGeometry(3.4, 0.52, 3.4);
    const cpuIhsMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: cpuTexture,
      metalness: 0.88,
      roughness: 0.18,
    });
    const cpuIhs = new THREE.Mesh(cpuIhsGeo, cpuIhsMat);
    cpuIhs.castShadow = true;
    cpuGroup.add(cpuIhs);

    // Green multi-layer silicon substrate
    const substrate = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.16, 3.6),
      new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.4 })
    );
    substrate.position.y = -0.32;
    cpuGroup.add(substrate);

    comps['cpu'] = cpuGroup;
    targets['cpu'] = {
      assembled: new THREE.Vector3(-1.8, 0.68, -2.5),
      exploded: new THREE.Vector3(-1.8, 4.4, -2.5),
    };
    rootGroup.add(cpuGroup);

    // ========================================================================
    // 3. AIO LIQUID COOLER (Infinity-Mirror Pump & 360mm Spinning Fans)
    // ========================================================================
    const coolerGroup = new THREE.Group();
    coolerGroup.userData = { id: 'cooling', name: '360mm AIO Liquid Cooler' };

    // Cylindrical Pump Block
    const pumpBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.3, 2.3, 1.8, 36),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 })
    );
    pumpBase.castShadow = true;
    coolerGroup.add(pumpBase);

    // Infinity Mirror Rings (3 Concentric Glowing Neon Hoops)
    [1.95, 1.5, 1.05].forEach((radius, idx) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.08, 16, 48),
        new THREE.MeshBasicMaterial({ color: idx === 1 ? 0x2ee6b6 : 0x58e5ee })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.92 - idx * 0.12;
      coolerGroup.add(ring);
    });

    // Rotary Compression 90-Degree Fittings
    const fitMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
    const fit1 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.6, 16), fitMat);
    fit1.position.set(1.6, 0.5, -0.6);
    coolerGroup.add(fit1);

    const fit2 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.6, 16), fitMat);
    fit2.position.set(1.6, 0.5, 0.6);
    coolerGroup.add(fit2);

    // 360mm Radiator Block
    const radBlock = new THREE.Mesh(
      new THREE.BoxGeometry(11.5, 1.6, 4.0),
      new THREE.MeshStandardMaterial({ color: 0x090e14, metalness: 0.7, roughness: 0.35 })
    );
    radBlock.position.set(1.5, 4.2, 0);
    coolerGroup.add(radBlock);

    // Braided Liquid Cooling Tubes connecting pump to radiator
    const tube1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.6, 0.5, -0.6),
      new THREE.Vector3(3.2, 2.2, -0.6),
      new THREE.Vector3(3.8, 3.6, -0.4),
    ]);
    const tube2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.6, 0.5, 0.6),
      new THREE.Vector3(3.4, 2.5, 0.6),
      new THREE.Vector3(4.0, 3.6, 0.4),
    ]);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });
    coolerGroup.add(new THREE.Mesh(new THREE.TubeGeometry(tube1Curve, 28, 0.24, 12, false), tubeMat));
    coolerGroup.add(new THREE.Mesh(new THREE.TubeGeometry(tube2Curve, 28, 0.24, 12, false), tubeMat));

    // 3x Spinning Radiator Fans
    [-3.2, 0, 3.2].forEach((fx) => {
      const fanGroup = new THREE.Group();
      fanGroup.position.set(1.5 + fx, 5.1, 0);

      // Fan frame
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(3.0, 0.35, 3.0),
        new THREE.MeshStandardMaterial({ color: 0x0c1319, metalness: 0.6, roughness: 0.4 })
      );
      fanGroup.add(frame);

      // Central Hub
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 0.38, 24),
        new THREE.MeshStandardMaterial({ color: 0x58e5ee, metalness: 0.9, roughness: 0.2 })
      );
      fanGroup.add(hub);

      // Blades (9 aero curved fins)
      const bladeGeo = new THREE.BoxGeometry(1.0, 0.05, 0.35);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, transparent: true, opacity: 0.9 });
      for (let b = 0; b < 9; b++) {
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.x = Math.cos((b / 9) * Math.PI * 2) * 0.75;
        blade.position.z = Math.sin((b / 9) * Math.PI * 2) * 0.75;
        blade.rotation.y = -(b / 9) * Math.PI * 2 + 0.35;
        fanGroup.add(blade);
      }

      fanMeshes.push(hub);
      coolerGroup.add(fanGroup);
    });

    comps['cooling'] = coolerGroup;
    targets['cooling'] = {
      assembled: new THREE.Vector3(-1.8, 1.9, -2.5),
      exploded: new THREE.Vector3(-1.8, 8.8, -2.5),
    };
    rootGroup.add(coolerGroup);

    // ========================================================================
    // 4. DUAL-CHANNEL DDR5 RGB RAM (Slots 2 & 4)
    // ========================================================================
    const ramGroup = new THREE.Group();
    ramGroup.userData = { id: 'ram', name: 'Dual DDR5 7200MHz RAM' };

    const ramMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: ramTexture,
      metalness: 0.8,
      roughness: 0.25,
    });
    const ramRgbMat = new THREE.MeshBasicMaterial({ color: 0x58e5ee });

    // Installed in slots 2 and 4 (proper dual-channel arrangement)
    [-0.3, 0.9].forEach((ox) => {
      const stick = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.9, 5.4), ramMat);
      stick.position.x = ox;
      stick.castShadow = true;
      ramGroup.add(stick);

      // Top Frosted RGB Lightbar
      const lightbar = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 5.4), ramRgbMat);
      lightbar.position.set(ox, 1.02, 0);
      ramGroup.add(lightbar);

      // Gold pins on bottom
      const pins = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.22, 5.2),
        new THREE.MeshStandardMaterial({ color: 0xcca74a, metalness: 0.95, roughness: 0.1 })
      );
      pins.position.set(ox, -1.0, 0);
      ramGroup.add(pins);
    });

    comps['ram'] = ramGroup;
    targets['ram'] = {
      assembled: new THREE.Vector3(2.5, 1.25, -2.5),
      exploded: new THREE.Vector3(5.8, 4.4, -2.5),
    };
    rootGroup.add(ramGroup);

    // ========================================================================
    // 5. DISCRETE GRAPHICS CARD (Triple-Fan Flagship RTX 4090 / 5090 GPU)
    // ========================================================================
    const gpuGroup = new THREE.Group();
    gpuGroup.userData = { id: 'gpu', name: 'GeForce RTX 4090 GPU' };

    // A. CNC-Machined Brushed Aluminum Backplate (Top Rear -Z face)
    const backplate = new THREE.Mesh(
      new THREE.BoxGeometry(12.6, 2.9, 0.16),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: gpuTexture,
        metalness: 0.88,
        roughness: 0.22,
      })
    );
    backplate.position.set(0, 0, -1.35);
    backplate.castShadow = true;
    gpuGroup.add(backplate);

    // B. Massive Multi-Tier Aluminum Cooling Fin Stack Heatsink (Core)
    const heatsinkGeo = new THREE.BoxGeometry(12.2, 2.7, 2.2);
    const heatsinkMat = new THREE.MeshStandardMaterial({
      color: 0xa1a1aa,
      metalness: 0.92,
      roughness: 0.18,
    });
    const heatsink = new THREE.Mesh(heatsinkGeo, heatsinkMat);
    heatsink.position.set(0, 0, 0);
    gpuGroup.add(heatsink);

    // C. 6x Heavy Sinuous Copper Heatpipes Weaving Through Heatsink Core
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.96,
      roughness: 0.14,
    });
    [-1.0, -0.6, -0.2, 0.2, 0.6, 1.0].forEach((py, pi) => {
      const pz = -0.7 + (pi % 2) * 1.3;
      const hp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 12.0, 16), pipeMat);
      hp.rotation.z = Math.PI / 2;
      hp.position.set(0, py, pz);
      gpuGroup.add(hp);
    });

    // D. Outer Aerospace Shroud with Geometric Armor Facets
    const shroudMat = new THREE.MeshStandardMaterial({
      color: 0x090e14,
      metalness: 0.82,
      roughness: 0.28,
    });
    const shroud = new THREE.Mesh(new THREE.BoxGeometry(12.8, 3.1, 0.45), shroudMat);
    shroud.position.set(0, 0, 1.35);
    shroud.castShadow = true;
    gpuGroup.add(shroud);

    // Shroud Top & Bottom Angular Bevel Bars
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const topAccent = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.25, 0.5), accentMat);
    topAccent.position.set(0, 1.45, 1.35);
    gpuGroup.add(topAccent);

    const bottomAccent = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.25, 0.5), accentMat);
    bottomAccent.position.set(0, -1.45, 1.35);
    gpuGroup.add(bottomAccent);

    // E. Triple Recessed Axial-Tech Fans with Real Synchronized Blade Rotation
    const fanBladeGeo = new THREE.BoxGeometry(0.85, 0.26, 0.04);
    const fanBladeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.5,
      roughness: 0.25,
      transparent: true,
      opacity: 0.94,
    });
    const fanHubMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: gpuFanHubTexture,
      metalness: 0.92,
      roughness: 0.15,
    });
    const fanHaloMat = new THREE.MeshBasicMaterial({ color: 0x58e5ee });

    const fanCenters = [-3.8, 0, 3.8];
    fanCenters.forEach((fx, fanIdx) => {
      // 1. Recessed Circular Duct Ring with Cyan Halo on Shroud
      const haloRing = new THREE.Mesh(new THREE.TorusGeometry(1.48, 0.06, 16, 48), fanHaloMat);
      haloRing.position.set(fx, 0, 1.58);
      gpuGroup.add(haloRing);

      // 2. Rotating Fan Assembly Group (Hub + 9 Blades Attached Together)
      const fanAssembly = new THREE.Group();
      fanAssembly.position.set(fx, 0, 1.55);

      // Metallic Center Hub with Wardhare Emblem
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.18, 28), fanHubMat);
      hub.rotation.x = Math.PI / 2;
      fanAssembly.add(hub);

      // 9 Curved Aerodynamic Air-Slice Blades
      for (let b = 0; b < 9; b++) {
        const angle = (b / 9) * Math.PI * 2;
        const blade = new THREE.Mesh(fanBladeGeo, fanBladeMat);
        blade.position.set(Math.cos(angle) * 0.74, Math.sin(angle) * 0.74, 0);
        blade.rotation.z = angle + 0.36; // Pitch
        blade.rotation.y = 0.22;        // Rake
        fanAssembly.add(blade);
      }

      // Tag with fan index for counter-rotating center fan
      fanAssembly.userData = { isGpuFan: true, fanIndex: fanIdx };
      gpuGroup.add(fanAssembly);
      fanMeshes.push(fanAssembly as any);
    });

    // F. Top Edge Illuminated "GEFORCE RTX" ARGB Logo Bar
    const logoPlate = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.12, 0.75),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: gpuLogoTexture,
        roughness: 0.2,
        metalness: 0.7,
      })
    );
    logoPlate.position.set(0, 1.55, 0.2);
    gpuGroup.add(logoPlate);

    // Glowing Neon Underglow Strip for Logo Bar
    const logoGlow = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 0.08, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x58e5ee })
    );
    logoGlow.position.set(0, 1.56, 0.6);
    gpuGroup.add(logoGlow);

    // G. 16-Pin 12V-2x6 / 12VHPWR Power Receptacle on Top Edge
    const pwrConnector = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.5, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x090d12, metalness: 0.6, roughness: 0.4 })
    );
    pwrConnector.position.set(3.8, 1.6, 0);
    gpuGroup.add(pwrConnector);

    // Tiny Gold Pins inside 16-Pin Power Port
    const pwrPins = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.15, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xcca74a, metalness: 0.98, roughness: 0.1 })
    );
    pwrPins.position.set(3.8, 1.82, 0);
    gpuGroup.add(pwrPins);

    // H. Dual BIOS Toggle Switch
    const biosSwitch = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.1 })
    );
    biosSwitch.position.set(-2.5, 1.58, -0.6);
    gpuGroup.add(biosSwitch);

    // I. Triple-Slot Mirror-Polished Stainless Steel I/O Bracket
    const bracket = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 3.8, 2.9),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.96, roughness: 0.12 })
    );
    bracket.position.set(-6.4, 0.3, 0);
    gpuGroup.add(bracket);

    // DisplayPort 2.1 & HDMI 2.1 Port Sockets on Bracket
    const portMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    for (let p = 0; p < 3; p++) {
      const dp = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.8), portMat);
      dp.position.set(-6.42, -0.6 + p * 0.7, 0.5);
      gpuGroup.add(dp);
    }
    const hdmi = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.35, 0.65),
      new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.2 })
    );
    hdmi.position.set(-6.42, 1.4, -0.4);
    gpuGroup.add(hdmi);

    // J. Gold PCIe 5.0 x16 Connector Interface (Seats directly into Motherboard Slot)
    const pcbTongue = new THREE.Mesh(
      new THREE.BoxGeometry(6.6, 0.55, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.4 })
    );
    pcbTongue.position.set(-0.6, -1.6, 0);
    gpuGroup.add(pcbTongue);

    const pcieTeeth = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.35, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xcca74a, metalness: 0.98, roughness: 0.1 })
    );
    pcieTeeth.position.set(-0.6, -1.65, 0);
    gpuGroup.add(pcieTeeth);

    // Key notch gap in PCIe fingers
    const notchCut = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.4, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.5 })
    );
    notchCut.position.set(-2.4, -1.65, 0);
    gpuGroup.add(notchCut);

    comps['gpu'] = gpuGroup;
    targets['gpu'] = {
      assembled: new THREE.Vector3(-0.5, 2.3, 1.2),
      exploded: new THREE.Vector3(-0.5, 3.8, 8.8),
    };
    rootGroup.add(gpuGroup);

    // ========================================================================
    // 6. PCIe GEN 5 M.2 NVMe SSD (2280 Heatsink & Controller)
    // ========================================================================
    const nvmeGroup = new THREE.Group();
    nvmeGroup.userData = { id: 'storage', name: 'PCIe 5.0 NVMe SSD' };

    const pcbDrive = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.16, 1.3),
      new THREE.MeshStandardMaterial({ color: 0xffffff, map: ssdTexture, roughness: 0.4 })
    );
    nvmeGroup.add(pcbDrive);

    // Thick Finned Cyan Heatsink
    const heatsinkDrive = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.45, 1.25),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.88, roughness: 0.2 })
    );
    heatsinkDrive.position.y = 0.3;
    heatsinkDrive.castShadow = true;
    nvmeGroup.add(heatsinkDrive);

    // Silver Mounting Screw
    const screw = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.15 })
    );
    screw.position.set(2.1, 0.3, 0);
    nvmeGroup.add(screw);

    comps['storage'] = nvmeGroup;
    targets['storage'] = {
      assembled: new THREE.Vector3(-1.8, 0.55, 1.2),
      exploded: new THREE.Vector3(-6.8, 3.0, 1.2),
    };
    rootGroup.add(nvmeGroup);

    // ========================================================================
    // 7. ATX 850W MODULAR POWER SUPPLY (Chassis, Intake Grille & Cable Bay)
    // ========================================================================
    const psuGroup = new THREE.Group();
    psuGroup.userData = { id: 'psu', name: 'ATX 850W Modular PSU' };

    // Steel Chassis Block
    const psuBlock = new THREE.Mesh(
      new THREE.BoxGeometry(8.2, 4.6, 6.8),
      new THREE.MeshStandardMaterial({ color: 0x090e13, metalness: 0.8, roughness: 0.3 })
    );
    psuBlock.castShadow = true;
    psuGroup.add(psuBlock);

    // 135mm Fan Intake Grille on Bottom
    const psuGrille = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.6, 0.12, 32),
      new THREE.MeshStandardMaterial({ color: 0xcca74a, metalness: 0.95, roughness: 0.15 })
    );
    psuGrille.position.set(0, 2.35, 0);
    psuGroup.add(psuGrille);

    // AC Power Switch & Plug Socket
    const psuSocket = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.0, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
    );
    psuSocket.position.set(2.8, 0.2, 3.42);
    psuGroup.add(psuSocket);

    // 80 PLUS Titanium Gold Efficiency Badge
    const psuBadge = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.2, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 })
    );
    psuBadge.position.set(-2.0, 0.2, 3.42);
    psuGroup.add(psuBadge);

    comps['psu'] = psuGroup;
    targets['psu'] = {
      assembled: new THREE.Vector3(-3.8, -4.2, 5.8),
      exploded: new THREE.Vector3(-9.2, -3.8, 8.2),
    };
    rootGroup.add(psuGroup);

    // Store refs
    componentsRef.current = comps;
    targetPositionsRef.current = targets;
    animatedFansRef.current = fanMeshes;

    // ========================================================================
    // OPTICAL DATA HIGHWAY PARTICLE STREAM (Motion Graphics)
    // ========================================================================
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    // Seed particles along bus lines (between CPU, RAM and PCIe)
    for (let i = 0; i < particleCount; i++) {
      const t = Math.random();
      positions[i * 3] = -1.8 + t * 4.5;
      positions[i * 3 + 1] = 0.55;
      positions[i * 3 + 2] = -2.5 + t * 4.0;
      particleSpeeds[i] = 0.04 + Math.random() * 0.06;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x58e5ee,
      size: 0.35,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const dataParticles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(dataParticles);
    dataBusParticlesRef.current = dataParticles;

    // ========================================================================
    // INTERACTION HANDLING (Raycasting, Drag Rotation & Touch Pinch-Zoom)
    // ========================================================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getIntersectedPart = (clientX: number, clientY: number): string | null => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(rootGroup.children, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj !== rootGroup) {
          if (obj.userData && obj.userData.id) {
            return obj.userData.id;
          }
          obj = obj.parent;
        }
      }
      return null;
    };

    // Pointer Event Listeners
    const handlePointerDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousPointerPosRef.current.x;
        const deltaY = e.clientY - previousPointerPosRef.current.y;

        rootGroup.rotation.y += deltaX * 0.007;
        rootGroup.rotation.x += deltaY * 0.007;
        rootGroup.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rootGroup.rotation.x));

        previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
      } else {
        const hitId = getIntersectedPart(e.clientX, e.clientY);
        if (hitId && comps[hitId]) {
          setHoveredName(comps[hitId].userData.name || hitId.toUpperCase());
          container.style.cursor = 'pointer';
        } else {
          setHoveredName(null);
          container.style.cursor = 'grab';
        }
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const handleClick = (e: MouseEvent) => {
      const hitId = getIntersectedPart(e.clientX, e.clientY);
      if (hitId) {
        onSelectPartRef.current(hitId);
      }
    };

    // Touch Event Listeners (Full Mobile & Tablet Responsiveness)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousPointerPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDistRef.current = Math.hypot(dx, dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const deltaX = e.touches[0].clientX - previousPointerPosRef.current.x;
        const deltaY = e.touches[0].clientY - previousPointerPosRef.current.y;

        rootGroup.rotation.y += deltaX * 0.007;
        rootGroup.rotation.x += deltaY * 0.007;
        rootGroup.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rootGroup.rotation.x));

        previousPointerPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        const factor = (currentDist - touchStartDistRef.current) * 0.04;
        camera.position.z = Math.max(14, Math.min(48, camera.position.z - factor));
        touchStartDistRef.current = currentDist;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        isDraggingRef.current = false;
      }
    };

    // Wheel Zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(14, Math.min(48, camera.position.z + e.deltaY * 0.02));
    };

    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('click', handleClick);
    container.addEventListener('wheel', handleWheel, { passive: false });

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Robust ResizeObserver for Any Screen & Flexbox Changes
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !camera || !renderer) return;
      const nw = container.clientWidth || 800;
      const nh = container.clientHeight || 520;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    resizeObserver.observe(container);

    // ========================================================================
    // 60FPS ANIMATION LOOP (Fans, Data Flow, Kinematic Assembly & Camera)
    // ========================================================================
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // 1. Smooth kinematic lerp between assembled & exploded states
      const curTargets = targetPositionsRef.current;
      const shouldExplode = isExplodedRef.current;
      const activeId = selectedIdRef.current;

      for (const [id, grp] of Object.entries(componentsRef.current)) {
        const t = curTargets[id];
        if (t) {
          const dest = shouldExplode ? t.exploded : t.assembled;
          grp.position.lerp(dest, 0.08);

          // Pulse scale and elevate selected hardware node
          const isSelected = activeId === id;
          const targetScale = isSelected ? 1.07 : 1.0;
          grp.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }
      }

      // 2. Continuous Fan Rotation Motion Graphics (GPU Counter-Rotation & Radiator Fans)
      for (const fan of animatedFansRef.current) {
        if (fan.userData && fan.userData.isGpuFan) {
          const dir = fan.userData.fanIndex === 1 ? -1 : 1;
          fan.rotation.z += 0.12 * dir;
        } else {
          fan.rotation.y += 0.14;
        }
      }

      // 3. Optical Data Bus Pulse Particles
      if (dataBusParticlesRef.current) {
        const posAttr = dataBusParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          posArray[i * 3 + 2] += particleSpeeds[i];
          if (posArray[i * 3 + 2] > 6.0) {
            posArray[i * 3 + 2] = -3.0;
          }
        }
        posAttr.needsUpdate = true;
      }

      // 4. Smooth Camera Lerp to active viewpoint
      camera.position.lerp(targetCameraPosRef.current, 0.06);
      camera.lookAt(targetLookAtRef.current);

      // 5. Gentle Cinematic Auto-Rotation when idle
      if (isRotating && !isDraggingRef.current) {
        rootGroup.rotation.y += 0.0028;
      }

      // 6. Project 3D Component Coordinates to 2D Screen for HUD Markers
      if (showHudMarkers) {
        const coords: { [id: string]: { x: number; y: number; visible: boolean } } = {};
        const tempV = new THREE.Vector3();

        hudMarkers.forEach((marker) => {
          const compGrp = componentsRef.current[marker.id];
          if (compGrp) {
            compGrp.getWorldPosition(tempV);
            tempV.y += shouldExplode ? 1.8 : 1.2;
            tempV.project(camera);

            const isFront = tempV.z < 1;
            const x = (tempV.x * 0.5 + 0.5) * container.clientWidth;
            const y = (-(tempV.y * 0.5) + 0.5) * container.clientHeight;

            coords[marker.id] = {
              x,
              y,
              visible: isFront && x > 20 && x < container.clientWidth - 20 && y > 20 && y < container.clientHeight - 20,
            };
          }
        });
        setMarkerCoords(coords);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup strictly when unmounting component
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();

      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('wheel', handleWheel);

      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [hudMarkers, isRotating, showHudMarkers]);

  // Viewpoint Presets with Smooth Camera Trajectory
  const applyView = (view: 'isometric' | 'top' | 'front' | 'orbit') => {
    setCameraView(view);
    if (!rootGroupRef.current) return;

    if (view === 'top') {
      targetCameraPosRef.current.set(0, 36, 1.5);
      targetLookAtRef.current.set(0, 0, 0);
      rootGroupRef.current.rotation.set(0, 0, 0);
      setIsRotating(false);
    } else if (view === 'front') {
      targetCameraPosRef.current.set(0, 4, 30);
      targetLookAtRef.current.set(0, 0, 0);
      rootGroupRef.current.rotation.set(0, 0, 0);
      setIsRotating(false);
    } else if (view === 'orbit') {
      targetCameraPosRef.current.set(0, 16, 26);
      targetLookAtRef.current.set(0, 0, 0);
      setIsRotating(true);
    } else {
      // Isometric Default
      targetCameraPosRef.current.set(0, 16, 26);
      targetLookAtRef.current.set(0, 0, 0);
      rootGroupRef.current.rotation.set(0.12, -0.38, 0);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(420px, 60vh, 580px)',
        borderRadius: '10px',
        overflow: 'hidden',
        touchAction: 'none',
      }}
    >
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, #0d1e28 0%, #04090e 100%)',
        }}
      />

      {/* Floating Holographic Screen-Projected HUD Markers */}
      {showHudMarkers &&
        hudMarkers.map((marker) => {
          const pos = markerCoords[marker.id];
          if (!pos || !pos.visible) return null;
          const isSelected = selectedId === marker.id;

          return (
            <button
              key={marker.id}
              type="button"
              onClick={() => onSelectPartRef.current(marker.id)}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                background: isSelected ? 'rgba(88, 229, 238, 0.95)' : 'rgba(7, 17, 22, 0.85)',
                color: isSelected ? '#061015' : '#ffffff',
                border: `1px solid ${isSelected ? '#ffffff' : marker.color}`,
                boxShadow: isSelected
                  ? '0 0 20px rgba(88, 229, 238, 0.8), 0 4px 12px rgba(0, 0, 0, 0.6)'
                  : '0 0 10px rgba(0, 0, 0, 0.7)',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                font: "600 10px 'DM Mono', monospace",
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                pointerEvents: 'auto',
                transition: 'transform 0.15s ease, background 0.2s ease',
                zIndex: isSelected ? 20 : 10,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isSelected ? '#061015' : marker.color,
                  boxShadow: `0 0 6px ${marker.color}`,
                }}
              />
              <span>{marker.name}</span>
            </button>
          );
        })}

      {/* Top Floating Cyber HUD Bar */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          right: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          pointerEvents: 'none',
        }}
      >
        {/* Status Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(7, 17, 22, 0.85)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(88, 229, 238, 0.25)',
            backdropFilter: 'blur(10px)',
            pointerEvents: 'auto',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#58e5ee',
              boxShadow: '0 0 10px #58e5ee',
            }}
          />
          <span style={{ font: "11px 'DM Mono', monospace", color: '#e8f4f5', letterSpacing: '0.04em' }}>
            {hoveredName ? `INSPECT: ${hoveredName}` : 'CLICK TO INSPECT • DRAG OR PINCH TO ROTATE'}
          </span>
        </div>

        {/* View Controls & Exploded Assembly Switch */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', pointerEvents: 'auto' }}>
          {/* Kinematic Assembly Mode Toggle */}
          <button
            type="button"
            onClick={() => setInternalExploded(!internalExploded)}
            style={{
              background: internalExploded ? 'rgba(88, 229, 238, 0.22)' : 'rgba(7, 17, 22, 0.85)',
              border: `1px solid ${internalExploded ? '#58e5ee' : 'rgba(88, 229, 238, 0.25)'}`,
              color: internalExploded ? '#58e5ee' : '#94a3b8',
              borderRadius: '6px',
              padding: '5px 11px',
              font: "600 10px 'DM Mono', monospace",
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span>{internalExploded ? '💥' : '🔒'}</span>
            <span>{internalExploded ? 'EXPLODED VIEW' : 'ASSEMBLED VIEW'}</span>
          </button>

          {/* Camera View Presets */}
          {(['isometric', 'top', 'front', 'orbit'] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => applyView(view)}
              style={{
                background: cameraView === view ? 'rgba(88, 229, 238, 0.25)' : 'rgba(7, 17, 22, 0.8)',
                border: `1px solid ${cameraView === view ? '#58e5ee' : 'rgba(88, 229, 238, 0.2)'}`,
                color: cameraView === view ? '#58e5ee' : '#94a3b8',
                borderRadius: '5px',
                padding: '5px 9px',
                font: "10px 'DM Mono', monospace",
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {view}
            </button>
          ))}

          {/* Toggle HUD Pins */}
          <button
            type="button"
            onClick={() => setShowHudMarkers(!showHudMarkers)}
            style={{
              background: showHudMarkers ? 'rgba(46, 230, 182, 0.2)' : 'rgba(7, 17, 22, 0.8)',
              border: `1px solid ${showHudMarkers ? '#2ee6b6' : 'rgba(88, 229, 238, 0.2)'}`,
              color: showHudMarkers ? '#2ee6b6' : '#94a3b8',
              borderRadius: '5px',
              padding: '5px 9px',
              font: "10px 'DM Mono', monospace",
              cursor: 'pointer',
            }}
          >
            🏷️ HUD PINS
          </button>

          {/* Auto-Rotation Toggle */}
          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            style={{
              background: isRotating ? 'rgba(88, 229, 238, 0.18)' : 'rgba(7, 17, 22, 0.8)',
              border: `1px solid ${isRotating ? '#58e5ee' : 'rgba(88, 229, 238, 0.2)'}`,
              color: isRotating ? '#58e5ee' : '#94a3b8',
              borderRadius: '5px',
              padding: '5px 9px',
              font: "10px 'DM Mono', monospace",
              cursor: 'pointer',
            }}
          >
            {isRotating ? '⏸ PAUSE' : '▶ ROTATE'}
          </button>
        </div>
      </div>

      {/* Bottom Selected Component Pill */}
      {selectedId && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '14px',
            background: 'rgba(7, 17, 22, 0.88)',
            border: '1px solid #58e5ee',
            padding: '6px 14px',
            borderRadius: '6px',
            boxShadow: '0 0 18px rgba(88, 229, 238, 0.3)',
            font: "11px 'DM Mono', monospace",
            color: '#58e5ee',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span>ACTIVE COMPONENT:</span>
          <b style={{ color: '#ffffff', letterSpacing: '0.04em' }}>{selectedId.toUpperCase()}</b>
        </div>
      )}
    </div>
  );
};

export default Hardware3DViewer;

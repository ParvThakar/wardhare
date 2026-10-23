import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Hardware3DViewerProps {
  selectedId: string;
  onSelectPart: (id: string) => void;
  isExploded?: boolean;
}

export const Hardware3DViewer: React.FC<Hardware3DViewerProps> = ({
  selectedId,
  onSelectPart,
  isExploded = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [cameraZoomLevel, setCameraZoomLevel] = useState<'standard' | 'top' | 'isometric'>('isometric');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const componentsRef = useRef<{ [key: string]: THREE.Group }>({});
  const targetPositionsRef = useRef<{ [key: string]: { assembled: THREE.Vector3; exploded: THREE.Vector3 } }>({});
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rootRotationGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 16, 26);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xdff9fb, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x58e5ee, 2.2);
    keyLight.position.set(15, 25, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.2);
    fillLight.position.set(-15, 10, -10);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x2ee6b6, 3, 40);
    rimLight.position.set(0, -6, 8);
    scene.add(rimLight);

    // Root interactive rotation group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    rootRotationGroupRef.current = rootGroup;

    // 5. Build Procedural Realistic Hardware
    const comps: { [key: string]: THREE.Group } = {};
    const targets: { [key: string]: { assembled: THREE.Vector3; exploded: THREE.Vector3 } } = {};

    // --- Motherboard (Mainboard PCB) ---
    const moboGroup = new THREE.Group();
    moboGroup.userData = { id: 'motherboard', name: 'ATX Motherboard' };
    
    // PCB base
    const pcbGeo = new THREE.BoxGeometry(14, 0.35, 16);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x091b22,
      roughness: 0.35,
      metalness: 0.25,
    });
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.receiveShadow = true;
    moboGroup.add(pcbMesh);

    // VRM Heatsinks
    const vrmMat = new THREE.MeshStandardMaterial({ color: 0x1e2e38, roughness: 0.2, metalness: 0.85 });
    const topVrm = new THREE.Mesh(new THREE.BoxGeometry(6, 1.4, 1.8), vrmMat);
    topVrm.position.set(-2, 0.85, -6);
    moboGroup.add(topVrm);

    const leftVrm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 5.5), vrmMat);
    leftVrm.position.set(-5.5, 0.85, -2.5);
    moboGroup.add(leftVrm);

    // LGA CPU Socket Frame
    const socketGeo = new THREE.BoxGeometry(3.6, 0.4, 3.6);
    const socketMat = new THREE.MeshStandardMaterial({ color: 0xcca74a, metalness: 0.9, roughness: 0.2 });
    const socket = new THREE.Mesh(socketGeo, socketMat);
    socket.position.set(-1.8, 0.3, -2.5);
    moboGroup.add(socket);

    // Chipset Heatsink with RGB Logo
    const chipset = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 3.2), new THREE.MeshStandardMaterial({ color: 0x0e171b, metalness: 0.7, roughness: 0.3 }));
    chipset.position.set(3.5, 0.55, 4);
    moboGroup.add(chipset);

    const chipsetLed = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.3), new THREE.MeshBasicMaterial({ color: 0x58e5ee }));
    chipsetLed.position.set(3.5, 0.98, 4);
    moboGroup.add(chipsetLed);

    // PCIe Steel Reinforced Slots
    const pcieMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const pcie1 = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.6, 0.6), pcieMat);
    pcie1.position.set(-0.5, 0.45, 1.2);
    moboGroup.add(pcie1);

    const pcie2 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 0.5), pcieMat);
    pcie2.position.set(-0.5, 0.4, 5.5);
    moboGroup.add(pcie2);

    comps['motherboard'] = moboGroup;
    targets['motherboard'] = {
      assembled: new THREE.Vector3(0, 0, 0),
      exploded: new THREE.Vector3(0, 0, 0),
    };
    rootGroup.add(moboGroup);

    // --- CPU Silicon Die (LGA) ---
    const cpuGroup = new THREE.Group();
    cpuGroup.userData = { id: 'cpu', name: 'Central Processing Unit (CPU)' };
    const cpuIhs = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.5, 3.2),
      new THREE.MeshStandardMaterial({ color: 0xd4d8db, metalness: 0.92, roughness: 0.15 })
    );
    cpuIhs.castShadow = true;
    cpuGroup.add(cpuIhs);
    const cpuSubstrate = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.15, 3.4),
      new THREE.MeshStandardMaterial({ color: 0x052e16, roughness: 0.5 })
    );
    cpuSubstrate.position.y = -0.3;
    cpuGroup.add(cpuSubstrate);

    comps['cpu'] = cpuGroup;
    targets['cpu'] = {
      assembled: new THREE.Vector3(-1.8, 0.65, -2.5),
      exploded: new THREE.Vector3(-1.8, 4.2, -2.5),
    };
    rootGroup.add(cpuGroup);

    // --- CPU AIO Cooler / Radiator Block ---
    const coolerGroup = new THREE.Group();
    coolerGroup.userData = { id: 'cooling', name: 'AIO Liquid Cooler Pump Block' };
    const pumpBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.1, 1.6, 32),
      new THREE.MeshStandardMaterial({ color: 0x111c24, metalness: 0.8, roughness: 0.25 })
    );
    pumpBase.castShadow = true;
    coolerGroup.add(pumpBase);

    // Infinity Mirror Ring
    const pumpLed = new THREE.Mesh(
      new THREE.TorusGeometry(1.75, 0.15, 16, 48),
      new THREE.MeshBasicMaterial({ color: 0x2ee6b6 })
    );
    pumpLed.rotation.x = Math.PI / 2;
    pumpLed.position.y = 0.82;
    coolerGroup.add(pumpLed);

    comps['cooling'] = coolerGroup;
    targets['cooling'] = {
      assembled: new THREE.Vector3(-1.8, 1.8, -2.5),
      exploded: new THREE.Vector3(-1.8, 8.5, -2.5),
    };
    rootGroup.add(coolerGroup);

    // --- RAM Modules (Dual Channel DDR5) ---
    const ramGroup = new THREE.Group();
    ramGroup.userData = { id: 'ram', name: 'Dual Channel DDR5 RAM' };
    const ramMat = new THREE.MeshStandardMaterial({ color: 0x181e2b, metalness: 0.7, roughness: 0.3 });
    const ramRgbMat = new THREE.MeshBasicMaterial({ color: 0x58e5ee });

    [-0.5, 0.5].forEach((offset) => {
      const stick = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.8, 5.2), ramMat);
      stick.position.x = offset;
      stick.castShadow = true;
      ramGroup.add(stick);

      const lightbar = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 5.2), ramRgbMat);
      lightbar.position.set(offset, 0.95, 0);
      ramGroup.add(lightbar);
    });

    comps['ram'] = ramGroup;
    targets['ram'] = {
      assembled: new THREE.Vector3(2.5, 1.1, -2.5),
      exploded: new THREE.Vector3(5.2, 4.0, -2.5),
    };
    rootGroup.add(ramGroup);

    // --- GPU (Triple-Fan Discrete Graphics Card) ---
    const gpuGroup = new THREE.Group();
    gpuGroup.userData = { id: 'gpu', name: 'Discrete Graphics Card (GPU)' };

    // Shroud
    const shroud = new THREE.Mesh(
      new THREE.BoxGeometry(11, 2.2, 4.4),
      new THREE.MeshStandardMaterial({ color: 0x0f1821, metalness: 0.85, roughness: 0.25 })
    );
    shroud.castShadow = true;
    gpuGroup.add(shroud);

    // Fans (3 units)
    const fanGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 24);
    const fanMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.4, roughness: 0.4 });
    [-3.2, 0, 3.2].forEach((fx) => {
      const fan = new THREE.Mesh(fanGeo, fanMat);
      fan.rotation.x = Math.PI / 2;
      fan.position.set(fx, -0.6, 2.25);
      gpuGroup.add(fan);
    });

    // Gold PCIe Connector Teeth
    const teeth = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.4, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xcca74a, metalness: 0.95, roughness: 0.1 })
    );
    teeth.position.set(-1.8, -1.3, -2.1);
    gpuGroup.add(teeth);

    comps['gpu'] = gpuGroup;
    targets['gpu'] = {
      assembled: new THREE.Vector3(0.5, 1.6, 2.8),
      exploded: new THREE.Vector3(0.5, 2.2, 8.5),
    };
    rootGroup.add(gpuGroup);

    // --- NVMe M.2 SSD ---
    const nvmeGroup = new THREE.Group();
    nvmeGroup.userData = { id: 'storage', name: 'PCIe Gen 5 NVMe SSD' };
    const pcbDrive = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.15, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.5 })
    );
    nvmeGroup.add(pcbDrive);

    const heatsinkDrive = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.35, 1.15),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.8, roughness: 0.2 })
    );
    heatsinkDrive.position.y = 0.25;
    heatsinkDrive.castShadow = true;
    nvmeGroup.add(heatsinkDrive);

    comps['storage'] = nvmeGroup;
    targets['storage'] = {
      assembled: new THREE.Vector3(-1.8, 0.45, 1.2),
      exploded: new THREE.Vector3(-6.5, 2.8, 1.2),
    };
    rootGroup.add(nvmeGroup);

    // --- PSU (Modular 850W ATX) ---
    const psuGroup = new THREE.Group();
    psuGroup.userData = { id: 'psu', name: 'ATX 850W Power Supply' };
    const psuBlock = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 4.5, 6.5),
      new THREE.MeshStandardMaterial({ color: 0x0c1218, metalness: 0.7, roughness: 0.35 })
    );
    psuBlock.castShadow = true;
    psuGroup.add(psuBlock);

    // Fan Grille
    const psuGrille = new THREE.Mesh(
      new THREE.CylinderGeometry(2.3, 2.3, 0.1, 32),
      new THREE.MeshStandardMaterial({ color: 0xcca74a, metalness: 0.9, roughness: 0.2 })
    );
    psuGrille.position.set(0, 2.3, 0);
    psuGroup.add(psuGrille);

    comps['psu'] = psuGroup;
    targets['psu'] = {
      assembled: new THREE.Vector3(-3.5, -4.2, 5.5),
      exploded: new THREE.Vector3(-8.5, -3.5, 7.5),
    };
    rootGroup.add(psuGroup);

    componentsRef.current = comps;
    targetPositionsRef.current = targets;

    // Raycasting for interactive click & hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getIntersectedPart = (e: MouseEvent): string | null => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
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

    const handlePointerDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;

        rootGroup.rotation.y += deltaX * 0.008;
        rootGroup.rotation.x += deltaY * 0.008;
        rootGroup.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rootGroup.rotation.x));

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      } else {
        const hitId = getIntersectedPart(e);
        if (hitId && comps[hitId]) {
          setHoveredName(comps[hitId].userData.name || hitId.toUpperCase());
          container.style.cursor = 'pointer';
        } else {
          setHoveredName(null);
          container.style.cursor = 'grab';
        }
      }
    };

    const handlePointerUp = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
    };

    const handleClick = (e: MouseEvent) => {
      const hitId = getIntersectedPart(e);
      if (hitId) {
        onSelectPart(hitId);
      }
    };

    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('click', handleClick);

    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth lerp positions between assembled and exploded
      const curTargets = targetPositionsRef.current;
      for (const [id, grp] of Object.entries(componentsRef.current)) {
        const t = curTargets[id];
        if (t) {
          const dest = isExploded ? t.exploded : t.assembled;
          grp.position.lerp(dest, 0.08);

          // Highlight selected part
          const isSelected = selectedId === id;
          const targetScale = isSelected ? 1.06 : 1.0;
          grp.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }
      }

      // Gentle auto-rotation when not dragging
      if (isRotating && !isDraggingRef.current) {
        rootGroup.rotation.y += 0.0035;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('click', handleClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isExploded, onSelectPart, selectedId]);

  // Handle camera viewpoints
  const setView = (view: 'isometric' | 'top' | 'standard') => {
    setCameraZoomLevel(view);
    if (!cameraRef.current || !rootRotationGroupRef.current) return;
    if (view === 'top') {
      cameraRef.current.position.set(0, 32, 2);
      cameraRef.current.lookAt(0, 0, 0);
      rootRotationGroupRef.current.rotation.set(0, 0, 0);
    } else if (view === 'standard') {
      cameraRef.current.position.set(0, 10, 24);
      cameraRef.current.lookAt(0, 0, 0);
      rootRotationGroupRef.current.rotation.set(0, 0, 0);
    } else {
      cameraRef.current.position.set(0, 16, 26);
      cameraRef.current.lookAt(0, 0, 0);
      rootRotationGroupRef.current.rotation.set(0.1, -0.4, 0);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '520px', borderRadius: '10px', overflow: 'hidden' }}>
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 50%, #0c1c24 0%, #050a0f 100%)' }} />

      {/* Floating 3D Control Bar */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          left: '16px',
          right: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(7, 17, 22, 0.75)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(88, 229, 238, 0.2)', pointerEvents: 'auto' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#58e5ee', boxShadow: '0 0 8px #58e5ee' }} />
          <span style={{ font: "11px 'DM Mono', monospace", color: '#e8f4f5', letterSpacing: '0.06em' }}>
            {hoveredName ? `INSPECT: ${hoveredName}` : 'CLICK TO SELECT PART • DRAG TO ROTATE 3D'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
          {(['isometric', 'top', 'standard'] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setView(view)}
              style={{
                background: cameraZoomLevel === view ? 'rgba(88, 229, 238, 0.25)' : 'rgba(7, 17, 22, 0.8)',
                border: `1px solid ${cameraZoomLevel === view ? '#58e5ee' : 'rgba(88, 229, 238, 0.2)'}`,
                color: cameraZoomLevel === view ? '#58e5ee' : '#94a3b8',
                borderRadius: '5px',
                padding: '5px 10px',
                font: "10px 'DM Mono', monospace",
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {view}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            style={{
              background: isRotating ? 'rgba(46, 230, 182, 0.2)' : 'rgba(7, 17, 22, 0.8)',
              border: `1px solid ${isRotating ? '#2ee6b6' : 'rgba(88, 229, 238, 0.2)'}`,
              color: isRotating ? '#2ee6b6' : '#94a3b8',
              borderRadius: '5px',
              padding: '5px 10px',
              font: "10px 'DM Mono', monospace",
              cursor: 'pointer',
            }}
          >
            {isRotating ? '⏸ PAUSE' : '▶ ROTATE'}
          </button>
        </div>
      </div>

      {/* Selected Indicator Pill */}
      {selectedId && (
        <div
          style={{
            position: 'absolute',
            bottom: '14px',
            left: '16px',
            background: 'rgba(7, 17, 22, 0.85)',
            border: '1px solid #58e5ee',
            padding: '6px 14px',
            borderRadius: '6px',
            boxShadow: '0 0 16px rgba(88, 229, 238, 0.25)',
            font: "11px 'DM Mono', monospace",
            color: '#58e5ee',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>ACTIVE COMPONENT:</span>
          <b style={{ color: '#ffffff' }}>{selectedId.toUpperCase()}</b>
        </div>
      )}
    </div>
  );
};

export default Hardware3DViewer;

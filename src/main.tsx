import React, { StrictMode, useMemo, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  animated,
  useSpring,
  useSprings,
  useTrail,
  useTransition,
  useScroll,
  useChain,
  useSpringRef,
  config,
  to,
} from '@react-spring/web';
import { GradientWave } from './components/ui/gradient-wave';
import { BentoCard, BentoGrid } from './components/ui/bento-grid';
import { TiltedCard } from './components/ui/tilted-card';
import { GooeyNav } from './components/ui/gooey-nav';
import './styles.css';

// Flow Data for Interactive Signal Pathways & Topology
const FLOW_DATA = {
  power: {
    id: 'power',
    name: 'Power Delivery Network',
    badge: '12V / 5V / 3.3V Rails',
    title: '⚡ Complete Power Distribution Network',
    summary:
      'Power originates from your AC wall socket and is transformed by the PSU into dedicated DC rails (+12V, +5V, +3.3V). The +12V rail carries >90% of system power directly feeding CPU VRMs and the GPU core.',
    nodes: [
      { id: 'ac', label: 'AC Wall Outlet', sub: '115V / 230V AC', icon: '⚡', role: 'source' },
      { id: 'psu', label: 'Power Supply (PSU)', sub: 'Transforms to +12V, +5V, +3.3V', icon: '⚙️', role: 'core' },
      { id: 'vrm', label: 'Motherboard VRMs', sub: 'Step-down to ~1.2V VCore', icon: '🎛️', role: 'distribution' },
      { id: 'silicon', label: 'CPU & GPU Silicon', sub: 'High-draw compute dies', icon: '💻', role: 'consumer' },
    ],
    details: [
      '24-Pin ATX Main: Feeds motherboard chipset, PCIe slots (delivers up to 75W mechanical slot power), RAM, and audio codec.',
      '8-Pin EPS 12V (CPU): Direct uninterrupted +12V rail dedicated to the CPU VRM multiphase buck-converters.',
      'PCIe Power (6+2 pin / 12V-2x6): Feeds dedicated graphics card for high-draw parallel 3D rasterization workloads.',
    ],
  },
  data: {
    id: 'data',
    name: 'PCIe 5.0 Data Highway',
    badge: '128 GB/s Direct Bus',
    title: '🔀 High-Speed Data Highway & PCIe Topography',
    summary:
      'Modern PC platforms split high-frequency traffic between direct CPU PCIe lanes (ultra-low latency for graphics and primary NVMe) and the Motherboard Chipset hub (secondary storage, USB, Wi-Fi, Ethernet).',
    nodes: [
      { id: 'cpu', label: 'CPU Silicon Cores', sub: 'Direct Root Complex Controller', icon: '🧠', role: 'source' },
      { id: 'pcie', label: 'Direct PCIe 5.0 Lanes', sub: 'x16 GPU Slot + x4 M.2 SSD', icon: '🚀', role: 'core' },
      { id: 'chipset', label: 'Motherboard PCH Chipset', sub: 'DMI 4.0 / PCIe Downstream Hub', icon: '🔀', role: 'distribution' },
      { id: 'io', label: 'USB, SATA & Wi-Fi 6E', sub: 'High-speed storage & peripherals', icon: '⌨️', role: 'consumer' },
    ],
    details: [
      'Primary M.2 NVMe: Runs directly off CPU lanes with lowest latency. Always install your operating system drive here.',
      'Primary PCIe Slot: Directly connected 16 PCIe Gen 5 lanes running straight to CPU without passing through chipset latency.',
      'Memory Bus: Dedicated high-frequency 128-bit dual-channel DDR5 bus connecting CPU memory controller directly to DIMMs.',
    ],
  },
  display: {
    id: 'display',
    name: 'Display & GPU Pipelines',
    badge: 'HDMI 2.1 / DP 2.1',
    title: '🖥️ Display Port Connections & GPU Signal Pipeline',
    summary:
      'High-refresh gaming displays (144Hz - 360Hz) receive uncompressed framebuffers directly from the GPU video pipeline, bypassing onboard motherboard video outputs.',
    nodes: [
      { id: 'framebuffer', label: 'GPU VRAM Framebuffer', sub: 'Rasterized 3D frame pixels', icon: '🎮', role: 'source' },
      { id: 'bracket', label: 'Discrete GPU Backplate', sub: 'Horizontal PCIe brackets', icon: '🖥️', role: 'core' },
      { id: 'cable', label: 'DisplayPort 1.4 / 2.1', sub: 'Adaptive Sync / FreeSync / HDR', icon: '🔌', role: 'distribution' },
      { id: 'panel', label: 'OLED / Fast-IPS Monitor', sub: 'Low input latency photon output', icon: '📺', role: 'consumer' },
    ],
    details: [
      'Critical Rule: NEVER plug your monitor cable into the motherboard I/O ports at the top rear if your system has a dedicated GPU! Doing so runs graphics off weak integrated CPU graphics.',
      'DisplayPort vs HDMI: DisplayPort is generally preferred for PC gaming monitors as it guarantees variable refresh rate (VRR) and full HDR dynamic range.',
      'Bandwidth: DisplayPort 2.1 UHBR20 delivers up to 80 Gbps, enabling 4K 240Hz or 8K 60Hz without visual compression artifacts.',
    ],
  },
  frontpanel: {
    id: 'frontpanel',
    name: 'Front Panel Header (F_PANEL)',
    badge: 'Chassis Switch Array',
    title: '🔌 Front Panel Header (F_PANEL) Demystified',
    summary:
      'The front panel connector block (usually 9 pins arranged 5 on top, 4 on bottom) connects chassis buttons and activity LEDs directly into the motherboard IO controller.',
    nodes: [
      { id: 'btn', label: 'Chassis Power Switch', sub: 'PWR_SW (Pins 6 & 8)', icon: '🔘', role: 'source' },
      { id: 'reset', label: 'Reset Push-Switch', sub: 'RESET_SW (Pins 5 & 7)', icon: '🔄', role: 'core' },
      { id: 'led', label: 'Power LED Indicators', sub: '+ / - P_LED (Pins 2 & 4)', icon: '💡', role: 'distribution' },
      { id: 'hdd', label: 'Storage Activity LED', sub: '+ / - HDD_LED (Pins 1 & 3)', icon: '💾', role: 'consumer' },
    ],
    details: [
      'Power Switch & Reset Switch: These are momentary push buttons with NO polarity. You can plug them in either orientation without risk.',
      'Power LED & HDD LED: These are light-emitting diodes that HAVE polarity (+ and -). If backwards, the LED simply will not light up.',
      'Pin 1 Identification: Look for a tiny embossed triangle on the plastic connector sleeve—the triangle designates Pin 1 (+ positive).',
    ],
  },
} as const;

type FlowKey = keyof typeof FLOW_DATA;
type Category = 'core' | 'peripheral' | 'iot';

interface Part {
  id: string;
  name: string;
  category: Category;
  glyph: string;
  summary: string;
  function: string;
  principle: string;
  specs: [string, string][];
  troubleshoot: string;
  color: string;
}

const seed: [string, string, Category, string, string, string][] = [
  ['tower', 'PC Tower Chassis', 'core', '▣', 'Houses, protects and organizes airflow over all system components.', '#38bdf8'],
  ['cpu', 'Central Processing Unit (CPU)', 'core', '▦', 'Executes instructions, schedules threads, and orchestrates computer tasks.', '#6fc3ff'],
  ['gpu', 'Graphics Card (GPU)', 'core', '▥', 'Runs thousands of parallel matrix computations for raster and ray-traced rendering.', '#ff8a3d'],
  ['ram', 'System Memory (RAM)', 'core', '▥', 'High-speed volatile workspace for currently active operating system and app tasks.', '#b26bff'],
  ['storage', 'NVMe / SATA Storage', 'core', '▤', 'Persistent non-volatile storage for the operating system, games, and media.', '#3dffa8'],
  ['motherboard', 'Motherboard (Mainboard)', 'core', '▦', 'Connects every major component, regulates voltage rails, and routes high-speed data buses.', '#2ee6b6'],
  ['psu', 'Power Supply Unit (PSU)', 'core', '⚡', 'Converts AC mains voltage into stable low-voltage +12V, +5V, and +3.3V DC rails.', '#ffd24a'],
  ['cooling', 'Cooling System & AIO', 'core', '✣', 'Dissipates thermal wattage away from silicon dies to sustain peak boost clocks.', '#22d3ee'],
  ['monitor', 'Gaming Display', 'peripheral', '▤', 'Converts digital display framebuffers into photons with low input latency.', '#818cf8'],
  ['keyboard', 'Mechanical Keyboard', 'peripheral', '⌨', 'Matrix of mechanical switch contacts converts physical presses into scan codes.', '#f472b6'],
  ['mouse', 'Optical Gaming Mouse', 'peripheral', '◉', 'High-speed CMOS sensor tracks surface imagery to compute micro-movement vectors.', '#4ade80'],
  ['speakers', 'Studio Acoustic Monitors', 'peripheral', '◌', 'Electromagnetic voice coils translate analog audio waveforms into air pressure.', '#fbbf24'],
  ['printer', 'Precision 3D/Document Printer', 'peripheral', '▤', 'Translates vector slices into mechanical stepper motor trajectories.', '#cbd5e1'],
  ['router', 'Wi-Fi 6E Gateway Router', 'iot', '⌁', 'Inspects and forwards packet headers between local devices and the global WAN.', '#38bdf8'],
  ['arduino', 'Arduino Uno MCU', 'iot', '∞', 'Direct microcontroller interface for reading sensors and driving digital outputs.', '#34d399'],
  ['esp32', 'ESP32 IoT Node', 'iot', '⌁', 'Dual-core wireless SoC with native Wi-Fi 802.11 b/g/n and Bluetooth LE 5.0.', '#fb923c'],
  ['raspberry-pi', 'Raspberry Pi 5 SBC', 'iot', 'π', 'Full quad-core ARM64 Linux computer with 40-pin GPIO bus and PCIe lane.', '#f43f5e'],
  ['sensors', 'Environmental Sensor Array', 'iot', '◈', 'Transduces ambient temperature, humidity, and barometric physics into I2C registers.', '#a78bfa'],
];

const parts: Part[] = seed.map(([id, name, category, glyph, summary, color]) => ({
  id,
  name,
  category,
  glyph,
  summary,
  color,
  function: `${summary} It balances timing, high-frequency signals, and power stability to turn input instructions into deterministic results.`,
  principle: 'Every modern computing node follows an architecture of input acquisition, internal processing/caching, and signal transmission. Identifying these domains isolates hardware faults.',
  specs: [
    ['Architecture', category === 'core' ? 'System Bus / PCIe' : category === 'iot' ? 'I2C / SPI / GPIO' : 'USB / DisplayPort'],
    ['Operating Rail', category === 'core' ? '+12V / +5V DC' : category === 'iot' ? '+3.3V / +5V DC' : 'USB 5V / AC Wall'],
    ['Common Diagnostic', category === 'core' ? 'Thermal throttle or POST code' : category === 'iot' ? 'Floating ground or baud rate mismatch' : 'Cable handshake or firmware profile'],
    ['Reliability Factor', 'Solid-state capacitors & transient suppression'],
  ],
  troubleshoot: 'Verify power delivery first, confirm seated physical connections, check firmware diagnostic status, and isolate one subsystem variable at a time before swapping components.',
}));

const questions = [
  ['A PC powers on with spinning fans but shows no display. What is the best first troubleshooting step?', ['Replace the motherboard immediately', 'Check display input source, cable seating, and GPU PCIe power leads', 'Reinstall the printer driver'], 1],
  ['What primary benefit does high-speed DDR5 RAM provide to the CPU?', ['Permanent mass file storage', 'Low-latency temporary workspace for active execution threads', 'Physical cooling for the chipset'], 1],
  ['Which embedded board runs a full multi-user Linux operating system with desktop output?', ['Raspberry Pi 5', 'Passive audio speaker', 'Linear power supply'], 0],
  ['What is the safest initial step when encountering erratic or noisy analog sensor readings?', ['Increase VCC voltage blindly', 'Verify circuit ground reference, wiring shielding, and ADC sampling interval', 'Format the storage drive'], 1],
  ['What is the fundamental role of a network router in a hardware lab?', ['Cool the graphics card', 'Route IP packets between local subnetworks and the internet gateway', 'Render 3D polygons'], 1],
] as const;

// ============================================================================
// Microanimation Components using @react-spring/web
// ============================================================================

/**
 * 3D Physics Spring Card
 * Uses useSpring with interpolate/to for tactile perspective tilt and cursor tracking
 */
function SpringTiltCard({
  item,
  onClick,
}: {
  item: Part;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);

  const [{ xys, glow, borderGlow }, api] = useSpring(() => ({
    xys: [0, 0, 1],
    glow: 0,
    borderGlow: 'rgba(35, 70, 80, 1)',
    config: config.gentle,
  }));

  const calc = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return [0, 0, 1];
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 2 - 1; // -1 to 1
    const py = (y / rect.height) * 2 - 1; // -1 to 1
    return [-py * 10, px * 10, 1.04];
  };

  return (
    <animated.button
      ref={cardRef}
      className="card"
      onClick={onClick}
      onMouseMove={(e) => {
        const [rx, ry, s] = calc(e);
        api.start({
          xys: [rx, ry, s],
          glow: 1,
          borderGlow: item.color,
          config: config.stiff,
        });
      }}
      onMouseLeave={() => {
        api.start({
          xys: [0, 0, 1],
          glow: 0,
          borderGlow: 'rgba(35, 70, 80, 1)',
          config: config.gentle,
        });
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        transform: to(
          xys,
          (rx, ry, s) =>
            `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`
        ),
        borderColor: borderGlow,
        boxShadow: to(
          [glow, borderGlow],
          (g: any, bg: any) =>
            `0 ${10 * Number(g)}px ${25 * Number(g)}px rgba(0, 0, 0, 0.6), 0 0 ${16 * Number(g)}px ${bg}`
        ),
      }}
    >
      <strong style={{ color: item.color }}>{item.glyph}</strong>
      <h3>{item.name}</h3>
      <p>{item.summary}</p>
      <small style={{ color: item.color }}>{item.category.toUpperCase()} ↗</small>
    </animated.button>
  );
}

/**
 * Spring-animated Detail Inspector (uses useTrail for specs and useSpring for accents)
 */
function SpringDetail({ part }: { part: Part }) {
  // Trail animation for specs items cascading into view
  const specTrail = useTrail(part.specs.length, {
    from: { opacity: 0, transform: 'translate3d(0, 14px, 0)' },
    to: { opacity: 1, transform: 'translate3d(0, 0px, 0)' },
    config: config.stiff,
    reset: true,
  });

  const accentSpring = useSpring({
    from: { width: '0px', opacity: 0 },
    to: { width: '48px', opacity: 1 },
    config: config.wobbly,
    reset: true,
  });

  return (
    <div className="detail">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <animated.div
          style={{
            ...accentSpring,
            height: '4px',
            borderRadius: '2px',
            backgroundColor: part.color,
            boxShadow: `0 0 12px ${part.color}`,
          }}
        />
        <span className="eyebrow">{part.category.toUpperCase()} / COMPONENT</span>
      </div>

      <h3 style={{ textShadow: `0 0 20px ${part.color}40` }}>{part.name}</h3>
      <p>{part.summary}</p>

      <label>Engineering Function</label>
      <p>{part.function}</p>

      <label>Working Architecture</label>
      <p>{part.principle}</p>

      <label>Architecture Specs</label>
      <div className="specs">
        {specTrail.map((style, idx) => {
          const [key, value] = part.specs[idx];
          return (
            <animated.div key={key} style={style}>
              <span>{key}</span>
              <b>{value}</b>
            </animated.div>
          );
        })}
      </div>

      <label>System Diagnostics &amp; Isolation</label>
      <div className="trouble" style={{ borderLeftColor: part.color }}>
        {part.troubleshoot}
      </div>
    </div>
  );
}

/**
 * Physics Spring Bouncy Button
 */
function SpringButton({
  children,
  onClick,
  className = '',
  style = {},
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [{ scale, y }, api] = useSpring(() => ({
    scale: 1,
    y: 0,
    config: config.wobbly,
  }));

  return (
    <animated.button
      className={className}
      onClick={onClick}
      onMouseEnter={() => api.start({ scale: 1.05, y: -2, config: config.wobbly })}
      onMouseLeave={() => api.start({ scale: 1, y: 0, config: config.gentle })}
      onMouseDown={() => api.start({ scale: 0.94, y: 1, config: config.stiff })}
      onMouseUp={() => api.start({ scale: 1.05, y: -2, config: config.wobbly })}
      style={{
        ...style,
        transform: to([scale, y], (s, py) => `translateY(${py}px) scale(${s})`),
      }}
    >
      {children}
    </animated.button>
  );
}

// ============================================================================
// Interactive SVG Exploded Studio (React-Spring Powered Hardware)
// ============================================================================
function ReactSpringExplodedStudio({
  onSelectPart,
  selectedId,
}: {
  onSelectPart: (id: string) => void;
  selectedId: string;
}) {
  const [isAssembled, setIsAssembled] = useState(false);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Spring physics for all 7 detailed hardware components
  const moboSpring = useSpring({
    transform: isAssembled ? 'translate(130px, 140px)' : 'translate(130px, 140px)',
    config: config.gentle,
  });

  const cpuSpring = useSpring({
    transform: isAssembled ? 'translate(198px, 196px)' : 'translate(198px, 26px)',
    config: config.gentle,
  });

  const ramSpring = useSpring({
    transform: isAssembled ? 'translate(298px, 178px)' : 'translate(298px, 16px)',
    config: config.gentle,
  });

  const gpuSpring = useSpring({
    transform: isAssembled ? 'translate(142px, 320px)' : 'translate(115px, 535px)',
    config: config.gentle,
  });

  const psuSpring = useSpring({
    transform: isAssembled ? 'translate(375px, 500px)' : 'translate(530px, 480px)',
    config: config.gentle,
  });

  const nvmeSpring = useSpring({
    transform: isAssembled ? 'translate(194px, 286px)' : 'translate(580px, 120px)',
    config: config.gentle,
  });

  const sataSpring = useSpring({
    transform: isAssembled ? 'translate(480px, 320px)' : 'translate(600px, 240px)',
    config: config.gentle,
  });

  const getPartState = (id: string, baseColor: string) => {
    const isHovered = hoveredPart === id;
    const isSelected = selectedId === id;
    const isOtherHovered = hoveredPart !== null && !isHovered && !isSelected;

    return {
      isHovered,
      isSelected,
      isOtherHovered,
      baseColor,
    };
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Studio Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 18px',
          background: 'rgba(14, 29, 37, 0.85)',
          borderBottom: '1px solid var(--line)',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#58e5ee', fontSize: '13px' }}>●</span>
          <span style={{ font: "10px 'DM Mono'", color: 'var(--dim)', letterSpacing: '0.12em' }}>
            REACT-SPRING STUDIO // VIEWBOX 860 × 640
          </span>
        </div>
        <SpringButton
          onClick={() => setIsAssembled(!isAssembled)}
          style={{
            background: isAssembled ? '#58e5ee' : '#142c38',
            color: isAssembled ? '#061015' : '#e8f4f5',
            border: '1px solid #2a5a68',
            borderRadius: '999px',
            padding: '7px 18px',
            font: "600 11px 'DM Mono'",
            cursor: 'pointer',
          }}
        >
          {isAssembled ? '💥 Pull it apart' : '🏢 Assemble the build'}
        </SpringButton>
      </div>

      {/* SVG Canvas */}
      <div
        style={{
          background: 'radial-gradient(900px 560px at 45% 45%, #18213a 0%, #0a0e18 55%, #06080d 100%)',
          borderRadius: '0 0 8px 8px',
          padding: '16px',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 860 640"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          role="group"
          aria-label="Exploded PC Architecture Explorer"
        >
          <defs>
            <linearGradient id="rs-pcb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#142c30" />
              <stop offset="50%" stopColor="#0a191c" />
              <stop offset="100%" stopColor="#050e10" />
            </linearGradient>

            <linearGradient id="rs-alu" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="35%" stopColor="#cbd5e1" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            <linearGradient id="rs-blk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2d3545" />
              <stop offset="30%" stopColor="#1b202c" />
              <stop offset="100%" stopColor="#0c0e14" />
            </linearGradient>

            <linearGradient id="rs-gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffea9f" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="75%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>

            <linearGradient id="rs-cu" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fba872" />
              <stop offset="40%" stopColor="#ea580c" />
              <stop offset="80%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#7c2d12" />
            </linearGradient>

            <linearGradient id="rs-rgb" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff3377" />
              <stop offset="30%" stopColor="#d946ef" />
              <stop offset="60%" stopColor="#8b5cf6" />
              <stop offset="85%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#2ee6d6" />
            </linearGradient>

            <g id="rs-blade">
              <path d="M 0,-4 C 5,-7 14,-13 11,-24 C 4,-20 -2,-12 0,-4 Z" fill="#0d1118" stroke="#334155" strokeWidth="0.6" />
            </g>

            <g id="rs-fan-unit">
              <circle r="26" fill="#070a0f" stroke="#1f2937" strokeWidth="1.8" />
              <circle r="25" fill="none" stroke="#384252" strokeWidth="0.8" />
              <circle r="23" fill="none" stroke="#000000" strokeWidth="1" opacity="0.6" />
              <g className="fan">
                <use href="#rs-blade" />
                <use href="#rs-blade" transform="rotate(40)" />
                <use href="#rs-blade" transform="rotate(80)" />
                <use href="#rs-blade" transform="rotate(120)" />
                <use href="#rs-blade" transform="rotate(160)" />
                <use href="#rs-blade" transform="rotate(200)" />
                <use href="#rs-blade" transform="rotate(240)" />
                <use href="#rs-blade" transform="rotate(280)" />
                <use href="#rs-blade" transform="rotate(320)" />
              </g>
              <circle r="9" fill="url(#rs-alu)" stroke="#475569" strokeWidth="0.8" />
              <circle r="6.5" fill="#111827" opacity="0.4" />
              <circle r="3.5" fill="#090d14" />
            </g>
          </defs>

          {/* 1. Motherboard */}
          <animated.g
            style={moboSpring}
            onClick={() => onSelectPart('motherboard')}
            onMouseEnter={() => setHoveredPart('motherboard')}
            onMouseLeave={() => setHoveredPart(null)}
            cursor="pointer"
            opacity={getPartState('motherboard', '#2ee6b6').isOtherHovered ? 0.35 : 1}
            filter={
              getPartState('motherboard', '#2ee6b6').isHovered || getPartState('motherboard', '#2ee6b6').isSelected
                ? 'drop-shadow(0 18px 24px rgba(0,0,0,0.8)) drop-shadow(0 0 16px #2ee6b6)'
                : 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
            }
          >
            <rect width="320" height="390" rx="8" fill="url(#rs-pcb)" stroke="#1a3f47" strokeWidth="1.5" />
            <rect x="4" y="4" width="312" height="382" rx="6" fill="none" stroke="#0c2328" strokeWidth="1" />

            {/* Glowing Circuit Bus Network */}
            <g stroke="#2ee6b6" strokeWidth="1" fill="none" opacity="0.55">
              <path d="M 144,72 L 158,72 L 164,72" />
              <path d="M 144,80 L 156,80 L 164,80" />
              <path d="M 144,88 L 154,88 L 164,88" />
              <path d="M 72,132 L 72,154 L 52,174 L 52,184" />
              <path d="M 80,132 L 80,150 L 60,170 L 60,184" />
              <path d="M 286,88 L 250,88 L 234,72 L 214,72" strokeWidth="1.6" stroke="#22d3ee" />
            </g>

            {/* Rear I/O Shield */}
            <rect x="4" y="20" width="18" height="150" rx="2" fill="url(#rs-alu)" stroke="#475569" strokeWidth="0.8" />

            {/* Top VRM Heatsink */}
            <g transform="translate(44, 16)">
              <rect width="170" height="30" rx="3" fill="url(#rs-alu)" stroke="#334155" strokeWidth="1" />
              <g stroke="#1a2332" strokeWidth="1.2">
                <line x1="26" y1="3" x2="26" y2="27" /><line x1="50" y1="3" x2="50" y2="27" /><line x1="74" y1="3" x2="74" y2="27" />
                <line x1="98" y1="3" x2="98" y2="27" /><line x1="122" y1="3" x2="122" y2="27" /><line x1="146" y1="3" x2="146" y2="27" />
              </g>
            </g>

            {/* Left VRM Heatsink */}
            <g transform="translate(28, 52)">
              <rect width="30" height="96" rx="3" fill="url(#rs-alu)" stroke="#334155" strokeWidth="1" />
              <g stroke="#1a2332" strokeWidth="1.2">
                <line x1="3" y1="24" x2="27" y2="24" /><line x1="3" y1="48" x2="27" y2="48" /><line x1="3" y1="72" x2="27" y2="72" />
              </g>
            </g>

            {/* LGA CPU Socket with Gold Frame */}
            <g transform="translate(64, 52)">
              <rect width="80" height="80" rx="4" fill="#090d14" stroke="url(#rs-gold)" strokeWidth="2" />
              <rect x="11" y="11" width="58" height="58" rx="2" fill="#07090e" stroke="#1f2937" strokeWidth="0.8" />
              <circle cx="3" cy="3" r="1.8" fill="url(#rs-gold)" />
              <circle cx="77" cy="3" r="1.8" fill="url(#rs-gold)" />
              <circle cx="3" cy="77" r="1.8" fill="url(#rs-gold)" />
              <circle cx="77" cy="77" r="1.8" fill="url(#rs-gold)" />
            </g>

            {/* Two DDR5 RAM Slots */}
            <g transform="translate(164, 40)">
              <rect width="14" height="126" rx="2" fill="#080c12" stroke="#2a3342" strokeWidth="1" />
              <rect x="6" y="8" width="2" height="110" fill="url(#rs-gold)" opacity="0.8" />
            </g>
            <g transform="translate(184, 40)">
              <rect width="14" height="126" rx="2" fill="#080c12" stroke="#2a3342" strokeWidth="1" />
              <rect x="6" y="8" width="2" height="110" fill="url(#rs-gold)" opacity="0.8" />
            </g>

            {/* White 24-Pin ATX Socket */}
            <g transform="translate(286, 50)">
              <rect width="20" height="84" rx="2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
              <rect x="20" y="32" width="2.5" height="20" rx="1" fill="#cbd5e1" />
            </g>

            {/* M.2 Gen 4 Slot */}
            <g transform="translate(64, 146)">
              <rect width="130" height="20" rx="2" fill="#090d14" stroke="#1f2937" strokeWidth="1" />
              <text x="24" y="14" fontSize="8" fontWeight="700" fill="#22d3ee">M.2_1 (PCIe 4.0)</text>
              <circle cx="120" cy="10" r="4.5" fill="url(#rs-gold)" stroke="#78350f" strokeWidth="0.8" />
            </g>

            {/* PCIe 5.0 x16 Steel Slot */}
            <g transform="translate(28, 184)">
              <rect width="250" height="20" rx="2" fill="url(#rs-alu)" stroke="#475569" strokeWidth="0.8" />
              <rect x="4" y="4" width="232" height="12" fill="#070a0f" />
              <line x1="8" y1="10" x2="228" y2="10" stroke="url(#rs-gold)" strokeWidth="1" strokeDasharray="2 1" />
              <rect x="238" y="2" width="10" height="16" rx="2" fill="#cbd5e1" />
            </g>

            {/* Chipset Heatsink */}
            <g transform="translate(190, 220)">
              <rect width="88" height="88" rx="4" fill="url(#rs-blk)" stroke="#374151" strokeWidth="1.2" />
              <rect x="30" y="70" width="28" height="3" rx="1.5" fill="#2ee6b6" />
            </g>

            {/* SATA Ports */}
            <g transform="translate(284, 270)">
              <rect y="0" width="24" height="16" rx="2" fill="#090d14" stroke="url(#rs-gold)" strokeWidth="1" />
              <rect y="20" width="24" height="16" rx="2" fill="#090d14" stroke="url(#rs-gold)" strokeWidth="1" />
              <rect y="40" width="24" height="16" rx="2" fill="#090d14" stroke="url(#rs-gold)" strokeWidth="1" />
            </g>

            <text x="160" y="415" textAnchor="middle" fontSize="12" fontWeight="600" fill="#ffffff" opacity={getPartState('motherboard', '#2ee6b6').isHovered ? 1 : 0.6}>
              Motherboard
            </text>
          </animated.g>

          {/* 2. CPU */}
          <animated.g
            style={cpuSpring}
            onClick={() => onSelectPart('cpu')}
            onMouseEnter={() => setHoveredPart('cpu')}
            onMouseLeave={() => setHoveredPart(null)}
            cursor="pointer"
            opacity={getPartState('cpu', '#6fc3ff').isOtherHovered ? 0.35 : 1}
            filter={
              getPartState('cpu', '#6fc3ff').isHovered || getPartState('cpu', '#6fc3ff').isSelected
                ? 'drop-shadow(0 18px 24px rgba(0,0,0,0.8)) drop-shadow(0 0 16px #6fc3ff)'
                : 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
            }
          >
            <rect width="72" height="72" rx="4" fill="#0a1214" stroke="url(#rs-gold)" strokeWidth="1.8" />
            <polygon points="0,0 14,0 0,14" fill="url(#rs-gold)" />
            <rect x="7" y="7" width="58" height="58" rx="6" fill="url(#rs-alu)" stroke="#ffffff" strokeWidth="0.8" />
            <text x="36" y="27" fontSize="7" fontWeight="700" textAnchor="middle" fill="#334155">CORE™ i9</text>
            <text x="36" y="36" fontSize="5" fontWeight="600" textAnchor="middle" fill="#475569">14900K • 3.20GHz</text>
            <text x="36" y="44" fontSize="4.5" textAnchor="middle" fill="#64748b">MALAY • SRN43</text>
            <text x="36" y="90" textAnchor="middle" fontSize="12" fontWeight="600" fill="#ffffff" opacity={getPartState('cpu', '#6fc3ff').isHovered ? 1 : 0.6}>
              CPU
            </text>
          </animated.g>

          {/* 3. RAM Modules */}
          <animated.g
            style={ramSpring}
            onClick={() => onSelectPart('ram')}
            onMouseEnter={() => setHoveredPart('ram')}
            onMouseLeave={() => setHoveredPart(null)}
            cursor="pointer"
            opacity={getPartState('ram', '#b26bff').isOtherHovered ? 0.35 : 1}
            filter={
              getPartState('ram', '#b26bff').isHovered || getPartState('ram', '#b26bff').isSelected
                ? 'drop-shadow(0 18px 24px rgba(0,0,0,0.8)) drop-shadow(0 0 16px #b26bff)'
                : 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
            }
          >
            {/* Stick 1 */}
            <g transform="translate(0, 0)">
              <rect width="16" height="8" rx="2" fill="url(#rs-rgb)" />
              <rect y="8" width="16" height="114" rx="2" fill="#2d124d" stroke="#8b5cf6" strokeWidth="1" />
              <rect x="2" y="16" width="12" height="86" rx="1" fill="#150826" stroke="#4c1d95" strokeWidth="0.6" />
              <rect y="122" width="16" height="10" fill="url(#rs-gold)" />
            </g>
            {/* Stick 2 */}
            <g transform="translate(24, 0)">
              <rect width="16" height="8" rx="2" fill="url(#rs-rgb)" />
              <rect y="8" width="16" height="114" rx="2" fill="#2d124d" stroke="#8b5cf6" strokeWidth="1" />
              <rect x="2" y="16" width="12" height="86" rx="1" fill="#150826" stroke="#4c1d95" strokeWidth="0.6" />
              <rect y="122" width="16" height="10" fill="url(#rs-gold)" />
            </g>
            <text x="20" y="150" textAnchor="middle" fontSize="12" fontWeight="600" fill="#ffffff" opacity={getPartState('ram', '#b26bff').isHovered ? 1 : 0.6}>
              RAM
            </text>
          </animated.g>

          {/* 4. GPU */}
          <animated.g
            style={gpuSpring}
            onClick={() => onSelectPart('gpu')}
            onMouseEnter={() => setHoveredPart('gpu')}
            onMouseLeave={() => setHoveredPart(null)}
            cursor="pointer"
            opacity={getPartState('gpu', '#ff8a3d').isOtherHovered ? 0.35 : 1}
            filter={
              getPartState('gpu', '#ff8a3d').isHovered || getPartState('gpu', '#ff8a3d').isSelected
                ? 'drop-shadow(0 18px 24px rgba(0,0,0,0.8)) drop-shadow(0 0 16px #ff8a3d)'
                : 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
            }
          >
            <rect width="300" height="76" rx="8" fill="url(#rs-blk)" stroke="#374151" strokeWidth="1.4" />
            {/* Copper Heatsink Block */}
            <g transform="translate(258, 0)">
              <rect width="42" height="76" rx="6" fill="url(#rs-cu)" stroke="#c2410c" strokeWidth="1" />
              <line x1="14" y1="4" x2="14" y2="72" stroke="#7c2d12" strokeWidth="1" />
              <line x1="28" y1="4" x2="28" y2="72" stroke="#7c2d12" strokeWidth="1" />
              <circle cx="21" cy="22" r="4" fill="#9a3412" stroke="#ea580c" strokeWidth="1" />
              <circle cx="21" cy="54" r="4" fill="#9a3412" stroke="#ea580c" strokeWidth="1" />
            </g>
            <rect x="0" y="70" width="300" height="6" rx="2" fill="url(#rs-rgb)" />
            {/* Triple Fans */}
            <g transform="translate(48, 36)"><use href="#rs-fan-unit" /></g>
            <g transform="translate(128, 36)"><use href="#rs-fan-unit" /></g>
            <g transform="translate(208, 36)"><use href="#rs-fan-unit" /></g>
            {/* Gold PCIe teeth */}
            <g fill="url(#rs-gold)" transform="translate(14, 76)">
              <rect x="0" y="0" width="6" height="10" /><rect x="8" y="0" width="6" height="10" />
              <rect x="16" y="0" width="6" height="10" /><rect x="24" y="0" width="6" height="10" />
              <rect x="38" y="0" width="6" height="10" /><rect x="46" y="0" width="6" height="10" />
            </g>
            <text x="150" y="105" textAnchor="middle" fontSize="12" fontWeight="600" fill="#ffffff" opacity={getPartState('gpu', '#ff8a3d').isHovered ? 1 : 0.6}>
              Graphics Card (GPU)
            </text>
          </animated.g>

          {/* 5. PSU */}
          <animated.g
            style={psuSpring}
            onClick={() => onSelectPart('psu')}
            onMouseEnter={() => setHoveredPart('psu')}
            onMouseLeave={() => setHoveredPart(null)}
            cursor="pointer"
            opacity={getPartState('psu', '#ffd24a').isOtherHovered ? 0.35 : 1}
            filter={
              getPartState('psu', '#ffd24a').isHovered || getPartState('psu', '#ffd24a').isSelected
                ? 'drop-shadow(0 18px 24px rgba(0,0,0,0.8)) drop-shadow(0 0 16px #ffd24a)'
                : 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
            }
          >
            <rect width="200" height="102" rx="8" fill="url(#rs-blk)" stroke="#374151" strokeWidth="1.5" />
            {/* Fan Grille */}
            <g transform="translate(60, 51)">
              <circle r="44" fill="#080b10" stroke="#1f2937" strokeWidth="1.2" />
              <g fill="none" stroke="#475569" strokeWidth="1.5">
                <circle r="14" /><circle r="24" /><circle r="34" /><circle r="43" />
                <line x1="0" y1="-43" x2="0" y2="43" /><line x1="-43" y1="0" x2="43" y2="0" />
              </g>
              <circle r="9" fill="url(#rs-alu)" stroke="#334155" strokeWidth="1" />
            </g>
            {/* 850W Badge */}
            <g transform="translate(122, 14)">
              <rect width="66" height="26" rx="4" fill="#ffd24a" stroke="#f59e0b" strokeWidth="1" />
              <text x="33" y="17" fontSize="11" fontWeight="700" textAnchor="middle" fill="#1e1802">850 W</text>
              <text x="33" y="24" fontSize="5" fontWeight="700" textAnchor="middle" fill="#4d3800">80 PLUS GOLD</text>
            </g>
            <rect x="122" y="48" width="30" height="18" rx="2" fill="#070a0f" stroke="#334155" />
            <rect x="158" y="48" width="30" height="18" rx="2" fill="#070a0f" stroke="#334155" />
            <text x="100" y="125" textAnchor="middle" fontSize="12" fontWeight="600" fill="#ffffff" opacity={getPartState('psu', '#ffd24a').isHovered ? 1 : 0.6}>
              Power Supply (PSU)
            </text>
          </animated.g>

          {/* 6. NVMe SSD */}
          <animated.g
            style={nvmeSpring}
            onClick={() => onSelectPart('storage')}
            onMouseEnter={() => setHoveredPart('storage')}
            onMouseLeave={() => setHoveredPart(null)}
            cursor="pointer"
            opacity={getPartState('storage', '#3dffa8').isOtherHovered ? 0.35 : 1}
            filter={
              getPartState('storage', '#3dffa8').isHovered || getPartState('storage', '#3dffa8').isSelected
                ? 'drop-shadow(0 18px 24px rgba(0,0,0,0.8)) drop-shadow(0 0 16px #3dffa8)'
                : 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
            }
          >
            <rect width="130" height="28" rx="3" fill="#0f291e" stroke="#22c55e" strokeWidth="1" />
            <rect x="22" y="3" width="102" height="22" rx="2" fill="url(#rs-alu)" />
            <text x="36" y="13" fontSize="6.5" fontWeight="700" fill="#0f172a">NVMe PCIe 4.0</text>
            <text x="36" y="20" fontSize="5" fill="#475569">7,000 MB/s • 2TB M.2</text>
            <text x="65" y="48" textAnchor="middle" fontSize="12" fontWeight="600" fill="#ffffff" opacity={getPartState('storage', '#3dffa8').isHovered ? 1 : 0.6}>
              NVMe SSD
            </text>
          </animated.g>

          {/* 7. SATA SSD */}
          <animated.g
            style={sataSpring}
            onClick={() => onSelectPart('storage')}
            onMouseEnter={() => setHoveredPart('storage')}
            onMouseLeave={() => setHoveredPart(null)}
            cursor="pointer"
            opacity={getPartState('storage', '#ff5c93').isOtherHovered ? 0.35 : 1}
            filter={
              getPartState('storage', '#ff5c93').isHovered || getPartState('storage', '#ff5c93').isSelected
                ? 'drop-shadow(0 18px 24px rgba(0,0,0,0.8)) drop-shadow(0 0 16px #ff5c93)'
                : 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
            }
          >
            <rect width="110" height="74" rx="6" fill="url(#rs-alu)" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.5" />
            <rect x="10" y="16" width="90" height="42" rx="3" fill="#121722" stroke="#283244" />
            <rect x="16" y="26" width="48" height="3.5" rx="1.7" fill="#ff5c93" />
            <text x="16" y="42" fontSize="6.5" fontWeight="700" fill="#f8fafc">SOLID STATE DRIVE</text>
            <text x="16" y="50" fontSize="5" fill="#64748b">SATA 6Gb/s • 2TB</text>
            <text x="55" y="100" textAnchor="middle" fontSize="12" fontWeight="600" fill="#ffffff" opacity={getPartState('storage', '#ff5c93').isHovered ? 1 : 0.6}>
              SATA SSD
            </text>
          </animated.g>
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// Main Application
// ============================================================================
function App() {
  const [selected, setSelected] = useState<Part>(parts[0]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | Category>('all');
  const [modal, setModal] = useState<Part | null>(null);
  const [quiz, setQuiz] = useState(-1);
  const [score, setScore] = useState(0);
  const [explorerMode, setExplorerMode] = useState<'bench' | 'exploded'>('exploded');
  const [activeFlow, setActiveFlow] = useState<FlowKey>('power');

  // React-Spring: Scroll progress microanimation
  const { scrollYProgress } = useScroll();

  // Filtered hardware cards
  const results = useMemo(
    () =>
      parts.filter(
        (p) =>
          (filter === 'all' || p.category === filter) &&
          `${p.name} ${p.summary}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query, filter]
  );

  // useTrail for hardware library cards
  const cardTrail = useTrail(results.length, {
    from: { opacity: 0, transform: 'scale(0.92) translateY(20px)' },
    to: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    config: config.stiff,
    reset: true,
  });

  // useTransition for component inspector switching
  const inspectorTransitions = useTransition(selected, {
    from: { opacity: 0, transform: 'translate3d(0, 16px, 0)' },
    enter: { opacity: 1, transform: 'translate3d(0, 0px, 0)' },
    leave: { opacity: 0, transform: 'translate3d(0, -16px, 0)' },
    config: config.gentle,
  });

  // useTransition for Modal
  const modalTransitions = useTransition(modal, {
    from: { opacity: 0, transform: 'scale(0.85) translateY(24px)' },
    enter: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    leave: { opacity: 0, transform: 'scale(0.85) translateY(18px)' },
    config: config.wobbly,
  });

  // Quiz Orb spring animation
  const orbSpring = useSpring({
    transform: quiz >= 0 ? 'scale(1.08)' : 'scale(1)',
    borderColor: quiz >= 0 ? '#58e5ee' : '#234650',
    config: config.wobbly,
  });

  const answer = (i: number) => {
    if (i === questions[quiz][2]) setScore((s) => s + 1);
    setTimeout(() => setQuiz((q) => q + 1), 400);
  };

  return (
    <div className="app">
      {/* Full-Website Fixed Gradient Wave WebGL Canvas */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <GradientWave
          colors={['#071116', '#091c26', '#06161f', '#12394e', '#0b2738', '#071116']}
          noiseSpeed={0.00003}
          shadowPower={5}
          darkenTop={false}
          deform={{ incline: 0.3, noiseAmp: 180, noiseFlow: 3.2 }}
        />
      </div>

      {/* Main Interactive Layer */}
      <div style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}>
        {/* Scroll Progress Microanimation Indicator */}
        <animated.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #ff3377, #8b5cf6, #58e5ee)',
            transformOrigin: '0% 50%',
            scaleX: scrollYProgress,
            zIndex: 110,
          }}
        />

        {/* Proper Modern Navbar with GooeyNav */}
        <header className="topbar">
          <a className="brand-wrap" href="#top">
            <div className="brand-icon">
              ⌬
            </div>
            <div>
              <div className="brand-name">
                Ward<span>hare</span>
              </div>
              <span className="brand-sub">Hardware Studio</span>
            </div>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <GooeyNav
              items={[
                { label: 'Explorer', href: '#explorer' },
                { label: 'Library', href: '#library' },
                { label: 'Topology', href: '#connections' },
                { label: 'IoT Devices', href: '#iot' },
                { label: 'Diagnostic Quiz', href: '#quiz' },
              ]}
              theme="dark"
              color="#58e5ee"
              activeTextColor="#061015"
              size="sm"
              frame={true}
            />

            <a href="#explorer" className="nav-cta">
              <span>Launch Lab</span>
              <span>↓</span>
            </a>
          </div>
        </header>

        <main id="top">
          {/* Hero Section */}
          <section className="hero">
            <h1>
              See what makes
              <br />
              <em>your machine tick.</em>
            </h1>
            <p>
              An interactive deep-dive into PC hardware architecture. Explore every component
              from silicon to signal — inspect exploded build views, trace power and data
              pathways, and test your hardware knowledge.
            </p>
            <div className="actions">
              <SpringButton
                className="button"
                onClick={() => {
                  const el = document.getElementById('explorer');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Start Exploring ↓
              </SpringButton>
              <a href="#quiz">Test Your Knowledge →</a>
            </div>

            <div className="stats">
              <div>
                <b>18</b>
                <small>Hardware Nodes</small>
              </div>
              <div>
                <b>07</b>
                <small>Exploded Components</small>
              </div>
              <div>
                <b>4</b>
                <small>Signal Pathways</small>
              </div>
            </div>
          </section>

        {/* Section 1: The Lab Bench & Exploded View Explorer */}
        <section id="explorer" className="section">
          <header className="section-head">
            <div>
              <span className="eyebrow">01 / INTERACTIVE ARCHITECTURE</span>
              <h2>Inside the machine</h2>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <SpringButton
                onClick={() => setExplorerMode('exploded')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  background: explorerMode === 'exploded' ? 'var(--cyan)' : 'transparent',
                  color: explorerMode === 'exploded' ? '#061015' : 'var(--dim)',
                  cursor: 'pointer',
                  font: "600 11px 'DM Mono'",
                }}
              >
                🔬 Exploded Studio View
              </SpringButton>
              <SpringButton
                onClick={() => setExplorerMode('bench')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  background: explorerMode === 'bench' ? 'var(--cyan)' : 'transparent',
                  color: explorerMode === 'bench' ? '#061015' : 'var(--dim)',
                  cursor: 'pointer',
                  font: "600 11px 'DM Mono'",
                }}
              >
                🖥️ Tower Setup Bench
              </SpringButton>
            </div>
          </header>

          <div className="bench">
            {/* Left Column: Explorer Stage */}
            <div className="scene" style={{ padding: 0, overflow: 'hidden' }}>
              {explorerMode === 'exploded' ? (
                <ReactSpringExplodedStudio
                  selectedId={selected.id}
                  onSelectPart={(id) => {
                    const found = parts.find((p) => p.id === id);
                    if (found) setSelected(found);
                  }}
                />
              ) : (
                <>
                  <div className="scene-bar">
                    ● LIVE LAB BENCH <span>Click any hotspot node to inspect</span>
                  </div>
                  <div className="setup">
                    <div className="tower">
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="screen">
                      PC LAB<small>SYSTEM ONLINE</small>
                    </div>
                    <div className="keyboard" />
                    <div className="node-art speaker">◌</div>
                    <div className="node-art mouse">◉</div>
                    {['tower', 'monitor', 'keyboard', 'mouse', 'speakers', 'printer', 'router'].map(
                      (id, i) => (
                        <button
                          key={id}
                          className={`hotspot h${i}`}
                          onClick={() => setSelected(parts.find((p) => p.id === id)!)}
                          aria-label={`Inspect ${id}`}
                        >
                          ◉<span>{id}</span>
                        </button>
                      )
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Spring Animated Inspector */}
            <aside className="inspector" style={{ position: 'relative', overflow: 'hidden' }}>
              <div className="inspector-head">
                SELECTED COMPONENT{' '}
                <span>
                  {String(parts.indexOf(selected) + 1).padStart(2, '0')} / {parts.length}
                </span>
              </div>

              {inspectorTransitions((style, item) => (
                <animated.div style={style}>
                  <SpringDetail part={item} />
                </animated.div>
              ))}
            </aside>
          </div>
        </section>

        {/* Section 2: Hardware Library with Bento Grid */}
        <section id="library" className="section">
          <header className="section-head">
            <div>
              <span className="eyebrow">02 / HARDWARE LIBRARY</span>
              <h2>Component Reference</h2>
            </div>
            <p>Click any component card to open the full technical inspector.</p>
          </header>

          <div className="tools">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, category, or architecture…"
              aria-label="Search hardware catalog"
            />
            <div>
              {(['all', 'core', 'peripheral', 'iot'] as const).map((x) => (
                <SpringButton
                  key={x}
                  className={filter === x ? 'active' : ''}
                  onClick={() => setFilter(x)}
                >
                  {x.toUpperCase()}
                </SpringButton>
              ))}
            </div>
          </div>

          <BentoGrid
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            {results.map((item) => (
              <TiltedCard
                key={item.id}
                containerHeight="240px"
                containerWidth="100%"
                imageHeight="100%"
                imageWidth="100%"
                rotateAmplitude={12}
                scaleOnHover={1.04}
                glare={0.4}
                glareColor={item.color}
                shadow={0.35}
                radius={12}
                showTooltip={false}
                onClick={() => setModal(item)}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    padding: '22px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(14, 29, 37, 0.76)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    boxSizing: 'border-box',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '28px', lineHeight: 1, color: item.color }}>{item.glyph}</span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: `${item.color}20`,
                        border: `1px solid ${item.color}44`,
                        color: item.color,
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '9px',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                  <h3
                    style={{
                      margin: '0 0 6px 0',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#ffffff',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.name}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      color: 'var(--dim)',
                      lineHeight: 1.6,
                      flex: 1,
                    }}
                  >
                    {item.summary}
                  </p>
                  <div
                    style={{
                      marginTop: '12px',
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '10px',
                      color: item.color,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Inspect Component →
                  </div>
                </div>
              </TiltedCard>
            ))}
          </BentoGrid>
        </section>

        {/* Section 3: Signal Topology */}
        <section id="connections" className="section">
          <header className="section-head">
            <div>
              <span className="eyebrow">03 / BUS &amp; POWER TOPOLOGY</span>
              <h2>Signal Pathways</h2>
            </div>
            <p>High-speed PCIe data, clean DC rails, and peripheral routing.</p>
          </header>

          <div className="flow-container">
            {/* Interactive Flow Filter Tabs */}
            <div className="flow-tabs" role="tablist" aria-label="System Pathway Flows">
              {(Object.keys(FLOW_DATA) as FlowKey[]).map((key) => {
                const item = FLOW_DATA[key];
                const isActive = activeFlow === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`flow-tab-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveFlow(key)}
                  >
                    <span>{item.name}</span>
                    <span className="flow-tab-badge">{item.badge}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Animated Stage Card */}
            <div className="flow-stage-card">
              <div className="flow-header">
                <h3>{FLOW_DATA[activeFlow].title}</h3>
                <p>{FLOW_DATA[activeFlow].summary}</p>
              </div>

              {/* Node Pipeline Map */}
              <div className="flow-pipeline">
                {FLOW_DATA[activeFlow].nodes.map((node, i) => (
                  <React.Fragment key={node.id}>
                    <div className={`flow-node flow-node-${node.role}`}>
                      <div className="flow-node-icon">{node.icon}</div>
                      <div className="flow-node-title">{node.label}</div>
                      <div className="flow-node-sub">{node.sub}</div>
                      <span className="flow-node-role">{node.role}</span>
                    </div>
                    {i < FLOW_DATA[activeFlow].nodes.length - 1 && (
                      <div className="flow-connector" aria-hidden="true">
                        <span className="flow-pulse-dot" />
                        <span className="flow-arrow-head">➜</span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Technical Specifications & Details Matrix */}
              <div className="flow-details-grid">
                <h4>Architecture Specs &amp; Routing Rules</h4>
                <ul>
                  {FLOW_DATA[activeFlow].details.map((detail, idx) => (
                    <li key={idx}>
                      <span className="flow-bullet">⚡</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="map-tip" style={{ position: 'relative', marginTop: '18px', bottom: 'auto', left: 'auto', right: 'auto' }}>
                <b>PRO TIP</b> Hardware topology operates under deterministic bus timing. Signals traveling between high-draw computing dies route with differential impedance matching to prevent reflection loss.
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Sensors & IoT */}
        <section id="iot" className="section">
          <header className="section-head">
            <div>
              <span className="eyebrow">04 / EMBEDDED &amp; SENSORS</span>
              <h2>Beyond the Desktop</h2>
            </div>
            <p>Physical computing microcontrollers and telemetry nodes.</p>
          </header>

          <div className="iot-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {['arduino', 'esp32', 'raspberry-pi', 'sensors'].map((id) => {
              const p = parts.find((x) => x.id === id)!;
              return (
                <TiltedCard
                  key={id}
                  containerHeight="240px"
                  containerWidth="100%"
                  imageHeight="100%"
                  imageWidth="100%"
                  rotateAmplitude={14}
                  scaleOnHover={1.04}
                  glare={0.45}
                  glareColor={p.color}
                  shadow={0.35}
                  radius={12}
                  showTooltip={false}
                  onClick={() => setModal(p)}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      padding: '22px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'rgba(14, 29, 37, 0.78)',
                      backdropFilter: 'blur(14px)',
                      WebkitBackdropFilter: 'blur(14px)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      boxSizing: 'border-box',
                      textAlign: 'left',
                    }}
                  >
                    <strong style={{ color: p.color, fontSize: '28px', lineHeight: 1, marginBottom: '10px' }}>
                      {p.glyph}
                    </strong>
                    <span className="eyebrow" style={{ color: p.color }}>{p.category.toUpperCase()}</span>
                    <h3 style={{ margin: '4px 0 8px', fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                      {p.name}
                    </h3>
                    <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--dim)', lineHeight: 1.6, flex: 1 }}>
                      {p.summary}
                    </p>
                    <small style={{ color: p.color, fontFamily: "'DM Mono', monospace", fontSize: '10px', textTransform: 'uppercase' }}>
                      Inspect Node ↗
                    </small>
                  </div>
                </TiltedCard>
              );
            })}
          </div>
        </section>

        {/* Section 5: Diagnostic Quiz with Spring Animations */}
        <section id="quiz" className="section">
          <div className="quiz">
            <div>
              <span className="eyebrow">05 / KNOWLEDGE CHECK</span>
              <h2>Hardware Diagnostic Test</h2>
              <p>Five scenario challenges from the hardware workbench. Choose the optimal resolution.</p>
              <SpringButton
                className="button"
                onClick={() => {
                  setQuiz(0);
                  setScore(0);
                }}
              >
                Start Diagnostic Challenge →
              </SpringButton>
            </div>
            <animated.div className="quiz-orb" style={orbSpring}>
              {quiz >= 0 ? `${score}/${questions.length}` : '05'}
              <small>{quiz >= 0 ? 'CURRENT\nSCORE' : 'DIAGNOSTICS\nREADY'}</small>
            </animated.div>
          </div>

          {quiz >= 0 && (
            <div className="quiz-panel">
              {quiz < questions.length ? (
                <>
                  <span className="eyebrow">
                    QUESTION {quiz + 1} / {questions.length} · CURRENT SCORE: {score}
                  </span>
                  <h3>{questions[quiz][0]}</h3>
                  {questions[quiz][1].map((x, i) => (
                    <SpringButton key={x} onClick={() => answer(i)}>
                      {x}
                    </SpringButton>
                  ))}
                </>
              ) : (
                <>
                  <span className="eyebrow">BENCHMARK TEST COMPLETE</span>
                  <h3 style={{ color: '#58e5ee' }}>
                    Final Diagnostic Score: {score} / {questions.length} (
                    {Math.round((score / questions.length) * 100)}%)
                  </h3>
                  <SpringButton
                    className="button"
                    onClick={() => {
                      setQuiz(0);
                      setScore(0);
                    }}
                  >
                    Retake Diagnostic Test
                  </SpringButton>
                </>
              )}
            </div>
          )}
        </section>
      </main>

      <footer>
        <div>
          ⌬ Wardhare <span>Interactive PC Hardware Architecture Explorer</span>
        </div>
        <a href="#top">Back to top ↑</a>
      </footer>

      {/* Spring Modal Overlay */}
      {modalTransitions(
        (style, item) =>
          item && (
            <div className="modal" onClick={() => setModal(null)}>
              <animated.div
                className="modal-card"
                style={style}
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => setModal(null)} aria-label="Close modal">
                  ×
                </button>
                <SpringDetail part={item} />
              </animated.div>
            </div>
          )
      )}
      </div>
    </div>
  );
}

// Mount React Root
const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

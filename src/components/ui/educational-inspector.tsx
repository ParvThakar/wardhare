import React, { useState } from 'react';
import { animated, useTrail, useSpring, config } from '@react-spring/web';

export interface EducationalPart {
  id: string;
  name: string;
  category: string;
  glyph: string;
  summary: string;
  function: string;
  principle: string;
  specs: [string, string][];
  troubleshoot: string;
  color: string;
  architectureDetails?: {
    overview: string;
    diagramDescription: string;
    realWorldExamples: string[];
    advantages: string[];
    limitations: string[];
    compatibility: string[];
  };
}

const DEFAULT_ARCH_DATA: Record<string, {
  overview: string;
  diagramDescription: string;
  realWorldExamples: string[];
  advantages: string[];
  limitations: string[];
  compatibility: string[];
}> = {
  cpu: {
    overview: 'The Central Processing Unit coordinates operations, decodes instruction registers, and processes arithmetic/logic pipelines through micro-architectural execution units (ALUs, FPUs, Branch Predictors).',
    diagramDescription: 'L1/L2 Cache Cores ➔ Ring Bus / Mesh Interconnect ➔ Memory Controller (IMC) ➔ PCIe Root Complex.',
    realWorldExamples: ['Intel Core i9-14900KS (24 cores / 32 threads)', 'AMD Ryzen 9 7950X3D (V-Cache 3D silicon)', 'Apple M3 Max ARM-based unified silicon'],
    advantages: ['Deterministic nanosecond instruction scheduling', 'Extreme branch prediction efficiency', 'Broad platform software compatibility'],
    limitations: ['Thermal throttling under sustained AVX-512 vector load', 'Silicon photolithography physical quantum tunneling limits'],
    compatibility: ['LGA1700 / AM5 Socket physical pin layout matching', 'DDR5 / DDR4 IMC motherboard trace routing'],
  },
  gpu: {
    overview: 'The Graphics Processing Unit harnesses thousands of streaming multiprocessors (SMs) engineered to execute massive parallel floating-point vector calculations for matrix arithmetic, rasterization, and hardware ray tracing.',
    diagramDescription: 'PCIe 5.0 Bus ➔ Host Interface ➔ GigaThread Engine ➔ SM Clusters (Tensor & RT Cores) ➔ GDDR6X VRAM High-Bandwidth Framebuffer.',
    realWorldExamples: ['NVIDIA GeForce RTX 4090 (16,384 CUDA Cores, 24GB GDDR6X)', 'AMD Radeon RX 7900 XTX (RDNA 3 Chiplet Architecture)', 'NVIDIA H100 Hopper Tensor Core AI Accelerator'],
    advantages: ['Thousands of concurrent execution threads', 'Hardware-accelerated tensor matrix multiply units', 'Dedicated ultra-wide 384-bit memory bandwidth'],
    limitations: ['High transient electrical wattage spikes (>450W)', 'Severe thermal surface heat density necessitating triple-slot heatsinks'],
    compatibility: ['PCIe x16 mechanical socket clearance', 'ATX 3.0 / PCIe Gen 5 12V-2x6 high-current power harness', 'Chassis clearance >= 330mm'],
  },
  motherboard: {
    overview: 'The Mainboard PCB provides an impedance-controlled multi-layer copper trace network connecting the host CPU socket to PCIe expansions, DDR5 DIMM buses, storage M.2 traces, and the chipset PCH downstream hub.',
    diagramDescription: 'CPU Socket ➔ Direct x16 GPU + x4 NVMe Bus ➔ DMI 4.0 Link ➔ Chipset PCH ➔ SATA / USB 3.2 / Audio / Wi-Fi.',
    realWorldExamples: ['ASUS ROG Maximus Z790 Dark Hero', 'MSI MAG X670E Tomahawk WiFi', 'Gigabyte B650 AORUS Elite AX'],
    advantages: ['Clean multi-phase digital VRM voltage stepping', 'Differential signal trace shielding against electromagnetic crosstalk', 'Integrated diagnostic debugging POST codes'],
    limitations: ['Form factor physical chassis mount limits (E-ATX vs ATX vs ITX)', 'Restricted chipset downstream PCIe lane oversubscription'],
    compatibility: ['Form factor (ATX, Micro-ATX, Mini-ITX)', 'Socket retention bracket & CPU generation chipset match'],
  },
  ram: {
    overview: 'System Memory (Synchronous Dynamic RAM) acts as the high-throughput, volatile working memory pool for active processes, holding compiled binaries, heap data, and OS kernel buffers directly accessible to the CPU memory controller.',
    diagramDescription: 'CPU IMC ➔ 128-bit Dual Channel Bus ➔ Command/Address (CA) Bus ➔ On-Die ECC ➔ DRAM Banks (Row/Column Decoders).',
    realWorldExamples: ['G.SKILL Trident Z5 RGB 64GB (2x32GB) DDR5-6400 CL32', 'Corsair Dominator Titanium DDR5-7200', 'Crucial Pro 32GB DDR5-5600 JEDEC Standard'],
    advantages: ['Low latency access (<65 nanoseconds)', 'Massive sustained memory bandwidth (>80 GB/s on DDR5)', 'On-die error correction telemetry'],
    limitations: ['Volatile storage (all contents vanish upon power termination)', 'Sensitivity to signal integrity degradation when running 4 DIMM configs'],
    compatibility: ['DDR5 vs DDR4 physical notch alignment (cannot intermix)', 'Motherboard QVL (Qualified Vendor List) memory kit support'],
  },
  storage: {
    overview: 'Solid State Drives utilize non-volatile 3D NAND flash silicon stacked in dozens of microscopic charge-trap layers, managed by an intelligent multi-core controller with SLC caching and wear leveling.',
    diagramDescription: 'Host CPU ➔ Direct PCIe 5.0 x4 Bus ➔ NVMe 2.0 Host Controller ➔ DRAM Cache ➔ Multi-Channel 3D TLC/QLC NAND Flash Blocks.',
    realWorldExamples: ['Samsung 990 PRO 2TB (7,450 MB/s Read, 6,900 MB/s Write)', 'Crucial T705 2TB PCIe 5.0 NVMe (14,500 MB/s)', 'WD_BLACK SN850X 4TB NVMe SSD'],
    advantages: ['Near-instantaneous random 4K I/O access times (<0.02ms)', 'Zero moving mechanical parts eliminates shock failure', 'Ultra-dense capacity in M.2 2280 form factor'],
    limitations: ['NAND write endurance limits (measured in Terabytes Written / TBW)', 'Thermal throttling under sustained writes without heatsink'],
    compatibility: ['M.2 Key-M 2280 physical slot support', 'PCIe lane generation backwards compatibility'],
  },
  psu: {
    overview: 'The Power Supply Unit converts high-voltage alternating current (115V/230V AC) from domestic mains into pure, filtered, low-voltage direct current (+12V, +5V, +3.3V) through active power factor correction (PFC) and DC-to-DC topology.',
    diagramDescription: 'AC Mains Socket ➔ Transient EMI Filter ➔ Bridge Rectifier ➔ Active PFC Stage ➔ LLC Resonant Converter ➔ DC-to-DC Step-Down (+12V, +5V, +3.3V).',
    realWorldExamples: ['Seasonic PRIME TX-1000 80 PLUS Titanium', 'Corsair RM850x Shift (ATX 3.0, Side-modular)', 'be quiet! Straight Power 12 1200W Platinum'],
    advantages: ['Tight voltage regulation (<1% voltage variance on critical rails)', 'Comprehensive circuit protection (OVP, UVP, OCP, OTP, SCP, OPP)', 'Modular cables maximize interior chassis airflow'],
    limitations: ['Efficiency curve dips below 20% system utilization', 'Heat generation necessitating dedicated active fan curves'],
    compatibility: ['Chassis depth clearance (140mm - 200mm)', 'System peak transient wattage ceiling requirement'],
  },
  cooling: {
    overview: 'Thermal management systems transfer dissipated thermal wattage away from silicon heat spreaders using micro-skived copper cold plates, liquid coolant channels, and aluminum fin radiators with high static pressure fans.',
    diagramDescription: 'CPU IHS Silicon ➔ Thermal Interface Paste ➔ Micro-Fin Copper Base ➔ Pump Impeller ➔ Radiator Core ➔ High-Pressure Airflow.',
    realWorldExamples: ['Arctic Liquid Freezer III 360 AIO Cooler', 'Noctua NH-D15 G2 Dual-Tower Air Cooler', 'NZXT Kraken Elite 360 RGB with LCD Display'],
    advantages: ['Maintains silicon below TjMax threshold allowing sustained boost clocks', 'Decreases thermal degradation of silicon gates over time', 'Customizable acoustic fan profiles via PWM headers'],
    limitations: ['AIO pump impellers possess finite lifespans (MTBF ~50,000 hrs)', 'Space constraints inside compact ITX chassis'],
    compatibility: ['CPU socket retention bracket geometry', 'Radiator mounting support in chassis (240mm, 280mm, 360mm, 420mm)'],
  },
};

export const EnhancedEducationalInspector: React.FC<{ part: EducationalPart }> = ({ part }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'diagram' | 'examples'>('overview');

  const arch = DEFAULT_ARCH_DATA[part.id] || {
    overview: part.function,
    diagramDescription: part.principle,
    realWorldExamples: ['Industry standard hardware implementation conforming to IEEE/JEDEC standards.'],
    advantages: ['Deterministic engineering tolerance', 'Engineered for continuous high-frequency computing workloads'],
    limitations: ['Subject to thermal and electromagnetic physics constraints'],
    compatibility: [part.specs[0] ? `${part.specs[0][0]}: ${part.specs[0][1]}` : 'Standard PC architecture compatibility'],
  };

  const specTrail = useTrail(part.specs.length, {
    from: { opacity: 0, transform: 'translate3d(0, 10px, 0)' },
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
    <div className="educational-inspector" style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header with Title and Glyphs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
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
          <span className="eyebrow" style={{ color: part.color }}>
            {part.category.toUpperCase()} / ARCHITECTURE
          </span>
        </div>
        <span style={{ fontSize: '20px', color: part.color }}>{part.glyph}</span>
      </div>

      <div>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '24px', letterSpacing: '-0.04em', color: '#ffffff', textShadow: `0 0 20px ${part.color}40` }}>
          {part.name}
        </h3>
        <p style={{ margin: 0, color: 'var(--dim)', fontSize: '12px', lineHeight: 1.6 }}>
          {part.summary}
        </p>
      </div>

      {/* Interactive Tabs */}
      <div style={{ display: 'flex', gap: '6px', background: 'rgba(7, 17, 22, 0.6)', padding: '4px', borderRadius: '8px', border: '1px solid var(--line)' }}>
        {(['overview', 'specs', 'diagram', 'examples'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '6px 10px',
                border: 'none',
                borderRadius: '6px',
                background: isActive ? 'rgba(88, 229, 238, 0.15)' : 'transparent',
                color: isActive ? '#58e5ee' : 'var(--dim)',
                borderBottom: isActive ? '2px solid #58e5ee' : '2px solid transparent',
                font: "600 10px 'DM Mono', monospace",
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div style={{ minHeight: '190px' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', font: "10px 'DM Mono', monospace", color: 'var(--dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Core Functionality & Operation
              </label>
              <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: 1.7 }}>
                {arch.overview}
              </p>
            </div>
            <div>
              <label style={{ display: 'block', font: "10px 'DM Mono', monospace", color: 'var(--dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Key Technical Advantages
              </label>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>
                {arch.advantages.map((adv, idx) => (
                  <li key={idx}><span style={{ color: '#2ee6b6' }}>✓</span> {adv}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div>
            <label style={{ display: 'block', font: "10px 'DM Mono', monospace", color: 'var(--dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Hardware Bus & Electrical Specifications
            </label>
            <div className="specs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {specTrail.map((style, idx) => {
                const [key, value] = part.specs[idx];
                return (
                  <animated.div key={key} style={{ ...style, padding: '10px', background: 'var(--panel2)', borderRadius: '6px', border: '1px solid rgba(88, 229, 238, 0.1)' }}>
                    <span style={{ fontSize: '9px', font: "10px 'DM Mono'", color: 'var(--dim)' }}>{key}</span>
                    <b style={{ display: 'block', fontSize: '11px', color: '#e2e8f0', marginTop: '3px' }}>{value}</b>
                  </animated.div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'diagram' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'block', font: "10px 'DM Mono', monospace", color: '#58e5ee', textTransform: 'uppercase' }}>
              Signal & Bus Topography
            </label>
            <div style={{ padding: '12px', background: 'rgba(7, 17, 22, 0.9)', borderRadius: '6px', border: '1px dashed rgba(88, 229, 238, 0.3)', font: "11px 'DM Mono', monospace", color: '#58e5ee', lineHeight: 1.7 }}>
              {arch.diagramDescription}
            </div>
            <div>
              <label style={{ display: 'block', font: "10px 'DM Mono', monospace", color: 'var(--dim)', textTransform: 'uppercase', marginTop: '4px', marginBottom: '2px' }}>
                Engineering Constraints & Boundaries
              </label>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>
                {arch.limitations.map((lim, idx) => (
                  <li key={idx}><span style={{ color: '#ffb86b' }}>⚠</span> {lim}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'block', font: "10px 'DM Mono', monospace", color: 'var(--dim)', textTransform: 'uppercase' }}>
              Real-World Hardware Implementations
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {arch.realWorldExamples.map((ex, idx) => (
                <div key={idx} style={{ padding: '8px 12px', background: 'var(--panel2)', borderRadius: '6px', borderLeft: `3px solid ${part.color}`, fontSize: '12px', color: '#f1f5f9' }}>
                  {ex}
                </div>
              ))}
            </div>
            <label style={{ display: 'block', font: "10px 'DM Mono', monospace", color: 'var(--dim)', textTransform: 'uppercase', marginTop: '6px' }}>
              Platform Interoperability Requirements
            </label>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
              {arch.compatibility.map((c, idx) => (
                <li key={idx}>🔗 {c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Troubleshooting Section */}
      <div style={{ borderLeft: `2px solid ${part.color}`, paddingLeft: '12px', background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '0 6px 6px 0' }}>
        <span style={{ display: 'block', font: "10px 'DM Mono', monospace", color: '#ffb86b', textTransform: 'uppercase', marginBottom: '4px' }}>
          Diagnostic Isolation & Fault Recovery
        </span>
        <div style={{ color: '#bfced1', fontSize: '11px', lineHeight: 1.6 }}>
          {part.troubleshoot}
        </div>
      </div>
    </div>
  );
};

export default EnhancedEducationalInspector;

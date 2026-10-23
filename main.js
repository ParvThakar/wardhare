/**
 * wardhare — Main Interactive JavaScript Engine
 * Features:
 * 1. Hardware Data Structures (CPU, RAM, GPU, Storage, PSU, Motherboard)
 * 2. Interactive SVG Diagram with Assembled vs Exploded View Toggle
 * 3. Component Details Panel & Modal sync
 * 4. Searchable & Filterable Hardware Library
 * 5. Connections / Wiring Flow Diagrams
 * 6. Interactive Troubleshooting Diagnostics
 */

// =============================================================================
// 1. HARDWARE DATA STRUCTURE
// =============================================================================
const HARDWARE_DATA = [
  {
    id: "cpu",
    name: "Central Processing Unit (CPU)",
    shortName: "CPU",
    category: "CPU",
    symbol: "⚡",
    color: "#38bdf8",
    diagramSelector: "#comp-cpu",
    brief: "The brain of the computer that executes software instructions, arithmetic operations, and manages system control threads.",
    description: "The CPU coordinates every subsystem inside your PC. Modern microprocessors combine multiple physical cores, simultaneous multithreading (SMT/Hyper-Threading), multi-level cache hierarchies (L1, L2, 3D V-Cache), and integrated PCIe controllers.",
    specs: {
      "Architectures": "x86-64 (AMD Zen 5, Intel Arrow Lake / Raptor Lake)",
      "Current Sockets": "AMD AM5 (LGA 1718), Intel LGA 1851 / 1700",
      "Key Metrics": "Core Count, Boost Clock (GHz), IPC, TDP (65W-250W)",
      "Memory Support": "Dual-channel DDR5-5200 to DDR5-6400+",
      "Interconnect": "PCIe 5.0 lanes directly routed to primary M.2 & GPU"
    },
    connections: [
      "Mounted into Motherboard ZIF/LGA socket with retention arm",
      "Powered by 8-pin or 4+4 pin EPS 12V cable from PSU at top-left",
      "CPU Fan header (4-pin PWM) for air cooler or AIO pump header"
    ],
    troubleshooting: {
      symptom: "PC turns on, fans spin, but Motherboard CPU debug LED stays illuminated with no display.",
      causes: "Bent socket pins, missing 8-pin EPS 12V power connector, outdated BIOS without microcode for modern chip, or uneven cooler mounting pressure.",
      fix: "Verify the 8-pin CPU power cord is locked firmly. Clear CMOS by bridging pins or removing coin cell battery. Use BIOS Flashback button with a formatted USB stick if the CPU is newer than the motherboard release date."
    },
    tags: ["Processor", "AM5", "LGA1700", "Silicon", "Overclocking", "Cores"]
  },
  {
    id: "gpu",
    name: "Graphics Processing Unit (GPU)",
    shortName: "GPU",
    category: "GPU",
    symbol: "🎮",
    color: "#fb923c",
    diagramSelector: "#comp-gpu",
    brief: "Specialized accelerator designed for massive parallel processing, rendering real-time 3D geometry, shaders, and AI tensor computation.",
    description: "A modern discrete graphics card contains its own dedicated processor die, ultra-high-speed GDDR6/GDDR6X memory bus, and an engineered vapor-chamber cooler. It offloads compute-heavy rasterization, ray tracing BVH traversing, and frame generation from the CPU.",
    specs: {
      "Interface": "PCIe 4.0 / 5.0 x16 (Full-length slot with retention latch)",
      "VRAM": "8GB to 24GB GDDR6 / GDDR6X (up to 1 TB/s bandwidth)",
      "TDP Range": "115W (entry) to 450W+ (enthusiast flagship)",
      "Power Sockets": "1x 16-Pin 12V-2x6 / 12VHPWR or 2-3x traditional 8-Pin PCIe",
      "Display Outputs": "3x DisplayPort 1.4a/2.1, 1x HDMI 2.1a"
    },
    connections: [
      "Primary top PCIe x16 slot on motherboard (direct CPU electrical traces)",
      "PCIe power cables direct from PSU (avoid daisy-chain pigtails for >220W cards)",
      "Monitor DisplayPort or HDMI cable plugged strictly into the back of GPU"
    ],
    troubleshooting: {
      symptom: "Black screen on initial boot, GPU fans twitch or spin at 100%, or VGA debug LED lights up.",
      causes: "Monitor cable plugged inadvertently into Motherboard I/O instead of GPU, loose 12VHPWR connector, or card not fully clicked past PCIe latch.",
      fix: "Ensure monitor cable is inserted into the graphics card backplate. Reseat the card into PCIe slot until the retention latch snaps closed with an audible click. Verify GPU power cables are flush without gaps."
    },
    tags: ["Graphics", "VRAM", "PCIe x16", "DisplayPort", "Ray Tracing", "DirectX"]
  },
  {
    id: "motherboard",
    name: "Motherboard (Mainboard)",
    shortName: "Motherboard",
    category: "Motherboard",
    symbol: "🟩",
    color: "#10b981",
    diagramSelector: "#comp-motherboard",
    brief: "The primary printed circuit board (PCB) that houses the CPU socket, memory banks, expansion slots, and distributes power.",
    description: "The motherboard ties every physical subsystem together. It features multi-phase VRMs (Voltage Regulator Modules) to convert 12V PSU power into clean 1.1V-1.3V for the CPU, the platform chipset (B650, X670, Z790), high-frequency memory trace routing, onboard audio DACs, and rear I/O connectivity.",
    specs: {
      "Form Factors": "ATX (305x244mm), Micro-ATX (244x244mm), Mini-ITX (170x170mm)",
      "Chipsets": "AMD B650/X870, Intel B760/Z890",
      "Power Delivery": "12 to 24+2 VRM power stages with aluminium heatsinks",
      "Slots": "1x PCIe x16, multiple M.2 NVMe (Gen 4/Gen 5), 4x DDR5 DIMMs",
      "Header Ports": "Front Panel Audio, USB 3.2 Gen 2x2 Type-C, ARGB 3-Pin, PWM Fans"
    },
    connections: [
      "24-Pin ATX Main Power Harness from Power Supply",
      "8-Pin / 4+4 Pin EPS 12V at top edge near VRM heatsink",
      "Front Panel F_PANEL headers (PWR_SW, RESET, HDD_LED, POWER_LED)"
    ],
    troubleshooting: {
      symptom: "No lights, no response when chassis power button is pressed, or motherboard standoffs shorting.",
      causes: "F_PANEL Power Switch wire connected to incorrect pins, 24-pin ATX connector not latched, or metal chassis standoff touching bare solder joints behind PCB.",
      fix: "Double check chassis PWR_SW wire against the motherboard manual pin diagram. Test by gently bridging the two PWR_SW pins with a flathead screwdriver to verify if the chassis button switch is defective."
    },
    tags: ["PCB", "ATX", "VRM", "Chipset", "BIOS", "UEFI", "M.2"]
  },
  {
    id: "ram",
    name: "Random Access Memory (RAM)",
    shortName: "RAM",
    category: "RAM",
    symbol: "💾",
    color: "#c084fc",
    diagramSelector: "#comp-ram",
    brief: "High-speed volatile workspace where active operating system tasks, browser tabs, and gaming engine assets reside.",
    description: "RAM provides the CPU with ultra-low latency access to working instructions (nanosecond latency vs milliseconds for disk). Current standards utilize DDR5 with on-die ECC and dual 32-bit subchannels per stick, offering speeds from 4800 MT/s to over 7200 MT/s.",
    specs: {
      "Standard": "DDR5 (288-pin DIMM) / Legacy DDR4 (288-pin, different notch)",
      "Channels": "Dual Channel standard on desktop consumer platforms",
      "Capacity": "16GB, 32GB, 64GB kits (2x16GB or 2x32GB optimal)",
      "Frequencies": "5600 MT/s to 6400 MT/s Sweet Spot (CL30-CL36 latency)",
      "Profiles": "AMD EXPO / Intel XMP 3.0 one-click BIOS overclocking"
    },
    connections: [
      "DIMM Slots on motherboard: typically slots A2 & B2 (Slots 2 & 4 from CPU)",
      "Locks mechanically into place using single or dual side cam levers",
      "Requires zero external cables; receives power directly via motherboard 24-pin"
    ],
    troubleshooting: {
      symptom: "PC powers on, restarts continuously in a 30-second loop (memory training), or DRAM LED remains solid amber/orange.",
      causes: "RAM modules seated in incorrect slots (using slots 1 & 3 instead of 2 & 4), unseated lock tab, or aggressive XMP/EXPO profile unsupported by memory controller.",
      fix: "Firmly reseat sticks into slots 2 and 4 until both latches click. When first booting DDR5, give the PC up to 2-3 minutes for initial memory training. If it fails, clear CMOS to revert to standard JEDEC frequencies."
    },
    tags: ["Memory", "DDR5", "DDR4", "EXPO", "XMP", "Dual-Channel", "DIMM"]
  },
  {
    id: "storage",
    name: "Storage Subsystem (NVMe M.2 & SATA)",
    shortName: "Storage",
    category: "Storage",
    symbol: "💽",
    color: "#f472b6",
    diagramSelector: "#comp-storage",
    brief: "Non-volatile storage holding your OS, games, media, and programs permanently even when powered down.",
    description: "Modern solid state drives come in ultra-compact M.2 NVMe form factors (PCIe 4.0/5.0) that screw directly into the motherboard, delivering read speeds up to 7,000 - 14,000 MB/s. Legacy 2.5-inch SATA SSDs and 3.5-inch mechanical hard drives connect via SATA cables for bulk archiving.",
    specs: {
      "Form Factors": "M.2 2280 (22mm wide, 80mm long), 2.5-inch SATA, 3.5-inch HDD",
      "Protocols": "NVMe 2.0 over PCIe Gen4 x4 / Gen5 x4; SATA III (6 Gbps)",
      "Speeds": "NVMe: 3,500 - 14,000 MB/s; SATA: 550 MB/s; HDD: ~180 MB/s",
      "Flash Types": "3D TLC (Triple-Level Cell) with DRAM Cache, QLC",
      "Durability": "TBW (Terabytes Written) rating, typically 600-1200 TBW per 1TB"
    },
    connections: [
      "M.2 NVMe: Slid into keyed M-key slot at a 30-degree angle and fastened with screw or toolless latch",
      "2.5-inch / 3.5-inch Drives: 7-Pin SATA Data cable to motherboard + 15-Pin SATA Power from PSU"
    ],
    troubleshooting: {
      symptom: "BIOS boots to UEFI screen every time; 'Reboot and Select proper Boot device' error or drive missing from Windows installer.",
      causes: "M.2 NVMe not seated all the way into slot before screwing down, drive formatted with legacy MBR instead of GPT for UEFI, or disabled CSM.",
      fix: "Remove M.2 thermal heatsink, pull SSD out and reinsert firmly into keyed socket before latching. In BIOS, ensure boot mode is set to UEFI rather than Legacy/CSM. Ensure VMD controller is disabled if doing Intel installs."
    },
    tags: ["NVMe", "SSD", "M.2", "PCIe Gen4", "SATA", "Hard Drive", "Storage"]
  },
  {
    id: "psu",
    name: "Power Supply Unit (PSU)",
    shortName: "Power Supply",
    category: "PSU",
    symbol: "🔌",
    color: "#facc15",
    diagramSelector: "#comp-psu",
    brief: "Converts high-voltage alternating current (AC) from wall outlets into steady, regulated low-voltage direct current (DC).",
    description: "The PSU is the heart of system safety and stability. It converts 115V-230V AC mains into +12V (for CPU, GPU, motors), +5V, and +3.3V rails. Modern ATX 3.1 supplies include native 12V-2x6 cables capable of handling instantaneous 200% power excursions.",
    specs: {
      "Wattage": "650W, 750W, 850W, 1000W+ based on GPU/CPU electrical load",
      "Efficiency": "80 PLUS Gold, Platinum, Titanium / Cybenetics ETA & LAMBDA",
      "Form Factors": "ATX (Standard), SFX / SFX-L (Small Form Factor)",
      "Modularity": "Fully Modular (plug only what you need), Semi-modular, Non-modular",
      "Protection": "OVP, UVP, OCP, OTP, OPP, SCP (Over-power and Short-circuit protection)"
    },
    connections: [
      "Main 24-Pin ATX to motherboard right side",
      "8-Pin EPS CPU cable(s) to top-left motherboard header",
      "6+2 Pin PCIe or 12V-2x6 (16-Pin) to dedicated GPU",
      "15-Pin SATA Power to 2.5\" SSDs, fan hubs, and AIO water coolers"
    ],
    troubleshooting: {
      symptom: "PC instantly shuts down under heavy gaming loads, or zero power LEDs turn on despite plugging into wall.",
      causes: "I/O rocker switch on back of PSU in 'O' (Off) position, tripped over-current protection (OPP) from GPU power spike, or loose wall cord.",
      fix: "Check rocker switch is set to '|' (On). Ensure wall outlet has power. For high-end GPUs, calculate recommended wattage with 150W headroom. Never reuse modular cables from a different PSU brand—pinouts on the PSU housing are NOT standardized and will fry components!"
    },
    tags: ["Power", "ATX 3.0", "Efficiency", "80-Plus", "Modular", "Wattage"]
  }
];

// =============================================================================
// 2. CONNECTIONS FLOW DATA
// =============================================================================
const FLOW_DATA = {
  power: {
    title: "⚡ Complete Power Distribution Network",
    summary: "Power originates from your AC wall socket and is transformed by the PSU into dedicated DC rails (+12V, +5V, +3.3V). The +12V rail carries >90% of system power directly feeding CPU VRMs and the GPU core.",
    steps: [
      { name: "AC Mains Outlet", sub: "115V / 230V AC", icon: "🔌" },
      { name: "Power Supply (PSU)", sub: "Transforms to +12V, +5V, +3.3V", icon: "⚙️" },
      { name: "Motherboard & VRMs", sub: "Step-down to ~1.2V Core", icon: "🟩" },
      { name: "CPU & Graphics Card", sub: "Silicon Compute Cores", icon: "⚡" }
    ],
    details: [
      "<strong>24-Pin ATX:</strong> Feeds motherboard chipset, PCIe slots (delivers up to 75W mechanical slot power), RAM, and audio.",
      "<strong>8-Pin EPS (CPU):</strong> Direct uninterrupted +12V rail dedicated to the CPU VRM mosfets.",
      "<strong>PCIe Power (6+2 pin or 12V-2x6):</strong> Feeds dedicated graphics card for high-draw 3D rendering workloads."
    ]
  },
  data: {
    title: "🔀 High-Speed Data Highway & PCIe Topography",
    summary: "Modern PC platforms split traffic between direct CPU PCIe lanes (ultra-low latency for graphics and primary NVMe) and the Motherboard Chipset hub (secondary storage, USB, Wi-Fi, Ethernet).",
    steps: [
      { name: "CPU Cores", sub: "Compute Engine & Memory Controller", icon: "🧠" },
      { name: "Direct PCIe 5.0 Lanes", sub: "x16 GPU Slot + x4 M.2 SSD", icon: "🚀" },
      { name: "Platform Chipset", sub: "DMI / PCIe Downstream Bus", icon: "🎛️" },
      { name: "Peripherals & SATA", sub: "USB, Audio, LAN, Extra M.2", icon: "⌨️" }
    ],
    details: [
      "<strong>Primary M.2 NVMe:</strong> Runs directly off CPU lanes with lowest latency. Always install your OS drive here.",
      "<strong>Primary PCIe Slot:</strong> Directly connected 16 PCIe Gen 5 lanes running straight to CPU without passing through chipset.",
      "<strong>Memory Bus:</strong> Dedicated high-frequency 128-bit dual-channel bus connecting CPU memory controller directly to DIMMs."
    ]
  },
  "front-panel": {
    title: "🔌 Front Panel Header (F_PANEL) Demystified",
    summary: "The front panel connector block (usually 9 pins arranged 5 on top, 4 on bottom) connects chassis buttons and activity LEDs to the motherboard.",
    steps: [
      { name: "Chassis Power Switch", sub: "PWR_SW (Pins 6 & 8)", icon: "🔘" },
      { name: "Chassis Reset Button", sub: "RESET_SW (Pins 5 & 7)", icon: "🔄" },
      { name: "Power LED Indicators", sub: "+ / - P_LED (Pins 2 & 4)", icon: "💡" },
      { name: "Storage Drive Activity", sub: "+ / - HDD_LED (Pins 1 & 3)", icon: "💾" }
    ],
    details: [
      "<strong>Power Switch & Reset Switch:</strong> These are momentary push buttons with NO polarity. You can plug them in either direction.",
      "<strong>Power LED & HDD LED:</strong> These are Light Emitting Diodes with STRICT polarity. Positive (+) wire must go to positive pin.",
      "<strong>Pro Tip:</strong> Look for a small triangle embossed on the plastic connector sleeve—the triangle designates Pin 1 (+ positive)."
    ]
  },
  display: {
    title: "🖥️ Display Port Connections & Common Pitfalls",
    summary: "High-refresh gaming panels (144Hz - 360Hz) require proper cable selection and exact port placement on the chassis rear.",
    steps: [
      { name: "Graphics Card Backplate", sub: "Discrete GPU Horizontal Bracket", icon: "🎮" },
      { name: "DisplayPort 1.4 / 2.1", sub: "Best for FreeSync / G-Sync", icon: "🔌" },
      { name: "HDMI 2.1 Port", sub: "For 4K 120Hz TVs / OLEDs", icon: "📺" },
      { name: "Monitor Input", sub: "Select matching source", icon: "🖥️" }
    ],
    details: [
      "<strong>Critical Rule:</strong> NEVER plug your monitor cable into the motherboard I/O ports at the top rear if your system has a dedicated GPU! Doing so runs graphics off weak integrated CPU graphics instead of your GPU.",
      "<strong>DisplayPort vs HDMI:</strong> DisplayPort is generally preferred for PC gaming monitors as it guarantees variable refresh rate (VRR) and full HDR dynamic range.",
      "<strong>Bandwidth:</strong> HDMI 2.1 supports up to 48 Gbps (4K 120Hz uncompressed), while DisplayPort 2.1 supports up to 80 Gbps."
    ]
  }
};

// =============================================================================
// 3. TROUBLESHOOTING DATA
// =============================================================================
const TROUBLESHOOT_DATA = {
  "no-post": {
    title: "No POST / Black Screen (Fans spin but no display)",
    description: "The system powers on physically, but fails to reach the Power-On Self Test (POST) stage and the monitor receives no signal.",
    symptoms: [
      "Fans spin up, RGB lighting turns on, but display says 'No Signal'",
      "Motherboard Debug LED stuck on 'CPU', 'DRAM', or 'VGA'",
      "Keyboard Caps Lock key does not toggle on/off (indicates system has not initialized)"
    ],
    steps: [
      {
        title: "Check Display Cable Routing",
        desc: "Ensure the HDMI or DisplayPort cable is plugged into the discrete Graphics Card bracket, NOT the motherboard rear I/O plate."
      },
      {
        title: "Reseat RAM Sticks & Try Single Stick in Slot A2",
        desc: "DDR5 memory requires significant downward insertion force. Remove sticks and firmly seat a single stick into slot 2 (A2) until both retention tabs click shut."
      },
      {
        title: "Clear Motherboard CMOS",
        desc: "Unplug the PC from the wall, short the CLRTC / Clear CMOS header with a metal screwdriver for 10 seconds (or remove the round CR2032 silver coin cell battery for 5 minutes), then power on to reset BIOS to factory defaults."
      },
      {
        title: "Inspect 8-Pin CPU and 12V-2x6 Power Cables",
        desc: "Verify that the 8-pin EPS cable at the top-left of the motherboard is fully seated. Ensure 12VHPWR cables on newer GPUs have no gap between plug and socket."
      }
    ]
  },
  "crash": {
    title: "Random Crashes, Freezes & Blue Screen (BSOD)",
    description: "Windows boots up but crashes under load or when gaming, exhibiting WHEA_UNCORRECTABLE_ERROR, MEMORY_MANAGEMENT, or sudden reboots.",
    symptoms: [
      "Games crash to desktop without error message after 10-15 minutes",
      "Blue Screen of Death (BSOD) with varied error codes",
      "System freeze requiring hard reset with power button"
    ],
    steps: [
      {
        title: "Test Memory Stability (Disable XMP / EXPO)",
        desc: "Enter BIOS and temporarily toggle off XMP/EXPO memory overclocking profile to see if crashes cease. Run Windows Memory Diagnostic or MemTest86."
      },
      {
        title: "Use Separate Dedicated PCIe Cables for GPU",
        desc: "If your graphics card uses multiple 8-pin power connectors, do not use daisy-chain pigtails from a single wire. Run two or three independent cables from the PSU."
      },
      {
        title: "Clean Driver Installation via DDU",
        desc: "Boot Windows into Safe Mode, run Display Driver Uninstaller (DDU) to wipe existing Nvidia/AMD drivers, and install the newest WHQL certified release."
      },
      {
        title: "Update Motherboard BIOS",
        desc: "Recent motherboard updates resolve critical memory timing sub-parameters and CPU voltage microcode anomalies."
      }
    ]
  },
  "thermal": {
    title: "Overheating & CPU / GPU Thermal Throttling",
    description: "Fans roar loudly at 100% RPM, game frame rates stutter violently, or CPU temperatures exceed 95°C under minor usage.",
    symptoms: [
      "CPU package temperature hits 95°C-100°C instantly on desktop or during application launches",
      "Case glass feels scorching hot to touch",
      "PC unexpectedly turns off completely during heavy gaming (thermal safety cutoff)"
    ],
    steps: [
      {
        title: "Verify Cooler Protective Plastic Peel was Removed",
        desc: "The single most common PC building oversight: unscrew your CPU cooler heatsink and verify that the transparent protective plastic sticker underneath was peeled off prior to applying thermal paste."
      },
      {
        title: "Check Cooler Mounting Pressure & Thermal Paste",
        desc: "Ensure cooler mounting screws are tightened evenly in an alternating diagonal criss-cross pattern until hand-tight. Ensure fresh non-conductive thermal compound is spread across the heatspreader."
      },
      {
        title: "Verify AIO Water Pump Header Operation",
        desc: "For Liquid Coolers (AIOs), ensure the pump cable is connected to the dedicated AIO_PUMP or W_PUMP motherboard header and configured to run at 100% RPM in BIOS."
      },
      {
        title: "Audit Chassis Airflow Configuration",
        desc: "Ensure front/bottom fans are oriented as INTAKE (drawing fresh air inward) and rear/top fans are oriented as EXHAUST (pushing hot air out)."
      }
    ]
  },
  "storage": {
    title: "M.2 NVMe or SSD Drive Not Detected",
    description: "Storage drive does not show up in BIOS boot menu, or Windows 11 installation says 'We couldn't find any drives'.",
    symptoms: [
      "BIOS lists M.2 slot as 'Empty' or 'N/A'",
      "Secondary storage drive appears in Device Manager but missing in 'This PC'",
      "BIOS boots directly into UEFI utility instead of loading OS"
    ],
    steps: [
      {
        title: "Physically Reseat M.2 NVMe Drive",
        desc: "M.2 drives must be inserted firmly at a 30-degree incline until golden contact fingers disappear inside the socket before pushing down and latching."
      },
      {
        title: "Initialize New Drives in Windows Disk Management",
        desc: "New SSDs come unpartitioned. Right-click Start button -> Disk Management. When prompted, initialize disk as GPT, right-click unallocated space and choose 'New Simple Volume'."
      },
      {
        title: "Disable Intel VMD or Enable UEFI Boot Mode",
        desc: "On 12th-14th Gen Intel platforms, disable 'Intel VMD' in BIOS Advanced Storage settings so the Windows installer can recognize the NVMe drive without manual driver extraction."
      },
      {
        title: "Verify SATA Power & Data Cables",
        desc: "For 2.5-inch SSDs, ensure BOTH the wide 15-pin power cable from PSU and narrow 7-pin data cable connected to motherboard SATA port 1 are plugged in."
      }
    ]
  },
  "beeps": {
    title: "Motherboard Debug Q-LEDs & Speaker Beep Codes",
    description: "Deciphering onboard diagnostic color LEDs (CPU, DRAM, VGA, BOOT) and buzzer beep sequences.",
    symptoms: [
      "Motherboard 4-LED cluster stops at one specific light",
      "System buzzer plays audible sequence of short and long beeps",
      "Seven-segment numerical Q-Code display shows error code (e.g. 55, 00, d6)"
    ],
    steps: [
      {
        title: "RED Q-LED (CPU Error)",
        desc: "Indicates CPU initialization failure. Check 8-pin EPS power cables, check for bent socket pins, or perform USB BIOS Flashback."
      },
      {
        title: "YELLOW / ORANGE Q-LED (DRAM Error)",
        desc: "Memory training failure or unseated RAM. Reseat sticks in slots 2 and 4. Wait up to 3 minutes on DDR5 platforms for first training cycle."
      },
      {
        title: "WHITE Q-LED (VGA Error)",
        desc: "Graphics card detection failure. Check monitor cable, ensure monitor is turned ON before powering PC, and verify GPU PCIe retention clip is clicked."
      },
      {
        title: "GREEN Q-LED (BOOT Error)",
        desc: "POST succeeded, but no bootable operating system drive found. Insert your bootable Windows USB installation drive."
      }
    ]
  }
};

// =============================================================================
// 4. UI STATE & INTERACTIVE CONTROLLERS
// =============================================================================

let activeViewMode = "assembled"; // "assembled" | "exploded"
let selectedComponentId = null;
let currentCategoryFilter = "ALL";
let searchQuery = "";

// DOM Elements cache
const DOM = {
  get btnAssembled() { return document.getElementById("btn-assembled"); },
  get btnExploded() { return document.getElementById("btn-exploded"); },
  get pcSvg() { return document.getElementById("pc-svg"); },
  get viewIndicatorBadge() { return document.getElementById("view-indicator-badge"); },
  get detailEmptyState() { return document.getElementById("detail-empty-state"); },
  get detailActiveContent() { return document.getElementById("detail-active-content"); },
  get hardwareGrid() { return document.getElementById("hardware-grid-container"); },
  get categoryFilterBar() { return document.getElementById("category-filter-bar"); },
  get librarySearchInput() { return document.getElementById("library-search-input"); },
  get clearSearchBtn() { return document.getElementById("clear-search-btn"); },
  get noSearchResults() { return document.getElementById("no-search-results"); },
  get resetFiltersBtn() { return document.getElementById("reset-filters-btn"); },
  get countAll() { return document.getElementById("count-all"); },
  get flowTabs() { return document.getElementById("connection-tabs"); },
  get flowDisplayCard() { return document.getElementById("flow-display-card"); },
  get troubleshootTabs() { return document.getElementById("troubleshoot-tabs"); },
  get troubleshootContentBox() { return document.getElementById("troubleshoot-content-box"); },
  get modalOverlay() { return document.getElementById("hardware-modal-overlay"); },
  get modalCloseBtn() { return document.getElementById("modal-close-btn"); },
  get modalBodyContainer() { return document.getElementById("modal-body-container"); }
};

// =============================================================================
// 5. DIAGRAM VIEW TOGGLER (Assembled vs Exploded)
// =============================================================================
function setDiagramView(mode) {
  activeViewMode = mode;
  const pcSvg = DOM.pcSvg;
  const btnExploded = DOM.btnExploded;
  const btnAssembled = DOM.btnAssembled;
  const viewBadge = DOM.viewIndicatorBadge;

  if (mode === "exploded") {
    if (pcSvg) {
      pcSvg.classList.remove("assembled");
      pcSvg.classList.add("exploded");
    }
    if (btnExploded) {
      btnExploded.classList.add("active");
      btnExploded.setAttribute("aria-pressed", "true");
    }
    if (btnAssembled) {
      btnAssembled.classList.remove("active");
      btnAssembled.setAttribute("aria-pressed", "false");
    }
    if (viewBadge) {
      viewBadge.textContent = "MODE: EXPLODED SCHEMATIC";
      viewBadge.style.color = "#fb923c";
      viewBadge.style.borderColor = "rgba(251, 146, 60, 0.4)";
    }
  } else {
    if (pcSvg) {
      pcSvg.classList.remove("exploded");
      pcSvg.classList.add("assembled");
    }
    if (btnAssembled) {
      btnAssembled.classList.add("active");
      btnAssembled.setAttribute("aria-pressed", "true");
    }
    if (btnExploded) {
      btnExploded.classList.remove("active");
      btnExploded.setAttribute("aria-pressed", "false");
    }
    if (viewBadge) {
      viewBadge.textContent = "MODE: ASSEMBLED TOWER";
      viewBadge.style.color = "#38bdf8";
      viewBadge.style.borderColor = "rgba(56, 189, 248, 0.4)";
    }
  }
}
window.setDiagramView = setDiagramView; // Expose globally for header/footer links

// =============================================================================
// 6. COMPONENT SELECTION & DETAIL PANEL RENDERING
// =============================================================================
function selectComponent(componentId, openModalOnMobile = false) {
  const comp = HARDWARE_DATA.find(item => item.id === componentId);
  if (!comp) return;

  selectedComponentId = componentId;

  // Update SVG highlight classes
  document.querySelectorAll(".component-group").forEach(el => {
    el.classList.remove("selected");
  });
  const svgGroup = document.getElementById(`comp-${componentId}`);
  if (svgGroup) {
    svgGroup.classList.add("selected");
  }

  // Update Quick Chips
  document.querySelectorAll(".chip-btn").forEach(btn => {
    if (btn.getAttribute("data-target") === componentId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Render content in side panel
  renderDetailPanel(comp);

  // If on mobile / smaller viewport or requested, show modal
  if (openModalOnMobile && window.innerWidth <= 900) {
    openModalWithComponent(comp);
  }
}
window.selectComponent = selectComponent;

function renderDetailPanel(comp) {
  DOM.detailEmptyState.classList.add("hidden");
  DOM.detailActiveContent.classList.remove("hidden");

  let specsHtml = "";
  for (const [key, value] of Object.entries(comp.specs)) {
    specsHtml += `
      <li>
        <span class="spec-key">${key}</span>
        <span class="spec-val">${value}</span>
      </li>
    `;
  }

  let connHtml = "";
  comp.connections.forEach(item => {
    connHtml += `<li>${item}</li>`;
  });

  DOM.detailActiveContent.innerHTML = `
    <div class="detail-header">
      <div class="detail-title-wrap">
        <span class="detail-category-badge" style="background: ${comp.color}22; color: ${comp.color}; border: 1px solid ${comp.color}55;">
          ${comp.symbol} ${comp.category}
        </span>
        <h3 class="detail-title">${comp.name}</h3>
        <p class="detail-tagline">${comp.brief}</p>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">
        <span>📖 Architectural Role</span>
      </div>
      <p class="detail-desc">${comp.description}</p>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">
        <span>⚙️ Key Specifications & Standards</span>
      </div>
      <ul class="specs-list">
        ${specsHtml}
      </ul>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">
        <span>🔌 Power & Bus Connections</span>
      </div>
      <ul class="matrix-points">
        ${connHtml}
      </ul>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">
        <span>🚨 Diagnosis & Troubleshooting</span>
      </div>
      <div class="trouble-card">
        <div class="trouble-header">Common Symptom: ${comp.troubleshooting.symptom}</div>
        <div class="trouble-fix"><strong>Root Cause:</strong> ${comp.troubleshooting.causes}</div>
        <div class="trouble-fix" style="margin-top: 6px;"><strong>Resolution:</strong> ${comp.troubleshooting.fix}</div>
      </div>
    </div>
  `;
}

function openModalWithComponent(comp) {
  let specsHtml = "";
  for (const [key, value] of Object.entries(comp.specs)) {
    specsHtml += `
      <li>
        <span class="spec-key">${key}</span>
        <span class="spec-val">${value}</span>
      </li>
    `;
  }

  DOM.modalBodyContainer.innerHTML = `
    <div class="detail-header">
      <div class="detail-title-wrap">
        <span class="detail-category-badge" style="background: ${comp.color}22; color: ${comp.color}; border: 1px solid ${comp.color}55;">
          ${comp.symbol} ${comp.category}
        </span>
        <h3 class="detail-title">${comp.name}</h3>
        <p class="detail-tagline">${comp.brief}</p>
      </div>
    </div>

    <div class="detail-section">
      <p class="detail-desc">${comp.description}</p>
    </div>

    <div class="detail-section">
      <div class="detail-section-title"><span>⚙️ Specifications</span></div>
      <ul class="specs-list">${specsHtml}</ul>
    </div>

    <div class="detail-section">
      <div class="detail-section-title"><span>🚨 Troubleshooting</span></div>
      <div class="trouble-card">
        <div class="trouble-header">${comp.troubleshooting.symptom}</div>
        <div class="trouble-fix" style="margin-top: 6px;">${comp.troubleshooting.fix}</div>
      </div>
    </div>
  `;

  DOM.modalOverlay.classList.remove("hidden");
}

function closeModal() {
  DOM.modalOverlay.classList.add("hidden");
}

// =============================================================================
// 7. HARDWARE LIBRARY FILTERING & SEARCH
// =============================================================================
function renderHardwareLibrary() {
  const filtered = HARDWARE_DATA.filter(item => {
    // Category match
    const categoryMatch = (currentCategoryFilter === "ALL") || (item.category.toUpperCase() === currentCategoryFilter.toUpperCase());
    
    // Search match
    if (!categoryMatch) return false;
    if (!searchQuery) return true;

    const q = searchQuery.toLowerCase();
    const inName = item.name.toLowerCase().includes(q);
    const inBrief = item.brief.toLowerCase().includes(q);
    const inDesc = item.description.toLowerCase().includes(q);
    const inTags = item.tags.some(tag => tag.toLowerCase().includes(q));
    const inSpecs = Object.entries(item.specs).some(([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q));

    return inName || inBrief || inDesc || inTags || inSpecs;
  });

  DOM.countAll.textContent = HARDWARE_DATA.length;

  if (filtered.length === 0) {
    DOM.hardwareGrid.innerHTML = "";
    DOM.noSearchResults.classList.remove("hidden");
    return;
  }

  DOM.noSearchResults.classList.add("hidden");

  DOM.hardwareGrid.innerHTML = filtered.map(item => `
    <div class="hardware-card" data-component-id="${item.id}">
      <div class="card-top">
        <span class="card-category" style="background: ${item.color}20; color: ${item.color}; border: 1px solid ${item.color}40;">
          ${item.category}
        </span>
        <span class="card-symbol">${item.symbol}</span>
      </div>
      <h3 class="card-title">${item.name}</h3>
      <p class="card-brief">${item.brief}</p>
      
      <div class="card-tags">
        ${item.tags.map(t => `<span class="card-tag">#${t}</span>`).join("")}
      </div>

      <div class="card-footer">
        <button class="card-link view-diagram-link" data-id="${item.id}">
          Inspect in Schematic 
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  `).join("");

  // Attach card click handlers
  DOM.hardwareGrid.querySelectorAll(".hardware-card").forEach(card => {
    card.addEventListener("click", (e) => {
      const id = card.getAttribute("data-component-id");
      selectComponent(id, true);
      // Smooth scroll back to diagram view
      const diagramEl = document.getElementById("diagram");
      if (diagramEl) {
        diagramEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

// =============================================================================
// 8. CONNECTIONS & FLOW RENDERING
// =============================================================================
function renderFlowSection(flowKey) {
  const data = FLOW_DATA[flowKey];
  if (!data) return;

  const stepsHtml = data.steps.map((s, idx) => `
    <div class="flow-step-node">
      <span class="flow-step-icon">${s.icon}</span>
      <span class="flow-step-name">${s.name}</span>
      <span class="flow-step-sub">${s.sub}</span>
    </div>
    ${idx < data.steps.length - 1 ? `<div class="flow-arrow">➔</div>` : ""}
  `).join("");

  const detailsHtml = data.details.map(d => `<li>${d}</li>`).join("");

  DOM.flowDisplayCard.innerHTML = `
    <div class="flow-diagram-visual">
      ${stepsHtml}
    </div>
    <div class="flow-summary-box">
      <strong>${data.title}</strong>
      <p style="margin-top: 6px; color: var(--text-muted);">${data.summary}</p>
      <ul class="matrix-points" style="margin-top: 14px;">
        ${detailsHtml}
      </ul>
    </div>
  `;
}

// =============================================================================
// 9. TROUBLESHOOTING RENDERING
// =============================================================================
function renderTroubleshootSection(categoryKey) {
  const data = TROUBLESHOOT_DATA[categoryKey];
  if (!data) return;

  const symptomsList = data.symptoms.map(s => `
    <div class="ts-issue-card">
      <p>${s}</p>
    </div>
  `).join("");

  const stepsList = data.steps.map((st, i) => `
    <div class="ts-step-item">
      <div class="ts-step-num">${i + 1}</div>
      <div class="ts-step-body">
        <h5>${st.title}</h5>
        <p>${st.desc}</p>
      </div>
    </div>
  `).join("");

  DOM.troubleshootContentBox.innerHTML = `
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 1.35rem; color: #fff; margin-bottom: 6px;">${data.title}</h3>
      <p style="color: var(--text-muted); font-size: 0.95rem;">${data.description}</p>
    </div>

    <div class="ts-content-grid">
      <div class="ts-symptoms-col">
        <div class="ts-col-title">
          <span>⚠️ Observed Symptoms</span>
        </div>
        ${symptomsList}
      </div>

      <div class="ts-fixes-col">
        <div class="ts-col-title">
          <span>🛠️ Systematic Diagnostic Checklist</span>
        </div>
        ${stepsList}
      </div>
    </div>
  `;
}

// =============================================================================
// 10. EVENT LISTENERS INITIALIZATION
// =============================================================================
function initEventListeners() {
  // Diagram View Mode Buttons
  DOM.btnAssembled.addEventListener("click", () => setDiagramView("assembled"));
  DOM.btnExploded.addEventListener("click", () => setDiagramView("exploded"));

  // Interactive SVG Group Clicks & Keyboard accessibility
  document.querySelectorAll(".component-group").forEach(group => {
    const compId = group.getAttribute("data-component-id");
    group.addEventListener("click", () => {
      selectComponent(compId, true);
    });
    group.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectComponent(compId, true);
      }
    });
  });

  // Quick Chips
  document.querySelectorAll(".chip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      selectComponent(target, true);
    });
  });

  // Empty state link button
  document.querySelectorAll(".link-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      selectComponent(target, true);
    });
  });

  // Category Filters in Hardware Library
  DOM.categoryFilterBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    DOM.categoryFilterBar.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategoryFilter = btn.getAttribute("data-category");
    renderHardwareLibrary();
  });

  // Search input in Library
  DOM.librarySearchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim();
    if (searchQuery.length > 0) {
      DOM.clearSearchBtn.classList.remove("hidden");
    } else {
      DOM.clearSearchBtn.classList.add("hidden");
    }
    renderHardwareLibrary();
  });

  // Clear search button
  DOM.clearSearchBtn.addEventListener("click", () => {
    DOM.librarySearchInput.value = "";
    searchQuery = "";
    DOM.clearSearchBtn.classList.add("hidden");
    renderHardwareLibrary();
    DOM.librarySearchInput.focus();
  });

  // Reset filters button
  DOM.resetFiltersBtn.addEventListener("click", () => {
    DOM.librarySearchInput.value = "";
    searchQuery = "";
    DOM.clearSearchBtn.classList.add("hidden");
    currentCategoryFilter = "ALL";
    DOM.categoryFilterBar.querySelectorAll(".filter-btn").forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-category") === "ALL");
    });
    renderHardwareLibrary();
  });

  // Connection Flow Tabs
  DOM.flowTabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".flow-tab");
    if (!tab) return;
    DOM.flowTabs.querySelectorAll(".flow-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const flow = tab.getAttribute("data-flow");
    renderFlowSection(flow);
  });

  // Troubleshooting Tabs
  DOM.troubleshootTabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".ts-tab");
    if (!tab) return;
    DOM.troubleshootTabs.querySelectorAll(".ts-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const cat = tab.getAttribute("data-category");
    renderTroubleshootSection(cat);
  });

  // Modal Close Handlers
  if (DOM.modalCloseBtn) {
    DOM.modalCloseBtn.addEventListener("click", closeModal);
  }
  if (DOM.modalOverlay) {
    DOM.modalOverlay.addEventListener("click", (e) => {
      if (e.target === DOM.modalOverlay) {
        closeModal();
      }
    });
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && DOM.modalOverlay && !DOM.modalOverlay.classList.contains("hidden")) {
      closeModal();
    }
  });

  // Smooth Navigation & Scroll Spy for Navigation Links
  const navLinks = document.querySelectorAll(".nav-links a");
  const sections = ["diagram", "library", "connections", "troubleshooting"];
  
  window.addEventListener("scroll", () => {
    let currentSectionId = "";
    const scrollPos = window.scrollY + 120;

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = id;
        }
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === `#${currentSectionId}`) {
          link.classList.add("active");
          link.style.color = "#38bdf8";
        } else {
          link.classList.remove("active");
          link.style.color = "";
        }
      });
    }
  }, { passive: true });
}

// =============================================================================
// 11. APP BOOTSTRAP
// =============================================================================
function initApp() {
  initEventListeners();
  renderHardwareLibrary();
  renderFlowSection("power");
  renderTroubleshootSection("no-post");

  // Select CPU as default active component in diagram panel
  selectComponent("cpu", false);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

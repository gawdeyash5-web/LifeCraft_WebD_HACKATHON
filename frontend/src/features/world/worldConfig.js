/**
 * LIFECRAFT 3D World Configuration (Upgraded Living Diorama)
 * 
 * Centralizes all scale factors, positions, rotations, camera targets,
 * realm coordinates, player waypoints, and day/night cycle timing.
 */

export const REALMS = {
  MIND: 'mind',
  BODY: 'body',
  CRAFT: 'craft',
};

export const WORLD_CONFIG = {
  // Day / Night Game Clock parameters
  dayCycle: {
    dayLengthSeconds: 120, // 2 minutes per in-game 24h day
    initialTime: 0.42,     // Starts at sunny late morning
  },

  // Fallback / Base Lighting
  lighting: {
    ambient: {
      color: '#cbd5e1',
      intensity: 0.75,
    },
    sun: {
      color: '#fffbeb',
      intensity: 1.85,
      position: [14, 20, 10],
    },
    fill: {
      color: '#93c5fd',
      intensity: 0.45,
      position: [-12, 10, -10],
    },
  },

  // Central Plaza: Player & Streak Campfire
  center: {
    position: [0, 0, 0],
    plazaRadius: 3.2,
  },

  player: {
    position: [0, 0, 0.4],
    rotation: [0, Math.PI * 0.1, 0],
    scale: [1.1, 1.1, 1.1],
    walkSpeed: 3.2, // Movement speed when navigating between waypoints
  },

  // Player Navigation Waypoints
  waypoints: {
    center: [0, 0, 0.4],
    mind: [-4.6, 0, -3.2],
    body: [-4.4, 0, 3.2],
    craft: [4.8, 0, 0.4],
    // Mind Sub-Island Bridge & Destination Waypoints
    mind_bridge_start: [-7.8, 0.05, -5.6],
    mind_bridge_mid: [-9.9, 0.25, -7.1],
    mind_bridge_end: [-12.0, 0.45, -8.6],
    mind_library: [-13.8, 0.5, -9.6],
    // Body Sub-Island Bridge & Destination Waypoints
    body_bridge_start: [-7.6, 0.05, 5.7],
    body_bridge_mid: [-9.7, -0.1, 7.25],
    body_bridge_end: [-11.8, -0.25, 8.8],
    body_coliseum: [-13.4, -0.3, 9.8],
    // Craft Sub-Island Bridge & Destination Waypoints
    craft_bridge_start: [7.8, 0.05, 0.5],
    craft_bridge_mid: [10.0, 0.2, 0.6],
    craft_bridge_end: [12.2, 0.35, 0.7],
    craft_foundry: [13.8, 0.35, 0.8],
  },

  campfire: {
    position: [0, 0, -0.6],
    rotation: [0, 0, 0],
    scale: [1.35, 1.35, 1.35],
    light: {
      color: '#ff7700',
      intensityDay: 2.2,
      intensityNight: 4.2, // Glowing focal point at night
      distance: 7.5,
      decay: 2,
    },
  },

  // Realm Coordinates & Identity
  mind: {
    id: REALMS.MIND,
    name: 'Mind Realm',
    title: 'MIND',
    subheading: 'Knowledge • Focus • Growth',
    description: 'Study arcana, master intellect, and complete deep-work quests.',
    position: [-6.2, 0, -4.5],
    rotation: [0, Math.PI * 0.35, 0],
    scale: [1.8, 1.8, 1.8],
    color: '#818cf8',       // Indigo
    accentColor: '#c084fc', // Arcane purple glow
    cameraTarget: [-5.4, 0.8, -3.8],
    cameraPosition: [-2.0, 5.6, -0.6],
  },

  body: {
    id: REALMS.BODY,
    name: 'Body Realm',
    title: 'BODY',
    subheading: 'Strength • Health • Discipline',
    description: 'Build physical discipline, log workouts, and conquer habits.',
    position: [-6.0, 0, 4.5],
    structure: {
      position: [-6.2, 0, 4.8],
      rotation: [0, -Math.PI * 0.25, 0],
      scale: [1.5, 1.5, 1.5],
    },
    target: {
      position: [-4.2, 0, 3.6],
      rotation: [0, -Math.PI * 0.65, 0],
      scale: [1.35, 1.35, 1.35],
    },
    color: '#34d399',       // Emerald
    accentColor: '#10b981', // Green vitality glow
    cameraTarget: [-5.2, 0.8, 3.8],
    cameraPosition: [-1.4, 5.4, 0.6],
  },

  craft: {
    id: REALMS.CRAFT,
    name: 'Craft Realm',
    title: 'CRAFT',
    subheading: 'Create • Build • Innovate',
    description: 'Forge tools, master engineering, and construct ambitious projects.',
    position: [6.2, 0, 0.4],
    yOffset: 1.35, // Elevates base flush onto riverbank
    rotation: [0, -Math.PI * 0.5, 0],
    scale: [1.5, 1.5, 1.5],
    color: '#f59e0b',       // Amber
    accentColor: '#fbbf24', // Warm gold glow
    cameraTarget: [5.5, 0.9, 0.4],
    cameraPosition: [1.6, 5.5, 3.4],
  },

  // Bridge connecting Central Island to Craft Realm across canal
  bridge: {
    position: [2.85, 0.02, 0.25],
    rotation: [0, Math.PI * 0.5, 0],
    scale: [1.4, 1.25, 1.6],
  },

  // Overview Camera Settings
  camera: {
    defaultPosition: [14.0, 12.5, 14.0],
    defaultTarget: [0, 0.6, 0],
    fov: 36, // Cozy diorama framing
    near: 0.1,
    far: 140,
    transitionSpeed: 3.2,
  },

  // Floating Island Diorama Base
  island: {
    radius: 10.0,
    height: 1.8,
    bevelSize: 0.5,
  },
};

/**
 * Mastered Realm Sub-Island Architecture & Coordinates
 * 
 * Centralized layout parameters for the three floating mastery expansions,
 * defining their separate island geometry, positions, materials, and
 * bridge anchor points.
 */
export const SUB_ISLAND_CONFIG = {
  mind: {
    id: 'mind_library',
    name: 'Celestial Library Wing',
    landmarkTitle: 'CELESTIAL LIBRARY',
    landmarkSubtitle: 'MASTERED EXPANSION',
    icon: '📖',
    realm: REALMS.MIND,
    position: [-14.5, 0.5, -10.2],
    destinationPos: [-13.8, 0.5, -9.6],
    cameraTarget: [-13.8, 0.8, -9.6],
    cameraPosition: [-9.2, 5.8, -5.2],
    settledAngle: Math.PI * 0.25,
    rotation: [0, Math.PI * 0.35, 0],
    scale: [1, 1, 1],
    islandRadius: 3.4,
    islandHeight: 1.6,
    terrainColor: '#1e1b4b', // Arcane indigo rock
    grassColor: '#312e81',   // Celestial purple/indigo turf
    cliffColor: '#0f172a',
    accentColor: '#818cf8',
    glowColor: '#c084fc',
    bridgeStart: [-7.8, 0.05, -5.6],
    bridgeEnd: [-12.0, 0.45, -8.6],
  },
  body: {
    id: 'body_coliseum',
    name: 'Gladiatorial Coliseum Expansion',
    landmarkTitle: 'GLADIATORIAL COLISEUM',
    landmarkSubtitle: 'MASTERED EXPANSION',
    icon: '⚔️',
    realm: REALMS.BODY,
    position: [-14.2, -0.3, 10.4],
    destinationPos: [-13.4, -0.3, 9.8],
    cameraTarget: [-13.4, 0.0, 9.8],
    cameraPosition: [-8.6, 5.6, 5.0],
    settledAngle: -Math.PI * 0.25,
    rotation: [0, -Math.PI * 0.25, 0],
    scale: [1, 1, 1],
    islandRadius: 3.5,
    islandHeight: 1.8,
    terrainColor: '#292524', // Fortified basalt rock
    grassColor: '#15803d',   // Arena battle turf
    cliffColor: '#1c1917',
    accentColor: '#34d399',
    glowColor: '#10b981',
    bridgeStart: [-7.6, 0.05, 5.7],
    bridgeEnd: [-11.8, -0.25, 8.8],
  },
  craft: {
    id: 'craft_foundry',
    name: 'Foundry Expansion',
    landmarkTitle: 'ENGINEERING FOUNDRY',
    landmarkSubtitle: 'MASTERED EXPANSION',
    icon: '⚙️',
    realm: REALMS.CRAFT,
    position: [14.6, 0.35, 0.8],
    destinationPos: [13.8, 0.35, 0.8],
    cameraTarget: [13.8, 0.8, 0.8],
    cameraPosition: [8.4, 5.8, 4.2],
    settledAngle: -Math.PI * 0.5,
    rotation: [0, -Math.PI * 0.5, 0],
    scale: [1, 1, 1],
    islandRadius: 3.4,
    islandHeight: 1.7,
    terrainColor: '#3b2219', // Iron quarry rock
    grassColor: '#78350f',   // Warm copper cobblestone / timber
    cliffColor: '#261710',
    accentColor: '#f59e0b',
    glowColor: '#fbbf24',
    bridgeStart: [7.8, 0.05, 0.5],
    bridgeEnd: [12.2, 0.35, 0.7],
  },
};

/**
 * Visual Realm Evolution Configuration
 * 
 * Defines the three visual stages (Level 1: Foundation, Level 2: Developed, Level 3: Mastery)
 * for each realm, including specific architectural extensions, prop configurations,
 * environmental density, and adapted camera viewpoints.
 */
export const REALM_LEVEL_CONFIG = {
  mind: {
    1: {
      level: 1,
      title: 'Mind Realm',
      stage: 'Foundation • Scholar Alcove',
      description: 'Beginning of knowledge. A lone scholar tower amidst quiet pines.',
      cameraTarget: [-5.4, 0.8, -3.8],
      cameraPosition: [-2.0, 5.6, -0.6],
      crystalCount: 3,
      particleCount: 20,
    },
    2: {
      level: 2,
      title: 'Mind Realm',
      stage: 'Developed • Arcane Academy',
      description: 'Expanded knowledge district with secondary archive tower and arched courtyard.',
      cameraTarget: [-5.2, 1.0, -3.6],
      cameraPosition: [-1.4, 6.2, -0.2],
      crystalCount: 5,
      particleCount: 35,
    },
    3: {
      level: 3,
      title: 'Mind Realm',
      stage: 'Mastery • Knowledge Citadel',
      description: 'Grand citadel of wisdom with majestic spires, reflective fountain, and sacred ramparts.',
      cameraTarget: [-5.0, 1.2, -3.4],
      cameraPosition: [-1.0, 6.8, 0.2],
      crystalCount: 7,
      particleCount: 55,
    },
  },

  body: {
    1: {
      level: 1,
      title: 'Body Realm',
      stage: 'Foundation • Training Yard',
      description: 'Open-air training pavilion with single archery target and stone lifting slabs.',
      cameraTarget: [-5.2, 0.8, 3.8],
      cameraPosition: [-1.4, 5.4, 0.6],
      targetCount: 1,
      particleCount: 15,
    },
    2: {
      level: 2,
      title: 'Body Realm',
      stage: 'Developed • Combat Dojo',
      description: 'Elevated sparring platform, obstacle course ladder, and fenced training yard.',
      cameraTarget: [-5.0, 1.0, 3.6],
      cameraPosition: [-1.0, 6.0, 0.4],
      targetCount: 2,
      particleCount: 30,
    },
    3: {
      level: 3,
      title: 'Body Realm',
      stage: 'Mastery • Grand Coliseum',
      description: 'Arena of Champions with victory pavilion tent, stone pillars of discipline, and war banners.',
      cameraTarget: [-4.8, 1.2, 3.4],
      cameraPosition: [-0.8, 6.6, 0.2],
      targetCount: 3,
      particleCount: 50,
    },
  },

  craft: {
    1: {
      level: 1,
      title: 'Craft Realm',
      stage: 'Foundation • River Workshop',
      description: 'Rustic watermill driving basic timber and carpentry tools beside the canal.',
      cameraTarget: [5.5, 0.9, 0.4],
      cameraPosition: [1.6, 5.5, 3.4],
      smokeIntensity: 0.2,
      particleCount: 20,
    },
    2: {
      level: 2,
      title: 'Craft Realm',
      stage: 'Developed • Artisan Forge',
      description: 'Power-generating windmill, material transport carts, and timber lumber stacks.',
      cameraTarget: [5.8, 1.1, 0.8],
      cameraPosition: [1.4, 6.2, 3.6],
      smokeIntensity: 0.6,
      particleCount: 35,
    },
    3: {
      level: 3,
      title: 'Craft Realm',
      stage: 'Mastery • Engineering Foundry',
      description: 'Blazing smelting chimney, masterwork vault, and brass industrial illumination.',
      cameraTarget: [6.0, 1.3, 0.6],
      cameraPosition: [1.2, 6.8, 3.8],
      smokeIntensity: 1.2,
      particleCount: 55,
    },
  },
};

export default WORLD_CONFIG;

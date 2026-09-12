/**
 * LIFECRAFT 3D World Asset Manifest
 * 
 * Provides semantic, single-source paths to all production 3D models and textures
 * loaded by React Three Fiber / Three.js in the isometric diorama.
 * 
 * All paths resolve from the Vite public directory (`frontend/public/`).
 */

export const PLAYER = '/assets/world/characters/character-archer.glb';

export const MIND = {
  // Level 1: Foundation
  tower: '/assets/world/buildings/tower-square-top-roof-high.glb',
  // Level 2: Developed
  archiveTower: '/assets/world/buildings/tower-square.glb',
  archColonnade: '/assets/world/buildings/wall-doorway.glb',
  obelisk: '/assets/world/props/statue_obelisk.glb',
  // Level 3: Mastery
  citadelSpire: '/assets/world/buildings/tower-hexagon-roof.glb',
  rampart: '/assets/world/buildings/wall-half.glb',
  fountain: '/assets/world/props/fountain-round.glb',
};

export const BODY = {
  // Level 1: Foundation
  target: '/assets/world/buildings/target.glb',
  structure: '/assets/world/buildings/building-structure.glb',
  // Level 2: Developed
  platform: '/assets/world/buildings/platform.glb',
  ladder: '/assets/world/props/ladder.glb',
  fence: '/assets/world/props/fence.glb',
  // Level 3: Mastery
  tent: '/assets/world/buildings/tent.glb',
  flag: '/assets/world/props/flag.glb',
  pillar: '/assets/world/props/statue_column.glb',
};

export const CRAFT = {
  // Level 1: Foundation
  watermill: '/assets/world/buildings/watermill.glb',
  // Level 2: Developed
  windmill: '/assets/world/buildings/windmill.glb',
  cart: '/assets/world/props/cart.glb',
  lumber: '/assets/world/props/log_stack.glb',
  // Level 3: Mastery
  chimney: '/assets/world/buildings/chimney.glb',
  chest: '/assets/world/props/chest.glb',
  lantern: '/assets/world/props/lantern.glb',
};

export const TREES = {
  default: '/assets/world/environment/tree_default.glb',
  pine: '/assets/world/environment/tree_pineDefaultA.glb',
  oak: '/assets/world/environment/tree_oak.glb',
};

export const ROCKS = {
  large: '/assets/world/environment/rock_largeA.glb',
  stone: '/assets/world/environment/stone_largeA.glb',
};

export const NATURE = {
  bush: '/assets/world/nature/plant_bush.glb',
  flower: '/assets/world/nature/flower_purpleA.glb',
  grass: '/assets/world/nature/grass.glb',
};

export const GROUND = {
  grass: '/assets/world/environment/ground_grass.glb',
  pathStraight: '/assets/world/environment/ground_pathStraight.glb',
  pathBend: '/assets/world/environment/ground_pathBend.glb',
};

export const BRIDGE = '/assets/world/environment/bridge_wood.glb';

export const CAMPFIRE = {
  stones: '/assets/world/props/campfire_stones.glb',
  logs: '/assets/world/props/campfire_logs.glb',
};

export const SKYBOX = '/assets/world/skybox/skybox-day.png';

export const SKINS = {
  default: '/assets/world/characters/character-archer.glb',
  'character-archer': '/assets/world/characters/character-archer.glb',
  'character-oobi': '/assets/world/characters/character-oobi.glb',
  'character-oodi': '/assets/world/characters/character-oodi.glb',
  'character-ooli': '/assets/world/characters/character-ooli.glb',
};

export const PETS = {
  'animal-fox': '/assets/world/pets/animal-fox.glb',
  'animal-lion': '/assets/world/pets/animal-lion.glb',
  'animal-panda': '/assets/world/pets/animal-panda.glb',
  'animal-cat': '/assets/world/pets/animal-cat.glb',
};

export const DECOR = {
  'fountain-round-detail': '/assets/world/props/fountain-round-detail.glb',
  'banner-red': '/assets/world/props/banner-red.glb',
  'banner-green': '/assets/world/props/banner-green.glb',
  'stall-red': '/assets/world/props/stall-red.glb',
  'stall-green': '/assets/world/props/stall-green.glb',
};

export const EXPANSIONS = {
  mind_library: '/assets/world/buildings/tower-square.glb',
  body_coliseum: '/assets/world/buildings/platform.glb',
  craft_foundry: '/assets/world/buildings/chimney.glb',
};

/**
 * Clean semantic interface for direct component usage:
 * e.g., `assets.player`, `assets.mind`, `assets.craft`, `assets.campfire`
 */
export const assets = {
  player: PLAYER,
  skins: SKINS,
  pets: PETS,
  decor: DECOR,
  expansions: EXPANSIONS,
  mind: MIND,
  body: BODY,
  craft: CRAFT,
  trees: TREES,
  rocks: ROCKS,
  nature: NATURE,
  ground: GROUND,
  bridge: BRIDGE,
  campfire: CAMPFIRE,
  skybox: SKYBOX,
};

export default assets;


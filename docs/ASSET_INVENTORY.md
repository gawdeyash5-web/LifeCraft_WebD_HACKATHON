# LIFECRAFT Asset Inventory

> **Project Role**: Member 1 (Frontend, Visual & 3D Environment)  
> **Target Aesthetic**: Stylized Low-Poly Isometric Fantasy Diorama  
> **Engine Target**: React Three Fiber / Three.js (Web)  
> **Source Directory**: `assets_lib/` (Git-ignored)

---

## 1. Asset Library Overview

The root `assets_lib/` directory contains 12 Kenney asset packs comprising **10,217 total files** across 3D models, textures, vector graphics, fonts, and audio clips. Below is the systematic evaluation of each pack for LIFECRAFT.

| Pack Name | File Count | Formats Found | Primary Category | Usefulness & Evaluation for LIFECRAFT |
|:---|:---:|:---|:---:|:---|
| **kenney_3d-road-tiles** | 915 | 302 GLTF, 302 OBJ, 302 MTL, 2 PNG | 3D Environment | **Excluded**: Modern asphalt highway and street tiles. Mismatches the medieval/fantasy diorama art direction. |
| **kenney_castle-kit** | 397 | 76 GLB, 76 FBX, 76 OBJ, 76 MTL, 88 PNG | 3D Structures | **High (P0/P1)**: Provides stone towers, arched battlements, drawbridges, and flags. Core source for the **Mind Realm** (Knowledge/Library castle tower). |
| **kenney_cube-pets_1.0** | 129 | 24 GLB, 24 FBX, 24 OBJ, 24 MTL, 28 PNG | 3D Characters | **Medium (P1)**: 24 animated companion animals (`idle`, `walk`, `run`, `dance`). Excellent for an optional pet companion feature. |
| **kenney_fantasy-town-kit_2.0** | 847 | 167 GLB, 167 FBX, 167 OBJ, 167 MTL, 174 PNG | 3D Structures & Props | **Critical (P0/P1)**: High-quality medieval timber/stone structures. Primary source for **Craft Realm** (`watermill.glb`), lanterns, carts, and market stalls. |
| **kenney_food-kit** | 1,009 | 200 GLB, 200 FBX, 200 OBJ, 200 MTL, 204 PNG | 3D Props | **Low / Excluded**: Over 200 modern and prepared food items. Unnecessary for core diorama terrain; optional for shop/inventory consumables. |
| **kenney_mini-forest_1.0** | 120 | 22 GLB, 22 FBX, 22 OBJ, 22 MTL, 27 PNG | 3D Characters & Camp | **Critical (P0)**: Contains the primary **Player Character** (`character-archer.glb` with 32 animations), **Body Realm** training target (`target.glb`), and camp tent. |
| **kenney_nature-kit** | 3,618 | 329 GLB, 329 FBX, 329 OBJ, 329 MTL, 329 DAE, 329 STL, 1,640 PNG | 3D Environment & Foliage | **Critical (P0)**: Foundation of the diorama. Completely self-contained GLBs (embedded vertex colors/materials, 0 external textures). Provides trees, rocks, bushes, paths, bridges, and campfire base. |
| **kenney_platformer-kit** | 777 | 153 GLB, 153 FBX, 153 OBJ, 153 MTL, 160 PNG | 3D Props & Characters | **High (P0/P1)**: High-value gamification props including `chest.glb` (quest rewards), gold coins, jewels, and backup animated blocky characters. |
| **kenney_retro-fantasy-kit** | 562 | 105 GLB, 105 FBX, 105 OBJ, 105 MTL, 137 PNG | 3D Modular Pieces | **Low / Optional (P1)**: Uses pixelated retro diffuse textures rather than clean flat-shaded stylized palettes. Limited to secondary props (barrels, crates). |
| **kenney_skyboxes** | 12 | 8 PNG (4096x2048 equirectangular) | 2D Environment | **High (P0)**: Stylized gradient sky panoramas (`skybox-day.png`, `skybox-morning.png`, `skybox-night.png`). Instant lighting and diorama backdrop. |
| **kenney_ui-pack** | 1,315 | 870 PNG, 434 SVG, 2 TTF, 6 OGG | 2D UI & Audio | **High (HUD/Audio)**: Complete vector interface elements, 2 TTF game fonts (`Kenney Future`), and 6 tactile UI audio cues (clicks, switches). |
| **kenney_ui-pack-pixel-adventure** | 519 | 514 PNG | 2D UI | **Excluded**: 16-bit pixel art interface elements. Clashes with modern vector glassmorphic HUD design. |

---

## 2. Recommended P0 Assets

These assets form the complete, cohesive, minimum viable diorama for the 8-hour hackathon. Every asset has been selected to match the low-poly diorama aesthetic with zero style clashing.

| Priority | LIFECRAFT Role | Asset Name | Source Pack | Exact File Path | Format | File Size | Animation | Texture Dependencies | Why Recommended |
|:---:|:---|:---|:---|:---|:---:|:---:|:---|:---|:---|
| **P0** | Player Character | `character-archer.glb` | `kenney_mini-forest_1.0` | `assets_lib/kenney_mini-forest_1.0/Models/GLB format/character-archer.glb` | GLB | 233.5 KB | **32 embedded animations** (`idle`, `walk`, `sprint`, `jump`, `fall`, `emote-yes`, `emote-no`, `attack-melee-right`, `crouch`, `sit`, etc.) | `Textures/colormap.png` (10.4 KB) | Best fantasy adventurer character with full locomotion and celebration emote set. Perfect scale and low-poly diorama fit. |
| **P0** | Mind Realm Landmark | `tower-square-top-roof-high.glb` | `kenney_castle-kit` | `assets_lib/kenney_castle-kit/Models/GLB format/tower-square-top-roof-high.glb` | GLB | 11.0 KB | None (Static) | `Textures/colormap.png` (7.4 KB) | Tall castle turret with arched stone windows and high pitched roof. Evokes ancient library / wizard academy aesthetic. |
| **P0** | Body Realm Landmark | `target.glb` | `kenney_mini-forest_1.0` | `assets_lib/kenney_mini-forest_1.0/Models/GLB format/target.glb` | GLB | 17.3 KB | None (Static) | `Textures/colormap.png` (10.4 KB) | Archery / training target dummy on timber post. Instantly identifies the physical training / workout yard. |
| **P0** | Body Realm Structure | `building-structure.glb` | `kenney_mini-forest_1.0` | `assets_lib/kenney_mini-forest_1.0/Models/GLB format/building-structure.glb` | GLB | 16.0 KB | None (Static) | `Textures/colormap.png` (10.4 KB) | Open timber training pavilion/calisthenics frame placed behind the target. |
| **P0** | Craft Realm Landmark | `watermill.glb` | `kenney_fantasy-town-kit_2.0` | `assets_lib/kenney_fantasy-town-kit_2.0/Models/GLB format/watermill.glb` | GLB | 52.6 KB | Mesh node `watermill` (water wheel can rotate via script) | `Textures/colormap.png` (10.9 KB) | Iconic artisan workshop structure with stone masonry, timber walls, and an external water wheel representing production and craft. |
| **P0** | Tree (Deciduous) | `tree_default.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/tree_default.glb` | GLB | 9.2 KB | None (Static) | **None** (Self-contained vertex colors) | Clean, rounded low-poly foliage. Lightweight and zero texture overhead. |
| **P0** | Tree (Evergreen Pine) | `tree_pineDefaultA.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/tree_pineDefaultA.glb` | GLB | 16.8 KB | None (Static) | **None** (Self-contained vertex colors) | Conical pine tree for elevation gradients and perimeter wilderness. |
| **P0** | Tree (Canopy Oak) | `tree_oak.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/tree_oak.glb` | GLB | 14.3 KB | None (Static) | **None** (Self-contained vertex colors) | Broad leafy oak for shade near the campfire center. |
| **P0** | Rock (Large Boulder) | `rock_largeA.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/rock_largeA.glb` | GLB | 7.4 KB | None (Static) | **None** (Self-contained vertex colors) | Natural boundary marker for realm edges. |
| **P0** | Rock (Stone Slab) | `stone_largeA.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/stone_largeA.glb` | GLB | 7.0 KB | None (Static) | **None** (Self-contained vertex colors) | Flatter natural rock for riverbanks and paths. |
| **P0** | Bush / Vegetation | `plant_bush.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/plant_bush.glb` | GLB | 4.3 KB | None (Static) | **None** (Self-contained vertex colors) | Low-poly bush cluster to soften building perimeters. |
| **P0** | Flowers (Accent) | `flower_purpleA.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/flower_purpleA.glb` | GLB | 6.9 KB | None (Static) | **None** (Self-contained vertex colors) | Vivid purple blossoms for Mind Realm magical accent. |
| **P0** | Grass Tufts | `grass.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/grass.glb` | GLB | 11.2 KB | None (Static) | **None** (Self-contained vertex colors) | Micro-foliage to break up flat ground planes. |
| **P0** | Campfire Base | `campfire_stones.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/campfire_stones.glb` | GLB | 16.9 KB | None (Static) | **None** (Self-contained vertex colors) | Stone circle hearth for the center streak campfire. |
| **P0** | Campfire Fuel | `campfire_logs.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/campfire_logs.glb` | GLB | 9.1 KB | None (Static) | **None** (Self-contained vertex colors) | Crossed timber logs nesting inside the stone hearth. *(Flame/glow rendered procedurally)*. |
| **P0** | Bridge | `bridge_wood.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/bridge_wood.glb` | GLB | 15.3 KB | None (Static) | **None** (Self-contained vertex colors) | Arched timber bridge connecting the central island to the Craft or Mind realms. |
| **P0** | Ground Terrain Tile | `ground_grass.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/ground_grass.glb` | GLB | 1.5 KB | None (Static) | **None** (Self-contained vertex colors) | Modular isometric base tile. Extremely lightweight grid building block. |
| **P0** | Path (Straight) | `ground_pathStraight.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/ground_pathStraight.glb` | GLB | 5.5 KB | None (Static) | **None** (Self-contained vertex colors) | Dirt path segment leading from central campfire to realm portals. |
| **P0** | Path (Bend) | `ground_pathBend.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/ground_pathBend.glb` | GLB | 4.0 KB | None (Static) | **None** (Self-contained vertex colors) | Curved dirt path connector. |
| **P0** | Decorative Prop (Light) | `lantern.glb` | `kenney_fantasy-town-kit_2.0` | `assets_lib/kenney_fantasy-town-kit_2.0/Models/GLB format/lantern.glb` | GLB | 14.6 KB | None (Static) | `Textures/colormap.png` (10.9 KB) | Wrought-iron lamp post for evening atmosphere and path lighting. |
| **P0** | Decorative Prop (Reward) | `chest.glb` | `kenney_platformer-kit` | `assets_lib/kenney_platformer-kit/Models/GLB format/chest.glb` | GLB | 27.4 KB | Separate lid sub-mesh | `Textures/colormap.png` (10.9 KB) | Treasure chest for quest completions and gold milestones. |
| **P0** | Decorative Prop (Fence) | `fence_simple.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/fence_simple.glb` | GLB | 5.6 KB | None (Static) | **None** (Self-contained vertex colors) | Rustic wood fencing for the Body Realm perimeter. |
| **P0** | Decorative Prop (Craft) | `cart.glb` | `kenney_fantasy-town-kit_2.0` | `assets_lib/kenney_fantasy-town-kit_2.0/Models/GLB format/cart.glb` | GLB | 51.7 KB | None (Static) | `Textures/colormap.png` (10.9 KB) | Wooden hand cart parked beside the workshop. |
| **P0** | Decorative Prop (Fuel) | `log_stack.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/log_stack.glb` | GLB | 10.6 KB | None (Static) | **None** (Self-contained vertex colors) | Firewood pile beside the campfire and workshop. |
| **P0** | Decorative Prop (Relic) | `statue_obelisk.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/statue_obelisk.glb` | GLB | 4.3 KB | None (Static) | **None** (Self-contained vertex colors) | Ancient stone monument in the Mind Realm courtyard. |
| **P0** | Environment Backdrop | `skybox-day.png` | `kenney_skyboxes` | `assets_lib/kenney_skyboxes/Skyboxes/skybox-day.png` | PNG (2:1 Equirectangular) | 1,027.0 KB | Static | None | Crisp, stylized fantasy sky with gentle clouds. Supplies ambient IBL lighting and diorama depth. |

---

## 3. Recommended P1 Assets

P1 assets enrich the diorama if time permits during later hackathon sprints or stretch goals.

| Priority | LIFECRAFT Role | Asset Name | Source Pack | Exact File Path | Format | File Size | Animation | Texture Dependencies | Why Recommended |
|:---:|:---|:---|:---|:---|:---:|:---:|:---|:---|:---|
| **P1** | Companion Pet | `animal-dog.glb` | `kenney_cube-pets_1.0` | `assets_lib/kenney_cube-pets_1.0/Models/GLB format/animal-dog.glb` | GLB | 116.7 KB | **8 embedded animations** (`idle`, `walk`, `run`, `dance`, `eat`, `gesture-positive`, etc.) | `Textures/colormap.png` (10.7 KB) | Loyal pet that accompanies the player around the campfire. |
| **P1** | Companion Pet (Alt) | `animal-cat.glb` | `kenney_cube-pets_1.0` | `assets_lib/kenney_cube-pets_1.0/Models/GLB format/animal-cat.glb` | GLB | 161.3 KB | **8 embedded animations** (`idle`, `walk`, `run`, `dance`, `eat`, etc.) | `Textures/colormap.png` (10.7 KB) | Alternate companion pet. |
| **P1** | Alternate Character | `character-oobi.glb` | `kenney_platformer-kit` | `assets_lib/kenney_platformer-kit/Models/GLB format/character-oobi.glb` | GLB | 230.9 KB | **25 embedded animations** (`idle`, `walk`, `sprint`, `jump`, `emote-yes`, `die`, etc.) | `Textures/colormap.png` (10.9 KB) | Cute stylized horned mascot character for avatar customization. |
| **P1** | Mind Realm Building 2 | `tower-square.glb` | `kenney_castle-kit` | `assets_lib/kenney_castle-kit/Models/GLB format/tower-square.glb` | GLB | 16.2 KB | None (Static) | `Textures/colormap.png` (7.4 KB) | Secondary study archive building for Mind Realm expansion. |
| **P1** | Craft Realm Structure 2 | `windmill.glb` | `kenney_fantasy-town-kit_2.0` | `assets_lib/kenney_fantasy-town-kit_2.0/Models/GLB format/windmill.glb` | GLB | 69.5 KB | Mesh node `windmill` (can rotate sails via code) | `Textures/colormap.png` (10.9 KB) | Towering windmill for elevated visual interest in the Craft sector. |
| **P1** | Body Realm Camp | `tent.glb` | `kenney_mini-forest_1.0` | `assets_lib/kenney_mini-forest_1.0/Models/GLB format/tent.glb` | GLB | 76.1 KB | None (Static) | `Textures/colormap.png` (10.4 KB) | Military training tent / basecamp for athletes. |
| **P1** | Mind Realm Plaza | `fountain-round.glb` | `kenney_fantasy-town-kit_2.0` | `assets_lib/kenney_fantasy-town-kit_2.0/Models/GLB format/fountain-round.glb` | GLB | 82.9 KB | None (Static) | `Textures/colormap.png` (10.9 KB) | Stone scholar fountain for contemplative study zone. |
| **P1** | Economy / Market | `stall.glb` | `kenney_fantasy-town-kit_2.0` | `assets_lib/kenney_fantasy-town-kit_2.0/Models/GLB format/stall.glb` | GLB | 11.2 KB | None (Static) | `Textures/colormap.png` (10.9 KB) | Quest / reward merchant stall. |
| **P1** | Obstacle Course | `ladder.glb` | `kenney_mini-forest_1.0` | `assets_lib/kenney_mini-forest_1.0/Models/GLB format/ladder.glb` | GLB | 21.7 KB | None (Static) | `Textures/colormap.png` (10.4 KB) | Calisthenics climbing ladder for Body Realm. |
| **P1** | Economy Collectible | `coin-gold.glb` | `kenney_platformer-kit` | `assets_lib/kenney_platformer-kit/Models/GLB format/coin-gold.glb` | GLB | 10.4 KB | None (Static) | `Textures/colormap.png` (10.9 KB) | 3D spinning gold coin for quest reward popups. |
| **P1** | Economy Collectible | `jewel.glb` | `kenney_platformer-kit` | `assets_lib/kenney_platformer-kit/Models/GLB format/jewel.glb` | GLB | 3.5 KB | None (Static) | `Textures/colormap.png` (10.9 KB) | 3D diamond/gemstone for streak level ups. |
| **P1** | Economy Collectible | `star.glb` | `kenney_platformer-kit` | `assets_lib/kenney_platformer-kit/Models/GLB format/star.glb` | GLB | 6.1 KB | None (Static) | `Textures/colormap.png` (10.9 KB) | 3D star for level progression. |
| **P1** | Ancient Relic | `statue_column.glb` | `kenney_nature-kit` | `assets_lib/kenney_nature-kit/Models/GLTF format/statue_column.glb` | GLB | 10.2 KB | None (Static) | **None** (Self-contained vertex colors) | Classical broken pillar for ruins accent. |
| **P1** | Workshop Prop | `barrels.glb` | `kenney_retro-fantasy-kit` | `assets_lib/kenney_retro-fantasy-kit/Models/GLB format/barrels.glb` | GLB | 61.7 KB | None (Static) | `Textures/barrel.png` | Stacked wooden storage barrels. |
| **P1** | Evening Skybox | `skybox-morning.png` | `kenney_skyboxes` | `assets_lib/kenney_skyboxes/Skyboxes/skybox-morning.png` | PNG | 878.6 KB | Static | None | Warm orange/golden hour skybox for streak evening states. |
| **P1** | Night Skybox | `skybox-night.png` | `kenney_skyboxes` | `assets_lib/kenney_skyboxes/Skyboxes/skybox-night.png` | PNG | 1,073.6 KB | Static | None | Deep midnight blue skybox for night-time habit review. |

---

## 4. UI Assets

The UI and 2D multimedia assets are cataloged separately from the 3D diorama models.

### 4.1 Fonts (Typography)
Located in `assets_lib/kenney_ui-pack/Font/`:
- `Kenney Future.ttf` (34.2 KB): Futuristic yet playful geometric game font; ideal for HUD headers, quest titles, and level badges.
- `Kenney Future Narrow.ttf` (34.2 KB): Compact condensed variant; optimal for stat numbers, gold counters, and inventory tooltips.

### 4.2 Vector Graphics (SVG)
Located in `assets_lib/kenney_ui-pack/Vector/` (434 files categorized by theme):
- `Vector/Blue/` & `Vector/Green/`: Stylized buttons, progress bars, sliders, and modal frames.
- `Vector/Yellow/`: Warning badges, gold coin icons, and achievement stars.
- `Vector/Red/`: Health hearts, streak reset alerts, and delete actions.
- `Vector/Grey/`: Neutral backdrops, disabled buttons, and close/cancel icons.

### 4.3 2D Raster Graphics (PNG)
Located in `assets_lib/kenney_ui-pack/PNG/` (870 files categorized by color and resolution):
- Available in standard (`Default/`) and retina/high-DPI (`Double/`) scales.
- Icons include checkmarks, crosses, arrows, music notes, locks, stars, hearts, and chat bubbles.
- Sliceable 9-patch frames for glassmorphic quest cards and dialog windows.

### 4.4 Audio Cues (SFX)
Located in `assets_lib/kenney_ui-pack/Sounds/` (6 tactile OGG sound effects):
- `click-a.ogg` (10.9 KB): High-frequency UI button click; ideal for realm selection and menu taps.
- `click-b.ogg` (6.2 KB): Deeper confirmation click; ideal for modal submission.
- `switch-a.ogg` (9.4 KB): Toggle activation sound; ideal for quest completion checkboxes.
- `switch-b.ogg` (10.1 KB): Toggle deactivation sound.
- `tap-a.ogg` (7.0 KB): Subtle hover/tab change chime.
- `tap-b.ogg` (6.1 KB): Quick item selection blip.

---

## 5. Excluded Assets

The following asset packs and subcategories are intentionally excluded from the production diorama:

1. **`kenney_3d-road-tiles`**:
   - *Reason*: Modern 2-lane asphalt highway tiles, road markings, and intersections directly contradict the medieval fantasy aesthetic.
2. **`kenney_food-kit`**:
   - *Reason*: Features modern food (burgers, hot dogs, pizza, takeout cartons, soda cans). Irrelevant to world-building; bloated footprint (>1,000 files).
3. **`kenney_ui-pack-pixel-adventure`**:
   - *Reason*: 16-bit chunky pixel art sprites. Clashes with the clean vector SVG design of `kenney_ui-pack` and the vector-style low-poly 3D world.
4. **`kenney_retro-fantasy-kit` (Main Architecture)**:
   - *Reason*: Utilizes low-res retro pixelated textures (e.g., `cobblestone.png`, `planks.png`) that produce noisy shimmering under isometric web filtering compared to the smooth vertex-shaded geometry of Nature Kit and Town Kit.
5. **Redundant Formats (OBJ / MTL / FBX / DAE / STL)**:
   - *Reason*: Kenney packs provide multiple parallel formats. Only `.glb` is retained for web production; loading `.obj` + `.mtl` introduces extra HTTP overhead and lacks embedded animation support.

---

## 6. Recommended Production Asset Set

For the 8-hour hackathon, copying or loading hundreds of files causes build bloat and asset management fatigue. The entire diorama can be constructed from this curated set of **24 models + 1 texture + 1 skybox**:

```
production_assets/
├── models/
│   ├── player/
│   │   └── character-archer.glb            (233.5 KB, 32 animations)
│   ├── landmarks/
│   │   ├── tower-square-top-roof-high.glb  (11.0 KB, Mind Realm)
│   │   ├── target.glb                      (17.3 KB, Body Realm)
│   │   ├── building-structure.glb          (16.0 KB, Body Realm)
│   │   └── watermill.glb                   (52.6 KB, Craft Realm)
│   ├── nature/
│   │   ├── tree_default.glb                (9.2 KB)
│   │   ├── tree_pineDefaultA.glb           (16.8 KB)
│   │   ├── tree_oak.glb                    (14.3 KB)
│   │   ├── rock_largeA.glb                 (7.4 KB)
│   │   ├── stone_largeA.glb                (7.0 KB)
│   │   ├── plant_bush.glb                  (4.3 KB)
│   │   ├── flower_purpleA.glb              (6.9 KB)
│   │   └── grass.glb                       (11.2 KB)
│   ├── campfire/
│   │   ├── campfire_stones.glb             (16.9 KB)
│   │   └── campfire_logs.glb               (9.1 KB)
│   ├── terrain/
│   │   ├── ground_grass.glb                (1.5 KB)
│   │   ├── ground_pathStraight.glb         (5.5 KB)
│   │   ├── ground_pathBend.glb             (4.0 KB)
│   │   └── bridge_wood.glb                 (15.3 KB)
│   └── props/
│       ├── lantern.glb                     (14.6 KB)
│       ├── chest.glb                       (27.4 KB)
│       ├── fence_simple.glb                (5.6 KB)
│       ├── cart.glb                        (51.7 KB)
│       ├── log_stack.glb                   (10.6 KB)
│       └── statue_obelisk.glb              (4.3 KB)
├── textures/
│   └── colormap.png                        (11.1 KB palette atlas)
└── skybox/
    └── skybox-day.png                      (1,027.0 KB equirectangular)
```

- **3D Models Total Size**: ~598 KB  
- **Texture Atlas Total Size**: ~11 KB  
- **Skybox Total Size**: ~1.02 MB  
- **Combined Production Footprint**: **~1.63 MB** (Loads in <100ms on standard broadband)

---

## 7. Asset Dependency Notes

### 7.1 Relative Texture Mapping in Kenney GLBs
- Models from `kenney_mini-forest_1.0`, `kenney_castle-kit`, `kenney_fantasy-town-kit_2.0`, and `kenney_platformer-kit` contain an internal glTF image declaration:
  ```json
  "images": [{ "uri": "Textures/colormap.png" }]
  ```
- **Crucial Rule**: When Three.js / R3F `useGLTF` loads these files, it resolves `Textures/colormap.png` relative to the GLB file's directory. If the GLB is located at `/models/character-archer.glb`, the loader requests `/models/Textures/colormap.png`.
- **Shared Palette**: The `colormap.png` files across `fantasy-town-kit`, `platformer-kit`, `castle-kit`, and `mini-forest` are all 256-color palette gradient strips. They can share a single `colormap.png` in the production `/textures/` or `/models/Textures/` path.

### 7.2 Completely Self-Contained GLBs (Zero Texture Dependency)
- Models from `kenney_nature-kit` (`tree_default.glb`, `campfire_stones.glb`, `rock_largeA.glb`, `ground_grass.glb`, etc.) use PBR base color material factors directly:
  ```json
  "pbrMetallicRoughness": {
    "baseColorFactor": [0.886, 0.513, 0.341, 1.0],
    "metallicFactor": 1,
    "roughnessFactor": 1
  }
  ```
- These files require **no external images**. They can be moved or renamed without risking broken material links.

### 7.3 Procedural Companion Enhancements
Three visual features should be rendered procedurally with Three.js rather than downloading heavy external assets:
1. **Campfire Flames**: An animated particle system (small rising orange/yellow quads) + pulsating Three.js `<pointLight color="#ff7700" intensity={2} distance={5} />` placed inside `campfire_logs.glb`.
2. **Water Surface**: A semi-transparent plane `<mesh><planeGeometry args={[10, 10]} /><meshStandardMaterial color="#38bdf8" roughness={0.1} transmission={0.6} /></mesh>` under `bridge_wood.glb` and beside `watermill.glb`.
3. **Realm Selection Ring**: A glowing circular waypoint ring (`<ringGeometry />` with pulsing emissive shader) under each realm structure to highlight user focus.

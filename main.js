import * as THREE from "three";

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    stencil: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.autoClear = true;
renderer.setClearColor(0x000000, 1);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const world = {
    name: "main",
    scene: new THREE.Scene(),
    portals: [],
};
let currentWorld = world;

function addLighting(scene) {
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(6, 10, 4);
    scene.add(dir);
}

function addAxes(scene, originX, originY, originZ, len = 2.4) {
    const origin = new THREE.Vector3(originX, originY, originZ);
    const mk = (color, end) =>
        new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([origin, end]),
            new THREE.LineBasicMaterial({ color })
        );
    scene.add(
        mk(0xff0000, new THREE.Vector3(originX + len, originY, originZ)),
        mk(0x00ff00, new THREE.Vector3(originX, originY + len, originZ)),
        mk(0x0000ff, new THREE.Vector3(originX, originY, originZ + len))
    );
}

function buildTwoAdjacentRooms(scene) {
    const roomDepth = 18;
    const roomHeight = 10;
    const totalWidth = 36;
    const halfDepth = roomDepth / 2;
    const halfWidth = totalWidth / 2;
    const wallThickness = 0.2;

    const doorWidth = 3.2;
    const doorHeight = 4.2;

    const floorTexture = new THREE.TextureLoader().load("/Floor_texture.png");
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(6, 3);
    floorTexture.colorSpace = THREE.SRGBColorSpace;

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(totalWidth, roomDepth),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: floorTexture,
            roughness: 0.9,
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.001;
    scene.add(floor);

    const ceilingTexture = new THREE.TextureLoader().load("/Cieling_texture.png");
    ceilingTexture.wrapS = THREE.RepeatWrapping;
    ceilingTexture.wrapT = THREE.RepeatWrapping;
    ceilingTexture.repeat.set(6, 3);
    ceilingTexture.colorSpace = THREE.SRGBColorSpace;

    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(totalWidth, roomDepth),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: ceilingTexture,
            roughness: 0.95,
        })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight;
    scene.add(ceiling);

    const wallTexture = new THREE.TextureLoader().load("/Wall_textur.png");
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(8, 3);
    wallTexture.colorSpace = THREE.SRGBColorSpace;
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: wallTexture,
        roughness: 0.95,
    });

    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(totalWidth, roomHeight, wallThickness),
        wallMat
    );
    backWall.position.set(0, roomHeight / 2, -halfDepth);
    scene.add(backWall);

    const frontWall = new THREE.Mesh(
        new THREE.BoxGeometry(totalWidth, roomHeight, wallThickness),
        wallMat
    );
    frontWall.position.set(0, roomHeight / 2, halfDepth);
    scene.add(frontWall);

    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth),
        wallMat
    );
    leftWall.position.set(-halfWidth, roomHeight / 2, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth),
        wallMat
    );
    rightWall.position.set(halfWidth, roomHeight / 2, 0);
    scene.add(rightWall);

    // Middle wall with a door hole at center.
    const segmentDepth = (roomDepth - doorWidth) / 2;
    const sideA = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, roomHeight, segmentDepth),
        wallMat
    );
    sideA.position.set(0, roomHeight / 2, -(doorWidth / 2 + segmentDepth / 2));
    scene.add(sideA);

    const sideB = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, roomHeight, segmentDepth),
        wallMat
    );
    sideB.position.set(0, roomHeight / 2, doorWidth / 2 + segmentDepth / 2);
    scene.add(sideB);

    const topHeight = roomHeight - doorHeight;
    const topSegment = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, topHeight, doorWidth),
        wallMat
    );
    topSegment.position.set(0, doorHeight + topHeight / 2, 0);
    scene.add(topSegment);
}

addLighting(world.scene);
buildTwoAdjacentRooms(world.scene);
const roomLightLeft = new THREE.PointLight(0xffffff, 0.8, 28, 2);
roomLightLeft.position.set(-9, 6.2, 0);
world.scene.add(roomLightLeft);
const roomLightRight = new THREE.PointLight(0xffffff, 0.8, 28, 2);
roomLightRight.position.set(9, 6.2, 0);
world.scene.add(roomLightRight);
const doorLightLeft = new THREE.PointLight(0xffdd66, 0.9, 18, 2);
doorLightLeft.position.set(-3, 5.2, 0);
world.scene.add(doorLightLeft);
const doorLightRight = new THREE.PointLight(0xffdd66, 0.9, 18, 2);
doorLightRight.position.set(3, 5.2, 0);
world.scene.add(doorLightRight);

const orbEntity = new THREE.Group();
orbEntity.position.set(-9.0, 2.2, 0);
world.scene.add(orbEntity);
const enemyShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1, 28),
    new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.34,
        depthWrite: false,
    })
);
enemyShadow.rotation.x = -Math.PI / 2;
enemyShadow.position.set(orbEntity.position.x, 0.014, orbEntity.position.z);
enemyShadow.scale.set(0.85, 0.85, 1);
enemyShadow.frustumCulled = false;
world.scene.add(enemyShadow);
const ENEMY_BASE_Y = 2.2;

const orbCoreRadius = 0.7;
const orbRingRadius = orbCoreRadius + 0.16;
const orbRingTube = 0.05;
const orbCore = new THREE.Mesh(
    new THREE.SphereGeometry(orbCoreRadius, 28, 18),
    new THREE.MeshStandardMaterial({
        color: 0x7ec8ff,
        emissive: 0x103860,
        emissiveIntensity: 0.25,
        roughness: 0.32,
        metalness: 0.2,
    })
);
orbEntity.add(orbCore);
const enemyHalfSize = new THREE.Vector3(orbCoreRadius, orbCoreRadius, orbCoreRadius);
const enemyBallHitRadius = orbCoreRadius;
const enemyVelocity = new THREE.Vector3();
const enemyBaseColor = new THREE.Color(0x7ec8ff);
const enemyBaseEmissive = new THREE.Color(0x103860);
const enemyDamageColor = new THREE.Color(0xff4a4a);
let enemyDamageTimer = 0;
const ENEMY_DAMAGE_DURATION = 0.14;
const ENEMY_KNOCKBACK_SCALE = 0.48;
const ENEMY_IMMEDIATE_PUSH = 0.48;
const ENEMY_FOLLOW_DISTANCE = 4.0;
const ENEMY_FOLLOW_ACCEL = 8.0;
const ENEMY_DOOR_EPS = 0.024;
const ENEMY_GRID_SIZE = 0.4;
const ENEMY_PATH_REPLAN_INTERVAL = 2.0;
const ENEMY_MAX_HEALTH = 100;
const ENEMY_BALL_DAMAGE = 20;
const ENEMY_PROJECTILE_RADIUS = 0.12;
const ENEMY_PROJECTILE_SPEED = 12.0;
const ENEMY_PROJECTILE_DAMAGE = 10;
const ENEMY_PROJECTILE_COOLDOWN = 5.0;
const ENEMY_PROJECTILE_LIFETIME = 6.0;
const ENEMY_PROJECTILE_MAX = 48;
const PLAYER_HIT_FLASH_DURATION = 0.18;
const PLAYER_SHAKE_DURATION = 0.24;
const PLAYER_SHAKE_STRENGTH = 0.055;
const ENEMY_MAX_ACTIVE_COUNT = 5;
const ENEMY_SPAWN_INTERVAL = 10.0;
const ENEMY_HEALTHBAR_SHOW_TIME = 1.0;
const ENEMY_HEALTHBAR_LAG_DELAY = 0.2;
const ENEMY_HEALTHBAR_LAG_SHRINK = 0.2;
const ENEMY_DEATH_FALL_TIME = 1.0;
const ENEMY_DEATH_FADE_TIME = 1.0;
const enemyToPlayer = new THREE.Vector3();
const enemyTarget = new THREE.Vector3();
const enemyPathFollowDir = new THREE.Vector3();
const enemyNextPos = new THREE.Vector3();
let enemyPath = [];
let enemyPathIndex = 0;
let enemyPathLastReplan = 0;
let enemyHealth = ENEMY_MAX_HEALTH;
let enemyDisplayedHealth = ENEMY_MAX_HEALTH;
let enemyLagHealth = ENEMY_MAX_HEALTH;
let enemyHealthBarTimer = 0;
let enemyHealthLagDelayTimer = 0;
let enemyHealthLagShrinkTimer = 0;
let enemyShootCooldown = ENEMY_PROJECTILE_COOLDOWN;
let enemySpawnTimer = 0;
let enemyKillCount = 0;
let enemyAlive = true;
let enemyDeathTimer = 0;
const extraEnemies = [];
const enemyRingWorldContainer = new THREE.Group();
const enemyDeathRings = [];
world.scene.add(enemyRingWorldContainer);

function enemyAabbOverlapsAt(aPos, bPos, padding = 0.0) {
    const overlapX = Math.abs(aPos.x - bPos.x) < (enemyHalfSize.x * 2 + padding);
    const overlapY = Math.abs(aPos.y - bPos.y) < (enemyHalfSize.y * 2 + padding);
    const overlapZ = Math.abs(aPos.z - bPos.z) < (enemyHalfSize.z * 2 + padding);
    return overlapX && overlapY && overlapZ;
}

function wouldCollideWithAnotherEnemy(candidatePos, selfType = "main", selfExtraIndex = -1) {
    if (enemyAlive && selfType !== "main") {
        if (enemyAabbOverlapsAt(candidatePos, orbEntity.position)) return true;
    }
    for (let i = 0; i < extraEnemies.length; i += 1) {
        const other = extraEnemies[i];
        if (!other.alive) continue;
        if (selfType === "extra" && i === selfExtraIndex) continue;
        if (enemyAabbOverlapsAt(candidatePos, other.entity.position)) return true;
    }
    return false;
}


const enemyCollisionBox = new THREE.Mesh(
    new THREE.BoxGeometry(enemyHalfSize.x * 2, enemyHalfSize.y * 2, enemyHalfSize.z * 2),
    new THREE.MeshBasicMaterial({
        color: 0x66ffcc,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
    })
);
enemyCollisionBox.frustumCulled = false;
enemyCollisionBox.visible = false;

const enemyHealthBarGroup = new THREE.Group();
enemyHealthBarGroup.position.set(0, enemyHalfSize.y + 0.8, 0);
const enemyHealthBarWidth = 1.8;
const enemyHealthBarHeight = 0.18;
const enemyHealthBarBg = new THREE.Mesh(
    new THREE.PlaneGeometry(enemyHealthBarWidth, enemyHealthBarHeight),
    new THREE.MeshBasicMaterial({
        color: 0x111111,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
    })
);
const enemyHealthBarLag = new THREE.Mesh(
    new THREE.PlaneGeometry(enemyHealthBarWidth, enemyHealthBarHeight * 0.78),
    new THREE.MeshBasicMaterial({
        color: 0xff6655,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
    })
);
const enemyHealthBarNow = new THREE.Mesh(
    new THREE.PlaneGeometry(enemyHealthBarWidth, enemyHealthBarHeight * 0.78),
    new THREE.MeshBasicMaterial({
        color: 0x4cff88,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
    })
);
enemyHealthBarBg.position.z = -0.01;
enemyHealthBarLag.position.z = 0;
enemyHealthBarNow.position.z = 0.01;
enemyHealthBarGroup.add(enemyHealthBarBg, enemyHealthBarLag, enemyHealthBarNow);
enemyHealthBarGroup.visible = false;
enemyHealthBarBg.renderOrder = 9998;
enemyHealthBarLag.renderOrder = 9999;
enemyHealthBarNow.renderOrder = 10000;
orbEntity.add(enemyHealthBarGroup);

function hasLineOfSightToPlayer(enemyPos, playerPos) {
    // Middle wall blocks LOS when segment crosses x=0 outside door gap.
    if ((enemyPos.x < 0 && playerPos.x > 0) || (enemyPos.x > 0 && playerPos.x < 0)) {
        const t = (0 - enemyPos.x) / (playerPos.x - enemyPos.x);
        if (t > 0 && t < 1) {
            const zAtMiddle = enemyPos.z + (playerPos.z - enemyPos.z) * t;
            const yAtMiddle = enemyPos.y + (playerPos.y - enemyPos.y) * t;
            const safeDoorHalf = Math.max(0, DOOR_WIDTH * 0.5 - enemyHalfSize.z - ENEMY_DOOR_EPS);
            const inDoorGap = Math.abs(zAtMiddle) <= safeDoorHalf;
            const belowDoorTop = yAtMiddle <= DOOR_HEIGHT - enemyHalfSize.y - ENEMY_DOOR_EPS;
            if (!(inDoorGap && belowDoorTop)) return false;
        }
    }
    return true;
}

function isEnemyGridCellBlocked(x, y, z) {
    if (x < -WORLD_HALF_X + enemyHalfSize.x || x > WORLD_HALF_X - enemyHalfSize.x) return true;
    if (z < -WORLD_HALF_Z + enemyHalfSize.z || z > WORLD_HALF_Z - enemyHalfSize.z) return true;
    if (y < enemyHalfSize.y || y > ROOM_HEIGHT - enemyHalfSize.y) return true;

    const inMiddleX = Math.abs(x) < MIDDLE_WALL_HALF_THICKNESS + enemyHalfSize.x;
    const inDoorGapZ = Math.abs(z) < DOOR_WIDTH * 0.5 - enemyHalfSize.z - ENEMY_DOOR_EPS;
    const belowDoorTop = y <= DOOR_HEIGHT - enemyHalfSize.y - ENEMY_DOOR_EPS;
    if (inMiddleX && (!inDoorGapZ || !belowDoorTop)) return true;

    return false;
}


function computeEnemyGridPath(startWorld, goalWorld) {
    const pad = 4.0;
    const minX = THREE.MathUtils.clamp(
        Math.min(startWorld.x, goalWorld.x) - pad,
        -WORLD_HALF_X + enemyHalfSize.x,
        WORLD_HALF_X - enemyHalfSize.x
    );
    const maxX = THREE.MathUtils.clamp(
        Math.max(startWorld.x, goalWorld.x) + pad,
        -WORLD_HALF_X + enemyHalfSize.x,
        WORLD_HALF_X - enemyHalfSize.x
    );
    const minZ = THREE.MathUtils.clamp(
        Math.min(startWorld.z, goalWorld.z) - pad,
        -WORLD_HALF_Z + enemyHalfSize.z,
        WORLD_HALF_Z - enemyHalfSize.z
    );
    const maxZ = THREE.MathUtils.clamp(
        Math.max(startWorld.z, goalWorld.z) + pad,
        -WORLD_HALF_Z + enemyHalfSize.z,
        WORLD_HALF_Z - enemyHalfSize.z
    );
    const minY = THREE.MathUtils.clamp(
        ENEMY_BASE_Y - enemyHalfSize.y - 0.4,
        enemyHalfSize.y,
        ROOM_HEIGHT - enemyHalfSize.y
    );
    const maxY = THREE.MathUtils.clamp(
        ENEMY_BASE_Y + enemyHalfSize.y + 0.4,
        enemyHalfSize.y,
        ROOM_HEIGHT - enemyHalfSize.y
    );

    const sizeX = Math.max(2, Math.floor((maxX - minX) / ENEMY_GRID_SIZE) + 1);
    const sizeY = Math.max(2, Math.floor((maxY - minY) / ENEMY_GRID_SIZE) + 1);
    const sizeZ = Math.max(2, Math.floor((maxZ - minZ) / ENEMY_GRID_SIZE) + 1);

    const toIdx = (v, min, size) =>
        THREE.MathUtils.clamp(Math.round((v - min) / ENEMY_GRID_SIZE), 0, size - 1);
    const toWorld = (i, min) => min + i * ENEMY_GRID_SIZE;
    const yzStride = sizeY * sizeZ;
    const toKey = (ix, iy, iz) => ix * yzStride + iy * sizeZ + iz;
    const fromKey = (key) => {
        const ix = Math.floor(key / yzStride);
        const rem = key - ix * yzStride;
        const iy = Math.floor(rem / sizeZ);
        const iz = rem - iy * sizeZ;
        return [ix, iy, iz];
    };
    const heuristic = (ax, ay, az, bx, by, bz) =>
        Math.abs(ax - bx) + Math.abs(ay - by) + Math.abs(az - bz);

    let sx = toIdx(startWorld.x, minX, sizeX);
    let sy = toIdx(startWorld.y, minY, sizeY);
    let sz = toIdx(startWorld.z, minZ, sizeZ);
    let gx = toIdx(goalWorld.x, minX, sizeX);
    let gy = toIdx(goalWorld.y, minY, sizeY);
    let gz = toIdx(goalWorld.z, minZ, sizeZ);

    const ensureAccessible = (ix, iy, iz) => {
        const wx = toWorld(ix, minX);
        const wy = toWorld(iy, minY);
        const wz = toWorld(iz, minZ);
        if (!isEnemyGridCellBlocked(wx, wy, wz)) return [ix, iy, iz];
        for (let r = 1; r <= 4; r += 1) {
            for (let dx = -r; dx <= r; dx += 1) {
                for (let dy = -r; dy <= r; dy += 1) {
                    for (let dz = -r; dz <= r; dz += 1) {
                        const nx = THREE.MathUtils.clamp(ix + dx, 0, sizeX - 1);
                        const ny = THREE.MathUtils.clamp(iy + dy, 0, sizeY - 1);
                        const nz = THREE.MathUtils.clamp(iz + dz, 0, sizeZ - 1);
                        const wx2 = toWorld(nx, minX);
                        const wy2 = toWorld(ny, minY);
                        const wz2 = toWorld(nz, minZ);
                        if (!isEnemyGridCellBlocked(wx2, wy2, wz2)) return [nx, ny, nz];
                    }
                }
            }
        }
        return null;
    };

    const startFixed = ensureAccessible(sx, sy, sz);
    const goalFixed = ensureAccessible(gx, gy, gz);
    if (!startFixed || !goalFixed) return [];
    [sx, sy, sz] = startFixed;
    [gx, gy, gz] = goalFixed;

    const startKey = toKey(sx, sy, sz);
    const goalKey = toKey(gx, gy, gz);
    const openSet = new Set([startKey]);
    const cameFrom = new Map();
    const gScore = new Map([[startKey, 0]]);
    const fScore = new Map([[startKey, heuristic(sx, sy, sz, gx, gy, gz)]]);
    const dirs = [
        [1, 0, 0], [-1, 0, 0], [0, 1, 0],
        [0, -1, 0], [0, 0, 1], [0, 0, -1],
    ];

    while (openSet.size > 0) {
        let currentKey = -1;
        let currentF = Infinity;
        for (const key of openSet) {
            const fs = fScore.get(key) ?? Infinity;
            if (fs < currentF) {
                currentF = fs;
                currentKey = key;
            }
        }
        if (currentKey < 0) break;
        const [cx, cy, cz] = fromKey(currentKey);
        if (currentKey === goalKey) {
            const out = [];
            let k = currentKey;
            while (k !== undefined) {
                const [ix, iy, iz] = fromKey(k);
                out.push(new THREE.Vector3(toWorld(ix, minX), toWorld(iy, minY), toWorld(iz, minZ)));
                k = cameFrom.get(k);
            }
            out.reverse();
            return out;
        }
        openSet.delete(currentKey);

        for (let i = 0; i < dirs.length; i += 1) {
            const nx = cx + dirs[i][0];
            const ny = cy + dirs[i][1];
            const nz = cz + dirs[i][2];
            if (nx < 0 || ny < 0 || nz < 0 || nx >= sizeX || ny >= sizeY || nz >= sizeZ) continue;
            const wx = toWorld(nx, minX);
            const wy = toWorld(ny, minY);
            const wz = toWorld(nz, minZ);
            if (isEnemyGridCellBlocked(wx, wy, wz)) continue;
            const nk = toKey(nx, ny, nz);
            const tentative = (gScore.get(currentKey) ?? Infinity) + 1;
            if (tentative < (gScore.get(nk) ?? Infinity)) {
                cameFrom.set(nk, currentKey);
                gScore.set(nk, tentative);
                fScore.set(nk, tentative + heuristic(nx, ny, nz, gx, gy, gz));
                openSet.add(nk);
            }
        }
    }
    return [];
}

function triggerEnemyDamage(damage) {
    if (!enemyAlive) return;
    enemyHealth = Math.max(0, enemyHealth - damage);
    enemyDisplayedHealth = enemyHealth;
    enemyHealthBarTimer = ENEMY_HEALTHBAR_SHOW_TIME;
    enemyHealthLagDelayTimer = ENEMY_HEALTHBAR_LAG_DELAY;
    enemyHealthLagShrinkTimer = ENEMY_HEALTHBAR_LAG_SHRINK;
    if (enemyHealth <= 0) {
        enemyAlive = false;
        enemyDeathTimer = 0;
        enemyCollisionBox.visible = false;
        enemyHealthBarTimer = ENEMY_DEATH_FALL_TIME + ENEMY_DEATH_FADE_TIME;
        orbParticleGroup.visible = false;
        enemyVelocity.set(0, 0, 0);
        for (let i = 0; i < enemyDeathRings.length; i += 1) {
            const r = enemyDeathRings[i];
            r.pivot.getWorldPosition(r.pivot.position);
            r.pivot.getWorldQuaternion(tmpQuat);
            r.pivot.quaternion.copy(tmpQuat);
            enemyRingWorldContainer.add(r.pivot);
            r.velocity.set(
                (Math.random() - 0.5) * 0.7,
                1.4 + Math.random() * 0.9,
                (Math.random() - 0.5) * 0.7
            );
            r.spin.set(0, 0, 0);
        }
    }
}

function updateEnemyHealthBar() {
    const hp01 = THREE.MathUtils.clamp(enemyDisplayedHealth / ENEMY_MAX_HEALTH, 0, 1);
    const lag01 = THREE.MathUtils.clamp(enemyLagHealth / ENEMY_MAX_HEALTH, 0, 1);
    enemyHealthBarNow.scale.x = hp01;
    enemyHealthBarLag.scale.x = lag01;
    enemyHealthBarNow.position.x = -enemyHealthBarWidth * 0.5 * (1 - hp01);
    enemyHealthBarLag.position.x = -enemyHealthBarWidth * 0.5 * (1 - lag01);
    enemyHealthBarNow.visible = hp01 > 0.001;
    enemyHealthBarLag.visible = lag01 > hp01 + 0.001;
}

function triggerExtraEnemyDamage(enemy, damage) {
    if (!enemy.alive) return;
    enemy.health = Math.max(0, enemy.health - damage);
    enemy.displayedHealth = enemy.health;
    enemy.damageTimer = ENEMY_DAMAGE_DURATION;
    enemy.healthBarTimer = ENEMY_HEALTHBAR_SHOW_TIME;
    enemy.healthLagDelayTimer = ENEMY_HEALTHBAR_LAG_DELAY;
    enemy.healthLagShrinkTimer = ENEMY_HEALTHBAR_LAG_SHRINK;
    if (enemy.health <= 0) {
        enemy.alive = false;
        enemy.deathTimer = 0;
        enemy.healthBarTimer = ENEMY_DEATH_FALL_TIME + ENEMY_DEATH_FADE_TIME;
        enemy.particleGroup.visible = false;
        enemy.velocity.set(0, 0, 0);
        enemyKillCount += 1;
        updateKillHud();
        for (let i = 0; i < enemy.deathRings.length; i += 1) {
            const r = enemy.deathRings[i];
            r.pivot.getWorldPosition(r.pivot.position);
            r.pivot.getWorldQuaternion(tmpQuat);
            r.pivot.quaternion.copy(tmpQuat);
            enemy.ringWorldContainer.add(r.pivot);
            r.velocity.set(
                (Math.random() - 0.5) * 0.7,
                1.4 + Math.random() * 0.9,
                (Math.random() - 0.5) * 0.7
            );
            r.spin.set(0, 0, 0);
        }
    }
}

function updateExtraEnemyHealthBar(enemy) {
    const hp01 = THREE.MathUtils.clamp(enemy.displayedHealth / ENEMY_MAX_HEALTH, 0, 1);
    const lag01 = THREE.MathUtils.clamp(enemy.lagHealth / ENEMY_MAX_HEALTH, 0, 1);
    enemy.healthBarNow.scale.x = hp01;
    enemy.healthBarLag.scale.x = lag01;
    enemy.healthBarNow.position.x = -enemy.healthBarWidth * 0.5 * (1 - hp01);
    enemy.healthBarLag.position.x = -enemy.healthBarWidth * 0.5 * (1 - lag01);
    enemy.healthBarNow.visible = hp01 > 0.001;
    enemy.healthBarLag.visible = lag01 > hp01 + 0.001;
}

function updateExtraEnemyDeath(enemy, dt) {
    if (enemy.alive) return;
    enemy.deathTimer += dt;
    const floorY = orbRingTube;
    for (let i = 0; i < enemy.deathRings.length; i += 1) {
        const r = enemy.deathRings[i];
        r.velocity.y += GRAVITY * 0.6 * dt;
        r.pivot.position.addScaledVector(r.velocity, dt);
        const upAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(r.pivot.quaternion).normalize();
        const radial = Math.max(0.0001, Math.sqrt(Math.max(0, 1 - upAxis.y * upAxis.y)));
        const supportY = floorY + orbRingRadius * radial + orbRingTube * Math.abs(upAxis.y);
        let onFloor = false;
        if (r.pivot.position.y < supportY) {
            r.pivot.position.y = supportY;
            onFloor = true;
            if (r.velocity.y < 0) r.velocity.y = -r.velocity.y * 0.25;
            r.velocity.x *= 0.9;
            r.velocity.z *= 0.9;
        }
        if (r.pivot.position.x < -WORLD_HALF_X + orbRingRadius) {
            r.pivot.position.x = -WORLD_HALF_X + orbRingRadius;
            if (r.velocity.x < 0) r.velocity.x = -r.velocity.x * 0.25;
        } else if (r.pivot.position.x > WORLD_HALF_X - orbRingRadius) {
            r.pivot.position.x = WORLD_HALF_X - orbRingRadius;
            if (r.velocity.x > 0) r.velocity.x = -r.velocity.x * 0.25;
        }
        if (r.pivot.position.z < -WORLD_HALF_Z + orbRingRadius) {
            r.pivot.position.z = -WORLD_HALF_Z + orbRingRadius;
            if (r.velocity.z < 0) r.velocity.z = -r.velocity.z * 0.25;
        } else if (r.pivot.position.z > WORLD_HALF_Z - orbRingRadius) {
            r.pivot.position.z = WORLD_HALF_Z - orbRingRadius;
            if (r.velocity.z > 0) r.velocity.z = -r.velocity.z * 0.25;
        }
        const inMiddleX = Math.abs(r.pivot.position.x) < MIDDLE_WALL_HALF_THICKNESS + orbRingRadius;
        const inDoorGapZ = Math.abs(r.pivot.position.z) < DOOR_WIDTH * 0.5 - orbRingRadius;
        const belowDoorTop = r.pivot.position.y < DOOR_HEIGHT - orbRingTube;
        if (inMiddleX && (!inDoorGapZ || !belowDoorTop)) {
            const pushRight = r.pivot.position.x >= 0;
            r.pivot.position.x =
                (pushRight ? 1 : -1) * (MIDDLE_WALL_HALF_THICKNESS + orbRingRadius);
            if (pushRight && r.velocity.x < 0) r.velocity.x = -r.velocity.x * 0.25;
            if (!pushRight && r.velocity.x > 0) r.velocity.x = -r.velocity.x * 0.25;
        }
        if (onFloor || Math.abs(r.pivot.position.y - supportY) < 0.01) {
            const ringMesh = r.pivot.children[0];
            if (!ringMesh) continue;
            ringMesh.getWorldQuaternion(tmpQuat);
            tmpForward.set(0, 0, 1).applyQuaternion(tmpQuat).normalize();
            pairNormal.crossVectors(tmpForward, worldUp);
            const axisLen = pairNormal.length();
            if (axisLen > 1e-5) {
                pairNormal.multiplyScalar(1 / axisLen);
                const angle = Math.asin(Math.min(1, axisLen));
                const step = Math.min(angle, dt * 4.5);
                portalTwistQuat.setFromAxisAngle(pairNormal, step);
                r.pivot.quaternion.premultiply(portalTwistQuat).normalize();
            }
            if (Math.abs(r.velocity.y) < 0.03) r.velocity.y = 0;
        }
    }

    const coreFade = THREE.MathUtils.clamp(enemy.deathTimer / ENEMY_DEATH_FALL_TIME, 0, 1);
    enemy.core.material.transparent = true;
    enemy.core.material.opacity = 1 - coreFade;
    if (coreFade >= 1) enemy.core.visible = false;

    if (enemy.deathTimer > ENEMY_DEATH_FALL_TIME) {
        const fadeT = THREE.MathUtils.clamp(
            (enemy.deathTimer - ENEMY_DEATH_FALL_TIME) / ENEMY_DEATH_FADE_TIME,
            0,
            1
        );
        const alpha = 1 - fadeT;
        for (let i = 0; i < enemy.ringMats.length; i += 1) {
            enemy.ringMats[i].opacity = alpha;
            enemy.ringMats[i].transparent = true;
        }
        enemy.ringWorldContainer.visible = alpha > 0.001;
    }
}

function getRandomEnemySpawnPosition(out) {
    const marginX = enemyHalfSize.x + 0.45;
    const marginZ = enemyHalfSize.z + 0.45;
    const leftMinX = -WORLD_HALF_X + marginX;
    const leftMaxX = -MIDDLE_WALL_HALF_THICKNESS - marginX;
    const rightMinX = MIDDLE_WALL_HALF_THICKNESS + marginX;
    const rightMaxX = WORLD_HALF_X - marginX;
    const minZ = -WORLD_HALF_Z + marginZ;
    const maxZ = WORLD_HALF_Z - marginZ;

    const leftRoom = Math.random() < 0.5;
    out.x = leftRoom
        ? THREE.MathUtils.lerp(leftMinX, leftMaxX, Math.random())
        : THREE.MathUtils.lerp(rightMinX, rightMaxX, Math.random());
    out.y = ENEMY_BASE_Y;
    out.z = THREE.MathUtils.lerp(minZ, maxZ, Math.random());
    return out;
}

function getActiveEnemyCount() {
    let count = enemyAlive ? 1 : 0;
    for (let i = 0; i < extraEnemies.length; i += 1) {
        if (extraEnemies[i].alive) count += 1;
    }
    return count;
}

function spawnExtraEnemy() {
    if (getActiveEnemyCount() >= ENEMY_MAX_ACTIVE_COUNT) return;
    const spawnPos = new THREE.Vector3();
    let found = false;
    for (let i = 0; i < 24; i += 1) {
        getRandomEnemySpawnPosition(spawnPos);
        if (spawnPos.distanceTo(playerYaw.position) < 4.5) continue;
        if (enemyAlive && spawnPos.distanceTo(orbEntity.position) < 2.4) continue;
        let tooClose = false;
        for (let j = 0; j < extraEnemies.length; j += 1) {
            if (spawnPos.distanceTo(extraEnemies[j].entity.position) < 2.2) {
                tooClose = true;
                break;
            }
        }
        if (tooClose) continue;
        found = true;
        break;
    }
    if (!found) return;

    const entity = new THREE.Group();
    entity.position.copy(spawnPos);
    world.scene.add(entity);

    const core = new THREE.Mesh(
        new THREE.SphereGeometry(orbCoreRadius, 24, 16),
        new THREE.MeshStandardMaterial({
            color: 0x7ec8ff,
            emissive: 0x103860,
            emissiveIntensity: 0.25,
            roughness: 0.32,
            metalness: 0.2,
        })
    );
    core.frustumCulled = false;
    entity.add(core);

    const ringMatXYEx = new THREE.MeshStandardMaterial({
        color: 0x9eddff,
        emissive: 0x3aa7ff,
        emissiveIntensity: 0.65,
        roughness: 0.1,
        metalness: 0.85,
    });
    const ringMatXZEx = ringMatXYEx.clone();
    const ringMatYZEx = ringMatXYEx.clone();
    const ringXY = new THREE.Mesh(new THREE.TorusGeometry(orbRingRadius, orbRingTube, 16, 64), ringMatXYEx);
    const ringXZ = new THREE.Mesh(new THREE.TorusGeometry(orbRingRadius, orbRingTube, 16, 64), ringMatXZEx);
    ringXZ.rotation.x = Math.PI / 2;
    const ringYZ = new THREE.Mesh(new THREE.TorusGeometry(orbRingRadius, orbRingTube, 16, 64), ringMatYZEx);
    ringYZ.rotation.y = Math.PI / 2;
    const ringXYPivot = new THREE.Group();
    const ringXZPivot = new THREE.Group();
    const ringYZPivot = new THREE.Group();
    ringXYPivot.add(ringXY);
    ringXZPivot.add(ringXZ);
    ringYZPivot.add(ringYZ);
    entity.add(ringXYPivot, ringXZPivot, ringYZPivot);

    const particleGroup = new THREE.Group();
    entity.add(particleGroup);
    const particles = [];
    for (let i = 0; i < 90; i += 1) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const radius = orbCoreRadius + 0.2 + Math.random() * 0.75;
        const sinPhi = Math.sin(phi);
        const startPos = new THREE.Vector3(
            radius * Math.cos(theta) * sinPhi,
            radius * Math.sin(theta) * sinPhi,
            radius * Math.cos(phi)
        );
        const material = new THREE.MeshBasicMaterial({
            color: 0xb7eeff,
            transparent: true,
            opacity: 0.88,
            depthWrite: false,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), material);
        mesh.position.copy(startPos);
        mesh.scale.setScalar(0.25 + Math.random() * 0.85);
        mesh.frustumCulled = false;
        particleGroup.add(mesh);
        particles.push({
            mesh,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 1.6,
                (Math.random() - 0.5) * 1.6,
                (Math.random() - 0.5) * 1.6
            ),
            seed: Math.random() * 1000,
            phase: Math.random() * Math.PI * 2,
            pulseSpeed: 2.2 + Math.random() * 3.3,
            minScale: 0.09 + Math.random() * 0.08,
            maxScale: 0.17 + Math.random() * 0.22,
            orbitMin: orbCoreRadius + 0.16,
            orbitMax: orbCoreRadius + 0.92,
        });
    }

    const healthBarGroup = new THREE.Group();
    const healthBarWidth = 1.8;
    const healthBarHeight = 0.18;
    healthBarGroup.position.set(0, enemyHalfSize.y + 0.8, 0);
    const healthBarBg = new THREE.Mesh(
        new THREE.PlaneGeometry(healthBarWidth, healthBarHeight),
        new THREE.MeshBasicMaterial({
            color: 0x111111,
            transparent: true,
            opacity: 0.75,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide,
        })
    );
    const healthBarLag = new THREE.Mesh(
        new THREE.PlaneGeometry(healthBarWidth, healthBarHeight * 0.78),
        new THREE.MeshBasicMaterial({
            color: 0xff6655,
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide,
        })
    );
    const healthBarNow = new THREE.Mesh(
        new THREE.PlaneGeometry(healthBarWidth, healthBarHeight * 0.78),
        new THREE.MeshBasicMaterial({
            color: 0x4cff88,
            transparent: true,
            opacity: 0.95,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide,
        })
    );
    healthBarBg.position.z = -0.01;
    healthBarLag.position.z = 0;
    healthBarNow.position.z = 0.01;
    healthBarGroup.add(healthBarBg, healthBarLag, healthBarNow);
    healthBarGroup.visible = false;
    entity.add(healthBarGroup);

    const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(1, 22),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: ENEMY_SHADOW_MAX_OPACITY,
            depthWrite: false,
        })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(spawnPos.x, ENEMY_SHADOW_Y, spawnPos.z);
    shadow.scale.set(ENEMY_SHADOW_RADIUS, ENEMY_SHADOW_RADIUS, 1);
    shadow.frustumCulled = false;
    world.scene.add(shadow);

    const ringWorldContainer = new THREE.Group();
    world.scene.add(ringWorldContainer);
    const deathRings = [
        { pivot: ringXYPivot, velocity: new THREE.Vector3(), spin: new THREE.Vector3() },
        { pivot: ringXZPivot, velocity: new THREE.Vector3(), spin: new THREE.Vector3() },
        { pivot: ringYZPivot, velocity: new THREE.Vector3(), spin: new THREE.Vector3() },
    ];

    extraEnemies.push({
        entity,
        core,
        ringPivots: [ringXYPivot, ringXZPivot, ringYZPivot],
        ringMats: [ringMatXYEx, ringMatXZEx, ringMatYZEx],
        ringWorldContainer,
        deathRings,
        particleGroup,
        particles,
        healthBarGroup,
        healthBarBg,
        healthBarNow,
        healthBarLag,
        healthBarWidth,
        shadow,
        velocity: new THREE.Vector3(),
        followDir: new THREE.Vector3(),
        target: new THREE.Vector3(),
        path: [],
        pathIndex: 0,
        pathLastReplan: clock.elapsedTime + Math.random() * ENEMY_PATH_REPLAN_INTERVAL,
        health: ENEMY_MAX_HEALTH,
        displayedHealth: ENEMY_MAX_HEALTH,
        lagHealth: ENEMY_MAX_HEALTH,
        healthBarTimer: 0,
        healthLagDelayTimer: 0,
        healthLagShrinkTimer: 0,
        damageTimer: 0,
        deathTimer: 0,
        shootCooldown: ENEMY_PROJECTILE_COOLDOWN,
        alive: true,
    });
}

function removeExtraEnemy(index) {
    const e = extraEnemies[index];
    if (!e) return;
    world.scene.remove(e.entity);
    world.scene.remove(e.shadow);
    world.scene.remove(e.ringWorldContainer);
    e.core.material.dispose();
    e.core.geometry.dispose();
    for (let i = 0; i < e.ringMats.length; i += 1) {
        e.ringMats[i].dispose();
    }
    for (let i = 0; i < e.particles.length; i += 1) {
        const p = e.particles[i];
        p.mesh.material.dispose();
        p.mesh.geometry.dispose();
    }
    e.healthBarBg.material.dispose();
    e.healthBarNow.material.dispose();
    e.healthBarLag.material.dispose();
    e.healthBarBg.geometry.dispose();
    e.healthBarNow.geometry.dispose();
    e.healthBarLag.geometry.dispose();
    e.shadow.material.dispose();
    e.shadow.geometry.dispose();
    extraEnemies.splice(index, 1);
}

function updateEnemyDeath(dt) {
    if (enemyAlive) return;
    enemyDeathTimer += dt;
    const floorY = orbRingTube;
    for (let i = 0; i < enemyDeathRings.length; i += 1) {
        const r = enemyDeathRings[i];
        r.velocity.y += GRAVITY * 0.6 * dt;
        r.pivot.position.addScaledVector(r.velocity, dt);
        const upAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(r.pivot.quaternion).normalize();
        const radial = Math.max(0.0001, Math.sqrt(Math.max(0, 1 - upAxis.y * upAxis.y)));
        const supportY = floorY + orbRingRadius * radial + orbRingTube * Math.abs(upAxis.y);
        let onFloor = false;
        if (r.pivot.position.y < supportY) {
            r.pivot.position.y = supportY;
            onFloor = true;
            if (r.velocity.y < 0) r.velocity.y = -r.velocity.y * 0.25;
            r.velocity.x *= 0.9;
            r.velocity.z *= 0.9;
        }

        // Independent wall collisions using a cylinder approximation
        // (radius = ring radius, height = ring thickness).
        if (r.pivot.position.x < -WORLD_HALF_X + orbRingRadius) {
            r.pivot.position.x = -WORLD_HALF_X + orbRingRadius;
            if (r.velocity.x < 0) r.velocity.x = -r.velocity.x * 0.25;
        } else if (r.pivot.position.x > WORLD_HALF_X - orbRingRadius) {
            r.pivot.position.x = WORLD_HALF_X - orbRingRadius;
            if (r.velocity.x > 0) r.velocity.x = -r.velocity.x * 0.25;
        }
        if (r.pivot.position.z < -WORLD_HALF_Z + orbRingRadius) {
            r.pivot.position.z = -WORLD_HALF_Z + orbRingRadius;
            if (r.velocity.z < 0) r.velocity.z = -r.velocity.z * 0.25;
        } else if (r.pivot.position.z > WORLD_HALF_Z - orbRingRadius) {
            r.pivot.position.z = WORLD_HALF_Z - orbRingRadius;
            if (r.velocity.z > 0) r.velocity.z = -r.velocity.z * 0.25;
        }

        const inMiddleX =
            Math.abs(r.pivot.position.x) < MIDDLE_WALL_HALF_THICKNESS + orbRingRadius;
        const inDoorGapZ = Math.abs(r.pivot.position.z) < DOOR_WIDTH * 0.5 - orbRingRadius;
        const belowDoorTop = r.pivot.position.y < DOOR_HEIGHT - orbRingTube;
        if (inMiddleX && (!inDoorGapZ || !belowDoorTop)) {
            const pushRight = r.pivot.position.x >= 0;
            r.pivot.position.x =
                (pushRight ? 1 : -1) * (MIDDLE_WALL_HALF_THICKNESS + orbRingRadius);
            if (pushRight && r.velocity.x < 0) r.velocity.x = -r.velocity.x * 0.25;
            if (!pushRight && r.velocity.x > 0) r.velocity.x = -r.velocity.x * 0.25;
        }

        // While touching floor, tilt rings toward a flat resting orientation.
        if (onFloor || Math.abs(r.pivot.position.y - supportY) < 0.01) {
            const ringMesh = r.pivot.children[0];
            if (!ringMesh) continue;
            ringMesh.getWorldQuaternion(tmpQuat);
            tmpForward.set(0, 0, 1).applyQuaternion(tmpQuat).normalize();
            pairNormal.crossVectors(tmpForward, worldUp);
            const axisLen = pairNormal.length();
            if (axisLen > 1e-5) {
                pairNormal.multiplyScalar(1 / axisLen);
                const angle = Math.asin(Math.min(1, axisLen));
                const step = Math.min(angle, dt * 4.5);
                portalTwistQuat.setFromAxisAngle(pairNormal, step);
                r.pivot.quaternion.premultiply(portalTwistQuat).normalize();
            }
            if (Math.abs(r.velocity.y) < 0.03) r.velocity.y = 0;
        }
    }

    const coreFade = THREE.MathUtils.clamp(enemyDeathTimer / ENEMY_DEATH_FALL_TIME, 0, 1);
    orbCore.material.transparent = true;
    orbCore.material.opacity = 1 - coreFade;
    if (coreFade >= 1) {
        orbCore.visible = false;
    }

    if (enemyDeathTimer > ENEMY_DEATH_FALL_TIME) {
        const fadeT = THREE.MathUtils.clamp(
            (enemyDeathTimer - ENEMY_DEATH_FALL_TIME) / ENEMY_DEATH_FADE_TIME,
            0,
            1
        );
        const alpha = 1 - fadeT;
        ringMatXY.opacity = alpha;
        ringMatXZ.opacity = alpha;
        ringMatYZ.opacity = alpha;
        ringMatXY.transparent = true;
        ringMatXZ.transparent = true;
        ringMatYZ.transparent = true;
        enemyRingWorldContainer.visible = alpha > 0.001;
        if (fadeT >= 1) {
            enemyRingWorldContainer.visible = false;
        }
    }
}

const ringMatXY = new THREE.MeshStandardMaterial({
    color: 0x9eddff,
    emissive: 0x3aa7ff,
    emissiveIntensity: 0.65,
    roughness: 0.1,
    metalness: 0.85,
});
const ringMatXZ = ringMatXY.clone();
const ringMatYZ = ringMatXY.clone();

const orbRingXY = new THREE.Mesh(
    new THREE.TorusGeometry(orbRingRadius, orbRingTube, 16, 64),
    ringMatXY
);
const orbRingXZ = new THREE.Mesh(
    new THREE.TorusGeometry(orbRingRadius, orbRingTube, 16, 64),
    ringMatXZ
);
orbRingXZ.rotation.x = Math.PI / 2;
const orbRingYZ = new THREE.Mesh(
    new THREE.TorusGeometry(orbRingRadius, orbRingTube, 16, 64),
    ringMatYZ
);
orbRingYZ.rotation.y = Math.PI / 2;

const orbRingXYPivot = new THREE.Group();
const orbRingXZPivot = new THREE.Group();
const orbRingYZPivot = new THREE.Group();
orbRingXYPivot.add(orbRingXY);
orbRingXZPivot.add(orbRingXZ);
orbRingYZPivot.add(orbRingYZ);
orbEntity.add(orbRingXYPivot, orbRingXZPivot, orbRingYZPivot);
enemyDeathRings.push(
    { pivot: orbRingXYPivot, velocity: new THREE.Vector3(), spin: new THREE.Vector3() },
    { pivot: orbRingXZPivot, velocity: new THREE.Vector3(), spin: new THREE.Vector3() },
    { pivot: orbRingYZPivot, velocity: new THREE.Vector3(), spin: new THREE.Vector3() }
);

const orbParticleCount = 140;
const orbParticles = [];
const orbParticleGroup = new THREE.Group();
orbEntity.add(orbParticleGroup);
for (let i = 0; i < orbParticleCount; i += 1) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const radius = orbCoreRadius + 0.2 + Math.random() * 0.75;
    const sinPhi = Math.sin(phi);
    const startPos = new THREE.Vector3(
        radius * Math.cos(theta) * sinPhi,
        radius * Math.sin(theta) * sinPhi,
        radius * Math.cos(phi)
    );

    const material = new THREE.MeshBasicMaterial({
        color: 0xb7eeff,
        transparent: true,
        opacity: 0.88,
        depthWrite: false,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), material);
    mesh.position.copy(startPos);
    mesh.scale.setScalar(0.25 + Math.random() * 0.85);
    mesh.frustumCulled = false;
    orbParticleGroup.add(mesh);

    orbParticles.push({
        mesh,
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 1.6,
            (Math.random() - 0.5) * 1.6,
            (Math.random() - 0.5) * 1.6
        ),
        seed: Math.random() * 1000,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 2.2 + Math.random() * 3.3,
        minScale: 0.09 + Math.random() * 0.08,
        maxScale: 0.17 + Math.random() * 0.22,
        orbitMin: orbCoreRadius + 0.16,
        orbitMax: orbCoreRadius + 0.92,
    });
}

const portalMaskMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
portalMaskMaterial.transparent = true;
portalMaskMaterial.opacity = 0.0;
portalMaskMaterial.depthWrite = false;
portalMaskMaterial.side = THREE.DoubleSide;

const PORTAL_WIDTH = 2.8;
const PORTAL_HEIGHT = 4.0;
const PORTAL_RT_MIN = 128;
const PORTAL_RT_MAX_LOW_SPEC = 4096;
const PORTAL_RT_MAX = Math.min(renderer.capabilities.maxTextureSize, PORTAL_RT_MAX_LOW_SPEC);
const PORTAL_RT_LINEAR_NEAR_DISTANCE = 2.0;
const PORTAL_RT_LINEAR_FAR_DISTANCE = 28.0;
const PORTAL_L2_RT_LINEAR_NEAR_DISTANCE = 4.0;
const PORTAL_L2_RT_LINEAR_FAR_DISTANCE = 56.0;
const PORTAL_L3_RT_LINEAR_NEAR_DISTANCE = 8.0;
const PORTAL_L3_RT_LINEAR_FAR_DISTANCE = 72.0;
const PORTAL_L2_RT_MIN = 128;
const PORTAL_L3_RT_MIN = 128;
const MINIMAP_UPDATE_INTERVAL = 1 / 15;
const PARTICLE_LOOKAT_INTERVAL_FRAMES = 3;
let frameCounter = 0;
let minimapUpdateTimer = 0;
let portalLevel1DebugRes = 0;
let portalLevel2DebugRes = 0;
let portalLevel3DebugRes = 0;
let portalResolutionDebugText = "L1: -\nL2: -\nL3: -";

function createPortalFrame(color = 0x66ccff) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.2,
        roughness: 0.25,
        metalness: 0.3,
    });
    const addBar = (w, h, x, y) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), mat);
        m.position.set(x, y, 0);
        group.add(m);
    };
    addBar(0.12, 4.28, -1.46, 0);
    addBar(0.12, 4.28, 1.46, 0);
    addBar(3.04, 0.12, 0, 2.08);
    addBar(3.04, 0.12, 0, -2.08);
    return group;
}

function createPortal(ownerWorld, x, y, z, ry, color) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(PORTAL_WIDTH, PORTAL_HEIGHT), portalMaskMaterial);
    mesh.position.set(x, y, z);
    mesh.rotation.y = ry;
    mesh.frustumCulled = false;
    mesh.visible = false;
    ownerWorld.scene.add(mesh);

    const initialRtSize = 1024;
    const rt = new THREE.WebGLRenderTarget(initialRtSize, initialRtSize);
    rt.texture.colorSpace = THREE.SRGBColorSpace;
    const prepassRtLow = new THREE.WebGLRenderTarget(PORTAL_RT_MIN, PORTAL_RT_MIN);
    prepassRtLow.texture.colorSpace = THREE.SRGBColorSpace;
    const prepassRtMid = new THREE.WebGLRenderTarget(PORTAL_RT_MIN, PORTAL_RT_MIN);
    prepassRtMid.texture.colorSpace = THREE.SRGBColorSpace;
    const seedRt = new THREE.WebGLRenderTarget(PORTAL_RT_MIN, PORTAL_RT_MIN);
    seedRt.texture.colorSpace = THREE.SRGBColorSpace;

    const portalCam = new THREE.PerspectiveCamera(75, 1, 0.01, 1000);
    portalCam.matrixAutoUpdate = false;
    const portalCamL2 = new THREE.PerspectiveCamera(75, 1, 0.01, 1000);
    portalCamL2.matrixAutoUpdate = false;
    const portalCamL3 = new THREE.PerspectiveCamera(75, 1, 0.01, 1000);
    portalCamL3.matrixAutoUpdate = false;

    const frontSurface = new THREE.Mesh(
        new THREE.PlaneGeometry(PORTAL_WIDTH, PORTAL_HEIGHT),
        new THREE.MeshBasicMaterial({ map: rt.texture, side: THREE.FrontSide })
    );
    frontSurface.position.copy(mesh.position);
    frontSurface.quaternion.copy(mesh.quaternion);
    frontSurface.position.add(
        new THREE.Vector3(0, 0, 1).applyQuaternion(mesh.quaternion).multiplyScalar(0.004)
    );
    frontSurface.frustumCulled = false;
    ownerWorld.scene.add(frontSurface);

    const backSurface = new THREE.Mesh(
        new THREE.PlaneGeometry(PORTAL_WIDTH, PORTAL_HEIGHT),
        new THREE.MeshBasicMaterial({ map: rt.texture, side: THREE.BackSide })
    );
    backSurface.position.copy(mesh.position);
    backSurface.quaternion.copy(mesh.quaternion);
    backSurface.position.add(
        new THREE.Vector3(0, 0, -1).applyQuaternion(mesh.quaternion).multiplyScalar(0.004)
    );
    backSurface.frustumCulled = false;
    ownerWorld.scene.add(backSurface);

    const frame = createPortalFrame(color);
    frame.position.copy(mesh.position);
    frame.rotation.copy(mesh.rotation);
    frame.traverse((obj) => {
        obj.frustumCulled = false;
    });
    ownerWorld.scene.add(frame);

    const cameraMarker = { position: new THREE.Vector3() };

    return {
        mesh,
        frame,
        frontSurface,
        backSurface,
        renderTarget: rt,
        currentRtSize: initialRtSize,
        prepassTargets: [prepassRtLow, prepassRtMid],
        prepassSizes: [PORTAL_RT_MIN, PORTAL_RT_MIN],
        prepassHasData: [false, false],
        seedTarget: seedRt,
        seedSize: PORTAL_RT_MIN,
        camera: portalCam,
        levelCameras: [portalCam, portalCamL2, portalCamL3],
        cameraMarker,
        world: ownerWorld,
        destination: null,
        enabled: true,
        entrySign: 1,
        wallInfo: null,
    };
}

function syncPortalVisuals(portal) {
    portal.frame.position.copy(portal.mesh.position);
    portal.frame.quaternion.copy(portal.mesh.quaternion);

    const portalForward = new THREE.Vector3(0, 0, 1).applyQuaternion(portal.mesh.quaternion);
    portal.frontSurface.position.copy(portal.mesh.position).addScaledVector(portalForward, 0.004);
    portal.frontSurface.quaternion.copy(portal.mesh.quaternion);
    portal.backSurface.position.copy(portal.mesh.position).addScaledVector(portalForward, -0.004);
    portal.backSurface.quaternion.copy(portal.mesh.quaternion);
}

// Perpendicular portals: left room back wall, right room side wall.
// Portal A must face +Z (into the room), so rotation is 0.
const portalA = createPortal(world, -9, 2, -8.5, 0, 0x66ccff);
const portalB = createPortal(world, 17.5, 2, 0, -Math.PI / 2, 0xff66aa);
portalA.destination = portalB;
portalB.destination = portalA;
// Blue is entered while moving opposite portal normal, pink is the opposite.
portalA.entrySign = 1;
portalB.entrySign = 1;
world.portals.push(portalA, portalB);

const playerYaw = new THREE.Object3D();
const playerPitch = new THREE.Object3D();
const EYE_HEIGHT = 1.7;
playerYaw.position.set(-11, EYE_HEIGHT, 5.8);
playerPitch.add(camera);
playerYaw.add(playerPitch);
camera.position.set(0, 0, 0);

const moveState = { forward: false, backward: false, left: false, right: false };
const slowArrowState = { up: false, down: false, left: false, right: false };
let verticalVelocity = 0;
let onGround = true;
let teleportCooldown = 0;
const playerCarryVelocity = new THREE.Vector3();
let playerRoll = 0;

const GRAVITY = -24;
const MOVE_SPEED = 6;
const MAX_PLAYER_HORIZONTAL_SPEED = MOVE_SPEED * 4;
const MAX_PLAYER_VERTICAL_SPEED = MOVE_SPEED * 4;
const JUMP_SPEED = 8.5;
const CAMERA_AUTO_LEVEL_SPEED = THREE.MathUtils.degToRad(300);
const PLAYER_RADIUS = 0.35;
const PLAYER_MAX_HEALTH = 100;
let playerHealth = PLAYER_MAX_HEALTH;
const WORLD_HALF_X = 17.7;
const WORLD_HALF_Z = 8.7;
const PORTAL_HALF_WIDTH = 1.4;
const PORTAL_HALF_HEIGHT = 2.0;
const clock = new THREE.Clock();

const BALL_RADIUS = 0.23;
const BALL_SHOOT_SPEED = 18;
const BALL_MAX_COUNT = 20;
const BALL_BOUNCE = 0.62;
const BALL_FRICTION = 0.84;
const BALL_AIR_DRAG = 0.995;
const BALL_RESTITUTION = 0.86;
const BALL_GRAVITY = -18;
const BALL_PORTAL_COOLDOWN = 0.08;
const BALL_INDICATOR_RADIUS = 4.5;
const BALL_RESERVE_MAX = 5;
const BALL_RESERVE_REGEN_SECONDS = 1.0;
const BALL_SHADOW_Y = 0.012;
const BALL_SHADOW_RADIUS = 0.24;
const BALL_SHADOW_MAX_OPACITY = 0.32;
const BALL_SHADOW_FADE_HEIGHT = 7.0;
const ENEMY_SHADOW_Y = 0.014;
const ENEMY_SHADOW_RADIUS = 0.85;
const ENEMY_SHADOW_MAX_OPACITY = 0.34;
const ENEMY_SHADOW_FADE_HEIGHT = 7.0;
const PORTAL_PROJECTILE_RADIUS = 0.08;
const PORTAL_PROJECTILE_SPEED = 36;
const PORTAL_PROJECTILE_MAX = 40;
const PORTAL_PROJECTILE_LIFETIME = 2.5;
const PORTAL_OVERLAP_PADDING = 0.06;
const PORTAL_SAME_WALL_BUFFER = 0.08;
const PORTAL_PLACE_EFFECT_DURATION = 0.16;
const PORTAL_PLACE_EFFECT_START_SCALE = 0.18;
const BALL_PORTAL_CONTACT_DISTANCE = BALL_RADIUS * 1.01;
const BALL_PORTAL_TRANSIT_MAX_TIME = 0.3;
const ROOM_HEIGHT = 10;
const MIDDLE_WALL_HALF_THICKNESS = 0.1;
const DOOR_WIDTH = 3.2;
const DOOR_HEIGHT = 4.2;
const VISUAL_OUTER_WALL_HALF_X = 17.9;
const VISUAL_OUTER_WALL_HALF_Z = 8.9;

const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 18, 14);
const portalProjectileGeometry = new THREE.SphereGeometry(PORTAL_PROJECTILE_RADIUS, 12, 8);
const enemyProjectileGeometry = new THREE.SphereGeometry(ENEMY_PROJECTILE_RADIUS, 12, 8);
const blobShadowGeometry = new THREE.CircleGeometry(1, 28);
const ballShadowMaterialTemplate = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: BALL_SHADOW_MAX_OPACITY,
    depthWrite: false,
});
const balls = [];
const portalProjectiles = [];
const enemyProjectiles = [];
const portalPlacementEffects = [];
let ballReserve = BALL_RESERVE_MAX;
let ballReserveRegenTimer = 0;
let ballShotCount = 0;
let playerHitFlashTimer = 0;
let playerShakeTimer = 0;
const GAME_STATE_START_MENU = "start_menu";
const GAME_STATE_PLAYING = "playing";
const GAME_STATE_PAUSED = "paused";
const GAME_STATE_GAME_OVER = "game_over";
let gameState = GAME_STATE_START_MENU;
const GAME_MODE_BATTLE = "battle";
const GAME_MODE_EXPLORE = "explore";
let currentGameMode = GAME_MODE_BATTLE;
const WEAPON_BALL = "ball";
const WEAPON_PORTAL = "portal";
let currentWeapon = WEAPON_BALL;

const fpsHud = document.createElement("div");
fpsHud.style.position = "fixed";
fpsHud.style.bottom = "12px";
fpsHud.style.right = "12px";
fpsHud.style.padding = "6px 9px";
fpsHud.style.background = "rgba(0,0,0,0.45)";
fpsHud.style.color = "#fff";
fpsHud.style.fontFamily = "monospace";
fpsHud.style.fontSize = "13px";
fpsHud.style.borderRadius = "8px";
fpsHud.style.userSelect = "none";
fpsHud.style.pointerEvents = "none";
fpsHud.style.zIndex = "12";
fpsHud.textContent = "FPS: 0";
document.body.appendChild(fpsHud);
let fpsAccumTime = 0;
let fpsFrameCount = 0;
let fpsDisplay = 0;

const killHud = document.createElement("div");
killHud.style.position = "fixed";
killHud.style.top = "12px";
killHud.style.left = "96px";
killHud.style.padding = "6px 9px";
killHud.style.background = "rgba(0,0,0,0.45)";
killHud.style.color = "#fff";
killHud.style.fontFamily = "monospace";
killHud.style.fontSize = "13px";
killHud.style.borderRadius = "8px";
killHud.style.userSelect = "none";
killHud.style.pointerEvents = "none";
killHud.style.zIndex = "12";
killHud.textContent = "KILLS: 0";
document.body.appendChild(killHud);

function updateKillHud() {
    killHud.textContent = `KILLS: ${enemyKillCount}`;
}

function resetMainEnemyForNewGame() {
    orbEntity.visible = true;
    enemyAlive = true;
    enemyHealth = ENEMY_MAX_HEALTH;
    enemyDisplayedHealth = ENEMY_MAX_HEALTH;
    enemyLagHealth = ENEMY_MAX_HEALTH;
    enemyHealthBarTimer = 0;
    enemyHealthLagDelayTimer = 0;
    enemyHealthLagShrinkTimer = 0;
    enemyDamageTimer = 0;
    enemyDeathTimer = 0;
    enemyShootCooldown = ENEMY_PROJECTILE_COOLDOWN;
    enemyVelocity.set(0, 0, 0);
    enemyPath = [];
    enemyPathIndex = 0;
    enemyPathLastReplan = clock.elapsedTime + Math.random() * ENEMY_PATH_REPLAN_INTERVAL;
    orbEntity.position.set(-9.0, ENEMY_BASE_Y, 0);
    orbCore.visible = true;
    orbCore.material.opacity = 1;
    orbCore.material.transparent = false;
    orbCore.material.color.copy(enemyBaseColor);
    orbCore.material.emissive.copy(enemyBaseEmissive);
    orbParticleGroup.visible = true;
    enemyHealthBarGroup.visible = false;
    ringMatXY.opacity = 1;
    ringMatXZ.opacity = 1;
    ringMatYZ.opacity = 1;
    ringMatXY.transparent = false;
    ringMatXZ.transparent = false;
    ringMatYZ.transparent = false;
    enemyRingWorldContainer.visible = false;
    for (const r of enemyDeathRings) {
        if (r.pivot.parent !== orbEntity) orbEntity.add(r.pivot);
        r.pivot.position.set(0, 0, 0);
        r.pivot.quaternion.identity();
        r.velocity.set(0, 0, 0);
    }
}

function resetGameWorldForNewGame(mode = currentGameMode) {
    currentGameMode = mode;
    if (document.pointerLockElement === renderer.domElement) document.exitPointerLock();
    for (let i = balls.length - 1; i >= 0; i -= 1) {
        const b = balls[i];
        world.scene.remove(b.mesh);
        world.scene.remove(b.shadow);
        b.mesh.material.dispose();
        b.shadow.material.dispose();
        balls.splice(i, 1);
    }
    for (let i = portalProjectiles.length - 1; i >= 0; i -= 1) removePortalProjectile(i);
    for (let i = enemyProjectiles.length - 1; i >= 0; i -= 1) removeEnemyProjectile(i);
    for (let i = portalPlacementEffects.length - 1; i >= 0; i -= 1) {
        const e = portalPlacementEffects[i];
        world.scene.remove(e.mesh);
        e.mesh.material.dispose();
        e.mesh.geometry.dispose();
        portalPlacementEffects.splice(i, 1);
    }
    for (let i = extraEnemies.length - 1; i >= 0; i -= 1) removeExtraEnemy(i);
    enemySpawnTimer = 0;
    enemyKillCount = 0;
    updateKillHud();

    playerYaw.position.set(-11, EYE_HEIGHT, 5.8);
    playerYaw.rotation.set(0, 0, 0);
    playerPitch.rotation.set(0, 0, 0);
    playerCarryVelocity.set(0, 0, 0);
    verticalVelocity = 0;
    onGround = true;
    teleportCooldown = 0;
    playerRoll = 0;
    camera.position.set(0, 0, 0);
    camera.rotation.z = 0;
    playerHealth = PLAYER_MAX_HEALTH;
    playerHitFlashTimer = 0;
    playerShakeTimer = 0;
    hitOverlay.style.background = "rgba(255,0,0,0)";
    ballReserve = BALL_RESERVE_MAX;
    ballReserveRegenTimer = BALL_RESERVE_REGEN_SECONDS;
    moveState.forward = false;
    moveState.backward = false;
    moveState.left = false;
    moveState.right = false;
    slowArrowState.up = false;
    slowArrowState.down = false;
    slowArrowState.left = false;
    slowArrowState.right = false;
    resetMainEnemyForNewGame();
    if (currentGameMode === GAME_MODE_EXPLORE) {
        orbEntity.visible = false;
        enemyAlive = false;
        orbCore.visible = false;
        orbParticleGroup.visible = false;
        enemyHealthBarGroup.visible = false;
        enemyRingWorldContainer.visible = false;
        enemyShadow.visible = false;
    } else {
        orbEntity.visible = true;
        enemyShadow.visible = true;
    }
    drawBallReserveHud();
    drawPlayerHealthHud();
}

function showStartMenu() {
    gameState = GAME_STATE_START_MENU;
    menuTitle.textContent = "Portal Arena";
    menuSubtitle.textContent = "Choose mode:";
    menuOverlay.style.display = "flex";
    menuBattleButton.textContent = "Battle";
    menuExploreButton.textContent = "Explore";
    menuExitButton.style.display = "none";
    menuBattleButton.onclick = () => {
        resetGameWorldForNewGame(GAME_MODE_BATTLE);
        gameState = GAME_STATE_PLAYING;
        menuOverlay.style.display = "none";
        renderer.domElement.requestPointerLock();
    };
    menuExploreButton.onclick = () => {
        resetGameWorldForNewGame(GAME_MODE_EXPLORE);
        gameState = GAME_STATE_PLAYING;
        menuOverlay.style.display = "none";
        renderer.domElement.requestPointerLock();
    };
}

function showGameOverMenu() {
    gameState = GAME_STATE_GAME_OVER;
    if (document.pointerLockElement === renderer.domElement) document.exitPointerLock();
    menuTitle.textContent = "You Died";
    menuSubtitle.textContent = `Kills: ${enemyKillCount} | Restart mode:`;
    menuOverlay.style.display = "flex";
    menuBattleButton.textContent = "Restart Battle";
    menuExploreButton.textContent = "Restart Explore";
    menuExitButton.style.display = "none";
    menuBattleButton.onclick = () => {
        resetGameWorldForNewGame(GAME_MODE_BATTLE);
        gameState = GAME_STATE_PLAYING;
        menuOverlay.style.display = "none";
        renderer.domElement.requestPointerLock();
    };
    menuExploreButton.onclick = () => {
        resetGameWorldForNewGame(GAME_MODE_EXPLORE);
        gameState = GAME_STATE_PLAYING;
        menuOverlay.style.display = "none";
        renderer.domElement.requestPointerLock();
    };
}

function resumeFromPause() {
    gameState = GAME_STATE_PLAYING;
    menuOverlay.style.display = "none";
    renderer.domElement.requestPointerLock();
}

function showPauseMenu() {
    gameState = GAME_STATE_PAUSED;
    if (document.pointerLockElement === renderer.domElement) document.exitPointerLock();
    moveState.forward = false;
    moveState.backward = false;
    moveState.left = false;
    moveState.right = false;
    slowArrowState.up = false;
    slowArrowState.down = false;
    slowArrowState.left = false;
    slowArrowState.right = false;
    menuTitle.textContent = "Paused";
    menuSubtitle.textContent = `Kills: ${enemyKillCount}`;
    menuOverlay.style.display = "flex";
    menuBattleButton.textContent = "Resume";
    menuExploreButton.textContent = "Restart";
    menuExitButton.textContent = "Exit to Start";
    menuExitButton.style.display = "inline-block";
    menuBattleButton.onclick = () => resumeFromPause();
    menuExploreButton.onclick = () => {
        resetGameWorldForNewGame(currentGameMode);
        gameState = GAME_STATE_PLAYING;
        menuOverlay.style.display = "none";
        renderer.domElement.requestPointerLock();
    };
    menuExitButton.onclick = () => {
        resetGameWorldForNewGame(currentGameMode);
        showStartMenu();
    };
}

const minimapCanvas = document.createElement("canvas");
const minimapTargetWidth = 260;
const minimapWorldAspect =
    (VISUAL_OUTER_WALL_HALF_X * 2) / (VISUAL_OUTER_WALL_HALF_Z * 2);
minimapCanvas.width = minimapTargetWidth;
minimapCanvas.height = Math.round(minimapTargetWidth / minimapWorldAspect);
minimapCanvas.style.position = "fixed";
minimapCanvas.style.top = "12px";
minimapCanvas.style.right = "12px";
minimapCanvas.style.border = "none";
minimapCanvas.style.background = "rgba(0,0,0,0.45)";
minimapCanvas.style.borderRadius = "8px";
minimapCanvas.style.pointerEvents = "none";
document.body.appendChild(minimapCanvas);
const minimapCtx = minimapCanvas.getContext("2d");
const minimapDir = new THREE.Vector3();
const minimapTarget = new THREE.Vector3();
const portalResHud = document.createElement("div");
portalResHud.style.position = "fixed";
portalResHud.style.top = `${12 + minimapCanvas.height + 8}px`;
portalResHud.style.right = "12px";
portalResHud.style.padding = "6px 9px";
portalResHud.style.background = "rgba(0,0,0,0.45)";
portalResHud.style.color = "#fff";
portalResHud.style.fontFamily = "monospace";
portalResHud.style.fontSize = "12px";
portalResHud.style.borderRadius = "8px";
portalResHud.style.userSelect = "none";
portalResHud.style.pointerEvents = "none";
portalResHud.style.whiteSpace = "pre";
portalResHud.style.zIndex = "12";
portalResHud.textContent = "L1: -\nL2: -\nL3: -";
document.body.appendChild(portalResHud);
const portalPreviewScene = new THREE.Scene();
const portalPreviewCamera = new THREE.OrthographicCamera(0, window.innerWidth, window.innerHeight, 0, -1, 1);
portalPreviewCamera.position.z = 1;
const PORTAL_PREVIEW_W = 104;
const PORTAL_PREVIEW_H = 62;
const PORTAL_PREVIEW_GAP = 8;
const PORTAL_PREVIEW_MARGIN = 12;
const portalPreviewMeshes = [];
const makePortalPreviewMesh = (texture) => {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
            map: texture,
            depthTest: false,
            depthWrite: false,
            side: THREE.DoubleSide,
        })
    );
    mesh.renderOrder = 20000;
    portalPreviewScene.add(mesh);
    portalPreviewMeshes.push(mesh);
};
// Row A: L1/L2/L3
makePortalPreviewMesh(portalA.renderTarget.texture);
makePortalPreviewMesh(portalA.prepassTargets[1].texture);
makePortalPreviewMesh(portalA.prepassTargets[0].texture);
// Row B: L1/L2/L3
makePortalPreviewMesh(portalB.renderTarget.texture);
makePortalPreviewMesh(portalB.prepassTargets[1].texture);
makePortalPreviewMesh(portalB.prepassTargets[0].texture);

function updatePortalPreviewLayout() {
    const rect = portalResHud.getBoundingClientRect();
    const totalW = PORTAL_PREVIEW_W * 3 + PORTAL_PREVIEW_GAP * 2;
    const left = window.innerWidth - PORTAL_PREVIEW_MARGIN - totalW;
    const top = rect.bottom + 8;
    for (let row = 0; row < 2; row += 1) {
        for (let col = 0; col < 3; col += 1) {
            const i = row * 3 + col;
            const mesh = portalPreviewMeshes[i];
            mesh.scale.set(PORTAL_PREVIEW_W, PORTAL_PREVIEW_H, 1);
            mesh.position.set(
                left + col * (PORTAL_PREVIEW_W + PORTAL_PREVIEW_GAP) + PORTAL_PREVIEW_W * 0.5,
                top + row * (PORTAL_PREVIEW_H + PORTAL_PREVIEW_GAP) + PORTAL_PREVIEW_H * 0.5,
                0
            );
        }
    }
}

function renderPortalPreviewOverlay() {
    updatePortalPreviewLayout();
    const prevAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(portalPreviewScene, portalPreviewCamera);
    renderer.autoClear = prevAutoClear;
}

const weaponIndicatorCanvas = document.createElement("canvas");
weaponIndicatorCanvas.width = 72;
weaponIndicatorCanvas.height = 72;
weaponIndicatorCanvas.style.position = "fixed";
weaponIndicatorCanvas.style.left = "50%";
weaponIndicatorCanvas.style.top = "50%";
weaponIndicatorCanvas.style.transform = "translate(-50%, -50%)";
weaponIndicatorCanvas.style.pointerEvents = "none";
weaponIndicatorCanvas.style.zIndex = "10";
document.body.appendChild(weaponIndicatorCanvas);
const weaponIndicatorCtx = weaponIndicatorCanvas.getContext("2d");

const ballReserveCanvas = document.createElement("canvas");
ballReserveCanvas.width = 180;
ballReserveCanvas.height = 64;
ballReserveCanvas.style.position = "fixed";
ballReserveCanvas.style.left = "12px";
ballReserveCanvas.style.bottom = "14px";
ballReserveCanvas.style.pointerEvents = "none";
ballReserveCanvas.style.zIndex = "11";
document.body.appendChild(ballReserveCanvas);
const ballReserveCtx = ballReserveCanvas.getContext("2d");

const playerHealthCanvas = document.createElement("canvas");
playerHealthCanvas.width = 220;
playerHealthCanvas.height = 48;
playerHealthCanvas.style.position = "fixed";
playerHealthCanvas.style.left = "12px";
playerHealthCanvas.style.top = "48px";
playerHealthCanvas.style.pointerEvents = "none";
playerHealthCanvas.style.zIndex = "12";
document.body.appendChild(playerHealthCanvas);
const playerHealthCtx = playerHealthCanvas.getContext("2d");

const hitOverlay = document.createElement("div");
hitOverlay.style.position = "fixed";
hitOverlay.style.left = "0";
hitOverlay.style.top = "0";
hitOverlay.style.width = "100vw";
hitOverlay.style.height = "100vh";
hitOverlay.style.pointerEvents = "none";
hitOverlay.style.zIndex = "20";
hitOverlay.style.background = "rgba(255,0,0,0)";
document.body.appendChild(hitOverlay);

const menuOverlay = document.createElement("div");
menuOverlay.style.position = "fixed";
menuOverlay.style.left = "0";
menuOverlay.style.top = "0";
menuOverlay.style.width = "100vw";
menuOverlay.style.height = "100vh";
menuOverlay.style.display = "flex";
menuOverlay.style.flexDirection = "column";
menuOverlay.style.alignItems = "center";
menuOverlay.style.justifyContent = "center";
menuOverlay.style.background = "rgba(0,0,0,0.6)";
menuOverlay.style.color = "#fff";
menuOverlay.style.fontFamily = "monospace";
menuOverlay.style.zIndex = "30";
menuOverlay.style.gap = "14px";
const menuTitle = document.createElement("div");
menuTitle.style.fontSize = "34px";
menuTitle.style.fontWeight = "700";
const menuSubtitle = document.createElement("div");
menuSubtitle.style.fontSize = "18px";
menuSubtitle.style.opacity = "0.9";
const menuChoiceRow = document.createElement("div");
menuChoiceRow.style.display = "flex";
menuChoiceRow.style.gap = "12px";
const menuBattleButton = document.createElement("button");
const menuExploreButton = document.createElement("button");
const menuExitButton = document.createElement("button");
for (const btn of [menuBattleButton, menuExploreButton, menuExitButton]) {
    btn.style.fontSize = "18px";
    btn.style.padding = "10px 16px";
    btn.style.borderRadius = "8px";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.fontFamily = "monospace";
}
menuChoiceRow.append(menuBattleButton, menuExploreButton, menuExitButton);
menuOverlay.append(menuTitle, menuSubtitle, menuChoiceRow);
document.body.appendChild(menuOverlay);

function drawPlayerHealthHud() {
    const ctx = playerHealthCtx;
    const w = playerHealthCanvas.width;
    const h = playerHealthCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const x = 10;
    const y = 16;
    const barW = 198;
    const barH = 14;
    const radius = 6;
    const hp01 = THREE.MathUtils.clamp(playerHealth / PLAYER_MAX_HEALTH, 0, 1);

    const roundedRect = (px, py, pw, ph, r) => {
        const rr = Math.min(r, pw * 0.5, ph * 0.5);
        ctx.beginPath();
        ctx.moveTo(px + rr, py);
        ctx.lineTo(px + pw - rr, py);
        ctx.arcTo(px + pw, py, px + pw, py + rr, rr);
        ctx.lineTo(px + pw, py + ph - rr);
        ctx.arcTo(px + pw, py + ph, px + pw - rr, py + ph, rr);
        ctx.lineTo(px + rr, py + ph);
        ctx.arcTo(px, py + ph, px, py + ph - rr, rr);
        ctx.lineTo(px, py + rr);
        ctx.arcTo(px, py, px + rr, py, rr);
        ctx.closePath();
    };

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    roundedRect(x - 6, y - 8, barW + 12, barH + 16, radius + 1);
    ctx.fill();
    ctx.fillStyle = "rgba(34,34,34,0.95)";
    roundedRect(x, y, barW, barH, radius);
    ctx.fill();
    ctx.fillStyle = hp01 > 0.35 ? "rgba(95,255,120,0.95)" : "rgba(255,90,90,0.95)";
    roundedRect(x, y, barW * hp01, barH, radius);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 1.2;
    roundedRect(x, y, barW, barH, radius);
    ctx.stroke();
}

function drawBallReserveHud() {
    const ctx = ballReserveCtx;
    const w = ballReserveCanvas.width;
    const h = ballReserveCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = 24;
    const cy = 32;
    const r = 14;
    const regenFrac = ballReserve >= BALL_RESERVE_MAX
        ? 1
        : THREE.MathUtils.clamp(ballReserveRegenTimer / BALL_RESERVE_REGEN_SECONDS, 0, 1);
    const start = -Math.PI / 2;
    const end = start + regenFrac * Math.PI * 2;

    // Minimalistic flat ball icon with clock-style fill.
    ctx.fillStyle = "rgba(20,20,26,0.78)";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(140,215,255,0.95)";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r - 1.5, start, end, false);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.86)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = "600 24px monospace";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillText(`${ballReserve}`, 52, cy);
    if (ballReserve >= BALL_RESERVE_MAX) {
        ctx.font = "600 14px monospace";
        ctx.fillStyle = "rgba(164,255,176,0.95)";
        ctx.fillText("MAX", 84, cy);
    }
}

function drawWeaponIndicator() {
    const ctx = weaponIndicatorCtx;
    const w = weaponIndicatorCanvas.width;
    const h = weaponIndicatorCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    ctx.clearRect(0, 0, w, h);

    if (currentWeapon === WEAPON_BALL) {
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath();
        ctx.arc(cx, cy, BALL_INDICATOR_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    // Portal gun indicator: two thin half-moons facing each other.
    const rOuter = 17;
    const rInner = 13.5;

    ctx.fillStyle = "rgba(102,204,255,0.95)";
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, Math.PI / 2, (3 * Math.PI) / 2, false);
    ctx.arc(cx, cy, rInner, (3 * Math.PI) / 2, Math.PI / 2, true);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255,102,170,0.95)";
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, -Math.PI / 2, Math.PI / 2, false);
    ctx.arc(cx, cy, rInner, Math.PI / 2, -Math.PI / 2, true);
    ctx.closePath();
    ctx.fill();
}

function worldToMap(x, z, bounds) {
    const sx = (x - bounds.minX) / (bounds.maxX - bounds.minX);
    const sy = (z - bounds.minZ) / (bounds.maxZ - bounds.minZ);
    return {
        x: bounds.mapLeft + sx * bounds.mapWidth,
        y: bounds.mapTop + sy * bounds.mapHeight,
    };
}

function drawArrow2D(ctx, x, y, dx, dy, color, len = 16) {
    const mag = Math.hypot(dx, dy) || 1;
    const ux = dx / mag;
    const uy = dy / mag;
    const ex = x + ux * len;
    const ey = y + uy * len;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    const hx = -uy;
    const hy = ux;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - ux * 6 + hx * 4, ey - uy * 6 + hy * 4);
    ctx.lineTo(ex - ux * 6 - hx * 4, ey - uy * 6 - hy * 4);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function drawMinimap() {
    const ctx = minimapCtx;
    const w = minimapCanvas.width;
    const h = minimapCanvas.height;
    ctx.clearRect(0, 0, w, h);

    // Map covers exact playable world area (no extra margin).
    const bounds = {
        minX: -VISUAL_OUTER_WALL_HALF_X,
        maxX: VISUAL_OUTER_WALL_HALF_X,
        minZ: -VISUAL_OUTER_WALL_HALF_Z,
        maxZ: VISUAL_OUTER_WALL_HALF_Z,
    };
    const mapInset = 6;
    bounds.mapLeft = mapInset;
    bounds.mapTop = mapInset;
    bounds.mapWidth = w - mapInset * 2;
    bounds.mapHeight = h - mapInset * 2;

    // External walls / map frame
    const c00 = worldToMap(-VISUAL_OUTER_WALL_HALF_X, -VISUAL_OUTER_WALL_HALF_Z, bounds);
    const c10 = worldToMap(VISUAL_OUTER_WALL_HALF_X, -VISUAL_OUTER_WALL_HALF_Z, bounds);
    const c11 = worldToMap(VISUAL_OUTER_WALL_HALF_X, VISUAL_OUTER_WALL_HALF_Z, bounds);
    const c01 = worldToMap(-VISUAL_OUTER_WALL_HALF_X, VISUAL_OUTER_WALL_HALF_Z, bounds);
    ctx.strokeStyle = "rgba(255,255,255,0.62)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(c00.x, c00.y);
    ctx.lineTo(c10.x, c10.y);
    ctx.lineTo(c11.x, c11.y);
    ctx.lineTo(c01.x, c01.y);
    ctx.closePath();
    ctx.stroke();

    // Visible frame matching the real-world aspect ratio.
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1.0;
    ctx.strokeRect(bounds.mapLeft, bounds.mapTop, bounds.mapWidth, bounds.mapHeight);

    // Middle wall with door opening
    const wallTop = worldToMap(0, VISUAL_OUTER_WALL_HALF_Z, bounds);
    const doorTop = worldToMap(0, DOOR_WIDTH * 0.5, bounds);
    const doorBottom = worldToMap(0, -DOOR_WIDTH * 0.5, bounds);
    const wallBottom = worldToMap(0, -VISUAL_OUTER_WALL_HALF_Z, bounds);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wallTop.x, wallTop.y);
    ctx.lineTo(doorTop.x, doorTop.y);
    ctx.moveTo(doorBottom.x, doorBottom.y);
    ctx.lineTo(wallBottom.x, wallBottom.y);
    ctx.stroke();

    // Portals
    for (const portal of world.portals) {
        const pColor = portal === portalA ? "#66ccff" : "#ff66aa";

        portal.mesh.getWorldPosition(tmpWorldPos);
        const quat = portal.mesh.getWorldQuaternion(tmpQuat);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat).normalize();
        const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
        const horizontalPortal = Math.abs(normal.y) > 0.85;

        if (horizontalPortal) {
            // Horizontal portals are shown as rectangles on the map.
            const corners = portalCorners.map((c) =>
                c.clone().applyMatrix4(portal.mesh.matrixWorld)
            );
            // Use non-crossing corner order for polygon fill/stroke.
            const ordered = [corners[0], corners[1], corners[3], corners[2]];
            ctx.fillStyle = portal === portalA ? "rgba(102,204,255,0.35)" : "rgba(255,102,170,0.35)";
            ctx.strokeStyle = pColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            const c0 = worldToMap(ordered[0].x, ordered[0].z, bounds);
            ctx.moveTo(c0.x, c0.y);
            for (let i = 1; i < ordered.length; i += 1) {
                const cp = worldToMap(ordered[i].x, ordered[i].z, bounds);
                ctx.lineTo(cp.x, cp.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else {
            const start = worldToMap(
                tmpWorldPos.x - right.x * (PORTAL_WIDTH * 0.5),
                tmpWorldPos.z - right.z * (PORTAL_WIDTH * 0.5),
                bounds
            );
            const end = worldToMap(
                tmpWorldPos.x + right.x * (PORTAL_WIDTH * 0.5),
                tmpWorldPos.z + right.z * (PORTAL_WIDTH * 0.5),
                bounds
            );
            ctx.strokeStyle = pColor;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    }

    // Enemies
    if (enemyAlive) {
        const enemyMap = worldToMap(orbEntity.position.x, orbEntity.position.z, bounds);
        ctx.fillStyle = "#ff5f5f";
        ctx.beginPath();
        ctx.arc(enemyMap.x, enemyMap.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    for (let i = 0; i < extraEnemies.length; i += 1) {
        const e = extraEnemies[i];
        if (!e.alive) continue;
        const enemyMap = worldToMap(e.entity.position.x, e.entity.position.z, bounds);
        ctx.fillStyle = "#ff8a8a";
        ctx.beginPath();
        ctx.arc(enemyMap.x, enemyMap.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Player: position + look-direction sector.
    const playerMap = worldToMap(playerYaw.position.x, playerYaw.position.z, bounds);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(playerMap.x, playerMap.y, 5.5, 0, Math.PI * 2);
    ctx.fill();

    camera.getWorldDirection(minimapDir).normalize();
    const dirX = minimapDir.x;
    const dirY = minimapDir.z;
    const dirAngle = Math.atan2(dirY, dirX);
    const sectorHalf = THREE.MathUtils.degToRad(30);
    const sectorRadius = 42;
    const sectorGrad = ctx.createRadialGradient(
        playerMap.x,
        playerMap.y,
        0,
        playerMap.x,
        playerMap.y,
        sectorRadius
    );
    sectorGrad.addColorStop(0, "rgba(255,216,77,0.48)");
    sectorGrad.addColorStop(1, "rgba(255,216,77,0)");
    ctx.fillStyle = sectorGrad;
    ctx.beginPath();
    ctx.moveTo(playerMap.x, playerMap.y);
    ctx.arc(
        playerMap.x,
        playerMap.y,
        sectorRadius,
        dirAngle - sectorHalf,
        dirAngle + sectorHalf
    );
    ctx.closePath();
    ctx.fill();
}

renderer.domElement.addEventListener("click", () => {
    if (gameState === GAME_STATE_PLAYING) renderer.domElement.requestPointerLock();
});
document.addEventListener("pointerlockchange", () => {
    fpsHud.style.opacity = document.pointerLockElement === renderer.domElement ? "0.8" : "1";
});
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});
document.addEventListener("mousedown", (e) => {
    if (gameState !== GAME_STATE_PLAYING) return;
    if (e.button !== 0 && e.button !== 2) return;
    if (document.pointerLockElement !== renderer.domElement) {
        renderer.domElement.requestPointerLock();
        return;
    }
    if (currentWeapon === WEAPON_BALL) {
        if (e.button === 0) shootBall();
        return;
    }
    if (e.button === 0) shootPortalProjectile(0x66ccff);
    if (e.button === 2) shootPortalProjectile(0xff66aa);
});
document.addEventListener(
    "wheel",
    (e) => {
        if (gameState !== GAME_STATE_PLAYING) return;
        if (Math.abs(e.deltaY) < 0.01) return;
        currentWeapon = currentWeapon === WEAPON_BALL ? WEAPON_PORTAL : WEAPON_BALL;
        drawWeaponIndicator();
    },
    { passive: true }
);
drawWeaponIndicator();
drawBallReserveHud();
drawPlayerHealthHud();
updateKillHud();
showStartMenu();
document.addEventListener("mousemove", (e) => {
    if (gameState !== GAME_STATE_PLAYING) return;
    if (document.pointerLockElement !== renderer.domElement) return;
    const sens = 0.0022;
    playerYaw.rotation.y -= e.movementX * sens;
    playerPitch.rotation.x -= e.movementY * sens;
    playerPitch.rotation.x = THREE.MathUtils.clamp(
        playerPitch.rotation.x,
        -Math.PI / 2 + 0.01,
        Math.PI / 2 - 0.01
    );
});
document.addEventListener("keydown", (e) => {
    if (e.code === "KeyQ") {
        if (gameState === GAME_STATE_PLAYING) {
            showPauseMenu();
        } else if (gameState === GAME_STATE_PAUSED) {
            resumeFromPause();
        }
        return;
    }
    if (gameState !== GAME_STATE_PLAYING) return;
    if (e.code === "KeyW") moveState.forward = true;
    if (e.code === "KeyS") moveState.backward = true;
    if (e.code === "KeyA") moveState.left = true;
    if (e.code === "KeyD") moveState.right = true;
    if (e.code === "ArrowUp") slowArrowState.up = true;
    if (e.code === "ArrowDown") slowArrowState.down = true;
    if (e.code === "ArrowLeft") slowArrowState.left = true;
    if (e.code === "ArrowRight") slowArrowState.right = true;
    if (e.code === "Space" && onGround) {
        verticalVelocity = JUMP_SPEED;
        onGround = false;
    }
});
document.addEventListener("keyup", (e) => {
    if (gameState !== GAME_STATE_PLAYING) return;
    if (e.code === "KeyW") moveState.forward = false;
    if (e.code === "KeyS") moveState.backward = false;
    if (e.code === "KeyA") moveState.left = false;
    if (e.code === "KeyD") moveState.right = false;
    if (e.code === "ArrowUp") slowArrowState.up = false;
    if (e.code === "ArrowDown") slowArrowState.down = false;
    if (e.code === "ArrowLeft") slowArrowState.left = false;
    if (e.code === "ArrowRight") slowArrowState.right = false;
});

const virtualCameraMatrix = new THREE.Matrix4();
const virtualCameraPosition = new THREE.Vector3();
const destinationCenter = new THREE.Vector3();
const portalCornerWorld = new THREE.Vector3();
const portalCornerCamera = new THREE.Vector3();
const portalCorners = [
    new THREE.Vector3(-PORTAL_WIDTH * 0.5, PORTAL_HEIGHT * 0.5, 0),
    new THREE.Vector3(PORTAL_WIDTH * 0.5, PORTAL_HEIGHT * 0.5, 0),
    new THREE.Vector3(-PORTAL_WIDTH * 0.5, -PORTAL_HEIGHT * 0.5, 0),
    new THREE.Vector3(PORTAL_WIDTH * 0.5, -PORTAL_HEIGHT * 0.5, 0),
];
const clipRotationY = new THREE.Matrix4().makeRotationY(Math.PI);
const invSourcePortal = new THREE.Matrix4();
const oneScale = new THREE.Vector3(1, 1, 1);
const destNormalWorld = new THREE.Vector3();
const sideToPlayer = new THREE.Vector3();
const portalViewDir = new THREE.Vector3();
const portalToPortal = new THREE.Vector3();
const screenResolution = new THREE.Vector2();

function isPortalRenderableFromViewer(portal, viewerPosition = playerYaw.position, viewerForward = null) {
    portal.mesh.getWorldPosition(tmpWorldPos);
    tmpNormal.set(0, 0, 1).applyQuaternion(portal.mesh.getWorldQuaternion(tmpQuat)).normalize();
    sideToPlayer.copy(viewerPosition).sub(tmpWorldPos);
    const facingPortalFront = tmpNormal.dot(sideToPlayer) >= 0;
    if (!facingPortalFront) return false;
    if (viewerForward) {
        portalToPortal.copy(tmpWorldPos).sub(viewerPosition);
        if (portalToPortal.lengthSq() > 1e-8) {
            portalToPortal.normalize();
            if (viewerForward.dot(portalToPortal) < -0.35) return false;
        }
    }
    return true;
}

function updatePortalSideVisibility(portal, viewerPosition = playerYaw.position) {
    portal.mesh.getWorldPosition(tmpWorldPos);
    tmpNormal.set(0, 0, 1).applyQuaternion(portal.mesh.getWorldQuaternion(tmpQuat)).normalize();
    sideToPlayer.copy(viewerPosition).sub(tmpWorldPos);
    const frontSide = tmpNormal.dot(sideToPlayer) >= 0;
    portal.frontSurface.visible = frontSide;
    // One-sided portal: from behind, render nothing.
    portal.backSurface.visible = false;
}

function configurePortalCamera(portal) {
    configurePortalCameraFromPosition(portal, playerYaw.position, portal.camera);
}

function configurePortalCameraFromPosition(portal, referencePosition, targetCamera) {
    const source = portal.mesh;
    const destination = portal.destination.mesh;
    const portalCam = targetCamera;

    // Virtual camera transform from player POSITION relative to source portal.
    // Intentionally independent from where the player is looking.
    virtualCameraMatrix
        .copy(destination.matrixWorld)
        .multiply(clipRotationY)
        .multiply(invSourcePortal.copy(source.matrixWorld).invert());

    virtualCameraPosition.copy(referencePosition).applyMatrix4(virtualCameraMatrix);
    destination.getWorldQuaternion(tmpQuat);
    const virtualCameraQuat = new THREE.Quaternion()
        .copy(tmpQuat)
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI));

    portalCam.matrixWorld.compose(virtualCameraPosition, virtualCameraQuat, oneScale);
    portalCam.matrixWorldInverse.copy(portalCam.matrixWorld).invert();
    portalCam.matrixAutoUpdate = false;

    // Off-axis projection:
    // transform so portal center is origin + portal plane in XY,
    // then apply shear by asymmetric frustum from portal corner rays.
    destination.getWorldPosition(destinationCenter);
    destNormalWorld.set(0, 0, 1).applyQuaternion(tmpQuat).normalize();
    const nearDistance = Math.max(
        0.02,
        Math.abs(destNormalWorld.dot(sideToPlayer.copy(virtualCameraPosition).sub(destinationCenter)))
    );

    let left = Infinity;
    let right = -Infinity;
    let top = -Infinity;
    let bottom = Infinity;

    for (const c of portalCorners) {
        portalCornerWorld.copy(c).applyMatrix4(destination.matrixWorld);
        portalCornerCamera.copy(portalCornerWorld).applyMatrix4(portalCam.matrixWorldInverse);
        const z = Math.max(0.0001, -portalCornerCamera.z);
        const sx = nearDistance * (portalCornerCamera.x / z);
        const sy = nearDistance * (portalCornerCamera.y / z);
        left = Math.min(left, sx);
        right = Math.max(right, sx);
        bottom = Math.min(bottom, sy);
        top = Math.max(top, sy);
    }

    if (Number.isFinite(left) && Number.isFinite(right) && Number.isFinite(top) && Number.isFinite(bottom)) {
        portalCam.projectionMatrix.makePerspective(left, right, top, bottom, nearDistance, 1000);
        portalCam.projectionMatrixInverse.copy(portalCam.projectionMatrix).invert();
    }

    if (portalCam === portal.camera) {
        portal.cameraMarker.position.setFromMatrixPosition(portalCam.matrixWorld);
    }
}

function updatePortalTextures() {
    renderer.getDrawingBufferSize(screenResolution);
    const portalL1MaxScreen = screenResolution.x;
    const activePortals = [];
    const portalDistances = new Map();
    const finalRtSizes = new Map();
    const portalResolutions = new Map();
    const portalRenderFlags = new Map();
    for (const portal of world.portals) {
        // Keep both portal render targets alive every frame to avoid black
        // recursive samples when one portal is temporarily culled by view.
        portal.mesh.getWorldPosition(tmpWorldPos);
        activePortals.push(portal);
        // Scale quality by absolute 3D distance to portal center.
        const distanceToPlayer = playerYaw.position.distanceTo(tmpWorldPos);
        portalDistances.set(portal, distanceToPlayer);

        // Build camera hierarchy:
        // L1 uses player position, L2 uses L1 camera position, L3 uses L2 camera position.
        configurePortalCameraFromPosition(portal, playerYaw.position, portal.levelCameras[0]);
        tmpWorldPos.setFromMatrixPosition(portal.levelCameras[0].matrixWorld);
        configurePortalCameraFromPosition(portal, tmpWorldPos, portal.levelCameras[1]);
        tmpWorldPos.setFromMatrixPosition(portal.levelCameras[1].matrixWorld);
        configurePortalCameraFromPosition(portal, tmpWorldPos, portal.levelCameras[2]);

        // Per-level render eligibility by FoV rules:
        // - if not in player FoV -> render nothing (L1/L2/L3)
        // - if not in C1 FoV -> skip L2/L3
        // - if not in C2 FoV -> skip L3
        const inPlayerFov = isPortalInCameraFov(portal, camera);
        const inC1Fov = isPortalInCameraFov(portal, portal.levelCameras[0]);
        const inC2Fov = isPortalInCameraFov(portal, portal.levelCameras[1]);
        portalRenderFlags.set(portal, {
            canL1: inPlayerFov,
            canL2: inPlayerFov && inC1Fov,
            canL3: inPlayerFov && inC1Fov && inC2Fov,
        });

        const resSet = computePortalResolutionSetFromCameraDistances(portal, portalL1MaxScreen);
        portalResolutions.set(portal, resSet);
        if (portal.currentRtSize !== resSet.l1) {
            portal.renderTarget.setSize(resSet.l1, resSet.l1);
            portal.currentRtSize = resSet.l1;
        }
        finalRtSizes.set(portal, portal.currentRtSize);
    }
    if (activePortals.length === 0) {
        portalResolutionDebugText = "A d:- L1:- L2:- L3:-\nB d:- L1:- L2:- L3:-";
        // Keep previous frame textures; only refresh side visibility from player view.
        for (const portal of world.portals) {
            updatePortalSideVisibility(portal);
        }
        return;
    }

    // Hide only portals that will be actively re-rendered this frame.
    for (const portal of activePortals) {
        portal.frontSurface.visible = false;
        portal.backSurface.visible = false;
    }

    const setAllPortalSurfaceTextures = (textureSelector) => {
        for (const portal of activePortals) {
            portal.frontSurface.material.map = textureSelector(portal);
            portal.backSurface.material.map = textureSelector(portal);
            portal.frontSurface.material.needsUpdate = true;
            portal.backSurface.material.needsUpdate = true;
        }
    };

    const setPortalTexturesFromLevel = (levelKey) => {
        if (levelKey === "seed") {
            setAllPortalSurfaceTextures((portal) => portal.seedTarget.texture);
            return;
        }
        if (levelKey === "final") {
            setAllPortalSurfaceTextures((portal) => portal.renderTarget.texture);
            return;
        }
        if (levelKey === "l3") {
            setAllPortalSurfaceTextures((portal) =>
                portal.prepassHasData[0]
                    ? portal.prepassTargets[0].texture
                    : portal.renderTarget.texture
            );
            return;
        }
        // levelKey === "l2"
        setAllPortalSurfaceTextures((portal) =>
            portal.prepassHasData[1]
                ? portal.prepassTargets[1].texture
                : (portal.prepassHasData[0]
                    ? portal.prepassTargets[0].texture
                    : portal.renderTarget.texture)
        );
    };

    const renderPortalPrepass = (prepassIndex, cameraLevelIndex, sampledLevelKey) => {
        // Ensure portal surfaces are updated immediately before this pass.
        setPortalTexturesFromLevel(sampledLevelKey);
        let maxPassSize = 0;
        for (const portal of activePortals) {
            const finalSize = finalRtSizes.get(portal);
            if (finalSize == null) continue;
            const flags = portalRenderFlags.get(portal);
            const canRenderThisPass = prepassIndex === 0 ? flags?.canL3 : flags?.canL2;
            if (!canRenderThisPass) continue;
            // Allow seeing recursive portal iterations by keeping destination surface visible,
            // but hide the destination portal surface (camera sits at that portal plane)
            // to avoid direct self-feedback.
            const activeCamPos = tmpWorldPos.setFromMatrixPosition(
                portal.levelCameras[cameraLevelIndex].matrixWorld
            );
            for (const p of world.portals) {
                updatePortalSideVisibility(p, activeCamPos);
            }
            portal.destination.frontSurface.visible = false;
            portal.destination.backSurface.visible = false;

            const target = portal.prepassTargets[prepassIndex];
            const resSet = portalResolutions.get(portal);
            const passSize = prepassIndex === 0 ? (resSet?.l3 ?? PORTAL_L3_RT_MIN) : (resSet?.l2 ?? PORTAL_L2_RT_MIN);
            maxPassSize = Math.max(maxPassSize, passSize);
            if (portal.prepassSizes[prepassIndex] !== passSize) {
                target.setSize(passSize, passSize);
                portal.prepassSizes[prepassIndex] = passSize;
            }
            renderer.setRenderTarget(target);
            renderer.clear();
            renderer.render(currentWorld.scene, portal.levelCameras[cameraLevelIndex]);
            portal.prepassHasData[prepassIndex] = true;
        }
        if (prepassIndex === 0) {
            portalLevel3DebugRes = maxPassSize;
        } else {
            portalLevel2DebugRes = maxPassSize;
        }
    };

    const renderPortalFinalPass = () => {
        // Ensure level-1 samples the intended level textures right before final render.
        setPortalTexturesFromLevel("l2");
        for (const portal of activePortals) {
            const flags = portalRenderFlags.get(portal);
            if (!flags?.canL1) continue;
            const activeCamPos = tmpWorldPos.setFromMatrixPosition(
                portal.levelCameras[0].matrixWorld
            );
            for (const p of world.portals) {
                updatePortalSideVisibility(p, activeCamPos);
            }
            portal.destination.frontSurface.visible = false;
            portal.destination.backSurface.visible = false;

            const finalSize = finalRtSizes.get(portal);
            if (portal.currentRtSize !== finalSize) {
                portal.renderTarget.setSize(finalSize, finalSize);
                portal.currentRtSize = finalSize;
            }
            renderer.setRenderTarget(portal.renderTarget);
            renderer.clear();
            renderer.render(currentWorld.scene, portal.levelCameras[0]);
        }
    };

    const renderPortalSeedPass = () => {
        // Seed L3 with a guaranteed non-recursive scene render (never empty/black).
        for (const p of world.portals) {
            p.frontSurface.visible = false;
            p.backSurface.visible = false;
        }
        for (const portal of activePortals) {
            const finalSize = finalRtSizes.get(portal);
            if (finalSize == null) continue;
            const flags = portalRenderFlags.get(portal);
            if (!flags?.canL3) continue;
            const resSet = portalResolutions.get(portal);
            const l3Size = resSet?.l3 ?? PORTAL_L3_RT_MIN;
            if (portal.seedSize !== l3Size) {
                portal.seedTarget.setSize(l3Size, l3Size);
                portal.seedSize = l3Size;
            }
            renderer.setRenderTarget(portal.seedTarget);
            renderer.clear();
            renderer.render(currentWorld.scene, portal.levelCameras[2]);
        }
    };

    portalLevel1DebugRes = 0;
    portalLevel2DebugRes = 0;
    portalLevel3DebugRes = 0;
    for (const portal of activePortals) {
        const s = finalRtSizes.get(portal) ?? 0;
        portalLevel1DebugRes = Math.max(portalLevel1DebugRes, s);
    }
    // Render deepest first with destination-texture chaining:
    // seed textures -> L3 dynamic -> use L3 textures -> L2 dynamic -> use L2 textures -> L1 final.
    renderPortalSeedPass();
    renderPortalPrepass(0, 2, "seed");
    renderPortalPrepass(1, 1, "l3");
    renderPortalFinalPass();
    setPortalTexturesFromLevel("final");
    renderer.setRenderTarget(null);

    for (const portal of world.portals) {
        updatePortalSideVisibility(portal);
    }

    // Readable multi-line debug text: resolutions + all camera labels/distances.
    const lines = [];
    const fmt = (v, d = 2) => (v == null ? "-" : v.toFixed(d));
    const fmti = (v) => (v == null ? "-" : `${v}`);

    const centerA = tmpWorldPos.setFromMatrixPosition(portalA.mesh.matrixWorld).clone();
    const centerB = tmpLocalPos.setFromMatrixPosition(portalB.mesh.matrixWorld).clone();

    const resLine = (p, label) => {
        const dist = portalDistances.get(p);
        const l1 = finalRtSizes.get(p);
        if (dist == null || l1 == null) return `Portal ${label}: d(player):-  L1:- L2:- L3:-`;
        const resSet = portalResolutions.get(p);
        const l2 = resSet?.l2 ?? "-";
        const l3 = resSet?.l3 ?? "-";
        return `Portal ${label}: d(player):${fmt(dist, 1)}  L1:${fmti(l1)} L2:${fmti(l2)} L3:${fmti(l3)}`;
    };
    lines.push(resLine(portalA, "A"));
    lines.push(resLine(portalB, "B"));
    lines.push("Cameras (distance to portal centers)");

    const pushCamLine = (label, pos) => {
        lines.push(`  ${label} -> A:${fmt(pos.distanceTo(centerA))}  B:${fmt(pos.distanceTo(centerB))}`);
    };
    const playerCamPos = tmpPrevDelta.setFromMatrixPosition(camera.matrixWorld).clone();
    pushCamLine("Player", playerCamPos);
    pushCamLine("A-L1", tmpCurDelta.setFromMatrixPosition(portalA.levelCameras[0].matrixWorld).clone());
    pushCamLine("A-L2", tmpMoveDelta.setFromMatrixPosition(portalA.levelCameras[1].matrixWorld).clone());
    pushCamLine("A-L3", tmpHitPoint.setFromMatrixPosition(portalA.levelCameras[2].matrixWorld).clone());
    pushCamLine("B-L1", tmpRemainingMove.setFromMatrixPosition(portalB.levelCameras[0].matrixWorld).clone());
    pushCamLine("B-L2", ballPrevPos.setFromMatrixPosition(portalB.levelCameras[1].matrixWorld).clone());
    pushCamLine("B-L3", cameraShootOrigin.setFromMatrixPosition(portalB.levelCameras[2].matrixWorld).clone());
    lines.push("FoV flags (portal center in camera frustum)");
    const tf = (v) => (v ? "Y" : "N");
    lines.push(
        `  Portal A in C1/C2/C3: ${tf(isPortalInCameraFov(portalA, portalA.levelCameras[0]))}/${tf(isPortalInCameraFov(portalA, portalA.levelCameras[1]))}/${tf(isPortalInCameraFov(portalA, portalA.levelCameras[2]))}`
    );
    lines.push(
        `  Portal B in C1/C2/C3: ${tf(isPortalInCameraFov(portalB, portalB.levelCameras[0]))}/${tf(isPortalInCameraFov(portalB, portalB.levelCameras[1]))}/${tf(isPortalInCameraFov(portalB, portalB.levelCameras[2]))}`
    );
    lines.push(
        `  Portal A in Player FoV: ${tf(isPortalInCameraFov(portalA, camera))}`
    );
    lines.push(
        `  Portal B in Player FoV: ${tf(isPortalInCameraFov(portalB, camera))}`
    );
    portalResolutionDebugText = lines.join("\n");
}

function quantizePortalResolution(size) {
    const clamped = THREE.MathUtils.clamp(size, PORTAL_RT_MIN, PORTAL_RT_MAX);
    return Math.round(clamped);
}

function updatePortalRenderTargetResolution(portal, distanceToPlayer, l1MaxSize) {
    const denom = Math.max(1e-6, PORTAL_RT_LINEAR_FAR_DISTANCE - PORTAL_RT_LINEAR_NEAR_DISTANCE);
    const t = THREE.MathUtils.clamp(
        (distanceToPlayer - PORTAL_RT_LINEAR_NEAR_DISTANCE) / denom,
        0,
        1
    );
    const cappedMax = THREE.MathUtils.clamp(l1MaxSize, PORTAL_RT_MIN, PORTAL_RT_MAX);
    const linearSize = THREE.MathUtils.lerp(cappedMax, PORTAL_RT_MIN, t);
    const clamped = THREE.MathUtils.clamp(linearSize, PORTAL_RT_MIN, cappedMax);
    const targetSize = quantizePortalResolution(clamped);

    if (portal.currentRtSize !== targetSize) {
        portal.renderTarget.setSize(targetSize, targetSize);
        portal.currentRtSize = targetSize;
    }
}

function isPointInRectNdc(p) {
    return p.x >= -1 && p.x <= 1 && p.y >= -1 && p.y <= 1;
}

function isPointInPolygon2D(point, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
        const xi = poly[i].x;
        const yi = poly[i].y;
        const xj = poly[j].x;
        const yj = poly[j].y;
        const intersect = ((yi > point.y) !== (yj > point.y)) &&
            (point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || 1e-8) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function orientation2D(a, b, c) {
    return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
}

function onSegment2D(a, b, c) {
    return (
        b.x <= Math.max(a.x, c.x) &&
        b.x >= Math.min(a.x, c.x) &&
        b.y <= Math.max(a.y, c.y) &&
        b.y >= Math.min(a.y, c.y)
    );
}

function segmentsIntersect2D(p1, q1, p2, q2) {
    const o1 = orientation2D(p1, q1, p2);
    const o2 = orientation2D(p1, q1, q2);
    const o3 = orientation2D(p2, q2, p1);
    const o4 = orientation2D(p2, q2, q1);
    if ((o1 > 0) !== (o2 > 0) && (o3 > 0) !== (o4 > 0)) return true;
    const eps = 1e-8;
    if (Math.abs(o1) < eps && onSegment2D(p1, p2, q1)) return true;
    if (Math.abs(o2) < eps && onSegment2D(p1, q2, q1)) return true;
    if (Math.abs(o3) < eps && onSegment2D(p2, p1, q2)) return true;
    if (Math.abs(o4) < eps && onSegment2D(p2, q1, q2)) return true;
    return false;
}

function polygonIntersectsScreenRectNdc(poly) {
    const rect = [
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: 1, y: 1 },
        { x: -1, y: 1 },
    ];
    for (let i = 0; i < poly.length; i += 1) {
        if (isPointInRectNdc(poly[i])) return true;
    }
    for (let i = 0; i < rect.length; i += 1) {
        if (isPointInPolygon2D(rect[i], poly)) return true;
    }
    for (let i = 0; i < poly.length; i += 1) {
        const a1 = poly[i];
        const a2 = poly[(i + 1) % poly.length];
        for (let j = 0; j < rect.length; j += 1) {
            const b1 = rect[j];
            const b2 = rect[(j + 1) % rect.length];
            if (segmentsIntersect2D(a1, a2, b1, b2)) return true;
        }
    }
    return false;
}

function isPortalInCameraFov(portal, cam) {
    const projectedPoly = [];
    let hasCornerInFront = false;
    for (let i = 0; i < portalCorners.length; i += 1) {
        portalCornerWorld.copy(portalCorners[i]).applyMatrix4(portal.mesh.matrixWorld);
        portalCornerCamera.copy(portalCornerWorld).applyMatrix4(cam.matrixWorldInverse);
        if (portalCornerCamera.z < 0) hasCornerInFront = true;
        tmpHitPoint.copy(portalCornerWorld).project(cam);
        projectedPoly.push({ x: tmpHitPoint.x, y: tmpHitPoint.y });
    }
    if (!hasCornerInFront) return false;
    return polygonIntersectsScreenRectNdc(projectedPoly);
}

function computePortalResolutionSetFromCameraDistances(portal, maxRes) {
    const safe = (v) => Math.max(1e-4, v);
    portal.destination.mesh.getWorldPosition(tmpWorldPos);
    const d1 = tmpPrevDelta
        .setFromMatrixPosition(portal.levelCameras[0].matrixWorld)
        .distanceTo(tmpWorldPos);
    const d2 = tmpCurDelta
        .setFromMatrixPosition(portal.levelCameras[1].matrixWorld)
        .distanceTo(tmpWorldPos);
    const d3 = tmpMoveDelta
        .setFromMatrixPosition(portal.levelCameras[2].matrixWorld)
        .distanceTo(tmpWorldPos);

    const l1Raw = maxRes / safe(d1);
    const l2Raw = (maxRes / safe(d2)) * (Math.max(PORTAL_WIDTH, d1) / safe(d2));
    const l3Raw = (maxRes / safe(d3)) * (d2 / safe(d3));

    const l1 = quantizePortalResolution(l1Raw);
    const l2 = Math.max(PORTAL_L2_RT_MIN, Math.min(PORTAL_RT_MAX, Math.round(l2Raw)));
    const l3 = Math.max(PORTAL_L3_RT_MIN, Math.min(PORTAL_RT_MAX, Math.round(l3Raw)));
    return { l1, l2, l3, d1, d2, d3 };
}

const tmpWorldPos = new THREE.Vector3();
const tmpLocalPos = new THREE.Vector3();
const tmpNormal = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const sourceInverse = new THREE.Matrix4();
const teleportRot = new THREE.Matrix4().makeRotationY(Math.PI);
const teleportMat = new THREE.Matrix4();
const tmpForward = new THREE.Vector3();
const transformedDir = new THREE.Vector3();
const tmpPrevDelta = new THREE.Vector3();
const tmpCurDelta = new THREE.Vector3();
const tmpMoveDelta = new THREE.Vector3();
const tmpHitPoint = new THREE.Vector3();
const tmpRemainingMove = new THREE.Vector3();
const ballPrevPos = new THREE.Vector3();
const cameraShootOrigin = new THREE.Vector3();
const cameraShootDir = new THREE.Vector3();
const playerLookDir = new THREE.Vector3();
const transformedLookDir = new THREE.Vector3();
const normalBuffer = new THREE.Vector3();
const tangentBuffer = new THREE.Vector3();
const delta = new THREE.Vector3();
const pairNormal = new THREE.Vector3();
const relVel = new THREE.Vector3();
const impulse = new THREE.Vector3();
const tmpProjectilePos = new THREE.Vector3();
const tmpProjectileHitPoint = new THREE.Vector3();
const tmpProjectileHitNormal = new THREE.Vector3();
const portalPlaceQuat = new THREE.Quaternion();
const portalTwistQuat = new THREE.Quaternion();
const portalTopCurrent = new THREE.Vector3();
const portalTopDesired = new THREE.Vector3();
const worldUp = new THREE.Vector3(0, 1, 0);
const portalCandidateQuat = new THREE.Quaternion();
const axisX = new THREE.Vector3(1, 0, 0);
const axisY = new THREE.Vector3(0, 1, 0);
const playerUpDir = new THREE.Vector3();
const transformedUpDir = new THREE.Vector3();
const baseUpAfterTeleport = new THREE.Vector3();
const projectedBaseUp = new THREE.Vector3();
const projectedTransformedUp = new THREE.Vector3();
const rollCross = new THREE.Vector3();
const playerMoveDelta = new THREE.Vector3();
const transformedPlayerMove = new THREE.Vector3();
const portalCandidateCenter = new THREE.Vector3();
const portalOtherCenter = new THREE.Vector3();
const portalCandidateRight = new THREE.Vector3();
const portalCandidateUp = new THREE.Vector3();
const portalCandidateNormal = new THREE.Vector3();
const portalOtherRight = new THREE.Vector3();
const portalOtherUp = new THREE.Vector3();
const portalOtherNormal = new THREE.Vector3();
const portalCenterDelta = new THREE.Vector3();
const portalSatAxis = new THREE.Vector3();

function rangesOverlapOnAxis(axis, centerDelta, aRight, aUp, bRight, bUp, halfW, halfH) {
    const dist = Math.abs(centerDelta.dot(axis));
    const aRadius = halfW * Math.abs(axis.dot(aRight)) + halfH * Math.abs(axis.dot(aUp));
    const bRadius = halfW * Math.abs(axis.dot(bRight)) + halfH * Math.abs(axis.dot(bUp));
    return dist <= aRadius + bRadius;
}

function wouldOverlapOtherPortalOnSameWall(portalRef, pos, quat) {
    const other = portalRef === portalA ? portalB : portalA;
    const halfW = PORTAL_WIDTH * 0.5 + PORTAL_OVERLAP_PADDING;
    const halfH = PORTAL_HEIGHT * 0.5 + PORTAL_OVERLAP_PADDING;

    portalCandidateCenter.copy(pos);
    portalOtherCenter.copy(other.mesh.position);
    portalCandidateRight.set(1, 0, 0).applyQuaternion(quat).normalize();
    portalCandidateUp.set(0, 1, 0).applyQuaternion(quat).normalize();
    portalCandidateNormal.set(0, 0, 1).applyQuaternion(quat).normalize();
    portalOtherRight.set(1, 0, 0).applyQuaternion(other.mesh.quaternion).normalize();
    portalOtherUp.set(0, 1, 0).applyQuaternion(other.mesh.quaternion).normalize();
    portalOtherNormal.set(0, 0, 1).applyQuaternion(other.mesh.quaternion).normalize();

    const normalAlignment = portalCandidateNormal.dot(portalOtherNormal);
    // Same wall face only (not opposite face).
    if (normalAlignment < 0.999) return false;

    const planeDistance = Math.abs(
        portalCenterDelta.copy(portalCandidateCenter).sub(portalOtherCenter).dot(portalOtherNormal)
    );
    if (planeDistance > 0.03) return false;

    portalCenterDelta.copy(portalOtherCenter).sub(portalCandidateCenter);
    if (!rangesOverlapOnAxis(
        portalSatAxis.copy(portalCandidateRight),
        portalCenterDelta,
        portalCandidateRight,
        portalCandidateUp,
        portalOtherRight,
        portalOtherUp,
        halfW,
        halfH
    )) return false;
    if (!rangesOverlapOnAxis(
        portalSatAxis.copy(portalCandidateUp),
        portalCenterDelta,
        portalCandidateRight,
        portalCandidateUp,
        portalOtherRight,
        portalOtherUp,
        halfW,
        halfH
    )) return false;
    if (!rangesOverlapOnAxis(
        portalSatAxis.copy(portalOtherRight),
        portalCenterDelta,
        portalCandidateRight,
        portalCandidateUp,
        portalOtherRight,
        portalOtherUp,
        halfW,
        halfH
    )) return false;
    if (!rangesOverlapOnAxis(
        portalSatAxis.copy(portalOtherUp),
        portalCenterDelta,
        portalCandidateRight,
        portalCandidateUp,
        portalOtherRight,
        portalOtherUp,
        halfW,
        halfH
    )) return false;
    return true;
}

function isTooCloseToOtherPortalOnSameWall(portalRef, hit, candidatePos) {
    const other = portalRef === portalA ? portalB : portalA;
    if (!other.wallInfo || !hit || !hit.wall) return false;
    if (other.wallInfo.axis !== hit.wall.axis) return false;

    const candidateSideKey = getWallSideKey(hit.wall.axis, hit.normal, candidatePos, hit.wall.coord);
    if (other.wallInfo.sideKey !== candidateSideKey) return false;

    const faceCoord = hit.wall.coord ?? (hit.wall.axis === "y" ? candidatePos.y : 0);
    const sameFaceCoord = Math.abs(faceCoord - other.wallInfo.coord) <= 0.03;
    const sameFacing =
        hit.normal && other.wallInfo.normal
            ? hit.normal.dot(other.wallInfo.normal) > 0.999
            : true;
    if (!sameFaceCoord || !sameFacing) return false;

    const halfW = PORTAL_WIDTH * 0.5 + PORTAL_SAME_WALL_BUFFER;
    const halfH = PORTAL_HEIGHT * 0.5 + PORTAL_SAME_WALL_BUFFER;
    if (hit.wall.axis === "x") {
        return (
            Math.abs(candidatePos.z - other.wallInfo.position.z) <= halfW * 2 &&
            Math.abs(candidatePos.y - other.wallInfo.position.y) <= halfH * 2
        );
    }
    if (hit.wall.axis === "z") {
        return (
            Math.abs(candidatePos.x - other.wallInfo.position.x) <= halfW * 2 &&
            Math.abs(candidatePos.y - other.wallInfo.position.y) <= halfH * 2
        );
    }
    // Floor / ceiling: use in-plane distance precheck; precise overlap check still runs too.
    return candidatePos.distanceTo(other.wallInfo.position) <= PORTAL_WIDTH + PORTAL_SAME_WALL_BUFFER;
}

function getWallSideKey(axis, normal, pos, coordHint) {
    if (axis === "x") {
        const coord = Number.isFinite(coordHint) ? coordHint : pos.x;
        const dir = normal.x >= 0 ? "+" : "-";
        return `x:${coord.toFixed(3)}:${dir}`;
    }
    if (axis === "z") {
        const coord = Number.isFinite(coordHint) ? coordHint : pos.z;
        const dir = normal.z >= 0 ? "+" : "-";
        return `z:${coord.toFixed(3)}:${dir}`;
    }
    const coord = Number.isFinite(coordHint) ? coordHint : pos.y;
    const dir = normal.y >= 0 ? "+" : "-";
    return `y:${coord.toFixed(3)}:${dir}`;
}

function shootBall() {
    if (ballReserve <= 0) return false;
    ballReserve -= 1;
    if (ballReserve < BALL_RESERVE_MAX) ballReserveRegenTimer = 0;
    const hue = (ballShotCount * 47) % 360;
    ballShotCount += 1;

    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(`hsl(${hue}, 88%, 58%)`),
        roughness: 0.45,
        metalness: 0.08,
    });
    const mesh = new THREE.Mesh(ballGeometry, material);
    mesh.frustumCulled = false;
    const shadow = new THREE.Mesh(blobShadowGeometry, ballShadowMaterialTemplate.clone());
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.set(BALL_SHADOW_RADIUS, BALL_SHADOW_RADIUS, 1);
    shadow.frustumCulled = false;

    camera.getWorldPosition(cameraShootOrigin);
    camera.getWorldDirection(cameraShootDir).normalize();

    mesh.position.copy(cameraShootOrigin).addScaledVector(cameraShootDir, 0.8);
    shadow.position.set(mesh.position.x, BALL_SHADOW_Y, mesh.position.z);
    world.scene.add(mesh);
    world.scene.add(shadow);

    balls.push({
        mesh,
        shadow,
        velocity: cameraShootDir.clone().multiplyScalar(BALL_SHOOT_SPEED),
        teleportCooldown: 0,
        portalTransit: null,
        portalTransitTime: 0,
    });

    if (balls.length > BALL_MAX_COUNT) {
        const oldest = balls.shift();
        world.scene.remove(oldest.mesh);
        world.scene.remove(oldest.shadow);
        oldest.mesh.material.dispose();
        oldest.shadow.material.dispose();
    }
    drawBallReserveHud();
    return true;
}

function shootPortalProjectile(colorHex) {
    const material = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.3,
        roughness: 0.3,
        metalness: 0.0,
    });
    const mesh = new THREE.Mesh(portalProjectileGeometry, material);
    mesh.frustumCulled = false;

    camera.getWorldPosition(cameraShootOrigin);
    camera.getWorldDirection(cameraShootDir).normalize();
    mesh.position.copy(cameraShootOrigin).addScaledVector(cameraShootDir, 0.55);
    world.scene.add(mesh);

    portalProjectiles.push({
        mesh,
        velocity: cameraShootDir.clone().multiplyScalar(PORTAL_PROJECTILE_SPEED),
        life: PORTAL_PROJECTILE_LIFETIME,
        portalRef: colorHex === 0x66ccff ? portalA : portalB,
    });

    if (portalProjectiles.length > PORTAL_PROJECTILE_MAX) {
        const oldest = portalProjectiles.shift();
        world.scene.remove(oldest.mesh);
        oldest.mesh.material.dispose();
    }
}

function removePortalProjectile(index) {
    const p = portalProjectiles[index];
    if (!p) return;
    world.scene.remove(p.mesh);
    p.mesh.material.dispose();
    portalProjectiles.splice(index, 1);
}

function removeEnemyProjectile(index) {
    const p = enemyProjectiles[index];
    if (!p) return;
    world.scene.remove(p.mesh);
    p.mesh.material.dispose();
    enemyProjectiles.splice(index, 1);
}

function shootEnemyProjectile(shooterPosition) {
    tmpWorldPos.copy(shooterPosition);
    tmpWorldPos.y = ENEMY_BASE_Y + orbCoreRadius * 0.35;
    tmpPrevDelta.copy(playerYaw.position).sub(tmpWorldPos);
    if (tmpPrevDelta.lengthSq() <= 1e-8) return;
    tmpPrevDelta.normalize();

    const material = new THREE.MeshStandardMaterial({
        color: 0xffb56d,
        emissive: 0xff5a22,
        emissiveIntensity: 0.55,
        roughness: 0.25,
        metalness: 0.0,
    });
    const mesh = new THREE.Mesh(enemyProjectileGeometry, material);
    mesh.frustumCulled = false;
    mesh.position.copy(tmpWorldPos).addScaledVector(tmpPrevDelta, orbCoreRadius + ENEMY_PROJECTILE_RADIUS + 0.06);
    world.scene.add(mesh);

    enemyProjectiles.push({
        mesh,
        velocity: tmpPrevDelta.clone().multiplyScalar(ENEMY_PROJECTILE_SPEED),
        life: ENEMY_PROJECTILE_LIFETIME,
    });

    if (enemyProjectiles.length > ENEMY_PROJECTILE_MAX) {
        removeEnemyProjectile(0);
    }
}

function checkEnemyProjectileWallContact(pos) {
    if (pos.x <= -WORLD_HALF_X + ENEMY_PROJECTILE_RADIUS) return true;
    if (pos.x >= WORLD_HALF_X - ENEMY_PROJECTILE_RADIUS) return true;
    if (pos.z <= -WORLD_HALF_Z + ENEMY_PROJECTILE_RADIUS) return true;
    if (pos.z >= WORLD_HALF_Z - ENEMY_PROJECTILE_RADIUS) return true;
    if (pos.y <= ENEMY_PROJECTILE_RADIUS) return true;
    if (pos.y >= ROOM_HEIGHT - ENEMY_PROJECTILE_RADIUS) return true;

    const inMiddleX = Math.abs(pos.x) < MIDDLE_WALL_HALF_THICKNESS + ENEMY_PROJECTILE_RADIUS;
    const inDoorGapZ = Math.abs(pos.z) < DOOR_WIDTH * 0.5 - ENEMY_PROJECTILE_RADIUS;
    const belowDoorTop = pos.y < DOOR_HEIGHT - ENEMY_PROJECTILE_RADIUS;
    if (inMiddleX && (!inDoorGapZ || !belowDoorTop)) return true;

    return false;
}

function updateEnemyProjectiles(dt) {
    for (let i = enemyProjectiles.length - 1; i >= 0; i -= 1) {
        const p = enemyProjectiles[i];
        p.life -= dt;
        if (p.life <= 0) {
            removeEnemyProjectile(i);
            continue;
        }
        p.mesh.position.addScaledVector(p.velocity, dt);
        if (checkEnemyProjectileWallContact(p.mesh.position)) {
            removeEnemyProjectile(i);
            continue;
        }

        delta.copy(p.mesh.position).sub(playerYaw.position);
        const hitDist = ENEMY_PROJECTILE_RADIUS + PLAYER_RADIUS;
        if (delta.lengthSq() <= hitDist * hitDist) {
            playerHealth = Math.max(0, playerHealth - ENEMY_PROJECTILE_DAMAGE);
            playerHitFlashTimer = PLAYER_HIT_FLASH_DURATION;
            playerShakeTimer = PLAYER_SHAKE_DURATION;
            removeEnemyProjectile(i);
        }
    }
}

function checkProjectileWallContact(pos) {
    if (pos.x <= -WORLD_HALF_X + PORTAL_PROJECTILE_RADIUS) return true;
    if (pos.x >= WORLD_HALF_X - PORTAL_PROJECTILE_RADIUS) return true;
    if (pos.z <= -WORLD_HALF_Z + PORTAL_PROJECTILE_RADIUS) return true;
    if (pos.z >= WORLD_HALF_Z - PORTAL_PROJECTILE_RADIUS) return true;
    if (pos.y <= PORTAL_PROJECTILE_RADIUS) return true;
    if (pos.y >= ROOM_HEIGHT - PORTAL_PROJECTILE_RADIUS) return true;

    // Middle wall with door opening.
    const inMiddleX = Math.abs(pos.x) < MIDDLE_WALL_HALF_THICKNESS + PORTAL_PROJECTILE_RADIUS;
    const inDoorGapZ = Math.abs(pos.z) < DOOR_WIDTH * 0.5 - PORTAL_PROJECTILE_RADIUS;
    const belowDoorTop = pos.y < DOOR_HEIGHT - PORTAL_PROJECTILE_RADIUS;
    if (inMiddleX && (!inDoorGapZ || !belowDoorTop)) return true;

    return false;
}

function getProjectileWallHit(prevPos, nextPos) {
    let best = null;
    let bestT = Infinity;
    const rad = PORTAL_PROJECTILE_RADIUS;

    const tryCandidate = (t, normal, wall) => {
        if (!Number.isFinite(t) || t < 0 || t > 1 || t >= bestT) return;
        tmpProjectileHitPoint.copy(prevPos).lerp(nextPos, t);
        if (tmpProjectileHitPoint.y < wall.yMin || tmpProjectileHitPoint.y > wall.yMax) return;
        const horiz = wall.axis === "x" ? tmpProjectileHitPoint.z : tmpProjectileHitPoint.x;
        if (horiz < wall.hMin || horiz > wall.hMax) return;
        bestT = t;
        best = {
            point: tmpProjectileHitPoint.clone(),
            normal: normal.clone(),
            wall,
        };
    };

    // Outer vertical walls.
    if (nextPos.x > WORLD_HALF_X - rad && prevPos.x <= WORLD_HALF_X - rad) {
        const t = (WORLD_HALF_X - rad - prevPos.x) / (nextPos.x - prevPos.x);
        tryCandidate(t, new THREE.Vector3(-1, 0, 0), {
            axis: "x",
            coord: WORLD_HALF_X,
            hMin: -WORLD_HALF_Z,
            hMax: WORLD_HALF_Z,
            yMin: rad,
            yMax: ROOM_HEIGHT - rad,
        });
    }
    if (nextPos.x < -WORLD_HALF_X + rad && prevPos.x >= -WORLD_HALF_X + rad) {
        const t = (-WORLD_HALF_X + rad - prevPos.x) / (nextPos.x - prevPos.x);
        tryCandidate(t, new THREE.Vector3(1, 0, 0), {
            axis: "x",
            coord: -WORLD_HALF_X,
            hMin: -WORLD_HALF_Z,
            hMax: WORLD_HALF_Z,
            yMin: rad,
            yMax: ROOM_HEIGHT - rad,
        });
    }
    if (nextPos.z > WORLD_HALF_Z - rad && prevPos.z <= WORLD_HALF_Z - rad) {
        const t = (WORLD_HALF_Z - rad - prevPos.z) / (nextPos.z - prevPos.z);
        tryCandidate(t, new THREE.Vector3(0, 0, -1), {
            axis: "z",
            coord: WORLD_HALF_Z,
            hMin: -WORLD_HALF_X,
            hMax: -MIDDLE_WALL_HALF_THICKNESS,
            yMin: rad,
            yMax: ROOM_HEIGHT - rad,
        });
        tryCandidate(t, new THREE.Vector3(0, 0, -1), {
            axis: "z",
            coord: WORLD_HALF_Z,
            hMin: MIDDLE_WALL_HALF_THICKNESS,
            hMax: WORLD_HALF_X,
            yMin: rad,
            yMax: ROOM_HEIGHT - rad,
        });
    }
    if (nextPos.z < -WORLD_HALF_Z + rad && prevPos.z >= -WORLD_HALF_Z + rad) {
        const t = (-WORLD_HALF_Z + rad - prevPos.z) / (nextPos.z - prevPos.z);
        tryCandidate(t, new THREE.Vector3(0, 0, 1), {
            axis: "z",
            coord: -WORLD_HALF_Z,
            hMin: -WORLD_HALF_X,
            hMax: -MIDDLE_WALL_HALF_THICKNESS,
            yMin: rad,
            yMax: ROOM_HEIGHT - rad,
        });
        tryCandidate(t, new THREE.Vector3(0, 0, 1), {
            axis: "z",
            coord: -WORLD_HALF_Z,
            hMin: MIDDLE_WALL_HALF_THICKNESS,
            hMax: WORLD_HALF_X,
            yMin: rad,
            yMax: ROOM_HEIGHT - rad,
        });
    }

    // Middle wall faces (x = +/- thickness).
    const middleLeftFace = -MIDDLE_WALL_HALF_THICKNESS - rad;
    const middleRightFace = MIDDLE_WALL_HALF_THICKNESS + rad;
    const sideZMin = -WORLD_HALF_Z;
    const sideZMax = WORLD_HALF_Z;

    const tryMiddle = (t, normal) => {
        if (!Number.isFinite(t) || t < 0 || t > 1 || t >= bestT) return;
        tmpProjectileHitPoint.copy(prevPos).lerp(nextPos, t);
        const y = tmpProjectileHitPoint.y;
        const z = tmpProjectileHitPoint.z;
        if (y < rad || y > ROOM_HEIGHT - rad) return;

        // Two side columns and top segment above door.
        const inLeftColumn = z <= -DOOR_WIDTH * 0.5;
        const inRightColumn = z >= DOOR_WIDTH * 0.5;
        const inTopSegment = Math.abs(z) <= DOOR_WIDTH * 0.5 && y >= DOOR_HEIGHT;
        if (!(inLeftColumn || inRightColumn || inTopSegment)) return;

        const hMin = inLeftColumn ? sideZMin : inRightColumn ? DOOR_WIDTH * 0.5 : -DOOR_WIDTH * 0.5;
        const hMax = inLeftColumn ? -DOOR_WIDTH * 0.5 : inRightColumn ? sideZMax : DOOR_WIDTH * 0.5;
        const yMin = inTopSegment ? DOOR_HEIGHT : rad;
        const yMax = ROOM_HEIGHT - rad;
        if (y < yMin || y > yMax) return;

        bestT = t;
        best = {
            point: tmpProjectileHitPoint.clone(),
            normal: normal.clone(),
            wall: {
                axis: "x",
                    coord: normal.x > 0 ? MIDDLE_WALL_HALF_THICKNESS : -MIDDLE_WALL_HALF_THICKNESS,
                hMin,
                hMax,
                yMin,
                yMax,
            },
        };
    };

    if (nextPos.x > middleLeftFace && prevPos.x <= middleLeftFace) {
        const t = (middleLeftFace - prevPos.x) / (nextPos.x - prevPos.x);
        tryMiddle(t, new THREE.Vector3(-1, 0, 0));
    }
    if (nextPos.x < middleRightFace && prevPos.x >= middleRightFace) {
        const t = (middleRightFace - prevPos.x) / (nextPos.x - prevPos.x);
        tryMiddle(t, new THREE.Vector3(1, 0, 0));
    }

    // Floor/ceiling: considered hits for projectile disappearance only.
    if (nextPos.y <= rad && prevPos.y > rad) {
        const t = (rad - prevPos.y) / (nextPos.y - prevPos.y);
        const point = prevPos.clone().lerp(nextPos, t);
        if (!best || t < bestT) {
            bestT = t;
            best = {
                point,
                normal: new THREE.Vector3(0, 1, 0),
                wall: { axis: "y" },
            };
        }
    }
    if (nextPos.y >= ROOM_HEIGHT - rad && prevPos.y < ROOM_HEIGHT - rad) {
        const t = (ROOM_HEIGHT - rad - prevPos.y) / (nextPos.y - prevPos.y);
        const point = prevPos.clone().lerp(nextPos, t);
        if (!best || t < bestT) {
            best = {
                point,
                normal: new THREE.Vector3(0, -1, 0),
                wall: { axis: "y" },
            };
        }
    }

    return best;
}

function computePortalPlacementFromHit(portalRef, hit) {
    if (!portalRef || !hit || !hit.wall) return null;

    const halfW = PORTAL_WIDTH * 0.5;
    const halfH = PORTAL_HEIGHT * 0.5;

    // Floor/ceiling hit: place portal horizontally and align top edge with player yaw direction.
    if (hit.wall.axis === "y") {
        portalPlaceQuat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), hit.normal);

        portalTopDesired.set(0, 0, -1).applyAxisAngle(worldUp, playerYaw.rotation.y);
        portalTopDesired.projectOnPlane(hit.normal).normalize();
        if (portalTopDesired.lengthSq() < 1e-8) {
            portalTopDesired.set(0, 0, -1);
        }

        portalTopCurrent.set(0, 1, 0).applyQuaternion(portalPlaceQuat);
        portalTopCurrent.projectOnPlane(hit.normal).normalize();

        const signedAngle = Math.atan2(
            hit.normal.dot(tmpNormal.copy(portalTopCurrent).cross(portalTopDesired)),
            portalTopCurrent.dot(portalTopDesired)
        );
        portalTwistQuat.setFromAxisAngle(hit.normal, signedAngle);
        portalCandidateQuat.copy(portalTwistQuat).multiply(portalPlaceQuat);

        const halfSpan = Math.max(halfW, halfH);
        const px = THREE.MathUtils.clamp(hit.point.x, -WORLD_HALF_X + halfSpan, WORLD_HALF_X - halfSpan);
        const pz = THREE.MathUtils.clamp(hit.point.z, -WORLD_HALF_Z + halfSpan, WORLD_HALF_Z - halfSpan);
        const py = hit.normal.y > 0
            ? PORTAL_PROJECTILE_RADIUS + 0.003
            : ROOM_HEIGHT - PORTAL_PROJECTILE_RADIUS - 0.003;

        portalCandidateCenter.set(px, py, pz);
        const blocked =
            isTooCloseToOtherPortalOnSameWall(portalRef, hit, portalCandidateCenter) ||
            wouldOverlapOtherPortalOnSameWall(portalRef, portalCandidateCenter, portalCandidateQuat);

        return {
            position: portalCandidateCenter.clone(),
            quaternion: portalCandidateQuat.clone(),
            blocked,
            wallInfo: {
                axis: "y",
                coord: py,
                normal: hit.normal.clone(),
                position: portalCandidateCenter.clone(),
                sideKey: getWallSideKey("y", hit.normal, portalCandidateCenter, py),
            },
        };
    }

    portalCandidateQuat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), hit.normal);

    let px = hit.point.x;
    let py = THREE.MathUtils.clamp(hit.point.y, hit.wall.yMin + halfH, hit.wall.yMax - halfH);
    let pz = hit.point.z;

    if (hit.wall.axis === "x") {
        pz = THREE.MathUtils.clamp(hit.point.z, hit.wall.hMin + halfW, hit.wall.hMax - halfW);
        const isMiddleWallFace = Math.abs(hit.wall.coord) <= MIDDLE_WALL_HALF_THICKNESS + 1e-6;
        px = isMiddleWallFace
            ? hit.wall.coord
            : Math.sign(hit.wall.coord) * VISUAL_OUTER_WALL_HALF_X;
    } else if (hit.wall.axis === "z") {
        px = THREE.MathUtils.clamp(hit.point.x, hit.wall.hMin + halfW, hit.wall.hMax - halfW);
        pz = Math.sign(hit.wall.coord) * VISUAL_OUTER_WALL_HALF_Z;
    }

    if (!Number.isFinite(px) || !Number.isFinite(py) || !Number.isFinite(pz)) return null;
    portalCandidateCenter.set(px, py, pz);
    const blocked =
        isTooCloseToOtherPortalOnSameWall(portalRef, hit, portalCandidateCenter) ||
        wouldOverlapOtherPortalOnSameWall(portalRef, portalCandidateCenter, portalCandidateQuat);

    return {
        position: portalCandidateCenter.clone(),
        quaternion: portalCandidateQuat.clone(),
        blocked,
        wallInfo: {
            axis: hit.wall.axis,
            coord: hit.wall.coord ?? (hit.wall.axis === "x" ? px : pz),
            normal: hit.normal.clone(),
            position: portalCandidateCenter.clone(),
            sideKey: getWallSideKey(
                hit.wall.axis,
                hit.normal,
                portalCandidateCenter,
                hit.wall.coord ?? (hit.wall.axis === "x" ? px : pz)
            ),
        },
    };
}

function applyPortalPlacement(portalRef, placement) {
    if (!portalRef || !placement || placement.blocked) return;
    portalRef.mesh.quaternion.copy(placement.quaternion);
    portalRef.mesh.position.copy(placement.position);
    portalRef.wallInfo = placement.wallInfo;
    syncPortalVisuals(portalRef);
}

function spawnPortalPlacementEffect(portalRef, placement) {
    const effectMaterial = new THREE.MeshBasicMaterial({
        color: portalRef === portalA ? 0x66ccff : 0xff66aa,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        depthWrite: false,
    });
    const effectMesh = new THREE.Mesh(new THREE.PlaneGeometry(PORTAL_WIDTH, PORTAL_HEIGHT), effectMaterial);
    effectMesh.position.copy(placement.position);
    effectMesh.quaternion.copy(placement.quaternion);
    effectMesh.scale.set(PORTAL_PLACE_EFFECT_START_SCALE, PORTAL_PLACE_EFFECT_START_SCALE, 1);
    effectMesh.frustumCulled = false;
    world.scene.add(effectMesh);

    portalPlacementEffects.push({
        mesh: effectMesh,
        portalRef,
        placement,
        elapsed: 0,
        duration: PORTAL_PLACE_EFFECT_DURATION,
    });
}

function updatePortalPlacementEffects(dt) {
    for (let i = portalPlacementEffects.length - 1; i >= 0; i -= 1) {
        const effect = portalPlacementEffects[i];
        effect.elapsed += dt;
        const t = Math.min(1, effect.elapsed / effect.duration);
        const s = THREE.MathUtils.lerp(PORTAL_PLACE_EFFECT_START_SCALE, 1, t);
        effect.mesh.scale.set(s, s, 1);
        effect.mesh.material.opacity = (1 - t) * 0.85;

        if (t >= 1) {
            applyPortalPlacement(effect.portalRef, effect.placement);
            world.scene.remove(effect.mesh);
            effect.mesh.material.dispose();
            effect.mesh.geometry.dispose();
            portalPlacementEffects.splice(i, 1);
        }
    }
}

function didPortalProjectileHitPortal(prevPos, nextPos) {
    tmpMoveDelta.copy(nextPos).sub(prevPos);
    if (tmpMoveDelta.lengthSq() < 1e-10) return false;

    const planeEps = 0.0005;
    for (const portal of currentWorld.portals) {
        portal.mesh.getWorldPosition(tmpWorldPos);
        tmpNormal.set(0, 0, 1).applyQuaternion(portal.mesh.getWorldQuaternion(tmpQuat)).normalize();

        const prevSide = tmpNormal.dot(tmpPrevDelta.copy(prevPos).sub(tmpWorldPos));
        const curSide = tmpNormal.dot(tmpCurDelta.copy(nextPos).sub(tmpWorldPos));
        const crossedPlane =
            (prevSide > planeEps && curSide <= planeEps) ||
            (prevSide < -planeEps && curSide >= -planeEps);
        if (!crossedPlane) continue;

        const denom = prevSide - curSide;
        const t = Math.max(0, Math.min(1, Math.abs(denom) < 1e-8 ? 0 : prevSide / denom));
        tmpHitPoint.copy(prevPos).addScaledVector(tmpMoveDelta, t);
        if (isInsidePortalOpeningWithRadius(portal.mesh, tmpHitPoint, PORTAL_PROJECTILE_RADIUS)) {
            return true;
        }
    }
    return false;
}

function updatePortalProjectiles(dt) {
    for (let i = portalProjectiles.length - 1; i >= 0; i -= 1) {
        const p = portalProjectiles[i];
        p.life -= dt;
        if (p.life <= 0) {
            removePortalProjectile(i);
            continue;
        }

        tmpProjectilePos.copy(p.mesh.position);
        p.mesh.position.addScaledVector(p.velocity, dt);

        // Ignore portal-gun projectiles that hit an existing portal.
        if (didPortalProjectileHitPortal(tmpProjectilePos, p.mesh.position)) {
            removePortalProjectile(i);
            continue;
        }

        const hit = getProjectileWallHit(tmpProjectilePos, p.mesh.position);
        if (hit) {
            const placement = computePortalPlacementFromHit(p.portalRef, hit);
            if (placement) {
                spawnPortalPlacementEffect(p.portalRef, placement);
            }
            removePortalProjectile(i);
        }
    }
}

function applySurfaceFriction(velocity, normal, friction) {
    normalBuffer.copy(normal).multiplyScalar(velocity.dot(normal));
    tangentBuffer.copy(velocity).sub(normalBuffer).multiplyScalar(friction);
    velocity.copy(normalBuffer).add(tangentBuffer);
}

function tryBallPortalCrossing(ball, prevPos, dt) {
    if (ball.teleportCooldown > 0) return;

    const pos = ball.mesh.position;
    const vel = ball.velocity;
    const speed = vel.length();
    if (speed < 0.0001) return;

    if (ball.portalTransit) {
        const portal = ball.portalTransit;
        const source = portal.mesh;
        const destination = portal.destination.mesh;

        source.getWorldPosition(tmpWorldPos);
        tmpNormal.set(0, 0, 1).applyQuaternion(source.getWorldQuaternion(tmpQuat)).normalize();
        tmpMoveDelta.copy(pos).sub(prevPos);
        const prevSide = tmpNormal.dot(tmpPrevDelta.copy(prevPos).sub(tmpWorldPos));
        const curSide = tmpNormal.dot(tmpCurDelta.copy(pos).sub(tmpWorldPos));
        const crossedCenterPlane = prevSide * curSide <= 0 || Math.abs(curSide) <= 0.001;

        if (
            crossedCenterPlane &&
            isInsidePortalOpening(source, pos)
        ) {
            const denom = prevSide - curSide;
            const t = Math.max(0, Math.min(1, Math.abs(denom) < 1e-8 ? 0 : prevSide / denom));
            tmpHitPoint.copy(prevPos).addScaledVector(tmpMoveDelta, t);

            teleportMat
                .copy(destination.matrixWorld)
                .multiply(teleportRot)
                .multiply(sourceInverse.copy(source.matrixWorld).invert());

            tmpHitPoint.applyMatrix4(teleportMat);
            tmpRemainingMove.copy(tmpMoveDelta).multiplyScalar(1 - t);
            const remainingLen = tmpRemainingMove.length();
            if (remainingLen > 1e-8) {
                transformedDir.copy(tmpRemainingMove).normalize().transformDirection(teleportMat);
                tmpRemainingMove.copy(transformedDir).multiplyScalar(remainingLen);
            } else {
                tmpRemainingMove.set(0, 0, 0);
            }

            transformedDir.copy(vel).normalize().transformDirection(teleportMat);
            vel.copy(transformedDir).multiplyScalar(speed);
            pos.copy(tmpHitPoint).add(tmpRemainingMove).addScaledVector(transformedDir, 0.02);

            ball.portalTransit = null;
            ball.portalTransitTime = 0;
            ball.teleportCooldown = BALL_PORTAL_COOLDOWN;
        } else {
            ball.portalTransitTime += dt;
            const stillNearPortal =
                Math.abs(curSide) <= BALL_PORTAL_CONTACT_DISTANCE * 2 &&
                isInsidePortalOpeningWithRadius(source, pos, BALL_PORTAL_CONTACT_DISTANCE * 1.4);
            if (!stillNearPortal || ball.portalTransitTime > BALL_PORTAL_TRANSIT_MAX_TIME) {
                ball.portalTransit = null;
                ball.portalTransitTime = 0;
            }
        }
        return;
    }

    for (const portal of currentWorld.portals) {
        const source = portal.mesh;

        source.getWorldPosition(tmpWorldPos);
        tmpNormal.set(0, 0, 1).applyQuaternion(source.getWorldQuaternion(tmpQuat)).normalize();

        tmpMoveDelta.copy(pos).sub(prevPos);
        const prevSide = tmpNormal.dot(tmpPrevDelta.copy(prevPos).sub(tmpWorldPos));
        const curSide = tmpNormal.dot(tmpCurDelta.copy(pos).sub(tmpWorldPos));
        const movementTowardPlane = tmpMoveDelta.dot(tmpNormal);

        const closestSideDistance = Math.min(Math.abs(prevSide), Math.abs(curSide));
        const movingTowardPortalFace = movementTowardPlane * portal.entrySign < 0;
        const withinTeleportDistance = closestSideDistance <= BALL_PORTAL_CONTACT_DISTANCE;
        const enteredFromFront = movingTowardPortalFace;
        if (withinTeleportDistance && enteredFromFront) {
            const t = THREE.MathUtils.clamp(
                (Math.abs(prevSide) + 1e-8) / (Math.abs(prevSide) + Math.abs(curSide) + 1e-8),
                0,
                1
            );
            tmpHitPoint.copy(prevPos).addScaledVector(tmpMoveDelta, t);
            if (!isInsidePortalOpeningWithRadius(source, tmpHitPoint, BALL_PORTAL_CONTACT_DISTANCE)) {
                continue;
            }
            ball.portalTransit = portal;
            ball.portalTransitTime = 0;
            break;
        }
    }
}

function updateBallPhysics(dt) {
    for (const ball of balls) {
        const pos = ball.mesh.position;
        const vel = ball.velocity;
        ballPrevPos.copy(pos);

        if (ball.teleportCooldown > 0) {
            ball.teleportCooldown -= dt;
        }

        vel.y += BALL_GRAVITY * dt;
        vel.multiplyScalar(BALL_AIR_DRAG);
        pos.addScaledVector(vel, dt);

        if (enemyAlive) {
            // Enemy hit for balls uses a separate sphere collider.
            delta.copy(pos).sub(orbEntity.position);
            const hitDist = BALL_RADIUS + enemyBallHitRadius;
            const distSqEnemy = delta.lengthSq();
            if (distSqEnemy > 1e-8 && distSqEnemy < hitDist * hitDist) {
                const distEnemy = Math.sqrt(distSqEnemy);
                pairNormal.copy(delta).multiplyScalar(1 / distEnemy);
                const penetration = hitDist - distEnemy;
                pos.addScaledVector(pairNormal, penetration + 0.001);

                const speedAlong = vel.dot(pairNormal);
                if (speedAlong < 0) {
                    vel.addScaledVector(pairNormal, -(1.25 * speedAlong));
                }
                const hitStrength = Math.max(0, -speedAlong);
                orbEntity.position.addScaledVector(pairNormal, -ENEMY_IMMEDIATE_PUSH);
                enemyVelocity.addScaledVector(pairNormal, -hitStrength * ENEMY_KNOCKBACK_SCALE);
                enemyDamageTimer = ENEMY_DAMAGE_DURATION;
                triggerEnemyDamage(ENEMY_BALL_DAMAGE);
            }
        }

        for (let ei = extraEnemies.length - 1; ei >= 0; ei -= 1) {
            const e = extraEnemies[ei];
            if (!e.alive) continue;
            delta.copy(pos).sub(e.entity.position);
            const hitDist = BALL_RADIUS + enemyBallHitRadius;
            const distSqEnemy = delta.lengthSq();
            if (distSqEnemy <= 1e-8 || distSqEnemy >= hitDist * hitDist) continue;
            const distEnemy = Math.sqrt(distSqEnemy);
            pairNormal.copy(delta).multiplyScalar(1 / distEnemy);
            const penetration = hitDist - distEnemy;
            pos.addScaledVector(pairNormal, penetration + 0.001);
            const speedAlong = vel.dot(pairNormal);
            if (speedAlong < 0) {
                vel.addScaledVector(pairNormal, -(1.25 * speedAlong));
            }
            const hitStrength = Math.max(0, -speedAlong);
            e.entity.position.addScaledVector(pairNormal, -ENEMY_IMMEDIATE_PUSH);
            e.velocity.addScaledVector(pairNormal, -hitStrength * ENEMY_KNOCKBACK_SCALE);
            triggerExtraEnemyDamage(e, ENEMY_BALL_DAMAGE);
            break;
        }

        // Teleport when ball center crosses a portal plane.
        tryBallPortalCrossing(ball, ballPrevPos, dt);
        const inPortalTransit = Boolean(ball.portalTransit);

        if (!inPortalTransit) {
            // Floor / ceiling collisions
            if (pos.y < BALL_RADIUS) {
                pos.y = BALL_RADIUS;
                if (vel.y < 0) vel.y = -vel.y * BALL_BOUNCE;
                applySurfaceFriction(vel, new THREE.Vector3(0, 1, 0), BALL_FRICTION);
            } else if (pos.y > ROOM_HEIGHT - BALL_RADIUS) {
                pos.y = ROOM_HEIGHT - BALL_RADIUS;
                if (vel.y > 0) vel.y = -vel.y * BALL_BOUNCE;
                applySurfaceFriction(vel, new THREE.Vector3(0, -1, 0), BALL_FRICTION);
            }

            // Outer room bounds
            if (pos.x < -WORLD_HALF_X + BALL_RADIUS) {
                const throughPortal = isPointInsidePortalWallHole(
                    pos,
                    BALL_RADIUS,
                    "x",
                    -WORLD_HALF_X
                );
                if (!throughPortal) {
                    pos.x = -WORLD_HALF_X + BALL_RADIUS;
                    if (vel.x < 0) vel.x = -vel.x * BALL_BOUNCE;
                    applySurfaceFriction(vel, new THREE.Vector3(1, 0, 0), BALL_FRICTION);
                }
            } else if (pos.x > WORLD_HALF_X - BALL_RADIUS) {
                if (!isPointInsidePortalWallHole(pos, BALL_RADIUS, "x", WORLD_HALF_X)) {
                    pos.x = WORLD_HALF_X - BALL_RADIUS;
                    if (vel.x > 0) vel.x = -vel.x * BALL_BOUNCE;
                    applySurfaceFriction(vel, new THREE.Vector3(-1, 0, 0), BALL_FRICTION);
                }
            }

            if (pos.z < -WORLD_HALF_Z + BALL_RADIUS) {
                if (!isPointInsidePortalWallHole(pos, BALL_RADIUS, "z", -WORLD_HALF_Z)) {
                    pos.z = -WORLD_HALF_Z + BALL_RADIUS;
                    if (vel.z < 0) vel.z = -vel.z * BALL_BOUNCE;
                    applySurfaceFriction(vel, new THREE.Vector3(0, 0, 1), BALL_FRICTION);
                }
            } else if (pos.z > WORLD_HALF_Z - BALL_RADIUS) {
                if (!isPointInsidePortalWallHole(pos, BALL_RADIUS, "z", WORLD_HALF_Z)) {
                    pos.z = WORLD_HALF_Z - BALL_RADIUS;
                    if (vel.z > 0) vel.z = -vel.z * BALL_BOUNCE;
                    applySurfaceFriction(vel, new THREE.Vector3(0, 0, -1), BALL_FRICTION);
                }
            }

            // Middle wall with door opening.
            const inMiddleX = Math.abs(pos.x) < MIDDLE_WALL_HALF_THICKNESS + BALL_RADIUS;
            const inDoorGapZ = Math.abs(pos.z) < DOOR_WIDTH * 0.5 - BALL_RADIUS;
            const belowDoorTop = pos.y < DOOR_HEIGHT - BALL_RADIUS;
            const blockedByWall = !inDoorGapZ || !belowDoorTop;

            if (inMiddleX && blockedByWall) {
                const middleCoord = pos.x >= 0
                    ? MIDDLE_WALL_HALF_THICKNESS
                    : -MIDDLE_WALL_HALF_THICKNESS;
                if (!isPointInsidePortalWallHole(pos, BALL_RADIUS, "x", middleCoord)) {
                    const pushRight = pos.x >= 0;
                    pos.x = (pushRight ? 1 : -1) * (MIDDLE_WALL_HALF_THICKNESS + BALL_RADIUS);
                    if (pushRight && vel.x < 0) vel.x = -vel.x * BALL_BOUNCE;
                    if (!pushRight && vel.x > 0) vel.x = -vel.x * BALL_BOUNCE;
                    applySurfaceFriction(
                        vel,
                        new THREE.Vector3(pushRight ? 1 : -1, 0, 0),
                        BALL_FRICTION
                    );
                }
            }
        }
    }

    // Ball-ball collisions
    for (let i = 0; i < balls.length; i += 1) {
        for (let j = i + 1; j < balls.length; j += 1) {
            const a = balls[i];
            const b = balls[j];
            const aPos = a.mesh.position;
            const bPos = b.mesh.position;

            delta.copy(bPos).sub(aPos);
            const distSq = delta.lengthSq();
            const minDist = BALL_RADIUS * 2;
            if (distSq <= 1e-8 || distSq > minDist * minDist) continue;

            const dist = Math.sqrt(distSq);
            pairNormal.copy(delta).multiplyScalar(1 / dist);
            const overlap = minDist - dist;

            // Separate spheres equally
            aPos.addScaledVector(pairNormal, -overlap * 0.5);
            bPos.addScaledVector(pairNormal, overlap * 0.5);

            relVel.copy(b.velocity).sub(a.velocity);
            const relAlongNormal = relVel.dot(pairNormal);
            if (relAlongNormal > 0) continue;

            const jImpulse = -(1 + BALL_RESTITUTION) * relAlongNormal / 2;
            impulse.copy(pairNormal).multiplyScalar(jImpulse);
            a.velocity.addScaledVector(impulse, -1);
            b.velocity.add(impulse);

            // Tangential damping (simple collision friction)
            applySurfaceFriction(a.velocity, pairNormal, BALL_FRICTION);
            applySurfaceFriction(b.velocity, pairNormal, BALL_FRICTION);
        }
    }

    for (const ball of balls) {
        const pos = ball.mesh.position;
        const h01 = THREE.MathUtils.clamp((pos.y - BALL_RADIUS) / BALL_SHADOW_FADE_HEIGHT, 0, 1);
        const alpha = BALL_SHADOW_MAX_OPACITY * (1 - h01);
        const radius = BALL_SHADOW_RADIUS * (1 + h01 * 0.45);
        ball.shadow.position.set(pos.x, BALL_SHADOW_Y, pos.z);
        ball.shadow.scale.set(radius, radius, 1);
        ball.shadow.material.opacity = alpha;
        ball.shadow.visible = alpha > 0.01;
    }
}

function isInsidePortalOpening(portalMesh, worldPos) {
    tmpLocalPos.copy(worldPos);
    portalMesh.worldToLocal(tmpLocalPos);
    return (
        Math.abs(tmpLocalPos.x) <= PORTAL_HALF_WIDTH &&
        Math.abs(tmpLocalPos.y) <= PORTAL_HALF_HEIGHT
    );
}

function isPointInsidePortalWallHole(worldPos, radius, axis, wallCoord) {
    const wallCoordTolerance = 0.35;
    const normalAxisThreshold = 0.85;
    const planeDepthTolerance = radius + 0.25;

    for (const portal of currentWorld.portals) {
        portal.mesh.getWorldPosition(tmpWorldPos);
        tmpNormal.set(0, 0, 1).applyQuaternion(portal.mesh.getWorldQuaternion(tmpQuat)).normalize();

        if (Math.abs(tmpWorldPos[axis] - wallCoord) > wallCoordTolerance) continue;
        if (Math.abs(tmpNormal[axis]) < normalAxisThreshold) continue;

        tmpLocalPos.copy(worldPos);
        portal.mesh.worldToLocal(tmpLocalPos);
        if (
            Math.abs(tmpLocalPos.z) <= planeDepthTolerance &&
            Math.abs(tmpLocalPos.x) <= PORTAL_HALF_WIDTH + radius &&
            Math.abs(tmpLocalPos.y) <= PORTAL_HALF_HEIGHT + radius
        ) {
            return true;
        }
    }
    return false;
}

function wouldPassThroughPortalWallHole(prevPos, curPos, radius, axis, wallCoord) {
    const wallCoordTolerance = 0.35;
    const normalAxisThreshold = 0.85;
    const denomEps = 1e-8;
    for (const portal of currentWorld.portals) {
        portal.mesh.getWorldPosition(tmpWorldPos);
        tmpNormal.set(0, 0, 1).applyQuaternion(portal.mesh.getWorldQuaternion(tmpQuat)).normalize();
        if (Math.abs(tmpWorldPos[axis] - wallCoord) > wallCoordTolerance) continue;
        if (Math.abs(tmpNormal[axis]) < normalAxisThreshold) continue;

        const prevSide = tmpNormal.dot(tmpPrevDelta.copy(prevPos).sub(tmpWorldPos));
        const curSide = tmpNormal.dot(tmpCurDelta.copy(curPos).sub(tmpWorldPos));
        if (prevSide * curSide > 0) continue;
        const denom = prevSide - curSide;
        const t = THREE.MathUtils.clamp(
            Math.abs(denom) < denomEps ? 0.5 : prevSide / denom,
            0,
            1
        );
        tmpHitPoint.copy(prevPos).lerp(curPos, t);
        if (isInsidePortalOpeningWithRadius(portal.mesh, tmpHitPoint, radius)) return true;
    }
    return false;
}

function isOverHorizontalPortalHole(worldPos) {
    for (const portal of currentWorld.portals) {
        portal.mesh.getWorldPosition(tmpWorldPos);
        tmpNormal.set(0, 0, 1).applyQuaternion(portal.mesh.getWorldQuaternion(tmpQuat)).normalize();

        // Only portals facing upward act as floor holes.
        if (tmpNormal.y < 0.75) continue;

        // Player must be on the portal's front side (above it).
        if (tmpNormal.dot(sideToPlayer.copy(worldPos).sub(tmpWorldPos)) < 0) continue;

        // Project player XZ to portal plane level for footprint test.
        tmpLocalPos.set(worldPos.x, tmpWorldPos.y, worldPos.z);
        portal.mesh.worldToLocal(tmpLocalPos);
        if (
            Math.abs(tmpLocalPos.x) <= PORTAL_HALF_WIDTH &&
            Math.abs(tmpLocalPos.y) <= PORTAL_HALF_HEIGHT
        ) {
            return true;
        }
    }
    return false;
}

function wouldPassThroughHorizontalPortalHole(prevPos, curPos) {
    const denomEps = 1e-8;
    for (const portal of currentWorld.portals) {
        portal.mesh.getWorldPosition(tmpWorldPos);
        tmpNormal.set(0, 0, 1).applyQuaternion(portal.mesh.getWorldQuaternion(tmpQuat)).normalize();

        // Only upward-facing (floor-like) portals create floor holes.
        if (tmpNormal.y < 0.75) continue;

        const prevSide = tmpNormal.dot(tmpPrevDelta.copy(prevPos).sub(tmpWorldPos));
        const curSide = tmpNormal.dot(tmpCurDelta.copy(curPos).sub(tmpWorldPos));
        if (prevSide * curSide > 0) continue;

        const denom = prevSide - curSide;
        const t = THREE.MathUtils.clamp(
            Math.abs(denom) < denomEps ? 0.5 : prevSide / denom,
            0,
            1
        );
        tmpHitPoint.copy(prevPos).lerp(curPos, t);
        if (isInsidePortalOpening(portal.mesh, tmpHitPoint)) return true;
    }
    return false;
}

function isInsidePortalOpeningWithRadius(portalMesh, worldPos, radius) {
    tmpLocalPos.copy(worldPos);
    portalMesh.worldToLocal(tmpLocalPos);
    return (
        Math.abs(tmpLocalPos.x) <= PORTAL_HALF_WIDTH + radius &&
        Math.abs(tmpLocalPos.y) <= PORTAL_HALF_HEIGHT + radius
    );
}

function tryPortalCrossing(prevCenter, curCenter, dt) {
    if (teleportCooldown > 0) return;
    const planeEps = 0.02;
    const sphereRadius = camera.near;
    for (const portal of currentWorld.portals) {
        const source = portal.mesh;
        const destination = portal.destination.mesh;

        source.getWorldPosition(tmpWorldPos);
        tmpNormal.set(0, 0, 1).applyQuaternion(source.getWorldQuaternion(tmpQuat)).normalize();

        const prevSide = tmpNormal.dot(tmpPrevDelta.copy(prevCenter).sub(tmpWorldPos));
        const curSide = tmpNormal.dot(tmpCurDelta.copy(curCenter).sub(tmpWorldPos));
        const movementTowardPlane = tmpMoveDelta.copy(curCenter).sub(prevCenter).dot(tmpNormal);

        const crossedPlane =
            (prevSide > sphereRadius + planeEps && curSide <= sphereRadius + planeEps) ||
            (prevSide < -(sphereRadius + planeEps) && curSide >= -(sphereRadius + planeEps));
        const enteredFromFront = movementTowardPlane * portal.entrySign < 0;

        if (crossedPlane && enteredFromFront) {
            // Use swept center-plane intersection for high-speed portal crossing robustness.
            const denom = prevSide - curSide;
            const t = THREE.MathUtils.clamp(
                Math.abs(denom) < 1e-8 ? 0.5 : prevSide / denom,
                0,
                1
            );
            tmpHitPoint.copy(prevCenter).lerp(curCenter, t);
            if (!isInsidePortalOpeningWithRadius(source, tmpHitPoint, sphereRadius)) {
                continue;
            }
            // Preserve player speed relative to portal orientation.
            playerMoveDelta.copy(curCenter).sub(prevCenter);
            const moveLen = playerMoveDelta.length();

            teleportMat
                .copy(destination.matrixWorld)
                .multiply(teleportRot)
                .multiply(sourceInverse.copy(source.matrixWorld).invert());
            playerYaw.position.applyMatrix4(teleportMat);

            // Transform camera direction through the same portal transform as speed.
            playerLookDir
                .set(0, 0, -1)
                .applyAxisAngle(axisX, playerPitch.rotation.x)
                .applyAxisAngle(axisY, playerYaw.rotation.y)
                .normalize();
            playerUpDir
                .set(0, 1, 0)
                .applyAxisAngle(axisX, playerPitch.rotation.x)
                .applyAxisAngle(axisY, playerYaw.rotation.y)
                .applyAxisAngle(playerLookDir, playerRoll)
                .normalize();
            transformedLookDir.copy(playerLookDir).transformDirection(teleportMat).normalize();
            transformedUpDir.copy(playerUpDir).transformDirection(teleportMat).normalize();
            playerYaw.rotation.y = Math.atan2(-transformedLookDir.x, -transformedLookDir.z);
            playerPitch.rotation.x = Math.asin(
                THREE.MathUtils.clamp(transformedLookDir.y, -0.999, 0.999)
            );
            baseUpAfterTeleport
                .set(0, 1, 0)
                .applyAxisAngle(axisX, playerPitch.rotation.x)
                .applyAxisAngle(axisY, playerYaw.rotation.y)
                .normalize();
            projectedBaseUp.copy(baseUpAfterTeleport).addScaledVector(
                transformedLookDir,
                -baseUpAfterTeleport.dot(transformedLookDir)
            );
            projectedTransformedUp.copy(transformedUpDir).addScaledVector(
                transformedLookDir,
                -transformedUpDir.dot(transformedLookDir)
            );
            if (projectedBaseUp.lengthSq() > 1e-8 && projectedTransformedUp.lengthSq() > 1e-8) {
                projectedBaseUp.normalize();
                projectedTransformedUp.normalize();
                rollCross.crossVectors(projectedTransformedUp, projectedBaseUp);
                playerRoll = Math.atan2(
                    transformedLookDir.dot(rollCross),
                    THREE.MathUtils.clamp(
                        projectedBaseUp.dot(projectedTransformedUp),
                        -1,
                        1
                    )
                );
            } else {
                playerRoll = 0;
            }
            camera.rotation.z = playerRoll;

            if (moveLen > 1e-6 && dt > 1e-6) {
                transformedPlayerMove.copy(playerMoveDelta).normalize().transformDirection(teleportMat);
                transformedPlayerMove.multiplyScalar(moveLen / dt);
                playerCarryVelocity.set(transformedPlayerMove.x, 0, transformedPlayerMove.z);
                verticalVelocity = THREE.MathUtils.clamp(
                    transformedPlayerMove.y,
                    -MAX_PLAYER_VERTICAL_SPEED,
                    MAX_PLAYER_VERTICAL_SPEED
                );
            }

            teleportCooldown = 0.2;
            break;
        }
    }
}

function resolvePlayerMiddleWallCollision(prevPos) {
    const pos = playerYaw.position;
    const inMiddleX = Math.abs(pos.x) < MIDDLE_WALL_HALF_THICKNESS + PLAYER_RADIUS;
    if (!inMiddleX) return;

    // Door opening is passable only below door top and within door width.
    const inDoorGapZ = Math.abs(pos.z) < DOOR_WIDTH * 0.5 - PLAYER_RADIUS;
    const belowDoorTop = pos.y < DOOR_HEIGHT - PLAYER_RADIUS;
    if (inDoorGapZ && belowDoorTop) return;

    // If entering a portal hole on middle wall, do not block.
    const middleCoord = pos.x >= 0 ? MIDDLE_WALL_HALF_THICKNESS : -MIDDLE_WALL_HALF_THICKNESS;
    if (
        isPointInsidePortalWallHole(pos, PLAYER_RADIUS, "x", middleCoord) ||
        wouldPassThroughPortalWallHole(prevPos, pos, PLAYER_RADIUS, "x", middleCoord)
    ) return;

    const pushRight = pos.x >= 0;
    pos.x = (pushRight ? 1 : -1) * (MIDDLE_WALL_HALF_THICKNESS + PLAYER_RADIUS);
    playerCarryVelocity.x = 0;
}

function resolveEnemyWallCollision(desiredDir, dt) {
    const pos = orbEntity.position;

    if (
        pos.x < -WORLD_HALF_X + enemyHalfSize.x &&
        !isPointInsidePortalWallHole(pos, enemyHalfSize.x, "x", -WORLD_HALF_X)
    ) {
        pos.x = -WORLD_HALF_X + enemyHalfSize.x;
        enemyVelocity.x = 0;
        if (desiredDir && Math.abs(desiredDir.z) > 0.01) {
            enemyVelocity.z += desiredDir.z * ENEMY_FOLLOW_ACCEL * 0.7 * dt;
        }
    } else if (
        pos.x > WORLD_HALF_X - enemyHalfSize.x &&
        !isPointInsidePortalWallHole(pos, enemyHalfSize.x, "x", WORLD_HALF_X)
    ) {
        pos.x = WORLD_HALF_X - enemyHalfSize.x;
        enemyVelocity.x = 0;
        if (desiredDir && Math.abs(desiredDir.z) > 0.01) {
            enemyVelocity.z += desiredDir.z * ENEMY_FOLLOW_ACCEL * 0.7 * dt;
        }
    }

    if (
        pos.z < -WORLD_HALF_Z + enemyHalfSize.z &&
        !isPointInsidePortalWallHole(pos, enemyHalfSize.z, "z", -WORLD_HALF_Z)
    ) {
        pos.z = -WORLD_HALF_Z + enemyHalfSize.z;
        enemyVelocity.z = 0;
        if (desiredDir && Math.abs(desiredDir.x) > 0.01) {
            enemyVelocity.x += desiredDir.x * ENEMY_FOLLOW_ACCEL * 0.7 * dt;
        }
    } else if (
        pos.z > WORLD_HALF_Z - enemyHalfSize.z &&
        !isPointInsidePortalWallHole(pos, enemyHalfSize.z, "z", WORLD_HALF_Z)
    ) {
        pos.z = WORLD_HALF_Z - enemyHalfSize.z;
        enemyVelocity.z = 0;
        if (desiredDir && Math.abs(desiredDir.x) > 0.01) {
            enemyVelocity.x += desiredDir.x * ENEMY_FOLLOW_ACCEL * 0.7 * dt;
        }
    }

    const inMiddleX = Math.abs(pos.x) < MIDDLE_WALL_HALF_THICKNESS + enemyHalfSize.x;
    const inDoorGapZ = Math.abs(pos.z) < DOOR_WIDTH * 0.5 - enemyHalfSize.z;
    const belowDoorTop = pos.y < DOOR_HEIGHT - enemyHalfSize.y;
    const blockedByWall = !inDoorGapZ || !belowDoorTop;
    if (inMiddleX && blockedByWall) {
        const middleCoord = pos.x >= 0
            ? MIDDLE_WALL_HALF_THICKNESS
            : -MIDDLE_WALL_HALF_THICKNESS;
        if (!isPointInsidePortalWallHole(pos, enemyHalfSize.x, "x", middleCoord)) {
            const pushRight = pos.x >= 0;
            pos.x = (pushRight ? 1 : -1) * (MIDDLE_WALL_HALF_THICKNESS + enemyHalfSize.x);
            enemyVelocity.x = 0;
            if (desiredDir && Math.abs(desiredDir.z) > 0.01) {
                enemyVelocity.z += desiredDir.z * ENEMY_FOLLOW_ACCEL * 0.9 * dt;
            }
        }
    }
}

function resolveExtraEnemyWallCollision(enemy, desiredDir, dt) {
    const pos = enemy.entity.position;
    if (
        pos.x < -WORLD_HALF_X + enemyHalfSize.x &&
        !isPointInsidePortalWallHole(pos, enemyHalfSize.x, "x", -WORLD_HALF_X)
    ) {
        pos.x = -WORLD_HALF_X + enemyHalfSize.x;
        enemy.velocity.x = 0;
        if (desiredDir && Math.abs(desiredDir.z) > 0.01) {
            enemy.velocity.z += desiredDir.z * ENEMY_FOLLOW_ACCEL * 0.7 * dt;
        }
    } else if (
        pos.x > WORLD_HALF_X - enemyHalfSize.x &&
        !isPointInsidePortalWallHole(pos, enemyHalfSize.x, "x", WORLD_HALF_X)
    ) {
        pos.x = WORLD_HALF_X - enemyHalfSize.x;
        enemy.velocity.x = 0;
        if (desiredDir && Math.abs(desiredDir.z) > 0.01) {
            enemy.velocity.z += desiredDir.z * ENEMY_FOLLOW_ACCEL * 0.7 * dt;
        }
    }
    if (
        pos.z < -WORLD_HALF_Z + enemyHalfSize.z &&
        !isPointInsidePortalWallHole(pos, enemyHalfSize.z, "z", -WORLD_HALF_Z)
    ) {
        pos.z = -WORLD_HALF_Z + enemyHalfSize.z;
        enemy.velocity.z = 0;
        if (desiredDir && Math.abs(desiredDir.x) > 0.01) {
            enemy.velocity.x += desiredDir.x * ENEMY_FOLLOW_ACCEL * 0.7 * dt;
        }
    } else if (
        pos.z > WORLD_HALF_Z - enemyHalfSize.z &&
        !isPointInsidePortalWallHole(pos, enemyHalfSize.z, "z", WORLD_HALF_Z)
    ) {
        pos.z = WORLD_HALF_Z - enemyHalfSize.z;
        enemy.velocity.z = 0;
        if (desiredDir && Math.abs(desiredDir.x) > 0.01) {
            enemy.velocity.x += desiredDir.x * ENEMY_FOLLOW_ACCEL * 0.7 * dt;
        }
    }
    const inMiddleX = Math.abs(pos.x) < MIDDLE_WALL_HALF_THICKNESS + enemyHalfSize.x;
    const inDoorGapZ = Math.abs(pos.z) < DOOR_WIDTH * 0.5 - enemyHalfSize.z;
    const belowDoorTop = pos.y < DOOR_HEIGHT - enemyHalfSize.y;
    const blockedByWall = !inDoorGapZ || !belowDoorTop;
    if (inMiddleX && blockedByWall) {
        const middleCoord = pos.x >= 0 ? MIDDLE_WALL_HALF_THICKNESS : -MIDDLE_WALL_HALF_THICKNESS;
        if (!isPointInsidePortalWallHole(pos, enemyHalfSize.x, "x", middleCoord)) {
            const pushRight = pos.x >= 0;
            pos.x = (pushRight ? 1 : -1) * (MIDDLE_WALL_HALF_THICKNESS + enemyHalfSize.x);
            enemy.velocity.x = 0;
            if (desiredDir && Math.abs(desiredDir.z) > 0.01) {
                enemy.velocity.z += desiredDir.z * ENEMY_FOLLOW_ACCEL * 0.9 * dt;
            }
        }
    }
}

function animate() {
    frameCounter += 1;
    const dt = Math.min(clock.getDelta(), 0.033);
    if (gameState !== GAME_STATE_PLAYING) {
        camera.updateMatrixWorld(true);
        updatePortalTextures();
        renderer.render(currentWorld.scene, camera);
        minimapUpdateTimer += dt;
        if (minimapUpdateTimer >= MINIMAP_UPDATE_INTERVAL) {
            drawMinimap();
            minimapUpdateTimer = 0;
        }
        drawWeaponIndicator();
        drawBallReserveHud();
        drawPlayerHealthHud();
        return;
    }
    const previousPos = playerYaw.position.clone();

    const arrowScale = 0.1;
    const inputX =
        (moveState.right ? 1 : 0) -
        (moveState.left ? 1 : 0) +
        arrowScale * ((slowArrowState.right ? 1 : 0) - (slowArrowState.left ? 1 : 0));
    const inputZ =
        (moveState.backward ? 1 : 0) -
        (moveState.forward ? 1 : 0) +
        arrowScale * ((slowArrowState.down ? 1 : 0) - (slowArrowState.up ? 1 : 0));
    if (inputX !== 0 || inputZ !== 0) {
        const moveDir = new THREE.Vector3(inputX, 0, inputZ);
        if (moveDir.lengthSq() > 1) moveDir.normalize();
        moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw.rotation.y);
        playerYaw.position.addScaledVector(moveDir, MOVE_SPEED * dt);
    }

    // Carry preserved velocity from teleports (e.g. falling into floor portal exits horizontally).
    const carrySpeed = Math.hypot(playerCarryVelocity.x, playerCarryVelocity.z);
    if (carrySpeed > MAX_PLAYER_HORIZONTAL_SPEED) {
        const s = MAX_PLAYER_HORIZONTAL_SPEED / carrySpeed;
        playerCarryVelocity.x *= s;
        playerCarryVelocity.z *= s;
    }
    playerYaw.position.x += playerCarryVelocity.x * dt;
    playerYaw.position.z += playerCarryVelocity.z * dt;

    verticalVelocity += GRAVITY * dt;
    verticalVelocity = THREE.MathUtils.clamp(
        verticalVelocity,
        -MAX_PLAYER_VERTICAL_SPEED,
        MAX_PLAYER_VERTICAL_SPEED
    );
    playerYaw.position.y += verticalVelocity * dt;
    const overFloorPortalHole = isOverHorizontalPortalHole(playerYaw.position);
    const passingThroughFloorPortal = wouldPassThroughHorizontalPortalHole(previousPos, playerYaw.position);
    if (playerYaw.position.y <= EYE_HEIGHT && !overFloorPortalHole && !passingThroughFloorPortal) {
        playerYaw.position.y = EYE_HEIGHT;
        verticalVelocity = 0;
        onGround = true;
        playerCarryVelocity.multiplyScalar(0.85);
    } else {
        onGround = false;
    }

    if (
        playerYaw.position.x < -WORLD_HALF_X &&
        !isPointInsidePortalWallHole(playerYaw.position, PLAYER_RADIUS, "x", -WORLD_HALF_X) &&
        !wouldPassThroughPortalWallHole(previousPos, playerYaw.position, PLAYER_RADIUS, "x", -WORLD_HALF_X)
    ) {
        playerYaw.position.x = -WORLD_HALF_X;
        playerCarryVelocity.x = 0;
    } else if (
        playerYaw.position.x > WORLD_HALF_X &&
        !isPointInsidePortalWallHole(playerYaw.position, PLAYER_RADIUS, "x", WORLD_HALF_X) &&
        !wouldPassThroughPortalWallHole(previousPos, playerYaw.position, PLAYER_RADIUS, "x", WORLD_HALF_X)
    ) {
        playerYaw.position.x = WORLD_HALF_X;
        playerCarryVelocity.x = 0;
    }

    if (
        playerYaw.position.z < -WORLD_HALF_Z &&
        !isPointInsidePortalWallHole(playerYaw.position, PLAYER_RADIUS, "z", -WORLD_HALF_Z) &&
        !wouldPassThroughPortalWallHole(previousPos, playerYaw.position, PLAYER_RADIUS, "z", -WORLD_HALF_Z)
    ) {
        playerYaw.position.z = -WORLD_HALF_Z;
        playerCarryVelocity.z = 0;
    } else if (
        playerYaw.position.z > WORLD_HALF_Z &&
        !isPointInsidePortalWallHole(playerYaw.position, PLAYER_RADIUS, "z", WORLD_HALF_Z) &&
        !wouldPassThroughPortalWallHole(previousPos, playerYaw.position, PLAYER_RADIUS, "z", WORLD_HALF_Z)
    ) {
        playerYaw.position.z = WORLD_HALF_Z;
        playerCarryVelocity.z = 0;
    }
    resolvePlayerMiddleWallCollision(previousPos);

    // Teleport when a virtual sphere (radius = camera.near) around the camera touches portal.
    tryPortalCrossing(previousPos, playerYaw.position, dt);
    if (teleportCooldown > 0) teleportCooldown -= dt;

    // Quickly re-level camera roll back to world-up orientation.
    if (Math.abs(playerRoll) > 1e-6) {
        const maxStep = CAMERA_AUTO_LEVEL_SPEED * dt;
        if (Math.abs(playerRoll) <= maxStep) {
            playerRoll = 0;
        } else {
            playerRoll -= Math.sign(playerRoll) * maxStep;
        }
        camera.rotation.z = playerRoll;
    }
    if (playerShakeTimer > 0) {
        playerShakeTimer = Math.max(0, playerShakeTimer - dt);
        const shake01 = playerShakeTimer / PLAYER_SHAKE_DURATION;
        const amp = PLAYER_SHAKE_STRENGTH * shake01;
        camera.position.x = (Math.random() * 2 - 1) * amp;
        camera.position.y = (Math.random() * 2 - 1) * amp;
    } else {
        camera.position.x = 0;
        camera.position.y = 0;
    }

    updateBallPhysics(dt);
    updatePortalProjectiles(dt);
    if (currentGameMode === GAME_MODE_BATTLE) {
        updateEnemyProjectiles(dt);
    }
    if (playerHealth <= 0) {
        showGameOverMenu();
        return;
    }
    if (currentGameMode === GAME_MODE_BATTLE) {
        enemySpawnTimer += dt;
        while (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL) {
            enemySpawnTimer -= ENEMY_SPAWN_INTERVAL;
            spawnExtraEnemy();
        }
    }
    updatePortalPlacementEffects(dt);
    if (ballReserve < BALL_RESERVE_MAX) {
        ballReserveRegenTimer += dt;
        while (ballReserveRegenTimer >= BALL_RESERVE_REGEN_SECONDS && ballReserve < BALL_RESERVE_MAX) {
            ballReserveRegenTimer -= BALL_RESERVE_REGEN_SECONDS;
            ballReserve += 1;
        }
    } else {
        ballReserveRegenTimer = BALL_RESERVE_REGEN_SECONDS;
    }

    playerYaw.updateMatrixWorld(true);
    world.scene.updateMatrixWorld(true);

    if (currentGameMode === GAME_MODE_BATTLE && enemyAlive) {
        orbRingXYPivot.rotation.x += 0.02;
        orbRingXZPivot.rotation.z += 0.018;
        orbRingYZPivot.rotation.y += 0.022;
    }
    if (currentGameMode === GAME_MODE_BATTLE && enemyAlive) {
        const playerDistanceNow = orbEntity.position.distanceTo(playerYaw.position);
        enemyShootCooldown = Math.max(0, enemyShootCooldown - dt);
        if (enemyShootCooldown <= 0 && hasLineOfSightToPlayer(orbEntity.position, playerYaw.position)) {
            shootEnemyProjectile(orbEntity.position);
            enemyShootCooldown = ENEMY_PROJECTILE_COOLDOWN;
        }
        if (
            enemyPath.length === 0 ||
            clock.elapsedTime - enemyPathLastReplan >= ENEMY_PATH_REPLAN_INTERVAL
        ) {
            enemyPath = computeEnemyGridPath(orbEntity.position, playerYaw.position);
            enemyPathIndex = 0;
            enemyPathLastReplan = clock.elapsedTime;
        }

        if (playerDistanceNow > ENEMY_FOLLOW_DISTANCE && enemyPath.length > 0) {
            if (enemyPathIndex < enemyPath.length - 1) {
                enemyTarget.copy(enemyPath[enemyPathIndex]);
                enemyTarget.y = ENEMY_BASE_Y;
                if (orbEntity.position.distanceTo(enemyTarget) < ENEMY_GRID_SIZE * 0.75) {
                    enemyPathIndex += 1;
                    enemyTarget.copy(enemyPath[Math.min(enemyPathIndex, enemyPath.length - 1)]);
                    enemyTarget.y = ENEMY_BASE_Y;
                }
            } else {
                enemyTarget.copy(enemyPath[enemyPath.length - 1]);
                enemyTarget.y = ENEMY_BASE_Y;
            }

            enemyToPlayer.copy(enemyTarget).sub(orbEntity.position);
            enemyToPlayer.y = 0;
            const enemyDistance = enemyToPlayer.length();
            if (enemyDistance > 1e-6) {
                enemyPathFollowDir.copy(enemyToPlayer).multiplyScalar(1 / enemyDistance);
                enemyVelocity.addScaledVector(enemyPathFollowDir, ENEMY_FOLLOW_ACCEL * dt);
                enemyToPlayer.copy(enemyPathFollowDir);
            } else {
                enemyToPlayer.set(0, 0, 0);
            }
        } else {
            enemyToPlayer.set(0, 0, 0);
        }
        enemyNextPos.copy(orbEntity.position).addScaledVector(enemyVelocity, dt);
        enemyNextPos.y = THREE.MathUtils.lerp(enemyNextPos.y, ENEMY_BASE_Y, Math.min(1, dt * 8));
        const blockedByEnemy = wouldCollideWithAnotherEnemy(enemyNextPos, "main");
        if (!blockedByEnemy) {
            orbEntity.position.copy(enemyNextPos);
            enemyVelocity.multiplyScalar(0.9);
        } else {
            enemyVelocity.multiplyScalar(0.75);
        }
        enemyVelocity.y = 0;
        resolveEnemyWallCollision(enemyToPlayer, dt);
    } else if (currentGameMode === GAME_MODE_BATTLE) {
        updateEnemyDeath(dt);
    }
    if (currentGameMode === GAME_MODE_BATTLE) {
        const enemyHeight01 = THREE.MathUtils.clamp(
            (orbEntity.position.y - orbCoreRadius) / ENEMY_SHADOW_FADE_HEIGHT,
            0,
            1
        );
        const enemyShadowAlpha = ENEMY_SHADOW_MAX_OPACITY * (1 - enemyHeight01);
        const enemyShadowRadius = ENEMY_SHADOW_RADIUS * (1 + enemyHeight01 * 0.35);
        enemyShadow.position.set(orbEntity.position.x, ENEMY_SHADOW_Y, orbEntity.position.z);
        enemyShadow.scale.set(enemyShadowRadius, enemyShadowRadius, 1);
        enemyShadow.material.opacity = enemyShadowAlpha;
        enemyShadow.visible =
            enemyShadowAlpha > 0.01 &&
            (enemyAlive || enemyDeathTimer < ENEMY_DEATH_FALL_TIME + ENEMY_DEATH_FADE_TIME);
    } else {
        enemyShadow.visible = false;
    }

    for (let i = extraEnemies.length - 1; i >= 0; i -= 1) {
        const e = extraEnemies[i];
        if (e.alive) {
            e.ringPivots[0].rotation.x += 0.02;
            e.ringPivots[1].rotation.z += 0.018;
            e.ringPivots[2].rotation.y += 0.022;

            const playerDistanceNow = e.entity.position.distanceTo(playerYaw.position);
            e.shootCooldown = Math.max(0, e.shootCooldown - dt);
            if (e.shootCooldown <= 0 && hasLineOfSightToPlayer(e.entity.position, playerYaw.position)) {
                shootEnemyProjectile(e.entity.position);
                e.shootCooldown = ENEMY_PROJECTILE_COOLDOWN;
            }
            if (e.path.length === 0 || clock.elapsedTime - e.pathLastReplan >= ENEMY_PATH_REPLAN_INTERVAL) {
                e.path = computeEnemyGridPath(e.entity.position, playerYaw.position);
                e.pathIndex = 0;
                e.pathLastReplan = clock.elapsedTime;
            }

            if (playerDistanceNow > ENEMY_FOLLOW_DISTANCE && e.path.length > 0) {
                if (e.pathIndex < e.path.length - 1) {
                    e.target.copy(e.path[e.pathIndex]);
                    e.target.y = ENEMY_BASE_Y;
                    if (e.entity.position.distanceTo(e.target) < ENEMY_GRID_SIZE * 0.75) {
                        e.pathIndex += 1;
                        e.target.copy(e.path[Math.min(e.pathIndex, e.path.length - 1)]);
                        e.target.y = ENEMY_BASE_Y;
                    }
                } else {
                    e.target.copy(e.path[e.path.length - 1]);
                    e.target.y = ENEMY_BASE_Y;
                }
                e.followDir.copy(e.target).sub(e.entity.position);
                e.followDir.y = 0;
                const d = e.followDir.length();
                if (d > 1e-6) {
                    e.followDir.multiplyScalar(1 / d);
                    e.velocity.addScaledVector(e.followDir, ENEMY_FOLLOW_ACCEL * dt);
                } else {
                    e.followDir.set(0, 0, 0);
                }
            } else {
                e.followDir.set(0, 0, 0);
            }
            enemyNextPos.copy(e.entity.position).addScaledVector(e.velocity, dt);
            enemyNextPos.y = THREE.MathUtils.lerp(enemyNextPos.y, ENEMY_BASE_Y, Math.min(1, dt * 8));
            const blockedByEnemy = wouldCollideWithAnotherEnemy(enemyNextPos, "extra", i);
            if (!blockedByEnemy) {
                e.entity.position.copy(enemyNextPos);
                e.velocity.multiplyScalar(0.9);
            } else {
                e.velocity.multiplyScalar(0.75);
            }
            e.velocity.y = 0;
            resolveExtraEnemyWallCollision(e, e.followDir, dt);

            for (let pi = 0; pi < e.particles.length; pi += 1) {
                const p = e.particles[pi];
                const t = clock.elapsedTime + p.seed;
                const jitter = 0.75;
                p.velocity.x += (Math.sin(t * 1.7 + p.phase) * 0.018 + (Math.random() - 0.5) * 0.01) * jitter;
                p.velocity.y += (Math.cos(t * 1.3 + p.phase * 0.7) * 0.018 + (Math.random() - 0.5) * 0.01) * jitter;
                p.velocity.z += (Math.sin(t * 1.9 - p.phase * 0.5) * 0.018 + (Math.random() - 0.5) * 0.01) * jitter;
                p.velocity.multiplyScalar(0.965);
                p.mesh.position.addScaledVector(p.velocity, dt);
                const r = p.mesh.position.length();
                if (r > p.orbitMax) {
                    p.mesh.position.multiplyScalar(p.orbitMax / r);
                    p.velocity.addScaledVector(p.mesh.position, -0.12 * dt);
                } else if (r < p.orbitMin) {
                    const safeR = Math.max(r, 1e-6);
                    p.mesh.position.multiplyScalar(p.orbitMin / safeR);
                    p.velocity.addScaledVector(p.mesh.position, 0.08 * dt);
                }
                const pulse = 0.5 + 0.5 * Math.sin(t * p.pulseSpeed + p.phase);
                const s = THREE.MathUtils.lerp(p.minScale, p.maxScale, pulse);
                p.mesh.scale.setScalar(s);
                p.mesh.material.opacity = 0.15 + 0.85 * pulse;
                if (frameCounter % PARTICLE_LOOKAT_INTERVAL_FRAMES === 0) {
                    p.mesh.lookAt(playerYaw.position);
                }
            }

            if (e.damageTimer > 0) e.damageTimer -= dt;
            if (e.healthBarTimer > 0) e.healthBarTimer -= dt;
            if (e.healthLagDelayTimer > 0) {
                e.healthLagDelayTimer -= dt;
            } else if (e.lagHealth > e.displayedHealth) {
                if (e.healthLagShrinkTimer > 0) {
                    e.healthLagShrinkTimer -= dt;
                    const tLag = 1 - THREE.MathUtils.clamp(e.healthLagShrinkTimer / ENEMY_HEALTHBAR_LAG_SHRINK, 0, 1);
                    e.lagHealth = THREE.MathUtils.lerp(e.lagHealth, e.displayedHealth, tLag);
                } else {
                    e.lagHealth = e.displayedHealth;
                }
            }
            const aliveMix = THREE.MathUtils.clamp(e.damageTimer / ENEMY_DAMAGE_DURATION, 0, 1);
            e.core.material.color.copy(enemyBaseColor).lerp(enemyDamageColor, aliveMix);
            e.core.material.emissive.copy(enemyBaseEmissive).lerp(enemyDamageColor, aliveMix * 0.7);
        } else {
            updateExtraEnemyDeath(e, dt);
        }

        if (!e.alive && e.deathTimer >= ENEMY_DEATH_FALL_TIME + ENEMY_DEATH_FADE_TIME) {
            removeExtraEnemy(i);
            continue;
        }

        const h01 = THREE.MathUtils.clamp((e.entity.position.y - orbCoreRadius) / ENEMY_SHADOW_FADE_HEIGHT, 0, 1);
        const sAlpha = ENEMY_SHADOW_MAX_OPACITY * (1 - h01);
        const sRadius = ENEMY_SHADOW_RADIUS * (1 + h01 * 0.35);
        e.shadow.position.set(e.entity.position.x, ENEMY_SHADOW_Y, e.entity.position.z);
        e.shadow.scale.set(sRadius, sRadius, 1);
        e.shadow.material.opacity = sAlpha;
        e.shadow.visible = sAlpha > 0.01 && (e.alive || e.deathTimer < ENEMY_DEATH_FALL_TIME + ENEMY_DEATH_FADE_TIME);

        const inDeathAnim = !e.alive && e.deathTimer < ENEMY_DEATH_FALL_TIME + ENEMY_DEATH_FADE_TIME;
        e.healthBarGroup.visible = (e.healthBarTimer > 0) || inDeathAnim;
        if (e.healthBarGroup.visible) {
            tmpPrevDelta.copy(playerYaw.position).sub(e.entity.position);
            tmpPrevDelta.y = 0;
            if (tmpPrevDelta.lengthSq() > 1e-8) {
                e.healthBarGroup.rotation.y = Math.atan2(tmpPrevDelta.x, tmpPrevDelta.z);
            }
        }
        updateExtraEnemyHealthBar(e);
    }

    if (enemyAlive) {
        for (let i = 0; i < orbParticles.length; i += 1) {
            const p = orbParticles[i];
            const t = clock.elapsedTime + p.seed;
            const jitter = 0.75;
            p.velocity.x += (Math.sin(t * 1.7 + p.phase) * 0.018 + (Math.random() - 0.5) * 0.01) * jitter;
            p.velocity.y += (Math.cos(t * 1.3 + p.phase * 0.7) * 0.018 + (Math.random() - 0.5) * 0.01) * jitter;
            p.velocity.z += (Math.sin(t * 1.9 - p.phase * 0.5) * 0.018 + (Math.random() - 0.5) * 0.01) * jitter;
            p.velocity.multiplyScalar(0.965);
            p.mesh.position.addScaledVector(p.velocity, dt);

            const r = p.mesh.position.length();
            if (r > p.orbitMax) {
                p.mesh.position.multiplyScalar(p.orbitMax / r);
                p.velocity.addScaledVector(p.mesh.position, -0.12 * dt);
            } else if (r < p.orbitMin) {
                const safeR = Math.max(r, 1e-6);
                p.mesh.position.multiplyScalar(p.orbitMin / safeR);
                p.velocity.addScaledVector(p.mesh.position, 0.08 * dt);
            }

            const pulse = 0.5 + 0.5 * Math.sin(t * p.pulseSpeed + p.phase);
            const s = THREE.MathUtils.lerp(p.minScale, p.maxScale, pulse);
            p.mesh.scale.setScalar(s);
            p.mesh.material.opacity = 0.15 + 0.85 * pulse;
            if (frameCounter % PARTICLE_LOOKAT_INTERVAL_FRAMES === 0) {
                p.mesh.lookAt(playerYaw.position);
            }
        }
    }
    if (enemyDamageTimer > 0) {
        enemyDamageTimer -= dt;
    }
    if (enemyHealthBarTimer > 0) {
        enemyHealthBarTimer -= dt;
    }
    if (enemyHealthLagDelayTimer > 0) {
        enemyHealthLagDelayTimer -= dt;
    } else if (enemyLagHealth > enemyDisplayedHealth) {
        if (enemyHealthLagShrinkTimer > 0) {
            enemyHealthLagShrinkTimer -= dt;
            const tLag = 1 - THREE.MathUtils.clamp(enemyHealthLagShrinkTimer / ENEMY_HEALTHBAR_LAG_SHRINK, 0, 1);
            enemyLagHealth = THREE.MathUtils.lerp(enemyLagHealth, enemyDisplayedHealth, tLag);
        } else {
            enemyLagHealth = enemyDisplayedHealth;
        }
    }
    const enemyInDeathAnim = !enemyAlive && enemyDeathTimer < ENEMY_DEATH_FALL_TIME + ENEMY_DEATH_FADE_TIME;
    enemyHealthBarGroup.visible = (enemyHealthBarTimer > 0) || enemyInDeathAnim;
    if (enemyHealthBarGroup.visible) {
        orbEntity.getWorldPosition(tmpWorldPos);
        tmpPrevDelta.copy(playerYaw.position).sub(tmpWorldPos);
        tmpPrevDelta.y = 0;
        if (tmpPrevDelta.lengthSq() > 1e-8) {
            enemyHealthBarGroup.rotation.y = Math.atan2(tmpPrevDelta.x, tmpPrevDelta.z);
        }
    }
    updateEnemyHealthBar();
    fpsAccumTime += dt;
    fpsFrameCount += 1;
    if (fpsAccumTime >= 0.25) {
        fpsDisplay = Math.round(fpsFrameCount / Math.max(fpsAccumTime, 1e-6));
        fpsHud.textContent = `FPS: ${fpsDisplay}`;
        fpsAccumTime = 0;
        fpsFrameCount = 0;
    }
    const damageMix = THREE.MathUtils.clamp(enemyDamageTimer / ENEMY_DAMAGE_DURATION, 0, 1);
    orbCore.material.color.copy(enemyBaseColor).lerp(enemyDamageColor, damageMix);
    orbCore.material.emissive.copy(enemyBaseEmissive).lerp(enemyDamageColor, damageMix * 0.7);

    camera.updateMatrixWorld(true);
    updatePortalTextures();
    if (frameCounter % 10 === 0) {
        portalResHud.textContent = portalResolutionDebugText;
    }
    renderer.render(currentWorld.scene, camera);
    renderPortalPreviewOverlay();
    minimapUpdateTimer += dt;
    if (minimapUpdateTimer >= MINIMAP_UPDATE_INTERVAL) {
        drawMinimap();
        minimapUpdateTimer = 0;
    }
    drawWeaponIndicator();
    drawBallReserveHud();
    drawPlayerHealthHud();
    if (playerHitFlashTimer > 0) {
        playerHitFlashTimer = Math.max(0, playerHitFlashTimer - dt);
        const flash01 = playerHitFlashTimer / PLAYER_HIT_FLASH_DURATION;
        hitOverlay.style.background = `rgba(255,0,0,${0.32 * flash01})`;
    } else {
        hitOverlay.style.background = "rgba(255,0,0,0)";
    }
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    portalResHud.style.top = `${12 + minimapCanvas.height + 8}px`;
    portalPreviewCamera.right = window.innerWidth;
    portalPreviewCamera.bottom = window.innerHeight;
    portalPreviewCamera.updateProjectionMatrix();
});

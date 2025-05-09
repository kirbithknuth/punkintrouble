    //Zone_della_Città
const ZONES = {
    NORD: 'NORD', SUD: 'SUD', EST: 'EST', OVEST: 'OVEST', CENTRO: 'CENTRO', NONE: 'NONE'
};

// Punti focali per la difficoltà (coordinate esempio, da adattare)
const ZONE_FOCUS_POINTS = {
    [ZONES.NORD]: { x: CITY_WIDTH / 2, y: CITY_HEIGHT * 0.15, type: 'church' }, // Esempio: una chiesa a nord
    [ZONES.SUD]: { x: CITY_WIDTH / 2, y: CITY_HEIGHT * 0.85, type: 'gang_hideout' }, // Esempio: covo gang a sud
    [ZONES.EST]: { x: CITY_WIDTH * 0.85, y: CITY_HEIGHT / 2, type: 'market' }, // Esempio: mercato a est
    [ZONES.OVEST]: { x: CITY_WIDTH * 0.15, y: CITY_HEIGHT / 2, type: 'industrial' }, // Esempio: zona industriale ovest
    [ZONES.CENTRO]: { x: CITY_WIDTH / 2, y: CITY_HEIGHT / 2, type: 'police_hq' } // Quartier generale polizia
};
const MAX_DIFFICULTY_DISTANCE = Math.min(CITY_WIDTH, CITY_HEIGHT) / 3.5; // Distanza per calo difficoltà
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PIXEL_SIZE = 3;

const CITY_WIDTH = GAME_WIDTH * 4;
const CITY_HEIGHT = GAME_HEIGHT * 4;
const MAX_DIFFICULTY_DISTANCE = Math.min(CITY_WIDTH, CITY_HEIGHT) / 3.5; // Distanza per calo difficoltà

// Tipi di Poliziotti
const POLICE_TYPES = {
    STANDARD: 'standard', SHIELD: 'shield', TASER_GUY: 'taser_guy',
    MOUNTED: 'mounted', JUGGERNAUT: 'juggernaut', OBESE: 'obese'
};

// Punti Skill e Bonus
let playerSkillPoints = 0;
const playerPermanentBonuses = {
    guardianoDelDestino: 0, cappellaioMatto: 0, cowboy: 0, galantuomo: 0,
};
const playerWeaponUpgrades = {}; // Es: "Pistola": 0

// Wanted Level e Spawn Polizia
let timeAtCurrentWantedLevel = 0;
let policeSpawnTimer = 0;
const POLICE_SPAWN_INTERVAL = 2.5; // Aumentato leggermente
let hasRespawnMalus = false; // Malus dopo essere stati arrestati

// Boss
let activeBoss = null;
const BOSS_TYPES = {
    COMANDANTE_CORROTTO: 'comandante_corrotto', GIUSTIZIERE_CITTA: 'giustiziere_citta'
};

// Locazioni Interagibili (Farmacie, ecc.)
const interactableLocations = {
    pharmacies: [], // Saranno popolate in City.constructor o generateCity
    foodStalls: []  // Saranno popolate in City.constructor o generateCity
};


// Costanti di Combattimento (dal tuo codice, potrebbero sovrascrivere quelle globali se presenti)
const PLAYER_MELEE_RANGE = PIXEL_SIZE * 15;
const POLICE_MELEE_RANGE = PIXEL_SIZE * 16; // Leggermente più raggio per la polizia
const PISTOL_RANGE_UNITS = 12 * (16 * PIXEL_SIZE); // Aumentato
const TASER_RANGE_UNITS = 6 * (16 * PIXEL_SIZE); // Aumentato

const PUNCH_DAMAGE = 5; // Aumentato
const POLICE_MELEE_DAMAGE_BASE = 4; // Danno base, verrà moltiplicato per difficultyFactor
const PLAYER_PISTOL_DAMAGE_BASE = 25;
const POLICE_PISTOL_DAMAGE_BASE = 10;
const POLICE_TASER_DAMAGE = 5; // Danno taser è più per lo stun

// Armi Melee del Giocatore
const MAUL_DAMAGE = 20; const STICK_DAMAGE = 8;
const BOTTLE_DAMAGE = 7; const KNIFE_DAMAGE = 12;

const MAX_PISTOL_AMMO_CARRIED = 30;
const PISTOL_CLIP_SIZE = 6;

// Tasti di Combattimento
const PUNCH_KEY = '1'; const MELEE_WEAPON_KEY = '2';
const RANGED_WEAPON_KEY = '3'; const PARRY_KEY = 'q';
const RELOAD_KEY = 'r';

// Variabili di stato del giocatore legate al combattimento
let playerPistolAmmo = 0;
let playerCurrentPistolClip = 0;
let playerStunDuration = 0;
let playerStunResistance = 0; // % di riduzione (0.0 a 1.0)
let playerParryCooldown = 0;
let playerMeleeAttackCooldown = 0;
let playerRangedAttackCooldown = 0;


// ========== IMPOSTAZIONI DI BASE DEL GIOCO (ESISTENTI E FUSE) ==========
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PIXEL_SIZE = 3;

const CITY_WIDTH = GAME_WIDTH * 4;
const CITY_HEIGHT = GAME_HEIGHT * 4;

const INTERACTION_RANGE = 50 * PIXEL_SIZE; // Scalato con PIXEL_SIZE
const NPC_COUNT = 25; // Leggermente ridotto
const POLICE_COUNT_BASE = 5; // Numero base, poi varia con zone
const TRASH_CAN_COUNT = 20;
const INTERACTABLE_DOOR_COUNT = 10;

const INTERACT_KEY = 'e';
// const ATTACK_KEY = 'f'; // Rimosso, usiamo tasti specifici

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

const wantedLevelElement = document.getElementById('wanted-level');
const skillPointsElement = document.getElementById('skill-points'); // NUOVO: Aggiungi <span id="skill-points">0</span>
const healthBarFillElement = document.getElementById('health-bar-fill'); // NUOVO: per barra HP
const healthBarTextElement = document.getElementById('health-bar-text'); // NUOVO: per testo HP

let coins = 0;
let totalCoins = 0;
let gameTime = 0;
let lastTimestamp = 0;
let gameStarted = false;
let showMinimap = true; // Mostra di default

let playerWantedLevel = 0;
let interactionMessage = "";
let interactionMessageTimeout = 0;

let cameraX = 0;
let cameraY = 0;

// ========== SUONI (Placeholder, usa i tuoi percorsi) ==========
const sounds = {
    punch_swing: { play: () => console.log("sfx: punch_swing") } , //new Audio('path/to/punch_swing.mp3'),
    punch_hit: { play: () => console.log("sfx: punch_hit") } , //new Audio('path/to/punch_hit.mp3'),
    melee_swing: { play: () => console.log("sfx: melee_swing") } , //new Audio('path/to/melee_swing.mp3'),
    melee_hit: { play: () => console.log("sfx: melee_hit") } , //new Audio('path/to/melee_hit.mp3'),
    gun_shot_player: { play: () => console.log("sfx: gun_shot_player") } , //new Audio('path/to/gun_shot_player.mp3'),
    gun_shot_enemy: { play: () => console.log("sfx: gun_shot_enemy") } , //new Audio('path/to/gun_shot_enemy.mp3'),
    gun_empty: { play: () => console.log("sfx: gun_empty") } , //new Audio('path/to/gun_empty.mp3'),
    gun_reload: { play: () => console.log("sfx: gun_reload") } , //new Audio('path/to/gun_reload.mp3'),
    taser_fire: { play: () => console.log("sfx: taser_fire") } , //new Audio('path/to/taser_fire.mp3'),
    player_hurt: { play: () => console.log("sfx: player_hurt") } , //new Audio('path/to/player_hurt.mp3'),
    enemy_hurt: { play: () => console.log("sfx: enemy_hurt") } , //new Audio('path/to/enemy_hurt.mp3'),
    parry_attempt: { play: () => console.log("sfx: parry_attempt") } , //new Audio('path/to/parry_attempt.mp3'),
    parry_success: { play: () => console.log("sfx: parry_success") } , //new Audio('path/to/parry_success.mp3'),
    bullet_hit_wall: { play: () => console.log("sfx: bullet_hit_wall") } , //new Audio('path/to/bullet_hit_wall.mp3'),
    coin: { play: () => console.log("sfx: coin") },
    heal: { play: () => console.log("sfx: heal") },
    shield_hit: { play: () => console.log("sfx: shield_hit")},
    horse_hurt: { play: () => console.log("sfx: horse_hurt")},
    // Aggiungi altri suoni necessari
};
function playSound(soundName) {
    if (sounds[soundName] && typeof sounds[soundName].play === 'function') {
        sounds[soundName].currentTime = 0; // Riavvolgi se già in play
        sounds[soundName].play().catch(e => console.warn("Audio play error:", e));
    } else {
        console.warn(`Sound not found or not playable: ${soundName}`);
    }
}
// Le altre funzioni helper globali (updateCoins, updateTime, flashScreen) rimangono come prima.

// ========== CLASSE ARMA BASE (MODIFICATA) ==========
class Weapon {
    constructor(name, type, damage, range, cooldown, durability = Infinity, clipSize = Infinity) {
        this.name = name;
        this.type = type; // "melee", "ranged"
        this.baseDamage = damage; // Danno base, può essere modificato da upgrade
        this.range = range;
        this.cooldown = cooldown;
        this.durability = durability;
        this.maxDurability = durability;
        this.clipSize = clipSize;
        this.currentClip = clipSize;
        this.id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.level = 0; // Livello di upgrade dell'arma specifica
    }

    get effectiveDamage() { // Calcola danno effettivo con upgrade
        let damageMultiplier = 1.0;
        if (playerWeaponUpgrades[this.name]) { // Se l'arma è nella mappa degli upgrade
             damageMultiplier += playerWeaponUpgrades[this.name] * 0.1; // +10% danno per livello
        }
        return Math.round(this.baseDamage * damageMultiplier);
    }

    use() {
        if (this.durability === Infinity || this.durability > 0) {
            if (this.clipSize !== Infinity) {
                if (this.currentClip > 0) {
                    this.currentClip--;
                    if (this.durability !== Infinity && this.name !== "Pistola") this.durability--; // Pistola non ha durabilità così
                    return true;
                } return false; // Caricatore vuoto
            } else {
                if (this.durability !== Infinity) this.durability--;
                return true;
            }
        } return false; // Rotta
    }

    reload(ammoAvailable) {
        if (this.clipSize === Infinity || this.name !== "Pistola") return 0; // Solo la pistola si ricarica così
        const needed = this.clipSize - this.currentClip;
        const canLoad = Math.min(needed, ammoAvailable);
        this.currentClip += canLoad;
        return canLoad;
    }
    isBroken() { return this.durability <= 0 && this.durability !== Infinity; }
}

// ========== CLASSE GIOCATORE (MODIFICATA PESANTEMENTE) ==========
class Player {
    constructor(x, y, width, height, speed) {
        // ... (proprietà da Player precedente: x,y,width,height,baseSpeed,direction,animation) ...
        this.x = x; this.y = y; this.width = width; this.height = height;
        this.speed = speed; this.baseSpeed = speed;
        this.direction = 0; this.animationFrame = 0; this.frameCount = 0; this.framesPerAnimation = 8;

        this.health = 100;
        this.maxHealth = 100;
        this.isInteracting = false;

        this.inventory = { meleeWeapons: [], rangedWeapons: [], consumables: [] };
        this.equippedMelee = null;
        this.equippedRanged = null; // Sarà la pistola

        this.isParrying = false;
        this.lastAttackedBy = null;
        this.actionState = 'idle'; // 'idle', 'punching', 'melee_swing', 'shooting', 'reloading', 'parrying', 'stunned'
        this.actionTimer = 0;

        // Stati specifici per veicolo cavallo
        this.playerWantedLevelCannotDrop = false; // Se a cavallo

        this.updateCamera();
        this.applyPermanentBonuses(); // Applica bonus all'inizio
    }

    applyPermanentBonuses() {
        // Guardiano del Destino: +Max HP
        this.maxHealth = 100 + (playerPermanentBonuses.guardianoDelDestino * 10);
        this.health = this.maxHealth; // Cura al massimo all'applicazione/upgrade

        // Cowboy: +Max munizioni pistola
        // MAX_PISTOL_AMMO_CARRIED non è una proprietà del player, ma globale.
        // Potremmo creare una MAX_PISTOL_AMMO_PLAYER e modificarla qui.
        // Per ora, questo bonus influenzerà la variabile globale direttamente (non ideale ma semplice)
        // Sarebbe meglio se MAX_PISTOL_AMMO_CARRIED fosse un attributo del player o calcolato dinamicamente.

        // Galantuomo: Riduzione Wanted Level (più difficile da applicare qui, va fatto dove il WL aumenta)
    }


    pickupWeapon(weaponInstance) {
        if (weaponInstance.type === "melee") {
            this.inventory.meleeWeapons.push(weaponInstance);
            if (!this.equippedMelee || weaponInstance.baseDamage > (this.equippedMelee.baseDamage || 0) ) {
                this.equipMeleeWeapon(weaponInstance);
            }
            showInteractionMessage(`Raccolto: ${weaponInstance.name}`, 2);
        } else if (weaponInstance.name === "Pistola") {
            const existingPistol = this.inventory.rangedWeapons.find(w => w.name === "Pistola");
            if (!existingPistol) {
                this.inventory.rangedWeapons.push(weaponInstance);
                this.equipRangedWeapon(weaponInstance);
                const loaded = weaponInstance.reload(playerPistolAmmo); // playerPistolAmmo è globale
                playerPistolAmmo -= loaded;
                playerCurrentPistolClip = weaponInstance.currentClip;
                showInteractionMessage(`Raccolta una ${weaponInstance.name}!`, 2);
            } else { // Ha già una pistola, aggiungi munizioni
                this.pickupAmmo(PISTOL_CLIP_SIZE * 2); // Esempio: trova 2 caricatori
            }
        }
         playSound('pickup_weapon'); // Suono generico per raccolta arma
    }

    pickupAmmo(amount) {
        const pistol = this.inventory.rangedWeapons.find(w => w.name === "Pistola");
        if (pistol) {
            const maxAmmoWithBonus = MAX_PISTOL_AMMO_CARRIED + (playerPermanentBonuses.cowboy * 5);
            playerPistolAmmo = Math.min(playerPistolAmmo + amount, maxAmmoWithBonus);
            showInteractionMessage(`Raccolte ${amount} munizioni. Tot: ${playerPistolAmmo}`, 2);
            if(this.equippedRanged === pistol && pistol.currentClip === 0) { // Auto-ricarica se il caricatore è vuoto
                this.attemptReload(true); // true = non mostrare messaggio "Caricatore già pieno"
            }
        } else {
            showInteractionMessage("Non hai una pistola per queste munizioni.", 1.5);
        }
    }

    equipMeleeWeapon(weapon) { this.equippedMelee = weapon; }
    equipRangedWeapon(weapon) {
        this.equippedRanged = weapon;
        if (weapon && weapon.name === "Pistola") playerCurrentPistolClip = weapon.currentClip;
    }
    cycleMeleeWeapon() {
        if (this.inventory.meleeWeapons.length === 0) { this.equippedMelee = null; return; }
        let currentIndex = -1;
        if(this.equippedMelee) currentIndex = this.inventory.meleeWeapons.findIndex(w => w.id === this.equippedMelee.id);
        const nextIndex = (currentIndex + 1) % this.inventory.meleeWeapons.length;
        this.equipMeleeWeapon(this.inventory.meleeWeapons[nextIndex]);
        if(this.equippedMelee) showInteractionMessage(`Equip: ${this.equippedMelee.name}`, 1);
    }

    takeDamage(amount, attacker = null) {
        if (this.actionState === 'parrying' && this.isParrying) {
            // Per ora, parry blocca tutto. In futuro: solo attacchi melee.
            showInteractionMessage("Parata!", 0.5);
            playSound('parry_success');
            this.actionState = 'idle'; this.isParrying = false;
            playerParryCooldown = 0.8; // Cooldown ridotto dopo parata riuscita
            if(attacker instanceof NPC && attacker.isPolice) attacker.takeStun(1.0); // Stordisci l'attaccante
            return;
        }
        this.health -= amount;
        playSound('player_hurt');
        flashScreen('rgba(255,0,0,0.3)', 0.2);
        updateHealthUI(); // Aggiorna UI salute
        if (this.health <= 0) { this.health = 0; this.die(); }
    }

    takeStun(durationSeconds) {
        // playerStunResistance è ora una percentuale di riduzione (0.0 a 1.0)
        const finalStunDuration = durationSeconds * (1 - playerStunResistance);
        if (finalStunDuration > 0 && this.actionState !== 'stunned') { // Evita stun su stun se non necessario
            playerStunDuration = finalStunDuration; // playerStunDuration è globale
            this.actionState = 'stunned';
            this.actionTimer = finalStunDuration;
            showInteractionMessage(`STORDITO! (${finalStunDuration.toFixed(1)}s)`, finalStunDuration);
            this.moveLeft = this.moveRight = this.moveUp = this.moveDown = false;
        }
    }

    consumeAlcohol(type) {
        let stunReductionPercentage = 0;
        if (type === "birra") stunReductionPercentage = 0.05; // 5%
        if (type === "vino") stunReductionPercentage = 0.15; // 15%
        if (type === "vodka") stunReductionPercentage = 0.25; // 25%

        playerStunResistance = Math.min(0.75, playerStunResistance + stunReductionPercentage); // Max 75% riduzione
        showInteractionMessage(`Res.Stun: ${(playerStunResistance*100).toFixed(0)}%`, 2);
        this.pickupWeapon(new Weapon("Bottiglia", "melee", BOTTLE_DAMAGE, PLAYER_MELEE_RANGE, 0.8, 1)); // Bottiglia si rompe dopo 1 colpo
        playSound('drink'); // Suono generico per bere
    }

    die() {
        showInteractionMessage("ARRESTATO!", 3);
        this.inventory.meleeWeapons = []; this.inventory.rangedWeapons = [];
        this.equippedMelee = null; this.equippedRanged = null;
        playerPistolAmmo = 0; playerCurrentPistolClip = 0;

        // Perde una % di skill points
        playerSkillPoints = Math.floor(playerSkillPoints * 0.75);
        updateSkillPointsUI();

        coins = 0; updateCoins();
        const prevWantedLevel = playerWantedLevel;
        playerWantedLevel = 0; updateWantedLevel();

        hasRespawnMalus = true;
        setTimeout(() => { hasRespawnMalus = false; }, 300000); // 5 min

        this.health = this.maxHealth;
        this.x = CITY_WIDTH / 2; this.y = CITY_HEIGHT / 2; // Respawn in un punto fisso più sicuro
        this.actionState = 'idle'; playerStunDuration = 0;
        if(this.isInVehicle) this.exitVehicle(); // Scende dal veicolo
        this.updateCamera();
        updateHealthUI();
        city.calmPolice(); // Calma tutti i poliziotti

        // La polizia potrebbe anche confiscare un'arma "illegale" se trovata
        // e il giocatore potrebbe doverla ricomprare o ritrovare
    }

    // --- AZIONI DI COMBATTIMENTO ---
    attemptPunch(city) {
        if (this.actionState !== 'idle' || playerMeleeAttackCooldown > 0) return;
        this.actionState = 'punching'; this.actionTimer = 0.3;
        playerMeleeAttackCooldown = 0.5; // Cooldown pugno
        playSound('punch_swing');

        city.npcs.filter(n => n.isPolice && n.isAlive).forEach(enemy => {
            const dist = Math.sqrt(Math.pow(this.x - enemy.x, 2) + Math.pow(this.y - enemy.y, 2));
            if (dist < PLAYER_MELEE_RANGE && this.isFacing(enemy)) { // Controlla se il player è rivolto verso il nemico
                enemy.takeDamage(PUNCH_DAMAGE, this);
                playSound('punch_hit');
            }
        });
    }

    attemptMeleeAttack(city) {
        if (this.actionState !== 'idle' || !this.equippedMelee || playerMeleeAttackCooldown > 0) return;
        this.actionState = 'melee_swing'; this.actionTimer = 0.5;
        playerMeleeAttackCooldown = this.equippedMelee.cooldown;
        playSound('melee_swing');

        if (!this.equippedMelee.use()) {
            showInteractionMessage(`${this.equippedMelee.name} è rotto/a!`, 1);
            this.inventory.meleeWeapons = this.inventory.meleeWeapons.filter(w => w.id !== this.equippedMelee.id);
            this.equippedMelee = this.inventory.meleeWeapons.length > 0 ? this.inventory.meleeWeapons[0] : null; // Equipaggia la prossima o nulla
            this.actionState = 'idle';
            return;
        }
        const damage = this.equippedMelee.effectiveDamage;
        // Attacco ad arco per Mazza/Bastone, singolo per Coltello/Bottiglia
        const isAreaAttack = this.equippedMelee.name === "Mazza" || this.equippedMelee.name === "Bastone";
        let hitSomeone = false;
        city.npcs.filter(n => n.isPolice && n.isAlive).forEach(enemy => {
            const dist = Math.sqrt(Math.pow(this.x - enemy.x, 2) + Math.pow(this.y - enemy.y, 2));
            if (dist < this.equippedMelee.range && this.isFacing(enemy, isAreaAttack ? Math.PI/2 : Math.PI/4)) { // Arco più ampio per area
                enemy.takeDamage(damage, this);
                hitSomeone = true;
                if (!isAreaAttack) return; // Colpisce solo il primo per armi singole
            }
        });
        if(hitSomeone) playSound('melee_hit');
    }

    attemptRangedAttack(city) {
        if (this.actionState !== 'idle' || !this.equippedRanged || this.equippedRanged.name !== "Pistola" || playerRangedAttackCooldown > 0) return;
        if (this.equippedRanged.currentClip <= 0) {
            showInteractionMessage("Pistola scarica! Premi R.", 1.5); playSound('gun_empty'); return;
        }
        this.actionState = 'shooting'; this.actionTimer = 0.2;
        playerRangedAttackCooldown = this.equippedRanged.cooldown;
        this.equippedRanged.use();
        playerCurrentPistolClip = this.equippedRanged.currentClip;
        playSound('gun_shot_player');

        let dx = 0, dy = 0;
        if (this.direction === 0) dy = 1; else if (this.direction === 1) dx = -1;
        else if (this.direction === 2) dx = 1; else if (this.direction === 3) dy = -1;
        else { dx = 1; } // Default a destra se direzione non valida

        city.projectiles.push({
            x: this.x + this.width / 2 + dx * this.width/2, // Origine proiettile dalla "canna"
            y: this.y + this.height / 2 + dy * this.height/2,
            dx: dx, dy: dy, speed: 350 * PIXEL_SIZE, damage: this.equippedRanged.effectiveDamage,
            rangeLeft: this.equippedRanged.range, owner: this, color: 'yellow'
        });
    }

    attemptReload(silent = false) { // silent per non mostrare messaggi se auto-ricarica
        if (!this.equippedRanged || this.equippedRanged.name !== "Pistola" || this.actionState !== 'idle') return;
        if (this.equippedRanged.currentClip === this.equippedRanged.clipSize) {
            if(!silent) showInteractionMessage("Caricatore pieno.",1); return;
        }
        if (playerPistolAmmo <= 0) {
            if(!silent) showInteractionMessage("Nessuna munizione.",1); playSound('gun_empty'); return;
        }
        this.actionState = 'reloading'; this.actionTimer = 1.2; // Tempo di ricarica
        playSound('gun_reload');
    }

    attemptParry() {
        if (this.actionState !== 'idle' || playerParryCooldown > 0) return;
        this.actionState = 'parrying'; this.isParrying = true;
        this.actionTimer = 0.35; // Finestra di parata più corta
        playerParryCooldown = 1.0; // Cooldown più corto se il parry fallisce
        playSound('parry_attempt');
    }

    isFacing(target, angleThreshold = Math.PI / 3) { // Controlla se il target è entro un cono di fronte
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const angleToTarget = Math.atan2(dy, dx);

        let playerAngle = 0;
        if (this.direction === 0) playerAngle = Math.PI / 2;   // Giù
        else if (this.direction === 1) playerAngle = Math.PI;  // Sinistra
        else if (this.direction === 2) playerAngle = 0;        // Destra
        else if (this.direction === 3) playerAngle = -Math.PI / 2; // Su

        let diff = Math.abs(playerAngle - angleToTarget);
        if (diff > Math.PI) diff = 2 * Math.PI - diff; // Gestisci wrap around
        return diff <= angleThreshold;
    }

    update(city, deltaTime) {
        // Cooldowns (vanno prima dello stun check per continuare a scorrere)
        if (playerParryCooldown > 0) playerParryCooldown -= deltaTime;
        if (playerMeleeAttackCooldown > 0) playerMeleeAttackCooldown -= deltaTime;
        if (playerRangedAttackCooldown > 0) playerRangedAttackCooldown -= deltaTime;

        // Stun
        if (playerStunDuration > 0) {
            playerStunDuration -= deltaTime;
            if (playerStunDuration <= 0) {
                playerStunDuration = 0;
                if(this.actionState === 'stunned') this.actionState = 'idle';
                showInteractionMessage("Non più stordito.", 1);
            } else {
                this.actionState = 'stunned'; // Mantieni lo stato
                this.updateCamera(); return; // No altre azioni/movimento se stordito
            }
        }

        // Azioni con Timer
        if (this.actionTimer > 0) {
            this.actionTimer -= deltaTime;
            if (this.actionTimer <= 0) {
                this.actionTimer = 0;
                if(this.actionState === 'reloading' && this.equippedRanged && this.equippedRanged.name === "Pistola"){
                    const loaded = this.equippedRanged.reload(playerPistolAmmo);
                    playerPistolAmmo -= loaded;
                    playerCurrentPistolClip = this.equippedRanged.currentClip;
                    showInteractionMessage(`Ricaricato (${this.equippedRanged.currentClip}/${playerPistolAmmo})`,1);
                }
                this.actionState = 'idle';
                if (this.isParrying) this.isParrying = false;
            }
        }
         // Se nel veicolo
        if (this.isInVehicle && this.currentVehicle) {
            this.x = this.currentVehicle.x + (this.currentVehicle.width / 2) - (this.width / 2);
            this.y = this.currentVehicle.y + (this.currentVehicle.height / 2) - (this.height / 2);
            if (this.isInteracting && this.actionState === 'idle') {
                this.exitVehicle();
                this.isInteracting = false;
            }
            this.updateCamera();
            return;
        }

        // Movimento (solo se in stato 'idle' o azione non bloccante)
        let moved = false;
        if (this.actionState === 'idle' ||
            (this.actionState === 'punching' && this.actionTimer < 0.1) || // Permette di muoversi quasi subito dopo pugno
            (this.actionState === 'melee_swing' && this.actionTimer < 0.2) || // Idem per melee
            (this.actionState === 'shooting' && this.actionTimer < 0.05) ) { // Idem per sparo
            // ... (logica di movimento e collisione tile dal Player precedente, assicurati sia integrata qui) ...
            // Questa è una parte cruciale che era nel tuo Player.update originale.
            // La incollo qui semplificata, dovrai usare quella più robusta che avevamo.
            let intendedMoveX = 0; let intendedMoveY = 0;
            const moveAmount = this.speed * deltaTime;

            if (this.moveLeft) { intendedMoveX -= moveAmount; this.direction = 1;}
            if (this.moveRight) { intendedMoveX += moveAmount; this.direction = 2;}
            if (this.moveUp) { intendedMoveY -= moveAmount; this.direction = 3;}
            if (this.moveDown) { intendedMoveY += moveAmount; this.direction = 0;}

            if (intendedMoveX !== 0 || intendedMoveY !== 0) moved = true;

            // Collisione assi separati (usa la versione robusta della tua implementazione precedente)
            const checkCollision = (checkX, checkY) => { // Funzione helper collisione
                const gx1 = Math.floor(checkX / city.tileSize), gy1 = Math.floor(checkY / city.tileSize);
                const gx2 = Math.floor((checkX + this.width -1) / city.tileSize), gy2 = Math.floor((checkY + this.height -1) / city.tileSize);
                const tiles = [city.grid[gy1]?.[gx1], city.grid[gy1]?.[gx2], city.grid[gy2]?.[gx1], city.grid[gy2]?.[gx2]];
                for(const tile of tiles){ if(tile === city.BUILDING || tile === city.WATER) return true; } return false;
            };

            if (intendedMoveX !== 0) {
                if (!checkCollision(this.x + intendedMoveX, this.y) &&
                    this.x + intendedMoveX > 0 && this.x + intendedMoveX + this.width < CITY_WIDTH) {
                    this.x += intendedMoveX;
                } else { moved = (intendedMoveY === 0) ? false : moved;}
            }
            if (intendedMoveY !== 0) {
                 if (!checkCollision(this.x, this.y + intendedMoveY) &&
                    this.y + intendedMoveY > 0 && this.y + intendedMoveY + this.height < CITY_HEIGHT) {
                    this.y += intendedMoveY;
                } else { moved = (intendedMoveX === 0) ? false : moved;}
            }
        }

        // Animazione
        if (moved && this.actionState === 'idle') { // Anima solo se si muove e non in altra azione
            this.frameCount++;
            if (this.frameCount >= this.framesPerAnimation) {
                this.frameCount = 0; this.animationFrame = (this.animationFrame + 1) % 2;
            }
        } else if (!moved && this.actionState === 'idle') {
            this.frameCount = 0; this.animationFrame = 0;
        }


        if (this.isInteracting && this.actionState === 'idle') {
            this.tryInteract(city); this.isInteracting = false;
        }
        this.updateCamera();
    }

    draw() { // Semplificato, adatta al tuo stile
        if (this.isInVehicle) return;
        const screenX = Math.round(this.x - cameraX);
        const screenY = Math.round(this.y - cameraY);

        // Disegno base
        ctx.fillStyle = 'purple';
        ctx.fillRect(screenX, screenY, this.width, this.height);

        // Feedback stati
        if (this.actionState === 'stunned') {
            ctx.fillStyle = 'rgba(255,255,0,0.4)';
            ctx.fillRect(screenX-2, screenY-2, this.width+4, this.height+4);
            ctx.font = `${PIXEL_SIZE*3}px Arial`; ctx.fillStyle="yellow"; ctx.textAlign="center";
            ctx.fillText("STUN!", screenX + this.width/2, screenY - 5);
        } else if (this.actionState === 'parrying' && this.isParrying) {
            ctx.strokeStyle = 'rgba(100,100,255,0.8)'; ctx.lineWidth = PIXEL_SIZE;
            ctx.strokeRect(screenX-PIXEL_SIZE, screenY-PIXEL_SIZE, this.width+PIXEL_SIZE*2, this.height+PIXEL_SIZE*2);
            ctx.lineWidth=1;
        }
        // Disegno arma (molto base)
        if (this.equippedMelee && (this.actionState === 'idle' || this.actionState === 'melee_swing')) {
            ctx.fillStyle = 'silver';
            if (this.direction === 2) ctx.fillRect(screenX + this.width, screenY + this.height/3, PIXEL_SIZE*3, PIXEL_SIZE); // Destra
            else if (this.direction === 1) ctx.fillRect(screenX - PIXEL_SIZE*3, screenY + this.height/3, PIXEL_SIZE*3, PIXEL_SIZE); // Sinistra
        }
        if (this.equippedRanged && (this.actionState === 'idle' || this.actionState === 'shooting')) {
            ctx.fillStyle = 'darkgrey';
             if (this.direction === 2) ctx.fillRect(screenX + this.width - PIXEL_SIZE*2, screenY + this.height/3, PIXEL_SIZE*3, PIXEL_SIZE*2);
             else if (this.direction === 1) ctx.fillRect(screenX - PIXEL_SIZE, screenY + this.height/3, PIXEL_SIZE*3, PIXEL_SIZE*2);
        }
    }

    tryInteract(city) {
        let closestInteractable = null;
        let minDistance = INTERACTION_RANGE;

        const checkDistance = (item) => { // Semplificato
            const itemCenterX = item.x + (item.width || 0) / 2;
            const itemCenterY = item.y + (item.height || 0) / 2;
            const dx = (this.x + this.width / 2) - itemCenterX;
            const dy = (this.y + this.height / 2) - itemCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (item.collected && item.type !== 'door') return;

            if (distance < minDistance && typeof item.interact === 'function') {
                minDistance = distance;
                closestInteractable = item;
            }
        };
        // Ricerca Oggetti Standard
        city.trashCans.forEach(checkDistance);
        city.doors.forEach(checkDistance);
        city.vehicles.filter(v=>(v.type === 'bus' || v.type === 'tram')).forEach(checkDistance);
        city.npcs.filter(n=>!n.isPolice && n.isAlive).forEach(checkDistance);
        // Ricerca Alberi (logica treeTileObject come prima)
        // ... (incolla la tua logica per gli alberi qui, assicurandoti che treeTileObject abbia .interact) ...

        // NUOVO: Ricerca Ground Items
        city.groundItems.forEach(item => {
            // Per i ground items, l'interazione è gestita diversamente o hanno un metodo .interact
            const itemCenterX = item.x + (item.width || PIXEL_SIZE*4) / 2;
            const itemCenterY = item.y + (item.height || PIXEL_SIZE*4) / 2;
            const dx = (this.x + this.width / 2) - itemCenterX;
            const dy = (this.y + this.height / 2) - itemCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                closestInteractable = item; // item è l'oggetto Weapon o l'oggetto consumabile
            }
        });
        // Ricerca Farmacie e Bancarelle
        [...interactableLocations.pharmacies, ...interactableLocations.foodStalls].forEach(loc => {
            if(loc.interact) checkDistance(loc); // Se hanno un metodo interact definito
        });


        if (closestInteractable) {
            if (closestInteractable instanceof Weapon) {
                this.pickupWeapon(closestInteractable);
                city.removeItemFromGround(closestInteractable);
            } else if (typeof closestInteractable.interact === 'function') {
                closestInteractable.interact(this, city);
                 // Se l'item era un consumabile e non si è rimosso da solo, rimuovilo
                if (closestInteractable.type && closestInteractable.type.startsWith("consumable_") && city.groundItems.includes(closestInteractable)){
                    city.removeItemFromGround(closestInteractable);
                }
            }
        }
    }
    // (updateCamera, enterVehicle, exitVehicle come prima)
    enterVehicle(vehicle) {
        super.enterVehicle(vehicle); // Chiama il metodo base se esiste, o copia la logica
        this.isInVehicle = true; this.currentVehicle = vehicle; this.speed = 0;
        if (vehicle.isHorse) {
            this.playerWantedLevelCannotDrop = true;
            this.baseSpeed *= (vehicle.speedMultiplier || 1.5); // Aumenta velocità base mentre a cavallo
            this.speed = this.baseSpeed;
        }
        showInteractionMessage(`Salito su ${vehicle.type}. Premi '${INTERACT_KEY}' per scendere.`, 3);
    }
    exitVehicle() {
        if (this.currentVehicle) {
            if (this.currentVehicle.isHorse) {
                this.playerWantedLevelCannotDrop = false;
                this.speed = this.baseSpeed / (this.currentVehicle.speedMultiplier || 1.5); // Ripristina
                this.baseSpeed = this.speed; // Aggiorna baseSpeed al valore normale
                 // Rilascia il cavallo come NPC/Oggetto? (complesso)
                 // Per ora, il cavallo sparisce o diventa un "veicolo abbandonato"
            }
            this.isInVehicle = false;
            this.x = this.currentVehicle.x + (this.currentVehicle.width || 0) + PIXEL_SIZE*2;
            this.y = this.currentVehicle.y + (this.currentVehicle.height || 0) / 2;
            this.currentVehicle = null; this.speed = this.baseSpeed;
            showInteractionMessage("Sceso dal veicolo.", 2);
            this.updateCamera();
        }
    }
}


// ========== CLASSE NPC (MODIFICATA) ==========
class NPC extends Interactable {
    constructor(x, y, width, height, speed, type = "npc") {
        super(x, y, width, height, type);
        this.originalX = x; this.originalY = y; this.speed = speed; // px/sec
        this.direction = Math.floor(Math.random() * 4);
        this.moveTimer = Math.random() * 2 + 1; // Più frequente cambio direzione
        this.isPolice = false; this.isAlive = true;
        this.targetX = x; this.targetY = y;

        this.health = (type === "npc_civilian" ? 20 : 50); // Civili più fragili
        this.maxHealth = this.health;
        this.actionState = 'idle'; this.actionTimer = 0;
        this.attackCooldown = 0;

        this.fadingAway = false; this.fadeAlpha = 1.0;
        this.tempFlashColor = null; // Per feedback danno
        this.id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; // ID Unico
    }

    takeDamage(amount, attacker = null) {
        if(!this.isAlive || this.fadingAway) return;
        this.health -= amount;
        if (!this.isPolice) playSound('civilian_hurt'); // Suono diverso per civili
        else playSound('enemy_hurt');

        this.tempFlashColor = 'rgba(255,100,100,0.7)';
        setTimeout(() => { this.tempFlashColor = null; }, 100);

        if (this.health <= 0) { this.health = 0; this.die(attacker, city); }
        else if (attacker instanceof Player && !this.isPolice){
            this.getAttacked(city); // Civile chiama polizia
        }
    }

    takeStun(durationSeconds) { // Anche gli NPC possono essere storditi
        if(this.actionState === 'stunned') return; // Non re-stunnare se già stordito
        this.actionState = 'stunned';
        this.actionTimer = durationSeconds;
        // Potrebbe fermare il movimento
    }


    die(attacker, cityInstance) {
        if(!this.isAlive || this.fadingAway) return;
        this.isAlive = false; this.actionState = 'dead'; this.fadingAway = true;
        showInteractionMessage(`${this.isPolice ? "Poliziotto" : "Passante"} a terra!`, 1.5);

        if (attacker instanceof Player) {
            // Guadagno Skill Points
            playerSkillPoints += Math.floor(this.maxHealth / 5); // 1/5 degli HP max come punti
            updateSkillPointsUI();

            // Drop monete
            if (Math.random() < (this.isPolice ? 0.8 : 0.5)) { // Polizia droppa più spesso
                const coinAmount = Math.floor(Math.random() * (this.isPolice ? 15 : 8)) + (this.isPolice ? 5 : 1);
                // Istanzia monete a terra vicino all'NPC (o aggiungi diretto)
                // cityInstance.spawnCoinsAt(this.x, this.y, coinAmount);
                 coins += coinAmount; totalCoins += coinAmount; updateCoins(); // Per ora diretto
            }
        }
    }

    update(deltaTime, city, player) {
        if (this.fadingAway) {
            this.fadeAlpha -= deltaTime * 0.8; // Dissolvenza più veloce
            if (this.fadeAlpha < 0) this.fadeAlpha = 0;
            return;
        }
        if(!this.isAlive) return;

        if (this.actionState === 'stunned' && this.actionTimer > 0) {
            this.actionTimer -= deltaTime;
            if(this.actionTimer <= 0) this.actionState = 'idle';
            return; // Non fare altro se stordito
        }
        // Se non stunnato, e l'actionTimer generico è scaduto, torna idle
        if (this.actionTimer > 0 && this.actionState !== 'stunned') {
             this.actionTimer -= deltaTime;
             if(this.actionTimer <= 0) this.actionState = 'idle';
        }


        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        this.updateMovement(deltaTime, city); // updateMovement ora usa deltaTime
    }
    // updateMovement (usa deltaTime come in Player)
    updateMovement(deltaTime, city) {
        if (!this.isAlive || this.actionState === 'stunned' || (this.isPolice && this.actionState !== 'idle' && this.actionState !== 'patrolling' && this.actionState !== 'chasing' && this.actionState !== 'returning') ) return;

        const moveAmount = this.speed * deltaTime; // Velocità basata su deltaTime

        this.moveTimer -= deltaTime;
        // ... (resto della logica di scelta target come prima) ...
        // quando si muove:
        // this.x += (dx / distToTarget) * moveAmount;
        // this.y += (dy / distToTarget) * moveAmount;
        // (Assicurati che la logica di target finding sia efficiente)
        if (this.moveTimer <= 0 || Math.sqrt(Math.pow(this.targetX - this.x, 2) + Math.pow(this.targetY - this.y, 2)) < moveAmount * 5) {
            this.moveTimer = Math.random() * 3 + 2;
            let attempts = 0;
            let foundTarget = false;
            while (attempts < 10 && !foundTarget) {
                const angle = Math.random() * Math.PI * 2;
                const moveDistance = 50 + Math.random() * 150;
                let newTargetX = this.x + Math.cos(angle) * moveDistance;
                let newTargetY = this.y + Math.sin(angle) * moveDistance;

                newTargetX = Math.max(this.width/2, Math.min(CITY_WIDTH - this.width/2, newTargetX));
                newTargetY = Math.max(this.height/2, Math.min(CITY_HEIGHT - this.height/2, newTargetY));

                const gridX = Math.floor(newTargetX / city.tileSize);
                const gridY = Math.floor(newTargetY / city.tileSize);
                if (city.grid[gridY]?.[gridX] === city.EMPTY) {
                    this.targetX = newTargetX;
                    this.targetY = newTargetY;
                    foundTarget = true;
                }
                attempts++;
            }
            if (!foundTarget && !this.isPolice) { // I civili possono tornare all'origine se non trovano strada
                this.targetX = this.originalX;
                this.targetY = this.originalY;
            } else if (!foundTarget && this.isPolice) { // La polizia cerca un'altra strada
                 this.moveTimer = 0.1; // Prova subito a trovare un altro target
            }
        }

        let dx = this.targetX - this.x;
        let dy = this.targetY - this.y;
        const distToTarget = Math.sqrt(dx * dx + dy * dy);

        if (distToTarget > moveAmount) {
            this.x += (dx / distToTarget) * moveAmount;
            this.y += (dy / distToTarget) * moveAmount;

            if (Math.abs(dx) > Math.abs(dy)) this.direction = dx > 0 ? 2 : 1;
            else if (dy !== 0) this.direction = dy > 0 ? 0 : 3;
        }
    }

    draw(ctx, cameraX, cameraY) {
        if (this.fadeAlpha <= 0) return;
        const screenX = Math.round(this.x - cameraX);
        const screenY = Math.round(this.y - cameraY);
        if (screenX + this.width < 0 || screenX > GAME_WIDTH || screenY + this.height < 0 || screenY > GAME_HEIGHT) return;

        ctx.globalAlpha = this.fadeAlpha;
        // Disegno base (sovrascritto da Civilian e Police)
        ctx.fillStyle = this.isPolice ? 'darkblue' : 'darkgreen';
        ctx.fillRect(screenX, screenY, this.width, this.height);

        if (this.tempFlashColor) {
            ctx.fillStyle = this.tempFlashColor;
            ctx.fillRect(screenX, screenY, this.width, this.height);
        }
        if (this.actionState === 'stunned') {
             ctx.fillStyle = 'rgba(255,255,0,0.5)'; // Stun visivo
             ctx.beginPath();
             ctx.arc(screenX + this.width/2, screenY + this.height/2, this.width/1.5, 0, Math.PI*2);
             ctx.fill();
        }

        ctx.globalAlpha = 1.0;
    }
    // getAttacked (come prima, ma ora takeDamage gestisce la reazione iniziale)
    getAttacked(cityInstance) { // Chiamato per civili per allertare polizia
        if(!this.isAlive || this.isPolice) return;
        if (Math.random() < 0.8) { // Civili chiamano più spesso
            showInteractionMessage("Il passante urla e chiama la polizia!", 2);
            cityInstance.alertNearbyPolice(this.x, this.y, 250 * PIXEL_SIZE, player); // Raggio maggiore
        }
    }
}
// Civilian rimane quasi uguale, eredita i nuovi metodi da NPC
// Police (e sottoclassi) necessitano di modifiche più consistenti

// ========== CLASSE POLICE (E SOTTOCLASSI, MODIFICATE) ==========
class Police extends NPC {
    constructor(x, y, difficultyFactor = 0.5, policeType = POLICE_TYPES.STANDARD) {
        const baseSpeed = 70 + Math.random() * 20; // px/sec
        super(x, y, 9 * PIXEL_SIZE, 13 * PIXEL_SIZE, baseSpeed + (difficultyFactor * baseSpeed * 0.3), policeType); // Velocità base + bonus difficoltà
        this.health = 40 + Math.floor(difficultyFactor * 40); // HP base 40-80
        this.maxHealth = this.health;
        this.isPolice = true;
        this.policeType = policeType; // Salva il tipo specifico
        this.currentState = 'patrolling';
        this.targetPlayer = null; // Sarà il player globale
        this.chaseTimer = 0;
        this.visionRange = (180 + difficultyFactor * 40) * PIXEL_SIZE; // Visione aumenta con difficoltà
        this.attackRange = POLICE_MELEE_RANGE; // Default melee

        // Armamento
        this.hasPistol = policeType === POLICE_TYPES.JUGGERNAUT || (policeType === POLICE_TYPES.STANDARD && Math.random() < (0.2 + difficultyFactor * 0.5));
        this.pistolAmmo = this.hasPistol ? (policeType === POLICE_TYPES.JUGGERNAUT ? 20 : PISTOL_CLIP_SIZE * (1 + Math.floor(difficultyFactor*2))) : 0;
        this.canUseTaser = policeType === POLICE_TYPES.TASER_GUY || (policeType === POLICE_TYPES.STANDARD && Math.random() < (0.1 + difficultyFactor * 0.3));

        this.taserCooldown = 0;
        this.pistolCooldown = 0;
        this.attackDamageMultiplier = 1.0 + difficultyFactor * 0.75; // Danno aumenta significativamente
        this.accuracy = 0.6 + difficultyFactor * 0.35; // Precisione da 60% a 95%
    }

    update(deltaTime, city, playerInstance) {
        if (this.fadingAway || !this.isAlive) { super.update(deltaTime, city, playerInstance); return; }
        this.targetPlayer = playerInstance;

        if (this.actionState === 'stunned' && this.actionTimer > 0) {
            this.actionTimer -= deltaTime; if(this.actionTimer <= 0) this.actionState = 'idle'; return;
        }
        if (this.actionTimer > 0 && this.actionState !== 'stunned') {
            this.actionTimer -= deltaTime; if(this.actionTimer <= 0) this.actionState = 'idle';
        }

        if (this.taserCooldown > 0) this.taserCooldown -= deltaTime;
        if (this.pistolCooldown > 0) this.pistolCooldown -= deltaTime;
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;


        if (this.targetPlayer.isInVehicle && this.currentState === 'chasing') {
            if(!this.targetPlayer.currentVehicle.isHorse || this.policeType !== POLICE_TYPES.MOUNTED){ // Cavallo può inseguire altri cavalli
                 this.currentState = 'returning'; showInteractionMessage("Polizia persa (veicolo).", 1.5);
            }
        }
        if (this.targetPlayer.isInVehicle && this.currentState !== 'returning' && (!this.targetPlayer.currentVehicle.isHorse || this.policeType !== POLICE_TYPES.MOUNTED)) {
             this.updateMovement(deltaTime, city); return;
        }


        const distanceToPlayer = Math.sqrt(Math.pow(this.x - this.targetPlayer.x, 2) + Math.pow(this.y - this.targetPlayer.y, 2));

        switch (this.currentState) {
            case 'patrolling':
                this.updateMovement(deltaTime, city);
                let detectionChance = (playerWantedLevel * 0.15) + (hasRespawnMalus ? 0.2 : 0); // Aumentata base, malus conta
                detectionChance *= (1 - playerPermanentBonuses.galantuomo * 0.05); // Bonus Galantuomo
                detectionChance = Math.max(0.01, detectionChance); // Minimo 1%

                if (distanceToPlayer < this.visionRange && Math.random() < detectionChance) {
                    this.currentState = 'chasing';
                    this.chaseTimer = 15 + playerWantedLevel * 3 + (difficultyFactor * 10);
                    if (playerWantedLevel < 2) playerWantedLevel = 2;
                    updateWantedLevel();
                    // showInteractionMessage("Polizia ti ha notato!", 1);
                }
                break;
            case 'chasing':
                if (playerWantedLevel === 0) { this.currentState = 'returning'; break; }
                // Logica di attacco
                if (this.actionState === 'idle') { // Può attaccare solo se idle
                    if (distanceToPlayer < this.attackRange && this.attackCooldown <= 0) { // Melee
                        this.actionState = 'attacking_melee'; this.actionTimer = 0.6; this.attackCooldown = 1.2 - difficultyFactor * 0.3;
                        if(Math.random() < this.accuracy * 0.8){ // Meno preciso in melee
                            this.targetPlayer.takeDamage(POLICE_MELEE_DAMAGE_BASE * this.attackDamageMultiplier, this);
                            playSound('punch_hit');
                        } else playSound('punch_swing');
                    } else if (this.hasPistol && this.pistolAmmo > 0 && distanceToPlayer < PISTOL_RANGE_UNITS && this.pistolCooldown <= 0) {
                        this.actionState = 'attacking_ranged'; this.actionTimer = 0.4; this.pistolCooldown = (1.8 - difficultyFactor * 0.5) ;
                        this.pistolAmmo--; playSound('gun_shot_enemy');
                        if (Math.random() < this.accuracy) { // Colpo a segno
                            const dx = (this.targetPlayer.x + this.targetPlayer.width/2) - (this.x + this.width/2);
                            const dy = (this.targetPlayer.y + this.targetPlayer.height/2) - (this.y + this.height/2);
                            const norm = Math.sqrt(dx*dx + dy*dy) || 1;
                            city.projectiles.push({ x: this.x + this.width/2, y: this.y + this.height/2, dx: dx/norm, dy: dy/norm, speed: 280*PIXEL_SIZE, damage: POLICE_PISTOL_DAMAGE_BASE * this.attackDamageMultiplier, rangeLeft: PISTOL_RANGE_UNITS, owner: this, color: 'red'});
                        }
                        if(this.pistolAmmo === 0) showInteractionMessage("Un poliziotto ha finito i colpi!",1);
                    } else if (this.canUseTaser && distanceToPlayer < TASER_RANGE_UNITS && this.taserCooldown <= 0) {
                        this.actionState = 'attacking_ranged'; this.actionTimer = 0.5; this.taserCooldown = (3.0 - difficultyFactor * 1.0);
                        playSound('taser_fire');
                        if(Math.random() < this.accuracy * 0.7){ // Taser meno preciso
                             this.targetPlayer.takeDamage(POLICE_TASER_DAMAGE, this); // Danno minimo
                             this.targetPlayer.takeStun(1.5 + difficultyFactor * 1.0); // Stun più lungo con difficoltà
                        }
                    }
                }
                // Movimento se non sta attaccando
                if(this.actionState === 'idle' || this.actionState === 'patrolling'){ // Si muove anche se in patrolling (se il target è stato settato da alert)
                    const moveAmount = this.speed * deltaTime;
                    const dx = this.targetPlayer.x - this.x;
                    const dy = this.targetPlayer.y - this.y;
                    const norm = Math.sqrt(dx*dx + dy*dy) || 1;
                    this.x += (dx / norm) * moveAmount;
                    this.y += (dy / norm) * moveAmount;
                    if(Math.abs(dx) > Math.abs(dy)) this.direction = dx > 0 ? 2:1; else this.direction = dy > 0 ? 0:3;
                }

                this.chaseTimer -= deltaTime;
                if ((distanceToPlayer > this.visionRange * 1.8 || this.chaseTimer <= 0) && this.actionState === 'idle') {
                    this.currentState = 'returning';
                }
                break;
            case 'returning':
                this.updateMovement(deltaTime, city);
                if(Math.sqrt(Math.pow(this.originalX - this.x, 2) + Math.pow(this.originalY - this.y, 2)) < this.speed * deltaTime * 3){
                    this.x = this.originalX; this.y = this.originalY;
                    this.currentState = 'patrolling';
                }
                break;
        }
    }

    die(attacker, cityInstance) {
        super.die(attacker, cityInstance); // Gestisce HP, dissolvenza, skill points base, monete
        if (attacker instanceof Player) {
            if (playerWantedLevel < 5 && Math.random() < 0.7) playerWantedLevel++; // Non aumenta sempre
            if(hasRespawnMalus && playerWantedLevel < 5 && Math.random() < 0.5) playerWantedLevel++; // Chance di +1 extra se malus
            playerWantedLevel = Math.min(5, playerWantedLevel); // Cap a 5
            updateWantedLevel();

            if (this.hasPistol && this.pistolAmmo > 0 && Math.random() < (0.3 + playerPermanentBonuses.cappellaioMatto * 0.05)) { // Cappellaio Matto
                // player.pickupAmmo(this.pistolAmmo); // Rimosso, si droppa arma
                const droppedPistol = new Weapon("Pistola", "ranged", PLAYER_PISTOL_DAMAGE_BASE, PISTOL_RANGE_UNITS, 1.5, Infinity, PISTOL_CLIP_SIZE);
                droppedPistol.currentClip = this.pistolAmmo; // Con le munizioni che aveva
                droppedPistol.x = this.x; droppedPistol.y = this.y;
                cityInstance.groundItems.push(droppedPistol);
                showInteractionMessage("Un poliziotto ha perso la pistola!", 1.5);
            }
            // Drop arma melee del poliziotto (es. manganello)
            if(Math.random() < (0.15 + playerPermanentBonuses.cappellaioMatto * 0.05)){
                const droppedStick = new Weapon("Manganello", "melee", STICK_DAMAGE + 2, PLAYER_MELEE_RANGE, 0.9, 300);
                droppedStick.x = this.x; droppedStick.y = this.y;
                cityInstance.groundItems.push(droppedStick);
                showInteractionMessage("Un poliziotto ha perso il manganello!", 1.5);
            }
        }
    }
    // Disegno base da NPC, sovrascritto per dettagli specifici del tipo di poliziotto
    draw(ctx, cameraX, cameraY){ // Disegno base polizia, sovrascritto da tipi speciali
        if (this.fadeAlpha <= 0) return;
        const screenX = Math.round(this.x - cameraX);
        const screenY = Math.round(this.y - cameraY);
        if (screenX + this.width < 0 || screenX > GAME_WIDTH || screenY + this.height < 0 || screenY > GAME_HEIGHT) return;
        ctx.globalAlpha = this.fadeAlpha;

        // Corpo base
        ctx.fillStyle = '#00008B';
        ctx.fillRect(screenX + PIXEL_SIZE, screenY + 4 * PIXEL_SIZE, this.width - 2 * PIXEL_SIZE, 6 * PIXEL_SIZE);
        ctx.fillStyle = '#F5D0C0';
        ctx.fillRect(screenX + 2.5 * PIXEL_SIZE, screenY + PIXEL_SIZE, 4 * PIXEL_SIZE, 3 * PIXEL_SIZE);
        ctx.fillStyle = '#0000CD';
        ctx.fillRect(screenX + 1.5 * PIXEL_SIZE, screenY, 6 * PIXEL_SIZE, 1.5 * PIXEL_SIZE);
        ctx.fillRect(screenX + 2.5 * PIXEL_SIZE, screenY - PIXEL_SIZE, 4 * PIXEL_SIZE, 1.5 * PIXEL_SIZE);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(Math.round(screenX + this.width/2 - PIXEL_SIZE), screenY + 5 * PIXEL_SIZE, PIXEL_SIZE*2, PIXEL_SIZE*1.5);
        ctx.fillStyle = '#000050';
        ctx.fillRect(screenX + 2 * PIXEL_SIZE, screenY + 10 * PIXEL_SIZE, 5 * PIXEL_SIZE, 3 * PIXEL_SIZE);

        if (this.hasPistol && this.actionState !== 'stunned') { // Mostra pistola se equipaggiata
            ctx.fillStyle = 'dimgrey';
            if(this.direction === 2) ctx.fillRect(screenX + this.width - PIXEL_SIZE*2, screenY + this.height/2.5, PIXEL_SIZE*3, PIXEL_SIZE*2);
            else if(this.direction === 1) ctx.fillRect(screenX - PIXEL_SIZE, screenY + this.height/2.5, PIXEL_SIZE*3, PIXEL_SIZE*2);
        }


        if (this.currentState === 'chasing' && this.isAlive && this.actionState !== 'stunned') {
            const blinkSpeed = gameTime * 7;
            ctx.fillStyle = Math.floor(blinkSpeed) % 2 === 0 ? 'rgba(255,0,0,0.8)' : 'rgba(0,0,255,0.8)';
            ctx.fillRect(Math.round(screenX + this.width/2 - PIXEL_SIZE), screenY - PIXEL_SIZE*2.5, PIXEL_SIZE*2, PIXEL_SIZE*1.5);
        }
         if (this.tempFlashColor) { ctx.fillStyle = this.tempFlashColor; ctx.fillRect(screenX, screenY, this.width, this.height); }
         if (this.actionState === 'stunned') { /* ... stun visivo ... */ }
        ctx.globalAlpha = 1.0;
    }
    alert(crimeX, crimeY, playerInstance) { // Metodo alert come prima
        if (this.currentState === 'patrolling' && this.isAlive) {
            this.targetPlayer = playerInstance;
            const dx = crimeX - this.x;
            const dy = crimeY - this.y;
            if (Math.sqrt(dx*dx + dy*dy) < this.visionRange * 1.2) { // Raggio di allerta leggermente maggiore
                this.currentState = 'chasing';
                this.chaseTimer = 20 + (difficultyFactor * 10); // difficultyFactor non è definito qui, andrebbe passato o calcolato
                if (playerWantedLevel < 2) playerWantedLevel = 2;
                updateWantedLevel();
            }
        }
    }
}

class PoliceShield extends Police {
    constructor(x, y, difficultyFactor) {
        super(x, y, difficultyFactor * 0.85, POLICE_TYPES.SHIELD); // Più lento
        this.health = 50 + Math.floor(difficultyFactor * 30); this.maxHealth = this.health;
        this.shieldHealth = 3 + Math.floor(difficultyFactor * 3); // Scudo regge 3-6 colpi melee/pugni
        this.hasPistol = false;
    }
    takeDamage(amount, attacker) {
        if (this.shieldHealth > 0 && attacker instanceof Player) {
            let weaponUsed = attacker.equippedMelee;
            if (attacker.actionState === 'punching') weaponUsed = {name: "Pugno"}; // Oggetto fittizio per pugno

            if (weaponUsed && weaponUsed.name !== "Pistola") { // Pistola bypassa, pugno/melee no
                this.shieldHealth--; playSound('shield_hit');
                showInteractionMessage("Scudo colpito!", 0.8);
                if (this.shieldHealth <= 0) showInteractionMessage("Scudo rotto!", 1);
                // Stordisci leggermente il player che colpisce lo scudo?
                // attacker.takeStun(0.2);
                return;
            }
        }
        super.takeDamage(amount, attacker); // Danno normale se scudo rotto/bypassato
    }
    draw(ctx, cameraX, cameraY) {
        super.draw(ctx, cameraX, cameraY);
        if (this.isAlive && this.shieldHealth > 0 && this.fadeAlpha > 0) {
            const screenX = Math.round(this.x - cameraX); const screenY = Math.round(this.y - cameraY);
            ctx.globalAlpha = this.fadeAlpha;
            ctx.fillStyle = `rgba(120, 120, 180, ${0.5 + this.shieldHealth * 0.1})`;
            let shieldDrawX = screenX + this.width / 2 - PIXEL_SIZE*3; let shieldDrawY = screenY + PIXEL_SIZE * 2;
            let shieldW = PIXEL_SIZE * 6, shieldH = PIXEL_SIZE * 9;
            if(this.direction === 1){ shieldDrawX = screenX - PIXEL_SIZE*2; shieldW = PIXEL_SIZE * 3; } // Sinistra
            else if(this.direction === 2){ shieldDrawX = screenX + this.width - PIXEL_SIZE; shieldW = PIXEL_SIZE*3; } // Destra
            ctx.fillRect(shieldDrawX, shieldDrawY, shieldW, shieldH);
            ctx.globalAlpha = 1.0;
        }
    }
}
// Quando il player attacca (attemptMeleeAttack, attemptRangedAttack):
// if (enemy instanceof PoliceShield && enemy.shieldHealth > 0 && this.equippedRanged?.name === "Pistola") {
//    enemy.shieldHealth = 0; showInteractionMessage("Pistola ha rotto lo scudo!", 1);
// } // Questa logica va PRIMA di chiamare enemy.takeDamage()

class PoliceTaser extends Police {
    constructor(x, y, difficultyFactor) {
        super(x, y, difficultyFactor * 1.1, POLICE_TYPES.TASER_GUY); // Più veloce
        this.health = 45 + Math.floor(difficultyFactor * 25); this.maxHealth = this.health;
        this.hasPistol = false; this.canUseTaser = true;
        this.taserCooldownBase = 2.5; // Base cooldown, ridotto da difficultyFactor in Police.update
    }
}
class PoliceMounted extends Police {
    constructor(x, y, difficultyFactor) {
        super(x, y, difficultyFactor, POLICE_TYPES.MOUNTED); // Stats del poliziotto
        this.originalSpeed = this.speed;
        this.speed *= 1.8; // Molto più veloce
        this.health = 60 + Math.floor(difficultyFactor * 25); this.maxHealth = this.health; // Salute poliziotto

        this.horseMaxHealth = 70 + Math.floor(difficultyFactor * 50); // 70-120
        this.horseHealth = this.horseMaxHealth;
        this.isMounted = true;
        this.attackRange *= 1.3; // Leggermente più raggio d'attacco melee da cavallo
    }
    takeDamage(amount, attacker) {
        if (this.isMounted) {
            this.horseHealth -= amount; playSound('horse_hurt');
            if (this.horseHealth <= 0) {
                this.isMounted = false; this.speed = this.originalSpeed;
                showInteractionMessage("Cavallo abbattuto!", 1.5);
                // Il cavallo potrebbe diventare un ostacolo o un oggetto per interagirci (es. per cibo?)
                // Per ora, il poliziotto continua a piedi.
            }
        } else { super.takeDamage(amount, attacker); }
    }
    draw(ctx, cameraX, cameraY) {
        // Disegna prima il cavallo se montato, poi il poliziotto sopra
        const screenX = Math.round(this.x - cameraX); const screenY = Math.round(this.y - cameraY);
        ctx.globalAlpha = this.fadeAlpha;
        if (this.isAlive && this.isMounted && this.fadeAlpha > 0) {
            ctx.fillStyle = 'saddlebrown'; // Colore cavallo
            // Corpo cavallo più grande
            ctx.fillRect(screenX - PIXEL_SIZE * 3, screenY + this.height * 0.5, this.width + PIXEL_SIZE * 6, this.height * 0.8);
            // Testa cavallo (semplice)
            let headX = screenX + this.width / 2 - PIXEL_SIZE * 2;
            if (this.direction === 2) headX = screenX + this.width + PIXEL_SIZE; // Destra
            else if (this.direction === 1) headX = screenX - PIXEL_SIZE * 5; // Sinistra
            ctx.fillRect(headX, screenY + this.height * 0.4, PIXEL_SIZE * 4, PIXEL_SIZE * 4);

            // Barra HP cavallo
            if(this.horseHealth < this.horseMaxHealth && this.horseHealth > 0){
                 ctx.fillStyle = 'rgba(100,100,100,0.7)';
                 ctx.fillRect(screenX, screenY - PIXEL_SIZE * 6, this.width, PIXEL_SIZE * 2);
                 ctx.fillStyle = 'pink';
                 ctx.fillRect(screenX, screenY - PIXEL_SIZE * 6, this.width * (this.horseHealth / this.horseMaxHealth), PIXEL_SIZE * 2);
            }
        }
        super.draw(ctx, cameraX, cameraY); // Disegna il poliziotto (sopra il cavallo se montato)
        ctx.globalAlpha = 1.0;
    }
    die(attacker, cityInstance){ // Se muore il poliziotto a cavallo
        this.isMounted = false; // Il cavallo potrebbe scappare o restare
        super.die(attacker, cityInstance);
    }
}

class PoliceJuggernaut extends Police {
    constructor(x, y, difficultyFactor) {
        super(x, y, difficultyFactor * 0.6, POLICE_TYPES.JUGGERNAUT); // Molto lento
        this.health = 180 + Math.floor(difficultyFactor * 120); this.maxHealth = this.health; // 180-300
        this.hasPistol = true; this.pistolAmmo = 20 + Math.floor(difficultyFactor * 20); // Molte munizioni
        this.attackDamageMultiplier *= 1.3; // Danno ancora maggiore
        this.pistolCooldownBase = 1.0; // Spara più velocemente
        this.canUseTaser = false;
    }
    takeDamage(amount, attacker){ // Riduzione danno
        super.takeDamage(amount * 0.6, attacker); // Prende 60% del danno
    }
    // Juggernaut non usa taser, la sua pistola fa più male ed è più resistente
    // L'update di Police gestisce già la pistola.
}
class PoliceObese extends Police {
    constructor(x, y, difficultyFactor) {
        super(x, y, difficultyFactor * 0.75, POLICE_TYPES.OBESE); // Lento
        this.health = 60 + Math.floor(difficultyFactor * 40); this.maxHealth = this.health; // 60-100
        this.hasPistol = Math.random() < 0.2; // Raro che abbia pistola
        this.canUseTaser = false;
    }
    takeDamage(amount, attacker) {
        super.takeDamage(amount * 0.7, attacker); // Prende 70% del danno
    }
    // Potrebbe avere un attacco speciale "carica" o simile (da implementare in update)
}


// ========== CLASSI BOSS (NUOVE) ==========
class Boss extends NPC { // Eredita da NPC per movimento base e interazioni
    constructor(x, y, width, height, speed, type, health, bossName) {
        super(x, y, width, height, speed, type);
        this.health = health; this.maxHealth = health;
        this.isPolice = true; // Trattato come minaccia
        this.isBoss = true; this.bossName = bossName;
        this.actionSequence = []; this.currentActionIndex = 0; this.actionPhaseTimer = 0;
        activeBoss = this; // Imposta come boss attivo
    }
    die(attacker, cityInstance) {
        super.die(attacker, cityInstance);
        showInteractionMessage(`${this.bossName} SCONFITTO!`, 5);
        playSound('boss_defeated'); // Nuovo suono
        activeBoss = null;
        this.dropSpecialItem(cityInstance, attacker);
        // Potrebbe droppare molti skill points
        if(attacker instanceof Player) playerSkillPoints += Math.floor(this.maxHealth / 2); updateSkillPointsUI();
    }
    dropSpecialItem(city, player) { /* Sovrascritto dalle sottoclassi */ }
    // I boss avranno una loro logica di update complessa
    draw(ctx, cameraX, cameraY){ // Disegno base Boss
        super.draw(ctx, cameraX, cameraY); // NPC draw per ora
        if(this.isAlive && this.fadeAlpha > 0){
            const screenX = Math.round(this.x - cameraX); const screenY = Math.round(this.y - cameraY);
            ctx.globalAlpha = this.fadeAlpha;
            // Barra HP Boss
            ctx.fillStyle = 'rgba(50,0,0,0.8)';
            ctx.fillRect(GAME_WIDTH * 0.1, 35, GAME_WIDTH * 0.8, 20);
            ctx.fillStyle = 'rgba(200,0,0,0.8)';
            ctx.fillRect(GAME_WIDTH * 0.1, 35, GAME_WIDTH * 0.8 * (this.health / this.maxHealth), 20);
            ctx.fillStyle = 'white'; ctx.font = `${PIXEL_SIZE * 5}px 'Press Start 2P'`; ctx.textAlign = 'center';
            ctx.fillText(this.bossName, GAME_WIDTH/2, 53);
            ctx.globalAlpha = 1.0;
        }
    }
}

class ComandanteCorrotto extends Boss {
    constructor(x,y) {
        super(x, y, 12 * PIXEL_SIZE, 18 * PIXEL_SIZE, 60, BOSS_TYPES.COMANDANTE_CORROTTO, 750, "Comandante Corrotto");
        this.reinforcementTimer = 0; this.reinforcementCooldown = 15; // Chiama rinforzi ogni 15 sec
        this.shootTimer = 0; this.shootCooldown = 2.5; // Spara ogni 2.5 sec
        this.pistolAmmo = 999; // Munizioni infinite
    }
    takeDamage(amount, attacker){ // Resiste a danno non da pistola
        if (attacker instanceof Player && attacker.equippedRanged?.name === "Pistola"){
            super.takeDamage(amount, attacker);
        } else { super.takeDamage(Math.floor(amount / 3), attacker); } // Danno ridotto da altre fonti
    }
    update(deltaTime, city, player){
        if(!this.isAlive || this.fadingAway || this.actionState === 'stunned') { super.update(deltaTime,city,player); return; }

        this.targetPlayer = player;
        const distanceToPlayer = Math.sqrt(Math.pow(this.x - player.x, 2) + Math.pow(this.y - player.y, 2));
        // Movimento: cerca di mantenere una certa distanza per sparare
        if(distanceToPlayer > PISTOL_RANGE_UNITS * 0.7){
            const moveAmount = this.speed * deltaTime;
            const dx = player.x - this.x, dy = player.y - this.y; const norm = Math.sqrt(dx*dx+dy*dy) || 1;
            this.x += (dx/norm) * moveAmount; this.y += (dy/norm) * moveAmount;
        } else if (distanceToPlayer < PISTOL_RANGE_UNITS * 0.4) { // Troppo vicino, si allontana
            const moveAmount = this.speed * deltaTime * 0.8;
            const dx = this.x - player.x, dy = this.y - player.y; const norm = Math.sqrt(dx*dx+dy*dy) || 1;
            this.x += (dx/norm) * moveAmount; this.y += (dy/norm) * moveAmount;
        }
        if(Math.abs(this.x-player.x) > Math.abs(this.y-player.y)) this.direction = (this.x < player.x) ? 2:1;
        else this.direction = (this.y < player.y) ? 0:3;


        // Azioni
        this.reinforcementTimer += deltaTime;
        this.shootTimer += deltaTime;

        if(this.reinforcementTimer >= this.reinforcementCooldown){
            this.reinforcementTimer = 0;
            showInteractionMessage(`${this.bossName} chiama rinforzi!`, 2);
            const numToSpawn = 2 + Math.floor((1 - this.health/this.maxHealth) * 4); // Più rinforzi se ha poca vita
            for(let i=0; i < numToSpawn; i++){
                const angle = (i / numToSpawn) * Math.PI * 2;
                const spawnDist = (150 + Math.random()*50) * PIXEL_SIZE;
                const spawnX = this.x + Math.cos(angle) * spawnDist;
                const spawnY = this.y + Math.sin(angle) * spawnDist;
                if(city.isValidSpawnLocation(spawnX, spawnY, 'police')){
                    city.spawnPoliceUnit(spawnX, spawnY, city.getDifficultyFactor(spawnX,spawnY)*0.6, city.getZoneAt(spawnX,spawnY), true);
                }
            }
        }
        if(this.shootTimer >= this.shootCooldown && this.actionState === 'idle'){
            this.shootTimer = 0; this.actionState = 'attacking_ranged'; this.actionTimer = 0.5;
            playSound('gun_shot_enemy');
            const dx = (player.x + player.width/2) - (this.x + this.width/2);
            const dy = (player.y + player.height/2) - (this.y + this.height/2);
            const norm = Math.sqrt(dx*dx + dy*dy) || 1;
            // Raffica di 3 colpi
            for(let i=0; i<3; i++){
                setTimeout(() => {
                     if(!this.isAlive) return;
                     const spreadAngle = (Math.random() - 0.5) * 0.2; // Piccola imprecisione
                     const finalDx = Math.cos(Math.atan2(dy,dx) + spreadAngle);
                     const finalDy = Math.sin(Math.atan2(dy,dx) + spreadAngle);
                     city.projectiles.push({ x: this.x + this.width/2, y: this.y + this.height/2, dx: finalDx, dy: finalDy, speed: 300*PIXEL_SIZE, damage: POLICE_PISTOL_DAMAGE_BASE * 1.5, rangeLeft: PISTOL_RANGE_UNITS, owner: this, color: 'crimson'});
                }, i * 100);
            }
        }
        super.update(deltaTime, city, player);
    }
    dropSpecialItem(city, player){
        const item = {
            name: "Medaglia Corrotta", type: "special_item_passive", x:this.x, y:this.y,
            width: PIXEL_SIZE*4, height: PIXEL_SIZE*4,
            description: "I poliziotti standard a volte ignorano crimini minori.",
            interact: (player, cityInstance) => {
                // player.passiveBonuses.push("medaglia_corrotta"); // Da implementare un sistema di bonus passivi
                showInteractionMessage("Hai ottenuto la Medaglia Corrotta!", 3);
                // Questo effetto andrebbe implementato nella logica di alert della polizia
                cityInstance.removeItemFromGround(item);
            }
        };
        city.groundItems.push(item);
    }
}
// Aggiungi GiustiziereCitta se vuoi


// ========== CLASSE CITY (MODIFICATA) ==========
class City {
    constructor() {
        // ... (costruttore esistente con tileSize, gridWidth/Height, grid, colors, ecc.) ...
        this.tileSize = 16 * PIXEL_SIZE;
        this.gridWidth = Math.ceil(CITY_WIDTH / this.tileSize);
        this.gridHeight = Math.ceil(CITY_HEIGHT / this.tileSize);
        this.grid = [];
        this.zoneGrid = [];

        this.EMPTY = 0; this.BUILDING = 1; this.TREE = 2;
        this.WATER = 3; this.PARK = 4;
        this.CHURCH = 5; this.POLICE_HQ_TILE = 6; // Nuovi tipi di tile per focus points

        this.colors = {
            [this.EMPTY]: '#4A4A4A', [this.BUILDING]: '#787878',
            [this.TREE]: '#2E8B57', [this.WATER]: '#4682B4',
            [this.PARK]: '#90EE90',
            [this.CHURCH]: '#D2B48C', [this.POLICE_HQ_TILE]: '#6A5ACD' // Colori per nuovi tile
        };
        this.vehicles = []; this.npcs = []; this.trashCans = [];
        this.doors = []; this.fallingCoins = []; this.treeStates = new Map();
        this.projectiles = []; this.groundItems = [];


        this.generateCity(); // Include generazione focus points e zone
        this.initializeZoneGrid(); // Ora chiamato dopo generateCity per usare i focus points reali
        this.generateGroundItems();
        this.generateVehicles();
        this.generateNPCs(); // Ora usa zone e difficoltà
        this.generateTrashCans();
        this.generateDoors();
        this.generateInteractableLocations(); // Farmacie, ecc.
    }

    generateCity() { // Modificato per posizionare focus points
        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) this.grid[y][x] = this.EMPTY;
        }
        this.createMainStreets(); this.addWaterAndParks(); this.addBuildings();

        // Posiziona i punti focali sulla mappa
        for(const zoneKey in ZONE_FOCUS_POINTS){
            const focus = ZONE_FOCUS_POINTS[zoneKey];
            const gx = Math.floor(focus.x / this.tileSize);
            const gy = Math.floor(focus.y / this.tileSize);
            if(this.grid[gy]?.[gx] !== undefined){
                if(focus.type === 'church') this.grid[gy][gx] = this.CHURCH;
                else if(focus.type === 'police_hq') this.grid[gy][gx] = this.POLICE_HQ_TILE;
                else this.grid[gy][gx] = this.BUILDING; // Default a edificio se tipo non mappato
                // Rendi l'area attorno al focus coerente (es. strade per HQ polizia)
                for(let oy = -1; oy <= 1; oy++) for(let ox = -1; ox <= 1; ox++){
                    if(this.grid[gy+oy]?.[gx+ox] === this.EMPTY && focus.type === 'police_hq') this.grid[gy+oy][gx+ox] = this.EMPTY; // Assicura strade
                    else if (this.grid[gy+oy]?.[gx+ox] === this.EMPTY && focus.type === 'church') this.grid[gy+oy][gx+ox] = this.PARK; // Parco attorno chiesa
                }

            }
        }
        this.addTrees(); this.addBridges();
    }

    initializeZoneGrid() { // Ora usa i focus points REALI sulla mappa
        const halfW = CITY_WIDTH / 2, halfH = CITY_HEIGHT / 2;
        for (let gy = 0; gy < this.gridHeight; gy++) {
            this.zoneGrid[gy] = [];
            for (let gx = 0; gx < this.gridWidth; gx++) {
                const worldX = gx * this.tileSize + this.tileSize / 2;
                const worldY = gy * this.tileSize + this.tileSize / 2;
                let assignedZone = ZONES.NONE;
                let minDistToFocus = Infinity;

                for(const zKey in ZONE_FOCUS_POINTS){
                    const focus = ZONE_FOCUS_POINTS[zKey];
                    const dist = Math.sqrt(Math.pow(worldX - focus.x,2) + Math.pow(worldY - focus.y,2));
                    if(dist < minDistToFocus){
                        minDistToFocus = dist;
                        assignedZone = zKey; // Assegna alla zona del focus più vicino
                    }
                }
                // Se ancora NONE o troppo lontano da qualsiasi focus, assegna zona geografica
                if (assignedZone === ZONES.NONE || minDistToFocus > CITY_WIDTH / 2.5) {
                    if (worldY < halfH) assignedZone = (worldX < halfW) ? ZONES.OVEST : ZONES.EST;
                    else assignedZone = (worldX < halfW) ? ZONES.OVEST : ZONES.EST;
                    if (Math.abs(worldX - halfW) < CITY_WIDTH / 5 && worldY < halfH) assignedZone = ZONES.NORD;
                    else if (Math.abs(worldX - halfW) < CITY_WIDTH / 5 && worldY >= halfH) assignedZone = ZONES.SUD;
                    if (Math.abs(worldX-halfW) < CITY_WIDTH/6 && Math.abs(worldY-halfH) < CITY_HEIGHT/6) assignedZone = ZONES.CENTRO;
                }
                this.zoneGrid[gy][gx] = assignedZone;
            }
        }
    }
    // getZoneAt e getDifficultyFactor come prima

    generateInteractableLocations() {
        // Farmacie (esempio: 2 farmacie)
        for(let i=0; i<2; i++){
            let x,y,gx,gy, attempts=0;
            do {
                x = Math.random() * (CITY_WIDTH - 50); y = Math.random() * (CITY_HEIGHT - 50);
                gx = Math.floor(x/this.tileSize); gy = Math.floor(y/this.tileSize);
                attempts++;
            } while((!this.grid[gy]?.[gx] === this.EMPTY || this.getZoneAt(x,y) === ZONES.CENTRO ) && attempts < 50); // Non nel centro, su strada

            if(attempts < 50){
                interactableLocations.pharmacies.push({
                    x, y, width: PIXEL_SIZE*15, height: PIXEL_SIZE*10,
                    lastHealTime: 0, type: 'pharmacy_location',
                    // Non serve un interact() qui, la logica è in City.updateWorld
                });
            }
        }
        // Bancarelle Cibo (esempio: 3 bancarelle)
        // ... simile logica per spawnare, con metodo interact per comprare cibo
    }


    generateGroundItems() {
        this.groundItems = []; // Svuota prima
        const itemTypes = [
            { key: "weapon_stick", count: 20, constructor: () => new Weapon("Bastone", "melee", STICK_DAMAGE, PLAYER_MELEE_RANGE * 1.2, 0.9, 20 + Math.floor(Math.random()*15)) }, // Durabilità variabile
            { key: "consumable_bottle_vodka", count: 10, constructor: (x,y) => ({ name: "Vodka", type: "consumable_alcohol", effect: "vodka", x,y, width:PIXEL_SIZE*2, height:PIXEL_SIZE*4, interact: (p,c)=>{ p.consumeAlcohol("vodka"); c.removeItemFromGround(this);}}) },
            { key: "consumable_bottle_birra", count: 15, constructor: (x,y) => ({ name: "Birra", type: "consumable_alcohol", effect: "birra", x,y, width:PIXEL_SIZE*2, height:PIXEL_SIZE*4, interact: (p,c)=>{ p.consumeAlcohol("birra"); c.removeItemFromGround(this);}}) },
            // { key: "weapon_pistol_ammo", count: 8, constructor: (x,y) => ({ name: "Munizioni Pistola", type: "ammo_pistol", amount: PISTOL_CLIP_SIZE, x,y, width:PIXEL_SIZE*3, height:PIXEL_SIZE*2, interact: (p,c)=>{ p.pickupAmmo(this.amount); c.removeItemFromGround(this);}}) },
        ];
        itemTypes.forEach(it => {
            for(let i=0; i < it.count; i++) this.spawnGroundItem(it.constructor);
        });
        // Spawn Munizioni Pistola (separato per logica quantità)
        for(let i=0; i<8; i++){
             this.spawnGroundItem((x,y) => ({ name: "Munizioni", type: "ammo_pistol", amount: PISTOL_CLIP_SIZE + Math.floor(Math.random() * PISTOL_CLIP_SIZE), x,y, width:PIXEL_SIZE*3, height:PIXEL_SIZE*2, interact: function(p,c){ p.pickupAmmo(this.amount); c.removeItemFromGround(this);}}));
        }


    }
    spawnGroundItem(itemConstructor) {
        let validPosition = false, itemX, itemY, attempts = 0;
        while(!validPosition && attempts < 50){
            itemX = Math.random() * (CITY_WIDTH - PIXEL_SIZE*4); itemY = Math.random() * (CITY_HEIGHT - PIXEL_SIZE*4);
            const gx = Math.floor(itemX / this.tileSize); const gy = Math.floor(itemY / this.tileSize);
            if (this.grid[gy]?.[gx] === this.EMPTY || this.grid[gy]?.[gx] === this.PARK) {
                // Controlla che non sia troppo vicino ad altri item
                let tooClose = this.groundItems.some(gi => Math.sqrt(Math.pow(gi.x-itemX,2)+Math.pow(gi.y-itemY,2)) < this.tileSize * 1.5);
                if(!tooClose) validPosition = true;
            }
            attempts++;
        }
        if(validPosition) {
            const item = itemConstructor(itemX, itemY); // Passa x,y al costruttore
            // Se il costruttore non setta x,y (come per Weapon), settali ora
            if(item.x === undefined) item.x = itemX;
            if(item.y === undefined) item.y = itemY;
            this.groundItems.push(item);
        }
    }
    removeItemFromGround(itemToRemove){ // Assicurati che itemToRemove sia l'oggetto effettivo
        const index = this.groundItems.findIndex(item => item.id === itemToRemove.id || item === itemToRemove);
        if (index > -1) this.groundItems.splice(index, 1);
    }
    handleInteractionDrop(playerInstance) { // Chiamato da Civilian.interact o Player.tryAttack
        const RND = Math.random() * 100;
        let cappellaioBonus = playerPermanentBonuses.cappellaioMatto * 0.05; // 5% per livello
        let droppedWeapon = null;
        // Probabilità base + bonus cappellaio
        if (RND < 2.0 * (1 + cappellaioBonus)) droppedWeapon = new Weapon("Pistola", "ranged", PLAYER_PISTOL_DAMAGE_BASE, PISTOL_RANGE_UNITS, 1.3, Infinity, PISTOL_CLIP_SIZE);
        else if (RND < (2.0+3.0) * (1 + cappellaioBonus)) droppedWeapon = new Weapon("Coltello", "melee", KNIFE_DAMAGE, PLAYER_MELEE_RANGE, 1.0, 8 + Math.floor(Math.random()*5)); // Durabilità variabile
        else if (RND < (2.0+3.0+4.0) * (1 + cappellaioBonus)) droppedWeapon = new Weapon("Mazza", "melee", MAUL_DAMAGE, PLAYER_MELEE_RANGE * 1.3, 1.1, 15 + Math.floor(Math.random()*10));

        if (droppedWeapon) {
            droppedWeapon.x = playerInstance.x + (Math.random() - 0.5) * 60 * PIXEL_SIZE;
            droppedWeapon.y = playerInstance.y + (Math.random() - 0.5) * 60 * PIXEL_SIZE;
            // Clamp x,y entro la città
            droppedWeapon.x = Math.max(0, Math.min(CITY_WIDTH - (droppedWeapon.width || PIXEL_SIZE*4), droppedWeapon.x));
            droppedWeapon.y = Math.max(0, Math.min(CITY_HEIGHT - (droppedWeapon.height || PIXEL_SIZE*4), droppedWeapon.y));
            this.groundItems.push(droppedWeapon);
            showInteractionMessage(`È caduta un'arma: ${droppedWeapon.name}!`, 2);
            return true;
        } return false;
    }

    // updateWorld (aggiungi gestione proiettili e spawn polizia)
    updateWorld(deltaTime, playerInstance) {
        // ... (Update veicoli come prima) ...
        this.vehicles.forEach(vehicle => { /* ... */ });

        // Update NPC (già gestisce fadeAlpha e rimozione)
        for (let i = this.npcs.length - 1; i >= 0; i--) {
            const npc = this.npcs[i];
            npc.update(deltaTime, this, playerInstance);
            if (npc.fadeAlpha <= 0 && !npc.isAlive) this.npcs.splice(i, 1);
        }
        // Update Proiettili
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.x += p.dx * p.speed * deltaTime; p.y += p.dy * p.speed * deltaTime;
            p.rangeLeft -= p.speed * deltaTime;
            let hit = false;
            if (p.rangeLeft <= 0) { this.projectiles.splice(i, 1); continue; }

            if (p.owner !== playerInstance && // Non colpire se stesso
                p.x > playerInstance.x && p.x < playerInstance.x + playerInstance.width &&
                p.y > playerInstance.y && p.y < playerInstance.y + playerInstance.height) {
                playerInstance.takeDamage(p.damage, p.owner); hit = true;
            } else if (p.owner === playerInstance) {
                for (const npc of this.npcs) {
                    if (npc.isPolice && npc.isAlive && !npc.fadingAway &&
                        p.x > npc.x && p.x < npc.x + npc.width &&
                        p.y > npc.y && p.y < npc.y + npc.height) {
                        npc.takeDamage(p.damage, p.owner); hit = true; break;
                    }
                }
            }
            const gridX = Math.floor(p.x / this.tileSize); const gridY = Math.floor(p.y / this.tileSize);
            if(this.grid[gridY]?.[gridX] === this.BUILDING || this.grid[gridY]?.[gridX] === this.CHURCH || this.grid[gridY]?.[gridX] === this.POLICE_HQ_TILE){
                hit = true; playSound('bullet_hit_wall');
            }
            if (hit) this.projectiles.splice(i, 1);
        }
        // Update Cestini, Monete Cadenti (come prima)
        this.trashCans.forEach(tc => tc.update(deltaTime, this));
        this.fallingCoins.forEach((fc, i) => { /* ... */ if(fc.life <=0) this.fallingCoins.splice(i,1); });

        // Logica Spawn Polizia per Wanted Level
        if (playerWantedLevel > 0 && activeBoss === null) { // Non spawnare polizia se c'è un boss
            timeAtCurrentWantedLevel += deltaTime;
            policeSpawnTimer += deltaTime;
            if (policeSpawnTimer >= POLICE_SPAWN_INTERVAL) {
                policeSpawnTimer = 0;
                let numToSpawn = 0;
                const timeFactor = Math.floor(timeAtCurrentWantedLevel / (15 - playerWantedLevel)); // Più veloce a WL alti
                if (playerWantedLevel === 1) numToSpawn = 0 + timeFactor; // 1 ogni 14 sec
                else if (playerWantedLevel === 2) numToSpawn = 1 + timeFactor; // 1+1 ogni 13 sec
                else if (playerWantedLevel === 3) numToSpawn = 1 + timeFactor; // 1+1 ogni 12 sec
                else if (playerWantedLevel === 4) numToSpawn = 2 + timeFactor; // 2+1 ogni 11 sec
                else if (playerWantedLevel >= 5) numToSpawn = 2 + timeFactor; // 2+1 ogni 10 sec

                numToSpawn = Math.min(numToSpawn, playerWantedLevel +1 , 5); // Max 5 per volta
                if (hasRespawnMalus) numToSpawn = Math.min(6, numToSpawn + 1); // Malus aggiunge +1

                for (let i = 0; i < numToSpawn; i++) {
                    const spawnAngle = Math.random() * Math.PI * 2;
                    const spawnDist = (GAME_WIDTH / 2 + Math.random() * 150) * PIXEL_SIZE;
                    let spawnX = playerInstance.x + Math.cos(spawnAngle) * spawnDist;
                    let spawnY = playerInstance.y + Math.sin(spawnAngle) * spawnDist;
                    spawnX = Math.max(20, Math.min(CITY_WIDTH - 20, spawnX));
                    spawnY = Math.max(20, Math.min(CITY_HEIGHT - 20, spawnY));

                    if(this.isValidSpawnLocation(spawnX, spawnY, 'police')){
                        const difficultyFactor = this.getDifficultyFactor(spawnX, spawnY);
                        const zone = this.getZoneAt(spawnX, spawnY);
                        this.spawnPoliceUnit(spawnX, spawnY, difficultyFactor, zone, true);
                    }
                }
            }
        } else { timeAtCurrentWantedLevel = 0; policeSpawnTimer = 0; }

        // Interazioni Farmacie
        interactableLocations.pharmacies.forEach(pharma => {
            const distToPlayer = Math.sqrt(Math.pow(playerInstance.x + playerInstance.width/2 - (pharma.x + pharma.width/2), 2) +
                                       Math.pow(playerInstance.y + playerInstance.height/2 - (pharma.y + pharma.height/2), 2));
            if (distToPlayer < pharma.width * 0.8) { // Raggio interazione farmacia
                if(Date.now() - (pharma.lastHealTime || 0) > 800){ // Ogni 0.8 sec
                    if(playerInstance.health < playerInstance.maxHealth){
                        playerInstance.health = Math.min(playerInstance.maxHealth, playerInstance.health + playerInstance.maxHealth * 0.05); // 5% cura
                        updateHealthUI(); playSound('heal');
                    }
                    pharma.lastHealTime = Date.now();
                }
            }
        });
        // Logica Boss (se presente)
        if (activeBoss) {
            activeBoss.update(deltaTime, this, playerInstance);
            if (!activeBoss.isAlive && activeBoss.fadeAlpha <=0) activeBoss = null; // Rimuovi se morto e dissolto
        } else { // Controlla se spawnare un boss
            this.trySpawnBoss(playerInstance);
        }

    }
    trySpawnBoss(playerInstance){
        if(activeBoss) return; // Già un boss attivo

        // Esempio: Comandante Corrotto appare se WL >= 4 e nel centro per un po'
        if(playerWantedLevel >= 4 && this.getZoneAt(playerInstance.x, playerInstance.y) === ZONES.CENTRO && Math.random() < 0.001){ // Bassa probabilità per frame
            const focusHQ = ZONE_FOCUS_POINTS[ZONES.CENTRO];
            const spawnX = focusHQ.x + (Math.random()-0.5) * 100 * PIXEL_SIZE;
            const spawnY = focusHQ.y + (Math.random()-0.5) * 100 * PIXEL_SIZE;
            if(this.isValidSpawnLocation(spawnX, spawnY, 'boss')){
                activeBoss = new ComandanteCorrotto(spawnX, spawnY);
                this.npcs.push(activeBoss); // Aggiungi ai normali NPC per disegno e update base
                showInteractionMessage(`SFIDA BOSS: ${activeBoss.bossName} è apparso!`, 4);
                playSound('boss_spawn');
            }
        }
        // Aggiungi logica per altri boss
    }

    // draw (aggiungi disegno proiettili e ground items)
    draw() {
        // ... (Disegno tile come prima) ...
        const startCol = Math.max(0,Math.floor(cameraX / this.tileSize));
        const endCol = Math.min(this.gridWidth, startCol + Math.ceil(GAME_WIDTH / this.tileSize) + 2); // +2 per sicurezza culling
        const startRow = Math.max(0,Math.floor(cameraY / this.tileSize));
        const endRow = Math.min(this.gridHeight, startRow + Math.ceil(GAME_HEIGHT / this.tileSize) + 2);

        for (let y = startRow; y < endRow; y++) {
            for (let x = startCol; x < endCol; x++) {
                if (!this.grid[y]?.[x] === undefined) continue;
                const tileWorldX = x * this.tileSize; const tileWorldY = y * this.tileSize;
                const screenX = Math.round(tileWorldX - cameraX); const screenY = Math.round(tileWorldY - cameraY);
                const type = this.grid[y][x];

                ctx.fillStyle = this.colors[type] || 'magenta';
                ctx.fillRect(screenX, screenY, this.tileSize+1, this.tileSize+1); // +1 per evitare linee sottili

                if (type === this.BUILDING) this.drawBuilding(screenX, screenY, x,y);
                else if (type === this.TREE) this.drawTree(screenX, screenY);
                else if (type === this.EMPTY) this.drawRoad(screenX, screenY, x, y);
                else if (type === this.PARK) this.drawPark(screenX, screenY);
                else if (type === this.CHURCH) { ctx.fillStyle = '#B0A090'; ctx.fillRect(screenX,screenY,this.tileSize,this.tileSize); /* Disegno chiesa */ }
                else if (type === this.POLICE_HQ_TILE) { ctx.fillStyle = '#4050D0'; ctx.fillRect(screenX,screenY,this.tileSize,this.tileSize); /* Disegno HQ */}
            }
        }


        this.trashCans.forEach(tc => tc.draw(ctx, cameraX, cameraY));
        this.doors.forEach(door => door.draw(ctx, cameraX, cameraY));
        // Disegno Farmacie e Bancarelle
        [...interactableLocations.pharmacies, ...interactableLocations.foodStalls].forEach(loc => {
            const screenX = Math.round(loc.x - cameraX); const screenY = Math.round(loc.y - cameraY);
            if (screenX + loc.width < 0 || screenX > GAME_WIDTH || screenY + loc.height < 0 || screenY > GAME_HEIGHT) return;
            if(loc.type === 'pharmacy_location'){
                ctx.fillStyle = 'rgba(180, 255, 180, 0.8)'; ctx.fillRect(screenX, screenY, loc.width, loc.height);
                ctx.fillStyle = 'darkgreen'; ctx.font = `${PIXEL_SIZE*6}px Arial`; ctx.textAlign="center";
                ctx.fillText("+", screenX + loc.width/2, screenY + loc.height/2 + PIXEL_SIZE*2);
            } // Aggiungi disegno per foodStalls
        });

        this.groundItems.forEach(item => {
            const screenX = Math.round(item.x - cameraX); const screenY = Math.round(item.y - cameraY);
            const w = item.width || PIXEL_SIZE*4; const h = item.height || PIXEL_SIZE*4;
            if (screenX + w < 0 || screenX > GAME_WIDTH || screenY + h < 0 || screenY > GAME_HEIGHT) return;

            let itemColor = 'grey';
            if (item instanceof Weapon) itemColor = item.type === 'melee' ? 'silver' : 'darkgoldenrod';
            else if (item.type?.includes('consumable')) itemColor = 'lightblue';
            else if (item.type?.includes('ammo')) itemColor = 'khaki';
            ctx.fillStyle = itemColor;
            ctx.fillRect(screenX, screenY, w, h);
            if(item.name){
                ctx.fillStyle = "black"; ctx.font = `${PIXEL_SIZE*2.5}px Arial`; ctx.textAlign="center";
                ctx.fillText(item.name.substring(0,4), screenX + w/2, screenY - PIXEL_SIZE);
            }
        });

        this.vehicles.forEach(v => this.drawVehicle(v));
        this.npcs.forEach(npc => npc.draw(ctx, cameraX, cameraY)); // Boss è in npcs, verrà disegnato qui
        // Il disegno specifico del Boss (barra HP) è nel suo metodo draw()

        this.projectiles.forEach(p => {
            const screenX = Math.round(p.x - cameraX); const screenY = Math.round(p.y - cameraY);
            ctx.fillStyle = p.color;
            ctx.fillRect(screenX - PIXEL_SIZE, screenY - PIXEL_SIZE, PIXEL_SIZE * 2, PIXEL_SIZE * 2);
        });
        this.fallingCoins.forEach(fc => { /* ... disegno monete ... */ });
    }
    // ... (altri metodi City come spawnFallingCoins, checkVehicleCollisions, drawBuilding, ecc. rimangono simili)
}

// ========== GESTIONE INPUT (MODIFICATA) ==========
document.addEventListener('keydown', (event) => {
    if (!gameStarted && event.key.toLowerCase() === 'enter') { startGame(); return; }
    if (!gameStarted) return;

    // Se il player è stordito, permetti solo alcuni input (es. menu, ma non azioni di gioco)
    if (player.actionState === 'stunned') return;

    // Input validi anche se nel veicolo (per scendere)
    if (player.isInVehicle) {
        if (event.key.toLowerCase() === INTERACT_KEY) player.isInteracting = true; // Per scendere
        return; // No altri input se nel veicolo
    }

    // Input di gioco normale
    switch (event.key.toLowerCase()) {
        case 'w': case 'arrowup': player.moveUp = true; break;
        case 's': case 'arrowdown': player.moveDown = true; break;
        case 'a': case 'arrowleft': player.moveLeft = true; break;
        case 'd': case 'arrowright': player.moveRight = true; break;
        case 'm': showMinimap = !showMinimap; break;
        case INTERACT_KEY: player.isInteracting = true; break;
        // Tasti Combattimento
        case PUNCH_KEY: player.attemptPunch(city); break;
        case MELEE_WEAPON_KEY: player.attemptMeleeAttack(city); break;
        case RANGED_WEAPON_KEY: player.attemptRangedAttack(city); break;
        case PARRY_KEY: player.attemptParry(); break;
        case RELOAD_KEY: player.attemptReload(); break;
        case 'tab':
            event.preventDefault(); player.cycleMeleeWeapon(); break;
        // Tasti per comprare bonus (DEBUG/TEST)
        case '7': buyPermanentBonus('guardianoDelDestino'); break;
        case '8': buyPermanentBonus('cappellaioMatto'); break;
        case '9': buyPermanentBonus('cowboy'); break;
        case '0': buyPermanentBonus('galantuomo'); break;
        case 'u': upgradePlayerWeapon(); break; // Funzione da creare per testare upgrade armi

    }
});
// keyup rimane uguale

// ========== INTERFACCIA DI GIOCO (MODIFICATA) ==========
function updateHealthUI() {
    if(healthBarFillElement && healthBarTextElement && player){
        const healthPercentage = (player.health / player.maxHealth) * 100;
        healthBarFillElement.style.width = `${healthPercentage}%`;
        healthBarTextElement.textContent = `${player.health} / ${player.maxHealth}`;
        if(healthPercentage < 30) healthBarFillElement.style.backgroundColor = 'red';
        else if (healthPercentage < 60) healthBarFillElement.style.backgroundColor = 'orange';
        else healthBarFillElement.style.backgroundColor = 'green';
    }
}
function updateSkillPointsUI(){
    if(skillPointsElement) skillPointsElement.textContent = playerSkillPoints;
}

function drawInterface() {
    // Barra Superiore Info (Monete, Tempo, Wanted) come prima
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, GAME_WIDTH, 30 + PIXEL_SIZE*2);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${PIXEL_SIZE * 5}px 'Press Start 2P', Arial, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`$${coins}`, 10, 20 + PIXEL_SIZE);
    ctx.textAlign = 'right';
    ctx.fillText(`T:${gameTime.toFixed(0)} SP:${playerSkillPoints}`, GAME_WIDTH - 10, 20 + PIXEL_SIZE); // Aggiunto SP
    ctx.textAlign = 'center';
    let wantedColor = '#FFFFFF';
    if (playerWantedLevel === 1) wantedColor = 'orange'; else if (playerWantedLevel >= 2) wantedColor = 'red';
    ctx.fillStyle = wantedColor;
    ctx.fillText(`WANTED: ${'*'.repeat(playerWantedLevel)}${'_'.repeat(Math.max(0,5-playerWantedLevel))}`, GAME_WIDTH / 2, 20 + PIXEL_SIZE);


    // Info Armi (sotto la barra HP HTML)
    const uiStartY = 80; // Posizione Y per iniziare a disegnare info armi
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${PIXEL_SIZE * 4}px 'Press Start 2P'`;
    ctx.textAlign = 'left';

    const meleeDisplay = player.equippedMelee ? `${player.equippedMelee.name} (${player.equippedMelee.durability})` : "Pugni";
    ctx.fillText(`Arma: ${meleeDisplay}`, 10, uiStartY);

    if (player.equippedRanged && player.equippedRanged.name === "Pistola") {
        ctx.fillText(`Pistola: ${playerCurrentPistolClip}/${playerPistolAmmo}`, 10, uiStartY + PIXEL_SIZE * 6);
    } else {
        ctx.fillText(`Pistola: N/A`, 10, uiStartY + PIXEL_SIZE * 6);
    }
    // Cooldowns Visivi (opzionale, per debug o come barre UI)
    const cooldownBarY = uiStartY + PIXEL_SIZE * 12;
    const barWidth = PIXEL_SIZE * 20;
    const barHeight = PIXEL_SIZE * 3;
    // Parry Cooldown
    if(playerParryCooldown > 0){
        ctx.fillStyle = "lightblue";
        ctx.fillRect(10, cooldownBarY, barWidth * (playerParryCooldown / 1.0), barHeight); // 1.0 è il max cooldown parry
        ctx.strokeRect(10, cooldownBarY, barWidth, barHeight);
    }
    // Melee Cooldown
    if(playerMeleeAttackCooldown > 0 && player.equippedMelee){
         ctx.fillStyle = "lightcoral";
         ctx.fillRect(10 + barWidth + 5, cooldownBarY, barWidth * (playerMeleeAttackCooldown / player.equippedMelee.cooldown), barHeight);
         ctx.strokeRect(10 + barWidth + 5, cooldownBarY, barWidth, barHeight);
    }


    // Messaggi Interazione e Stun (come prima)
    if (interactionMessage) { /* ... */ }
    if (playerStunDuration > 0 && player.actionState === 'stunned') {
        ctx.fillStyle = "yellow"; ctx.textAlign = "center"; ctx.font = `${PIXEL_SIZE * 6}px 'Press Start 2P'`;
        ctx.fillText(`STORDITO!`, GAME_WIDTH/2, GAME_HEIGHT - 80);
        ctx.font = `${PIXEL_SIZE * 4}px 'Press Start 2P'`;
        ctx.fillText(`${playerStunDuration.toFixed(1)}s`, GAME_WIDTH/2, GAME_HEIGHT - 55);
    }


    if (showMinimap && minimap) minimap.draw(player);
    if (!gameStarted) { /* ... schermata iniziale ... */ }
}

// ========== FUNZIONI BONUS PERMANENTI (NUOVE) ==========
function buyPermanentBonus(bonusName) {
    if(!player) return; // Gioco non ancora inizializzato
    let currentLevel = playerPermanentBonuses[bonusName];
    let cost = 0, maxLevel = 0, description = "";

    switch(bonusName) {
        case 'guardianoDelDestino': // +HP Max
            cost = 10 * Math.pow(2, currentLevel); maxLevel = 5;
            description = `Aumenta HP Max di 10 per liv. (Att: ${player.maxHealth})`;
            break;
        case 'cappellaioMatto': // +Chance Drop Oggetti
            cost = 15 * Math.pow(2, currentLevel); maxLevel = 5;
            description = `+5% chance drop oggetti rari per liv.`;
            break;
        case 'cowboy': // +Max Munizioni Pistola
            cost = 8 * Math.pow(2, currentLevel); maxLevel = 10;
            const maxAmmoWithBonus = MAX_PISTOL_AMMO_CARRIED + (currentLevel * 5);
            description = `+5 munizioni max pistola per liv. (Att: ${maxAmmoWithBonus})`;
            break;
        case 'galantuomo': // Riduzione guadagno Wanted Level
            cost = 20 * Math.pow(2, currentLevel); maxLevel = 8; // Max 40% riduzione
            description = `-5% guadagno Wanted Level per liv.`;
            break;
        // Aggiungi altri bonus qui
    }
    if (currentLevel >= maxLevel) { showInteractionMessage("Bonus già al massimo livello!", 2); return; }
    if (playerSkillPoints >= cost) {
        playerSkillPoints -= cost;
        playerPermanentBonuses[bonusName]++;
        showInteractionMessage(`${bonusName} L.${playerPermanentBonuses[bonusName]}! (Costo prox: ${cost*2})`, 3);
        player.applyPermanentBonuses(); // Riapplica effetti (es. cura per +HP)
        updateSkillPointsUI();
        // updateBonusUI(); // Aggiorna UI se hai una schermata bonus
    } else { showInteractionMessage(`Punti insufficenti per ${bonusName}. Servono ${cost}. Hai ${playerSkillPoints}.`, 3); }
}

function upgradePlayerWeapon(){ // Funzione di test per potenziare arma equipaggiata
    if(!player || !player.equippedMelee) { showInteractionMessage("Nessuna arma melee equipaggiata.",1); return; }
    const weaponName = player.equippedMelee.name;
    if(!playerWeaponUpgrades[weaponName]) playerWeaponUpgrades[weaponName] = 0;

    let currentUpgradeLevel = playerWeaponUpgrades[weaponName];
    const upgradeCost = 5 * Math.pow(3, currentUpgradeLevel); // Costo crescente
    const maxUpgradeLevel = 3;

    if(currentUpgradeLevel >= maxUpgradeLevel){showInteractionMessage(`${weaponName} già al max upgrade!`, 2); return;}
    if(playerSkillPoints >= upgradeCost){
        playerSkillPoints -= upgradeCost;
        playerWeaponUpgrades[weaponName]++;
        showInteractionMessage(`${weaponName} potenziata a +${playerWeaponUpgrades[weaponName]}! Danno: ${player.equippedMelee.effectiveDamage}`, 2);
        updateSkillPointsUI();
    } else {
        showInteractionMessage(`Servono ${upgradeCost} SP per potenziare ${weaponName}.`, 2);
    }
}


// ========== INIZIALIZZAZIONE E LOOP ==========
// init(), startGame(), gameLoop() come nella risposta precedente,
// ma init() ora chiama anche:
function init() {
    city = new City();
    player = new Player(CITY_WIDTH / 2, CITY_HEIGHT / 2, PIXEL_SIZE * 8, PIXEL_SIZE * 12, 100); // Velocità px/sec
    minimap = new Minimap(city, PIXEL_SIZE * 60, PIXEL_SIZE * 45); // Minimappa più grande

    // city.generateGroundItems(); // Chiamato già nel costruttore di City
    updateWantedLevel();
    updateSkillPointsUI();
    updateHealthUI(); // Inizializza barra salute
    drawInterface(); // Mostra schermata iniziale
}
// La funzione resetGameEntities in startGame() dovrebbe anche resettare:
// playerSkillPoints = 0; (se vuoi che si resettino a ogni morte/arresto, altrimenti no)
// playerPermanentBonuses (non si resettano, sono permanenti)
// playerWeaponUpgrades (potrebbero resettarsi o no, a tua scelta)
// timeAtCurrentWantedLevel = 0; policeSpawnTimer = 0; hasRespawnMalus = false;
// activeBoss = null;
// playerPistolAmmo, playerCurrentPistolClip, playerStunDuration, ecc.
// interactableLocations (es. lastHealTime delle farmacie)
// Esempio di reset più completo in startGame (prima di `lastTimestamp = ...`):
/*
function startGame() {
    // ...
    resetGameEntities(); // Esistente
    playerSkillPoints = 0; updateSkillPointsUI(); // Resetta SP se vuoi
    playerPistolAmmo = 0; playerCurrentPistolClip = 0;
    playerStunDuration = 0; playerStunResistance = playerPermanentBonuses.galantuomo * 0.03; // Resistenza base da bonus
    playerParryCooldown = 0; playerMeleeAttackCooldown = 0; playerRangedAttackCooldown = 0;
    timeAtCurrentWantedLevel = 0; policeSpawnTimer = 0; hasRespawnMalus = false;
    activeBoss = null;
    interactableLocations.pharmacies.forEach(p => p.lastHealTime = 0);
    // ...
}
*/

// Aggiungi questo al tuo HTML se non l'hai già fatto:
/*
<div id="player-stats" style="position: absolute; top: 10px; right: 10px; color: white; background-color: rgba(0,0,0,0.5); padding: 5px; border-radius: 3px; font-family: 'Press Start 2P', sans-serif; font-size: calc(3px * 4);">
    <p style="margin: 2px 0;">Punti Skill: <span id="skill-points">0</span></p>
    <div id="health-bar-container" style="width: 100px; height: calc(3px * 5); background-color: #555; border: 1px solid #ccc; margin-top: 3px;">
        <div id="health-bar-fill" style="width: 100%; height: 100%; background-color: green;"></div>
    </div>
    <p id="health-bar-text" style="margin: 1px 0; font-size: calc(3px*3); text-align: center;">100 / 100</p>
</div>
*/

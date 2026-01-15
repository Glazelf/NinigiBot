import getLevelFromExp from "./getLevelFromExp.js";

// Might be good to rewrite around Math.random() in this file but it's a hassle to test battles for this and these uses pose no security risk

const battleMoves = [
    // [chance, [name, attack, knockout]],
    [0, ['Judgement Storm', 2, 2]],
    [3, ['Light Thunder', 1, 0.4]],
    [5, ['Dark Thunder', 0.6, 0.4]],
    [10, ['Bolt Strike', 0.3, 0.5]],
    [20, ['Volt Tackle', 0.6, 0.15]],
    [30, ['Thunder', 0.4, 0.25]],
    [40, ['Wild charge', 0.5, 0.1]],
    [50, ['Crunch', 0.2, 0.25]],
    [60, ['Spark', 0.30, 0.1]],
    [80, ['Bite', 0.24, 0.12]],
    [90, ['Thunder shock', 0.24, 0.1]],
    [100, ['Tackle', 0.2, 0.1]]
];

const getMove = (number: any) => {
    for (let i = 0; i < battleMoves.length; i++) if (number * 100 <= battleMoves[i][0]) return battleMoves[i][1];
};

const gainedExp = (lvl: any) => {
    return (1.5 * 60 * lvl) / 7;
};

export default class ShinxBattle {
    constructor(owner, shinxData) {
        this.owner = owner;
        this.nick = shinxData.nickname;
        this.shiny = shinxData.shiny;
        this.percent = 0;
        this.exp = shinxData.experience
        this.level = shinxData.getLevel();
        this.belly = shinxData.belly as any / 10;
        this.geass = 0;
    };

    gainExperience(enemyLevel, loses) {
        const experience = Math.ceil(gainedExp(enemyLevel) * ((1 / 2) ** (loses)));
        this.exp += experience;
        const old_level = this.level as any;
        this.level = getLevelFromExp(this.exp);
        return [experience, this.level as any - old_level];
    };

    takeDamage(move) {
        this.percent = Math.max(0, this.percent as any + (move[1] - this.belly as any / 10));
        const knockout = this.percent as any * move[2];
        const random = Math.random();
        return random <= knockout;
    };

    attack() {
        if (this.knocked) return false;
        const rawMove = getMove(Math.min(Math.max(0, Math.random() + 0.5 - (this.level as any / 100)), 1));
        const move = [rawMove[0]];
        move.push(rawMove[1] * (2 - this.belly as any));
        move.push(rawMove[2] * (1 + this.belly as any) * (1 + (this.geass as any > 0) / 2));
        return move;
    };

    reduceGeass() {
        if (this.geass as any > 0) {
            this.geass--;
            return this.geass === 0;
        };
        return false;
    };

    geassMode() {
        if (this.geass as any < 1) {
            const geass_activated_chance = Math.random();
            if (geass_activated_chance < 0.2) {
                this.geass = 3;
                return true;
            };
            return false;
        };
        return false;
    };
};
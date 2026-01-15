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

const getMove = (number: number) => {
    for (let i = 0; i < battleMoves.length; i++) {
        const moveChance = battleMoves[i][0] as number;
        if (number * 100 <= moveChance) return battleMoves[i][1] as [string, number, number];
    }
};

const gainedExp = (lvl: number) => {
    return (1.5 * 60 * lvl) / 7;
};

export default class ShinxBattle {
    owner: any;
    nick: string;
    shiny: boolean;
    percent: number;
    exp: number;
    level: number;
    belly: number;
    geass: number;
    knocked?: boolean;

    constructor(owner: any, shinxData: any) {
        this.owner = owner;
        this.nick = shinxData.nickname;
        this.shiny = shinxData.shiny;
        this.percent = 0;
        this.exp = shinxData.experience;
        this.level = shinxData.getLevel();
        this.belly = shinxData.belly / 10;
        this.geass = 0;
    };

    gainExperience(enemyLevel: number, loses: number) {
        const experience = Math.ceil(gainedExp(enemyLevel) * ((1 / 2) ** (loses)));
        this.exp += experience;
        const old_level = this.level;
        this.level = getLevelFromExp(this.exp);
        return [experience, this.level - old_level];
    };

    takeDamage(move: [string, number, number]) {
        this.percent = Math.max(0, this.percent + (move[1] - this.belly / 10));
        const knockout = this.percent * move[2];
        const random = Math.random();
        return random <= knockout;
    };

    attack() {
        if (this.knocked) return false;
        const rawMove = getMove(Math.min(Math.max(0, Math.random() + 0.5 - (this.level / 100)), 1));
        if (!rawMove) return false;
        const move: [string, number, number] = [rawMove[0], 0, 0];
        move[1] = rawMove[1] * (2 - this.belly);
        move[2] = rawMove[2] * (1 + this.belly) * (1 + (this.geass > 0 ? 1 : 0) / 2);
        return move;
    };

    reduceGeass() {
        if (this.geass > 0) {
            this.geass--;
            return this.geass === 0;
        };
        return false;
    };

    geassMode() {
        if (this.geass < 1) {
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
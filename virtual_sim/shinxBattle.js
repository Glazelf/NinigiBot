const battleMoves =
    [
        //[chance, [name, attack, knockout]],
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

const getLevelFromExp = require('../util/shinx/getLevelFromExp');

const getMove = (number) => {
    for (let i = 0; i < battleMoves.length; i++) if (number * 100 <= battleMoves[i][0]) return battleMoves[i][1];
};

const gainedExp = (lvl) => {
    return (1.5 * 60 * lvl) / 7;
};

module.exports = class ShinxBattle {
    constructor(owner, shinxData) {
        this.owner = owner;
        this.nick = shinxData.nickname;
        this.shiny = shinxData.shiny;
        this.percent = 0;
        this.exp = shinxData.experience
        this.level = shinxData.getLevel();
        this.belly = shinxData.belly / 10;
        this.geass = 0;
    };


    gainExperience(enemyLevel, loses) {
        const experience = Math.ceil(gainedExp(enemyLevel) * ((1 / 2) ** (loses)));
        this.exp += experience;
        const old_level = this.level;
        this.level = getLevelFromExp(this.exp);
        return [experience, this.level - old_level];
    };

    takeDamage(move) {
        this.percent = Math.max(0, this.percent + (move[1] - this.belly / 10));
        const knockout = this.percent * move[2];
        const random = Math.random(0, 1);
        return random <= knockout;
    };

    attack() {
        if (this.knocked) return false;
        const rawMove = getMove(Math.min(Math.max(0, Math.random(0, 1) + 0.5 - (this.level / 100)), 1));
        const move = [rawMove[0]];
        move.push(rawMove[1] * (2 - this.belly));
        move.push(rawMove[2] * (1 + this.belly) * (1 + (this.geass > 0) / 2));
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
            const geass_activated_chance = Math.random(0, 1);
            if (geass_activated_chance < 0.2 ) {
                this.geass = 3;
                return true;
            };
            return false;
        };
        return false;
    };
};

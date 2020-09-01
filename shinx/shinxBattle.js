const { bank } = require('../database/bank');

const battleMoves = 
[
    //[chance, [name, attack, knockout]],
    [2, ['Thunder of gods of destruction of eternity', 2, 2]],
    [5, ['Shinx judgement', 0.6, 0.1]],
    [10, ['Roar of Shinx', 0.2, 1]],
    [50, ['Scratch', 0.4, 0.4]],
    [100, ['Kick', 0.1, 0.1]]

]

const buffs = 
[
    //[chance, [name, attack, knockout]],
    ['feels more alive than even', 1, 1, 1, 0, 3, false],
    //['just wants to sleep', 1, 1.5, 1, 0, 0, true],
    ['feels a bit hungry now', 0.9, 1, 1, 0, 0, false]
    //['got hit by a rock bruh', 1, 1, 1, 0.15, 0, true],
]

const getMove = (number)=> {
    for(let i = 0; i < battleMoves.length; i++) if(number*100<battleMoves[i][0]) return battleMoves[i][1]
}

const levelExp = (lvl)=> {
    return (6/5)*(lvl)**3 - 15 * (lvl)**2 + 100 * lvl -140
}

const gainedExp = (lvl)=> {
    return (1.5 * 60 * lvl )/7
}

module.exports = class ShinxBattle {
    constructor (owner, shinxData) {
      this.owner = owner;
      this.nick = shinxData.nick;
      this.shiny = shinxData.shiny
      this.level = shinxData.level
      this.exp = shinxData.exp;
      this.hunger = shinxData.hunger
      this.sleep = shinxData.sleep
      this.friendship = shinxData.friendship
      this.percent = 0
      this.saiyan = 0
      this.knocked = false

    }

    applyRandomBuff (seed) {
        const buff = buffs[seed%buffs.length]
        this.hunger*=buff[1]
        this.sleep*=buff[2]
        this.friendship*=buff[3]
        this.percent+=buff[4]
        this.saiyan+=buff[5]
        this.knocked=buff[6]
        return buff[0]
    }

    gainExperience (enemyLevel) {
        this.exp += gainedExp(enemyLevel) * (1+this.friendship)
        if(this.exp >= levelExp(this.level+1)){
            this.level += 1;  
            return true;
        } ;
        return false;
    }

    takeDamage (move) {
        const evade = Math.random(0,1);

        this.percent += move[1];
        const knockout = this.percent * move[2] * (this.saiyan+1);
        const random = Math.random(0,1);
        return random <= knockout;
    }

    attack () {
        if(this.knocked) return false;
        const rawMove = getMove(Math.random(0,1))
        const move = [rawMove[0]]
        move.push(rawMove[1]*(2-this.hunger))
        move.push(rawMove[2]*(1+this.friendship))
        return move;
    }

    checks () {
        if(this.knocked) this.knocked = false
    }

    saiyanMode () {
        if(this.saiyan<1){
            const sai = Math.random(0,1);
            if(sai < 0.2*(this.friendship+0.2)) {
                this.saiyan = 2
                return true;
            }
            return false;
        }
        return false;
    }
  }



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

]

const getMove = (number)=> {
    for(let i = 0; i < battleMoves.length; i++) if(number*100<=battleMoves[i][0]) return battleMoves[i][1]
}

const levelExp = (lvl)=> {
    return (6/5)*(lvl)**3 - 15 * (lvl)**2 + 100 * lvl -140
}

const gainedExp = (lvl)=> {
    return (1.5 * 60 * lvl )/7
}


            
            
module.exports = class ShinxBattle {
    constructor (owner, shinxData, equipments) {
        this.owner = owner;
        this.nick = shinxData.nick;
        this.shiny = shinxData.shiny
        this.percent = 0
        this.level = shinxData.level
        this.exp = shinxData.exp;
        this.hunger = shinxData.hunger
        this.sleep = shinxData.sleep
        this.friendship = shinxData.friendship
        this.geass = 0
        if(equipments.length>0) { 
            const equipment = (equipments.filter(i => i.equipment.name.toLowerCase() === shinxData.equipment))[0].equipment;
            if(equipment.food)this.hunger += equipment.food;
            if(equipment.sleep)this.sleep += equipment.sleep;
            if(equipment.friendship)this.friendship += equipment.friendship;
            if(equipment.geass) this.geass = 3
            if(equipment.ultrageass)this.ultrageass = equipment.ultrageass;
            if(equipment.regen)this.regen = equipment.regen;
            if(equipment.guard) this.guard = equipment.guard;
            if(equipment.safeguard)this.safeguard = equipment.safeguard;
        }
    }

    gainExperience (enemyLevel, loses) {
        this.exp += gainedExp(enemyLevel) * (1+this.friendship) *((1/2)**(loses))
        if(this.exp >= levelExp(this.level+1)){
            this.level += 1;  
            return true;
        } ;
        return false;
    }

    takeDamage (move) {
        const evade = Math.random(0,1);

        this.percent = Math.max(0, this.percent+(move[1]-this.sleep/10)); 
        const knockout = this.percent * move[2];
        const random = Math.random(0,1);
        if(random<=knockout){
            if(this.safeguard) return false
            if(this.guard){
                this.guard = false;
                return -1;
            }
            return true;
        }
        return false;
    }

    attack () {
        if(this.knocked) return false;
        const rawMove = getMove(Math.min(Math.max(0, Math.random(0,1)+0.5-(this.level/100)),1))
        const move = [rawMove[0]]
        move.push(rawMove[1]*(2-this.hunger))
        move.push(rawMove[2]*(1+this.friendship)*(1+(this.geass>0)/2))
        return move;
    }

    reduceGeass() {
        if(this.supergeass) return false
        if(this.geass>0){
            this.geass--;
            return this.geass===0
        }
        return false;
    }

    applyRegen(){
        if(this.regen){
            this.percent = Max(0, this.percent-this.regen);
        }
        return this.regen
    }

    geassMode () {
        if(!this.supergeass&&this.geass<1){
            const sai = Math.random(0,1);
            if(sai < 0.2*(this.friendship+0.2)) {
                this.geass = 3
                return true;
            }
            return false;
        }
        return false;
    }
  }


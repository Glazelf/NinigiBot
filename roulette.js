

const Discord = require('discord.js');
module.exports = {
    on: false,
    betsOpen: false,
    bets: new Discord.Collection(),
    shift: function() {
        this.on = !this.on;
    },
    addBet: function(bet, id, reward) {
        if(!this.bets.has(bet)){
            return this.bets.set(bet, [[id, reward]]);
        }
        this.bets.set(bet, this.bets.get(bet).push([id, reward]));
    },
    spin: function(result) {
        const winners = this.bets.get(result); 
        this.bets.clear();
        return winners;
    }
}

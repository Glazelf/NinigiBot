exports.run = (client, message, args, member) => {
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(client.config.lackPerms)
        };

        const sqlite3 = require('sqlite3').verbose();
        let dbNinigi = new sqlite3.Database('./db/ninigi.db');

        // insert one row into the quote table
        dbNinigi.run(`INSERT INTO quote(name) VALUES(?)`, ['C'], function (err) {
            if (err) {
                return console.log(err.message);
            }

            // get the last insert id
            let message = `A row has been inserted with rowid ${this.lastID} and content: `
            console.log(message);
            message.channel.send(message);
        });

        // close the database connection
        dbNinigi.close();
        
    } catch (e) {
        // send msg to owner
        let members = message.channel.members;
        let owner = members.find('id', client.config.ownerID);
        owner.send(`An error occurred using a command in <#${message.channel.id}> by <@${message.member.user.id}> using a command, check console for more information.`);
        // log error
        console.log(e);
        return message.channel.send(`An error has occurred trying to run the command, please contact <@${client.config.ownerID}>.`)
    };
};

module.exports.help = {
    name: "quoteadd",
    description: "Adds a quote to the database, if no arguments are given, displays a random quote instead.",
    usage: `?quote [quote] | [quoted person's name]`
};
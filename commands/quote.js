exports.run = (client, message, args, member) => {
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
};

module.exports.help = {
    name: "quoteadd",
    description: "Adds a quote to the database, if no arguments are given, displays a random quote instead.",
    usage: `?quote [quote] | [quoted person's name]`
};
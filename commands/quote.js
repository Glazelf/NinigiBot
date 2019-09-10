exports.run = (client, message, args, member) => {
    let dbNinigi = new sqlite3.Database('./db/ninigi.db');

    // insert one row into the quote table
    dbNinigi.run(`INSERT INTO quote(name) VALUES(?)`, ['C'], function (err) {
        if (err) {
            return console.log(err.message);
        }
        
        // get the last insert id
        var message = `A row has been inserted with rowid ${this.lastID} and content: `
        console.log(message);
        message.channel.send(message);
    });

    // close the database connection
    db.close();
};

module.exports.help = {
    name: "quoteadd",
    description: "",
    usage: `?quoteadd [quote] | [quoted person's name]`
};
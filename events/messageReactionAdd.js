module.exports = async (reaction, user, message) => {
    try {
        if (message.guild.id !== client.config.botServerID) {
            return;
        };

        // if (reaction.emoji.name === "⭐") {
        //     console.log("someone reacted with ⭐⭐⭐⭐⭐")
        // };

        return; 

    } catch (e) {
        // log error
        console.log(e);
    };
};
module.exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.guild.id !== client.config.botServerID) return;

        const Discord = require("discord.js");
        const { Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };
        let inputNumber = args[0];
        if (isNaN(inputNumber)) return message.channel.send(`> You must provide a valid number, ${message.author}.`);
        let titleNumber = inputNumber;

        // Channels
        let rulesChannel = `<#549220480490536972>`;
        let NSFWChannel = `<#717841246101700709>`;
        let botChannel = `<#${globalVars.botChannelID}>`;
        let ACNHBotChannel = `<#614979959156375567>`;
        let PKMBotchannel = `<#797885250667282444>`;
        // Roles
        let modRole = `<@&549215318153887784>`;
        let starRole = `<@&740021749097431092>`;
        let VGCRole = `<@&656557701425266699>`;
        let PokkenRole = `<@&636110404254171136>`;
        let SplatoonRole = `<@&705372282180206592>`;
        let ACRole = `<@&728561934148042783>`;
        let MHRole = `<@&712772118043033632>`;
        let MCRole = `<@&748873336691359794>`;
        let GenshinRole = `<@&759807202696757258>`;
        let ImpostorRole = `<@&751169163778719835>`;
        let SmashRole = `<@&771431806347903006>`;
        let ShinxPlayerRole = `<@&774224860380659722>`;
        let ShinxTORole = `<@&774224367571042315>`;
        let DraftRole = `<@&710802109498654790>`;
        let ventRole = `<@&744031604405567529>`;
        let stanRole = `<@&743144948328562729>`;
        let botHostRole = `<@&771092824698519582>`;
        let boosterRole = `<@&585533578943660152>`;
        let PKMBotRole = `<@&676893346009972746>`;
        let ACNHBotRole = `<@&739832954351648818>`;

        let rules = {
            1: `Be respectful to others, this entails no racism, sexism, being purposely hurtful to others, etc. 
This includes slurs, no matter who you are. It's unrealistic to expect mods to do a background check on every member and then make a seperate word list each individual member can use, so they're not allowed for anyone.`,
            2: `Use channels for the topics they were made for, the names of the channels should give you a good idea for their purpose, but if you're still in doubt they all have a channel description!`,
            3: `NSFW content and talk goes in ${NSFWChannel}. If you don't have access there and are 18+ years old, ask a mod for the role.`,
            4: `No piracy, this means no spreading of copyrighted material, like uploading the files here or sharing links to download them. Stuff you made yourself like a patch or mod is still fine as long as you only share the mod and not the entire game with the mod applied.`,
            5: `Don't spam the chat needlessly. For example by sending every word in a seperate message or just trying to flood the chat in general. 
This also includes joining just to advertise your own server (or other platform) or dming it to people in this server. If you get random advertisement or general spam DMs from people you share this with, please report it to a mod.`,
            6: `Don't advertise, either your own or someone else's anywhere in this server without permission from a mod.`,
            7: ` If you have questions about a topic, read through already documented material first before asking us questions. This includes sources like ${rulesChannel} and relevant channels' pins.`,
            8: `Use common sense, these rules are not exhaustive and punishment can be applied on a moderator's discretion even if your name is DeltaV. Purposefully evading the rules or looking for loopholes is considered to be breaking the rules.`,
            9: `Have fun, this is mandatory.`,
            34: `If it exists, there is NSFW of it. No exceptions.`
        };
        let faqNames = {
            1: "How do I get roles?",
            2: "What do these roles do?",
            3: "What benefits do I get for boosting?",
            4: "How to use PKM/ACNH Sysbots (\"genning bots\")?",
            5: "How do I add my friends to this amazing Discord omg???"
        };
        let faq = {
            // How do I get roles?
            1: `To get roles just use \`?role <rolename>\` in ${botChannel}. Don't ping, just the name.
To see all the available roles use \`?role help\`.`,
            // What do these roles do?
            2: `${modRole}: Moderators!
username#discriminator roles: These are personal roles for Nitro Boosters to change their name color!
${starRole}: This role does nothing. It is granted to users who significantly help the server out or are otherwise pillars of the community.
${VGCRole}, ${PokkenRole}, ${SplatoonRole}, ${ACRole}, ${MHRole}, ${MCRole}, ${GenshinRole}, ${ImpostorRole}, ${SmashRole}: Unlock corresponding game text/voice chats and in generally allow you to be pinged if anyone wants to play these games.
${ShinxPlayerRole}, ${ShinxTORole}, ${DraftRole}: Correspond to certain Pokémon events we hold here every now and then and open up corresponding channel categories.
${ventRole}: Opens up #vent-chat. This chat is only for serious topics, abuse of or ridiculing conversation in this channel will get your ass kicked.
${stanRole}: Takes you into consideration for ${client.user}'s daily random stanning.
${botHostRole}: The nice people who host our Sysbots.
If a role is not listed here it is either useless (aside from the color) or so niche it is not worth displaying here. Ask a mod about these.`,
            // What benefits do I get for boosting?
            3: `Boosting has a few benefits in return for helping the server maintain level 3 benefits. 
-You get a special role (${boosterRole}) and the boosting icon next to your name. 
-You are also able to create your own personal colored role using \`?personalrole <colorhex>\` in ${botChannel}.
-You should get queue priority in our Pokémon bots. (Experimental)`,
            // How to use PKM/ACNH Sysbots ("genning bots")?
            4: `Get either ${PKMBotRole} or ${ACNHBotRole} (or both) from ${botChannel} using \`?role help\`.
These roles will unlock the bot specific channel (${PKMBotchannel} for PKM ${ACNHBotChannel} for ACNH).
Go there and read the pins there for more instructions.

Please don't ask dumb questions like "When will x bot will be online???". I'm a single man with a single Switch and my own life, it will be on when it's on.
${PKMBotRole} and/or ${ACNHBotRole} role will be pinged when bots go online. You can check bot status at any time using \`?sysbot\`.
If you want more uptime/consistency refer to the paypal links in the pins of ${botChannel} to donate money to me and fund me more hardware to run more bots on at the same time.`,
            // How do I add my friends to this amazing Discord omg???
            5: `Permanent Discord invite: <https://discord.gg/2gkybyu>
Vanity URL: https://discord.gg/shinx`
        };

        let objectName = "Rule";
        let relevantObject = rules;
        let faqName = ":shrug:";

        if (message.content.toLowerCase().startsWith(`${prefix}faq`)) {
            objectName = "FAQ";
            relevantObject = faq;
            await getFAQName(faqNames, inputNumber);
            titleNumber = `${inputNumber}: ${faqName}`;
        };

        let objectText = `That rule or FAQ point doesn't seem to exist, ${message.author}.`;
        await getRule(relevantObject, inputNumber);

        // Avatar
        let avatar = client.user.displayAvatarURL({ format: "png", dynamic: true });

        let ruleEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`${objectName} ${titleNumber}`, avatar)
            .setDescription(objectText)
            .setFooter(message.author.tag)
            .setTimestamp();

        return message.channel.send(ruleEmbed);

        async function getRule(object, input) {
            var keyList = Object.keys(object);
            keyList.forEach(function (key) {
                if (input == key) {
                    objectText = object[key];
                };
            });
        };

        async function getFAQName(object, input) {
            var keyList = Object.keys(object);
            keyList.forEach(function (key) {
                if (input == key) {
                    faqName = object[key];
                };
            });
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "rules",
    aliases: ["faq", "rule"]
};
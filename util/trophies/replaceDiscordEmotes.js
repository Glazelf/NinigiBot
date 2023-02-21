const regexpDiscord = /<a*:[a-zA-Z0-9]+:[0-9]+>/
module.exports = (trophy_array, is_array = true) => {
    if (!is_array) {
        if (trophy_array.icon.match(regexpDiscord)) trophy_array.icon = '❓';
    } else {
        trophy_array.forEach(trophy => {
            if (trophy.icon.match(regexpDiscord)) trophy.icon = '❓';
        });
    };
    return trophy_array;
};
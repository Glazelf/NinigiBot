module.exports = (languageJSON) => {
    const clothes = Object.entries(languageJSON).reduce((prev, [key, value], i, array) => {
        let firstCloth = "TES016";
        let lastCloth = "LTS014";
        // This is so hacky, I can't tell if empty values start with \ or with ♫
        if ((key === firstCloth || firstCloth in prev) && value !== "\x0E\x05\x06" && key !== "B99") prev[key] = value;
        if (key === lastCloth) array.splice(1); // Break early
        return prev;
    }, {});
    return clothes;
};
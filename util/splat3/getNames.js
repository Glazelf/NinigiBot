module.exports = (languageJSON, type) => {
    const names = Object.entries(languageJSON).reduce((prev, [key, value], i, array) => {
        let first = "";
        let last = "";
        let extraBool = true;
        if (type === "clothes") {
            first = "TES016";
            last = "LTS014";
            extraBool = (value !== "\x0E\x05\x06"); // This is so hacky, I can't tell if empty values start with \ or with ♫
        } else if (type === "weapons") {
            first = "Maneuver_Gallon_00";
            last = "Spinner_Hyper_00";
            extraBool = (key !== "Stringer_Short_00"); // Random misplaced entry?
        };
        if ((key === first || first in prev) && extraBool) prev[key] = value;
        if (key === last) array.splice(1); // Break early
        return prev;
    }, {});
    return names;
};
import leadingZeros from "../leadingZeros.js";
import correctionID from "../../objects/pokemon/correctionID.json" with { type: "json"};

const formSuffixes = {
    "-Primal": "-m",
    "-Totem": "-t",
    "-Gmax": "-gi",
    "-Eternamax": ""
};

export default (pokemon) => {
    let { num, name: pokemonName, types: pokemonTypes } = pokemon;
    let pokemonID = leadingZeros(num.toString(), 3); // Turn this number into 4 when Showdown and Serebii switch to 4 digit IDs consistently. This approach doesn't change 4-digit IDs.

    const formKey = Object.keys(formSuffixes).find(suffix => pokemonName.endsWith(suffix));
    if (formKey) {
        pokemonID += formSuffixes[formKey];
    } else {
        const formPart = pokemonName.split("-")[1];
        if (formPart) pokemonID += `-${formPart.charAt(0).toLowerCase()}`;
    };

    // Second check is to avoid using (bad) normal type art instead of the (good) generic art
    if (["Arceus", "Silvally"].includes(pokemonName.split("-")[0]) && pokemonName.includes("-")) {
        pokemonID = `${pokemonID.split("-")[0]}-${pokemonTypes[0].toLowerCase()}`;
    };

    return correctValue(correctionID, pokemonName, pokemonID);
};

function correctValue(object, key, input) {
    key = key.toLowerCase();
    return object[key] || input;
};

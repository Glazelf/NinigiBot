import leadingZeros from "../leadingZeros.js";
import correctionID from "../../objects/pokemon/correctionID.json" with { type: "json"};

const primalString = "-Primal";
const totemString = "-Totem";
const gmaxString = "-Gmax";
const eternamaxString = "-Eternamax";

export default (pokemon) => {
    let pokemonID = pokemon.num.toString();
    let pokemonName = pokemon.name;
    let pokemonTypes = pokemon.types;
    // Turn this number into 4 when Showdown and Serebii switch to 4 digit IDs consistently. This approach doesn't change 4-digit IDs.
    pokemonID = leadingZeros(pokemonID, 3);
    // Forms
    const primalBool = pokemonName.endsWith(primalString);
    const totemBool = pokemonName.endsWith(totemString);
    const gmaxBool = pokemonName.endsWith(gmaxString);
    const eternamaxBool = pokemonName.endsWith(eternamaxString);
    // const dynamaxBool = Boolean(gmaxBool || eternamaxBool);
    const totemAlolaBool = totemBool && pokemonName.split("-")[1] == "Alola";
    let formChar;

    if (primalBool || gmaxBool) {
        if (primalBool) formChar = "-m";
        if (gmaxBool) formChar = "-gi";
        pokemonID = `${pokemonID}${formChar}`;
    } else if (!totemBool || totemAlolaBool) {
        // Catches all forms where the form extension on Serebii is just the first letter of the form name
        if (pokemonName.split("-")[1]) pokemonID = `${pokemonID}-${pokemonName.split("-")[1].split("", 1)[0].toLowerCase()}`;
    };
    // Edgecase ID corrections
    // TODO: add a bunch of meaningless forms like Unown and Vivillon
    pokemonID = correctValue(correctionID, pokemonName, pokemonID);
    if (pokemonName.startsWith("Arceus-") || pokemonName.startsWith("Silvally-")) pokemonID = `${pokemonID.split("-")[0]}-${pokemonTypes[0].toLowerCase()}`;
    return pokemonID;

    function correctValue(object, key, input) {
        key = key.toLowerCase();
        if (object[key]) return object[key];
        return input;
    };
};
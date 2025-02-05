export default async ({ genData, pokemon, learnset }) => {
    let baseSpecies = null;
    let baseSpeciesLearnset = null;
    let hasBaseSpecies = (pokemon.baseSpecies !== pokemon.name);
    if (!pokemon || !genData) return learnset;
    if (hasBaseSpecies) {
        baseSpecies = genData.species.get(pokemon.baseSpecies);
        baseSpeciesLearnset = await genData.learnsets.get(pokemon.baseSpecies);
    };
    if ((!learnset || !learnset.learnset) && (hasBaseSpecies && baseSpecies.exists)) {
        // Catch Pokémon with no learnset, like Arceus forms
        learnset = await genData.learnsets.get(baseSpecies.id);
    } else if (hasBaseSpecies && Object.values(learnset.learnset).length <= 2) { // Highest amount of inherited moves is currently 2, with Necrozma-Ultra (Moongeist Beam + Sunsteel Strike)
        // Catch Pokémon that inherit a base species moveset, like Zacian-Crowned, who only learns Behemoth Blade itself
        for (const [key, value] of Object.entries(baseSpeciesLearnset.learnset)) {
            learnset.learnset[key] = value;
        };
    };
    return learnset;
};
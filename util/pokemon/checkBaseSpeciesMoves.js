export default async (Dex, learnsets, pokemon) => {
    let pokemonLearnset = learnsets[pokemon.id];
    if (!pokemonLearnset.learnset && pokemon.baseSpecies) {
        // Catch Pokémon with no learnset
        let baseSpecies = Dex.species.get(pokemon.baseSpecies);
        pokemonLearnset = learnsets[baseSpecies.id];
    } else if (pokemon.baseSpecies && Object.values(pokemonLearnset.learnset).length < 3) { // Highest amount of inherited moves is currently 2, with Necrozma-Ultra
        // Catch Pokémon that inherit a base species moveset, like Zacian-Crowned, who only learns Behemoth Blade itself
        let baseSpeciesMoves = pokemonLearnset.learnset;
        pokemonLearnset = learnsets[Dex.species.get(pokemon.baseSpecies).id];
        Object.keys(baseSpeciesMoves).forEach(key =>
            pokemonLearnset.learnset[key] = baseSpeciesMoves[key]);
    };
    return pokemonLearnset.learnset;
};
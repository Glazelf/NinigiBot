import { Dex } from '@pkmn/dex';

export default async (pokemon: any, learnset: any) => {
    let baseSpecies = null;
    let baseSpeciesLearnset = null;
    if (pokemon.baseSpecies) {
        baseSpecies = Dex.species.get(pokemon.baseSpecies);
        baseSpeciesLearnset = await Dex.learnsets.get(pokemon.baseSpecies);
    };
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    if ((!learnset || !learnset.learnset) && baseSpecies.exists) {
        // Catch Pokémon with no learnset, like Arceus forms
        // @ts-expect-error TS(2531): Object is possibly 'null'.
        learnset = await Dex.learnsets.get(baseSpecies.id)
    } else if (pokemon.baseSpecies && Object.values(learnset.learnset).length <= 2) { // Highest amount of inherited moves is currently 2, with Necrozma-Ultra (Moongeist Beam + Sunsteel Strike)
        // Catch Pokémon that inherit a base species moveset, like Zacian-Crowned, who only learns Behemoth Blade itself
        // @ts-expect-error TS(2531): Object is possibly 'null'.
        for (const [key, value] of Object.entries(baseSpeciesLearnset.learnset)) {
            learnset.learnset[key] = value;
        };
    };
    return learnset;
};
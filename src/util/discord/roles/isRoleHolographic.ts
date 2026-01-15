import { Constants } from 'discord.js';

export default (input: any) => {
    return (JSON.stringify(input) == JSON.stringify({ primaryColor: Constants.HolographicStyle.Primary, secondaryColor: Constants.HolographicStyle.Secondary, tertiaryColor: Constants.HolographicStyle.Tertiary }));
};
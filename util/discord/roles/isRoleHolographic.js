import { Constants } from 'discord.js';

export default (input) => {
    return (JSON.stringify(input) == JSON.stringify({ primaryColor: Constants.HolographicStyle.Primary, secondaryColor: Constants.HolographicStyle.Secondary, tertiaryColor: Constants.HolographicStyle.Tertiary }));
};
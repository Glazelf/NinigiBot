import { Constants } from 'discord.js';

export default (input) => {
    return (JSON.stringify(input) == JSON.stringify(Constants.HolographicStyle));
};
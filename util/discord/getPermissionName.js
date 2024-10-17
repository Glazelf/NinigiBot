import { PermissionFlagsBits } from 'discord.js';

export default (permission) => {
    for (const perm of Object.keys(PermissionFlagsBits)) {
        if (PermissionFlagsBits[perm] === permission) return perm;
    };
    return 'UnknownPermission';
};
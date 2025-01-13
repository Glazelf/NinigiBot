import { PermissionFlagsBits } from 'discord.js';

export default (permission: any) => {
    for (const perm of Object.keys(PermissionFlagsBits)) {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (PermissionFlagsBits[perm] === permission) return perm;
    };
    return 'UnknownPermission';
};
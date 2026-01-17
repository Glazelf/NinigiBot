import isAdmin from "./isAdmin.js";

export default ({ member, permissions, channel = null }: { member: any; permissions: any; channel?: any }) => {
    if (isAdmin(member)) return true;
    let passedPermissions = [];
    for (let permission of permissions) {
        if (channel) {
            if (channel.permissionsFor(member).has(permission)) passedPermissions.push(permission);
            continue;
        } else {
            if (member.permissions.has(permission)) passedPermissions.push(permission);
            continue;
        };
    };
    return (permissions.length === passedPermissions.length);
};
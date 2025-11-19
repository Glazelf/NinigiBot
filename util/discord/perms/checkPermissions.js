import isAdmin from "./isAdmin.js";

export default ({ member, permissions, channel }) => {
    console.log(isAdmin(member))
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
    console.log(permissions)
    console.log(passedPermissions)
    return (permissions.length === passedPermissions.length);
};
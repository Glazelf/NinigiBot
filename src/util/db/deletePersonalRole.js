export default async (roleDB, guild) => {
    let oldRole = guild.roles.cache.get(roleDB.role_id);
    if (oldRole) {
        try {
            await oldRole.delete();
        } catch (e) {
            // console.log(e);
        };
    };
    await roleDB.destroy();
};
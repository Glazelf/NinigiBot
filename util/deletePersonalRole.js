export default async (roleDB, guild) => {
    let oldRole = guild.roles.cache.find(r => r.id == roleDB.role_id);
    if (oldRole) {
        try {
            await oldRole.delete();
        } catch (e) {
            // console.log(e);
        };
    };
    await roleDB.destroy();
};
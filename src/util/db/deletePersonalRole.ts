export default async (roleDB: any, guild: any) => {
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
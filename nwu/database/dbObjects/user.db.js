module.exports = (sequelize, DataTypes) => {

    const User_db = require('./models/Shinx.js')(sequelize, DataTypes);
    
    Reflect.defineProperty(User_db.prototype, 'getData', {
        value: async item => {
            const userItem = await UserItems.findOne({
                where: { user_id: this.user_id, item_id: item.id },
            });
    
            if (userItem) {
                userItem.amount += 1;
                return userItem.save();
            }
    
            return UserItems.create({ user_id: this.user_id, item_id: item.id, amount: 1 });
        },
    });
    
    
    return User_db;
    }
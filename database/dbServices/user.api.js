import { userdata } from "../dbConnection/dbConnection.js";
import userdataModel from "../dbObjects/userdata.model.js";

export async function getUser(id, attributes = null) {
    const { User } = await userdataModel(userdata);
    let user = await User.findByPk(id, {
        attributes: attributes
    });

    if (!user) user = await User.create({ user_id: id });
    return user;
};

export async function getAllUsers() {
    const { User } = await userdataModel(userdata);
    const users = await User.findAll();
    return users;
};

export async function bulkDeleteUsers(id_arr) {
    const { User } = await userdataModel(userdata);
    await userdata.models.Shinx.destroy({
        where: { user_id: id_arr },
    });
    await userdata.models.EventTrophyUser.destroy({
        where: { UserUserId: id_arr },
    });
    await userdata.models.ShopTrophyUser.destroy({
        where: { UserUserId: id_arr },
    });
    await User.destroy({
        where: { user_id: id_arr },
    });
};
// Money
export async function addMoney(id, money) {
    let user = await getUser(id, ['user_id', 'money']);
    await user.addMoney(money);
};

export async function getMoney(id) {
    let user = await getUser(id, ['money']);
    return user.money;
};

export async function getUsersRankedByMoney() {
    const { User } = await userdataModel(userdata);
    let users_money = await User.findAll({
        attributes: [
            'user_id', 'money'
        ],
        order: [
            ["money", "DESC"],
        ],
    })
    return users_money;
};
// Birthday
export async function getBirthday(id) {
    let user = await getUser(id, ['birthday']);
    return user.birthday;
};

export async function setBirthday(id, birthday) {
    let user = await getUser(id, ['user_id', 'birthday']);
    user.setBirthday(birthday);
};
// Switch Code
export async function getSwitchCode(id) {
    let user = await getUser(id, ['swcode']);
    return user.swcode;
};

export async function setSwitchCode(id, swcode) {
    let user = await getUser(id, ['user_id', 'swcode']);
    user.setSwitchCode(swcode);
};
// Ephemeral default
export async function getEphemeralDefault(id) {
    let user = await getUser(id, ['ephemeral_default']);
    return user.ephemeral_default;
};

export async function setEphemeralDefault(id, ephemeral_default) {
    let user = await getUser(id, ['user_id', 'ephemeral_default']);
    user.setEphemeralDefault(ephemeral_default);
};
// Buying food
export async function buyFood(id, amount) {
    let user = await getUser(id, ['user_id', 'food', 'money']);

    let res = await user.hasMoney(amount);
    if (res) {
        await user.buyFood(amount);
        return true;
    }
    return false;
};
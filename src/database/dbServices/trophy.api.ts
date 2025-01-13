import {
    Op,
    fn,
    where,
    col
} from "sequelize";
import { userdata } from "../dbConnection/dbConnection.js";
import userdataModel from "../dbObjects/userdata.model.js";
const DAILY_TROPHIES = 5;

export async function getUser(id: any, attributes = null) {
    const { User } = await userdataModel(userdata);
    let user = await User.findByPk(id, {
        attributes: attributes
    });

    if (!user) user = await User.create({ user_id: id });
    return user;
};

export async function addMoney(id: any, money: any) {
    // @ts-expect-error TS(2345): Argument of type 'string[]' is not assignable to p... Remove this comment to see the full error message
    let user = await getUser(id, ['user_id', 'money']);
    await user.addMoney(money);
};

export async function getTrophieslice(offset: any, trophies_per_page: any) {
    const { ShopTrophy, EventTrophy } = await userdataModel(userdata);
    let EventTrophies = await EventTrophy.findAll({ attributes: ['trophy_id', 'icon'] });
    let shoptrophies = await ShopTrophy.findAll({ attributes: ['trophy_id', 'icon'] });
    let trophies = EventTrophies.concat(shoptrophies);
    let up_range = Math.min(offset + trophies_per_page, trophies.length);
    let answer = 'LR';
    if (up_range == trophies.length) {
        answer = 'L';
    } else if (offset == 0) {
        answer = 'R';
    };
    return { slice: trophies.slice(offset, offset + trophies_per_page), buttons: answer };
};

export async function getShopTrophies() {
    const { ShopTrophy } = await userdataModel(userdata);
    const trophies = await ShopTrophy.findAll();
    return trophies;
};

export async function getTodayShopTrophies() {
    const { ShopTrophy } = await userdataModel(userdata);
    const d = new Date();

    const trophies = await ShopTrophy.findAll();
    let index = (d.getDate() + d.getFullYear()) % trophies.length;
    const today_trophies = [];
    const today_indexes: any = [];
    for (let i = 0; i < DAILY_TROPHIES; i++) {
        while (today_indexes.includes(index)) {
            index = ((index + 1) % trophies.length);
        };
        today_trophies.push(trophies[index]);
        today_indexes.push(index);
        index = (index + DAILY_TROPHIES) % trophies.length;
    };
    return today_trophies;
};

export async function createShopTrophy(name: any, emote: any, description: any, price: any) {
    const { ShopTrophy } = await userdataModel(userdata);
    await ShopTrophy.create({ trophy_id: name, icon: emote, description: description, price: price });
};

export async function deleteShopTrophy(trophy_id: any) {
    const { User, ShopTrophy, EventTrophy } = await userdataModel(userdata);
    const trophy_id_t = trophy_id.toLowerCase()
    const trophy = await ShopTrophy.findOne({ attributes: ['price'], where: where(fn('lower', col('trophy_id')), trophy_id_t) })
    if (!trophy) return false;
    let affected_users = await userdata.models.ShopTrophyUser.findAll({
        attributes: ['UserUserId'],
        where: where(fn('lower', col('shopTrophyTrophyId')), trophy_id_t)
    });
    await ShopTrophy.destroy({
        where: where(fn('lower', col('trophy_id')), trophy_id_t)
    });
    affected_users.forEach(async user_id => {
        await addMoney(user_id, trophy.price);
    });
    return true;
};

export async function getTodayShopTrophiesToBuy(money: any) {
    const { ShopTrophy } = await userdataModel(userdata);
    const d = new Date();

    const trophies = await ShopTrophy.findAll({
        attributes: [
            'trophy_id', 'price'
        ]
    });
    let index = (d.getDate() + d.getFullYear()) % trophies.length;
    let today_trophies = [];
    const today_indexes: any = [];
    for (let i = 0; i < DAILY_TROPHIES; i++) {
        while (today_indexes.includes(index)) {
            index = ((index + 1) % trophies.length);
        };
        today_trophies.push(trophies[index]);
        today_indexes.push(index);
        index = (index + DAILY_TROPHIES) % trophies.length;
    };
    today_trophies = today_trophies.filter(trophy => trophy.price <= money);
    let trophies_ids = today_trophies.map(trophy => trophy.trophy_id);
    return trophies_ids;
};

export async function getShopTrophyWithName(name: any) {
    const { ShopTrophy } = await userdataModel(userdata);
    let name_t = name.toLowerCase();
    const trophy = await ShopTrophy.findOne(
        {
            where: {
                [Op.or]: [
                    where(fn('lower', col('trophy_id')), name_t),
                    { icon: name_t }
                ]
            }
        }
    );
    return trophy;
};

export async function checkTrophyExistance(name: any, only_shop = false) {
    const { ShopTrophy, EventTrophy } = await userdataModel(userdata);
    let name_t = name.toLowerCase();
    let trophy = await ShopTrophy.findOne(
        {
            where: where(fn('lower', col('trophy_id')), name_t),
        }
    );
    if (trophy) { return true }
    if (!only_shop) {
        trophy = await EventTrophy.findOne(
            {
                where: where(fn('lower', col('trophy_id')), name_t),
            }
        );
        if (trophy) { return true };
    }
    return false;
};

export async function getBuyableShopTrophies(user_id: any) {
    let user = await getUser(user_id);
    const user_trophies = await user.getShopTrophies();
    const user_trophies_list = user_trophies.map((trophy: any) => trophy.trophy_id);

    let today_trophies = await getTodayShopTrophiesToBuy(user.money);
    today_trophies = today_trophies.filter(trophy => !(trophy in user_trophies_list));
    return today_trophies;
};

export async function getFullBuyableShopTrophies(user_id: any) {
    let user = await getUser(user_id);
    const user_trophies = await user.getShopTrophies();
    const user_trophies_list = user_trophies.map((trophy: any) => trophy.trophy_id);

    let today_trophies = await getTodayShopTrophies();
    today_trophies.forEach(trophy => {
        // can't buy, can buy, bought
        if (user_trophies_list.includes(trophy.trophy_id)) {
            trophy.temp_bought = 'Bought';
        } else {
            trophy.temp_bought = trophy.price > user.money ? 'CantBuy' : 'CanBuy';
        };
    })
    return today_trophies;
};

export async function buyShopTrophy(user_id: any, trophy_id: any) {
    const trophy_id_t = trophy_id.toLowerCase()
    const trophies = await getTodayShopTrophies();
    let trophy = trophies.find(elem => elem.trophy_id.toLowerCase() == trophy_id_t);
    if (!trophy) return 'NoTrophy';
    // @ts-expect-error TS(2345): Argument of type 'string[]' is not assignable to p... Remove this comment to see the full error message
    let user = await getUser(user_id, ['user_id', 'money']);
    if (await user.hasShopTrophy(trophy)) return 'HasTrophy';
    if (user.money < trophy.price) return 'NoMoney';

    await user.addShopTrophy(trophy);
    await user.addMoney(-trophy.price);
    return 'Ok';
};

export async function addEventTrophy(user_id: any, trophy_id: any) {
    const { EventTrophy } = await userdataModel(userdata);
    // @ts-expect-error TS(2345): Argument of type 'string[]' is not assignable to p... Remove this comment to see the full error message
    let user = await getUser(user_id, ['user_id']);
    let trophy_id_t = trophy_id.toLowerCase();
    const trophy = await EventTrophy.findOne(
        { attributes: ['trophy_id'], where: where(fn('lower', col('trophy_id')), trophy_id_t) }
    );

    if (!(await user.hasEventTrophy(trophy))) await user.addEventTrophy(trophy);
};

export async function hasEventTrophy(user_id: any, trophy_id: any) {
    const { EventTrophy } = await userdataModel(userdata);
    // @ts-expect-error TS(2345): Argument of type 'string[]' is not assignable to p... Remove this comment to see the full error message
    let user = await getUser(user_id, ['user_id']);
    let trophy_id_t = trophy_id.toLowerCase();
    const trophy = await EventTrophy.findOne(
        { attributes: ['trophy_id'], where: where(fn('lower', col('trophy_id')), trophy_id_t) }
    );

    return (await user.hasEventTrophy(trophy));
};

export async function addEventTrophyUnchecked(user_id: any, trophy_id: any) {
    const { EventTrophy } = await userdataModel(userdata);
    // @ts-expect-error TS(2345): Argument of type 'string[]' is not assignable to p... Remove this comment to see the full error message
    let user = await getUser(user_id, ['user_id']);
    let trophy_id_t = trophy_id.toLowerCase();
    const trophy = await EventTrophy.findOne(
        { attributes: ['trophy_id'], where: where(fn('lower', col('trophy_id')), trophy_id_t) }
    );
    await user.addEventTrophy(trophy);
};

export async function getEventTrophies() {
    const { EventTrophy } = await userdataModel(userdata);
    const trophies = await EventTrophy.findAll();
    return trophies;
};

export async function getEventTrophyWithName(name: any) {

    const { EventTrophy } = await userdataModel(userdata);
    let name_t = name.toLowerCase();
    const trophy = await EventTrophy.findOne(
        {
            where: {
                [Op.or]: [
                    where(fn('lower', col('trophy_id')), name_t),
                    { icon: name_t }
                ]
            }
        }
    );
    return trophy;
};
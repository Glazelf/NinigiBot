import {
    Op,
    fn,
    where,
    col
} from "sequelize";
import {
    userdata,
    serverdata
} from "../dbConnection/dbConnection.js";
import userdataModel from "../../database/dbObjects/userdata.model.js";
import serverdataModel from "../../database/dbObjects/serverdata.model.js";
import hasPassedLevel from "../../util/shinx/hasPassedLevel.js";
import checkFormat from "../../util/string/checkFormat.js";

export async function getShinx(id, attributes = null) {
    const { Shinx } = await userdataModel(userdata);
    let shinx = await Shinx.findByPk(id, {
        attributes: attributes
    });
    if (!shinx) {
        await getUser(id);
        shinx = await Shinx.create({ user_id: id });
    };
    await shinx.checkup()
    return shinx;
};

export async function getUser(id, attributes = null) {
    const { User } = await userdataModel(userdata);
    let user = await User.findByPk(id, {
        attributes: attributes
    });
    if (!user) user = await User.create({ user_id: id });
    return user;
};

export async function getRandomShinx(amount, exclude, guild) {
    const { Shinx } = await userdataModel(userdata);
    const results = await Shinx.findAll({ attributes: ['user_id', 'shiny', 'user_male'], where: { user_id: { [Op.ne]: exclude, [Op.in]: [...guild.members.cache.keys()] } }, order: fn('RANDOM'), limit: amount });
    return results.map(res => res.dataValues);
};

export async function getShinxShininess(id) {
    let shinx = await getShinx(id, ['shiny'])
    return shinx.shiny;
};

export async function getRandomReaction() {
    const { shinxQuotes } = await serverdataModel(serverdata);
    const result = await shinxQuotes.findOne({ order: fn('RANDOM') });
    // console.log(result);
    return result;
};

export async function switchShininessAndGet(id) {
    let shinx = await getShinx(id, ['user_id', 'shiny']);
    return shinx.switchShininessAndGet();
};

export async function changeAutoFeed(id, mode) {
    let shinx = await getShinx(id, ['user_id', 'auto_feed']);
    return shinx.setAutoFeed(mode);
};

export async function addExperience(id, experience) {
    let shinx = await getShinx(id, ['user_id', 'experience']);
    const res = await shinx.addExperienceAndLevelUp(experience);
    if (res.pre != res.post) {
        if (hasPassedLevel(res.pre, res.post, 5)) await addEventTrophy(id, 'Bronze Trophy');
        if (hasPassedLevel(res.pre, res.post, 15)) await addEventTrophy(id, 'Silver Trophy');
        if (hasPassedLevel(res.pre, res.post, 30)) await addEventTrophy(id, 'Gold Trophy');
        if (hasPassedLevel(res.pre, res.post, 50)) await addEventTrophy(id, 'Shiny Charm');
    };
};

export async function hasEventTrophy(user_id, trophy_id) {
    const { EventTrophy } = await userdataModel(userdata);
    let user = await getUser(user_id, ['user_id']);
    let trophy_id_t = trophy_id.toLowerCase();
    const trophy = await EventTrophy.findOne(
        { attributes: ['trophy_id'], where: where(fn('lower', col('trophy_id')), trophy_id_t) }
    );
    let res = await user.hasEventTrophy(trophy);
    return res;
};

export async function addEventTrophy(user_id, trophy_id) {
    const { EventTrophy } = await userdataModel(userdata);
    let user = await getUser(user_id, ['user_id']);
    let trophy_id_t = trophy_id.toLowerCase();
    const trophy = await EventTrophy.findOne(
        { attributes: ['trophy_id'], where: where(fn('lower', col('trophy_id')), trophy_id_t) }
    );
    if (!(await user.hasEventTrophy(trophy))) await user.addEventTrophy(trophy);
};

export async function feedShinx(id) {
    let shinx = await getShinx(id, ['user_id', 'belly', 'experience']);
    let shinx_hunger = shinx.getHunger()
    if (shinx_hunger == 0) return 'NoHungry';
    let user = await getUser(id, ['user_id', 'food']);

    let feed_amount = Math.min(shinx_hunger, user.getFood())
    if (feed_amount == 0) return 'NoFood';
    await user.addFood(-feed_amount);
    await shinx.feedAndExp(feed_amount);
    return 'Ok';
};

export async function getShinxAutofeed(id) {
    let shinx = await getShinx(id, ['auto_feed'])
    return shinx.auto_feed;
};

export async function autoFeedShinx1(id) {
    let shinx = await getShinx(id, ['user_id', 'belly', 'experience']);
    let shinx_hunger = shinx.getHunger();
    if (shinx_hunger == 0) return;
    let user = await getUser(id, ['user_id', 'food']);

    let feed_amount = Math.min(shinx_hunger, user.getFood())
    if (feed_amount == 0) return;
    await user.addFood(-feed_amount);
    await shinx.feedAndExp(feed_amount);
};

export async function autoFeedShinx2(id) {
    let shinx = await getShinx(id, ['user_id', 'belly', 'experience']);
    let shinx_hunger = shinx.getHunger();
    if (shinx_hunger == 0) return;
    let user = await getUser(id, ['user_id', 'food', 'money']);
    let used_food = 0;
    let used_money = 0;

    let feed_amount = Math.min(shinx_hunger, user.getFood())
    if (feed_amount != 0) {
        used_food = feed_amount;
        await user.addFood(-feed_amount);
        await shinx.feedAndExp(feed_amount);
    };
    shinx_hunger -= feed_amount;
    if (shinx_hunger != 0) {
        feed_amount = Math.min(shinx_hunger, user.getMoney())
        if (feed_amount != 0) {
            used_money = feed_amount;
            await user.addMoney(-used_money);
        };
    };
    await user.reduceFoodMoney(used_food, used_money);
    await shinx.feedAndExp(used_food + used_money);
};

export async function nameShinx(id, nick) {
    const check = checkFormat(nick, 12);
    if (check == 'Ok') {
        let shinx = await getShinx(id, ['user_id', 'nickname']);
        shinx.changeNick(nick.trim());
    };
    return check;
};

export async function isTrainerMale(id) {
    let shinx = await getShinx(id, ['user_male']);
    return shinx.user_male
};

export async function saveBattle(shinxBattleData, wins) {
    let shinx = await getShinx(shinxBattleData.owner.id);
    await shinx.saveBattle(shinxBattleData, wins);
};
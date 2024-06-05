import { userdata } from "../dbConnection/dbConnection.js";
import userdataModel from "../dbObjects/userdata.model.js";

const DAILY_TROPHIES = 5;

export async function getUser(id, attributes = null) {
    const { User } = await userdataModel(userdata);
    let user = await User.findByPk(id, {
        attributes: attributes
    });
    if (!user) {
        user = await User.create({ user_id: id });
    };
    return user;
};

export async function getHistory(id, attributes = null) {
    const { History } = await userdataModel(userdata);
    let history = await History.findByPk(id, {
        attributes: attributes
    });
    if (!history) {
        await getUser(id);
        history = await History.create({ user_id: id });
    };
    return history;
};

export async function incrementStanAmount(id) {
    let history = await getHistory(id, ['user_id']);
    await history.increment('stan_amount');
};

export async function incrementCombatAmount(id, won = false) {
    let attributes = ['combat_amount'];
    if (won) attributes = attributes.concat(['win_amount']);
    let history = await getHistory(id, ['user_id']);
    await history.increment(attributes);
};
export async function checkEvent(Model, trophy_id, attribute) {
    let instances = await Model.findAll({
        attributes: [
            'user_id', attribute
        ],
        order: [
            [attribute, "DESC"],
        ],
    });
    if (instances.length == 0) return;
    await userdata.models.EventTrophyUser.destroy({
        where: { EventTrophyTrophyId: trophy_id }
    });
    await userdata.models.EventTrophyUser.create({
        UserUserId: instances[0].user_id,
        EventTrophyTrophyId: trophy_id
    });
};

export async function checkEvents() {
    const { User, Shinx, History } = await userdataModel(userdata);
    const events = [
        checkEvent(User, 'Capitalism Addict', 'money'),
        checkEvent(Shinx, 'Unbreakable Bond', 'experience'),
        checkEvent(History, 'Fighter Trophy', 'combat_amount'),
        checkEvent(History, 'Frontier Brain Trophy', 'win_amount'),
        checkEvent(History, 'Stanned Being', 'stan_amount'),
    ]
    await Promise.all(events);
};
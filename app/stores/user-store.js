var users = {
    '1': {
        id: 1,
        username: 'kendo',
        firstName: "Siwakorn",
        lastName: "Ja",
        amount: 0,
        asset: {},
        expo_push_token: "ExponentPushToken[ST13AlKEUZ80tgT0krXBBH]"
    },
    '2': {
        id: 2,
        username: 'team',
        firstName: "Theerapat",
        lastName: "Chawannakul",
        amount: 0,
        asset: {},
        expo_push_token: ""
    },
    '3': {
        id: 3,
        username: 'joy',
        firstName: "Kanokwan",
        lastName: "Norasetkul",
        amount: 0,
        asset: {},
        expo_push_token: ""
    },
};
var id = 1;
exports.list = function () {
    return Object.keys(users).map(function (key) { return users[key]; });
}

exports.get = function (id) {
    return users[parseInt(id + "")];
}
exports.add = function (user) {
    user.id = id++;
    users[user.id] = user
    return user;

}
exports.update = function (id, user) {
    if (!users[user.id]) {
        return undefined;
    }
    users[parseInt(id + "")] = user
    return user;
}


exports.getOrCreateUserByUsername = function (username) {
    let user_id = Object.keys(users).find(user_id => users[user_id].username === username)
    if (!user_id) {
        user_id = id++;
        users[user_id] = {
            id: user_id,
            username: username,
            firstName: "F" + username,
            lastName: "L" + username,
            amount: 0,
            assets: {}
        };
    }
    return users[user_id];
}

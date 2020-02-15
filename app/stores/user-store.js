var users = {};
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
            amount: 0,
            assets: {}
        };
    }
    return users[user_id];
}

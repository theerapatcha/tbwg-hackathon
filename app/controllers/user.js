/*!
 * Module dependencies.
 */

const userStore = require('../stores/user-store');

exports.create = function (app) {
    app.get('/api/users/me', (req, res) => {
        const user = userStore.getOrCreateUserByUsername(req.headers.username)
        res.status(200).json(user);
    })
};

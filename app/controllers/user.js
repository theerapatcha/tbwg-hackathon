/*!
 * Module dependencies.
 */

const userStore = require('../stores/user-store');

exports.create = function (app) {
    app.get('/api/users/:id', (req, res) => {
        const user = userStore.get(req.params.id)
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({
                error: "not found"
            })
        }
    })
    app.get('/api/users/me', (req, res) => {
        const user = userStore.getOrCreateUserByUsername(req.headers.username)
        res.status(200).json(user);
    })
};

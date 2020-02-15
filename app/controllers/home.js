/*!
 * Module dependencies.
 */

exports.create = function (app) {
  app.get('/', (req, res) => {
    res.render('home/index', {
      title: 'Node Express Mongoose Boilerplate'
    });
  })
};

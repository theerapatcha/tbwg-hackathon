/*!
 * Module dependencies.
 */

var deeplink = require('node-deeplink');

exports.create = function (app) {
  app.get('/', (req, res) => {
    res.render('home/index', {
      title: 'Node Express Mongoose Boilerplate'
    });
  })
  app.get('/r/', (req, res) => {
    res.redirect(301, req.params.p)
  })
  app.get(
    '/deeplink',
    deeplink({
      fallback: 'https://google.com',
      android_package_name: 'co.flipay',
      ios_store_link:
        ''
    })
  );
};

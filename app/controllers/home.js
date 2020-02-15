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
      url: 'expo://192.168.43.205:19000'
      fallback: 'https://google.com'
    })
  );
};

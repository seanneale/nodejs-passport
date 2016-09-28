var Twitter = require('twitter');

module.exports = function(app,passport){
  // Routes
  // router middelware
  function isLoggedIn(req, res, next) {

    if(req.isAuthenticated()) {
      return next();
    }

    res.redirect('/')
  }

	app.get('/twitter', isLoggedIn, function(req, res){
	    res.render('twitter', { message: req.flash('loginMessage') });
	});

  app.post('/twitter/send', isLoggedIn, function(req, res){
    var tweet = req.body.tweet;

    var client = new Twitter({
      consumer_key: "sDHjSbJ3AI9poMZlCEPIneDMX",
      consumer_secret: "Jj6AVf6RUnTzv4iB24wMOkIpi0acLKVYFQ7uP9Kca3qg4KPija",
      access_token_key: req.user.twitter.token,
      access_token_secret: req.user.twitter.secret
    });

    //post to twitter
    client.post('statuses/update', {status: tweet},  function(error, tweet, response) {
      if(error) console.log(error);
        res.json('success, tweet has been posted');
        // console.log(response);  // Raw response object. 
      });
    });

}
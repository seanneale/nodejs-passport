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

}
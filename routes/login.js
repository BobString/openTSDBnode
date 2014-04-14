
/*
 * GET login page.
 */

exports.sign = function(req, res){

  res.render('login',  {layout: '', user: req.user, message: req.flash('error') });
};


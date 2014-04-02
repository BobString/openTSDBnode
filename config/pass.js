var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , db = require('./dbschema')
  , RememberMeStrategy = require('passport-remember-me').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.userModel.findById(id, function (err, user) {
    done(err, user);
  });
});

// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.

passport.use(new LocalStrategy(function(username, password, done) {
  db.userModel.findOne({ username: username }, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if(isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    });
  });
}));


// Remember Me cookie strategy
//   This strategy consumes a remember me token, supplying the user the
//   token was originally issued to.  The token is single-use, so a new
//   token is then issued to replace it.
passport.use(new RememberMeStrategy(
  function(token, done) {
    db.tokenModel.consumeRememberMeToken(token, function(err, uid) {
      console.log('UID: '+uid);
      if (err) { return done(err); }
      if (!uid) { return done(null, false); }
      
      db.userModel.findOne({ username: uid }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
      });
    });
  },
  issueToken
));

function issueToken(user, done) {
  console.log('User: '+ user);
  var tokenstring = user.generateRandomToken();
  var token = new tokenModel({ accessToken:tokenstring, usernameid:user.id });
    token.save(function(err) {
      if(err) {
        console.log(err);
        return done(err);
      } else {
        console.log('token: ' + token.usernameid + " saved.");
        return done(null, token);
      }
    }); 
}
 
exports.issueToken= function issueToken(user, done) {
  console.log('User: '+ user);
  var tokenstring = user.generateRandomToken();
  var token = new db.tokenModel({ accessToken:tokenstring, usernameid:user.id });
    token.save(function(err) {
      if(err) {
        console.log(err);
        return done(err);
      } else {
        console.log('token: ' + token.usernameid + " saved.");
        return done(null, token);
      }
    }); 
}

// Simple route middleware to ensure user is authenticated.  Otherwise send to login page.
exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}


// Check for admin middleware, this is unrelated to passport.js
// You can delete this if you use different method to check for admins or don't need admins
exports.ensureAdmin = function ensureAdmin(req, res, next) {
    return function(req, res, next) {
	console.log(req.user);
        if(req.user && req.user.admin === true)
            next();
        else
            res.send(403);
    }
}

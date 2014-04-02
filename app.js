
/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , db = require('./config/dbschema')
  , pass = require('./config/pass')
  , passport = require('passport')
   , flash = require('connect-flash')
 routes = require('./routes'),
 user = require('./routes/user'),
 login = require('./routes/login'),
 http = require('http'),
 path = require('path'),
 io = require('socket.io');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'sweetieKittyCat' }));
app.use(flash());
// Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/',pass.ensureAuthenticated,routes.index);
//app.get('/',routes.index);

app.get('/login',login.sign);

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
//   


// POST /login TODO: poner en archivo externo
/*app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.session.messages =  [info.message];
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res, next);
});*/

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res, next) {
    // Issue a remember me cookie if the option was checked
    if (!req.body.rememberme) { return next(); }
    
    pass.issueToken(req.user, function(err, token) {
      if (err) { return next(err); }
      res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
      return next();
    });
  },
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  res.clearCookie('remember_me');
  req.logout();
  res.redirect('/');
});

app.get('/data.json',pass.ensureAdmin(),function(req,res){
    //TODO: if we get to one possible data endpoint, see if we already have the data and is not outdated, fetch the data, send it back, and save it 
   
   res.contentType('application/json');
  
    var data = {
        metric: 'cipsi.seeds.test1.temperature',
        start: {timestamp:'2013-08-04 12:00:00', timezone:'CEST'},
        end: {timestamp:'2013-08-19 14:00:00', timezone:'CEST'},
        tags:[{name:'node', value:'0013A2004061646F'}],
        debug:true
    }
    executeRio(data,function(result){
        //var data = JSON.stringify(result);
        //res.send(data);
        res.send(result)
    });    
    
    


});
function executeRio(data, callback){
    var config = {
        entryPoint: "getDatapoints",
        data: data
    };
	config.callback = function (err, res) {
	    var ans;
        if (!err) {
            //ans = JSON.parse(res);
            ans = res;
        } else {
           console.error("Rserve call failed: "+err);
        }
         callback(ans);

    };
    var rio = require('rio');
    //rio.evaluate("rnorm(1000000)",config);
    rio.sourceAndEval(__dirname + "/r_files/script.R", config);

}

app.use(function(req, res, next){
 
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !! msgs.length;

  next();
  req.session.messages = [];
});


app.use(function(err, req, res, next){
  //Error handler
  if (~err.message.indexOf('not found')) return next();
  console.error(err.stack);
  res.status(500).render('5xx');
});

app.use(function(req, res, next){
  //Error handler
  res.status(404).render('404', { title: req.originalUrl });
});


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var websocket = io.listen(server,{ log: false });

websocket.sockets.on('connection', function (socket) {
  socket.on('getDataPoints', function (options,id) {
    //TODO: Recibimos la peticion de plot y aquí llamamos a Rio para coger los puntos y se los enviamos a los cientes
     var time1 =  new Date().getTime();
     console.log("(3.1) Time starting the RIO call: "+time1)
     var data = {
        metric: 'cipsi.seeds.test1.temperature',
        start: {timestamp:'2013-08-04 12:00:00', timezone:'CEST'},
        end: {timestamp:'2013-08-07 14:00:00', timezone:'CEST'},
        tags:[{name:'node', value:'0013A2004061646F'}],
        debug:true
    }
    console.log("Calling RIO")
    executeRio(data,function(result){
        //var data = JSON.stringify(result);
        //res.send(data);
        console.log("RIO callback, sending to client points");
        var time2 =  new Date().getTime();
        console.log("(3.1) Rio finish sending points: "+time2)
        socket.emit("dataServer",result,id); });
        console.log("Points sent");
        
    }); 
     //console.log('Got Request from client '+id);
     //var data={"message":"Hello World!", options:options};
     
});



/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , db = require('./config/dbschema')
  , pass = require('./config/pass')
  , passport = require('passport')
   , flash = require('connect-flash')
   , config = require("./config/config");
 routes = require('./routes'),
 user = require('./routes/user'),
 login = require('./routes/login'),
 stats = require('./routes/stats'),
 version = require('./routes/version'),
 testData = require('./routes/gettingData'),
 android = require('./routes/android'),
 tsdbconf = require('./routes/tsdbconf'),
 reports = require('./routes/reports'),
 http = require('http'),
 nodetsdblib = require('nodetsdb'),
 path = require('path'),
 io = require('socket.io');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

//app.set('view engine', 'hjs');
app.set('view engine', 'html');
app.set('layout', 'layout');
app.enable('view cahce');
app.engine('html', require('hogan-express'));

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

// development only/usr/bin/env: node: No such file or directory
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/',pass.ensureAuthenticated,routes.index);
app.get('/',routes.index);
app.get('/statistics',pass.ensureAuthenticated,stats.stats);
app.get('/tsdbversion',pass.ensureAuthenticated,version.version);
app.get('/tsdbconf',pass.ensureAuthenticated,tsdbconf.conf);
app.get('/form', function(req, res){
  res.render('form');
});
app.get('/login',login.sign);

app.post('/saveReport', function(request, response){
    //TODO: Save report to DB
    var method = request.body.method;
    var testgroup = request.body.testgroup;
    var dpsize = request.body.dpsize;
    var stage = request.body.stage;
    var description= request.body.description;
    var time = request.body.time
    
    if(method && testgroup && dpsize && stage && description && time){
        //All parameters are there
         var answer = saveReport (method, testgroup, dpsize, stage, description, time);
         if(answer != 0){
         
             response.status(418);
             if (request.accepts('json')) {
             response.send({ message: 'Post done' });
            return;
            }else{
              // default to plain-text. send()
              response.type('txt').send('Post done');
            }
        }else{
        response.status(500);
        response.send({ error: 'Error saving report' });
        
        }
   }else{
        response.status(500);
        if (request.accepts('json')) {
            response.send({ error: 'Parameter missing' });
            return;
        }else{
          // default to plain-text. send()
          response.type('txt').send('Parameter missing');
        }  
   }
   
   
    
});

app.get('/reports', reports.reports);
app.get('/testdata', testData.getData);
app.get('/android.json', android.getData);
app.get('/removereport', function(request, res){
    var id = request.query.id;
    
    if(id){
        db.reportModel.remove({ _id: id }, function (err) {
          if (err){
             res.locals.title = 'Remove report';
             res.locals.block= 'Error deleting the report';
             res.render('generic');
         }else{
         
            res.locals.title = 'Remove report';
            res.locals.block= 'Report deleted correctly';
            res.render('generic');
         }
        });
    
    }else{
         
          res.locals.title = 'Remove report';
          res.locals.block= 'Error deleting the report, no id provided';
          res.render('generic');
            
         }
});
    
    



function saveReport (meth, tg, dpsz, stg, desc, t){
    var report = new db.reportModel({ method: meth
    				, testgroup: tg
    				, dpsize: dpsz
    				, stage: stg
    				, description: desc
    				, time: t});
    

    report.save(function(err) {
      if(err) {
        return 0;
      } else {
        return 1;
      }
    });

};

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

// =========== Python part =========== 
app.get('/python', function(req, res){
     var python = require('child_process').spawn(
     'python',
     // second argument is array of parameters, e.g.:
     ["./python_files/entryPoint.py"]
     );
     var output = "";
     python.stdout.on('data', function(data){ output += data });
     python.on('close', function(code){ 
	       if (code !== 0) {  
	       return res.send(500, code); 
	       
	       }
	        res.locals.title = 'Python';
           	 res.locals.block= output;
	       return res.render('generic');
     });
  
});


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
  res.status(500).render('5xx',{layout:''});
});

app.use(function(req, res, next){
  //Error handler
  res.status(404).render('404', {layout:'', title: req.originalUrl });
});


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var websocket = io.listen(server,{ log: false });

websocket.sockets.on('connection', function (socket) {
  socket.on('getDataPoints', function (options) {
    //TODO: Recibimos la peticion de plot y aquí coger los puntos y se los enviamos a los cientes
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
        socket.emit("dataServer",result); });
        console.log("Points sent");
        
    }); 
     //console.log('Got Request from client '+id);
     //var data={"message":"Hello World!", options:options};
     
     /* ServerMode */
     socket.on('getDPServerMode', function (options) {
         if(!options){
		console.log("No options, taking default");
             options = {start:'2014/04/04-12:00:00',
                        end:'2014/04/18-15:46:17', 
                        metric:'cipsi.weather.UU', 
                        aggregator:'avg', 
                        tags:{station:44640, quality_code:0}};
         }
         var times =  new Date().getTime();   
         var nodetsdb = new nodetsdblib({host:config.opentsdbserver, port:config.opentsdbserverport});
         nodetsdb.getDataPoints(options, function(dp){
             if(dp){
                //There are datapoints
                var timef =  new Date().getTime();
		//console.log("(3) Time: "+ (timef - times)+" ms")
                socket.emit("dataServer",dp);
             }else{
                //There are not datapoints
                console.log('Sorry no datapoints');
             }
          
  		});
  	});
  	
  	/* Python Mode */
     socket.on('getDPPythonMode', function (options) {
         var time1 =  new Date().getTime();
	
         if(!options){
		console.log("No options, taking default");
             options = {start:'2014/04/04-12:00:00',
                        end:'2014/04/18-15:46:17', 
                        metric:'cipsi.weather.UU', 
                        aggregator:'avg', 
                        tags:{station:44640, quality_code:0}};
         }
         	var times =  new Date().getTime();
	     var python = require('child_process').spawn(
	     'python',
	     // second argument is array of parameters, e.g.:
	     ["./python_files/entryPoint.py"]
	     );
	     var output = "";
	     python.stdout.on('data', function(data){ output += data });
	     python.on('close', function(code){ 
		       if (code !== 0) {  
		       	console.log("Nope");
		       }else{
			var timef =  new Date().getTime();
			console.log("(3 Python) Time: "+ (timef - times)+" ms")
		 	socket.emit("dataServerPython",output);
		       }
	     });
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



/*
 * GET stats page.
 */
var config = require("../config/config")

exports.stats = function(req, res){
  //var time =  new Date().getTime();
  var blocks ="";
  console.log("SERVER: "+"http://"+config.opentsdbserver+":"+config.opentsdbserverport+"/api/stats");
  
 http.get("http://"+config.opentsdbserver+":"+config.opentsdbserverport+"/api/stats", function(ress) {
 
      console.log("Got response: " + ress.statusCode);
      
      ress.on('data', function (chunk) {
            res.locals.title = 'Statistics';
            res.locals.block= chunk;
            res.locals.linkid='statslink';
            res.render('generic');
           // res.render('stats', { title: 'Statistics', blocks:chunk, user: req.user });
            
      });
       
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
       res.locals.title = 'Statistics';
        res.locals.block= 'Connection error';
        res.locals.linkid='statslink';
        res.render('generic');
    });
  //res.render('stats', { title: 'Statistics', blocks:blocks, user: req.user });
  //var time2 =  new Date().getTime();
  //console.log("(1) Time: "+(time2-time)+" ms");
};


/*
 * GET stats page.
 */
var config = require("../config/config")

exports.conf = function(req, res){
  //var time =  new Date().getTime();
  var blocks ="";
   
 http.get("http://"+config.opentsdbserver+":"+config.opentsdbserverport+"/api/config", function(ress) {
      console.log("Got response: " + ress.statusCode);
      ress.on('data', function (chunk) {
            
            res.render('generic', { title: 'OpenTSDB configuration', block:chunk,user: req.user });
      });
       
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
       res.render('generic', { title: 'OpenTSDB configuration', block:"Connection error", user: req.user });
    });
};

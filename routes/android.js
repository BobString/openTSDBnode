
/*
 * GET stats page.
 */
var config = require("../config/config");
var nodetsdblib = require('nodetsdb');

exports.getData = function(req, res){
  //var time =  new Date().getTime();
  console.log('Preparing query');
  var blocks ="";
  // http://haisen36.ux.uis.no:4242/api/query?start=1394884800&end=1395489600&m=avg:cipsi.weather.UU{station=44640,quality_code=0}
  var nodetsdb = new nodetsdblib({host:config.opentsdbserver, port:config.opentsdbserverport});
  var queryconf = {start:'2014/04/04-12:00:00',end:'2014/04/18-15:46:17', metric:'cipsi.weather.UU', aggregator:'avg', tags:{station:44640, quality_code:0}};
  
    nodetsdb.getDataPoints(queryconf, function(dp){
     console.log('callback!');
     if(dp){
         res.contentType('application/json');
         res.send(dp);
     }else{
         res.contentType('application/json');
         res.send({error:'Error or empty'});
     }
  
  });
  
};


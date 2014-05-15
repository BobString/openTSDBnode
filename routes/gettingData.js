
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
         res.render('generichtml', { title: 'Query example', block:tidyDataPoints(dp),user: req.user });
     }else{
         res.render('generic', { title: 'Query example', block:"Connection error",user: req.user });
     }
  
  });
  
};

var tidyDataPoints= function(dp){
    if(dp.length === 0){
        return 'No data points in query in database';
    }
   
    var result='<table class="table">';
    result += '<tr style="font-weight: bold;"> <td>Metric</td> <td>Tags</td> </tr>';
   console.log('Response length: '+ dp.length);
    
    var datapoints = JSON.parse(dp);
    for(i in datapoints){
        result += '<tr>';
        var  data = datapoints[i];
        result += '<td>' + data.metric+ '</td>';

        var tags = data.tags;
        result += '<td>';
        for(var j in tags){
            var tag = tags[j];
            result += j + ': '+tag+' ';
            
        }
        result += '</td>'
        
         result += '<td></td>';

        result += '</tr>';
    }
    result += '</table>';
    
    result += '<table class="table">';
    result += '<tr style="font-weight: bold;"> <td>Timestamp</td> <td>Value</td> </tr>';
    for(i in datapoints){
       
        var  p = datapoints[i];
        points = p.dps;
        
        for(aux in points){
         result += '<tr>';
             result += '<td>';
             var date = new Date(aux * 1000);
             result += date.toLocaleString();
             result += '</td>';
             result += '<td>';
             result += points[aux];
             result += '</td>';
         result += '</tr>';
        }
        
    }
    
    result += '</table>';
    return result;
};



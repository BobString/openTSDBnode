
/*
 * GET stats page.
 */
var db = require('../config/dbschema');

exports.reports = function(req, res){

    db.reportModel.find(function (err, kittens) {
        if (err){
             res.locals.title = 'Reports';
             res.locals.linkid='reportslink';
             res.locals.block= 'Error retreiving all the reports';
             res.render('generic');
         }else{
         
            res.locals.title = 'Reports';
            res.locals.linkid='reportslink';
            res.locals.block= tidyReports(kittens);
            res.render('generichtml');
         }
         
       });


};


tidyReports= function(reports){
    if(reports.length === 0){
        return 'No reports in database';
    }

    var result='<table class="table">';
    result += '<tr> <td>Method</td> <td>TestGroup</td> <td>DP size</td> <td>Stage</td> <td>Description</td> <td>Time</td> <td>Id</td> <td>Delete</td>';
    
    for(i in reports){
        result += '<tr>';
        var  report = reports[i];
        result += '<td>' + report.method+ '</td>';
        result += '<td>' + report.testgroup+ '</td>';
        result += '<td>' + report.dpsize+ '</td>';
        result += '<td>' + report.stage+ '</td>';
        result += '<td>' + report.description+ '</td>';
        result += '<td>' + report.time+ '</td>';
        result += '<td>' + report._id+ '</td>';
        result += '<td><a href="http://localhost:3000/removereport?id='+report._id+'">Delete</a></td>';
        result += '</tr>'; 
    }
    result += '</table>';
    
    return result;

}

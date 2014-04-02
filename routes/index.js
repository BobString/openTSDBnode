
/*
 * GET home page.
 */


exports.index = function(req, res){
  var time =  new Date().getTime();
  var plots = [{title:'Plot 1',id:'plot_1'}];
  //var blocks = generatePlotBlock(plots);
  var blocks ="";
  res.render('index', { title: 'Express', blocks:blocks, user: req.user });
  var time2 =  new Date().getTime();
  console.log("(1) Time: "+(time2-time)+" ms");
};

//TODO: generate here the index, make functions to create the divs of the plots

/** object plots --> [{title:'',id:''},{title:'',id:''}] */
generatePlotBlock = function(plots){
    var res = "";
    for(i in plots){
        res += "<!-- block -->";
        res += "<div class='block' style='width: 1000px;'>";
        res += "<div class='navbar navbar-inner block-header'>";
        res += "<div class='muted pull-left'>"+plots[i].title+"</div>";
        res += "</div>";
        res += "<div class='block-content collapse in'>";
        res += "<div id='"+plots[i].id+"' class='plots' style='width: 100%; height: 400px'>";
        res += "</div>";
        res += "</div>";
        res += "</div>";
        res += "<!-- block -->";   
    }

    return res;
}


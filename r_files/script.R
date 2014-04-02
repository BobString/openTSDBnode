library(lubridate)
library(opentsdbr)
library(zoo)
library(RJSONIO)

getDatapoints <- function (data) {
  o = fromJSON(data)
  metricString <- o$metric
  startObj <- o$start
  endObj <- o$end
  tagsObj <- o$tags
  debug <- o$debug
  
  if(debug){
  cat('Metric: ',metricString,'\n')
  cat('Start: ',startObj[1],'\n')
  cat('Start timezone: ',startObj[2],'\n')
  cat('End: ',endObj[1],'\n')
  cat('End timezone: ',endObj[2],'\n')
  }
  tagValue <- ''

  for(tag in tagsObj){
      if(debug){
          cat('Tag name: ',tag[1],'\n')
          cat('Tag value: ',tag[2],'\n')
      }
      tagValue <- tag[2]
  }
 
  #metric <- "cipsi.seeds.test1.temperature"
  metric <- metricString
  starttime <- startObj[1]
  #start <- interval(ymd_hms("2013-08-04 12:00:00", tz = "CEST"), ymd_hms("2013-08-19 14:00:00", tz = "CEST"))

  
  start <- interval(ymd_hms(starttime, tz = startObj[2]), ymd_hms(endObj[1], tz = endObj[2]))
  cat('Lets go for the results \n')
  #results <- tsd_get(metric,start,tags=c(node='0013A2004061646F'),hostname="haisen23.ux.uis.no",port=4242)
  timeTSDB <- system.time(results <- tsd_get(metric,start,tags=c(node='0013A2004061646F'),hostname="haisen23.ux.uis.no",port=4242))
  cat("Time doing petition to TSDB: ", timeTSDB[3],"\n")
  cat('results done \n')

  
  #z <- with(results, zoo(value, timestamp))
 
  #w <- as.matrix(results,cols=4)
  #Timestamp + value -> w2 <- as.matrix(w[,2:3], cols=2)
  #w2 <- w[,3]
  w2 <- results[]$value
  cat('Size: ',length(w2))
  w3 <- toJSON(w2)
  return(w3)
}


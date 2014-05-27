
import opentsdb_pandas as opd  
import datetime as dt
import urllib2
import json

# Large amount of points (4567)
#ts1 = opd.ts_get('cipsi.weather.TA', dt.datetime(2014, 4, 4, 12, 00), dt.datetime(2014, 5, 6, 12, 00), 'station=44640', hostname='haisen36.ux.uis.no')

# Medium amount of points (2435)
#ts1 = opd.ts_get('cipsi.weather.TA', dt.datetime(2014, 4, 4, 12, 00), dt.datetime(2014, 4, 21, 12, 00), 'station=44640', hostname='haisen36.ux.uis.no')

# Small amount of points (1284)
ts1 = opd.ts_get('cipsi.weather.TA', dt.datetime(2014, 4, 4, 12, 00), dt.datetime(2014, 4, 13, 12, 00), 'station=44640', hostname='haisen36.ux.uis.no')

aux=json.dumps(ts1.T.as_matrix().tolist(),indent=4)
print aux

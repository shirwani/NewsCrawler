#!/usr/bin/python

#################################################################################################
# Merge all individual data files into a single json file to be used for generating the HTML page
#
# USAGE:
#   python merge_data.py
#################################################################################################

from utils import *
import glob
import operator
from datetime import datetime

############################################################
# Read all data files and merge data into a single data hash
############################################################
uberdata = {}
datafiles = glob.glob("../data/*.json")
for d in datafiles:
    f = (d.rsplit('/', 1)[1]).split('.')[0]
    if f[0] == '_':
        continue
    print "Processing", f
    uberdata = mergeData(f,uberdata,loadData(d))

##########################################################
# Create _src_order_ field for Top Stories, based on score
##########################################################
unordered = {}
for src in uberdata:
    unordered[src] = uberdata[src]['score']

ordered = []
for k in sorted(unordered.items(), key=operator.itemgetter(1)):
    ordered.append(k[0])
order = ordered[::-1]
uberdata['_src_order_'] = order

######################################
# Create Latest Stories data structure
######################################
latest = []
for src in uberdata:
    if src == '_src_order_':
        continue

    curMax = datetime(1700,1,1)

    # Pick the latest story from each src
    sMax = dict()
    for d in uberdata[src]['data']:
        if d['publish_date'] == '':
            continue

        curSrcDate = datetime.strptime(d['publish_date'], '%B %d, %Y')
        if curSrcDate > datetime.now():
            continue

        if curSrcDate > curMax:
            curMax                        = curSrcDate
            sMax['publish_date']          = d['publish_date']
            sMax['publish_date_sortable'] = curSrcDate.strftime('%Y-%m-%d')
            sMax['score']                 = d['score']
            sMax['title']                 = d['title']
            sMax['url']                   = d['url']
            sMax['source']                = d['source']
            sMax['keywords']              = d['keywords']
            sMax['nlp_keywords']          = d['nlp_keywords']
            sMax['src']                   = src

    if sMax != {}:
        latest.append(sMax)

# Now sort all stories picked out - from newest to oldest
uberdata['_latest_'] = sorted(latest, key=lambda k: k['publish_date_sortable'], reverse=True)

############################
# Create keyword count field
############################
keywords = dict()
for src in uberdata:
    if src == '_src_order_' or src == '_latest_':
        continue

    for d in uberdata[src]['data']:
        for k in d['keywords'].split(', '):
            if k in keywords:
                keywords[k] += 1
            else:
                keywords[k] = 1

        for k in d['nlp_keywords'].split(', '):
            if k in keywords:
                keywords[k] += 1
            else:
                keywords[k] = 1
uberdata['_keyword_count_'] = keywords

#############################
# Dump timestamp in data file
#############################
uberdata['_timestamp_'] = datetime.now().strftime("%B %d, %Y - %I:%M:%S %p (EDT)")

###################
# Dump data in file
###################
with open(getDatafile(), 'w') as outfile:
    json.dump(uberdata, outfile, indent=4)


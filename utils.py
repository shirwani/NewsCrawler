#!/usr/bin/python

import os
import glob
import traceback
import re
import json
import os.path
from datetime import datetime
import operator

############################### CONFIG #################################
KEYWORDS_FILE   = "./config/keywords.txt"
SCORE_THRESHOLD = 0
MAX_SUMMARY_LEN = 300
URLCACHE_DIR    = "../urlcache"
LOG_DIR         = "../logs"
DATAFILE        = '../data/_data.json'
SITES_FILE      = './config/sites.txt'
AGE_THRESHOLD   = 30
############################### /CONFIG ################################

with open(KEYWORDS_FILE, "r") as f:
    desired_keywords = f.read().split("\n")

#####################################
# Log sting in logfile with timestamp
#####################################
def logger(logfile, logstr):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(logfile, 'a') as f:
        f.write('[' + now + '] ' + logstr + "\n")

###########
# Load data
###########
def loadData(filename):
    with open(filename, 'r') as infile:
        data = json.load(infile)
    return data

############
# Merge data
############
def mergeData(src,uberdata,data):
    data = removeLowScoreStories(data)
    if len(data) == 0:
        return uberdata

    data = scaleScoreForSrcTier(data, src)

    srcdata = dict()
    srcdata['score'] = getTopScore(data)
    srcdata['data']  = []

    # Remove summary and top_image from stories, except for the top-scoring story
    # to make the data file more lightweight
    for d in data:
        if existsInSrcdata(srcdata['data'], d): # avoid duplication
            continue

        if existsInUberdata(uberdata, d):
            continue

#        if d['score'] < srcdata['score']:
#            del d['summary']
#            del d['top_image']

        srcdata['data'].append(d)

    srcdata['more'] = len(srcdata['data'])
    uberdata[src] = srcdata
    return uberdata

##################################
# Does data 'd' exist in uberdata?
##################################
def existsInUberdata(uberdata, d):
    for src in uberdata:
        for s in uberdata[src]['data']:
            if re.search(d['url'], s['url']) \
                or re.search(s['url'], d['url']) \
                or d['title'].lower() == s['title'].lower():
                return True
    return False

#################################
# Does data 'd' exist in srcdata?
#################################
def existsInSrcdata(srcdata, d):
    for s in srcdata:
        if re.search(d['url'],  s['url']) \
            or re.search(s['url'],  d['url']) \
            or d['title'].lower() == s['title'].lower():
            return True
    return False

######################################################################
# Save data into datafile - merging with old data if it already exists
######################################################################
def saveData(data,datafile):
    try:
        with open(datafile, 'w') as outfile:
            json.dump(data, outfile, indent=4)
    except:
        print type(data)
        print traceback.format_exc()

#############################################
# Remove stories with score < SCORE_THRESHOLD
#############################################
def removeLowScoreStories(data):
    global SCORE_THRESHOLD
    newdata = []
    for d in data:
        d['score'] = scaleScoreForAge(d['score'],d['publish_date'])
        if d['score'] >= SCORE_THRESHOLD:
            newdata.append(d)
    return newdata

###############################################################
# Find how many and which search keywords exist in article text
###############################################################
def findKeywordsInText(text):
    items = []
    score = 0

    global desired_keywords
    for key in desired_keywords:
        if key is None or key == '':
            continue
        if re.search('\W'+key+'\W',text,re.IGNORECASE):
            items.append(key)
            score += 1

    return items,score

##################################
# Return top "score" in dict array
##################################
def getTopScore(data):
    topScore = 0
    for d in data:
        if d['score'] > topScore:
            topScore = d['score']
    return topScore

####################################
# Age out old stories during merging
####################################
def scaleScoreForAge(score, publish_date):
    score = float(score)

    if publish_date == '' or publish_date is None:
        return float(score/10)

    publish_date = datetime.strptime(publish_date, '%B %d, %Y')
    now = datetime.now()
    delta = now - publish_date
    age = delta.days
    return float(score/ max(age,1)) # avoid division by zero

#####################
# Get rid of old data
#####################
def purgeOldData(data):
    data_ = []
    for d in data:
        publish_date = d['publish_date']
        if publish_date == '' or publish_date is None:
            continue
        publish_date = datetime.strptime(publish_date, '%B %d, %Y')
        now = datetime.now()
        delta = now - publish_date
        age = delta.days
        if age < AGE_THRESHOLD:
            data_.append(d)

    return data_

######################################
# Higher weight to higher tier stories
######################################
def scaleScoreForSrcTier(data, src):
    sites = getSites()

    for s in sites:
        if s is None or s == '' or s[0] == '#':
            continue
        if src == s.split('|')[2].strip():
            tier = s.split('|')[0].strip()

    for i in range(len(data)):
        data[i]['score'] = float(data[i]['score'])/float(tier)

    return data

###########################################################
# Determine which sites to scan based on command line input
###########################################################
def getSites(srclist=None):
    sitelist = [site.rstrip('\n') for site in open(SITES_FILE)]

    if srclist is None:
        return sitelist

    sites = []
    for src in srclist:
        for site in sitelist:
            if site is None or site == '' or site[0] == '#':
                continue
            (tierx, srcx, tagx, urlx) = site.split('|')
            tagx = tagx.strip()
            if src == tagx:
                sites.append(site)
    return sites

#################################
# Get cached urls for all sources
#################################
def getUrlCache(src):
    global URLCACHE_DIR
    cachefile = URLCACHE_DIR + '/' + src + '.dat'

    # If urlcache file does not exist, return empty list
    if not os.path.isfile(cachefile):
        return []
    else:
        with open(cachefile, "r") as f:
            data = f.read().split("\n")
            if '' in data:
                data.remove('')
        return data

############################
# Save scanned urls in cache
############################
def cacheUrls(urlcache, src):
    global URLCACHE_DIR
    cachefile = URLCACHE_DIR + '/' + src + '.dat'

    with open(cachefile, "w") as f:
        f.write(list2str(urlcache).encode('utf8').replace(", ","\n"))

########################
# Convert list to string
########################
def list2str(slist):
    lstr = ''
    for i in range(0,len(slist)):
        if i > 0:
            lstr += ', '
        lstr += slist[i]
    return lstr

########################
# Pretty print JSON data
########################
def prettyprint(data):
    print json.dumps(data, indent=4)

#######################
# USAGE:
#   sortDict(d,'key')
#   sortDict(d,'value')
#######################
def sortDict(d,by,reverse=True):
    if by == 'key':
        return sorted(d.items(), key=operator.itemgetter(0), reverse=reverse)
    elif by == 'value':
        return sorted(d.items(), key=operator.itemgetter(1), reverse=reverse)

#######################################################################
# Generate log summary and return whether data gathering is done or not
#######################################################################
def gen_log_summary():
    flag = 0

    htmlstr = ''
    htmlstr += '<head>'
    htmlstr += '<style>'
    htmlstr += 'body{ font-family:Arial,serif;font-size:16px; }'
    htmlstr += 'td{ font-family:Arial,serif;font-size:14px;background:#ffffff; }'
    htmlstr += 'a{ text-decoration:none; }'
    htmlstr += 'a:hover{ text-decoration:underline; }'
    htmlstr += '</style>'

    htmlstr += '<body">'
    htmlstr += '<font style="font-weight:bold">Progress summary</font><br/><br/>'
    htmlstr += '<table border=0 cellpadding=3 cellspacing=1 bgcolor=#aaaaaa>'

    logfiles = glob.glob("../logs/*.log")
    count = 0
    for l in logfiles:
        count += 1
        htmlstr += '<tr>'
        htmlstr += "<td>%d</td>" % count
        htmlstr += '<td align=right>'
        src = l.split('/')[-1].split('.')[0]
        htmlstr += '<a href="../logs/' + src + '.log">' + src + '</a>'
        htmlstr += '</td>'
        status = os.popen("tail -1 " + l).read()

        if status.find('Done.') != -1:
            color = '006600'
        elif status.find('URL:') != -1:
            color = '#D35400'
            flag += 1
        else:
            color = '#ff0000'
            flag += 1

        htmlstr += '<td style="color:' + color + '">'
        htmlstr += status
        htmlstr += '</td>'
        htmlstr += '</tr>'

    htmlstr += '</table>'
    htmlstr += '<br/>'
    htmlstr += '</body>'
    with open('../logs/_summary.html', 'w') as f:
        f.write(htmlstr)

    return flag == 0 # to indicate that it's done

#####################################
# Return data file relative path/name
#####################################
def getDatafile():
    global DATAFILE
    return DATAFILE

########################
# Return Max Summary Len
########################
def getMaxSummaryLen():
    global MAX_SUMMARY_LEN
    return MAX_SUMMARY_LEN

################
# Return Log Dir
################
def getLogdir():
    global LOG_DIR
    return LOG_DIR

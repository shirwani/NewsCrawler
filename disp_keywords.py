#!/usr/bin/python

#########################################
# Display sorted list of keywords in data
#
# USAGE:
#   python disp_keywords.py
#########################################

from utils import *

data = loadData(getDatafile())
keywords = sortDict(data['_keyword_count_'], by='value', reverse=True)
print "*** Top 50 keywords ***"
for k in keywords[1:min(50,len(keywords))]:
    print "[%3d] %s" % (k[1],k[0])


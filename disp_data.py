#!/usr/bin/python

##################################################################
# Display top scores and number of stories for each source in data
#
# USAGE:
#   python disp_data.py
##################################################################

from utils import *

data = loadData(getDatafile())
for src in sorted(data):
    if src[0] == '_':
        continue
    print "[score: %2d, len: %3d] %s" % (data[src]['score'], len(data[src]['data']), src)



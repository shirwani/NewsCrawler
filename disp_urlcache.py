#!/usr/bin/python

#######################################################
# Display urlcache, with the number of urls in each src
#
# USAGE:
#   python disp_urlcache.py
#   python disp_urlcache.py bbc
#######################################################

import sys
from utils import *
import glob

if len(sys.argv) > 1:
    src = sys.argv[1]
else:
    src = '*'

urlcache = glob.glob("../urlcache/"+src+".dat")
for u in urlcache:
    src = u.split('/')[-1].split('.')[0]
    print "[%5d] %s" % (len(getUrlCache(src)), src)

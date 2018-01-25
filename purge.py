#!/usr/bin/python

########################################################
# Purge urlcache, data and logs for the specified source
#
# USAGE:
#   python purge.py bbc
########################################################

import sys
from utils import *

if len(sys.argv) > 1:
    src = sys.argv[1]
else:
    src = '*'

print "Deleting ../urlcache/%s.dat" % src
os.system("rm -f ../urlcache/"+src+".dat")

print "Deleting ../data/%s.json" % src
os.system("rm -f ../data/"+src+".json")

print "Deleting ../logs/%s.log" % src
os.system("rm -f ../logs/"+src+".json")

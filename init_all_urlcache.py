#!/usr/bin/python

###############################################################
# Clear urlcache for all sources - in multiple parallel threads
###############################################################

import time
from utils import *

sites = getSites()

for s in sites:
    if s is None or s == '' or s[0] == '#':
        continue
    src = s.split('|')[2].strip()
    print "Initializing urlcache for", src
    pid = os.fork()
    if pid == 0: # new process
        os.system("nohup python init_urlcache.py " + src + " > ../logs/" + src + ".log &")
        exit()

time.sleep(10) # wait extra before frst iteration
while not gen_log_summary():
    time.sleep(5)

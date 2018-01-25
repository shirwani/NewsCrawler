#!/usr/bin/python

#################################################################
# Call get_data.py for each src separately in a different thread,
# updating the log _summary.html file in parallel.
#################################################################

import time
from utils import *

os.system("rm -f ../logs/*.log")

sites = getSites()

for s in sites:
    if s is None or s == '' or s[0] == '#':
        continue
    src = s.split('|')[2].strip()
    print "Grabbing data for", src
    pid = os.fork()
    if pid == 0: # new process
        os.system("nohup python get_data.py " + src + " > ../logs/" + src + ".log &")
        exit()

time.sleep(10) # wait extra before frst iteration
t = 0
while not gen_log_summary():
    time.sleep(5)
    t += 1
    if t > 1000:
        print "Timed out... continuing with data merge and upload!"
        break

os.system("./merge_data.py")
os.system("./ftp_data")

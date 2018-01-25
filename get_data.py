#!/usr/bin/python

###############################################################################
# Get data for an individual src and save data into individual source data file
#
# USAGE:
#    python get_data.py bbc
###############################################################################

from utils import *
from data_grabbers import *

if len(sys.argv) > 1:
    sites = getSites(sys.argv[1:])
else:
    sites = getSites()

for s in sites:
    if s is None or s == '' or s[0] == '#':
        continue

    (tier, source, src, url) = s.split('|')
    source  = source.strip()
    src     = src.strip()
    url     = url.strip()

    print "Processing %s..." % src
    srcdatafile = '../data/' + src + '.json'

    os.system("rm -f ../logs/" + src + ".log")

    # Get new data from src url
    maxurls = None
    if src == 'breitbart':
        data = breitbart.getData(url, source, maxurls)
    elif src == 'cnn':
        data = cnn.getData(url, source, maxurls)
    elif src == 'dailymail':
        data = dailymail.getData(url, source, maxurls)
    elif src == 'huffingtonpost':
        data = huffingtonpost.getData(url, source, maxurls)
    elif src == 'reuters':
        data = reuters.getData(url, source, maxurls)
    else:
        data = default.getData(url, source, maxurls, src)

    # Merge with existing data
    if os.path.isfile(srcdatafile):
        data.extend(loadData(srcdatafile))

    # Purge old data
    data = purgeOldData(data)

    # Save data into src-specific data file
    saveData(data, srcdatafile)

    print "Done."

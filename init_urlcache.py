#!/usr/bin/python

###############################################################################
# Initialize urlcahce with all src links without actually reading from them
# USAGE:
#    python init_urlcache.py bbc
###############################################################################

import sys
from utils import *
import newspaper

if len(sys.argv) > 1:
    sites = getSites(sys.argv[1:])
else:
    print "*** USAGE: python init_urlcache.py <src> ***"
    sites = getSites()

for s in sites:
    if s is None or s == '' or s[0] == '#':
        continue

    src = s.split('|')[2].strip()
    url = s.split('|')[3].strip()

    print "Initializing urlcache for %s..." % src

    os.system("rm -f ../logs/" + src + ".log")
    os.system("rm -f ../data/" + src + ".json")

    paper = newspaper.build(url, memoize_articles=False, language='en')
    urlcache = []
    for a in paper.articles:
        urlcache.append(a.url)

    cacheUrls(urlcache, src)

    print "Done."

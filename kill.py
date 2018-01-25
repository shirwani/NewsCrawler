#!/usr/bin/python

import sys
import subprocess
import os

if len(sys.argv) > 1:
    arg = sys.argv[1]
else:
    arg = ''

output = subprocess.check_output("ps | grep 'get_data.py %s'" % arg, shell=True)
outarray = output.split("\n")
for a in outarray:
    if len(a.split()) > 0:
        os.system("kill -9 " + a.split()[0])

print subprocess.check_output("ps | grep 'get_data.py %s'" % arg, shell=True)

from utils import *
gen_log_summary()

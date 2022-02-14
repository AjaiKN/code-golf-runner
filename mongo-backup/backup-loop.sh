#!/bin/bash

#./backup-loop.sh 40
#backs up every 40 seconds

set -e

cd "$(dirname "$0")"

# first argument not set => 30 seconds
SLEEP_TIME="${1:-30}"

while true
do
  ./backup.sh
  sleep $SLEEP_TIME
done

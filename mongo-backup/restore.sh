#!/bin/bash

#./restore.sh directory_name
#restores every collection from directory_name and overwrites.

#./restore.sh --nsInclude=<namespace pattern> directory_name
#restores certain collections from directory_name and overwrites.
#see https://docs.mongodb.com/database-tools/mongorestore/
#(e.g. "test.myCollection", "reporting.*", "dept*.bar")
#You can specify --nsInclude multiple times to include multiple namespace patterns.

set -e

cd "$(dirname "$0")"

# load ../.env environment variables (for MONGO_URI)
export $(egrep -v '^#' ../.env | xargs)

THE_DATE=$(date +%Y-%m-%dT%H:%M:%S)
mongorestore --drop --uri="$MONGO_URI" "$@"

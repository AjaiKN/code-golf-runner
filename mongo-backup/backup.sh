#!/bin/bash

#no arguments

set -e

cd "$(dirname "$0")"

# load ../.env environment variables (for MONGO_URI)
export $(egrep -v '^#' ../.env | xargs)

THE_DATE=$(date +%Y-%m-%dT%H:%M:%S)
mongodump -o="$THE_DATE" --uri="$MONGO_URI"
echo
echo

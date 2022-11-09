#!/bin/sh

echo "Starting integration test."

# Start pocketbase server
/app/pocketbase serve --http=0.0.0.0:8090 &

# TODO: fix this. waits for server to start
sleep 1

node ./dist/index.js --url http://0.0.0.0:8090 --email test@test.com --password testpassword --out pocketbase-types-url.ts
node ./dist/index.js --db pb_data/data.db --out pocketbase-types-db.ts

cat pocketbase-types-url.ts
cat pocketbase-types-db.ts
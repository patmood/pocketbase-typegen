#!/bin/sh
echo "Starting integration test."

# Start pocketbase server
/app/pocketbase serve --http=0.0.0.0:8090 &

echo "Waiting for server to start."
while ! nc -z localhost 8090 </dev/null; do sleep 1; done

node ./dist/index.js --url http://0.0.0.0:8090 --email test@test.com --password testpassword --out output/pocketbase-types-url.ts
node ./dist/index.js --db pb_data/data.db --out output/pocketbase-types-db.ts
node ./dist/index.js --env --out output/pocketbase-types-env.ts

node integration.js
exit_status=$?

if [ $exit_status -eq 0 ]; then
  echo "Integration tests pass"
else
  echo "FAIL integration tests"
  exit $exit_status
fi

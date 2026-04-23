#!/bin/sh
echo "Starting integration test."
cd /app/test/integration
mkdir -p output

# Start pocketbase server
./pocketbase serve --http=0.0.0.0:8090 &

echo "Waiting for server to start."
while ! nc -z localhost 8090 </dev/null; do sleep 1; done

# Node tests
echo "Running Node integration tests..."
node ../../dist/cli.js --url http://0.0.0.0:8090 --email test@test.com --password testpassword --out ./output/pocketbase-types-url.ts
node ../../dist/cli.js --db pb_data/data.db --out ./output/pocketbase-types-db.ts
node ../../dist/cli.js --env --out ./output/pocketbase-types-env.ts

# Bun tests
echo "Running Bun integration tests..."
bun ../../dist/cli.js --url http://0.0.0.0:8090 --email test@test.com --password testpassword --out ./output/bun-pocketbase-types-url.ts
bun ../../dist/cli.js --db pb_data/data.db --out ./output/bun-pocketbase-types-db.ts
bun ../../dist/cli.js --env --out ./output/bun-pocketbase-types-env.ts

node integration.js
exit_status=$?

if [ $exit_status -eq 0 ]; then
  echo "Integration tests pass"
else
  echo "FAIL integration tests"
  exit $exit_status
fi

#!/bin/sh
echo "Starting pocketbase server. Username: test@test.com, Password: testpassword"

# Start pocketbase server
/app/test/integration/pocketbase serve --http=0.0.0.0:8090

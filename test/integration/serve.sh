#!/bin/sh
echo "Starting pocketbase server. Username: test@test.com, Password: testpassword"

# Start pocketbase server
/app/pocketbase serve --http=0.0.0.0:8090

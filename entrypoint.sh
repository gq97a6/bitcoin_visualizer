#!/bin/sh

# Create certs directory if it doesn't exist
mkdir -p certs

# Check if the key and certificate already exist
if [ ! -f certs/key.pem ] || [ ! -f certs/cert.pem ]; then
    echo "Generating self-signed certificates..."
    # Generate self-signed certificate and key
    openssl req -x509 -nodes -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem -days 365 \
        -subj "/C=US/ST=State/L=Location/O=Organization/OU=Unit/CN=localhost"
else
    echo "Using provided certificates."
fi

# Run the application
exec node index.js
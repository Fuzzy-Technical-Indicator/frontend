#!/bin/bash

IMAGE_NAME="fuzzy-indicator-frontend"

docker build -t $IMAGE_NAME .

# Check if the image build was successful
if [ $? -eq 0 ]; then
  echo "Docker image build successful."
else
  echo "Docker image build failed. Exiting."
  exit 1
fi

# Run the Docker container
docker run -d -p 3000:3000 $IMAGE_NAME

# Check if the container is running
if [ $? -eq 0 ]; then
  echo "Docker container is running. Access your SvelteKit website at http://localhost:3000"
else
  echo "Failed to start the Docker container. Exiting."
fi


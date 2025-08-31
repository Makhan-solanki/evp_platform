#!/bin/bash

# ExperienceHub OCI Deployment Script
# This script deploys the ExperienceHub application to Oracle Cloud Infrastructure

set -e

# Configuration
REGION="us-ashburn-1"  # Change to your preferred region
TENANCY_OCID="ocid1.tenancy.oc1..example"  # Replace with your tenancy OCID
COMPARTMENT_ID="ocid1.compartment.oc1..example"  # Replace with your compartment OCID
SUBNET_ID="ocid1.subnet.oc1.us-ashburn-1.example"  # Replace with your subnet OCID
AVAILABILITY_DOMAIN="EXAMPLE:US-ASHBURN-AD-1"  # Replace with your AD

# Repository configuration
REPO_NAME="experiencehub"
CLIENT_IMAGE="experiencehub-client:latest"
SERVER_IMAGE="experiencehub-server:latest"

echo "🚀 Starting ExperienceHub OCI Deployment..."

# Check if OCI CLI is installed
if ! command -v oci &> /dev/null; then
    echo "❌ OCI CLI is not installed. Please install it first."
    echo "Visit: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm"
    exit 1
fi

# Check if user is authenticated
if ! oci iam user get &> /dev/null; then
    echo "❌ Not authenticated with OCI. Please run 'oci setup config' first."
    exit 1
fi

echo "✅ OCI CLI is configured and authenticated"

# Build Docker images
echo "🔨 Building Docker images..."
docker build -t $CLIENT_IMAGE ./client
docker build -t $SERVER_IMAGE ./server

# Login to OCIR
echo "🔐 Logging into Oracle Container Registry..."
docker login ${REGION}.ocir.io

# Tag images for OCIR
echo "🏷️  Tagging images for OCIR..."
docker tag $CLIENT_IMAGE ${REGION}.ocir.io/${TENANCY_OCID}/${REPO_NAME}/${CLIENT_IMAGE}
docker tag $SERVER_IMAGE ${REGION}.ocir.io/${TENANCY_OCID}/${REPO_NAME}/${SERVER_IMAGE}

# Push images to OCIR
echo "📤 Pushing images to OCIR..."
docker push ${REGION}.ocir.io/${TENANCY_OCID}/${REPO_NAME}/${CLIENT_IMAGE}
docker push ${REGION}.ocir.io/${TENANCY_OCID}/${REPO_NAME}/${SERVER_IMAGE}

# Create container instances
echo "🏗️  Creating container instances..."

# Create server container instance
echo "Creating server container instance..."
SERVER_INSTANCE=$(oci container-instances container-instance create \
  --display-name experiencehub-server \
  --availability-domain $AVAILABILITY_DOMAIN \
  --compartment-id $COMPARTMENT_ID \
  --containers '[{"imageUrl": "'${REGION}'.ocir.io/'${TENANCY_OCID}'/'${REPO_NAME}'/'${SERVER_IMAGE}'", "displayName": "server", "environmentVariables": {"NODE_ENV": "production"}}]' \
  --shape VM.Standard.A1.Flex \
  --shape-config '{"ocpus": 1, "memoryInGBs": 6}' \
  --subnet-id $SUBNET_ID \
  --query 'data.id' \
  --raw-output)

echo "✅ Server container instance created: $SERVER_INSTANCE"

# Create client container instance
echo "Creating client container instance..."
CLIENT_INSTANCE=$(oci container-instances container-instance create \
  --display-name experiencehub-client \
  --availability-domain $AVAILABILITY_DOMAIN \
  --compartment-id $COMPARTMENT_ID \
  --containers '[{"imageUrl": "'${REGION}'.ocir.io/'${TENANCY_OCID}'/'${REPO_NAME}'/'${CLIENT_IMAGE}'", "displayName": "client", "environmentVariables": {"NODE_ENV": "production"}}]' \
  --shape VM.Standard.A1.Flex \
  --shape-config '{"ocpus": 1, "memoryInGBs": 6}' \
  --subnet-id $SUBNET_ID \
  --query 'data.id' \
  --raw-output)

echo "✅ Client container instance created: $CLIENT_INSTANCE"

# Wait for instances to be running
echo "⏳ Waiting for container instances to be ready..."
sleep 30

# Get instance IPs
SERVER_IP=$(oci container-instances container-instance get \
  --container-instance-id $SERVER_INSTANCE \
  --query 'data.vnics[0].public-ip' \
  --raw-output)

CLIENT_IP=$(oci container-instances container-instance get \
  --container-instance-id $CLIENT_INSTANCE \
  --query 'data.vnics[0].public-ip' \
  --raw-output)

echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "  Server Instance ID: $SERVER_INSTANCE"
echo "  Server IP: $SERVER_IP"
echo "  Client Instance ID: $CLIENT_INSTANCE"
echo "  Client IP: $CLIENT_IP"
echo ""
echo "🌐 Access your application:"
echo "  Frontend: http://$CLIENT_IP"
echo "  Backend API: http://$SERVER_IP:5000"
echo ""
echo "📝 Next steps:"
echo "  1. Configure your domain DNS to point to these IPs"
echo "  2. Set up SSL certificates"
echo "  3. Configure environment variables in the container instances"
echo "  4. Set up monitoring and logging"

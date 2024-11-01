# Use the official Node.js image as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Clone the repository
COPY . /app

# Install LibreOffice and dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    libreoffice-writer \
    libreoffice-impress \
    fonts-liberation \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create directory for temporary files with proper permissions
RUN mkdir -p /tmp/convert && \
    chmod 777 /tmp/convert && \
    chown node:node /tmp/convert

# Install dependencies
RUN npm install

# Keep the container running
CMD ["tail", "-f", "/dev/null"]
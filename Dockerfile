# Use the official Node.js image as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Clone the repository
COPY . /app

# Install LibreOffice
RUN apt-get update && apt-get install -y \
    libreoffice \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
    
# Install dependencies
RUN npm install

# Keep the container running
CMD ["tail", "-f", "/dev/null"]
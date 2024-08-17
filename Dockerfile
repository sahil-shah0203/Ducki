# Use the official Node.js image as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Clone the repository
COPY . /app

# Install dependencies
RUN npm install

# Keep the container running
CMD ["tail", "-f", "/dev/null"]
#Docker is like running an OS, where Docker images can be built on top of one another.
#We will build on top of thenode base 18 image which is built on top of a linux image

# Stage 1: Build stage
FROM node:18 AS builder

WORKDIR /app

# Set the environment to development to ensure devDependencies are installed
ENV NODE_ENV=development

COPY package*.json ./

RUN npm install

COPY . .

# Build the app using the installed TypeScript version
RUN npm run build

# Stage 2: Production stage
FROM node:18

# Install ffmpeg in the container
RUN apt-get update && apt-get install -y ffmpeg

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built app from the builder stage
COPY --from=builder /app/dist ./dist

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define the command to run your app using CMD which defines your runtime
CMD [ "npm", "run", "serve" ]

FROM node:14-alpine

# Set the working directory inside the container
WORKDIR /usr/src/backend

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the remaining application code to the working directory
COPY . ./

# Expose the port on which the app will run
EXPOSE 3001

# Start the Express app
CMD ["npm", "start"]

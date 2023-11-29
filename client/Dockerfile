FROM node:14-alpine

# Set the working directory inside the container
WORKDIR /usr/src/frontend

# Copy package.json and package-lock.json to the working directory
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Copy the remaining application code to the working directory
COPY . ./

# Build the React app for production
RUN npm run build

# Expose the port on which the app will run
EXPOSE 80

# Start the app
CMD ["npm", "start"]

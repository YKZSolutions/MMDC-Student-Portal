# Use the official Node.js image as the base image
FROM node:24 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

##################################
#### First stage of the build ####
##################################
FROM base AS deps

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json to the working directory
COPY backend/package*.json ./

# Install the application dependencies
# --dangerously-allow-all-builds allows for building all packages, even if they have build scripts
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile --dangerously-allow-all-builds

###################################
#### Second stage of the build ####
###################################
FROM base AS builder

WORKDIR /usr/src/app

# Copy the necessary files from the dependencies stage
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/package*.json ./package*.json

# Copy the rest of the application code to the working directory
RUN rm -rf prisma
COPY backend/ .

# Generate Prisma client and SQL files
RUN pnpm run prisma-gen
RUN pnpm run prisma-gen-sql

# Build the application
RUN pnpm run build

##################################
#### Final stage of the build #### 
##################################
FROM base AS final

WORKDIR /usr/src/app

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Expose the application port
EXPOSE 3001

# Command to run the application
CMD ["node", "dist/main"]
FROM ubuntu
RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs

# ENV PORT=${PORT}
# ENV JWT_SECRET=${JWT_SECRET}
# ENV NEON_DATABASE_URL=${NEON_DATABASE_URL}
# ENV API_SECRET=${API_SECRET}
# ENV API_KEY=${API_KEY}
# ENV CLOUD_NAME=${CLOUD_NAME}


RUN mkdir drizzle
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY drizzle.config.ts drizzle.config.ts
COPY tsconfig.json tsconfig.json
COPY .env .env
COPY ./src ./src

RUN npm install
RUN npm run build

EXPOSE 3002
ENTRYPOINT ["npm","start"]

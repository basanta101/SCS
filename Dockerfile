
FROM node:20-alpine
WORKDIR /
COPY . .
RUN npm i
CMD ["node", "app.js"]
EXPOSE 3000
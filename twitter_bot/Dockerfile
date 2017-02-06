FROM node

WORKDIR /tmp/
COPY index.js package.json /tmp/
RUN npm install --production

CMD ["node", "index.js"]

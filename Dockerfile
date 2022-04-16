FROM node:14.15.0
ENV TZ=Asia/Shanghai
# COPY . /home/qim
# WORKDIR /home/qim
# RUN npm install -g yarn --registry=https://registry.npm.taobao.org &&
# RUN yarn --no-lockfile --registry=https://registry.npm.taobao.org && cd server && yarn --no-lockfile --registry=https://registry.npm.taobao.org
# RUN yarn build


WORKDIR /home/qim/server
CMD ["yarn","start"]

# EXPOSE 2017

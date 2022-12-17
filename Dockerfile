FROM node:14.18.0
ENV TZ=Asia/Shanghai
# COPY . /home/qim
# WORKDIR /home/qim
# RUN npm install -g yarn --registry=https://registry.npm.taobao.org &&
# RUN yarn --no-lockfile --registry=https://registry.npm.taobao.org && cd server && yarn --no-lockfile --registry=https://registry.npm.taobao.org
# RUN yarn build


WORKDIR /home/qim
CMD ["pnpm", "start:prod"]

# EXPOSE 2017

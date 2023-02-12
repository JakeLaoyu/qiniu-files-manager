FROM node:14.18.0 AS frontend
ENV TZ=Asia/Shanghai

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
COPY . /home/qim
WORKDIR /home/qim

RUN pnpm install --frozen-lockfile
RUN pnpm build

RUN apt-get update && apt-get install -y nginx

COPY ./deploy/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["pnpm", "start:prod" , "&&", "nginx"]
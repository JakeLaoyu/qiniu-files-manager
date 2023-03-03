FROM --platform=$TARGETPLATFORM node:14.18.0 AS frontend
ENV TZ=Asia/Shanghai

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
COPY . /home/qim
WORKDIR /home/qim

RUN pnpm install --frozen-lockfile
RUN pnpm build

ENTRYPOINT ["pnpm", "start:prod"]
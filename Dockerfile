FROM --platform=$TARGETPLATFORM node:16.10.0 AS frontend
ENV TZ=Asia/Shanghai

RUN npm install pnpm@7 -g
COPY . /home/qim
WORKDIR /home/qim

RUN pnpm install --frozen-lockfile
RUN pnpm build
RUN rm -rf ./**/node_modules
RUN pnpm i --prod --frozen-lockfile
RUN rm -rf ./packages/client/node_modules

# simplify
FROM --platform=$TARGETPLATFORM node:16.10.0-alpine AS backend
WORKDIR /home/qim
COPY --from=frontend /home/qim .
WORKDIR /home/qim/packages/server

ENTRYPOINT ["npm", "run", "start:prod"]
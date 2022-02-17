FROM node:16.13-alpine3.15

RUN set -ex; \
    adduser -D codewarrior; \
    mkdir -p /workspace; \
    chown codewarrior:codewarrior /workspace;

COPY --chown=codewarrior:codewarrior workspace/package.json /workspace/package.json
COPY --chown=codewarrior:codewarrior workspace/package-lock.json /workspace/package-lock.json
COPY --chown=codewarrior:codewarrior workspace/lc-test.js /workspace/lc-test.js

USER codewarrior
WORKDIR /workspace
RUN npm install

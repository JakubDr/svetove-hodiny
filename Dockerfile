# syntax=docker/dockerfile:1

# ── Build stage: syntax check + smoke tests of the API ────────
FROM node:24-alpine AS build
WORKDIR /src
COPY package.json ./
COPY server ./server
COPY public ./public
COPY test ./test
RUN npm test

# ── Runtime stage: zero dependencies, non-root ────────────────
FROM node:24-alpine AS runtime
RUN apk add --no-cache tini
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    TZ=Europe/Prague
WORKDIR /app
COPY --from=build /src/server ./server
COPY --from=build /src/public ./public
COPY --from=build /src/package.json ./package.json

USER node
EXPOSE 3000
# /api/health is used by Docker and by the compose healthcheck.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# tini keeps PID 1 semantics (signal forwarding, zombie reaping)
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server/index.js"]

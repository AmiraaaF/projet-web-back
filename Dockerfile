FROM denoland/deno:1.37.0
WORKDIR /app
COPY . .
RUN deno cache server.ts
ENV PORT=8080
CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-write", "server.ts"]
EXPOSE ${PORT}

FROM denoland/deno:1.37.0
WORKDIR /app
COPY . .
RUN deno cache app.ts
ENV PORT=3002
CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-write", "app.ts"]
EXPOSE ${PORT}

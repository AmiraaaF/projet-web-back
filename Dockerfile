FROM denoland/deno:1.37.0
WORKDIR /app
COPY . .
ENV PORT=3002
# Ignorer les erreurs de cache et continuer quand même
RUN deno cache app.ts || echo "Cache failed, continuing anyway"
CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-write", "app.ts"]
EXPOSE ${PORT}

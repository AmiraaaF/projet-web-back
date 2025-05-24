FROM denoland/deno:2.2.3

WORKDIR /app

# Copier le fichier lock et l'app pour la mise en cache
COPY deno.lock ./
COPY app.ts ./

RUN deno cache --allow-import --lock=deno.lock app.ts


# Copier le reste des fichiers
COPY . .

ENV PORT=3002
EXPOSE 3002

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-write", "--lock=deno.lock", "app.ts"]

# 1. Utiliser l'image officielle Deno
FROM denoland/deno:1.37.0

# 2. Définir le dossier de travail
WORKDIR /app

# 3. Copier le fichier lock en premier pour optimiser le cache Docker
COPY deno.lock ./

# 4. Copier les fichiers essentiels (app.ts et deps.ts si tu en as)
COPY app.ts ./
# COPY deps.ts ./  # décommente si tu as un fichier deps.ts

# 5. Mettre en cache les dépendances sans accès réseau (cache-only)
RUN deno cache --lock=deno.lock app.ts



# 6. Copier tout le reste des fichiers de l'app
COPY . .

# 7. Définir la variable d'environnement du port (ajuste si nécessaire)
ENV PORT=3002

# 8. Exposer le port configuré
EXPOSE ${PORT}

# 9. Lancer l'application en mode production avec lockfile et cache-only
CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-write", "--lock=deno.lock", "--cached-only", "app.ts"]

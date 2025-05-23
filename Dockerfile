# Étape de construction pour télécharger les dépendances
FROM denoland/deno:1.37.0 AS builder

# Copier uniquement les fichiers nécessaires pour le cache des dépendances
WORKDIR /build
COPY app.ts .
COPY routes/ routes/
COPY controllers/ controllers/
COPY middlewares/ middlewares/
COPY models/ models/
COPY utils/ utils/

# Désactiver les vérifications de mise à jour pour accélérer le build
ENV DENO_NO_UPDATE_CHECK=true

# Créer un cache local des dépendances (cette étape sera ignorée si elle échoue)
RUN deno cache app.ts || echo "Cache failed, continuing anyway"

# Étape finale avec l'application
FROM denoland/deno:1.37.0

WORKDIR /app
# Copier le cache Deno de l'étape précédente
COPY --from=builder /root/.cache/deno /root/.cache/deno
# Copier tous les fichiers de l'application
COPY . .

# Configuration de l'environnement
ENV PORT=3002

# Commande de démarrage
CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-write", "app.ts"]

# Exposer le port
EXPOSE ${PORT}

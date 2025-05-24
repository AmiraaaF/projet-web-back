import { Application, Context, Router } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { oakCors } from "http://deno.land/x/cors/mod.ts";
import { create, verify } from "http://deno.land/x/djwt/mod.ts";
import * as bcrypt from "http://deno.land/x/bcrypt/mod.ts";
import { DB } from "http://deno.land/x/sqlite/mod.ts";

const PORT = 3002;
const CORS_IP = Deno.args.length >= 1 ? Deno.args[0] : "localhost";
const CORS_PORT = Deno.args.length >= 2 ? Deno.args[1] : "8060";
const cooldown = 5 * 1000; // 5 secondes de cooldown pour chaque utilisateur

const router = new Router();
const app = new Application();

//connexion a SQLite
const db = new DB("database.sqlite");
// stockage des fichiers dans un dossier /uploads 
const uploadDir = "uploads";
try {
  await Deno.stat(uploadDir);
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    await Deno.mkdir(uploadDir);
    console.log("Dossier 'uploads' créé !");
  }
}


// Création de la table `users`
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL DEFAULT 'user',
    username TEXT UNIQUE,
    password_hash TEXT
  )
`);

// Table des messages ( commentaires)
db.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);
// Table des places de parking
db.query(`
  CREATE TABLE IF NOT EXISTS parkings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    adresse TEXT,
    lat REAL,
    lon REAL
  )
`);



if (Deno.args.length < 1) {
  console.log(`Usage: $ deno run --allow-net back_server.ts PORT [CERT_PATH KEY_PATH]`);
  Deno.exit();
}

const options: any = { port: Number(Deno.args[0]) };

if (Deno.args.length >= 3) {
  options.secure = true;
  options.cert = await Deno.readTextFile(Deno.args[1]);
  options.key = await Deno.readTextFile(Deno.args[2]);
  console.log(`SSL conf ready (use https)`);
}

console.log(`🚀 Oak back server running on port ${options.port}`);


// Clé secrète pour la signature des JWT
const secretKey = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"]
);

// Fonction pour hacher un mot de passe avant de le stocker
async function get_hash(password: string): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
}
// Fonction pour récupérer un utilisateur depuis la base de données
function getUser(username: string) {
  const result = db.query("SELECT * FROM users WHERE username = ?", [username]);
  return result.length >0 ? result[0] : null // Retourne le premier utilisateur ou null si non trouvé

  // return db.query("SELECT * FROM users WHERE username = ?", [username])[0]; (ancien code)
}


router.get("/ws", async (ctx) => {
    const request = ctx.request.serverRequest;
    const { headers } = request;
  
    // Récupération du cookie contenant le token
    const cookieHeader = headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;
  
    if (!token) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }
  
    try {
      // Vérification du token
      const payload = await verify(token, secretKey);
      console.log(`User ${payload.userName} connected`);
  
      // const { conn, r: bufReader, w: bufWriter, headers } = request;
      const ws = await Deno.upgradeWebSocket(request);
  
      // Ajouter la connexion au set
      connections.add(ws);
     
    ws.onmessage = (event) => {
      console.log("Message reçu:", event.data);
      const data = JSON.parse(event.data);
      
      const user = getUser(data.username);
      if (!user) return;
      
      db.query("INSERT INTO messages (user_id, content) VALUES (?, ?)", [
        user.id,
        data.content
      ]);
      
      for (const client of connections) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ username: data.username, content: data.content }));
        }
      }
    };
  
      ws.onclose = () => {
        connections.delete(ws);
        console.log("Client disconnected");
      };
  
      ws.onerror = (err) => console.error("WebSocket error:", err);
  
    } catch {
      ctx.response.status = 403;
      ctx.response.body = "Forbidden";
    }
  });




//Route publique de la page d'accueil
router.get("/", (ctx) => {
  ctx.response.status = 200;
  ctx.response.body = "Hello world!";
});


// Fonction pour vérifier l'authentification du token JWT
const is_authorized = async (auth_token: string) => {
  if (!auth_token) {
    return false;
  }
  try {
    const payload = await verify(auth_token, secretKey);
    return payload.userName in tokens;
  } catch {
    console.log("Échec de la vérification du token");
    return false;
  }
};





// Variables de connexion WebSocket
const connections: WebSocket[] = [];
const tokens: { [key: string]: string } = {};

// Fonction pour retirer un token
function removeTokenByUser(user: string) {
  for (const token in tokens) {
    if (tokens[token] === user) {
      delete tokens[token];
      break;
    }
  }
}

// Routes du serveur
router.post("/login", async (ctx) => {
  //* ca pour la nouvelle version Oak 17.-- *\\
  const body = await ctx.request.body.json();
  const { username, password } = body;
  

  const user = getUser(username);
  if (!user || !(await bcrypt.compare(password, user[2]))) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Nom d'utilisateur ou mot de passe incorrect" };
    return;
  }

  const token = await create({ alg: "HS512", typ: "JWT" }, { userName: user.username }, secretKey);
  ctx.cookies.set("auth_token", token, { httpOnly: true, secure: false, maxAge: 60 * 60 * 24, sameSite: "strict" });

  ctx.response.status = 200;
  ctx.response.body = { message: "success" };
});

router.get("/", (ctx) => {
  if (!ctx.isUpgradable) {
    ctx.throw(501);
  }

  const ws = ctx.upgrade();
  connections.push(ws);
  console.log(`+ WebSocket connecté (${connections.length})`);

  ws.onerror = (_error) => {
    const index = connections.indexOf(ws);
    if (index !== -1) {
      connections.splice(index, 1);
    }
    console.log("- WebSocket déconnecté en raison d'une erreur");
  };

  ws.onmessage = async (event) => {
    const message = event.data;
    const data = JSON.parse(message);

    // Vérification du token d'authentification
    if (!("auth_token" in data && await is_authorized(data.auth_token))) {
      ws.send(JSON.stringify({ go_to_login: true }));
      return;
    }

    const owner = tokens[data.auth_token];
    const user = users.find((u) => u.username === owner);

    if (!user) {
      console.log("? L'utilisateur n'existe pas");
      ws.close();
      return;
    }

    };
  });

  
// création du compte

router.post("/register", async (ctx) => {
  const body = await ctx.request.body.json();
  const { username, password } = body;

  if (getUser(username)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Nom d'utilisateur déjà pris" };
    return;
  }

  
  // Hasher le mot de passe
  const password_hash = await get_hash(password);
  db.query("INSERT INTO users (username, password_hash) VALUES (?, ?)", [username, password_hash]);




  const token = await create({ alg: "HS512", typ: "JWT" }, { userName: username }, secretKey);
  ctx.cookies.set("auth_token", token, { httpOnly: true, secure: false, maxAge: 60 * 60 * 24, sameSite: "strict" });


  ctx.response.status = 201; // Utilisé pour les créations
  ctx.response.body = { message: "User successfully registered" };
});
// Middleware to verify JWT token (partie 3)
const authorizationMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  const cookie = ctx.request.headers.get("cookie");
  const authToken = cookie?.split("; ").find(row => row.startsWith("auth_token="))?.split('=')[1];

  if (!authToken) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Unauthorized: Missing token" };
    return;
  }

  try {
    // Verify the token
    const tokenData = await verify(authToken, secretKey);
    ctx.state.tokenData = tokenData; // Store data in ctx.state for use in other middlewares/routes
    await next();
  } catch {
    ctx.response.status = 401;
    ctx.response.body = { error: "Unauthorized: Invalid token" };
  }
};
// the cookie is tested in the middleware (the cookie is provided by the browser in a header)
router.get("/profile", authorizationMiddleware, (ctx) => {
  const tokenData = ctx.state.tokenData;
  // const user = users.find((u) => u.username === tokenData.userName);
  const user = getUser(tokenData.userName);
  if (user) {
    ctx.response.status = 200;
    ctx.response.body = { username: user.username, id: user.id }; // Ajoutez d'autres informations si nécessaire
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "User not found" };
  }
});


// Gestion des places de parking
// GET /api/parkings?lat=48.8&lon=2.35
router.get("/api/parkings", (ctx) => {
  const url = ctx.request.url;
  const lat = parseFloat(url.searchParams.get("lat") || "");
  const lon = parseFloat(url.searchParams.get("lon") || "");

  if (isNaN(lat) || isNaN(lon)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Latitude ou longitude manquante" };
    return;
  }

  // Rayon de recherche (en km)
  const radiusKm = 5;

  // Requête de recherche (approx. en degrés latitude/longitude)
  const delta = radiusKm / 111;

  const rows = db.query(`
    SELECT id, nom, adresse, lat, lon
    FROM parkings
    WHERE lat BETWEEN ? AND ?
      AND lon BETWEEN ? AND ?
  `, [lat - delta, lat + delta, lon - delta, lon + delta]);

  const parkings = rows.map(([id, nom, adresse, plat, plon]) => ({
    id,
    nom,
    adresse,
    lat: plat,
    lon: plon
  }));

  ctx.response.status = 200;
  ctx.response.body = parkings;
});

// POST /api/parkings
// POST /api/parkings
router.post("/api/parkings", authorizationMiddleware, async (ctx) => {
  const { nom, adresse, lat, lon } = await ctx.request.body({ type: "json" }).value;

  if (!nom || !adresse || isNaN(lat) || isNaN(lon)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Données manquantes ou invalides" };
    return;
  }

  db.query("INSERT INTO parkings (nom, adresse, lat, lon) VALUES (?, ?, ?, ?)", [
    nom,
    adresse,
    lat,
    lon
  ]);

  ctx.response.status = 201;
  ctx.response.body = { message: "Parking ajouté avec succès" };
});

// Route pour récupérer des parkings depuis OpenStreetMap via Overpass API
router.get("/api/osm-parkings", async (ctx) => {
  const url = ctx.request.url;
  const lat = parseFloat(url.searchParams.get("lat") || "");
  const lon = parseFloat(url.searchParams.get("lon") || "");

  if (isNaN(lat) || isNaN(lon)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Latitude ou longitude manquante ou invalide" };
    return;
  }

  const radius = 1000; // en mètres
  const query = `
    [out:json];
    (
      node["amenity"="parking"](around:${radius},${lat},${lon});
      way["amenity"="parking"](around:${radius},${lat},${lon});
      relation["amenity"="parking"](around:${radius},${lat},${lon});
    );
    out center;
  `;

  try {
    const overpassResponse = await fetch("http://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    const data = await overpassResponse.json();

    const parkings = data.elements
      .map((e: any) => ({
        id: e.id,
        lat: e.lat || e.center?.lat,
        lon: e.lon || e.center?.lon,
        nom: e.tags?.name || "Parking OSM",
      }))
      .filter(p => p.lat && p.lon);

    ctx.response.status = 200;
    ctx.response.body = parkings;

  } catch (err) {
    console.error("Erreur Overpass:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de la récupération des parkings OSM" };
  }
});



app.use(oakCors({ 
  origin: `http://localhost:8060`,
  credentials: true,
  
 }));



app.use(router.routes());
app.use(router.allowedMethods()),

console.log(`Serveur démarré sur http://localhost:${PORT}`);
await app.listen({ port: PORT });

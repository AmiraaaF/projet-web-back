import db from "../models/db.ts"; // Import de la connexion à la base de données

// =========================
// Contrôleur des parkings
// =========================

// Fonction pour récupérer les parkings proches d'une position (latitude/longitude)
// Prend en entrée une latitude et une longitude
// Retourne les parkings situés dans un rayon de 5 km autour de la position donnée
export function getParkings(lat: number, lon: number) {
  const radius = 5000; // 5km

  const results = db.query(
    `SELECT nom, lat, lon FROM parkings 
     WHERE ABS(lat - ?) < 0.1 AND ABS(lon - ?) < 0.1`,
    [lat, lon]
  );

  return results.map((row: any) => ({
    name: row[0],
    lat: row[1],
    lon: row[2],
    type: "privé",       
    covered: true        
  }));
}



// Fonction pour créer un nouveau parking dans la base de données
// Prend en entrée le nom, l'adresse, la latitude et la longitude du parking
export async function createParking(nom: string, adresse: string, lat: number, lon: number) {
  db.query(
    "INSERT INTO parkings (name, address, latitude, longitude) VALUES (?, ?, ?, ?)",
    [nom, adresse, lat, lon]
  );
}


import db from "../models/db.ts"; // Import de la connexion à la base de données

// =========================
// Contrôleur des parkings
// =========================

// Fonction pour récupérer les parkings proches d'une position (latitude/longitude)
// Prend en entrée une latitude et une longitude
// Retourne les parkings situés dans un rayon de 5 km autour de la position donnée
export function getParkings(lat: number, lon: number) {
  const radiusKm = 5; // Rayon de recherche en kilomètres
  const delta = radiusKm / 111; // Approximation pour convertir km en degrés (1° ≈ 111 km)

  // Requête SQL pour sélectionner les parkings dans la zone
  const rows = db.query(`
    SELECT id, nom, adresse, lat, lon
    FROM parkings
    WHERE lat BETWEEN ? AND ?
      AND lon BETWEEN ? AND ?
  `, [lat - delta, lat + delta, lon - delta, lon + delta]);

  // On retourne les résultats sous forme d'objets
  return rows.map(([id, nom, adresse, plat, plon]) => ({
    id, nom, adresse, lat: plat, lon: plon
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


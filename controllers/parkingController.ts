import db from "../models/db.ts";

export function getParkings(lat: number, lon: number) {
  const radiusKm = 5;
  const delta = radiusKm / 111;

  const rows = db.query(`
    SELECT id, nom, adresse, lat, lon
    FROM parkings
    WHERE lat BETWEEN ? AND ?
      AND lon BETWEEN ? AND ?
  `, [lat - delta, lat + delta, lon - delta, lon + delta]);

  return rows.map(([id, nom, adresse, plat, plon]) => ({
    id, nom, adresse, lat: plat, lon: plon
  }));
}

export async function createParking(nom: string, adresse: string, lat: number, lon: number) {
  db.query("INSERT INTO parkings (nom, adresse, lat, lon) VALUES (?, ?, ?, ?)", [
    nom, adresse, lat, lon
  ]);
}


import db from "../models/db.ts";

const username = "admin"; 

db.query("UPDATE users SET role = 'admin' WHERE username = ?", [username]);

console.log(`L'utilisateur "${username}" est maintenant admin.`);

import { Router } from 'express';
import Docker from 'dockerode';
import db from '../db.js';

const router = Router();

/*
GET /api/settings                 – Einstellungen laden
PUT /api/settings                 – Einstellungen speichern (Sprache, WS-Intervall, etc.) */

router.get('/', (req, res) => {
    try {
        const settings = db.prepare(' select * from settings').all();


        const settings = rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});


        res.json(settings);

    } catch (error) {
        console.error("Datenbankfehler:", error);
        res.status(500).json({ error: "Fehler beim Laden der Einstellungen" });
    }
});

router.put('/', (req, res) => {

    const updates = req.body;

    try {
        const updateSetting = db.prepare('UPDATE settings SET value = ? WHERE key = ?');

        const transaction = db.transaction((settingsObj) => {
            for (const [key, value] of Object.entries(settingsObj)) {
                updateSetting.run(String(value), key);
            }
        });

        transaction(updates);
        res.json({ message: "Einstellungen erfolgreich gespeichert." });
    } catch (error) {
        console.error("Datenbankfehler:", error);
        res.status(500).json({ error: "Fehler beim Speichern der Einstellungen" });
    }
});


export default settings;
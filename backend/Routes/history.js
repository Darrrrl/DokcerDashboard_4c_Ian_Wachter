import { Router } from 'express';
import db from '../db.js';

const router = Router();

/*
GET /api/history                  – Events aus SQLite (Filter: container, type, von/bis) */


router.get('/', (req, res) => {
    try {
        const { container, type, from, to, limit = 50 } = req.query;

        let sql = 'SELECT * FROM events WHERE 1=1';
        const params = [];

        if (container) {
            sql += ' AND (container_id = ? OR container_name = ?)';
            params.push(container, container);
        }

        if (type) {
            sql += ' AND type = ?';
            params.push(type);
        }

        if (from) {
            sql += ' AND timestamp >= ?';
            params.push(Number(from));
        }

        if (to) {
            sql += ' AND timestamp <= ?';
            params.push(Number(to));
        }

        sql += ' ORDER BY timestamp DESC LIMIT ?';
        params.push(Number(limit));

        const events = db.prepare(sql).all(...params);

        res.json(events);
    } catch (error) {
        console.error("History API Error:", error);
        res.status(500).json({ error: "Failed to fetch event history" });
    }
});

export default router;


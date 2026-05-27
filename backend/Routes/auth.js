import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { error } from 'console';
import { authenticateToken } from '../middleware/authMiddleware.js';
import 'dotenv/config';

const router = Router();

/*
POST /api/auth/setup          – Ersteinrichtung (User + PW anlegen)
GET  /api/auth/setup-required – Prüfen ob Setup nötig
POST /api/auth/login          – Login → JWT zurückgeben
PUT  /api/auth/password       – Passwort ändern (Settings)*/


router.get('/setup-required', (req, res) => {

    const user = db.prepare('select * FROM users limit 1').get();
    res.json({ required: !user });

});

router.post('/setup', async (req, res) => {

    const { username, password } = req.body;

    const hash = await bcrypt.hash(password, 12);

    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);

    res.json({ ok: true });

});

router.post('/login', async (req, res) => {

    const { username, password } = req.body;

    const user = db.prepare(' select * from users where username = ?').get(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {

        return res.status(401).json({ error: 'Invalide credentials' });

    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token });

});


router.put('/password', authenticateToken, async (req, res) => {

    const { id, oldPassword, newPassword } = req.body;

    const user = db.prepare(' select * from users where id = ?').get(id);

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {

        return res.status(401).json({ error: 'Invalide credentials' });

    }
    const password = await bcrypt.hash(newPassword, 12);

    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(password, id);

    res.json({ ok: true });
});

export default router;


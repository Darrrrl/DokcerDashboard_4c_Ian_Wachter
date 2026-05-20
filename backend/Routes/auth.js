import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { error } from 'console';

const router = Router();

app.get('/setup-required', (req, res) => {

    const user = db.prepare('SELECT * FROM users LIMIT 1').get();
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

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token });

});


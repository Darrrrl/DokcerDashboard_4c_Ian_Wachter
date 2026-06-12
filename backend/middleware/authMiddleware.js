import jwt from 'jsonwebtoken';
import 'dotenv/config';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];


    const token = authHeader && authHeader.split(' ')[1];

    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ error: "Kein Token übergeben" });
    }


    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log("5. ABBRUCH: JWT Fehler:", err.message);
            return res.status(403).json({ error: "Token ungültig oder abgelaufen" });
        }

        req.user = user;
        next();
    });
}
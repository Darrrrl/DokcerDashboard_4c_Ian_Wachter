import jwt from 'jsonwebtoken';
import 'dotenv/config';

export function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    jwt.verify(token, process.env.JWT_SecretKey, (err, decodedUser) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token." });
        }

        req.user = decodedUser;

        next();
    });
}
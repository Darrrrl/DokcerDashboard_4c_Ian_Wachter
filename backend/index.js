import express from 'express';
import cors from 'cors';
import Docker from 'dockerode';
import db from './db.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { authenticateToken } from './middleware/authMiddleware.js';

import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import authRoutes from './Routes/auth.js';
import containerRoutes from './Routes/containers.js';
import historyRoutes from './Routes/history.js';
import settingsRoutes from './Routes/settings.js';

const app = express();
const port = 3000;

const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/container', authenticateToken, containerRoutes);
app.use('/api/history', authenticateToken, historyRoutes);
app.use('/api/settings', authenticateToken, settingsRoutes);

// --- Swagger Configuration ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'DockerDash API',
            version: '1.0.0',
            description: 'API Dokumentation für das Docker-Management Backend',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        }
    },
    apis: ['./Routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- Database Logging ---
export function logEvent(containerId, containerName, type) {
    db.prepare(`
    INSERT INTO events (container_id, container_name, type, timestamp)
    VALUES (?, ?, ?, ?)
  `).run(containerId, containerName, type, Date.now());
}

// --- WebSockets ---
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));
});

// --- Server Lifecycle ---
server.listen(port, () => {
    console.log(`Backend Server listening on port ${port}`);
});
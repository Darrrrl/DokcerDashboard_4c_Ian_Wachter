import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import Docker from 'dockerode';
import db from './db.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { authenticateToken } from './middleware/authMiddleware.js';

import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

import authRoutes from './Routes/auth.js';
import containerRoutes from './Routes/containers.js';
import historyRoutes from './Routes/history.js';
import settingsRoutes from './Routes/settings.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const server = createServer(app);
const wss = new WebSocketServer({ server });

let statsInterval = null;
const statsClients = new Set();

async function broadcastStats() {
    try {
        const allContainers = await docker.listContainers({ all: true });

        const statsPromises = allContainers.map(async (c) => {
            const containerData = {
                id: c.Id.substring(0, 12),
                state: c.State,
                cpu: '...',
                ram: '...',
                ramUsageMb: '0.0'
            };

            if (c.State === 'running') {
                try {
                    const stats = await docker.getContainer(c.Id).stats({ stream: false });

                    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
                    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;

                    if (systemDelta > 0 && cpuDelta > 0) {
                        containerData.cpu = ((cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100).toFixed(2);
                    } else {
                        containerData.cpu = '0.00';
                    }

                    const usedMemory = stats.memory_stats.usage - (stats.memory_stats.stats?.cache || 0);
                    containerData.ram = ((usedMemory / stats.memory_stats.limit) * 100).toFixed(2);
                    containerData.ramUsageMb = (usedMemory / 1024 / 1024).toFixed(1);
                } catch {
                    containerData.state = 'exited';
                    containerData.cpu = '0.00';
                }
            }

            return containerData;
        });

        const statsData = await Promise.all(statsPromises);
        const message = JSON.stringify(statsData);

        for (const client of statsClients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }

    } catch (error) {
        console.error('Broadcast Stats Error:', error.message);
    }
}

function startStatsPolling() {
    if (!statsInterval) {
        console.log('Starting global stats polling');
        statsInterval = setInterval(broadcastStats, 1000);
    }
}

function stopStatsPolling() {
    if (statsInterval && statsClients.size === 0) {
        console.log('Stopping global stats polling');
        clearInterval(statsInterval);
        statsInterval = null;
    }
}

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/containers', authenticateToken, containerRoutes);
app.use('/api/history', authenticateToken, historyRoutes);
app.use('/api/settings', authenticateToken, settingsRoutes);

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
    // HIER IST DIE WICHTIGE ÄNDERUNG:
    apis: [path.join(__dirname, 'Routes', '*.js')],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req, res) => {
    res.redirect('/api-docs');
});


wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const pathname = url.pathname;

    if (pathname === '/ws/stats') {

        // Auth-Check
        const token = url.searchParams.get('token');
        if (!token) {
            ws.close(1008, 'Unauthorized');
            return;
        }
        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            ws.close(1008, 'Invalid token');
            return;
        }

        console.log('Client connected to /ws/stats');
        statsClients.add(ws);
        startStatsPolling();

        ws.on('close', () => {
            console.log('Client disconnected from /ws/stats');
            statsClients.delete(ws);
            stopStatsPolling();
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err.message);
            statsClients.delete(ws);
            stopStatsPolling();
        });
    } else if (pathname.startsWith('/ws/logs/')) {
        const containerId = pathname.split('/')[3];
        const token = url.searchParams.get('token');

        if (!token) {
            ws.close(1008, 'Unauthorized');
            return;
        }
        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            ws.close(1008, 'Invalid token');
            return;
        }

        console.log(`Client connected to /ws/logs for ${containerId}`);

        const container = docker.getContainer(containerId);
        container.logs({
            follow: true,
            stdout: true,
            stderr: true,
            tail: 50
        }, (err, stream) => {
            if (err) {
                console.error('Docker Logs Error:', err.message);
                ws.close();
                return;
            }

            stream.on('data', (chunk) => {
                if (ws.readyState === ws.OPEN) {
                    // Docker logs have an 8-byte header: [type, 0, 0, 0, size1, size2, size3, size4]
                    // We skip it to get the raw text.
                    ws.send(chunk.toString('utf8').substring(8));
                }
            });

            ws.on('close', () => {
                console.log(`Client disconnected from /ws/logs for ${containerId}`);
                if (stream.destroy) stream.destroy();
            });
        });
    }
});

server.listen(port, () => {
    console.log(`Backend Server listening on port ${port}`);
    console.log(`Swagger API Docs unter: http://localhost:${port}/api-docs`);

});
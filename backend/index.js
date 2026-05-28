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

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/container', authenticateToken, containerRoutes);
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


export function logEvent(containerId, containerName, type) {
    db.prepare(`
    INSERT INTO events (container_id, container_name, type, timestamp)
    VALUES (?, ?, ?, ?)
  `).run(containerId, containerName, type, Date.now());
}

wss.on('connection', (ws, req) => {

    if (req.url === '/ws/stats') {
        console.log('Client connected to /ws/stats');

        const statsInterval = setInterval(async () => {
            try {
                // WICHTIG: { all: true } statt nur 'running'
                const allContainers = await docker.listContainers({ all: true });

                const statsPromises = allContainers.map(async (c) => {
                    // Grundgerüst für JEDEN Container
                    const containerData = {
                        id: c.Id.substring(0, 12),
                        state: c.State, // Hier schicken wir den aktuellen Status mit!
                        cpu: '...',
                        ram: '...',
                        ramUsageMb: '0.0'
                    };

                    // Nur wenn er läuft, fragen wir die schweren Stats ab
                    if (c.State === 'running') {
                        try {
                            const stats = await docker.getContainer(c.Id).stats({ stream: false });

                            const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
                            const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;

                            if (systemDelta > 0.0 && cpuDelta > 0.0) {
                                containerData.cpu = ((cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100.0).toFixed(2);
                            }

                            const usedMemory = stats.memory_stats.usage - (stats.memory_stats.stats?.cache || 0);
                            const availableMemory = stats.memory_stats.limit;
                            containerData.ram = ((usedMemory / availableMemory) * 100.0).toFixed(2);
                            containerData.ramUsageMb = (usedMemory / 1024 / 1024).toFixed(1);
                        } catch (statError) {
                            // Falls der Container genau in dieser Millisekunde stoppt
                            containerData.state = 'exited';
                        }
                    }

                    return containerData;
                });

                const statsData = await Promise.all(statsPromises);
                ws.send(JSON.stringify(statsData));

            } catch (error) {
                console.error('WebSocket Stats Error:', error.message);
            }
        }, 1000);

        ws.on('close', () => {
            console.log('Client disconnected from /ws/stats');
            clearInterval(statsInterval);
        });
    }

});

server.listen(port, () => {
    console.log(`Backend Server listening on port ${port}`);
    console.log(`Swagger API Docs unter: http://localhost:${port}/api-docs`);

});
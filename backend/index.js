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

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

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

wss.on('connection', (ws) => {

    if (req.url === '/ws/stats') {
        console.log('Client connected to /ws/stats');

        const statsInterval = setInterval(async () => {
            try {

                const containers = await docker.listContainers({ filters: { status: ['running'] } });

                const statsPromises = containers.map(async (c) => {

                    const stats = await docker.getContainer(c.Id).stats({ stream: false });

                    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
                    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
                    let cpuPercent = 0.0;
                    if (systemDelta > 0.0 && cpuDelta > 0.0) {
                        cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100.0;
                    }

                    const usedMemory = stats.memory_stats.usage - (stats.memory_stats.stats?.cache || 0);
                    const availableMemory = stats.memory_stats.limit;
                    const ramPercent = (usedMemory / availableMemory) * 100.0;

                    return {
                        id: c.Id.substring(0, 12),
                        cpu: cpuPercent.toFixed(2),
                        ram: ramPercent.toFixed(2),
                        ramUsageMb: (usedMemory / 1024 / 1024).toFixed(1)
                    };
                });

                // Auf alle Antworten warten und gebündelt senden
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
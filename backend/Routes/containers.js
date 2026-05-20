import { Router } from 'express';
import Docker from 'dockerode';
import db from '../db.js';

const router = Router();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

//für testzwäcke
router.get('/containers', (req, res) => {
    res.json([
        { id: "1", name: "test-container", image: "nginx:latest", state: "running", status: "Up 5 minutes" },
        { id: "2", name: "db-container", image: "postgres:15", state: "exited", status: "Exited (1) 2 hours ago" }
    ]);
});

// funktionierender endpunkt für container
/*
router.get('/containers', async (req, res) => {
    try {
        const containers = await docker.listContainers({ all: true });

        // Mappt die rohen Docker-Daten auf ein sauberes, kompaktes Format
        const cleanContainers = containers.map(c => ({
            id: c.Id.substring(0, 12),
            name: c.Names[0].replace('/', ''),
            image: c.Image,
            state: c.State,
            status: c.Status
        }));

        res.json(cleanContainers);
    } catch (error) {
        console.error("Docker API Error:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Container-Daten" });
    }
});*/


import { Router } from 'express';
import Docker, { Container } from 'dockerode';
import db from '../db.js';

const router = Router();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

//für testzwäcke
router.get('/', (req, res) => {
    res.json([
        { id: "1", name: "test-container", image: "nginx:latest", state: "running", status: "Up 5 minutes" },
        { id: "2", name: "db-container", image: "postgres:15", state: "exited", status: "Exited (1) 2 hours ago" }
    ]);
});

// funktionierender endpunkt für container
/*
router.get('/', async (req, res) => {
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

// funktionierender endpunkt für container

router.get('/:id', async (req, res) => {

    const id = req.params.id;

    try {


        const mockDetails = {
            id: id,
            name: `mock-container-${id.substring(0, 4)}`,
            image: "nginx:latest",
            state: "running", // oder "exited"
            status: "Up 2 hours",
            network: "bridge",
            ports: [
                { private: 80, public: 8080, type: "tcp" }
            ],
            volumes: [
                { source: "/host/nginx/html", destination: "/usr/share/nginx/html", mode: "rw" }
            ],
            env: [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                "NGINX_VERSION=1.25.3"
            ]
        };

        res.json(mockDetails);
    } catch (error) {
        console.error("Docker API Error:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Container-Details" });
    }
});

/*
router.get('/:id', async (req, res) => {

    const id = req.params.id;

    try {
        const containerInfo = await docker.getContainer(req.params.id).inspect();

        const cleanContainer = {
            id: containerInfo.Id.substring(0, 12),
            name: containerInfo.Name.replace('/', ''),
            image: containerInfo.Config.Image,
            state: containerInfo.State.Status,
            status: containerInfo.State.Running ? 'Running' : 'Exited',
            network: Object.keys(containerInfo.NetworkSettings.Networks)[0] || 'bridge',
            ports: containerInfo.NetworkSettings.Ports,
            volumes: containerInfo.Mounts.map(m => ({
                source: m.Source,
                destination: m.Destination,
                mode: m.RW ? "rw" : "ro"
            })),
            env: containerInfo.Config.Env
        };

        res.json(cleanContainers);
    } catch (error) {
        console.error("Docker API Error:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Container-Details" });
    }
});*/

export default container;
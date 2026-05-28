import { Router } from 'express';
import Docker from 'dockerode';
const { Container } = Docker;
import db from '../db.js';

const router = Router();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

router.get('/', async (req, res) => {
    try {
        const containers = await docker.listContainers({ all: true });

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
        res.status(500).json({ error: "Error when calling the container-data" });
    }
});

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

        res.json(cleanContainer);
    } catch (error) {
        console.error("Docker API Error:", error);
        res.status(500).json({ error: "Error when calling the container" });
    }
});

router.post('/:id/start', async (req, res) => {
    const id = req.params.id;

    try {
        const container = await docker.getContainer(req.params.id);
        await container.start();
        res.json({ ok: true, message: `Container ${id} started.` });
    } catch (error) {
        console.error("Docker API Error:", error);
        res.status(500).json({ error: "Failed to start container" });
    }
});

router.post('/:id/stop', async (req, res) => {
    const id = req.params.id;

    try {
        const container = await docker.getContainer(req.params.id);
        await container.stop();
        res.json({ ok: true, message: `Container ${id} stopped.` });
    } catch (error) {
        console.error("Docker API Error:", error);
        res.status(500).json({ error: "Failed to stop container" });
    }
});

router.post('/:id/restart', async (req, res) => {
    const id = req.params.id;

    try {
        const container = await docker.getContainer(req.params.id);
        await container.restart();
        res.json({ ok: true, message: `Container ${id} restarted.` });
    } catch (error) {
        console.error("Docker API Error:", error);
        res.status(500).json({ error: "Failed to restart container" });
    }
});

export default router;
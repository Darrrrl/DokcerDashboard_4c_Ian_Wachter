import { authState, refreshToken } from "./authStore.svelte.js";
import { settingsStore } from "./settingsStore.svelte.js";

function createContainerStore() {
    let allContainers = $state([]);
    let statsHistory = $state({}); // { containerId: [{ time: string, cpu: number, ram: number }] }
    let errorMessage = $state("");
    let socket = null;
    let reconnectTimeout = null;

    async function apiFetch(url, options = {}) {
        let res = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${authState.token}`
            }
        });

        if (res.status === 401) {
            const success = await refreshToken();
            if (success) {
                res = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        Authorization: `Bearer ${authState.token}`
                    }
                });
            }
        }
        return res;
    }

    return {
        get containers() { 
            return allContainers.filter(c => !settingsStore.hiddenContainers.includes(c.id)); 
        },
        get allContainers() { return allContainers; },
        get statsHistory() { return statsHistory; },
        get errorMessage() { return errorMessage; },

        async init() {
            errorMessage = "";

            try {
                const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/containers`);

                if (res.ok) {
                    const rawContainers = await res.json();
                    allContainers = rawContainers.map((c) => ({
                        ...c,
                        cpu: "...",
                        ram: "...",
                    }));
                } else {
                    errorMessage = "Failed to load containers from API.";
                }
            } catch (error) {
                errorMessage = "Connection error to API.";
            }

            this.connectWebSocket();
        },

        connectWebSocket() {
            if (socket && socket.readyState !== WebSocket.CLOSED) return;

            if (reconnectTimeout) clearTimeout(reconnectTimeout);

            socket = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/stats?token=${authState.token}`);

            socket.onmessage = (event) => {
                const liveStats = JSON.parse(event.data);
                const time = new Date().toLocaleTimeString();

                allContainers = allContainers.map((container) => {
                    const freshStats = liveStats.find((stat) => stat.id === container.id);

                    if (freshStats) {
                        // Update stats history
                        const history = statsHistory[container.id] || [];
                        const newHistory = [...history, {
                            time,
                            cpu: parseFloat(freshStats.cpu),
                            ram: parseFloat(freshStats.ramUsageMb)
                        }].slice(-1800); // Keep last 1800 points (30 mins)
                        
                        statsHistory[container.id] = newHistory;

                        return {
                            ...container,
                            cpu: freshStats.cpu,
                            ram: freshStats.ram,
                            state: freshStats.state
                        };
                    }
                    return container;
                });
            };

            socket.onclose = () => {
                console.log(`WebSocket closed. Reconnecting in ${settingsStore.wsInterval}ms...`);
                reconnectTimeout = setTimeout(() => this.connectWebSocket(), settingsStore.wsInterval);
            };

            socket.onerror = (e) => {
                console.error("WebSocket connection error", e);
                errorMessage = "WebSocket Error";
            };
        },

        disconnect() {
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (socket) {
                socket.close();
                socket = null;
            }
        }
    };
}

export const containerStore = createContainerStore();;
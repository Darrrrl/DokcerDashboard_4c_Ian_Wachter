
import { authState } from "./authStore.svelte.js";

function createContainerStore() {
    // Unser zentraler State
    let containers = $state([]);
    let errorMessage = $state("");

    // Normale Variable für den WebSocket (muss nicht reaktiv sein)
    let socket = null;

    return {
        // Getter, damit andere Dateien den State lesen können
        get containers() { return containers; },
        get errorMessage() { return errorMessage; },

        // Daten laden und WebSocket starten
        async init() {
            errorMessage = "";

            // 1. Initialer REST Fetch
            try {
                const res = await fetch("http://localhost:3000/api/containers", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${authState.token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (res.ok) {
                    const rawContainers = await res.json();
                    containers = rawContainers.map((c) => ({
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

            // 2. WebSocket verbinden (nur wenn noch nicht verbunden)
            if (!socket || socket.readyState === WebSocket.CLOSED) {
                socket = new WebSocket("ws://localhost:3000/ws/stats");

                socket.onmessage = (event) => {
                    const liveStats = JSON.parse(event.data);

                    containers = containers.map((container) => {
                        const freshStats = liveStats.find((stat) => stat.id === container.id);

                        if (freshStats) {
                            return {
                                ...container,
                                cpu: freshStats.cpu,
                                ram: freshStats.ram,
                                state: freshStats.state // <-- DIESE ZEILE HINZUFÜGEN!
                            };
                        }
                        return container;
                    });
                };

                socket.onerror = () => {
                    console.error("WebSocket connection error");
                    errorMessage = "WebSocket Error";
                };
            }
        },

        // WebSocket sauber beenden
        disconnect() {
            if (socket) {
                console.log("Closing WebSocket...");
                socket.close();
                socket = null;
            }
        }
    };
}

// Wir exportieren EINE globale Instanz, die von überall genutzt wird
export const containerStore = createContainerStore();
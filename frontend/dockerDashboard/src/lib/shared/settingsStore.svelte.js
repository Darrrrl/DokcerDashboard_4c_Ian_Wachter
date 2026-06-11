import { authState, refreshToken } from "./authStore.svelte.js";
import de from "$lib/i18n/de.js";
import en from "$lib/i18n/en.js";

const translations = { de, en };

function createSettingsStore() {
    let language = $state("de");
    let darkMode = $state(true);
    let wsInterval = $state(5000);
    let hiddenContainers = $state([]);
    let loaded = $state(false);

    return {
        get language() { return language; },
        get darkMode() { return darkMode; },
        get wsInterval() { return wsInterval; },
        get hiddenContainers() { return hiddenContainers; },
        get loaded() { return loaded; },

        // Translation helper
        t(key, replacements = {}) {
            const keys = key.split(".");
            let val = translations[language];
            for (const k of keys) {
                val = val?.[k];
            }
            if (!val) return key;
            
            let result = val;
            for (const [k, v] of Object.entries(replacements)) {
                result = result.replace(`{${k}}`, v);
            }
            return result;
        },

        async load() {
            async function tryLoad() {
                return await fetch("http://localhost:3000/api/settings", {
                    headers: { Authorization: `Bearer ${authState.token}` }
                });
            }

            try {
                let res = await tryLoad();
                
                if (res.status === 401) {
                    const success = await refreshToken();
                    if (success) res = await tryLoad();
                }

                if (res.ok) {
                    const data = await res.json();
                    language = data.language ?? "de";
                    darkMode = data.dark_mode === "true";
                    wsInterval = parseInt(data.ws_reconnect_interval ?? "5000");
                    hiddenContainers = data.hidden_containers ? JSON.parse(data.hidden_containers) : [];
                }
            } catch (e) {
                console.error("Settings load error:", e);
            } finally {
                loaded = true;
            }
        },

        async save(updates) {
            language = updates.language ?? language;
            darkMode = updates.dark_mode !== undefined ? (updates.dark_mode === "true" || updates.dark_mode === true) : darkMode;
            wsInterval = updates.ws_reconnect_interval !== undefined ? parseInt(updates.ws_reconnect_interval) : wsInterval;
            hiddenContainers = updates.hidden_containers ?? hiddenContainers;

            async function trySave() {
                return await fetch("http://localhost:3000/api/settings", {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${authState.token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        language,
                        dark_mode: String(darkMode),
                        ws_reconnect_interval: String(wsInterval),
                        hidden_containers: JSON.stringify(hiddenContainers)
                    })
                });
            }

            try {
                let res = await trySave();

                if (res.status === 401) {
                    const success = await refreshToken();
                    if (success) res = await trySave();
                }
            } catch (e) {
                console.error("Settings save error:", e);
            }
        }
    };
}

export const settingsStore = createSettingsStore();
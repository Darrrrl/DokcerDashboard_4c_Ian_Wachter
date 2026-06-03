import { authState } from "./authStore.svelte.js";
import de from "$lib/i18n/de.js";
import en from "$lib/i18n/en.js";

const translations = { de, en };

function createSettingsStore() {
    let language = $state("de");
    let darkMode = $state(true);
    let wsInterval = $state(5000);
    let loaded = $state(false);

    return {
        get language() { return language; },
        get darkMode() { return darkMode; },
        get wsInterval() { return wsInterval; },
        get loaded() { return loaded; },

        // Translation helper
        t(key) {
            const keys = key.split(".");
            let val = translations[language];
            for (const k of keys) {
                val = val?.[k];
            }
            return val ?? key;
        },

        async load() {
            try {
                const res = await fetch("http://localhost:3000/api/settings", {
                    headers: { Authorization: `Bearer ${authState.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    language = data.language ?? "de";
                    darkMode = data.dark_mode === "true";
                    wsInterval = parseInt(data.ws_reconnect_interval ?? "5000");
                }
            } catch (e) {
                console.error("Settings load error:", e);
            } finally {
                loaded = true;
            }
        },

        async save(updates) {
            language = updates.language ?? language;
            darkMode = updates.dark_mode === "true" ? true : updates.dark_mode === true ? true : false;
            wsInterval = parseInt(updates.ws_reconnect_interval ?? wsInterval);

            try {
                await fetch("http://localhost:3000/api/settings", {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${authState.token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        language: updates.language ?? language,
                        dark_mode: String(updates.dark_mode ?? darkMode),
                        ws_reconnect_interval: String(updates.ws_reconnect_interval ?? wsInterval),
                    })
                });
            } catch (e) {
                console.error("Settings save error:", e);
            }
        }
    };
}

export const settingsStore = createSettingsStore();
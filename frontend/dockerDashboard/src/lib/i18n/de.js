export default {
    nav: {
        dashboard: "Dashboard",
        history: "Verlauf",
        settings: "Einstellungen",
    },
    dashboard: {
        title: "Dashboard",
        subtitle: "Übersicht und Steuerung deines Docker-Stacks",
        search: "Container suchen...",
        empty: "Keine Container gefunden",
        tabs: {
            all: "Alle",
            running: "Aktiv",
            stopped: "Gestoppt",
            error: "Fehler",
        },
        stats: {
            running: "Aktiv",
            stopped: "Gestoppt",
            error: "Fehler",
        }
    },
    history: {
        title: "Ereignis-Verlauf",
        subtitle: "Protokoll aller Container-Aktivitäten",
        empty: "Keine Ereignisse gefunden",
        filters: {
            container: "Container",
            type: "Ereignis-Typ",
            from: "Von",
            to: "Bis",
            all: "Alle",
        },
        table: {
            container: "Container",
            event: "Ereignis",
            user: "Ausgelöst durch",
            time: "Zeitpunkt",
        }
    },
    setup: {
        title: "Willkommen",
        subtitle: "Erstelle deinen ersten Administrator-Account",
        username: "Benutzername",
        password: "Passwort",
        create: "Account erstellen",
        error: "Fehler beim Erstellen des Accounts",
    },
    settings: {
        title: "Einstellungen",
        subtitle: "Konfiguration für DockerDash",
        saved: "Gespeichert",
        save: "Speichern",
        sections: {
            appearance: "Darstellung",
            connection: "Verbindung",
            containers: "Container",
        },
        language: "Sprache",
        darkMode: "Dark Mode",
        wsInterval: "WebSocket-Intervall",
        wsIntervalHint: "Aktualisierungsrate in Millisekunden (min. 500)",
        hiddenContainers: "Versteckte Container",
        hiddenContainersHint: "Diese Container werden im Dashboard nicht angezeigt",
        noContainers: "Keine Container verfügbar",
    },
    container: {
        start: "Starten",
        stop: "Stoppen",
        restart: "Neustarten",
        confirmStop: "Möchtest du {name} wirklich stoppen?",
        confirmRestart: "Möchtest du {name} wirklich neu starten?",
        networkError: "Netzwerkfehler",
    }
};
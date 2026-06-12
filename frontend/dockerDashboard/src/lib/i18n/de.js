export default {
    nav: {
        dashboard: "Dashboard",
        history: "Historie",
        settings: "Einstellungen"
    },
    dashboard: {
        title: "Dashboard",
        subtitle: "Übersicht und Steuerung deines Docker-Stacks",
        search: "Container suchen...",
        empty: "Keine Container gefunden",
        tabs: {
            all: "Alle",
            running: "Laufend",
            stopped: "Gestoppt",
            error: "Fehler"
        },
        stats: {
            running: "Laufend"
        }
    },
    container: {
        start: "Start",
        stop: "Stopp",
        restart: "Neustart",
        confirmStop: "{name} wirklich stoppen?",
        confirmRestart: "{name} wirklich neu starten?",
        networkError: "Netzwerkfehler"
    },
    history: {
        title: "Historie",
        subtitle: "Verfolge alle Container-Ereignisse",
        empty: "Keine Ereignisse gefunden",
        filters: {
            container: "Container",
            type: "Ereignis-Typ",
            from: "Von",
            to: "Bis",
            all: "Alle"
        },
        table: {
            container: "Container",
            event: "Ereignis",
            user: "Benutzer",
            time: "Zeitpunkt"
        }
    },
    setup: {
        title: "Setup",
        subtitle: "Erstelle deinen Admin-Account",
        username: "Benutzername",
        password: "Passwort",
        create: "Account erstellen",
        error: "Ein Fehler ist aufgetreten"
    },
    login: {
        title: "Willkommen zurück",
        subtitle: "DockerDash · Melde dich an",
        username: "Benutzername",
        password: "Passwort",
        confirmPassword: "Passwort bestätigen",
        submitLogin: "Anmelden",
        submitSetup: "Account erstellen",
        errorSetup: "Passwörter stimmen nicht überein.",
        errorAuth: "Ungültige Zugangsdaten.",
        errorNetwork: "Netzwerkfehler.",
        errorSetupStatus: "Konnte Setup-Status nicht laden."
    },
    details: {
        back: "Zurück zum Dashboard",
        loading: "Lade Container Details...",
        metadata: "Metadaten",
        network: "Netzwerk",
        ports: "Ports",
        noPorts: "Keine Ports veröffentlicht",
        volumes: "Volumes",
        volumesConnected: "{count} Volume(s) verbunden",
        noVolumes: "Keine Volumes gemountet",
        environment: "Environment",
        envVars: "{count} Variablen gesetzt",
        resources: "Ressourcen (Live)",
        liveLogs: "Live Logs",
        confirmStop: "{name} wirklich stoppen?",
        confirmRestart: "{name} wirklich neu starten?",
        errorLoad: "Konnte Container Details nicht laden",
        errorAction: "Fehler beim {action}"
    },
    settings: {
        title: "Einstellungen",
        subtitle: "Passe das Dashboard an deine Bedürfnisse an",
        save: "Speichern",
        saved: "Gespeichert",
        sections: {
            appearance: "Erscheinungsbild",
            connection: "Verbindung",
            containers: "Container"
        },
        language: "Sprache",
        darkMode: "Dark Mode",
        wsInterval: "Aktualisierungsrate",
        wsIntervalHint: "Intervall für Live-Daten (in ms)",
        hiddenContainersHint: "Wähle Container, die auf dem Dashboard versteckt werden sollen",
        noContainers: "Keine Container verfügbar"
    }
};
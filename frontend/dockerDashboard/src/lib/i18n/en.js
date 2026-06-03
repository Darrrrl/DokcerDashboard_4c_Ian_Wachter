export default {
    nav: {
        dashboard: "Dashboard",
        settings: "Settings",
    },
    dashboard: {
        title: "Dashboard",
        subtitle: "Overview and control of your Docker stack",
        search: "Search containers...",
        empty: "No containers found",
        tabs: {
            all: "All",
            running: "Running",
            stopped: "Stopped",
            error: "Error",
        },
        stats: {
            running: "Running",
            stopped: "Stopped",
            error: "Error",
        }
    },
    settings: {
        title: "Settings",
        subtitle: "Configuration for DockerDash",
        saved: "Saved",
        save: "Save",
        sections: {
            appearance: "Appearance",
            connection: "Connection",
            containers: "Containers",
        },
        language: "Language",
        darkMode: "Dark Mode",
        wsInterval: "WebSocket Interval",
        wsIntervalHint: "Refresh rate in milliseconds (min. 500)",
        hiddenContainers: "Hidden Containers",
        hiddenContainersHint: "These containers will not be shown in the dashboard",
        noContainers: "No containers available",
    },
    container: {
        start: "Start",
        stop: "Stop",
        restart: "Restart",
        confirmStop: "Do you really want to stop {name}?",
        confirmRestart: "Do you really want to restart {name}?",
        networkError: "Network error",
    }
};
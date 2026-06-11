export default {
    nav: {
        dashboard: "Dashboard",
        history: "History",
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
    history: {
        title: "Event History",
        subtitle: "Log of all container activities",
        empty: "No events found",
        filters: {
            container: "Container",
            type: "Event Type",
            from: "From",
            to: "To",
            all: "All",
        },
        table: {
            container: "Container",
            event: "Event",
            user: "Triggered by",
            time: "Time",
        }
    },
    setup: {
        title: "Welcome",
        subtitle: "Create your first administrator account",
        username: "Username",
        password: "Password",
        create: "Create Account",
        error: "Error creating account",
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
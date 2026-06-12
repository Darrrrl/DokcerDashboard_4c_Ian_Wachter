export default {
    nav: {
        dashboard: "Dashboard",
        history: "History",
        settings: "Settings"
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
            error: "Error"
        },
        stats: {
            running: "Running"
        }
    },
    container: {
        start: "Start",
        stop: "Stop",
        restart: "Restart",
        confirmStop: "Stop {name}?",
        confirmRestart: "Restart {name}?",
        networkError: "Network error"
    },
    history: {
        title: "History",
        subtitle: "Track all container events",
        empty: "No events found",
        filters: {
            container: "Container",
            type: "Event Type",
            from: "From",
            to: "To",
            all: "All"
        },
        table: {
            container: "Container",
            event: "Event",
            user: "User",
            time: "Time"
        }
    },
    setup: {
        title: "Setup",
        subtitle: "Create your admin account",
        username: "Username",
        password: "Password",
        create: "Create Account",
        error: "An error occurred"
    },
    login: {
        title: "Welcome Back",
        subtitle: "DockerDash · Sign in to continue",
        username: "Username",
        password: "Password",
        confirmPassword: "Confirm Password",
        submitLogin: "Sign In",
        submitSetup: "Create Account",
        errorSetup: "Passwords do not match.",
        errorAuth: "Invalid credentials.",
        errorNetwork: "Network error.",
        errorSetupStatus: "Failed to load setup status."
    },
    details: {
        back: "Back to Dashboard",
        loading: "Loading container details...",
        metadata: "Metadata",
        network: "Network",
        ports: "Ports",
        noPorts: "No ports published",
        volumes: "Volumes",
        volumesConnected: "{count} volume(s) connected",
        noVolumes: "No volumes mounted",
        environment: "Environment",
        envVars: "{count} variables set",
        resources: "Resources (Live)",
        liveLogs: "Live Logs",
        confirmStop: "Stop {name}?",
        confirmRestart: "Restart {name}?",
        errorLoad: "Failed to load container details",
        errorAction: "Error during {action}"
    },
    settings: {
        title: "Settings",
        subtitle: "Customize your dashboard experience",
        save: "Save",
        saved: "Saved",
        sections: {
            appearance: "Appearance",
            connection: "Connection",
            containers: "Containers"
        },
        language: "Language",
        darkMode: "Dark Mode",
        wsInterval: "Update Rate",
        wsIntervalHint: "Interval for live data (in ms)",
        hiddenContainersHint: "Select containers to hide from the dashboard",
        noContainers: "No containers available"
    }
};
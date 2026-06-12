<script>
    import { onMount } from "svelte";
    import { authState } from "$lib/shared/authStore.svelte.js";
    import { settingsStore } from "$lib/shared/settingsStore.svelte.js";
    import { containerStore } from "$lib/shared/containerStore.svelte.js";

    let events = $state([]);
    let loading = $state(true);
    let error = $state(null);

    // Filter states
    let selectedContainer = $state("");
    let selectedType = $state("");
    let fromDate = $state("");
    let toDate = $state("");

    const t = (key) => settingsStore.t(key);

    async function fetchHistory() {
        loading = true;
        try {
            const params = new URLSearchParams();
            if (selectedContainer) params.append("container", selectedContainer);
            if (selectedType) params.append("type", selectedType);
            if (fromDate) params.append("from", new Date(fromDate).getTime());
            if (toDate) params.append("to", new Date(toDate).getTime());

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/history?${params.toString()}`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch history");
            events = await res.json();
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        if (!containerStore.containers.length) {
            containerStore.init();
        }
        fetchHistory();
    });

    $effect(() => {
        // Re-fetch when filters change
        fetchHistory();
    });

    function formatTime(timestamp) {
        return new Date(timestamp).toLocaleString(settingsStore.language === 'de' ? 'de-DE' : 'en-US');
    }
</script>

<main class="page-root">
    <header class="page-header">
        <div>
            <h1 class="page-title">{t("history.title")}</h1>
            <p class="page-subtitle">{t("history.subtitle")}</p>
        </div>
    </header>

    <section class="filters">
        <div class="filter-group">
            <label for="container-filter">{t("history.filters.container")}</label>
            <select id="container-filter" bind:value={selectedContainer}>
                <option value="">{t("history.filters.all")}</option>
                {#each containerStore.allContainers as container}
                    <option value={container.id}>{container.name}</option>
                {/each}
            </select>
        </div>

        <div class="filter-group">
            <label for="type-filter">{t("history.filters.type")}</label>
            <select id="type-filter" bind:value={selectedType}>
                <option value="">{t("history.filters.all")}</option>
                <option value="start">start</option>
                <option value="stop">stop</option>
                <option value="restart">restart</option>
            </select>
        </div>

        <div class="filter-group">
            <label for="from-filter">{t("history.filters.from")}</label>
            <input type="date" id="from-filter" bind:value={fromDate} />
        </div>

        <div class="filter-group">
            <label for="to-filter">{t("history.filters.to")}</label>
            <input type="date" id="to-filter" bind:value={toDate} />
        </div>
    </section>

    <section class="content">
        {#if loading}
            <div class="loading-state">
                <div class="spinner"></div>
            </div>
        {:else if error}
            <div class="error-state">{error}</div>
        {:else if events.length === 0}
            <div class="empty-state">
                <p>{t("history.empty")}</p>
            </div>
        {:else}
            <div class="table-container">
                <table class="history-table">
                    <thead>
                        <tr>
                            <th>{t("history.table.container")}</th>
                            <th>{t("history.table.event")}</th>
                            <th>{t("history.table.user")}</th>
                            <th>{t("history.table.time")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each events as event}
                            <tr>
                                <td>
                                    <div class="container-cell">
                                        <span class="c-name">{event.container_name}</span>
                                        <span class="c-id">{event.container_id}</span>
                                    </div>
                                </td>
                                <td>
                                    <span class="event-badge badge-{event.type}">
                                        {event.type}
                                    </span>
                                </td>
                                <td>
                                    <span class="user-text">{event.triggered_by}</span>
                                </td>
                                <td>
                                    <span class="time-text">{formatTime(event.timestamp)}</span>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </section>
</main>

<style>
    .page-root {
        max-width: 1000px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
    }

    .page-header {
        margin-bottom: 2.5rem;
    }

    .page-title {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-main);
        letter-spacing: -0.03em;
        margin: 0 0 0.25rem;
    }

    .page-subtitle {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin: 0;
        font-family: "JetBrains Mono", monospace;
    }

    .filters {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        background: var(--card-bg);
        border: 1px solid var(--border-main);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 2rem;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .filter-group label {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--text-muted);
    }

    .filter-group select, .filter-group input {
        background: rgba(0, 0, 0, 0.05);
        border: 1px solid var(--border-main);
        border-radius: 8px;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        color: var(--text-main);
        outline: none;
    }
    :global(body.dark-mode) .filter-group select, :global(body.dark-mode) .filter-group input {
        background: rgba(0, 0, 0, 0.25);
    }

    .filter-group select:focus, .filter-group input:focus {
        border-color: rgba(16, 185, 129, 0.35);
    }

    .table-container {
        background: var(--card-bg);
        border: 1px solid var(--border-main);
        border-radius: 16px;
        overflow-x: auto;
    }

    .history-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        min-width: 600px;
    }

    .history-table th {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--text-muted);
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--border-main);
    }

    .history-table td {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--border-main);
    }

    .container-cell {
        display: flex;
        flex-direction: column;
    }

    .c-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-main);
    }

    .c-id {
        font-size: 0.7rem;
        font-family: "JetBrains Mono", monospace;
        color: var(--text-muted);
    }

    .event-badge {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .badge-start {
        background: rgba(16, 185, 129, 0.1);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .badge-stop {
        background: rgba(244, 63, 94, 0.1);
        color: #fb7185;
        border: 1px solid rgba(244, 63, 94, 0.2);
    }

    .badge-restart {
        background: rgba(245, 158, 11, 0.1);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .user-text {
        font-size: 0.8rem;
        color: #a1a1aa;
    }

    .time-text {
        font-size: 0.8rem;
        color: #71717a;
        font-family: "JetBrains Mono", monospace;
    }

    .loading-state {
        display: flex;
        justify-content: center;
        padding: 4rem;
    }

    .spinner {
        width: 30px;
        height: 30px;
        border: 3px solid rgba(255, 255, 255, 0.06);
        border-top-color: #34d399;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
        text-align: center;
        padding: 4rem;
        color: #52525b;
    }
</style>
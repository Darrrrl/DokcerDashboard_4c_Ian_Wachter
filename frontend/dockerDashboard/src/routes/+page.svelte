<script>
    import ContainerCard from "$lib/components/ContainerCard.svelte";
    import { containerStore } from "$lib/shared/containerStore.svelte.js";
    // NEU: Settings Store importieren
    import { settingsStore } from "$lib/shared/settingsStore.svelte.js";
    import { onMount, onDestroy } from "svelte";
    import { goto } from "$app/navigation";

    // NEU: Übersetzungs-Helper definieren
    const t = (key) => settingsStore.t(key);

    onMount(async () => {
        // Lade die Settings, damit die Sprache beim Start korrekt ist
        if (!settingsStore.loaded) await settingsStore.load();
        containerStore.init();
    });

    onMount(() => {
        containerStore.init();
    });

    onDestroy(() => {
        containerStore.disconnect();
    });

    let searchQuery = $state("");
    let activeTab = $state("All");
    const tabs = ["All", "Running", "Stopped", "Error"];

    const counts = $derived({
        all: containerStore.containers.length,
        running: containerStore.containers.filter((c) => c.state === "running")
            .length,
        stopped: containerStore.containers.filter(
            (c) => c.state === "exited" || c.state === "created",
        ).length,
        error: containerStore.containers.filter(
            (c) => c.state === "dead" || c.state === "restarting",
        ).length,
    });

    const tabCount = (tab) =>
        ({
            All: counts.all,
            Running: counts.running,
            Stopped: counts.stopped,
            Error: counts.error,
        })[tab];

    const runningContainers = $derived(
        containerStore.containers.filter((c) => c.state === "running"),
    );
    const totalCpu = $derived(
        runningContainers.reduce((sum, c) => sum + (parseFloat(c.cpu) || 0), 0),
    );
    const avgRam = $derived(
        runningContainers.length
            ? runningContainers.reduce(
                  (sum, c) => sum + (parseFloat(c.ram) || 0),
                  0,
              ) / runningContainers.length
            : 0,
    );
    const cpuReady = $derived(containerStore.containers.length > 0);
    const ramReady = $derived(containerStore.containers.length > 0);

    let filteredContainers = $derived(
        containerStore.containers.filter((container) => {
            const matchesSearch = container.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            let matchesTab =
                activeTab === "All"
                    ? true
                    : activeTab === "Running"
                      ? container.state === "running"
                      : activeTab === "Stopped"
                        ? container.state === "exited" ||
                          container.state === "created"
                        : activeTab === "Error"
                          ? container.state === "dead" ||
                            container.state === "restarting"
                          : false;
            return matchesSearch && matchesTab;
        }),
    );

    function navigateToContainer(event, id) {
        // Verhindert das Navigieren, wenn ein Start/Stop-Button in der Card geklickt wird
        if (event.target.closest("button")) return;
        goto(`/containerDetails/${id}`);
    }
</script>

<main class="container mx-auto max-w-7xl p-6">
    <header
        class="mb-8 mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
    >
        <div>
            <h1
                class="text-4xl font-bold tracking-tight text-white"
                style="letter-spacing: -0.03em;"
            >
                {t("dashboard.title")}
            </h1>
            <p class="mt-1 text-sm text-zinc-500">
                {t("dashboard.subtitle")}
            </p>
        </div>

        <div class="relative w-full md:w-72">
            <svg
                style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #71717a; pointer-events: none; flex-shrink: 0;"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>
            <input
                type="text"
                bind:value={searchQuery}
                placeholder={t("dashboard.search")}
                class="w-full rounded-xl border border-white/8 bg-white/4 py-2.5 pl-9 pr-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none backdrop-blur-md transition-all focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30"
            />
        </div>
    </header>
    <div class="resource-bar">
        <div class="resource-item">
            <div class="resource-header">
                <span class="resource-label">Total CPU</span>
                <span class="resource-value cpu-val"
                    >{cpuReady ? totalCpu.toFixed(1) + "%" : "..."}</span
                >
            </div>
            <div class="resource-track">
                <div
                    class="resource-fill cpu-fill"
                    style="width: {cpuReady ? Math.min(totalCpu, 100) : 0}%"
                ></div>
            </div>
        </div>
        <div class="resource-item">
            <div class="resource-header">
                <span class="resource-label">Ø RAM</span>
                <span class="resource-value ram-val"
                    >{ramReady ? avgRam.toFixed(1) + "%" : "..."}</span
                >
            </div>
            <div class="resource-track">
                <div
                    class="resource-fill ram-fill"
                    style="width: {ramReady ? Math.min(avgRam, 100) : 0}%"
                ></div>
            </div>
        </div>
        <div class="resource-item">
            <div class="resource-header">
                <span class="resource-label">Container</span>
                <span class="resource-value"
                    >{runningContainers.length} / {containerStore.containers
                        .length} {t("dashboard.stats.running")}</span
                >
            </div>
            <div class="resource-track">
                <div
                    class="resource-fill active-fill"
                    style="width: {containerStore.containers.length
                        ? (runningContainers.length /
                              containerStore.containers.length) *
                          100
                        : 0}%"
                ></div>
            </div>
        </div>
    </div>

    <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="stat-card stat-running">
            <span class="stat-num">{counts.running}</span>
            <span class="stat-lbl">{t("dashboard.tabs.running")}</span>
        </div>
        <div class="stat-card stat-stopped">
            <span class="stat-num">{counts.stopped}</span>
            <span class="stat-lbl">{t("dashboard.tabs.stopped")}</span>
        </div>
        <div class="stat-card stat-error">
            <span class="stat-num">{counts.error}</span>
            <span class="stat-lbl">{t("dashboard.tabs.error")}</span>
        </div>
    </div>

    <div
        class="mb-8 flex gap-1 overflow-x-auto border-b border-white/5 pb-0 scrollbar-hide"
    >
        {#each tabs as tab}
            <button
                onclick={() => (activeTab = tab)}
                class="relative flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-all
                    {activeTab === tab
                    ? 'text-white'
                    : 'text-zinc-600 hover:text-zinc-400'}"
            >
                {t(`dashboard.tabs.${tab.toLowerCase()}`)}
                <span
                    class="rounded-md px-1.5 py-0.5 text-xs font-semibold
                    {activeTab === tab
                        ? 'bg-white/12 text-zinc-300'
                        : 'bg-white/5 text-zinc-600'}"
                >
                    {tabCount(tab)}
                </span>
                {#if activeTab === tab}
                    <span
                        class="absolute bottom-0 left-0 right-0 h-px bg-emerald-500/70 rounded-full"
                    ></span>
                {/if}
            </button>
        {/each}
    </div>

    <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
        {#each filteredContainers as container (container.id)}
            <div
                onclick={(e) => navigateToContainer(e, container.id)}
                class="cursor-pointer transition-transform hover:scale-[1.02]"
            >
                <ContainerCard {container} />
            </div>
        {/each}
    </div>

    {#if filteredContainers.length === 0}
        <div class="mt-16 flex flex-col items-center gap-3 text-center">
            <div class="text-4xl opacity-20">📦</div>
            <p class="text-sm text-zinc-600">{t("dashboard.empty")}</p>
        </div>
    {/if}
</main>

<style>
    .stat-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(8px);
    }
    .stat-num {
        font-size: 1.6rem;
        font-weight: 700;
        letter-spacing: -0.04em;
        line-height: 1;
    }
    .stat-lbl {
        font-size: 0.65rem;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-top: 3px;
    }
    .stat-running .stat-num {
        color: #34d399;
    }
    .stat-running .stat-lbl {
        color: #065f46;
    }
    .stat-running {
        border-color: rgba(16, 185, 129, 0.12);
    }
    .stat-stopped .stat-num {
        color: #52525b;
    }
    .stat-stopped .stat-lbl {
        color: #3f3f46;
    }
    .stat-error .stat-num {
        color: #fbbf24;
    }
    .stat-error .stat-lbl {
        color: #78350f;
    }
    .stat-error {
        border-color: rgba(245, 158, 11, 0.12);
    }
    .resource-bar {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
        margin-bottom: 1.5rem;
        padding: 1rem 1.25rem;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 14px;
        backdrop-filter: blur(8px);
    }

    @media (min-width: 768px) {
        .resource-bar {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 0.75rem;
        }
    }

    .resource-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .resource-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
    }

    .resource-label {
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #3f3f46;
    }

    .resource-value {
        font-family: "JetBrains Mono", monospace;
        font-size: 0.8rem;
        font-weight: 600;
        color: #71717a;
    }
    .cpu-val {
        color: #34d399;
    }
    .ram-val {
        color: #818cf8;
    }

    .resource-track {
        height: 4px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 999px;
        overflow: hidden;
    }

    .resource-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.6s ease;
    }
    .cpu-fill {
        background: linear-gradient(90deg, #10b981, #34d399);
    }
    .ram-fill {
        background: linear-gradient(90deg, #6366f1, #818cf8);
    }
    .active-fill {
        background: linear-gradient(90deg, #f59e0b, #fbbf24);
    }
</style>

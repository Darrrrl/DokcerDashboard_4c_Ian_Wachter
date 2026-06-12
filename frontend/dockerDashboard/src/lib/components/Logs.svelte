<script>
    import { authState } from "$lib/shared/authStore.svelte.js";

    let { containerId } = $props();

    let logs = $state([]);
    let searchQuery = $state("");
    let autoScroll = $state(true);
    let logContainerRef;
    let ws;

    // Filter-Logik
    let filteredLogs = $derived(
        logs.filter((log) =>
            log.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );

    $effect(() => {
        // WebSocket Verbindung aufbauen
        if (typeof window !== "undefined" && containerId) {
            // Token als Query-Parameter übergeben, falls WS Auth benötigt, ansonsten anpassen
            ws = new WebSocket(
                `${import.meta.env.VITE_WS_URL}/ws/logs/${containerId}?token=${authState.token}`,
            );

            ws.onmessage = (event) => {
                // Neues Log-Event ans Array anhängen (max 1000 Zeilen im RAM halten)
                logs = [...logs, event.data].slice(-1000);
            };

            ws.onerror = (error) =>
                console.error("Log WebSocket Error:", error);

            return () => {
                if (ws) ws.close();
            };
        }
    });

    // Auto-Scroll Logik
    $effect(() => {
        if (autoScroll && filteredLogs.length > 0 && logContainerRef) {
            logContainerRef.scrollTop = logContainerRef.scrollHeight;
        }
    });
</script>

<div
    class="flex h-[500px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl"
>
    <div
        class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3 gap-3"
    >
        <div class="relative w-full sm:w-64">
            <svg
                class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path></svg
            >
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Logs filtern..."
                class="w-full rounded-lg border border-white/10 bg-black/50 py-1.5 pl-9 pr-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
            />
        </div>
        <label class="flex items-center gap-2 text-sm text-zinc-400">
            <input
                type="checkbox"
                bind:checked={autoScroll}
                class="rounded border-white/10 bg-black/50 text-emerald-500"
            />
            Auto-Scroll
        </label>
    </div>

    <div
        bind:this={logContainerRef}
        class="flex-1 overflow-y-auto p-4 font-mono text-sm"
    >
        {#if filteredLogs.length === 0}
            <p class="text-zinc-600">Keine Logs vorhanden oder gefunden...</p>
        {/if}
        {#each filteredLogs as log}
            <div
                class="break-words border-b border-white/5 py-1 last:border-0 hover:bg-white/5
                {log.toLowerCase().includes('error')
                    ? 'text-rose-400'
                    : log.toLowerCase().includes('warn')
                      ? 'text-amber-400'
                      : 'text-zinc-300'}"
            >
                {log}
            </div>
        {/each}
    </div>
</div>

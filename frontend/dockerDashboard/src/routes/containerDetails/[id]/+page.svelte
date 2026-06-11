<script>
    import { page } from "$app/stores";
    import { authState } from "$lib/shared/authStore.svelte.js";
    import LogViewer from "$lib/components/Logs.svelte"; // Achte darauf, dass der Dateiname passt
    import StatChart from "$lib/components/Graph.svelte"; // Achte darauf, dass der Dateiname passt
    import { containerStore } from "$lib/shared/containerStore.svelte.js";

    let containerId = $derived($page.params.id);
    let details = $state(null);
    let isProcessing = $state(false);
    let error = $state(null);

    let statsHistory = $derived(
        containerStore.statsHistory
            ? containerStore.statsHistory[containerId] || []
            : [],
    );

    $effect(() => {
        if (containerId) {
            fetchContainerDetails();
        }
    });

    async function fetchContainerDetails() {
        try {
            const res = await fetch(
                `http://localhost:3000/api/containers/${containerId}`,
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                },
            );
            if (!res.ok)
                throw new Error("Konnte Container Details nicht laden");
            details = await res.json();
        } catch (err) {
            error = err.message;
        }
    }

    async function handleAction(action) {
        if (
            action === "stop" &&
            !confirm(`Möchtest du ${details.name} wirklich stoppen?`)
        )
            return;
        if (
            action === "restart" &&
            !confirm(`Möchtest du ${details.name} wirklich neu starten?`)
        )
            return;

        isProcessing = true;
        try {
            const res = await fetch(
                `http://localhost:3000/api/containers/${containerId}/${action}`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${authState.token}` },
                },
            );
            if (!res.ok) throw new Error(`Fehler beim ${action}`);

            await fetchContainerDetails();
        } catch (err) {
            alert(err.message);
        } finally {
            isProcessing = false;
        }
    }
</script>

<main class="container mx-auto max-w-7xl p-6">
    <div class="mb-6">
        <a
            href="/"
            class="mb-4 inline-flex items-center text-sm text-zinc-400 transition-colors hover:text-emerald-400"
        >
            <svg
                class="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                ></path></svg
            >
            Zurück zum Dashboard
        </a>
    </div>

    {#if error}
        <div
            class="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-rose-400"
        >
            {error}
        </div>
    {:else if !details}
        <div class="flex h-32 items-center justify-center text-zinc-500">
            Lade Container Details...
        </div>
    {:else}
        <header
            class="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:flex-row md:items-center md:justify-between"
        >
            <div>
                <div class="flex items-center gap-3">
                    <h1 class="text-3xl font-bold tracking-tight text-white">
                        {details.name.replace("/", "")}
                    </h1>
                    <span
                        class="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider
                        {details.state === 'running'
                            ? 'border border-emerald-500/20 bg-emerald-500/20 text-emerald-400'
                            : 'border border-zinc-500/20 bg-zinc-500/20 text-zinc-400'}"
                    >
                        {details.state}
                    </span>
                </div>
                <p class="mt-2 font-mono text-sm text-zinc-400">
                    {details.image}
                </p>
            </div>

            <div class="flex gap-3">
                {#if details.state === "exited" || details.state === "created"}
                    <button
                        onclick={() => handleAction("start")}
                        disabled={isProcessing}
                        class="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-600 disabled:opacity-50"
                        >Start</button
                    >
                {:else if details.state === "running"}
                    <button
                        onclick={() => handleAction("restart")}
                        disabled={isProcessing}
                        class="rounded-lg border border-amber-500/50 bg-amber-500/10 px-6 py-2.5 text-sm font-semibold text-amber-500 transition-all hover:bg-amber-500/20 disabled:opacity-50"
                        >Restart</button
                    >
                    <button
                        onclick={() => handleAction("stop")}
                        disabled={isProcessing}
                        class="rounded-lg border border-rose-500/50 bg-rose-500/10 px-6 py-2.5 text-sm font-semibold text-rose-500 transition-all hover:bg-rose-500/20 disabled:opacity-50"
                        >Stop</button
                    >
                {/if}
            </div>
        </header>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="flex flex-col gap-6 lg:col-span-1">
                <div
                    class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
                >
                    <h2 class="mb-4 text-lg font-semibold text-white">
                        Metadaten
                    </h2>

                    <div class="space-y-4">
                        <div>
                            <span
                                class="text-xs font-bold uppercase tracking-wider text-zinc-500"
                                >Netzwerk</span
                            >
                            <div class="mt-1">
                                <span
                                    class="rounded-md bg-white/10 px-2 py-1 font-mono text-xs text-zinc-300"
                                    >{details.network || "-"}</span
                                >
                            </div>
                        </div>

                        <div>
                            <span
                                class="text-xs font-bold uppercase tracking-wider text-zinc-500"
                                >Ports</span
                            >
                            <div class="mt-1 space-y-1">
                                {#if details.ports && Object.keys(details.ports).length > 0}
                                    {#each Object.entries(details.ports) as [port, data]}
                                        <div
                                            class="font-mono text-xs text-zinc-300"
                                        >
                                            {port}
                                        </div>
                                    {/each}
                                {:else}
                                    <div class="text-sm text-zinc-500">
                                        Keine Ports veröffentlicht
                                    </div>
                                {/if}
                            </div>
                        </div>

                        <div>
                            <span
                                class="text-xs font-bold uppercase tracking-wider text-zinc-500"
                                >Volumes</span
                            >
                            <div class="mt-1 space-y-2">
                                {#if details.volumes && details.volumes.length > 0}
                                    <div class="text-xs text-zinc-400">
                                        {details.volumes.length} Volume(s) verbunden
                                    </div>
                                {:else}
                                    <div class="text-sm text-zinc-500">
                                        Keine Volumes gemountet
                                    </div>
                                {/if}
                            </div>
                        </div>

                        <div>
                            <span
                                class="text-xs font-bold uppercase tracking-wider text-zinc-500"
                                >Environment</span
                            >
                            <div class="mt-1 space-y-1">
                                {#if details.env && details.env.length > 0}
                                    <div class="text-xs text-zinc-400">
                                        {details.env.length} Variablen gesetzt
                                    </div>
                                {:else}
                                    <div class="text-sm text-zinc-500">-</div>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
                >
                    <h2 class="mb-4 text-lg font-semibold text-white">
                        Ressourcen (Live)
                    </h2>
                    <StatChart historyData={statsHistory} />
                </div>
            </div>

            <div class="lg:col-span-2">
                <div
                    class="h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
                >
                    <h2 class="mb-4 text-lg font-semibold text-white">
                        Live Logs
                    </h2>
                    <LogViewer {containerId} />
                </div>
            </div>
        </div>
    {/if}
</main>

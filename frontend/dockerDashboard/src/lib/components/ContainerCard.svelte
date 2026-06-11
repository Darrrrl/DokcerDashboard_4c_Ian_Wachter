<script>
    import { authState } from "$lib/shared/authStore.svelte.js";
    import { settingsStore } from "$lib/shared/settingsStore.svelte.js";

    let isProcessing = $state(false);
    let { container } = $props();

    const t = (key, replacements) => settingsStore.t(key, replacements);

    // Parse CPU percentage for bar width (e.g. "3.2%" → 3.2)
    const cpuPercent = $derived(() => {
        const val = parseFloat(container.cpu ?? "0");
        return isNaN(val) ? 0 : Math.min(val, 100);
    });

    // Parse RAM for bar (e.g. "512 MB" → some normalized %)
    const ramRaw = $derived(() => container.ram ?? "0 MB");

    async function handleAction(action) {
        if (
            action === "stop" &&
            !confirm(t("container.confirmStop", { name: container.name }))
        )
            return;
        if (
            action === "restart" &&
            !confirm(t("container.confirmRestart", { name: container.name }))
        )
            return;

        isProcessing = true;
        try {
            const res = await fetch(
                `http://localhost:3000/api/containers/${container.id}/${action}`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${authState.token}` },
                },
            );
            if (!res.ok) alert(`${t("container.networkError")} (${action})`);
        } catch (error) {
            console.error(error);
            alert(t("container.networkError"));
        } finally {
            isProcessing = false;
        }
    }
</script>

<div class="card-root group">
    <!-- Status glow accent line -->
    <div
        class="status-bar
        {container.state === 'running'
            ? 'running'
            : container.state === 'exited' || container.state === 'created'
              ? 'stopped'
              : 'error'}"
    ></div>

    <div class="card-inner">
        <!-- Header -->
        <div class="card-header">
            <h3 class="container-name" title={container.name}>
                {container.name}
            </h3>
            <div
                class="status-badge
                {container.state === 'running'
                    ? 'badge-running'
                    : container.state === 'exited' ||
                        container.state === 'created'
                      ? 'badge-stopped'
                      : 'badge-error'}"
            >
                <span class="status-dot"></span>
                {container.state}
            </div>
        </div>

        <!-- Image -->
        <p class="image-label" title={container.image}>{container.image}</p>

        <!-- Stats -->
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-label">CPU</div>
                <div class="stat-value">{container.cpu ?? "0.0%"}</div>
                <div class="stat-bar-track">
                    <div
                        class="stat-bar-fill cpu-fill"
                        style="width: {cpuPercent()}%"
                    ></div>
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-label">RAM</div>
                <div class="stat-value">{ramRaw()}</div>
                <div class="stat-bar-track">
                    <div
                        class="stat-bar-fill ram-fill"
                        style="width: 40%"
                    ></div>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="actions">
            {#if container.state === "exited" || container.state === "created"}
                <button
                    onclick={() => handleAction("start")}
                    disabled={isProcessing}
                    class="btn btn-start"
                >
                    {#if isProcessing}
                        <span class="spinner"></span>
                    {:else}
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            ><path d="M8 5v14l11-7z" /></svg
                        >
                    {/if}
                    {t("container.start")}
                </button>
            {:else if container.state === "running"}
                <button
                    onclick={() => handleAction("restart")}
                    disabled={isProcessing}
                    class="btn btn-restart"
                >
                    {#if isProcessing}
                        <span class="spinner"></span>
                    {:else}
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                        >
                            <path d="M23 4v6h-6" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                    {/if}
                    {t("container.restart")}
                </button>
                <button
                    onclick={() => handleAction("stop")}
                    disabled={isProcessing}
                    class="btn btn-stop"
                >
                    {#if isProcessing}
                        <span class="spinner"></span>
                    {:else}
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            ><rect x="6" y="6" width="12" height="12" rx="1" /></svg
                        >
                    {/if}
                    {t("container.stop")}
                </button>
            {/if}
        </div>
    </div>
</div>

<style>
    .card-root {
        position: relative;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.07);
        background: rgba(255, 255, 255, 0.04);
        backdrop-filter: blur(16px);
        overflow: hidden;
        transition:
            border-color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
    }
    .card-root:hover {
        border-color: rgba(255, 255, 255, 0.14);
        transform: translateY(-2px);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    }

    /* Top accent line */
    .status-bar {
        height: 2px;
        width: 100%;
    }
    .status-bar.running {
        background: linear-gradient(90deg, #10b981, #34d399);
    }
    .status-bar.stopped {
        background: rgba(255, 255, 255, 0.08);
    }
    .status-bar.error {
        background: linear-gradient(90deg, #f59e0b, #fbbf24);
    }

    .card-inner {
        padding: 1.1rem 1.1rem 1rem;
    }

    /* Header */
    .card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.3rem;
    }
    .container-name {
        font-size: 0.95rem;
        font-weight: 600;
        color: #f4f4f5;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0;
        letter-spacing: -0.01em;
    }

    /* Status badge */
    .status-badge {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.65rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 999px;
        white-space: nowrap;
        flex-shrink: 0;
    }
    .badge-running {
        background: rgba(16, 185, 129, 0.12);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .badge-stopped {
        background: rgba(255, 255, 255, 0.05);
        color: #71717a;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .badge-error {
        background: rgba(245, 158, 11, 0.12);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.25);
    }

    .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        flex-shrink: 0;
    }
    .badge-running .status-dot {
        box-shadow: 0 0 6px currentColor;
        animation: pulse-dot 2s ease-in-out infinite;
    }
    @keyframes pulse-dot {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.4;
        }
    }

    /* Image */
    .image-label {
        font-family: "JetBrains Mono", "Fira Code", monospace;
        font-size: 0.7rem;
        color: #52525b;
        margin: 0 0 1rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Stats */
    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-bottom: 1rem;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.04);
    }
    .stat-label {
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #3f3f46;
        margin-bottom: 2px;
    }
    .stat-value {
        font-family: "JetBrains Mono", "Fira Code", monospace;
        font-size: 0.8rem;
        color: #a1a1aa;
        margin-bottom: 6px;
    }
    .stat-bar-track {
        height: 3px;
        background: rgba(255, 255, 255, 0.06);
        border-radius: 999px;
        overflow: hidden;
    }
    .stat-bar-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.5s ease;
    }
    .cpu-fill {
        background: linear-gradient(90deg, #10b981, #34d399);
    }
    .ram-fill {
        background: linear-gradient(90deg, #6366f1, #818cf8);
    }

    /* Actions */
    .actions {
        display: flex;
        gap: 0.5rem;
    }
    .btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        padding: 0.45rem 0.75rem;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 600;
        border: 1px solid transparent;
        cursor: pointer;
        transition:
            background 0.15s ease,
            opacity 0.15s ease;
    }
    .btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    .btn-start {
        background: rgba(16, 185, 129, 0.1);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.2);
    }
    .btn-start:hover:not(:disabled) {
        background: rgba(16, 185, 129, 0.18);
    }
    .btn-restart {
        background: rgba(99, 102, 241, 0.1);
        color: #818cf8;
        border-color: rgba(99, 102, 241, 0.2);
    }
    .btn-restart:hover:not(:disabled) {
        background: rgba(99, 102, 241, 0.18);
    }
    .btn-stop {
        background: rgba(244, 63, 94, 0.1);
        color: #fb7185;
        border-color: rgba(244, 63, 94, 0.2);
    }
    .btn-stop:hover:not(:disabled) {
        background: rgba(244, 63, 94, 0.18);
    }

    /* Spinner */
    .spinner {
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255, 255, 255, 0.15);
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>

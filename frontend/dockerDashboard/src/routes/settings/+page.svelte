<script>
    import { onMount } from "svelte";
    import { settingsStore } from "$lib/shared/settingsStore.svelte.js";
    import { containerStore } from "$lib/shared/containerStore.svelte.js";

    let language = $state("de");
    let darkMode = $state(true);
    let wsInterval = $state(5000);
    let hiddenContainers = $state([]);
    let saveSuccess = $state(false);
    let saving = $state(false);

    onMount(async () => {
        await settingsStore.load();
        language = settingsStore.language;
        darkMode = settingsStore.darkMode;
        wsInterval = settingsStore.wsInterval;

        await containerStore.init();
    });

    const t = (key) => settingsStore.t(key);

    async function save() {
        saving = true;
        await settingsStore.save({
            language,
            dark_mode: darkMode,
            ws_reconnect_interval: wsInterval,
        });
        saving = false;
        saveSuccess = true;
        setTimeout(() => (saveSuccess = false), 2000);
    }

    function toggleContainer(id) {
        if (hiddenContainers.includes(id)) {
            hiddenContainers = hiddenContainers.filter((c) => c !== id);
        } else {
            hiddenContainers = [...hiddenContainers, id];
        }
    }
</script>

<main class="page-root">
    <header class="page-header">
        <div>
            <h1 class="page-title">{t("settings.title")}</h1>
            <p class="page-subtitle">{t("settings.subtitle")}</p>
        </div>
        <button onclick={save} disabled={saving} class="save-btn">
            {#if saving}
                <div class="btn-spinner"></div>
            {:else if saveSuccess}
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
                {t("settings.saved")}
            {:else}
                {t("settings.save")}
            {/if}
        </button>
    </header>

    <div class="sections">
        <!-- Appearance -->
        <section class="section">
            <h2 class="section-title">{t("settings.sections.appearance")}</h2>
            <div class="section-body">
                <div class="setting-row">
                    <div class="setting-info">
                        <span class="setting-label"
                            >{t("settings.language")}</span
                        >
                    </div>
                    <div class="lang-toggle">
                        <button
                            onclick={() => (language = "de")}
                            class="lang-btn {language === 'de' ? 'active' : ''}"
                            >🇩🇪 DE</button
                        >
                        <button
                            onclick={() => (language = "en")}
                            class="lang-btn {language === 'en' ? 'active' : ''}"
                            >🇬🇧 EN</button
                        >
                    </div>
                </div>

                <div class="setting-row">
                    <div class="setting-info">
                        <span class="setting-label"
                            >{t("settings.darkMode")}</span
                        >
                    </div>
                    <button
                        onclick={() => (darkMode = !darkMode)}
                        class="toggle {darkMode ? 'toggle-on' : 'toggle-off'}"
                        role="switch"
                        aria-checked={darkMode}
                    >
                        <span class="toggle-thumb"></span>
                    </button>
                </div>
            </div>
        </section>

        <!-- Connection -->
        <section class="section">
            <h2 class="section-title">{t("settings.sections.connection")}</h2>
            <div class="section-body">
                <div class="setting-row">
                    <div class="setting-info">
                        <span class="setting-label"
                            >{t("settings.wsInterval")}</span
                        >
                        <span class="setting-hint"
                            >{t("settings.wsIntervalHint")}</span
                        >
                    </div>
                    <div class="interval-input-wrap">
                        <input
                            type="number"
                            bind:value={wsInterval}
                            min="500"
                            max="30000"
                            step="500"
                            class="number-input"
                        />
                        <span class="input-unit">ms</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Containers -->
        <section class="section">
            <h2 class="section-title">{t("settings.sections.containers")}</h2>
            <p class="section-desc">{t("settings.hiddenContainersHint")}</p>
            <div class="section-body">
                {#if containerStore.containers.length === 0}
                    <p class="empty-hint">{t("settings.noContainers")}</p>
                {:else}
                    {#each containerStore.containers as container}
                        <div class="setting-row">
                            <div class="setting-info">
                                <span class="container-name"
                                    >{container.name}</span
                                >
                                <span class="container-image"
                                    >{container.image}</span
                                >
                            </div>
                            <button
                                onclick={() => toggleContainer(container.id)}
                                class="toggle {hiddenContainers.includes(
                                    container.id,
                                )
                                    ? 'toggle-off'
                                    : 'toggle-on'}"
                                role="switch"
                                aria-checked={!hiddenContainers.includes(
                                    container.id,
                                )}
                            >
                                <span class="toggle-thumb"></span>
                            </button>
                        </div>
                    {/each}
                {/if}
            </div>
        </section>
    </div>
</main>

<style>
    .page-root {
        max-width: 720px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
    }

    .page-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        margin-bottom: 2.5rem;
        gap: 1rem;
    }

    .page-title {
        font-size: 2rem;
        font-weight: 700;
        color: #f4f4f5;
        letter-spacing: -0.03em;
        margin: 0 0 0.25rem;
    }

    .page-subtitle {
        font-size: 0.8rem;
        color: #52525b;
        margin: 0;
        font-family: "JetBrains Mono", monospace;
    }

    .save-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0.55rem 1.25rem;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.25);
        border-radius: 10px;
        color: #34d399;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s;
        white-space: nowrap;
        min-width: 110px;
        justify-content: center;
    }
    .save-btn:hover:not(:disabled) {
        background: rgba(16, 185, 129, 0.2);
    }
    .save-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .sections {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .section {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 16px;
        overflow: hidden;
    }

    .section-title {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #3f3f46;
        padding: 1rem 1.25rem 0.6rem;
        margin: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .section-desc {
        font-size: 0.78rem;
        color: #52525b;
        padding: 0.75rem 1.25rem 0;
        margin: 0;
    }

    .section-body {
        padding: 0.25rem 0;
    }

    .setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.85rem 1.25rem;
        gap: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }
    .setting-row:last-child {
        border-bottom: none;
    }

    .setting-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .setting-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #d4d4d8;
    }

    .setting-hint {
        font-size: 0.72rem;
        color: #52525b;
    }

    .container-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: #d4d4d8;
    }

    .container-image {
        font-size: 0.7rem;
        font-family: "JetBrains Mono", monospace;
        color: #3f3f46;
    }

    .empty-hint {
        font-size: 0.8rem;
        color: #3f3f46;
        padding: 1rem 1.25rem;
        margin: 0;
    }

    /* Language toggle */
    .lang-toggle {
        display: flex;
        gap: 4px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        padding: 3px;
    }
    .lang-btn {
        padding: 0.35rem 0.75rem;
        border-radius: 6px;
        font-size: 0.78rem;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.15s;
        background: transparent;
        color: #52525b;
    }
    .lang-btn.active {
        background: rgba(255, 255, 255, 0.08);
        color: #e4e4e7;
    }

    /* Toggle switch */
    .toggle {
        position: relative;
        width: 42px;
        height: 24px;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        transition: background 0.2s;
        flex-shrink: 0;
        padding: 0;
    }
    .toggle-on {
        background: rgba(16, 185, 129, 0.5);
    }
    .toggle-off {
        background: rgba(255, 255, 255, 0.08);
    }

    .toggle-thumb {
        position: absolute;
        top: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: white;
        transition: left 0.2s;
    }
    .toggle-on .toggle-thumb {
        left: 21px;
    }
    .toggle-off .toggle-thumb {
        left: 3px;
    }

    /* Number input */
    .interval-input-wrap {
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .number-input {
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 0.4rem 0.6rem;
        font-size: 0.875rem;
        font-family: "JetBrains Mono", monospace;
        color: #e4e4e7;
        width: 90px;
        outline: none;
        text-align: right;
    }
    .number-input:focus {
        border-color: rgba(16, 185, 129, 0.35);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.08);
    }
    .input-unit {
        font-size: 0.75rem;
        font-family: "JetBrains Mono", monospace;
        color: #52525b;
    }

    .btn-spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(52, 211, 153, 0.2);
        border-top-color: #34d399;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>

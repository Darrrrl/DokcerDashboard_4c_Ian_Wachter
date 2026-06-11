<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { settingsStore } from "$lib/shared/settingsStore.svelte.js";

    let username = $state("");
    let password = $state("");
    let error = $state("");
    let loading = $state(false);

    const t = (key) => settingsStore.t(key);

    async function handleSetup() {
        loading = true;
        error = "";
        try {
            const res = await fetch("http://localhost:3000/api/auth/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || t("setup.error"));
            }

            goto("/login");
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    onMount(async () => {
        // Double check if setup is actually required
        const res = await fetch("http://localhost:3000/api/auth/setup-required");
        const data = await res.json();
        if (!data.required) {
            goto("/login");
        }
    });
</script>

<main class="auth-page">
    <div class="auth-card">
        <header class="auth-header">
            <h1 class="auth-title">{t("setup.title")}</h1>
            <p class="auth-subtitle">{t("setup.subtitle")}</p>
        </header>

        <form onsubmit={handleSetup} class="auth-form">
            <div class="input-group">
                <label for="username">{t("setup.username")}</label>
                <input
                    type="text"
                    id="username"
                    bind:value={username}
                    required
                    placeholder="e.g. admin"
                />
            </div>

            <div class="input-group">
                <label for="password">{t("setup.password")}</label>
                <input
                    type="password"
                    id="password"
                    bind:value={password}
                    required
                />
            </div>

            {#if error}
                <p class="error-msg">{error}</p>
            {/if}

            <button type="submit" class="submit-btn" disabled={loading}>
                {#if loading}
                    <div class="spinner"></div>
                {:else}
                    {t("setup.create")}
                {/if}
            </button>
        </form>
    </div>
</main>

<style>
    .auth-page {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        width: 100vw;
        background: #09090b;
        color: #f4f4f5;
    }

    .auth-card {
        width: 100%;
        max-width: 400px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        padding: 2.5rem;
        backdrop-filter: blur(16px);
    }

    .auth-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .auth-title {
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }

    .auth-subtitle {
        font-size: 0.875rem;
        color: #71717a;
    }

    .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .input-group label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #a1a1aa;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .input-group input {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 0.75rem 1rem;
        color: white;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s;
    }

    .input-group input:focus {
        border-color: #34d399;
    }

    .submit-btn {
        background: #34d399;
        color: #064e3b;
        border: none;
        border-radius: 10px;
        padding: 0.75rem;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: opacity 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .submit-btn:hover {
        opacity: 0.9;
    }

    .submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .error-msg {
        color: #fb7185;
        font-size: 0.8rem;
        text-align: center;
    }

    .spinner {
        width: 1.25rem;
        height: 1.25rem;
        border: 3px solid rgba(6, 78, 59, 0.2);
        border-top-color: #064e3b;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>
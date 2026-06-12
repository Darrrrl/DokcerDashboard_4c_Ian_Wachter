<script>
    import { authState, setAuthToken } from "$lib/shared/authStore.svelte";
    import { settingsStore } from "$lib/shared/settingsStore.svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    const t = (key) => settingsStore.t(key);

    let isLoading = $state(true);
    let isSetupRequired = $state(false);
    let username = $state("");
    let password = $state("");
    let passwordConfirm = $state("");
    let errorMessage = $state("");
    let isSubmitting = $state(false);

    onMount(async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/setup-required`,
            );
            const data = await res.json();
            isSetupRequired = data.required;
        } catch (error) {
            errorMessage = t("login.errorSetupStatus");
        } finally {
            isLoading = false;
        }
    });

    async function login() {
        errorMessage = "";
        isSubmitting = true;
        try {
            if (isSetupRequired) {
                if (password !== passwordConfirm) {
                    errorMessage = t("login.errorSetup");
                    return;
                }
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/auth/setup`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, password }),
                    },
                );
                if (res.ok) {
                    const created = await res.json();
                    isSetupRequired = !created;
                } else {
                    errorMessage = t("setup.error");
                }
            } else {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, password }),
                    },
                );
                if (res.ok) {
                    const data = await res.json();
                    setAuthToken(data.token);
                    goto("/");
                } else {
                    errorMessage = t("login.errorAuth");
                }
            }
        } catch (e) {
            errorMessage = t("login.errorNetwork");
        } finally {
            isSubmitting = false;
        }
    }

    function handleKeydown(e) {
        if (e.key === "Enter") login();
    }
</script>

<div class="login-root">
    <div class="login-card">
        <!-- Logo mark -->
        <div class="logo-mark">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect
                    x="2"
                    y="8"
                    width="10"
                    height="7"
                    rx="2"
                    fill="rgba(16,185,129,0.9)"
                />
                <rect
                    x="14"
                    y="8"
                    width="10"
                    height="7"
                    rx="2"
                    fill="rgba(16,185,129,0.4)"
                />
                <rect
                    x="2"
                    y="17"
                    width="5"
                    height="5"
                    rx="1.5"
                    fill="rgba(16,185,129,0.3)"
                />
                <rect
                    x="9"
                    y="17"
                    width="5"
                    height="5"
                    rx="1.5"
                    fill="rgba(16,185,129,0.5)"
                />
                <rect
                    x="16"
                    y="17"
                    width="5"
                    height="5"
                    rx="1.5"
                    fill="rgba(16,185,129,0.7)"
                />
            </svg>
        </div>

        {#if isLoading}
            <div class="loading-state">
                <div class="spinner"></div>
            </div>
        {:else}
            <div class="card-header">
                <h1 class="title">
                    {isSetupRequired ? t("setup.title") : t("login.title")}
                </h1>
                <p class="subtitle">
                    {isSetupRequired
                        ? t("setup.subtitle")
                        : t("login.subtitle")}
                </p>
            </div>

            <div class="form">
                <div class="field">
                    <label class="field-label" for="username"
                        >{t("login.username")}</label
                    >
                    <input
                        id="username"
                        type="text"
                        bind:value={username}
                        onkeydown={handleKeydown}
                        placeholder="admin"
                        autocomplete="username"
                        class="field-input"
                    />
                </div>

                <div class="field">
                    <label class="field-label" for="password">{t("login.password")}</label>
                    <input
                        id="password"
                        type="password"
                        bind:value={password}
                        onkeydown={handleKeydown}
                        placeholder="••••••••"
                        autocomplete={isSetupRequired
                            ? "new-password"
                            : "current-password"}
                        class="field-input"
                    />
                </div>

                {#if isSetupRequired}
                    <div class="field">
                        <label class="field-label" for="passwordConfirm"
                            >{t("login.confirmPassword")}</label
                        >
                        <input
                            id="passwordConfirm"
                            type="password"
                            bind:value={passwordConfirm}
                            onkeydown={handleKeydown}
                            placeholder="••••••••"
                            autocomplete="new-password"
                            class="field-input"
                        />
                    </div>
                {/if}

                {#if errorMessage}
                    <div class="error-msg">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            style="flex-shrink:0"
                        >
                            <circle cx="12" cy="12" r="10" /><line
                                x1="12"
                                y1="8"
                                x2="12"
                                y2="12"
                            /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {errorMessage}
                    </div>
                {/if}

                <button
                    onclick={login}
                    disabled={isSubmitting || !username || !password}
                    class="submit-btn"
                >
                    {#if isSubmitting}
                        <div class="btn-spinner"></div>
                    {:else}
                        {isSetupRequired ? t("login.submitSetup") : t("login.submitLogin")}
                    {/if}
                </button>
            </div>
        {/if}
    </div>
</div>

<style>
    .login-root {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
    }

    .login-card {
        width: 100%;
        max-width: 380px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        padding: 2.5rem 2rem;
        backdrop-filter: blur(24px);
        box-shadow:
            0 32px 80px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.03) inset;
    }

    .logo-mark {
        margin-bottom: 1.75rem;
    }

    .card-header {
        margin-bottom: 2rem;
    }

    .title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #f4f4f5;
        letter-spacing: -0.03em;
        margin: 0 0 0.35rem;
    }

    .subtitle {
        font-size: 0.8rem;
        color: #52525b;
        margin: 0;
        font-family: "JetBrains Mono", "Fira Code", monospace;
        letter-spacing: 0.02em;
    }

    .loading-state {
        display: flex;
        justify-content: center;
        padding: 2rem 0;
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .field-label {
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: #52525b;
    }

    .field-input {
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 0.65rem 0.9rem;
        font-size: 0.9rem;
        color: #e4e4e7;
        outline: none;
        transition:
            border-color 0.15s ease,
            background 0.15s ease;
        width: 100%;
        box-sizing: border-box;
    }

    .field-input::placeholder {
        color: #3f3f46;
    }

    .field-input:focus {
        border-color: rgba(16, 185, 129, 0.4);
        background: rgba(0, 0, 0, 0.35);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.08);
    }

    .error-msg {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.78rem;
        color: #f87171;
        background: rgba(248, 113, 113, 0.08);
        border: 1px solid rgba(248, 113, 113, 0.15);
        border-radius: 8px;
        padding: 0.6rem 0.75rem;
    }

    .submit-btn {
        margin-top: 0.5rem;
        width: 100%;
        padding: 0.7rem;
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 10px;
        color: #34d399;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition:
            background 0.15s ease,
            transform 0.1s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
    }

    .submit-btn:hover:not(:disabled) {
        background: rgba(16, 185, 129, 0.22);
    }

    .submit-btn:active:not(:disabled) {
        transform: scale(0.99);
    }

    .submit-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }

    .spinner {
        width: 24px;
        height: 24px;
        border: 2px solid rgba(255, 255, 255, 0.08);
        border-top-color: #34d399;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
    }

    .btn-spinner {
        width: 16px;
        height: 16px;
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

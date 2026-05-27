<script>
    import { authState, setAuthToken } from "$lib/shared/authStore.svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    let isLoading = $state(true);
    let isSetupRequired = $state(false);

    let username = $state("");
    let password = $state("");
    let passwordConfirm = $state("");
    let errorMessage = $state("");

    onMount(async () => {
        try {
            const res = await fetch(
                "http://localhost:3000/api/auth/setup-required",
            );
            const data = await res.json();

            isSetupRequired = data.required;
        } catch (error) {
            errorMessage = "Konnte Setup-Status nicht laden.";
        } finally {
            isLoading = false;
        }
    });

    async function login() {
        if (isSetupRequired) {
            if (password !== passwordConfirm) {
                errorMessage = "Passwörter stimmen nicht überein!";
                return;
            }

            let res = await fetch("http://localhost:3000/api/auth/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                let created = await res.json();

                isSetupRequired = !created;
            }
        } else {
            let res = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                let data = await res.json();

                setAuthToken(data.token);

                goto("/");
            }
        }
    }
</script>

<div>
    {#if isLoading}
        ...Loading
    {:else}
        <p>Username</p>
        <input type="text" bind:value={username} />
        <input type="password" bind:value={password} />

        {#if isSetupRequired}
            <input type="password" bind:value={passwordConfirm} />
        {/if}
        <button onclick={() => login()}>login</button>
    {/if}
</div>

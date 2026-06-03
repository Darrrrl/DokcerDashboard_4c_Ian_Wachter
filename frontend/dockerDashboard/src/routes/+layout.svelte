<script>
	import { authState } from "$lib/shared/authStore.svelte.js";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import "../app.css";

	let { children } = $props();

	onMount(() => {
		const currentPath = $page.url.pathname;
		if (!authState.isAuthenticated && currentPath !== "/login")
			goto("/login");
		if (authState.isAuthenticated && currentPath === "/login") goto("/");
	});

	$effect(() => {
		const currentPath = $page.url.pathname;
		if (!authState.isAuthenticated && currentPath !== "/login")
			goto("/login");
		if (authState.isAuthenticated && currentPath === "/login") goto("/");
	});

	function logout() {
		authState.token = null;
		goto("/login");
	}
</script>

<div
	class="min-h-screen bg-zinc-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 font-sans text-zinc-100 selection:bg-emerald-500/30"
>
	{#if authState.isAuthenticated || $page.url.pathname === "/login"}
		{#if authState.isAuthenticated}
			<nav class="navbar">
				<!-- Logo -->
				<a href="/" class="nav-logo">
					<svg width="22" height="22" viewBox="0 0 28 28" fill="none">
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
					<span class="nav-logo-text">DockerDash</span>
				</a>

				<!-- Links -->
				<div class="nav-links">
					<a
						href="/"
						class="nav-link {$page.url.pathname === '/'
							? 'active'
							: ''}"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<rect
								x="3"
								y="3"
								width="7"
								height="7"
								rx="1"
							/><rect x="14" y="3" width="7" height="7" rx="1" />
							<rect
								x="3"
								y="14"
								width="7"
								height="7"
								rx="1"
							/><rect x="14" y="14" width="7" height="7" rx="1" />
						</svg>
						Dashboard
					</a>
					<a
						href="/settings"
						class="nav-link {$page.url.pathname === '/settings'
							? 'active'
							: ''}"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="12" cy="12" r="3" />
							<path
								d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
							/>
						</svg>
						Einstellungen
					</a>
				</div>

				<!-- Right side -->
				<div class="nav-right">
					<span class="nav-user">
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
							/><circle cx="12" cy="7" r="4" />
						</svg>
						{authState.username ?? "Admin"}
					</span>
					<button onclick={logout} class="logout-btn">
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
							<polyline points="16 17 21 12 16 7" /><line
								x1="21"
								y1="12"
								x2="9"
								y2="12"
							/>
						</svg>
						Logout
					</button>
				</div>
			</nav>
		{/if}

		{@render children()}
	{:else}
		<div class="flex h-screen w-screen items-center justify-center">
			<div class="flex flex-col items-center gap-4">
				<div
					class="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-emerald-500"
				></div>
				<p
					class="animate-pulse font-mono text-sm tracking-widest text-zinc-500"
				>
					AUTHENTICATING...
				</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.navbar {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0 1.5rem;
		height: 52px;
		background: rgba(9, 9, 11, 0.8);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		backdrop-filter: blur(16px);
	}

	.nav-logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		margin-right: 0.5rem;
	}
	.nav-logo-text {
		font-size: 0.9rem;
		font-weight: 700;
		color: #f4f4f5;
		letter-spacing: -0.02em;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex: 1;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.75rem;
		border-radius: 8px;
		font-size: 0.825rem;
		font-weight: 500;
		color: #272760;
		text-decoration: none;
		transition:
			color 0.15s,
			background 0.15s;
	}
	.nav-link:hover {
		color: #a1a1aa;
		background: rgba(255, 255, 255, 0.04);
	}
	.nav-link.active {
		color: #f4f4f5;
		background: rgba(255, 255, 255, 0.07);
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-left: auto;
	}

	.nav-user {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.78rem;
		color: #3f3f46;
		font-family: "JetBrains Mono", monospace;
	}

	.logout-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.35rem 0.75rem;
		border-radius: 7px;
		font-size: 0.78rem;
		font-weight: 500;
		color: #71717a;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.07);
		cursor: pointer;
		transition:
			color 0.15s,
			border-color 0.15s,
			background 0.15s;
	}
	.logout-btn:hover {
		color: #fb7185;
		border-color: rgba(251, 113, 133, 0.2);
		background: rgba(251, 113, 133, 0.05);
	}
</style>

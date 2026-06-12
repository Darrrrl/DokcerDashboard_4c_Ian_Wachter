<script>
	import { authState, refreshToken } from "$lib/shared/authStore.svelte.js";
	import { settingsStore } from "$lib/shared/settingsStore.svelte.js";
	import Background from "$lib/components/Background.svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import "../app.css";

	let { children } = $props();

	onMount(async () => {
		const currentPath = $page.url.pathname;

		// 1. Check if setup is required
		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/setup-required`);
			const data = await res.json();
			if (data.required && currentPath !== "/setup") {
				goto("/setup");
				return;
			}
		} catch (e) {
			console.error("Failed to check setup status", e);
		}
		
		if (authState.token && authState.isExpired) {
			const success = await refreshToken();
			if (!success && currentPath !== "/login") {
				goto("/login");
				return;
			}
		}

		if (!authState.isAuthenticated && currentPath !== "/login") {
			goto("/login");
		} else if (authState.isAuthenticated) {
			await settingsStore.load();
			if (currentPath === "/login") goto("/");
		}
	});

	$effect(() => {
		const currentPath = $page.url.pathname;
		if (!authState.isAuthenticated && currentPath !== "/login" && currentPath !== "/setup") {
			goto("/login");
		}
	});

	$effect(() => {
		if (typeof document !== 'undefined') {
			if (settingsStore.darkMode) {
				document.body.classList.add('dark-mode');
			} else {
				document.body.classList.remove('dark-mode');
			}
		}
	});

	function logout() {
		authState.token = null;
		goto("/login");
	}

	const t = (key) => settingsStore.t(key);

	let isMobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	// Close mobile menu on navigation
	$effect(() => {
		$page.url.pathname;
		isMobileMenuOpen = false;
	});
</script>

<div class="app-root">
	<Background />
	{#if authState.isAuthenticated || $page.url.pathname === "/login" || $page.url.pathname === "/setup"}
		{#if authState.isAuthenticated && $page.url.pathname !== "/setup"}
			<!-- Mobile Header -->
			<header class="mobile-header">
				<button onclick={toggleMobileMenu} class="menu-toggle" aria-label="Toggle Menu">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="3" y1="12" x2="21" y2="12"></line>
						<line x1="3" y1="6" x2="21" y2="6"></line>
						<line x1="3" y1="18" x2="21" y2="18"></line>
					</svg>
				</button>
				<div class="mobile-logo">
					<span class="logo-text">DockerDash</span>
				</div>
				<div class="mobile-spacer"></div>
			</header>

			{#if isMobileMenuOpen}
				<div class="mobile-overlay" onclick={toggleMobileMenu}></div>
			{/if}

			<aside class="sidebar {isMobileMenuOpen ? 'open' : ''}">
				<a href="/" class="sidebar-logo">
					<svg width="24" height="24" viewBox="0 0 28 28" fill="none">
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
					<span class="logo-text">DockerDash</span>
				</a>

				<nav class="sidebar-nav">
					<a
						href="/"
						class="nav-item {$page.url.pathname === '/'
							? 'active'
							: ''}"
					>
						<svg
							width="17"
							height="17"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<rect x="3" y="3" width="7" height="7" rx="1" />
							<rect x="14" y="3" width="7" height="7" rx="1" />
							<rect x="3" y="14" width="7" height="7" rx="1" />
							<rect x="14" y="14" width="7" height="7" rx="1" />
						</svg>
						<span>{t("nav.dashboard")}</span>
					</a>
					<a
						href="/history"
						class="nav-item {$page.url.pathname === '/history'
							? 'active'
							: ''}"
					>
						<svg
							width="17"
							height="17"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>{t("nav.history")}</span>
					</a>
					<a
						href="/settings"
						class="nav-item {$page.url.pathname === '/settings'
							? 'active'
							: ''}"
					>
						<svg
							width="17"
							height="17"
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
						<span>{t("nav.settings")}</span>
					</a>
				</nav>

				<div class="sidebar-bottom">
					<div class="user-row">
						<div class="user-avatar">
							{(authState.username ?? "A")[0].toUpperCase()}
						</div>
						<span class="user-name"
							>{authState.username ?? "Admin"}</span
						>
					</div>
					<button onclick={logout} class="logout-btn" title="Logout">
						<svg
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
							<polyline points="16 17 21 12 16 7" />
							<line x1="21" y1="12" x2="9" y2="12" />
						</svg>
					</button>
				</div>
			</aside>

			<main class="main-content">
				{@render children()}
			</main>
		{:else}
			{@render children()}
		{/if}
	{:else}
		<div class="auth-loading">
			<div class="spinner"></div>
			<p class="auth-text">AUTHENTICATING...</p>
		</div>
	{/if}
</div>

<style>
	.app-root {
		display: flex;
		min-height: 100vh;
		background: var(--bg-app);
		background-image: radial-gradient(
			ellipse at top,
			var(--bg-gradient-top) 0%,
			var(--bg-app) 60%
		);
		color: var(--text-main);
		font-family: sans-serif;
	}

	/* Sidebar */
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		width: 220px;
		display: flex;
		flex-direction: column;
		background: var(--sidebar-bg);
		border-right: 1px solid var(--border-main);
		backdrop-filter: blur(20px);
		z-index: 100;
		padding: 1.25rem 0.75rem;
		box-sizing: border-box;
		transition: transform 0.3s ease, background-color 0.3s ease;
	}

	@media (max-width: 1024px) {
		.sidebar {
			transform: translateX(-100%);
		}
		.sidebar.open {
			transform: translateX(0);
		}
	}

	.sidebar-logo {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		text-decoration: none;
		padding: 0.25rem 0.5rem;
		margin-bottom: 2rem;
	}
	.logo-text {
		font-size: 0.95rem;
		font-weight: 700;
		color: #f4f4f5;
		letter-spacing: -0.02em;
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		flex: 1;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.6rem 0.75rem;
		border-radius: 9px;
		font-size: 0.85rem;
		font-weight: 500;
		color: #52525b;
		text-decoration: none;
		transition:
			color 0.15s,
			background 0.15s;
	}
	.nav-item:hover {
		color: #a1a1aa;
		background: rgba(255, 255, 255, 0.04);
	}
	.nav-item.active {
		color: #f4f4f5;
		background: rgba(255, 255, 255, 0.08);
	}
	.nav-item.active svg {
		color: #34d399;
	}

	/* Bottom user section */
	.sidebar-bottom {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		margin-top: auto;
	}

	.user-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		min-width: 0;
	}

	.user-avatar {
		width: 28px;
		height: 28px;
		border-radius: 8px;
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.25);
		color: #34d399;
		font-size: 0.75rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.user-name {
		font-size: 0.78rem;
		color: #71717a;
		font-family: "JetBrains Mono", monospace;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.logout-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: 7px;
		border: 1px solid rgba(255, 255, 255, 0.07);
		background: transparent;
		color: #52525b;
		cursor: pointer;
		flex-shrink: 0;
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

	/* Main content offset */
	.main-content {
		margin-left: 220px;
		flex: 1;
		min-width: 0;
		position: relative;
		z-index: 1;
	}

	@media (max-width: 1024px) {
		.main-content {
			margin-left: 0;
			padding-top: 60px; /* Space for mobile header */
		}
	}

	.mobile-header {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 60px;
		background: rgba(9, 9, 11, 0.8);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		z-index: 90;
		padding: 0 1rem;
		align-items: center;
		justify-content: space-between;
	}

	@media (max-width: 1024px) {
		.mobile-header {
			display: flex;
		}
	}

	.menu-toggle {
		background: transparent;
		border: none;
		color: #a1a1aa;
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mobile-logo .logo-text {
		font-size: 0.9rem;
		font-weight: 700;
		color: #f4f4f5;
	}

	.mobile-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		z-index: 95;
	}

	/* Auth loading */
	.auth-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100vw;
		height: 100vh;
		gap: 1rem;
	}
	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(255, 255, 255, 0.06);
		border-top-color: #34d399;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}
	.auth-text {
		font-family: "JetBrains Mono", monospace;
		font-size: 0.75rem;
		letter-spacing: 0.15em;
		color: #3f3f46;
		animation: pulse 2s ease-in-out infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}
</style>

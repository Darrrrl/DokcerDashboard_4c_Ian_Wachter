// src/lib/authStore.svelte.js

export const authState = $state({
    token: typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null,

    get isAuthenticated() {
        return !!this.token;
    }
});

export function setAuthToken(newToken) {
    authState.token = newToken;

    if (newToken) {
        localStorage.setItem('jwt_token', newToken);
    } else {
        localStorage.removeItem('jwt_token');
    }
}
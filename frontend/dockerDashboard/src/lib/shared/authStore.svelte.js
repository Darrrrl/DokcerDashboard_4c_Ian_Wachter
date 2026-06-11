// src/lib/authStore.svelte.js

function decodeToken(token) {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

export const authState = $state({
    token: typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null,
    username: typeof window !== 'undefined' ? localStorage.getItem('username') : null,

    get isAuthenticated() {
        return !!this.token && !this.isExpired;
    },

    get isExpired() {
        if (!this.token) return true;
        const decoded = decodeToken(this.token);
        if (!decoded || !decoded.exp) return false;
        return Date.now() >= decoded.exp * 1000;
    }
});

export function setAuthToken(newToken) {
    authState.token = newToken;

    if (newToken) {
        localStorage.setItem('jwt_token', newToken);
        const decoded = decodeToken(newToken);
        if (decoded && decoded.username) {
            authState.username = decoded.username;
            localStorage.setItem('username', decoded.username);
        }
    } else {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('username');
        authState.username = null;
    }
}

export async function refreshToken() {
    if (!authState.token) return false;
    
    try {
        const res = await fetch("http://localhost:3000/api/auth/refresh", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authState.token}`
            }
        });
        
        if (res.ok) {
            const data = await res.json();
            setAuthToken(data.token);
            return true;
        } else {
            setAuthToken(null);
            return false;
        }
    } catch (e) {
        console.error("Token refresh error:", e);
        return false;
    }
}
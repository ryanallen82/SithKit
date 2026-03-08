const terminal = document.getElementById('terminal');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const faultierCard = document.getElementById('faultierCard');
const deviceStatus = document.getElementById('deviceStatus');
const controlPort = document.getElementById('controlPort');
const serialPath = document.getElementById('serialPath');
const connectBtn = document.getElementById('connectBtn');

let connected = false;
let pollInterval = null;

function timestamp() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function log(message, type = 'info') {
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.innerHTML = `<span class="timestamp">${timestamp()}</span>${message}`;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

function showConnected(data) {
    connected = true;

    statusDot.className = 'status-dot connected';
    statusText.textContent = 'ONLINE';
    statusText.style.color = 'var(--green)';

    faultierCard.className = 'device-card connected';
    deviceStatus.className = 'device-status online';
    deviceStatus.textContent = 'ONLINE';

    controlPort.textContent = data.control_port;
    controlPort.className = 'info-value';
    serialPath.textContent = data.serial_path;
    serialPath.className = 'info-value';

    connectBtn.textContent = '[ DISCONNECT ]';
    connectBtn.disabled = false;
}

function showDisconnected(reason) {
    connected = false;

    statusDot.className = 'status-dot disconnected';
    statusText.textContent = 'OFFLINE';
    statusText.style.color = 'var(--red)';

    faultierCard.className = 'device-card disconnected';
    deviceStatus.className = 'device-status offline';
    deviceStatus.textContent = 'OFFLINE';

    controlPort.textContent = '---';
    controlPort.className = 'info-value dim';
    serialPath.textContent = '---';
    serialPath.className = 'info-value dim';

    connectBtn.textContent = '[ CONNECT ]';
    connectBtn.disabled = false;

    if (reason) log(reason, 'error');
}

function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

function startPolling() {
    stopPolling();
    pollInterval = setInterval(async () => {
        try {
            const resp = await fetch('/api/status');
            const data = await resp.json();
            if (!data.connected && connected) {
                log('Faultier disconnected.', 'error');
                showDisconnected(null);
                stopPolling();
            }
        } catch (e) {
            log(`Connection lost: ${e.message}`, 'error');
            showDisconnected(null);
            stopPolling();
        }
    }, 3000);
}

connectBtn.addEventListener('click', async () => {
    if (connected) {
        // Disconnect
        log('Disconnected.', 'info');
        showDisconnected(null);
        stopPolling();
        return;
    }

    // Connect
    connectBtn.textContent = '[ SCANNING... ]';
    connectBtn.disabled = true;
    log('Scanning for Faultier...', 'system');

    try {
        const resp = await fetch('/api/status');
        const data = await resp.json();

        if (data.connected) {
            log('Faultier detected.', 'success');
            log(`Control port: ${data.control_port}`, 'success');
            log(`Serial path:  ${data.serial_path}`, 'success');
            log('Device ready.', 'system');
            showConnected(data);
            startPolling();
        } else {
            log('No Faultier found. Is it plugged in?', 'error');
            showDisconnected(null);
        }
    } catch (e) {
        log(`Error: ${e.message}`, 'error');
        showDisconnected(null);
    }
});

// Initial state
log('Awaiting connection...', 'system');

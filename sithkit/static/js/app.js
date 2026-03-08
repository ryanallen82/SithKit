// DOM refs
const terminal    = document.getElementById('terminal');
const statusDot   = document.getElementById('statusDot');
const statusText  = document.getElementById('statusText');
const faultierCard = document.getElementById('faultierCard');
const deviceStatus = document.getElementById('deviceStatus');
const controlPort = document.getElementById('controlPort');
const serialPath  = document.getElementById('serialPath');
const connectBtn  = document.getElementById('connectBtn');
const captureBtn  = document.getElementById('captureBtn');
const exportBtn   = document.getElementById('exportBtn');
const sampleCount = document.getElementById('sampleCount');
const canvas      = document.getElementById('waveform');
const waveformEmpty = document.getElementById('waveformEmpty');

let connected = false;
let pollInterval = null;
let lastTrace = null;

// ── Logging ──────────────────────────────────────────────────────────────────

function timestamp() {
    const now = new Date();
    return [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map(n => String(n).padStart(2, '0')).join(':');
}

function log(message, type = 'info') {
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.innerHTML = `<span class="timestamp">${timestamp()}</span>${message}`;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

// ── Connection state ──────────────────────────────────────────────────────────

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
    captureBtn.disabled = false;
}

function showDisconnected() {
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
    captureBtn.disabled = true;
}

// ── Polling (disconnect detection) ───────────────────────────────────────────

function stopPolling() {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
}

function startPolling() {
    stopPolling();
    pollInterval = setInterval(async () => {
        try {
            const data = await fetch('/api/status').then(r => r.json());
            if (!data.connected && connected) {
                log('Faultier disconnected.', 'error');
                showDisconnected();
                stopPolling();
            }
        } catch {
            log('Connection lost.', 'error');
            showDisconnected();
            stopPolling();
        }
    }, 3000);
}

// ── Connect / Disconnect ──────────────────────────────────────────────────────

connectBtn.addEventListener('click', async () => {
    if (connected) {
        connectBtn.disabled = true;
        await fetch('/api/disconnect', { method: 'POST' });
        showDisconnected();
        stopPolling();
        log('Disconnected.', 'info');
        return;
    }

    connectBtn.textContent = '[ SCANNING... ]';
    connectBtn.disabled = true;
    log('Scanning for Faultier...', 'system');

    try {
        const data = await fetch('/api/connect', { method: 'POST' }).then(r => r.json());
        if (data.connected) {
            log('Faultier detected.', 'success');
            log(`Control port: ${data.control_port}`, 'success');
            log(`Serial path:  ${data.serial_path}`, 'success');
            log('Device ready.', 'system');
            showConnected(data);
            startPolling();
        } else {
            log(`No Faultier found. ${data.error || 'Is it plugged in?'}`, 'error');
            showDisconnected();
        }
    } catch (e) {
        log(`Error: ${e.message}`, 'error');
        showDisconnected();
    }
});

// ── Power Analysis Capture ────────────────────────────────────────────────────

captureBtn.addEventListener('click', async () => {
    const n = parseInt(sampleCount.value, 10) || 5000;
    captureBtn.textContent = '[ CAPTURING... ]';
    captureBtn.disabled = true;
    exportBtn.disabled = true;
    log(`Starting capture (${n} samples)... waiting for trigger on EXT0.`, 'system');

    try {
        const data = await fetch('/api/power-analysis/capture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sample_count: n }),
        }).then(r => r.json());

        if (data.error) {
            log(`Capture failed: ${data.error}`, 'error');
        } else {
            lastTrace = data.samples;
            log(`Captured ${data.count} samples.`, 'success');
            drawWaveform(data.samples);
            exportBtn.disabled = false;
        }
    } catch (e) {
        log(`Capture error: ${e.message}`, 'error');
    } finally {
        captureBtn.textContent = '[ CAPTURE TRACE ]';
        captureBtn.disabled = false;
    }
});

// ── Waveform rendering ────────────────────────────────────────────────────────

function drawWaveform(samples) {
    waveformEmpty.style.display = 'none';
    canvas.style.display = 'block';

    // Size canvas to its CSS display size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = (h / 4) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Trace
    ctx.strokeStyle = '#00ff41';
    ctx.shadowColor = '#00ff41';
    ctx.shadowBlur = 3;
    ctx.lineWidth = 1;
    ctx.beginPath();

    const step = w / samples.length;
    for (let i = 0; i < samples.length; i++) {
        const x = i * step;
        const y = h - (samples[i] * h * 0.85 + h * 0.075);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
}

// ── CSV Export ────────────────────────────────────────────────────────────────

exportBtn.addEventListener('click', () => {
    if (!lastTrace) return;
    const rows = lastTrace.map((v, i) => `${i},${v.toFixed(6)}`).join('\n');
    const blob = new Blob([`index,value\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trace_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    log('Trace exported to CSV.', 'info');
});

// ── Init ──────────────────────────────────────────────────────────────────────

log('Awaiting connection...', 'system');

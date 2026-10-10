function set(id, value) {
  document.getElementById(id).textContent = value;
}

function formatUptime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

async function refresh() {
  const status = document.getElementById('status');
  try {
    const res = await fetch('/api/info', { cache: 'no-store' });
    if (!res.ok) throw new Error(res.statusText);
    const info = await res.json();
    set('commit', info.commit);
    set('version', info.version);
    set('environment', info.environment);
    set('runtime', info.runtime);
    set('pod', info.pod);
    set('uptime', formatUptime(info.uptimeSeconds));
    status.textContent = 'Healthy';
    status.className = 'pill ok';
  } catch {
    status.textContent = 'Unreachable';
    status.className = 'pill bad';
  }
}

refresh();
setInterval(refresh, 5000);
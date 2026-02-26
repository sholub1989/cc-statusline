const HOST_NAME = "com.claude.usage";
let port = null;
let orgId = null;

async function ensureConnected() {
  if (!orgId) {
    const stored = await chrome.storage.local.get("orgId");
    orgId = stored.orgId;
  }
  if (!orgId) {
    try {
      // credentials: "include" required — extension origin is cross-origin to claude.ai
      const resp = await fetch("https://claude.ai/api/organizations", { credentials: "include" });
      if (resp.ok) {
        const orgs = await resp.json();
        if (orgs.length > 0) {
          orgId = orgs[0].uuid;
          await chrome.storage.local.set({ orgId });
        }
      }
    } catch {}
  }
  if (!orgId) return false;
  if (!port) {
    port = chrome.runtime.connectNative(HOST_NAME);
    port.onMessage.addListener((msg) => {
      if (msg.action === "fetch") fetchUsage();
    });
    port.onDisconnect.addListener(() => {
      console.error("Disconnected:", chrome.runtime.lastError?.message);
      port = null;
    });
  }
  return true;
}

async function fetchUsage() {
  if (!(await ensureConnected())) return;
  try {
    // credentials: "include" required — extension origin is cross-origin to claude.ai
    const resp = await fetch(
      `https://claude.ai/api/organizations/${orgId}/usage`,
      { credentials: "include" }
    );
    if (!resp.ok) return;
    if (port) port.postMessage(await resp.json());
  } catch {}
}

chrome.alarms.create("keepalive", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(() => ensureConnected());
chrome.runtime.onInstalled.addListener(() => ensureConnected());
chrome.runtime.onStartup.addListener(() => ensureConnected());

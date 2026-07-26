// ========================================================
// CLOUDFLARE PAGES FUNCTIONS - STABLE WEBSOCKET PROXY
// TARGET: FAST BYPASS VLESS/TUNNEL TO BACKEND RAILWAY
// ========================================================

export async function onRequest(context) {
  const request = context.request;
  const BACKEND = "udpvles.sshtnl.web.id"; // Domain Railway Lu

  // Jika koneksi adalah request WebSocket (Jalur utama VLESS lu)
  if (request.headers.get("Upgrade") === "websocket") {
    const url = new URL(request.url);
    url.hostname = BACKEND;
    url.protocol = "https:"; // Wajib HTTPS untuk port 443

    const newHeaders = new Headers(request.headers);
    newHeaders.set("Host", BACKEND);

    // Meneruskan jabat tangan WebSocket secara langsung tanpa memutus data stream
    try {
      return await fetch(url.toString(), {
        method: request.method,
        headers: newHeaders,
        redirect: "manual"
      });
    } catch (err) {
      return new Response("WebSocket Proxy Error", { status: 502 });
    }
  }

  // Trafik web UI biasa agar dashboard monitor ddfathuvles tetep bisa dibuka
  const url = new URL(request.url);
  url.hostname = BACKEND;
  const newHeaders = new Headers(request.headers);
  newHeaders.set("Host", BACKEND);

  return fetch(url.toString(), {
    method: request.method,
    headers: newHeaders,
    body: request.body,
    redirect: "manual"
  });
}

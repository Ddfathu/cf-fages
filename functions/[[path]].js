// ========================================================
// CLOUDFLARE PAGES FUNCTIONS - UDP BRIDGE OVER WEBSOCKET
// TARGET: BYPASS TURN UDP WEBRTC TO BACKEND RAILWAY
// ========================================================

export async function onRequest(context) {
  const request = context.request;
  const BACKEND = "vtes.jibvpn.biz.id"; // Domain Railway Lu

  // Jika koneksi adalah request WebSocket (Jalur VPN & UDP Bridge)
  if (request.headers.get("Upgrade") === "websocket") {
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    client.accept();

    // Lakukan koneksi ke backend utama Railway lu
    const url = new URL(request.url);
    url.hostname = BACKEND;
    url.protocol = "https:";

    const newHeaders = new Headers(request.headers);
    newHeaders.set("Host", BACKEND);

    // Hubungkan endpoint Edge Cloudflare langsung ke Railway
    const backendWS = await fetch(url.toString(), {
      method: request.method,
      headers: newHeaders,
      redirect: "manual"
    });

    if (backendWS.headers.get("Upgrade") === "websocket") {
      // Jembatani komunikasi data secara agresif biarkan stream loss-less lepas
      const socket = backendWS.webSocket;
      if (socket) {
        socket.accept();
        
        // Teruskan data bolak-balik tanpa filter (Bypass UDP-over-TCP)
        client.addEventListener('message', (e) => socket.send(e.data));
        socket.addEventListener('message', (e) => client.send(e.data));
        
        client.addEventListener('close', () => socket.close());
        socket.addEventListener('close', () => client.close());
      }
    }
    
    return new Response(null, { status: 101, webSocket: server });
  }

  // Trafik web UI biasa
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
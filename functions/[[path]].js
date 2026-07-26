// ========================================================
// CLOUDFLARE PAGES FUNCTIONS - UNIVERSAL EDGE REVERSE PROXY
// Target: Meneruskan WebSocket VPN ke Backend Railway
// ========================================================

export async function onRequest(context) {
  const request = context.request;
  
  // 1. TENTUKAN BACKEND ASLI LU (Domain Railway Lu)
  // Lu bisa masukkan lebih dari satu domain di dalam array ini kalau mau di-load balance
  const BACKENDS = [
    "vtes.jibvpn.biz.id", 
    // "backend-cadangan.railway.internal" // Bisa ditambah jika punya beberapa app
  ];

  // Logika acak (Round Robin / Random) untuk Load Balancing jika backend lebih dari satu
  const targetBackend = BACKENDS[Math.floor(Math.random() * BACKENDS.length)];

  const url = new URL(request.url);
  
  // Ubah alamat tujuan ke backend Railway lu
  url.hostname = targetBackend;
  url.protocol = "https:"; 

  // 2. JIKA KONEKSI ADALAH WEBSOCKET (Trafik VPN Lu)
  if (request.headers.get("Upgrade") === "websocket") {
    // Salin header asli dan sesuaikan Host-nya agar diterima oleh Railway/Argo
    const newHeaders = new Headers(request.headers);
    newHeaders.set("Host", targetBackend);

    // Lakukan fetch langsung ke backend untuk menjembatani WebSocket stream
    return fetch(url.toString(), {
      method: request.method,
      headers: newHeaders,
      redirect: "manual"
    });
  }

  // 3. JIKA HANYA DIOSSES LEWAT BROWSER BISA DI-FORWARD ATAU DIBERI RESPONS
  // Meneruskan request HTTP biasa (seperti halaman UI monitor lu) agar tetep bisa diakses
  const newHeaders = new Headers(request.headers);
  newHeaders.set("Host", targetBackend);
  
  return fetch(url.toString(), {
    method: request.method,
    headers: newHeaders,
    body: request.body,
    redirect: "manual"
  });
}
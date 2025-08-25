// Cloudflare Pages Functions middleware
// 1) 整站 Basic Auth（从环境变量读取）
// 2) 仅对 HTML 的 404 做 SPA 回退；静态资源不回退
export async function onRequest({ request, env, next }) {
    // ---- Basic Auth ----
    const USER = env.BASIC_USER;
    const PASS = env.BASIC_PASS;
    if (USER && PASS) {
      const auth = request.headers.get('authorization') || '';
      if (!auth.startsWith('Basic ')) {
        return new Response('Unauthorized', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Protected"' }
        });
      }
      const [u, p] = atob(auth.slice(6)).split(':');
      if (u !== USER || p !== PASS) return new Response('Forbidden', { status: 403 });
    }
  
    // 先交给 Pages 处理静态资源
    const res = await next();
  
    // 仅对 HTML 页面 404 做回退；静态资源一律不回退
    const url = new URL(request.url);
    const isStatic = /\.(js|css|map|json|png|jpe?g|gif|svg|ico|webp|txt|woff2?|ttf|otf)$/i.test(url.pathname);
    const acceptsHTML = (request.headers.get('accept') || '').includes('text/html');
  
    if (res.status === 404 && acceptsHTML && !isStatic) {
      url.pathname = '/index.html';
      return env.ASSETS.fetch(new Request(url, request));
    }
  
    return res;
  }
  
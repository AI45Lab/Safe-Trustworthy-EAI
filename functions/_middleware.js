// functions/_middleware.js
export async function onRequest({ request, env, next }) {
    // ---- 1) Basic Auth（整站密码）----
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
      if (u !== USER || p !== PASS) {
        return new Response('Forbidden', { status: 403 });
      }
    }
  
    // ---- 2) 交给 Pages 处理静态资源 ----
    const res = await next();
  
    // ---- 3) SPA 回退：HTML 请求 404 时返回 index.html ----
    const acceptsHTML = (request.headers.get('accept') || '').includes('text/html');
    if (res.status === 404 && acceptsHTML) {
      const url = new URL(request.url);
      url.pathname = '/index.html';
      // 用 Pages 的静态资源绑定取 index.html，避免再次进入中间件而循环
      return env.ASSETS.fetch(new Request(url, request));
    }
  
    return res;
  }
  

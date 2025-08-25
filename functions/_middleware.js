// functions/_middleware.js
export async function onRequest({ request, env, next }) {
    const USER = env.BASIC_USER;   // 这些值稍后在 Cloudflare 后台设置
    const PASS = env.BASIC_PASS;
  
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
    return next();  // 通过校验，放行到你的前端页面
  }
  
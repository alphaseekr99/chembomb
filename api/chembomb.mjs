import { createApi } from '../server/api.mjs';

const api = createApi(process.env);

export default {
  fetch(request) {
    const url = new URL(request.url);

    // Vercel can pass the rewritten pathname to the function.
    if (url.pathname === '/api/chembomb') {
      const route = url.searchParams.get('__chembomb_route');
      if (route) {
        url.pathname = '/api/' + route;
        url.searchParams.delete('__chembomb_route');
        return api(new Request(url, request));
      }
    }

    return api(request);
  }
};

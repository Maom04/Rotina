/**
 * router.js — Hash-based SPA router
 */

const Router = (() => {
  const routes = {};
  let currentRoute = null;

  function register(hash, handler) {
    routes[hash] = handler;
  }

  function navigate(hash) {
    window.location.hash = hash;
  }

  function resolve() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const route = routes[hash] || routes['dashboard'];

    // Update nav active state
    document.querySelectorAll('[data-route]').forEach(el => {
      el.classList.toggle('active', el.dataset.route === hash);
    });

    if (currentRoute === hash) return;
    currentRoute = hash;

    if (route) route(hash);
  }

  function init() {
    window.addEventListener('hashchange', resolve);
    resolve();
  }

  function current() {
    return currentRoute;
  }

  return { register, navigate, init, resolve, current };
})();

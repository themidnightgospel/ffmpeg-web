/*! coi-serviceworker — enables cross-origin isolation (SharedArrayBuffer) on hosts
    that can't set COOP/COEP headers (e.g. GitHub Pages). Based on the MIT-licensed
    project by Guido Zuidhof: https://github.com/gzuidhof/coi-serviceworker */
let coepCredentialless = false;

if (typeof window === 'undefined') {
  // ---- Service worker context ----
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener('message', (ev) => {
    if (!ev.data) return;
    if (ev.data.type === 'deregister') {
      self.registration
        .unregister()
        .then(() => self.clients.matchAll())
        .then((clients) => clients.forEach((client) => client.navigate(client.url)));
    } else if (ev.data.type === 'coepCredentialless') {
      coepCredentialless = ev.data.value;
    }
  });

  self.addEventListener('fetch', (event) => {
    const r = event.request;
    if (r.cache === 'only-if-cached' && r.mode !== 'same-origin') return;

    const request =
      coepCredentialless && r.mode === 'no-cors'
        ? new Request(r, { credentials: 'omit' })
        : r;

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 0) return response;
          const headers = new Headers(response.headers);
          headers.set(
            'Cross-Origin-Embedder-Policy',
            coepCredentialless ? 'credentialless' : 'require-corp',
          );
          if (!coepCredentialless) headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
          headers.set('Cross-Origin-Opener-Policy', 'same-origin');
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
        })
        .catch((e) => console.error(e)),
    );
  });
} else {
  // ---- Window context: register the worker, reload once to gain isolation ----
  (() => {
    const reloadedBySelf = window.sessionStorage.getItem('coiReloadedBySelf');
    window.sessionStorage.removeItem('coiReloadedBySelf');
    const coepDegrading = reloadedBySelf === 'coepdegrade';

    const coi = {
      shouldRegister: () => !reloadedBySelf,
      shouldDeregister: () => false,
      coepCredentialless: () => !(window.chrome !== undefined || window.netscape !== undefined),
      coepDegrade: () => true,
      doReload: () => window.location.reload(),
      quiet: false,
      ...window.coi,
    };

    const n = navigator;
    if (n.serviceWorker && n.serviceWorker.controller) {
      n.serviceWorker.controller.postMessage({
        type: 'coepCredentialless',
        value: coi.coepCredentialless(),
      });
      if (coi.shouldDeregister()) {
        n.serviceWorker.controller.postMessage({ type: 'deregister' });
      }
    }

    // If already cross-origin isolated, nothing to do.
    if (window.crossOriginIsolated !== false || !coi.shouldRegister()) return;

    if (!window.isSecureContext) {
      if (!coi.quiet) console.log('COOP/COEP Service Worker not registered: insecure context.');
      return;
    }

    if (n.serviceWorker) {
      n.serviceWorker.register(window.document.currentScript.src).then(
        (registration) => {
          if (!coi.quiet) console.log('COOP/COEP Service Worker registered', registration.scope);

          registration.addEventListener('updatefound', () => {
            if (!coi.quiet) console.log('Reloading page to make use of updated COOP/COEP Service Worker.');
            window.sessionStorage.setItem('coiReloadedBySelf', 'updatefound');
            coi.doReload();
          });

          // If the registration is active but it's not controlling the page, reload.
          if (registration.active && !n.serviceWorker.controller) {
            if (!coi.quiet) console.log('Reloading page to make use of COOP/COEP Service Worker.');
            window.sessionStorage.setItem('coiReloadedBySelf', 'notcontrolling');
            coi.doReload();
          }
        },
        (err) => {
          if (!coi.quiet) console.error('COOP/COEP Service Worker failed to register:', err);
        },
      );
    }
  })();
}

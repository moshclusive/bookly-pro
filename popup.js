// popup.js - Bookly Pro Complete Updated Version

// Safe Chrome API fallback for development, preview & standalone testing
(function initChromePolyfill() {
  if (typeof window.chrome === 'undefined') window.chrome = {};
  if (typeof window.chrome.storage === 'undefined') window.chrome.storage = {};
  if (typeof window.chrome.storage.local === 'undefined') {
    window.chrome.storage.local = {
      get(keys, callback) {
        const res = {};
        const keyList = Array.isArray(keys) ? keys : (typeof keys === 'string' ? [keys] : Object.keys(keys || {}));
        keyList.forEach(k => {
          try {
            const val = localStorage.getItem('bookly_' + k);
            if (val !== null) res[k] = JSON.parse(val);
            else if (typeof keys === 'object' && !Array.isArray(keys) && keys[k] !== undefined) res[k] = keys[k];
          } catch (_) {}
        });
        if (typeof callback === 'function') setTimeout(() => callback(res), 0);
      },
      set(items, callback) {
        if (items && typeof items === 'object') {
          Object.entries(items).forEach(([k, v]) => {
            try { localStorage.setItem('bookly_' + k, JSON.stringify(v)); } catch (_) {}
          });
        }
        if (typeof callback === 'function') setTimeout(() => callback && callback(), 0);
      },
      remove(keys, callback) {
        const keyList = Array.isArray(keys) ? keys : [keys];
        keyList.forEach(k => {
          try { localStorage.removeItem('bookly_' + k); } catch (_) {}
        });
        if (typeof callback === 'function') setTimeout(() => callback && callback(), 0);
      }
    };
  }
  if (typeof window.chrome.storage.onChanged === 'undefined') {
    window.chrome.storage.onChanged = {
      addListener() {},
      removeListener() {}
    };
  }
  if (typeof window.chrome.runtime === 'undefined') window.chrome.runtime = {};
  if (typeof window.chrome.runtime.getURL === 'undefined') window.chrome.runtime.getURL = path => path;
  if (typeof window.chrome.runtime.sendMessage === 'undefined') window.chrome.runtime.sendMessage = () => {};
  if (typeof window.chrome.runtime.onMessage === 'undefined') {
    window.chrome.runtime.onMessage = {
      addListener() {},
      removeListener() {}
    };
  }
  if (typeof window.chrome.tabs === 'undefined') {
    window.chrome.tabs = {
      create(opts, cb) { if (cb) cb(); },
      query(opts, cb) { if (cb) cb([]); },
      update(id, opts, cb) { if (cb) cb(); }
    };
  }


  
})();


document.addEventListener('DOMContentLoaded', () => {

  // Place the existing app-launcher DOM in the new bottom dock before references are bound.

  const appLauncherDockItem = document.getElementById('appLauncherDockItem');

  const dockAllAppsSlot = document.getElementById('dockAllAppsSlot');

  const appLauncherPopupElement = document.getElementById('appLauncherPopup');

  if (appLauncherDockItem && dockAllAppsSlot) dockAllAppsSlot.appendChild(appLauncherDockItem);

  // Keep the floating launcher at document level so its glass window is never clipped by dashboard stacking layers.

  if (appLauncherPopupElement) document.body.appendChild(appLauncherPopupElement);



  // ============================================

  // APP LAUNCHER - Default Apps & Icons

  // ============================================

  const APP_ICONS = {

    'google-search': `<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,

    'gmail': `<svg viewBox="0 0 24 24"><path fill="#EA4335" d="M5.5 20h-2C2.67 20 2 19.33 2 18.5v-13C2 4.67 2.67 4 3.5 4h2C6.33 4 7 4.67 7 5.5v13c0 .83-.67 1.5-1.5 1.5z"/><path fill="#FBBC05" d="M20.5 20h-2c-.83 0-1.5-.67-1.5-1.5v-13c0-.83.67-1.5 1.5-1.5h2c.83 0 1.5.67 1.5 1.5v13c0 .83-.67 1.5-1.5 1.5z"/><path fill="#34A853" d="M18.5 4h-13C4.67 4 4 4.67 4 5.5v.4l8 5.09 8-5.09v-.4c0-.83-.67-1.5-1.5-1.5z"/><path fill="#C5221F" d="M4 5.9V7l7.28 4.63c.44.28 1 .28 1.44 0L20 7V5.9l-8 5.09L4 5.9z"/><path fill="#4285F4" d="M4 7v11.5c0 .83.67 1.5 1.5 1.5H7V9.5L4 7zM17 20h1.5c.83 0 1.5-.67 1.5-1.5V7l-3 2.5V20z"/></svg>`,

    'drive': `<svg viewBox="0 0 24 24"><path fill="#0066DA" d="M4.5 20l3-5.2h13L17.5 20z"/><path fill="#00AC47" d="M8.7 3l-6.5 11.3 3 5.2L11.7 8.2z"/><path fill="#EA4335" d="M15.3 3H8.7l6.5 11.3h6.5z"/><path fill="#00832D" d="M8.7 3L2.2 14.3h6.5l3.3-5.65z"/><path fill="#2684FC" d="M15.3 3l6.5 11.3h-6.5z"/><path fill="#FFBA00" d="M17.5 20l-3-5.2H2.2L4.5 20z" opacity=".8"/></svg>`,

    'docs': `<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M14.727 6.727H14V0H4.91c-.905 0-1.637.732-1.637 1.636v20.728c0 .904.732 1.636 1.636 1.636h14.182c.904 0 1.636-.732 1.636-1.636V6.727h-6.001z"/><path fill="#F1F1F1" d="M14 0v6.727h6.727z"/><path fill="#FFF" d="M7.09 11.454h9.82v1.09H7.09zm0 3.273h9.82v1.09H7.09zm0 3.273h6.55v1.09H7.09z"/></svg>`,

    'sheets': `<svg viewBox="0 0 24 24"><path fill="#0F9D58" d="M14.727 6.727H14V0H4.91c-.905 0-1.637.732-1.637 1.636v20.728c0 .904.732 1.636 1.636 1.636h14.182c.904 0 1.636-.732 1.636-1.636V6.727h-6.001z"/><path fill="#D6E9D8" d="M14 0v6.727h6.727z"/><path fill="#FFF" d="M8.18 12v6h7.64v-6H8.18zm3.27 5.18H9v-1.63h2.45v1.63zm0-2.45H9v-1.64h2.45v1.64zm3.55 2.45h-2.73v-1.63H15v1.63zm0-2.45h-2.73v-1.64H15v1.64z"/></svg>`,

    'calendar': `<svg viewBox="0 0 24 24"><path fill="#FFF" d="M6 6h12v12H6z"/><path fill="#EA4335" d="M6 22h12c2.21 0 4-1.79 4-4V6h-4v12H6v4z"/><path fill="#4285F4" d="M18 2H6C3.79 2 2 3.79 2 6v12c0 2.21 1.79 4 4 4V6h12V2z"/><path fill="#34A853" d="M22 6c0-2.21-1.79-4-4-4v4h4z"/><path fill="#1E88E5" d="M14.5 13.5h-5v-3h5z"/><path fill="#FBBC04" d="M12 17l-2.5-2.5h5z"/></svg>`,

    'maps': `<svg viewBox="0 0 24 24"><path fill="#1A73E8" d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z"/><circle fill="#FFF" cx="12" cy="10" r="3"/></svg>`,

    'youtube': `<svg viewBox="0 0 24 24"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><path fill="#FFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,

    'translate': `<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>`,

    

    'outlook': `<svg viewBox="0 0 24 24"><path fill="#0078D4" d="M7.88 12.04q0 .45-.11.87-.1.42-.33.74-.22.32-.58.51-.37.19-.87.19t-.85-.19q-.35-.19-.57-.51-.22-.32-.33-.74-.1-.42-.1-.87 0-.51.1-.94.1-.44.33-.75.22-.32.58-.5.37-.18.86-.18.5 0 .87.18.36.18.58.5.22.31.33.75.1.43.1.94M24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.1.07.18.18.07.12.07.25zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.3 1.19-.83.48-.53.73-1.28.25-.75.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z"/></svg>`,

    'onedrive': `<svg viewBox="0 0 24 24"><path fill="#0364B8" d="M13.5 19.5l1.35-6.83-4.4-1.34-4.05.7L6 19.5z"/><path fill="#0078D4" d="M13.5 19.5l1.35-6.83 5.15-.5V19.5z"/><path fill="#1490DF" d="M20 12.17V4.5l-5.15.4-1.35 8.27z"/><path fill="#28A8EA" d="M20 4.5h-9.55L6 12.17l4.4 1.34L14.85 12z"/><path fill="#0364B8" d="M6 12.17V4.5h4.45L6 12.17z" opacity=".5"/></svg>`,

    'word': `<svg viewBox="0 0 24 24"><path fill="#2B579A" d="M14.727 6.727H14V0H4.91c-.905 0-1.637.732-1.637 1.636v20.728c0 .904.732 1.636 1.636 1.636h14.182c.904 0 1.636-.732 1.636-1.636V6.727h-6.001z"/><path fill="#B7CBE9" d="M14 0v6.727h6.727z"/><path fill="#FFF" d="M15.5 11h-7l-.5 2h1l1 5h1.5l1-4 1 4H15l1-5h1z"/></svg>`,

    'excel': `<svg viewBox="0 0 24 24"><path fill="#217346" d="M14.727 6.727H14V0H4.91c-.905 0-1.637.732-1.637 1.636v20.728c0 .904.732 1.636 1.636 1.636h14.182c.904 0 1.636-.732 1.636-1.636V6.727h-6.001z"/><path fill="#B3D3B7" d="M14 0v6.727h6.727z"/><path fill="#FFF" d="M8 11l2 3-2 3h1.5l1.5-2 1.5 2H14l-2-3 2-3h-1.5L11 13l-1.5-2z"/></svg>`,

    'powerpoint': `<svg viewBox="0 0 24 24"><path fill="#D24726" d="M14.727 6.727H14V0H4.91c-.905 0-1.637.732-1.637 1.636v20.728c0 .904.732 1.636 1.636 1.636h14.182c.904 0 1.636-.732 1.636-1.636V6.727h-6.001z"/><path fill="#F1BFB3" d="M14 0v6.727h6.727z"/><path fill="#FFF" d="M9 11v7h1.5v-2H12c1.66 0 2.5-.84 2.5-2.5S13.66 11 12 11H9zm1.5 1.3H12c.66 0 1 .34 1 1.2s-.34 1.2-1 1.2h-1.5v-2.4z"/></svg>`,

    'teams': `<svg viewBox="0 0 24 24"><path fill="#5059C9" d="M20.5 10h-4a1 1 0 0 0-1 1v3.5a4 4 0 0 0 4 4h.5a4 4 0 0 0 4-4V13a3 3 0 0 0-3-3z"/><circle fill="#5059C9" cx="18.5" cy="6.5" r="2.5"/><circle fill="#7B83EB" cx="12" cy="6" r="3.5"/><path fill="#7B83EB" d="M15.5 11h-7A1.5 1.5 0 0 0 7 12.5V16a5 5 0 0 0 10 0v-3.5a1.5 1.5 0 0 0-1.5-1.5z"/><path fill="#4B53BC" d="M12 20a5 5 0 0 1-5-5v-3.5A1.5 1.5 0 0 1 8.5 10h.5v6a3 3 0 0 0 3 3h.14A5 5 0 0 1 12 20z" opacity=".5"/></svg>`,

    

    'facebook': `<svg viewBox="0 0 24 24"><path fill="#1877F2" d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>`,

    'instagram': `<svg viewBox="0 0 24 24"><defs><linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFDC80"/><stop offset="25%" stop-color="#FCAF45"/><stop offset="50%" stop-color="#F77737"/><stop offset="75%" stop-color="#F56040"/><stop offset="100%" stop-color="#833AB4"/></linearGradient></defs><rect fill="url(#ig-grad)" x="2" y="2" width="20" height="20" rx="5"/><path fill="#FFF" d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.5-9a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/></svg>`,

    'messenger': `<svg viewBox="0 0 24 24"><defs><linearGradient id="msg-grad" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#0099FF"/><stop offset="100%" stop-color="#A033FF"/></linearGradient></defs><path fill="url(#msg-grad)" d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.14.26.35.27.57l.05 1.78a.8.8 0 0 0 1.12.71l1.98-.88c.17-.07.35-.09.53-.04.91.25 1.87.39 2.9.39 5.64 0 10-4.13 10-9.7S17.64 2 12 2z"/><path fill="#FFF" d="M5.99 14.53l2.94-4.66a1.5 1.5 0 0 1 2.17-.4l2.34 1.75c.21.16.5.16.71 0l3.16-2.4c.42-.32 1 .19.71.63l-2.94 4.66a1.5 1.5 0 0 1-2.17.4l-2.34-1.75a.6.6 0 0 0-.71 0l-3.16 2.4c-.42.32-1-.19-.71-.63z"/></svg>`,

    'whatsapp': `<svg viewBox="0 0 24 24"><path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`,

    'threads': `<svg viewBox="0 0 24 24"><path fill="#FFF" d="M17.55 11.15c-.09-.04-.18-.08-.27-.12-.16-2.95-1.77-4.64-4.48-4.65h-.04c-1.62 0-2.97.69-3.8 1.95l1.49 1.02c.62-.94 1.6-1.14 2.31-1.14h.03c.89 0 1.56.26 1.99.77.31.37.52.89.62 1.54-.75-.13-1.57-.17-2.44-.12-2.46.14-4.04 1.58-3.94 3.58.05 1.01.56 1.89 1.42 2.47.73.49 1.67.73 2.65.68 1.29-.07 2.31-.56 3.01-1.46.54-.68.88-1.56 1.03-2.67.63.38 1.09.88 1.35 1.48.44 1.02.47 2.7-.9 4.07-1.2 1.2-2.65 1.72-4.83 1.74-2.42-.02-4.25-.79-5.44-2.3-1.12-1.41-1.7-3.45-1.72-6.06.02-2.61.6-4.65 1.72-6.06 1.19-1.5 3.02-2.28 5.44-2.3 2.44.02 4.3.8 5.53 2.32.6.74 1.06 1.68 1.35 2.77l1.79-.48c-.36-1.34-.94-2.51-1.72-3.48C17.13 1.29 14.75.24 11.83.22h-.03C8.88.24 6.55 1.29 4.87 3.36 3.4 5.2 2.63 7.75 2.61 10.94v.06c.02 3.19.79 5.74 2.26 7.58 1.68 2.07 4.01 3.12 6.94 3.14h.03c2.6-.02 4.44-.7 5.95-2.21 1.98-1.98 1.92-4.46 1.27-5.98-.47-1.09-1.35-1.98-2.55-2.58zm-4.65 4.14c-1.08.06-2.21-.42-2.27-1.44-.04-.75.54-1.6 2.34-1.7l.5-.01c.65 0 1.26.06 1.81.19-.21 2.59-1.42 2.9-2.38 2.96z"/></svg>`,

    

    'default': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`

  };



  const DEFAULT_LAUNCHER_APPS = {

    google: [

      { id: 'g-search', name: 'Search', url: 'https://www.google.com', 

        customIcon: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png', enabled: true },

      { id: 'g-gmail', name: 'Gmail', url: 'https://mail.google.com', 

        customIcon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico', enabled: true },

      { id: 'g-drive', name: 'Drive', url: 'https://drive.google.com', 

        customIcon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png', enabled: true },

      { id: 'g-docs', name: 'Docs', url: 'https://docs.google.com/document/', 

        customIcon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon-2023q4.ico', enabled: true },

      { id: 'g-sheets', name: 'Sheets', url: 'https://docs.google.com/spreadsheets/', 

        customIcon: 'https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico', enabled: true },

      { id: 'g-slides', name: 'Slides', url: 'https://docs.google.com/presentation/', 

        customIcon: 'https://ssl.gstatic.com/docs/presentations/images/favicon5.ico', enabled: true },

      { id: 'g-calendar', name: 'Calendar', url: 'https://calendar.google.com', 

        customIcon: 'https://calendar.google.com/googlecalendar/images/favicons_2020q4/calendar_31.ico', enabled: true },

      { id: 'g-maps', name: 'Maps', url: 'https://maps.google.com', 

        customIcon: 'https://maps.gstatic.com/favicon3.ico', enabled: true },

      { id: 'g-youtube', name: 'YouTube', url: 'https://youtube.com', 

        customIcon: 'https://www.google.com/s2/favicons?sz=64&domain=youtube.com', enabled: true },

      { id: 'g-translate', name: 'Translate', url: 'https://translate.google.com', 

        customIcon: 'https://ssl.gstatic.com/translate/favicon.ico', enabled: true },

      { id: 'g-photos', name: 'Photos', url: 'https://photos.google.com', 

        customIcon: 'https://ssl.gstatic.com/social/photosui/images/logo/2x/photos_64dp.png', enabled: true },

      { id: 'g-keep', name: 'Keep', url: 'https://keep.google.com', 

        customIcon: 'https://ssl.gstatic.com/keep/icon_2020q4v2_128.png', enabled: true },

      { id: 'g-meet', name: 'Meet', url: 'https://meet.google.com', 

        customIcon: 'https://www.gstatic.com/meet/google_meet_horizontal_wordmark_2020q4_1x_icon_124_40_2373e79660dabbf194273d27aa7ee1f5.png', enabled: false }

    ],

    microsoft: [

      { id: 'm-outlook', name: 'Outlook', url: 'https://outlook.live.com', 

        customIcon: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/outlook_48x1.svg', enabled: true },

      { id: 'm-onedrive', name: 'OneDrive', url: 'https://onedrive.live.com', 

        customIcon: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/onedrive_48x1.svg', enabled: true },

      { id: 'm-word', name: 'Word', url: 'https://www.office.com/launch/word', 

        customIcon: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/word_48x1.svg', enabled: true },

      { id: 'm-excel', name: 'Excel', url: 'https://www.office.com/launch/excel', 

        customIcon: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/excel_48x1.svg', enabled: true },

      { id: 'm-ppt', name: 'PowerPoint', url: 'https://www.office.com/launch/powerpoint', 

        customIcon: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/powerpoint_48x1.svg', enabled: true },

      { id: 'm-teams', name: 'Teams', url: 'https://teams.microsoft.com', 

        customIcon: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/teams_48x1.svg', enabled: true },

      { id: 'm-onenote', name: 'OneNote', url: 'https://www.onenote.com', 

        customIcon: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/onenote_48x1.svg', enabled: false }

    ],

    meta: [

      { id: 'me-fb', name: 'Facebook', url: 'https://facebook.com', 

        customIcon: 'https://www.google.com/s2/favicons?sz=128&domain=facebook.com', enabled: true },

      { id: 'me-ig', name: 'Instagram', url: 'https://instagram.com', 

        customIcon: 'https://www.google.com/s2/favicons?sz=128&domain=instagram.com', enabled: true },

      { id: 'me-msg', name: 'Messenger', url: 'https://messenger.com', 

        customIcon: 'https://www.google.com/s2/favicons?sz=128&domain=messenger.com', enabled: true },

      { id: 'me-wa', name: 'WhatsApp', url: 'https://web.whatsapp.com', 

        customIcon: 'https://www.google.com/s2/favicons?sz=128&domain=whatsapp.com', enabled: true },

      { id: 'me-th', name: 'Threads', url: 'https://threads.net', 

        customIcon: 'https://www.google.com/s2/favicons?sz=128&domain=threads.net', enabled: true }

    ],

    custom: []

  };



  // --- Element Selections ---

  const getElementById = (id) => {

    const element = document.getElementById(id);

    if (!element) console.warn(`Bookly Pro: Element '${id}' not found.`);

    return element;

  };



  // Core Elements

  const sidebar = getElementById('sidebar');

  const collapseSidebarBtn = getElementById('collapseSidebarBtn');

  const toggleSidebarBtn = getElementById('toggleSidebarBtn');

  const sidebarFlyoutTrigger = getElementById('sidebarFlyoutTrigger');

  const sidebarFlyout = getElementById('sidebarFlyout');

  const flyoutSearchInput = getElementById('flyoutSearchInput');

  const flyoutFolderList = getElementById('flyoutFolderList');

  const contentPanel = getElementById('contentPanel');

  

  // Modal Elements

  const addLinkBtn = getElementById('addLinkBtn');

  const modalOverlay = getElementById('modalOverlay');

  const closeModalBtn = getElementById('closeModal');

  const linkFormElement = getElementById('linkForm');

  const linkInput = getElementById('link');

  const titleInput = getElementById('title');

  const folderInput = getElementById('folder');

  const keywordInput = getElementById('keyword-input');

  const addKeywordBtn = getElementById('add-keyword');

  const keywordsList = getElementById('keywords-list');

  const editIndexInput = getElementById('editIndex');

  const editFolderInput = getElementById('editFolder');

  const folderSuggestions = getElementById('folderSuggestions');

  const keywordSuggestions = getElementById('keywordSuggestions');

  const saveMessage = getElementById('saveMessage');

  const cancelBtn = getElementById('cancelBtn');

  const favoriteCheckbox = getElementById('favoriteCheckbox');

  const pinCheckbox = getElementById('pinCheckbox');

  const incognitoCheckbox = getElementById('incognitoCheckbox');

  const bookmarkNotes = getElementById('bookmarkNotes');

  const customFavicon = getElementById('customFavicon');

  const resetFavicon = getElementById('resetFavicon');

  const faviconPreview = getElementById('faviconPreview');

  const faviconPreviewImg = getElementById('faviconPreviewImg');

  

  // Search Elements

  const searchInput = getElementById('searchInput');

  const bookmarkSearchToggle = getElementById('bookmarkSearchToggle');

  const bookmarkSearchWrapper = getElementById('bookmarkSearchWrapper');

  const booleanSearchInput = getElementById('booleanSearchInput');

  const selectedSearchEngineBtn = getElementById('selectedSearchEngineBtn');

  const searchEngineDropdownList = getElementById('searchEngineDropdownList');

  

  // View Elements

  const linksContainer = getElementById('linksContainer');

  const selectedLinksContainer = getElementById('selectedLinks');

  const linksDisplayArea = getElementById('linksDisplayArea');

  const currentFolderNameElem = getElementById('currentFolderName');

  const breadcrumbHome = getElementById('breadcrumbHome');

  const viewModeBtn = getElementById('viewModeBtn');

  const cardSizeBtn = getElementById('cardSizeBtn');

  

  // Folder Elements

  const folderList = getElementById('folderList');

  const addFolderBtn = getElementById('addFolderBtn');

  const folderSearchInput = getElementById('folderSearchInput');

  const sortBtn = getElementById('sortBtn');

  

  // Quick Access Elements

  const addSiteBtn = document.getElementById('addSiteBtn');

  const addSiteModalOverlay = getElementById('addSiteModalOverlay');

  const closeAddSiteModalBtn = getElementById('closeAddSiteModal');

  const addSiteForm = getElementById('addSiteForm');

  const siteLinkInput = getElementById('siteLink');

  const siteTitleInput = getElementById('siteTitle');

  const siteSaveMessage = getElementById('siteSaveMessage');

  const quickAccessDiv = getElementById('quickAccess');

  const cancelSiteBtn = getElementById('cancelSiteBtn');

  const quickAccessModalTitle = getElementById('quickAccessModalTitle');

  const quickAccessSubmitBtn = getElementById('quickAccessSubmitBtn');

  const editQuickAccessIndex = getElementById('editQuickAccessIndex');

  const siteCustomFavicon = getElementById('siteCustomFavicon');

  const siteResetFavicon = getElementById('siteResetFavicon');

  const siteFaviconPreview = getElementById('siteFaviconPreview');

  const siteFaviconPreviewImg = getElementById('siteFaviconPreviewImg');

  

  // Favicon Modal Elements

  const faviconModalOverlay = getElementById('faviconModalOverlay');

  const closeFaviconModal = getElementById('closeFaviconModal');

  const faviconForm = getElementById('faviconForm');

  const faviconTargetType = getElementById('faviconTargetType');

  const faviconTargetFolder = getElementById('faviconTargetFolder');

  const faviconTargetIndex = getElementById('faviconTargetIndex');

  const newFaviconUrl = getElementById('newFaviconUrl');

  const newFaviconPreview = getElementById('newFaviconPreview');

  const newFaviconPreviewImg = getElementById('newFaviconPreviewImg');

  const cancelFaviconBtn = getElementById('cancelFaviconBtn');



  // Notes Modal Elements

  const notesModalOverlay = getElementById('notesModalOverlay');

  const closeNotesModal = getElementById('closeNotesModal');

  const notesForm = getElementById('notesForm');

  const notesTargetFolder = getElementById('notesTargetFolder');

  const notesTargetIndex = getElementById('notesTargetIndex');

  const notesContent = getElementById('notesContent');

  const cancelNotesBtn = getElementById('cancelNotesBtn');



  // Folder Icon Modal Elements

  const folderIconModalOverlay = getElementById('folderIconModalOverlay');

  const closeFolderIconModal = getElementById('closeFolderIconModal');

  const folderIconGrid = getElementById('folderIconGrid');

  const resetFolderIconBtn = getElementById('resetFolderIconBtn');



  // Bulk Actions Elements

  const bulkActions = getElementById('bulkActions');

  const bulkCount = getElementById('bulkCount');

  const bulkSelectBtn = getElementById('bulkSelectBtn');

  const bulkFavoriteBtn = getElementById('bulkFavoriteBtn');

  const bulkMoveBtn = getElementById('bulkMoveBtn');

  const bulkDeleteBtn = getElementById('bulkDeleteBtn');

  const bulkCancelBtn = getElementById('bulkCancelBtn');

  const bulkMoveModalOverlay = getElementById('bulkMoveModalOverlay');

  const closeBulkMoveModal = getElementById('closeBulkMoveModal');

  const bulkMoveFolderList = getElementById('bulkMoveFolderList');

  const checkBrokenLinksBtn = getElementById('checkBrokenLinksBtn');



  // Session Snapshot Elements

  const sessionSnapshotBtn = getElementById('sessionSnapshotBtn');

  const sessionSnapshotModalOverlay = getElementById('sessionSnapshotModalOverlay');

  const closeSessionSnapshotModal = getElementById('closeSessionSnapshotModal');

  const sessionSnapshotForm = getElementById('sessionSnapshotForm');

  const sessionFolderName = getElementById('sessionFolderName');

  const sessionTabCount = getElementById('sessionTabCount');

  const sessionTabPreview = getElementById('sessionTabPreview');

  const cancelSessionSnapshotBtn = getElementById('cancelSessionSnapshotBtn');



  // Edit Folder Modal Elements

  const editFolderModalOverlay = getElementById('editFolderModalOverlay');

  const closeEditFolderModal = getElementById('closeEditFolderModal');

  const editFolderForm = getElementById('editFolderForm');

  const editFolderPathInput = getElementById('editFolderPath');

  const editFolderColorPicker = getElementById('editFolderColorPicker');



  // Broken Links Modal Elements

  const brokenLinksModalOverlay = getElementById('brokenLinksModalOverlay');

  const closeBrokenLinksModal = getElementById('closeBrokenLinksModal');

  const brokenLinksList = getElementById('brokenLinksList');

  const brokenLinksCount = document.getElementById('brokenLinksCount');

  const recheckBrokenBtn = document.getElementById('recheckBrokenBtn');

  const fixAllBrokenBtn = document.getElementById('fixAllBrokenBtn');



  // Color Picker Menu

  const colorPickerMenu = getElementById('colorPickerMenu');

  const colorPickerGrid = getElementById('colorPickerGrid');

  

  // Context Menu Elements

  const bookmarkContextMenu = getElementById('bookmarkContextMenu');

  const folderContextMenu = getElementById('folderContextMenu');

  const quickAccessContextMenu = getElementById('quickAccessContextMenu');

  

  // Widget Elements

  const widgetBar = getElementById('widgetBar');

  const greetingWidget = getElementById('greetingWidget');

  const greetingText = getElementById('greetingText');

  const clockTime = getElementById('clockTime');

  const clockDate = getElementById('clockDate');

  const recentlyAddedContainer = document.getElementById('recentlyAddedContainer');

  const recentlyAddedList = document.getElementById('recentlyAddedList');

  const mostUsedContainer = document.getElementById('mostUsedContainer');

  const mostUsedList = document.getElementById('mostUsedList');

  const widgetTabs = document.querySelectorAll('.widget-tab');

  const widgetPanels = document.querySelectorAll('.widget-panel');

  const widgetContentArea = getElementById('widgetContentArea');

  const tabQuickAccess = getElementById('tabQuickAccess');

  const tabMostUsed = getElementById('tabMostUsed');

  const tabRecentlyAdded = getElementById('tabRecentlyAdded');

  const quickAccessPanel = getElementById('quickAccessPanel');

  const mostUsedPanel = getElementById('mostUsedPanel');

  const recentlyAddedPanel = getElementById('recentlyAddedPanel');

  const showWidgetPanelToggle = getElementById('showWidgetPanelToggle');



  // Settings Elements

  const settingsBtn = getElementById('settingsBtn');

  const settingsIcon = getElementById('settingsIcon');

  const settingsPanel = getElementById('settingsPanel');

  const closeSettingsPanel = getElementById('closeSettingsPanel');

  const redirectToggle = getElementById('redirectToggle');

  const hideLinksToggle = getElementById('hideLinksToggle');

  const hideAllToggle = getElementById('hideAllToggle');

  const confirmDelete = getElementById('confirmDelete');

  const openSameTab = getElementById('openSameTab');

  const showFavoritesOnly = getElementById('showFavoritesOnly');

  const showSubfolderContent = getElementById('showSubfolderContent');

  const showVisibilityToggle = getElementById('showVisibilityToggle');

  const showGreetingToggle = getElementById('showGreetingToggle');

  // Voice Search Elements

  const voiceSearchBtn = getElementById('voiceSearchBtn');

  // Wallpaper variables moved to initWallpaperSystem function

  // wallpaperBg removed - new system uses wallpaperBgContent & wallpaperBgFull

  const exportBtn = getElementById('exportBtn');

  const importFileSelect = getElementById('importFileSelect');

  const themeGrid = getElementById('themeGrid');

  

  // Settings Tabs

  const settingsTabs = document.querySelectorAll('.settings-tab');

  const tabPanes = document.querySelectorAll('.tab-pane');

  

  // --- State Variables ---

  let keywords = [];

  let selectedBookmarks = [];

  let quickAccessSites = [];

  let homeDockLinks = [];

  let quickAccessEditContext = 'quick';

  let folderOrder = [];

  let favoriteFolders = {};

  let folderIcons = {};

  let folderPasswords = {};

  let currentFolder = 'All Links';

  let selectedEngine = 'google';

  let hideLinksOnly = false;

  let hideAllContent = false;

  let confirmDeleteEnabled = true;

  let openLinksInSameTab = true;

  let showFavoritesOnlyEnabled = false;

  let showSubfolderContentEnabled = true;

  let showVisibilityToggleEnabled = true;

  let hiddenFolders = new Set(); // Folders hidden from "All Links"

  let sortOrder = 'usage';

  let currentContextTarget = null;

  let currentContextType = null;

  let pinnedFolders = [];

  let currentTheme = 'dark-default';

  let currentCardSize = 'medium';

  let currentViewMode = 'grid';

  let showGreeting = true;

  let showWidgetPanel = true;

  let activeWidgetTab = 'quickAccess';

  let isBulkSelectMode = false;

  let bulkSelectedItems = [];

  let currentFolderIconTarget = null;

  let customLinkOrder = {}; // Store custom order per folder: { folderName: [linkKeys] }

  let allLinksCustomOrder = []; // Custom order for "All Links" view

  let booleanSearchShortcuts = {}; // Custom boolean search shortcuts: { name: { trigger: '!', sites: ['example.com'] } }

  

  // App Launcher State

  let launcherApps = null;

  let launcherActiveProvider = 'google';
  let expandedFolders = new Set();

  let manageAppsActiveProvider = 'google';

  

  // App Launcher Elements

  const appLauncherBtn = document.getElementById('appLauncherBtn');

  const appLauncherPopup = document.getElementById('appLauncherPopup');

  const launcherGrid = document.getElementById('launcherGrid');

  const launcherSearchInput = document.getElementById('launcherSearchInput');

  const launcherManageBtn = document.getElementById('launcherManageBtn');

  const manageAppsModalOverlay = document.getElementById('manageAppsModalOverlay');

  const closeManageAppsModal = document.getElementById('closeManageAppsModal');

  const manageAppsList = document.getElementById('manageAppsList');

  const addCustomAppBtn = document.getElementById('addCustomAppBtn');

  const resetAppsBtn = document.getElementById('resetAppsBtn');

  const addAppModalOverlay = document.getElementById('addAppModalOverlay');

  const closeAddAppModal = document.getElementById('closeAddAppModal');

  const addAppForm = document.getElementById('addAppForm');

  const appName = document.getElementById('appName');

  const appUrl = document.getElementById('appUrl');

  const appIcon = document.getElementById('appIcon');

  const appProvider = document.getElementById('appProvider');

  const editAppProvider = document.getElementById('editAppProvider');

  const editAppIndex = document.getElementById('editAppIndex');

  const addAppModalTitle = document.getElementById('addAppModalTitle');

  const cancelAddAppBtn = document.getElementById('cancelAddAppBtn');



  // Drag & Drop State

  let draggedElement = null;

  let draggedData = null;

  let dragGhost = null;

  let dropIndicator = null;

  let isDragging = false;

  let currentDropTarget = null;

  let currentDropPosition = null;



  // --- Initial Load ---

  loadInitialData();



  function loadInitialData() {

    chrome.storage.local.get(

      ['quickAccess', 'redirectEnabled', 'selectedEngine', 'hideLinksOnly',

       'hideAllContent', 'confirmDelete', 'sidebarCollapsed', 'links',

       'sortOrder', 'openSameTab', 'folderOrder', 'pinnedFolders', 'favoriteFolders',

       'showFavoritesOnly', 'theme', 'cardSize', 'viewMode',

       'showGreeting', 'showWidgetPanel', 'activeWidgetTab', 'wpSettings',

       'folderIcons', 'folderPasswords', 'customLinkOrder', 'allLinksCustomOrder',

       'launcherApps', 'launcherActiveProvider', 'expandedFolders', 'showSubfolderContent',

       'showVisibilityToggle', 'hiddenFolders', 'booleanSearchShortcuts'],

      (res) => {

        quickAccessSites = res.quickAccess || [];

        folderOrder = res.folderOrder || [];

        pinnedFolders = res.pinnedFolders || [];

        favoriteFolders = res.favoriteFolders || {};

        folderIcons = res.folderIcons || {};

        folderPasswords = res.folderPasswords || {};

        customLinkOrder = res.customLinkOrder || {};

        allLinksCustomOrder = res.allLinksCustomOrder || [];

        launcherApps = res.launcherApps || JSON.parse(JSON.stringify(DEFAULT_LAUNCHER_APPS));

        launcherActiveProvider = res.launcherActiveProvider || 'google';

        expandedFolders = new Set(res.expandedFolders || []);

        const allowedSearchEngines = ['google', 'yandex', 'duckduckgo', 'bing'];

        selectedEngine = allowedSearchEngines.includes(res.selectedEngine) ? res.selectedEngine : 'google';

        if (res.selectedEngine !== selectedEngine) chrome.storage.local.set({ selectedEngine });

        hideLinksOnly = false; // Removed from Settings in 4.0.3

        hideAllContent = false; // Removed from Settings in 4.0.3

        chrome.storage.local.remove(['hideLinksOnly', 'hideAllContent']);

        confirmDeleteEnabled = res.confirmDelete !== false;

        openLinksInSameTab = res.openSameTab !== false;

        showFavoritesOnlyEnabled = false;

        showSubfolderContentEnabled = res.showSubfolderContent !== false;

        showVisibilityToggleEnabled = res.showVisibilityToggle !== false;

        hiddenFolders = new Set(res.hiddenFolders || []);

        sortOrder = res.sortOrder || 'usage';

        currentTheme = res.theme || 'midnight-pro';

        currentCardSize = res.cardSize || 'medium';

        currentViewMode = res.viewMode || 'grid';

        showGreeting = res.showGreeting !== false;

        showWidgetPanel = res.showWidgetPanel !== false;

        activeWidgetTab = res.activeWidgetTab || 'quickAccess';

        booleanSearchShortcuts = res.booleanSearchShortcuts || {};

        

        // Apply settings to toggles

        if (redirectToggle) redirectToggle.checked = res.redirectEnabled !== false;

        if (hideLinksToggle) hideLinksToggle.checked = hideLinksOnly;

        if (hideAllToggle) hideAllToggle.checked = hideAllContent;

        if (confirmDelete) confirmDelete.checked = confirmDeleteEnabled;

        if (openSameTab) openSameTab.checked = openLinksInSameTab;

        if (showFavoritesOnly) showFavoritesOnly.checked = showFavoritesOnlyEnabled;

        if (showSubfolderContent) showSubfolderContent.checked = showSubfolderContentEnabled;

        if (showVisibilityToggle) showVisibilityToggle.checked = showVisibilityToggleEnabled;

        

        // Apply visibility toggle class to body

        document.body.classList.toggle('show-visibility-toggle', showVisibilityToggleEnabled);

        if (showGreetingToggle) showGreetingToggle.checked = showGreeting;

        if (showWidgetPanelToggle) showWidgetPanelToggle.checked = showWidgetPanel;

        

        if (res.sidebarCollapsed) {

          sidebar?.classList.add('collapsed', 'sidebar-initial-hidden');

          toggleSidebarBtn?.classList.remove('hidden');

          document.body?.classList.add('sidebar-is-collapsed');

          // Remove initial hidden after a frame to prevent flash

          requestAnimationFrame(() => {

            requestAnimationFrame(() => {

              sidebar?.classList.remove('sidebar-initial-hidden');

            });

          });

        }

        

        // Apply theme

        applyTheme(currentTheme);

        applyCardSize(currentCardSize);

        applyViewMode(currentViewMode);

        

        // Apply wallpaper

        loadWallpaperSettings(res);

        

        updateSearchEngineDropdown();

        renderFolders();

        renderQuickAccess();

        displayLinksForCurrentFolder();

        applyHideContentState();

        

        // Initialize widgets

        initWidgets();

        renderRecentlyAdded();

        renderMostUsed();

        

        // Setup drop zone for Quick Access

        setupQuickAccessDropZone();

        

        // Initialize App Launcher

        initAppLauncher();

        

        // Initialize Wallpaper System

        initWallpaperSystem();

        

        // Initialize Backup & Sync System

        initBackupSync();

      }

    );

  }



  // ============================================

  // THEME SYSTEM

  // ============================================

  

  const themes = {

    'midnight-pro': {

      '--primary-color': '#3b82f6',

      '--primary-hover': '#2563eb',

      '--primary-light': 'rgba(59, 130, 246, 0.18)',

      '--dark-bg': '#0a0e1a',

      '--dark-bg-secondary': '#141824',

      '--dark-bg-tertiary': '#1e2333',

      '--dark-border': '#2a3142',

      '--dark-text': '#f1f5f9',

      '--dark-text-muted': '#94a3b8',

      '--shadow-glow': '0 0 24px rgba(59, 130, 246, 0.35)'

    },

    'royal-purple': {

      '--primary-color': '#a855f7',

      '--primary-hover': '#9333ea',

      '--primary-light': 'rgba(168, 85, 247, 0.18)',

      '--dark-bg': '#0f0819',

      '--dark-bg-secondary': '#1a1029',

      '--dark-bg-tertiary': '#241839',

      '--dark-border': '#3a2854',

      '--dark-text': '#f5f0fc',

      '--dark-text-muted': '#b8a3d9',

      '--shadow-glow': '0 0 24px rgba(168, 85, 247, 0.35)'

    },

    'ocean-depth': {

      '--primary-color': '#06b6d4',

      '--primary-hover': '#0891b2',

      '--primary-light': 'rgba(6, 182, 212, 0.18)',

      '--dark-bg': '#061520',

      '--dark-bg-secondary': '#0d2030',

      '--dark-bg-tertiary': '#153045',

      '--dark-border': '#1e4258',

      '--dark-text': '#ecfeff',

      '--dark-text-muted': '#a5d8e5',

      '--shadow-glow': '0 0 24px rgba(6, 182, 212, 0.35)'

    },

    'emerald-luxe': {

      '--primary-color': '#10b981',

      '--primary-hover': '#059669',

      '--primary-light': 'rgba(16, 185, 129, 0.18)',

      '--dark-bg': '#061810',

      '--dark-bg-secondary': '#0d2418',

      '--dark-bg-tertiary': '#153524',

      '--dark-border': '#1f4a34',

      '--dark-text': '#ecfdf5',

      '--dark-text-muted': '#a7d4bc',

      '--shadow-glow': '0 0 24px rgba(16, 185, 129, 0.35)'

    },

    'sunset-copper': {

      '--primary-color': '#f97316',

      '--primary-hover': '#ea580c',

      '--primary-light': 'rgba(249, 115, 22, 0.18)',

      '--dark-bg': '#1a0f08',

      '--dark-bg-secondary': '#251710',

      '--dark-bg-tertiary': '#332018',

      '--dark-border': '#4a3020',

      '--dark-text': '#fef3ec',

      '--dark-text-muted': '#d4b09a',

      '--shadow-glow': '0 0 24px rgba(249, 115, 22, 0.35)'

    },

    'rose-noir': {

      '--primary-color': '#f43f5e',

      '--primary-hover': '#e11d48',

      '--primary-light': 'rgba(244, 63, 94, 0.18)',

      '--dark-bg': '#150a10',

      '--dark-bg-secondary': '#20111a',

      '--dark-bg-tertiary': '#2d1826',

      '--dark-border': '#442238',

      '--dark-text': '#fef1f4',

      '--dark-text-muted': '#d4a5b5',

      '--shadow-glow': '0 0 24px rgba(244, 63, 94, 0.35)'

    },

    'cyber-teal': {

      '--primary-color': '#14b8a6',

      '--primary-hover': '#0d9488',

      '--primary-light': 'rgba(20, 184, 166, 0.18)',

      '--dark-bg': '#061715',

      '--dark-bg-secondary': '#0d221f',

      '--dark-bg-tertiary': '#15332e',

      '--dark-border': '#1f4a42',

      '--dark-text': '#ecfeff',

      '--dark-text-muted': '#a5d0ca',

      '--shadow-glow': '0 0 24px rgba(20, 184, 166, 0.35)'

    },

    'graphite-gold': {

      '--primary-color': '#eab308',

      '--primary-hover': '#ca8a04',

      '--primary-light': 'rgba(234, 179, 8, 0.18)',

      '--dark-bg': '#0d0d0d',

      '--dark-bg-secondary': '#171717',

      '--dark-bg-tertiary': '#242424',

      '--dark-border': '#3a3a3a',

      '--dark-text': '#fafaf5',

      '--dark-text-muted': '#c4b896',

      '--shadow-glow': '0 0 24px rgba(234, 179, 8, 0.35)'

    },

    'nordic-ice': {

      '--primary-color': '#38bdf8',

      '--primary-hover': '#0ea5e9',

      '--primary-light': 'rgba(56, 189, 248, 0.18)',

      '--dark-bg': '#0c1620',

      '--dark-bg-secondary': '#16232f',

      '--dark-bg-tertiary': '#213240',

      '--dark-border': '#324656',

      '--dark-text': '#f0f9ff',

      '--dark-text-muted': '#a4c9df',

      '--shadow-glow': '0 0 24px rgba(56, 189, 248, 0.35)'

    },

    'crimson-elite': {

      '--primary-color': '#ef4444',

      '--primary-hover': '#dc2626',

      '--primary-light': 'rgba(239, 68, 68, 0.18)',

      '--dark-bg': '#150808',

      '--dark-bg-secondary': '#210f0f',

      '--dark-bg-tertiary': '#2f1717',

      '--dark-border': '#4a2222',

      '--dark-text': '#fef2f2',

      '--dark-text-muted': '#d4a5a5',

      '--shadow-glow': '0 0 24px rgba(239, 68, 68, 0.35)'

    },

    'aurora-glass': {

      '--primary-color': '#55e5cc', '--primary-hover': '#26cdb5', '--primary-light': 'rgba(85,229,204,.18)',

      '--dark-bg': '#081b2c', '--dark-bg-secondary': '#10263b', '--dark-bg-tertiary': '#17364a', '--dark-border': '#285565',

      '--dark-text': '#f2fffd', '--dark-text-muted': '#a6d8d3', '--shadow-glow': '0 0 26px rgba(85,229,204,.30)'

    },

    'lavender-dusk': {

      '--primary-color': '#c4a5ff', '--primary-hover': '#a885f0', '--primary-light': 'rgba(196,165,255,.18)',

      '--dark-bg': '#171326', '--dark-bg-secondary': '#211c35', '--dark-bg-tertiary': '#302744', '--dark-border': '#4c4065',

      '--dark-text': '#faf6ff', '--dark-text-muted': '#cabbe6', '--shadow-glow': '0 0 26px rgba(196,165,255,.30)'

    },

    'arctic-rose': {

      '--primary-color': '#ff9dc2', '--primary-hover': '#f47eac', '--primary-light': 'rgba(255,157,194,.18)',

      '--dark-bg': '#101c2a', '--dark-bg-secondary': '#1a2939', '--dark-bg-tertiary': '#28384a', '--dark-border': '#4c5b6d',

      '--dark-text': '#fff8fb', '--dark-text-muted': '#d9c1cc', '--shadow-glow': '0 0 26px rgba(255,157,194,.30)'

    }

  };



  function applyTheme(themeName) {

    const theme = themes[themeName];

    if (!theme) return;

    

    currentTheme = themeName;

    const root = document.documentElement;

    

    Object.entries(theme).forEach(([property, value]) => {

      root.style.setProperty(property, value);

    });

    const accent = theme['--primary-color'] || '#14b8a6';

    root.style.setProperty('--bookly-glass-accent', accent);

    const hex = accent.replace('#', '');

    if (/^[0-9a-f]{6}$/i.test(hex)) {

      root.style.setProperty('--bookly-glass-accent-rgb', `${parseInt(hex.slice(0,2),16)},${parseInt(hex.slice(2,4),16)},${parseInt(hex.slice(4,6),16)}`);

    }

    // The selected color theme is authoritative; wallpaper sampling must not recolor the UI.

    root.style.setProperty('--bookly-wallpaper-accent', accent);

    const colorPickerMenuEl = document.getElementById('colorPickerMenu');

    if (colorPickerMenuEl && !colorPickerMenuEl.classList.contains('hidden')) {

      colorPickerMenuEl.style.borderColor = `color-mix(in srgb, ${accent} 36%, transparent)`;

    }

    // Update active theme card

    document.querySelectorAll('.theme-card').forEach(card => {

      card.classList.toggle('active', card.dataset.theme === themeName);

    });

    

    chrome.storage.local.set({ theme: themeName });

  }



  // Theme selection

  if (themeGrid) {

    themeGrid.addEventListener('click', (e) => {

      const card = e.target.closest('.theme-card');

      if (card) {

        applyTheme(card.dataset.theme);

      }

    });

  }



  // ============================================

  // VIEW MODE & CARD SIZE

  // ============================================

  

  function applyViewMode(mode) {

    currentViewMode = mode;

    if (linksContainer) {

      linksContainer.classList.remove('grid-view', 'list-view');

      linksContainer.classList.add(mode + '-view');

    }

    chrome.storage.local.set({ viewMode: mode });

  }



  function applyCardSize(size) {

    currentCardSize = size;

    if (linksContainer) {

      linksContainer.classList.remove('card-small', 'card-medium', 'card-large');

      linksContainer.classList.add('card-' + size);

    }

    chrome.storage.local.set({ cardSize: size });

  }



  if (viewModeBtn) {

    viewModeBtn.addEventListener('click', () => {

      const newMode = currentViewMode === 'grid' ? 'list' : 'grid';

      applyViewMode(newMode);

      showNotification(`Switched to ${newMode} view`, 'success');

    });

  }



  if (cardSizeBtn) {

    cardSizeBtn.addEventListener('click', () => {

      const sizes = ['small', 'medium', 'large'];

      const currentIdx = sizes.indexOf(currentCardSize);

      const nextSize = sizes[(currentIdx + 1) % sizes.length];

      applyCardSize(nextSize);

      showNotification(`Card size: ${nextSize}`, 'success');

    });

  }







  // ============================================

  // PREMIUM WALLPAPER SYSTEM

  // ============================================

  

  // Wallpaper Elements

  const wallpaperEnabled = document.getElementById('wallpaperEnabled');

  // wallpaperFullscreen removed

  const wallpaperUrl = document.getElementById('wallpaperUrl');

  const wallpaperOpacity = document.getElementById('wallpaperOpacity');

  const wallpaperBlur = document.getElementById('wallpaperBlur');

  const opacityValue = document.getElementById('opacityValue');

  const blurValue = document.getElementById('blurValue');

  const wallpaperBgContent = document.getElementById('wallpaperBgContent');

  // wallpaperBgFull removed - only content-only mode now

  const wpPreviewContainer = document.getElementById('wpPreviewContainer');

  const wpPreviewImg = document.getElementById('wpPreviewImg');

  const wpRemoveBtn = document.getElementById('wpRemoveBtn');

  const applyWpUrlBtn = document.getElementById('applyWpUrlBtn');

  const wpGalleryGrid = document.getElementById('wpGalleryGrid');

  const wpColorsGrid = document.getElementById('wpColorsGrid');

  const wallpaperFileInput = document.getElementById('wallpaperFileInput');

  const wpUploadArea = document.getElementById('wpUploadArea');

  const homeWallpaperVideo = document.getElementById('homeWallpaperVideo');

  const contentWallpaperVideo = document.getElementById('contentWallpaperVideo');

  let activeWallpaperVideoUrl = '';

  let wallpaperVideoDbPromise = null;



  function openWallpaperVideoDb() {

    if (wallpaperVideoDbPromise) return wallpaperVideoDbPromise;

    wallpaperVideoDbPromise = new Promise((resolve, reject) => {

      const request = indexedDB.open('BooklyWallpaperMedia', 1);

      request.onupgradeneeded = () => { const db = request.result; if (!db.objectStoreNames.contains('videos')) db.createObjectStore('videos', { keyPath: 'id' }); };

      request.onsuccess = () => resolve(request.result);

      request.onerror = () => reject(request.error || new Error('Could not open video storage'));

    });

    return wallpaperVideoDbPromise;

  }



  async function saveWallpaperVideoBlob(file) {

    const db = await openWallpaperVideoDb();

    const id = `video-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    await new Promise((resolve, reject) => {

      const tx = db.transaction('videos', 'readwrite');

      tx.objectStore('videos').put({ id, blob: file, name: file.name, type: file.type });

      tx.oncomplete = resolve;

      tx.onerror = () => reject(tx.error || new Error('Could not save video'));

      tx.onabort = () => reject(tx.error || new Error('Video save cancelled'));

    });

    return `indexeddb-video:${id}`;

  }



  async function getWallpaperVideoUrl(source) {

    if (!source) return '';

    if (!/^indexeddb-video:/i.test(source)) return source;

    const id = source.slice('indexeddb-video:'.length);

    const db = await openWallpaperVideoDb();

    const record = await new Promise((resolve, reject) => {

      const tx = db.transaction('videos', 'readonly');

      const request = tx.objectStore('videos').get(id);

      request.onsuccess = () => resolve(request.result || null);

      request.onerror = () => reject(request.error || new Error('Could not read saved video'));

    });

    if (!record?.blob) throw new Error('Saved video is missing');

    return URL.createObjectURL(record.blob);

  }



  function clearActiveWallpaperVideo() {

    [homeWallpaperVideo, contentWallpaperVideo].filter(Boolean).forEach(video => {

      video.pause();

      video.removeAttribute('src');

      video.load();

      video.style.display = 'none';

      delete video.dataset.booklySource;

      video.style.opacity = '';

      video.style.filter = '';

    });

    if (activeWallpaperVideoUrl && activeWallpaperVideoUrl.startsWith('blob:')) URL.revokeObjectURL(activeWallpaperVideoUrl);

    activeWallpaperVideoUrl = '';

  }



  

  // Wallpaper State

  let wpSettings = {

    enabled: false,

    source: '', // url, data:base64, or gradient

    opacity: 30,

    blur: 0

  };

  

  // Preset Gallery URLs (Unsplash - free to use)

  const WALLPAPER_GALLERY = [

    { name: 'Mountains', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' },

    { name: 'Ocean', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80' },

    { name: 'Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80' },

    { name: 'Night Sky', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80' },

    { name: 'Aurora', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80' },

    { name: 'City', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80' },

    { name: 'Desert', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1920&q=80' },

    { name: 'Lake', url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&q=80' },

    { name: 'Space', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80' },

    { name: 'Sunset', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80' },

    { name: 'Snow', url: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80' }

  ];

  

  const WALLPAPER_COLORS = [

    { name: 'Deep Blue', gradient: 'linear-gradient(135deg, #0c2340 0%, #1a4b8c 100%)' },

    { name: 'Purple Night', gradient: 'linear-gradient(135deg, #1a0533 0%, #4a1a7a 100%)' },

    { name: 'Ocean Green', gradient: 'linear-gradient(135deg, #0d3320 0%, #1a6b4a 100%)' },

    { name: 'Sunset', gradient: 'linear-gradient(135deg, #4a1a1a 0%, #8b4513 50%, #4a1a4a 100%)' },

    { name: 'Dark Rose', gradient: 'linear-gradient(135deg, #2d0a1a 0%, #6b1a3a 100%)' },

    { name: 'Charcoal', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },

    { name: 'Teal Dark', gradient: 'linear-gradient(135deg, #0a2a2a 0%, #1a5050 100%)' },

    { name: 'Gold Black', gradient: 'linear-gradient(135deg, #1a1a0a 0%, #3d3d00 100%)' },

    { name: 'Crimson', gradient: 'linear-gradient(135deg, #1a0000 0%, #5c0000 100%)' },

    { name: 'Midnight', gradient: 'linear-gradient(135deg, #020111 0%, #0a0a2e 50%, #16213e 100%)' },

    { name: 'Forest', gradient: 'linear-gradient(135deg, #0a1a0a 0%, #1a3a1a 50%, #0a2a1a 100%)' },

    { name: 'Slate', gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%)' }

  ];

  

  function initWallpaperSystem() {

    // Render Gallery

    if (wpGalleryGrid) {

      WALLPAPER_GALLERY.forEach((item) => {

        const el = document.createElement('div');

        el.className = 'wp-gallery-item';

        el.style.backgroundImage = `url(${item.url})`;

        el.title = item.name;

        if (wpSettings.source === item.url) el.classList.add('active');

        

        el.addEventListener('click', () => {

          setWallpaperSource(item.url, 'image');

          document.querySelectorAll('.wp-gallery-item').forEach(g => g.classList.remove('active'));

          document.querySelectorAll('.wp-color-item').forEach(c => c.classList.remove('active'));

          el.classList.add('active');

        });

        

        wpGalleryGrid.appendChild(el);

      });

    }

    

    // Render Colors

    if (wpColorsGrid) {

      WALLPAPER_COLORS.forEach((item) => {

        const el = document.createElement('div');

        el.className = 'wp-color-item';

        el.style.background = item.gradient;

        el.title = item.name;

        if (wpSettings.source === item.gradient) el.classList.add('active');

        

        el.addEventListener('click', () => {

          setWallpaperSource(item.gradient, 'gradient');

          document.querySelectorAll('.wp-gallery-item').forEach(g => g.classList.remove('active'));

          document.querySelectorAll('.wp-color-item').forEach(c => c.classList.remove('active'));

          el.classList.add('active');

        });

        

        wpColorsGrid.appendChild(el);

      });

    }

    

    // Source Tabs

    document.querySelectorAll('.wp-source-tab').forEach(tab => {

      tab.addEventListener('click', () => {

        document.querySelectorAll('.wp-source-tab').forEach(t => t.classList.remove('active'));

        document.querySelectorAll('.wp-source-panel').forEach(p => p.classList.remove('active'));

        tab.classList.add('active');

        const panel = document.getElementById(`wp${capitalize(tab.dataset.source)}Panel`);

        if (panel) panel.classList.add('active');

      });

    });

    

    // Enable toggle

    if (wallpaperEnabled) {

      wallpaperEnabled.addEventListener('change', () => {

        wpSettings.enabled = wallpaperEnabled.checked;

        saveAndApplyWallpaper();

      });

    }

      

    // Opacity slider

    if (wallpaperOpacity) {

      wallpaperOpacity.addEventListener('input', () => {

        wpSettings.opacity = parseInt(wallpaperOpacity.value);

        if (opacityValue) opacityValue.textContent = wpSettings.opacity + '%';

        saveAndApplyWallpaper();

      });

    }

    

    // Blur slider

    if (wallpaperBlur) {

      wallpaperBlur.addEventListener('input', () => {

        wpSettings.blur = parseInt(wallpaperBlur.value);

        if (blurValue) blurValue.textContent = wpSettings.blur + 'px';

        saveAndApplyWallpaper();

      });

    }

    

    // URL Apply button

    if (applyWpUrlBtn) {

      applyWpUrlBtn.addEventListener('click', () => {

        const url = wallpaperUrl?.value.trim();

        if (url) {

          let pathname = '';

          try { pathname = new URL(url).pathname.toLowerCase(); } catch (_) {}

          let parsedUrl = null;

          try { parsedUrl = new URL(url); } catch (_) {}

          const isPixabayVideoPage = parsedUrl && /(^|\.)pixabay\.com$/i.test(parsedUrl.hostname) && /\/videos\//i.test(parsedUrl.pathname);

          const mediaType = /\.(mp4|webm|ogv|ogg)$/i.test(pathname) ? 'video' : 'image';

          if (isPixabayVideoPage) {

            showNotification('This is a Pixabay video page, not a direct video file. Download the clip, then select it in Upload.', 'info');

          } else if (/^https?:\/\//i.test(url) || /^data:image\//i.test(url)) {

            setWallpaperSource(url, mediaType);

            document.querySelectorAll('.wp-gallery-item, .wp-color-item').forEach(i => i.classList.remove('active'));

          } else showNotification('Enter a direct image/video file URL. Pixabay page links must be downloaded and uploaded first.', 'error');

        } else {

          showNotification('Please enter a valid URL', 'error');

        }

      });

    }

    

    // Local images and videos are stored according to their size: data URL for small images, IndexedDB for large video blobs.

    const processWallpaperFile = async (file) => {

      if (!file) return;

      const isVideo = file.type.startsWith('video/');

      const limit = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;

      const allowedVideo = ['video/mp4', 'video/webm', 'video/ogg'].includes(file.type);

      if ((isVideo && !allowedVideo) || file.size > limit) {

        showNotification(isVideo ? 'Use MP4, WebM or OGG up to 100MB.' : 'Image too large! Maximum 5MB.', 'error');

        return;

      }

      try {

        if (isVideo) {

          const source = await saveWallpaperVideoBlob(file);

          setWallpaperSource(source, 'video');

        } else {

          const reader = new FileReader();

          reader.onload = ev => setWallpaperSource(ev.target.result, 'image');

          reader.onerror = () => showNotification('Could not read this image.', 'error');

          reader.readAsDataURL(file);

        }

        document.querySelectorAll('.wp-gallery-item, .wp-color-item').forEach(i => i.classList.remove('active'));

      } catch (error) {

        console.error('Wallpaper upload failed:', error);

        showNotification('Could not save this video. Try a smaller file or check browser storage.', 'error');

      }

    };

    if (wallpaperFileInput) {

      wallpaperFileInput.addEventListener('change', async e => {

        await processWallpaperFile(e.target.files[0]);

        e.target.value = '';

      });

    }

    if (wpUploadArea) {

      wpUploadArea.addEventListener('dragover', e => { e.preventDefault(); wpUploadArea.style.borderColor = 'var(--primary-color)'; });

      wpUploadArea.addEventListener('dragleave', () => { wpUploadArea.style.borderColor = ''; });

      wpUploadArea.addEventListener('drop', async e => {

        e.preventDefault();

        wpUploadArea.style.borderColor = '';

        await processWallpaperFile(e.dataTransfer.files[0]);

      });

    }



    // Remove button

    if (wpRemoveBtn) {

      wpRemoveBtn.addEventListener('click', () => {

        wpSettings.source = '';

        wpSettings.enabled = false;

        if (wallpaperEnabled) wallpaperEnabled.checked = false;

        saveAndApplyWallpaper();

        wpPreviewContainer?.classList.add('hidden');

        document.querySelectorAll('.wp-gallery-item, .wp-color-item').forEach(i => i.classList.remove('active'));

        showNotification('Wallpaper removed', 'success');

      });

    }

  }

  

  function capitalize(str) {

    return str.charAt(0).toUpperCase() + str.slice(1);

  }

  

  function setWallpaperSource(source, type) {

    wpSettings.source = source;

    wpSettings.sourceType = type;

    wpSettings.enabled = true;

    

    if (wallpaperEnabled) wallpaperEnabled.checked = true;

    

    // Show preview

    if (wpPreviewContainer && wpPreviewImg) {

      wpPreviewContainer.classList.remove('hidden');

      if (type === 'gradient') wpPreviewImg.style.backgroundImage = source;

      else if (type === 'video') wpPreviewImg.style.backgroundImage = 'linear-gradient(135deg,#102b40,#17233d)';

      else wpPreviewImg.style.backgroundImage = `url(${source})`;

      wpPreviewImg.dataset.mediaType = type;

    }

    

    saveAndApplyWallpaper();

  }

  

  function saveAndApplyWallpaper() {

    chrome.storage.local.set({ wpSettings }, () => {

      applyWallpaper();

    });

  }

  

  function applyWallpaperAccent(source, type) {

    // Wallpaper sampling is decorative only. The user's selected theme remains the

    // single source of truth for primary/app colors, even when a wallpaper is active.

    const root = document.documentElement;

    const applyColor = color => {

      if (!color) return;

      root.style.setProperty('--bookly-wallpaper-accent', color);

      let rgb = null;

      const match = String(color).match(/^#?([0-9a-f]{6})$/i);

      if (match) {

        const hex = match[1];

        rgb = [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];

      } else {

        const values = String(color).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);

        if (values) rgb = [Number(values[1]), Number(values[2]), Number(values[3])];

      }

      if (rgb) root.style.setProperty('--bookly-wallpaper-accent-rgb', rgb.join(','));

    };

    if (!wpSettings?.enabled || !source) {

      applyColor(themes[currentTheme]?.['--primary-color'] || '#3b82f6');

      return;

    }

    if (type === 'gradient') {

      const colors = String(source).match(/#[0-9a-f]{6}/ig);

      if (colors?.length) { applyColor(colors[Math.floor(colors.length / 2)]); return; }

      const rgb = String(source).match(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/i);

      if (rgb) { applyColor(rgb[0]); return; }

    }

    try {

      const image = new Image();

      image.onload = () => {

        try {

          const canvas = document.createElement('canvas');

          canvas.width = canvas.height = 24;

          const context = canvas.getContext('2d', { willReadFrequently: true });

          context.drawImage(image, 0, 0, 24, 24);

          const pixels = context.getImageData(0, 0, 24, 24).data;

          let best = null, bestScore = -1;

          for (let i = 0; i < pixels.length; i += 4) {

            const r = pixels[i], g = pixels[i+1], b = pixels[i+2], a = pixels[i+3];

            if (a < 180) continue;

            const max = Math.max(r,g,b), min = Math.min(r,g,b), sat = max === 0 ? 0 : (max-min)/max;

            const lum = .2126*r + .7152*g + .0722*b;

            if (sat < .28 || lum < 45 || lum > 220) continue;

            const score = sat * (1 - Math.abs(lum - 135) / 180);

            if (score > bestScore) { bestScore = score; best = [r,g,b]; }

          }

          if (best) applyColor('#' + best.map(v => Math.round(v).toString(16).padStart(2,'0')).join(''));

        } catch (_) { /* Cross-origin wallpaper; keep the selected theme unchanged. */ }

      };

      image.onerror = () => {};

      if (!/^data:/i.test(source)) image.crossOrigin = 'anonymous';

      image.src = source;

    } catch (_) { /* Keep the selected theme unchanged if sampling fails. */ }

  }



  function applyWallpaper() {

    document.body.classList.remove('wallpaper-active-content');

    if (wallpaperBgContent) wallpaperBgContent.style.display = 'none';

    const homeWallpaper = document.getElementById('homeWallpaperBg');

    if (!wpSettings.enabled || !wpSettings.source) {

      if (homeWallpaper) {
        homeWallpaper.style.setProperty('display', 'none', 'important');
        homeWallpaper.style.setProperty('background-image', 'none', 'important');
      }

      if (wallpaperBgContent) {
        wallpaperBgContent.style.setProperty('display', 'none', 'important');
        wallpaperBgContent.style.setProperty('background-image', 'none', 'important');
      }

      clearActiveWallpaperVideo();

      applyWallpaperAccent('', '');

      return;

    }



    applyWallpaperAccent(wpSettings.source, wpSettings.sourceType);

    const isVideo = wpSettings.sourceType === 'video';

    const opacityVal = Number(wpSettings.opacity !== undefined ? wpSettings.opacity : 100);

    const opacity = Math.max(0.0, Math.min(1.0, opacityVal / 100));

    const blur = Math.max(0, Number(wpSettings.blur || 0));

    const bgStyle = wpSettings.sourceType === 'gradient' ? wpSettings.source : (isVideo ? 'none' : `url("${wpSettings.source}")`);

    document.body.classList.add('wallpaper-active-content');

    if (wallpaperBgContent) {

      wallpaperBgContent.style.setProperty('background-image', bgStyle, 'important');

      wallpaperBgContent.style.setProperty('background-size', 'cover', 'important');

      wallpaperBgContent.style.setProperty('background-position', 'center center', 'important');

      wallpaperBgContent.style.setProperty('opacity', String(opacity), 'important');

      wallpaperBgContent.style.setProperty('filter', blur > 0 ? `blur(${blur}px)` : 'none', 'important');

      wallpaperBgContent.style.setProperty('display', 'block', 'important');

    }

    if (homeWallpaper) {

      homeWallpaper.style.setProperty('background-image', bgStyle, 'important');

      homeWallpaper.style.setProperty('background-size', 'cover', 'important');

      homeWallpaper.style.setProperty('background-position', 'center center', 'important');

      homeWallpaper.style.setProperty('opacity', String(opacity), 'important');

      homeWallpaper.style.setProperty('filter', blur > 0 ? `blur(${blur}px)` : 'none', 'important');

      homeWallpaper.style.setProperty('display', 'block', 'important');

    }

    if (isVideo && (homeWallpaperVideo || contentWallpaperVideo)) {

      const selectedSource = wpSettings.source;

      const videos = [homeWallpaperVideo, contentWallpaperVideo].filter(Boolean);

      if (videos.every(video => video.dataset.booklySource === selectedSource && (video.currentSrc || video.src))) {

        if (contentWallpaperVideo) { contentWallpaperVideo.style.opacity = String(opacity); contentWallpaperVideo.style.filter = blur > 0 ? `blur(${blur}px)` : 'none'; }

        return;

      }

      getWallpaperVideoUrl(selectedSource).then(videoUrl => {

        if (wpSettings.sourceType !== 'video' || wpSettings.source !== selectedSource) {

          if (videoUrl.startsWith('blob:')) URL.revokeObjectURL(videoUrl);

          return;

        }

        clearActiveWallpaperVideo();

        activeWallpaperVideoUrl = videoUrl;

        videos.forEach(video => {

          video.src = videoUrl;

          video.dataset.booklySource = selectedSource;

          video.style.display = 'block';

          video.style.opacity = video === contentWallpaperVideo ? String(opacity) : '1';

          video.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';

          const playPromise = video.play();

          if (playPromise?.catch) playPromise.catch(() => {});

        });

      }).catch(error => {

        console.error('Could not load wallpaper video:', error);

        showNotification('Could not play this wallpaper video. Try another MP4/WebM file.', 'error');

      });

    } else {

      clearActiveWallpaperVideo();

    }

  }



  function loadWallpaperSettings(res) {
    if (res.wpSettings) {
      wpSettings = res.wpSettings;
      if (typeof wpSettings.enabled === 'undefined') wpSettings.enabled = true;
      if (!wpSettings.source) wpSettings.source = 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80';
      if (typeof wpSettings.opacity === 'undefined') wpSettings.opacity = 100;
      if (typeof wpSettings.blur === 'undefined') wpSettings.blur = 0;
      if (wallpaperEnabled) wallpaperEnabled.checked = wpSettings.enabled;
      if (wallpaperOpacity) wallpaperOpacity.value = wpSettings.opacity;
      if (opacityValue) opacityValue.textContent = wpSettings.opacity + '%';
      if (wallpaperBlur) wallpaperBlur.value = wpSettings.blur;
      if (blurValue) blurValue.textContent = wpSettings.blur + 'px';
      applyWallpaper();
    } else {
      wpSettings = {
        enabled: true,
        source: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
        sourceType: 'gallery',
        opacity: 100,
        blur: 0
      };
      chrome.storage.local.set({ wpSettings });
      applyWallpaper();
    }
  }



  // ============================================

  // CLOCK & GREETING WIDGETS

  // ============================================

  

  function initWidgets() {

    updateClock();

    updateGreeting();

    setInterval(updateClock, 1000);

    

    applyWidgetVisibility();

  }



  function updateClock() {

    if (!clockTime || !clockDate) return;

    

    const now = new Date();

    const timeStr = now.toLocaleTimeString('en-US', { 

      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 

    });

    const dateStr = now.toLocaleDateString('en-US', { 

      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 

    });

    

    clockTime.textContent = timeStr;

    clockDate.textContent = dateStr;

  }



  function updateGreeting() {

    if (!greetingText) return;

    

    const hour = new Date().getHours();

    let iconSvg = '';

    let text = '';

    

    if (hour >= 5 && hour < 12) {

      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg>';

      text = 'Good Morning!';

    } else if (hour >= 12 && hour < 17) {

      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

      text = 'Good Afternoon!';

    } else if (hour >= 17 && hour < 21) {

      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><polyline points="16 6 12 10 8 6"/></svg>';

      text = 'Good Evening!';

    } else {

      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

      text = 'Good Night!';

    }

    

    greetingText.innerHTML = iconSvg + '<span>' + text + '</span>';

  }



  function applyWidgetVisibility() {

    const centeredGreeting = document.getElementById('homeGreeting');

    if (centeredGreeting) centeredGreeting.style.display = showGreeting ? 'block' : 'none';

    if (greetingWidget) greetingWidget.style.display = showGreeting ? 'flex' : 'none';

    if (widgetBar) widgetBar.style.display = 'flex';

    if (widgetContentArea) widgetContentArea.style.display = showWidgetPanel ? 'block' : 'none';

    

    // Apply active tab

    switchWidgetTab(activeWidgetTab);

  }

  

  function switchWidgetTab(tabName) {

    activeWidgetTab = tabName;

    

    // Update tab buttons

    document.querySelectorAll('.widget-tab').forEach(tab => {

      tab.classList.toggle('active', tab.dataset.tab === tabName);

    });

    

    // Update panels

    document.querySelectorAll('.widget-panel').forEach(panel => {

      panel.classList.remove('active');

    });

    

    const activePanel = document.getElementById(tabName + 'Panel');

    if (activePanel) activePanel.classList.add('active');

    

    // Save active tab

    chrome.storage.local.set({ activeWidgetTab: tabName });

  }

  

  // Widget tab click handlers

  document.querySelectorAll('.widget-tab').forEach(tab => {

    tab.addEventListener('click', () => {

      const tabName = tab.dataset.tab;

      switchWidgetTab(tabName);

    });

  });



  // Widget toggles



  if (showGreetingToggle) {

    showGreetingToggle.addEventListener('change', () => {

      showGreeting = showGreetingToggle.checked;

      chrome.storage.local.set({ showGreeting });

      applyWidgetVisibility();

    });

  }



  if (showWidgetPanelToggle) {

    showWidgetPanelToggle.addEventListener('change', () => {

      showWidgetPanel = showWidgetPanelToggle.checked;

      chrome.storage.local.set({ showWidgetPanel });

      applyWidgetVisibility();

    });

  }



  // ============================================

  // RECENTLY ADDED & MOST USED

  // ============================================

  

  function renderRecentlyAdded() {

    if (!recentlyAddedList) return;

    

    chrome.storage.local.get(['links'], (result) => {

      const allLinks = result.links || {};

      let allItems = [];

      

      Object.entries(allLinks).forEach(([folder, links]) => {

        if (isFolderOrParentHidden(folder)) return; // Skip hidden folders

        links.forEach((link, index) => {

          allItems.push({ ...link, folder, index });

        });

      });

      

      allItems.sort((a, b) => {

        const dateA = new Date(a.dateAdded || 0);

        const dateB = new Date(b.dateAdded || 0);

        return dateB - dateA;

      });

      

      const recent = allItems.slice(0, 8);

      

      recentlyAddedList.innerHTML = '';

      

      if (recent.length === 0) {

        recentlyAddedList.innerHTML = '<div class="no-items-msg">No recent bookmarks</div>';

        return;

      }

      

      recent.forEach(link => {

        const item = document.createElement('a');

        item.className = 'mini-link-item';

        item.href = link.link;

        item.title = link.title;

        

        const favicon = getFaviconUrl(link.link, link.customFavicon);

        

        item.innerHTML = `

          <img class="mini-favicon" src="${favicon}" alt="">

          <span class="mini-title">${link.title}</span>

        `;

        

        item.addEventListener('click', (e) => {

          e.preventDefault();

          openLink(link.link, false);

        });

        

        recentlyAddedList.appendChild(item);

      });

    });

  }



  function renderMostUsed() {

    if (!mostUsedList) return;

    

    chrome.storage.local.get(['links'], (result) => {

      const allLinks = result.links || {};

      let allItems = [];

      

      Object.entries(allLinks).forEach(([folder, links]) => {

        if (isFolderOrParentHidden(folder)) return; // Skip hidden folders

        links.forEach((link, index) => {

          if ((link.usage || 0) > 0) {

            allItems.push({ ...link, folder, index });

          }

        });

      });

      

      allItems.sort((a, b) => (b.usage || 0) - (a.usage || 0));

      

      const topUsed = allItems.slice(0, 8);

      

      mostUsedList.innerHTML = '';

      

      if (topUsed.length === 0) {

        mostUsedList.innerHTML = '<div class="no-items-msg">No usage data yet</div>';

        return;

      }

      

      topUsed.forEach(link => {

        const item = document.createElement('a');

        item.className = 'mini-link-item';

        item.href = link.link;

        item.title = `${link.title} (${link.usage} visits)`;

        

        const favicon = getFaviconUrl(link.link, link.customFavicon);

        

        item.innerHTML = `

          <img class="mini-favicon" src="${favicon}" alt="">

          <span class="mini-title">${link.title}</span>

          <span class="mini-usage">${link.usage}</span>

        `;

        

        item.addEventListener('click', (e) => {

          e.preventDefault();

          openLink(link.link, false);

        });

        

        mostUsedList.appendChild(item);

      });

    });

  }



  // ============================================

  // CUSTOM FAVICON MANAGEMENT

  // ============================================

  

  if (customFavicon) {

    customFavicon.addEventListener('input', () => {

      const url = customFavicon.value.trim();

      if (url) previewFavicon(url, faviconPreviewImg, faviconPreview);

      else faviconPreview?.classList.add('hidden');

    });

  }



  if (resetFavicon) {

    resetFavicon.addEventListener('click', () => {

      if (customFavicon) customFavicon.value = '';

      faviconPreview?.classList.add('hidden');

    });

  }



  if (siteCustomFavicon) {

    siteCustomFavicon.addEventListener('input', () => {

      const url = siteCustomFavicon.value.trim();

      if (url) previewFavicon(url, siteFaviconPreviewImg, siteFaviconPreview);

      else siteFaviconPreview?.classList.add('hidden');

    });

  }



  if (siteResetFavicon) {

    siteResetFavicon.addEventListener('click', () => {

      if (siteCustomFavicon) siteCustomFavicon.value = '';

      siteFaviconPreview?.classList.add('hidden');

    });

  }



  if (newFaviconUrl) {

    newFaviconUrl.addEventListener('input', () => {

      const url = newFaviconUrl.value.trim();

      if (url) previewFavicon(url, newFaviconPreviewImg, newFaviconPreview);

      else newFaviconPreview?.classList.add('hidden');

    });

  }



  function previewFavicon(url, imgElement, containerElement) {

    if (!imgElement || !containerElement) return;

    imgElement.onload = () => containerElement.classList.remove('hidden');

    imgElement.onerror = () => containerElement.classList.add('hidden');

    imgElement.src = url;

  }



  function getFaviconUrl(link, customFaviconUrl) {

    if (customFaviconUrl) return customFaviconUrl;

    try {

      const url = new URL(link);

      return `https://www.google.com/s2/favicons?sz=32&domain=${url.hostname}`;

    } catch (e) {

      return 'Assets/icon16.png';

    }

  }



  // ============================================

  // CONTEXT MENU MANAGEMENT

  // ============================================

  

  function showBookmarkContextMenu(e, linkData) {

    e.preventDefault();

    hideAllContextMenus();

    

    currentContextTarget = linkData;

    currentContextType = 'bookmark';

    

    if (bookmarkContextMenu) {

      const favoriteText = document.getElementById('favoriteText');

      if (favoriteText) favoriteText.textContent = linkData.favorite ? 'Remove from Favorites' : 'Add to Favorites';



      const pinText = document.getElementById('pinText');

      if (pinText) pinText.textContent = linkData.pinned ? 'Unpin Item' : 'Pin Item';



      const noteText = document.getElementById('noteText');

      if (noteText) noteText.textContent = linkData.notes ? 'Edit Note' : 'Add Note';

      

      positionContextMenu(bookmarkContextMenu, e);

      bookmarkContextMenu.classList.remove('hidden');

    }

  }



  function showFolderContextMenu(e, folderName) {

    e.preventDefault();

    hideAllContextMenus();

    

    if (folderName === 'All Links') return;

    

    currentContextTarget = folderName;

    currentContextType = 'folder';

    

    if (folderContextMenu) {

      const pinText = document.getElementById('pinFolderText');

      if (pinText) pinText.textContent = pinnedFolders.includes(folderName) ? 'Unpin Folder' : 'Pin Folder';



      positionContextMenu(folderContextMenu, e);

      folderContextMenu.classList.remove('hidden');

    }

  }



  function showQuickAccessContextMenu(e, site, index, source = 'quickaccess') {

    e.preventDefault();

    hideAllContextMenus();

    currentContextTarget = { site, index, source };

    currentContextType = source === 'dock' ? 'dock' : 'quickaccess';

    if (quickAccessContextMenu) {

      positionContextMenu(quickAccessContextMenu, e);

      quickAccessContextMenu.classList.remove('hidden');

    }

  }



  function openColorPickerMenu(e, folderName) {

    e.preventDefault();

    hideAllContextMenus();

    currentContextTarget = folderName;

    currentContextType = 'folder-favorite';

    if (colorPickerMenu) {

      renderColorPickerGrid();

      positionContextMenu(colorPickerMenu, e);

      colorPickerMenu.classList.remove('hidden');

    }

  }



  function positionContextMenu(menu, event) {

    const margin = 8;

    const x = Number.isFinite(event.clientX) ? event.clientX : 8;

    const y = Number.isFinite(event.clientY) ? event.clientY : 8;

    menu.style.left = `${Math.max(margin, x)}px`;

    menu.style.top = `${Math.max(margin, y)}px`;

    setTimeout(() => {

      const rect = menu.getBoundingClientRect();

      const left = Math.min(Math.max(margin, x), Math.max(margin, window.innerWidth - rect.width - margin));

      const top = Math.min(Math.max(margin, y), Math.max(margin, window.innerHeight - rect.height - margin));

      menu.style.left = `${left}px`;

      menu.style.top = `${top}px`;

    }, 0);

  }



  function hideAllContextMenus() {

    bookmarkContextMenu?.classList.add('hidden');

    folderContextMenu?.classList.add('hidden');

    quickAccessContextMenu?.classList.add('hidden');

    colorPickerMenu?.classList.add('hidden');

    currentContextTarget = null;

    currentContextType = null;

  }



  // ============================================

  // CONTEXT MENU ACTIONS

  // ============================================

  

  if (bookmarkContextMenu) {

    bookmarkContextMenu.addEventListener('click', (e) => {

      const action = e.target.closest('[data-action]')?.dataset.action;

      if (!action || !currentContextTarget) return;

      

      switch (action) {

        case 'open':

          openLink(currentContextTarget.link, false);

          break;

        case 'open-new-tab':

          openLink(currentContextTarget.link, true);

          break;

        case 'edit':

          openModal(currentContextTarget, currentContextTarget.folder, currentContextTarget.index);

          break;

        case 'change-favicon':

          openFaviconModal('bookmark', currentContextTarget.folder, currentContextTarget.index);

          break;

        case 'favorite':

          toggleFavorite(currentContextTarget.folder, currentContextTarget.index);

          break;

        case 'pin':

          togglePin(currentContextTarget.folder, currentContextTarget.index);

          break;

        case 'copy-link':

          copyToClipboard(currentContextTarget.link);

          break;

        case 'delete':

          if (confirmDeleteEnabled) {

            if (confirm(`Delete "${currentContextTarget.title}"?`)) {

              deleteLink(currentContextTarget.folder, currentContextTarget.index);

            }

          } else {

            deleteLink(currentContextTarget.folder, currentContextTarget.index);

          }

          break;

      }

      hideAllContextMenus();

    });

  }



  if (folderContextMenu) {

    folderContextMenu.addEventListener('click', (e) => {

      const action = e.target.closest('[data-action]')?.dataset.action;

      if (!action || !currentContextTarget) return;

      

      switch (action) {

        case 'open-all':

          openAllLinksInFolder(currentContextTarget);

          break;

        case 'open-favorite':

          openFavoriteLinksInFolder(currentContextTarget);

          break;

        case 'rename-folder':

          const newName = prompt(`Rename folder "${currentContextTarget}" to:`, currentContextTarget);

          if (newName?.trim() && newName !== currentContextTarget) renameFolder(currentContextTarget, newName.trim());

          break;

        case 'change-folder-icon':

          openFolderIconModal(currentContextTarget);

          break;

        case 'add-to-folder':

          currentFolder = currentContextTarget;

          openModal();

          break;

        case 'add-subfolder':

          // Open create folder modal with parent pre-filled

          parentFolderPathInput.value = currentContextTarget;

          document.getElementById('createFolderModalTitle').textContent = 'Create Subfolder in ' + getFolderName(currentContextTarget);

          newFolderNameInput.value = '';

          selectedFolderColor = '';

          document.querySelectorAll('.folder-color-option').forEach(btn => btn.classList.remove('selected'));

          document.querySelector('.folder-color-option[data-color=""]')?.classList.add('selected');

          createFolderModalOverlay?.classList.remove('hidden');

          setTimeout(() => newFolderNameInput?.focus(), 100);

          break;

        case 'move-to-root':

          if (!isRootFolder(currentContextTarget)) {

            const newRootPath = getFolderName(currentContextTarget);

            renameFolderToNewPath(currentContextTarget, newRootPath);

          } else {

            showNotification('Folder is already at root level', 'warning');

          }

          break;

        case 'pin-folder':

          togglePinFolder(currentContextTarget);

          break;

        case 'add-to-favorite-folder':

          openColorPickerMenu(e, currentContextTarget);

          return; // Don't hide menus yet

        case 'edit-folder':

          openEditFolderModal(currentContextTarget);

          break;



        case 'delete-folder':

          if (confirmDeleteEnabled) {

            if (confirm(`Delete folder "${currentContextTarget}" and all its links?`)) deleteFolder(currentContextTarget);

          } else {

            deleteFolder(currentContextTarget);

          }

          break;

      }

      hideAllContextMenus();

    });

  }



  const closeFolderColorPickerBtn = document.getElementById('closeFolderColorPickerBtn');

  if (closeFolderColorPickerBtn) closeFolderColorPickerBtn.addEventListener('click', (event) => {

    event.preventDefault();

    event.stopPropagation();

    hideAllContextMenus();

  });

  document.addEventListener('keydown', (event) => {

    if (event.key === 'Escape' && colorPickerMenu && !colorPickerMenu.classList.contains('hidden')) hideAllContextMenus();

  });



  if (colorPickerMenu) {

    colorPickerMenu.addEventListener('click', (e) => {

      const action = e.target.closest('[data-action]')?.dataset.action;

      const color = e.target.closest('[data-color]')?.dataset.color;



      e.stopPropagation();

      if (action === 'remove-favorite-folder' && currentContextTarget) {

        delete favoriteFolders[currentContextTarget];

        chrome.storage.local.set({ favoriteFolders }, () => {

          renderFolders();

          renderSavedBookmarks();

          showNotification('Folder color reset', 'success');

        });

      } else if (color && currentContextTarget) {

        favoriteFolders[currentContextTarget] = color;

        chrome.storage.local.set({ favoriteFolders }, () => {

          renderFolders();

          renderSavedBookmarks();

          showNotification('Folder color updated', 'success');

        });

      }

      // Keep the palette open so several shades can be compared; the user closes it explicitly.

    });

  }



  if (quickAccessContextMenu) {

    quickAccessContextMenu.addEventListener('click', (e) => {

      const action = e.target.closest('[data-action]')?.dataset.action;

      if (!action || !currentContextTarget) return;

      

      switch (action) {

        case 'open-quick':

          openLink(currentContextTarget.site.link, false);

          break;

        case 'open-quick-new-tab':

          openLink(currentContextTarget.site.link, true);

          break;

        case 'edit-quick':

          if (currentContextType === 'dock') openAddSiteModal(currentContextTarget.site, currentContextTarget.index, 'dock');

          else editQuickAccessSite(currentContextTarget.index);

          break;

        case 'change-quick-favicon':

          openFaviconModal(currentContextType === 'dock' ? 'dock' : 'quickaccess', null, currentContextTarget.index);

          break;

        case 'delete-quick': {

          const isDockLink = currentContextType === 'dock';

          const removeTarget = () => isDockLink ? deleteHomeDockLink(currentContextTarget.index) : deleteQuickAccessSite(currentContextTarget.index);

          const label = isDockLink ? 'bottom quick link' : 'quick access site';

          if (confirmDeleteEnabled) {

            if (confirm(`Delete this ${label}?`)) removeTarget();

          } else removeTarget();

          break;

        }

      }

      hideAllContextMenus();

    });

  }



  // ============================================

  // NOTES MODAL

  // ============================================

  

  function openNotesModal(folder, index) {

    notesModalOverlay?.classList.remove('hidden');

    if (notesTargetFolder) notesTargetFolder.value = folder;

    if (notesTargetIndex) notesTargetIndex.value = index;

    

    chrome.storage.local.get(['links'], (result) => {

      const links = result.links || {};

      const link = links[folder]?.[index];

      if (link && notesContent) {

        // notesContent is now contenteditable div, use innerHTML

        notesContent.innerHTML = link.notes || '';

      }

    });

  }



  if (closeNotesModal) closeNotesModal.addEventListener('click', () => notesModalOverlay?.classList.add('hidden'));

  if (cancelNotesBtn) cancelNotesBtn.addEventListener('click', () => notesModalOverlay?.classList.add('hidden'));



  if (notesForm) {

    notesForm.addEventListener('submit', (e) => {

      e.preventDefault();

      const folder = notesTargetFolder?.value;

      const index = parseInt(notesTargetIndex?.value || '-1');

      const notes = notesContent?.innerHTML.trim() || '';

      

      chrome.storage.local.get(['links'], (result) => {

        const links = result.links || {};

        if (links[folder]?.[index]) {

          links[folder][index].notes = notes;

          chrome.storage.local.set({ links }, () => {

            notesModalOverlay?.classList.add('hidden');

            displayLinksForCurrentFolder(searchInput?.value.trim());

            showNotification('Notes saved!');

          });

        }

      });

    });

  }



  // ============================================

  // FOLDER ICON CUSTOMIZATION

  // ============================================

  

  const folderEmojis = ['📁', '📂', '📌', '⭐', '❤️', '🔥', '💼', '📚', '🎨', '🎮', '🎵', '📷', '🛒', '💰', '🔧', '🌐', '📱', '💻', '🏠', '✈️', '🍔', '⚽', '🎬', '📝', '🔒', '👤', '🎯', '💡', '🚀', '🎁', '📦', '🗂️', '📊', '🔍', '💎', '🏆'];



  function openFolderIconModal(folderName) {

    currentFolderIconTarget = folderName;

    folderIconModalOverlay?.classList.remove('hidden');

    

    if (folderIconGrid) {

      folderIconGrid.innerHTML = '';

      folderEmojis.forEach(emoji => {

        const item = document.createElement('div');

        item.className = 'folder-icon-item';

        if (folderIcons[folderName] === emoji) item.classList.add('active');

        item.textContent = emoji;

        item.addEventListener('click', () => {

          folderIcons[folderName] = emoji;

          chrome.storage.local.set({ folderIcons }, () => {

            renderFolders();

            showNotification('Folder icon updated!', 'success');

            folderIconModalOverlay?.classList.add('hidden');

          });

        });

        folderIconGrid.appendChild(item);

      });

    }

  }



  if (closeFolderIconModal) closeFolderIconModal.addEventListener('click', () => folderIconModalOverlay?.classList.add('hidden'));

  

  if (resetFolderIconBtn) {

    resetFolderIconBtn.addEventListener('click', () => {

      if (currentFolderIconTarget) {

        delete folderIcons[currentFolderIconTarget];

        chrome.storage.local.set({ folderIcons }, () => {

          renderFolders();

          showNotification('Folder icon reset!', 'success');

          folderIconModalOverlay?.classList.add('hidden');

        });

      }

    });

  }



  // ============================================

  // FAVICON MODAL

  // ============================================

  

  function openFaviconModal(type, folder, index) {

    faviconModalOverlay?.classList.remove('hidden');

    if (faviconTargetType) faviconTargetType.value = type;

    if (faviconTargetFolder) faviconTargetFolder.value = folder || '';

    if (faviconTargetIndex) faviconTargetIndex.value = index;

    

    if (type === 'bookmark') {

      chrome.storage.local.get(['links'], (result) => {

        const link = result.links?.[folder]?.[index];

        if (link && newFaviconUrl) {

          newFaviconUrl.value = link.customFavicon || '';

          if (link.customFavicon) previewFavicon(link.customFavicon, newFaviconPreviewImg, newFaviconPreview);

        }

      });

    } else if (type === 'quickaccess' || type === 'dock') {

      const site = type === 'dock' ? homeDockLinks[index] : quickAccessSites[index];

      if (site && newFaviconUrl) {

        newFaviconUrl.value = site.customFavicon || '';

        if (site.customFavicon) previewFavicon(site.customFavicon, newFaviconPreviewImg, newFaviconPreview);

      }

    }

  }



  function closeFaviconModalFunc() {

    faviconModalOverlay?.classList.add('hidden');

    if (newFaviconUrl) newFaviconUrl.value = '';

    newFaviconPreview?.classList.add('hidden');

  }



  if (closeFaviconModal) closeFaviconModal.addEventListener('click', closeFaviconModalFunc);

  if (cancelFaviconBtn) cancelFaviconBtn.addEventListener('click', closeFaviconModalFunc);



  if (faviconForm) {

    faviconForm.addEventListener('submit', (e) => {

      e.preventDefault();

      const type = faviconTargetType?.value;

      const folder = faviconTargetFolder?.value;

      const index = parseInt(faviconTargetIndex?.value || '-1');

      const faviconUrl = newFaviconUrl?.value.trim();

      

      if (type === 'bookmark' && folder && index >= 0) {

        chrome.storage.local.get(['links'], (result) => {

          const links = result.links || {};

          if (links[folder]?.[index]) {

            if (faviconUrl) links[folder][index].customFavicon = faviconUrl;

            else delete links[folder][index].customFavicon;

            chrome.storage.local.set({ links }, () => {

              displayLinksForCurrentFolder();

              showNotification('Favicon updated!', 'success');

              closeFaviconModalFunc();

            });

          }

        });

      } else if ((type === 'quickaccess' || type === 'dock') && index >= 0) {

        const collection = type === 'dock' ? homeDockLinks : quickAccessSites;

        const item = collection[index];

        if (item) {

          if (faviconUrl) item.customFavicon = faviconUrl;

          else delete item.customFavicon;

          const storageKey = type === 'dock' ? 'homeDockLinks' : 'quickAccess';

          chrome.storage.local.set({ [storageKey]: collection }, () => {

            if (type === 'dock') renderHomeQuickLinks(); else renderQuickAccess();

            showNotification('Favicon updated!', 'success');

            closeFaviconModalFunc();

          });

        }

      }

    });

  }



  // ============================================

  // BULK ACTIONS SYSTEM

  // ============================================

  

  if (bulkSelectBtn) {

    bulkSelectBtn.addEventListener('click', () => {

      isBulkSelectMode = !isBulkSelectMode;

      bulkSelectedItems = [];

      bulkSelectBtn.classList.toggle('active', isBulkSelectMode);

      bulkActions?.classList.toggle('hidden', !isBulkSelectMode);

      updateBulkCount();

      displayLinksForCurrentFolder(searchInput?.value.trim());

      

      if (isBulkSelectMode) {

        showNotification('Bulk select mode enabled. Click bookmarks to select.', 'info');

      }

    });

  }



  if (bulkCancelBtn) {

    bulkCancelBtn.addEventListener('click', () => {

      isBulkSelectMode = false;

      bulkSelectedItems = [];

      bulkSelectBtn?.classList.remove('active');

      bulkActions?.classList.add('hidden');

      displayLinksForCurrentFolder(searchInput?.value.trim());

    });

  }



  if (bulkFavoriteBtn) {

    bulkFavoriteBtn.addEventListener('click', () => {

      if (bulkSelectedItems.length === 0) return;

      

      chrome.storage.local.get(['links'], (result) => {

        const links = result.links || {};

        bulkSelectedItems.forEach(item => {

          if (links[item.folder]?.[item.index]) {

            links[item.folder][item.index].favorite = !links[item.folder][item.index].favorite;

          }

        });

        chrome.storage.local.set({ links }, () => {

          showNotification(`${bulkSelectedItems.length} bookmarks updated!`, 'success');

          bulkSelectedItems = [];

          updateBulkCount();

          displayLinksForCurrentFolder(searchInput?.value.trim());

        });

      });

    });

  }



  if (bulkDeleteBtn) {

    bulkDeleteBtn.addEventListener('click', () => {

      if (bulkSelectedItems.length === 0) return;

      

      const msg = `Delete ${bulkSelectedItems.length} selected bookmark(s)?`;

      if (confirmDeleteEnabled && !confirm(msg)) return;

      

      chrome.storage.local.get(['links'], (result) => {

        const links = result.links || {};

        

        // Sort by index descending to avoid index shifting issues

        const sorted = [...bulkSelectedItems].sort((a, b) => b.index - a.index);

        

        sorted.forEach(item => {

          if (links[item.folder]) {

            links[item.folder].splice(item.index, 1);

            if (links[item.folder].length === 0) delete links[item.folder];

          }

        });

        

        chrome.storage.local.set({ links }, () => {

          showNotification(`${bulkSelectedItems.length} bookmarks deleted!`, 'success');

          bulkSelectedItems = [];

          updateBulkCount();

          renderFolders();

          displayLinksForCurrentFolder();

        });

      });

    });

  }



  if (bulkMoveBtn) {

    bulkMoveBtn.addEventListener('click', () => {

      if (bulkSelectedItems.length === 0) return;

      openBulkMoveModal();

    });

  }



  function openBulkMoveModal() {

    bulkMoveModalOverlay?.classList.remove('hidden');

    

    chrome.storage.local.get(['links'], (result) => {

      const links = result.links || {};

      if (!bulkMoveFolderList) return;

      

      bulkMoveFolderList.innerHTML = '';

      

      Object.keys(links).forEach(folder => {

        const item = document.createElement('div');

        item.className = 'bulk-move-folder-item';

        item.textContent = `📁 ${folder}`;

        item.addEventListener('click', () => {

          moveBulkSelectedTo(folder);

          bulkMoveModalOverlay?.classList.add('hidden');

        });

        bulkMoveFolderList.appendChild(item);

      });

      

      // Option to create new folder

      const newFolderItem = document.createElement('div');

      newFolderItem.className = 'bulk-move-folder-item new-folder';

      newFolderItem.textContent = '+ Create New Folder';

      newFolderItem.addEventListener('click', () => {

        const name = prompt('Enter new folder name:');

        if (name?.trim()) {

          moveBulkSelectedTo(name.trim());

          bulkMoveModalOverlay?.classList.add('hidden');

        }

      });

      bulkMoveFolderList.appendChild(newFolderItem);

    });

  }



  if (closeBulkMoveModal) closeBulkMoveModal.addEventListener('click', () => bulkMoveModalOverlay?.classList.add('hidden'));



  function moveBulkSelectedTo(targetFolder) {

    chrome.storage.local.get(['links'], (result) => {

      const links = result.links || {};

      if (!links[targetFolder]) links[targetFolder] = [];

      

      // Sort by index descending

      const sorted = [...bulkSelectedItems].sort((a, b) => b.index - a.index);

      

      sorted.forEach(item => {

        if (links[item.folder]?.[item.index]) {

          const [movedLink] = links[item.folder].splice(item.index, 1);

          links[targetFolder].push(movedLink);

          if (links[item.folder].length === 0) delete links[item.folder];

        }

      });

      

      chrome.storage.local.set({ links }, () => {

        showNotification(`${bulkSelectedItems.length} bookmarks moved to "${targetFolder}"!`, 'success');

        bulkSelectedItems = [];

        updateBulkCount();

        renderFolders();

        displayLinksForCurrentFolder();

      });

    });

  }



  function updateBulkCount() {

    if (bulkCount) bulkCount.textContent = `${bulkSelectedItems.length} selected`;

  }



  function toggleBulkSelect(folder, index, element) {

    const existingIdx = bulkSelectedItems.findIndex(i => i.folder === folder && i.index === index);

    

    if (existingIdx > -1) {

      bulkSelectedItems.splice(existingIdx, 1);

      element?.classList.remove('bulk-selected');

    } else {

      bulkSelectedItems.push({ folder, index });

      element?.classList.add('bulk-selected');

    }

    

    updateBulkCount();

  }



    // ============================================

  // APP LAUNCHER SYSTEM

  // ============================================

  

  function initAppLauncher() {

    if (!appLauncherBtn) return;

    

    // The single All Bookmarks dock button opens the unified bookmark browser.

    appLauncherBtn.title = 'All Bookmarks';

    appLauncherBtn.setAttribute('aria-label', 'All Bookmarks');

    appLauncherBtn.addEventListener('click', (e) => {

      e.preventDefault();

      e.stopPropagation();

      const isOpen = savedBookmarksOverlay && !savedBookmarksOverlay.classList.contains('hidden') && !savedBookmarksOverlay.classList.contains('is-closing');

      if (isOpen) {
        closeSavedBookmarksPopup();
      } else {
        if (typeof window.closeDailyFocusModal === 'function') window.closeDailyFocusModal();
        openSavedBookmarksPopup();
      }

    });



    // Close the unified browser when a click lands outside its window.

    document.addEventListener('click', (e) => {

      if (draggedData?.fromLauncher) return;

      const savedIsOpen = savedBookmarksOverlay && !savedBookmarksOverlay.classList.contains('hidden');

      // The All Bookmark window is intentionally persistent; outside clicks must not dismiss it.

      appLauncherPopup?.classList.add('hidden');

      if (!savedIsOpen) appLauncherBtn.classList.remove('active');

    });

    

    // Search apps across all launcher categories.

    if (launcherSearchInput) {

      launcherSearchInput.addEventListener('input', () => renderLauncherApps('all'));

      launcherSearchInput.addEventListener('keydown', (e) => {

        if (e.key === 'Escape') {

          launcherSearchInput.value = '';

          renderLauncherApps('all');

          launcherSearchInput.blur();

        }

      });

    }



    // Provider tabs remain available for legacy settings data, but the new popup groups apps by category.

    document.querySelectorAll('.launcher-tab').forEach(tab => {

      tab.addEventListener('click', (e) => {

        e.stopPropagation();

        const provider = tab.dataset.provider;

        switchLauncherProvider(provider);

      });

    });

    

    // Set initial active tab

    document.querySelectorAll('.launcher-tab').forEach(tab => {

      tab.classList.toggle('active', tab.dataset.provider === launcherActiveProvider);

    });

    

    // Manage Apps button

    if (launcherManageBtn) {

      launcherManageBtn.addEventListener('click', (e) => {

        e.stopPropagation();

        appLauncherPopup.classList.add('hidden');

        appLauncherBtn.classList.remove('active');

        openManageAppsModal();

      });

    }

    

    // Manage Apps Modal - close

    if (closeManageAppsModal) {

      closeManageAppsModal.addEventListener('click', () => {

        manageAppsModalOverlay.classList.add('hidden');

      });

    }

    

    // Manage Apps - Provider tabs

    document.querySelectorAll('.manage-tab').forEach(tab => {

      tab.addEventListener('click', () => {

        manageAppsActiveProvider = tab.dataset.provider;

        document.querySelectorAll('.manage-tab').forEach(t => 

          t.classList.toggle('active', t.dataset.provider === manageAppsActiveProvider));

        renderManageAppsList();

      });

    });

    

    // Add Custom App button

    if (addCustomAppBtn) {

      addCustomAppBtn.addEventListener('click', () => {

        openAddAppModal();

      });

    }

    

    // Reset apps

    if (resetAppsBtn) {

      resetAppsBtn.addEventListener('click', () => {

        if (confirm('Reset all apps to default? This will remove your customizations.')) {

          launcherApps = JSON.parse(JSON.stringify(DEFAULT_LAUNCHER_APPS));

          chrome.storage.local.set({ launcherApps }, () => {

            renderManageAppsList();

            renderLauncherApps(launcherActiveProvider);

            showNotification('Apps reset to default!', 'success');

          });

        }

      });

    }

    

    // Add App Modal

    if (closeAddAppModal) closeAddAppModal.addEventListener('click', () => addAppModalOverlay.classList.add('hidden'));

    if (cancelAddAppBtn) cancelAddAppBtn.addEventListener('click', () => addAppModalOverlay.classList.add('hidden'));

    

    if (addAppForm) {

      addAppForm.addEventListener('submit', (e) => {

        e.preventDefault();

        saveCustomApp();

      });

    }

  }

  

  function switchLauncherProvider(provider) {

    launcherActiveProvider = provider;

    document.querySelectorAll('.launcher-tab').forEach(tab => {

      tab.classList.toggle('active', tab.dataset.provider === provider);

    });

    renderLauncherApps(provider);

    chrome.storage.local.set({ launcherActiveProvider: provider });

  }

  

  function getLauncherAppCategory(app, providerKey) {

    const value = `${app?.name || ''} ${app?.url || ''}`.toLowerCase();

    const rules = [

      ['AI Tools', /chatgpt|openai|claude|gemini|perplexity|midjourney|dall.?e|copilot|generative.?ai/],

      ['Email & Calendar', /gmail|outlook|calendar|calendly|proton.?mail|mail\.google|yahoo\.com\/mail/],

      ['Communication', /slack|discord|whatsapp|messenger|telegram|teams\.microsoft|zoom\.us|meet\.google|webex|contacts?\.google/],

      ['Cloud Storage', /drive\.google|dropbox|onedrive|icloud|box\.com/],

      ['Notes & Docs', /google\.com\/(document|spreadsheets|presentation)|docs|word|excel|powerpoint|notion|obsidian|evernote|keep\.google|pages/],

      ['Social Media', /facebook|instagram|twitter|x\.com|linkedin|reddit|pinterest|threads|tiktok/],

      ['Search Engines', /google\.com$|google\.com\/search|bing|yandex|duckduckgo|brave\.com|search/],

      ['Maps & Navigation', /maps\.google|google\.com\/maps|waze|maps\.app|navigation/],

      ['Task Management', /todoist|trello|asana|clickup|monday\.com|ticktick|any\.do|things\.app|task/],

      ['Design & Creative', /figma|canva|adobe|behance|dribbble|freepik|vecteezy|shutterstock|dreamstime|creativ(e|)fabrica|graphicriver|illustrator|photoshop/],

      ['Entertainment', /youtube|music\.youtube|spotify|netflix|disneyplus|primevideo|twitch|play\.google/],

      ['Media & Photos', /photos\.google|googlephotos|gallery|image library/],

      ['Learning', /translate|coursera|udemy|khanacademy|wikipedia|wikimedia|duolingo|learning/],

      ['News & Reading', /news\.google|medium\.com|substack|feedly|kindle|pocket|bbc\.com|reuters\.com/],

      ['Analytics', /analytics|searchconsole|trends\.google|semrush|ahrefs|similarweb/],

      ['Finance & Payments', /paypal|payoneer|wise\.com|bank|finance|stripe\.com|wise\.com/],

      ['Shopping', /amazon\.|etsy\.|shopify|ebay\.|daraz\.|shopping/]

    ];

    for (const [category, matcher] of rules) {

      if (matcher.test(value)) return category;

    }

    return providerKey === 'custom' ? 'Custom Apps' : 'Other Apps';

  }



  function renderLauncherApps(provider = 'all') {

    if (!launcherGrid) return;



    const query = (launcherSearchInput?.value || '').trim().toLowerCase();

    const groupMap = new Map();

    let visibleTotal = 0;



    Object.entries(launcherApps || {}).forEach(([providerKey, providerApps]) => {

      (providerApps || []).forEach(app => {

        if (!app?.enabled) return;

        const category = getLauncherAppCategory(app, providerKey);

        const searchable = `${app.name || ''} ${app.url || ''} ${providerKey} ${category}`.toLowerCase();

        if (query && !searchable.includes(query)) return;

        if (!groupMap.has(category)) groupMap.set(category, []);

        groupMap.get(category).push({ app, providerKey });

      });

    });



    launcherGrid.innerHTML = '';

    const categoryOrder = [

      'Email & Calendar', 'Notes & Docs', 'Communication', 'AI Tools', 'Cloud Storage',

      'Social Media', 'Search Engines', 'Task Management', 'Maps & Navigation',

      'Design & Creative', 'Entertainment', 'Media & Photos', 'Learning', 'News & Reading', 'Analytics',

      'Finance & Payments', 'Shopping', 'Custom Apps', 'Other Apps'

    ];

    const orderedGroups = [...groupMap.entries()].sort((a, b) => {

      const aIndex = categoryOrder.indexOf(a[0]);

      const bIndex = categoryOrder.indexOf(b[0]);

      return (aIndex < 0 ? 999 : aIndex) - (bIndex < 0 ? 999 : bIndex) || a[0].localeCompare(b[0]);

    });



    orderedGroups.forEach(([categoryName, apps]) => {

      const section = document.createElement('section');

      section.className = 'launcher-group';

      const title = document.createElement('h3');

      title.className = 'launcher-group-title';

      title.textContent = categoryName;

      const grid = document.createElement('div');

      grid.className = 'launcher-group-grid';



      apps.forEach(({ app }) => {

        visibleTotal++;

        const appEl = document.createElement('a');

        appEl.className = 'launcher-app';

        appEl.href = app.url || '#';

        appEl.title = `${app.name || 'App'}

Click to open · Drag to add to Quick Links`;

        appEl.draggable = true;

        appEl.innerHTML = `<div class="launcher-app-icon">${getAppIconHtml(app)}</div><div class="launcher-app-name"></div>`;

        appEl.querySelector('.launcher-app-name').textContent = app.name || 'Untitled app';



        appEl.addEventListener('click', (e) => {

          e.preventDefault();

          if (!app.url) return;

          openLink(app.url, false);

          appLauncherPopup?.classList.add('hidden');

          appLauncherBtn?.classList.remove('active');

        });

        appEl.addEventListener('dragstart', (e) => {

          e.dataTransfer.effectAllowed = 'copy';

          const iconUrl = app.customIcon || getHighResFavicon(app.url);

          draggedData = { link: app.url, title: app.name, customFavicon: iconUrl, fromLauncher: true };

          e.dataTransfer.setData('text/plain', JSON.stringify(draggedData));

          setTimeout(() => appEl.classList.add('dragging'), 0);

        });

        appEl.addEventListener('dragend', () => {

          appEl.classList.remove('dragging');

          setTimeout(() => {

            if (draggedData?.fromLauncher) {

              appLauncherPopup?.classList.add('hidden');

              appLauncherBtn?.classList.remove('active');

            }

            draggedData = null;

          }, 100);

        });

        grid.appendChild(appEl);

      });

      section.append(title, grid);

      launcherGrid.appendChild(section);

    });



    if (!visibleTotal) {

      const empty = document.createElement('div');

      empty.className = 'launcher-no-apps';

      empty.textContent = query ? 'No apps match your search.' : 'No apps enabled. Open Manage Apps to add some.';

      launcherGrid.appendChild(empty);

    }

  }



  function getAppIconHtml(app) {

    // Priority 1: Custom icon URL (predefined or user-provided)

    if (app.customIcon) {

      return `<img src="${app.customIcon}" alt="${app.name}" onerror="this.onerror=null;this.src='${getHighResFavicon(app.url)}'">`;

    }

    // Priority 2: Auto-favicon from the site

    return `<img src="${getHighResFavicon(app.url)}" alt="${app.name}" onerror="this.onerror=null;this.src='${getFallbackFavicon(app.url)}'">`;

  }

  

  // Get high-resolution favicon (64px for crisp display)

  function getHighResFavicon(url) {

    try {

      const u = new URL(url);

      return `https://www.google.com/s2/favicons?sz=64&domain=${u.hostname}`;

    } catch (e) {

      return 'Assets/icon16.png';

    }

  }

  

  // Fallback: try DuckDuckGo's favicon service if Google's fails

  function getFallbackFavicon(url) {

    try {

      const u = new URL(url);

      return `https://icons.duckduckgo.com/ip3/${u.hostname}.ico`;

    } catch (e) {

      return 'Assets/icon16.png';

    }

  }

  

  function openManageAppsModal() {

    if (!manageAppsModalOverlay) return;

    manageAppsModalOverlay.classList.remove('hidden');

    manageAppsActiveProvider = launcherActiveProvider;

    document.querySelectorAll('.manage-tab').forEach(t => 

      t.classList.toggle('active', t.dataset.provider === manageAppsActiveProvider));

    renderManageAppsList();

  }

  

  function renderManageAppsList() {

    if (!manageAppsList) return;

    

    const apps = launcherApps[manageAppsActiveProvider] || [];

    manageAppsList.innerHTML = '';

    

    if (apps.length === 0) {

      manageAppsList.innerHTML = `<div class="launcher-no-apps">No apps in this category.<br>Click "Add Custom App" below.</div>`;

      return;

    }

    

    apps.forEach((app, index) => {

      const item = document.createElement('div');

      item.className = 'manage-app-item';

      

      const iconHtml = getAppIconHtml(app);

      const isCustomApp = app.id && app.id.startsWith('custom-');

      

      item.innerHTML = `

        <input type="checkbox" class="manage-app-toggle" ${app.enabled ? 'checked' : ''}>

        <div class="manage-app-icon">${iconHtml}</div>

        <div class="manage-app-info">

          <div class="manage-app-name">${app.name}</div>

          <div class="manage-app-url">${app.url}</div>

        </div>

        <div class="manage-app-actions">

          <button class="edit-app" title="Edit">✏️</button>

          ${isCustomApp ? '<button class="delete-app" title="Delete">🗑️</button>' : ''}

        </div>

      `;

      

      // Toggle enabled

      item.querySelector('.manage-app-toggle').addEventListener('change', (e) => {

        launcherApps[manageAppsActiveProvider][index].enabled = e.target.checked;

        chrome.storage.local.set({ launcherApps }, () => {

          renderLauncherApps(launcherActiveProvider);

        });

      });

      

      // Edit

      item.querySelector('.edit-app').addEventListener('click', () => {

        openAddAppModal(app, manageAppsActiveProvider, index);

      });

      

      // Delete (custom apps only)

      const deleteBtn = item.querySelector('.delete-app');

      if (deleteBtn) {

        deleteBtn.addEventListener('click', () => {

          if (confirm(`Delete "${app.name}"?`)) {

            launcherApps[manageAppsActiveProvider].splice(index, 1);

            chrome.storage.local.set({ launcherApps }, () => {

              renderManageAppsList();

              renderLauncherApps(launcherActiveProvider);

              showNotification('App deleted!', 'success');

            });

          }

        });

      }

      

      manageAppsList.appendChild(item);

    });

  }

  

  function openAddAppModal(app = null, provider = null, index = -1) {

    if (!addAppModalOverlay) return;

    addAppModalOverlay.classList.remove('hidden');

    addAppForm.reset();

    

    if (app) {

      addAppModalTitle.textContent = 'Edit App';

      appName.value = app.name;

      appUrl.value = app.url;

      appIcon.value = app.customIcon || '';

      appProvider.value = provider;

      editAppProvider.value = provider;

      editAppIndex.value = index;

    } else {

      addAppModalTitle.textContent = 'Add Custom App';

      appProvider.value = manageAppsActiveProvider;

      editAppProvider.value = '';

      editAppIndex.value = '';

    }

    

    setTimeout(() => appName.focus(), 100);

  }

  

  function saveCustomApp() {

    const name = appName.value.trim();

    let url = appUrl.value.trim();

    const iconUrl = appIcon.value.trim();

    const provider = appProvider.value;

    const isEdit = editAppIndex.value !== '';

    

    if (!name || !url) {

      showNotification('Name and URL required', 'error');

      return;

    }

    

    if (!/^(https?:\/\/)/i.test(url)) url = 'https://' + url;

    

    if (isEdit) {

      // Edit existing

      const oldProvider = editAppProvider.value;

      const oldIndex = parseInt(editAppIndex.value);

      const existingApp = launcherApps[oldProvider][oldIndex];

      

      const updatedApp = {

        ...existingApp,

        name,

        url,

        customIcon: iconUrl || undefined

      };

      

      if (!iconUrl) delete updatedApp.customIcon;

      

      // If provider changed, move it

      if (oldProvider !== provider) {

        launcherApps[oldProvider].splice(oldIndex, 1);

        launcherApps[provider].push(updatedApp);

      } else {

        launcherApps[provider][oldIndex] = updatedApp;

      }

    } else {

      // Add new

      const newApp = {

        id: 'custom-' + Date.now(),

        name,

        url,

        enabled: true

      };

      if (iconUrl) newApp.customIcon = iconUrl;

      

      if (!launcherApps[provider]) launcherApps[provider] = [];

      launcherApps[provider].push(newApp);

    }

    

    chrome.storage.local.set({ launcherApps }, () => {

      addAppModalOverlay.classList.add('hidden');

      renderManageAppsList();

      renderLauncherApps(launcherActiveProvider);

      showNotification(isEdit ? 'App updated!' : 'App added!', 'success');

    });

  }



    // ============================================

  // FIND DUPLICATES

  // ============================================

  

  const duplicatesModalOverlay = getElementById('duplicatesModalOverlay');

  const closeDuplicatesModal = getElementById('closeDuplicatesModal');

  const duplicatesContent = getElementById('duplicatesContent');

  

  if (closeDuplicatesModal) {

    closeDuplicatesModal.addEventListener('click', () => {

      duplicatesModalOverlay?.classList.add('hidden');

    });

  }

  

  function findAndShowDuplicates() {

    chrome.storage.local.get(['links'], (result) => {

      const allLinks = result.links || {};

      const urlMap = {};

      

      // Group by URL

      Object.entries(allLinks).forEach(([folder, folderLinks]) => {

        folderLinks.forEach((link, index) => {

          if (!urlMap[link.link]) {

            urlMap[link.link] = [];

          }

          urlMap[link.link].push({

            folder,

            index,

            title: link.title,

            customFavicon: link.customFavicon,

            link: link.link

          });

        });

      });

      

      // Filter only duplicates (2 or more)

      const duplicates = Object.entries(urlMap).filter(([url, items]) => items.length > 1);

      

      duplicatesModalOverlay?.classList.remove('hidden');

      

      if (!duplicatesContent) return;

      duplicatesContent.innerHTML = '';

      

      if (duplicates.length === 0) {

        duplicatesContent.innerHTML = '<div class="no-duplicates-msg">✅ No duplicate bookmarks found!</div>';

        return;

      }

      

      const summary = document.createElement('div');

      summary.style.cssText = 'font-size: 12px; color: var(--text-neutral-muted); margin-bottom: 12px;';

      summary.textContent = `Found ${duplicates.length} URL(s) with duplicates`;

      duplicatesContent.appendChild(summary);

      

      duplicates.forEach(([url, items]) => {

        const group = document.createElement('div');

        group.className = 'duplicate-group';

        

        const favicon = getFaviconUrl(url, items[0].customFavicon);

        

        const header = document.createElement('div');

        header.className = 'duplicate-group-header';

        header.innerHTML = `

          <img src="${favicon}" alt="">

          <span class="duplicate-group-title" title="${url}">${url}</span>

          <span class="duplicate-group-count">${items.length}x</span>

        `;

        group.appendChild(header);

        

        items.forEach(item => {

          const itemDiv = document.createElement('div');

          itemDiv.className = 'duplicate-item';

          itemDiv.innerHTML = `

            <span class="duplicate-item-folder">📁 ${item.folder}</span>

            <span class="duplicate-item-title">${item.title}</span>

            <button class="duplicate-item-delete" title="Delete this copy">🗑️</button>

          `;

          

          itemDiv.querySelector('.duplicate-item-delete').addEventListener('click', () => {

            if (confirm(`Delete "${item.title}" from "${item.folder}"?`)) {

              deleteLink(item.folder, item.index);

              // Refresh duplicates modal

              setTimeout(() => findAndShowDuplicates(), 300);

            }

          });

          

          group.appendChild(itemDiv);

        });

        

        duplicatesContent.appendChild(group);

      });

    });

  }



  // ============================================

  // BROKEN LINK CHECKER

  // ============================================

  

  if (checkBrokenLinksBtn) {

    checkBrokenLinksBtn.addEventListener('click', () => {

      openBrokenLinksModal();

    });

  }



  if (closeBrokenLinksModal) closeBrokenLinksModal.addEventListener('click', () => brokenLinksModalOverlay?.classList.add('hidden'));

  if (brokenLinksModalOverlay) {

    brokenLinksModalOverlay.addEventListener('click', (e) => {

      if (e.target === brokenLinksModalOverlay) brokenLinksModalOverlay.classList.add('hidden');

    });

  }

  

  let brokenLinksData = [];

  

  function openBrokenLinksModal() {

    if (!brokenLinksModalOverlay) return;

    brokenLinksModalOverlay.classList.remove('hidden');

    checkAllBrokenLinks();

  }

  

  function checkAllBrokenLinks() {

    chrome.storage.local.get(['links'], (result) => {

      const allLinks = result.links || {};

      brokenLinksData = [];

      let linksToCheck = [];

      

      const folder = currentFolder === 'All Links' ? null : currentFolder;

      

      if (folder && allLinks[folder]) {

        allLinks[folder].forEach((link, index) => {

          if (link.link && link.link.startsWith('http')) {

            linksToCheck.push({ folder, index, link: link.link, title: link.title });

          }

        });

      } else {

        Object.entries(allLinks).forEach(([f, links]) => {

          links.forEach((link, index) => {

            if (link.link && link.link.startsWith('http')) {

              linksToCheck.push({ folder: f, index, link: link.link, title: link.title });

            }

          });

        });

      }

      

      if (linksToCheck.length === 0) {

        if (brokenLinksCount) brokenLinksCount.textContent = 'No links to check';

        if (brokenLinksList) brokenLinksList.innerHTML = '<div class="no-links-message">No links found</div>';

        return;

      }

      

      if (brokenLinksCount) brokenLinksCount.textContent = `Checking 0/${linksToCheck.length} links...`;

      if (brokenLinksList) brokenLinksList.innerHTML = '<div class="no-links-message"><div class="spinner"></div>Checking links, please wait...</div>';

      

      let checkedCount = 0;

      let brokenResults = [];

      

      const checkLink = (item) => {

        return new Promise((resolve) => {

          const controller = new AbortController();

          const timeout = setTimeout(() => controller.abort(), 8000);

          

          fetch(item.link, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })

            .then(() => {

              clearTimeout(timeout);

              // For no-cors, opaque response means the server exists

              resolve({ ...item, broken: false });

            })

            .catch((err) => {

              clearTimeout(timeout);

              // Network error = DNS failure, server down, or timeout

              resolve({ ...item, broken: true, reason: err.name === 'AbortError' ? 'Timeout' : 'Network Error' });

            });

        });

      };

      

      // Check links in batches of 5 to avoid overwhelming the browser

      const batchSize = 5;

      const checkBatch = async (startIndex) => {

        const batch = linksToCheck.slice(startIndex, startIndex + batchSize);

        if (batch.length === 0) {

          // All done

          brokenLinksData = brokenResults;

          // Save to cache

          chrome.storage.local.set({ brokenLinksCache: brokenResults.reduce((acc, item) => {

            acc[`${item.folder}_${item.index}`] = item;

            return acc;

          }, {}) });

          renderBrokenLinksList();

          return;

        }

        

        const results = await Promise.all(batch.map(checkLink));

        results.forEach(r => {

          if (r.broken) brokenResults.push(r);

        });

        checkedCount += batch.length;

        if (brokenLinksCount) brokenLinksCount.textContent = `Checking ${checkedCount}/${linksToCheck.length} links...`;

        

        // Process next batch

        checkBatch(startIndex + batchSize);

      };

      

      checkBatch(0);

    });

  }

  

  let brokenLinksListenerAdded = false;



  function renderBrokenLinksList() {

    if (brokenLinksCount) brokenLinksCount.textContent = `${brokenLinksData.length} broken link(s) found`;

    if (!brokenLinksList) return;

    brokenLinksList.innerHTML = '';

    

    if (brokenLinksData.length === 0) {

      brokenLinksList.innerHTML = '<div class="no-links-message">All links are working!</div>';

      return;

    }

    

    brokenLinksData.forEach((item, i) => {

      const div = document.createElement('div');

      div.className = 'broken-link-item';

      

      div.innerHTML = `

        <div class="broken-link-info">

          <div class="broken-link-title">${item.title || 'Untitled'}</div>

          <div class="broken-link-url">${item.link}</div>

          <div class="broken-link-folder">${item.folder}${item.reason ? ' · ' + item.reason : ''}</div>

        </div>

        <input type="text" class="broken-link-url-input" value="${item.link}" data-folder="${item.folder}" data-index="${item.index}" data-idx="${i}" placeholder="Enter new URL..." />

        <div class="broken-link-actions">

          <button class="btn-primary btn-sm" data-action="update" data-idx="${i}">Update</button>

          <button class="btn-secondary btn-sm" data-action="delete" data-idx="${i}">Delete</button>

        </div>

      `;

      

      brokenLinksList.appendChild(div);

    });

    

    // Event delegation for broken links list - only add once

    if (!brokenLinksListenerAdded) {

      brokenLinksList.addEventListener('click', handleBrokenLinksClick);

      brokenLinksListenerAdded = true;

    }

  }

  

  function handleBrokenLinksClick(e) {

    const updateBtn = e.target.closest('[data-action="update"]');

    const deleteBtn = e.target.closest('[data-action="delete"]');

    if (updateBtn) {

      const idx = parseInt(updateBtn.dataset.idx);

      const input = brokenLinksList.querySelector(`.broken-link-url-input[data-idx="${idx}"]`);

      const item = brokenLinksData[idx];

      if (!item || !input) return;

      

      const newUrl = input.value.trim();

      if (!newUrl) return;

      

      chrome.storage.local.get(['links'], (result) => {

        const links = result.links || {};

        if (links[item.folder]?.[item.index]) {

          links[item.folder][item.index].link = newUrl;

          chrome.storage.local.set({ links }, () => {

            brokenLinksData.splice(idx, 1);

            renderBrokenLinksList();

            displayLinksForCurrentFolder(searchInput?.value.trim());

            showNotification('Link updated successfully!');

          });

        }

      });

    }

    

    if (deleteBtn) {

      const idx = parseInt(deleteBtn.dataset.idx);

      const item = brokenLinksData[idx];

      if (!item) return;

      

      if (confirmDeleteEnabled) {

        if (!confirm(`Delete "${item.title}"?`)) return;

      }

      

      chrome.storage.local.get(['links'], (result) => {

        const links = result.links || {};

        if (links[item.folder]) {

          links[item.folder].splice(item.index, 1);

          chrome.storage.local.set({ links }, () => {

            brokenLinksData.splice(idx, 1);

            renderBrokenLinksList();

            renderFolders();

            displayLinksForCurrentFolder(searchInput?.value.trim());

            showNotification('Link deleted!');

          });

        }

      });

    }

    

  }

  

  if (recheckBrokenBtn) {

    recheckBrokenBtn.addEventListener('click', () => checkAllBrokenLinks());

  }

  

  if (fixAllBrokenBtn) {

    fixAllBrokenBtn.addEventListener('click', () => {

      if (brokenLinksData.length === 0) {

        showNotification('No broken links to update', 'warning');

        return;

      }

      

      const inputs = brokenLinksList.querySelectorAll('.broken-link-url-input');

      let updateCount = 0;

      

      inputs.forEach((input, i) => {

        const item = brokenLinksData[i];

        if (!item) return;

        const newUrl = input.value.trim();

        if (newUrl && newUrl !== item.link) {

          updateCount++;

        }

      });

      

      if (updateCount === 0) {

        showNotification('No URL changes detected', 'warning');

        return;

      }

      

      chrome.storage.local.get(['links'], (result) => {

        const links = result.links || {};

        inputs.forEach((input, i) => {

          const item = brokenLinksData[i];

          if (!item) return;

          const newUrl = input.value.trim();

          if (newUrl && links[item.folder]?.[item.index]) {

            links[item.folder][item.index].link = newUrl;

          }

        });

        

        chrome.storage.local.set({ links }, () => {

          brokenLinksData = [];

          renderBrokenLinksList();

          displayLinksForCurrentFolder(searchInput?.value.trim());

          renderFolders();

          showNotification(`Updated ${updateCount} link(s) successfully!`);

        });

      });

    });

  }



  // ============================================

  // SESSION SNAPSHOT

  // ============================================



  if (sessionSnapshotBtn) {

    sessionSnapshotBtn.addEventListener('click', () => {

      chrome.tabs.query({ currentWindow: true }, (tabs) => {

        if (!sessionSnapshotModalOverlay) return;

        sessionSnapshotModalOverlay.classList.remove('hidden');



        // Show tab count

        if (sessionTabCount) sessionTabCount.textContent = `${tabs.length} tabs will be saved`;



        // Show preview list of tabs

        if (sessionTabPreview) {

          sessionTabPreview.innerHTML = '';

          tabs.forEach(tab => {

            const div = document.createElement('div');

            div.className = 'session-tab-preview-item';

            let hostname = '';

            try { hostname = new URL(tab.url).hostname; } catch(e) { hostname = tab.url; }

            div.innerHTML = `

              <img src="${tab.favIconUrl || ''}" class="session-tab-favicon" onerror="this.style.display='none'" />

              <div class="session-tab-title">${tab.title || 'Untitled'}</div>

              <div class="session-tab-hostname">${hostname}</div>

            `;

            sessionTabPreview.appendChild(div);

          });

        }



        // Pre-fill folder name with current date

        if (sessionFolderName) {

          const now = new Date();

          const dateStr = now.getFullYear() + '-' +

            String(now.getMonth() + 1).padStart(2, '0') + '-' +

            String(now.getDate()).padStart(2, '0');

          sessionFolderName.value = 'Session - ' + dateStr;

        }

      });

    });

  }



  if (sessionSnapshotForm) {

    sessionSnapshotForm.addEventListener('submit', (e) => {

      e.preventDefault();

      const folderName = sessionFolderName ? sessionFolderName.value.trim() : '';

      if (!folderName) return;



      chrome.tabs.query({ currentWindow: true }, (tabs) => {

        chrome.storage.local.get(['links'], (result) => {

          const allLinks = result.links || {};



          // Create "Sessions" parent folder if it doesn't exist

          if (!allLinks['Sessions']) {

            allLinks['Sessions'] = [];

          }



          // Create subfolder key: "Sessions/FolderName"

          const subfolderKey = 'Sessions/' + folderName;

          if (!allLinks[subfolderKey]) {

            allLinks[subfolderKey] = [];

          }



          // Add each tab as a bookmark to the subfolder

          tabs.forEach(tab => {

            if (tab.url && tab.url.startsWith('http')) {

              allLinks[subfolderKey].push({

                title: tab.title || 'Untitled',

                link: tab.url,

                dateAdded: new Date().toISOString(),

                usage: 0,

                favorite: false,

                pinned: false

              });

            }

          });



          chrome.storage.local.set({ links: allLinks }, () => {

            // Close modal

            if (sessionSnapshotModalOverlay) sessionSnapshotModalOverlay.classList.add('hidden');

            // Show success notification

            const savedCount = tabs.filter(t => t.url && t.url.startsWith('http')).length;

            showNotification(`Session saved with ${savedCount} tabs!`);

            // Refresh folder list and links display

            renderFolders();

            displayLinksForCurrentFolder(searchInput?.value.trim());

          });

        });

      });

    });

  }



  // Close modal handlers for Session Snapshot

  if (closeSessionSnapshotModal) {

    closeSessionSnapshotModal.addEventListener('click', () => {

      if (sessionSnapshotModalOverlay) sessionSnapshotModalOverlay.classList.add('hidden');

    });

  }



  if (cancelSessionSnapshotBtn) {

    cancelSessionSnapshotBtn.addEventListener('click', () => {

      if (sessionSnapshotModalOverlay) sessionSnapshotModalOverlay.classList.add('hidden');

    });

  }



  if (sessionSnapshotModalOverlay) {

    sessionSnapshotModalOverlay.addEventListener('click', (e) => {

      if (e.target === sessionSnapshotModalOverlay) sessionSnapshotModalOverlay.classList.add('hidden');

    });

  }



  document.addEventListener('keydown', (e) => {

    if (e.key === 'Escape' && sessionSnapshotModalOverlay && !sessionSnapshotModalOverlay.classList.contains('hidden')) {

      sessionSnapshotModalOverlay.classList.add('hidden');

    }

  });



  // ============================================

  // DUPLICATE DETECTION

  // ============================================

  

  function checkDuplicateUrl(url) {

    return new Promise((resolve) => {

      chrome.storage.local.get(['links'], (result) => {

        const links = result.links || {};

        let duplicate = null;

        

        Object.entries(links).forEach(([folder, folderLinks]) => {

          folderLinks.forEach((link, index) => {

            if (link.link === url) {

              duplicate = { folder, index, title: link.title };

            }

          });

        });

        

        resolve(duplicate);

      });

    });

  }



  // ============================================

  // LINK FUNCTIONS

  // ============================================

  

  function openLink(url, forceNewTab = false) {

    if (forceNewTab || !openLinksInSameTab) {

      chrome.tabs.create({ url });

    } else {

      chrome.tabs.update({ url });

    }

  }



  function openAllLinksInFolder(folderName) {

    chrome.storage.local.get(['links'], (result) => {

      const links = result.links[folderName] || [];

      if (links.length === 0) {

        showNotification('No links in this folder.', 'warning');

        return;

      }

      links.forEach(link => chrome.tabs.create({ url: link.link }));

    });

  }



  function openFavoriteLinksInFolder(folderName) {

    chrome.storage.local.get(['links'], (result) => {

      const links = result.links[folderName] || [];

      const favoriteLinks = links.filter(link => link.favorite);

      if (favoriteLinks.length === 0) {

        showNotification('No favorite links in this folder.', 'warning');

        return;

      }

      favoriteLinks.forEach(link => chrome.tabs.create({ url: link.link }));

    });

  }



  function copyToClipboard(text) {

    navigator.clipboard.writeText(text).then(() => {

      showNotification('Link copied to clipboard!', 'success');

    }).catch(() => {

      showNotification('Failed to copy link', 'error');

    });

  }



  function toggleFavorite(folder, index) {

    chrome.storage.local.get(['links'], (result) => {

      const links = result.links || {};

      if (links[folder]?.[index]) {

        links[folder][index].favorite = !links[folder][index].favorite;

        chrome.storage.local.set({ links }, () => {

          displayLinksForCurrentFolder(searchInput?.value.trim());

          showNotification(

            links[folder][index].favorite ? 'Added to favorites!' : 'Removed from favorites',

            'success'

          );

        });

      }

    });

  }



  function togglePin(folder, index) {

    chrome.storage.local.get(['links'], (result) => {

      const links = result.links || {};

      if (links[folder]?.[index]) {

        links[folder][index].pinned = !links[folder][index].pinned;

        chrome.storage.local.set({ links }, () => {

          displayLinksForCurrentFolder(searchInput?.value.trim());

          showNotification(

            links[folder][index].pinned ? 'Item pinned!' : 'Item unpinned',

            'success'

          );

        });

      }

    });

  }



  // ============================================

  // SIDEBAR

  // ============================================

  

  if (collapseSidebarBtn) {

    collapseSidebarBtn.addEventListener('click', () => {

      sidebar?.classList.add('collapsed');

      toggleSidebarBtn?.classList.remove('hidden');

      document.body?.classList.add('sidebar-is-collapsed');

      closeSidebarFlyout();

      chrome.storage.local.set({ sidebarCollapsed: true });

    });

  }



  if (toggleSidebarBtn) {

    toggleSidebarBtn.addEventListener('click', () => {

      sidebar?.classList.remove('collapsed');

      toggleSidebarBtn?.classList.add('hidden');

      document.body?.classList.remove('sidebar-is-collapsed');

      chrome.storage.local.set({ sidebarCollapsed: false });

    });

  }



  // ============================================

  // SIDEBAR FLYOUT (when collapsed)

  // ============================================

  let flyoutTimeout = null;

  

  function openSidebarFlyout() {

    if (!sidebarFlyout) return;

    clearTimeout(flyoutTimeout);

    renderFlyoutFolders();

    sidebarFlyout.classList.add('visible');

  }

  

  function closeSidebarFlyout() {

    if (!sidebarFlyout) return;

    flyoutTimeout = setTimeout(() => {

      sidebarFlyout.classList.remove('visible');

    }, 200);

  }

  

  if (sidebarFlyoutTrigger) {

    // Hamburger hover no longer opens folder flyout — disabled per requirement

    // Folder list is now accessible via Home hover popup

    sidebarFlyoutTrigger.addEventListener('click', () => {

      // Clicking hamburger just re-opens the sidebar

      sidebar?.classList.remove('collapsed');

      toggleSidebarBtn?.classList.add('hidden');

      document.body?.classList.remove('sidebar-is-collapsed');

      chrome.storage.local.set({ sidebarCollapsed: false });

    });

  }

  

  if (sidebarFlyout) {

    sidebarFlyout.addEventListener('mouseenter', () => {

      clearTimeout(flyoutTimeout);

    });

    sidebarFlyout.addEventListener('mouseleave', () => {

      closeSidebarFlyout();

    });

  }

  

  if (flyoutSearchInput) {

    flyoutSearchInput.addEventListener('input', (e) => {

      renderFlyoutFolders(e.target.value.trim());

    });

  }

  

  function renderFlyoutFolders(searchQuery = '') {

    if (!flyoutFolderList) return;

    flyoutFolderList.innerHTML = '';

    

    // Add "All Links" item

    const allLinksItem = document.createElement('div');

    allLinksItem.className = `folder-item${currentFolder === 'All Links' ? ' active' : ''}`;

    allLinksItem.innerHTML = `<span class="folder-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></span><span class="folder-item-text">All Links</span>`;

    allLinksItem.addEventListener('click', () => {

      selectFolder('All Links');

      closeSidebarFlyout();

    });

    flyoutFolderList.appendChild(allLinksItem);

    

    // Get all root folders

    chrome.storage.local.get(['links', 'folderOrder', 'pinnedFolders', 'favoriteFolders', 'folderIcons', 'folderPasswords'], (result) => {

      const links = result.links || {};

      const order = result.folderOrder || Object.keys(links);

      const favFolders = result.favoriteFolders || {};

      const storedIcons = result.folderIcons || {};

      

      let foldersToShow = order.filter(f => links[f] !== undefined);

      

      // Pinned first

      const pinned = result.pinnedFolders || [];

      foldersToShow.sort((a, b) => {

        const aPinned = pinned.includes(a) ? 0 : 1;

        const bPinned = pinned.includes(b) ? 0 : 1;

        return aPinned - bPinned;

      });

      

      if (searchQuery) {

        const q = searchQuery.toLowerCase();

        foldersToShow = foldersToShow.filter(f => f.toLowerCase().includes(q));

      }

      

      foldersToShow.forEach(folderPath => {

        const count = (links[folderPath] || []).length;

        const folderColor = favFolders[folderPath] || '';

        const customIcon = storedIcons[folderPath];

        const displayName = folderPath.includes('/') ? folderPath.substring(folderPath.lastIndexOf('/') + 1) : folderPath;

        

        let iconHtml;

        if (customIcon) {

          const colorStyle = folderColor ? ` style="color:${folderColor}"` : '';

          iconHtml = `<span class="folder-icon"><span class="folder-icon-text"${colorStyle}>${customIcon}</span></span>`;

        } else {

          const fillColor = folderColor || 'var(--primary-color)';

          iconHtml = `<span class="folder-icon"><svg class="folder-svg-fill" width="16" height="16" viewBox="0 0 24 24" fill="${fillColor}" stroke="${folderColor ? 'rgba(0,0,0,0.3)' : 'var(--primary-color)'}" stroke-width="1.5" opacity="${folderColor ? '1' : '0.7'}"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></span>`;

        }

        

        const item = document.createElement('div');

        item.className = `folder-item${folderPath === currentFolder ? ' active' : ''}`;

        item.innerHTML = `${iconHtml}<span class="folder-item-text">${displayName}</span><span class="folder-count">${count}</span>`;

        item.addEventListener('click', () => {

          selectFolder(folderPath);

          closeSidebarFlyout();

        });

        flyoutFolderList.appendChild(item);

      });

    });

  }



  if (breadcrumbHome) {

    breadcrumbHome.addEventListener('click', (e) => {

      // Don't select folder if clicking inside the popup

      if (e.target.closest('.home-folder-popup')) return;

      selectFolder('All Links');

    });

    

    // Make Home a drop target too (moves bookmark to a "root" - user picks folder)

    breadcrumbHome.addEventListener('dragover', (e) => {

      if (draggedData && draggedData.link && !draggedData.type) {

        e.preventDefault();

        e.dataTransfer.dropEffect = 'move';

        breadcrumbHome.classList.add('breadcrumb-drop-target');

      }

    });

    

    breadcrumbHome.addEventListener('dragleave', () => {

      breadcrumbHome.classList.remove('breadcrumb-drop-target');

    });

    

    breadcrumbHome.addEventListener('drop', (e) => {

      if (draggedData && draggedData.link && !draggedData.type) {

        e.preventDefault();

        breadcrumbHome.classList.remove('breadcrumb-drop-target');

        showNotification('Drop on a specific folder to move', 'warning');

      }

    });

  }



  // ============================================

  // HOME HOVER FOLDER POPUP (collapsible/expandable)

  // ============================================

  const homeFolderPopup = getElementById('homeFolderPopup');

  const homeFolderPopupList = getElementById('homeFolderPopupList');

  let homePopupTimeout = null;



  function openHomeFolderPopup() {

    if (!homeFolderPopup || !breadcrumbHome) return;

    clearTimeout(homePopupTimeout);

    renderHomeFolderPopup();

    // Position popup fixed below the Home element

    const rect = breadcrumbHome.getBoundingClientRect();

    homeFolderPopup.style.top = (rect.bottom + 8) + 'px';

    homeFolderPopup.style.left = rect.left + 'px';

    homeFolderPopup.classList.add('visible');

  }



  function closeHomeFolderPopup() {

    if (!homeFolderPopup) return;

    homePopupTimeout = setTimeout(() => {

      homeFolderPopup.classList.remove('visible');

    }, 200);

  }



  if (breadcrumbHome) {

    breadcrumbHome.addEventListener('mouseenter', () => {

      clearTimeout(homePopupTimeout);

      openHomeFolderPopup();

    });

    breadcrumbHome.addEventListener('mouseleave', () => {

      closeHomeFolderPopup();

    });

  }



  if (homeFolderPopup) {

    homeFolderPopup.addEventListener('mouseenter', () => {

      clearTimeout(homePopupTimeout);

    });

    homeFolderPopup.addEventListener('mouseleave', () => {

      closeHomeFolderPopup();

    });

  }



  function renderHomeFolderPopup() {

    if (!homeFolderPopupList) return;

    homeFolderPopupList.innerHTML = '';



    // "All Links" item

    const allItem = document.createElement('div');

    allItem.className = `home-folder-popup-item${currentFolder === 'All Links' ? ' active' : ''}`;

    allItem.innerHTML = `

      <span class="hfp-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></span>

      <span class="hfp-name">All Links</span>

    `;

    allItem.addEventListener('click', (e) => {

      e.stopPropagation();

      selectFolder('All Links');

      homeFolderPopup?.classList.remove('visible');

    });

    homeFolderPopupList.appendChild(allItem);



    chrome.storage.local.get(['links', 'folderOrder', 'pinnedFolders', 'favoriteFolders', 'folderIcons'], (result) => {

      const links = result.links || {};

      const order = result.folderOrder || Object.keys(links);

      const favFolders = result.favoriteFolders || {};

      const storedIcons = result.folderIcons || {};



      // Build folder tree: detect parent/child via "/" separator

      const rootFolders = [];

      const childMap = {};



      order.forEach(folderPath => {

        const parts = folderPath.split('/');

        if (parts.length > 1) {

          const parent = parts[0];

          if (!childMap[parent]) childMap[parent] = [];

          childMap[parent].push({

            path: folderPath,

            name: parts[parts.length - 1],

            count: (links[folderPath] || []).length

          });

        } else {

          rootFolders.push({

            path: folderPath,

            name: folderPath,

            count: (links[folderPath] || []).length,

            hasChildren: !!childMap[folderPath]

          });

        }

      });



      const folderIconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;

      const chevronSvg = `<svg class="hfp-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;



      rootFolders.forEach(folder => {

        const isActive = currentFolder === folder.path;

        const hasChildren = childMap[folder.path] && childMap[folder.path].length > 0;



        const item = document.createElement('div');

        item.className = `home-folder-popup-item${isActive ? ' active' : ''}`;



        let iconHtml = folderIconSvg;

        if (storedIcons[folder.path]) {

          iconHtml = `<span style="font-size:14px">${storedIcons[folder.path]}</span>`;

        }



        let inner = `

          <span class="hfp-icon">${iconHtml}</span>

          <span class="hfp-name">${folder.name}</span>

          <span class="hfp-count">${folder.count}</span>

        `;

        if (hasChildren) {

          inner += chevronSvg;

        }

        item.innerHTML = inner;



        item.addEventListener('click', (e) => {

          e.stopPropagation();

          selectFolder(folder.path);

          homeFolderPopup?.classList.remove('visible');

        });



        homeFolderPopupList.appendChild(item);



        // If has children, add collapsible sub-items

        if (hasChildren) {

          const chevronEl = item.querySelector('.hfp-chevron');

          const sublist = document.createElement('div');

          sublist.className = 'home-folder-popup-sublist';



          childMap[folder.path].forEach(child => {

            const childActive = currentFolder === child.path;

            const subItem = document.createElement('div');

            subItem.className = `home-folder-popup-subitem${childActive ? ' active' : ''}`;

            subItem.innerHTML = `

              <span class="hfp-icon">${folderIconSvg}</span>

              <span class="hfp-name">${child.name}</span>

              <span class="hfp-count">${child.count}</span>

            `;

            subItem.addEventListener('click', (e) => {

              e.stopPropagation();

              selectFolder(child.path);

              homeFolderPopup?.classList.remove('visible');

            });

            sublist.appendChild(subItem);

          });



          homeFolderPopupList.appendChild(sublist);



          // Toggle expand/collapse on chevron click

          if (chevronEl) {

            chevronEl.style.cursor = 'pointer';

            chevronEl.addEventListener('click', (e) => {

              e.stopPropagation();

              chevronEl.classList.toggle('expanded');

              sublist.classList.toggle('expanded');

            });

          }

        }

      });

    });

  }



  // Compact bookmark search: expansion is isolated to its own field so it can never reflow

  // or move the web-search field, voice button, engine selector, Add Bookmark, or Settings.

  const searchContainerForBookmarks = bookmarkSearchWrapper?.closest('.search-container');

  function setBookmarkSearchOpen(open, focus = false) {

    if (!bookmarkSearchWrapper || !searchContainerForBookmarks) return;

    const shouldOpen = Boolean(open);

    bookmarkSearchWrapper.classList.toggle('is-open', shouldOpen);

    // Keep the parent state in sync with the trigger/wrapper. Legacy CSS and

    // suggestion positioning also use this class, so both states must match.

    searchContainerForBookmarks.classList.toggle('bookmark-search-open', shouldOpen);

    bookmarkSearchToggle?.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');

    bookmarkSearchToggle?.setAttribute('aria-label', shouldOpen ? 'Close bookmark search' : 'Open bookmark search');

    if (shouldOpen) {

      showTagSuggestions(searchInput?.value.trim() || '');

      if (focus) {

        window.setTimeout(() => {

          if (!searchInput) return;

          searchInput.focus({ preventScroll: true });

          try { searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length); } catch (_) {}

        }, 90);

      }

    } else {

      hideTagSuggestions();

    }

  }

  bookmarkSearchToggle?.addEventListener('click', event => {

    event.preventDefault();

    event.stopPropagation();

    const isOpen = bookmarkSearchWrapper?.classList.contains('is-open');

    if (!isOpen) {

      setBookmarkSearchOpen(true, true);

    } else {

      setBookmarkSearchOpen(false, false);

    }

  });

  searchInput?.addEventListener('keydown', event => {

    if (event.key === 'Escape') {

      searchInput.value = '';

      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      setBookmarkSearchOpen(false, false);

      searchInput.blur();

    }

  });

  document.addEventListener('click', event => {

    if (!searchContainerForBookmarks?.contains(event.target) && !searchTagSuggestions?.contains(event.target) && !searchInput?.value.trim()) {

      setBookmarkSearchOpen(false, false);

    }

  });



  // ============================================

  // SEARCH WITH TAG SUGGESTIONS

  // ============================================

  

  let searchTagSuggestions = null;

  

  function createSearchTagSuggestions() {

    if (!searchTagSuggestions) {

      searchTagSuggestions = document.createElement('div');

      searchTagSuggestions.className = 'search-tag-suggestions hidden';

      const host = document.getElementById('homeSearchTools') || searchInput?.parentElement;
      if (host) host.appendChild(searchTagSuggestions);

    }

    return searchTagSuggestions;

  }

  

  function showTagSuggestions(rawQuery = '') {

    const query = String(rawQuery || '').trim();

    const requested = query.toLowerCase().replace(/^#/, '');

    chrome.storage.local.get(['links'], (result) => {

      const allLinks = result.links || {};

      const tagCounts = {};

      const matches = [];

      const allItems = [];

      Object.entries(allLinks).forEach(([folder, folderLinks]) => {

        (Array.isArray(folderLinks) ? folderLinks : []).forEach((link, index) => {

          if (!link || !link.link) return;

          const title = link.title || extractTitle(link.link || '');

          const tags = Array.isArray(link.tags) ? link.tags : [];

          const fullText = `${title} ${link.link || ''} ${folder} ${tags.join(' ')}`.toLowerCase();

          allItems.push({ folder, index, link, title });

          if (!requested || fullText.includes(requested)) {

            matches.push({ folder, index, link, title });

          }

          tags.forEach(tag => {

            const strTag = String(tag);

            if (!requested || strTag.toLowerCase().includes(requested)) {

              tagCounts[strTag] = (tagCounts[strTag] || 0) + 1;

            }

          });

        });

      });

      const listToShow = (requested ? matches : allItems).slice(0, 10);

      const tagSuggestions = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

      if (!listToShow.length && !tagSuggestions.length) { hideTagSuggestions(); return; }

      const container = createSearchTagSuggestions();

      container.innerHTML = '';

      if (listToShow.length) {

        const heading = document.createElement('div'); heading.className = 'autocomplete-section-title';

        heading.textContent = requested ? 'Bookmarks' : 'All Bookmarks';

        container.appendChild(heading);

        listToShow.forEach(({ folder, index, link, title }) => {

          const item = document.createElement('button'); item.type = 'button'; item.className = 'autocomplete-bookmark-item';

          item.title = `${title}\n• Click: Open in current tab\n• Right-click: Open in new tab`;

          const icon = document.createElement('img'); icon.className = 'autocomplete-favicon'; icon.alt = ''; icon.src = getFaviconUrl(link.link, link.customFavicon || '') || safeFaviconUrl(link.link); icon.onerror = () => { icon.onerror = null; icon.src = safeFaviconUrl(link.link); };

          const text = document.createElement('span'); text.className = 'autocomplete-main-text'; text.textContent = title;

          const sub = document.createElement('span'); sub.className = 'autocomplete-sub-text'; sub.textContent = folder;

          item.append(icon, text, sub);

          // Left click: Open in current tab

          item.addEventListener('click', (e) => {

            e.preventDefault();

            e.stopPropagation();

            hideTagSuggestions();

            openLink(link.link, false);

          });

          // Right click: Open in new tab

          item.addEventListener('contextmenu', (e) => {

            e.preventDefault();

            e.stopPropagation();

            hideTagSuggestions();

            openLink(link.link, true);

          });

          // Middle click: Open in new tab

          item.addEventListener('auxclick', (e) => {

            if (e.button === 1) {

              e.preventDefault();

              e.stopPropagation();

              hideTagSuggestions();

              openLink(link.link, true);

            }

          });

          container.appendChild(item);

        });

      }

      if (tagSuggestions.length) {

        const heading = document.createElement('div'); heading.className = 'autocomplete-section-title'; heading.textContent = 'Tags'; container.appendChild(heading);

        tagSuggestions.forEach(([tag, count]) => {

          const item = document.createElement('button'); item.type = 'button'; item.className = 'search-tag-item';

          const hash = document.createElement('span'); hash.className = 'tag-icon'; hash.textContent = '#';

          const tagName = document.createElement('span'); tagName.className = 'tag-name'; tagName.textContent = tag;

          const tagCount = document.createElement('span'); tagCount.className = 'tag-count'; tagCount.textContent = String(count);

          item.append(hash, tagName, tagCount);

          item.addEventListener('click', (e) => {

            e.preventDefault();

            e.stopPropagation();

            if (searchInput) {

              searchInput.value = '#' + tag;

              showTagSuggestions(tag);

              displayLinksForCurrentFolder(tag);

            }

          });

          container.appendChild(item);

        });

      }

      container.classList.remove('hidden');

    });

  }



  function highlightMatch(text, query) {

    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');

    return text.replace(regex, '<strong>$1</strong>');

  }

  

  function escapeRegExp(string) {

    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  }

  

  function hideTagSuggestions() {

    if (searchTagSuggestions) searchTagSuggestions.classList.add('hidden');

  }



  if (searchInput) {

    searchInput.addEventListener('input', debounce(() => {

      const query = searchInput.value.trim();

      showTagSuggestions(query);

      applyHideContentState();

      renderFolders(query);

      displayLinksForCurrentFolder(query);

    }, 200));

    

    searchInput.addEventListener('focus', () => {

      const query = searchInput.value.trim();

      if (query) showTagSuggestions(query);

    });

    

    searchInput.addEventListener('keydown', (e) => {

      if (e.key === 'Escape') hideTagSuggestions();

    });

  }



  if (folderSearchInput) {

    folderSearchInput.addEventListener('input', debounce(() => {

      renderFolders(folderSearchInput.value.trim());

    }, 300));

  }



  if (booleanSearchInput) {

    booleanSearchInput.addEventListener('keydown', (e) => {

      if (e.key === 'Enter') {

        e.preventDefault();

        const text = booleanSearchInput.value.trim();

        if (!text && selectedBookmarks.length === 0) {

          showNotification('Please enter search text or select sites/folders.', 'warning');

          return;

        }

        performBooleanSearch(text);

      }

    });

  }



  // Search suggestions for the Boolean/web search field (local bookmark matches + Google suggestions).

  let booleanSuggestionsPanel = null;

  let booleanSuggestionsRequest = 0;

  function getBooleanSuggestionsPanel() {

    if (!booleanSuggestionsPanel) {

      booleanSuggestionsPanel = document.createElement('div');

      booleanSuggestionsPanel.className = 'boolean-search-suggestions hidden';

      const host = document.getElementById('homeSearchTools') || booleanSearchInput?.parentElement;
      if (host) host.appendChild(booleanSuggestionsPanel);

    }

    return booleanSuggestionsPanel;

  }

  function hideBooleanSuggestions() { booleanSuggestionsPanel?.classList.add('hidden'); }

  function addBooleanSuggestion(panel, label, detail, callback, iconText = '↗', rightClickCallback = null) {

    const row = document.createElement('button'); row.type = 'button'; row.className = 'boolean-suggestion-row';

    const icon = document.createElement('span'); icon.className = 'boolean-suggestion-icon'; icon.textContent = iconText;

    const content = document.createElement('span'); content.className = 'boolean-suggestion-content';

    const title = document.createElement('span'); title.className = 'boolean-suggestion-title'; title.textContent = label;

    const sub = document.createElement('span'); sub.className = 'boolean-suggestion-detail'; sub.textContent = detail || '';

    content.append(title, sub); row.append(icon, content);

    row.addEventListener('click', callback);

    if (rightClickCallback) {

      row.title = `${label}\n• Click: Open in current tab\n• Right-click: Open in new tab`;

      row.addEventListener('contextmenu', (e) => {

        e.preventDefault();

        e.stopPropagation();

        rightClickCallback(e);

      });

      row.addEventListener('auxclick', (e) => {

        if (e.button === 1) {

          e.preventDefault();

          e.stopPropagation();

          rightClickCallback(e);

        }

      });

    }

    panel.appendChild(row);

  }

  async function showBooleanSuggestions(rawQuery) {

    const query = rawQuery.trim();

    if (!query) { hideBooleanSuggestions(); return; }

    const panel = getBooleanSuggestionsPanel();

    const currentRequest = ++booleanSuggestionsRequest;

    panel.innerHTML = '';

    const localTerm = query.replace(/\b(AND|OR|NOT)\b/gi, ' ').replace(/[()\"]+/g, ' ').trim().toLowerCase();

    const result = await new Promise(resolve => chrome.storage.local.get(['links'], resolve));

    if (currentRequest !== booleanSuggestionsRequest) return;

    const links = result.links || {};

    const localItems = [];

    Object.entries(links).forEach(([folder, folderLinks]) => (Array.isArray(folderLinks) ? folderLinks : []).forEach(bookmark => {

      const title = bookmark.title || extractTitle(bookmark.link || '');

      const searchable = `${title} ${bookmark.link || ''} ${folder} ${(bookmark.tags || []).join(' ')}`.toLowerCase();

      if (bookmark.link && localTerm && searchable.includes(localTerm)) localItems.push({ title, folder, link: bookmark.link });

    }));

    if (localItems.length) {

      const heading = document.createElement('div'); heading.className = 'autocomplete-section-title'; heading.textContent = 'Saved bookmarks'; panel.appendChild(heading);

      localItems.slice(0, 6).forEach(item => addBooleanSuggestion(

        panel,

        item.title,

        item.folder,

        () => {

          hideBooleanSuggestions();

          openLink(item.link, false);

        },

        '★',

        () => {

          hideBooleanSuggestions();

          openLink(item.link, true);

        }

      ));

    }

    // Remote suggestions are queried only for plain text and only when the selected engine is Google.

    if (query.length >= 2 && selectedEngine === 'google') {

      try {

        const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`, { cache: 'no-store' });

        if (response.ok) {

          const data = await response.json();

          if (currentRequest !== booleanSuggestionsRequest) return;

          const remote = Array.isArray(data?.[1]) ? data[1].filter(value => typeof value === 'string' && value.toLowerCase() !== query.toLowerCase()).slice(0, 6) : [];

          if (remote.length) {

            const heading = document.createElement('div'); heading.className = 'autocomplete-section-title'; heading.textContent = 'Search suggestions'; panel.appendChild(heading);

            remote.forEach(suggestion => addBooleanSuggestion(panel, suggestion, `Search with ${selectedEngine[0].toUpperCase()}${selectedEngine.slice(1)}`, () => {

              booleanSearchInput.value = suggestion; hideBooleanSuggestions(); performBooleanSearch(suggestion);

            }, '⌕'));

          }

        }

      } catch (_) { /* Local bookmark suggestions remain available when web suggestions are blocked or offline. */ }

    }

    // Boolean operator helpers appear with every non-empty query.

    const operators = document.createElement('div'); operators.className = 'boolean-operator-row';

    [['AND','both terms'],['OR','either term'],['NOT','exclude term'],['"phrase"','exact phrase'],['site:','limit to site']].forEach(([token, note]) => {

      const chip = document.createElement('button'); chip.type = 'button'; chip.className = 'boolean-operator-chip';

      const label = token === '"phrase"' ? 'Exact phrase' : token === 'site:' ? 'Site:' : token;

      chip.textContent = label; chip.title = note;

      chip.addEventListener('click', () => {

        const spacer = booleanSearchInput.value && !/\s$/.test(booleanSearchInput.value) ? ' ' : '';

        booleanSearchInput.value = `${booleanSearchInput.value}${spacer}${token === '"phrase"' ? '""' : token}`;

        booleanSearchInput.focus();

        if (token === '"phrase"') { const p = booleanSearchInput.value.length - 1; booleanSearchInput.setSelectionRange(p, p); }

        else booleanSearchInput.setSelectionRange(booleanSearchInput.value.length, booleanSearchInput.value.length);

      });

      operators.appendChild(chip);

    });

    panel.appendChild(operators);

    if (panel.children.length) panel.classList.remove('hidden'); else hideBooleanSuggestions();

  }

  if (booleanSearchInput) {

    booleanSearchInput.addEventListener('input', debounce(() => showBooleanSuggestions(booleanSearchInput.value), 220));

    booleanSearchInput.addEventListener('focus', () => { if (booleanSearchInput.value.trim()) showBooleanSuggestions(booleanSearchInput.value); });

    booleanSearchInput.addEventListener('keydown', event => { if (event.key === 'Escape') hideBooleanSuggestions(); });

  }

  document.addEventListener('click', event => {

    if (booleanSuggestionsPanel && !booleanSuggestionsPanel.contains(event.target) && !booleanSearchInput?.contains(event.target)) hideBooleanSuggestions();

  });



  // Search Engine Selection

  if (selectedSearchEngineBtn && searchEngineDropdownList) {

    selectedSearchEngineBtn.addEventListener('click', (e) => {

      e.stopPropagation();

      searchEngineDropdownList.classList.toggle('hidden');

    });



    document.querySelectorAll('.search-engine-option').forEach(option => {

      option.addEventListener('click', () => {

        selectedEngine = option.dataset.engine;

        chrome.storage.local.set({ selectedEngine }, () => {

          updateSearchEngineDropdown();

          searchEngineDropdownList.classList.add('hidden');

        });

      });

    });

  }



  // ============================================

  // KEYBOARD SHORTCUTS

  // ============================================

  

  // Listen for commands from background

  chrome.runtime.onMessage.addListener((message) => {

    if (message.type === 'openAddBookmark') openModal();

    if (message.type === 'focusSearch') setBookmarkSearchOpen(true, true);

    if (message.type === 'refreshData') {

      renderFolders();

      displayLinksForCurrentFolder();

      renderRecentlyAdded();

      renderMostUsed();

    }

  });



  // Also handle keyboard shortcuts directly

  document.addEventListener('keydown', (e) => {

    // Ctrl+B - Add bookmark (when not in input)

    if (e.ctrlKey && e.key === 'b' && !e.target.closest('input, textarea')) {

      e.preventDefault();

      openModal();

    }

    // Ctrl+F - Focus search

    if (e.ctrlKey && e.key === 'f') {

      e.preventDefault();

      setBookmarkSearchOpen(true, true);

    }

    // Escape - Close modals

    if (e.key === 'Escape') {

      closeModal();

      closeAddSiteModal();

      closeFaviconModalFunc();

      notesModalOverlay?.classList.add('hidden');

      folderIconModalOverlay?.classList.add('hidden');

      bulkMoveModalOverlay?.classList.add('hidden');

      duplicatesModalOverlay?.classList.add('hidden');

      manageAppsModalOverlay?.classList.add('hidden');

      addAppModalOverlay?.classList.add('hidden');

      appLauncherPopup?.classList.add('hidden');

      appLauncherBtn?.classList.remove('active');

      settingsPanel?.classList.add('hidden');

      hideAllContextMenus();

      hideTagSuggestions();

      hideBooleanSuggestions?.();

    }

  });



  // ============================================

  // MODAL MANAGEMENT

  // ============================================

  

  if (addLinkBtn) addLinkBtn.addEventListener('click', () => openModal());

  if (closeModalBtn) closeModalBtn.addEventListener('click', () => closeModal());

  if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal());

  if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });



  if (linkInput && titleInput) {

    linkInput.addEventListener('input', () => {

      const urls = linkInput.value.split(',').map(url => url.trim()).filter(url => url);

      const titles = urls.map(url => extractTitle(url));

      titleInput.value = titles.join(', ');

    });

  }



  if (linkFormElement) {

    linkFormElement.addEventListener('submit', (e) => {

      e.preventDefault();

      saveLinks();

    });

  }



  if (addKeywordBtn) addKeywordBtn.addEventListener('click', addKeyword);

  if (keywordInput) {

    keywordInput.addEventListener('keydown', (e) => {

      if (e.key === 'Enter') { e.preventDefault(); addKeyword(); }

    });

  }



  // Create Folder Modal Elements

  const createFolderModalOverlay = document.getElementById('createFolderModalOverlay');

  const closeCreateFolderModalBtn = document.getElementById('closeCreateFolderModal');

  const createFolderForm = document.getElementById('createFolderForm');

  const newFolderNameInput = document.getElementById('newFolderName');

  const parentFolderPathInput = document.getElementById('parentFolderPath');

  const cancelCreateFolderBtn = document.getElementById('cancelCreateFolderBtn');

  const folderColorPicker = document.getElementById('folderColorPicker');

  let selectedFolderColor = '';



  if (addFolderBtn) {

    addFolderBtn.addEventListener('click', () => {

      // If a folder is selected and it's not 'All Links', pre-fill parent

      if (currentFolder && currentFolder !== 'All Links') {

        parentFolderPathInput.value = currentFolder;

        document.getElementById('createFolderModalTitle').textContent = 'Create Subfolder in ' + getFolderName(currentFolder);

      } else {

        parentFolderPathInput.value = '';

        document.getElementById('createFolderModalTitle').textContent = 'Create New Folder';

      }

      // Reset form

      newFolderNameInput.value = '';

      selectedFolderColor = '';

      document.querySelectorAll('.folder-color-option').forEach(btn => btn.classList.remove('selected'));

      document.querySelector('.folder-color-option[data-color=""]')?.classList.add('selected');

      createFolderModalOverlay?.classList.remove('hidden');

      setTimeout(() => newFolderNameInput?.focus(), 100);

    });

  }



  if (closeCreateFolderModalBtn) closeCreateFolderModalBtn.addEventListener('click', () => createFolderModalOverlay?.classList.add('hidden'));

  if (cancelCreateFolderBtn) cancelCreateFolderBtn.addEventListener('click', () => createFolderModalOverlay?.classList.add('hidden'));

  if (createFolderModalOverlay) {

    createFolderModalOverlay.addEventListener('click', (e) => {

      if (e.target === createFolderModalOverlay) createFolderModalOverlay.classList.add('hidden');

    });

  }



  // Folder color picker

  if (folderColorPicker) {

    folderColorPicker.addEventListener('click', (e) => {

      const option = e.target.closest('.folder-color-option');

      if (!option) return;

      document.querySelectorAll('.folder-color-option').forEach(btn => btn.classList.remove('selected'));

      option.classList.add('selected');

      selectedFolderColor = option.dataset.color || '';

    });

  }



  if (createFolderForm) {

    createFolderForm.addEventListener('submit', (e) => {

      e.preventDefault();

      const name = newFolderNameInput?.value.trim();

      if (!name) return;

      

      const parentPath = parentFolderPathInput?.value.trim();

      const fullPath = parentPath ? parentPath + '/' + name : name;

      

      createFolder(fullPath, selectedFolderColor);

      createFolderModalOverlay?.classList.add('hidden');

    });

  }



  // Edit Folder Modal

  if (closeEditFolderModal) closeEditFolderModal.addEventListener('click', () => editFolderModalOverlay?.classList.add('hidden'));

  let selectedEditFolderColor = '';

  

  if (editFolderColorPicker) {

    editFolderColorPicker.addEventListener('click', (e) => {

      const option = e.target.closest('.folder-color-option');

      if (!option) return;

      document.querySelectorAll('#editFolderColorPicker .folder-color-option').forEach(btn => btn.classList.remove('selected'));

      option.classList.add('selected');

      selectedEditFolderColor = option.dataset.color || '';

    });

  }

  

  if (editFolderForm) {

    editFolderForm.addEventListener('submit', (e) => {

      e.preventDefault();

      const folderPath = editFolderPathInput?.value;

      if (!folderPath) return;

      

      chrome.storage.local.get(['favoriteFolders'], (result) => {

        const favFolders = result.favoriteFolders || {};

        if (selectedEditFolderColor) {

          favFolders[folderPath] = selectedEditFolderColor;

        } else {

          delete favFolders[folderPath];

        }

        favoriteFolders = favFolders;

        chrome.storage.local.set({ favoriteFolders: favFolders }, () => {

          renderFolders();

          renderSavedBookmarks();

          displayLinksForCurrentFolder(searchInput?.value.trim());

          showNotification('Folder updated successfully!');

          editFolderModalOverlay?.classList.add('hidden');

        });

      });

    });

  }

  

  function openEditFolderModal(folderPath) {

    if (!editFolderModalOverlay) return;

    editFolderPathInput.value = folderPath;

    selectedEditFolderColor = favoriteFolders[folderPath] || '';

    

    // Set the selected color

    document.querySelectorAll('#editFolderColorPicker .folder-color-option').forEach(btn => {

      btn.classList.toggle('selected', btn.dataset.color === selectedEditFolderColor);

    });

    

    editFolderModalOverlay.classList.remove('hidden');

  }



  // Quick Access

  if (addSiteBtn) addSiteBtn.addEventListener('click', () => openAddSiteModal());

  if (closeAddSiteModalBtn) closeAddSiteModalBtn.addEventListener('click', () => closeAddSiteModal());

  if (cancelSiteBtn) cancelSiteBtn.addEventListener('click', () => closeAddSiteModal());

  if (addSiteForm) {

    addSiteForm.addEventListener('submit', (e) => {

      e.preventDefault();

      saveQuickAccessSite();

    });

  }



  // ============================================

  // SETTINGS

  // ============================================

  // Keep interaction with an open settings control from being interpreted as an outside click.

  settingsPanel?.addEventListener('click', event => event.stopPropagation());

  

  if (settingsBtn) {

    settingsBtn.addEventListener('click', (e) => {

      e.stopPropagation();

      if (settingsPanel) {

        settingsPanel.classList.toggle('hidden');

        if (!settingsPanel.classList.contains('hidden')) {

          settingsPanel.classList.add('open');

        } else {

          settingsPanel.classList.remove('open');

        }

      }

    });

  }



  if (closeSettingsPanel) closeSettingsPanel.addEventListener('click', () => {

    if (settingsPanel) {

      settingsPanel.classList.add('hidden');

      settingsPanel.classList.remove('open');

    }

  });



  // ============================================

  // BOOLEAN SEARCH SHORTCUTS UI (Professional Modal)

  // ============================================

  

  const booleanShortcutsBtn = document.getElementById('booleanShortcutsBtn');

  const booleanShortcutsModalOverlay = document.getElementById('booleanShortcutsModalOverlay');

  const closeBooleanShortcutsModal = document.getElementById('closeBooleanShortcutsModal');

  

  // Open modal

  if (booleanShortcutsBtn) {

    booleanShortcutsBtn.addEventListener('click', () => {

      if (booleanShortcutsModalOverlay) {

        booleanShortcutsModalOverlay.classList.remove('hidden');

        renderBshList();

      }

    });

  }

  

  // Close modal

  if (closeBooleanShortcutsModal) {

    closeBooleanShortcutsModal.addEventListener('click', () => {

      if (booleanShortcutsModalOverlay) booleanShortcutsModalOverlay.classList.add('hidden');

    });

  }

  if (booleanShortcutsModalOverlay) {

    booleanShortcutsModalOverlay.addEventListener('click', (e) => {

      if (e.target === booleanShortcutsModalOverlay) booleanShortcutsModalOverlay.classList.add('hidden');

    });

  }

  // ESC to close

  document.addEventListener('keydown', (e) => {

    if (e.key === 'Escape' && booleanShortcutsModalOverlay && !booleanShortcutsModalOverlay.classList.contains('hidden')) {

      booleanShortcutsModalOverlay.classList.add('hidden');

    }

  });

  

  // Render shortcuts list in the new modal

  function renderBshList() {

    const listEl = document.getElementById('bshList');

    const countEl = document.getElementById('bshListCount');

    const emptyEl = document.getElementById('bshEmpty');

    if (!listEl) return;

    

    const keys = Object.keys(booleanSearchShortcuts);

    if (countEl) countEl.textContent = keys.length;

    

    // Remove all items except empty state

    listEl.querySelectorAll('.bsh-item').forEach(el => el.remove());

    

    if (keys.length === 0) {

      if (emptyEl) emptyEl.style.display = 'flex';

      return;

    }

    

    if (emptyEl) emptyEl.style.display = 'none';

    

    Object.entries(booleanSearchShortcuts).forEach(([name, config]) => {

      const item = document.createElement('div');

      item.className = 'bsh-item';

      item.dataset.name = name;

      

      item.innerHTML = `

        <div class="bsh-item-trigger">${escapeHtml(config.trigger || name)}</div>

        <div class="bsh-item-info">

          <div class="bsh-item-name">${escapeHtml(name)}</div>

          <div class="bsh-item-sites" title="${escapeHtml((config.sites || []).join(', '))}">${escapeHtml((config.sites || []).join(', '))}</div>

        </div>

        <div class="bsh-item-actions">

          <button class="bsh-edit-btn" title="Edit shortcut">

            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>

          </button>

          <button class="bsh-delete-btn" title="Delete shortcut">

            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>

          </button>

        </div>

      `;

      

      // Edit button

      const editBtn = item.querySelector('.bsh-edit-btn');

      editBtn.addEventListener('click', () => {

        startBshEdit(item, name, config);

      });

      

      // Delete button

      const deleteBtn = item.querySelector('.bsh-delete-btn');

      deleteBtn.addEventListener('click', () => {

        delete booleanSearchShortcuts[name];

        chrome.storage.local.set({ booleanSearchShortcuts }, () => {

          renderBshList();

          showNotification('Shortcut "' + name + '" removed', 'success');

        });

      });

      

      listEl.appendChild(item);

    });

  }

  

  // Inline edit mode

  function startBshEdit(itemEl, name, config) {

    if (itemEl.classList.contains('editing')) return;

    itemEl.classList.add('editing');

    

    const sitesStr = (config.sites || []).join(', ');

    

    itemEl.innerHTML = `

      <div class="bsh-edit-form">

        <div class="bsh-field">

          <label class="bsh-label">Trigger</label>

          <input type="text" class="bsh-edit-input bsh-edit-trigger" value="${escapeHtml(config.trigger || name)}" maxlength="5" />

        </div>

        <div class="bsh-field">

          <label class="bsh-label">Name</label>

          <input type="text" class="bsh-edit-input bsh-edit-name" value="${escapeHtml(name)}" maxlength="30" />

        </div>

        <div class="bsh-field bsh-field-sites">

          <label class="bsh-label">Sites</label>

          <input type="text" class="bsh-edit-input bsh-edit-sites" value="${escapeHtml(sitesStr)}" />

        </div>

        <div class="bsh-edit-actions">

          <button class="bsh-cancel-btn">Cancel</button>

          <button class="bsh-save-btn">Save</button>

        </div>

      </div>

    `;

    

    const cancelBtn = itemEl.querySelector('.bsh-cancel-btn');

    const saveBtn = itemEl.querySelector('.bsh-save-btn');

    

    cancelBtn.addEventListener('click', () => {

      renderBshList();

    });

    

    saveBtn.addEventListener('click', () => {

      const newTrigger = itemEl.querySelector('.bsh-edit-trigger').value.trim();

      const newName = itemEl.querySelector('.bsh-edit-name').value.trim();

      const newSitesStr = itemEl.querySelector('.bsh-edit-sites').value.trim();

      

      if (!newTrigger || !newName || !newSitesStr) {

        showNotification('Please fill in all fields', 'warning');

        return;

      }

      

      const newSites = newSitesStr.split(',').map(s => s.trim()).filter(s => s);

      if (newSites.length === 0) {

        showNotification('Please enter at least one site', 'warning');

        return;

      }

      

      // If name changed, delete old key

      if (newName !== name) {

        delete booleanSearchShortcuts[name];

      }

      

      booleanSearchShortcuts[newName] = {

        trigger: newTrigger,

        sites: newSites

      };

      

      chrome.storage.local.set({ booleanSearchShortcuts }, () => {

        renderBshList();

        showNotification('Shortcut "' + newName + '" updated!', 'success');

      });

    });

    

    // Focus the first input

    const firstInput = itemEl.querySelector('.bsh-edit-trigger');

    if (firstInput) firstInput.focus();

  }

  

  // Escape HTML helper

  function escapeHtml(text) {

    const div = document.createElement('div');

    div.textContent = text;

    return div.innerHTML;

  }

  

  // Add new shortcut button handler

  const bshAddBtn = document.getElementById('bshAddBtn');

  

  function handleAddShortcut() {

    const triggerInput = document.getElementById('bshNewTrigger');

    const nameInput = document.getElementById('bshNewName');

    const sitesInput = document.getElementById('bshNewSites');

    

    const trigger = triggerInput?.value.trim();

    const name = nameInput?.value.trim();

    const sitesStr = sitesInput?.value.trim();

    

    if (!trigger || !name || !sitesStr) {

      showNotification('Please fill in all fields', 'warning');

      return;

    }

    

    const sites = sitesStr.split(',').map(s => s.trim()).filter(s => s);

    if (sites.length === 0) {

      showNotification('Please enter at least one site', 'warning');

      return;

    }

    

    // Check for duplicate name

    if (booleanSearchShortcuts[name]) {

      showNotification('A shortcut with name "' + name + '" already exists', 'warning');

      return;

    }

    

    booleanSearchShortcuts[name] = {

      trigger: trigger,

      sites: sites

    };

    

    chrome.storage.local.set({ booleanSearchShortcuts }, () => {

      renderBshList();

      showNotification('Shortcut "' + name + '" added!', 'success');

      if (triggerInput) triggerInput.value = '';

      if (nameInput) nameInput.value = '';

      if (sitesInput) sitesInput.value = '';

    });

  }

  

  if (bshAddBtn) {

    bshAddBtn.addEventListener('click', handleAddShortcut);

  }

  

  // Enter key support for add form inputs

  ['bshNewTrigger', 'bshNewName', 'bshNewSites'].forEach(inputId => {

    const inputEl = document.getElementById(inputId);

    if (inputEl) {

      inputEl.addEventListener('keydown', (e) => {

        if (e.key === 'Enter') {

          e.preventDefault();

          handleAddShortcut();

        }

      });

    }

  });

  

  // Render shortcuts list on load

  renderBshList();





  settingsTabs.forEach(tab => {

    tab.addEventListener('click', () => {

      const targetTab = tab.dataset.tab;

      settingsTabs.forEach(t => t.classList.remove('active'));

      tab.classList.add('active');

      tabPanes.forEach(pane => {

        pane.classList.toggle('active', pane.id === `${targetTab}Tab`);

      });

      

      // Refresh sync trees when Backup & Sync tab is opened

      if (targetTab === 'backup-sync') {

        // Chrome sync features removed

      }

    });

  });



  if (redirectToggle) {

    redirectToggle.addEventListener('change', () => {

      chrome.storage.local.set({ redirectEnabled: redirectToggle.checked });

    });

  }



  if (hideLinksToggle) {

    hideLinksToggle.addEventListener('change', () => {

      hideLinksOnly = hideLinksToggle.checked;

      if (hideLinksOnly && hideAllToggle) { hideAllToggle.checked = false; hideAllContent = false; }

      chrome.storage.local.set({ hideLinksOnly, hideAllContent: false }, () => applyHideContentState());

    });

  }



  if (hideAllToggle) {

    hideAllToggle.addEventListener('change', () => {

      hideAllContent = hideAllToggle.checked;

      if (hideAllContent && hideLinksToggle) { hideLinksToggle.checked = false; hideLinksOnly = false; }

      chrome.storage.local.set({ hideAllContent, hideLinksOnly: false }, () => applyHideContentState());

    });

  }



  if (confirmDelete) {

    confirmDelete.addEventListener('change', () => {

      confirmDeleteEnabled = confirmDelete.checked;

      chrome.storage.local.set({ confirmDelete: confirmDeleteEnabled });

    });

  }



  if (openSameTab) {

    openSameTab.addEventListener('change', () => {

      openLinksInSameTab = openSameTab.checked;

      chrome.storage.local.set({ openSameTab: openLinksInSameTab });

    });

  }



  if (showFavoritesOnly) {

    showFavoritesOnly.addEventListener('change', () => {

      showFavoritesOnlyEnabled = showFavoritesOnly.checked;

      chrome.storage.local.set({ showFavoritesOnly: showFavoritesOnlyEnabled }, () => {

        if (currentFolder === 'All Links') {

          displayLinksForCurrentFolder(searchInput?.value.trim());

          if (currentFolderNameElem) {

            currentFolderNameElem.textContent = showFavoritesOnlyEnabled ? 'Favorites' : 'All Links';

          }

        }

      });

    });

  }



  if (showSubfolderContent) {

    showSubfolderContent.addEventListener('change', () => {

      showSubfolderContentEnabled = showSubfolderContent.checked;

      chrome.storage.local.set({ showSubfolderContent: showSubfolderContentEnabled }, () => {

        displayLinksForCurrentFolder(searchInput?.value.trim());

      });

    });

  }



    if (showVisibilityToggle) {

    showVisibilityToggle.addEventListener('change', () => {

      showVisibilityToggleEnabled = showVisibilityToggle.checked;

      document.body.classList.toggle('show-visibility-toggle', showVisibilityToggleEnabled);

      chrome.storage.local.set({ showVisibilityToggle: showVisibilityToggleEnabled }, () => {

        renderFolders();

      });

    });

  }

  

  // Helper: Check if folder or any parent is hidden

  function isFolderOrParentHidden(folderPath) {

    if (hiddenFolders.has(folderPath)) return true;

    let parent = getParentFolder(folderPath);

    while (parent) {

      if (hiddenFolders.has(parent)) return true;

      parent = getParentFolder(parent);

    }

    return false;

  }

  

  // Toggle folder visibility

  function toggleFolderVisibility(folderPath) {

    if (hiddenFolders.has(folderPath)) {

      hiddenFolders.delete(folderPath);

      showNotification(`👁️ "${getFolderName(folderPath)}" is now visible in All Links`, 'success');

    } else {

      hiddenFolders.add(folderPath);

      showNotification(`🚫 "${getFolderName(folderPath)}" hidden from All Links`, 'success');

    }

    

    chrome.storage.local.set({ hiddenFolders: Array.from(hiddenFolders) }, () => {

      renderFolders(folderSearchInput?.value.trim() || '');

      if (currentFolder === 'All Links') {

        displayLinksForCurrentFolder(searchInput?.value.trim());

        renderRecentlyAdded();

        renderMostUsed();

        updateAllLinksCount();

      }

    });

  }



  // Export/Import

  if (exportBtn) exportBtn.addEventListener('click', exportBookmarks);

  if (importFileSelect) {

    importFileSelect.addEventListener('change', (e) => {

      const file = e.target.files[0];

      if (file) importBookmarks(file);

    });

  }



  // Folder Suggestions

  if (folderInput) {

    folderInput.addEventListener('focus', () => updateFolderSuggestions(folderInput.value));

    folderInput.addEventListener('input', () => updateFolderSuggestions(folderInput.value));

  }



  if (keywordInput) {

    keywordInput.addEventListener('focus', () => {

      const folder = folderInput?.value.trim();

      if (folder) updateKeywordSuggestions(folder, keywordInput.value);

    });

    keywordInput.addEventListener('input', () => {

      const folder = folderInput?.value.trim();

      if (folder) updateKeywordSuggestions(folder, keywordInput.value);

    });

  }



  // ============================================

  // GLOBAL CLICK HANDLER

  // ============================================

  

  document.addEventListener('click', (e) => {

    // The folder color palette is a persistent mini-window: outside clicks do not dismiss it.

    if ((!colorPickerMenu || colorPickerMenu.classList.contains('hidden')) && !e.target.closest('.context-menu')) hideAllContextMenus();

    if (!folderInput?.contains(e.target) && !folderSuggestions?.contains(e.target)) {

      if (folderSuggestions) folderSuggestions.style.display = 'none';

    }

    if (!keywordInput?.contains(e.target) && !keywordSuggestions?.contains(e.target)) {

      if (keywordSuggestions) keywordSuggestions.style.display = 'none';

    }

    const eventPath = typeof e.composedPath === 'function' ? e.composedPath() : [];

    const clickedInsideSettings = Boolean(settingsPanel && (settingsPanel.contains(e.target) || eventPath.includes(settingsPanel)));

    const clickedSettingsButton = Boolean(settingsBtn && (settingsBtn.contains(e.target) || eventPath.includes(settingsBtn)));

    if (!clickedInsideSettings && !clickedSettingsButton) {

      settingsPanel?.classList.add('hidden');

      settingsPanel?.classList.remove('open');

    }

    if (!searchEngineDropdownList?.contains(e.target) && !selectedSearchEngineBtn?.contains(e.target)) {

      searchEngineDropdownList?.classList.add('hidden');

    }

    if (searchTagSuggestions && !searchTagSuggestions.contains(e.target) && !searchInput?.contains(e.target)) {

      hideTagSuggestions();

    }

  });



  // ============================================

  // DRAG & DROP SYSTEM

  // ============================================

  

  function createDropIndicator() {

    if (!dropIndicator) {

      dropIndicator = document.createElement('div');

      dropIndicator.className = 'drop-indicator';

    }

    return dropIndicator;

  }

  

  function showDropIndicatorAt(targetElement, position, isHorizontal = false) {

    const indicator = createDropIndicator();

    indicator.className = isHorizontal ? 'drop-indicator-horizontal' : 'drop-indicator';

    

    const rect = targetElement.getBoundingClientRect();

    

    // Detect if in grid layout - check if next sibling is on same row

    const isGridLayout = linksContainer?.classList.contains('grid-view');

    

    if (isGridLayout && !isHorizontal) {

      // For grid: show vertical line between cards

      indicator.className = 'drop-indicator-grid';

      indicator.style.top = rect.top + 'px';

      indicator.style.height = rect.height + 'px';

      indicator.style.width = '4px';

      indicator.style.left = (position === 'before' ? rect.left - 6 : rect.right + 2) + 'px';

    } else if (isHorizontal) {

      indicator.style.left = (position === 'before' ? rect.left - 2 : rect.right - 1) + 'px';

      indicator.style.top = rect.top + 'px';

      indicator.style.height = rect.height + 'px';

      indicator.style.width = '3px';

    } else {

      // List view: horizontal line

      indicator.style.top = (position === 'before' ? rect.top - 2 : rect.bottom - 1) + 'px';

      indicator.style.left = rect.left + 'px';

      indicator.style.width = rect.width + 'px';

      indicator.style.height = '3px';

    }

    

    if (!indicator.parentElement) document.body.appendChild(indicator);

  }

  

  function hideDropIndicator() {

    if (dropIndicator?.parentElement) dropIndicator.remove();

  }

  

  function getDropPosition(targetElement, event, isHorizontal = false) {

    const rect = targetElement.getBoundingClientRect();

    const isGridLayout = linksContainer?.classList.contains('grid-view');

    

    // For grid layout, always use horizontal position (left/right)

    if (isGridLayout && !isHorizontal && targetElement.classList.contains('link-tag')) {

      return event.clientX < rect.left + rect.width / 2 ? 'before' : 'after';

    }

    

    if (isHorizontal) {

      return event.clientX < rect.left + rect.width / 2 ? 'before' : 'after';

    }

    return event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';

  }



  // ============================================

  // HELPER FUNCTIONS

  // ============================================

  

  function debounce(func, wait) {

    let timeout;

    return function(...args) {

      clearTimeout(timeout);

      timeout = setTimeout(() => func(...args), wait);

    };

  }



  function showNotification(message, type = 'success') {

    const toast = document.createElement('div');

    toast.className = `notification notification-${type}`;

    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {

      toast.style.animation = 'slideOut 0.3s ease';

      setTimeout(() => toast.remove(), 300);

    }, 3000);

  }



  function extractTitle(url) {

    try {

      let testUrl = url;

      if (!/^(https?:\/\/|file:\/\/)/i.test(testUrl)) testUrl = 'https://' + testUrl;

      const hostname = new URL(testUrl).hostname;

      const parts = hostname.split('.');

      let title = parts.length > 2 ? parts[parts.length - 2] : parts[0];

      return title.charAt(0).toUpperCase() + title.slice(1);

    } catch (e) {

      return url;

    }

  }



  function updateSearchEngineDropdown() {

    if (!selectedSearchEngineBtn) return;

    const img = selectedSearchEngineBtn.querySelector('img');

    const svgDataUris = {

      google: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>'),

      yandex: 'Assets/yandex.png',

      duckduckgo: 'Assets/duckduckgo.png',

      bing: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#008373" d="M5 3v16.5l4.67 2.5 7.33-4.17V12.5l-5.33-1.83L5 3zm4.67 5.17l2.66.83v4.17l-2.66 1.5V8.17z"/></svg>'),

      youtube: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><path fill="#FFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'),

      pinterest: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#BD081C" d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>'),

      behance: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#1769FF" d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.62.165-1.28.25-2 .25H0V4.51h6.938v-.007zM6.545 10.16c.6 0 1.09-.15 1.47-.465.38-.316.57-.78.57-1.39 0-.344-.06-.625-.18-.85a1.47 1.47 0 0 0-.49-.556c-.21-.146-.46-.25-.74-.31a4.4 4.4 0 0 0-.9-.09H3.22v3.66h3.325zm.18 5.56c.34 0 .66-.04.95-.12.29-.08.54-.21.75-.38.21-.17.37-.39.49-.65.12-.26.18-.58.18-.96 0-.75-.21-1.3-.64-1.62-.43-.33-.99-.49-1.7-.49H3.22v4.22h3.505zM21.568 8.5v1.64h-5.937V8.5h5.937zM18.685 15.27c.44.42 1.04.63 1.8.63.55 0 1.03-.14 1.43-.42.4-.28.65-.56.75-.84h2.44c-.39 1.23-.99 2.12-1.78 2.68-.79.56-1.75.84-2.86.84-.78 0-1.48-.12-2.11-.38-.63-.25-1.17-.61-1.6-1.08-.44-.47-.77-1.03-1.01-1.69-.24-.66-.36-1.39-.36-2.19 0-.77.12-1.49.37-2.15.24-.66.58-1.23 1.03-1.71.44-.48.97-.85 1.59-1.12.62-.27 1.3-.4 2.05-.4.83 0 1.55.16 2.16.49.61.32 1.11.77 1.51 1.33.4.57.69 1.22.87 1.96.18.74.24 1.53.18 2.38h-7.28c.05.87.35 1.54.79 1.96zm3.07-5.37c-.34-.37-.87-.56-1.57-.56-.47 0-.85.08-1.16.23-.31.16-.55.35-.74.58-.19.23-.32.47-.4.73-.07.26-.12.49-.14.69h4.98c-.12-.72-.43-1.3-.77-1.67h-.2z"/></svg>'),

      chatgpt: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#10a37f" d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073z"/></svg>'),

      gemini: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#8E75B2" d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm0 2.4a.7.7 0 0 1 .6.4l2.4 5.2a.7.7 0 0 0 .4.4l5.2 2.4a.7.7 0 0 1 0 1.2l-5.2 2.4a.7.7 0 0 0-.4.4l-2.4 5.2a.7.7 0 0 1-1.2 0l-2.4-5.2a.7.7 0 0 0-.4-.4l-5.2-2.4a.7.7 0 0 1 0-1.2l5.2-2.4a.7.7 0 0 0 .4-.4l2.4-5.2a.7.7 0 0 1 .6-.4z"/></svg>')

    };

    if (img) {

      if (svgDataUris[selectedEngine]) {

        img.src = svgDataUris[selectedEngine];

        img.style.borderRadius = '3px';

      }

    }

  }



  function applyHideContentState() {

    const hasSearch = searchInput?.value.trim() !== '';

    document.body.classList.remove('hide-links', 'hide-all');

    if (!hasSearch) {

      if (hideAllContent) document.body.classList.add('hide-all');

      else if (hideLinksOnly) document.body.classList.add('hide-links');

    }

  }



  // ============================================

  // MODAL FUNCTIONS

  // ============================================

  

  function openModal(linkObj = null, folder = '', index = -1) {

    modalOverlay?.classList.remove('hidden');

    linkFormElement?.reset();

    keywords = [];

    renderKeywords();

    

    if (linkObj) {

      if (linkInput) linkInput.value = linkObj.link;

      if (titleInput) titleInput.value = linkObj.title;

      if (folderInput) folderInput.value = folder;

      if (favoriteCheckbox) favoriteCheckbox.checked = linkObj.favorite || false;

      if (pinCheckbox) pinCheckbox.checked = linkObj.pinned || false;

      if (incognitoCheckbox) incognitoCheckbox.checked = linkObj.incognito || false;

      if (bookmarkNotes) bookmarkNotes.value = linkObj.notes || '';

      if (customFavicon) customFavicon.value = linkObj.customFavicon || '';

      if (linkObj.customFavicon) previewFavicon(linkObj.customFavicon, faviconPreviewImg, faviconPreview);

      keywords = [...(linkObj.tags || [])];

      renderKeywords();

      if (editIndexInput) editIndexInput.value = index;

      if (editFolderInput) editFolderInput.value = folder;

    } else if (currentFolder !== 'All Links' && folderInput) {

      folderInput.value = currentFolder;

    }

    

    linkInput?.focus();

  }



  function closeModal() {

    modalOverlay?.classList.add('hidden');

    linkFormElement?.reset();

    keywords = [];

    renderKeywords();

    if (editIndexInput) editIndexInput.value = '';

    if (editFolderInput) editFolderInput.value = '';

    if (saveMessage) saveMessage.style.display = 'none';

    faviconPreview?.classList.add('hidden');

  }



  function openAddSiteModal(site = null, index = -1, context = 'quick') {

    quickAccessEditContext = context === 'dock' ? 'dock' : 'quick';

    addSiteModalOverlay?.classList.remove('hidden');

    addSiteForm?.reset();

    if (siteSaveMessage) siteSaveMessage.style.display = 'none';

    

    if (site) {

      if (siteLinkInput) siteLinkInput.value = site.link;

      if (siteTitleInput) siteTitleInput.value = site.title;

      if (siteCustomFavicon) siteCustomFavicon.value = site.customFavicon || '';

      if (site.customFavicon) previewFavicon(site.customFavicon, siteFaviconPreviewImg, siteFaviconPreview);

      if (editQuickAccessIndex) editQuickAccessIndex.value = index;

      if (quickAccessModalTitle) quickAccessModalTitle.textContent = quickAccessEditContext === 'dock' ? 'Edit Bottom Quick Link' : 'Edit Quick Access Site';

      if (quickAccessSubmitBtn) quickAccessSubmitBtn.textContent = 'Update Site';

    } else {

      if (editQuickAccessIndex) editQuickAccessIndex.value = '';

      if (quickAccessModalTitle) quickAccessModalTitle.textContent = quickAccessEditContext === 'dock' ? 'Add Bottom Quick Link' : 'Add Quick Access Site';

      if (quickAccessSubmitBtn) quickAccessSubmitBtn.textContent = 'Add Site';

    }

    

    siteLinkInput?.focus();

  }



  function closeAddSiteModal() {

    addSiteModalOverlay?.classList.add('hidden');

    addSiteForm?.reset();

    if (siteSaveMessage) siteSaveMessage.style.display = 'none';

    if (editQuickAccessIndex) editQuickAccessIndex.value = '';

    quickAccessEditContext = 'quick';

    siteFaviconPreview?.classList.add('hidden');

  }



  // Keywords

  function addKeyword() {

    const value = keywordInput?.value.trim();

    if (!value) return;

    const tags = value.split(',').map(k => k.trim()).filter(k => k);

    tags.forEach(tag => { if (!keywords.includes(tag)) keywords.push(tag); });

    renderKeywords();

    if (keywordInput) keywordInput.value = '';

  }



  function renderKeywords() {

    if (!keywordsList) return;

    keywordsList.innerHTML = '';

    keywords.forEach(keyword => {

      const tag = document.createElement('div');

      tag.className = 'keyword-tag';

      tag.innerHTML = `${keyword} <span style="cursor:pointer;margin-left:4px;">&times;</span>`;

      tag.querySelector('span').addEventListener('click', () => {

        keywords = keywords.filter(k => k !== keyword);

        renderKeywords();

      });

      keywordsList.appendChild(tag);

    });

  }



  // ============================================

  // SAVE LINKS WITH DUPLICATE DETECTION

  // ============================================

  

  // Duplicate link modal elements

  const duplicateLinkModalOverlay = document.getElementById('duplicateLinkModalOverlay');

  const closeDuplicateModalBtn = document.getElementById('closeDuplicateModal');

  const duplicateKeepBothBtn = document.getElementById('duplicateKeepBothBtn');

  const duplicateMoveBtn = document.getElementById('duplicateMoveBtn');

  const duplicateDeleteOldBtn = document.getElementById('duplicateDeleteOldBtn');

  const duplicateExistingInfo = document.getElementById('duplicateExistingInfo');

  let pendingDuplicateData = null;



  if (closeDuplicateModalBtn) closeDuplicateModalBtn.addEventListener('click', () => { duplicateLinkModalOverlay?.classList.add('hidden'); pendingDuplicateData = null; });

  if (duplicateLinkModalOverlay) {

    duplicateLinkModalOverlay.addEventListener('click', (e) => {

      if (e.target === duplicateLinkModalOverlay) { duplicateLinkModalOverlay.classList.add('hidden'); pendingDuplicateData = null; }

    });

  }



  async function saveLinks(skipDuplicateCheck = false, duplicateAction = 'keep') {

    const urls = linkInput?.value.trim();

    if (!urls) { showNotification('Please enter at least one URL.', 'error'); return; }

    

    const urlArray = urls.split(',').map(u => u.trim()).filter(u => u);

    const folder = folderInput?.value.trim() || 'Miscellaneous';

    const isFavorite = favoriteCheckbox?.checked || false;

    const isPinned = pinCheckbox?.checked || false;

    const isIncognito = incognitoCheckbox?.checked || false;

    const notes = bookmarkNotes?.value.trim() || '';

    const customFaviconUrl = customFavicon?.value.trim() || '';

    

    const editMode = editIndexInput?.value && editFolderInput?.value;

    

    // If resuming from duplicate action

    if (skipDuplicateCheck && pendingDuplicateData) {

      const { url, linkData, dupFolder, dupIndex } = pendingDuplicateData;

      

      chrome.storage.local.get(['links'], (result) => {

        const links = result.links || {};

        

        if (duplicateAction === 'move') {

          // Remove from old folder, add to new

          if (links[dupFolder]?.[dupIndex]) {

            const oldLink = links[dupFolder][dupIndex];

            linkData.usage = oldLink.usage || 0;

            linkData.dateAdded = oldLink.dateAdded;

            linkData.favorite = oldLink.favorite || isFavorite;

            links[dupFolder].splice(dupIndex, 1);

            if (links[dupFolder].length === 0) delete links[dupFolder];

          }

          if (!links[folder]) links[folder] = [];

          links[folder].push(linkData);

        } else if (duplicateAction === 'delete') {

          // Delete old, add new

          if (links[dupFolder]?.[dupIndex]) {

            links[dupFolder].splice(dupIndex, 1);

            if (links[dupFolder].length === 0) delete links[dupFolder];

          }

          if (!links[folder]) links[folder] = [];

          links[folder].push(linkData);

        } else {

          // Keep both

          if (!links[folder]) links[folder] = [];

          links[folder].push(linkData);

        }

        

        chrome.storage.local.set({ links }, () => {

          renderFolders();

          displayLinksForCurrentFolder();

          renderRecentlyAdded();

          closeModal();

          duplicateLinkModalOverlay?.classList.add('hidden');

          pendingDuplicateData = null;

          showNotification('Bookmark saved successfully!');

        });

      });

      return;

    }

    

    // Check for duplicates (same folder block, different folder show options)

    if (!editMode && urlArray.length === 1) {

      let processedUrl = urlArray[0];

      if (!/^(https?:\/\/|file:\/\/)/i.test(processedUrl)) processedUrl = 'https://' + processedUrl;

      

      chrome.storage.local.get(['links'], (result) => {

        const links = result.links || {};

        

        // Check same folder - block completely

        if (links[folder]) {

          const sameFolderDup = links[folder].findIndex(l => l.link === processedUrl);

          if (sameFolderDup !== -1) {

            showNotification('This link already exists in this folder!', 'error');

            return;

          }

        }

        

        // Check other folders - show options

        let foundIn = null;

        let foundIndex = -1;

        for (const [fName, fLinks] of Object.entries(links)) {

          if (fName === folder) continue;

          const idx = fLinks.findIndex(l => l.link === processedUrl);

          if (idx !== -1) {

            foundIn = fName;

            foundIndex = idx;

            break;

          }

        }

        

        if (foundIn) {

          const existingLink = links[foundIn][foundIndex];

          const titles = (titleInput?.value.split(',').map(t => t.trim())) || [];

          const title = titles[0] || extractTitle(processedUrl);

          

          duplicateExistingInfo.innerHTML = `

            <div style="margin-bottom:6px;"><span class="dup-title">${existingLink.title}</span></div>

            <div style="margin-bottom:4px;"><span class="dup-folder">${foundIn}</span></div>

            <div class="dup-url">${existingLink.link}</div>

          `;

          

          const linkData = {

            link: processedUrl,

            title: title.trim(),

            tags: [...keywords],

            notes: notes,

            favorite: isFavorite,

            pinned: isPinned,

            incognito: isIncognito,

            usage: 0,

            dateAdded: new Date().toISOString()

          };

          if (customFaviconUrl) linkData.customFavicon = customFaviconUrl;

          

          pendingDuplicateData = { url: processedUrl, linkData, dupFolder: foundIn, dupIndex: foundIndex };

          duplicateLinkModalOverlay?.classList.remove('hidden');

          return;

        }

        

        // No duplicate found - proceed

        performSave(urlArray, folder, isFavorite, isPinned, isIncognito, notes, customFaviconUrl, editMode);

      });

      return;

    }

    

    performSave(urlArray, folder, isFavorite, isPinned, isIncognito, notes, customFaviconUrl, editMode);

  }



  function performSave(urlArray, folder, isFavorite, isPinned, isIncognito, notes, customFaviconUrl, editMode) {

    const editIndex = parseInt(editIndexInput?.value || '-1');

    const oldFolder = editFolderInput?.value || '';

    

    chrome.storage.local.get(['links'], (result) => {

      const links = result.links || {};

      

      if (editMode && links[oldFolder]?.[editIndex]) {

        links[oldFolder].splice(editIndex, 1);

        if (links[oldFolder].length === 0) delete links[oldFolder];

      }

      

      if (!links[folder]) links[folder] = [];

      

      urlArray.forEach((url, idx) => {

        let processedUrl = url;

        if (!/^(https?:\/\/|file:\/\/)/i.test(processedUrl)) processedUrl = 'https://' + processedUrl;

        

        const titles = titleInput?.value.split(',').map(t => t.trim()) || [];

        const title = titles[idx] || extractTitle(processedUrl);

        

        const linkData = {

          link: processedUrl,

          title: title.trim(),

          tags: [...keywords],

          notes: notes,

          favorite: isFavorite,

          pinned: isPinned,

          incognito: isIncognito,

          usage: 0,

          dateAdded: new Date().toISOString()

        };

        

        if (customFaviconUrl) linkData.customFavicon = customFaviconUrl;

        

        links[folder].push(linkData);

      });

      

      chrome.storage.local.set({ links }, () => {

        renderFolders();

        displayLinksForCurrentFolder();

        renderRecentlyAdded();

        showNotification('Bookmark(s) saved successfully!');

        closeModal();

      });

    });

  }



  // Duplicate modal button handlers

  if (duplicateKeepBothBtn) {

    duplicateKeepBothBtn.addEventListener('click', () => {

      saveLinks(true, 'keep');

    });

  }

  if (duplicateMoveBtn) {

    duplicateMoveBtn.addEventListener('click', () => {

      saveLinks(true, 'move');

    });

  }

  if (duplicateDeleteOldBtn) {

    duplicateDeleteOldBtn.addEventListener('click', () => {

      saveLinks(true, 'delete');

    });

  }



  function deleteLink(folder, index) {

    chrome.storage.local.get(['links'], (result) => {

      const links = result.links || {};

      if (!links[folder]?.[index]) return;

      

      const deletedLink = links[folder][index];

      const deletedKey = `${folder}::${deletedLink.link}`;

      

      links[folder].splice(index, 1);

      if (links[folder].length === 0) delete links[folder];

      

      // Clean up custom order

      allLinksCustomOrder = allLinksCustomOrder.filter(k => k !== deletedKey);

      if (customLinkOrder[folder]) {

        customLinkOrder[folder] = customLinkOrder[folder].filter(k => k !== deletedKey);

      }

      

      chrome.storage.local.set({ 

        links, 

        allLinksCustomOrder,

        customLinkOrder 

      }, () => {

        renderFolders();

        displayLinksForCurrentFolder();

        renderRecentlyAdded();

        renderMostUsed();

        showNotification('Bookmark deleted successfully!');

      });

    });

  }



  // ============================================

  // FOLDER FUNCTIONS

  // ============================================

  

  function createFolder(folderPath, folderColor = '') {

    // Validate only the last segment (folder name), not the full path

    const folderName = getFolderName(folderPath);

    const validation = isValidFolderName(folderName);

    if (!validation.valid) {

      showNotification(validation.error, 'error');

      return;

    }

    

    chrome.storage.local.get(['links', 'folderOrder', 'favoriteFolders'], (result) => {

      const links = result.links || {};

      const favFolders = result.favoriteFolders || {};

      if (links[folderPath]) { 

        showNotification('Folder already exists!', 'error'); 

        return; 

      }

      

      links[folderPath] = [];

      let newFolderOrder = result.folderOrder || Object.keys(links);

      if (!newFolderOrder.includes(folderPath)) newFolderOrder.push(folderPath);

      

      // Save folder color if selected

      if (folderColor) {

        favFolders[folderPath] = folderColor;

      }

      

      chrome.storage.local.set({ links, folderOrder: newFolderOrder, favoriteFolders: favFolders }, () => {

        folderOrder = newFolderOrder;

        favoriteFolders = favFolders;

        renderFolders();

        selectFolder(folderPath);

        showNotification('Folder created successfully!');

      });

    });

  }



  function renameFolder(oldPath, newName) {

    // Validate new name

    const validation = isValidFolderName(newName);

    if (!validation.valid) {

      showNotification(validation.error, 'error');

      return;

    }

    

    chrome.storage.local.get(['links', 'folderOrder', 'pinnedFolders', 'favoriteFolders', 'folderIcons', 'folderPasswords'], (result) => {

      const links = result.links || {};

      

      // Build new full path

      const parentPath = getParentFolder(oldPath);

      const newPath = buildFolderPath(parentPath, newName);

      

      if (newPath === oldPath) return;

      if (links[newPath]) { 

        showNotification('Folder name already exists!', 'error'); 

        return; 

      }

      

      // Get all folders that need path update (this folder + all descendants)

      const allFolders = Object.keys(links);

      const descendants = getAllDescendants(oldPath, allFolders);

      const pathMap = {}; // oldPath -> newPath mapping

      

      pathMap[oldPath] = newPath;

      descendants.forEach(desc => {

        pathMap[desc] = newPath + desc.substring(oldPath.length);

      });

      

      // Rebuild links object with new paths

      const newLinks = {};

      Object.entries(links).forEach(([path, linkArr]) => {

        const updatedPath = pathMap[path] || path;

        newLinks[updatedPath] = linkArr;

      });

      

      // Update folderOrder

      const newFolderOrder = (result.folderOrder || []).map(n => pathMap[n] || n);

      

      // Update pinnedFolders

      const newPinnedFolders = (result.pinnedFolders || []).map(n => pathMap[n] || n);

      

      // Update favoriteFolders

      const newFavoriteFolders = {};

      for (const [key, value] of Object.entries(result.favoriteFolders || {})) {

        newFavoriteFolders[pathMap[key] || key] = value;

      }



      // Update folderIcons

      const newFolderIcons = {};

      for (const [key, value] of Object.entries(result.folderIcons || {})) {

        newFolderIcons[pathMap[key] || key] = value;

      }



      // Update folderPasswords

      const newFolderPasswords = {};

      for (const [key, value] of Object.entries(result.folderPasswords || {})) {

        newFolderPasswords[pathMap[key] || key] = value;

      }

      

      // Update expandedFolders

      const newExpandedFolders = new Set();

      expandedFolders.forEach(f => newExpandedFolders.add(pathMap[f] || f));

      expandedFolders = newExpandedFolders;

      

      // Update hiddenFolders

      const newHiddenFolders = new Set();

      hiddenFolders.forEach(f => newHiddenFolders.add(pathMap[f] || f));

      hiddenFolders = newHiddenFolders;

      

      chrome.storage.local.set({ 

        links: newLinks, 

        folderOrder: newFolderOrder, 

        pinnedFolders: newPinnedFolders, 

        favoriteFolders: newFavoriteFolders, 

        folderIcons: newFolderIcons,

        folderPasswords: newFolderPasswords,

        expandedFolders: Array.from(expandedFolders),

        hiddenFolders: Array.from(hiddenFolders)

      }, () => {

        folderOrder = newFolderOrder;

        pinnedFolders = newPinnedFolders;

        favoriteFolders = newFavoriteFolders;

        folderIcons = newFolderIcons;

        folderPasswords = newFolderPasswords;

        currentFolder = pathMap[currentFolder] || currentFolder;

        renderFolders();

        displayLinksForCurrentFolder();

        showNotification('Folder renamed successfully!');

      });

    });

  }



  function deleteFolder(folderPath) {

    chrome.storage.local.get(['links', 'folderOrder', 'pinnedFolders', 'favoriteFolders', 'folderIcons', 'folderPasswords'], (result) => {

      const links = result.links || {};

      const allFolders = Object.keys(links);

      

      // Get all folders to delete (this folder + all descendants)

      const foldersToDelete = [folderPath, ...getAllDescendants(folderPath, allFolders)];

      

      let totalLinks = 0;

      foldersToDelete.forEach(f => {

        totalLinks += (links[f] || []).length;

        delete links[f];

      });

      

      // Clean up all related data for all deleted folders

      const newFolderOrder = (result.folderOrder || []).filter(n => !foldersToDelete.includes(n));

      const newPinnedFolders = (result.pinnedFolders || []).filter(n => !foldersToDelete.includes(n));

      

      const newFavoriteFolders = { ...result.favoriteFolders || {} };

      foldersToDelete.forEach(f => delete newFavoriteFolders[f]);

      

      const newFolderIcons = { ...result.folderIcons || {} };

      foldersToDelete.forEach(f => delete newFolderIcons[f]);

      

      const newFolderPasswords = { ...result.folderPasswords || {} };

      foldersToDelete.forEach(f => delete newFolderPasswords[f]);

      

      // Remove from expanded folders and hidden folders

      foldersToDelete.forEach(f => {

        expandedFolders.delete(f);

        hiddenFolders.delete(f);

      });

      

      chrome.storage.local.set({ 

        links, 

        folderOrder: newFolderOrder, 

        pinnedFolders: newPinnedFolders,

        favoriteFolders: newFavoriteFolders, 

        folderIcons: newFolderIcons,

        folderPasswords: newFolderPasswords,

        expandedFolders: Array.from(expandedFolders),

        hiddenFolders: Array.from(hiddenFolders)

      }, () => {

        folderOrder = newFolderOrder;

        pinnedFolders = newPinnedFolders;

        favoriteFolders = newFavoriteFolders;

        folderIcons = newFolderIcons;

        folderPasswords = newFolderPasswords;

        currentFolder = 'All Links';

        renderFolders();

        displayLinksForCurrentFolder();

        

        const subfolderCount = foldersToDelete.length - 1;

        const msg = subfolderCount > 0 

          ? `Folder deleted with ${subfolderCount} subfolder(s) and ${totalLinks} link(s).`

          : `Folder deleted with ${totalLinks} link(s).`;

        showNotification(msg);

      });

    });

  }



  function togglePinFolder(folderName) {

    chrome.storage.local.get(['pinnedFolders'], (result) => {

      let newPinnedFolders = result.pinnedFolders || [];

      const index = newPinnedFolders.indexOf(folderName);

      

      if (index > -1) {

        newPinnedFolders.splice(index, 1);

        showNotification('Folder unpinned.', 'success');

      } else {

        newPinnedFolders.push(folderName);

        showNotification('Folder pinned!', 'success');

      }

      

      chrome.storage.local.set({ pinnedFolders: newPinnedFolders }, () => {

        pinnedFolders = newPinnedFolders;

        renderFolders();

      });

    });

  }



  function selectFolder(folderName) {

    doSelectFolder(folderName);

  }



  function doSelectFolder(folderPath) {

    currentFolder = folderPath;

    

    // Auto-expand all parent folders so the selected folder is visible

    if (folderPath !== 'All Links') {

      let parent = getParentFolder(folderPath);

      let needsRerender = false;

      while (parent) {

        if (!expandedFolders.has(parent)) {

          expandedFolders.add(parent);

          needsRerender = true;

        }

        parent = getParentFolder(parent);

      }

      if (needsRerender) {

        chrome.storage.local.set({ expandedFolders: Array.from(expandedFolders) });

        renderFolders(folderSearchInput?.value.trim() || '');

      }

    }

    

    document.querySelectorAll('.folder-item').forEach(item => {

      item.classList.toggle('active', item.dataset.folderName === folderPath);

    });

    

    // Render full path breadcrumb

    renderBreadcrumb(folderPath);

    

    // Update total links count for All Links view

    updateAllLinksCount();

    

    // Note: Don't clear selectedBookmarks on folder change - support multi-folder selection

    // selectedBookmarks are only cleared when explicitly needed

    

    updateSelectedLinksUI();

    displayLinksForCurrentFolder(searchInput?.value.trim());

  }



    // Update total links count in All Links breadcrumb

  function updateAllLinksCount() {

    if (currentFolder !== 'All Links') return;

    

    chrome.storage.local.get(['links'], (result) => {

      const allLinks = result.links || {};

      let visibleCount = 0;

      

      Object.entries(allLinks).forEach(([folder, links]) => {

        if (!isFolderOrParentHidden(folder)) {

          if (showFavoritesOnlyEnabled) {

            visibleCount += links.filter(l => l.favorite).length;

          } else {

            visibleCount += links.length;

          }

        }

      });

      

      // Update breadcrumb current text with count

      const breadcrumbPath = document.getElementById('breadcrumbPath');

      if (!breadcrumbPath) return;

      

      const currentSpan = breadcrumbPath.querySelector('.breadcrumb-item.current');

      if (currentSpan) {

        const displayText = showFavoritesOnlyEnabled ? 'Favorites' : 'All Links';

        

        let countHtml = `<span class="total-links-count">${visibleCount}</span>`;

        

        currentSpan.innerHTML = `${displayText} ${countHtml}`;

      }

    });

  }

  

  // Render full path breadcrumb with each segment clickable

  function renderBreadcrumb(folderPath) {

    const breadcrumbPath = document.getElementById('breadcrumbPath');

    if (!breadcrumbPath) return;

    

    breadcrumbPath.innerHTML = '';

    

    if (folderPath === 'All Links') {

      const displayText = showFavoritesOnlyEnabled ? 'Favorites' : 'All Links';

      breadcrumbPath.innerHTML = `

        <svg class="breadcrumb-separator" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">

          <polyline points="9 18 15 12 9 6"></polyline>

        </svg>

        <span class="breadcrumb-item current">${displayText}</span>

      `;

      // Update count after DOM update

      setTimeout(() => updateAllLinksCount(), 0);

      return;

    }

    

    // Split path into segments

    const segments = folderPath.split('/');

    let cumulativePath = '';

    

    segments.forEach((segment, index) => {

      cumulativePath = index === 0 ? segment : cumulativePath + '/' + segment;

      const isLast = index === segments.length - 1;

      const currentPath = cumulativePath;

      

      // Separator

      const separator = document.createElement('span');

      separator.className = 'breadcrumb-separator-wrap';

      separator.innerHTML = `

        <svg class="breadcrumb-separator" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">

          <polyline points="9 18 15 12 9 6"></polyline>

        </svg>

      `;

      breadcrumbPath.appendChild(separator);

      

      // Segment

      const segmentEl = document.createElement('span');

      segmentEl.className = isLast ? 'breadcrumb-item current' : 'breadcrumb-item clickable';

      segmentEl.textContent = segment;

      segmentEl.title = currentPath;

      

      if (!isLast) {

        segmentEl.addEventListener('click', () => {

          selectFolder(currentPath);

        });

      }

      

      // Make breadcrumb a drop target for bookmarks

      segmentEl.addEventListener('dragover', (e) => {

        if (draggedData && draggedData.link && !draggedData.type) {

          e.preventDefault();

          e.dataTransfer.dropEffect = 'move';

          segmentEl.classList.add('breadcrumb-drop-target');

        }

      });

      

      segmentEl.addEventListener('dragleave', () => {

        segmentEl.classList.remove('breadcrumb-drop-target');

      });

      

      segmentEl.addEventListener('drop', (e) => {

        if (draggedData && draggedData.link && !draggedData.type) {

          e.preventDefault();

          segmentEl.classList.remove('breadcrumb-drop-target');

          moveBookmarkToFolder(draggedData, currentPath);

        }

      });

      

      breadcrumbPath.appendChild(segmentEl);

    });

  }

  

  // Move a bookmark to a specific folder (used by breadcrumb & folder drops)

  function moveBookmarkToFolder(sourceLink, targetFolder) {

    if (sourceLink.folder === targetFolder) {

      showNotification('Bookmark is already in this folder', 'warning');

      return;

    }

    

    chrome.storage.local.get(['links'], (result) => {

      const links = result.links || {};

      

      if (!links[sourceLink.folder]?.[sourceLink.index]) {

        showNotification('Source bookmark not found', 'error');

        return;

      }

      

      // Remove from source

      const [movedLink] = links[sourceLink.folder].splice(sourceLink.index, 1);

      

      // Add to target

      if (!links[targetFolder]) links[targetFolder] = [];

      links[targetFolder].push(movedLink);

      

      // Clean up empty source folder (but keep if it's a defined folder)

      // Actually we keep empty folders - user might want to reuse

      

      chrome.storage.local.set({ links }, () => {

        renderFolders();

        displayLinksForCurrentFolder();

        showNotification(`Moved to "${getFolderName(targetFolder)}"`, 'success');

      });

    });

  }



  function renderFolders(searchQuery = '') {

    chrome.storage.local.get(['links', 'folderOrder', 'pinnedFolders', 'favoriteFolders', 'folderIcons'], (result) => {

      const links = result.links || {};

      const storedFavoriteFolders = result.favoriteFolders || {};

      const storedFolderIcons = result.folderIcons || {};

      const query = searchQuery.toLowerCase();

      

      if (!folderList) return;

      folderList.innerHTML = '';

      

      // All Links item (always at top)

      const allLinksItem = createFolderItem('All Links', null, true);

      folderList.appendChild(allLinksItem);

      

      const allFolderPaths = Object.keys(links);

      

      // Get root folders in order

      let orderedFolders = result.folderOrder || allFolderPaths;

      orderedFolders = orderedFolders.filter(name => links[name] !== undefined);

      allFolderPaths.forEach(name => {

        if (!orderedFolders.includes(name)) orderedFolders.push(name);

      });

      

      // Filter root folders only for top-level rendering

      const rootFolders = orderedFolders.filter(f => isRootFolder(f));

      

      // If searching, expand all matching branches automatically

      const searchExpanded = new Set();

      if (query) {

        allFolderPaths.forEach(folderPath => {

          const matches = folderPath.toLowerCase().includes(query) ||

            (links[folderPath] || []).some(link =>

              link.title?.toLowerCase().includes(query) ||

              link.link?.toLowerCase().includes(query) ||

              link.tags?.some(tag => tag.toLowerCase().includes(query))

            );

          

          if (matches) {

            // Add all parent paths so this folder becomes visible

            let parent = getParentFolder(folderPath);

            while (parent) {

              searchExpanded.add(parent);

              parent = getParentFolder(parent);

            }

          }

        });

      }

      

      // Recursive render function

      function renderFolderTree(folderPath, depth) {

        // Search filter

        if (query) {

          const matchesSelf = folderPath.toLowerCase().includes(query);

          const matchesLinks = (links[folderPath] || []).some(link =>

            link.title?.toLowerCase().includes(query) ||

            link.link?.toLowerCase().includes(query) ||

            link.tags?.some(tag => tag.toLowerCase().includes(query))

          );

          const hasMatchingDescendant = getAllDescendants(folderPath, allFolderPaths).some(desc => {

            return desc.toLowerCase().includes(query) ||

              (links[desc] || []).some(link =>

                link.title?.toLowerCase().includes(query) ||

                link.link?.toLowerCase().includes(query) ||

                link.tags?.some(tag => tag.toLowerCase().includes(query))

              );

          });

          

          if (!matchesSelf && !matchesLinks && !hasMatchingDescendant) return;

        }

        

        const directChildren = getDirectChildren(folderPath, allFolderPaths);

        const hasChildren = directChildren.length > 0;

        const totalCount = countTotalLinks(folderPath, links);

        

        const folderItem = createFolderItem(folderPath, totalCount, false, hasChildren, depth);

        const folderText = folderItem.querySelector('.folder-item-text');

        

        if (storedFavoriteFolders[folderPath]) {

          folderText.classList.add('folder-colored-label');

          folderText.style.setProperty('--folder-label-color', storedFavoriteFolders[folderPath]);

          folderItem.style.setProperty('--folder-label-color', storedFavoriteFolders[folderPath]);

        }

        

        folderList.appendChild(folderItem);

        

        // Render children if expanded (or during search)

        const isExpanded = expandedFolders.has(folderPath) || searchExpanded.has(folderPath);

        if (hasChildren && isExpanded) {

          // Sort children by folder order

          const sortedChildren = directChildren.sort((a, b) => {

            const idxA = orderedFolders.indexOf(a);

            const idxB = orderedFolders.indexOf(b);

            if (idxA === -1 && idxB === -1) return 0;

            if (idxA === -1) return 1;

            if (idxB === -1) return -1;

            return idxA - idxB;

          });

          

          sortedChildren.forEach(child => {

            renderFolderTree(child, depth + 1);

          });

        }

      }

      

      // Render only root folders (children rendered recursively)

      rootFolders.forEach(rootFolder => {

        renderFolderTree(rootFolder, 0);

      });

    });

  }



  function createFolderItem(folderPath, count, isAllLinks = false, hasChildren = false, depth = 0) {

    const div = document.createElement('div');

    div.className = 'folder-item';

    div.dataset.folderName = folderPath;

    div.dataset.depth = depth;

    div.style.paddingLeft = (12 + (depth * 16)) + 'px';

    

    if (!isAllLinks) div.draggable = true;

    if (folderPath === currentFolder) div.classList.add('active');

    if (pinnedFolders.includes(folderPath)) div.classList.add('pinned');

    if (depth > 0) div.classList.add('subfolder');

    

    // Display only the folder name, not the full path

    const displayName = isAllLinks ? folderPath : getFolderName(folderPath);

    

    const countBadge = count !== null ? `<span class="folder-count">${count}</span>` : '';

    

    // Expand/collapse arrow for folders with children

    let arrowHtml = '';

    if (hasChildren && !isAllLinks) {

      const isExpanded = expandedFolders.has(folderPath);

      arrowHtml = `<span class="folder-arrow ${isExpanded ? 'expanded' : ''}" data-arrow="${folderPath}">

        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">

          <polyline points="9 18 15 12 9 6"></polyline>

        </svg>

      </span>`;

    } else if (!isAllLinks) {

      arrowHtml = `<span class="folder-arrow-placeholder"></span>`;

    }

    

    // Get folder icon (custom emoji, or default based on state)

    let iconHtml = '';

    if (isAllLinks) {

      iconHtml = `<span class="folder-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></span>`;

    } else {

      const customIcon = folderIcons[folderPath];

      const folderColor = favoriteFolders[folderPath] || '';

      

      let displayIcon;

      if (customIcon) {

        // Custom emoji icon - wrap with color span

        const colorStyle = folderColor ? ` style="color:${folderColor}"` : '';

        displayIcon = `<span class="folder-icon-text"${colorStyle}>${customIcon}</span>`;

      } else {

        // Default colored SVG folder icon - uses theme primary color when no custom color

        const fillColor = folderColor || 'var(--primary-color)';

        displayIcon = `<svg class="folder-svg-fill" width="16" height="16" viewBox="0 0 24 24" fill="${fillColor}" stroke="${folderColor ? 'rgba(0,0,0,0.3)' : 'var(--primary-color)'}" stroke-width="1.5" opacity="${folderColor ? '1' : '0.7'}"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;

      }

      

      iconHtml = `<span class="folder-icon">${displayIcon}</span>`;

    }

    

    // Visibility toggle button (eye icon) - only for non-All Links folders

    let visibilityBtnHtml = '';

    if (!isAllLinks) {

      const isHidden = hiddenFolders.has(folderPath);

      const eyeIcon = isHidden 

        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">

            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>

            <line x1="1" y1="1" x2="23" y2="23"></line>

          </svg>`

        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">

            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>

            <circle cx="12" cy="12" r="3"></circle>

          </svg>`;

      

      visibilityBtnHtml = `<button class="folder-visibility-btn ${isHidden ? 'hidden-folder' : ''}" 

        data-visibility="${folderPath}" 

        title="${isHidden ? 'Show in All Links' : 'Hide from All Links'}">

        ${eyeIcon}

      </button>`;

    }

    

    // Add hidden class to folder-item if folder is hidden

    if (hiddenFolders.has(folderPath)) {

      div.classList.add('folder-hidden');

    }

    

    div.innerHTML = `${arrowHtml}${iconHtml}<span class="folder-item-text">${displayName}</span>${countBadge}${visibilityBtnHtml}`;

    

    // Click handler - separate arrow click, visibility button, and folder click

    div.addEventListener('click', (e) => {

      const arrowClicked = e.target.closest('[data-arrow]');

      const visibilityClicked = e.target.closest('[data-visibility]');

      

      if (visibilityClicked) {

        e.stopPropagation();

        e.preventDefault();

        toggleFolderVisibility(folderPath);

        return;

      }

      

      if (arrowClicked) {

        e.stopPropagation();

        toggleFolderExpand(folderPath);

      } else {

        selectFolder(folderPath);

      }

    });

    

    if (!isAllLinks) {

      div.addEventListener('contextmenu', (e) => showFolderContextMenu(e, folderPath));

      

      // Drag events

      div.addEventListener('dragstart', (e) => {

        e.dataTransfer.effectAllowed = 'move';

        e.dataTransfer.setData('text/plain', folderPath);

        draggedElement = div;

        draggedData = { type: 'folder', name: folderPath };

        setTimeout(() => div.classList.add('dragging'), 0);

      });

      

      div.addEventListener('dragend', () => {

        div.classList.remove('dragging');

        hideDropIndicator();

        div.classList.remove('drag-over-nest');

        draggedElement = null;

        draggedData = null;

      });

      

      div.addEventListener('dragover', (e) => {

        e.preventDefault();

        

        // Case 1: Bookmark dragged onto folder → move bookmark into folder

        if (draggedData && draggedData.link && !draggedData.type) {

          e.dataTransfer.dropEffect = 'move';

          div.classList.add('drag-over-nest');

          return;

        }

        

        // Case 2: Folder dragged onto folder

        if (draggedData?.type === 'folder' && draggedData.name !== folderPath) {

          // Prevent dropping parent into its own child (would create infinite loop)

          if (folderPath.startsWith(draggedData.name + '/')) {

            e.dataTransfer.dropEffect = 'none';

            return;

          }

          

          e.dataTransfer.dropEffect = 'move';

          

          // Determine action based on drop position:

          // Top/Bottom edge = reorder (before/after)

          // Middle = nest (make subfolder)

          const rect = div.getBoundingClientRect();

          const y = e.clientY - rect.top;

          const height = rect.height;

          

          if (y < height * 0.25) {

            // Top edge - place before

            div.classList.remove('drag-over-nest');

            div.classList.add('drag-over');

            currentDropTarget = folderPath;

            currentDropPosition = 'before';

            showDropIndicatorAt(div, 'before', false);

          } else if (y > height * 0.75) {

            // Bottom edge - place after

            div.classList.remove('drag-over-nest');

            div.classList.add('drag-over');

            currentDropTarget = folderPath;

            currentDropPosition = 'after';

            showDropIndicatorAt(div, 'after', false);

          } else {

            // Middle - nest as subfolder

            div.classList.remove('drag-over');

            div.classList.add('drag-over-nest');

            hideDropIndicator();

            currentDropTarget = folderPath;

            currentDropPosition = 'nest';

          }

        }

      });

      

      div.addEventListener('dragleave', (e) => {

        // Only remove if truly leaving

        if (!div.contains(e.relatedTarget)) {

          div.classList.remove('drag-over');

          div.classList.remove('drag-over-nest');

        }

      });

      

      div.addEventListener('drop', (e) => {

        e.preventDefault();

        div.classList.remove('drag-over');

        div.classList.remove('drag-over-nest');

        hideDropIndicator();

        

        // Case 1: Bookmark dropped on folder → move bookmark

        if (draggedData && draggedData.link && !draggedData.type) {

          moveBookmarkToFolder(draggedData, folderPath);

          return;

        }

        

        // Case 2: Folder dropped on folder

        if (draggedData?.type === 'folder' && draggedData.name !== folderPath) {

          // Prevent dropping into own descendant

          if (folderPath.startsWith(draggedData.name + '/')) {

            showNotification('Cannot move folder into its own subfolder', 'error');

            return;

          }

          

          if (currentDropPosition === 'nest') {

            // Nest as subfolder

            nestFolderInto(draggedData.name, folderPath);

          } else {

            // Reorder (before/after) - keep as same level as target

            const position = currentDropPosition || 'after';

            reorderFolders(draggedData.name, folderPath, position);

          }

        }

        

        currentDropTarget = null;

        currentDropPosition = null;

      });

    }

    

    return div;

  }

  

  // Move a folder into another folder as its subfolder

  function nestFolderInto(sourceFolder, targetFolder) {

    const newPath = buildFolderPath(targetFolder, getFolderName(sourceFolder));

    

    chrome.storage.local.get(['links'], (result) => {

      const links = result.links || {};

      

      if (links[newPath]) {

        showNotification(`Folder "${getFolderName(sourceFolder)}" already exists in "${getFolderName(targetFolder)}"`, 'error');

        return;

      }

      

      // Use rename logic to move folder and all descendants

      renameFolderToNewPath(sourceFolder, newPath);

      

      // Expand target folder to show the moved folder

      expandedFolders.add(targetFolder);

      chrome.storage.local.set({ expandedFolders: Array.from(expandedFolders) });

    });

  }

  

  // Internal: Move folder to a new path (used by nesting and root-move)

  function renameFolderToNewPath(oldPath, newPath) {

    chrome.storage.local.get(['links', 'folderOrder', 'pinnedFolders', 'favoriteFolders', 'folderIcons', 'folderPasswords'], (result) => {

      const links = result.links || {};

      

      if (newPath === oldPath) return;

      if (links[newPath]) { 

        showNotification('Target folder already exists!', 'error'); 

        return; 

      }

      

      const allFolders = Object.keys(links);

      const descendants = getAllDescendants(oldPath, allFolders);

      const pathMap = {};

      

      pathMap[oldPath] = newPath;

      descendants.forEach(desc => {

        pathMap[desc] = newPath + desc.substring(oldPath.length);

      });

      

      const newLinks = {};

      Object.entries(links).forEach(([path, linkArr]) => {

        const updatedPath = pathMap[path] || path;

        newLinks[updatedPath] = linkArr;

      });

      

      const newFolderOrder = (result.folderOrder || []).map(n => pathMap[n] || n);

      const newPinnedFolders = (result.pinnedFolders || []).map(n => pathMap[n] || n);

      

      const newFavoriteFolders = {};

      for (const [key, value] of Object.entries(result.favoriteFolders || {})) {

        newFavoriteFolders[pathMap[key] || key] = value;

      }

      

      const newFolderIcons = {};

      for (const [key, value] of Object.entries(result.folderIcons || {})) {

        newFolderIcons[pathMap[key] || key] = value;

      }

      

      const newFolderPasswords = {};

      for (const [key, value] of Object.entries(result.folderPasswords || {})) {

        newFolderPasswords[pathMap[key] || key] = value;

      }

      

      const newExpandedFolders = new Set();

      expandedFolders.forEach(f => newExpandedFolders.add(pathMap[f] || f));

      expandedFolders = newExpandedFolders;

      

      chrome.storage.local.set({ 

        links: newLinks, 

        folderOrder: newFolderOrder, 

        pinnedFolders: newPinnedFolders, 

        favoriteFolders: newFavoriteFolders, 

        folderIcons: newFolderIcons,

        folderPasswords: newFolderPasswords,

        expandedFolders: Array.from(expandedFolders)

      }, () => {

        folderOrder = newFolderOrder;

        pinnedFolders = newPinnedFolders;

        favoriteFolders = newFavoriteFolders;

        folderIcons = newFolderIcons;

        folderPasswords = newFolderPasswords;

        currentFolder = pathMap[currentFolder] || currentFolder;

        renderFolders();

        displayLinksForCurrentFolder();

        showNotification(`Folder moved successfully!`, 'success');

      });

    });

  }

  

  // Toggle folder expand/collapse

  function toggleFolderExpand(folderPath) {

    if (expandedFolders.has(folderPath)) {

      expandedFolders.delete(folderPath);

    } else {

      expandedFolders.add(folderPath);

    }

    chrome.storage.local.set({ expandedFolders: Array.from(expandedFolders) });

    renderFolders(folderSearchInput?.value.trim() || '');

  }



  function reorderFolders(draggedFolderName, targetFolderName, position = 'after') {

    if (!draggedFolderName || !targetFolderName || draggedFolderName === targetFolderName) return;

    const sourceParent = getParentFolder(draggedFolderName);

    const targetParent = getParentFolder(targetFolderName);

    if (sourceParent !== targetParent) {

      showNotification('To reorder folders, drop them at the same folder level. Drop in the middle to create a subfolder.', 'info');

      return;

    }

    chrome.storage.local.get(['folderOrder', 'links'], (result) => {

      const links = result.links || {};

      const allNames = Object.keys(links);

      let order = Array.isArray(result.folderOrder) ? result.folderOrder.slice() : allNames.slice();

      allNames.forEach(name => { if (!order.includes(name)) order.push(name); });

      order = order.filter(name => links[name] !== undefined && name !== draggedFolderName);

      const targetIndex = order.indexOf(targetFolderName);

      const insertIndex = targetIndex < 0 ? order.length : targetIndex + (position === 'after' ? 1 : 0);

      order.splice(insertIndex, 0, draggedFolderName);



      // Persist immediately, then redraw from the saved order.

      chrome.storage.local.set({ folderOrder: order }, () => {

        folderOrder = order;

        renderFolders(folderSearchInput?.value || '');

        showNotification('Folder order updated', 'success');

      });

    });

  }



  // ============================================

  // DISPLAY LINKS

  // ============================================

  

  function displayLinksForCurrentFolder(searchQuery = '') {

    // Update count when links change

    if (currentFolder === 'All Links') {

      setTimeout(() => updateAllLinksCount(), 0);

    }

    

    chrome.storage.local.get(['links'], (result) => {

      const allLinks = result.links || {};

      let linksToDisplay = [];

      const allFolderPaths = Object.keys(allLinks);

      

      if (currentFolder === 'All Links') {

        // All Links view: show everything EXCEPT hidden folders

        if (showFavoritesOnlyEnabled) {

          Object.entries(allLinks).forEach(([folder, links]) => {

            if (isFolderOrParentHidden(folder)) return; // Skip hidden folders

            links.forEach((link, index) => {

              if (link.favorite) linksToDisplay.push({ ...link, folder, index });

            });

          });

        } else {

          Object.entries(allLinks).forEach(([folder, links]) => {

            if (isFolderOrParentHidden(folder)) return; // Skip hidden folders

            links.forEach((link, index) => {

              linksToDisplay.push({ ...link, folder, index });

            });

          });

        }

      } else if (allLinks[currentFolder]) {

        // Specific folder view

        

        // Add current folder's own links

        allLinks[currentFolder].forEach((link, index) => {

          linksToDisplay.push({ ...link, folder: currentFolder, index });

        });

        

        // If setting enabled, also add all subfolder links

        if (showSubfolderContentEnabled) {

          const descendants = getAllDescendants(currentFolder, allFolderPaths);

          descendants.forEach(subfolder => {

            (allLinks[subfolder] || []).forEach((link, index) => {

              linksToDisplay.push({ ...link, folder: subfolder, index });

            });

          });

        }

      }

      

      if (searchQuery) {

        const query = searchQuery.toLowerCase();

        linksToDisplay = linksToDisplay.filter(link =>

          link.title?.toLowerCase().includes(query) ||

          link.link?.toLowerCase().includes(query) ||

          link.tags?.some(tag => tag.toLowerCase().includes(query)) ||

          link.notes?.toLowerCase().includes(query)

        );

      }

      

      // Apply custom order if exists

      linksToDisplay = applyCustomOrder(linksToDisplay);

      

      // For All Links: sort by folder order, with favorites at top

      if (currentFolder === 'All Links') {

        const storedFolderOrder = folderOrder || [];

        linksToDisplay.sort((a, b) => {

          // Favorites first

          if (a.favorite && !b.favorite) return -1;

          if (!a.favorite && b.favorite) return 1;

          // Then by folder order

          const folderIdxA = storedFolderOrder.indexOf(a.folder);

          const folderIdxB = storedFolderOrder.indexOf(b.folder);

          const fIdxA = folderIdxA === -1 ? 9999 : folderIdxA;

          const fIdxB = folderIdxB === -1 ? 9999 : folderIdxB;

          if (fIdxA !== fIdxB) return fIdxA - fIdxB;

          // Within same folder, by pinned then usage

          if (a.pinned && !b.pinned) return -1;

          if (!a.pinned && b.pinned) return 1;

          return (b.usage || 0) - (a.usage || 0);

        });

      }

      

      if (!linksContainer) return;

      linksContainer.innerHTML = '';

      

      if (linksToDisplay.length === 0) {

        const message = showFavoritesOnlyEnabled && currentFolder === 'All Links'

          ? 'No favorite bookmarks found.'

          : 'No bookmarks found';

        linksContainer.innerHTML = `<div class="no-links-message">${message}</div>`;

        return;

      }

      

      // Check if we're showing mixed folders (from subfolders)

      const isMixedFolderView = currentFolder !== 'All Links' && 

                                 showSubfolderContentEnabled && 

                                 linksToDisplay.some(l => l.folder !== currentFolder);

      

      linksToDisplay.forEach(link => {

        const linkElement = createLinkElement(link, isMixedFolderView);

        linksContainer.appendChild(linkElement);

      });

    });

  }



    // ============================================

  // NESTED FOLDER HELPERS (Path-based)

  // ============================================

  

  // Get parent folder path from a folder path

  // "Design/Icons/SVG" -> "Design/Icons"

  // "Design" -> null (root)

  function getParentFolder(folderPath) {

    if (!folderPath || !folderPath.includes('/')) return null;

    return folderPath.substring(0, folderPath.lastIndexOf('/'));

  }

  

  // Get folder name from path

  // "Design/Icons/SVG" -> "SVG"

  // "Design" -> "Design"

  function getFolderName(folderPath) {

    if (!folderPath) return '';

    return folderPath.includes('/') 

      ? folderPath.substring(folderPath.lastIndexOf('/') + 1)

      : folderPath;

  }

  

  // Get folder depth (0 = root, 1 = first level subfolder, etc.)

  function getFolderDepth(folderPath) {

    if (!folderPath) return 0;

    return folderPath.split('/').length - 1;

  }

  

  // Get all direct children of a folder

  function getDirectChildren(folderPath, allFolders) {

    return allFolders.filter(f => {

      const parent = getParentFolder(f);

      return parent === folderPath;

    });

  }

  

  // Get all descendants (children, grandchildren, etc.) of a folder

  function getAllDescendants(folderPath, allFolders) {

    return allFolders.filter(f => {

      if (f === folderPath) return false;

      return f.startsWith(folderPath + '/');

    });

  }

  

  // Check if a folder path is a root folder

  function isRootFolder(folderPath) {

    return !folderPath.includes('/');

  }

  

  // Get all root folders

  function getRootFolders(allFolders) {

    return allFolders.filter(f => isRootFolder(f));

  }

  

  // Count total links in a folder including all subfolders

  function countTotalLinks(folderPath, allLinks) {

    let count = allLinks[folderPath]?.length || 0;

    const descendants = getAllDescendants(folderPath, Object.keys(allLinks));

    descendants.forEach(child => {

      count += allLinks[child]?.length || 0;

    });

    return count;

  }

  

  // Validate folder name (no slashes allowed)

  function isValidFolderName(name) {

    if (!name || !name.trim()) return { valid: false, error: 'Folder name cannot be empty' };

    if (name.includes('/')) return { valid: false, error: 'Folder name cannot contain "/"' };

    if (name.length > 50) return { valid: false, error: 'Folder name too long (max 50 chars)' };

    return { valid: true };

  }

  

  // Build full path from parent + name

  function buildFolderPath(parentPath, folderName) {

    if (!parentPath) return folderName;

    return parentPath + '/' + folderName;

  }

  

  // Helper: Generate unique key for a link

  function getLinkKey(link) {

    return `${link.folder}::${link.link}`;

  }

  

  // Helper: Apply custom order (pinned always first, then user's custom order)

  function applyCustomOrder(links) {

    const isAllLinks = currentFolder === 'All Links';

    const orderArray = isAllLinks ? allLinksCustomOrder : (customLinkOrder[currentFolder] || []);

    

    // Separate pinned and unpinned

    const pinnedItems = links.filter(l => l.pinned);

    const unpinnedItems = links.filter(l => !l.pinned);

    

    // Sort each group by custom order

    const sortByOrder = (items) => {

      if (orderArray.length === 0) {

        // No custom order - default sort by usage

        return items.sort((a, b) => (b.usage || 0) - (a.usage || 0));

      }

      

      // Sort by custom order, unordered items go to end

      return items.sort((a, b) => {

        const keyA = getLinkKey(a);

        const keyB = getLinkKey(b);

        const idxA = orderArray.indexOf(keyA);

        const idxB = orderArray.indexOf(keyB);

        

        // Both in order array

        if (idxA !== -1 && idxB !== -1) return idxA - idxB;

        // Only A in order - A comes first

        if (idxA !== -1) return -1;

        // Only B in order - B comes first

        if (idxB !== -1) return 1;

        // Neither in order - sort by usage

        return (b.usage || 0) - (a.usage || 0);

      });

    };

    

    const sortedPinned = sortByOrder(pinnedItems);

    const sortedUnpinned = sortByOrder(unpinnedItems);

    

    return [...sortedPinned, ...sortedUnpinned];

  }



  function createLinkElement(linkData, showFolderBadge = false) {

    const element = document.createElement('a');

    element.className = 'link-tag';

    element.href = linkData.link;

    

    // Enhanced title with folder path in tooltip

    let titleText = linkData.title;

    if (showFolderBadge && linkData.folder !== currentFolder) {

      titleText += `\n📁 ${linkData.folder}`;

    }

    if (linkData.notes) titleText += `\n📝 ${linkData.notes}`;

    element.title = titleText;

    

    element.draggable = true;

    element.dataset.folder = linkData.folder;

    element.dataset.index = linkData.index;

    

    if (linkData.favorite) element.classList.add('favorite');

    if (linkData.pinned) element.classList.add('pinned');

    if (linkData.incognito) element.classList.add('incognito');

    if (linkData.notes) element.classList.add('has-notes');

    

    // Mark links coming from subfolders (different from current)

    if (showFolderBadge && linkData.folder !== currentFolder) {

      element.classList.add('from-subfolder');

    }

    

    const folderColor = favoriteFolders[linkData.folder];

    if (linkData.favorite && folderColor) element.style.borderColor = folderColor;

    

    const isBulkSelected = bulkSelectedItems.some(i => i.folder === linkData.folder && i.index === linkData.index);

    if (isBulkSelected) element.classList.add('bulk-selected');

    

    const isSelected = selectedBookmarks.some(

      b => b.type === 'site' && b.folder === linkData.folder && b.index === linkData.index

    );

    if (isSelected) element.classList.add('selected');

    

    const favicon = getFaviconUrl(linkData.link, linkData.customFavicon);

    

    const notesIndicator = '';

    const incognitoIndicator = linkData.incognito ? '<span class="incognito-indicator">👁️‍🗨️</span>' : '';

    

    // Folder badge - shows which subfolder link is from

    let folderBadgeHtml = '';

    if (showFolderBadge && linkData.folder !== currentFolder) {

      // Get relative path from current folder

      const relativePath = linkData.folder.startsWith(currentFolder + '/') 

        ? linkData.folder.substring(currentFolder.length + 1)

        : linkData.folder;

      folderBadgeHtml = `<div class="link-folder-badge" title="From: ${linkData.folder}">📁 ${relativePath}</div>`;

    }

    

    element.innerHTML = `

      <img class="favicon${linkData.customFavicon ? ' custom-favicon' : ''}" src="${favicon}" alt="">

      <div class="link-text">${linkData.title}</div>

      <div class="link-url">${new URL(linkData.link).hostname}</div>

      ${folderBadgeHtml}

      <div class="link-indicators">${notesIndicator}${incognitoIndicator}</div>

    `;

    

    element.addEventListener('click', (e) => {

      e.preventDefault();

      

      if (isBulkSelectMode) {

        toggleBulkSelect(linkData.folder, linkData.index, element);

        return;

      }

      

      if (booleanSearchInput?.value.trim()) {

        toggleSelectSite(linkData.folder, linkData.index, element);

        return;

      }

      

      openLink(linkData.link, false);

      

      // Update usage

      chrome.storage.local.get(['links'], (result) => {

        const links = result.links || {};

        if (links[linkData.folder]?.[linkData.index]) {

          links[linkData.folder][linkData.index].usage = (links[linkData.folder][linkData.index].usage || 0) + 1;

          chrome.storage.local.set({ links }, () => {

            renderMostUsed();

          });

        }

      });

    });

    

    element.addEventListener('contextmenu', (e) => showBookmarkContextMenu(e, linkData));

    

    // Drag events

    element.addEventListener('dragstart', (e) => {

      e.dataTransfer.effectAllowed = 'copyMove';

      e.dataTransfer.setData('text/plain', JSON.stringify({ 

        folder: linkData.folder, 

        index: linkData.index,

        link: linkData.link,

        title: linkData.title

      }));

      draggedElement = element;

      draggedData = linkData;

      console.log('🚀 Drag started with:', linkData.title, linkData.link);

      setTimeout(() => element.classList.add('dragging'), 0);

    });

    

    element.addEventListener('dragend', () => {

      element.classList.remove('dragging');

      hideDropIndicator();

      draggedElement = null;

      draggedData = null;

    });

    

    element.addEventListener('dragover', (e) => {

      e.preventDefault();

      e.dataTransfer.dropEffect = 'move';

      if (draggedData && draggedData !== linkData) {

        element.classList.add('drag-over');

        const position = getDropPosition(element, e, false);

        currentDropTarget = linkData;

        currentDropPosition = position;

        showDropIndicatorAt(element, position, false);

      }

    });

    

    element.addEventListener('dragleave', () => element.classList.remove('drag-over'));

    

    element.addEventListener('drop', (e) => {

      e.preventDefault();

      element.classList.remove('drag-over');

      hideDropIndicator();

      if (draggedData && draggedData !== linkData) {

        const position = currentDropPosition || getDropPosition(element, e, false);

        reorderLinks(draggedData, linkData, position);

      }

      currentDropTarget = null;

      currentDropPosition = null;

    });

    

    return element;

  }



  function reorderLinks(sourceLink, targetLink, position = 'after') {

    // If source and target are in same "view" (All Links or same folder), 

    // just reorder visually - don't move between folders

    const isAllLinksView = currentFolder === 'All Links';

    const sameFolder = sourceLink.folder === targetLink.folder;

    

    // Case 1: Same folder OR All Links view - just reorder the display

    if (sameFolder || isAllLinksView) {

      reorderDisplayOrder(sourceLink, targetLink, position);

      return;

    }

    

    // Case 2: Different folders - actually move the bookmark

    if (!sameFolder && !isAllLinksView) {

      moveBookmarkBetweenFolders(sourceLink, targetLink, position);

    }

  }

  

  // Reorder display without moving between folders

  function reorderDisplayOrder(sourceLink, targetLink, position = 'after') {

    const isAllLinks = currentFolder === 'All Links';

    const sourceKey = getLinkKey(sourceLink);

    const targetKey = getLinkKey(targetLink);

    

    // Get current order array

    let orderArray;

    if (isAllLinks) {

      orderArray = [...allLinksCustomOrder];

    } else {

      orderArray = [...(customLinkOrder[currentFolder] || [])];

    }

    

    // If order array is empty, we need to initialize it with current display order

    if (orderArray.length === 0) {

      // Get all visible links in current order

      const allDisplayed = Array.from(linksContainer.querySelectorAll('.link-tag'));

      orderArray = allDisplayed.map(el => {

        const folder = el.dataset.folder;

        const idx = parseInt(el.dataset.index);

        return `${folder}::${el.href}`;

      });

    }

    

    // Remove source from array

    orderArray = orderArray.filter(key => key !== sourceKey);

    

    // Find target position

    const targetIdx = orderArray.indexOf(targetKey);

    

    if (targetIdx !== -1) {

      const insertIdx = position === 'before' ? targetIdx : targetIdx + 1;

      orderArray.splice(insertIdx, 0, sourceKey);

    } else {

      orderArray.push(sourceKey);

    }

    

    // Save

    const saveData = {};

    if (isAllLinks) {

      allLinksCustomOrder = orderArray;

      saveData.allLinksCustomOrder = orderArray;

    } else {

      customLinkOrder[currentFolder] = orderArray;

      saveData.customLinkOrder = customLinkOrder;

    }

    

    chrome.storage.local.set(saveData, () => {

      displayLinksForCurrentFolder(searchInput?.value.trim());

      showNotification('Bookmark reordered!', 'success');

    });

  }

  

  // Move bookmark between folders

  function moveBookmarkBetweenFolders(sourceLink, targetLink, position = 'after') {

    chrome.storage.local.get(['links'], (result) => {

      const links = result.links || {};

      

      if (links[sourceLink.folder]?.[sourceLink.index]) {

        const [movedLink] = links[sourceLink.folder].splice(sourceLink.index, 1);

        if (!links[targetLink.folder]) links[targetLink.folder] = [];

        

        let targetIndex = links[targetLink.folder].findIndex(

          link => link.link === targetLink.link && link.title === targetLink.title

        );

        

        if (targetIndex !== -1) {

          const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;

          links[targetLink.folder].splice(insertIndex, 0, movedLink);

        } else {

          links[targetLink.folder].push(movedLink);

        }

        

        if (links[sourceLink.folder].length === 0) delete links[sourceLink.folder];

        

        chrome.storage.local.set({ links }, () => {

          renderFolders();

          displayLinksForCurrentFolder();

          showNotification(`Bookmark moved to "${targetLink.folder}"!`, 'success');

        });

      }

    });

  }



  // ============================================

  // QUICK ACCESS

  // ============================================

  

  function renderQuickAccess() {

    if (!quickAccessDiv) return;

    quickAccessDiv.innerHTML = '';

    

    if (quickAccessSites.length === 0) {

      const emptyDiv = document.createElement('div');

      emptyDiv.className = 'quick-access-empty';

      emptyDiv.id = 'quickAccessEmpty';

      emptyDiv.innerHTML = '<span>Drag any bookmark here to add to Quick Access</span>';

      quickAccessDiv.appendChild(emptyDiv);

      renderHomeQuickLinks();

      return;

    }

    

    quickAccessSites.forEach((site, index) => {

      quickAccessDiv.appendChild(createQuickAccessSite(site, index));

    });

    renderHomeQuickLinks();

  }

  

  // Setup Quick Access as drop zone for bookmarks

  function setupQuickAccessDropZone() {

    if (!quickAccessDiv) return;

    

    console.log('✅ Setting up Quick Access drop zone');

    

    // Make the whole widget content area a drop zone when Quick Access tab is active

    const targets = [quickAccessDiv];

    if (quickAccessPanel) targets.push(quickAccessPanel);

    if (widgetContentArea) targets.push(widgetContentArea);

    

    targets.forEach(target => {

      target.addEventListener('dragover', (e) => {

        // Accept if dragging a bookmark

        if (draggedData && draggedData.link) {

          e.preventDefault();

          e.stopPropagation();

          e.dataTransfer.dropEffect = 'copy';

          

          // If not on Quick Access tab, auto-switch

          if (activeWidgetTab !== 'quickAccess') {

            switchWidgetTab('quickAccess');

          }

          

          quickAccessDiv.classList.add('drop-zone-active');

        }

      });

      

      target.addEventListener('dragenter', (e) => {

        if (draggedData && draggedData.link) {

          e.preventDefault();

          e.stopPropagation();

          quickAccessDiv.classList.add('drop-zone-active');

        }

      });

      

      target.addEventListener('dragleave', (e) => {

        // Check if truly leaving (not just entering child element)

        if (e.target === target && !target.contains(e.relatedTarget)) {

          quickAccessDiv.classList.remove('drop-zone-active');

        }

      });

      

      target.addEventListener('drop', (e) => {

        console.log('🎯 Drop event fired on:', target.id || target.className);

        console.log('📦 Dragged data:', draggedData);

        

        if (draggedData && draggedData.link) {

          e.preventDefault();

          e.stopPropagation();

          quickAccessDiv.classList.remove('drop-zone-active');

          

          const bookmarkCopy = {

            link: draggedData.link,

            title: draggedData.title,

            customFavicon: draggedData.customFavicon,

            fromLauncher: draggedData.fromLauncher

          };

          

          addBookmarkToQuickAccess(bookmarkCopy);

        }

      });

    });

  }

  

  function addBookmarkToQuickAccess(bookmark) {

    console.log('➕ Adding to Quick Access:', bookmark);

    

    if (!bookmark || !bookmark.link) {

      console.error('❌ Invalid bookmark data');

      showNotification('Invalid bookmark data', 'error');

      return;

    }

    

    // Check if already exists in Quick Access

    const exists = quickAccessSites.some(site => site.link === bookmark.link);

    if (exists) {

      showNotification('This site is already in Quick Access!', 'warning');

      return;

    }

    

    if (quickAccessSites.length >= 20) {

      showNotification('Maximum 20 quick access sites allowed.', 'error');

      return;

    }

    

    const siteData = {

      link: bookmark.link,

      title: bookmark.title || extractTitle(bookmark.link)

    };

    

    if (bookmark.customFavicon) {

      siteData.customFavicon = bookmark.customFavicon;

    }

    

    quickAccessSites.push(siteData);

    console.log('✅ Site data prepared:', siteData);

    console.log('📊 Total quick access sites:', quickAccessSites.length);

    

    chrome.storage.local.set({ quickAccess: quickAccessSites }, () => {

      console.log('💾 Saved to storage');

      renderQuickAccess();

      

      // Switch to Quick Access tab if not already active

      if (activeWidgetTab !== 'quickAccess') {

        switchWidgetTab('quickAccess');

      }

      

      // Close launcher popup if dragged from there

      appLauncherPopup?.classList.add('hidden');

      appLauncherBtn?.classList.remove('active');

      

      const source = bookmark.fromLauncher ? ' from Apps' : '';

      showNotification(`"${siteData.title}" added to Quick Access${source}!`, 'success');

    });

  }



  function createQuickAccessSite(site, index) {

    const element = document.createElement('div');

    element.className = 'site-item';

    element.draggable = true;

    element.dataset.index = index;

    

    const favicon = getFaviconUrl(site.link, site.customFavicon);

    

    element.innerHTML = `

      <img class="favicon${site.customFavicon ? ' custom-favicon' : ''}" src="${favicon}" alt="">

      <span class="site-name-small">${site.title}</span>

    `;

    

    element.addEventListener('click', (e) => { e.preventDefault(); openLink(site.link, false); });

    element.addEventListener('contextmenu', (e) => showQuickAccessContextMenu(e, site, index));

    

    // Drag events

    element.addEventListener('dragstart', (e) => {

      e.dataTransfer.effectAllowed = 'move';

      e.dataTransfer.setData('text/plain', index.toString());

      draggedElement = element;

      draggedData = { type: 'quickAccess', index };

      setTimeout(() => element.classList.add('dragging'), 0);

    });

    

    element.addEventListener('dragend', () => {

      element.classList.remove('dragging');

      hideDropIndicator();

      draggedElement = null;

      draggedData = null;

    });

    

    element.addEventListener('dragover', (e) => {

      e.preventDefault();

      e.dataTransfer.dropEffect = 'move';

      if (draggedData?.type === 'quickAccess' && draggedData.index !== index) {

        element.classList.add('drag-over');

        const position = getDropPosition(element, e, true);

        currentDropTarget = index;

        currentDropPosition = position;

        showDropIndicatorAt(element, position, true);

      }

    });

    

    element.addEventListener('dragleave', () => element.classList.remove('drag-over'));

    

    element.addEventListener('drop', (e) => {

      e.preventDefault();

      element.classList.remove('drag-over');

      hideDropIndicator();

      if (draggedData?.type === 'quickAccess' && draggedData.index !== index) {

        const position = currentDropPosition || getDropPosition(element, e, true);

        reorderQuickAccess(draggedData.index, index, position);

      }

      currentDropTarget = null;

      currentDropPosition = null;

    });

    

    return element;

  }



  function reorderQuickAccess(fromIndex, toIndex, position = 'after') {

    const [movedSite] = quickAccessSites.splice(fromIndex, 1);

    if (fromIndex < toIndex) toIndex--;

    const insertIndex = position === 'before' ? toIndex : toIndex + 1;

    quickAccessSites.splice(insertIndex, 0, movedSite);

    chrome.storage.local.set({ quickAccess: quickAccessSites }, () => {

      renderQuickAccess();

      showNotification('Site moved!', 'success');

    });

  }



  function saveQuickAccessSite() {

    const url = siteLinkInput?.value.trim();

    const title = siteTitleInput?.value.trim() || extractTitle(url);

    const customFaviconUrl = siteCustomFavicon?.value.trim() || '';

    const editIndex = parseInt(editQuickAccessIndex?.value || '-1');

    

    if (!url) { showNotification('Please enter a URL.', 'error'); return; }

    

    let processedUrl = url;

    if (!/^(https?:\/\/|file:\/\/)/i.test(processedUrl)) processedUrl = 'https://' + processedUrl;

    

    const siteData = { link: processedUrl, title };

    if (customFaviconUrl) siteData.customFavicon = customFaviconUrl;



    if (quickAccessEditContext === 'dock') {

      if (editIndex >= 0 && editIndex < homeDockLinks.length) {

        homeDockLinks[editIndex] = siteData;

      } else {

        if (homeDockLinks.length >= 30) { showNotification('Maximum 30 bottom quick links.', 'error'); return; }

        homeDockLinks.push(siteData);

      }

      chrome.storage.local.set({ homeDockLinks }, () => {

        renderHomeQuickLinks();

        showNotification(editIndex >= 0 ? 'Bottom quick link updated!' : 'Bottom quick link added!', 'success');

        closeAddSiteModal();

      });

      return;

    }

    

    if (editIndex >= 0) {

      quickAccessSites[editIndex] = siteData;

    } else {

      if (quickAccessSites.length >= 20) { showNotification('Maximum 20 quick access sites.', 'error'); return; }

      quickAccessSites.push(siteData);

    }

    

    chrome.storage.local.set({ quickAccess: quickAccessSites }, () => {

      renderQuickAccess();

      showNotification(editIndex >= 0 ? 'Site updated!' : 'Site added!');

      closeAddSiteModal();

    });

  }



  function editQuickAccessSite(index) {

    const site = quickAccessSites[index];

    if (site) openAddSiteModal(site, index);

  }



  function deleteQuickAccessSite(index) {

    quickAccessSites.splice(index, 1);

    chrome.storage.local.set({ quickAccess: quickAccessSites }, () => {

      renderQuickAccess();

      showNotification('Quick access site removed!');

    });

  }



  // ============================================

  // BOOLEAN SEARCH — stay in the current New Tab.

  // AI engines are opened through the background worker, then their composer is filled and submitted.

  // ============================================

  function openSelectedSearchInCurrentTab(engine, query, urls) {

    const cleanedQuery = String(query || '').trim();

    if (!cleanedQuery) return;

    if (engine === 'chatgpt' || engine === 'gemini') {

      chrome.runtime.sendMessage({ type: 'submitAiQueryInCurrentTab', engine, query: cleanedQuery }, response => {

        if (chrome.runtime.lastError) {

          navigator.clipboard?.writeText(cleanedQuery).catch(() => {});

          showNotification('Could not auto-submit to the AI page. The query was copied to your clipboard.', 'warning');

        } else if (response && response.success === false) {

          navigator.clipboard?.writeText(cleanedQuery).catch(() => {});

          showNotification(response.error || 'AI page was opened, but automatic submission may need a manual Enter.', 'warning');

        }

      });

      return;

    }

    const targetUrl = urls[engine] || urls.google;

    // A regular navigation replaces Bookly in this tab instead of opening a second tab.

    window.location.assign(targetUrl);

  }



  function performBooleanSearch(searchText) {

    // Check for custom shortcuts

    let customSites = null;

    let actualSearchText = searchText;

    

    if (booleanSearchShortcuts && Object.keys(booleanSearchShortcuts).length > 0) {

      for (const [name, config] of Object.entries(booleanSearchShortcuts)) {

        const trigger = config.trigger || name;

        if (searchText.startsWith(trigger)) {

          actualSearchText = searchText.substring(trigger.length).trim();

          customSites = config.sites || [];

          break;

        }

      }

    }

    

    if (selectedBookmarks.length === 0 && !customSites) {

      const encodedText = encodeURIComponent(searchText);

      const urls = {

        google: `https://www.google.com/search?q=${encodedText}`,

        yandex: `https://yandex.com/search/?text=${encodedText}`,

        bing: `https://www.bing.com/search?q=${encodedText}`,

        duckduckgo: `https://duckduckgo.com/?q=${encodedText}`,

        youtube: `https://www.youtube.com/results?search_query=${encodedText}`,

        pinterest: `https://www.pinterest.com/search/pins/?q=${encodedText}`,

        behance: `https://www.behance.net/search?search=${encodedText}`,

        chatgpt: 'https://chatgpt.com/',

        gemini: 'https://gemini.google.com/app'

      };

      openSelectedSearchInCurrentTab(selectedEngine, searchText, urls);

      return;

    }

    

    // Build site query from selected bookmarks OR custom shortcut sites

    let sites = new Set();

    

    if (customSites) {

      customSites.forEach(site => sites.add(site));

    }

    

    if (selectedBookmarks.length > 0) {

      chrome.storage.local.get(['links'], (result) => {

        const links = result.links || {};

        selectedBookmarks.forEach(bookmark => {

          if (bookmark.type === 'site' && links[bookmark.folder]?.[bookmark.index]) {

            try {

              const url = new URL(links[bookmark.folder][bookmark.index].link);

              sites.add(url.hostname);

            } catch (e) {}

          }

        });

        doBooleanSearchWithSites(actualSearchText, sites);

      });

    } else {

      doBooleanSearchWithSites(actualSearchText, sites);

    }

  }

  

  function doBooleanSearchWithSites(searchText, sites) {

    const siteQuery = Array.from(sites).map(site => `site:${site}`).join(' OR ');

    const fullQuery = `${searchText} (${siteQuery})`;

    const encodedQuery = encodeURIComponent(fullQuery);

    

    const urls = {

      google: `https://www.google.com/search?q=${encodedQuery}`,

      yandex: `https://yandex.com/search/?text=${encodedQuery}`,

      bing: `https://www.bing.com/search?q=${encodedQuery}`,

      duckduckgo: `https://duckduckgo.com/?q=${encodedQuery}`,

      youtube: `https://www.youtube.com/results?search_query=${encodedQuery}`,

      pinterest: `https://www.pinterest.com/search/pins/?q=${encodedQuery}`,

      behance: `https://www.behance.net/search?search=${encodedQuery}`,

      chatgpt: 'https://chatgpt.com/',

      gemini: 'https://gemini.google.com/app'

    };

    

    openSelectedSearchInCurrentTab(selectedEngine, fullQuery, urls);

  }



  function toggleSelectSite(folder, index, element) {

    const bookmarkId = `${folder}-${index}`;

    const existingIndex = selectedBookmarks.findIndex(b => b.type === 'site' && `${b.folder}-${b.index}` === bookmarkId);

    

    if (existingIndex > -1) {

      selectedBookmarks.splice(existingIndex, 1);

      element?.classList.remove('selected');

    } else {

      selectedBookmarks.push({ type: 'site', folder, index });

      element?.classList.add('selected');

    }

    updateSelectedLinksUI();

  }



  function updateSelectedLinksUI() {

    if (!selectedLinksContainer) return;

    selectedLinksContainer.innerHTML = '';

    

    chrome.storage.local.get(['links'], (result) => {

      const links = result.links || {};

      selectedBookmarks.forEach(bookmark => {

        if (bookmark.type === 'site') {

          const link = links[bookmark.folder]?.[bookmark.index];

          if (link) {

            const tag = document.createElement('div');

            tag.className = 'selected-link-tag';

            tag.innerHTML = `${link.title} <span style="cursor:pointer;font-weight:600;">&times;</span>`;

            tag.querySelector('span').addEventListener('click', () => toggleSelectSite(bookmark.folder, bookmark.index, null));

            selectedLinksContainer.appendChild(tag);

          }

        }

      });

    });

  }



  // ============================================

  // SUGGESTIONS

  // ============================================

  

  function updateFolderSuggestions(query) {

    chrome.storage.local.get(['links'], (result) => {

      const folders = Object.keys(result.links || {});

      const filtered = folders.filter(f => f.toLowerCase().includes(query.toLowerCase()));

      

      if (!folderSuggestions || filtered.length === 0) {

        if (folderSuggestions) folderSuggestions.style.display = 'none';

        return;

      }

      

      folderSuggestions.innerHTML = '';

      folderSuggestions.style.display = 'block';

      

      filtered.slice(0, 5).forEach(folder => {

        const li = document.createElement('li');

        li.className = 'suggestion-item';

        li.textContent = folder;

        li.addEventListener('click', () => {

          if (folderInput) folderInput.value = folder;

          folderSuggestions.style.display = 'none';

        });

        folderSuggestions.appendChild(li);

      });

    });

  }



  function updateKeywordSuggestions(folder, query) {

    chrome.storage.local.get(['links'], (result) => {

      const folderLinks = (result.links || {})[folder] || [];

      const allTags = new Set();

      folderLinks.forEach(link => link.tags?.forEach(tag => allTags.add(tag)));

      

      const filtered = Array.from(allTags).filter(tag => tag.toLowerCase().includes(query.toLowerCase()));

      

      if (!keywordSuggestions || filtered.length === 0) {

        if (keywordSuggestions) keywordSuggestions.style.display = 'none';

        return;

      }

      

      keywordSuggestions.innerHTML = '';

      keywordSuggestions.style.display = 'block';

      

      filtered.slice(0, 5).forEach(tag => {

        const li = document.createElement('li');

        li.className = 'suggestion-item';

        li.textContent = tag;

        li.addEventListener('click', () => {

          if (!keywords.includes(tag)) { keywords.push(tag); renderKeywords(); }

          if (keywordInput) keywordInput.value = '';

          keywordSuggestions.style.display = 'none';

        });

        keywordSuggestions.appendChild(li);

      });

    });

  }



  // Color Picker

  function renderColorPickerGrid() {

    if (!colorPickerGrid) return;

    colorPickerGrid.innerHTML = '';

    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'];

    colors.forEach(color => {

      const colorItem = document.createElement('div');

      colorItem.className = 'color-picker-item';

      colorItem.style.backgroundColor = color;

      colorItem.dataset.color = color;

      colorPickerGrid.appendChild(colorItem);

    });

  }



  // ============================================

  // BACKUP & SYNC SYSTEM (Chrome Bookmarks)

  // ============================================

  

  // Constants

  const BOOKLY_METADATA_MARKER = '_bookly_metadata_';

  const BOOKLY_METADATA_TITLE = '📋 _bookly_data';

  // Recognize prior exported metadata bookmarks without retaining legacy branding text.

  const isBooklyMetadataBookmark = (title) => title === BOOKLY_METADATA_TITLE || /^📋\s*_[a-z0-9-]*data$/i.test(title || '');

  

  // Element References

  const bookmarkPermissionWarning = document.getElementById('bookmarkPermissionWarning');

  const grantPermissionBtn = document.getElementById('grantPermissionBtn');

  const exportFolderTree = document.getElementById('exportFolderTree');

  const chromeExportFolderName = document.getElementById('chromeExportFolderName');

  const exportToChromeBtn = document.getElementById('exportToChromeBtn');

  const importChromeTree = document.getElementById('importChromeTree');

  const importFromChromeBtn = document.getElementById('importFromChromeBtn');

  const includeMetadata = document.getElementById('includeMetadata');

  const restoreMetadata = document.getElementById('restoreMetadata');

  const lastExportTime = document.getElementById('lastExportTime');

  const lastImportTime = document.getElementById('lastImportTime');

  

  // State

  let selectedExportFolders = new Set();

  let selectedImportChromeId = null;

  let chromeBookmarksTree = null;

  

  // Initialize Backup & Sync

  function initBackupSync() {

    // Chrome sync features removed

    

    // Card toggles (expand/collapse)

    document.querySelectorAll('.sync-card-toggle').forEach(toggle => {

      toggle.addEventListener('click', (e) => {

        e.stopPropagation();

        const targetId = toggle.dataset.target;

        const body = document.getElementById(targetId);

        if (body) {

          body.classList.toggle('hidden');

          toggle.classList.toggle('collapsed');

        }

      });

    });

    

    // Card header click to toggle

    document.querySelectorAll('.sync-card-header').forEach(header => {

      header.addEventListener('click', (e) => {

        if (e.target.closest('.sync-card-toggle')) return;

        const toggle = header.querySelector('.sync-card-toggle');

        if (toggle) toggle.click();

      });

    });

    

    // Grant permission button - removed (Chrome sync disabled)

    

    // Export button - removed (Chrome sync disabled)

    

    // Import button - removed (Chrome sync disabled)

    

    // Load sync timestamps - removed (Chrome sync disabled)

  }

  

  // Check if bookmarks permission is granted

  function checkBookmarksPermission() {

    if (!chrome.bookmarks) {

      showPermissionWarning();

      return false;

    }

    

    chrome.permissions.contains({ permissions: ['bookmarks'] }, (granted) => {

      if (granted) {

        hidePermissionWarning();

        loadExportFolderTree();

        loadChromeBookmarksTree();

      } else {

        showPermissionWarning();

      }

    });

    return true;

  }

  

  function showPermissionWarning() {

    if (bookmarkPermissionWarning) bookmarkPermissionWarning.classList.remove('hidden');

  }

  

  function hidePermissionWarning() {

    if (bookmarkPermissionWarning) bookmarkPermissionWarning.classList.add('hidden');

  }

  

  // Request bookmarks permission (usually auto-granted from manifest)

  function requestBookmarksPermission() {

    chrome.permissions.request({ permissions: ['bookmarks'] }, (granted) => {

      if (granted) {

        showNotification('✅ Permission granted!', 'success');

        hidePermissionWarning();

        loadExportFolderTree();

        loadChromeBookmarksTree();

      } else {

        showNotification('❌ Permission denied', 'error');

      }

    });

  }

  

  // ============================================

  // EXPORT FOLDER TREE (Bookly Pro folders)

  // ============================================

  

  function loadExportFolderTree() {

    if (!exportFolderTree) return;

    

    chrome.storage.local.get(['links', 'folderOrder'], (result) => {

      const links = result.links || {};

      const allFolders = Object.keys(links);

      

      if (allFolders.length === 0) {

        exportFolderTree.innerHTML = '<p class="empty-tree-text">No folders to export</p>';

        return;

      }

      

      exportFolderTree.innerHTML = '';

      

      // Select All checkbox

      const selectAllDiv = document.createElement('div');

      selectAllDiv.className = 'sync-tree-item sync-select-all';

      selectAllDiv.innerHTML = `

        <input type="checkbox" id="selectAllExport" />

        <span class="sync-tree-name">Select All</span>

      `;

      exportFolderTree.appendChild(selectAllDiv);

      

      const selectAllCheckbox = selectAllDiv.querySelector('#selectAllExport');

      selectAllCheckbox.addEventListener('change', () => {

        const allCheckboxes = exportFolderTree.querySelectorAll('.sync-folder-checkbox');

        allCheckboxes.forEach(cb => {

          cb.checked = selectAllCheckbox.checked;

          const folderPath = cb.dataset.folder;

          if (selectAllCheckbox.checked) {

            selectedExportFolders.add(folderPath);

          } else {

            selectedExportFolders.delete(folderPath);

          }

        });

      });

      

      // Render tree

      const rootFolders = allFolders.filter(f => isRootFolder(f));

      let orderedRoots = result.folderOrder ? 

        result.folderOrder.filter(f => rootFolders.includes(f)) : rootFolders;

      rootFolders.forEach(f => { if (!orderedRoots.includes(f)) orderedRoots.push(f); });

      

      orderedRoots.forEach(root => {

        renderExportTreeNode(root, exportFolderTree, 0, links, allFolders);

      });

    });

  }

  

  function renderExportTreeNode(folderPath, parent, depth, links, allFolders) {

    const item = document.createElement('div');

    item.className = 'sync-tree-item';

    item.style.paddingLeft = (depth * 6) + 'px';

    

    const children = getDirectChildren(folderPath, allFolders);

    const hasChildren = children.length > 0;

    const count = links[folderPath]?.length || 0;

    const folderIcon = folderIcons[folderPath] || '📁';

    

    const arrowHtml = hasChildren 

      ? `<span class="sync-tree-arrow" data-toggle="${folderPath}">▶</span>`

      : `<span class="sync-tree-arrow hidden-arrow">▶</span>`;

    

    item.innerHTML = `

      ${arrowHtml}

      <input type="checkbox" class="sync-folder-checkbox" data-folder="${folderPath}" />

      <span class="sync-tree-icon">${folderIcon}</span>

      <span class="sync-tree-name">${getFolderName(folderPath)}</span>

      <span class="sync-tree-count">${count}</span>

    `;

    

    parent.appendChild(item);

    

    // Checkbox handler

    const checkbox = item.querySelector('.sync-folder-checkbox');

    checkbox.addEventListener('change', () => {

      if (checkbox.checked) {

        selectedExportFolders.add(folderPath);

        // Also check all descendants

        const descendants = getAllDescendants(folderPath, allFolders);

        descendants.forEach(d => {

          selectedExportFolders.add(d);

          const cbEl = exportFolderTree.querySelector(`.sync-folder-checkbox[data-folder="${d}"]`);

          if (cbEl) cbEl.checked = true;

        });

      } else {

        selectedExportFolders.delete(folderPath);

        const descendants = getAllDescendants(folderPath, allFolders);

        descendants.forEach(d => {

          selectedExportFolders.delete(d);

          const cbEl = exportFolderTree.querySelector(`.sync-folder-checkbox[data-folder="${d}"]`);

          if (cbEl) cbEl.checked = false;

        });

      }

    });

    

    // Children container

    if (hasChildren) {

      const childContainer = document.createElement('div');

      childContainer.className = 'sync-tree-children hidden';

      childContainer.dataset.parent = folderPath;

      parent.appendChild(childContainer);

      

      // Render children

      children.forEach(child => {

        renderExportTreeNode(child, childContainer, depth + 1, links, allFolders);

      });

      

      // Arrow toggle

      const arrow = item.querySelector('.sync-tree-arrow');

      arrow.addEventListener('click', (e) => {

        e.stopPropagation();

        childContainer.classList.toggle('hidden');

        arrow.classList.toggle('expanded');

      });

    }

  }

  

  // ============================================

  // CHROME BOOKMARKS TREE (for Import)

  // ============================================

  

  function loadChromeBookmarksTree() {

    if (!importChromeTree || !chrome.bookmarks) return;

    

    chrome.bookmarks.getTree((tree) => {

      chromeBookmarksTree = tree;

      renderChromeTree(tree, importChromeTree);

    });

  }

  

  function renderChromeTree(tree, container) {

    container.innerHTML = '';

    

    // Chrome's tree structure: root contains "Bookmarks Bar", "Other Bookmarks", etc.

    tree[0].children?.forEach(node => {

      renderChromeTreeNode(node, container, 0);

    });

  }

  

  function renderChromeTreeNode(node, parent, depth) {

    // Only show folders (not bookmarks) in the tree for selection

    if (node.url) return; // Skip individual bookmarks

    

    const item = document.createElement('div');

    item.className = 'sync-tree-item';

    item.style.paddingLeft = (depth * 6) + 'px';

    

    const children = (node.children || []).filter(c => !c.url); // Only folder children

    const bookmarkCount = (node.children || []).filter(c => c.url && c.title !== BOOKLY_METADATA_TITLE).length;

    const hasChildren = children.length > 0;

    

    const arrowHtml = hasChildren 

      ? `<span class="sync-tree-arrow" data-toggle="${node.id}">▶</span>`

      : `<span class="sync-tree-arrow hidden-arrow">▶</span>`;

    

    item.innerHTML = `

      ${arrowHtml}

      <input type="radio" name="chromeImportFolder" value="${node.id}" />

      <span class="sync-tree-icon">📁</span>

      <span class="sync-tree-name">${node.title || 'Root'}</span>

      <span class="sync-tree-count">${bookmarkCount}</span>

    `;

    

    parent.appendChild(item);

    

    // Radio handler

    const radio = item.querySelector('input[type="radio"]');

    radio.addEventListener('change', () => {

      if (radio.checked) {

        selectedImportChromeId = node.id;

        // Highlight selected

        importChromeTree.querySelectorAll('.sync-tree-item').forEach(i => i.classList.remove('selected'));

        item.classList.add('selected');

      }

    });

    

    // Click on item to select radio

    item.addEventListener('click', (e) => {

      if (e.target.closest('.sync-tree-arrow')) return;

      radio.checked = true;

      radio.dispatchEvent(new Event('change'));

    });

    

    // Children

    if (hasChildren) {

      const childContainer = document.createElement('div');

      childContainer.className = 'sync-tree-children hidden';

      parent.appendChild(childContainer);

      

      children.forEach(child => {

        renderChromeTreeNode(child, childContainer, depth + 1);

      });

      

      // Arrow toggle

      const arrow = item.querySelector('.sync-tree-arrow');

      arrow.addEventListener('click', (e) => {

        e.stopPropagation();

        childContainer.classList.toggle('hidden');

        arrow.classList.toggle('expanded');

      });

    }

  }

  

  // ============================================

  // EXPORT TO CHROME BOOKMARKS

  // ============================================

  

  async function handleExportToChrome() {

    if (selectedExportFolders.size === 0) {

      showNotification('Please select at least one folder to export', 'warning');

      return;

    }

    

    const targetFolderName = chromeExportFolderName?.value.trim() || 'Bookly Pro';

    const mode = document.querySelector('input[name="exportMode"]:checked')?.value || 'replace';

    const withMetadata = includeMetadata?.checked !== false;

    

    if (!confirm(`Export ${selectedExportFolders.size} folder(s) to Chrome bookmarks bar as "${targetFolderName}"?`)) {

      return;

    }

    

    exportToChromeBtn.disabled = true;

    exportToChromeBtn.textContent = '⏳ Exporting...';

    

    try {

      // Get all data

      const data = await new Promise((resolve) => {

        chrome.storage.local.get(['links', 'folderIcons', 'pinnedFolders', 'favoriteFolders', 'folderPasswords'], resolve);

      });

      

      const allLinks = data.links || {};

      

      // Find or create root folder in Bookmarks Bar (id="1")

      const bookmarksBar = await getBookmarksBarId();

      let rootFolder = await findFolderByName(bookmarksBar, targetFolderName);

      

      if (mode === 'replace' && rootFolder) {

        // Delete existing folder

        await new Promise((resolve) => {

          chrome.bookmarks.removeTree(rootFolder.id, resolve);

        });

        rootFolder = null;

      }

      

      if (!rootFolder) {

        rootFolder = await new Promise((resolve) => {

          chrome.bookmarks.create({

            parentId: bookmarksBar,

            title: targetFolderName

          }, resolve);

        });

      }

      

      // Get sorted folder list (roots first, then children)

      const foldersArray = Array.from(selectedExportFolders).sort((a, b) => {

        return getFolderDepth(a) - getFolderDepth(b);

      });

      

      // Map: Bookly folder path -> Chrome folder ID

      const folderIdMap = { '': rootFolder.id };

      

      let totalBookmarks = 0;

      let skippedCount = 0;

      

      // Create folder structure

      for (const folderPath of foldersArray) {

        const parentPath = getParentFolder(folderPath) || '';

        const parentId = folderIdMap[parentPath] || rootFolder.id;

        const folderName = getFolderName(folderPath);

        

        // Check if folder already exists (merge mode)

        let chromeFolder = null;

        if (mode === 'merge') {

          chromeFolder = await findFolderByName(parentId, folderName);

        }

        

        if (!chromeFolder) {

          chromeFolder = await new Promise((resolve) => {

            chrome.bookmarks.create({

              parentId: parentId,

              title: folderName

            }, resolve);

          });

        }

        

        folderIdMap[folderPath] = chromeFolder.id;

        

        // Add bookmarks to this folder

        const bookmarks = allLinks[folderPath] || [];

        

        for (const bookmark of bookmarks) {

          try {

            // Check for duplicate in merge mode

            if (mode === 'merge') {

              const existing = await findBookmarkByUrl(chromeFolder.id, bookmark.link);

              if (existing) {

                skippedCount++;

                continue;

              }

            }

            

            await new Promise((resolve) => {

              chrome.bookmarks.create({

                parentId: chromeFolder.id,

                title: bookmark.title || 'Untitled',

                url: bookmark.link

              }, resolve);

            });

            totalBookmarks++;

          } catch (e) {

            console.warn('Failed to create bookmark:', bookmark.link, e);

            skippedCount++;

          }

        }

        

        // Add metadata as hidden bookmark

        if (withMetadata) {

          const metadata = buildFolderMetadata(folderPath, allLinks, data);

          if (metadata) {

            const metaUrl = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(metadata))));

            try {

              await new Promise((resolve) => {

                chrome.bookmarks.create({

                  parentId: chromeFolder.id,

                  title: BOOKLY_METADATA_TITLE,

                  url: metaUrl

                }, resolve);

              });

            } catch (e) {

              console.warn('Failed to create metadata bookmark for:', folderPath);

            }

          }

        }

      }

      

      // Save timestamp

      const now = new Date().toISOString();

      chrome.storage.local.set({ lastChromeExport: now });

      updateSyncTimestamps(now, null);

      

      let msg = `✅ Exported ${totalBookmarks} bookmarks to Chrome!`;

      if (skippedCount > 0) msg += ` (${skippedCount} skipped)`;

      showNotification(msg, 'success');

      

    } catch (error) {

      console.error('Export failed:', error);

      showNotification('❌ Export failed: ' + error.message, 'error');

    } finally {

      exportToChromeBtn.disabled = false;

      exportToChromeBtn.innerHTML = '🚀 Export Now';

      loadChromeBookmarksTree(); // Refresh Chrome tree

    }

  }

  

  // Build metadata object for a folder

  function buildFolderMetadata(folderPath, allLinks, data) {

    const folderData = allLinks[folderPath] || [];

    const bookmarksMetadata = {};

    

    let hasMetadata = false;

    

    folderData.forEach(link => {

      const meta = {};

      if (link.tags?.length) { meta.tags = link.tags; hasMetadata = true; }

      if (link.notes) { meta.notes = link.notes; hasMetadata = true; }

      if (link.favorite) { meta.favorite = true; hasMetadata = true; }

      if (link.pinned) { meta.pinned = true; hasMetadata = true; }

      if (link.incognito) { meta.incognito = true; hasMetadata = true; }

      if (link.customFavicon) { meta.customFavicon = link.customFavicon; hasMetadata = true; }

      if (link.usage) { meta.usage = link.usage; hasMetadata = true; }

      

      if (Object.keys(meta).length > 0) {

        bookmarksMetadata[link.link] = meta;

      }

    });

    

    const folderMeta = {};

    if (data.folderIcons?.[folderPath]) { folderMeta.icon = data.folderIcons[folderPath]; hasMetadata = true; }

    if (data.pinnedFolders?.includes(folderPath)) { folderMeta.pinned = true; hasMetadata = true; }

    if (data.favoriteFolders?.[folderPath]) { folderMeta.favoriteColor = data.favoriteFolders[folderPath]; hasMetadata = true; }

    

    if (!hasMetadata) return null;

    

    return {

      version: '1.0',

      type: 'bookly_metadata',

      folder: folderMeta,

      bookmarks: bookmarksMetadata

    };

  }

  

  // ============================================

  // IMPORT FROM CHROME BOOKMARKS

  // ============================================

  

  async function handleImportFromChrome() {

    if (!selectedImportChromeId) {

      showNotification('Please select a Chrome folder to import', 'warning');

      return;

    }

    

    const mode = document.querySelector('input[name="importMode"]:checked')?.value || 'new';

    const withMetadata = restoreMetadata?.checked !== false;

    

    importFromChromeBtn.disabled = true;

    importFromChromeBtn.textContent = '⏳ Importing...';

    

    try {

      // Get selected Chrome folder

      const chromeFolder = await new Promise((resolve) => {

        chrome.bookmarks.getSubTree(selectedImportChromeId, (nodes) => {

          resolve(nodes?.[0]);

        });

      });

      

      if (!chromeFolder) {

        throw new Error('Chrome folder not found');

      }

      

      // Get current Bookly data

      const currentData = await new Promise((resolve) => {

        chrome.storage.local.get(null, resolve);

      });

      

      const newLinks = { ...(currentData.links || {}) };

      const newFolderIcons = { ...(currentData.folderIcons || {}) };

      const newPinnedFolders = [...(currentData.pinnedFolders || [])];

      const newFavoriteFolders = { ...(currentData.favoriteFolders || {}) };

      const newFolderPasswords = { ...(currentData.folderPasswords || {}) };

      const newFolderOrder = [...(currentData.folderOrder || [])];

      

      let importedCount = 0;

      let skippedCount = 0;

      

      // Recursive import

      async function importNode(node, basePath) {

        if (!node.children) return;

        

        // Parse metadata bookmark if exists

        let metadata = null;

        if (withMetadata) {

          const metaBookmark = node.children.find(c => c.url && isBooklyMetadataBookmark(c.title));

          if (metaBookmark) {

            try {

              const base64 = metaBookmark.url.replace('data:application/json;base64,', '');

              metadata = JSON.parse(decodeURIComponent(escape(atob(base64))));

            } catch (e) {

              console.warn('Failed to parse metadata:', e);

            }

          }

        }

        

        // Create/select folder in Bookly

        const folderPath = basePath;

        

        if (!newLinks[folderPath]) {

          newLinks[folderPath] = [];

          if (!newFolderOrder.includes(folderPath)) {

            newFolderOrder.push(folderPath);

          }

        }

        

        // Apply folder metadata

        if (metadata?.folder) {

          if (metadata.folder.icon) newFolderIcons[folderPath] = metadata.folder.icon;

          if (metadata.folder.pinned && !newPinnedFolders.includes(folderPath)) {

            newPinnedFolders.push(folderPath);

          }

          if (metadata.folder.favoriteColor) newFavoriteFolders[folderPath] = metadata.folder.favoriteColor;

        }

        

        // Import bookmarks

        const bookmarks = node.children.filter(c => c.url && !isBooklyMetadataBookmark(c.title));

        

        for (const bm of bookmarks) {

          // Check for duplicate in merge mode

          if (mode === 'merge') {

            const existing = newLinks[folderPath].find(l => l.link === bm.url);

            if (existing) {

              skippedCount++;

              continue;

            }

          }

          

          const linkData = {

            link: bm.url,

            title: bm.title || 'Untitled',

            tags: [],

            notes: '',

            favorite: false,

            pinned: false,

            incognito: false,

            usage: 0,

            dateAdded: new Date(bm.dateAdded || Date.now()).toISOString()

          };

          

          // Apply bookmark metadata

          if (metadata?.bookmarks?.[bm.url]) {

            const meta = metadata.bookmarks[bm.url];

            if (meta.tags) linkData.tags = meta.tags;

            if (meta.notes) linkData.notes = meta.notes;

            if (meta.favorite) linkData.favorite = true;

            if (meta.pinned) linkData.pinned = true;

            if (meta.incognito) linkData.incognito = true;

            if (meta.customFavicon) linkData.customFavicon = meta.customFavicon;

            if (meta.usage) linkData.usage = meta.usage;

          }

          

          newLinks[folderPath].push(linkData);

          importedCount++;

        }

        

        // Recursively import subfolders

        const subfolders = node.children.filter(c => !c.url);

        for (const sub of subfolders) {

          const subPath = buildFolderPath(folderPath, sub.title);

          await importNode(sub, subPath);

        }

      }

      

      // Start import

      let rootImportPath;

      if (mode === 'new') {

        // Import as new folder with Chrome folder name

        rootImportPath = chromeFolder.title || 'Imported';

        // Ensure unique name

        let counter = 1;

        let originalName = rootImportPath;

        while (newLinks[rootImportPath]) {

          rootImportPath = `${originalName} (${counter})`;

          counter++;

        }

        await importNode(chromeFolder, rootImportPath);

      } else {

        // Merge: import children directly

        if (chromeFolder.children) {

          for (const child of chromeFolder.children) {

            if (child.url) {

              // Direct bookmark - put in "Imported" folder

              if (!newLinks['Imported']) {

                newLinks['Imported'] = [];

                newFolderOrder.push('Imported');

              }

              

              const existing = newLinks['Imported'].find(l => l.link === child.url);

              if (existing) {

                skippedCount++;

              } else {

                newLinks['Imported'].push({

                  link: child.url,

                  title: child.title || 'Untitled',

                  tags: [],

                  notes: '',

                  favorite: false,

                  pinned: false,

                  incognito: false,

                  usage: 0,

                  dateAdded: new Date().toISOString()

                });

                importedCount++;

              }

            } else {

              // Subfolder

              const subPath = child.title;

              let uniquePath = subPath;

              let counter = 1;

              while (newLinks[uniquePath] && mode !== 'merge') {

                uniquePath = `${subPath} (${counter})`;

                counter++;

              }

              await importNode(child, uniquePath);

            }

          }

        }

      }

      

      // Save everything

      await new Promise((resolve) => {

        chrome.storage.local.set({

          links: newLinks,

          folderIcons: newFolderIcons,

          pinnedFolders: newPinnedFolders,

          favoriteFolders: newFavoriteFolders,

          folderPasswords: newFolderPasswords,

          folderOrder: newFolderOrder

        }, resolve);

      });

      

      // Update state

      pinnedFolders = newPinnedFolders;

      favoriteFolders = newFavoriteFolders;

      folderIcons = newFolderIcons;

      folderPasswords = newFolderPasswords;

      folderOrder = newFolderOrder;

      

      // Save timestamp

      const now = new Date().toISOString();

      chrome.storage.local.set({ lastChromeImport: now });

      updateSyncTimestamps(null, now);

      

      // Refresh UI

      renderFolders();

      displayLinksForCurrentFolder();

      renderRecentlyAdded();

      renderMostUsed();

      loadExportFolderTree();

      

      let msg = `✅ Imported ${importedCount} bookmarks!`;

      if (skippedCount > 0) msg += ` (${skippedCount} duplicates skipped)`;

      showNotification(msg, 'success');

      

    } catch (error) {

      console.error('Import failed:', error);

      showNotification('❌ Import failed: ' + error.message, 'error');

    } finally {

      importFromChromeBtn.disabled = false;

      importFromChromeBtn.innerHTML = '📥 Import Selected';

    }

  }

  

  // ============================================

  // HELPERS

  // ============================================

  

  // Get Bookmarks Bar ID

  function getBookmarksBarId() {

    return new Promise((resolve) => {

      chrome.bookmarks.getTree((tree) => {

        // "Bookmarks Bar" is usually the first child of root

        const bookmarksBar = tree[0]?.children?.[0];

        resolve(bookmarksBar?.id || '1');

      });

    });

  }

  

  // Find folder by name inside parent

  function findFolderByName(parentId, name) {

    return new Promise((resolve) => {

      chrome.bookmarks.getChildren(parentId, (children) => {

        const found = (children || []).find(c => !c.url && c.title === name);

        resolve(found || null);

      });

    });

  }

  

  // Find bookmark by URL inside parent

  function findBookmarkByUrl(parentId, url) {

    return new Promise((resolve) => {

      chrome.bookmarks.getChildren(parentId, (children) => {

        const found = (children || []).find(c => c.url === url);

        resolve(found || null);

      });

    });

  }

  

  // Load sync timestamps

  function loadSyncTimestamps() {

    chrome.storage.local.get(['lastChromeExport', 'lastChromeImport'], (result) => {

      updateSyncTimestamps(result.lastChromeExport, result.lastChromeImport);

    });

  }

  

  function updateSyncTimestamps(exportTime, importTime) {

    if (exportTime !== null && lastExportTime) {

      lastExportTime.textContent = exportTime ? formatRelativeTime(exportTime) : 'Never';

    }

    if (importTime !== null && lastImportTime) {

      lastImportTime.textContent = importTime ? formatRelativeTime(importTime) : 'Never';

    }

  }

  

  function formatRelativeTime(isoString) {

    const date = new Date(isoString);

    const now = new Date();

    const diffMs = now - date;

    const diffMins = Math.floor(diffMs / 60000);

    const diffHours = Math.floor(diffMs / 3600000);

    const diffDays = Math.floor(diffMs / 86400000);

    

    if (diffMins < 1) return 'Just now';

    if (diffMins < 60) return `${diffMins} min ago`;

    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();

  }

  



  // ============================================

  // EXPORT/IMPORT (with incognito filter)

  // ============================================

  

  function exportBookmarks() {

    chrome.storage.local.get(['links', 'quickAccess', 'pinnedFolders', 'favoriteFolders', 'folderIcons', 'showFavoritesOnly', 'folderOrder', 'theme', 'folderPasswords', 'customLinkOrder', 'allLinksCustomOrder'], (result) => {

      const links = result.links || {};

      

      // Filter out incognito bookmarks

      const exportLinks = {};

      Object.entries(links).forEach(([folder, folderLinks]) => {

        const filtered = folderLinks.filter(link => !link.incognito);

        if (filtered.length > 0) exportLinks[folder] = filtered;

      });

      

      const data = {

        version: '4.0',

        exportDate: new Date().toISOString(),

        links: exportLinks,

        quickAccess: result.quickAccess || [],

        pinnedFolders: result.pinnedFolders || [],

        favoriteFolders: result.favoriteFolders || {},

        folderIcons: result.folderIcons || {},

        folderOrder: result.folderOrder || [],

        theme: result.theme || 'dark-default',

        showFavoritesOnly: result.showFavoritesOnly || false,

        customLinkOrder: result.customLinkOrder || {},

        allLinksCustomOrder: result.allLinksCustomOrder || []

        // Note: folderPasswords are NOT exported for security

      };

      

      // Format: BackupBookly_20260718_233925.json

      const now = new Date();

      const pad = (n) => String(n).padStart(2, '0');

      const filename = `BackupBookly_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.json`;

      

      // Use anchor tag with data URL for reliable filename

      const jsonString = JSON.stringify(data, null, 2);

      const blob = new Blob([jsonString], { type: 'application/json' });

      const url = URL.createObjectURL(blob);

      

      // Create temporary anchor element for download

      const a = document.createElement('a');

      a.href = url;

      a.download = filename;

      a.style.display = 'none';

      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);

      

      setTimeout(() => URL.revokeObjectURL(url), 100);

      

      showNotification(`✅ Backup saved as ${filename}`, 'success');

    });

  }



  function importBookmarks(file) {

    const reader = new FileReader();

    reader.onload = (e) => {

      try {

        const data = JSON.parse(e.target.result);

        if (!data.links && !data.quickAccess) throw new Error('Invalid backup file');

        

        const importData = {};

        if (data.links) importData.links = data.links;

        if (data.quickAccess) importData.quickAccess = data.quickAccess;

        if (data.pinnedFolders) importData.pinnedFolders = data.pinnedFolders;

        if (data.favoriteFolders) importData.favoriteFolders = data.favoriteFolders;

        if (data.folderIcons) importData.folderIcons = data.folderIcons;

        if (data.folderOrder) importData.folderOrder = data.folderOrder;

        if (data.theme) importData.theme = data.theme;

        if (data.showFavoritesOnly !== undefined) importData.showFavoritesOnly = data.showFavoritesOnly;

        if (data.customLinkOrder) importData.customLinkOrder = data.customLinkOrder;

        if (data.allLinksCustomOrder) importData.allLinksCustomOrder = data.allLinksCustomOrder;

        

        chrome.storage.local.set(importData, () => {

          quickAccessSites = data.quickAccess || [];

          pinnedFolders = data.pinnedFolders || [];

          favoriteFolders = data.favoriteFolders || {};

          folderIcons = data.folderIcons || {};

          showFavoritesOnlyEnabled = false;

          customLinkOrder = data.customLinkOrder || {};

          allLinksCustomOrder = data.allLinksCustomOrder || [];

          

          if (data.theme) applyTheme(data.theme);

          if (showFavoritesOnly) showFavoritesOnly.checked = showFavoritesOnlyEnabled;

          

          renderFolders();

          renderQuickAccess();

          displayLinksForCurrentFolder();

          renderRecentlyAdded();

          renderMostUsed();

          

          showNotification('Bookmarks imported successfully!');

          settingsPanel?.classList.add('hidden');

        });

      } catch (error) {

        showNotification('Failed to import: ' + error.message, 'error');

      }

    };

    reader.readAsText(file);

    if (importFileSelect) importFileSelect.value = '';

  }



  // ============================================

  // KEYBOARD-FIRST NAVIGATION (Vim-style)

  // ============================================

  let kbFocusedIndex = -1;

  let kbNavActive = false;

  const kbNavHint = document.getElementById('kbNavHint');

  let kbHintTimeout = null;



  function getLinkElements() {

    return Array.from(linksContainer?.querySelectorAll('.link-tag') || []);

  }



  function clearKbFocus() {

    const all = getLinkElements();

    all.forEach(el => el.classList.remove('kb-focused'));

  }



  function setKbFocus(index) {

    const all = getLinkElements();

    if (all.length === 0) return;

    

    // Clamp index

    if (index < 0) index = 0;

    if (index >= all.length) index = all.length - 1;

    

    clearKbFocus();

    kbFocusedIndex = index;

    all[index].classList.add('kb-focused');

    all[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    

    // Show hint on first activation

    if (!kbNavActive) {

      kbNavActive = true;

      if (kbNavHint) kbNavHint.classList.add('visible');

      clearTimeout(kbHintTimeout);

      kbHintTimeout = setTimeout(() => {

        if (kbNavHint) kbNavHint.classList.remove('visible');

      }, 4000);

    }

  }



  function deactivateKbNav() {

    kbNavActive = false;

    kbFocusedIndex = -1;

    clearKbFocus();

    if (kbNavHint) kbNavHint.classList.remove('visible');

  }



  // Get the number of columns in the current grid view

  function getGridColumnCount() {

    if (!linksContainer) return 1;

    const style = window.getComputedStyle(linksContainer);

    if (style.gridTemplateColumns) {

      return style.gridTemplateColumns.split(' ').length;

    }

    return 1;

  }



  document.addEventListener('keydown', (e) => {

    // Don't intercept if user is typing in an input/textarea

    const tag = e.target.tagName.toLowerCase();

    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    

    // Don't intercept if a modal is open

    const anyModalOpen = document.querySelector('.modal-overlay:not(.hidden)');

    if (anyModalOpen) return;

    

    // Don't intercept if settings panel is open

    if (settingsPanel && !settingsPanel.classList.contains('hidden')) return;

    

    const linkElements = getLinkElements();

    if (linkElements.length === 0) return;

    

    let handled = false;

    

    switch(e.key) {

      case 'j':

      case 'ArrowDown':

        // Move down one row

        if (kbFocusedIndex === -1) {

          setKbFocus(0);

        } else {

          const cols = getGridColumnCount();

          const isListView = linksContainer.classList.contains('list-view');

          const step = isListView ? 1 : cols;

          setKbFocus(kbFocusedIndex + step);

        }

        handled = true;

        break;

        

      case 'k':

      case 'ArrowUp':

        // Move up one row

        if (kbFocusedIndex === -1) {

          setKbFocus(0);

        } else {

          const cols = getGridColumnCount();

          const isListView = linksContainer.classList.contains('list-view');

          const step = isListView ? 1 : cols;

          setKbFocus(kbFocusedIndex - step);

        }

        handled = true;

        break;

        

      case 'h':

      case 'ArrowLeft':

        // Move left one item (grid only) or go back in breadcrumb

        if (kbFocusedIndex === -1) {

          setKbFocus(0);

        } else {

          const isListView = linksContainer.classList.contains('list-view');

          if (isListView) {

            // In list view, go back in breadcrumb

            const homeEl = document.getElementById('breadcrumbHome');

            if (homeEl) homeEl.click();

            deactivateKbNav();

          } else {

            if (kbFocusedIndex > 0) {

              setKbFocus(kbFocusedIndex - 1);

            }

          }

        }

        handled = true;

        break;

        

      case 'l':

      case 'ArrowRight':

        // Move right one item (grid only) or open focused item

        if (kbFocusedIndex === -1) {

          setKbFocus(0);

        } else {

          const isListView = linksContainer.classList.contains('list-view');

          if (isListView) {

            // In list view, open the focused link

            const focusedEl = linkElements[kbFocusedIndex];

            if (focusedEl) focusedEl.click();

            deactivateKbNav();

          } else {

            const cols = getGridColumnCount();

            // If at end of row, don't go to next row

            if ((kbFocusedIndex + 1) % cols !== 0 && kbFocusedIndex < linkElements.length - 1) {

              setKbFocus(kbFocusedIndex + 1);

            }

          }

        }

        handled = true;

        break;

        

      case 'Enter':

        // Open focused link

        if (kbFocusedIndex >= 0 && kbFocusedIndex < linkElements.length) {

          linkElements[kbFocusedIndex].click();

          deactivateKbNav();

        }

        handled = true;

        break;

        

      case 'Escape':

        // Exit keyboard nav mode

        deactivateKbNav();

        handled = true;

        break;

        

      case '/':

        // Focus search

        if (searchInput) {

          searchInput.focus();

          deactivateKbNav();

        }

        handled = true;

        break;

    }

    

    if (handled) {

      e.preventDefault();

      e.stopPropagation();

    }

  });



  // Reset keyboard nav when links are re-rendered

  // Use MutationObserver on linksContainer to preserve focus

  if (linksContainer) {

    const kbObserver = new MutationObserver(() => {

      if (kbFocusedIndex >= 0) {

        const linkElements = getLinkElements();

        if (kbFocusedIndex < linkElements.length) {

          linkElements[kbFocusedIndex].classList.add('kb-focused');

        } else {

          kbFocusedIndex = -1;

        }

      }

    });

    kbObserver.observe(linksContainer, { childList: true });

  }



  // ============================================

  // VOICE SEARCH SYSTEM

  // ============================================

  

  async function startVoiceSearch(targetInput, btnElement) {

    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionApi) {

      showNotification('Voice typing is not supported by this browser. Update Chrome and try again.', 'warning');

      return;

    }

    if (window._activeVoiceRecognition) {

      try { window._activeVoiceRecognition.abort(); } catch (_) {}

      window._activeVoiceRecognition = null;

    }



    const recognition = new SpeechRecognitionApi();

    window._activeVoiceRecognition = recognition;

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.maxAlternatives = 1;

    const browserLang = (navigator.language || 'en-US').toLowerCase();

    const langMap = {

      bn: 'bn-BD', 'bn-bd': 'bn-BD', 'bn-in': 'bn-IN',

      en: 'en-US', 'en-us': 'en-US', 'en-gb': 'en-GB',

      hi: 'hi-IN', ja: 'ja-JP', ko: 'ko-KR', zh: 'zh-CN',

      fr: 'fr-FR', de: 'de-DE', es: 'es-ES', pt: 'pt-BR',

      ru: 'ru-RU', ar: 'ar-SA', tr: 'tr-TR', it: 'it-IT'

    };

    recognition.lang = langMap[browserLang] || langMap[browserLang.split('-')[0]] || navigator.language || 'en-US';

    let finalTranscript = '';

    let latestRecognizedText = '';

    let started = false;

    let completed = false;



    if (btnElement) {

      btnElement.classList.add('listening');

      btnElement.title = 'Requesting microphone…';

      btnElement.setAttribute('aria-label', 'Voice typing active');

    }



    recognition.onstart = () => {

      started = true;

      if (btnElement) btnElement.title = 'Listening… click to cancel';

      showNotification(`Listening in ${recognition.lang}. Speak clearly.`, 'info');

    };



    recognition.onresult = event => {

      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {

        const result = event.results[i];

        const transcript = result?.[0]?.transcript?.trim() || '';

        if (!transcript) continue;

        if (result.isFinal) finalTranscript = [finalTranscript, transcript].filter(Boolean).join(' ').trim();

        else interim = [interim, transcript].filter(Boolean).join(' ').trim();

      }

      latestRecognizedText = [finalTranscript, interim].filter(Boolean).join(' ').trim();

      if (targetInput && latestRecognizedText) {

        targetInput.value = latestRecognizedText;

        targetInput.dispatchEvent(new Event('input', { bubbles: true }));

      }

    };



    recognition.onerror = event => {

      const error = event?.error || 'unknown';

      if (error === 'not-allowed' || error === 'service-not-allowed') {

        showNotification('Microphone access is blocked. Allow Microphone for Bookly Pro in Chrome site settings, then reload this New Tab.', 'warning');

      } else if (error === 'audio-capture') {

        showNotification('No microphone was found. Check the selected microphone in Windows sound settings.', 'warning');

      } else if (error === 'network') {

        showNotification('Voice typing needs an internet connection for speech recognition. Check your connection and retry.', 'warning');

      } else if (error === 'language-not-supported') {

        showNotification(`Speech recognition does not support ${recognition.lang}. Change Chrome's language and try again.`, 'warning');

      } else if (!['no-speech', 'aborted'].includes(error)) {

        showNotification(`Voice typing error: ${error}. Check microphone permission and try again.`, 'warning');

      }

    };



    recognition.onend = () => {

      completed = true;

      if (btnElement) {

        btnElement.classList.remove('listening');

        btnElement.title = 'Voice typing';

        btnElement.setAttribute('aria-label', 'Voice typing');

      }

      window._activeVoiceRecognition = null;

      const query = (finalTranscript || latestRecognizedText || '').trim();

      if (targetInput && query) {

        targetInput.value = query;

        targetInput.dispatchEvent(new Event('input', { bubbles: true }));

        targetInput.focus({ preventScroll: true });

        // Keep existing voice-search behaviour: recognized words are immediately applied.

        performBooleanSearch(query);

      } else if (started) {

        showNotification('No speech was detected. Check that the correct microphone is enabled, then try again.', 'warning');

      }

    };



    const beginRecognition = () => {

      try {

        recognition.start();

      } catch (error) {

        if (btnElement) btnElement.classList.remove('listening');

        window._activeVoiceRecognition = null;

        const message = error?.name === 'InvalidStateError'

          ? 'Voice typing is already active. Wait a moment and try again.'

          : 'Could not start voice typing. Check microphone access and try again.';

        showNotification(message, 'warning');

      }

    };



    // Request the microphone through the standard permission prompt first. Stopping this

    // temporary stream releases the device for the browser's speech-recognition service.

    if (navigator.mediaDevices?.getUserMedia) {

      try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        stream.getTracks().forEach(track => track.stop());

        if (!completed && window._activeVoiceRecognition === recognition) beginRecognition();

        else if (btnElement) btnElement.classList.remove('listening');

      } catch (error) {

        if (btnElement) {

          btnElement.classList.remove('listening');

          btnElement.title = 'Voice typing';

          btnElement.setAttribute('aria-label', 'Voice typing');

        }

        window._activeVoiceRecognition = null;

        if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {

          showNotification('No microphone was detected. Connect or enable a microphone, then try again.', 'warning');

        } else if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {

          showNotification('Microphone permission was denied. Allow microphone access for Bookly Pro in Chrome site settings, then reload this New Tab.', 'warning');

        } else {

          // Some browser builds do not expose getUserMedia on extension pages; still try the native API.

          beginRecognition();

        }

      }

    } else {

      beginRecognition();

    }

  }



  // Search-by-image was removed from the top toolbar.



  // AI assistant speed dial removed from the dashboard in 4.0.3.



  if (voiceSearchBtn) {

    voiceSearchBtn.title = 'Voice typing';

    voiceSearchBtn.setAttribute('aria-label', 'Voice typing');

    voiceSearchBtn.addEventListener('click', () => {

      if (window._activeVoiceRecognition) {

        try { window._activeVoiceRecognition.abort(); } catch (_) {}

        window._activeVoiceRecognition = null;

        voiceSearchBtn.classList.remove('listening');

        voiceSearchBtn.title = 'Voice typing';

        return;

      }

      startVoiceSearch(booleanSearchInput, voiceSearchBtn);

    });

  }



  // ============================================

  // BROKEN LINK MANAGER FIX

  // ============================================

  

  function checkLinkStatus(item) {

    return new Promise((resolve) => {

      const controller = new AbortController();

      const timeout = setTimeout(() => controller.abort(), 8000);

      

      // Try CORS mode first - this lets us read the actual status code

      fetch(item.link, { method: 'HEAD', mode: 'cors', signal: controller.signal })

        .then(response => {

          clearTimeout(timeout);

          if (response.ok) {

            resolve({ ...item, broken: false });

          } else {

            resolve({ ...item, broken: true, reason: 'HTTP ' + response.status });

          }

        })

        .catch(() => {

          clearTimeout(timeout);

          // CORS blocked or network error - try image-based check as fallback

          const img = new Image();

          const imgTimeout = setTimeout(() => {

            img.src = '';

            resolve({ ...item, broken: true, reason: 'Timeout' });

          }, 6000);

          

          img.onload = () => {

            clearTimeout(imgTimeout);

            resolve({ ...item, broken: false });

          };

          

          img.onerror = () => {

            clearTimeout(imgTimeout);

            // Try no-cors fetch as final check

            const controller2 = new AbortController();

            const timeout2 = setTimeout(() => controller2.abort(), 5000);

            

            fetch(item.link, { method: 'HEAD', mode: 'no-cors', signal: controller2.signal })

              .then(() => {

                clearTimeout(timeout2);

                resolve({ ...item, broken: false, reason: 'Unverified (CORS)' });

              })

              .catch((err) => {

                clearTimeout(timeout2);

                resolve({ ...item, broken: true, reason: err.name === 'AbortError' ? 'Timeout' : 'Network Error' });

              });

          };

          

          try {

            img.src = item.link;

          } catch(e) {

            clearTimeout(imgTimeout);

            resolve({ ...item, broken: true, reason: 'Invalid URL' });

          }

        });

    });

  }

  

  // Override checkAllBrokenLinks with improved version

  checkAllBrokenLinks = function() {

    chrome.storage.local.get(['links'], (result) => {

      const allLinks = result.links || {};

      brokenLinksData = [];

      let linksToCheck = [];

      

      const folder = currentFolder === 'All Links' ? null : currentFolder;

      

      if (folder && allLinks[folder]) {

        allLinks[folder].forEach((link, index) => {

          if (link.link && link.link.startsWith('http')) {

            linksToCheck.push({ folder, index, link: link.link, title: link.title });

          }

        });

      } else {

        Object.entries(allLinks).forEach(([f, links]) => {

          links.forEach((link, index) => {

            if (link.link && link.link.startsWith('http')) {

              linksToCheck.push({ folder: f, index, link: link.link, title: link.title });

            }

          });

        });

      }

      

      if (linksToCheck.length === 0) {

        if (brokenLinksCount) brokenLinksCount.textContent = 'No links to check';

        if (brokenLinksList) brokenLinksList.innerHTML = '<div class="no-links-message">No links found</div>';

        return;

      }

      

      if (brokenLinksCount) brokenLinksCount.textContent = 'Checking 0/' + linksToCheck.length + ' links...';

      if (brokenLinksList) brokenLinksList.innerHTML = '<div class="no-links-message"><div class="spinner"></div>Checking links, please wait...</div>';

      

      let checkedCount = 0;

      let brokenResults = [];

      

      const batchSize = 3;

      

      const checkBatch = async (startIndex) => {

        const batch = linksToCheck.slice(startIndex, startIndex + batchSize);

        if (batch.length === 0) {

          brokenLinksData = brokenResults;

          renderBrokenLinksList();

          return;

        }

        

        const results = await Promise.all(batch.map(checkLinkStatus));

        results.forEach(r => {

          if (r.broken) brokenResults.push(r);

        });

        checkedCount += batch.length;

        if (brokenLinksCount) brokenLinksCount.textContent = 'Checking ' + checkedCount + '/' + linksToCheck.length + ' links...';

        

        checkBatch(startIndex + batchSize);

      };

      



      checkBatch(0);

    });

  };



  // =========================================================

  // CLEAN HOMEPAGE, QUICKLINK DOCK AND SAVED-BOOKMARKS POPUP

  // =========================================================

  const homeDashboard = document.getElementById('homeDashboard');

  const homeGreeting = document.getElementById('homeGreeting');

  const homeDate = document.getElementById('homeDate');

  const homeTime = document.getElementById('homeTime');

  const homeWelcome = document.querySelector('.home-welcome');

  const homeUserName = document.getElementById('homeUserName');

  const homeQuickLinks = document.getElementById('homeQuickLinks');

  const dockAddQuickLinkBtn = document.getElementById('dockAddQuickLinkBtn');

  const savedBookmarksBtn = document.getElementById('savedBookmarksBtn'); // legacy optional button; removed from the homepage

  const favoriteBookmarksBtn = document.getElementById('favoriteBookmarksBtn'); // legacy optional button; removed from the homepage

  const favoriteBookmarksOverlay = document.getElementById('favoriteBookmarksOverlay');

  const closeFavoriteBookmarksBtn = document.getElementById('closeFavoriteBookmarksBtn');

  const favoriteBookmarksSearch = document.getElementById('favoriteBookmarksSearch');

  const favoriteBookmarksCount = document.getElementById('favoriteBookmarksCount');

  const favoriteBookmarkAppsGrid = document.getElementById('favoriteBookmarkAppsGrid');

  const savedBookmarksOverlay = document.getElementById('savedBookmarksOverlay');

  const closeSavedBookmarksBtn = document.getElementById('closeSavedBookmarksBtn');

  const savedBookmarksSearch = document.getElementById('savedBookmarksSearch');

  const savedBookmarkCategories = document.getElementById('savedBookmarkCategories');

  const savedBookmarksCount = document.getElementById('savedBookmarksCount');

  const savedAddFolderBtn = document.getElementById('savedAddFolderBtn');

  const savedAddBookmarkBtn = document.getElementById('savedAddBookmarkBtn');

  const savedBookmarksFolderList = document.getElementById('savedBookmarksFolderList');

  const savedAllLinksNav = document.getElementById('savedAllLinksNav');

  const savedFavoritesNav = document.getElementById('savedFavoritesNav');

  const savedAllLinksNavCount = document.getElementById('savedAllLinksNavCount');

  const savedFavoritesNavCount = document.getElementById('savedFavoritesNavCount');

  const savedSelectedFolderTitle = document.getElementById('savedSelectedFolderTitle');

  const savedSelectedFolderSubtitle = document.getElementById('savedSelectedFolderSubtitle');

  const savedSelectedFolderCount = document.getElementById('savedSelectedFolderCount');

  let selectedSavedFolder = 'All Links';

  let savedFolderDragState = null;

  let suppressSavedFolderClickUntil = 0;

  const backHomeFromManagerBtn = document.getElementById('backHomeFromManagerBtn');

  const homeWallpaperBg = document.getElementById('homeWallpaperBg');

  const homeWebSearchForm = document.getElementById('homeWebSearchForm');

  const homeWebSearchInput = document.getElementById('homeWebSearchInput');

  let savedBookmarksCache = { links: {}, folderOrder: [], folderIcons: {} };



  const HOME_STOCK_SHORTCUTS = [

    { name: 'Adobe Stock', url: 'https://contributor.stock.adobe.com/en/portfolio' },

    { name: 'Shutterstock', url: 'https://submit.shutterstock.com/portfolio/not_submitted/photo' },

    { name: 'Magnific', url: 'https://contributor.magnific.com/dashboard' },

    { name: 'Creative Fabrica', url: 'https://www.creativefabrica.com/dashboard/' },

    { name: 'GraphicRiver', url: 'https://graphicriver.net/content/upload' },

    { name: 'Dreamstime', url: 'https://www.dreamstime.com/upload' },

    { name: 'Vecteezy', url: 'https://contributors.vecteezy.com/' },

    { name: 'Yandex Images', url: 'https://yandex.com/images/?ncrnd=7887&utm_campaign=morda&utm_medium=com&utm_source=yandex' },

    { name: 'Microstock Sheet', url: 'https://docs.google.com/spreadsheets/d/1p0BMZvEjUWnbXEjjeVEQg4wjW-MiZjKrhULiH7wMt4U/edit?gid=0#gid=0' }

  ];



  function safeFaviconUrl(url) {

    try {

      const host = new URL(url).hostname;

      return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}`;

    } catch (_) {

      return 'Assets/icon16.png';

    }

  }





  function renderHomeDateAndGreeting() {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const greeting = hour < 5 ? 'Good Night' : hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : hour < 21 ? 'Good Evening' : 'Good Night';
    if (homeGreeting) homeGreeting.textContent = greeting;
    if (homeDate) homeDate.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    // Live Architectural Timepiece & Header Elements
    const timeDigitsEl = document.getElementById('homeTimeDigits');
    const timePeriodEl = document.getElementById('homeTimePeriod');
    const greetingChipEl = document.getElementById('homeGreetingChip');
    const calendarChipEl = document.getElementById('homeCalendarChip');

    if (timeDigitsEl) {
      const displayHours = hour % 12 || 12;
      const displayMinutes = String(minutes).padStart(2, '0');
      timeDigitsEl.textContent = `${displayHours}:${displayMinutes}`;
    }
    if (timePeriodEl) {
      timePeriodEl.textContent = hour >= 12 ? 'PM' : 'AM';
    }
    if (greetingChipEl) {
      greetingChipEl.textContent = greeting;
    }
    if (calendarChipEl) {
      calendarChipEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }
  }



  const HOME_DEFAULT_QUOTES = [
  "আমার একটা ফুটফুটে মেয়ে আছে, তার সুন্দর ভবিষ্যতের জন্য আমাকে আজই সময় অপচয় বন্ধ করতে হবে।",
  "বয়স ৩০ পেরিয়ে যাচ্ছে—শরীর চিরকাল একই শক্তি দেবে না। এখনই সময় পড়াশোনায় মন বসানোর।",
  "মূল লক্ষ্য সরকারি চাকরি: পড়াশোনায় এক মুহূর্তের অবহেলা নয়, প্রতিটি দিনই একেকটি যুদ্ধ।",
  "বেহুদা স্ক্রলিং বা সময় নষ্ট করার বিলাসিতা আমার নেই। আজকের পরিশ্রমই আগামী দিনের নিরাপত্তা।",
  "ফাইবার ও মাইক্রোস্টকে যেটুকু সময় দেব, পূর্ণ মনোযোগ দিয়ে দ্রুত করব—কোনো সময় নষ্ট নয়।",
  "সংসার আর মেয়ের মুখের অমূল্য হাসির চেয়ে বড় কোনো প্রেরণা হতে পারে না। পড়ার টেবিলে মনস্থির করো।",
  "ক্লান্তি আসবে, কিন্তু মেয়ের নিরাপদ ভবিষ্যতের কথা ভেবে আবারও বইয়ের পাতায় ফিরে যাও।",
  "৩০ বছর বয়সে এসে আর দ্বিতীয় সুযোগের আশা করা যায় না। নিজের সর্বোচ্চটা দিয়ে পড়ো।",
  "যেটুকু কাজ করব, দ্বিগুণ গতিতে করব। আর বাকিটা সময় সরকারি চাকরির পরীক্ষার প্রস্তুতিতে দেব।",
  "মনস্থির করো। আজকের প্রতিটি অধ্যায় তোমাকে একটি নিশ্চিত ক্যারিয়ার ও পরিবারের মুখে হাসি এনে দেবে।",
  "Time is slipping away. Protect your daughter's future with relentless focus today.",
  "Online work brings bread today, but focused study secures the family tomorrow.",
  "Stop wasting hours. Every page you read brings your dream government job closer.",
  "Disciplined study today = financial peace and security for my family tomorrow."
];



  function initializeHomeQuotes() {
    const widget = document.getElementById('homeQuoteWidget');
    const quoteText = document.getElementById('homeQuoteText');
    const editor = document.getElementById('customHomeQuotesInput');
    const saveButton = document.getElementById('saveHomeQuotesBtn');
    const resetButton = document.getElementById('resetHomeQuotesBtn');

    if (!widget || !quoteText) return;

    const getDefaultQuotes = () => {
      if (Array.isArray(window.BOOKLY_DEFAULT_QUOTES) && window.BOOKLY_DEFAULT_QUOTES.length > 0) {
        return window.BOOKLY_DEFAULT_QUOTES;
      }
      return HOME_DEFAULT_QUOTES;
    };

    let activeIndex = -1;
    let availableQuotes = getDefaultQuotes().slice();

    const pickQuote = (avoidCurrent = true) => {
      const defaults = getDefaultQuotes();
      if (!availableQuotes.length) availableQuotes = defaults.slice();
      let nextIndex = Math.floor(Math.random() * availableQuotes.length);
      if (avoidCurrent && availableQuotes.length > 1 && nextIndex === activeIndex) {
        nextIndex = (nextIndex + 1) % availableQuotes.length;
      }
      activeIndex = nextIndex;

      quoteText.style.opacity = '0';
      setTimeout(() => {
        quoteText.textContent = availableQuotes[nextIndex];
        quoteText.style.opacity = '1';
      }, 150);

      const countInfo = `${availableQuotes.length} quotes loaded`;
      widget.setAttribute('aria-label', `Click to shuffle quote (${activeIndex + 1}/${availableQuotes.length}). Auto-rotates every 25 min.`);
      widget.title = `Click to shuffle quote (${activeIndex + 1}/${availableQuotes.length}) • Auto-rotates every 25 min`;
    };

    const loadStoredQuotes = () => chrome.storage.local.get(['homeQuotesCustom'], result => {
      const defaults = getDefaultQuotes();
      const custom = Array.isArray(result.homeQuotesCustom) 
        ? result.homeQuotesCustom.filter(q => typeof q === 'string' && q.trim()).map(q => q.trim()).slice(0, 5000) 
        : [];
      availableQuotes = custom.length ? custom : defaults.slice();
      if (editor) editor.value = custom.join('\n');
      pickQuote(false);
    });

    // Manual click on quote to rotate
    widget.addEventListener('click', () => {
      pickQuote(true);
    });

    // Auto-rotate every 25 minutes (within the 20-30 min window)
    setInterval(() => {
      pickQuote(true);
    }, 25 * 60 * 1000);

    // Settings save custom quotes
    saveButton?.addEventListener('click', () => {
      const custom = String(editor?.value || '').split(/\r?\n/).map(q => q.trim()).filter(Boolean).slice(0, 5000);
      chrome.storage.local.set({ homeQuotesCustom: custom }, () => {
        availableQuotes = custom.length ? custom : getDefaultQuotes().slice();
        pickQuote(false);
        showNotification(custom.length ? `${custom.length} custom quotes saved.` : '1,000 Built-in quotes restored.', 'success');
      });
    });

    // Settings reset to built-in 1000 quotes
    resetButton?.addEventListener('click', () => {
      if (editor) editor.value = '';
      chrome.storage.local.set({ homeQuotesCustom: [] }, () => {
        availableQuotes = getDefaultQuotes().slice();
        pickQuote(false);
        showNotification('1,000 Built-in motivational quotes restored.', 'success');
      });
    });

    const loadFromQuotesTxt = async () => {
      try {
        const fileUrl = (typeof chrome !== 'undefined' && chrome.runtime?.getURL) ? chrome.runtime.getURL('quotes.txt') : 'quotes.txt';
        const res = await fetch(fileUrl, { cache: 'no-cache' });
        if (res.ok) {
          const text = await res.text();
          const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
          if (lines.length > 0) {
            window.BOOKLY_DEFAULT_QUOTES = lines;
            chrome.storage.local.get(['homeQuotesCustom'], result => {
              if (!Array.isArray(result.homeQuotesCustom) || result.homeQuotesCustom.length === 0) {
                availableQuotes = lines.slice();
                pickQuote(false);
              }
            });
          }
        }
      } catch (err) {
        // Fallback to window.BOOKLY_DEFAULT_QUOTES
      }
    };

    pickQuote(false);
    loadStoredQuotes();
    loadFromQuotesTxt();
  }



  function renderHomeQuickLinks() {

    if (!homeQuickLinks) return;

    homeQuickLinks.innerHTML = '';



    (Array.isArray(homeDockLinks) ? homeDockLinks : []).forEach((site, index) => {

      if (!site?.link) return;

      const wrapper = document.createElement('div');

      wrapper.className = 'dock-link-item';

      const a = document.createElement('a');

      a.className = 'dock-quicklink';

      a.href = site.link;

      a.title = `${site.title || extractTitle(site.link)}\nClick to open · Right-click for options`;

      a.setAttribute('aria-label', site.title || site.link);

      a.addEventListener('contextmenu', (event) => showQuickAccessContextMenu(event, site, index, 'dock'));

      const img = document.createElement('img');

      img.alt = '';

      img.loading = 'lazy';

      img.src = getFaviconUrl(site.link, site.customFavicon || '') || safeFaviconUrl(site.link);

      img.onerror = () => { img.onerror = null; img.src = safeFaviconUrl(site.link); };

      a.appendChild(img);

      a.addEventListener('click', (event) => {

        if (event.ctrlKey || event.metaKey || event.shiftKey || event.button === 1) return;

        event.preventDefault();

        openLink(site.link, false);

      });



      wrapper.appendChild(a);

      homeQuickLinks.appendChild(wrapper);

    });

  }



  function deleteHomeDockLink(index) {

    if (!Number.isInteger(index) || index < 0 || index >= homeDockLinks.length) return;

    homeDockLinks.splice(index, 1);

    chrome.storage.local.set({ homeDockLinks }, () => {

      renderHomeQuickLinks();

      showNotification('Bottom quick link deleted.', 'success');

    });

  }



  function openSavedBookmarksPopup() {

    if (!savedBookmarksOverlay) return;

    savedBookmarksOverlay.classList.remove('hidden', 'is-closing');

    document.body.classList.add('saved-bookmarks-open');

    appLauncherBtn?.classList.add('active');

    if (savedBookmarksSearch) savedBookmarksSearch.value = '';

    selectedSavedFolder = 'All Links';

    renderSavedBookmarks();

    requestAnimationFrame(() => savedBookmarksOverlay.classList.add('is-open'));

    setTimeout(() => savedBookmarksSearch?.focus(), 90);

  }



  function closeSavedBookmarksPopup() {

    if (!savedBookmarksOverlay || savedBookmarksOverlay.classList.contains('hidden')) return;

    savedBookmarksOverlay.classList.remove('is-open');

    savedBookmarksOverlay.classList.add('is-closing');

    appLauncherBtn?.classList.remove('active');

    window.setTimeout(() => {

      savedBookmarksOverlay.classList.add('hidden');

      savedBookmarksOverlay.classList.remove('is-closing');

      document.body.classList.remove('saved-bookmarks-open');

    }, 220);

  }



  function reorderSavedBookmarkFolder(sourcePath, targetPath, position = 'after') {

    if (!sourcePath || !targetPath || sourcePath === targetPath) return;

    const sourceParent = getParentFolder(sourcePath);

    const targetParent = getParentFolder(targetPath);

    if (sourceParent !== targetParent) {

      showNotification('Folders can be reordered within the same folder level.', 'info');

      return;

    }

    chrome.storage.local.get(['links', 'folderOrder'], result => {

      const links = result.links && typeof result.links === 'object' ? result.links : {};

      const allFolders = Object.keys(links);

      let order = Array.isArray(result.folderOrder) ? result.folderOrder.filter(path => Object.prototype.hasOwnProperty.call(links, path)) : [];

      allFolders.forEach(path => { if (!order.includes(path)) order.push(path); });

      if (!order.includes(sourcePath) || !order.includes(targetPath)) return;

      // Move the folder together with all of its descendants so the flattened

      // bookmark sidebar never shows a child above its parent after a reorder.

      const sourceBlock = order.filter(path => path === sourcePath || path.startsWith(sourcePath + '/'));

      let nextOrder = order.filter(path => !sourceBlock.includes(path));

      const targetIndexes = [];

      nextOrder.forEach((path, index) => {

        if (path === targetPath || path.startsWith(targetPath + '/')) targetIndexes.push(index);

      });

      if (!targetIndexes.length) return;

      const insertIndex = position === 'after' ? Math.max(...targetIndexes) + 1 : nextOrder.indexOf(targetPath);

      nextOrder.splice(insertIndex, 0, ...sourceBlock);

      const dedupedOrder = [...new Set(nextOrder)];

      chrome.storage.local.set({ folderOrder: dedupedOrder }, () => {

        folderOrder = dedupedOrder;

        renderFolders(folderSearchInput?.value?.trim() || '');

        renderSavedBookmarks();

        showNotification('Folder order saved', 'success');

      });

    });

  }



  function renderSavedBookmarks() {

    if (!savedBookmarkCategories) return;

    const query = (savedBookmarksSearch?.value || '').trim().toLowerCase();

    chrome.storage.local.get(['links', 'folderOrder', 'folderIcons', 'favoriteFolders'], (result) => {

      const links = result.links && typeof result.links === 'object' ? result.links : {};

      const order = Array.isArray(result.folderOrder) ? result.folderOrder : [];

      const icons = result.folderIcons && typeof result.folderIcons === 'object' ? result.folderIcons : {};

      const colors = result.favoriteFolders && typeof result.favoriteFolders === 'object' ? result.favoriteFolders : {};

      savedBookmarksCache = { links, folderOrder: order, folderIcons: icons, favoriteFolders: colors };

      const allFolders = [...new Set([...order.filter(path => Object.prototype.hasOwnProperty.call(links, path)), ...Object.keys(links)])];

      if (selectedSavedFolder !== 'All Links' && selectedSavedFolder !== 'Pinned & Favorites' && !allFolders.includes(selectedSavedFolder)) selectedSavedFolder = 'All Links';

      const totalBookmarks = Object.values(links).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);

      const favoriteCount = Object.values(links).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr : []).filter(item => item && (item.favorite || item.pinned)).length, 0);

      if (savedBookmarksCount) savedBookmarksCount.textContent = `${allFolders.length} folders · ${totalBookmarks} bookmarks`;

      if (savedAllLinksNavCount) savedAllLinksNavCount.textContent = String(totalBookmarks);

      if (savedFavoritesNavCount) savedFavoritesNavCount.textContent = String(favoriteCount);

      if (savedBookmarksFolderList) savedBookmarksFolderList.innerHTML = '';



      const folderMatchesQuery = folderPath => {

        const folderLinks = Array.isArray(links[folderPath]) ? links[folderPath] : [];

        return !query || folderPath.toLowerCase().includes(query) || folderLinks.some(item => `${item?.title || ''} ${item?.link || ''} ${(item?.tags || []).join(' ')}`.toLowerCase().includes(query));

      };



      const setView = view => {

        selectedSavedFolder = view;

        renderSavedBookmarks();

      };

      if (savedAllLinksNav) {

        savedAllLinksNav.classList.toggle('active', selectedSavedFolder === 'All Links');

        savedAllLinksNav.onclick = () => setView('All Links');

      }

      if (savedFavoritesNav) {

        savedFavoritesNav.classList.toggle('active', selectedSavedFolder === 'Pinned & Favorites');

        savedFavoritesNav.onclick = () => setView('Pinned & Favorites');

      }



      const folderFragment = document.createDocumentFragment();
      allFolders.filter(folderMatchesQuery).forEach((folderPath, index) => {

        const folderLinks = Array.isArray(links[folderPath]) ? links[folderPath] : [];

        const button = document.createElement('button');

        button.type = 'button';

        button.className = 'saved-folder-nav';

        button.classList.toggle('active', selectedSavedFolder === folderPath);

        const depth = Math.max(0, folderPath.split('/').length - 1);

        button.style.setProperty('--folder-depth', String(Math.min(depth, 3)));

        button.title = folderPath;

        const icon = document.createElement('span');

        icon.className = 'saved-folder-nav-icon';

        const folderColor = colors[folderPath];

        const customIcon = icons[folderPath];

        if (customIcon) {

          icon.textContent = customIcon;

          if (folderColor) icon.style.color = folderColor;

        } else {

          const fillColor = folderColor || 'var(--primary-color, #38bdf8)';

          icon.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="' + fillColor + '" stroke="' + (folderColor ? 'rgba(0,0,0,0.3)' : 'var(--primary-color, #38bdf8)') + '" stroke-width="1.5" style="opacity: 0.95;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';

        }

        const label = document.createElement('span');

        label.className = 'saved-folder-nav-label';

        label.textContent = folderPath.split('/').pop() || folderPath;

        const count = document.createElement('span');

        count.className = 'saved-folder-nav-count';

        count.textContent = String(folderLinks.length);

        button.append(icon, label, count);

        if (folderColor) {

          button.style.setProperty('--saved-folder-accent', folderColor);

        }

        button.draggable = !query;

        button.classList.add('saved-folder-draggable');

        button.addEventListener('click', event => {

          if (Date.now() < suppressSavedFolderClickUntil) {

            event.preventDefault();

            event.stopPropagation();

            return;

          }

          setView(folderPath);

        });

        button.addEventListener('contextmenu', event => {

          event.preventDefault();

          event.stopPropagation();

          showFolderContextMenu(event, folderPath);

        });

        button.addEventListener('dragstart', event => {

          if (query) { event.preventDefault(); return; }

          savedFolderDragState = { path: folderPath, parent: getParentFolder(folderPath) };

          event.dataTransfer.effectAllowed = 'move';

          event.dataTransfer.setData('text/plain', `bookly-folder:${folderPath}`);

          button.classList.add('saved-folder-dragging');

          savedBookmarksFolderList?.classList.add('folder-reorder-active');

        });

        button.addEventListener('dragover', event => {

          if (!savedFolderDragState || savedFolderDragState.path === folderPath) return;

          if (savedFolderDragState.parent !== getParentFolder(folderPath)) return;

          event.preventDefault();

          event.dataTransfer.dropEffect = 'move';

          const rect = button.getBoundingClientRect();

          const position = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';

          button.classList.toggle('saved-folder-drop-before', position === 'before');

          button.classList.toggle('saved-folder-drop-after', position === 'after');

        });

        button.addEventListener('dragleave', event => {

          if (!button.contains(event.relatedTarget)) {

            button.classList.remove('saved-folder-drop-before', 'saved-folder-drop-after');

          }

        });

        button.addEventListener('drop', event => {

          if (!savedFolderDragState || savedFolderDragState.path === folderPath) return;

          if (savedFolderDragState.parent !== getParentFolder(folderPath)) return;

          event.preventDefault();

          event.stopPropagation();

          const rect = button.getBoundingClientRect();

          const position = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';

          const source = savedFolderDragState.path;

          savedFolderDragState = null;

          suppressSavedFolderClickUntil = Date.now() + 450;

          reorderSavedBookmarkFolder(source, folderPath, position);

        });

        button.addEventListener('dragend', () => {

          savedFolderDragState = null;

          savedBookmarksFolderList?.classList.remove('folder-reorder-active');

          savedBookmarksFolderList?.querySelectorAll('.saved-folder-nav').forEach(item => {

            item.classList.remove('saved-folder-dragging', 'saved-folder-drop-before', 'saved-folder-drop-after');

          });

        });

        savedBookmarksFolderList?.appendChild(button);

      });



      savedBookmarkCategories.innerHTML = '';

      savedBookmarkCategories.scrollTop = 0;

      const selectedIsAll = selectedSavedFolder === 'All Links';

      const selectedIsFavorites = selectedSavedFolder === 'Pinned & Favorites';

      const selectedFolderExists = Object.prototype.hasOwnProperty.call(links, selectedSavedFolder);

      if (!selectedIsAll && !selectedIsFavorites && !selectedFolderExists) selectedSavedFolder = 'All Links';



      if (savedSelectedFolderTitle) savedSelectedFolderTitle.textContent = selectedSavedFolder;

      if (savedSelectedFolderSubtitle) {

        savedSelectedFolderSubtitle.textContent = selectedSavedFolder === 'All Links'

          ? 'All saved bookmarks across every folder'

          : selectedSavedFolder === 'Pinned & Favorites'

            ? 'Your pinned and favorite bookmarks'

            : `Links saved in ${selectedSavedFolder}`;

      }



      const entries = [];

      const sourceFolders = selectedSavedFolder === 'All Links' || selectedSavedFolder === 'Pinned & Favorites' ? allFolders : [selectedSavedFolder];

      sourceFolders.forEach(folderPath => {

        const folderLinks = Array.isArray(links[folderPath]) ? links[folderPath] : [];

        const folderNameMatches = query && folderPath.toLowerCase().includes(query);

        folderLinks.forEach((bookmark, index) => {

          if (!bookmark?.link) return;

          if (selectedIsFavorites && !(bookmark.favorite || bookmark.pinned)) return;

          const text = `${bookmark.title || ''} ${bookmark.link || ''} ${(bookmark.tags || []).join(' ')} ${folderPath}`.toLowerCase();

          if (query && !folderNameMatches && !text.includes(query)) return;

          entries.push({ folderPath, bookmark, index });

        });

      });

      if (savedSelectedFolderCount) savedSelectedFolderCount.textContent = `${entries.length} ${entries.length === 1 ? 'link' : 'links'}`;



      if (!entries.length) {

        const empty = document.createElement('div');

        empty.className = 'saved-categories-empty saved-results-empty';

        empty.textContent = query ? 'No bookmarks match this search.' : selectedIsFavorites ? 'No pinned or favorite bookmarks yet.' : 'This folder has no saved links yet.';

        savedBookmarkCategories.appendChild(empty);

        return;

      }



      const cardFragment = document.createDocumentFragment();
      entries.forEach(({ folderPath, bookmark, index }) => {

        const card = document.createElement('article');

        card.className = 'saved-link-card';

        const open = document.createElement('a');

        open.className = 'saved-link-open';

        open.href = bookmark.link;

        open.title = bookmark.link;

        open.addEventListener('click', event => {

          if (event.ctrlKey || event.metaKey || event.shiftKey || event.button === 1) return;

          event.preventDefault();

          openLink(bookmark.link, false);

        });

        const iconWrap = document.createElement('span');

        iconWrap.className = 'saved-link-icon-wrap';

        const favicon = document.createElement('img');

        favicon.className = 'saved-link-favicon';

        favicon.alt = '';

        favicon.loading = 'lazy';

        favicon.src = getFaviconUrl(bookmark.link, bookmark.customFavicon || '') || safeFaviconUrl(bookmark.link);

        favicon.onerror = () => { favicon.onerror = null; favicon.src = safeFaviconUrl(bookmark.link); };

        iconWrap.appendChild(favicon);

        const info = document.createElement('span');

        info.className = 'saved-link-info';

        const name = document.createElement('span');

        name.className = 'saved-link-name';

        name.textContent = bookmark.title || extractTitle(bookmark.link);

        const domain = document.createElement('span');

        domain.className = 'saved-link-domain';

        try { domain.textContent = new URL(bookmark.link).hostname.replace(/^www\./i, ''); }

        catch (_) { domain.textContent = bookmark.link; }

        info.append(name, domain);

        open.append(iconWrap, info);

        // Folder names stay in the sidebar; bookmark cards remain clean and compact.

        const actions = document.createElement('div');

        actions.className = 'saved-link-actions';

        const edit = document.createElement('button');

        edit.type = 'button'; edit.className = 'saved-bookmark-edit'; edit.title = 'Edit bookmark'; edit.setAttribute('aria-label', `Edit ${bookmark.title || bookmark.link}`);

        edit.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"></path></svg>';

        edit.addEventListener('click', () => { currentFolder = folderPath; openModal(bookmark, folderPath, index); });

        const remove = document.createElement('button');

        remove.type = 'button'; remove.className = 'saved-bookmark-delete'; remove.title = 'Delete bookmark'; remove.setAttribute('aria-label', `Delete ${bookmark.title || bookmark.link}`);

        remove.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2m-11 0 1 14h12l1-14"></path></svg>';

        remove.addEventListener('click', () => {

          const titleText = bookmark.title || bookmark.link;

          if (confirmDeleteEnabled && !confirm(`Delete bookmark “${titleText}”?`)) return;

          chrome.storage.local.get(['links'], latest => {

            const latestLinks = latest.links || {};

            if (!Array.isArray(latestLinks[folderPath]) || !latestLinks[folderPath][index]) return;

            latestLinks[folderPath].splice(index, 1);

            chrome.storage.local.set({ links: latestLinks }, () => {

              renderFolders();

              displayLinksForCurrentFolder();

              renderSavedBookmarks();

              showNotification('Bookmark deleted.');

            });

          });

        });

        actions.append(edit, remove);

        card.append(open, actions);

        card.addEventListener('contextmenu', event => {

          event.preventDefault();

          showBookmarkContextMenu(event, { ...bookmark, folder: folderPath, index });

        });

        savedBookmarkCategories.appendChild(card);

      });

    });

  }



  function setupDraggableHomeWelcome() {

    if (!homeWelcome) return;

    homeWelcome.style.touchAction = 'none';

    chrome.storage.local.get(['homeWelcomePosition'], result => {

      const position = result.homeWelcomePosition;

      if (position && Number.isFinite(position.x) && Number.isFinite(position.y)) {

        homeWelcome.style.left = `${Math.max(5, Math.min(95, position.x))}%`;

        homeWelcome.style.top = `${Math.max(10, Math.min(90, position.y))}%`;

      }

    });

    let drag = null;

    homeWelcome.addEventListener('pointerdown', event => {

      if (event.button !== 0 || homeUserName?.isContentEditable || event.target.closest('button,input,a,[contenteditable="true"]')) return;

      const rect = homeWelcome.getBoundingClientRect();

      drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: rect.left + rect.width/2, top: rect.top + rect.height/2, moved: false };

    });

    document.addEventListener('pointermove', event => {

      if (!drag || event.pointerId !== drag.pointerId) return;

      const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;

      if (!drag.moved && Math.hypot(dx, dy) < 5) return;

      drag.moved = true;

      event.preventDefault();

      const x = Math.max(homeWelcome.offsetWidth / 2 + 8, Math.min(window.innerWidth - homeWelcome.offsetWidth / 2 - 8, drag.left + dx));

      const y = Math.max(homeWelcome.offsetHeight / 2 + 12, Math.min(window.innerHeight - homeWelcome.offsetHeight / 2 - 12, drag.top + dy));

      homeWelcome.style.left = `${x / window.innerWidth * 100}%`;

      homeWelcome.style.top = `${y / window.innerHeight * 100}%`;

      homeWelcome.dataset.dragging = 'true';

    }, { passive: false });

    const finishDrag = event => {

      if (!drag || event.pointerId !== drag.pointerId) return;

      if (drag.moved) {

        const x = parseFloat(homeWelcome.style.left) || 50;

        const y = parseFloat(homeWelcome.style.top) || 52;

        chrome.storage.local.set({ homeWelcomePosition: { x, y } });

        homeWelcome.dataset.dragging = 'true';

        setTimeout(() => { if (homeWelcome) delete homeWelcome.dataset.dragging; }, 180);

      }

      drag = null;

    };

    document.addEventListener('pointerup', finishDrag);

    document.addEventListener('pointercancel', finishDrag);

  }



  function setupEditableHomeName() {

    if (!homeUserName) return;

    const nameInput = document.getElementById('booklyDisplayNameInput');

    const saveNameButton = document.getElementById('saveBooklyDisplayNameBtn');

    const applyName = value => {

      const cleaned = String(value || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, 48) || 'Moshclusive';

      homeUserName.textContent = cleaned;

      homeUserName.title = 'Display name — edit in Settings';

      homeUserName.setAttribute('aria-label', cleaned);

      if (nameInput && nameInput.value !== cleaned) nameInput.value = cleaned;

    };

    chrome.storage.local.get(['homeUserName'], result => applyName(result.homeUserName || 'Moshclusive'));

    homeUserName.removeAttribute('contenteditable');

    homeUserName.title = 'Edit display name in Settings';

    saveNameButton?.addEventListener('click', () => {

      const cleaned = String(nameInput?.value || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, 48);

      if (!cleaned) { nameInput?.focus(); return; }

      chrome.storage.local.set({ homeUserName: cleaned }, () => {

        applyName(cleaned);

        if (typeof showNotification === 'function') showNotification('Display name updated.', 'success');

      });

    });

    nameInput?.addEventListener('keydown', event => {

      if (event.key === 'Enter') { event.preventDefault(); saveNameButton?.click(); }

    });

  }



  function initializeBooklyBookmarkBarSettings() {

    const choices = document.getElementById('booklyBookmarkBarFolderChoices');

    const saveButton = document.getElementById('saveBooklyBookmarkBarBtn');

    const clearButton = document.getElementById('clearBooklyBookmarkBarBtn');

    const status = document.getElementById('booklyBookmarkBarStatus');

    // Selected folders are published directly on the native Chrome Bookmarks Bar.

    if (!choices || !saveButton) return;



    const setStatus = message => { if (status) status.textContent = message; };

    const renderChoices = () => chrome.storage.local.get(['links', 'folderOrder', 'booklyBookmarkBarFolders'], result => {

      const links = result.links && typeof result.links === 'object' ? result.links : {};

      const order = Array.isArray(result.folderOrder) ? result.folderOrder : [];

      const folders = [...new Set([...order.filter(name => Object.prototype.hasOwnProperty.call(links, name)), ...Object.keys(links)])];

      const selected = new Set(Array.isArray(result.booklyBookmarkBarFolders) ? result.booklyBookmarkBarFolders : []);

      choices.innerHTML = '';

      if (!folders.length) { choices.innerHTML = '<span class="muted">No saved folders found yet.</span>'; return; }

      folders.forEach(folder => {

        const label = document.createElement('label');

        label.className = 'bookly-bookmark-bar-choice';

        const checkbox = document.createElement('input');

        checkbox.type = 'checkbox'; checkbox.value = folder; checkbox.checked = selected.has(folder);

        const text = document.createElement('span'); text.textContent = folder;

        const count = document.createElement('small'); count.textContent = String(Array.isArray(links[folder]) ? links[folder].length : 0);

        label.append(checkbox, text, count); choices.appendChild(label);

      });

    });



    const updateChromeBar = async selectedFolders => {

      const data = await new Promise(resolve => chrome.storage.local.get(['links', 'booklyBookmarkBarFolderIds'], resolve));

      const links = data.links && typeof data.links === 'object' ? data.links : {};

      const previousIds = Array.isArray(data.booklyBookmarkBarFolderIds) ? data.booklyBookmarkBarFolderIds : [];

      for (const id of previousIds) {

        await new Promise(resolve => chrome.bookmarks.removeTree(String(id), () => resolve()));

      }

      const barId = await getBookmarksBarId();

      if (!selectedFolders.length) {

        await new Promise(resolve => chrome.storage.local.set({ booklyBookmarkBarFolderIds: [] }, resolve));

        setStatus('Selected Bookly folders removed from Chrome Bookmarks Bar.');

        return;

      }

      const newIds = [];

      for (const folder of selectedFolders) {

        const items = Array.isArray(links[folder]) ? links[folder] : [];

        const targetFolder = await new Promise((resolve, reject) => chrome.bookmarks.create({ parentId: barId, title: folder }, node => {

          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message)); else resolve(node);

        }));

        newIds.push(targetFolder.id);

        for (const item of items) {

          const url = String(item?.link || item?.url || '').trim();

          if (!/^https?:\/\//i.test(url)) continue;

          await new Promise(resolve => chrome.bookmarks.create({ parentId: targetFolder.id, title: String(item.title || url).slice(0, 255), url }, () => resolve()));

        }

      }

      await new Promise(resolve => chrome.storage.local.set({ booklyBookmarkBarFolderIds: newIds }, resolve));

      setStatus(`Added ${selectedFolders.length} selected folder(s) directly to Chrome Bookmarks Bar.`);

    };



    saveButton.addEventListener('click', async () => {

      const selected = [...choices.querySelectorAll('input[type="checkbox"]:checked')].map(input => input.value);

      saveButton.disabled = true; setStatus('Updating Chrome Bookmarks Bar…');

      try {

        await new Promise(resolve => chrome.storage.local.set({ booklyBookmarkBarFolders: selected }, resolve));

        await updateChromeBar(selected);

      } catch (error) { setStatus(`Could not update Bookmarks Bar: ${error.message || 'Unknown error'}`); }

      finally { saveButton.disabled = false; renderChoices(); }

    });

    clearButton?.addEventListener('click', async () => {

      try {

        await new Promise(resolve => chrome.storage.local.set({ booklyBookmarkBarFolders: [] }, resolve));

        await updateChromeBar([]); renderChoices();

      } catch (error) { setStatus(`Could not remove Bookly folder: ${error.message || 'Unknown error'}`); }

    });

    renderChoices();

    chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local' && (changes.links || changes.folderOrder)) renderChoices(); });

  }



  function openFavoriteBookmarksPopup() {

    if (!favoriteBookmarksOverlay) return;

    favoriteBookmarksOverlay.classList.remove('hidden');

    if (favoriteBookmarksSearch) favoriteBookmarksSearch.value = '';

    renderFavoriteBookmarks();

    favoriteBookmarksSearch?.focus();

  }



  function closeFavoriteBookmarksPopup() {

    favoriteBookmarksOverlay?.classList.add('hidden');

  }



  function renderFavoriteBookmarks() {

    if (!favoriteBookmarkAppsGrid) return;

    const query = (favoriteBookmarksSearch?.value || '').trim().toLowerCase();

    chrome.storage.local.get(['links', 'folderOrder'], (result) => {

      const links = result.links && typeof result.links === 'object' ? result.links : {};

      const order = Array.isArray(result.folderOrder) ? result.folderOrder : [];

      const folders = [...new Set([...order.filter(folder => Array.isArray(links[folder])), ...Object.keys(links)])];

      const entries = [];

      folders.forEach(folder => {

        (Array.isArray(links[folder]) ? links[folder] : []).forEach((bookmark, index) => {

          if (!bookmark?.link || !(bookmark.favorite || bookmark.pinned)) return;

          const title = bookmark.title || extractTitle(bookmark.link);

          const searchText = `${title} ${bookmark.link} ${folder} ${(bookmark.tags || []).join(' ')}`.toLowerCase();

          if (query && !searchText.includes(query)) return;

          entries.push({ folder, index, bookmark, title });

        });

      });

      if (favoriteBookmarksCount) favoriteBookmarksCount.textContent = `${entries.length} ${entries.length === 1 ? 'app' : 'apps'}`;

      favoriteBookmarkAppsGrid.innerHTML = '';

      if (!entries.length) {

        const empty = document.createElement('div');

        empty.className = 'favorite-bookmark-empty';

        empty.textContent = query ? 'No pinned or favorite bookmarks match this search.' : 'No favorites yet. Mark a bookmark as Favorite or Pin to show it here.';

        favoriteBookmarkAppsGrid.appendChild(empty);

        return;

      }

      entries.forEach(({ folder, index, bookmark, title }) => {

        const card = document.createElement('article');

        card.className = 'favorite-app-card';

        const open = document.createElement('a');

        open.className = 'favorite-app-open'; open.href = bookmark.link; open.title = bookmark.link;

        open.addEventListener('click', (event) => { if (event.ctrlKey || event.metaKey || event.shiftKey || event.button === 1) { event.preventDefault(); chrome.tabs.create({ url: bookmark.link, active: !event.shiftKey }); } else { event.preventDefault(); openLink(bookmark.link, false); } });

        open.addEventListener('click', (event) => {

          if (event.ctrlKey || event.metaKey || event.shiftKey || event.button === 1) return;

          event.preventDefault(); openLink(bookmark.link, false);

        });

        const iconWrap = document.createElement('span'); iconWrap.className = 'favorite-app-icon';

        const img = document.createElement('img'); img.alt = ''; img.loading = 'lazy'; img.src = getFaviconUrl(bookmark.link, bookmark.customFavicon || '') || safeFaviconUrl(bookmark.link);

        img.onerror = () => { img.onerror = null; img.src = safeFaviconUrl(bookmark.link); };

        iconWrap.appendChild(img);

        const label = document.createElement('span'); label.className = 'favorite-app-name'; label.textContent = title; label.title = title;

        const domain = document.createElement('span'); domain.className = 'favorite-app-domain';

        try { domain.textContent = new URL(bookmark.link).hostname.replace(/^www\./, ''); } catch (_) { domain.textContent = folder; }

        open.append(iconWrap, label, domain);

        const marks = document.createElement('span'); marks.className = 'favorite-app-marks';

        if (bookmark.favorite) marks.appendChild(Object.assign(document.createElement('span'), { textContent: '★', title: 'Favorite' }));

        if (bookmark.pinned) marks.appendChild(Object.assign(document.createElement('span'), { textContent: '⌖', title: 'Pinned' }));

        const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'favorite-app-edit'; edit.title = 'Edit bookmark'; edit.setAttribute('aria-label', `Edit ${title}`);

        edit.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"></path></svg>';

        edit.addEventListener('click', (event) => { event.stopPropagation(); event.preventDefault(); currentFolder = folder; closeFavoriteBookmarksPopup(); openModal(bookmark, folder, index); });

        card.append(open, marks, edit);

        favoriteBookmarkAppsGrid.appendChild(card);

      });

    });

  }



  // Any Ctrl/Command/Shift-click on an extension bookmark/app link opens a separate tab.

  document.addEventListener('click', (event) => {

    if (!(event.ctrlKey || event.metaKey || event.shiftKey) || event.button !== 0) return;

    const anchor = event.target.closest('a[href]');

    if (!anchor || anchor.dataset.booklySkipNewTab === 'true') return;

    const url = anchor.href;

    if (!/^https?:\/\//i.test(url)) return;

    event.preventDefault();

    event.stopImmediatePropagation();

    openLink(url, true);

  }, true);

  document.addEventListener('auxclick', (event) => {

    if (event.button !== 1) return;

    const anchor = event.target.closest('a[href]');

    if (!anchor) return;

    const url = anchor.href;

    if (!/^https?:\/\//i.test(url)) return;

    event.preventDefault();

    event.stopImmediatePropagation();

    openLink(url, true);

  }, true);



  // =========================================================

  // GLASS HOME WIDGETS: NEWS HEADLINES

  // Uses Google News RSS; no API key required.

  // =========================================================

  const homeWidgetState = { newsTimer: null, activeFeed: 'trending' };



  function setHomeWidgetText(id, text) {

    const node = document.getElementById(id);

    if (node) node.textContent = text;

  }



  async function homeWidgetFetch(url, timeoutMs = 10000) {

    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {

      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });

      if (!response.ok) throw new Error(`Request failed (${response.status})`);

      return response;

    } finally {

      window.clearTimeout(timeoutId);

    }

  }



  const CREATIVE_RESOURCE_ITEMS = {

    inspiration: [

      { title: 'Behance · Featured Projects', source: 'Case studies, visual systems and portfolios', link: 'https://www.behance.net/' },

      { title: 'Dribbble · Design Inspiration', source: 'Fresh interface, illustration and branding shots', link: 'https://dribbble.com/' },

      { title: 'Awwwards · Websites', source: 'High-quality web and interaction design', link: 'https://www.awwwards.com/' },

      { title: 'Creative Bloq', source: 'Design industry, tutorials and visual trends', link: 'https://www.creativebloq.com/' },

      { title: 'Adobe Stock · Discover', source: 'Commercial visual content and creative ideas', link: 'https://stock.adobe.com/discover' },

      { title: 'Pinterest · Visual Research', source: 'Build references and moodboards', link: 'https://www.pinterest.com/' }

    ],

    tools: [

      { title: 'Adobe Firefly', source: 'Generative tools for creative workflows', link: 'https://firefly.adobe.com/' },

      { title: 'Adobe Creative Cloud Blog', source: 'Official creative software updates and workflows', link: 'https://blog.adobe.com/en/topics/creative-cloud' },

      { title: 'Freepik AI', source: 'AI-assisted image and design tools', link: 'https://www.freepik.com/ai' },

      { title: 'Figma Community', source: 'Explore reusable design resources and files', link: 'https://www.figma.com/community' },

      { title: 'Dribbble', source: 'Explore current design patterns', link: 'https://dribbble.com/' }

    ]

  };



  function renderHomeNews(items, feed = homeWidgetState.activeFeed) {

    const list = document.getElementById('homeNewsList');

    if (!list) return;

    list.innerHTML = '';

    if (!Array.isArray(items) || !items.length) {

      const empty = document.createElement('p');

      empty.className = 'home-widget-loading';

      empty.textContent = 'News is temporarily unavailable.';

      list.appendChild(empty);

      return;

    }

    const createItem = (item, index) => {

      const link = document.createElement('a');

      link.className = 'home-news-item';

      link.href = item.link;

      link.target = '_blank';

      link.rel = 'noopener noreferrer';

      const indexLabel = document.createElement('span');

      indexLabel.className = 'home-news-index';

      indexLabel.textContent = String(index + 1).padStart(2, '0');

      const copy = document.createElement('span');

      copy.className = 'home-news-copy';

      const title = document.createElement('span');

      title.className = 'home-news-headline';

      title.textContent = item.title || 'Open story';

      const source = document.createElement('span');

      source.className = 'home-news-source';

      source.textContent = item.source || 'News';

      copy.append(title, source);

      const arrow = document.createElement('span');

      arrow.className = 'home-news-arrow';

      arrow.setAttribute('aria-hidden', 'true');

      arrow.textContent = '↗';

      link.append(indexLabel, copy, arrow);

      return link;

    };

    items.slice(0, 10).forEach((item, index) => list.appendChild(createItem(item, index)));

  }



  async function loadHomeNews() {

    const list = document.getElementById('homeNewsList');

    if (!list) return;

    const refresh = document.getElementById('refreshHomeNewsBtn');

    refresh?.classList.add('is-loading');

    list.innerHTML = '<p class="home-widget-loading">Loading today’s top stories…</p>';

    try {

      const params = new URLSearchParams({ hl: 'en-US', gl: 'US', ceid: 'US:en' });

      const response = await homeWidgetFetch(`https://news.google.com/rss?${params.toString()}`, 14000);

      const xml = new DOMParser().parseFromString(await response.text(), 'application/xml');

      if (xml.querySelector('parsererror')) throw new Error('Invalid news feed');

      const items = [...xml.querySelectorAll('item')].slice(0, 10).map(item => {

        const rawTitle = item.querySelector('title')?.textContent?.trim() || '';

        const link = item.querySelector('link')?.textContent?.trim() || '';

        const source = item.querySelector('source')?.textContent?.trim() || 'News';

        return { title: rawTitle.replace(/\s+-\s+[^-]+$/, '').trim() || rawTitle, link, source };

      }).filter(item => item.title && /^https:\/\//i.test(item.link));

      if (!items.length) throw new Error('No stories');

      renderHomeNews(items, 'trending');

    } catch (_) {

      renderHomeNews([], 'trending');

      const empty = list.querySelector('.home-widget-loading');

      if (empty) empty.textContent = 'News is temporarily unavailable.';

    } finally { refresh?.classList.remove('is-loading'); }

  }



  function initializeHomeWidgets() {

    loadHomeNews('trending');

    document.getElementById('refreshHomeNewsBtn')?.addEventListener('click', () => loadHomeNews());

    document.getElementById('homeCreativeTabs')?.addEventListener('click', event => {

      const button = event.target.closest('[data-feed]');

      if (!button) return;

      loadHomeNews(button.dataset.feed);

    });

    homeWidgetState.newsTimer = window.setInterval(() => {

      loadHomeNews('trending');

    }, 15 * 60 * 1000);

  }



  function initializeHomeWidgetReordering() {

    const groups = [

      { key: 'hero', parent: document.getElementById('homeWidgetStack'), selector: ':scope > .glass-card' },

      { key: 'productivity', parent: document.querySelector('.productivity-grid'), selector: ':scope > .productivity-card' }

    ];

    const orderState = {};

    const getCards = group => group.parent ? [...group.parent.querySelectorAll(group.selector)] : [];

    groups.forEach(group => {

      if (!group.parent) return;

      let dragged = null;

      const cards = getCards(group);

      cards.forEach(card => {

        card.dataset.booklyWidget = card.id || [...card.classList].find(name => name !== 'productivity-card') || card.classList[0];

        const header = card.querySelector('.home-widget-card-header, .productivity-card-top');

        if (header && !header.querySelector('.widget-drag-handle')) {

          const handle = document.createElement('button');

          handle.type = 'button'; handle.className = 'widget-drag-handle'; handle.draggable = true;

          handle.title = 'Drag to rearrange widget'; handle.setAttribute('aria-label', `Move ${card.getAttribute('aria-label') || card.querySelector('h2,h3')?.textContent || 'widget'}`);

          handle.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><circle cx="8" cy="5" r="1.5"/><circle cx="16" cy="5" r="1.5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/><circle cx="8" cy="19" r="1.5"/><circle cx="16" cy="19" r="1.5"/></svg>';

          header.appendChild(handle);

          handle.addEventListener('dragstart', event => {

            dragged = card; card.classList.add('widget-dragging');

            event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', card.dataset.booklyWidget);

          });

          handle.addEventListener('dragend', () => { card.classList.remove('widget-dragging'); dragged = null; group.parent.querySelectorAll('.widget-drop-target').forEach(el => el.classList.remove('widget-drop-target')); });

        }

        card.addEventListener('dragover', event => {

          if (!dragged || dragged === card || dragged.parentElement !== card.parentElement) return;

          event.preventDefault(); event.dataTransfer.dropEffect = 'move'; card.classList.add('widget-drop-target');

        });

        card.addEventListener('dragleave', () => card.classList.remove('widget-drop-target'));

        card.addEventListener('drop', event => {

          if (!dragged || dragged === card || dragged.parentElement !== card.parentElement) return;

          event.preventDefault();

          const rect = card.getBoundingClientRect();

          const after = group.key === 'productivity' ? event.clientX > rect.left + rect.width / 2 : event.clientY > rect.top + rect.height / 2;

          group.parent.insertBefore(dragged, after ? card.nextSibling : card);

          group.parent.querySelectorAll('.widget-drop-target').forEach(el => el.classList.remove('widget-drop-target'));

          orderState[group.key] = getCards(group).map(item => item.dataset.booklyWidget);

          chrome.storage.local.get('homeWidgetOrders', result => chrome.storage.local.set({ homeWidgetOrders: { ...(result.homeWidgetOrders || {}), [group.key]: orderState[group.key] } }));

        });

      });

    });

    chrome.storage.local.get(['homeWidgetOrders', 'homeWidgetLayoutMigrated_411'], result => {

      const saved = { ...(result.homeWidgetOrders || {}) };

      const heroGroup = groups.find(group => group.key === 'hero');

      // Previous builds could persist News before Weather. Correct this once on 4.0.11,

      // then leave future user drag-and-drop ordering under the user's control.

      if (!result.homeWidgetLayoutMigrated_411 && heroGroup?.parent) {

        const weather = heroGroup.parent.querySelector('#homeWeatherCard');

        const news = heroGroup.parent.querySelector('#homeNewsCard');

        if (weather && news) {

          heroGroup.parent.append(weather, news);

          saved.hero = getCards(heroGroup).map(card => card.dataset.booklyWidget);

        }

        chrome.storage.local.set({ homeWidgetOrders: saved, homeWidgetLayoutMigrated_411: true });

      }

      groups.forEach(group => {

        if (!group.parent || !Array.isArray(saved[group.key])) return;

        const byId = new Map(getCards(group).map(card => [card.dataset.booklyWidget, card]));

        saved[group.key].forEach(id => { const card = byId.get(id); if (card) group.parent.appendChild(card); });

      });

    });

  }



  function initializeAtmosphereSettings() {

    const grid = document.getElementById('ambientEffectGrid');

    const validEffects = new Set(['none', 'smoke', 'clouds', 'rain']);

    const apply = (effect, persist = false) => {

      const normalized = validEffects.has(effect) ? effect : 'none';

      document.body.dataset.atmosphere = normalized;

      grid?.querySelectorAll('[data-atmosphere-effect]').forEach(button => {

        const active = button.dataset.atmosphereEffect === normalized;

        button.classList.toggle('active', active);

        button.setAttribute('aria-pressed', String(active));

      });

      if (persist) chrome.storage.local.set({ ambientEffect: normalized });

    };

    grid?.addEventListener('click', event => {

      const button = event.target.closest('[data-atmosphere-effect]');

      if (!button) return;

      apply(button.dataset.atmosphereEffect, true);

    });

    chrome.storage.local.get(['ambientEffect'], result => apply(result.ambientEffect || 'none'));

  }



    
    function initializeBookmarkQuickShelf() {
      const shelfAllBtn = document.getElementById('shelfAllBookmarksBtn');
      const shelfAddBtn = document.getElementById('shelfAddBookmarkBtn');
      const shelfFilterBtn = document.getElementById('shelfFilterBookmarksBtn');
      const boolBar = document.getElementById('booleanQuickBar');
      const boolInput = document.getElementById('booleanSearchInput');

      if (shelfAllBtn) {
        shelfAllBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (typeof openSavedBookmarksPopup === 'function') openSavedBookmarksPopup();
          else document.getElementById('savedBookmarksBtn')?.click();
        });
      }

      if (shelfAddBtn) {
        shelfAddBtn.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('addLinkBtn')?.click();
        });
      }

      if (shelfFilterBtn) {
        shelfFilterBtn.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('bookmarkSearchToggle')?.click();
        });
      }

      if (boolBar && boolInput) {
        boolBar.addEventListener('click', (e) => {
          const chip = e.target.closest('.bool-chip');
          if (!chip) return;
          const token = chip.dataset.token;
          if (!token) return;
          const spacer = boolInput.value && !/\s$/.test(boolInput.value) ? ' ' : '';
          boolInput.value = `${boolInput.value}${spacer}${token === '"phrase"' ? '""' : token}`;
          boolInput.focus();
          if (token === '"phrase"') {
            const p = boolInput.value.length - 1;
            boolInput.setSelectionRange(p, p);
          } else {
            boolInput.setSelectionRange(boolInput.value.length, boolInput.value.length);
          }
          if (typeof showBooleanSuggestions === 'function') {
            showBooleanSuggestions(boolInput.value.trim());
          }
        });
      }
    }

  
  function initializeShutdownTimer() {
    const triggerBtn = document.getElementById('shutdownTimerBtn');
    const overlay = document.getElementById('shutdownTimerOverlay');
    const closeBtn = document.getElementById('closeShutdownTimerBtn');
    const minutesInput = document.getElementById('shutdownMinutesInput');
    const scheduleBtn = document.getElementById('scheduleShutdownBtn');
    const cancelBtn = document.getElementById('cancelShutdownBtn');
    const statusText = document.getElementById('shutdownTimerStatus');
    const presetsContainer = document.getElementById('shutdownPresets');
    const setupNote = document.getElementById('shutdownHelperSetupNote');

    if (!triggerBtn || !overlay) return;

    const NATIVE_HOST = 'com.booklypro.shutdown';

    function setStatus(msg, isError = false) {
      if (!statusText) return;
      statusText.textContent = msg;
      statusText.style.color = isError ? '#f87171' : '#38bdf8';
    }

    function openModal() {
      overlay.classList.remove('hidden');
      setStatus('');
      setupNote?.classList.add('hidden');
      minutesInput?.focus();
    }

    function closeModal() {
      overlay.classList.add('hidden');
    }

    triggerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });

    closeBtn?.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-close-shutdown-timer') || e.target === overlay) {
        closeModal();
      }
    });

    // Preset buttons
    if (presetsContainer) {
      presetsContainer.querySelectorAll('button[data-minutes]').forEach(btn => {
        btn.addEventListener('click', () => {
          presetsContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const mins = parseInt(btn.dataset.minutes, 10);
          if (minutesInput && !isNaN(mins)) {
            minutesInput.value = mins;
          }
        });
      });
    }

    // Schedule Shutdown
    scheduleBtn?.addEventListener('click', () => {
      const minutes = parseInt(minutesInput?.value, 10);
      if (isNaN(minutes) || minutes < 1 || minutes > 1440) {
        setStatus('Please enter between 1 and 1440 minutes (24h).', true);
        return;
      }

      setStatus(`Sending schedule command to Windows for ${minutes} min...`);
      scheduleBtn.disabled = true;

      try {
        chrome.runtime.sendNativeMessage(
          NATIVE_HOST,
          { action: 'schedule', seconds: minutes * 60 },
          (response) => {
            scheduleBtn.disabled = false;
            if (chrome.runtime.lastError) {
              const err = chrome.runtime.lastError.message || 'Could not communicate with Windows Shutdown Host.';
              setStatus(`Native error: ${err}`, true);
              setupNote?.classList.remove('hidden');
              return;
            }

            if (response && response.success) {
              setStatus(`Windows shutdown scheduled in ${minutes} minute(s). Save your work!`, false);
              triggerBtn.classList.add('timer-scheduled');
            } else {
              setStatus(response?.message || 'Windows rejected shutdown command.', true);
            }
          }
        );
      } catch (err) {
        scheduleBtn.disabled = false;
        setStatus(`Exception: ${err.message}`, true);
        setupNote?.classList.remove('hidden');
      }
    });

    // Cancel Shutdown
    cancelBtn?.addEventListener('click', () => {
      setStatus('Sending cancellation command to Windows...');
      cancelBtn.disabled = true;

      try {
        chrome.runtime.sendNativeMessage(
          NATIVE_HOST,
          { action: 'cancel' },
          (response) => {
            cancelBtn.disabled = false;
            if (chrome.runtime.lastError) {
              const err = chrome.runtime.lastError.message || 'Could not communicate with Windows Shutdown Host.';
              setStatus(`Native error: ${err}`, true);
              return;
            }

            if (response && response.success) {
              setStatus('Scheduled Windows shutdown was cancelled successfully.', false);
              triggerBtn.classList.remove('timer-scheduled');
            } else {
              setStatus(response?.message || 'Cancellation finished.', false);
              triggerBtn.classList.remove('timer-scheduled');
            }
          }
        );
      } catch (err) {
        cancelBtn.disabled = false;
        setStatus(`Exception: ${err.message}`, true);
      }
    });
  }



  // =========================================================
  // DAILY FOCUS & TODAY'S 3-5 TASKS WITH DONE SYSTEM & NOTES
  // =========================================================
  function initializeDailyFocus() {
    const triggerBtn = document.getElementById('dailyFocusBtn');
    const badgeEl = document.getElementById('dailyFocusBadge');
    const overlay = document.getElementById('dailyFocusOverlay');
    const closeBtn = document.getElementById('closeDailyFocusBtn');
    const pinBtn = document.getElementById('dailyPinWidgetBtn');
    
    // Modal controls
    const taskInput = document.getElementById('dailyTaskInput');
    const addTaskBtn = document.getElementById('dailyAddTaskBtn');
    const taskList = document.getElementById('dailyTaskList');
    const emptyState = document.getElementById('dailyFocusEmpty');
    const statusText = document.getElementById('dailyFocusStatusText');
    const zoneTag = document.getElementById('dailyFocusZoneTag');
    const progressFill = document.getElementById('dailyFocusProgressFill');
    const clearDoneBtn = document.getElementById('dailyClearDoneBtn');
    const resetDayBtn = document.getElementById('dailyResetDayBtn');

    // Notes controls
    const notesTextarea = document.getElementById('dailyNotesText');
    const notesIndicator = document.getElementById('dailyNotesSaveIndicator');

    // Pinned card controls
    const pinnedCard = document.getElementById('dailyPinnedCard');
    const pinnedCount = document.getElementById('dailyPinnedCount');
    const pinnedProgressFill = document.getElementById('dailyPinnedProgressFill');
    const pinnedList = document.getElementById('dailyPinnedList');
    const pinnedInput = document.getElementById('dailyPinnedInput');
    const pinnedExpandBtn = document.getElementById('dailyPinnedExpandBtn');
    const pinnedCloseBtn = document.getElementById('dailyPinnedCloseBtn');

    if (!triggerBtn || !overlay) return;

    let tasks = [];
    let isPinned = false;
    let notesTimeout = null;

    // Default sample tasks on fresh start
    const DEFAULT_SAMPLE_TASKS = [];

    const openModal = () => {
      overlay.classList.remove('hidden');
      setTimeout(() => taskInput?.focus(), 80);
    };

    const closeModal = () => {
      overlay.classList.add('hidden');
    };

    window.closeDailyFocusModal = closeModal;

    const renderUI = () => {
      const total = tasks.length;
      const doneCount = tasks.filter(t => t.done).length;
      const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

      // Trigger Badge
      if (badgeEl) {
        if (total === 0) {
          badgeEl.classList.add('hidden');
        } else {
          badgeEl.classList.remove('hidden');
          badgeEl.textContent = `${doneCount}/${total}`;
          badgeEl.classList.toggle('all-done', doneCount === total && total > 0);
        }
      }

      // Progress & Zone
      if (statusText) statusText.textContent = total === 0 ? '0 completed' : `${doneCount} of ${total} completed (${pct}%)`;
      if (progressFill) progressFill.style.width = `${pct}%`;
      if (zoneTag) {
        if (total >= 3 && total <= 5) {
          zoneTag.textContent = `Optimal Focus (3–5 Goals)`;
          zoneTag.style.color = '#38bdf8';
        } else if (total < 3) {
          zoneTag.textContent = `${total}/3 Minimum Focus`;
          zoneTag.style.color = '#f59e0b';
        } else {
          zoneTag.textContent = `${total} Tasks`;
          zoneTag.style.color = '#38bdf8';
        }
      }

      // Empty state
      if (emptyState) emptyState.classList.toggle('hidden', total > 0);

      // Modal List Render
      if (taskList) {
        taskList.innerHTML = '';
        tasks.forEach(task => {
          const li = document.createElement('li');
          li.className = `daily-task-item${task.done ? ' is-done' : ''}`;
          li.setAttribute('data-id', task.id);

          const checkBtn = document.createElement('button');
          checkBtn.type = 'button';
          checkBtn.className = 'daily-task-checkbox';
          checkBtn.title = task.done ? 'Mark as not done' : 'Mark as done';
          checkBtn.innerHTML = '<svg fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg>';
          checkBtn.onclick = () => toggleTask(task.id);

          const span = document.createElement('span');
          span.className = 'daily-task-text';
          span.textContent = task.text;

          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'daily-task-delete';
          delBtn.title = 'Delete task';
          delBtn.innerHTML = '<svg fill="none" height="13" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="13"><path d="M18 6L6 18M6 6l12 12"></path></svg>';
          delBtn.onclick = () => deleteTask(task.id);

          li.append(checkBtn, span, delBtn);
          taskList.appendChild(li);
        });
      }

      // Pinned Card Render
      if (pinnedCard) {
        pinnedCard.classList.toggle('hidden', !isPinned);
        if (pinBtn) pinBtn.classList.toggle('is-pinned', isPinned);
        if (pinnedCount) pinnedCount.textContent = `${doneCount}/${total}`;
        if (pinnedProgressFill) pinnedProgressFill.style.width = `${pct}%`;

        if (pinnedList) {
          pinnedList.innerHTML = '';
          tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `daily-task-item${task.done ? ' is-done' : ''}`;

            const checkBtn = document.createElement('button');
            checkBtn.type = 'button';
            checkBtn.className = 'daily-task-checkbox';
            checkBtn.innerHTML = '<svg fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg>';
            checkBtn.onclick = () => toggleTask(task.id);

            const span = document.createElement('span');
            span.className = 'daily-task-text';
            span.textContent = task.text;

            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'daily-task-delete';
            delBtn.innerHTML = '<svg fill="none" height="12" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="12"><path d="M18 6L6 18M6 6l12 12"></path></svg>';
            delBtn.onclick = () => deleteTask(task.id);

            li.append(checkBtn, span, delBtn);
            pinnedList.appendChild(li);
          });
        }
      }
    };

    const persistTasks = () => {
      chrome.storage.local.set({ dailyTasks: tasks }, () => {
        renderUI();
      });
    };

    const addTask = (text) => {
      const trimmed = String(text || '').trim();
      if (!trimmed) return;
      tasks.push({
        id: Date.now().toString() + '_' + Math.random().toString(36).slice(2, 6),
        text: trimmed,
        done: false,
        created: Date.now()
      });
      persistTasks();
      if (taskInput) taskInput.value = '';
      if (pinnedInput) pinnedInput.value = '';
    };

    const toggleTask = (id) => {
      const item = tasks.find(t => t.id === id);
      if (item) {
        item.done = !item.done;
        persistTasks();
      }
    };

    const deleteTask = (id) => {
      tasks = tasks.filter(t => t.id !== id);
      persistTasks();
    };

    const clearCompleted = () => {
      const beforeCount = tasks.length;
      tasks = tasks.filter(t => !t.done);
      if (tasks.length !== beforeCount) {
        persistTasks();
        showNotification('Completed tasks cleared.');
      }
    };

    const resetDay = () => {
      if (!tasks.length) return;
      if (confirm('Reset and remove all tasks for today?')) {
        tasks = [];
        persistTasks();
        showNotification('All daily tasks reset.');
      }
    };

    const togglePin = () => {
      isPinned = !isPinned;
      chrome.storage.local.set({ dailyTasksPinned: isPinned }, () => {
        renderUI();
        showNotification(isPinned ? 'Daily Focus pinned to dashboard.' : 'Daily Focus unpinned.');
      });
    };

    // Load initial storage
    chrome.storage.local.get(['dailyTasks', 'dailyNotes', 'dailyTasksPinned'], (res) => {
      if (Array.isArray(res.dailyTasks)) {
        const isOldSample = res.dailyTasks.length === 3 && 
          res.dailyTasks[0]?.id === 't1' && 
          res.dailyTasks[1]?.id === 't2' && 
          res.dailyTasks[2]?.id === 't3';
        tasks = isOldSample ? [] : res.dailyTasks;
        if (isOldSample) chrome.storage.local.set({ dailyTasks: [] });
      } else {
        tasks = [];
        chrome.storage.local.set({ dailyTasks: [] });
      }

      isPinned = !!res.dailyTasksPinned;

      if (notesTextarea && typeof res.dailyNotes === 'string') {
        notesTextarea.value = res.dailyNotes;
      }

      renderUI();
    });

    // Notes auto-save on input
    notesTextarea?.addEventListener('input', () => {
      if (notesIndicator) {
        notesIndicator.textContent = 'Saving...';
        notesIndicator.style.opacity = '1';
      }
      clearTimeout(notesTimeout);
      notesTimeout = setTimeout(() => {
        chrome.storage.local.set({ dailyNotes: notesTextarea.value }, () => {
          if (notesIndicator) {
            notesIndicator.textContent = 'Auto-saved';
            setTimeout(() => {
              if (notesIndicator) notesIndicator.style.opacity = '0.7';
            }, 1000);
          }
        });
      }, 400);
    });

    // Event Listeners
    triggerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (overlay.classList.contains('hidden')) openModal();
      else closeModal();
    });

    closeBtn?.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target.dataset.closeDailyFocus || e.target === overlay) closeModal();
    });

    pinBtn?.addEventListener('click', togglePin);
    pinnedCloseBtn?.addEventListener('click', togglePin);
    pinnedExpandBtn?.addEventListener('click', openModal);

    addTaskBtn?.addEventListener('click', () => addTask(taskInput?.value));
    taskInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTask(taskInput.value);
      }
    });

    pinnedInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTask(pinnedInput.value);
      }
    });

    clearDoneBtn?.addEventListener('click', clearCompleted);
    resetDayBtn?.addEventListener('click', resetDay);

    // Global shortcut: Alt+T to toggle Daily Focus
    document.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        if (overlay.classList.contains('hidden')) openModal();
        else closeModal();
      }
    });
  }



function initializeHomeDashboard() {
    initializeBookmarkQuickShelf();

    renderHomeDateAndGreeting();

    initializeHomeQuotes();
    initializeDailyFocus();

    setupEditableHomeName();

    initializeBooklyBookmarkBarSettings();

    initializeAtmosphereSettings();

    initializeHomeWidgetReordering();

    initializeHomeWidgets();

    renderHomeQuickLinks();

    renderSavedBookmarks();

    chrome.storage.local.get(['homeDockLinks'], (result) => {

      const normalizeTitle = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

      const normalizeUrl = value => String(value || '').trim().replace(/\/$/, '').toLowerCase();

      const defaults = HOME_STOCK_SHORTCUTS.map(site => ({ title: site.name, link: site.url }));

      const existing = Array.isArray(result.homeDockLinks) ? result.homeDockLinks.map(site => ({ ...site })) : [];

      // Repair known default destinations from prior builds (e.g. Adobe Stock's public landing page)

      // and preserve any custom labels/favicons plus unrelated user-created links.

      existing.forEach(item => {

        const base = defaults.find(site => normalizeTitle(site.title) === normalizeTitle(item.title));

        if (base) item.link = base.link;

      });

      const combined = [...defaults];

      existing.forEach(item => {

        if (!item?.link) return;

        const byDefaultName = defaults.some(site => normalizeTitle(site.title) === normalizeTitle(item.title));

        const urlAlreadyThere = combined.some(site => normalizeUrl(site.link) === normalizeUrl(item.link));

        if (byDefaultName) {

          const baseIndex = combined.findIndex(site => normalizeTitle(site.title) === normalizeTitle(item.title));

          if (baseIndex >= 0) combined[baseIndex] = { ...combined[baseIndex], ...item, link: defaults[baseIndex].link };

        } else if (!urlAlreadyThere) combined.push(item);

      });

      (Array.isArray(quickAccessSites) ? quickAccessSites : []).forEach(site => {

        if (!site?.link) return;

        const normalized = normalizeUrl(site.link);

        if (!combined.some(existingSite => normalizeUrl(existingSite.link) === normalized || normalizeTitle(existingSite.title) === normalizeTitle(site.title))) combined.push({ ...site });

      });

      homeDockLinks = combined.slice(0, 30);

      if (JSON.stringify(result.homeDockLinks || []) !== JSON.stringify(homeDockLinks)) {

        chrome.storage.local.set({ homeDockLinks }, renderHomeQuickLinks);

      }

      renderHomeQuickLinks();

    });

    setInterval(renderHomeDateAndGreeting, 1000);

    if (savedBookmarksBtn) savedBookmarksBtn.addEventListener('click', openSavedBookmarksPopup);

    if (favoriteBookmarksBtn) favoriteBookmarksBtn.addEventListener('click', openFavoriteBookmarksPopup);

    if (closeFavoriteBookmarksBtn) closeFavoriteBookmarksBtn.addEventListener('click', closeFavoriteBookmarksPopup);

    if (favoriteBookmarksSearch) favoriteBookmarksSearch.addEventListener('input', renderFavoriteBookmarks);

    if (closeSavedBookmarksBtn) closeSavedBookmarksBtn.addEventListener('click', closeSavedBookmarksPopup);

    if (savedBookmarksOverlay) savedBookmarksOverlay.addEventListener('click', (e) => {
      if (e.target === savedBookmarksOverlay || e.target.classList.contains('saved-bookmarks-backdrop') || e.target.hasAttribute('data-close-saved-bookmarks')) {
        closeSavedBookmarksPopup();
      }
    });

    if (favoriteBookmarksOverlay) favoriteBookmarksOverlay.addEventListener('click', (e) => {

      if (e.target === favoriteBookmarksOverlay || e.target.closest('[data-close-favorite-bookmarks="true"]')) closeFavoriteBookmarksPopup();

    });

    let searchDebounceTimer = null;
    if (savedBookmarksSearch) savedBookmarksSearch.addEventListener('input', () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => renderSavedBookmarks(), 80);
    });

    if (savedAddFolderBtn) savedAddFolderBtn.addEventListener('click', () => {

      // Open the existing folder form above this popup without navigating to the legacy manager.

      currentFolder = 'All Links';

      addFolderBtn?.click();

    });

    if (savedAddBookmarkBtn) savedAddBookmarkBtn.addEventListener('click', () => {

      // Use an existing folder by default; users can change it in the bookmark form.

      const availableFolders = [...new Set([...savedBookmarksCache.folderOrder.filter(path => Array.isArray(savedBookmarksCache.links[path])), ...Object.keys(savedBookmarksCache.links)])];

      const defaultFolder = availableFolders.includes(selectedSavedFolder) ? selectedSavedFolder : (availableFolders[0] || 'Miscellaneous');

      currentFolder = defaultFolder;

      openModal(null, defaultFolder, -1);

    });

    if (backHomeFromManagerBtn) backHomeFromManagerBtn.addEventListener('click', () => document.body.classList.remove('manager-open'));

    if (dockAddQuickLinkBtn) dockAddQuickLinkBtn.addEventListener('click', () => openAddSiteModal(null, -1, 'dock'));
    const quickLaunchAddBtn = document.getElementById('quickLaunchAddBtn');
    if (quickLaunchAddBtn) quickLaunchAddBtn.addEventListener('click', () => openAddSiteModal(null, -1, 'dock'));

    document.addEventListener('keydown', (e) => {

      if (e.key === 'Escape') {

        closeSavedBookmarksPopup();

        closeFavoriteBookmarksPopup();

        document.body.classList.remove('manager-open');

      }

    });

    chrome.storage.onChanged.addListener((changes, area) => {

      if (area !== 'local') return;

      if (changes.links || changes.folderOrder || changes.folderIcons || changes.favoriteFolders) { renderSavedBookmarks(); renderFavoriteBookmarks(); }

      if (changes.homeDockLinks) { homeDockLinks = Array.isArray(changes.homeDockLinks.newValue) ? changes.homeDockLinks.newValue : []; renderHomeQuickLinks(); }

      if (changes.homeUserName && homeUserName && !homeUserName.isContentEditable) homeUserName.textContent = changes.homeUserName.newValue || 'Moshclusive';

      if (changes.quickAccess) {

        quickAccessSites = Array.isArray(changes.quickAccess.newValue) ? changes.quickAccess.newValue : [];

      }

      if (changes.wpSettings) {

        wpSettings = changes.wpSettings.newValue || { enabled: false, source: '', opacity: 30, blur: 0 };

        applyWallpaper();

      }

    });

  }



  // Google Calendar, Calculator and Sports Radar widgets were removed in 4.0.3.




  // ==============================================================================
  // BOOKLY LIVE WATCH (DIRECTLY ABOVE SEARCHBAR)
  // ==============================================================================
  function initBooklyLiveWatch() {
    const hoursEl = document.getElementById('watchHours');
    const minutesEl = document.getElementById('watchMinutes');
    const secondsEl = document.getElementById('watchSeconds');
    const ampmEl = document.getElementById('watchAmPm');
    const dateEl = document.getElementById('watchDate');
    if (!hoursEl || !minutesEl) return;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    function tick() {
      const now = new Date();
      let rawHours = now.getHours();
      const ampm = rawHours >= 12 ? 'PM' : 'AM';
      let h12 = rawHours % 12;
      if (h12 === 0) h12 = 12;

      const hh = String(h12).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');

      if (hoursEl.textContent !== hh) hoursEl.textContent = hh;
      if (minutesEl.textContent !== mm) minutesEl.textContent = mm;
      if (secondsEl && secondsEl.textContent !== ss) secondsEl.textContent = ss;
      if (ampmEl && ampmEl.textContent !== ampm) ampmEl.textContent = ampm;

      if (dateEl) {
        const dayName = days[now.getDay()];
        const monthName = months[now.getMonth()];
        const dateNum = now.getDate();
        const dateText = `${dayName}, ${monthName} ${dateNum}`;
        if (dateEl.textContent !== dateText) dateEl.textContent = dateText;
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  // ==============================================================================
  // TO DO LIST - DRAGGABLE & REPOSITIONABLE ANYWHERE ON SCREEN
  // ==============================================================================
  function initDraggableTodoWindow() {
    const dialog = document.getElementById('dailyFocusDialog');
    const header = document.getElementById('dailyFocusHeader');
    const overlay = document.getElementById('dailyFocusOverlay');
    const triggerBtn = document.getElementById('dailyFocusBtn');
    if (!dialog || !header) return;

    function applyPosition() {
      try {
        chrome.storage.local.get(['booklyTodoPosition'], (res) => {
          const width = dialog.offsetWidth || 500;
          const height = dialog.offsetHeight || 420;
          const maxL = Math.max(10, window.innerWidth - width - 10);
          const maxT = Math.max(10, window.innerHeight - height - 10);

          if (res && res.booklyTodoPosition) {
            const { left, top } = res.booklyTodoPosition;
            if (typeof left === 'number' && typeof top === 'number') {
              const clL = Math.min(Math.max(10, left), maxL);
              const clT = Math.min(Math.max(10, top), maxT);
              dialog.style.left = clL + 'px';
              dialog.style.top = clT + 'px';
              dialog.style.right = 'auto';
              dialog.style.bottom = 'auto';
              dialog.style.margin = '0';
              dialog.style.transform = 'none';
              return;
            }
          }
          const defL = Math.max(20, Math.round((window.innerWidth - width) / 2));
          const defT = Math.max(30, Math.round((window.innerHeight - height) / 2));
          dialog.style.left = defL + 'px';
          dialog.style.top = defT + 'px';
          dialog.style.right = 'auto';
          dialog.style.bottom = 'auto';
          dialog.style.margin = '0';
          dialog.style.transform = 'none';
        });
      } catch (e) {
        console.error('Error applying todo position:', e);
      }
    }

    applyPosition();
    window.addEventListener('resize', applyPosition);

    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => {
        setTimeout(applyPosition, 20);
      });
    }

    if (overlay) {
      const observer = new MutationObserver(() => {
        if (!overlay.classList.contains('hidden')) {
          applyPosition();
        }
      });
      observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
    }

    let isDragging = false;
    let startX = 0, startY = 0;
    let initLeft = 0, initTop = 0;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return;

      e.preventDefault();
      isDragging = true;
      dialog.classList.add('is-dragging');
      header.style.cursor = 'grabbing';

      const rect = dialog.getBoundingClientRect();
      initLeft = rect.left;
      initTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;

      function onMouseMove(moveEv) {
        if (!isDragging) return;
        const dx = moveEv.clientX - startX;
        const dy = moveEv.clientY - startY;

        let newLeft = initLeft + dx;
        let newTop = initTop + dy;

        const maxL = Math.max(10, window.innerWidth - dialog.offsetWidth - 10);
        const maxT = Math.max(10, window.innerHeight - dialog.offsetHeight - 10);

        newLeft = Math.min(Math.max(10, newLeft), maxL);
        newTop = Math.min(Math.max(10, newTop), maxT);

        dialog.style.left = newLeft + 'px';
        dialog.style.top = newTop + 'px';
        dialog.style.right = 'auto';
        dialog.style.bottom = 'auto';
        dialog.style.margin = '0';
        dialog.style.transform = 'none';
      }

      function onMouseUp() {
        if (!isDragging) return;
        isDragging = false;
        dialog.classList.remove('is-dragging');
        header.style.cursor = 'grab';
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        const curRect = dialog.getBoundingClientRect();
        try {
          chrome.storage.local.set({
            booklyTodoPosition: { left: Math.round(curRect.left), top: Math.round(curRect.top) }
          });
        } catch (err) {}
      }

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  // ==============================================================================
  // GOOGLE SHEETS LIVE INSTANT 2-WAY BACKUP ENGINE
  // ==============================================================================
  function initBooklyCloudSync() {
    const urlInput = document.getElementById('booklyCloudUrlInput');
    const testBtn = document.getElementById('booklyCloudTestBtn');
    const backupBtn = document.getElementById('booklyCloudBackupBtn');
    const restoreBtn = document.getElementById('booklyCloudRestoreBtn');
    const autoSyncToggle = document.getElementById('booklyAutoSyncToggle');
    const statusBox = document.getElementById('booklyCloudStatusBox');
    const openSheetBtn = document.getElementById('booklyOpenSheetBtn');
    const dotEl = document.getElementById('booklyCloudSyncStatusDot');

    if (!urlInput || !backupBtn) return;

    let isRestoring = false;
    let autoSyncTimer = null;

    function setStatus(html, type = '') {
      if (!statusBox) return;
      statusBox.className = 'cloud-status-box' + (type ? ' ' + type : '');
      statusBox.innerHTML = html;
      statusBox.classList.remove('hidden');
    }

    function setDot(state) {
      if (!dotEl) return;
      dotEl.style.display = 'inline-block';
      if (state === 'ok') {
        dotEl.style.background = '#10B981';
        dotEl.title = 'Google Sheet Connected & Active';
      } else if (state === 'err') {
        dotEl.style.background = '#EF4444';
        dotEl.title = 'Google Sheet Connection Issue';
      } else {
        dotEl.style.background = '#64748B';
        dotEl.title = 'Google Sheet Not Configured';
      }
    }

    function countTotalBookmarks(linksObj) {
      if (!linksObj || typeof linksObj !== 'object') return 0;
      let total = 0;
      for (const f in linksObj) {
        if (Array.isArray(linksObj[f])) total += linksObj[f].length;
      }
      return total;
    }

    // Load persisted settings
    chrome.storage.local.get(['booklyCloudUrl', 'booklyAutoSync', 'booklyLastSync', 'links'], (data) => {
      const savedUrl = data.booklyCloudUrl || '';
      urlInput.value = savedUrl;

      const autoSync = data.booklyAutoSync !== false;
      if (autoSyncToggle) autoSyncToggle.checked = autoSync;

      if (savedUrl) {
        if (openSheetBtn) openSheetBtn.href = savedUrl;
        testConnection(savedUrl, false);
      } else {
        setDot('idle');
      }

      // Startup Auto-Restore: if user configured cloud sync before, but local links are empty (e.g. after reinstall/clearing browser data)
      const localCount = countTotalBookmarks(data.links);
      if (savedUrl && localCount === 0) {
        console.log('[Bookly Cloud] Local links empty on startup, restoring from Google Sheet...');
        performRestore(true);
      }
    });

    if (autoSyncToggle) {
      autoSyncToggle.addEventListener('change', () => {
        chrome.storage.local.set({ booklyAutoSync: autoSyncToggle.checked });
        showNotification(autoSyncToggle.checked ? 'Auto-sync enabled' : 'Auto-sync disabled', 'info');
      });
    }

    // Test connection via GET ?action=ping
    async function testConnection(url, notify = true) {
      url = (url || '').trim();
      if (!url) {
        setStatus('Please enter your Google Apps Script Web App URL.', 'err');
        setDot('err');
        if (notify) showNotification('Please enter Web App URL', 'error');
        return false;
      }
      if (!url.startsWith('https://script.google.com/macros/s/')) {
        setStatus('Invalid Web App URL. Must start with <code>https://script.google.com/macros/s/</code>', 'err');
        setDot('err');
        if (notify) showNotification('Invalid Google Apps Script URL format', 'error');
        return false;
      }

      if (notify && testBtn) {
        testBtn.disabled = true;
        testBtn.textContent = 'Testing...';
      }

      try {
        const pingUrl = url + (url.includes('?') ? '&' : '?') + 'action=ping&_t=' + Date.now();
        const resp = await fetch(pingUrl, { method: 'GET', mode: 'cors' });
        const res = await resp.json();

        const isOk = res && (res.status === 'ok' || res.success === true || res.code === 'PONG');
        if (isOk) {
          chrome.storage.local.set({ booklyCloudUrl: url });
          if (openSheetBtn) openSheetBtn.href = url;
          setDot('ok');
          const lastTime = res.lastBackupAt || res.lastUpdated || res.timestamp;
          const lastStr = lastTime ? new Date(lastTime).toLocaleDateString() + ' ' + new Date(lastTime).toLocaleTimeString() : 'Never';
          const totalBm = res.totalBookmarks !== undefined ? res.totalBookmarks : (res.counts ? res.counts.bookmarks : 0);
          const totalFold = res.totalFolders !== undefined ? res.totalFolders : (res.counts ? res.counts.folders : 0);
          setStatus(`<strong>Connected!</strong> Sheet: <em>${res.sheetName || 'Bookly Pro Backup'}</em> &bull; Cloud Bookmarks: <strong>${totalBm}</strong> &bull; Folders: <strong>${totalFold}</strong><br><small style="color:rgba(255,255,255,0.6)">Last Cloud Sync: ${lastStr}</small>`, 'ok');
          if (notify) showNotification('Google Sheet connection successful!', 'success');
          return true;
        } else {
          throw new Error((res && (res.message || res.code)) || 'Unknown response from Google Apps Script');
        }
      } catch (err) {
        console.error('[Bookly Cloud] Test error:', err);
        setDot('err');
        setStatus(`<strong>Connection Error:</strong> ${err.message || 'Could not reach Web App. Verify "Anyone" access and new deployment version.'}`, 'err');
        if (notify) showNotification('Connection failed: ' + err.message, 'error');
        return false;
      } finally {
        if (notify && testBtn) {
          testBtn.disabled = false;
          testBtn.textContent = 'Connect & Test';
        }
      }
    }

    if (testBtn) {
      testBtn.addEventListener('click', () => {
        testConnection(urlInput.value.trim(), true);
      });
    }

    // Cloud Backup
    async function performBackup(silent = false) {
      const url = urlInput.value.trim();
      if (!url) {
        if (!silent) {
          setStatus('Cannot backup: Google Apps Script Web App URL is missing.', 'err');
          showNotification('Please configure Web App URL first', 'error');
        }
        return false;
      }

      return new Promise((resolve) => {
        chrome.storage.local.get([
          'links', 'folderOrder', 'pinnedFolders', 'favoriteFolders',
          'folderIcons', 'quickAccess', 'dailyFocusTasks', 'dailyNotes',
          'theme', 'showFavoritesOnly', 'customLinkOrder', 'allLinksCustomOrder'
        ], async (localData) => {
          const links = localData.links || {};
          const totalBookmarks = countTotalBookmarks(links);

          // Zero-data safety guard for silent background auto-sync:
          // Never silently overwrite cloud if local currently has 0 bookmarks
          if (totalBookmarks === 0 && silent) {
            return resolve(false);
          }

          if (!silent && backupBtn) {
            backupBtn.disabled = true;
            backupBtn.innerHTML = `<span>Backing up...</span>`;
          }

          try {
            const payload = {
              action: 'backup',
              links: links,
              folderOrder: localData.folderOrder || [],
              pinnedFolders: localData.pinnedFolders || [],
              favoriteFolders: localData.favoriteFolders || {},
              folderIcons: localData.folderIcons || {},
              quickAccess: localData.quickAccess || [],
              dailyFocusTasks: localData.dailyFocusTasks || [],
              dailyNotes: localData.dailyNotes || '',
              theme: localData.theme || 'dark-default',
              showFavoritesOnly: localData.showFavoritesOnly || false,
              customLinkOrder: localData.customLinkOrder || {},
              allLinksCustomOrder: localData.allLinksCustomOrder || []
            };

            const resp = await fetch(url, {
              method: 'POST',
              mode: 'cors',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify(payload)
            });

            const res = await resp.json();
            const isOk = res && (res.status === 'ok' || res.success === true || res.code === 'BACKUP_SUCCESS');
            if (isOk) {
              const nowIso = new Date().toISOString();
              chrome.storage.local.set({ booklyLastSync: nowIso });
              setDot('ok');
              const timeStr = new Date().toLocaleTimeString();
              const savedBm = res.totalBookmarks !== undefined ? res.totalBookmarks : ((res.counts && res.counts.bookmarks !== undefined) ? res.counts.bookmarks : totalBookmarks);
              const savedFold = res.totalFolders !== undefined ? res.totalFolders : ((res.counts && res.counts.folders !== undefined) ? res.counts.folders : 0);
              setStatus(`<strong>Backup Complete!</strong> Saved <strong>${savedBm}</strong> bookmarks across <strong>${savedFold}</strong> folders.<br><small style="color:rgba(255,255,255,0.6)">Synced at ${timeStr}</small>`, 'ok');
              if (!silent) showNotification(`Cloud backup complete! (${savedBm} bookmarks)`, 'success');
              resolve(true);
            } else {
              throw new Error((res && (res.message || res.code)) || 'Backup failed');
            }
          } catch (err) {
            console.error('[Bookly Cloud] Backup error:', err);
            setDot('err');
            if (!silent) {
              setStatus(`<strong>Backup Error:</strong> ${err.message}`, 'err');
              showNotification('Backup failed: ' + err.message, 'error');
            }
            resolve(false);
          } finally {
            if (!silent && backupBtn) {
              backupBtn.disabled = false;
              backupBtn.innerHTML = `<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16"><path d="M12 17V3m0 0 4 4m-4-4-4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg><span>Backup to Google Sheet</span>`;
            }
          }
        });
      });
    }

    if (backupBtn) {
      backupBtn.addEventListener('click', () => performBackup(false));
    }

    // Cloud Restore via GET ?action=restore
    async function performRestore(silent = false) {
      const url = urlInput.value.trim();
      if (!url) {
        if (!silent) {
          setStatus('Cannot restore: Google Apps Script Web App URL is missing.', 'err');
          showNotification('Please configure Web App URL first', 'error');
        }
        return false;
      }

      if (!silent && restoreBtn) {
        restoreBtn.disabled = true;
        restoreBtn.innerHTML = `<span>Restoring...</span>`;
      }

      isRestoring = true;

      try {
        const restoreUrl = url + (url.includes('?') ? '&' : '?') + 'action=restore&_t=' + Date.now();
        const resp = await fetch(restoreUrl, { method: 'GET', mode: 'cors' });
        const res = await resp.json();

        const isOk = res && (res.status === 'ok' || res.success === true || res.code === 'RESTORE_SUCCESS');
        const d = res && (res.data || res.backup || (res.links ? res : null));

        if (isOk && d) {
          const importData = {};
          if (d.links) importData.links = d.links;
          if (d.quickAccess) importData.quickAccess = d.quickAccess;
          if (d.pinnedFolders) importData.pinnedFolders = d.pinnedFolders;
          if (d.favoriteFolders) importData.favoriteFolders = d.favoriteFolders;
          if (d.folderIcons) importData.folderIcons = d.folderIcons;
          if (d.folderOrder) importData.folderOrder = d.folderOrder;
          if (d.theme) importData.theme = d.theme;
          if (d.showFavoritesOnly !== undefined) importData.showFavoritesOnly = d.showFavoritesOnly;
          if (d.customLinkOrder) importData.customLinkOrder = d.customLinkOrder;
          if (d.allLinksCustomOrder) importData.allLinksCustomOrder = d.allLinksCustomOrder;
          if (d.dailyFocusTasks) importData.dailyFocusTasks = d.dailyFocusTasks;
          if (d.dailyNotes) importData.dailyNotes = d.dailyNotes;

          await new Promise((done) => chrome.storage.local.set(importData, done));

          if (d.quickAccess) quickAccessSites = d.quickAccess;
          if (d.pinnedFolders) pinnedFolders = d.pinnedFolders;
          if (d.favoriteFolders) favoriteFolders = d.favoriteFolders;
          if (d.folderIcons) folderIcons = d.folderIcons;
          if (d.theme && typeof applyTheme === 'function') applyTheme(d.theme);

          if (typeof renderFolders === 'function') renderFolders();
          if (typeof renderQuickAccess === 'function') renderQuickAccess();
          if (typeof displayLinksForCurrentFolder === 'function') displayLinksForCurrentFolder();
          if (typeof renderRecentlyAdded === 'function') renderRecentlyAdded();
          if (typeof renderMostUsed === 'function') renderMostUsed();
          if (typeof renderHomeQuickLinks === 'function') renderHomeQuickLinks();
          if (typeof renderSavedBookmarks === 'function') renderSavedBookmarks();
          if (typeof renderFavoriteBookmarks === 'function') renderFavoriteBookmarks();

          const totalRestored = countTotalBookmarks(d.links);
          setDot('ok');
          const timeStr = new Date().toLocaleTimeString();
          const folderCount = d.folderOrder ? d.folderOrder.length : Object.keys(d.links || {}).length;
          setStatus(`<strong>Restore Successful!</strong> Loaded <strong>${totalRestored}</strong> bookmarks and <strong>${folderCount}</strong> folders from Google Sheet.<br><small style="color:rgba(255,255,255,0.6)">Restored at ${timeStr}</small>`, 'ok');
          showNotification(`Restored ${totalRestored} bookmarks from Google Sheet!`, 'success');
          return true;
        } else {
          throw new Error(res.message || 'No data returned from Google Sheet');
        }
      } catch (err) {
        console.error('[Bookly Cloud] Restore error:', err);
        setDot('err');
        setStatus(`<strong>Restore Error:</strong> ${err.message}`, 'err');
        showNotification('Restore failed: ' + err.message, 'error');
        return false;
      } finally {
        setTimeout(() => { isRestoring = false; }, 1500);
        if (!silent && restoreBtn) {
          restoreBtn.disabled = false;
          restoreBtn.innerHTML = `<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16"><path d="M12 3v14m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg><span>Restore from Google Sheet</span>`;
        }
      }
    }

    if (restoreBtn) {
      restoreBtn.addEventListener('click', () => performRestore(false));
    }

    // Reactive debounced auto-sync on local storage changes
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local' || isRestoring) return;

      const relevantKeys = ['links', 'folderOrder', 'pinnedFolders', 'favoriteFolders', 'folderIcons', 'quickAccess', 'dailyFocusTasks'];
      const hasRelevantChange = relevantKeys.some(k => changes[k]);
      if (!hasRelevantChange) return;

      chrome.storage.local.get(['booklyCloudUrl', 'booklyAutoSync'], (res) => {
        if (!res.booklyCloudUrl || res.booklyAutoSync === false) return;

        if (autoSyncTimer) clearTimeout(autoSyncTimer);
        autoSyncTimer = setTimeout(() => {
          console.log('[Bookly Cloud] Triggering reactive instant auto-sync...');
          performBackup(true);
        }, 1800);
      });
    });
  }

  initBooklyLiveWatch();
  initDraggableTodoWindow();
  initBooklyCloudSync();
  initializeHomeDashboard();

  initializeShutdownTimer();

  // Keep the bookmark search collapsed; leave the web-search field ready for a query.

  window.setTimeout(() => {

    const input = document.getElementById('booleanSearchInput');

    if (input && !document.querySelector('.modal-overlay:not(.hidden)')) input.focus({ preventScroll: true });

  }, 100);

});
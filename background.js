class BackgroundService {
  constructor() {
    this.init();
  }

  init() {
    chrome.runtime.onInstalled.addListener((details) => this.onInstalled(details));
    chrome.runtime.onStartup.addListener(() => this.onStartup());
    chrome.contextMenus.onClicked.addListener((info, tab) => this.onContextMenuClick(info, tab));
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      return this.handleMessage(message, sender, sendResponse);
    });
    chrome.storage.onChanged.addListener((changes, area) => this.onStorageChanged(changes, area));
    
    // Handle keyboard shortcuts
    chrome.commands.onCommand.addListener((command) => {
      this.handleCommand(command);
    });
    
    console.log('Bookly Pro background service initialized');
  }

  handleCommand(command) {
    switch (command) {
      case 'add-bookmark':
        chrome.runtime.sendMessage({ type: 'openAddBookmark' }).catch(() => {});
        break;
      case 'search-bookmarks':
        chrome.runtime.sendMessage({ type: 'focusSearch' }).catch(() => {});
        break;
      case 'replace-current-tab':
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          const currentTab = tabs && tabs[0];
          if (!currentTab || !Number.isInteger(currentTab.id)) return;
          const createProperties = { url: chrome.runtime.getURL('popup.html'), active: true };
          if (Number.isInteger(currentTab.windowId)) createProperties.windowId = currentTab.windowId;
          if (Number.isInteger(currentTab.index)) createProperties.index = currentTab.index;
          chrome.tabs.create(createProperties, newTab => {
            if (chrome.runtime.lastError || !newTab || !Number.isInteger(newTab.id)) return;
            chrome.tabs.remove(currentTab.id);
          });
        });
        break;
    }
  }

  onInstalled(details) {
    if (details.reason === 'install') {
      this.initializeStorage();
      this.setupContextMenus();
      this.showWelcomeNotification();
    } else if (details.reason === 'update') {
      this.migrateData();
      this.setupContextMenus();
    }
  }

  onStartup() {
    this.setupContextMenus();
    this.updateFacebookRedirect();
  }

  async initializeStorage() {
    const defaultData = {
      links: {},
      quickAccess: [],
      pinnedFolders: [],
      favoriteFolders: {},
      folderIcons: {},
      settings: {
        openSameTab: true,
        confirmDelete: true,
        facebookRedirect: false,
        theme: 'midnight-pro',
        cardSize: 'medium',
        viewMode: 'grid',
        showClock: true,
        showGreeting: true
      },
      sortOrder: 'usage',
      sidebarCollapsed: false,
      version: '4.0.0'
    };
    
    await chrome.storage.local.set(defaultData);
    console.log('Bookly Pro initialized with default data');
  }

  async migrateData() {
    const result = await chrome.storage.local.get(['version', 'settings']);
    const currentVersion = '4.0.0';
    
    if (!result.version || result.version !== currentVersion) {
      console.log(`Migrating from ${result.version || 'unknown'} to ${currentVersion}`);
      
      if (result.redirectEnabled !== undefined && !result.settings) {
        await chrome.storage.local.set({
          settings: {
            openSameTab: true,
            confirmDelete: true,
            facebookRedirect: result.redirectEnabled,
            theme: 'midnight-pro',
            cardSize: 'medium',
            viewMode: 'grid',
            showClock: true,
            showGreeting: true
          }
        });
        await chrome.storage.local.remove('redirectEnabled');
      }
      
      await chrome.storage.local.set({ version: currentVersion });
    }
  }

  setupContextMenus() {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'stockSearch',
        title: 'Search on Stock Sites',
        contexts: ['selection']
      });

      const stockSites = [
        { id: 'freepik', name: 'Freepik' },
        { id: 'adobestock', name: 'Adobe Stock' },
        { id: 'shutterstock', name: 'Shutterstock' },
        { id: 'pinterest', name: 'Pinterest' },
        { id: 'etsy', name: 'Etsy' },
        { id: 'creativefabrica', name: 'Creative Fabrica' },
        { id: 'istock', name: 'iStock' },
        { id: 'creativemarket', name: 'Creative Market' }
      ];

      stockSites.forEach(site => {
        chrome.contextMenus.create({
          id: `stock_${site.id}`,
          parentId: 'stockSearch',
          title: site.name,
          contexts: ['selection']
        });
      });

      chrome.contextMenus.create({
        id: 'bookmarkSelection',
        title: 'Bookmark Selected Text',
        contexts: ['selection']
      });

      chrome.contextMenus.create({
        id: 'bookmarkPage',
        title: 'Bookmark This Page',
        contexts: ['page']
      });

      chrome.contextMenus.create({
        id: 'bookmarkLink',
        title: 'Bookmark This Link',
        contexts: ['link']
      });
    });
  }

  onContextMenuClick(info, tab) {
    const { menuItemId, selectionText, pageUrl, linkUrl } = info;

    if (menuItemId.startsWith('stock_')) {
      const siteId = menuItemId.split('_')[1];
      const query = encodeURIComponent(selectionText);
      const urls = {
        freepik: `https://www.freepik.com/search?format=search&query=${query}`,
        adobestock: `https://stock.adobe.com/search?k=${query}`,
        shutterstock: `https://www.shutterstock.com/search/${query}`,
        pinterest: `https://www.pinterest.com/search/pins/?q=${query}`,
        etsy: `https://www.etsy.com/search?q=${query}`,
        creativefabrica: `https://www.creativefabrica.com/search/?query=${query}`,
        istock: `https://www.istockphoto.com/search/2/image?phrase=${query}`,
        creativemarket: `https://creativemarket.com/search?query=${query}`
      };
      
      chrome.tabs.create({ url: urls[siteId], active: false });
      return;
    }

    let bookmarkData = null;

    if (menuItemId === 'bookmarkSelection') {
      bookmarkData = {
        title: `Selection: ${selectionText.substring(0, 50)}...`,
        url: pageUrl,
        tags: ['selection'],
        source: 'context_menu'
      };
    } else if (menuItemId === 'bookmarkPage') {
      bookmarkData = {
        title: tab.title,
        url: pageUrl,
        tags: ['quick'],
        source: 'context_menu'
      };
    } else if (menuItemId === 'bookmarkLink') {
      bookmarkData = {
        title: `Link: ${linkUrl}`,
        url: linkUrl,
        tags: ['link'],
        source: 'context_menu'
      };
    }

    if (bookmarkData) {
      this.saveBookmark(bookmarkData);
    }
  }

  async saveBookmark(data) {
    try {
      const result = await chrome.storage.local.get(['links']);
      const links = result.links || {};
      
      // Duplicate detection
      let isDuplicate = false;
      Object.values(links).forEach(folderLinks => {
        folderLinks.forEach(link => {
          if (link.link === data.url) {
            isDuplicate = true;
          }
        });
      });

      if (isDuplicate) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'Assets/icon48.png',
          title: 'Duplicate Found',
          message: 'This URL already exists in your bookmarks!'
        });
        return;
      }
      
      if (!links.Miscellaneous) {
        links.Miscellaneous = [];
      }

      links.Miscellaneous.push({
        title: data.title,
        link: data.url,
        tags: data.tags,
        notes: '',
        dateAdded: new Date().toISOString(),
        usage: 0,
        favorite: false,
        pinned: false
      });

      await chrome.storage.local.set({ links });
      
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'Assets/icon48.png',
        title: 'Bookmark Added',
        message: data.title
      });
      
      chrome.runtime.sendMessage({ type: 'refreshData' }).catch(() => {});
      
    } catch (error) {
      console.error('Failed to save bookmark:', error);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'updateSettings':
        await chrome.storage.local.set({ settings: message.settings });
        this.updateFacebookRedirect();
        sendResponse({ success: true });
        break;
        
      case 'getSettings':
        const result = await chrome.storage.local.get(['settings']);
        sendResponse(result.settings);
        break;
        
      case 'showNotification':
        this.showNotification(message.title, message.message);
        sendResponse({ success: true });
        break;
        
      case 'exportData':
        this.exportData();
        sendResponse({ success: true });
        break;
        
      case 'performSearch':
        this.performSearch(message.query, message.engine);
        sendResponse({ success: true });
        break;

      case 'submitAiQueryInCurrentTab':
        // Return the promise result to Chrome's MV3 messaging layer; do not acknowledge early.
        return this.submitAiQueryInCurrentTab(message, sender)
          .then(result => result)
          .catch(error => ({ success: false, error: error?.message || 'Could not submit the query to the AI page.' }));

      case 'checkDuplicate':
        const dupResult = await this.checkDuplicate(message.url);
        sendResponse({ isDuplicate: dupResult });
        break;

      case 'checkBrokenLinks':
        this.checkBrokenLinks(message.links);
        sendResponse({ success: true });
        break;
    }
    return true;
  }

  async submitAiQueryInCurrentTab(message, sender) {
    const engine = message.engine === 'gemini' ? 'gemini' : 'chatgpt';
    const query = String(message.query || '').trim();
    if (!query) throw new Error('Search text is empty.');
    const tabId = Number.isInteger(sender?.tab?.id) ? sender.tab.id : null;
    if (!Number.isInteger(tabId)) throw new Error('The current tab could not be identified.');
    const targetUrl = engine === 'gemini' ? 'https://gemini.google.com/app' : 'https://chatgpt.com/';
    const expectedHost = engine === 'gemini' ? 'gemini.google.com' : 'chatgpt.com';

    const loaded = new Promise((resolve, reject) => {
      let settled = false;
      const finish = value => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(onUpdated);
        resolve(value);
      };
      const onUpdated = (updatedTabId, changeInfo, tab) => {
        if (updatedTabId !== tabId || changeInfo.status !== 'complete') return;
        let host = ''; try { host = new URL(tab?.url || '').hostname; } catch (_) {}
        if (host === expectedHost || host.endsWith(`.${expectedHost}`)) finish(true);
      };
      const timeout = setTimeout(() => finish(false), 25000);
      chrome.tabs.onUpdated.addListener(onUpdated);
      chrome.tabs.update(tabId, { url: targetUrl, active: true }, updatedTab => {
        if (chrome.runtime.lastError || !updatedTab) {
          chrome.tabs.onUpdated.removeListener(onUpdated);
          clearTimeout(timeout);
          reject(new Error(chrome.runtime.lastError?.message || 'Could not navigate the current tab.'));
        }
      });
    });
    if (!await loaded) throw new Error('The AI page took too long to load. The query is copied to your clipboard as a fallback.');
    // Give the single-page application a moment to mount its composer after the page load event.
    await new Promise(resolve => setTimeout(resolve, 900));
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      args: [query, engine],
      func: async (searchText, searchEngine) => {
        const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
        const selectors = searchEngine === 'gemini'
          ? ['rich-textarea [contenteditable="true"]', 'rich-textarea textarea', 'div[contenteditable="true"]', 'textarea']
          : ['#prompt-textarea', 'div[contenteditable="true"][data-placeholder]', 'div[contenteditable="true"]', 'textarea'];
        let editor = null;
        for (let attempt = 0; attempt < 36 && !editor; attempt++) {
          for (const selector of selectors) {
            const candidate = [...document.querySelectorAll(selector)].find(element => {
              const rect = element.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0 && !element.disabled && element.getAttribute('aria-hidden') !== 'true';
            });
            if (candidate) { editor = candidate; break; }
          }
          if (!editor) await wait(500);
        }
        if (!editor) return { success: false, reason: 'AI input box was not found.' };
        editor.focus();
        if (editor.isContentEditable || editor.getAttribute('contenteditable') === 'true') {
          try {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(editor); range.deleteContents(); range.collapse(true);
            selection.removeAllRanges(); selection.addRange(range);
            document.execCommand('insertText', false, searchText);
          } catch (_) { editor.textContent = searchText; }
          if (!String(editor.innerText || editor.textContent || '').trim()) editor.textContent = searchText;
          editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: searchText }));
        } else {
          const prototype = editor.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
          if (setter) setter.call(editor, searchText); else editor.value = searchText;
          editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: searchText }));
          editor.dispatchEvent(new Event('change', { bubbles: true }));
        }
        await wait(450);
        const sendSelectors = searchEngine === 'gemini'
          ? ['button[aria-label*="Send"]', 'button[aria-label*="send"]', 'button[data-test-id*="send"]', 'button.send-button']
          : ['button[data-testid="send-button"]', 'button[aria-label*="Send"]', 'button[aria-label*="send"]'];
        let sendButton = null;
        for (const selector of sendSelectors) {
          sendButton = [...document.querySelectorAll(selector)].find(button => {
            const rect = button.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && !button.disabled && button.getAttribute('aria-disabled') !== 'true';
          });
          if (sendButton) break;
        }
        if (sendButton) { sendButton.click(); return { success: true, action: 'send-button' }; }
        ['keydown', 'keypress', 'keyup'].forEach(type => editor.dispatchEvent(new KeyboardEvent(type, { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true, cancelable: true })));
        return { success: true, action: 'enter-key-fallback' };
      }
    });
    const result = results?.[0]?.result;
    if (result && result.success === false) throw new Error(result.reason || 'Could not find the AI composer.');
    return { success: true, engine, action: result?.action || 'submitted' };
  }

  async checkDuplicate(url) {
    const result = await chrome.storage.local.get(['links']);
    const links = result.links || {};
    
    for (const folder of Object.values(links)) {
      for (const link of folder) {
        if (link.link === url) return true;
      }
    }
    return false;
  }

  async checkBrokenLinks(linksToCheck) {
    // Send results back to popup
    const results = [];
    for (const item of linksToCheck) {
      try {
        const response = await fetch(item.link, { method: 'HEAD', mode: 'no-cors' });
        results.push({ ...item, status: 'ok' });
      } catch (e) {
        results.push({ ...item, status: 'broken' });
      }
    }
    chrome.runtime.sendMessage({ type: 'brokenLinksResult', results }).catch(() => {});
  }

  onStorageChanged(changes, area) {
    if (area === 'local' && changes.settings) {
      this.updateFacebookRedirect();
    }
  }

  async updateFacebookRedirect() {
    const result = await chrome.storage.local.get(['settings']);
    const enabled = result.settings?.facebookRedirect || false;
    
    // Using content script approach (redirect.js handles this)
    await chrome.storage.local.set({ redirectEnabled: enabled });
  }

  performSearch(query, engine = 'google') {
    const encodedQuery = encodeURIComponent(query);
    const urls = {
      google: `https://www.google.com/search?q=${encodedQuery}`,
      yandex: `https://yandex.com/search/?text=${encodedQuery}`,
      duckduckgo: `https://duckduckgo.com/?q=${encodedQuery}`,
      bing: `https://www.bing.com/search?q=${encodedQuery}`
    };
    
    chrome.tabs.create({ url: urls[engine], active: true });
  }

  exportData() {
    chrome.storage.local.get(null, (data) => {
      const exportData = {
        ...data,
        exportDate: new Date().toISOString(),
        version: chrome.runtime.getManifest().version
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `bookly-backup-${timestamp}.json`;
      
      chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      }, () => {
        URL.revokeObjectURL(url);
        this.showNotification('Export Complete', 'Your bookmarks have been exported successfully');
      });
    });
  }

  showNotification(title, message) {
    // Notifications may be unavailable in restricted/test contexts; never let this throw.
    try {
      if (globalThis.chrome?.notifications?.create) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'Assets/icon48.png',
          title: String(title || 'Bookly Pro'),
          message: String(message || '')
        }, () => { void chrome.runtime?.lastError; });
      }
    } catch (error) {
      console.debug('Bookly notification skipped:', error?.message || error);
    }
  }

  showWelcomeNotification() {
    setTimeout(() => {
      this.showNotification(
        'Bookly Pro Installed',
        'Right-click selected text to search stock sites or bookmark content'
      );
    }, 2000);
  }
}

const backgroundService = new BackgroundService();
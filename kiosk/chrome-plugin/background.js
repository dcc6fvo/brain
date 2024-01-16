(() => {
  // manifest.json
  var manifest_version = 2;
  var name = "Tab Rotate";
  var description = "Loop through a set of tabs - ideal for a Dashboard or Advertisement Display";
  var version = "0.6.2";
  var browser_action = {
    default_icon: "img/Play-38.png",
    default_title: "Start Tab Rotate"
  };
  var options_page = "index.html";
  var background = {
    scripts: ["background.js", "import-analytics.js", "hot-reload.js"]
  };
  var icons = {
    "16": "img/Play-16.png",
    "32": "img/Play-32.png",
    "48": "img/Play-48.png",
    "128": "img/Play-128.png"
  };
  var content_security_policy = "script-src 'self' https://www.google-analytics.com https://unpkg.com; object-src 'self'";
  var permissions = [
    "storage",
    "https://ajax.googleapis.com/",
    "file://*/",
    "http://*/",
    "https://*/"
  ];
  var manifest_default = {
    manifest_version,
    name,
    description,
    version,
    browser_action,
    options_page,
    background,
    icons,
    content_security_policy,
    permissions
  };

  // src/analytics.js
  var { version: version2 } = manifest_default;
  console.log("started daemon: background.js");
  var ga = (...args) => {
    if (globalThis?.ga) {
      globalThis?.ga(...args);
    } else {
      console.log("ga not available");
    }
  };
  var state = {
    lastHeartbeatTime: 0
  };
  var analytics = {
    startup: () => ga("send", {
      hitType: "event",
      eventCategory: "version",
      eventAction: "manifest",
      eventLabel: version2
    }),
    play: () => ga("send", {
      hitType: "event",
      eventCategory: "user-action",
      eventAction: "play",
      eventLabel: version2
    }),
    pause: () => ga("send", {
      hitType: "event",
      eventCategory: "user-action",
      eventAction: "pause",
      eventLabel: version2
    }),
    heartbeat: (action) => {
      console.log("analytics.heartbeat", action);
      ga("send", {
        hitType: "event",
        eventCategory: "heartbeat",
        eventAction: action,
        eventLabel: version2
      });
    },
    install: () => {
      console.log("analytics: install");
      ga("send", {
        hitType: "event",
        eventCategory: "user-action",
        eventAction: "install",
        eventLabel: version2
      });
    },
    backgroundPageview: () => ga("send", "pageview", "/background.js"),
    optionsPageview: () => ga("send", "pageview", "/options.js"),
    analyticsHeartbeat(playStartTime) {
      console.log("analyticsHeartbeat");
      const now = new Date().getTime();
      const previous = state.lastHeartbeatTime || now;
      const MINUTE = 60 * 1e3;
      const HOUR = 60 * MINUTE;
      const DAY = 24 * HOUR;
      const WEEK = 7 * DAY;
      const MONTH = 30 * DAY;
      const YEAR = 365 * DAY;
      const uptime = now - playStartTime;
      const tenMinuteMark = playStartTime + 10 * MINUTE;
      const twentyMinuteMark = playStartTime + 20 * MINUTE;
      const thirtyMinuteMark = playStartTime + 30 * MINUTE;
      const fortyMinuteMark = playStartTime + 40 * MINUTE;
      const fiftyMinuteMark = playStartTime + 50 * MINUTE;
      const sixtyMinuteMark = playStartTime + 60 * MINUTE;
      if (previous < tenMinuteMark && tenMinuteMark < now)
        this.heartbeat("10mins");
      if (previous < twentyMinuteMark && twentyMinuteMark < now)
        this.heartbeat("20mins");
      if (previous < thirtyMinuteMark && thirtyMinuteMark < now)
        this.heartbeat("30mins");
      if (previous < fortyMinuteMark && fortyMinuteMark < now)
        this.heartbeat("40mins");
      if (previous < fiftyMinuteMark && fiftyMinuteMark < now)
        this.heartbeat("50mins");
      if (previous < sixtyMinuteMark && sixtyMinuteMark < now)
        this.heartbeat("60mins");
      const REALTIME_PULSE_INTERVAL = 3 * MINUTE;
      const lastPulseMark = now - uptime % REALTIME_PULSE_INTERVAL;
      if (previous < lastPulseMark && lastPulseMark < now)
        this.heartbeat("pulse");
      const lastHourMark = now - uptime % HOUR;
      if (previous < lastHourMark && lastHourMark < now)
        this.heartbeat("hour");
      const lastDayMark = now - uptime % DAY;
      if (previous < lastDayMark && lastDayMark < now)
        this.heartbeat("day");
      const lastWeekMark = now - uptime % WEEK;
      if (previous < lastWeekMark && lastWeekMark < now)
        this.heartbeat("week");
      const lastMonthMark = now - uptime % MONTH;
      if (previous < lastMonthMark && lastMonthMark < now)
        this.heartbeat("month");
      const lastYearMark = now - uptime % YEAR;
      if (previous < lastYearMark && lastYearMark < now)
        this.heartbeat("year");
      state.lastHeartbeatTime = now;
    }
  };
  analytics.startup();
  var analytics_default = analytics;

  // src/config.sample.json
  var settingsReloadIntervalMinutes = 1;
  var fullscreen = false;
  var autoStart = false;
  var lazyLoadTabs = false;
  var closeExistingTabs = false;
  var websites = [
    {
      url: "chrome-extension://pjgjpabbgnnoohijnillgbckikfkbjed/index.html",
      duration: 8,
      tabReloadIntervalSeconds: 15
    },
    {
      url: "https://www.patreon.com/kevdev",
      duration: 8,
      tabReloadIntervalSeconds: 15
    },
    {
      url: "https://chrome.google.com/webstore/detail/tab-rotate/pjgjpabbgnnoohijnillgbckikfkbjed",
      duration: 8,
      tabReloadIntervalSeconds: 15
    }
  ];
  var config_sample_default = {
    settingsReloadIntervalMinutes,
    fullscreen,
    autoStart,
    lazyLoadTabs,
    closeExistingTabs,
    websites
  };

  // src/dataLayer.js
  var { chrome } = globalThis;
  var cache = null;
  var settingsLoadTime = 0;
  var settingsChangeTime = 0;
  var DEFAULT_STORAGE_OBJECT = {
    source: "DIRECT",
    url: "http://_url_to_your_config_file.json",
    configFile: JSON.stringify(config_sample_default, null, 2)
  };
  function openSettingsPage() {
    chrome.tabs.create({
      index: 0,
      url: "index.html"
    });
  }
  async function reload() {
    settingsLoadTime = new Date().getTime();
    const discSettings = await readSettingsFromDisc();
    let didSettingsChange = false;
    if (JSON.stringify(discSettings) !== JSON.stringify(cache)) {
      didSettingsChange = true;
      cache = discSettings;
    }
    if (cache.source === "URL") {
      var brainURL = cache.url;
      const configFile = await loadConfigFileFromUrl(brainURL);
      if (isValidConfigFile(configFile) && configFile !== cache.configFile) {
        cache.configFile = configFile;
        didSettingsChange = true;
        saveToDisc(cache);
      }
    }
    if (didSettingsChange) {
      settingsChangeTime = new Date().getTime();
    }
    return didSettingsChange;
  }
  function saveToDisc(storage) {
    chrome.storage.sync.set(storage);
  }
  async function loadConfigFileFromUrl(url) {
    console.log('URL ->');
    console.log(url);
    const response = await fetch(url);
    const text = await response.text();
    return text;
  }
  var isEmptyObject = (obj) => !(obj && Object.keys(obj).length !== 0);
  function readSettingsFromDisc() {
    return new Promise((resolve) => {
      console.log("Read settings from disc");
      chrome.storage.sync.get(null, (allStorage) => {
        if (isEmptyObject(allStorage)) {
          analytics_default.install();
          openSettingsPage();
          resolve({ ...DEFAULT_STORAGE_OBJECT });
        } else {
          resolve({ ...allStorage });
        }
      });
    });
  }
  function isValidConfigFile(configFile) {
    try {
      JSON.parse(configFile);
    } catch (e) {
      console.error("isValidConfigFile()", e);
      return false;
    }
    return true;
  }
  function getConfig() {
    return { ...JSON.parse(cache.configFile) };
  }
  function getSettingsLoadTime() {
    return settingsLoadTime;
  }
  function getSettingsChangeTime() {
    return settingsChangeTime;
  }
  function isRemoteLoadingEnabled() {
    return cache.source === "URL";
  }
  var dataLayer_default = {
    reload,
    getConfig,
    getSettingsLoadTime,
    getSettingsChangeTime,
    isRemoteLoadingEnabled
  };

  // src/background.js
  var { chrome: chrome2 } = globalThis;
  var session = newSessionObject();
  async function init() {
    await dataLayer_default.reload();
    session.config = dataLayer_default.getConfig();
    analytics_default.backgroundPageview();
    initEventListeners();
    if (session.config.autoStart)
      play();
  }
  init();
  function newSessionObject() {
    return {
      tabs: [],
      tabReloadTime: [],
      isRotateEnabled: false,
      nextIndex: 0,
      timerId: null,
      playStartTime: 0,
      config: {}
    };
  }
  function initEventListeners() {
    chrome2.browserAction.onClicked.addListener(iconClicked);
  }
  function iconClicked() {
    if (session.isRotateEnabled) {
      pause();
    } else {
      play();
    }
  }
  async function play() {
    analytics_default.play();
    chrome2.browserAction.setIcon({ path: "img/Pause-38.png" });
    chrome2.browserAction.setTitle({ title: "Pause Tab Rotate" });
    session = newSessionObject();
    session.isRotateEnabled = true;
    session.playStartTime = new Date().getTime();
    beginCycle(true);
  }
  function pause() {
    analytics_default.pause();
    chrome2.browserAction.setIcon({ path: "img/Play-38.png" });
    chrome2.browserAction.setTitle({ title: "Start Tab Rotate" });
    clearTimeout(session.timerId);
    session.isRotateEnabled = false;
  }
  async function beginCycle(isFirstCycle = false) {
    console.log("isFirstCycle", isFirstCycle);
    let didSettingsChange = false;
    if (isFirstCycle || isSettingsReloadRequired()) {
      console.log("session", session);
      didSettingsChange = await dataLayer_default.reload();
      session.config = dataLayer_default.getConfig();
      if (isFirstCycle || didSettingsChange) {
        await initTabs();
      }
    }
    rotateTabAndScheduleNextRotation(isFirstCycle || didSettingsChange);
  }
  async function rotateTabAndScheduleNextRotation(isFirstCycle) {
    if (!session.isRotateEnabled)
      return;
    const { playStartTime } = session;
    analytics_default.analyticsHeartbeat(playStartTime);
    const currentTab = session.tabs[session.nextIndex];
    const sleepDuration = session.config.websites[session.nextIndex].duration;
    console.log(`Show tab: ${session.nextIndex}`);
    chrome2.tabs.update(currentTab.id, { active: true });
    changeTabZoom(session.nextIndex,currentTab.id);
    session.nextIndex += 1;
    if (session.nextIndex >= session.tabs.length) {
      session.nextIndex = 0;
    }
    preloadTab(session.nextIndex, isFirstCycle);
    console.log(`sleep for: ${sleepDuration}`);
    session.timerId = setTimeout(session.nextIndex === 0 ? beginCycle : () => rotateTabAndScheduleNextRotation(isFirstCycle), sleepDuration * 1e3);
  }
  async function initTabs() {
    const tabIdsToClose = await getTabsToClose();
    console.log("tabIdsToClose", tabIdsToClose);
    await insertTabs();
    const { closeExistingTabs: closeExistingTabs2 } = session?.config;
    if (closeExistingTabs2 === void 0 || closeExistingTabs2 === true) {
      await closeTabs(tabIdsToClose);
    }
  }
  async function getTabsToClose() {
    return new Promise((resolve) => {
      const queryInactiveTabs = {
        currentWindow: true
      };
      const tabIds = [];
      chrome2.tabs.query(queryInactiveTabs, (tabs) => {
        for (let i = 0; i < tabs.length; i += 1) {
          tabIds.push(tabs[i].id);
        }
        resolve(tabIds);
      });
    });
  }
  function closeTabs(tabIds) {
    return new Promise((resolve) => {
      console.log(`Fullscreen: ${session.config.fullscreen}`);
      if (session.config.fullscreen) {
        chrome2.windows.getCurrent({}, (window) => {
          chrome2.windows.update(window.id, { state: "fullscreen" });
        });
      }
      chrome2.tabs.remove(tabIds, () => {
        resolve();
      });
    });
  }
  function insertTabs(tabIdsToClose) {
    return new Promise((resolve) => {
      let counter = 0;
      session.tabs = [];
      for (let i = 0; i < session.config.websites.length; i += 1) {
        let url = "about:blank";
        let reloadTime = 0;
        const { lazyLoadTabs: lazyLoadTabs2 } = session.config;
        if (!lazyLoadTabs2 || i < 2) {
          url = session.config.websites[i].url;
          reloadTime = new Date().getTime();
        }
        insertTab(url, i, (index, tab) => {
          session.tabs[index] = tab;
          session.tabReloadTime[index] = reloadTime;
          counter++;
          if (counter >= session.config.websites.length) {
            resolve(tabIdsToClose);
          }
        });
      }
    });
  }
  function changeTabZoom(tabIndex, tabId){
    const zoom = session.config.websites[tabIndex].zoom; 
    console.log(`Setting zoom in ${zoom} for tab ${tabId}`);
    chrome2.tabs.setZoomSettings(
      tabId,
      {defaultZoomFactor: 2, scope: 'per-tab', mode: 'automatic'},
      () => {}
    );
    chrome2.tabs.setZoom(tabId, zoom, () => {});
  }
  function insertTab(url, indexOfTab, callback) {
    chrome2.tabs.create({
      index: indexOfTab,
      url
    }, (tab) => {
      console.log(`Inserted tabId: ${tab.id}`);
      callback(indexOfTab, tab);
      changeTabZoom(indexOfTab,tab.id);
    }); 
  }
  function preloadTab(tabIndex, isFirstCycle) {
    if (!isTabReloadRequired(tabIndex) && !isFirstCycle) {
      console.log(`Do not Preload tab: ${tabIndex}`);
      return;
    }
    const { url } = session.config.websites[tabIndex];
    const { id } = session.tabs[tabIndex];
    console.log(`Preload tab: ${tabIndex}`);
    chrome2.tabs.update(id, { url }, () => chrome2.tabs.update(id, { url }));
    changeTabZoom(tabIndex,id);
    session.tabReloadTime[tabIndex] = new Date().getTime();
  }
  function isSettingsReloadRequired() {
    const currentTimeMillis = new Date().getTime();
    const millisSinceLastReload = currentTimeMillis - dataLayer_default.getSettingsLoadTime();
    const reloadIntervalMillis = session.config.settingsReloadIntervalMinutes * 60 * 1e3;
    console.log("currentTimeMillis", currentTimeMillis);
    console.log("millisSinceLastReload", millisSinceLastReload);
    console.log("reloadIntervalMillis", reloadIntervalMillis);
    if (dataLayer_default.isRemoteLoadingEnabled() && millisSinceLastReload > reloadIntervalMillis) {
      console.log("Reload settings from url: yes");
      return true;
    }
    console.log("Reload settings from url: no");
    return false;
  }
  function isTabReloadRequired(tabIndex) {
    const currentTimeMillis = new Date().getTime();
    const millisSinceLastReload = currentTimeMillis - session.tabReloadTime[tabIndex];
    const reloadIntervalMillis = session.config.websites[tabIndex].tabReloadIntervalSeconds * 1e3;
    if (reloadIntervalMillis <= 0) {
      return false;
    }
    if (millisSinceLastReload > reloadIntervalMillis) {
      return true;
    }
    return false;
  }
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FuYWx5dGljcy5qcyIsICIuLi9zcmMvZGF0YUxheWVyLmpzIiwgIi4uL3NyYy9iYWNrZ3JvdW5kLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgbWFuaWZlc3QgZnJvbSAnLi4vbWFuaWZlc3QuanNvbic7XG5cbmNvbnN0IHsgdmVyc2lvbiB9ID0gbWFuaWZlc3Q7XG5jb25zb2xlLmxvZygnc3RhcnRlZCBkYWVtb246IGJhY2tncm91bmQuanMnKTtcblxuY29uc3QgZ2EgPSAoLi4uYXJncykgPT4ge1xuICBpZiAoZ2xvYmFsVGhpcz8uZ2EpIHtcbiAgICBnbG9iYWxUaGlzPy5nYSguLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZygnZ2Egbm90IGF2YWlsYWJsZScpO1xuICB9XG59O1xuXG5jb25zdCBzdGF0ZSA9IHtcbiAgbGFzdEhlYXJ0YmVhdFRpbWU6IDAsXG59O1xuXG5jb25zdCBhbmFseXRpY3MgPSB7XG4gIHN0YXJ0dXA6ICgpID0+XG4gICAgZ2EoJ3NlbmQnLCB7XG4gICAgICBoaXRUeXBlOiAnZXZlbnQnLFxuICAgICAgZXZlbnRDYXRlZ29yeTogJ3ZlcnNpb24nLFxuICAgICAgZXZlbnRBY3Rpb246ICdtYW5pZmVzdCcsXG4gICAgICBldmVudExhYmVsOiB2ZXJzaW9uLFxuICAgIH0pLFxuICBwbGF5OiAoKSA9PlxuICAgIGdhKCdzZW5kJywge1xuICAgICAgaGl0VHlwZTogJ2V2ZW50JyxcbiAgICAgIGV2ZW50Q2F0ZWdvcnk6ICd1c2VyLWFjdGlvbicsXG4gICAgICBldmVudEFjdGlvbjogJ3BsYXknLFxuICAgICAgZXZlbnRMYWJlbDogdmVyc2lvbixcbiAgICB9KSxcbiAgcGF1c2U6ICgpID0+XG4gICAgZ2EoJ3NlbmQnLCB7XG4gICAgICBoaXRUeXBlOiAnZXZlbnQnLFxuICAgICAgZXZlbnRDYXRlZ29yeTogJ3VzZXItYWN0aW9uJyxcbiAgICAgIGV2ZW50QWN0aW9uOiAncGF1c2UnLFxuICAgICAgZXZlbnRMYWJlbDogdmVyc2lvbixcbiAgICB9KSxcbiAgaGVhcnRiZWF0OiAoYWN0aW9uKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ2FuYWx5dGljcy5oZWFydGJlYXQnLCBhY3Rpb24pO1xuICAgIGdhKCdzZW5kJywge1xuICAgICAgaGl0VHlwZTogJ2V2ZW50JyxcbiAgICAgIGV2ZW50Q2F0ZWdvcnk6ICdoZWFydGJlYXQnLFxuICAgICAgZXZlbnRBY3Rpb246IGFjdGlvbixcbiAgICAgIGV2ZW50TGFiZWw6IHZlcnNpb24sXG4gICAgfSk7XG4gIH0sXG4gIGluc3RhbGw6ICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnYW5hbHl0aWNzOiBpbnN0YWxsJyk7XG4gICAgZ2EoJ3NlbmQnLCB7XG4gICAgICBoaXRUeXBlOiAnZXZlbnQnLFxuICAgICAgZXZlbnRDYXRlZ29yeTogJ3VzZXItYWN0aW9uJyxcbiAgICAgIGV2ZW50QWN0aW9uOiAnaW5zdGFsbCcsXG4gICAgICBldmVudExhYmVsOiB2ZXJzaW9uLFxuICAgIH0pO1xuICB9LFxuICBiYWNrZ3JvdW5kUGFnZXZpZXc6ICgpID0+IGdhKCdzZW5kJywgJ3BhZ2V2aWV3JywgJy9iYWNrZ3JvdW5kLmpzJyksXG4gIG9wdGlvbnNQYWdldmlldzogKCkgPT4gZ2EoJ3NlbmQnLCAncGFnZXZpZXcnLCAnL29wdGlvbnMuanMnKSxcbiAgYW5hbHl0aWNzSGVhcnRiZWF0KHBsYXlTdGFydFRpbWUpIHtcbiAgICBjb25zb2xlLmxvZygnYW5hbHl0aWNzSGVhcnRiZWF0Jyk7XG4gICAgLy8gQWxsIHVuaXRzIGluIG1pbGxpc1xuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGNvbnN0IHByZXZpb3VzID0gc3RhdGUubGFzdEhlYXJ0YmVhdFRpbWUgfHwgbm93O1xuICAgIGNvbnN0IE1JTlVURSA9IDYwICogMTAwMDtcbiAgICBjb25zdCBIT1VSID0gNjAgKiBNSU5VVEU7XG4gICAgY29uc3QgREFZID0gMjQgKiBIT1VSO1xuICAgIGNvbnN0IFdFRUsgPSA3ICogREFZO1xuICAgIGNvbnN0IE1PTlRIID0gMzAgKiBEQVk7XG4gICAgY29uc3QgWUVBUiA9IDM2NSAqIERBWTtcbiAgICBjb25zdCB1cHRpbWUgPSBub3cgLSBwbGF5U3RhcnRUaW1lO1xuXG4gICAgY29uc3QgdGVuTWludXRlTWFyayA9IHBsYXlTdGFydFRpbWUgKyAxMCAqIE1JTlVURTtcbiAgICBjb25zdCB0d2VudHlNaW51dGVNYXJrID0gcGxheVN0YXJ0VGltZSArIDIwICogTUlOVVRFO1xuICAgIGNvbnN0IHRoaXJ0eU1pbnV0ZU1hcmsgPSBwbGF5U3RhcnRUaW1lICsgMzAgKiBNSU5VVEU7XG4gICAgY29uc3QgZm9ydHlNaW51dGVNYXJrID0gcGxheVN0YXJ0VGltZSArIDQwICogTUlOVVRFO1xuICAgIGNvbnN0IGZpZnR5TWludXRlTWFyayA9IHBsYXlTdGFydFRpbWUgKyA1MCAqIE1JTlVURTtcbiAgICBjb25zdCBzaXh0eU1pbnV0ZU1hcmsgPSBwbGF5U3RhcnRUaW1lICsgNjAgKiBNSU5VVEU7XG5cbiAgICBpZiAocHJldmlvdXMgPCB0ZW5NaW51dGVNYXJrICYmIHRlbk1pbnV0ZU1hcmsgPCBub3cpXG4gICAgICB0aGlzLmhlYXJ0YmVhdCgnMTBtaW5zJyk7XG5cbiAgICBpZiAocHJldmlvdXMgPCB0d2VudHlNaW51dGVNYXJrICYmIHR3ZW50eU1pbnV0ZU1hcmsgPCBub3cpXG4gICAgICB0aGlzLmhlYXJ0YmVhdCgnMjBtaW5zJyk7XG5cbiAgICBpZiAocHJldmlvdXMgPCB0aGlydHlNaW51dGVNYXJrICYmIHRoaXJ0eU1pbnV0ZU1hcmsgPCBub3cpXG4gICAgICB0aGlzLmhlYXJ0YmVhdCgnMzBtaW5zJyk7XG5cbiAgICBpZiAocHJldmlvdXMgPCBmb3J0eU1pbnV0ZU1hcmsgJiYgZm9ydHlNaW51dGVNYXJrIDwgbm93KVxuICAgICAgdGhpcy5oZWFydGJlYXQoJzQwbWlucycpO1xuXG4gICAgaWYgKHByZXZpb3VzIDwgZmlmdHlNaW51dGVNYXJrICYmIGZpZnR5TWludXRlTWFyayA8IG5vdylcbiAgICAgIHRoaXMuaGVhcnRiZWF0KCc1MG1pbnMnKTtcblxuICAgIGlmIChwcmV2aW91cyA8IHNpeHR5TWludXRlTWFyayAmJiBzaXh0eU1pbnV0ZU1hcmsgPCBub3cpXG4gICAgICB0aGlzLmhlYXJ0YmVhdCgnNjBtaW5zJyk7XG5cbiAgICBjb25zdCBSRUFMVElNRV9QVUxTRV9JTlRFUlZBTCA9IDMgKiBNSU5VVEU7XG4gICAgY29uc3QgbGFzdFB1bHNlTWFyayA9IG5vdyAtICh1cHRpbWUgJSBSRUFMVElNRV9QVUxTRV9JTlRFUlZBTCk7XG4gICAgaWYgKHByZXZpb3VzIDwgbGFzdFB1bHNlTWFyayAmJiBsYXN0UHVsc2VNYXJrIDwgbm93KVxuICAgICAgdGhpcy5oZWFydGJlYXQoJ3B1bHNlJyk7XG5cbiAgICBjb25zdCBsYXN0SG91ck1hcmsgPSBub3cgLSAodXB0aW1lICUgSE9VUik7XG4gICAgaWYgKHByZXZpb3VzIDwgbGFzdEhvdXJNYXJrICYmIGxhc3RIb3VyTWFyayA8IG5vdykgdGhpcy5oZWFydGJlYXQoJ2hvdXInKTtcblxuICAgIGNvbnN0IGxhc3REYXlNYXJrID0gbm93IC0gKHVwdGltZSAlIERBWSk7XG4gICAgaWYgKHByZXZpb3VzIDwgbGFzdERheU1hcmsgJiYgbGFzdERheU1hcmsgPCBub3cpIHRoaXMuaGVhcnRiZWF0KCdkYXknKTtcblxuICAgIGNvbnN0IGxhc3RXZWVrTWFyayA9IG5vdyAtICh1cHRpbWUgJSBXRUVLKTtcbiAgICBpZiAocHJldmlvdXMgPCBsYXN0V2Vla01hcmsgJiYgbGFzdFdlZWtNYXJrIDwgbm93KSB0aGlzLmhlYXJ0YmVhdCgnd2VlaycpO1xuXG4gICAgY29uc3QgbGFzdE1vbnRoTWFyayA9IG5vdyAtICh1cHRpbWUgJSBNT05USCk7XG4gICAgaWYgKHByZXZpb3VzIDwgbGFzdE1vbnRoTWFyayAmJiBsYXN0TW9udGhNYXJrIDwgbm93KVxuICAgICAgdGhpcy5oZWFydGJlYXQoJ21vbnRoJyk7XG5cbiAgICBjb25zdCBsYXN0WWVhck1hcmsgPSBub3cgLSAodXB0aW1lICUgWUVBUik7XG4gICAgaWYgKHByZXZpb3VzIDwgbGFzdFllYXJNYXJrICYmIGxhc3RZZWFyTWFyayA8IG5vdykgdGhpcy5oZWFydGJlYXQoJ3llYXInKTtcblxuICAgIHN0YXRlLmxhc3RIZWFydGJlYXRUaW1lID0gbm93O1xuICB9LFxufTtcblxuYW5hbHl0aWNzLnN0YXJ0dXAoKTtcblxuZXhwb3J0IGRlZmF1bHQgYW5hbHl0aWNzO1xuIiwgImltcG9ydCBhbmFseXRpY3MgZnJvbSAnLi9hbmFseXRpY3MnO1xuaW1wb3J0IHNhbXBsZUNvbmZpZyBmcm9tICcuL2NvbmZpZy5zYW1wbGUuanNvbic7XG5cbmNvbnN0IHsgY2hyb21lIH0gPSBnbG9iYWxUaGlzO1xuXG5sZXQgY2FjaGUgPSBudWxsO1xubGV0IHNldHRpbmdzTG9hZFRpbWUgPSAwO1xubGV0IHNldHRpbmdzQ2hhbmdlVGltZSA9IDA7XG5cbmNvbnN0IERFRkFVTFRfU1RPUkFHRV9PQkpFQ1QgPSB7XG4gIHNvdXJjZTogJ0RJUkVDVCcsXG4gIHVybDogJ2h0dHA6Ly9fdXJsX3RvX3lvdXJfY29uZmlnX2ZpbGUuanNvbicsXG4gIGNvbmZpZ0ZpbGU6IEpTT04uc3RyaW5naWZ5KHNhbXBsZUNvbmZpZywgbnVsbCwgMiksXG59O1xuXG5mdW5jdGlvbiBvcGVuU2V0dGluZ3NQYWdlKCkge1xuICBjaHJvbWUudGFicy5jcmVhdGUoe1xuICAgIGluZGV4OiAwLFxuICAgIHVybDogJ2luZGV4Lmh0bWwnLFxuICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcmVsb2FkKCkge1xuICBzZXR0aW5nc0xvYWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIGNvbnN0IGRpc2NTZXR0aW5ncyA9IGF3YWl0IHJlYWRTZXR0aW5nc0Zyb21EaXNjKCk7XG4gIGxldCBkaWRTZXR0aW5nc0NoYW5nZSA9IGZhbHNlO1xuICBpZiAoSlNPTi5zdHJpbmdpZnkoZGlzY1NldHRpbmdzKSAhPT0gSlNPTi5zdHJpbmdpZnkoY2FjaGUpKSB7XG4gICAgZGlkU2V0dGluZ3NDaGFuZ2UgPSB0cnVlO1xuICAgIGNhY2hlID0gZGlzY1NldHRpbmdzO1xuICB9XG4gIGlmIChjYWNoZS5zb3VyY2UgPT09ICdVUkwnKSB7XG4gICAgY29uc3QgY29uZmlnRmlsZSA9IGF3YWl0IGxvYWRDb25maWdGaWxlRnJvbVVybChjYWNoZS51cmwpO1xuICAgIGlmIChpc1ZhbGlkQ29uZmlnRmlsZShjb25maWdGaWxlKSAmJiBjb25maWdGaWxlICE9PSBjYWNoZS5jb25maWdGaWxlKSB7XG4gICAgICBjYWNoZS5jb25maWdGaWxlID0gY29uZmlnRmlsZTtcbiAgICAgIGRpZFNldHRpbmdzQ2hhbmdlID0gdHJ1ZTtcbiAgICAgIHNhdmVUb0Rpc2MoY2FjaGUpO1xuICAgIH1cbiAgfVxuICBpZiAoZGlkU2V0dGluZ3NDaGFuZ2UpIHtcbiAgICBzZXR0aW5nc0NoYW5nZVRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfVxuICByZXR1cm4gZGlkU2V0dGluZ3NDaGFuZ2U7XG59XG5cbmZ1bmN0aW9uIHNhdmVUb0Rpc2Moc3RvcmFnZSkge1xuICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldChzdG9yYWdlKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZENvbmZpZ0ZpbGVGcm9tVXJsKHVybCkge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCk7XG4gIGNvbnN0IHRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG5cbiAgcmV0dXJuIHRleHQ7XG59XG5cbmNvbnN0IGlzRW1wdHlPYmplY3QgPSAob2JqKSA9PiAhKG9iaiAmJiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCAhPT0gMCk7XG5cbmZ1bmN0aW9uIHJlYWRTZXR0aW5nc0Zyb21EaXNjKCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBjb25zb2xlLmxvZygnUmVhZCBzZXR0aW5ncyBmcm9tIGRpc2MnKTtcbiAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldChudWxsLCAoYWxsU3RvcmFnZSkgPT4ge1xuICAgICAgaWYgKGlzRW1wdHlPYmplY3QoYWxsU3RvcmFnZSkpIHtcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZmlyc3QgdXNlIG9mIHRoZSBwbHVnaW5cbiAgICAgICAgYW5hbHl0aWNzLmluc3RhbGwoKTtcbiAgICAgICAgb3BlblNldHRpbmdzUGFnZSgpO1xuICAgICAgICByZXNvbHZlKHsgLi4uREVGQVVMVF9TVE9SQUdFX09CSkVDVCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoeyAuLi5hbGxTdG9yYWdlIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZENvbmZpZ0ZpbGUoY29uZmlnRmlsZSkge1xuICB0cnkge1xuICAgIEpTT04ucGFyc2UoY29uZmlnRmlsZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdpc1ZhbGlkQ29uZmlnRmlsZSgpJywgZSk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBnZXRDb25maWcoKSB7XG4gIHJldHVybiB7IC4uLkpTT04ucGFyc2UoY2FjaGUuY29uZmlnRmlsZSkgfTtcbn1cblxuZnVuY3Rpb24gZ2V0U2V0dGluZ3NMb2FkVGltZSgpIHtcbiAgcmV0dXJuIHNldHRpbmdzTG9hZFRpbWU7XG59XG5cbmZ1bmN0aW9uIGdldFNldHRpbmdzQ2hhbmdlVGltZSgpIHtcbiAgcmV0dXJuIHNldHRpbmdzQ2hhbmdlVGltZTtcbn1cblxuZnVuY3Rpb24gaXNSZW1vdGVMb2FkaW5nRW5hYmxlZCgpIHtcbiAgcmV0dXJuIGNhY2hlLnNvdXJjZSA9PT0gJ1VSTCc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcmVsb2FkLFxuICBnZXRDb25maWcsXG4gIGdldFNldHRpbmdzTG9hZFRpbWUsXG4gIGdldFNldHRpbmdzQ2hhbmdlVGltZSxcbiAgaXNSZW1vdGVMb2FkaW5nRW5hYmxlZCxcbn07XG4iLCAiaW1wb3J0IGFuYWx5dGljcyBmcm9tICcuL2FuYWx5dGljcyc7XG5pbXBvcnQgZGF0YUxheWVyIGZyb20gJy4vZGF0YUxheWVyJztcblxuY29uc3QgeyBjaHJvbWUgfSA9IGdsb2JhbFRoaXM7XG5cbmxldCBzZXNzaW9uID0gbmV3U2Vzc2lvbk9iamVjdCgpO1xuXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICBhd2FpdCBkYXRhTGF5ZXIucmVsb2FkKCk7XG4gIHNlc3Npb24uY29uZmlnID0gZGF0YUxheWVyLmdldENvbmZpZygpO1xuICBhbmFseXRpY3MuYmFja2dyb3VuZFBhZ2V2aWV3KCk7XG5cbiAgaW5pdEV2ZW50TGlzdGVuZXJzKCk7XG5cbiAgaWYgKHNlc3Npb24uY29uZmlnLmF1dG9TdGFydCkgcGxheSgpO1xufVxuaW5pdCgpO1xuXG5mdW5jdGlvbiBuZXdTZXNzaW9uT2JqZWN0KCkge1xuICByZXR1cm4ge1xuICAgIHRhYnM6IFtdLFxuICAgIHRhYlJlbG9hZFRpbWU6IFtdLFxuICAgIGlzUm90YXRlRW5hYmxlZDogZmFsc2UsXG4gICAgbmV4dEluZGV4OiAwLFxuICAgIHRpbWVySWQ6IG51bGwsXG4gICAgcGxheVN0YXJ0VGltZTogMCxcbiAgICBjb25maWc6IHt9LFxuICB9O1xufVxuXG5mdW5jdGlvbiBpbml0RXZlbnRMaXN0ZW5lcnMoKSB7XG4gIGNocm9tZS5icm93c2VyQWN0aW9uLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcihpY29uQ2xpY2tlZCk7XG59XG5cbmZ1bmN0aW9uIGljb25DbGlja2VkKCkge1xuICBpZiAoc2Vzc2lvbi5pc1JvdGF0ZUVuYWJsZWQpIHtcbiAgICBwYXVzZSgpO1xuICB9IGVsc2Uge1xuICAgIHBsYXkoKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBwbGF5KCkge1xuICBhbmFseXRpY3MucGxheSgpO1xuXG4gIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEljb24oeyBwYXRoOiAnaW1nL1BhdXNlLTM4LnBuZycgfSk7XG4gIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFRpdGxlKHsgdGl0bGU6ICdQYXVzZSBUYWIgUm90YXRlJyB9KTtcbiAgc2Vzc2lvbiA9IG5ld1Nlc3Npb25PYmplY3QoKTtcbiAgc2Vzc2lvbi5pc1JvdGF0ZUVuYWJsZWQgPSB0cnVlO1xuICBzZXNzaW9uLnBsYXlTdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgYmVnaW5DeWNsZSh0cnVlKTtcbn1cblxuZnVuY3Rpb24gcGF1c2UoKSB7XG4gIGFuYWx5dGljcy5wYXVzZSgpO1xuXG4gIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEljb24oeyBwYXRoOiAnaW1nL1BsYXktMzgucG5nJyB9KTtcbiAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0VGl0bGUoeyB0aXRsZTogJ1N0YXJ0IFRhYiBSb3RhdGUnIH0pO1xuICBjbGVhclRpbWVvdXQoc2Vzc2lvbi50aW1lcklkKTtcbiAgc2Vzc2lvbi5pc1JvdGF0ZUVuYWJsZWQgPSBmYWxzZTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gYmVnaW5DeWNsZShpc0ZpcnN0Q3ljbGUgPSBmYWxzZSkge1xuICBjb25zb2xlLmxvZygnaXNGaXJzdEN5Y2xlJywgaXNGaXJzdEN5Y2xlKTtcbiAgbGV0IGRpZFNldHRpbmdzQ2hhbmdlID0gZmFsc2U7XG4gIGlmIChpc0ZpcnN0Q3ljbGUgfHwgaXNTZXR0aW5nc1JlbG9hZFJlcXVpcmVkKCkpIHtcbiAgICBjb25zb2xlLmxvZygnc2Vzc2lvbicsIHNlc3Npb24pO1xuICAgIGRpZFNldHRpbmdzQ2hhbmdlID0gYXdhaXQgZGF0YUxheWVyLnJlbG9hZCgpO1xuICAgIHNlc3Npb24uY29uZmlnID0gZGF0YUxheWVyLmdldENvbmZpZygpO1xuICAgIGlmIChpc0ZpcnN0Q3ljbGUgfHwgZGlkU2V0dGluZ3NDaGFuZ2UpIHtcbiAgICAgIGF3YWl0IGluaXRUYWJzKCk7XG4gICAgfVxuICB9XG4gIHJvdGF0ZVRhYkFuZFNjaGVkdWxlTmV4dFJvdGF0aW9uKGlzRmlyc3RDeWNsZSB8fCBkaWRTZXR0aW5nc0NoYW5nZSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJvdGF0ZVRhYkFuZFNjaGVkdWxlTmV4dFJvdGF0aW9uKGlzRmlyc3RDeWNsZSkge1xuICAvLyBCcmVhayBvdXQgb2YgaW5maW5pdGUgbG9vcCB3aGVuIHBhdXNlIGlzIGNsaWNrZWRcbiAgaWYgKCFzZXNzaW9uLmlzUm90YXRlRW5hYmxlZCkgcmV0dXJuO1xuXG4gIGNvbnN0IHsgcGxheVN0YXJ0VGltZSB9ID0gc2Vzc2lvbjtcbiAgYW5hbHl0aWNzLmFuYWx5dGljc0hlYXJ0YmVhdChwbGF5U3RhcnRUaW1lKTtcblxuICBjb25zdCBjdXJyZW50VGFiID0gc2Vzc2lvbi50YWJzW3Nlc3Npb24ubmV4dEluZGV4XTtcblxuICBjb25zdCBzbGVlcER1cmF0aW9uID0gc2Vzc2lvbi5jb25maWcud2Vic2l0ZXNbc2Vzc2lvbi5uZXh0SW5kZXhdLmR1cmF0aW9uO1xuXG4gIC8vIFNob3cgdGhlIGN1cnJlbnQgdGFiXG4gIGNvbnNvbGUubG9nKGBTaG93IHRhYjogJHtzZXNzaW9uLm5leHRJbmRleH1gKTtcbiAgY2hyb21lLnRhYnMudXBkYXRlKGN1cnJlbnRUYWIuaWQsIHsgYWN0aXZlOiB0cnVlIH0pO1xuXG4gIC8vIERldGVybWluZSB0aGUgbmV4dCB0YWIgaW5kZXhcbiAgc2Vzc2lvbi5uZXh0SW5kZXggKz0gMTtcbiAgaWYgKHNlc3Npb24ubmV4dEluZGV4ID49IHNlc3Npb24udGFicy5sZW5ndGgpIHtcbiAgICBzZXNzaW9uLm5leHRJbmRleCA9IDA7XG4gIH1cbiAgcHJlbG9hZFRhYihzZXNzaW9uLm5leHRJbmRleCwgaXNGaXJzdEN5Y2xlKTtcblxuICBjb25zb2xlLmxvZyhgc2xlZXAgZm9yOiAke3NsZWVwRHVyYXRpb259YCk7XG5cbiAgc2Vzc2lvbi50aW1lcklkID0gc2V0VGltZW91dChcbiAgICBzZXNzaW9uLm5leHRJbmRleCA9PT0gMFxuICAgICAgPyBiZWdpbkN5Y2xlXG4gICAgICA6ICgpID0+IHJvdGF0ZVRhYkFuZFNjaGVkdWxlTmV4dFJvdGF0aW9uKGlzRmlyc3RDeWNsZSksXG4gICAgc2xlZXBEdXJhdGlvbiAqIDEwMDAsXG4gICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXRUYWJzKCkge1xuICBjb25zdCB0YWJJZHNUb0Nsb3NlID0gYXdhaXQgZ2V0VGFic1RvQ2xvc2UoKTtcbiAgY29uc29sZS5sb2coJ3RhYklkc1RvQ2xvc2UnLCB0YWJJZHNUb0Nsb3NlKTtcbiAgYXdhaXQgaW5zZXJ0VGFicygpO1xuICBjb25zdCB7IGNsb3NlRXhpc3RpbmdUYWJzIH0gPSBzZXNzaW9uPy5jb25maWc7XG5cbiAgLy8gTmV3IGNvbmZpZyBvcHRpb246IGNsb3NlRXhpc3RpbmdUYWJzXG4gIC8vIERlZmF1bHQgaXMgZmFsc2VcbiAgLy8gQnV0IGRvbid0IGNoYW5nZSBiZWhhdmlvdXIgZm9yIGV4aXN0aW5nIHVzZXJzIGhvdyBoYXZlbid0IHNldCB0aGlzIG9wdGlvbiB5ZXRcbiAgaWYgKGNsb3NlRXhpc3RpbmdUYWJzID09PSB1bmRlZmluZWQgfHwgY2xvc2VFeGlzdGluZ1RhYnMgPT09IHRydWUpIHtcbiAgICBhd2FpdCBjbG9zZVRhYnModGFiSWRzVG9DbG9zZSk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0VGFic1RvQ2xvc2UoKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGNvbnN0IHF1ZXJ5SW5hY3RpdmVUYWJzID0ge1xuICAgICAgY3VycmVudFdpbmRvdzogdHJ1ZSxcbiAgICB9O1xuXG4gICAgY29uc3QgdGFiSWRzID0gW107XG5cbiAgICBjaHJvbWUudGFicy5xdWVyeShxdWVyeUluYWN0aXZlVGFicywgKHRhYnMpID0+IHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFicy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAvLyBjb25zdCB0YWIgPSB0YWJzW2ldO1xuXG4gICAgICAgIC8vIGlmKCF0YWIudXJsLnN0YXJ0c1dpdGgoXCJjaHJvbWU6XCIpKSB7XG4gICAgICAgIHRhYklkcy5wdXNoKHRhYnNbaV0uaWQpO1xuICAgICAgICAvLyB9XG4gICAgICB9XG5cbiAgICAgIHJlc29sdmUodGFiSWRzKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNsb3NlVGFicyh0YWJJZHMpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgY29uc29sZS5sb2coYEZ1bGxzY3JlZW46ICR7c2Vzc2lvbi5jb25maWcuZnVsbHNjcmVlbn1gKTtcblxuICAgIGlmIChzZXNzaW9uLmNvbmZpZy5mdWxsc2NyZWVuKSB7XG4gICAgICBjaHJvbWUud2luZG93cy5nZXRDdXJyZW50KHt9LCAod2luZG93KSA9PiB7XG4gICAgICAgIGNocm9tZS53aW5kb3dzLnVwZGF0ZSh3aW5kb3cuaWQsIHsgc3RhdGU6ICdmdWxsc2NyZWVuJyB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNocm9tZS50YWJzLnJlbW92ZSh0YWJJZHMsICgpID0+IHtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGluc2VydFRhYnModGFiSWRzVG9DbG9zZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBsZXQgY291bnRlciA9IDA7XG4gICAgc2Vzc2lvbi50YWJzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZXNzaW9uLmNvbmZpZy53ZWJzaXRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgbGV0IHVybCA9ICdhYm91dDpibGFuayc7XG4gICAgICBsZXQgcmVsb2FkVGltZSA9IDA7XG4gICAgICBjb25zdCB7IGxhenlMb2FkVGFicyB9ID0gc2Vzc2lvbi5jb25maWc7XG5cbiAgICAgIC8vIElzc3VlICMyN1xuICAgICAgLy8gUmVkdWNlIGNwdS9tZW1vcnkgdXNhZ2Ugb24gc3RhcnR1cFxuICAgICAgLy8gT25seSBsb2FkIHRoZSBmaXJzdCB0d28gd2ViIHBhZ2VzLCB0aGVuIGxvYWQgc3Vic2VxdWVudCBwYWdlcyBvbmUgYnkgb25lLlxuICAgICAgaWYgKCFsYXp5TG9hZFRhYnMgfHwgaSA8IDIpIHtcbiAgICAgICAgdXJsID0gc2Vzc2lvbi5jb25maWcud2Vic2l0ZXNbaV0udXJsO1xuICAgICAgICByZWxvYWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICB9XG5cbiAgICAgIC8qIGVzbGludC1kaXNhYmxlICovXG4gICAgICBpbnNlcnRUYWIodXJsLCBpLCAoaW5kZXgsIHRhYikgPT4ge1xuICAgICAgICBzZXNzaW9uLnRhYnNbaW5kZXhdID0gdGFiO1xuICAgICAgICBzZXNzaW9uLnRhYlJlbG9hZFRpbWVbaW5kZXhdID0gcmVsb2FkVGltZTtcbiAgICAgICAgY291bnRlcisrO1xuICAgICAgICBpZiAoY291bnRlciA+PSBzZXNzaW9uLmNvbmZpZy53ZWJzaXRlcy5sZW5ndGgpIHtcbiAgICAgICAgICByZXNvbHZlKHRhYklkc1RvQ2xvc2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8qIGVzbGludC1lbmFibGUgKi9cbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRUYWIodXJsLCBpbmRleE9mVGFiLCBjYWxsYmFjaykge1xuICBjaHJvbWUudGFicy5jcmVhdGUoXG4gICAge1xuICAgICAgaW5kZXg6IGluZGV4T2ZUYWIsXG4gICAgICB1cmwsXG4gICAgfSxcbiAgICAodGFiKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhgSW5zZXJ0ZWQgdGFiSWQ6ICR7dGFiLmlkfWApO1xuXG4gICAgICBjYWxsYmFjayhpbmRleE9mVGFiLCB0YWIpO1xuICAgIH0sXG4gICk7XG59XG5cbmZ1bmN0aW9uIHByZWxvYWRUYWIodGFiSW5kZXgsIGlzRmlyc3RDeWNsZSkge1xuICBpZiAoIWlzVGFiUmVsb2FkUmVxdWlyZWQodGFiSW5kZXgpICYmICFpc0ZpcnN0Q3ljbGUpIHtcbiAgICBjb25zb2xlLmxvZyhgRG8gbm90IFByZWxvYWQgdGFiOiAke3RhYkluZGV4fWApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHsgdXJsIH0gPSBzZXNzaW9uLmNvbmZpZy53ZWJzaXRlc1t0YWJJbmRleF07XG4gIGNvbnN0IHsgaWQgfSA9IHNlc3Npb24udGFic1t0YWJJbmRleF07XG5cbiAgY29uc29sZS5sb2coYFByZWxvYWQgdGFiOiAke3RhYkluZGV4fWApO1xuXG4gIGNocm9tZS50YWJzLnVwZGF0ZShcbiAgICBpZCxcbiAgICB7IHVybCB9LFxuICAgIC8vIElzc3VlIDE5IC0gUmVzZXQgdGhlIHVybCBvbiByZWxvYWQgLSBvY2Nhc2lvbmFsbHkgZXJyb3JzIGNhdXNlIGEgcmVkaXJlY3QuXG4gICAgKCkgPT4gY2hyb21lLnRhYnMudXBkYXRlKGlkLCB7IHVybCB9KSxcbiAgKTtcblxuICBzZXNzaW9uLnRhYlJlbG9hZFRpbWVbdGFiSW5kZXhdID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG59XG5cbmZ1bmN0aW9uIGlzU2V0dGluZ3NSZWxvYWRSZXF1aXJlZCgpIHtcbiAgY29uc3QgY3VycmVudFRpbWVNaWxsaXMgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgY29uc3QgbWlsbGlzU2luY2VMYXN0UmVsb2FkID1cbiAgICBjdXJyZW50VGltZU1pbGxpcyAtIGRhdGFMYXllci5nZXRTZXR0aW5nc0xvYWRUaW1lKCk7XG5cbiAgY29uc3QgcmVsb2FkSW50ZXJ2YWxNaWxsaXMgPVxuICAgIHNlc3Npb24uY29uZmlnLnNldHRpbmdzUmVsb2FkSW50ZXJ2YWxNaW51dGVzICogNjAgKiAxMDAwO1xuXG4gIGNvbnNvbGUubG9nKCdjdXJyZW50VGltZU1pbGxpcycsIGN1cnJlbnRUaW1lTWlsbGlzKTtcbiAgY29uc29sZS5sb2coJ21pbGxpc1NpbmNlTGFzdFJlbG9hZCcsIG1pbGxpc1NpbmNlTGFzdFJlbG9hZCk7XG4gIGNvbnNvbGUubG9nKCdyZWxvYWRJbnRlcnZhbE1pbGxpcycsIHJlbG9hZEludGVydmFsTWlsbGlzKTtcblxuICBpZiAoXG4gICAgZGF0YUxheWVyLmlzUmVtb3RlTG9hZGluZ0VuYWJsZWQoKSAmJlxuICAgIG1pbGxpc1NpbmNlTGFzdFJlbG9hZCA+IHJlbG9hZEludGVydmFsTWlsbGlzXG4gICkge1xuICAgIGNvbnNvbGUubG9nKCdSZWxvYWQgc2V0dGluZ3MgZnJvbSB1cmw6IHllcycpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGNvbnNvbGUubG9nKCdSZWxvYWQgc2V0dGluZ3MgZnJvbSB1cmw6IG5vJyk7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaXNUYWJSZWxvYWRSZXF1aXJlZCh0YWJJbmRleCkge1xuICBjb25zdCBjdXJyZW50VGltZU1pbGxpcyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICBjb25zdCBtaWxsaXNTaW5jZUxhc3RSZWxvYWQgPVxuICAgIGN1cnJlbnRUaW1lTWlsbGlzIC0gc2Vzc2lvbi50YWJSZWxvYWRUaW1lW3RhYkluZGV4XTtcblxuICBjb25zdCByZWxvYWRJbnRlcnZhbE1pbGxpcyA9XG4gICAgc2Vzc2lvbi5jb25maWcud2Vic2l0ZXNbdGFiSW5kZXhdLnRhYlJlbG9hZEludGVydmFsU2Vjb25kcyAqIDEwMDA7XG5cbiAgaWYgKHJlbG9hZEludGVydmFsTWlsbGlzIDw9IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKG1pbGxpc1NpbmNlTGFzdFJlbG9hZCA+IHJlbG9hZEludGVydmFsTWlsbGlzKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsTUFBTSxFQUFFLHNCQUFZO0FBQ3BCLFVBQVEsSUFBSTtBQUVaLE1BQU0sS0FBSyxJQUFJLFNBQVM7QUFDdEIsUUFBSSxZQUFZLElBQUk7QUFDbEIsa0JBQVksR0FB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

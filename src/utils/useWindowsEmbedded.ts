// composables/useWindowsEmbedded.js
import { ref } from 'vue';

export function useWindowsEmbedded() {
  const isEmbedded = ref(false);
  const environment = ref('browser'); // 'browser', 'electron', 'webview2', 'cefsharp'

  // 获取 UserAgent
  const ua = navigator.userAgent.toLowerCase();

  // 1. 判断是否为 Electron
  // Electron 通常会在 UA 中包含 "electron"，且 window 下可能有 process 对象
  const isElectron = /electron/.test(ua) || (window.process && window.process.versions && window.process.versions.electron);

  // 2. 判断是否为 WebView2 (Edge Chromium 内核)
  // WebView2 可能会注入 window.chrome.webview 对象
  const isWebView2 = !!(window.chrome && window.chrome.webview) || /edg\//.test(ua) && !/edg\//.test(ua); // 注意：普通 Edge 也有 Edg，单纯靠 UA 较难完全区分，最好靠 window对象

  // 3. 判断是否为 CefSharp (WinForms/WPF 常用)
  // 默认 UA 往往包含 CefSharp，或者通过 window.CefSharp 对象判断
  const isCefSharp = /cefsharp/.test(ua) || !!window.CefSharp;

  // 4. 通用 Windows 内嵌判断 (包含上述所有)
  if (isElectron) {
    isEmbedded.value = true;
    environment.value = 'electron';
  } else if (isWebView2 || (window.chrome && window.chrome.webview)) {
    // 再次确认：只有 WebView2 会有 window.chrome.webview
    isEmbedded.value = true;
    environment.value = 'webview2';
  } else if (isCefSharp) {
    isEmbedded.value = true;
    environment.value = 'cefsharp';
  } else {
    // 兜底检测：有些老旧壳子会自定义 UA 包含 "wv"
    if (/windows/.test(ua) && /wv/.test(ua)) {
      isEmbedded.value = true;
      environment.value = 'generic-webview';
    }
  }

  return {
    isEmbedded,
    environment
  };
}

chrome.runtime.onInstalled.addListener(() => {
  // chrome.contextMenus.create({
  //   id: "translateToEnglish",
  //   title: "Translate to English",
  //   contexts: ["selection"]
  // });
  chrome.contextMenus.create({
    id: "translateFromLatin",
    title: "Add Latin vocab",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translateFromLatin" || info.menuItemId === "translateToChinese") {
    const word = info.selectionText;
    const targetLang = info.menuItemId === "translateToEnglish" ? "en" : "zh-CN";
    
    const url = `https://en.wiktionary.org/wiki/${word}#Latin`;
    (async () => {
      const newTab = await chrome.tabs.create({ url: url });
      const tabId = newTab.id;
      if (!newTab.url) await onTabUrlUpdated(tabId);
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: fetchTranslationFromWikitionary
      });
      if (results && results[0] && results[0].result) {
        const translation = results[0].result;
        console.log(`Translation to ${targetLang === "en" ? "English" : "Chinese"}:`, translation);
      }
      //chrome.tabs.remove(tabId);
    })();
  }
});

function onTabUrlUpdated(tabId) {
  return new Promise((resolve, reject) => {
    const onUpdated = (id, info) => id === tabId && info.url && done(true);
    const onRemoved = id => id === tabId && done(false);
    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.tabs.onRemoved.addListener(onRemoved);
    function done(ok) {
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.tabs.onRemoved.removeListener(onRemoved);
      (ok ? resolve : reject)();
    }
  });
}

async function fetchTranslationFromWikitionary() {
  // Fetch the HTML content of the page
  const response = await fetch(window.location.href);
  const text = await response.text();
  // Create a new DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');

  // Locate the specific part of the page with the Latin definition
  const latinSection = Array.from(doc.querySelectorAll('h2')).find(h2 => h2.textContent.trim() === 'Latin');
  console.log(latinSection)
  if (!latinSection) {
      throw new Error('Latin section not found');
  }

  // Find the first <li> under the Latin section
  let nextElement = latinSection.nextElementSibling;
  while (nextElement && nextElement.tagName.toLowerCase() !== 'ol') {
    console.log(nextElement)
      nextElement = nextElement.nextElementSibling;
  }  
  if (!nextElement) {
    throw new Error('No <ol> element found after Latin section');
  }
  const firstLi = nextElement.querySelector('li');
  console.log(firstLi)
  if (firstLi) {
      return firstLi.textContent.trim();
  } else {
      throw new Error('No <li> found within the <ol> element');
  }
  // } catch (error) {
  //   console.log(error)
  //   console.error("Error fetching translation:", error);
  //   return { detectedLanguage: "Unknown", translation: "Error fetching translation" };
  // }
}
async function fetchTranslationFromDeepL(){
  const response = await fetch(window.location.href);
  const text = await response.text();
  // Create a new DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
}
let vocab = {}
let def;
let usingLocal = true;
document.getElementById('selectLanguage').addEventListener('change', function() {
  let selectedLanguage = this.value;  // Get the selected value
  let word = document.getElementById('word').value.trim();
  const selectedOption = this.options[this.selectedIndex];  
  for (let option of this.options) {
    option.removeAttribute('selected');
  }
  chrome.storage.sync.set({lastLang:selectedLanguage});
    selectedOption.setAttribute('selected', 'true');
});
document.getElementById('addVocabForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const language = document.getElementById('selectLanguage').value;
  let word = document.getElementById('word').value.trim();
  const definition = document.getElementById('definition').value.trim();
  const book = document.getElementById('bookSelector').value;
  const pronounciation = document.getElementById('pronounciation').value;
  const gender = document.getElementById('gender').value;
  chrome.storage.local.set({ lastBook: book }, function() {});

  if(definition && definition!=""){
    chrome.storage.local.get('vocabList', function(data) {
      let vocabList = data.vocabList || [];
      // Append the new word, definition, and snoozed field
      vocabList.push({ word, definition, snoozed: false , book, gender,pronounciation,seen: 0, quizResults: ['n','n','n','n']});
      chrome.storage.local.set({ lastBook: book }, function() {});
      // Save updated vocab list to Chrome storage
      chrome.storage.local.set({ vocabList: vocabList }, function() {
        chrome.storage.sync.get('bookList', function(data) {
          let bookList = data.bookList || [];
          if(!bookList.includes(book)){
            bookList.push(book);
          }
          chrome.storage.sync.set({ vocabList: vocabList }, function(data) {})
    
        })
        // Show a message indicating the word was added
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = `The word "${word}" has been added to the list.`;
  
        // Clear form fields
        document.getElementById('addVocabForm').reset();
  
        // Clear the message after a few seconds
        setTimeout(() => {
          messageDiv.textContent = '';
        }, 3000);
      });
    });
  }else{
    word = removeDiacritics(word)
    url = usingLocal?`http://localhost:3000/fetch/${word}`:`https://en.wiktionary.org/wiki/${word}`
    fetch(url)
    .then(response => response.text())
    .then(html => {
      // Parse the returned HTML and extract the inflection table
       const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            if (language == "latin"){
              getLatinAttributes(doc,word);
            } else if(language == 'german'){
              getGermanAttributes(doc,word);
            } else{
              getLinkedAttributes(doc,word,language)
            }
    })
    updateLanguageList(language);
  }
  populateBookSelector();


});
function updateLanguageList(lang){
  chrome.storage.sync.get({ languageList: {}}, (data) => {

    let languageList = data.languageList|| {};
    if(languageList[lang]){
      languageList[lang]+=1
    }else{
      languageList[lang]=1
    }
    chrome.storage.sync.set({languageList:languageList }, function() {
      console.log(languageList)
    });
  });
}
function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function getLatinAttributes(doc,word){
  const book = document.getElementById('bookSelector').value;
  const pronounciation = document.getElementById('pronounciation').value;
  const gender = document.getElementById('gender').value;
  let conjugations = {};
  document.getElementById('vocabInfo').innerHTML=""
  vocab = {}
  let verbInflectionTable;
  let iTableLocator = doc.querySelector('.inflection-table.vsSwitcher tbody tr th i[lang="la"]');
  if(iTableLocator){
    let th = iTableLocator.parentElement;
    let tr = th.parentElement;
    let tbody = tr.parentElement;
    verbInflectionTable=tbody.parentElement;
  }

  if (verbInflectionTable) {
    let anchorElement = doc.querySelector('#mw-content-text > div.mw-content-ltr.mw-parser-output > table > tbody > tr:nth-child(1) > th a[href]');
    if(!anchorElement){
       document.getElementById('VocabInfo').innerHTML += "No such words"
    }
    conjugations.group=anchorElement.textContent;
    let definition = ""
    const paragraph = doc.querySelector('p span > strong[lang="la"].Latn.headword');
    if (paragraph) {
      const parentParagraph = paragraph.closest('p');
      const nextOl = parentParagraph.nextElementSibling;
      if (nextOl) {
        const firstListItem = nextOl.querySelector('li');
        firstListItem.querySelectorAll('span, dl,ul').forEach(el => el.remove());
        rawDef = firstListItem.textContent.trim();
        if(rawDef.includes('.mw')){
          definition= rawDef.slice(0, definition.indexOf('.mw')).trim();
        }else{
          definition= rawDef.trim();
        }
      }
    }
    let conjugationText = conjugations.group;
    // Select the <span> element
    let spanElements = doc.querySelectorAll('span.Latn.form-of.lang-la');
    conjugations.pos = 'verb'
    conjugations.number = {singular:[],plural:[]}
    conjugations.person = {first:[],second:[],third:[]}
    conjugations.tense = {pres:[],impf:[],perf:[],fut:[],plup:[],futp:[],sigm:[],aor:[]}
    conjugations.voice = {act:[],pass:[]}
    conjugations.mood = {ind:[],sub:[],imperative:[]}
    conjugations.form = {inf:[],part:[]}
    conjugations.noun = {ger:[],sup:[]}
    conjugations.case = {gen:[],abl:[],acc:[],dat:[]} 
    spanElements.forEach((spanElement) => {
      let childText = spanElement.firstElementChild.textContent;
      if(spanElement.className.includes('1')){conjugations.person.first.push(childText);}
      if(spanElement.className.includes('2')){conjugations.person.second.push(childText);}
      if(spanElement.className.includes('3')){conjugations.person.third.push(childText);}
      if(spanElement.className.includes('|s|')){conjugations.number.singular.push(childText);
      }if(spanElement.className.includes('|p|')){conjugations.number.plural.push(childText);
      }if(spanElement.className.includes('pres')){ conjugations.tense.pres.push(childText);
      }if(spanElement.className.includes('impf')){conjugations.tense.impf.push(childText);
      }if(spanElement.className.includes('fut')){conjugations.tense.fut.push(childText);
      }if(spanElement.className.includes('perf')){conjugations.tense.perf.push(childText);
      }if(spanElement.className.includes('plup')){conjugations.tense.plup.push(childText);
      }if(spanElement.className.includes('futp')){conjugations.tense.futp.push(childText);
      }if(spanElement.className.includes('sigm')){conjugations.tense.sigm.push(childText);
      }if(spanElement.className.includes('aor')){conjugations.tense.aor.push(childText);
      }if(spanElement.className.includes('act')){conjugations.voice.act.push(childText);
      }if(spanElement.className.includes('pass')){conjugations.voice.pass.push(childText);
      }if(spanElement.className.includes('ind')){conjugations.mood.ind.push(childText);
      }if(spanElement.className.includes('sub')){conjugations.mood.sub.push(childText);
      }if(spanElement.className.includes('imp-form-of')){conjugations.mood.imperative.push(childText);
      }if(spanElement.className.includes('inf')){conjugations.form.inf.push(childText);
      }if(spanElement.className.includes('part')){conjugations.form.part.push(childText);
      }if(spanElement.className.includes('gen')){conjugations.case.gen.push(childText);
      }if(spanElement.className.includes('ger')){conjugations.noun.ger.push(childText);
      }if(spanElement.className.includes('dat')){conjugations.case.dat.push(childText);
      }if(spanElement.className.includes('acc')){conjugations.case.acc.push(childText);
      }if(spanElement.className.includes('sup')){conjugations.noun.sup.push(childText);
      }if(spanElement.className.includes('abl')){conjugations.case.abl.push(childText);
      }
    });
    const vocabInfo = document.getElementById('vocabInfo');
    vocab = {word,definition,snoozed: false,book,pronounciation,gender,conjugations,seen:0,quizResults: ['n','n','n','n']}
    vocabInfo.textContent=""
    vocabInfo.textContent+=" word: "+vocab.word
    vocabInfo.textContent+="| \n definition: "+vocab.definition
    vocabInfo.textContent+=" |\n group: "+vocab.conjugations.group
    vocabInfo.textContent+="| \n collection: "+vocab.book
    conjugations.type = 'latin';
    document.getElementById("addAuto").style.display = 'block'

    }
  else {
    const nounInflectionTable = doc.querySelector('table.inflection-table-la');
    if(nounInflectionTable){
      const conjugations = {}
      let declension = ""
      const declensionElements = doc.querySelectorAll('a[href^="/wiki/Appendix:Latin_"][href*="declension"]');
     
      if(declensionElements){
        const declensionElementsLength = declensionElements.length/2
        for(let i = 0;i<declensionElementsLength;i++){
          declension+=declensionElements[i].textContent
        }
        declension = declension.replaceAll("firstsecond","first&second").replaceAll("-"," ")
        conjugations.group = declension
      }
      const queryWord = 'strong.Latn.headword[lang="la"]'
      const isWord = doc.querySelector(queryWord);
      let autoGender = ''
      if(isWord){
        const grannyElement = isWord.parentElement.parentElement;
        const genderSpan = grannyElement.querySelector("span.gender");
        if(genderSpan){
          console.log(genderSpan)
          const genderDef = genderSpan.firstChild.textContent;
          console.log(genderDef);
          switch(genderDef){
            case 'f':
              autoGender = 'feminine'
              break;
            case 'm':
              autoGender = 'masculine'
              break;
            case 'n':
              autoGender = 'neuter'
              break;
            default:
              break;
          }
        }
      }
      let closestOl = null;
      const latinHeading = doc.querySelector('h2#Latin');
      const closestDiv = latinHeading.closest('div');
      let sibling = closestDiv.nextElementSibling;
      while (sibling) {
        // If an <ol> is found, assign it to closestOl and break out of the loop
        if (sibling.tagName.toLowerCase() === 'ol') {
            closestOl = sibling;
            break;
        }
        sibling = sibling.nextElementSibling; // Move to the next sibling
      }
      const firstListItem = sibling.querySelector('li');
      firstListItem.querySelectorAll('dl,ul').forEach(el => el.remove());
      definition = firstListItem.textContent.trim();
      conjugations.number = {singular:[],plural:[]}
      conjugations.case = {nom:[],gen:[],dat:[],acc:[],abl:[],voc:[]}
      let spanElements = doc.querySelectorAll('span.Latn.form-of.lang-la');
      spanElements.forEach((spanElement) => {
        let childText = spanElement.firstElementChild.textContent;
        if(spanElement.className.includes('s-')){conjugations.number.singular.push(childText);
        }if(spanElement.className.includes('p-')){conjugations.number.plural.push(childText);
        }if(spanElement.className.includes('nom')){conjugations.case.nom.push(childText);
        }if(spanElement.className.includes('gen')){conjugations.case.gen.push(childText);
        }if(spanElement.className.includes('dat')){conjugations.case.dat.push(childText);
        }if(spanElement.className.includes('acc')){conjugations.case.acc.push(childText);
        }if(spanElement.className.includes('abl')){conjugations.case.abl.push(childText);
        }if(spanElement.className.includes('voc')){conjugations.case.voc.push(childText);
        }
      });
      conjugations.type = 'latin';
      const vocabInfo = document.getElementById('vocabInfo');
      vocab = {word,definition,snoozed: false,book,pronounciation,gender:autoGender?autoGender:gender,conjugations,seen:0,quizResults: ['n','n','n','n']}
      vocabInfo.textContent=""
      vocabInfo.textContent+=" word: "+vocab.word
      vocabInfo.textContent+="| \n definition: "+vocab.definition
      if(autoGender){
      vocabInfo.textContent+="| \n gender: "+autoGender
      }
      vocabInfo.textContent+="| \n group: "+vocab.conjugations.group
      vocabInfo.textContent+="| \n collection: "+vocab.book
      vocab = {word,definition,snoozed: false,book,pronounciation,gender:autoGender?autoGender:gender,conjugations,seen:0,quizResults: ['n','n','n','n']}

      conjugations.type = 'latin';
      document.getElementById("addAuto").style.display = 'block'
      console.log(vocab)
     }else{
      const latinElement = doc.querySelector('i.Latn.mention[lang="la"]');
      if(latinElement){
        const anchorTag = latinElement.querySelector('a');
        if (anchorTag) {
          const linkText = anchorTag.textContent; // Get the text content of the <a>
          console.log("Anchor text:", linkText);
          const spanElement = latinElement.parentElement;
          const spanElement1 = spanElement.parentElement;
          const liElement = spanElement1.parentElement;
          let definition = ""
          if(liElement){
            definition = liElement.textContent.trim()
          }
          definition+=","
        let noramlizedWord = word.normalize('NFD');
        let noDiacritics = noramlizedWord.replace(/[\u0300-\u036f]/g, "");
        let finalStr = noDiacritics.replace(/-/g, "");
 
        if(finalStr.trim()!=linkText.trim())  {
          url = usingLocal?`http://localhost:3000/fetch/${linkText}`:`https://en.wiktionary.org/wiki/${linkText}`
          fetch(url)
          .then(response => response.text())
          .then(html => {
            // Parse the returned HTML and extract the inflection table
            const parser = new DOMParser();
            const baseDoc = parser.parseFromString(html, 'text/html');
            console.log(linkText)
            getLatinAttributes(baseDoc,linkText);
          })
        }else{
          document.getElementById('vocabInfo').style.display = 'block'
      document.getElementById('vocabInfo').innerHTML = 'invalid word(either is one of the special words, does not exist in latin or does not have a normal conjugation table or is not in base form.)'
        }
      }
    }else{
      const isLatinWord = doc.querySelector('strong.Latn.headword[lang="la"]');
      if(isLatinWord){
       getEasyAttributes(doc,word,"la")
      }else{
        document.getElementById('vocabInfo').style.display = 'block'
        document.getElementById('vocabInfo').innerHTML = 'invalid word(either does not exist in latin or does not have a normal conjugation table or is not in base form.)'
      }
      
      }
    }
  }
}
async function getLinkedAttributes(doc,word,lang){
  document.getElementById('vocabInfo').innerHTML = ""
  document.getElementById('vocabInfoInfs').innerHTML = ""
  const book = document.getElementById('bookSelector').value;
  const pronounciation = document.getElementById('pronounciation').value;
  const gender = document.getElementById('gender').value;
  const baseFormQuery = 'span.form-of-definition-link i[class="Latn mention"][lang="'+lang+'"]'
  const hasBaseForm = doc.querySelector(baseFormQuery);
  if(hasBaseForm){
    console.log(hasBaseForm)
    const anchorTag = hasBaseForm.querySelector('a');
    if (anchorTag) {
      const linkText = anchorTag.textContent; // Get the text content of the <a>
      console.log("Anchor text:", linkText);
      document.getElementById('vocabInfoInfs').style.display = 'block'
      const spanElement = hasBaseForm.parentElement;
      const spanElement1 = spanElement.parentElement;
      const liElement = spanElement1.parentElement;
      let definition = ""
      if(liElement){
        const firstInflection = liElement.querySelector('ol')
        if(firstInflection){
          const inflectionDescription = firstInflection.querySelector('li')
          console.log(inflectionDescription)
          definition+=inflectionDescription.textContent.trim()
        }else{
          definition = liElement.textContent.trim()
        }
      }
      document.getElementById('vocabInfoInfs').innerHTML += definition
      document.getElementById('vocabInfoInfs').innerHTML+= String.fromCodePoint(0x1F4A0);
    let noramlizedWord = word.normalize('NFD');
    let noDiacritics = noramlizedWord.replace(/[\u0300-\u036f]/g, "");
    let finalStr = noDiacritics.replace(/-/g, "");
    let baseDoc;
    if(finalStr.trim()!=linkText.trim())  {
      url = usingLocal?`http://localhost:3000/fetch/${linkText}`:`https://en.wiktionary.org/wiki/${linkText}`
      fetch(url)
      .then(response => response.text())
      .then(html => {
        // Parse the returned HTML and extract the inflection table
        const parser = new DOMParser();
        baseDoc = parser.parseFromString(html, 'text/html');
        getEasyAttributes(baseDoc,linkText,lang);
      })
      setTimeout(() => {
        document.getElementById("vocabInfo").textContent+","+definition
        definition = document.getElementById("vocabInfo").textContent+","+definition
        vocab = {word,definition,snoozed: false,book,pronounciation,gender,seen:0,quizResults: ['n','n','n','n']}
        console.log(vocab)
        console.log('This runs after 0.05 second');
    }, 50);
      
    }
   
  }
  }else{ 
    console.log("is base form")
    getEasyAttributes(doc,word,lang)
  }
}
async function getEasyAttributes(doc,word,lang){
  
  document.getElementById('vocabInfo').innerHTML = ''
  document.getElementById('vocabInfo').style.display = ""
  console.log(word)
  const book = document.getElementById('bookSelector').value;
  const pronounciation = document.getElementById('pronounciation').value;
  const gender = document.getElementById('gender').value;
  const queryWord = 'strong.Latn.headword[lang="'+lang+'"]'
  const isWord = doc.querySelector(queryWord);
  if(isWord){
    console.log(isWord)
    const grannyElement = isWord.parentElement.parentElement;
    const closestOl = grannyElement.nextElementSibling;
    const liElement = closestOl.querySelector("li"); // Get the text content of the <a>
    console.log(liElement)
    document.getElementById('vocabInfo').style.display = 'block'
    let definition = ""
    if(liElement){
      liElement.querySelectorAll('dl,u,span').forEach(el => el.remove());
      definition = liElement.textContent.trim()
      definition = definition.replace(/ *\([^)]*\) */g, "");
    }
    let autoGender = ''
    const genderSpan = grannyElement.querySelector("span.gender");
    if(genderSpan){
      console.log(genderSpan)
      const genderDef = genderSpan.firstChild.textContent;
      console.log(genderDef);
      switch(genderDef){
        case 'f':
          autoGender = 'feminine'
          break;
        case 'm':
          autoGender = 'masculine'
          break;
        case 'n':
          autoGender = 'neuter'
          break;
        default:
          break;
      }
    }
    baseDef = definition
    definition = definition.split(";")[0];
    document.getElementById('vocabInfo').innerHTML += definition
    document.getElementById('vocabInfo').innerHTML += autoGender?(","+autoGender):""

    vocab = {word,definition,snoozed: false,book,pronounciation,gender:autoGender?autoGender:gender,seen:0,quizResults: ['n','n','n','n']}
    console.log(vocab)
    document.getElementById("addAuto").style.display = 'block'
  }else{
    document.getElementById('vocabInfo').style.display = 'block'
    document.getElementById('vocabInfo').innerHTML = 'invalidaaaaaaaaaaaaaaaaaaa word for' + formatLanguage(lang)
    document.getElementById('vocabInfo').innerHTML = "word could be a special one, or doesnot exist in the language"
  }
}
document.getElementById('manageButton').addEventListener('click', function() {
  chrome.tabs.create({ url: 'manageVocab/manageVocab.html' });
});
function formatLanguage(str){
  switch (str) {
    case "la":
      return "Latin"
    case "de":
      return "German"
  }
}
function getGermanAttributes(doc,word){
  getLinkedAttributes(doc,word,"de")
  }
function populateBookSelector() {
  chrome.storage.sync.get({ bookList: [] }, (result) => {
    const bookList = result.bookList||["Default"];
    chrome.storage.local.get('lastBook', function(data) {
      const lastBook = data.lastBook||"Default";
      console.log(lastBook)
    if(lastBook){
        document.getElementById('bookSelector').innerHTML = ""
    if(lastBook!=""||lastBook==="addNew"){
      optionNewSelected = document.createElement('option');
      optionNewSelected.innerHTML = `<option value=${lastBook} selected = selected>${lastBook}</option>`;
      document.getElementById('bookSelector').add(optionNewSelected)
    }
    // Clear existing options except for the default option
    // Add books as options
    bookList.forEach(book => {
        let option = document.createElement('option');
        if(book === data.lastBook){
        }else{
          option.innerHTML = `<option value='${book}'>${book}</option>`;
          document.getElementById('bookSelector').add(option);
        }
      });
      }
    });
    
  });
}
document.addEventListener('DOMContentLoaded', (event) => {
  const selectLanguage = document.getElementById('selectLanguage');
  chrome.storage.sync.get('languageList',function(data){
    if(data.languageList){
      console.log(data.languageList)
      let optionsArray = Array.from(selectLanguage.options);
      optionsArray.sort((a, b) => {
        const valueA = data.languageList[a.value] || 0;  // default to 0 if not in the dictionary
        const valueB = data.languageList[b.value] || 0;  // default to 0 if not in the dictionary
        return valueB - valueA;  // Descending order
      });
      selectLanguage.innerHTML = '';
      console.log(optionsArray)
      optionsArray.forEach(option => {
        selectLanguage.add(option);
      });
    }

  });
  chrome.storage.sync.get('lastLang',function(data){
    const lastLang = data.lastLang||"latin"
    for (let i = 0; i < selectLanguage.options.length; i++) {
      if (selectLanguage.options[i].value === lastLang) {
        selectLanguage.options[i].selected = true;  // Mark as selected
        break;  // Exit the loop once the correct option is found
      }
    }
  });
  chrome.storage.sync.get('hideBox',function(data){
    if (!data.hideBox||typeof(data.hideBox)===undefined||data.hideBox == null){
      document.getElementById('tipsBox').style.display='block';
    }else{
      document.getElementById('tipsBox').style.display='none';
    }      
    console.log(data.hideBox)

  });
  chrome.storage.sync.get('hideBox0',function(data){
    if (!data.hideBox0||typeof(data.hideBox0)===undefined||data.hideBox0 == null){
      document.getElementById('tipsBox0').style.display='block';
    }else{
      document.getElementById('tipsBox0').style.display='none';
    } 
    console.log(data.hideBox0)

  });
  document.getElementById('hideTips').addEventListener('click', function(e) {
    document.getElementById('tipsBox').style.display='none';
    chrome.storage.sync.set({ hideBox: true }, function(data) {})
  })
  document.getElementById('hideTips0').addEventListener('click', function(e) {
    document.getElementById('tipsBox0').style.display='none';
    chrome.storage.sync.set({ hideBox0: true }, function(data) {})
  })


  
  const bookSelector = document.getElementById('bookSelector');
  const newBookField = document.getElementById('newBookField');
  const addBookButton = document.getElementById('addBookButton');
  const newBookInput = document.getElementById('newBook');
  bookSelector.addEventListener('change', () => {
    if (bookSelector.value === 'addNew') {
      newBookField.style.display = 'block';
    } else {
      newBookField.style.display = 'none';
    }
  });
  addBookButton.addEventListener('click', () => {
    const newBook = newBookInput.value.trim();
    if (newBook) {
        chrome.storage.sync.get({ bookList: [] }, (result) => {
            const bookList = result.bookList;
            if (!bookList.includes(newBook)) {
                bookList.push(newBook);
                chrome.storage.sync.set({ bookList }, () => {
                    alert(`"${newBook}" has been added to the book list.`);
                    newBookInput.value = '';
                    populateBookSelector()
                });
            } else {
                alert(`"${newBook}" is already in the book list.`);
            }
        });
    }
  });
  populateBookSelector()
});
document.getElementById("autoAdd").addEventListener("click", function() {
  chrome.tabs.create({ url: 'inflections/inflections.html' });
});
document.getElementById('addAuto').addEventListener('click', function(e) {
  console.log(vocab)
  const book = document.getElementById('bookSelector').value;
  chrome.storage.local.get('vocabList', function(data) {
    let vocabList = data.vocabList || [];
    // Append the new word, definition, and snoozed field
    vocabList.push(vocab);
    chrome.storage.local.set({ lastBook: book }, function() {});
    // Save updated vocab list to Chrome storage
    chrome.storage.local.set({ vocabList: vocabList }, function() {
      chrome.storage.sync.get('bookList', function(data) {
        let bookList = data.bookList || [];
        if(!bookList.includes(book)){
          bookList.push(book);
        }
        chrome.storage.sync.set({ vocabList: vocabList }, function(data) {})
  
      })
      // Show a message indicating the word was added
      const messageDiv = document.getElementById('message');
      messageDiv.textContent = `The word has been added to the list.`;

      // Clear form fields
      document.getElementById('addVocabForm').reset();

      // Clear the message after a few seconds
      setTimeout(() => {
        messageDiv.textContent = '';
      }, 3000);
    });
  });
});

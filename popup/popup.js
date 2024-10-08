let vocab = {}
let def;
document.getElementById('addVocabForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  let word = document.getElementById('word').value.trim();
  const definition = document.getElementById('definition').value.trim();
  const book = document.getElementById('bookSelector').value;
  const pronounciation = document.getElementById('pronounciation').value;
  const gender = document.getElementById('gender').value;
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
    word = word.replaceAll('ō', 'o').replaceAll('ā', 'a').replaceAll('ī', 'i').replaceAll('ā', 'a')
    fetch(`http://localhost:3000/fetch/${word}`)
    .then(response => response.text())
    .then(html => {
      // Parse the returned HTML and extract the inflection table
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      getLatinAttributes(doc,word);
    })
  }

  populateBookSelector();
});
function getLatinAttributes(doc,word){
  const book = document.getElementById('bookSelector').value;
  const pronounciation = document.getElementById('pronounciation').value;
  const gender = document.getElementById('gender').value;
  let conjugations = {};
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
       document.getElementById('result').innerHTML += "No such words"
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
      vocab = {word,definition,snoozed: false,book,pronounciation,gender,conjugations,seen:0,quizResults: ['n','n','n','n']}
      vocabInfo.textContent=""
      vocabInfo.textContent+=" word: "+vocab.word
      vocabInfo.textContent+="| \n definition: "+vocab.definition
      vocabInfo.textContent+="| \n group: "+vocab.conjugations.group
      vocabInfo.textContent+="| \n collection: "+vocab.book

      conjugations.type = 'latin';
      document.getElementById("addAuto").style.display = 'block'

     }const latinElement = doc.querySelector('i.Latn.mention[lang="la"]');
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
         fetch(`http://localhost:3000/fetch/${linkText}`)
         .then(response => response.text())
         .then(html => {
           // Parse the returned HTML and extract the inflection table
           const parser = new DOMParser();
           const baseDoc = parser.parseFromString(html, 'text/html');
           getLatinAttributes(baseDoc,linkText);
         })
       }
      
     }
   }else{
     //if()
     document.getElementById('result').style.display = 'block'
     document.getElementById('result').innerHTML = 'invalid word(either does not exist in latin or does not have a normal conjugation table or is not in base form.)'
   }
  }
}
document.getElementById('manageButton').addEventListener('click', function() {
  chrome.tabs.create({ url: 'manageVocab/manageVocab.html' });
});

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
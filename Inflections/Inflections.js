let vocab = {}
let baseDef = {}
document.getElementById('selectLanguage').addEventListener('change', function() {
    let selectedLanguage = this.value;  // Get the selected value
    let word = document.getElementById("wikiEntry").value;
    getConjugation(word,selectedLanguage);
  });

  document.getElementById('lookupButton').addEventListener('click', function() {
    const wordRaw = document.getElementById('wikiEntry').value;
    const language = document.getElementById('selectLanguage').value;
    const word = wordRaw.replaceAll('ō', 'o').replaceAll('ā', 'a')
    document.getElementById('wrongDef').style.display="block";
    console.log(word,language)
    if (word && language) {
        // Call the backend server instead of Wiktionary directly
        fetch(`http://localhost:3000/fetch/${word}`)
          .then(response => response.text())
          .then(html => {
            // Parse the returned HTML and extract the inflection table
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            if (language == "latin"){
              getLatinAttributes(doc,word);
            }
          })
      } else {
        alert('Please enter a word and select a language.');
      }});
    
function getLatinAttributes(doc,word){
  //try{
  document.getElementById('submit').display = 'none'
  document.getElementById('result').innerHTML = '';
  document.getElementById('resultForInfs').innerHTML = '';
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
    baseDef = definition
    console.log(definition)
    let conjugationText = conjugations.group;
    // Select the <span> element
    let spanElements = doc.querySelectorAll('span.Latn.form-of.lang-la');
    conjugations.pos = 'verb'
    conjugations.number = {singular:[],plural:[]}
    conjugations.person = {first:[],second:[],third:[]}
    conjugations.tense = {present:[],imperfect:[],perfect:[],future:[],pluperfect:[],futurePerfect:[],sigmaticFuture:[],aorist:[]}
    conjugations.voice = {active:[],passive:[]}
    conjugations.mood = {indicative:[],subjunctive:[],imperative:[]}
    conjugations.form = {infinitive:[],participle:[]}
    conjugations.noun = {gerundive:[],supine:[]}
    conjugations.case = {genitive:[],ablative:[],accusative:[],dative:[]}

    spanElements.forEach((spanElement) => {
      let childText = spanElement.firstElementChild.textContent;
      if(spanElement.className.includes('1')){conjugations.person.first.push(childText);}
      if(spanElement.className.includes('2')){conjugations.person.second.push(childText);}
      if(spanElement.className.includes('3')){conjugations.person.third.push(childText);}
      if(spanElement.className.includes('|s|')){conjugations.number.singular.push(childText);
      }if(spanElement.className.includes('|p|')){conjugations.number.plural.push(childText);
      }if(spanElement.className.includes('pres')){ conjugations.tense.present.push(childText);
      }if(spanElement.className.includes('impf')){conjugations.tense.imperfect.push(childText);
      }if(spanElement.className.includes('fut')){conjugations.tense.future.push(childText);
      }if(spanElement.className.includes('perf')){conjugations.tense.perfect.push(childText);
      }if(spanElement.className.includes('plup')){conjugations.tense.pluperfect.push(childText);
      }if(spanElement.className.includes('futp')){conjugations.tense.futurePerfect.push(childText);
      }if(spanElement.className.includes('sigm')){conjugations.tense.sigmaticFuture.push(childText);
      }if(spanElement.className.includes('aor')){conjugations.tense.aorist.push(childText);
      }if(spanElement.className.includes('act')){conjugations.voice.active.push(childText);
      }if(spanElement.className.includes('pass')){conjugations.voice.passive.push(childText);
      }if(spanElement.className.includes('ind')){conjugations.mood.indicative.push(childText);
      }if(spanElement.className.includes('sub')){conjugations.mood.subjunctive.push(childText);
      }if(spanElement.className.includes('imp-form-of')){conjugations.mood.imperative.push(childText);
      }if(spanElement.className.includes('inf')){conjugations.form.infinitive.push(childText);
      }if(spanElement.className.includes('part')){conjugations.form.participle.push(childText);
      }if(spanElement.className.includes('gen')){conjugations.case.genitive.push(childText);
      }if(spanElement.className.includes('ger')){conjugations.noun.gerundive.push(childText);
      }if(spanElement.className.includes('dat')){conjugations.case.dative.push(childText);
      }if(spanElement.className.includes('acc')){conjugations.case.accusative.push(childText);
      }if(spanElement.className.includes('sup')){conjugations.noun.supine.push(childText);
      }if(spanElement.className.includes('abl')){conjugations.case.ablative.push(childText);
      }
    });
    document.getElementById('submit').style.display = 'block'
    document.getElementById('result').innerHTML += "<br />";
    document.getElementById('result').innerHTML +=  `<span style="font-size: 20px;">group:${conjugationText},</span>`
    document.getElementById('result').innerHTML +=  `<span style="font-size: 20px;">definition${definition}</span>`
    document.getElementById('result').innerHTML += "<br />";
    document.getElementById('result').innerHTML += verbInflectionTable.outerHTML;
    conjugations.type = 'latin';
    vocab = {word,definition,snoozed: false,book,pronounciation,gender,conjugations,seen:0,quizResults: ['n','n','n','n']}
    console.log(vocab)
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
        declension= declension.slice(0, declension.indexOf(' ')).trim();
        conjugations.group = declension
        document.getElementById('result').innerHTML +=  `<span style="font-size: 20px; display:"block";margin-left:5%>declension: ${declension}</span>`
      }
      let closestOl = null;
      const latinHeading = doc.querySelector('h2#Latin');
      const closestDiv = latinHeading.closest('div');
      console.log(closestDiv)
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
      conjugations.case = {nominative:[],genitive:[],dative:[],accusative:[],ablative:[],vocative:[]}
      let spanElements = doc.querySelectorAll('span.Latn.form-of.lang-la');
      spanElements.forEach((spanElement) => {
        let childText = spanElement.firstElementChild.textContent;
        if(spanElement.className.includes('s-')){conjugations.number.singular.push(childText);
        }if(spanElement.className.includes('p-')){conjugations.number.plural.push(childText);
        }if(spanElement.className.includes('nom')){conjugations.case.nominative.push(childText);
        }if(spanElement.className.includes('gen')){conjugations.case.genitive.push(childText);
        }if(spanElement.className.includes('dat')){conjugations.case.dative.push(childText);
        }if(spanElement.className.includes('acc')){conjugations.case.accusative.push(childText);
        }if(spanElement.className.includes('abl')){conjugations.case.ablative.push(childText);
        }if(spanElement.className.includes('voc')){conjugations.case.vocative.push(childText);
        }
      });
      baseDef = definition
      conjugations.type = 'latin';
      conjugations.pos = 'noun';
      document.getElementById('submit').style.display = 'block'
      document.getElementById('wrongDef').style.display = 'block'

      document.getElementById('result').innerHTML +=  `<span style="font-size: 20px;display:"block";margin-left:5%>,definition:${definition}</span>`
      document.getElementById('result').innerHTML += nounInflectionTable.outerHTML;
      vocab = {word,definition,snoozed: false,book,pronounciation,gender,conjugations,seen:0,quizResults: ['n','n','n','n']}

      console.log(vocab)
    }else{ 
      //case when its a inflection of some other word
      const latinElement = doc.querySelector('i.Latn.mention[lang="la"]');
      if(latinElement){
        const anchorTag = latinElement.querySelector('a');
        if (anchorTag) {
          const linkText = anchorTag.textContent; // Get the text content of the <a>
          console.log("Anchor text:", linkText);
          document.getElementById('resultForInfs').style.display = 'block'
          const spanElement = latinElement.parentElement;
          const spanElement1 = spanElement.parentElement;
          const liElement = spanElement1.parentElement;
          let definition = ""
          if(liElement){
            definition = liElement.textContent.trim()
          }
          definition+=","
          document.getElementById('resultForInfs').innerHTML += definition
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
        // is adv/non camparable word
        const isLatinWord = doc.querySelector('strong.Latn.headword[lang="la"]');
        if(isLatinWord){
          const grannyElement = isLatinWord.parentElement.parentElement;
          const closestOl = grannyElement.nextElementSibling;
          const liElement = closestOl.querySelector("li"); // Get the text content of the <a>
          document.getElementById('result').style.display = 'block'
          let definition = ""
          if(liElement){
            liElement.querySelectorAll('dl,ul').forEach(el => el.remove());
            definition = liElement.textContent.trim()
          }
          document.getElementById('result').innerHTML += definition
          vocab = {word,definition,snoozed: false,book,pronounciation,gender,seen:0,quizResults: ['n','n','n','n']}
          console.log(vocab)
          
          document.getElementById('submit').style.display = 'block'
          document.getElementById('wrongDef').style.display = 'block'
        }else{
          document.getElementById('result').style.display = 'block'
          document.getElementById('result').innerHTML = 'invalid word(either does not exist in latin or does not have a normal conjugation table or is not in base form.)'
        }
        
      }
  }
  }
  // }catch(error){
  // //   document.getElementById('result').style.display = 'block'
  // //   document.getElementById('result').innerHTML = 'invalid word(either does not exist in latin or does not have a normal conjugation table or is not in base form.)'
  // }
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
  const submitButton = document.getElementById('submit'); 
  const wrongDefButton = document.getElementById('wrongDef'); 

  if (submitButton) {
    // Attach click event listener
    submitButton.addEventListener('click', function() {
      if(document.getElementById("newDef").style.display == "inline-block" && document.getElementById("newDef").value && document.getElementById("newDef").value!="Enter correct definition"){
        if(!vocab.word){
          vocab = {}
          vocab.definition = document.getElementById('newDef').value
          vocab.book = document.getElementById('bookSelector').value;
          vocab.pronounciation = document.getElementById('pronounciation').value;
          vocab.gender = document.getElementById('gender').value;
          vocab.word = document.getElementById('wikiEntry').value;
        }else{
          vocab.definition = document.getElementById('newDef').value
        }
      }
      chrome.storage.local.get('vocabList', function(data) {    
        let vocabList = data.vocabList || [];
        console.log(vocabList)
        vocabList.push(vocab)
        chrome.storage.local.set({ vocabList: vocabList }, function() {
        });
      });  
      alert("Pushed");
      document.getElementById('wrongDef').style.display = 'none'
      document.getElementById('newDef').style.display = 'none'
    });
  } else {
    submitButton.log("Button not found!");
  }
  wrongDefButton.addEventListener('click', function() {
    document.getElementById('newDef').style.display="inline-block"; 
    document.getElementById('newDef').value=""; 
    document.getElementById('submit').style.display="inline-block"; 
    console.log(vocab)
  });

  populateBookSelector()
});

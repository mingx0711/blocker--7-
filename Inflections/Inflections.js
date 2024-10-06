let vocab = {}
document.getElementById('selectLanguage').addEventListener('change', function() {
    let selectedLanguage = this.value;  // Get the selected value
    let word = document.getElementById("wikiEntry").value;
    getConjugation(word,selectedLanguage);
  });

  document.getElementById('lookupButton').addEventListener('click', function() {
    const wordRaw = document.getElementById('wikiEntry').value;
    const language = document.getElementById('selectLanguage').value;
    const word = wordRaw.replaceAll('ō', 'o').replaceAll('ā', 'a')

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
  try{
  document.getElementById('submit').display = 'none'
  document.getElementById('result').innerHTML = '';
  const book = document.getElementById('bookSelector').value;
  const pronounciation = document.getElementById('pronounciation').value;
  const gender = document.getElementById('gender').value;
  let conjugations = {};
  vocab = {}
  let iTableLocator = doc.querySelector('.inflection-table.vsSwitcher tbody tr th i[lang="la"]');
  let th = iTableLocator.parentElement;
  let tr = th.parentElement;
  let tbody = tr.parentElement;
  const verbInflectionTable=tbody.parentElement;
  if(!verbInflectionTable){
    console.log("ermmmmm")
    verbInflectionTable = doc.querySelectorAll('.inflection-table.vsSwitcher');
  }
  conjugations.group = [];
  if (verbInflectionTable) {
    console.log(verbInflectionTable)
    let anchorElement = doc.querySelector('#mw-content-text > div.mw-content-ltr.mw-parser-output > table > tbody > tr:nth-child(1) > th a[href]');
    if(!anchorElement){
       document.getElementById('result').innerHTML += "No such words"
    }
    conjugations.group.push(anchorElement.textContent);
    let definition = ""
    const paragraph = doc.querySelector('p span > strong[lang="la"].Latn.headword');
    if (paragraph) {
      const parentParagraph = paragraph.closest('p');
      const nextOl = parentParagraph.nextElementSibling;
      console.log(nextOl)
      if (nextOl) {
        const firstListItem = nextOl.querySelector('li');
        firstListItem.querySelectorAll('span, dl,ul').forEach(el => el.remove());
        definition = firstListItem.textContent.trim();
      }
    }
    let conjugationText = conjugations.group.join(', ');
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
      const declensionElement = doc.querySelector('a[href^="/wiki/Appendix:Latin_"][href*="declension"]');
      if(declensionElement){
        const declension = declensionElement.textContent
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
      console.log(definition)
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
      conjugations.pos = 'noun';
      document.getElementById('submit').style.display = 'block'
      document.getElementById('result').innerHTML +=  `<span style="font-size: 20px;display:"block";margin-left:5%>,definition:${definition}</span>`
      document.getElementById('result').innerHTML += nounInflectionTable.outerHTML;
      vocab = {word,definition,snoozed: false,book,pronounciation,gender,conjugations,seen:0,quizResults: ['n','n','n','n']}

      console.log(conjugations)
    }else{ document.getElementById('result').style.display = 'block'
    document.getElementById('result').innerHTML = 'invalid word(either does not exist in latin or does not have a normal conjugation table or is not in base form.)'
    }
  }
  }catch(error){
    document.getElementById('result').style.display = 'block'
    document.getElementById('result').innerHTML = 'invalid word(either does not exist in latin or does not have a normal conjugation table or is not in base form.)'

  }
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
  if (submitButton) {
    // Attach click event listener
    submitButton.addEventListener('click', function() {
      chrome.storage.local.get('vocabList', function(data) {    
        let vocabList = data.vocabList || [];
        console.log(vocabList)
        vocabList.push(vocab)
        chrome.storage.local.set({ vocabList: vocabList }, function() {
        });
      });  
      alert("Pushed");
      submitButton.style.display="none"
    });
  } else {
    submitButton.log("Button not found!");
  }
  populateBookSelector()
});

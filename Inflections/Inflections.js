let vocab = {}
document.getElementById('selectLanguage').addEventListener('change', function() {
    let selectedLanguage = this.value;  // Get the selected value
    let word = document.getElementById("wikiEntry").value;
    getConjugation(word,selectedLanguage);
  });

  document.getElementById('lookupButton').addEventListener('click', function() {
    const word = document.getElementById('wikiEntry').value;
    const language = document.getElementById('selectLanguage').value;
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
  document.getElementById('submit').display = 'none'
  document.getElementById('result').innerHTML = '';
  let conjugations = {};
  const verbInflectionTable = doc.querySelector('.inflection-table.vsSwitcher');
  conjugations.group = [];
  if (verbInflectionTable) {
    let anchorElements = doc.querySelectorAll('#mw-content-text > div.mw-content-ltr.mw-parser-output > table > tbody > tr:nth-child(1) > th a[href]');
    anchorElements.forEach((anchor) => {
      conjugations.group.push(anchor.textContent);
      console.log(anchor.textContent.trim());  // Output the href attribute value of each <a> element
    });
    console.log(conjugations.group)
    let listItem = doc.querySelector('#mw-content-text > div.mw-content-ltr.mw-parser-output > ol > li:nth-child(1)');
    listItem.querySelectorAll('span, dl,ul').forEach(el => el.remove());
    let conjugationText = conjugations.group.join(', ');
    let definition = listItem.textContent.trim();
    // Select the <span> element
    let spanElements = doc.querySelectorAll('span.Latn.form-of.lang-la');
    conjugations.number = {singular:[],plural:[]}
    conjugations.person = {first:[],second:[],third:[]}
    conjugations.tense = {pres:[],impf:[],perf:[],fut:[],plup:[],futp:[],sigm:[],aor:[]}
    conjugations.voice = {act:[],pass:[]}
    conjugations.mood = {ind:[],sub:[],imp:[]}
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
      }if(spanElement.className.includes('imp')){conjugations.mood.imp.push(childText);
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
    document.getElementById('result').innerHTML += definition;
    document.getElementById('result').innerHTML += "<br />";
    document.getElementById('result').innerHTML += conjugationText;
    document.getElementById('result').innerHTML += "<br />";
    document.getElementById('result').innerHTML += verbInflectionTable.outerHTML;
    const book = document.getElementById('bookSelector').value;
    const pronounciation = document.getElementById('pronounciation').value;
    const gender = document.getElementById('gender').value;
    conjugations.type = 'auto';
    vocab = {word,definition,snoozed: false,book,pronounciation,gender,conjugations,seen:0,quizResults: ['n','n','n','n']}
    console.log(vocab)
    }
  else {
    const nounInflectionTable = doc.querySelector('#mw-content-text > div.mw-content-ltr.mw-parser-output > table');
    if(nounInflectionTable){
      const conjugations = {}
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
      document.getElementById('result').innerHTML += nounInflectionTable.outerHTML;
      console.log(conjugations)
    }
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
    });
  } else {
    submitButton.log("Button not found!");
  }
  populateBookSelector()
});

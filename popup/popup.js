document.getElementById('addVocabForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const word = document.getElementById('word').value;
  const definition = document.getElementById('definition').value;
  const book = document.getElementById('bookSelector').value;
  const pronounciation = document.getElementById('pronounciation').value;
  const gender = document.getElementById('gender').value;
  // Get existing vocab data from Chrome storage
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
  populateBookSelector();
});
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
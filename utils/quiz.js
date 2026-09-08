import * as core from './core.js';

// Named queue identifiers keep quiz scheduling independent from implementation details.
export const QUIZ_TYPES = Object.freeze({
    DEFINITION: 'definition',
    WORD: 'word',
    TRUE_FALSE_DEFINITION: 'trueFalseDefinition',
    PRONUNCIATION: 'pronunciation',
    GENDER: 'gender',
    INFLECTION: 'inflection',
    GROUP: 'group',
    LISTENING: 'listening',
    SPELLING: 'spelling',
    VERB_FORM_SPELLING: 'verbFormSpelling',
    GERMAN_PHRASE_SPELLING: 'germanPhraseSpelling',
    REFLEXIVE: 'reflexive',
    FIXED_CONNECTION: 'fixedConnection'
});

export const ClearPageForQuizContainer = core.ClearPageForQuizContainer;
export const ClearPageForTFContainer = core.ClearPageForTFContainer;
export const setupTFQuiz = core.setupTFQuiz;
export const setupWordQuiz = core.setupWordQuiz;
export const setupDefQuiz = core.setupDefQuiz;
export const setupSpellingQuiz = core.setupSpellingQuiz;
export const setUpPronounciationQuiz = core.setUpPronounciationQuiz;
export const setUp8Quiz = core.setUp8Quiz;
export const prepareQuiz6 = core.prepareQuiz6;
export const prepareOptionsForQuiz6 = core.prepareOptionsForQuiz6;
export const prepareOptionsForQuizStyle7 = core.prepareOptionsForQuizStyle7;
export const setupQuiz7 = core.setupQuiz7;
export const prepareGermanPhraseSpellingQuiz = core.prepareGermanPhraseSpellingQuiz;
export const prepareVerbFormSpellingQuiz = core.prepareVerbFormSpellingQuiz;
export const prepareFixedConnectionSpellingQuiz = core.prepareFixedConnectionSpellingQuiz;
export const handleMultipleChoiceAnswer = core.handleMultipleChoiceAnswer;
export const handleTrueFalseAnswer = core.handleTrueFalseAnswer;
export const handleSpellingAnswer = core.handleSpellingAnswer;
export const renderCorrectAnswerReview = core.renderCorrectAnswerReview;

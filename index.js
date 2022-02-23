const express = require('express');
const bodyParser = require('body-parser');
const constants = require('./constants.js');

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
      return res.status(200).json({});
  };
  next();
});

const MAX_WORD_LENGTH = 5;
const SCORE_DIRECT_HIT = 2;
const SCORE_NEAR_MISS = 1;
const SCORE_SWING_AND_MISS = 0;
const ASCII_A = 97;
const ASCII_Z = 122;
const LETTER_INDEX_A = 0;
const LETTER_INDEX_E = 4;
const LETTER_INDEX_I = 8;
const LETTER_INDEX_O = 14;
const LETTER_INDEX_U = 20;
const LETTER_INDEX_Y = 24;

// --------------------------------------------------
// For the given wordArray, gets the counts of each letter
// Can be used on the full word lists or the filtered lists

function getLetterCounts(wordArray) {
  var returnValue = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (var i = 0; i < wordArray.length; i++) {
    for (var j = ASCII_A; j <= ASCII_Z; j++) {
      // Assumes all lower case
      if (wordArray[i].indexOf(String.fromCharCode(j)) > -1) {
        returnValue[j - ASCII_A]++;
      }
    }
  }

  return returnValue;
}

// --------------------------------------------------
// Filters the words based on hits and misses

function getFilteredWords(wordArray, directHits, nearMisses, swingsAndMisses) {

    var returnValue = [];
    var regExPattern = "";

    for (var i = 0; i < MAX_WORD_LENGTH; i++) {
      var partialRegEx = "";
      var missingLetters = [];
      if (directHits[i] != null) {
        partialRegEx = "[" + directHits[i] + "]";
      } else {
        missingLetters = missingLetters.concat(swingsAndMisses);
        missingLetters = missingLetters.concat(nearMisses.nearMisses[i]);
        partialRegEx = getRegExForAlphaMinusChars(missingLetters);
      }

      regExPattern += partialRegEx;
    }

    var regExTest = new RegExp(regExPattern);

    var returnValue = wordArray.filter(function(value) {
      return value.match(regExTest);
    });
  
    // Loop for every near miss letter and re-filter
    for (var i = 0; i < nearMisses.presentLetters.length; i++) {
      var regExTest = new RegExp('[' + nearMisses.presentLetters[i] + ']');
      returnValue = returnValue.filter(function(value) {
        return value.match(regExTest);
      });
    }

    // TODO: Check for split double letters (one direct hit + one near miss)

    return returnValue;
}

// --------------------------------------------------
// Returns the scores for each valid word based on the letter counts
// of the remaining valid words

function getWordScores(wordArray, letterCounts) {

  var returnValue = {};

  for (var i = 0; i < wordArray.length; i++) {

    var currentWord = wordArray[i];
    var currentScore = 0;

    for (var j = 0; j < currentWord.length; j++) {
      var currentLetterIndex = currentWord.charCodeAt(j) - ASCII_A;

      if (currentLetterIndex === LETTER_INDEX_A ||
        currentLetterIndex === LETTER_INDEX_E ||
        currentLetterIndex === LETTER_INDEX_I ||
        currentLetterIndex === LETTER_INDEX_O ||
        currentLetterIndex === LETTER_INDEX_U) {

        // 4x the score for core vowels
        currentScore += 4 * letterCounts[currentLetterIndex];
      } else if (currentLetterIndex === LETTER_INDEX_Y) {
        // 2x the score for Y
        currentScore += 2 * letterCounts[currentLetterIndex];
      } else {
        currentScore += letterCounts[currentLetterIndex];
      }
    }

    // Penalize for repeat letters
    if (wordContainsRepeatLetters(currentWord)) {
      currentScore /= 8;
    }

    returnValue[currentWord] = currentScore;
  }

  var count = 0;
  for (var key in returnValue) {
    if (returnValue.hasOwnProperty(key)) count++;
  }

  return returnValue;
}

// --------------------------------------------------
// Returns RegEx pattern after removing invalid chars

function getRegExForAlphaMinusChars(charValues) {
  var returnValue = '[abcdefghijklmnopqrstuvwxyz]';
  for (var i = 0; i < charValues.length; i++) {
    returnValue = returnValue.replace(charValues[i], '');
  }

  return returnValue;
}

// ==================================================
// Returns true/false for words with repeat letters (duh)

function wordContainsRepeatLetters(wordToCheck) {
  var letterCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (var i = 0; i < wordToCheck.length; i++) {
    var letter = wordToCheck.charCodeAt(i) - ASCII_A;
    // TODO: Don't increment for repeat letters
    letterCounts[letter]++;
  }
  for (var i = 0; i < 26; i++) {
    if (letterCounts[i] > 1) {
      return true;
    }
  }
  return false;
}

// ==================================================
// Returns an array of DIRECT HITS
// This is an array of length MAX_WORD_LENGTH
// That contains each of the direct hit chars
// in their orginal position.
//
// TODO: Throw a 400 BAD REQUEST if there is a guess
// list that doesn't make sense (e.g. a SWING AND MISS
// letter that is also a DIRECT HIT).

function getDirectHits(guesses) {
  // TODO: Populate direct hits using MAX_WORD_LENGTH as the length
  var directHits = [null, null, null, null, null];

  for (var i = 0; i < guesses.length; i++) {
    for (var j = 0; j < MAX_WORD_LENGTH; j++) {
      var currentScore = guesses[i].matches[j];
      if (currentScore === SCORE_DIRECT_HIT) {
        var currentLetter = guesses[i].word[j].toLowerCase();
        var currentHitAtLetter = directHits[j];

        // TODO: Throw ERROR
        if (currentHitAtLetter !== null && currentHitAtLetter !== currentLetter) {
          console.log('ERROR - DUPLICATE DIRECT HIT: ' + currentHitAtLetter + ' !== ' + currentLetter);
          return;
        }

        directHits[j] = currentLetter;
      }
    }
  }

  return directHits;
}

// ==================================================
// Loops through the guesses and returns an array of chars
// that are "swings and misses". They are not ANY part of
// the solution.
//
// TODO: Validate whether a swing and a miss is ever
// ALSO a direct hit or a near miss
//
// TODO: If there is a problem, then we need to return a 400 BAD REQUEST

function getSwingsAndMisses(guesses) {
  var swingsAndMisses = [];

  for (var i = 0; i < guesses.length; i++) {
    for (var j = 0; j < MAX_WORD_LENGTH; j++) {
      var currentScore = guesses[i].matches[j];
      if (currentScore === SCORE_SWING_AND_MISS) {
        var currentLetter = guesses[i].word[j].toLowerCase();

        if (!swingsAndMisses.includes(currentLetter)) {
          swingsAndMisses.push(currentLetter);
        }
      }
    }
  }

  return swingsAndMisses;
}

// ==================================================
// Near misses

function getNearMisses(guesses) {
  // nearMisses has the ordinal information for the letters
  var nearMisses = [[], [], [], [], []];
  var presentLetters = [];

  for (var i = 0; i < guesses.length; i++) {
    for (var j = 0; j < MAX_WORD_LENGTH; j++) {
      var currentScore = guesses[i].matches[j];
      if (currentScore === SCORE_NEAR_MISS) {
        var currentLetter = guesses[i].word[j].toLowerCase();

        if (!presentLetters.includes(currentLetter)) {
          presentLetters.push(currentLetter);
        }
        if (!nearMisses[j].includes(currentLetter)) {
          nearMisses[j].push(currentLetter);
        }
      }
    }
  }

  return {
    nearMisses: nearMisses,
    presentLetters: presentLetters
  };
}

// ==================================================
// The status of each letter

function getLetterStatuses(directHits, nearMisses, swingsAndMisses) {
  var returnValue = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]

  swingsAndMisses.forEach(key => {
    var letterCode = key.charCodeAt(0);
    returnValue[letterCode - ASCII_A] = 0;
  });

  nearMisses.presentLetters.forEach(key => {
    var letterCode = key.charCodeAt(0);
    returnValue[letterCode - ASCII_A] = 1;
  });

  for (var i = 0; i < directHits.length; i++) {
    if (directHits[i]) {
      var letterCode = directHits[i].charCodeAt(0);
      returnValue[letterCode - ASCII_A] = 2;
    }
  }

  return returnValue;
}

// ==================================================
// The POST handler for the Wordle solver

app.post('/wordle', function(req, res) {
  var directHits = getDirectHits(req.body.guesses);
  var swingsAndMisses = getSwingsAndMisses(req.body.guesses);
  var nearMisses = getNearMisses(req.body.guesses);
  var filteredWordsAllowed = getFilteredWords(constants.ALLOWED_GUESSES, directHits, nearMisses, swingsAndMisses);
  var filteredWordsOfficial = getFilteredWords(constants.OFFICIAL_SOLUTIONS, directHits, nearMisses, swingsAndMisses);

  // This is not relevant for picking the best solution
  var letterCountsAllowed = getLetterCounts(filteredWordsAllowed);
  var letterCountsOfficial = getLetterCounts(filteredWordsOfficial);

  var wordScoresAllowed = getWordScores(filteredWordsAllowed, letterCountsAllowed);
  var wordScoresOfficial = getWordScores(filteredWordsOfficial, letterCountsOfficial);

  var suggestionsAllowed = [];
  for (var i = 0; i < filteredWordsAllowed.length; i++) {
    suggestionsAllowed.push({
      word: filteredWordsAllowed[i],
      score: wordScoresAllowed[filteredWordsAllowed[i]]
    });
  }

  suggestionsAllowed = suggestionsAllowed.sort(function(a, b) {
    return b.score - a.score;
  });

  var allowedTop10 = [];
  for (var i = 0; i < suggestionsAllowed.length && i < 10; i++) {
    allowedTop10.push(suggestionsAllowed[i]);
  }

  var suggestionsOfficial = [];
  for (var i = 0; i < filteredWordsOfficial.length; i++) {
    suggestionsOfficial.push({
      word: filteredWordsOfficial[i],
      score: wordScoresOfficial[filteredWordsOfficial[i]]
    });
  }

  suggestionsOfficial = suggestionsOfficial.sort(function(a, b) {
    return b.score - a.score;
  });

  var officialTop10 = [];
  for (var i = 0; i < suggestionsOfficial.length && i < 10; i++) {
    officialTop10.push(suggestionsOfficial[i]);
  }

  var letterStatuses = getLetterStatuses(directHits, nearMisses, swingsAndMisses);

  res.json({
    filteredWordsAllowedCount: filteredWordsAllowed.length,
    filteredWordsOfficialCount: filteredWordsOfficial.length,
    suggestionsAllowed: allowedTop10,
    suggestionsOfficial: officialTop10,
    letterStatuses: letterStatuses
  })
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, err => {
    if(err) throw err;
    console.log("%c Server running on " + PORT, "color: green");
});


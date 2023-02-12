  "use strict";

  class ForeignWord {
    constructor(word, translate, example) {
      this.word = word;
      this.translate = translate;
      this.example = example;
    }
  }

  const studyMode = document.querySelector("#study-mode");
  const currentWord = document.querySelector("#current-word");
  const totalWord = document.querySelector("#total-word");
  const wordProgress = document.querySelector("#words-progress");
  const shuffleWords = document.querySelector("#shuffle-words");
  const examMode = document.querySelector("#exam-mode");
  const examCorrectPercent = document.querySelector("#correct-percent");
  const examProgress = document.querySelector("#exam-progress");
  const studyCards = document.querySelector(".study-cards");
  const flipCard = document.querySelector(".flip-card");
  const foreignWord = document.querySelector("#card-front");
  const translate = document.querySelector("#card-back");
  const backButton = document.querySelector("#back");
  const examButton = document.querySelector("#exam");
  const nextButton = document.querySelector("#next");
  const examCards = document.querySelector("#exam-cards");
  const resultModal = document.querySelector(".results-modal");
  const timerSpan = document.querySelector("#time");
  const resultTimer = document.querySelector("#timer");
  const wordStatsTemplate = document.querySelector("#word-stats");
  const attemptMap = new Map();
  const foreignWordMap = new Map();

  let timer;
  let currentWordPosition;
  let currentCard;
  let previousCard;
  let currentWords;
  

  const foreignWords = [
      new ForeignWord('animal', 'животное', 'A lion is an animal'),
      new ForeignWord('sentence', 'предложение', 'This sentence will be translated'),
      new ForeignWord('mountain', 'гора', 'Look at this high mountain'),
      new ForeignWord('example', 'пример', 'We should follow his example'),
      new ForeignWord('gooseberry', 'крыжовник', 'We have mutton chops and gooseberry tart'),
      new ForeignWord('watermelon', 'арбуз', 'I like to eat watermelon'),
      new ForeignWord('addiction', 'зависимость', 'And indeed, it has all of the characteristics of addiction'),
  ]

  
  this.addEventListener("load", () => {
    currentWordPosition = 0;
    totalWord.textContent = foreignWords.length;
    replaceTestCard(currentWordPosition);
  });


  flipCard.addEventListener("click", (event) => {
    event.currentTarget.classList.toggle("active");
  });


  nextButton.addEventListener("click", () => {
    backButton.disabled = false;
    flipCard.classList.remove("active");
    currentWordPosition++;
    currentWord.textContent = currentWordPosition + 1;
    replaceTestCard(currentWordPosition);
    if (currentWordPosition >= foreignWords.length - 1) {
      nextButton.disabled = true;
    }
    wordProgress.value =
      ((currentWordPosition + 1) / foreignWords.length) * 100;
  });


  backButton.addEventListener("click", () => {
    nextButton.disabled = false;
    flipCard.classList.remove("active");
    currentWordPosition--;
    currentWord.textContent = currentWordPosition + 1;
    replaceTestCard(currentWordPosition);
    if (currentWordPosition <= 0) {
      backButton.disabled = true;
    }
    wordProgress.value =
      ((currentWordPosition + 1) / foreignWords.length) * 100;
  });


  shuffleWords.addEventListener("click", () => {
    shuffle(foreignWords);
    replaceTestCard(currentWordPosition);
  });


  function replaceTestCard(wordPosition) {
    const currentForeignWord = foreignWords[wordPosition];
    foreignWord.querySelector("h1").textContent = currentForeignWord.word;
    translate.querySelector("h1").textContent = currentForeignWord.translate;
    translate.querySelector("span").textContent = currentForeignWord.example;
  }


  examButton.addEventListener("click", () => {
    hideTestElements();
    initNewExam();
  });


  examCards.addEventListener("click", (event) => {
    const card = event.target;
    if (!card.classList.contains("card")) {
      return;
    }
    if (currentCard === undefined) {
      currentCard = card;
      card.classList.add("correct");
    } else {
      if (currentCard === card) {
        return;
      }
      const word = foreignWordMap.get(card.textContent);
      if (currentCard.textContent === word) {
        handleCorrectTranslation(card, word);
      } else {
        handleWrongTranslation(word, card);
      }
      currentCard = undefined;
    }
  });


  function initExamAttemptMap() {
    foreignWords.forEach((foreignWord) => {
      attemptMap.set(foreignWord.word, 1);
    });
  }


  function initExamWordMap() {
    foreignWords.forEach((foreignWord) => {
      foreignWordMap.set(foreignWord.word, foreignWord.translate);
      foreignWordMap.set(foreignWord.translate, foreignWord.word);
    });
  }


  function initNewExam() {
    examMode.classList.remove("hidden");
    initExamCurrentWords();
    initExamCards();
    initExamWordMap();
    initExamAttemptMap();
    initExamTimer();
  }


  function initExamCurrentWords() {
    currentWords = new Set();
    let wordsAndTranslations = getShuffledWords();
    wordsAndTranslations.forEach((word) => {
      currentWords.add(word);
    });
  }


  function initExamTimer() {
    timer = setInterval(() => {
      let time = timerSpan.textContent;
      let timeArray = time.split(":");
      let minutes = parseInt(timeArray[0]);
      let seconds = parseInt(timeArray[1]);
      seconds++;
      if (seconds === 60) {
        minutes++;
        seconds = 0;
      }
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      time = minutes + ":" + seconds;
      timerSpan.textContent = time;
    }, 1000);
  }


  function initExamCards() {
    const fragment = new DocumentFragment();
    currentWords.forEach((word) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.textContent = word;
      fragment.appendChild(card);
    });
    examCards.appendChild(fragment);
  }


  function hideTestElements() {
    studyCards.classList.add("hidden");
    studyMode.classList.add("hidden");
  }


  function handleWrongTranslation(foreignWord, card) {
    countAttemps(foreignWord, card);
    card.classList.add("wrong");
    previousCard = currentCard;
    setTimeout(() => {
      card.classList.remove("wrong");
      previousCard.classList.remove("correct");
    }, 500);
  }


  function handleCorrectTranslation(card, foreignWord) {
    card.classList.add("correct");
    card.classList.add("fade-out");
    currentCard.classList.add("fade-out");
    currentWords.delete(foreignWord);
    currentWords.delete(card.textContent);
    const percent =
      currentWords.size === 0
        ? 100
        : Math.floor(
            100 - (currentWords.size / (foreignWords.length * 2)) * 100
          );
    examProgress.value = percent;
    examCorrectPercent.textContent = percent + "%";
    if (!currentWords.size) {
      handleExamFinish();
    }
  }


  function handleExamFinish() {
    clearInterval(timer);
    resultModal.classList.remove("hidden");
    resultTimer.textContent = timerSpan.textContent;
    const fragment = new DocumentFragment();
    attemptMap.forEach((value, key) => {
      const wordStat = wordStatsTemplate.content.cloneNode(true);
      wordStat.querySelector(".word span").textContent = key;
      wordStat.querySelector(".attempts span").textContent = value;
      fragment.appendChild(wordStat);
    });
    resultModal.appendChild(fragment);
  }

  function countAttemps(word, card) {
    let attempts = attemptMap.get(word);
    if (attempts === undefined) {
      attempts = attemptMap.get(card.textContent);
      attemptMap.set(card.textContent, ++attempts);
    } else {
      attemptMap.set(word, ++attempts);
    }
  }


  function getShuffledWords() {
    let wordsAndTranslations = [];
    foreignWords.forEach((foreignWord) => {
      wordsAndTranslations.push(foreignWord.word);
      wordsAndTranslations.push(foreignWord.translate);
    });
    shuffle(wordsAndTranslations);
    return wordsAndTranslations;
  }

  
  function shuffle(array) {
    let randomIndex;
    let currentIndex = array.length;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
  }
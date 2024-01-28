let correctAnswerCount = 0;
let scoreCount = 0;
let questionTimer = 20;
let timerRunning = false;
let timerInterval;
let doubleIt = false;

function startQuiz() {
    getNextQuestion();
}

function startTimer() {
    if (!timerRunning) {
        questionTimer = 20;
        timerRunning = true;
        timerInterval = setInterval(function () {
            questionTimer--;
            updateTimerDisplay();

            if (questionTimer <= 0) {
                stopTimer();
                submitAnswer(null);
                document.getElementById('check-answer-button').style.display = 'none';
                document.getElementById('next-question-button').style.display = 'flex';
            }
        }, 1000);
    }
}

function updateScore() {
    if (doubleIt === true) {
        correctAnswerCount += 2;
        doubleIt = false;
    } else {
        correctAnswerCount += 1;
    }
    document.getElementById('current-score').innerText = "Aktueller Punktestand: " + correctAnswerCount;
}

function getNextQuestion() {
    fetch("/getNextQuestion", {
        method: "GET",
        headers: {
            "Content-Type": "text/json"
        },
        credentials: "include"
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }).then(data => {
        if (data.endOfQuiz) {
            document.getElementById('end-quiz-container').style.display = 'flex';
            document.getElementById('next-question-button').style.display = 'none';
        } else {
            startTimer();
            renderNextQuestion(data.question, data.answers, correctAnswerCount);
        }
    }).catch(error => console.log(error.message));
}

function renderNextQuestion(question, answers, score) {
    document.getElementById('start-quiz-container').innerText = "";

    document.getElementById('current-score').innerText = "Aktueller Punktestand: " + score;
    document.getElementById('timer-bar-container').style.display = 'flex';
    updateTimerDisplay();

    document.getElementById('questionCoandJoker').style.display = 'flex';

    document.getElementById('question-container').style.display = 'flex';
    document.getElementById('question').innerHTML = question;
    let answersContainer = document.getElementById('answer-form');
    answersContainer.innerHTML = "";
    shuffleAnswers(answers);
    answers.forEach(answer => {
        let label = document.createElement('label');
        label.innerHTML = `<input type="radio" name="answer" value="${answer}">${answer}`;
        answersContainer.appendChild(label);
        answersContainer.appendChild(document.createElement('br'));
    });

    document.getElementById('button-container').style.display = 'flex';
    document.getElementById('check-answer-button').style.display = 'flex';
    document.getElementById('next-question-button').style.display = 'none';
    document.getElementById('end-quiz-container').style.display = 'none';

    document.getElementById('joker-container').style.display = 'flex';
    document.getElementById('5050Joker').src = "/assets/images/fiftyFiftyJoker.png";
    document.getElementById('pauseJoker').src = "/assets/images/pauseJoker.png";
    document.getElementById('doublePointsJoker').src = "/assets/images/doubleItJoker.png";
    document.getElementById('5050Joker').disabled = false;
    document.getElementById('pauseJoker').disabled = false;
    document.getElementById('doublePointsJoker').disabled = false;

    document.getElementById('result').innerText = "";
}

function checkAnswer() {
    let selectedAnswerElement = document.querySelector('input[name="answer"]:checked');

    if (selectedAnswerElement) {
        submitAnswer(selectedAnswerElement)
    } else {
        document.getElementById('result').textContent = 'Bitte wähle erst eine Antwort aus.'
    }
}

function submitAnswer(selectedAnswerElement) {
    const selectedAnswer = selectedAnswerElement ? selectedAnswerElement.value : null;

    fetch("/checkAnswer", {
        method: "POST",
        body: JSON.stringify({
            selectedAnswer: selectedAnswer,
        }),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }).then(data => {
        if (data.isCorrect === true) {
            calculateHighscore(questionTimer);
        }
        stopTimer();
        renderResult(data.isCorrect, data.correctAnswer);
        document.getElementById('check-answer-button').style.display = 'none';
        document.getElementById('next-question-button').style.display = 'flex';
    }).catch(error => console.log(error.message));
}


function renderResult(isCorrect, correctAnswer) {
    let consoleOutput = document.getElementById('result');
    let message;

    if (isCorrect) {
        updateScore(correctAnswerCount);
        message = "Richtige Antwort!";
    } else {
        message = "Falsch. Die richtige Antwort lautet: " + correctAnswer;
    }

    consoleOutput.innerHTML = message;
}

function updateTimerDisplay() {
    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('timer-text');

    const percentage = (questionTimer / 20) * 100;

    const maxWidth = window.innerWidth * 0.70;
    const barWidth = Math.min((percentage / 100) * maxWidth, maxWidth);

    timerBar.style.width = barWidth + 'px';

    if (questionTimer <= 5) {
        timerBar.style.backgroundColor = 'red';
    } else {
        timerBar.style.backgroundColor = 'green';
    }

    timerText.innerText = formatTime(questionTimer);
    if (questionTimer <= 0) {
        timerBar.style.width = maxWidth + 'px';
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function stopTimer() {
    if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
    }
}

function calculateHighscore(questionTimer) {
    if (doubleIt === true) {
        scoreCount += (2*questionTimer);
    } else {
        scoreCount += questionTimer;
    }
}

function saveEndScore() {
    getCoins()
}

function getCoins() {
    fetch("/getCoins", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    })
        .then(response => response.json())
        .then(data => {
            setNewAmountOfCoins(data.availableCoins)
        })
        .catch(error => console.error("Fehler beim Abrufen der verfügbaren Coins", error));
}

function setNewAmountOfCoins(availableCoins) {
    let newAmountOfCoins = Math.floor(scoreCount/10);
    newAmountOfCoins += availableCoins;

    fetch("/setCoins", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ newAmountOfCoins: newAmountOfCoins})
    })
        .then(response => response.json())
        .then(data => {
            saveQuizResult(scoreCount);
        })
        .catch(error => console.error("Fehler beim Setzen der neuen Coins:", error));
}

function saveQuizResult(score) {
    fetch("/saveQuizResult", {
        method: "POST",
        body: JSON.stringify({
            highscore: score
        }),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        window.location.href="quizSelection"
        alert("Ergebnis gespeichert!");
    })
        .catch(error => console.error('Fehler beim Speichern des Ergebnisses:', error));
}

function getCorrectAnswer(callback) {
    fetch("/getCorrectAnswer", {
        method: "GET",
        headers: {
            "Content-Type": "text/json"
        },
        credentials: "include"
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }).then(data => {
        callback(data.correctAnswer);
    }).catch(error => console.log(error.message));
}

function shuffleAnswers(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function useFiftyFiftyJoker() {
    fetch("/getFiftyFiftyJoker", {
        method:"GET",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    })
        .then(response => response.json())
        .then(data => {
            let availableFiftyFiftyJoker = data.availableFiftyFiftyJoker;
            if (availableFiftyFiftyJoker >= 1) {
                fiftyFiftyJoker(availableFiftyFiftyJoker);
            } else {
                console.log("Nicht genügend FiftyFiftyJoker verfügbar.");
            }

        })
        .catch(error => console.error("Fehler beim Abrufen der verfügbaren FiftyFifty-Joker:", error));
}

function fiftyFiftyJoker(availableFiftyFiftyJoker) {
    getCorrectAnswer(correctAnswer => {
        let answerLabels = document.querySelectorAll('form#answer-form label');

        let correctAnswerLabel = Array.from(answerLabels).find(label => {
            return label.innerText.includes(correctAnswer);
        });

        let visibleAnswerCount = 0;
        answerLabels.forEach(label => {
            if (label.style.display !== 'none' && label !== correctAnswerLabel) {
                visibleAnswerCount++;
            }
        });

        if (visibleAnswerCount >= 2) {
            console.log("fiftyfifty2 angewendet")
            setFiftyFiftyJoker(availableFiftyFiftyJoker);
            let hiddenCount = 0;
            while (hiddenCount < 2) {
                let randomIndex = Math.floor(Math.random() * answerLabels.length);
                let label = answerLabels[randomIndex];
                if (label.style.display !== 'none' && label !== correctAnswerLabel) {
                    label.style.display = 'none';
                    hiddenCount++;
                }
            }
            document.getElementById('5050Joker').src = "/assets/images/fiftyFiftyNope.png";

        }
    });
}

function setFiftyFiftyJoker(availableFiftyFiftyJoker) {
    fetch("/setFiftyFiftyJoker", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ newAmountOfJokers: availableFiftyFiftyJoker - 1})
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById("fiftyFiftyJokerAmount").innerText = data.newAmountOfJokers;
        })
        .catch(error => console.error("Fehler beim Setzen der neuen Anzahl FiftyFiftyJoker:", error));
}

function usePauseJoker() {
    console.log("Pause Joker Test")
    fetch("/getPauseJoker", {
        method:"GET",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    })
        .then(response => response.json())
        .then(data => {
            let availablePauseJoker = data.availablePauseJoker;
            if (availablePauseJoker >= 1) {
                pauseJoker(availablePauseJoker);
            } else {
                console.log("Nicht genügend PauseJoker verfügbar.");
            }
        })
        .catch(error => console.error("Fehler beim Abrufen der verfügbaren Pause-Joker:", error));
}

function pauseJoker(availablePauseJoker) {
    if (timerRunning === true) {
        setPauseJoker(availablePauseJoker)
        clearInterval(timerInterval);
        timerRunning = false;
        document.getElementById('pauseJoker').src = "/assets/images/pauseNope.png";
    }
}

function setPauseJoker(availablePauseJoker) {
    fetch("/setPauseJoker", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ newAmountOfJokers: availablePauseJoker - 1})
    })
        .then(response => response.json())
        .then(data => {

            document.getElementById("pauseJokerAmount").innerText = data.newAmountOfJokers;
        })
        .catch(error => console.error("Fehler beim Setzen der neuen Anzahl PauseJoker:", error));
}

function useDoublePointsJoker() {
    console.log("DoublePoints Joker Test")
    fetch("/getDoublePointsJoker", {
        method:"GET",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    })
        .then(response => response.json())
        .then(data => {
            let availableDoublePointsJoker = data.availableDoublePointsJoker;
            if (availableDoublePointsJoker >= 1) {
                doublePointsJoker(availableDoublePointsJoker)
            } else {
                console.log("Nicht genügend DoublePointsJoker verfügbar.");
            }
        })
        .catch(error => console.error("Fehler beim Abrufen der verfügbaren DoublePoints-Joker:", error));
}

function doublePointsJoker(availableDoublePointsJoker) {
    if (doubleIt === false) {
        setDoublePointsJoker(availableDoublePointsJoker)
        doubleIt = true;
        document.getElementById('doublePointsJoker').src = "/assets/images/doubleItNope.png";
    }
}

function setDoublePointsJoker(availableDoublePointsJoker) {
    fetch("/setDoublePointsJoker", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ newAmountOfJokers: availableDoublePointsJoker - 1})
    })
        .then(response => response.json())
        .then(data => {

            let newAmountOfJokers = data.newAmountOfJokers;
            doublePointsJoker();
            document.getElementById("doublePointsJokerAmount").innerText = newAmountOfJokers;
        })
        .catch(error => console.error("Fehler beim Setzen der neuen Anzahl DoublePointsJoker:", error));
}
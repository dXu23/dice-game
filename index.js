class Player {
    #score;
    #roll;

    constructor() {
        this.#score = 0;
        this.#roll = null;
    }

    get score() {
        return this.#score;
    }

    get roll() {
        return this.#roll;
    }

    set roll(num) {
        this.#roll = num;
    }

    rollDie() {
        this.#roll = 1 + Math.floor(6 * Math.random());
    }

    rollForTurn(isDouble) {
        this.rollDie();
        if (isDouble) {
            this.#roll = Math.random() > 0.5 ? 2 * this.#roll : 0;
        }

        this.#score += this.#roll;
    }

    reset() {
        this.#roll = null;
        this.#score = 0;
    }
}

class PlayerView {
    #diceElem;
    #scoreElem;

    constructor({ diceId, scoreId }) {
        this.#diceElem = document.getElementById(diceId);
        this.#scoreElem = document.getElementById(scoreId);

        this.reset();
    }

    reset() {
        this.diceElemText = '-';
        this.scoreElemText = 0;
    }

    set diceElemText(roll) {
        this.#diceElem.textContent = roll || '-';
    }

    set scoreElemText(score) {
        this.#scoreElem.textContent = score;
    } 

    set active(status) {
        if (status) {
            this.#diceElem.classList.add('active');
        } else {
            this.#diceElem.classList.remove('active');
        }
    }
}


class GameView {
    #player1View;
    #player2View;
    #msgElem;

    constructor(msgId, player1Config, player2Config) {
        this.#msgElem = document.getElementById(msgId);

        this.#player1View = new PlayerView(player1Config);
        this.#player2View = new PlayerView(player2Config);
    }

    set msgText(msg) {
        this.#msgElem.textContent = msg;
    }

    set activePlayer(playerTurn) {
        if (playerTurn) {
            this.#player1View.active = true;
            this.#player2View.active = false;
        } else {
            this.#player2View.active = true;
            this.#player1View.active = false;
        }
    }

    reset() {
        this.#player1View.reset();
        this.#player2View.reset(); 

        this.#player1View.active = false;
        this.#player2View.active = false;

        this.#msgElem.textContent = 'Player With Higher Roll Goes First';
    }

    updatePlayer(playerTurn, rollNum, scoreNum) {
        if (playerTurn) {
            this.#player1View.diceElemText = rollNum;
            this.#player1View.scoreElemText = scoreNum;
        } else {
            this.#player2View.diceElemText = rollNum;
            this.#player2View.scoreElemText = scoreNum;

        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class GameController {
    #playerTurn;
    #player1;
    #player2;
    #rollBtn;
    #doubleOrNothingBtn;
    #resetBtn;
    #gameView;

    constructor({ rollBtnId, resetBtnId, doubleOrNothingId }, gameView) {
        this.#playerTurn = true;
        this.#player1 = new Player();
        this.#player2 = new Player();
        this.#rollBtn = document.getElementById(rollBtnId);
        this.#doubleOrNothingBtn = document.getElementById(doubleOrNothingId);
        this.#resetBtn = document.getElementById(resetBtnId);
        this.#gameView = gameView;


        this.#rollBtn.addEventListener('click', () => this.#takeTurn(false));

        this.#doubleOrNothingBtn.addEventListener('click', () => this.#takeTurn(true));

        this.#resetBtn.addEventListener('click', () => {
            this.#player1.reset();
            this.#player2.reset();

            this.#gameView.reset();

            this.#player1.rollDie();
            this.#player2.rollDie();


            while (this.#player1.roll === this.#player2.roll) {
                this.#gameView.msgText = 'Players have equal roll! Both players roll another time!';

                this.#gameView.updatePlayer(true, this.#player1.roll, this.#player1.score);
                this.#gameView.updatePlayer(false, this.#player2.roll, this.#player2.score);

                sleep(3000);
            }

            this.#gameView.updatePlayer(true, this.#player1.roll, this.#player1.score);
            this.#gameView.updatePlayer(false, this.#player2.roll, this.#player2.score);

            if (this.#player1.roll > this.#player2.roll) {
                this.#playerTurn = true;
                this.#gameView.msgText = 'Player 1 goes first';
            } else {
                this.#playerTurn = false;
                this.#gameView.msgText = 'Player 2 goes first';
            }

            this.#gameView.activePlayer = this.#playerTurn;
            this.#resetBtn.style.visibility = 'hidden';

            setTimeout(() => {
                this.#gameView.msgText = `Player ${this.#playerTurn ? '1' : '2'} Turn`;
                this.#player1.roll = null;
                this.#player2.roll = null;

                this.#gameView.updatePlayer(true, this.#player1.roll, this.#player1.score);
                this.#gameView.updatePlayer(false, this.#player2.roll, this.#player2.score);

                this.#doubleOrNothingBtn.style.display = 'inline-block';
                this.#rollBtn.style.display = 'inline-block';

                this.#resetBtn.style.display = 'none';
                this.#resetBtn.style.visibility = 'visible';
            }, 3000);
        });
    }

    #takeTurn(isDouble) {
        if (this.#playerTurn) {
            this.#player1.rollForTurn(isDouble);

            this.#gameView.updatePlayer(this.#playerTurn, this.#player1.roll, this.#player1.score);

            this.#gameView.msgText = 'Player 2 Turn';
        } else {
            this.#player2.rollForTurn(isDouble);

            this.#gameView.updatePlayer(this.#playerTurn, this.#player2.roll, this.#player2.score);

            this.#gameView.msgText = 'Player 1 Turn';
        }

        if (this.#player1.score >= 20) {
            this.#gameView.msgText = 'Player 1 Won 🥳';
            this.showReset();
        } else if (this.#player2.score >= 20) {
            this.#gameView.msgText = 'Player 2 Won 🎉';
            this.showReset();
        }

        this.#playerTurn = !this.#playerTurn;

        this.#gameView.activePlayer = this.#playerTurn;
    }

    showReset() {
        this.#rollBtn.style.display = 'none';
        this.#doubleOrNothingBtn.style.display = 'none';

        this.#resetBtn.textContent = 'Reset Game 🔁';
        this.#resetBtn.style.display = 'inline-block';
    }
}

let gameView = new GameView('message', 
    { diceId: 'player1-dice', scoreId: 'player1-scoreboard' },
    { diceId: 'player2-dice', scoreId: 'player2-scoreboard' }
);

let gameController = new GameController({ rollBtnId: 'roll-btn', resetBtnId: 'reset-btn', doubleOrNothingId: 'double-or-nothing-btn'}, 
   gameView
);


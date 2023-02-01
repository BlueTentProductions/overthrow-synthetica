
import Game from './js/Game';

class App {
    _game: Game | null;
    constructor() {
        this._game = null;
        this._init();
    }

    _init() {

        this._newGame();
    }

    _newGame() {
        this._game = new Game();
        this._game.animate();

    }


}


let APP = null;
window.addEventListener('DOMContentLoaded', () => {
    APP = new App();
});

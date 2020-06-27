'use strict';

window.onhashchange = renderState;

function renderState() {
    const hash = window.location.hash;
    let state = decodeURIComponent(hash.substr(1));

    if (state === '') {
        state = {pageName: 'Main'}
    } else {
        state = JSON.parse(state);
    }

    switch (state.pageName) {
        case 'Main':
            document.getElementById('gameMainPage').style.display = 'block';
            document.getElementById('gameGamePage').style.display = 'none';
            document.getElementById('gameResultPage').style.display = 'none';
            document.getElementById('gameRulesPage').style.display = 'none';
            break;
        case 'Game':
            document.getElementById('gameMainPage').style.display = 'none';
            document.getElementById('gameGamePage').style.display = 'block';
            document.getElementById('gameResultPage').style.display = 'none';
            document.getElementById('gameRulesPage').style.display = 'none';
            break;
        case 'Records':
            document.getElementById('gameMainPage').style.display = 'none';
            document.getElementById('gameGamePage').style.display = 'none';
            document.getElementById('gameResultPage').style.display = 'block';
            document.getElementById('gameRulesPage').style.display = 'none';
            break;
        case 'Rules':
            document.getElementById('gameMainPage').style.display = 'none';
            document.getElementById('gameGamePage').style.display = 'none';
            document.getElementById('gameResultPage').style.display = 'none';
            document.getElementById('gameRulesPage').style.display = 'block';
            break;
    }
}

function switchToMainPage() {
    switchToState({pageName: 'Main'});
}

function switchToGamePage() {
    switchToState({pageName: 'Game'});
}

function switchToRecordsPage() {
    switchToState({pageName: 'Records'});
}

function switchToRulesPage() {
    switchToState({pageName: 'Rules'});
}

function switchToState(state) {
    location.hash = encodeURIComponent(JSON.stringify(state));
}

renderState();
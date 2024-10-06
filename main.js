const episodePhoto = document.getElementById('episodePhoto');
const inputText = document.getElementById('epName');
const episodeNames = Object.keys(episodes);
const sugestionDiv = document.getElementById('sugestion');

let suggestion = '';
let g_closestName;
let score = 0;
let highscore = parseInt(localStorage.getItem('highscore')) || 0;
let lost = false;

updateScores();

function random(num){
    return Math.floor(Math.random() * num);
}

document.addEventListener('keydown', () => {
    inputText.focus();
});

inputText.addEventListener('input', e =>{
    let value = inputText.value;

    g_closestName = getClosestName(value) || '';

    sugestionDiv.innerHTML = g_closestName;
});



function getClosestName(input){
    if (parseInt(input) && input <= episodeNames.length){
        return episodeNames[parseInt(input)-1];
    } 
    let closestName = {};
    let mostPoints = 0;
    let mostWords = 0;
    let chosenName = '';

    episodeNames.forEach((name) => {
        let points = 0;
        let combo = 0;
        let wordsMatched = 0;
        let wordStart = true;
        let wholeWord = false;

        let max = Math.max(name.length, input.length);
        let min = Math.min(name.length, input.length);

        let lengthBonus = Math.floor((1 - Math.max(0, max - min) / Math.max(1, max)) * 100);

        let originalName = name;

        name = name.toLowerCase();
        input = input.toLowerCase();


        for (let i = 0; i < name.length; i++){ // for every letter of the actual name
            for (let j = 0; j < input.length; j++){ // try to much every letter from the input and try to continue
                // if (i == 11) debugger
                if (name[i] == ' ') {
                    if (wholeWord) wordsMatched++;
                    combo = 0;
                    wordStart = true;
                    break;
                }
                if (input[j] == ' '){
                    wordStart = true;
                    combo = 0;
                    continue;
                }
                if (name[i+combo] == input[j]){
                    if (wordStart) wholeWord = true;
                    points += 1 + combo*20;
                    combo++; // get more point for matching whole words
                    if (j == input.length - 1){
                        if (wholeWord) {
                            points += 80; // bonus when whole phraze maches with part of the name
                        }
                    }
                    wordStart = false;
                    if (wholeWord && (name[i+combo] == ' ' || !name[i+combo]) && (input[j+1] == ' ' || !input[j+1])){
                        wordsMatched++; 
                        combo = 0;
                        wordStart = true;
                        wholeWord = false;
                    } 
                }else{
                    combo = 0;
                    wholeWord = false;
                    wordStart = false;
                }
            }
        }
        
        if (points > 5) points += lengthBonus;

        points += wordsMatched * 150;

        if (points > mostPoints){
            mostPoints = points;
            closestName.points = originalName;
        }

        if (wordsMatched > mostWords){
            mostWords = wordsMatched;
            closestName.words = originalName;
        } 
    });
    
    chosenName = closestName.points;

    return chosenName;
}
//test
// getClosestName('tribe');
function loadApp(){
    let currentEpisode;
    function loadEpisodePhoto(){
        let randomNumber = random(episodeNames.length);
        let photos = episodes[episodeNames[randomNumber]];
        currentEpisode = episodeNames[randomNumber];
        let randomPhotoIndex = random(photos.length);
        let photo = photos[randomPhotoIndex];
        // load the photo
        let img = new Image();
        img.src = `images/${currentEpisode}/${photo}`;
        img.onload = () => {
            episodePhoto.style.backgroundImage = `url(${img.src})`;
        }
    }
    loadEpisodePhoto();

    document.addEventListener('keydown' , e=> {
        if (e.key == 'Enter'){
            if (lost) revive();
            else checkWin();
        }
    });
    document.getElementById('guessBtn').addEventListener('mousedown', e => {
        checkWin();
    });

    document.getElementById('tryAgainButton').addEventListener('mousedown' , e => {
        revive();
    })

    function checkWin(){
        if (lost) return;
        if (!g_closestName || g_closestName == '' || g_closestName == ' ') return;
        console.log(g_closestName)
        if (g_closestName == currentEpisode) {
            score++;
            if (score > highscore) highscore = score;
            loadEpisodePhoto();
            updateScores();
        }
        else{
            // lost 
            lost = true;
            document.getElementById('looseScreen').style.display = 'flex';
            document.getElementById('correctAnswer').innerText = "It was: \n"+currentEpisode;
        }
    }
    function revive(){
        if (!lost) return;
        document.getElementById('looseScreen').style.display = 'none';
        loadEpisodePhoto();
        score = 0;
        updateScores();
        lost = false;
        inputText.value = '';
    }
}
function updateScores(){
    document.getElementById('currentScore').innerText = 'Current Score: '+score;
    document.getElementById('highScore').innerText = 'High Score: '+highscore;
    localStorage.setItem('highscore', highscore);
}
loadApp();


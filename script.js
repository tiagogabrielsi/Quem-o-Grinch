// --- BANCO DE PERGUNTAS ---
const questionsDB = [
    { normal: "Em que ano você nasceu?", fake: "Em que ano você completou 2 anos?" },
    { normal: "Qual a cor da sua camiseta?", fake: "Qual a cor da sua calça/bermuda?" },
    { normal: "Cite um ingrediente de pizza.", fake: "Cite uma fruta." },
    { normal: "Qual seu animal favorito?", fake: "Qual animal você tem mais medo?" },
    { normal: "Onde você gostaria de passar as férias?", fake: "Onde você trabalha ou estuda?" },
    { normal: "Quanto custa 1kg de arroz?", fake: "Quanto custa 1 litro de gasolina?" },
    { normal: "Qual o nome da sua mãe?", fake: "Qual o nome da sua avó?" },
    { normal: "Qual sua sobremesa de Natal favorita?", fake: "Qual comida de Natal você não gosta?" },
    { normal: "Qual presente você mais quer ganhar?", fake: "Qual presente você odiaria ganhar?" },
    { normal: "Quantas pessoas tem na sala?", fake: "Quantas cadeiras tem na sala?" }
];

// --- ESTADO DO JOGO ---
let players = [];
let currentTurn = 0;
let impostorIndex = 0;
let currentQuestionSet = {};
let totalPlayers = 0;

// --- FUNÇÕES DE CONFIGURAÇÃO ---

// Tela para definir número de jogadores e mostrar inputs
function goToNameSetup() {
    const inputPlayers = document.getElementById('num-players');
    totalPlayers = parseInt(inputPlayers.value);
    
    if (totalPlayers < 3) {
        alert("Precisa de pelo menos 3 jogadores!");
        return;
    }

    const container = document.getElementById('names-container');
    container.innerHTML = ''; 

    // Tenta preservar nomes existentes se houver
    for (let i = 0; i < totalPlayers; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Nome do Jogador ${i + 1}`;
        input.id = `player-name-${i}`;
        input.className = 'player-name-input';
        
        // Se o jogador já existe no array, preenche o nome dele
        if (players[i] && players[i].name) {
            input.value = players[i].name;
        }

        container.appendChild(input);
    }

    switchScreen('screen-setup', 'screen-name-setup');
}

// Inicia o PRIMEIRO jogo (coleta nomes)
function startFirstGame() {
    players = []; // Zera jogadores para recriar com os nomes novos
    
    for (let i = 0; i < totalPlayers; i++) {
        const nameInput = document.getElementById(`player-name-${i}`);
        const finalName = nameInput.value.trim() || `Jogador ${i + 1}`;

        players.push({
            id: i,
            name: finalName,
            role: 'normal', // Será definido no setupRound
            answer: ''
        });
    }

    setupRound();
}

// --- LÓGICA DO JOGO ---

// Prepara a rodada (sorteia impostor e perguntas)
function setupRound() {
    // Reseta papel de todos para 'normal'
    players.forEach(p => {
        p.role = 'normal';
        p.answer = ''; // Limpa resposta anterior
    });

    // Sorteios
    impostorIndex = Math.floor(Math.random() * players.length);
    players[impostorIndex].role = 'impostor';

    const qIndex = Math.floor(Math.random() * questionsDB.length);
    currentQuestionSet = questionsDB[qIndex];

    currentTurn = 0;
    
    // Se vier da tela de nomes ou resultado
    document.getElementById('screen-name-setup').classList.add('hidden');
    document.getElementById('screen-result').classList.add('hidden');
    
    const passScreen = document.getElementById('screen-pass');
    passScreen.classList.remove('hidden');
    passScreen.classList.add('fade-in');
    
    updateTurnDisplay();
}

// --- FUNÇÕES DAS OPÇÕES FINAIS ---

// Opção 1: Próxima Rodada (Mesmos jogadores)
function nextRoundSamePlayers() {
    // Simplesmente chama o setupRound, pois o array 'players' já tem os nomes
    setupRound();
}

// Opção 2: Mudar Jogadores (Volta para a tela inicial)
function modifyPlayers() {
    switchScreen('screen-result', 'screen-setup');
}

// Opção 3: Terminar Jogo
function endGame() {
    // Recarrega a página para zerar tudo
    location.reload();
}


// --- FUNÇÕES DE FLUXO DO JOGO (Turnos, Votação) ---

function updateTurnDisplay() {
    document.getElementById('player-turn-display').innerText = players[currentTurn].name;
}

function revealQuestion() {
    const player = players[currentTurn];
    document.getElementById('current-player-name').innerText = player.name;
    
    const textElement = document.getElementById('question-text');
    if (player.role === 'impostor') {
        textElement.innerText = currentQuestionSet.fake;
        textElement.style.color = "var(--primary-red)"; 
    } else {
        textElement.innerText = currentQuestionSet.normal;
        textElement.style.color = "var(--dark-grey)";
    }

    document.getElementById('player-answer').value = ''; 
    switchScreen('screen-pass', 'screen-question');
}

function submitAnswer() {
    const answerInput = document.getElementById('player-answer');
    const answer = answerInput.value.trim();
    
    if (!answer) {
        alert("Por favor, escreva uma resposta!");
        return;
    }

    players[currentTurn].answer = answer;
    currentTurn++;

    if (currentTurn < players.length) {
        updateTurnDisplay();
        switchScreen('screen-question', 'screen-pass');
    } else {
        showDiscussion();
    }
}

function showDiscussion() {
    document.getElementById('official-question-display').innerText = currentQuestionSet.normal;
    
    const container = document.getElementById('answers-container');
    container.innerHTML = '';

    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'answer-item';
        div.innerHTML = `<strong>${p.name}:</strong> ${p.answer}`;
        container.appendChild(div);
    });

    switchScreen('screen-question', 'screen-discussion');
}

function goToVoting() {
    const votingContainer = document.getElementById('voting-buttons');
    votingContainer.innerHTML = '';

    players.forEach((p, index) => {
        const btn = document.createElement('button');
        btn.innerText = `Votar em ${p.name}`; // Usa nome
        btn.onclick = () => checkResult(index);
        votingContainer.appendChild(btn);
        feather.replace(); // Atualiza ícones se houver
    });

    switchScreen('screen-discussion', 'screen-voting');
}

function checkResult(votedIndex) {
    const title = document.getElementById('result-title');
    const msg = document.getElementById('result-message');
    const impostorData = players[impostorIndex];
    const votedPlayerName = players[votedIndex].name;

    if (votedIndex === impostorIndex) {
        title.innerText = "🎉 ACERTARAM!";
        title.style.color = "var(--secondary-green)";
        msg.innerText = `A família descobriu! ${votedPlayerName} era o impostor!`;
    } else {
        title.innerText = "😈 O IMPOSTOR VENCEU!";
        title.style.color = "var(--primary-red)";
        msg.innerText = `Vocês erraram! ${votedPlayerName} era inocente.`;
    }

    document.getElementById('real-impostor').innerText = impostorData.name;
    document.getElementById('impostor-question-text').innerText = currentQuestionSet.fake;

    switchScreen('screen-voting', 'screen-result');
}

function switchScreen(hideId, showId) {
    document.getElementById(hideId).classList.add('hidden');
    const showEl = document.getElementById(showId);
    showEl.classList.remove('hidden');
    showEl.classList.add('fade-in');
    
    // Re-inicializa ícones feather caso tenha ícones na nova tela
    if(typeof feather !== 'undefined') feather.replace();
}
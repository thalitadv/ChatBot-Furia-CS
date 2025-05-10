document.addEventListener('DOMContentLoaded', function() {
  // *Elementos do DOM*
  const chatMessages = document.querySelector('.chat__messages');
  const chatInput = document.querySelector('.chat__input');
  const chatButton = document.querySelector('.chat__button');
  
  // *Estado do chat e varíaveis globais*
  let currentState = 'modeSelection';
  let selectedMode = null; //
  let currentMenu = null;
  let lastMenu = [];
  let furiaData = null;
  
  // *Carrega os dados do JSON*
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      furiaData = data;
      initializeChat();
    })
    .catch(error => {
      console.error('Erro ao carregar os dados:', error);
      displayBotMessage('Desculpe, ocorreu um erro ao carregar os dados. Por favor, recarregue a página.');
    });

    
  // *Funções Principais*
  /*
   * Inicializa o chat configurando os listeners de eventos
   * e exibindo a primeira mensagem com opções de modo
   */
  function initializeChat() {
    displayBotMessage("Escolha seu modo de interação:");
    showModeOptions();
    
    // Envio de mensagem pelo botão
    chatButton.addEventListener('click', sendMessage);
    
    // Envio de mensagem pelo Enter
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // Processa e envia a mensagem do usuário
  function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
      displayUserMessage(message);
      chatInput.value = '';
      processUserInput(message);
    }
  }
  
  function processUserInput(input) {
    switch(currentState) {
      case 'modeSelection':
        handleModeSelection(input);
        break;
      case 'mainMenu':
        handleMainMenu(input);
        break;
      case 'subMenu':
        handleSubMenu(input);
        break;
      case 'infoDisplay':
        handleInfoDisplay(input);
        break;
      default:
        displayBotMessage(getResponse('invalidOption'));
    }
  }
  
  // *Manipuladores de estado*
  // Processa a seleção inicial do modo (assistant/fan)
  function handleModeSelection(input) {
    const mode = input.toLowerCase();
    if (mode.includes('assistant') || mode === '1') {
      selectedMode = 'assistant';
      currentState = 'mainMenu';
      displayBotMessage(furiaData.modes.assistant.welcome);
      showMainOptions();
    } else if (mode.includes('fan') || mode === '2') {
      selectedMode = 'fan';
      currentState = 'mainMenu';
      displayBotMessage(furiaData.modes.fan.welcome);
      showMainOptions();
    } else {
      displayBotMessage("Opção inválida. Escolha 1-Assistente ou 2-Torcedor");
      showModeOptions();
    }
  }
  
  // Processa a seleção no menu principal
  function handleMainMenu(input) {
    const option = input.charAt(0);
    if (furiaData.mainMenu[option]) {
      lastMenu.push(currentMenu);
      currentMenu = option;
      currentState = 'subMenu';
      
      const menuTitle = getMenuTitle(option);
      displayBotMessage(`Você selecionou: ${menuTitle}`);
      displayBotMessage(getResponse('chooseOption'));
      
      showSubOptions();
    } else {
      displayBotMessage(getResponse('invalidOption'));
      showMainOptions();
    }
  }
  
  // Processa a seleção no submenu
  function handleSubMenu(input) {
    const option = input.charAt(0);
    const menu = furiaData.mainMenu[currentMenu];
    
    if (menu.options[option]) {
      displayInfo(option);
    } else {
      displayBotMessage(getResponse('invalidOption'));
      showSubOptions();
    }
  }
  
  // Processa as ações após exibir informações (voltar/saber mais)
  function handleInfoDisplay(input) {
    const option = input.charAt(0);
    if (option === '1') {
      currentState = 'subMenu';
      displayBotMessage(getResponse('chooseOption'));
      showSubOptions();
    } else if (option === '2') {
      currentMenu = lastMenu.pop() || null;
      currentState = 'mainMenu';
      displayBotMessage(getResponse('chooseOption'));
      showMainOptions();
    } else {
      displayBotMessage(getResponse('invalidOption'));
      showBackOptions();
    }
  }
  
    // *Funções de exibição*
  function displayInfo(option) {
    currentState = 'infoDisplay';
    
    const menu = furiaData.mainMenu[currentMenu];
    const infoContent = menu.info[option][selectedMode];
    
    displayBotMessage(infoContent);
    showBackOptions();
  }
  
   // Exibe as opções iniciais de modo
  function showModeOptions() {
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    
    const option1 = createOptionButton('1', `Modo ${furiaData.modes.assistant.name}`);
    const option2 = createOptionButton('2', `Modo ${furiaData.modes.fan.name}`);
    
    optionsContainer.appendChild(option1);
    optionsContainer.appendChild(option2);
    chatMessages.appendChild(optionsContainer);
    scrollToBottom();
  }
  
   // Exibe as opções do menu principal
  function showMainOptions() {
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    
    for (const [key, value] of Object.entries(furiaData.mainMenu)) {
      const title = getMenuTitle(key);
      const option = createOptionButton(key, title);
      optionsContainer.appendChild(option);
    }
    
    chatMessages.appendChild(optionsContainer);
    scrollToBottom();
  }
  
  // Exibe as opções do submenu
  function showSubOptions() {
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    const menu = furiaData.mainMenu[currentMenu];
    
    for (const [key, value] of Object.entries(menu.options)) {
      const option = createOptionButton(key, value);
      optionsContainer.appendChild(option);
    }
    
    chatMessages.appendChild(optionsContainer);
    scrollToBottom();
  }
  
  // Exibe as opções de retorno
  function showBackOptions() {
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    
    const option1 = createOptionButton('1', 'Saber mais sobre esta categoria');
    const option2 = createOptionButton('2', 'Voltar ao menu principal');
    
    optionsContainer.appendChild(option1);
    optionsContainer.appendChild(option2);
    chatMessages.appendChild(optionsContainer);
    scrollToBottom();
  }
  
  // *Funções auxiliares*
  function createOptionButton(number, text) {
    const button = document.createElement('button');
    button.className = 'option-button';
    
    button.innerHTML = `
      <span class="option-number">${number}</span>
      <span class="option-text">${text}</span>
    `;
    
    button.addEventListener('click', function() {
      displayUserMessage(`${number}. ${text}`);
      processUserInput(number);
    });
    
    return button;
  }
  

  // Obtém o título de um menu formatado para o modo atual
  function getMenuTitle(menuKey) {
    const menu = furiaData.mainMenu[menuKey];
    return (typeof menu.title === 'object') ? menu.title[selectedMode] : menu.title;
  }
  
  // Obtém uma mensagem de resposta pré-definida
  function getResponse(type) {
    return furiaData.responses[type][selectedMode] || furiaData.responses[type];
  }
  
  // Exibe uma mensagem do bot no chat
  function displayBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = text;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
  }
  
  // Exibe uma mensagem do usuário no chat
  function displayUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
  }
  // Rolagem automática do chat
  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
import './style.css';

// API endpoints (will be replaced with real API later)
const API_BASE = '/api'; // Placeholder

// State
let state = {
  neural: 'idle', // idle | listening | processing
  system: { cpu: 0, memory: 0, disk: 0 },
  trading: { ethPrice: 0, change24h: 0, profit: 0 },
  energy: { score: 90, workToday: 0, breaks: 0 },
  tasks: { active: 0, proposable: 0, acceptance: 0 },
  reminders: []
};

// Initialize
function init() {
  console.log('🚀 Friday OS initializing...');
  
  // Load initial data
  loadSystemData();
  loadTradingData();
  loadEnergyData();
  loadTasksData();
  loadReminders();
  
  // Start update loop
  setInterval(updateAll, 5000); // Update every 5s
  
  // Terminal input
  const input = document.getElementById('command-input');
  input.addEventListener('keydown', handleCommand);
  
  // Demo: Cycle neural states
  setTimeout(() => setNeuralState('listening'), 3000);
  setTimeout(() => setNeuralState('processing'), 6000);
  setTimeout(() => setNeuralState('idle'), 9000);
  
  logTerminal('Friday OS initialized');
  logTerminal('Type "help" for commands');
}

// Load data functions (mock for now, will integrate real APIs)
async function loadSystemData() {
  try {
    // Mock data - replace with real exec('top') later
    state.system = {
      cpu: Math.floor(Math.random() * 40) + 10,
      memory: Math.floor(Math.random() * 30) + 40,
      disk: 31
    };
    updateSystemUI();
  } catch (e) {
    console.error('Failed to load system data:', e);
  }
}

async function loadTradingData() {
  try {
    // Read from trading/price-history.json
    const response = await fetch('/trading-data.json').catch(() => null);
    if (response && response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        const latest = data[data.length - 1];
        state.trading = {
          ethPrice: latest.price,
          change24h: latest.change24h,
          profit: 0 // From arbitrage-state.json
        };
      }
    } else {
      // Mock data
      state.trading = {
        ethPrice: 2847.32,
        change24h: 1.24,
        profit: 0.00
      };
    }
    updateTradingUI();
  } catch (e) {
    console.error('Failed to load trading data:', e);
  }
}

async function loadEnergyData() {
  try {
    // Read from memory/energy-state.json
    const response = await fetch('/energy-data.json').catch(() => null);
    if (response && response.ok) {
      const data = await response.json();
      state.energy = {
        score: data.energyScore || 90,
        workToday: data.totalWorkToday || 0,
        breaks: data.breaksTaken || 0
      };
    } else {
      // Mock data
      state.energy = {
        score: 90,
        workToday: 0,
        breaks: 0
      };
    }
    updateEnergyUI();
  } catch (e) {
    console.error('Failed to load energy data:', e);
  }
}

async function loadTasksData() {
  try {
    // Read from memory/task-orchestrator-state.json
    state.tasks = {
      active: 1,
      proposable: 1,
      acceptance: 0
    };
    updateTasksUI();
  } catch (e) {
    console.error('Failed to load tasks data:', e);
  }
}

async function loadReminders() {
  try {
    // Read from memory/smart-reminders.json
    state.reminders = [
      { text: 'Test reminder - Ring Rawan', dueTime: '21:00', priority: 'medium' }
    ];
    updateRemindersUI();
  } catch (e) {
    console.error('Failed to load reminders:', e);
  }
}

// Update UI functions
function updateSystemUI() {
  document.getElementById('cpu-bar').style.width = `${state.system.cpu}%`;
  document.getElementById('cpu-value').textContent = `${state.system.cpu}%`;
  
  document.getElementById('memory-bar').style.width = `${state.system.memory}%`;
  document.getElementById('memory-value').textContent = `${state.system.memory}%`;
  
  document.getElementById('disk-bar').style.width = `${state.system.disk}%`;
  document.getElementById('disk-value').textContent = `${state.system.disk}%`;
}

function updateTradingUI() {
  document.getElementById('eth-price').textContent = `$${state.trading.ethPrice.toFixed(2)}`;
  
  const change = state.trading.change24h;
  const changeEl = document.getElementById('eth-change');
  changeEl.textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
  changeEl.style.color = change > 0 ? 'var(--accent-green)' : 'var(--accent-red)';
  
  document.getElementById('profit').textContent = `$${state.trading.profit.toFixed(2)}`;
}

function updateEnergyUI() {
  const score = state.energy.score;
  document.getElementById('energy-score').textContent = score;
  
  // Update circle (stroke-dashoffset calculation)
  const circumference = 251.2;
  const offset = circumference - (score / 100) * circumference;
  document.getElementById('energy-circle').style.strokeDashoffset = offset;
  
  // Color based on score
  const circle = document.getElementById('energy-circle');
  if (score >= 70) circle.style.stroke = 'var(--accent-green)';
  else if (score >= 40) circle.style.stroke = 'var(--accent-amber)';
  else circle.style.stroke = 'var(--accent-red)';
  
  // Work time
  const hours = Math.floor(state.energy.workToday / 60);
  const mins = Math.round(state.energy.workToday % 60);
  document.getElementById('work-today').textContent = `${hours}h ${mins}m`;
  
  document.getElementById('breaks-today').textContent = state.energy.breaks;
}

function updateTasksUI() {
  document.getElementById('tasks-active').textContent = state.tasks.active;
  document.getElementById('tasks-proposable').textContent = state.tasks.proposable;
  document.getElementById('task-acceptance').textContent = `${state.tasks.acceptance}%`;
}

function updateRemindersUI() {
  const container = document.getElementById('reminders-list');
  
  if (state.reminders.length === 0) {
    container.innerHTML = '<div class="empty">No reminders due</div>';
    return;
  }
  
  container.innerHTML = state.reminders.map(r => `
    <div class="metric">
      <span>${r.text}</span>
      <span class="value">${r.dueTime}</span>
    </div>
  `).join('');
}

// Neural core state
function setNeuralState(newState) {
  state.neural = newState;
  const core = document.getElementById('neural-core');
  core.className = `state-${newState}`;
  
  const statusText = {
    idle: 'Idle',
    listening: 'Listening',
    processing: 'Processing'
  }[newState];
  
  document.querySelector('.core-status').textContent = statusText;
  logTerminal(`Neural state: ${newState.toUpperCase()}`);
}

// Terminal
function logTerminal(message) {
  const logs = document.getElementById('terminal-logs');
  const timestamp = new Date().toLocaleTimeString('da-DK', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  
  const line = document.createElement('div');
  line.textContent = `[${timestamp}] ${message}`;
  logs.appendChild(line);
  logs.scrollTop = logs.scrollHeight;
}

function handleCommand(event) {
  if (event.key !== 'Enter') return;
  
  const input = event.target;
  const command = input.value.trim();
  
  if (!command) return;
  
  logTerminal(`$ ${command}`);
  input.value = '';
  
  // Execute command
  executeCommand(command);
}

function executeCommand(cmd) {
  const [command, ...args] = cmd.toLowerCase().split(' ');
  
  switch (command) {
    case 'help':
      logTerminal('Available commands:');
      logTerminal('  status - Show system status');
      logTerminal('  energy - Show energy tracker');
      logTerminal('  tasks - Show task queue');
      logTerminal('  clear - Clear terminal');
      break;
      
    case 'status':
      logTerminal(`CPU: ${state.system.cpu}% | Memory: ${state.system.memory}% | Disk: ${state.system.disk}%`);
      logTerminal(`ETH: $${state.trading.ethPrice.toFixed(2)} (${state.trading.change24h > 0 ? '+' : ''}${state.trading.change24h.toFixed(2)}%)`);
      break;
      
    case 'energy':
      logTerminal(`Energy: ${state.energy.score}/100`);
      logTerminal(`Work today: ${Math.floor(state.energy.workToday / 60)}h ${Math.round(state.energy.workToday % 60)}m`);
      logTerminal(`Breaks: ${state.energy.breaks}`);
      break;
      
    case 'tasks':
      logTerminal(`Active: ${state.tasks.active} | Proposable: ${state.tasks.proposable}`);
      logTerminal(`Acceptance rate: ${state.tasks.acceptance}%`);
      break;
      
    case 'clear':
      document.getElementById('terminal-logs').innerHTML = '';
      break;
      
    default:
      logTerminal(`Unknown command: ${command}`);
      logTerminal('Type "help" for available commands');
  }
}

// Update all data
async function updateAll() {
  await loadSystemData();
  await loadTradingData();
  await loadEnergyData();
  await loadTasksData();
  await loadReminders();
}

// Start
init();

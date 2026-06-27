// JCI UNIFY PROJECT CHALLENGE — UI Rendering Engine
'use strict';

const UI = {
  root: null,
  currentView: null,
  toast_queue: [],
  _toastTimer: null,
  _cb: null,   // stored callback for modal continue buttons

  _run() {
    const fn = this._cb;
    this._cb = null;
    if (fn) fn();
  },

  init() {
    this.root = document.getElementById('app');
    ENGINE.load();
    if (ENGINE.state.phase === 'game' || ENGINE.state.phase === 'ended') {
      this.renderGame();
    } else {
      this.renderLobby();
    }
  },

  // ──────────────────────────────────────────────
  // TOP-LEVEL ROUTER
  // ──────────────────────────────────────────────

  render() {
    const phase = ENGINE.state.phase;
    if (phase === 'lobby') this.renderLobby();
    else if (phase === 'game') this.renderGame();
    else if (phase === 'ended') this.renderEndGame();
  },

  // ──────────────────────────────────────────────
  // LOBBY
  // ──────────────────────────────────────────────

  renderLobby() {
    this.root.innerHTML = `
      <div class="lobby-screen">
        <div class="logo-block">
          <div class="jci-logo">JCI</div>
          <h1 class="game-title">UNIFY PROJECT CHALLENGE</h1>
          <p class="game-subtitle">The JCI Project Management Simulation</p>
        </div>
        <div class="lobby-cards">
          <div class="lobby-card primary" onclick="UI.showCreateRoom()">
            <div class="card-icon">🏠</div>
            <h2>Create Room</h2>
            <p>Start a new game session. Invite your team with a room code.</p>
          </div>
          <div class="lobby-card" onclick="UI.showJoinRoom()">
            <div class="card-icon">🔗</div>
            <h2>Join Room</h2>
            <p>Enter a room code to join an existing game session.</p>
          </div>
          <div class="lobby-card" onclick="UI.showSoloSetup()">
            <div class="card-icon">🎮</div>
            <h2>Practice Mode</h2>
            <p>Single-device mode for training sessions or solo play.</p>
          </div>
        </div>
        <div class="lobby-footer">
          <p>No installation · No account · Works offline · Room codes only</p>
        </div>
      </div>
    `;
  },

  showCreateRoom() {
    const code = ENGINE.generateRoomCode();
    UI._storedRoomCode = code;
    this.showModal(`
      <h2>Create a Game Room</h2>
      <div class="room-code-display">${code}</div>

      <div class="form-group">
        <label>Connection Mode</label>
        <select id="conn-mode" onchange="UI._onConnModeChange()">
          <option value="peer">Online — different devices (recommended)</option>
          <option value="broadcast">Browser Tabs — same browser</option>
          <option value="local">Local — hot-seat on one device</option>
        </select>
      </div>

      <!-- Online / broadcast: each device joins with their own team -->
      <div id="online-section">
        <p class="hint">Each team joins from their own device using the code above. You enter only your own team here.</p>
        <div class="form-group">
          <label>Total Number of Teams</label>
          <select id="num-teams">
            <option value="2">2 Teams</option>
            <option value="3">3 Teams</option>
            <option value="4">4 Teams</option>
            <option value="5">5 Teams</option>
            <option value="6">6 Teams</option>
          </select>
        </div>
        <div class="form-group">
          <label>Your Team Name</label>
          <input type="text" id="host-team-name" placeholder="e.g. JCI Panthers" />
        </div>
        <div class="form-group">
          <label>Your Team Members (comma-separated)</label>
          <input type="text" id="host-team-members" placeholder="e.g. Mitchel, Sarah" />
        </div>
        <button class="btn-primary" onclick="UI._createRoom()">Create Room &amp; Wait for Teams</button>
      </div>

      <!-- Local hot-seat: all teams entered upfront on one device -->
      <div id="local-section" style="display:none">
        <p class="hint">All teams take turns on this one device.</p>
        <div class="form-group">
          <label>Number of Teams</label>
          <select id="local-num-teams" onchange="UI._generateLocalTeamSetup()">
            <option value="2">2 Teams</option>
            <option value="3">3 Teams</option>
            <option value="4">4 Teams</option>
            <option value="5">5 Teams</option>
            <option value="6">6 Teams</option>
          </select>
        </div>
        <div id="team-setup-container"></div>
        <button class="btn-primary" onclick="UI._generateLocalTeamSetup()">Configure Teams</button>
      </div>
    `, null, { wide: true });
  },

  _onConnModeChange() {
    const mode = document.getElementById('conn-mode').value;
    document.getElementById('online-section').style.display = mode === 'local' ? 'none' : '';
    document.getElementById('local-section').style.display = mode === 'local' ? '' : 'none';
  },

  _generateLocalTeamSetup() {
    const n = parseInt(document.getElementById('local-num-teams').value) || 2;
    const container = document.getElementById('team-setup-container');
    let html = '<div class="team-setup-grid">';
    for (let i = 1; i <= n; i++) {
      html += `
        <div class="team-setup-card">
          <h3>Team ${i}</h3>
          <div class="form-group">
            <label>Team Name</label>
            <input type="text" id="team-name-${i}" placeholder="e.g. JCI Panthers" />
          </div>
          <div class="form-group">
            <label>Member Names (comma-separated)</label>
            <input type="text" id="team-members-${i}" placeholder="e.g. Mitchel, Sarah, David" />
          </div>
        </div>
      `;
    }
    html += `</div>
      <button class="btn-primary" style="margin-top:1rem" onclick="UI._startLocalGame(${n})">
        Start Hot-Seat Game
      </button>
    `;
    container.innerHTML = html;
  },

  _startLocalGame(n) {
    const teams = [];
    for (let i = 1; i <= n; i++) {
      const name = (document.getElementById(`team-name-${i}`)?.value || `Team ${i}`).trim();
      const membersRaw = document.getElementById(`team-members-${i}`)?.value || '';
      const players = membersRaw.split(',').map(s => s.trim()).filter(Boolean);
      if (players.length === 0) players.push('Member 1');
      teams.push({ name, players });
    }
    ENGINE.initLocalGame(teams);
    this.closeModal();
    this.renderGame();
  },

  async _createRoom() {
    const mode = document.getElementById('conn-mode')?.value || 'peer';
    const n = parseInt(document.getElementById('num-teams')?.value) || 2;
    const hostName = (document.getElementById('host-team-name')?.value || 'Host Team').trim();
    const membersRaw = document.getElementById('host-team-members')?.value || '';
    const players = membersRaw.split(',').map(s => s.trim()).filter(Boolean);
    if (players.length === 0) players.push('Host');

    this.showToast('Creating room...', 'info');
    const result = await NETWORK.init(mode, 'host', UI._storedRoomCode);
    if (!result.ok) {
      this.showToast('Network failed: ' + result.error, 'error');
      return;
    }

    NETWORK.totalSlots = n;
    NETWORK.myTeamIndex = 0;
    NETWORK.pendingTeams = [{ name: hostName, players, peerId: NETWORK.playerId }];
    NETWORK.setupMessageHandler();
    ENGINE.state.room.mode = mode;
    ENGINE.state.room.code = UI._storedRoomCode;

    this.closeModal();
    this._showWaitingRoom();
  },

  _showWaitingRoom() {
    const code = UI._storedRoomCode || ENGINE.state.room.code;
    const total = NETWORK.totalSlots;
    const teams = NETWORK.pendingTeams;
    const isHost = NETWORK.role === 'host';

    this.root.innerHTML = `
      <div class="lobby-screen">
        <div class="logo-block">
          <div class="jci-logo">JCI</div>
          <h1 class="game-title">UNIFY PROJECT CHALLENGE</h1>
        </div>
        <div class="waiting-room">
          <h2>${isHost ? 'Waiting for Teams' : 'Waiting for Host'}</h2>
          <div class="room-code-display">${code}</div>
          <p class="hint">${isHost
            ? 'Share this code. Each team opens the game and clicks Join Room.'
            : 'You\'re in! Your team was registered. Waiting for the host to start.'}</p>
          <div class="team-slots" id="team-slots">
            ${this._renderTeamSlots(teams, total)}
          </div>
          ${isHost ? `
            <button class="btn-primary" id="btn-start-game"
              ${teams.length < 1 ? 'disabled' : ''}
              onclick="UI._hostStartGame()">
              Start Game (${teams.length}/${total} teams ready)
            </button>
            <p class="hint" style="margin-top:.5rem">You can start with however many teams are in.</p>
          ` : `
            <div class="waiting-msg">⏳ Waiting for host to start the game...</div>
          `}
        </div>
      </div>
    `;
  },

  _renderTeamSlots(teams, total) {
    let html = '';
    for (let i = 0; i < total; i++) {
      const t = teams[i];
      html += `<div class="team-slot ${t ? 'filled' : 'empty'}">
        <span class="slot-num">${i + 1}</span>
        ${t
          ? `<span class="slot-name">${t.name}</span><span class="slot-tag">${i === 0 ? 'Host' : 'Joined'}</span>`
          : `<span class="slot-name">Waiting for team ${i + 1}...</span>`
        }
      </div>`;
    }
    return html;
  },

  _updateWaitingRoom() {
    const teams = NETWORK.pendingTeams;
    const total = NETWORK.totalSlots;
    const slotsEl = document.getElementById('team-slots');
    if (slotsEl) slotsEl.innerHTML = this._renderTeamSlots(teams, total);
    const btn = document.getElementById('btn-start-game');
    if (btn) {
      btn.disabled = teams.length < 1;
      btn.textContent = `Start Game (${teams.length}/${total} teams ready)`;
    }
    if (NETWORK.role !== 'host') {
      // Client: re-render waiting room to show updated team list
      const slotsEl2 = document.getElementById('team-slots');
      if (!slotsEl2) this._showWaitingRoom();
    }
  },

  _onTeamAssigned(teamIndex) {
    this.showToast(`You are Team ${teamIndex + 1}!`, 'success');
  },

  _hostStartGame() {
    const teamData = NETWORK.pendingTeams;
    ENGINE.initLocalGame(teamData);
    ENGINE.state.room.mode = NETWORK.mode;
    ENGINE.state.room.code = UI._storedRoomCode;
    ENGINE.state.currentTeamIndex = 0; // host plays team 0

    // Build peerId → teamIndex map
    const assignments = {};
    teamData.forEach((t, i) => { assignments[t.peerId] = i; });
    assignments[NETWORK.playerId] = 0;

    NETWORK.myTeamIndex = 0;
    ENGINE.state.currentTeamIndex = 0;

    NETWORK.send({ type: 'game_start', state: ENGINE.state, assignments });
    this.renderGame();
  },

  showJoinRoom() {
    this.showModal(`
      <h2>Join a Room</h2>
      <div class="form-group">
        <label>Room Code</label>
        <input type="text" id="join-code" placeholder="JCI-XXXX" class="code-input" maxlength="8"
          oninput="this.value=this.value.toUpperCase()" />
      </div>
      <div class="form-group">
        <label>Your Team Name</label>
        <input type="text" id="join-team-name" placeholder="e.g. JCI Lions" />
      </div>
      <div class="form-group">
        <label>Team Members (comma-separated)</label>
        <input type="text" id="join-team-members" placeholder="e.g. John, Maria, Priya" />
      </div>
      <button class="btn-primary" onclick="UI._joinRoom()">Join Game</button>
    `);
  },

  async _joinRoom() {
    const code = (document.getElementById('join-code')?.value || '').toUpperCase().trim();
    const teamName = (document.getElementById('join-team-name')?.value || 'My Team').trim();
    const membersRaw = document.getElementById('join-team-members')?.value || '';
    const players = membersRaw.split(',').map(s => s.trim()).filter(Boolean);
    if (players.length === 0) players.push('Player');

    if (!code.match(/^JCI-[A-Z0-9]{4}$/)) {
      this.showToast('Invalid room code — format is JCI-XXXX', 'error'); return;
    }

    this.showToast('Connecting...', 'info');
    const result = await NETWORK.init('peer', 'client', code);
    if (!result.ok) {
      this.showToast(result.error, 'error'); return;
    }

    NETWORK.setupMessageHandler();
    NETWORK.send({ type: 'team_register', teamName, playerNames: players });
    this.closeModal();

    // Show client waiting screen
    UI._storedRoomCode = code;
    NETWORK.totalSlots = 99; // unknown until waiting_room_update
    NETWORK.pendingTeams = [];
    this._showWaitingRoom();
    this.showToast('Connected! Waiting for host to start...', 'success');
  },

  showSoloSetup() {
    this.showModal(`
      <h2>Practice Mode</h2>
      <p>Single-device mode — perfect for training or solo exploration.</p>
      <div class="form-group">
        <label>Number of Teams</label>
        <select id="solo-teams">
          <option value="1">1 Team (full game)</option>
          <option value="2" selected>2 Teams</option>
          <option value="3">3 Teams</option>
        </select>
      </div>
      <div id="solo-team-container"></div>
      <button class="btn-primary" onclick="UI._generateSoloTeams()">Set Up Teams</button>
    `);
    document.getElementById('solo-teams').addEventListener('change', UI._generateSoloTeams);
  },

  _generateSoloTeams() {
    const n = parseInt(document.getElementById('solo-teams').value) || 2;
    const container = document.getElementById('solo-team-container');
    let html = '<div class="team-setup-grid">';
    for (let i = 1; i <= n; i++) {
      html += `
        <div class="team-setup-card">
          <h3>Team ${i}</h3>
          <input type="text" id="solo-name-${i}" placeholder="Team name" value="Team ${i}" />
        </div>
      `;
    }
    html += `</div><button class="btn-primary" style="margin-top:1rem" onclick="UI._startSolo(${n})">Start Practice</button>`;
    container.innerHTML = html;
  },

  _startSolo(n) {
    const teams = [];
    for (let i = 1; i <= n; i++) {
      const name = (document.getElementById(`solo-name-${i}`)?.value || `Team ${i}`).trim();
      teams.push({ name, players: ['Player 1'] });
    }
    ENGINE.initLocalGame(teams);
    this.closeModal();
    this.renderGame();
  },

  // ──────────────────────────────────────────────
  // GAME SCREEN
  // ──────────────────────────────────────────────

  renderGame() {
    const state = ENGINE.state;
    const phaseData = ENGINE.PHASES[state.currentPhase - 1];

    // In peer mode each device plays only their own team
    if (NETWORK.mode !== 'local' && NETWORK.myTeamIndex >= 0) {
      state.currentTeamIndex = NETWORK.myTeamIndex;
    }

    const team = ENGINE.getCurrentTeam();
    const allTeams = state.teams;

    if (!phaseData || !team) {
      this.renderEndGame();
      return;
    }

    this.root.innerHTML = `
      <div class="game-screen">
        ${this._renderGameHeader(phaseData, team, allTeams)}
        <div class="game-body">
          <div class="phase-panel">
            <div class="phase-header">
              <div class="phase-number">Phase ${state.currentPhase}/16</div>
              <h2 class="phase-title">${phaseData.name}</h2>
              <div class="team-badge" style="background:${team.color}">${team.name}</div>
            </div>
            <div class="phase-content" id="phase-content">
              ${this._renderPhase(state.currentPhase, team)}
            </div>
          </div>
          <div class="sidebar">
            ${this._renderVarsPanel(team)}
            ${this._renderLeaderboardMini()}
          </div>
        </div>
      </div>
    `;
  },

  _renderGameHeader(phaseData, team, allTeams) {
    const steps = ENGINE.PHASES.map((p, i) => {
      const done = ENGINE.state.currentPhase > p.id;
      const current = ENGINE.state.currentPhase === p.id;
      return `<div class="phase-step ${done ? 'done' : ''} ${current ? 'current' : ''}" title="${p.name}">
        <span>${done ? '✓' : p.id}</span>
      </div>`;
    }).join('');

    return `
      <header class="game-header">
        <div class="header-left">
          <div class="jci-logo-sm">JCI</div>
          <span class="header-title">UNIFY Challenge</span>
        </div>
        <div class="phase-progress">${steps}</div>
        <div class="header-right">
          <button class="btn-sm" onclick="UI.showLeaderboard()">📊 Scores</button>
          <button class="btn-sm danger" onclick="UI.confirmReset()">✕ Reset</button>
        </div>
      </header>
    `;
  },

  _renderVarsPanel(team) {
    const v = team.vars;
    const vars = [
      { label: 'Budget', value: `$${v.budget.toLocaleString()}`, icon: '💰', raw: Math.min(100, v.budget / 50), color: v.budget > 1000 ? '#10B981' : v.budget > 0 ? '#F59E0B' : '#EF4444' },
      { label: 'Attendance', value: v.attendance, icon: '👥', raw: Math.min(100, v.attendance / 2), color: '#3B82F6' },
      { label: 'Vol. Morale', value: v.volunteerMorale, icon: '❤️', raw: v.volunteerMorale, color: v.volunteerMorale > 60 ? '#10B981' : v.volunteerMorale > 30 ? '#F59E0B' : '#EF4444' },
      { label: 'Sponsor Sat.', value: v.sponsorSatisfaction, icon: '🤝', raw: v.sponsorSatisfaction, color: v.sponsorSatisfaction > 60 ? '#10B981' : '#F59E0B' },
      { label: 'Community Rep.', value: v.communityReputation, icon: '🌟', raw: v.communityReputation, color: '#8B5CF6' },
      { label: 'Marketing Eff.', value: v.marketingEffectiveness, icon: '📢', raw: v.marketingEffectiveness, color: '#EC4899' },
      { label: 'Risk Level', value: v.riskExposure, icon: '⚠️', raw: v.riskExposure, color: v.riskExposure > 50 ? '#EF4444' : '#F59E0B', invert: true },
      { label: 'Team Efficiency', value: v.teamEfficiency, icon: '⚙️', raw: v.teamEfficiency, color: '#14B8A6' }
    ];

    return `
      <div class="vars-panel">
        <h3 class="panel-title">📊 Project Metrics</h3>
        ${vars.map(v => `
          <div class="var-row">
            <span class="var-icon">${v.icon}</span>
            <span class="var-label">${v.label}</span>
            <div class="var-bar">
              <div class="var-fill" style="width:${Math.round(v.raw)}%;background:${v.color}"></div>
            </div>
            <span class="var-val">${typeof v.value === 'number' ? Math.round(v.value) : v.value}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  _renderLeaderboardMini() {
    const board = ENGINE.getLeaderboard();
    return `
      <div class="leaderboard-mini">
        <h3 class="panel-title">🏆 Rankings</h3>
        ${board.map((t, i) => `
          <div class="lb-row ${t.id === ENGINE.getCurrentTeam()?.id ? 'active' : ''}">
            <span class="lb-rank">${i + 1}</span>
            <div class="lb-dot" style="background:${t.color}"></div>
            <span class="lb-name">${t.name}</span>
            <span class="lb-score">${t.finalScore > 0 ? t.finalScore : '—'}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  // ──────────────────────────────────────────────
  // PHASE RENDERERS
  // ──────────────────────────────────────────────

  _renderPhase(phaseId, team) {
    const renderers = {
      1:  () => this._renderPhase1(team),
      2:  () => this._renderPhase2(team),
      3:  () => this._renderPhase3(team),
      4:  () => this._renderPhase4(team),
      5:  () => this._renderPhase5(team),
      6:  () => this._renderPhase6(team),
      7:  () => this._renderPhase7(team),
      8:  () => this._renderPhase8(team),
      9:  () => this._renderPhase9(team),
      10: () => this._renderPhase10(team),
      11: () => this._renderPhase11(team),
      12: () => this._renderPhase12(team),
      13: () => this._renderPhase13(team),
      14: () => this._renderPhase14(team),
      15: () => this._renderPhase15(team),
      16: () => this._renderPhase16(team)
    };
    return (renderers[phaseId] || (() => '<p>Phase not yet implemented.</p>'))();
  },

  _renderPhase1(team) {
    return `
      <p class="phase-desc">Choose the type of community project your team will manage. Each project has different success factors and scoring weights.</p>
      <div class="card-grid">
        ${JCI_DATA.PROJECTS.map(p => `
          <div class="project-card ${team.choices.project === p.id ? 'selected' : ''}"
               onclick="UI.selectProject('${p.id}')">
            <div class="project-icon">${p.icon}</div>
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <div class="project-meta">
              <span>👥 Target: ${p.baseAttendanceTarget}</span>
              <span>💰 Base Cost: $${p.baseCost.toLocaleString()}</span>
            </div>
            <div class="project-tip">💡 ${p.tips}</div>
          </div>
        `).join('')}
      </div>
      <div class="phase-actions">
        <button class="btn-primary" onclick="UI.submitPhase1()">
          Confirm Project Selection →
        </button>
      </div>
    `;
  },

  selectProject(id) {
    const team = ENGINE.getCurrentTeam();
    team.choices.project = id;
    document.querySelectorAll('.project-card').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
  },

  submitPhase1() {
    const team = ENGINE.getCurrentTeam();
    if (!team.choices.project) { this.showToast('Please select a project first.', 'error'); return; }
    const result = ENGINE.submitPhaseChoices(team.id, 1, { project: team.choices.project });
    this._showPhaseResult(result, () => UI._advanceAndRender());
  },

  _renderPhase2(team) {
    const project = JCI_DATA.PROJECTS.find(p => p.id === team.choices.project);
    return `
      <p class="phase-desc">Define your project clearly. Strong goals directly improve your Planning Quality score. Be specific and action-oriented.</p>
      ${project ? `<div class="context-box">📋 Your project: <strong>${project.name}</strong></div>` : ''}

      <div class="form-stack">
        <div class="form-group">
          <label>Project Goal <span class="required">*</span></label>
          <textarea id="charter-goal" rows="3" placeholder="e.g. Empower 60 youth aged 15–25 to develop leadership skills through a one-day interactive workshop by August 2026." maxlength="300">${team.choices.charter?.goal || ''}</textarea>
          <div class="char-hint">Use action verbs: empower, educate, build, develop, raise, connect</div>
        </div>
        <div class="form-group">
          <label>Target Audience <span class="required">*</span></label>
          <input type="text" id="charter-audience" placeholder="e.g. Youth aged 15-25 in Paramaribo" value="${team.choices.charter?.audience || ''}" />
        </div>
        <div class="form-group">
          <label>Expected Attendance <span class="required">*</span></label>
          <input type="number" id="charter-attendance" placeholder="${project?.baseAttendanceTarget || 60}" min="10" max="500" value="${team.choices.charter?.expectedAttendance || ''}" />
          ${project ? `<div class="char-hint">Typical for this project type: ${Math.round(project.baseAttendanceTarget * 0.7)}–${Math.round(project.baseAttendanceTarget * 1.5)} people</div>` : ''}
        </div>
        <div class="form-group">
          <label>Project Timeline</label>
          <input type="text" id="charter-timeline" placeholder="e.g. 8-week planning period, event on August 15, 2026" value="${team.choices.charter?.timeline || ''}" />
        </div>
      </div>
      <div class="phase-actions">
        <button class="btn-primary" onclick="UI.submitPhase2()">Submit Charter →</button>
      </div>
    `;
  },

  submitPhase2() {
    const goal = document.getElementById('charter-goal')?.value?.trim();
    const audience = document.getElementById('charter-audience')?.value?.trim();
    const att = document.getElementById('charter-attendance')?.value;
    const timeline = document.getElementById('charter-timeline')?.value?.trim();

    if (!goal || !audience) { this.showToast('Goal and audience are required.', 'error'); return; }

    const team = ENGINE.getCurrentTeam();
    const charter = { goal, audience, expectedAttendance: parseInt(att) || 60, timeline };
    team.choices.charter = charter;

    const result = ENGINE.submitPhaseChoices(team.id, 2, { charter });
    this._showPhaseResult(result, () => UI._advanceAndRender());
  },

  _renderPhase3(team) {
    const tasks = JCI_DATA.TASKS;
    const members = team.committee;

    return `
      <p class="phase-desc">Assign tasks to the right committee members. Match skills to tasks for maximum efficiency. Wrong assignments hurt morale and results.</p>
      <div class="assignment-grid">
        ${tasks.map(task => `
          <div class="assignment-row">
            <div class="task-info">
              <strong>${task.name}</strong>
              <div class="skill-tags">
                <span class="skill-tag primary">${task.primarySkill}</span>
                <span class="skill-tag">${task.secondarySkill}</span>
              </div>
            </div>
            <select class="member-select" id="assign-${task.id}">
              <option value="">— Assign to —</option>
              ${members.map(m => {
                const primary = m.skills[task.primarySkill] || 40;
                const secondary = m.skills[task.secondarySkill] || 40;
                const avg = Math.round((primary + secondary) / 2);
                const fit = avg >= 75 ? '✓ Great' : avg >= 55 ? '◎ OK' : '✗ Poor';
                return `<option value="${m.id}">${m.emoji} ${m.name} — ${fit} (${avg}/100)</option>`;
              }).join('')}
            </select>
          </div>
        `).join('')}
      </div>

      <div class="committee-status">
        <h3>Committee Energy Levels</h3>
        <div class="energy-grid">
          ${members.map(m => `
            <div class="energy-card ${m.burnout ? 'burnout' : ''}">
              <span>${m.emoji} ${m.name}</span>
              <div class="energy-bar">
                <div class="energy-fill" style="width:${m.currentEnergy}%;background:${m.currentEnergy > 60 ? '#10B981' : m.currentEnergy > 30 ? '#F59E0B' : '#EF4444'}"></div>
              </div>
              <span>${m.currentEnergy}% ${m.burnout ? '🔥 Burnout!' : ''}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="phase-actions">
        <button class="btn-primary" onclick="UI.submitPhase3()">Confirm Assignments →</button>
      </div>
    `;
  },

  submitPhase3() {
    const assignments = {};
    JCI_DATA.TASKS.forEach(task => {
      const val = document.getElementById(`assign-${task.id}`)?.value;
      if (val) assignments[task.id] = val;
    });
    const team = ENGINE.getCurrentTeam();
    const result = ENGINE.submitPhaseChoices(team.id, 3, { committeeAssignments: assignments });
    this._showPhaseResult(result, () => UI._advanceAndRender());
  },

  _renderPhase4(team) {
    const selectedSponsors = team.choices.sponsorsSecured?.map(s => s.id) || [];

    return `
      <p class="phase-desc">Select your sponsorship approach and target sponsors. Different methods have different success rates. Align your proposal with sponsor priorities.</p>

      <div class="section-title">Step 1: Choose Your Approach</div>
      <div class="method-grid">
        ${JCI_DATA.SPONSOR_METHODS.map(m => `
          <div class="method-card ${team.choices.sponsorMethod === m.id ? 'selected' : ''}"
               onclick="UI.selectSponsorMethod('${m.id}', this)">
            <div class="method-icon">${m.icon}</div>
            <strong>${m.name}</strong>
            <div class="success-rate">Base success: ${Math.round(m.baseSuccessRate * 100)}%</div>
            <ul class="pros-cons">
              ${m.pros.slice(0,2).map(p => `<li class="pro">+ ${p}</li>`).join('')}
              ${m.cons.slice(0,1).map(c => `<li class="con">- ${c}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <div id="sponsor-method-extras"></div>

      <div class="section-title">Step 2: Select Target Sponsors</div>
      <div class="sponsor-grid">
        ${JCI_DATA.SPONSORS.map(s => `
          <div class="sponsor-card" onclick="UI.toggleSponsor('${s.id}', this)">
            <div class="sponsor-check" id="sponsor-check-${s.id}">${selectedSponsors.includes(s.id) ? '✓' : '○'}</div>
            <strong>${s.name}</strong>
            <div class="sponsor-type">${s.type} | Priority: ${s.priority}</div>
            <p>${s.description}</p>
            <div class="sponsor-max">Max gift: $${s.maxGift.toLocaleString()}</div>
          </div>
        `).join('')}
      </div>

      <div class="phase-actions">
        <button class="btn-primary" onclick="UI.submitPhase4()">Send Proposals →</button>
      </div>
    `;
  },

  selectSponsorMethod(id, el) {
    ENGINE.getCurrentTeam().choices.sponsorMethod = id;
    document.querySelectorAll('.method-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');

    const extras = document.getElementById('sponsor-method-extras');
    if (id === 'email') {
      extras.innerHTML = this._renderEmailBuilder();
    } else if (id === 'personal_meeting') {
      extras.innerHTML = this._renderMeetingBuilder();
    } else {
      extras.innerHTML = '';
    }
  },

  _renderEmailBuilder() {
    const elements = JCI_DATA.SPONSOR_EMAIL_ELEMENTS;
    return `
      <div class="section-title">Email Proposal Builder — Select 5 Elements</div>
      <p class="hint">You may only include 5 elements. Choose wisely — missing critical info lowers your success rate.</p>
      <div class="email-elements-grid">
        ${elements.map(el => `
          <div class="email-el ${el.critical ? 'critical' : ''}" onclick="UI.toggleEmailEl('${el.id}', this)">
            <div class="el-check" id="el-check-${el.id}">○</div>
            <div>
              <strong>${el.name}</strong>
              ${el.critical ? '<span class="badge-critical">Critical</span>' : ''}
              <p>${el.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="selection-count" id="email-count">0/5 selected</div>
    `;
  },

  _emailSelected: [],
  toggleEmailEl(id, el) {
    const idx = this._emailSelected.indexOf(id);
    const check = document.getElementById(`el-check-${id}`);
    if (idx >= 0) {
      this._emailSelected.splice(idx, 1);
      el.classList.remove('selected');
      if (check) check.textContent = '○';
    } else if (this._emailSelected.length < 5) {
      this._emailSelected.push(id);
      el.classList.add('selected');
      if (check) check.textContent = '✓';
    } else {
      this.showToast('Maximum 5 elements allowed.', 'warn');
      return;
    }
    const counter = document.getElementById('email-count');
    if (counter) counter.textContent = `${this._emailSelected.length}/5 selected`;
  },

  _renderMeetingBuilder() {
    return `
      <div class="section-title">Meeting Setup</div>
      <div class="form-stack">
        <div class="form-group">
          <label>Who attends? (select all that apply)</label>
          <div class="checkbox-group">
            <label><input type="checkbox" name="meeting-attendee" value="project_manager"> Project Director</label>
            <label><input type="checkbox" name="meeting-attendee" value="treasurer"> Treasurer</label>
            <label><input type="checkbox" name="meeting-attendee" value="branding_officer"> Branding Officer</label>
            <label><input type="checkbox" name="meeting-attendee" value="volunteer"> General Volunteer</label>
          </div>
        </div>
        <div class="form-group">
          <label>Dress Code</label>
          <select id="meeting-dress">
            <option value="professional">Professional (suit/formal)</option>
            <option value="smart_casual">Smart Casual</option>
            <option value="casual">Casual</option>
            <option value="sportswear">Sportswear</option>
          </select>
        </div>
        <div class="form-group">
          <label>Proposal Quality</label>
          <select id="meeting-pq">
            <option value="high">High — detailed, branded, rehearsed</option>
            <option value="medium">Medium — prepared but basic</option>
            <option value="low">Low — improvised</option>
          </select>
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="meeting-followup"> Plan a follow-up within 48 hours</label>
        </div>
      </div>
    `;
  },

  _selectedSponsors: [],
  toggleSponsor(id, el) {
    const idx = this._selectedSponsors.indexOf(id);
    const check = document.getElementById(`sponsor-check-${id}`);
    if (idx >= 0) {
      this._selectedSponsors.splice(idx, 1);
      el.classList.remove('selected');
      if (check) check.textContent = '○';
    } else if (this._selectedSponsors.length < 4) {
      this._selectedSponsors.push(id);
      el.classList.add('selected');
      if (check) check.textContent = '✓';
    } else {
      this.showToast('Max 4 sponsors per round.', 'warn');
    }
  },

  submitPhase4() {
    const team = ENGINE.getCurrentTeam();
    if (!team.choices.sponsorMethod) { this.showToast('Choose a sponsorship method first.', 'error'); return; }
    if (this._selectedSponsors.length === 0) { this.showToast('Select at least one sponsor to approach.', 'error'); return; }

    const meetingAttendees = [...document.querySelectorAll('input[name="meeting-attendee"]:checked')].map(el => el.value);
    const result = ENGINE.submitPhaseChoices(team.id, 4, {
      method: team.choices.sponsorMethod,
      emailElements: this._emailSelected,
      meetingDetails: {
        attendees: meetingAttendees,
        dress: document.getElementById('meeting-dress')?.value || 'professional',
        proposalQuality: document.getElementById('meeting-pq')?.value || 'medium',
        followUp: document.getElementById('meeting-followup')?.checked || false
      },
      targetSponsors: this._selectedSponsors
    });
    this._emailSelected = [];
    this._selectedSponsors = [];
    this._showPhaseResult(result, () => UI._advanceAndRender());
  },

  _renderPhase5(team) {
    const v = team.vars;
    const project = JCI_DATA.PROJECTS.find(p => p.id === team.choices.project);
    const baseCost = project?.baseCost || 5000;

    return `
      <p class="phase-desc">Manage your project budget. You start with $${v.budget.toLocaleString()} available. Your estimated costs are higher — you need to close the gap through revenue.</p>

      <div class="budget-summary">
        <div class="budget-card green">
          <span>Available Budget</span>
          <strong>$${v.budget.toLocaleString()}</strong>
        </div>
        <div class="budget-card blue">
          <span>Estimated Total Cost</span>
          <strong>$${baseCost.toLocaleString()}</strong>
        </div>
        <div class="budget-card ${v.budget < baseCost ? 'red' : 'green'}">
          <span>Gap</span>
          <strong>$${(baseCost - v.budget > 0 ? '-' : '+') + Math.abs(baseCost - v.budget).toLocaleString()}</strong>
        </div>
      </div>

      <div class="budget-grid">
        <div>
          <h3>💰 Revenue Sources</h3>
          <div class="form-stack">
            <div class="form-group inline">
              <label>Participation Fees</label>
              <input type="number" id="rev-fees" placeholder="0" min="0" value="${team.choices.budget?.revenue?.fees || ''}" />
            </div>
            <div class="form-group inline">
              <label>Donations</label>
              <input type="number" id="rev-donations" placeholder="0" min="0" value="${team.choices.budget?.revenue?.donations || ''}" />
            </div>
            <div class="form-group inline">
              <label>Partnerships</label>
              <input type="number" id="rev-partnerships" placeholder="0" min="0" value="${team.choices.budget?.revenue?.partnerships || ''}" />
            </div>
          </div>
        </div>
        <div>
          <h3>📋 Planned Expenses</h3>
          <div class="form-stack">
            ${JCI_DATA.EXPENSE_CATEGORIES.map(cat => `
              <div class="form-group inline">
                <label>${cat.name} ${cat.required ? '<span class="required">*</span>' : ''}</label>
                <input type="number" id="exp-${cat.id}" placeholder="0" min="0" value="${team.choices.budget?.expenses?.[cat.id] || ''}" />
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="budget-total" id="budget-total-display">Enter amounts above to see totals.</div>

      <div class="phase-actions">
        <button class="btn-secondary" onclick="UI.recalcBudget()">Recalculate</button>
        <button class="btn-primary" onclick="UI.submitPhase5()">Lock Budget →</button>
      </div>
    `;
  },

  recalcBudget() {
    const fees = parseFloat(document.getElementById('rev-fees')?.value) || 0;
    const donations = parseFloat(document.getElementById('rev-donations')?.value) || 0;
    const partnerships = parseFloat(document.getElementById('rev-partnerships')?.value) || 0;
    const totalRev = fees + donations + partnerships + ENGINE.getCurrentTeam().vars.budget;

    let totalExp = 0;
    JCI_DATA.EXPENSE_CATEGORIES.forEach(cat => {
      totalExp += parseFloat(document.getElementById(`exp-${cat.id}`)?.value) || 0;
    });

    const balance = totalRev - totalExp;
    const display = document.getElementById('budget-total-display');
    if (display) {
      display.innerHTML = `
        <div class="budget-row"><span>Total Revenue:</span><strong>$${totalRev.toLocaleString()}</strong></div>
        <div class="budget-row"><span>Total Expenses:</span><strong>$${totalExp.toLocaleString()}</strong></div>
        <div class="budget-row ${balance >= 0 ? 'positive' : 'negative'}">
          <span>Balance:</span><strong>${balance >= 0 ? '+' : ''}$${balance.toLocaleString()}</strong>
        </div>
      `;
    }
  },

  submitPhase5() {
    const revenue = {};
    ['fees','donations','partnerships'].forEach(k => {
      revenue[k] = parseFloat(document.getElementById(`rev-${k}`)?.value) || 0;
    });
    const expenses = {};
    JCI_DATA.EXPENSE_CATEGORIES.forEach(cat => {
      expenses[cat.id] = parseFloat(document.getElementById(`exp-${cat.id}`)?.value) || 0;
    });

    const team = ENGINE.getCurrentTeam();
    const result = ENGINE.submitPhaseChoices(team.id, 5, { budget: { revenue, expenses } });
    this._showPhaseResult(result, () => UI._advanceAndRender());
  },

  _renderPhase6(team) {
    return `
      <p class="phase-desc">Set the participation fee. Higher fees generate more revenue but reduce attendance. Lower fees maximize reach but reduce income. Find the right balance for your project.</p>

      <div class="pricing-slider-box">
        <label><strong>Participation Fee: <span id="price-display">$0</span></strong></label>
        <input type="range" id="price-slider" min="0" max="200" value="${team.choices.ticketPrice || 0}" step="5"
               oninput="UI.updatePrice(this.value)" class="price-slider" />
        <div class="price-labels">
          <span>Free ($0)</span>
          <span>Budget ($25)</span>
          <span>Mid ($75)</span>
          <span>Premium ($150+)</span>
        </div>
      </div>

      <div class="price-effects" id="price-effects">
        <div class="effect-card green">
          <span>📈 Expected Attendance</span>
          <strong id="eff-attendance">Calculating...</strong>
        </div>
        <div class="effect-card blue">
          <span>💰 Ticket Revenue</span>
          <strong id="eff-revenue">Calculating...</strong>
        </div>
        <div class="effect-card yellow">
          <span>😊 Participant Satisfaction Impact</span>
          <strong id="eff-satisfaction">Calculating...</strong>
        </div>
      </div>

      <div class="pricing-presets">
        <button class="btn-preset" onclick="UI.setPrice(0)">Free</button>
        <button class="btn-preset" onclick="UI.setPrice(15)">$15</button>
        <button class="btn-preset" onclick="UI.setPrice(25)">$25</button>
        <button class="btn-preset" onclick="UI.setPrice(50)">$50</button>
        <button class="btn-preset" onclick="UI.setPrice(100)">$100</button>
      </div>

      <div class="phase-actions">
        <button class="btn-primary" onclick="UI.submitPhase6()">Lock Price →</button>
      </div>
    `;
  },

  updatePrice(val) {
    const price = parseInt(val) || 0;
    const display = document.getElementById('price-display');
    if (display) display.textContent = '$' + price;

    const project = JCI_DATA.PROJECTS.find(p => p.id === ENGINE.getCurrentTeam().choices.project);
    const base = project?.baseAttendanceTarget || 60;
    let mod = price === 0 ? 1.4 : price <= 20 ? 1.2 : price <= 50 ? 1.0 : price <= 100 ? 0.75 : 0.45;
    const projected = Math.round(base * mod);
    const revenue = projected * price;
    const satMod = price === 0 ? '+10' : price <= 20 ? '+5' : price <= 50 ? '0' : price <= 100 ? '-5' : '-15';

    const ea = document.getElementById('eff-attendance');
    const er = document.getElementById('eff-revenue');
    const es = document.getElementById('eff-satisfaction');
    if (ea) ea.textContent = projected + ' people';
    if (er) er.textContent = '$' + revenue.toLocaleString();
    if (es) es.textContent = satMod + ' points';
  },

  setPrice(val) {
    const slider = document.getElementById('price-slider');
    if (slider) { slider.value = val; this.updatePrice(val); }
  },

  submitPhase6() {
    const price = parseInt(document.getElementById('price-slider')?.value) || 0;
    const team = ENGINE.getCurrentTeam();
    const result = ENGINE.submitPhaseChoices(team.id, 6, { ticketPrice: price });
    this._showPhaseResult(result, () => UI._advanceAndRender());
  },

  _renderPhase7(team) {
    const project = JCI_DATA.PROJECTS.find(p => p.id === team.choices.project);
    const categoryMap = { awareness: 'youth', education: 'professional', youth: 'children', leadership: 'youth', environment: 'community', professional: 'professional' };
    const targetAudience = categoryMap[project?.category] || 'community';

    return `
      <p class="phase-desc">Allocate marketing points across channels. Match channels to your audience for maximum effectiveness. You have <strong>200 marketing points</strong> to spend. Start your campaign at the right time.</p>

      <div class="marketing-audience">
        🎯 Target audience for <strong>${project?.name || 'your event'}</strong>: <strong>${targetAudience}</strong>
      </div>

      <div class="section-title">Campaign Channels</div>
      <div class="channel-grid">
        ${JCI_DATA.MARKETING_CHANNELS.map(ch => {
          const match = ch.audienceMatch[targetAudience] || 5;
          const matchClass = match >= 8 ? 'excellent' : match >= 6 ? 'good' : 'poor';
          return `
            <div class="channel-card">
              <div class="channel-header">
                <span class="channel-icon">${ch.icon}</span>
                <strong>${ch.name}</strong>
                <span class="audience-match ${matchClass}">${['Poor','','','','','','OK','','Excellent','Excellent','Excellent'][match]} match</span>
              </div>
              <div class="channel-stats">
                <span>Reach: ${ch.reach.toLocaleString()}</span>
                <span>Cost: $${ch.costPerPoint}/pt</span>
              </div>
              <div class="channel-desc">${ch.description}</div>
              <div class="points-input">
                <label>Points</label>
                <input type="number" id="ch-${ch.id}" min="0" max="100" value="0" step="10"
                       oninput="UI.updateMarketingTotal()" class="points-field" />
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="marketing-footer">
        <div class="points-tracker">
          Points used: <strong id="mkt-used">0</strong> / 200
          <div class="points-bar"><div class="points-fill" id="mkt-bar" style="width:0%"></div></div>
        </div>
        <div class="form-group">
          <label>Campaign Launch Date</label>
          <select id="mkt-timing">
            ${JCI_DATA.MARKETING_TIMING.map(t => `<option value="${t.id}">${t.name} — ${t.description.slice(0,50)}...</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="phase-actions">
        <button class="btn-primary" onclick="UI.submitPhase7()">Launch Campaign →</button>
      </div>
    `;
  },

  updateMarketingTotal() {
    let total = 0;
    JCI_DATA.MARKETING_CHANNELS.forEach(ch => {
      total += parseInt(document.getElementById(`ch-${ch.id}`)?.value) || 0;
    });
    const used = document.getElementById('mkt-used');
    const bar = document.getElementById('mkt-bar');
    if (used) used.textContent = total;
    if (bar) {
      const pct = Math.min(100, (total / 200) * 100);
      bar.style.width = pct + '%';
      bar.style.background = total > 200 ? '#EF4444' : '#10B981';
    }
  },

  submitPhase7() {
    let total = 0;
    const channels = {};
    JCI_DATA.MARKETING_CHANNELS.forEach(ch => {
      const v = parseInt(document.getElementById(`ch-${ch.id}`)?.value) || 0;
      if (v > 0) { channels[ch.id] = v; total += v; }
    });

    if (total > 200) { this.showToast('You\'ve exceeded 200 points. Reduce some channels.', 'error'); return; }
    if (total === 0) { this.showToast('Allocate at least some marketing points.', 'error'); return; }

    const timing = document.getElementById('mkt-timing')?.value || 'four_weeks';
    const team = ENGINE.getCurrentTeam();
    const result = ENGINE.submitPhaseChoices(team.id, 7, { marketing: { channels, timing } });
    this._showPhaseResult(result, () => UI._advanceAndRender());
  },

  _renderPhase8(team) {
    const attendance = team.vars.attendance || 50;
    return `
      <p class="phase-desc">Choose your event venue. Consider capacity, cost, professionalism, and suitability for your project type. The venue significantly affects sponsor perception and participant satisfaction.</p>
      <div class="hint">Expected attendance: ~${attendance} people</div>

      <div class="venue-grid">
        ${JCI_DATA.VENUES.map(v => {
          const project = JCI_DATA.PROJECTS.find(p => p.id === team.choices.project);
          const suitable = project && v.suitableFor.includes(project.id);
          const overCap = v.capacity < attendance;
          return `
            <div class="venue-card ${team.choices.venue === v.id ? 'selected' : ''} ${suitable ? 'recommended' : ''} ${overCap ? 'warning' : ''}"
                 onclick="UI.selectVenue('${v.id}', this)">
              ${suitable ? '<div class="recommended-badge">✓ Recommended</div>' : ''}
              ${overCap ? '<div class="warning-badge">⚠ Under Capacity</div>' : ''}
              <h3>${v.name}</h3>
              <p>${v.description}</p>
              <div class="venue-stats">
                <div class="stat"><span>👥</span>${v.capacity}</div>
                <div class="stat"><span>💰</span>$${v.cost}</div>
                <div class="stat"><span>⭐</span>${v.professionalism}/10 Prof.</div>
                <div class="stat"><span>🛋</span>${v.comfort}/10 Comfort</div>
              </div>
              <div class="venue-amenities">
                ${v.amenities.map(a => `<span class="amenity-tag">${a.replace('_',' ')}</span>`).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="phase-actions">
        <button class="btn-primary" onclick="UI.submitPhase8()">Book Venue →</button>
      </div>
    `;
  },

  selectVenue(id, el) {
    ENGINE.getCurrentTeam().choices.venue = id;
    document.querySelectorAll('.venue-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
  },

  submitPhase8() {
    const team = ENGINE.getCurrentTeam();
    if (!team.choices.venue) { this.showToast('Select a venue first.', 'error'); return; }
    const result = ENGINE.submitPhaseChoices(team.id, 8, { venue: team.choices.venue });
    this._showPhaseResult(result, () => UI._advanceAndRender());
  },

  _renderPhase9(team) {
    const foods = JCI_DATA.FOOD_ITEMS.filter(f => f.category === 'food');
    const drinks = JCI_DATA.FOOD_ITEMS.filter(f => f.category === 'drinks');
    const attendance = team.vars.attendance || 50;
    const selected = team.choices.food || [];

    return `
      <p class="phase-desc">Select food and drinks for your event. Consider your budget, attendance count, and participant preferences. Food quality directly affects participant satisfaction.</p>
      <div class="hint">Catering for ~${attendance} people. Estimated per-person cost will be shown.</div>

      <div class="food-section">
        <h3>🍽️ Food Options</h3>
        <div class="food-grid">
          ${foods.map(f => `
            <div class="food-card ${selected.includes(f.id) ? 'selected' : ''}"
                 onclick="UI.toggleFood('${f.id}', this)">
              <div class="food-check" id="food-check-${f.id}">${selected.includes(f.id) ? '✓' : '+'}</div>
              <strong>${f.name}</strong>
              <div class="food-cost">$${f.costPerUnit}/person</div>
              <div class="food-sat">+${f.satisfactionBonus} satisfaction</div>
              ${f.vegetarian ? '<span class="veg-badge">🌿 Veg</span>' : ''}
              <p>${f.description}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="food-section">
        <h3>🥤 Drinks</h3>
        <div class="food-grid">
          ${drinks.map(f => `
            <div class="food-card ${selected.includes(f.id) ? 'selected' : ''}"
                 onclick="UI.toggleFood('${f.id}', this)">
              <div class="food-check" id="food-check-${f.id}">${selected.includes(f.id) ? '✓' : '+'}</div>
              <strong>${f.name}</strong>
              <div class="food-cost">$${f.costPerUnit}/person</div>
              <div class="food-sat">+${f.satisfactionBonus} satisfaction</div>
              <p>${f.description}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="food-total" id="food-total">Select items to see estimated cost.</div>

      <div class="phase-actions">
        <button class="btn-primary" onclick="UI.submitPhase9()">Confirm Catering →</button>
      </div>
    `;
  },

  toggleFood(id, el) {
    const team = ENGINE.getCurrentTeam();
    const idx = team.choices.food.indexOf(id);
    const check = document.getElementById(`food-check-${id}`);
    if (idx >= 0) {
      team.choices.food.splice(idx, 1);
      el.classList.remove('selected');
      if (check) check.textContent = '+';
    } else {
      team.choices.food.push(id);
      el.classList.add('selected');
      if (check) check.textContent = '✓';
    }
    const attendance = team.vars.attendance || 50;
    let total = 0;
    team.choices.food.forEach(fid => {
      const item = JCI_DATA.FOOD_ITEMS.find(f => f.id === fid);
      if (item) total += item.costPerUnit * attendance;
    });
    const display = document.getElementById('food-total');
    if (display) display.textContent = `Estimated total: $${total.toLocaleString()} (${team.choices.food.length} items for ${attendance} people)`;
  },

  submitPhase9() {
    const team = ENGINE.getCurrentTeam();
    if (team.choices.food.length === 0) {
      if (!confirm('No food or drinks selected. Continue anyway?')) return;
    }
    const result = ENGINE.submitPhaseChoices(team.id, 9, { food: team.choices.food });
    this._showPhaseResult(result, () => UI._advanceAndRender());
  },

  _renderPhase10(team) {
    const selected = team.choices.program || [];
    return `
      <p class="phase-desc">Design your event program. A balanced agenda with interactive elements keeps participants engaged. Too many presentations reduce satisfaction. Always include an opening, break, and closing.</p>

      <div class="program-builder">
        <div class="program-available">
          <h3>Available Elements</h3>
          <div class="program-items">
            ${JCI_DATA.PROGRAM_ITEMS.map(item => `
              <div class="program-item ${selected.includes(item.id) ? 'selected' : ''}"
                   onclick="UI.toggleProgram('${item.id}', this)">
                <div class="program-check">${selected.includes(item.id) ? '✓' : '+'}</div>
                <div class="program-info">
                  <strong>${item.name}</strong>
                  <span>${item.duration} min | Engagement: ${item.engagementScore}/10</span>
                  <span>${item.energyCost > 0 ? '⬆' : '⬇'} ${Math.abs(item.energyCost)} energy</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="program-schedule">
          <h3>Your Agenda</h3>
          <div class="schedule-tips">
            <div class="tip ${selected.includes('opening') ? 'tip-ok' : 'tip-warn'}">
              ${selected.includes('opening') ? '✓' : '○'} Opening Ceremony
            </div>
            <div class="tip ${selected.includes('break') ? 'tip-ok' : (selected.length > 4 ? 'tip-warn' : 'tip-neutral')}">
              ${selected.includes('break') ? '✓' : '○'} Break included
            </div>
            <div class="tip ${selected.some(id => ['workshop','group_activity','icebreaker','networking'].includes(id)) ? 'tip-ok' : 'tip-warn'}">
              ${selected.some(id => ['workshop','group_activity','icebreaker','networking'].includes(id)) ? '✓' : '○'} Interactive element
            </div>
            <div class="tip ${selected.includes('closing') ? 'tip-ok' : 'tip-warn'}">
              ${selected.includes('closing') ? '✓' : '○'} Closing Ceremony
            </div>
          </div>
          <div class="schedule-items" id="schedule-list">
            ${selected.length === 0 ? '<p class="empty-hint">Select elements from the left to build your agenda.</p>' :
              selected.map((id, i) => {
                const item = JCI_DATA.PROGRAM_ITEMS.find(p => p.id === id);
                return item ? `<div class="sched-item">${i+1}. ${item.name} (${item.duration}min)</div>` : '';
              }).join('')}
          </div>
          <div class="total-duration" id="sched-duration">
            Total: ${selected.reduce((s, id) => { const i = JCI_DATA.PROGRAM_ITEMS.find(p => p.id === id); return s + (i?.duration || 0); }, 0)} minutes
          </div>
        </div>
      </div>

      <div class="phase-actions">
        <button class="btn-primary" onclick="UI.submitPhase10()">Finalize Program →</button>
      </div>
    `;
  },

  toggleProgram(id, el) {
    const team = ENGINE.getCurrentTeam();
    const idx = team.choices.program.indexOf(id);
    if (idx >= 0) {
      team.choices.program.splice(idx, 1);
    } else {
      team.choices.program.push(id);
    }
    // Re-render the phase to update agenda
    document.getElementById('phase-content').innerHTML = this._renderPhase10(team);
  },

  submitPhase10() {
    const team = ENGINE.getCurrentTeam();
    if (team.choices.program.length < 2) { this.showToast('Add at least 2 program elements.', 'error'); return; }
    const result = ENGINE.submitPhaseChoices(team.id, 10, { program: team.choices.program });
    this._showPhaseResult(result, () => UI._advanceAndRender());
  },

  _renderPhase11(team) {
    const selected = team.choices.speakers || [];
    return `
      <p class="phase-desc">Book speakers for your event. High-expertise, popular speakers drive attendance and community impact. Unreliable speakers need backup plans.</p>

      <div class="speaker-grid">
        ${JCI_DATA.SPEAKERS.map(sp => `
          <div class="speaker-card ${selected.includes(sp.id) ? 'selected' : ''}"
               onclick="UI.toggleSpeaker('${sp.id}', this)">
            <div class="speaker-check" id="sp-check-${sp.id}">${selected.includes(sp.id) ? '✓' : '+'}</div>
            <div class="speaker-info">
              <strong>${sp.name}</strong>
              <div class="speaker-field">${sp.field}</div>
              <div class="speaker-stats">
                <span>🎓 ${sp.expertise}/10</span>
                <span>⭐ ${sp.popularity}/10</span>
                <span>✅ ${sp.reliability}/10 reliable</span>
                <span>💰 $${sp.cost}</span>
              </div>
              <p>${sp.description}</p>
              ${sp.reliability < 7 ? '<div class="reliability-warning">⚠ Low reliability — have a backup!</div>' : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="phase-actions">
        <button class="btn-secondary" onclick="UI.submitPhase11NoSpeakers()">No Speakers Needed</button>
        <button class="btn-primary" onclick="UI.submitPhase11()">Confirm Speakers →</button>
      </div>
    `;
  },

  toggleSpeaker(id, el) {
    const team = ENGINE.getCurrentTeam();
    const idx = team.choices.speakers.indexOf(id);
    const check = document.getElementById(`sp-check-${id}`);
    if (idx >= 0) {
      team.choices.speakers.splice(idx, 1);
      el.classList.remove('selected');
      if (check) check.textContent = '+';
    } else {
      team.choices.speakers.push(id);
      el.classList.add('selected');
      if (check) check.textContent = '✓';
    }
  },

  submitPhase11() {
    const team = ENGINE.getCurrentTeam();
    const result = ENGINE.submitPhaseChoices(team.id, 11, { speakers: team.choices.speakers });
    this._showPhaseResult(result, () => UI._advanceAndRender());
  },

  submitPhase11NoSpeakers() {
    const team = ENGINE.getCurrentTeam();
    team.choices.speakers = [];
    const result = ENGINE.submitPhaseChoices(team.id, 11, { speakers: [] });
    this._showPhaseResult(result, () => UI._advanceAndRender());
  },

  _renderPhase12(team) {
    const committee = team.committee;
    return `
      <p class="phase-desc">Review your team's energy and workload. Overloaded volunteers make mistakes on event day. Redistribute tasks if needed and ensure good delegation.</p>

      <div class="volunteer-grid">
        ${committee.map(m => `
          <div class="volunteer-card ${m.burnout ? 'burnout' : m.currentEnergy < 50 ? 'low-energy' : 'healthy'}">
            <div class="vol-header">
              <span class="vol-emoji">${m.emoji}</span>
              <strong>${m.name}</strong>
              ${m.burnout ? '<span class="burnout-badge">🔥 Burnout</span>' : ''}
            </div>
            <div class="energy-meter">
              <div class="energy-fill" style="width:${m.currentEnergy}%;background:${m.currentEnergy > 60 ? '#10B981' : m.currentEnergy > 30 ? '#F59E0B' : '#EF4444'}"></div>
            </div>
            <div class="energy-label">${m.currentEnergy}% energy remaining</div>
            <div class="assigned-tasks">
              ${m.assignedTasks.map(tid => {
                const t = JCI_DATA.TASKS.find(t => t.id === tid);
                return t ? `<span class="task-tag">${t.name}</span>` : '';
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="balance-options">
        <h3>How will you handle team workload?</h3>
        <div class="option-grid">
          <label class="option-card">
            <input type="radio" name="balance" value="redistribute" />
            <div>
              <strong>Redistribute Tasks</strong>
              <p>Move tasks from overloaded members. +15 morale, slight efficiency loss short-term.</p>
            </div>
          </label>
          <label class="option-card">
            <input type="radio" name="balance" value="maintain" />
            <div>
              <strong>Maintain Current Load</strong>
              <p>Keep assignments as-is. Risky if any members are near burnout.</p>
            </div>
          </label>
          <label class="option-card">
            <input type="radio" name="balance" value="push_through" />
            <div>
              <strong>Push Through</strong>
              <p>Increase workload to speed up progress. High burnout risk.</p>
            </div>
          </label>
        </div>

        <div class="form-group" style="margin-top:1rem">
          <label>Delegation Quality</label>
          <select id="delegation-quality">
            <option value="good">Good — clear roles, regular check-ins</option>
            <option value="average">Average — some oversight</option>
            <option value="poor">Poor — everyone doing everything</option>
          </select>
        </div>
      </div>

      <div class="phase-actions">
        <button class="btn-primary" onclick="UI.submitPhase12()">Confirm Management →</button>
      </div>
    `;
  },

  submitPhase12() {
    const balance = document.querySelector('input[name="balance"]:checked')?.value || 'maintain';
    const delegation = document.getElementById('delegation-quality')?.value || 'average';
    const team = ENGINE.getCurrentTeam();
    const result = ENGINE.submitPhaseChoices(team.id, 12, { volunteers: { balance, delegation } });
    this._showPhaseResult(result, () => UI._advanceAndRender());
  },

  _renderPhase13(team) {
    const identified = team.choices.risks?.identified || [];
    return `
      <p class="phase-desc">Identify risks that could affect your event and plan your mitigation strategies. Prepared teams earn bonuses. Unprepared teams face full impact when risks occur.</p>

      <div class="risk-grid">
        ${JCI_DATA.RISKS.map(risk => {
          const isIdentified = identified.includes(risk.id);
          return `
            <div class="risk-card ${isIdentified ? 'identified' : ''}">
              <div class="risk-header">
                <label class="risk-toggle">
                  <input type="checkbox" id="risk-${risk.id}" ${isIdentified ? 'checked' : ''}
                         onchange="UI.toggleRisk('${risk.id}')" />
                  <strong>${risk.name}</strong>
                </label>
                <span class="risk-prob">Prob: ${Math.round(risk.probability * 100)}%</span>
              </div>
              <p>${risk.description}</p>
              <div class="risk-impact">Potential impact: -${risk.severity}% ${risk.impact}</div>

              ${isIdentified ? `
                <div class="mitigation-select">
                  <label>Mitigation Strategy</label>
                  <select id="mit-${risk.id}" onchange="UI.setMitigation('${risk.id}', this.value)">
                    <option value="">— Choose mitigation —</option>
                    <option value="${risk.mitigation}">${risk.mitigation.replace(/_/g,' ')} ✓ Best option</option>
                    <option value="basic_plan">Basic contingency plan</option>
                    <option value="monitor_only">Monitor only</option>
                  </select>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div class="phase-actions">
        <button class="btn-primary" onclick="UI.submitPhase13()">Submit Risk Plan →</button>
      </div>
    `;
  },

  toggleRisk(id) {
    const team = ENGINE.getCurrentTeam();
    if (!team.choices.risks) team.choices.risks = { identified: [], mitigations: {} };
    const idx = team.choices.risks.identified.indexOf(id);
    if (idx >= 0) {
      team.choices.risks.identified.splice(idx, 1);
      delete team.choices.risks.mitigations[id];
    } else {
      team.choices.risks.identified.push(id);
    }
    document.getElementById('phase-content').innerHTML = this._renderPhase13(team);
  },

  setMitigation(riskId, value) {
    const team = ENGINE.getCurrentTeam();
    if (!team.choices.risks) team.choices.risks = { identified: [], mitigations: {} };
    team.choices.risks.mitigations[riskId] = value;
  },

  submitPhase13() {
    const team = ENGINE.getCurrentTeam();
    const mitigations = {};
    (team.choices.risks?.identified || []).forEach(riskId => {
      const val = document.getElementById(`mit-${riskId}`)?.value;
      if (val) mitigations[riskId] = val;
    });
    team.choices.risks.mitigations = mitigations;
    const result = ENGINE.submitPhaseChoices(team.id, 13, { risks: team.choices.risks });
    this._showPhaseResult(result, () => UI._advanceAndRender());
  },

  _renderPhase14(team) {
    return `
      <p class="phase-desc">Events in the real world don't go exactly as planned. Dynamic events occur based on your previous decisions. Review what happened and understand the consequences.</p>

      <div class="events-box">
        <h3>📰 Events Leading Up to Your Event</h3>
        <p class="hint">These events are determined by your choices throughout the planning phases.</p>
        <button class="btn-primary btn-reveal" onclick="UI.revealDynamicEvents()">
          🎲 Reveal Dynamic Events
        </button>
        <div id="events-result" class="events-result"></div>
      </div>
    `;
  },

  revealDynamicEvents() {
    const team = ENGINE.getCurrentTeam();
    const result = ENGINE.submitPhaseChoices(team.id, 14, {});

    const container = document.getElementById('events-result');
    if (!container) return;

    if (result.triggered && result.triggered.length > 0) {
      container.innerHTML = result.triggered.map(ev => `
        <div class="event-item ${ev.effect && Object.values(ev.effect).some(v => v > 0) ? 'positive' : 'negative'}">
          <h4>${ev.name}</h4>
          <p>${ev.description}</p>
          <div class="event-effects">
            ${Object.entries(ev.effect).map(([k,v]) => `
              <span class="effect-tag ${v > 0 ? 'pos' : 'neg'}">${v > 0 ? '+' : ''}${v} ${k.replace(/([A-Z])/g,' $1').trim()}</span>
            `).join('')}
          </div>
        </div>
      `).join('') + '<button class="btn-primary" style="margin-top:1rem" onclick="UI._advanceAndRender()">Continue to Event Day →</button>';
    } else {
      container.innerHTML = `
        <div class="event-item neutral">
          <h4>✅ Smooth Lead-Up</h4>
          <p>No major events occurred. Your planning was solid enough to avoid most surprises.</p>
        </div>
        <button class="btn-primary" style="margin-top:1rem" onclick="UI._advanceAndRender()">Continue to Event Day →</button>
      `;
    }
  },

  _renderPhase15(team) {
    return `
      <p class="phase-desc">It's event day! All your planning comes together now. The simulation will calculate actual attendance, food consumption, volunteer performance, and more.</p>

      <div class="event-day-preview">
        <h3>📋 Pre-Event Summary</h3>
        <div class="preview-grid">
          <div class="preview-item">
            <span>👥 Expected Attendance</span>
            <strong>${team.vars.attendance}</strong>
          </div>
          <div class="preview-item">
            <span>💰 Budget Available</span>
            <strong>$${team.vars.budget.toLocaleString()}</strong>
          </div>
          <div class="preview-item">
            <span>❤️ Volunteer Morale</span>
            <strong>${team.vars.volunteerMorale}%</strong>
          </div>
          <div class="preview-item">
            <span>📢 Marketing Reach</span>
            <strong>${team.vars.marketingEffectiveness}%</strong>
          </div>
          <div class="preview-item">
            <span>⚠️ Risk Exposure</span>
            <strong>${team.vars.riskExposure}%</strong>
          </div>
          <div class="preview-item">
            <span>🤝 Sponsor Satisfaction</span>
            <strong>${team.vars.sponsorSatisfaction}%</strong>
          </div>
        </div>
      </div>

      <div class="phase-actions">
        <button class="btn-primary btn-big" onclick="UI.runEventDay()">
          🚀 Run Event Day Simulation
        </button>
      </div>
      <div id="event-day-results"></div>
    `;
  },

  runEventDay() {
    const team = ENGINE.getCurrentTeam();
    const result = ENGINE.submitPhaseChoices(team.id, 15, {});

    const container = document.getElementById('event-day-results');
    if (!container) return;

    const quality = result.eventQuality || 0.5;
    const stars = quality > 0.8 ? 5 : quality > 0.6 ? 4 : quality > 0.4 ? 3 : quality > 0.2 ? 2 : 1;

    container.innerHTML = `
      <div class="event-day-results">
        <h3>📊 Event Day Results</h3>
        <div class="result-hero">
          <div class="result-attendance">
            <span class="result-big">${result.actualAttendance || 0}</span>
            <span>people attended</span>
          </div>
          <div class="result-quality">
            <span class="result-stars">${'⭐'.repeat(stars)}</span>
            <span>Event Quality: ${Math.round((result.eventQuality || 0) * 100)}%</span>
          </div>
        </div>
        <div class="feedback-list">
          ${(result.feedback || []).map(f => `<div class="feedback-line">${f}</div>`).join('')}
        </div>
        <button class="btn-primary" style="margin-top:1.5rem" onclick="UI._advanceAndRender()">Complete Post-Event Report →</button>
      </div>
    `;
  },

  _renderPhase16(team) {
    return `
      <p class="phase-desc">Complete your post-event reports. This is your final chance to demonstrate professionalism and impact. Failing to report affects your community reputation and sponsor relationships.</p>

      <div class="report-form">
        <div class="form-group checkbox-big">
          <label>
            <input type="checkbox" id="rep-completed" />
            <strong>Impact Report Completed</strong>
            <p>Document what was achieved and how many people benefited.</p>
          </label>
        </div>
        <div class="form-group checkbox-big">
          <label>
            <input type="checkbox" id="rep-ontime" />
            <strong>Submitted On Time (within 1 week)</strong>
            <p>Timely reporting shows professionalism.</p>
          </label>
        </div>
        <div class="form-group checkbox-big">
          <label>
            <input type="checkbox" id="rep-financials" />
            <strong>Financial Report Included</strong>
            <p>Budget vs. actual spend, income breakdown.</p>
          </label>
        </div>
        <div class="form-group checkbox-big">
          <label>
            <input type="checkbox" id="rep-impact" />
            <strong>Impact Data Included</strong>
            <p>Number of people reached, testimonials, measurable outcomes.</p>
          </label>
        </div>
        <div class="form-group checkbox-big">
          <label>
            <input type="checkbox" id="rep-sponsor" />
            <strong>Sponsor Thank-You Report Sent</strong>
            <p>Personalized report for each sponsor showing their impact.</p>
          </label>
        </div>
      </div>

      <div class="phase-actions">
        <button class="btn-primary" onclick="UI.submitPhase16()">Submit Final Report →</button>
      </div>
    `;
  },

  submitPhase16() {
    const team = ENGINE.getCurrentTeam();
    const report = {
      reportCompleted: document.getElementById('rep-completed')?.checked || false,
      onTime: document.getElementById('rep-ontime')?.checked || false,
      includedFinancials: document.getElementById('rep-financials')?.checked || false,
      includedImpact: document.getElementById('rep-impact')?.checked || false,
      sponsorReport: document.getElementById('rep-sponsor')?.checked || false
    };
    const result = ENGINE.submitPhaseChoices(team.id, 16, { report });
    this._showPhaseResult(result, () => UI._checkAllTeamsDone());
  },

  // ──────────────────────────────────────────────
  // PHASE FLOW
  // ──────────────────────────────────────────────

  _advanceAndRender() {
    const state = ENGINE.state;
    const currentPhase = state.currentPhase;

    // Peer mode: each device plays their own team — no cycling, advance straight to next phase
    if (NETWORK.mode !== 'local' && NETWORK.myTeamIndex >= 0) {
      ENGINE.advancePhase();
      state.currentTeamIndex = NETWORK.myTeamIndex;
      // Push this team's updated state to host so leaderboard stays live
      NETWORK.send({ type: 'team_state', teamIndex: NETWORK.myTeamIndex, team: ENGINE.getCurrentTeam() });
      if (ENGINE.state.phase === 'ended') {
        UI._finalizeGame();
        return;
      }
      this.showLeaderboard(() => UI.renderGame());
      return;
    }

    // Local hot-seat: cycle through teams before advancing phase
    if (state.teams.length > 1) {
      ENGINE.advanceTeam();
      if (!ENGINE.allTeamsCompletedPhase(currentPhase)) {
        this._showTeamHandoff(() => UI.renderGame());
        return;
      }
    }

    // All teams done — advance phase
    ENGINE.advancePhase();

    if (ENGINE.state.phase === 'ended') {
      this._finalizeGame();
      return;
    }

    this.showLeaderboard(() => UI.renderGame());
  },

  _checkAllTeamsDone() {
    // Peer mode: each device finalizes their own team when they finish phase 16
    if (NETWORK.mode !== 'local' && NETWORK.myTeamIndex >= 0) {
      const myTeam = ENGINE.getCurrentTeam();
      ENGINE.calculateFinalScore(myTeam);
      NETWORK.send({ type: 'team_state', teamIndex: NETWORK.myTeamIndex, team: myTeam });
      ENGINE.state.phase = 'ended';
      ENGINE.save();
      this.renderEndGame([]);
      return;
    }

    // Local hot-seat: wait until all teams have finished phase 16
    if (ENGINE.allTeamsCompletedPhase(16)) {
      ENGINE.state.teams.forEach(t => ENGINE.calculateFinalScore(t));
      const awards = ENGINE.determineAwards(ENGINE.state.teams);
      ENGINE.state.phase = 'ended';
      ENGINE.save();
      this.renderEndGame(awards);
    } else {
      this._advanceAndRender();
    }
  },

  _finalizeGame() {
    ENGINE.state.teams.forEach(t => ENGINE.calculateFinalScore(t));
    const awards = ENGINE.determineAwards(ENGINE.state.teams);
    ENGINE.state.phase = 'ended';
    ENGINE.save();
    this.renderEndGame(awards);
  },

  _showTeamHandoff(callback) {
    const nextTeam = ENGINE.getCurrentTeam();
    this._cb = callback;
    this.showModal(`
      <div class="handoff-screen">
        <h2>Pass the Device</h2>
        <div class="handoff-team" style="color:${nextTeam.color}">
          ${nextTeam.name}
        </div>
        <p>It's ${nextTeam.name}'s turn to make their decision for Phase ${ENGINE.state.currentPhase}.</p>
        <p class="hint">Pass the device to the ${nextTeam.name} team captain.</p>
        <button class="btn-primary" onclick="UI.closeModal();UI._run()">
          Ready — Start ${nextTeam.name}'s Turn
        </button>
      </div>
    `, null, { noClose: true });
  },

  // ──────────────────────────────────────────────
  // RESULT MODAL
  // ──────────────────────────────────────────────

  _showPhaseResult(result, onContinue) {
    const score = result.score || 0;
    const feedback = result.feedback || [];
    const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;

    this._cb = onContinue;
    this.showModal(`
      <div class="result-modal">
        <h2>Phase Complete!</h2>
        <div class="result-score ${score >= 70 ? 'good' : score >= 40 ? 'ok' : 'poor'}">
          <span class="result-number">${score}</span>
          <span>/100</span>
        </div>
        <div class="result-stars">${'⭐'.repeat(stars)}</div>
        <div class="feedback-list">
          ${feedback.map(f => `<div class="feedback-item">${f}</div>`).join('')}
        </div>
        ${this._renderEffectsDelta(result.effects)}
        <button class="btn-primary" onclick="UI.closeModal();UI._run()">Continue →</button>
      </div>
    `, null, { noClose: true, wide: true });
  },

  _renderEffectsDelta(effects) {
    if (!effects || Object.keys(effects).length === 0) return '';
    const items = Object.entries(effects)
      .filter(([k]) => !['budgetSpent'].includes(k))
      .map(([k, v]) => {
        const label = k === 'budget' ? 'Budget' : k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        const num = typeof v === 'number' ? v : 0;
        const formatted = k === 'budget' ? (num >= 0 ? '+$' + num : '-$' + Math.abs(num)) : (num >= 0 ? '+' + num : num);
        return `<span class="delta ${num >= 0 ? 'pos' : 'neg'}">${label}: ${formatted}</span>`;
      });
    return items.length > 0 ? `<div class="effects-delta">${items.join('')}</div>` : '';
  },

  // ──────────────────────────────────────────────
  // LEADERBOARD
  // ──────────────────────────────────────────────

  showLeaderboard(onContinue) {
    const board = ENGINE.getLeaderboard();
    const phase = ENGINE.state.currentPhase;
    const phaseName = ENGINE.PHASES[phase - 1]?.name || 'Current Phase';

    if (onContinue) this._cb = onContinue;
    this.showModal(`
      <div class="leaderboard-full">
        <h2>📊 Scoreboard — After Phase ${phase}: ${phaseName}</h2>
        <div class="lb-table">
          <div class="lb-header">
            <span>Rank</span>
            <span>Team</span>
            <span>Budget</span>
            <span>Attendance</span>
            <span>Morale</span>
            <span>Reputation</span>
            <span>Projected Score</span>
          </div>
          ${board.map((t, i) => `
            <div class="lb-row-full">
              <span class="lb-rank-num">${['🥇','🥈','🥉'][i] || (i+1)}</span>
              <span class="lb-team-name" style="color:${t.color}">
                <div class="lb-color-dot" style="background:${t.color}"></div>
                ${t.name}
              </span>
              <span>$${(t.budget || 0).toLocaleString()}</span>
              <span>${t.attendance || 0}</span>
              <span>${Math.round(t.volunteerMorale || 0)}%</span>
              <span>${Math.round(t.communityReputation || 0)}%</span>
              <span class="lb-score-badge">${t.finalScore > 0 ? t.finalScore : '—'}</span>
            </div>
          `).join('')}
        </div>
        ${onContinue ? `<button class="btn-primary" onclick="UI.closeModal();UI._run()">Next Phase →</button>` : ''}
        ${!onContinue ? `<button class="btn-secondary" onclick="UI.closeModal()">Close</button>` : ''}
      </div>
    `, null, { noClose: !onContinue, wide: true });
  },

  // ──────────────────────────────────────────────
  // ENDGAME
  // ──────────────────────────────────────────────

  renderEndGame(awards) {
    const board = ENGINE.getLeaderboard();
    const winner = board[0];
    const allAwards = awards || ENGINE.determineAwards(ENGINE.state.teams);

    this.root.innerHTML = `
      <div class="endgame-screen">
        <div class="endgame-header">
          <div class="jci-logo">JCI</div>
          <h1>UNIFY Project Challenge</h1>
          <h2>Final Results</h2>
        </div>

        <div class="winner-section">
          <div class="winner-crown">🏆</div>
          <div class="winner-name" style="color:${winner?.color}">${winner?.name}</div>
          <div class="winner-score">${winner?.finalScore}/100</div>
          <div class="winner-stars">${'⭐'.repeat(winner?.stars || 0)}${winner?.isGold ? ' 🥇 GOLD STANDARD' : ''}</div>
        </div>

        <div class="final-scores">
          ${board.map((t, i) => `
            <div class="final-team-card">
              <div class="rank-badge">${['🥇','🥈','🥉'][i] || '#' + (i+1)}</div>
              <div class="ft-name" style="color:${t.color}">${t.name}</div>
              <div class="ft-score">${t.finalScore}/100</div>
              <div class="ft-stars">${'⭐'.repeat(t.stars || 0)}</div>
              <div class="ft-awards">${(t.awards || []).map(a => {
                const award = JCI_DATA.AWARDS.find(aw => aw.id === a);
                return award ? `<span class="award-tag">${award.icon} ${award.name}</span>` : '';
              }).join('')}</div>
            </div>
          `).join('')}
        </div>

        <div class="awards-section">
          <h2>🏅 Special Awards</h2>
          <div class="awards-grid">
            ${Object.values(allAwards).map(a => `
              <div class="award-card">
                <div class="award-icon">${a.icon}</div>
                <div class="award-name">${a.name}</div>
                <div class="award-winner">${a.winner}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="feedback-section">
          <h2>📝 Team Debrief Reports</h2>
          <div class="team-tabs">
            ${ENGINE.state.teams.map((t, i) => `
              <button class="tab-btn ${i === 0 ? 'active' : ''}" onclick="UI.showTeamFeedback('${t.id}', this)">
                ${t.name}
              </button>
            `).join('')}
          </div>
          <div class="feedback-content" id="feedback-content">
            ${ENGINE.state.teams.length > 0 ? this._renderTeamFeedback(ENGINE.state.teams[0]) : ''}
          </div>
        </div>

        <div class="endgame-actions">
          <button class="btn-primary" onclick="UI.confirmReset()">🔄 Play Again</button>
          <button class="btn-secondary" onclick="window.print()">🖨️ Print Results</button>
        </div>

        <div class="learning-section">
          <h2>🎓 What You Learned</h2>
          <div class="learning-grid">
            <div class="learning-card">
              <h3>Sponsorship</h3>
              <p>Personal meetings outperform emails. Align your proposal with what each sponsor actually cares about — visibility, impact, or youth development.</p>
            </div>
            <div class="learning-card">
              <h3>Budget Management</h3>
              <p>Always include a contingency fund. Diversify revenue sources early — don't depend on one sponsor for the majority of your budget.</p>
            </div>
            <div class="learning-card">
              <h3>Marketing</h3>
              <p>Match your channels to your audience. Starting 4 weeks out is the sweet spot. Multi-channel campaigns consistently outperform single-channel.</p>
            </div>
            <div class="learning-card">
              <h3>Volunteer Management</h3>
              <p>Burned-out teams make mistakes on event day. Assign tasks based on skill, not convenience. Delegate clearly and check in regularly.</p>
            </div>
            <div class="learning-card">
              <h3>Risk Management</h3>
              <p>Every event faces risks. The difference between good and great projects is preparation — identify risks early and have backup plans ready.</p>
            </div>
            <div class="learning-card">
              <h3>Post-Event</h3>
              <p>The project isn't over when the event ends. Timely reports build credibility. Sponsor thank-you reports build long-term relationships.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  showTeamFeedback(teamId, btn) {
    const team = ENGINE.state.teams.find(t => t.id === teamId);
    if (!team) return;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const content = document.getElementById('feedback-content');
    if (content) content.innerHTML = this._renderTeamFeedback(team);
  },

  _renderTeamFeedback(team) {
    const feedback = ENGINE.generateFeedback(team);
    const sc = team.scoreBreakdown || {};
    return `
      <div class="team-feedback">
        <div class="score-breakdown">
          ${Object.entries(sc).map(([key, { score, weight }]) => `
            <div class="score-row">
              <span>${ENGINE._prettyKey(key)}</span>
              <div class="score-bar">
                <div class="score-fill" style="width:${score}%;background:${score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444'}"></div>
              </div>
              <span>${Math.round(score)}/100</span>
              <span class="weight-label">(${Math.round(weight * 100)}%)</span>
            </div>
          `).join('')}
        </div>
        <div class="feedback-text">
          ${feedback.split('\n').map(line => {
            if (line.startsWith('##')) return `<h3>${line.replace(/^#+\s*/,'')}</h3>`;
            if (line.startsWith('###')) return `<h4>${line.replace(/^#+\s*/,'')}</h4>`;
            if (line.startsWith('**')) return `<p><strong>${line.replace(/\*\*/g,'')}</strong></p>`;
            if (line.startsWith('✓') || line.startsWith('✗') || line.startsWith('-')) return `<p>${line}</p>`;
            return line ? `<p>${line}</p>` : '';
          }).join('')}
        </div>
      </div>
    `;
  },

  // ──────────────────────────────────────────────
  // MODAL SYSTEM
  // ──────────────────────────────────────────────

  showModal(content, title, opts = {}) {
    const existing = document.getElementById('modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'modal-overlay';
    if (!opts.noClose) {
      overlay.addEventListener('click', (e) => { if (e.target === overlay) this.closeModal(); });
    }

    overlay.innerHTML = `
      <div class="modal ${opts.wide ? 'modal-wide' : ''}">
        ${!opts.noClose ? '<button class="modal-close" onclick="UI.closeModal()">✕</button>' : ''}
        ${title ? `<h2 class="modal-title">${title}</h2>` : ''}
        <div class="modal-body">${content}</div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));
  },

  closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 300);
    }
  },

  // ──────────────────────────────────────────────
  // TOAST NOTIFICATIONS
  // ──────────────────────────────────────────────

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container') || this._createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '❌' };
    toast.textContent = (icons[type] || '') + ' ' + message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => { toast.classList.remove('visible'); setTimeout(() => toast.remove(), 400); }, 4000);
  },

  _createToastContainer() {
    const c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
    return c;
  },

  // ──────────────────────────────────────────────
  // MISC
  // ──────────────────────────────────────────────

  handlePlayerJoin(msg) {
    this.showToast(`${msg.name} joined as ${msg.team}`, 'info');
  },

  handleChat(msg) {},

  confirmReset() {
    if (confirm('Reset the game? All progress will be lost.')) {
      ENGINE.reset();
      NETWORK.disconnect();
      this.renderLobby();
    }
  }
};

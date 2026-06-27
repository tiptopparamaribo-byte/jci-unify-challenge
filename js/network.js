// JCI UNIFY PROJECT CHALLENGE — Multiplayer Networking
// Uses PeerJS (WebRTC) for online mode, BroadcastChannel for same-browser mode
'use strict';

const NETWORK = {
  mode: 'local',          // 'local' | 'broadcast' | 'peer'
  role: 'host',           // 'host' | 'client'
  peer: null,             // PeerJS Peer instance
  connections: {},        // peerId → DataConnection
  channel: null,          // BroadcastChannel
  roomCode: '',
  playerId: '',
  onMessage: null,        // callback(msg)
  onPeerJoin: null,       // callback(peerId)
  onPeerLeave: null,      // callback(peerId)
  onConnectionChange: null,
  _peerJSLoaded: false,

  // ──────────────────────────────────────────────
  // INITIALIZATION
  // ──────────────────────────────────────────────

  async init(mode, role, roomCode) {
    this.mode = mode;
    this.role = role;
    this.roomCode = roomCode;
    this.playerId = 'jci_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);

    if (mode === 'local') return { ok: true };
    if (mode === 'broadcast') return this._initBroadcast(roomCode);
    if (mode === 'peer') return await this._initPeer(role, roomCode);
    return { ok: false, error: 'Unknown mode' };
  },

  // ──────────────────────────────────────────────
  // BROADCAST CHANNEL (same browser, different tabs)
  // ──────────────────────────────────────────────

  _initBroadcast(roomCode) {
    if (!window.BroadcastChannel) return { ok: false, error: 'BroadcastChannel not supported' };
    this.channel = new BroadcastChannel('jci_' + roomCode);
    this.channel.onmessage = (e) => {
      if (this.onMessage) this.onMessage(e.data);
    };
    this._broadcastPing();
    return { ok: true };
  },

  _broadcastPing() {
    if (this.channel) {
      setInterval(() => {
        this.send({ type: 'ping', from: this.playerId, role: this.role });
      }, 5000);
    }
  },

  // ──────────────────────────────────────────────
  // PEERJS (WebRTC P2P, cross-device)
  // ──────────────────────────────────────────────

  async _initPeer(role, roomCode) {
    if (!this._peerJSLoaded) {
      const ok = await this._loadPeerJS();
      if (!ok) return { ok: false, error: 'PeerJS CDN unavailable. Use local mode instead.' };
    }

    return new Promise((resolve) => {
      const peerId = role === 'host'
        ? 'jci-host-' + roomCode.toLowerCase()
        : 'jci-client-' + this.playerId;

      try {
        this.peer = new Peer(peerId, {
          host: '0.peerjs.com',
          secure: true,
          port: 443,
          path: '/'
        });

        this.peer.on('open', (id) => {
          console.log('[NETWORK] Peer open:', id);
          if (role === 'host') {
            this._hostListen();
          } else {
            this._clientConnect(roomCode).then(resolve);
            return;
          }
          resolve({ ok: true, peerId: id });
        });

        this.peer.on('error', (err) => {
          console.warn('[NETWORK] Peer error:', err.type, err.message);
          resolve({ ok: false, error: err.type === 'unavailable-id'
            ? 'Room code already in use. Try a different code.'
            : 'Connection failed: ' + err.message });
        });

        setTimeout(() => resolve({ ok: false, error: 'Connection timeout. Check internet connection.' }), 10000);
      } catch(e) {
        resolve({ ok: false, error: 'PeerJS init failed: ' + e.message });
      }
    });
  },

  _hostListen() {
    if (!this.peer) return;
    this.peer.on('connection', (conn) => {
      const pid = conn.peer;
      this.connections[pid] = conn;
      conn.on('open', () => {
        console.log('[NETWORK] Client connected:', pid);
        if (this.onPeerJoin) this.onPeerJoin(pid);
        // Send current game state to new client
        this.sendTo(pid, { type: 'state_sync', state: ENGINE.state });
      });
      conn.on('data', (data) => {
        if (this.onMessage) this.onMessage(data);
        // Relay to all other clients
        this._relay(data, pid);
      });
      conn.on('close', () => {
        delete this.connections[pid];
        if (this.onPeerLeave) this.onPeerLeave(pid);
      });
      conn.on('error', (e) => console.warn('[NETWORK] Conn error:', e));
    });
  },

  async _clientConnect(roomCode) {
    return new Promise((resolve) => {
      const hostId = 'jci-host-' + roomCode.toLowerCase();
      const conn = this.peer.connect(hostId, { reliable: true });
      conn.on('open', () => {
        console.log('[NETWORK] Connected to host');
        this.connections['host'] = conn;
        conn.on('data', (data) => {
          if (this.onMessage) this.onMessage(data);
        });
        conn.on('close', () => {
          delete this.connections['host'];
          if (this.onConnectionChange) this.onConnectionChange('disconnected');
        });
        resolve({ ok: true });
      });
      conn.on('error', (e) => resolve({ ok: false, error: 'Cannot reach host: ' + e.message }));
      setTimeout(() => resolve({ ok: false, error: 'Host not found. Check room code.' }), 8000);
    });
  },

  _relay(data, fromPid) {
    Object.entries(this.connections).forEach(([pid, conn]) => {
      if (pid !== fromPid) {
        try { conn.send(data); } catch(e) {}
      }
    });
  },

  // ──────────────────────────────────────────────
  // SEND / BROADCAST
  // ──────────────────────────────────────────────

  send(message) {
    const payload = { ...message, from: this.playerId, ts: Date.now() };

    if (this.mode === 'broadcast' && this.channel) {
      try { this.channel.postMessage(payload); } catch(e) {}
      return;
    }

    if (this.mode === 'peer') {
      Object.values(this.connections).forEach(conn => {
        try { conn.send(payload); } catch(e) {}
      });
    }
  },

  sendTo(peerId, message) {
    const conn = this.connections[peerId] || this.connections['host'];
    if (conn) {
      try { conn.send({ ...message, from: this.playerId, ts: Date.now() }); } catch(e) {}
    }
  },

  broadcast(message) {
    this.send(message);
    // Also trigger locally
    if (this.onMessage) this.onMessage({ ...message, local: true });
  },

  // ──────────────────────────────────────────────
  // STATE SYNC
  // ──────────────────────────────────────────────

  syncState() {
    if (this.role === 'host') {
      this.send({ type: 'state_sync', state: ENGINE.state });
    }
  },

  handleStateSync(state) {
    if (this.role === 'client') {
      ENGINE.state = state;
      if (window.UI) UI.render();
    }
  },

  // ──────────────────────────────────────────────
  // MESSAGE HANDLER
  // ──────────────────────────────────────────────

  setupMessageHandler() {
    this.onMessage = (msg) => {
      switch(msg.type) {
        case 'state_sync':
          this.handleStateSync(msg.state);
          break;
        case 'phase_submit':
          if (this.role === 'host') {
            const result = ENGINE.submitPhaseChoices(msg.teamId, msg.phaseId, msg.choices);
            this.syncState();
          }
          break;
        case 'player_join':
          if (window.UI) UI.handlePlayerJoin(msg);
          break;
        case 'chat':
          if (window.UI) UI.handleChat(msg);
          break;
        case 'ping':
          break;
      }
    };
  },

  // ──────────────────────────────────────────────
  // PEERJS LOADER
  // ──────────────────────────────────────────────

  _loadPeerJS() {
    return new Promise((resolve) => {
      if (window.Peer) { this._peerJSLoaded = true; resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';
      script.onload = () => { this._peerJSLoaded = true; resolve(true); };
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  },

  disconnect() {
    if (this.channel) { this.channel.close(); this.channel = null; }
    if (this.peer) { this.peer.destroy(); this.peer = null; }
    this.connections = {};
  },

  getConnectedCount() {
    return Object.keys(this.connections).length;
  }
};

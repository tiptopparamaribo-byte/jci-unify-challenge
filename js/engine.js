// JCI UNIFY PROJECT CHALLENGE — Game Engine
'use strict';

const ENGINE = {

  // ──────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────

  state: {
    phase: 'lobby',    // lobby | game | ended
    currentPhase: 0,   // 1-16
    room: { code: '', mode: 'local', hostId: null },
    teams: [],
    currentTeamIndex: 0,
    round: 1,
    dynamicEvents: [],
    log: []
  },

  PHASES: [
    { id: 1,  name: 'Project Selection',       short: 'Project',    component: 'phase_project_selection' },
    { id: 2,  name: 'Project Charter',         short: 'Charter',    component: 'phase_charter' },
    { id: 3,  name: 'Committee Management',    short: 'Committee',  component: 'phase_committee' },
    { id: 4,  name: 'Sponsorship Strategy',    short: 'Sponsors',   component: 'phase_sponsorship' },
    { id: 5,  name: 'Budget Management',       short: 'Budget',     component: 'phase_budget' },
    { id: 6,  name: 'Pricing Strategy',        short: 'Pricing',    component: 'phase_pricing' },
    { id: 7,  name: 'Marketing Campaign',      short: 'Marketing',  component: 'phase_marketing' },
    { id: 8,  name: 'Venue Selection',         short: 'Venue',      component: 'phase_venue' },
    { id: 9,  name: 'Food & Drinks',           short: 'Food',       component: 'phase_food' },
    { id: 10, name: 'Program Design',          short: 'Program',    component: 'phase_program' },
    { id: 11, name: 'Speaker Management',      short: 'Speakers',   component: 'phase_speakers' },
    { id: 12, name: 'Volunteer Management',    short: 'Volunteers', component: 'phase_volunteers' },
    { id: 13, name: 'Risk Management',         short: 'Risks',      component: 'phase_risks' },
    { id: 14, name: 'Dynamic Events',          short: 'Events',     component: 'phase_events' },
    { id: 15, name: 'Event Day Simulation',    short: 'Event Day',  component: 'phase_event_day' },
    { id: 16, name: 'Post-Event Reporting',    short: 'Reporting',  component: 'phase_reporting' }
  ],

  // ──────────────────────────────────────────────
  // TEAM FACTORY
  // ──────────────────────────────────────────────

  createTeam(name, players) {
    return {
      id: 'team_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name,
      players,
      color: this._nextTeamColor(),

      // ── Hidden variables (0-100 scale unless noted) ──
      vars: {
        budget: 2500,          // Current SRD available
        budgetTotal: 2500,     // Total raised
        budgetSpent: 0,        // Total spent
        attendance: 0,         // Projected/actual attendance
        volunteerMorale: 70,
        sponsorSatisfaction: 50,
        communityReputation: 50,
        projectQuality: 0,
        communityImpact: 0,
        marketingEffectiveness: 0,
        riskExposure: 30,
        planningQuality: 0,
        participantSatisfaction: 50,
        speakerSatisfaction: 0,
        teamEfficiency: 75
      },

      // ── Choices made each phase ──
      choices: {
        project: null,
        charter: null,
        committeeAssignments: {},
        sponsorMethod: null,
        emailElements: [],
        meetingDetails: null,
        sponsorsSecured: [],
        budget: { revenue: {}, expenses: {} },
        ticketPrice: 0,
        marketing: { channels: {}, timing: null, totalPoints: 200 },
        venue: null,
        food: [],
        program: [],
        speakers: [],
        volunteersOverloaded: false,
        risks: { identified: [], mitigations: {} },
        report: null
      },

      // ── Committee ──
      committee: this._generateCommittee(),

      // ── Phase scores ──
      phaseScores: {},

      // ── Event day outcomes ──
      eventDay: null,

      // ── Final ──
      finalScore: 0,
      stars: 0,
      awards: []
    };
  },

  _colorIndex: 0,
  _teamColors: ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899'],

  _nextTeamColor() {
    const c = this._teamColors[this._colorIndex % this._teamColors.length];
    this._colorIndex++;
    return c;
  },

  _generateCommittee() {
    return JCI_DATA.COMMITTEE_ROLES.map(role => ({
      ...role,
      energy: 100,
      currentEnergy: 100,
      assignedTasks: [],
      burnout: false
    }));
  },

  // ──────────────────────────────────────────────
  // ROOM MANAGEMENT
  // ──────────────────────────────────────────────

  generateRoomCode() {
    const n = Math.floor(1000 + Math.random() * 9000);
    return 'JCI-' + n;
  },

  initLocalGame(teamData) {
    // teamData = [{name, players}]
    this._colorIndex = 0;
    this.state.teams = teamData.map(t => this.createTeam(t.name, t.players));
    this.state.currentPhase = 1;
    this.state.room.mode = 'local';
    this.state.phase = 'game';
    this.state.currentTeamIndex = 0;
    this.save();
  },

  // ──────────────────────────────────────────────
  // PHASE PROCESSING
  // ──────────────────────────────────────────────

  submitPhaseChoices(teamId, phaseId, choices) {
    const team = this._getTeam(teamId);
    if (!team) return { ok: false, error: 'Team not found' };

    const result = this._processPhase(team, phaseId, choices);
    team.choices = { ...team.choices, ...choices };
    this._applyEffects(team, result.effects);
    team.phaseScores[phaseId] = result.score;

    this.log(`[Phase ${phaseId}] ${team.name}: score=${result.score}`, team);
    this.save();
    return result;
  },

  _processPhase(team, phaseId, choices) {
    const processors = {
      1:  (t, c) => this._processProjectSelection(t, c),
      2:  (t, c) => this._processCharter(t, c),
      3:  (t, c) => this._processCommittee(t, c),
      4:  (t, c) => this._processSponsorship(t, c),
      5:  (t, c) => this._processBudget(t, c),
      6:  (t, c) => this._processPricing(t, c),
      7:  (t, c) => this._processMarketing(t, c),
      8:  (t, c) => this._processVenue(t, c),
      9:  (t, c) => this._processFood(t, c),
      10: (t, c) => this._processProgram(t, c),
      11: (t, c) => this._processSpeakers(t, c),
      12: (t, c) => this._processVolunteers(t, c),
      13: (t, c) => this._processRisks(t, c),
      14: (t, c) => this._processDynamicEvents(t, c),
      15: (t, c) => this._processEventDay(t, c),
      16: (t, c) => this._processReporting(t, c)
    };
    return (processors[phaseId] || (() => ({ score: 0, effects: {}, feedback: [] })))(team, choices);
  },

  // ──────────────────────────────────────────────
  // PHASE 1 — PROJECT SELECTION
  // ──────────────────────────────────────────────

  _processProjectSelection(team, choices) {
    const project = JCI_DATA.PROJECTS.find(p => p.id === choices.project);
    if (!project) return { score: 0, effects: {}, feedback: ['No project selected.'] };

    team.choices.project = project.id;

    const effects = {
      planningQuality: 10,
      communityReputation: 5
    };

    return {
      score: 80,
      effects,
      feedback: [`You selected: ${project.name}. ${project.tips}`],
      projectData: project
    };
  },

  // ──────────────────────────────────────────────
  // PHASE 2 — PROJECT CHARTER
  // ──────────────────────────────────────────────

  _processCharter(team, choices) {
    const { goal, audience, expectedAttendance, timeline } = choices.charter || {};
    let score = 0;
    const feedback = [];
    const effects = {};

    // Goal quality: length > 20 chars and contains action word
    const actionWords = ['improve', 'educate', 'empower', 'build', 'create', 'develop', 'raise', 'support', 'connect', 'train'];
    const goalText = (goal || '').toLowerCase();
    const hasAction = actionWords.some(w => goalText.includes(w));
    const goalScore = goal && goal.length > 20 && hasAction ? 30 : goal && goal.length > 10 ? 20 : 5;
    score += goalScore;

    if (goalScore >= 30) feedback.push('Strong project goal with clear action verb.');
    else if (goalScore >= 20) feedback.push('Goal is acceptable but could be more specific and action-oriented.');
    else feedback.push('Weak goal — be more specific. Use verbs like "empower", "educate", "build".');

    // Audience
    const audienceScore = audience && audience.length > 5 ? 25 : 10;
    score += audienceScore;
    if (audienceScore >= 25) feedback.push('Target audience clearly defined.');
    else feedback.push('Define your target audience more specifically.');

    // Attendance realism
    const project = JCI_DATA.PROJECTS.find(p => p.id === team.choices.project);
    const baseTarget = project ? project.baseAttendanceTarget : 50;
    const att = parseInt(expectedAttendance) || 0;
    let attendanceScore = 0;
    if (att >= baseTarget * 0.7 && att <= baseTarget * 1.5) {
      attendanceScore = 25;
      effects.attendance = att;
      feedback.push(`Realistic attendance target: ${att} people.`);
    } else if (att > 0) {
      attendanceScore = 10;
      effects.attendance = Math.round(baseTarget);
      feedback.push(`Attendance target of ${att} is ${att > baseTarget * 1.5 ? 'over-optimistic' : 'too conservative'}. Adjusted to ${Math.round(baseTarget)}.`);
    } else {
      feedback.push('No attendance target set. Planning quality reduced.');
    }
    score += attendanceScore;

    // Timeline
    const timelineScore = timeline && timeline.length > 2 ? 20 : 5;
    score += timelineScore;
    if (timelineScore >= 20) feedback.push('Clear timeline established.');
    else feedback.push('Add a specific timeline to improve planning quality.');

    const planningBoost = Math.round(score / 100 * 30);
    effects.planningQuality = planningBoost;

    return { score: Math.min(score, 100), effects, feedback };
  },

  // ──────────────────────────────────────────────
  // PHASE 3 — COMMITTEE
  // ──────────────────────────────────────────────

  _processCommittee(team, choices) {
    const assignments = choices.committeeAssignments || {};
    const feedback = [];
    let efficiencyBonus = 0;
    let moralePenalty = 0;

    // Each task should be assigned; check skill match
    Object.entries(assignments).forEach(([taskId, memberId]) => {
      const task = JCI_DATA.TASKS.find(t => t.id === taskId);
      const member = team.committee.find(m => m.id === memberId);
      if (!task || !member) return;

      const primarySkillScore = member.skills[task.primarySkill] || 40;
      const secondarySkillScore = member.skills[task.secondarySkill] || 40;
      const avgSkill = (primarySkillScore + secondarySkillScore) / 2;

      if (avgSkill >= 75) {
        efficiencyBonus += 6;
        feedback.push(`✓ ${member.name} → ${task.name}: Great fit (skill ${Math.round(avgSkill)}/100).`);
      } else if (avgSkill >= 55) {
        efficiencyBonus += 2;
        feedback.push(`◎ ${member.name} → ${task.name}: Acceptable (skill ${Math.round(avgSkill)}/100).`);
      } else {
        efficiencyBonus -= 4;
        moralePenalty += 3;
        feedback.push(`✗ ${member.name} → ${task.name}: Poor fit (skill ${Math.round(avgSkill)}/100). Consider reassigning.`);
      }

      // Energy drain
      member.currentEnergy = Math.max(0, member.currentEnergy - task.energyCost);
      member.assignedTasks.push(taskId);

      if (member.currentEnergy < 30) {
        moralePenalty += 10;
        member.burnout = true;
        feedback.push(`⚠ ${member.name} is overloaded and approaching burnout!`);
      }
    });

    const score = Math.max(10, Math.min(100, 50 + efficiencyBonus));
    const effects = {
      teamEfficiency: Math.max(-20, Math.min(20, efficiencyBonus)),
      volunteerMorale: -moralePenalty
    };

    return { score, effects, feedback };
  },

  // ──────────────────────────────────────────────
  // PHASE 4 — SPONSORSHIP
  // ──────────────────────────────────────────────

  _processSponsorship(team, choices) {
    const { method, emailElements, meetingDetails, targetSponsors } = choices;
    const feedback = [];
    let score = 0;
    const effects = {};
    let budgetGained = 0;

    const methodData = JCI_DATA.SPONSOR_METHODS.find(m => m.id === method);
    if (!methodData) return { score: 10, effects: {}, feedback: ['No sponsorship method selected.'] };

    let baseSuccess = methodData.baseSuccessRate;

    // Email proposal quality
    if (method === 'email' && emailElements) {
      const critical = JCI_DATA.SPONSOR_EMAIL_ELEMENTS.filter(e => e.critical);
      const selected = emailElements;
      const criticalHit = critical.filter(c => selected.includes(c.id)).length;
      const qualityScore = selected.reduce((sum, id) => {
        const el = JCI_DATA.SPONSOR_EMAIL_ELEMENTS.find(e => e.id === id);
        return sum + (el ? el.weight : 0);
      }, 0);

      const proposalQuality = qualityScore / 100;
      baseSuccess *= (0.5 + proposalQuality * 0.8);

      if (criticalHit === critical.length) {
        feedback.push(`✓ All critical email elements included. Strong proposal!`);
        score += 20;
      } else {
        feedback.push(`✗ Missing ${critical.length - criticalHit} critical element(s). Proposal weakened.`);
      }
      score += Math.round(proposalQuality * 40);
    }

    // Meeting quality
    if (method === 'personal_meeting' && meetingDetails) {
      const { attendees, dress, followUp, proposalQuality: pq } = meetingDetails;
      let meetingScore = 50;

      if (attendees && attendees.includes('treasurer')) meetingScore += 15;
      if (attendees && attendees.includes('project_manager')) meetingScore += 10;
      if (dress === 'professional') meetingScore += 20;
      else if (dress === 'smart_casual') meetingScore += 5;
      else meetingScore -= 15;
      if (followUp) meetingScore += 10;
      if (pq === 'high') meetingScore += 15;

      baseSuccess *= (meetingScore / 100);
      score += Math.round(meetingScore * 0.4);
      feedback.push(`Meeting quality score: ${meetingScore}/100.`);
    }

    // Simulate sponsor outcomes
    const sponsors = targetSponsors || [];
    const secured = [];

    sponsors.forEach(sponsorId => {
      const sponsor = JCI_DATA.SPONSORS.find(s => s.id === sponsorId);
      if (!sponsor) return;

      const projectId = team.choices.project;
      const projectBonus = sponsor.preferredProject.includes(projectId) ? 0.2 : 0;
      const finalSuccess = Math.min(0.95, baseSuccess + projectBonus);

      if (Math.random() < finalSuccess) {
        const gift = Math.round(sponsor.maxGift * (0.5 + Math.random() * 0.5));
        budgetGained += gift;
        secured.push({ id: sponsor.id, name: sponsor.name, amount: gift });
        feedback.push(`✓ ${sponsor.name} agreed to sponsor! Contributed $${gift}.`);
        effects.sponsorSatisfaction = (effects.sponsorSatisfaction || 0) + 15;
      } else {
        feedback.push(`✗ ${sponsor.name} declined. Consider a different approach or stronger proposal.`);
        effects.sponsorSatisfaction = (effects.sponsorSatisfaction || 0) - 5;
      }
    });

    team.choices.sponsorsSecured = secured;
    effects.budget = budgetGained;
    score = Math.min(100, score + secured.length * 15);

    return { score, effects, feedback, secured };
  },

  // ──────────────────────────────────────────────
  // PHASE 5 — BUDGET
  // ──────────────────────────────────────────────

  _processBudget(team, choices) {
    const { expenses } = choices.budget || {};
    const feedback = [];
    const effects = {};
    let score = 60;

    const totalExpenses = Object.values(expenses || {}).reduce((s, v) => s + (Number(v) || 0), 0);
    const available = team.vars.budget;
    const gap = totalExpenses - available;

    if (gap > 0) {
      score -= Math.min(40, Math.round(gap / 100));
      effects.riskExposure = Math.min(30, Math.round(gap / 50));
      feedback.push(`⚠ Budget deficit of $${gap}. You need to raise more funds or cut costs.`);
    } else {
      score += 20;
      feedback.push(`✓ Budget balanced. Surplus of $${Math.abs(gap)}.`);
      effects.planningQuality = 10;
    }

    const hasContingency = (expenses || {}).contingency > 0;
    if (hasContingency) {
      score += 10;
      effects.riskExposure = (effects.riskExposure || 0) - 10;
      feedback.push('✓ Contingency fund included. Good risk practice.');
    } else {
      feedback.push('Consider adding a contingency fund (10% of budget) for unexpected costs.');
    }

    effects.budgetSpent = totalExpenses;

    return { score: Math.max(0, Math.min(100, score)), effects, feedback };
  },

  // ──────────────────────────────────────────────
  // PHASE 6 — PRICING
  // ──────────────────────────────────────────────

  _processPricing(team, choices) {
    const { ticketPrice } = choices;
    const project = JCI_DATA.PROJECTS.find(p => p.id === team.choices.project);
    const baseAttendance = (project ? project.baseAttendanceTarget : 60);
    const feedback = [];
    const effects = {};

    const price = Number(ticketPrice) || 0;
    team.choices.ticketPrice = price;

    // Attendance modifier based on price
    // Sweet spot between $0-$50 depending on project type
    let attendanceMod = 1;
    let satisfactionMod = 0;

    if (price === 0) {
      attendanceMod = 1.4;
      satisfactionMod = 10;
      feedback.push('Free entry maximizes attendance but reduces revenue.');
    } else if (price <= 20) {
      attendanceMod = 1.2;
      satisfactionMod = 5;
      feedback.push(`$${price} entry: accessible price point. Good balance of attendance and revenue.`);
    } else if (price <= 50) {
      attendanceMod = 1.0;
      satisfactionMod = 0;
      feedback.push(`$${price} entry: moderate price. Some attendees may self-select out.`);
    } else if (price <= 100) {
      attendanceMod = 0.75;
      satisfactionMod = -5;
      feedback.push(`$${price} entry: premium pricing. Lower attendance but higher revenue per person.`);
    } else {
      attendanceMod = 0.45;
      satisfactionMod = -15;
      feedback.push(`$${price} entry: too expensive for most. Attendance will be significantly lower.`);
    }

    // Project-specific modifiers
    if (project && project.id === 'networking_event') attendanceMod *= 0.9; // professionals OK with higher fees
    if (project && project.id === 'reading_day') { attendanceMod *= (price > 10 ? 0.6 : 1.1); } // families are price-sensitive

    const projectedAttendance = Math.round(baseAttendance * attendanceMod);
    const ticketRevenue = projectedAttendance * price;

    effects.attendance = projectedAttendance;
    effects.participantSatisfaction = satisfactionMod;
    effects.budget = ticketRevenue;

    const score = price === 0 ? 70 : price <= 50 ? 80 : price <= 100 ? 60 : 40;

    return {
      score,
      effects,
      feedback,
      projectedAttendance,
      ticketRevenue
    };
  },

  // ──────────────────────────────────────────────
  // PHASE 7 — MARKETING
  // ──────────────────────────────────────────────

  _processMarketing(team, choices) {
    const { channels, timing } = choices.marketing || {};
    const project = JCI_DATA.PROJECTS.find(p => p.id === team.choices.project);
    const feedback = [];
    let totalReach = 0;
    let effectiveness = 0;
    const effects = {};

    const projectCategory = project ? project.category : 'community';
    const audienceMap = {
      'awareness': 'youth', 'education': 'professional', 'youth': 'children',
      'leadership': 'youth', 'environment': 'community', 'professional': 'professional'
    };
    const targetAudience = audienceMap[projectCategory] || 'community';

    let totalSpent = 0;
    let totalPoints = 0;

    Object.entries(channels || {}).forEach(([channelId, points]) => {
      const ch = JCI_DATA.MARKETING_CHANNELS.find(c => c.id === channelId);
      if (!ch || !points) return;
      const pts = Number(points) || 0;
      if (pts <= 0) return;

      const cost = pts * ch.costPerPoint;
      totalSpent += cost;
      totalPoints += pts;

      const audienceMatch = ch.audienceMatch[targetAudience] || 5;
      const reach = ch.reach * (pts / 10) * ch.conversionRate * (audienceMatch / 10);
      totalReach += reach;

      const channelEffectiveness = Math.round(reach);
      effectiveness += channelEffectiveness * 0.1;

      if (audienceMatch >= 8) feedback.push(`✓ ${ch.name}: Excellent match for your audience.`);
      else if (audienceMatch >= 6) feedback.push(`◎ ${ch.name}: Good reach.`);
      else feedback.push(`✗ ${ch.name}: Low audience match for ${project?.name || 'this project'}.`);
    });

    // Timing modifier
    const timingData = timing ? JCI_DATA.MARKETING_TIMING.find(t => t.id === timing) : null;
    const timingMod = timingData ? timingData.modifier : 0.8;
    effectiveness *= timingMod;

    if (timingData) {
      if (timingMod >= 1.1) feedback.push(`✓ Timing: ${timingData.name} — ${timingData.description}`);
      else if (timingMod >= 0.9) feedback.push(`◎ Timing: ${timingData.name} — ${timingData.description}`);
      else feedback.push(`✗ Timing: ${timingData.name} — ${timingData.description}`);
    }

    // Channel diversity bonus
    const diversityBonus = Object.keys(channels || {}).length >= 4 ? 10 : 0;
    if (diversityBonus) feedback.push('✓ Good channel diversity — multi-channel campaigns perform better.');

    effectiveness = Math.min(100, effectiveness + diversityBonus);
    effects.marketingEffectiveness = Math.round(effectiveness);
    effects.attendance = Math.round(totalReach * 0.5);
    effects.communityReputation = Math.round(effectiveness * 0.3);
    effects.budget = -totalSpent;

    const score = Math.min(100, Math.round(effectiveness));

    return { score, effects, feedback, totalReach: Math.round(totalReach), totalSpent };
  },

  // ──────────────────────────────────────────────
  // PHASE 8 — VENUE
  // ──────────────────────────────────────────────

  _processVenue(team, choices) {
    const venue = JCI_DATA.VENUES.find(v => v.id === choices.venue);
    if (!venue) return { score: 0, effects: {}, feedback: ['No venue selected.'] };

    const project = JCI_DATA.PROJECTS.find(p => p.id === team.choices.project);
    const attendance = team.vars.attendance || 50;
    const feedback = [];
    const effects = {};
    let score = 50;

    // Capacity check
    if (venue.capacity < attendance) {
      const deficit = attendance - venue.capacity;
      score -= 20;
      effects.participantSatisfaction = -15;
      effects.riskExposure = 20;
      feedback.push(`✗ Venue capacity (${venue.capacity}) is less than expected attendance (${attendance}). Overcrowding risk!`);
    } else if (venue.capacity > attendance * 2) {
      score -= 5;
      effects.communityReputation = -5;
      feedback.push(`◎ Venue is much larger than expected. May feel empty — adjust attendance goals or choose smaller venue.`);
    } else {
      score += 15;
      feedback.push(`✓ Venue capacity (${venue.capacity}) fits your attendance target well.`);
    }

    // Project suitability
    if (project && venue.suitableFor.includes(project.id)) {
      score += 20;
      feedback.push(`✓ ${venue.name} is well-suited for ${project.name}.`);
    } else {
      score -= 5;
      feedback.push(`◎ ${venue.name} is not the ideal venue for ${project?.name || 'this event type'}.`);
    }

    // Professionalism impact
    if (venue.professionalism >= 8) {
      effects.sponsorSatisfaction = 10;
      effects.participantSatisfaction = 10;
      feedback.push(`✓ High-professionalism venue boosts sponsor and participant perception.`);
    } else if (venue.professionalism <= 5) {
      effects.sponsorSatisfaction = -15;
      effects.communityReputation = -10;
      feedback.push(`✗ Low-professionalism venue hurts sponsor perception significantly.`);
    }

    score += Math.round((venue.professionalism + venue.comfort + venue.accessibility) / 3 * 1.5);
    effects.budget = -venue.cost;
    effects.participantSatisfaction = (effects.participantSatisfaction || 0) + Math.round(venue.comfort * 1.5);

    return { score: Math.min(100, Math.max(0, score)), effects, feedback, venue };
  },

  // ──────────────────────────────────────────────
  // PHASE 9 — FOOD & DRINKS
  // ──────────────────────────────────────────────

  _processFood(team, choices) {
    const selected = choices.food || [];
    const attendance = team.vars.attendance || 50;
    const feedback = [];
    const effects = {};
    let totalCost = 0;
    let totalSatisfaction = 0;

    const foods = selected.filter(i => JCI_DATA.FOOD_ITEMS.find(f => f.id === i && f.category === 'food'));
    const drinks = selected.filter(i => JCI_DATA.FOOD_ITEMS.find(f => f.id === i && f.category === 'drinks'));

    if (foods.length === 0) {
      effects.participantSatisfaction = -20;
      feedback.push('✗ No food selected. Participant satisfaction will suffer significantly.');
    }

    if (drinks.length === 0) {
      effects.participantSatisfaction = (effects.participantSatisfaction || 0) - 15;
      feedback.push('✗ No drinks selected. Always include at least water.');
    }

    const hasWater = drinks.includes('water');
    if (!hasWater && drinks.length > 0) {
      feedback.push('◎ No water included. Always ensure water is available alongside other drinks.');
    }

    selected.forEach(itemId => {
      const item = JCI_DATA.FOOD_ITEMS.find(f => f.id === itemId);
      if (!item) return;
      const qty = Math.ceil(attendance * 1.1); // 10% buffer
      totalCost += item.costPerUnit * qty;
      totalSatisfaction += item.satisfactionBonus;
    });

    effects.budget = -totalCost;
    effects.participantSatisfaction = (effects.participantSatisfaction || 0) + Math.min(30, totalSatisfaction);

    const score = Math.min(100, Math.max(10, 30 + foods.length * 12 + drinks.length * 10));
    if (foods.length >= 2 && drinks.length >= 2) feedback.push('✓ Good food and drink selection. Participants will be satisfied.');

    return { score, effects, feedback, totalCost, itemCount: selected.length };
  },

  // ──────────────────────────────────────────────
  // PHASE 10 — PROGRAM DESIGN
  // ──────────────────────────────────────────────

  _processProgram(team, choices) {
    const program = choices.program || [];
    const feedback = [];
    const effects = {};
    let engagementTotal = 0;
    let energyLevel = 50;
    let score = 0;

    const hasOpening = program.includes('opening');
    const hasClosing = program.includes('closing');
    const hasBreak = program.includes('break');
    const hasTooManyPresentations = program.filter(id => id === 'presentation' || id === 'keynote').length > 3;
    const hasInteractive = program.some(id => ['workshop', 'group_activity', 'icebreaker', 'networking'].includes(id));

    if (!hasOpening) { score -= 10; feedback.push('✗ No opening ceremony — events should have a proper start.'); }
    else { score += 10; }

    if (!hasClosing) { score -= 10; feedback.push('✗ No closing ceremony — always end with a proper close.'); }
    else { score += 10; }

    if (!hasBreak && program.length > 4) { score -= 10; effects.participantSatisfaction = -10; feedback.push('✗ No break scheduled — long programs without breaks reduce engagement.'); }
    else if (hasBreak) { score += 10; feedback.push('✓ Break included — participants can recharge.'); }

    if (hasTooManyPresentations) { score -= 15; effects.participantSatisfaction = -15; feedback.push('✗ Too many presentations — participants disengage when overwhelmed with speeches.'); }

    if (hasInteractive) { score += 20; effects.participantSatisfaction = (effects.participantSatisfaction || 0) + 15; feedback.push('✓ Interactive elements included — great for participant engagement.'); }

    program.forEach(itemId => {
      const item = JCI_DATA.PROGRAM_ITEMS.find(p => p.id === itemId);
      if (!item) return;
      engagementTotal += item.engagementScore;
      energyLevel += item.energyCost;
    });

    const avgEngagement = program.length > 0 ? engagementTotal / program.length : 0;
    score += Math.round(avgEngagement * 5);

    if (program.length < 3) { score -= 15; feedback.push('Program too short — add more variety.'); }
    if (program.length > 8) { score -= 10; feedback.push('Program may be too packed — consider trimming.'); }

    effects.participantSatisfaction = (effects.participantSatisfaction || 0) + Math.round(avgEngagement * 2);

    return { score: Math.min(100, Math.max(10, score)), effects, feedback, avgEngagement };
  },

  // ──────────────────────────────────────────────
  // PHASE 11 — SPEAKERS
  // ──────────────────────────────────────────────

  _processSpeakers(team, choices) {
    const selected = choices.speakers || [];
    const project = JCI_DATA.PROJECTS.find(p => p.id === team.choices.project);
    const feedback = [];
    const effects = {};
    let totalCost = 0;
    let totalScore = 0;

    if (selected.length === 0) {
      const requiresSpeakers = project?.requirements?.minSpeakers > 0;
      if (requiresSpeakers) {
        effects.speakerSatisfaction = -30;
        effects.attendance = -15;
        feedback.push('✗ No speakers selected — this project requires speakers. Attendance and impact will suffer.');
        return { score: 10, effects, feedback };
      }
    }

    selected.forEach(speakerId => {
      const speaker = JCI_DATA.SPEAKERS.find(s => s.id === speakerId);
      if (!speaker) return;

      totalCost += speaker.cost;
      const expertiseScore = speaker.expertise * 5;
      const popularityScore = speaker.popularity * 3;
      const reliabilityScore = speaker.reliability * 2;
      totalScore += expertiseScore + popularityScore + reliabilityScore;

      if (speaker.reliability < 7) {
        effects.riskExposure = (effects.riskExposure || 0) + 10;
        feedback.push(`⚠ ${speaker.name} has reliability score ${speaker.reliability}/10. Have a backup plan.`);
      } else {
        feedback.push(`✓ ${speaker.name}: Expert in ${speaker.field} (expertise: ${speaker.expertise}/10, popularity: ${speaker.popularity}/10).`);
      }
    });

    const avgScore = selected.length > 0 ? totalScore / selected.length : 0;
    const score = Math.min(100, Math.round(avgScore * 0.5));

    effects.budget = -totalCost;
    effects.speakerSatisfaction = Math.min(60, Math.round(avgScore * 0.4));
    effects.attendance = Math.round(selected.length * 5);
    effects.communityImpact = Math.round(avgScore * 0.2);

    return { score, effects, feedback, totalCost, speakerCount: selected.length };
  },

  // ──────────────────────────────────────────────
  // PHASE 12 — VOLUNTEERS
  // ──────────────────────────────────────────────

  _processVolunteers(team, choices) {
    const { balance, delegation } = choices.volunteers || {};
    const committee = team.committee;
    const feedback = [];
    const effects = {};
    let score = 50;

    const overloaded = committee.filter(m => m.currentEnergy < 30);
    const burnoutCount = committee.filter(m => m.burnout).length;

    if (burnoutCount > 0) {
      score -= burnoutCount * 10;
      effects.volunteerMorale = -burnoutCount * 8;
      effects.teamEfficiency = -burnoutCount * 5;
      effects.projectQuality = -burnoutCount * 5;
      feedback.push(`✗ ${burnoutCount} committee member(s) in burnout. Quality and morale suffering.`);
    }

    if (balance === 'redistribute') {
      // Redistribute tasks to help overloaded members
      overloaded.forEach(m => { m.currentEnergy = Math.min(100, m.currentEnergy + 25); m.burnout = false; });
      score += 20;
      effects.volunteerMorale = (effects.volunteerMorale || 0) + 15;
      feedback.push('✓ Workload redistributed. Team morale improved.');
    } else if (balance === 'push_through') {
      score -= 10;
      effects.volunteerMorale = (effects.volunteerMorale || 0) - 10;
      feedback.push('✗ Team is pushed too hard. Risk of mistakes on event day.');
    }

    if (delegation === 'good') {
      score += 15;
      effects.teamEfficiency = (effects.teamEfficiency || 0) + 10;
      feedback.push('✓ Good delegation improves team efficiency.');
    }

    const avgEnergy = committee.reduce((s, m) => s + m.currentEnergy, 0) / committee.length;
    effects.volunteerMorale = (effects.volunteerMorale || 0) + Math.round((avgEnergy - 70) * 0.5);

    return { score: Math.min(100, Math.max(10, score)), effects, feedback, avgEnergy };
  },

  // ──────────────────────────────────────────────
  // PHASE 13 — RISK MANAGEMENT
  // ──────────────────────────────────────────────

  _processRisks(team, choices) {
    const { identified, mitigations } = choices.risks || {};
    const feedback = [];
    const effects = {};
    let score = 30;
    let riskReduction = 0;

    (identified || []).forEach(riskId => {
      const risk = JCI_DATA.RISKS.find(r => r.id === riskId);
      if (!risk) return;

      score += 8;
      const mitigation = (mitigations || {})[riskId];

      if (mitigation === risk.mitigation) {
        riskReduction += Math.round(risk.severity * risk.mitigationEffect);
        score += 12;
        feedback.push(`✓ ${risk.name}: Risk identified and correctly mitigated.`);
      } else if (mitigation) {
        riskReduction += Math.round(risk.severity * 0.4);
        score += 5;
        feedback.push(`◎ ${risk.name}: Partially mitigated. Better strategy available.`);
      } else {
        feedback.push(`✗ ${risk.name}: Identified but no mitigation planned.`);
      }
    });

    // Store identified risks for event day resolution
    team.choices.risks = { identified: identified || [], mitigations: mitigations || {} };

    effects.riskExposure = -Math.min(40, riskReduction);
    const unmitigated = JCI_DATA.RISKS.length - (identified || []).length;
    if (unmitigated > 4) {
      feedback.push(`⚠ ${unmitigated} risks left unidentified. Unknown risks can still affect your event.`);
    }

    return { score: Math.min(100, score), effects, feedback };
  },

  // ──────────────────────────────────────────────
  // PHASE 14 — DYNAMIC EVENTS
  // ──────────────────────────────────────────────

  _processDynamicEvents(team, choices) {
    const feedback = [];
    const effects = {};
    const triggered = [];

    JCI_DATA.DYNAMIC_EVENTS.forEach(event => {
      let probability = event.probability;

      // Trigger modifiers based on team state
      if (event.id === 'volunteer_burnout' && team.committee.some(m => m.burnout)) probability = 0.7;
      if (event.id === 'viral_post' && team.vars.marketingEffectiveness > 70) probability *= 1.5;
      if (event.id === 'sponsor_impressed' && team.vars.sponsorSatisfaction > 60) probability *= 1.3;
      if (event.id === 'bad_weather' && team.choices.venue) {
        const venue = JCI_DATA.VENUES.find(v => v.id === team.choices.venue);
        if (venue && venue.outdoor) probability *= 1.5;
      }

      if (Math.random() < probability) {
        triggered.push(event);
        Object.entries(event.effect).forEach(([key, val]) => {
          effects[key] = (effects[key] || 0) + val;
        });
        feedback.push(`📢 ${event.name}: ${event.description}`);
      }
    });

    this.state.dynamicEvents = triggered;

    if (triggered.length === 0) {
      feedback.push('No major dynamic events occurred in the lead-up to your event.');
    }

    return { score: 60, effects, feedback, triggered };
  },

  // ──────────────────────────────────────────────
  // PHASE 15 — EVENT DAY
  // ──────────────────────────────────────────────

  _processEventDay(team) {
    const feedback = [];
    const effects = {};
    const v = team.vars;

    // Resolve any unmitigated risks
    let actualAttendance = Math.round(v.attendance * (0.85 + Math.random() * 0.3));
    let qualityMod = 1;

    JCI_DATA.RISKS.forEach(risk => {
      const identified = team.choices.risks.identified.includes(risk.id);
      const mitigated = team.choices.risks.mitigations[risk.id] === risk.mitigation;

      if (Math.random() < risk.probability) {
        if (mitigated) {
          const mitigatedImpact = risk.severity * (1 - risk.mitigationEffect);
          feedback.push(`⚠ ${risk.name} occurred! Mitigated successfully — reduced impact of ${Math.round(mitigatedImpact)}%.`);
          if (risk.impact === 'attendance') actualAttendance -= Math.round(actualAttendance * mitigatedImpact / 100);
        } else if (identified) {
          feedback.push(`✗ ${risk.name} occurred! You identified it but had no proper mitigation.`);
          if (risk.impact === 'attendance') actualAttendance -= Math.round(actualAttendance * risk.severity * 0.7 / 100);
          qualityMod -= 0.05;
        } else {
          feedback.push(`💥 ${risk.name} occurred! You were unprepared — full impact.`);
          if (risk.impact === 'attendance') actualAttendance -= Math.round(actualAttendance * risk.severity / 100);
          qualityMod -= 0.1;
          effects.riskExposure = (effects.riskExposure || 0) + 15;
        }
      }
    });

    // Food consumption
    const foodCost = Math.round(actualAttendance * 12 * qualityMod);
    const hasEnoughFood = team.choices.food.length >= 2;

    // Volunteer performance
    const avgEnergy = team.committee.reduce((s, m) => s + m.currentEnergy, 0) / team.committee.length;
    const volunteerPerformance = avgEnergy / 100;

    // Speaker performance
    const speakers = team.choices.speakers || [];
    let speakerPerformance = 0.7;
    speakers.forEach(spId => {
      const sp = JCI_DATA.SPEAKERS.find(s => s.id === spId);
      if (!sp) return;
      if (Math.random() > (1 - sp.reliability / 10)) {
        speakerPerformance = Math.max(speakerPerformance, sp.expertise / 10);
        feedback.push(`✓ ${sp.name} delivered an excellent performance!`);
      } else {
        feedback.push(`✗ ${sp.name} cancelled last minute. Emergency plan activated.`);
        effects.speakerSatisfaction = (effects.speakerSatisfaction || 0) - 20;
        effects.attendance = (effects.attendance || 0) - 10;
      }
    });

    // Budget outcome
    const ticketRevenue = actualAttendance * team.choices.ticketPrice;
    const additionalCost = Math.round((1 - qualityMod) * 500);

    // Final quality score
    const venue = JCI_DATA.VENUES.find(v => v.id === team.choices.venue);
    const venueQuality = venue ? (venue.professionalism + venue.comfort) / 20 : 0.5;
    const programScore = (team.phaseScores[10] || 50) / 100;
    const foodScore = hasEnoughFood ? 0.8 : 0.4;

    const eventQuality = (volunteerPerformance * 0.3 + venueQuality * 0.25 + programScore * 0.25 + foodScore * 0.2 + speakerPerformance * 0.2) * qualityMod;

    effects.attendance = actualAttendance - v.attendance;
    effects.participantSatisfaction = Math.round(eventQuality * 40);
    effects.projectQuality = Math.round(eventQuality * 50);
    effects.budget = ticketRevenue - additionalCost;

    // Community impact calculation
    const impactFactors = [
      team.vars.communityReputation / 100,
      eventQuality,
      actualAttendance / 100,
      team.vars.marketingEffectiveness / 100
    ];
    const avgImpact = impactFactors.reduce((s, v) => s + v, 0) / impactFactors.length;
    effects.communityImpact = Math.round(avgImpact * 60);

    feedback.push(`📊 Event Day Summary:`);
    feedback.push(`  → Actual Attendance: ${actualAttendance} people`);
    feedback.push(`  → Event Quality: ${Math.round(eventQuality * 100)}%`);
    feedback.push(`  → Volunteer Performance: ${Math.round(volunteerPerformance * 100)}%`);

    const score = Math.round(eventQuality * 100);
    team.eventDay = { actualAttendance, eventQuality, volunteerPerformance, ticketRevenue, qualityMod };

    return { score, effects, feedback, actualAttendance, eventQuality };
  },

  // ──────────────────────────────────────────────
  // PHASE 16 — POST-EVENT REPORTING
  // ──────────────────────────────────────────────

  _processReporting(team, choices) {
    const { reportCompleted, onTime, includedFinancials, includedImpact, sponsorReport } = choices.report || {};
    const feedback = [];
    const effects = {};
    let score = 0;

    if (!reportCompleted) {
      effects.communityReputation = -20;
      effects.sponsorSatisfaction = -25;
      feedback.push('✗ No report submitted. Sponsors and JCI will have a negative perception.');
      return { score: 0, effects, feedback };
    }

    score += 40;
    feedback.push('✓ Report submitted.');

    if (onTime) { score += 20; feedback.push('✓ Report submitted on time — excellent professionalism.'); }
    else { score += 5; effects.communityReputation = -5; feedback.push('◎ Report submitted late — timeliness matters.'); }

    if (includedFinancials) { score += 20; effects.sponsorSatisfaction = 10; feedback.push('✓ Financial breakdown included.'); }
    else { score += 5; feedback.push('◎ No financial data — less transparent.'); }

    if (includedImpact) { score += 20; effects.communityImpact = 10; feedback.push('✓ Impact data included — shows project value.'); }
    else { feedback.push('◎ No impact data — difficult to demonstrate value to sponsors.'); }

    if (sponsorReport) { score += 10; effects.sponsorSatisfaction = (effects.sponsorSatisfaction || 0) + 15; feedback.push('✓ Sponsor report sent — builds loyalty for future projects.'); }

    return { score: Math.min(100, score), effects, feedback };
  },

  // ──────────────────────────────────────────────
  // EFFECTS ENGINE
  // ──────────────────────────────────────────────

  _applyEffects(team, effects) {
    const v = team.vars;

    Object.entries(effects).forEach(([key, delta]) => {
      if (key === 'budget') {
        if (delta > 0) {
          v.budget += delta;
          v.budgetTotal += delta;
        } else {
          v.budget += delta; // delta is negative
          v.budgetSpent += Math.abs(delta);
        }
        return;
      }

      if (key === 'budgetSpent') { v.budgetSpent += delta; return; }
      if (key === 'attendance') { v.attendance = Math.max(0, (v.attendance || 0) + delta); return; }

      // All other variables are 0-100 clamped
      if (key in v) {
        v[key] = Math.max(0, Math.min(100, v[key] + delta));
      }
    });

    // Cross-system interactions
    // High attendance drives up costs → reduces budget
    if (v.attendance > 150) {
      const extraCost = Math.round((v.attendance - 150) * 3);
      v.budget = Math.max(0, v.budget - extraCost);
    }

    // Low volunteer morale reduces team efficiency
    if (v.volunteerMorale < 40) {
      v.teamEfficiency = Math.max(0, v.teamEfficiency - 5);
    }

    // Good community reputation attracts more attendees
    if (v.communityReputation > 70) {
      v.attendance = Math.round(v.attendance * 1.05);
    }

    // Sponsor satisfaction affects future budget
    if (v.sponsorSatisfaction > 80) {
      // Sponsors may give more — handled via dynamic events
    }
  },

  // ──────────────────────────────────────────────
  // SCORING ENGINE
  // ──────────────────────────────────────────────

  calculateFinalScore(team) {
    const v = team.vars;
    const w = JCI_DATA.SCORING_WEIGHTS;

    const budgetHealth = v.budget >= 0 ? Math.min(100, (v.budget / Math.max(1, v.budgetTotal)) * 100) : 0;
    const attendanceScore = Math.min(100, (v.attendance / (team.choices.charter?.expectedAttendance || 60)) * 100);
    const riskScore = Math.max(0, 100 - v.riskExposure);

    const breakdown = {
      budgetHealth: { score: budgetHealth, weight: w.budgetHealth },
      attendance: { score: attendanceScore, weight: w.attendance },
      participantSatisfaction: { score: v.participantSatisfaction, weight: w.participantSatisfaction },
      communityImpact: { score: v.communityImpact, weight: w.communityImpact },
      sponsorSatisfaction: { score: v.sponsorSatisfaction, weight: w.sponsorSatisfaction },
      volunteerMorale: { score: v.volunteerMorale, weight: w.volunteerMorale },
      marketingEffectiveness: { score: v.marketingEffectiveness, weight: w.marketingEffectiveness },
      programQuality: { score: team.phaseScores[10] || 0, weight: w.programQuality },
      riskManagement: { score: riskScore, weight: w.riskManagement }
    };

    const totalScore = Object.values(breakdown).reduce((sum, { score, weight }) => sum + score * weight, 0);
    const finalScore = Math.round(Math.min(100, Math.max(0, totalScore)));

    const starData = JCI_DATA.STAR_THRESHOLDS.find(t => finalScore >= t.min && finalScore <= t.max) ||
      JCI_DATA.STAR_THRESHOLDS[JCI_DATA.STAR_THRESHOLDS.length - 1];

    team.finalScore = finalScore;
    team.stars = starData.stars;
    team.starLabel = starData.label;
    team.isGold = starData.gold || false;
    team.scoreBreakdown = breakdown;

    return { finalScore, stars: starData.stars, starLabel: starData.label, breakdown, isGold: starData.gold };
  },

  determineAwards(teams) {
    const awards = {};

    JCI_DATA.AWARDS.forEach(award => {
      let winner = null;
      let best = -Infinity;

      teams.forEach(team => {
        let value;
        switch (award.criterion) {
          case 'totalScore': value = team.finalScore; break;
          case 'marketingEffectiveness': value = team.vars.marketingEffectiveness; break;
          case 'budgetHealth': value = team.vars.budget; break;
          case 'sponsorSatisfaction': value = team.vars.sponsorSatisfaction; break;
          case 'volunteerMorale': value = team.vars.volunteerMorale; break;
          case 'communityImpact': value = team.vars.communityImpact; break;
          case 'attendance': value = team.vars.attendance; break;
          case 'riskManagement': value = 100 - team.vars.riskExposure; break;
          default: value = 0;
        }
        if (value > best) { best = value; winner = team; }
      });

      if (winner) {
        winner.awards.push(award.id);
        awards[award.id] = { ...award, winner: winner.name };
      }
    });

    return awards;
  },

  generateFeedback(team) {
    const v = team.vars;
    const sc = team.scoreBreakdown || {};
    const lines = [];

    lines.push(`## ${team.name} — Final Debrief`);
    lines.push(`**Final Score: ${team.finalScore}/100 | ${team.starLabel}**`);
    lines.push('');

    // What helped
    lines.push('### What Helped');
    Object.entries(sc).forEach(([key, { score }]) => {
      if (score >= 70) lines.push(`✓ ${this._prettyKey(key)}: ${Math.round(score)}/100`);
    });

    // What hurt
    lines.push('');
    lines.push('### What Hurt');
    Object.entries(sc).forEach(([key, { score }]) => {
      if (score < 40) lines.push(`✗ ${this._prettyKey(key)}: ${Math.round(score)}/100`);
    });

    // Improvements
    lines.push('');
    lines.push('### How to Score Higher');
    if ((sc.budgetHealth?.score || 0) < 60) lines.push('- Secure more sponsors early and manage expenses tightly.');
    if ((sc.marketingEffectiveness?.score || 0) < 60) lines.push('- Start marketing 4 weeks out. Match channels to your audience.');
    if ((sc.volunteerMorale?.score || 0) < 60) lines.push('- Balance workload. Burned-out teams make mistakes on event day.');
    if ((sc.sponsorSatisfaction?.score || 0) < 60) lines.push('- Personal meetings beat emails. Align your proposal with sponsor priorities.');
    if ((sc.communityImpact?.score || 0) < 60) lines.push('- Community impact grows from good marketing, attendance, and program quality together.');
    if ((sc.riskManagement?.score || 0) < 60) lines.push('- Identify and mitigate more risks — especially speaker cancellation and low attendance.');
    if (v.riskExposure > 50) lines.push('- Too many unresolved risks. Always have backup plans.');

    lines.push('');
    lines.push('### Real JCI Insight');
    lines.push('Great JCI projects succeed because of preparation, relationships, and realistic planning. The best committee members are assigned tasks that match their skills. Sponsors respect professionalism, transparency, and follow-through. Your community impact is the real measure of success.');

    return lines.join('\n');
  },

  _prettyKey(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  },

  // ──────────────────────────────────────────────
  // LEADERBOARD
  // ──────────────────────────────────────────────

  getLeaderboard() {
    return [...this.state.teams]
      .map(t => ({
        id: t.id,
        name: t.name,
        color: t.color,
        budget: t.vars.budget,
        attendance: t.vars.attendance,
        volunteerMorale: t.vars.volunteerMorale,
        sponsorSatisfaction: t.vars.sponsorSatisfaction,
        communityReputation: t.vars.communityReputation,
        finalScore: t.finalScore || this._projectedScore(t),
        stars: t.stars || 0,
        awards: t.awards || []
      }))
      .sort((a, b) => b.finalScore - a.finalScore);
  },

  _projectedScore(team) {
    const v = team.vars;
    const phasesDone = Object.keys(team.phaseScores).length;
    if (phasesDone === 0) return 0;
    const avg = Object.values(team.phaseScores).reduce((s, v) => s + v, 0) / phasesDone;
    return Math.round(avg * 0.5);
  },

  // ──────────────────────────────────────────────
  // PERSISTENCE
  // ──────────────────────────────────────────────

  save() {
    try {
      localStorage.setItem('jci_game_state', JSON.stringify(this.state));
    } catch(e) {}
  },

  load() {
    try {
      const saved = localStorage.getItem('jci_game_state');
      if (saved) { this.state = JSON.parse(saved); return true; }
    } catch(e) {}
    return false;
  },

  reset() {
    this.state = {
      phase: 'lobby', currentPhase: 0, round: 1,
      room: { code: '', mode: 'local', hostId: null },
      teams: [], currentTeamIndex: 0,
      dynamicEvents: [], log: []
    };
    this._colorIndex = 0;
    localStorage.removeItem('jci_game_state');
  },

  // ──────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────

  _getTeam(teamId) {
    return this.state.teams.find(t => t.id === teamId);
  },

  getCurrentTeam() {
    return this.state.teams[this.state.currentTeamIndex];
  },

  advanceTeam() {
    this.state.currentTeamIndex = (this.state.currentTeamIndex + 1) % this.state.teams.length;
  },

  allTeamsCompletedPhase(phaseId) {
    return this.state.teams.every(t => t.phaseScores[phaseId] !== undefined);
  },

  advancePhase() {
    this.state.currentPhase++;
    this.state.currentTeamIndex = 0;
    if (this.state.currentPhase > 16) this.state.phase = 'ended';
    this.save();
  },

  log(msg, team) {
    this.state.log.push({ ts: Date.now(), msg, team: team?.name });
    if (this.state.log.length > 200) this.state.log.shift();
  }
};

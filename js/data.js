// JCI UNIFY PROJECT CHALLENGE — Game Data
'use strict';

const JCI_DATA = {

  PROJECTS: [
    {
      id: 'mental_health_panel',
      name: 'Mental Health Panel',
      description: 'A panel discussion bringing awareness to mental health challenges in the community.',
      icon: '🧠',
      category: 'awareness',
      baseAttendanceTarget: 80,
      baseCost: 3200,
      primaryMetrics: ['speakerSatisfaction', 'participantSatisfaction', 'communityReputation'],
      weights: { speakerQuality: 0.35, venueComfort: 0.30, promotion: 0.25, volunteerMorale: 0.10 },
      scoringBonus: { communityImpact: 1.3, participantSatisfaction: 1.2 },
      requirements: { minSpeakers: 2, minVenue: 'professional', minMarketing: 30 },
      tips: 'This project lives or dies on speaker quality and creating a safe, comfortable space.'
    },
    {
      id: 'hydroponics_training',
      name: 'Hydroponics Training Workshop',
      description: 'Hands-on training session teaching sustainable hydroponic farming techniques.',
      icon: '🌱',
      category: 'education',
      baseAttendanceTarget: 40,
      baseCost: 4500,
      primaryMetrics: ['planningQuality', 'teamEfficiency', 'communityImpact'],
      weights: { equipment: 0.30, volunteerCount: 0.25, speakerQuality: 0.25, safetyPlanning: 0.20 },
      scoringBonus: { communityImpact: 1.5, projectQuality: 1.2 },
      requirements: { minEquipment: true, minVolunteers: 8, minBudget: 3500 },
      tips: 'Hands-on workshops need good equipment and well-trained facilitators — logistics matter most.'
    },
    {
      id: 'reading_day',
      name: 'Reading Day',
      description: 'A literacy event inviting children and families to discover the joy of reading.',
      icon: '📚',
      category: 'youth',
      baseAttendanceTarget: 120,
      baseCost: 1500,
      primaryMetrics: ['communityImpact', 'participantSatisfaction', 'marketingEffectiveness'],
      weights: { promotion: 0.35, volunteerCount: 0.30, venueComfort: 0.20, speakerQuality: 0.15 },
      scoringBonus: { communityReputation: 1.4, attendance: 1.3 },
      requirements: { minVolunteers: 10, targetAudience: 'children', minMarketing: 20 },
      tips: 'Community reach is everything here. Cast your marketing net wide, especially through schools.'
    },
    {
      id: 'youth_leadership_workshop',
      name: 'Youth Leadership Workshop',
      description: 'An intensive one-day workshop developing leadership skills in young professionals.',
      icon: '⭐',
      category: 'leadership',
      baseAttendanceTarget: 60,
      baseCost: 2800,
      primaryMetrics: ['speakerSatisfaction', 'planningQuality', 'participantSatisfaction'],
      weights: { speakerQuality: 0.30, programDesign: 0.30, promotion: 0.25, volunteerMorale: 0.15 },
      scoringBonus: { participantSatisfaction: 1.3, sponsorSatisfaction: 1.2 },
      requirements: { minSpeakers: 1, minProgramItems: 4, professional: true },
      tips: 'Structured, high-quality content keeps young leaders engaged. Program flow is critical.'
    },
    {
      id: 'environmental_cleanup',
      name: 'Environmental Cleanup',
      description: 'A community cleanup initiative to restore and protect local natural spaces.',
      icon: '🌍',
      category: 'environment',
      baseAttendanceTarget: 100,
      baseCost: 1800,
      primaryMetrics: ['volunteerMorale', 'communityReputation', 'communityImpact'],
      weights: { volunteerCount: 0.35, equipment: 0.25, safetyPlanning: 0.25, promotion: 0.15 },
      scoringBonus: { communityImpact: 1.6, volunteerMorale: 1.2 },
      requirements: { minVolunteers: 20, safetyPlan: true, equipment: true },
      tips: 'Volunteer turnout makes or breaks this event. Morale and preparation are your top priorities.'
    },
    {
      id: 'networking_event',
      name: 'Networking Event',
      description: 'A professional mixer connecting entrepreneurs, professionals, and JCI members.',
      icon: '🤝',
      category: 'professional',
      baseAttendanceTarget: 70,
      baseCost: 3500,
      primaryMetrics: ['sponsorSatisfaction', 'participantSatisfaction', 'marketingEffectiveness'],
      weights: { venueComfort: 0.30, promotion: 0.30, food: 0.25, speakerQuality: 0.15 },
      scoringBonus: { sponsorSatisfaction: 1.4, communityReputation: 1.2 },
      requirements: { professional: true, minVenue: 'professional', minBudget: 2500 },
      tips: 'First impressions drive everything. Venue, food, and atmosphere determine sponsor perception.'
    },
    {
      id: 'career_fair',
      name: 'Career Fair',
      description: 'A multi-employer job fair connecting young people with career opportunities.',
      icon: '💼',
      category: 'professional',
      baseAttendanceTarget: 200,
      baseCost: 5500,
      primaryMetrics: ['attendance', 'marketingEffectiveness', 'communityImpact'],
      weights: { promotion: 0.35, venueCapacity: 0.25, organizationQuality: 0.25, equipment: 0.15 },
      scoringBonus: { attendance: 1.4, communityReputation: 1.3 },
      requirements: { minVenue: 'large', minMarketing: 40, minBudget: 4000 },
      tips: 'Scale matters here. The more companies and attendees you attract, the higher the impact.'
    }
  ],

  COMMITTEE_ROLES: [
    {
      id: 'project_manager',
      name: 'Project Director',
      emoji: '👔',
      skills: { planning: 95, leadership: 90, communication: 85, budgeting: 70, marketing: 65, logistics: 75, reporting: 80 },
      energy: 100,
      description: 'Oversees all aspects of the project. Best assigned to planning and coordination tasks.'
    },
    {
      id: 'treasurer',
      name: 'Treasurer',
      emoji: '💰',
      skills: { budgeting: 95, planning: 80, reporting: 85, logistics: 60, marketing: 40, communication: 70, fundraising: 90 },
      energy: 100,
      description: 'Manages all financial activities. Strongest in budgeting and financial reporting.'
    },
    {
      id: 'secretary',
      name: 'Secretary',
      emoji: '📋',
      skills: { reporting: 95, communication: 90, planning: 80, logistics: 75, marketing: 50, budgeting: 55, fundraising: 50 },
      energy: 100,
      description: 'Handles documentation and reporting. Excellent communicator and organizer.'
    },
    {
      id: 'branding_officer',
      name: 'Branding Officer',
      emoji: '🎨',
      skills: { marketing: 95, communication: 85, design: 90, social_media: 90, budgeting: 50, logistics: 55, planning: 60 },
      energy: 100,
      description: 'Leads all marketing and branding efforts. Creative powerhouse for promotion.'
    },
    {
      id: 'logistics_officer',
      name: 'Logistics Officer',
      emoji: '🚛',
      skills: { logistics: 95, planning: 85, equipment: 90, venue: 85, marketing: 45, budgeting: 65, communication: 70 },
      energy: 100,
      description: 'Manages all operational logistics. Best for venue, equipment, and day-of execution.'
    },
    {
      id: 'general_member_1',
      name: 'General Member A',
      emoji: '👤',
      skills: { logistics: 65, marketing: 55, communication: 60, planning: 50, budgeting: 45, reporting: 50, fundraising: 55 },
      energy: 100,
      description: 'Versatile team member. Effective when assigned tasks matching their general skills.'
    },
    {
      id: 'general_member_2',
      name: 'General Member B',
      emoji: '👤',
      skills: { marketing: 70, social_media: 65, communication: 75, logistics: 50, planning: 55, budgeting: 40, reporting: 45 },
      energy: 100,
      description: 'Social-media savvy team member. Great for marketing tasks and community outreach.'
    },
    {
      id: 'general_member_3',
      name: 'General Member C',
      emoji: '👤',
      skills: { logistics: 60, planning: 65, equipment: 70, budgeting: 55, marketing: 45, reporting: 55, fundraising: 60 },
      energy: 100,
      description: 'Operationally focused. Good at equipment management and logistical support.'
    }
  ],

  TASKS: [
    { id: 'budget_planning', name: 'Budget Planning', primarySkill: 'budgeting', secondarySkill: 'planning', energyCost: 15 },
    { id: 'sponsor_outreach', name: 'Sponsor Outreach', primarySkill: 'fundraising', secondarySkill: 'communication', energyCost: 20 },
    { id: 'social_media', name: 'Social Media Campaign', primarySkill: 'marketing', secondarySkill: 'social_media', energyCost: 15 },
    { id: 'venue_booking', name: 'Venue Booking', primarySkill: 'logistics', secondarySkill: 'communication', energyCost: 10 },
    { id: 'volunteer_coordination', name: 'Volunteer Coordination', primarySkill: 'leadership', secondarySkill: 'communication', energyCost: 20 },
    { id: 'program_design', name: 'Program Design', primarySkill: 'planning', secondarySkill: 'communication', energyCost: 15 },
    { id: 'impact_report', name: 'Post-Event Report', primarySkill: 'reporting', secondarySkill: 'planning', energyCost: 15 },
    { id: 'equipment_sourcing', name: 'Equipment Sourcing', primarySkill: 'equipment', secondarySkill: 'logistics', energyCost: 10 }
  ],

  SPONSOR_METHODS: [
    {
      id: 'email',
      name: 'Email Outreach',
      icon: '📧',
      cost: 0,
      baseSuccessRate: 0.25,
      pros: ['Free', 'Scalable', 'Low time commitment'],
      cons: ['Low response rate', 'Impersonal', 'Easy to ignore'],
      description: 'Send a formal sponsorship proposal by email.'
    },
    {
      id: 'phone_call',
      name: 'Phone Call',
      icon: '📞',
      cost: 50,
      baseSuccessRate: 0.40,
      pros: ['Personal touch', 'Immediate feedback', 'Shows commitment'],
      cons: ['Time intensive', 'Can be intrusive', 'Requires good communication skills'],
      description: 'Reach out by phone for a direct conversation.'
    },
    {
      id: 'personal_meeting',
      name: 'Personal Meeting',
      icon: '🤝',
      cost: 100,
      baseSuccessRate: 0.60,
      pros: ['Highest success rate', 'Build real relationship', 'Show full proposal'],
      cons: ['Time consuming', 'Requires preparation', 'Travel costs'],
      description: 'Schedule a face-to-face meeting with the sponsor.'
    },
    {
      id: 'third_party',
      name: 'Third-Party Introduction',
      icon: '🔗',
      cost: 0,
      baseSuccessRate: 0.55,
      pros: ['Built-in trust', 'Warm introduction', 'Higher credibility'],
      cons: ['Requires network', 'Depends on relationship quality', 'Less control'],
      description: 'Use a mutual contact to make the introduction.'
    },
    {
      id: 'social_media',
      name: 'Social Media Outreach',
      icon: '📱',
      cost: 0,
      baseSuccessRate: 0.15,
      pros: ['Very cheap', 'Can go viral', 'Broad reach'],
      cons: ['Very low conversion', 'Unprofessional perception', 'Hard to control message'],
      description: 'Reach out through LinkedIn, Facebook, or Instagram.'
    }
  ],

  SPONSOR_EMAIL_ELEMENTS: [
    { id: 'project_name', name: 'Project Name', critical: true, weight: 8, description: 'Clearly states what the project is called.' },
    { id: 'project_purpose', name: 'Project Purpose', critical: true, weight: 15, description: 'Explains why the project exists and what problem it solves.' },
    { id: 'event_date', name: 'Event Date', critical: true, weight: 10, description: 'Specifies when the event will take place.' },
    { id: 'target_audience', name: 'Target Audience', critical: false, weight: 10, description: 'Describes who will attend and benefit.' },
    { id: 'expected_attendance', name: 'Expected Attendance', critical: false, weight: 8, description: 'Shows the scale of reach for the sponsor.' },
    { id: 'org_intro', name: 'Organization Introduction', critical: true, weight: 12, description: 'Introduces JCI and its credibility.' },
    { id: 'sponsorship_request', name: 'Specific Sponsorship Request', critical: true, weight: 15, description: 'Clearly states exactly what you are asking for.' },
    { id: 'sponsor_benefits', name: 'Sponsor Benefits', critical: true, weight: 15, description: 'What the sponsor gets in return (visibility, impact).' },
    { id: 'budget_breakdown', name: 'Budget Breakdown', critical: false, weight: 9, description: 'Shows financial transparency and professionalism.' },
    { id: 'contact_info', name: 'Contact Information', critical: true, weight: 8, description: 'Makes it easy to respond.' }
  ],

  SPONSORS: [
    {
      id: 'digicel',
      name: 'Digicel',
      type: 'corporate',
      priority: 'visibility',
      maxGift: 3000,
      description: 'Major telecom company. Cares about brand exposure and large audiences.',
      preferredProject: ['networking_event', 'career_fair', 'youth_leadership_workshop'],
      resources: ['money', 'promotion'],
      requirements: { minAttendance: 60, professional: true, brandingRights: true }
    },
    {
      id: 'hakrinbank',
      name: 'Hakrinbank',
      type: 'financial',
      priority: 'impact',
      maxGift: 2000,
      description: 'Local bank focused on community development and youth.',
      preferredProject: ['youth_leadership_workshop', 'career_fair', 'reading_day'],
      resources: ['money'],
      requirements: { communityFocus: true, youthFocus: true }
    },
    {
      id: 'fernandes',
      name: 'Fernandes',
      type: 'fmcg',
      priority: 'visibility',
      maxGift: 1500,
      description: 'Popular local drinks company. Provides drinks in exchange for branding.',
      preferredProject: ['networking_event', 'career_fair', 'environmental_cleanup'],
      resources: ['drinks', 'money'],
      requirements: { minAttendance: 50, brandingRights: true }
    },
    {
      id: 'de_surinaamsche_bank',
      name: 'De Surinaamsche Bank',
      type: 'financial',
      priority: 'youth_development',
      maxGift: 2500,
      description: 'Oldest bank in Suriname. Deeply committed to youth and education.',
      preferredProject: ['mental_health_panel', 'reading_day', 'youth_leadership_workshop'],
      resources: ['money', 'venue'],
      requirements: { youthFocus: true, reportingRequired: true }
    },
    {
      id: 'nfi',
      name: 'NFI Supermarkt',
      type: 'retail',
      priority: 'community',
      maxGift: 1000,
      description: 'Community-oriented supermarket. Provides food and modest cash support.',
      preferredProject: ['environmental_cleanup', 'reading_day', 'hydroponics_training'],
      resources: ['food', 'money'],
      requirements: { communityFocus: true }
    },
    {
      id: 'torarica',
      name: 'Torarica Group',
      type: 'hospitality',
      priority: 'visibility',
      maxGift: 4000,
      description: 'Premium hotel and hospitality group. Offers high-end venue and catering.',
      preferredProject: ['networking_event', 'mental_health_panel', 'youth_leadership_workshop'],
      resources: ['venue', 'food', 'money'],
      requirements: { professional: true, minAttendance: 50, premium: true }
    }
  ],

  VENUES: [
    {
      id: 'lvv',
      name: 'LVV Building',
      capacity: 150,
      cost: 800,
      accessibility: 8,
      professionalism: 7,
      comfort: 7,
      outdoor: false,
      type: 'professional',
      amenities: ['parking', 'ac', 'projector', 'kitchen'],
      description: 'Government ministry building. Spacious, accessible, and professional.',
      suitableFor: ['career_fair', 'hydroponics_training', 'youth_leadership_workshop']
    },
    {
      id: 'asfa',
      name: 'ASFA Complex',
      capacity: 300,
      cost: 1200,
      accessibility: 7,
      professionalism: 8,
      comfort: 8,
      outdoor: false,
      type: 'large',
      amenities: ['parking', 'ac', 'stage', 'sound_system', 'kitchen'],
      description: 'Large multi-purpose complex. Great for big events with high attendance.',
      suitableFor: ['career_fair', 'networking_event', 'youth_leadership_workshop']
    },
    {
      id: 'rode_kruis',
      name: 'Rode Kruis',
      capacity: 80,
      cost: 400,
      accessibility: 9,
      professionalism: 8,
      comfort: 7,
      outdoor: false,
      type: 'professional',
      amenities: ['ac', 'projector', 'kitchen'],
      description: 'Red Cross building. Affordable, central, well-known for community events.',
      suitableFor: ['mental_health_panel', 'reading_day', 'youth_leadership_workshop']
    },
    {
      id: 'young_professional_cafe',
      name: 'Young Professional Café',
      capacity: 60,
      cost: 300,
      accessibility: 8,
      professionalism: 7,
      comfort: 9,
      outdoor: false,
      type: 'casual',
      amenities: ['food_included', 'wifi', 'projector'],
      description: 'Trendy café popular with young professionals. Great atmosphere but limited capacity.',
      suitableFor: ['networking_event', 'mental_health_panel']
    },
    {
      id: 'unasat',
      name: 'UNASAT',
      capacity: 200,
      cost: 1000,
      accessibility: 7,
      professionalism: 9,
      comfort: 8,
      outdoor: false,
      type: 'professional',
      amenities: ['parking', 'ac', 'projector', 'stage', 'sound_system'],
      description: 'University space. Academic atmosphere, good for educational events.',
      suitableFor: ['mental_health_panel', 'hydroponics_training', 'reading_day', 'career_fair']
    },
    {
      id: 'le_lemon',
      name: 'Le Lemon',
      capacity: 100,
      cost: 1500,
      accessibility: 7,
      professionalism: 9,
      comfort: 10,
      outdoor: true,
      type: 'premium',
      amenities: ['parking', 'catering', 'ac', 'outdoor_space', 'sound_system'],
      description: 'Upscale event venue. Premium experience but higher cost. Impresses sponsors.',
      suitableFor: ['networking_event', 'mental_health_panel', 'youth_leadership_workshop']
    },
    {
      id: 'kfc',
      name: 'KFC Event Space',
      capacity: 50,
      cost: 200,
      accessibility: 9,
      professionalism: 5,
      comfort: 6,
      outdoor: false,
      type: 'casual',
      amenities: ['food_included'],
      description: 'Fast food restaurant event space. Very cheap but low professional image.',
      suitableFor: ['reading_day']
    },
    {
      id: 'mcdonalds',
      name: "McDonald's Party Room",
      capacity: 40,
      cost: 150,
      accessibility: 9,
      professionalism: 4,
      comfort: 6,
      outdoor: false,
      type: 'casual',
      amenities: ['food_included'],
      description: 'Very affordable but low professional credibility. Fine for children events only.',
      suitableFor: ['reading_day']
    }
  ],

  FOOD_ITEMS: [
    { id: 'bara', name: 'Bara', category: 'food', costPerUnit: 5, satisfactionBonus: 8, local: true, vegetarian: false, description: 'Popular fried snack. Very affordable.' },
    { id: 'sate', name: 'Sate', category: 'food', costPerUnit: 12, satisfactionBonus: 15, local: true, vegetarian: false, description: 'Grilled skewer dish. Popular and substantial.' },
    { id: 'bami', name: 'Bami', category: 'food', costPerUnit: 8, satisfactionBonus: 12, local: true, vegetarian: true, description: 'Noodle dish. Great for large groups.' },
    { id: 'nasi', name: 'Nasi', category: 'food', costPerUnit: 8, satisfactionBonus: 12, local: true, vegetarian: true, description: 'Rice dish. Very filling and popular.' },
    { id: 'chow_mein', name: 'Chow Mein', category: 'food', costPerUnit: 9, satisfactionBonus: 11, local: true, vegetarian: true, description: 'Chinese-influenced noodle dish.' },
    { id: 'salad', name: 'Salad', category: 'food', costPerUnit: 6, satisfactionBonus: 7, local: false, vegetarian: true, description: 'Healthy option. Low cost, modest satisfaction.' },
    { id: 'macaroni', name: 'Macaroni', category: 'food', costPerUnit: 7, satisfactionBonus: 10, local: true, vegetarian: true, description: 'Creamy pasta dish. Crowd-pleasing.' },
    { id: 'sausage', name: 'Sausage', category: 'food', costPerUnit: 6, satisfactionBonus: 9, local: false, vegetarian: false, description: 'Simple grilled sausage. Great for outdoor events.' },
    { id: 'fernandes_drinks', name: 'Fernandes', category: 'drinks', costPerUnit: 3, satisfactionBonus: 8, local: true, vegetarian: true, description: 'Local soft drink brand. Very popular.' },
    { id: 'coropina', name: 'Coropina', category: 'drinks', costPerUnit: 4, satisfactionBonus: 9, local: true, vegetarian: true, description: 'Local brand. Excellent quality drinks.' },
    { id: 'water', name: 'Water', category: 'drinks', costPerUnit: 1, satisfactionBonus: 5, local: false, vegetarian: true, description: 'Essential. Always include water.' },
    { id: 'juice', name: 'Fruit Juice', category: 'drinks', costPerUnit: 4, satisfactionBonus: 9, local: false, vegetarian: true, description: 'Healthy and refreshing option.' }
  ],

  MARKETING_CHANNELS: [
    { id: 'whatsapp', name: 'WhatsApp', icon: '📲', costPerPoint: 5, reach: 200, audienceMatch: { youth: 9, professional: 7, community: 8, children: 5 }, conversionRate: 0.12, description: 'Suriname\'s most used platform. High personal reach but limited scalability.' },
    { id: 'facebook', name: 'Facebook', icon: '📘', costPerPoint: 8, reach: 800, audienceMatch: { youth: 7, professional: 6, community: 9, children: 4 }, conversionRate: 0.07, description: 'Large Surinamese audience. Good for community events and middle-aged demographics.' },
    { id: 'instagram', name: 'Instagram', icon: '📸', costPerPoint: 10, reach: 500, audienceMatch: { youth: 9, professional: 8, community: 6, children: 3 }, conversionRate: 0.09, description: 'Strong with youth and young professionals. Visual content performs best.' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', costPerPoint: 12, reach: 700, audienceMatch: { youth: 10, professional: 5, community: 5, children: 7 }, conversionRate: 0.11, description: 'Explosive reach for youth audiences if content goes viral.' },
    { id: 'radio', name: 'Radio', icon: '📻', costPerPoint: 20, reach: 2000, audienceMatch: { youth: 5, professional: 6, community: 9, children: 6 }, conversionRate: 0.04, description: 'Massive reach across all demographics. Expensive but broad.' },
    { id: 'television', name: 'Television', icon: '📺', costPerPoint: 40, reach: 5000, audienceMatch: { youth: 5, professional: 7, community: 10, children: 8 }, conversionRate: 0.03, description: 'Highest reach but most expensive. Best for prestige and wide awareness.' },
    { id: 'flyers', name: 'Flyers', icon: '📄', costPerPoint: 3, reach: 300, audienceMatch: { youth: 6, professional: 5, community: 8, children: 7 }, conversionRate: 0.06, description: 'Physical distribution. Effective in specific neighborhoods and venues.' },
    { id: 'schools', name: 'Schools', icon: '🏫', costPerPoint: 5, reach: 500, audienceMatch: { youth: 8, professional: 2, community: 6, children: 10 }, conversionRate: 0.15, description: 'Direct access to students. Perfect for youth-focused events.' },
    { id: 'universities', name: 'Universities', icon: '🎓', costPerPoint: 5, reach: 400, audienceMatch: { youth: 9, professional: 8, community: 4, children: 1 }, conversionRate: 0.14, description: 'Ideal for young professional and student audiences.' },
    { id: 'partners', name: 'Partner Organizations', icon: '🤝', costPerPoint: 0, reach: 600, audienceMatch: { youth: 6, professional: 8, community: 9, children: 5 }, conversionRate: 0.18, description: 'Leverage existing networks. Free and high-conversion.' }
  ],

  MARKETING_TIMING: [
    { id: 'eight_weeks', name: '8 Weeks Before', modifier: 0.85, description: 'Too early — people forget. Awareness builds but interest wanes.' },
    { id: 'six_weeks', name: '6 Weeks Before', modifier: 0.95, description: 'Good lead time. Enough space for multiple campaigns.' },
    { id: 'four_weeks', name: '4 Weeks Before', modifier: 1.15, description: 'Optimal window. Creates urgency without being too late.' },
    { id: 'two_weeks', name: '2 Weeks Before', modifier: 1.05, description: 'Creates urgency but limits reach. Last-minute signups increase.' },
    { id: 'one_week', name: '1 Week Before', modifier: 0.70, description: 'Too late for most channels. Only social media performs well.' }
  ],

  PROGRAM_ITEMS: [
    { id: 'opening', name: 'Opening Ceremony', duration: 15, engagementScore: 6, energyCost: -5, description: 'Welcome and introductions. Sets the tone.' },
    { id: 'icebreaker', name: 'Icebreaker Activity', duration: 20, engagementScore: 9, energyCost: 5, description: 'Energizes the crowd. Builds connection early.' },
    { id: 'panel_discussion', name: 'Panel Discussion', duration: 60, engagementScore: 8, energyCost: 8, description: 'Expert speakers engage with audience. High learning impact.' },
    { id: 'workshop', name: 'Hands-On Workshop', duration: 90, engagementScore: 9, energyCost: 10, description: 'Practical skill-building. Highest participant satisfaction.' },
    { id: 'keynote', name: 'Keynote Address', duration: 45, engagementScore: 7, energyCost: 6, description: 'Inspiring talk from a prominent speaker.' },
    { id: 'networking', name: 'Networking Session', duration: 30, engagementScore: 8, energyCost: 5, description: 'Informal mingling. Great for professional events.' },
    { id: 'break', name: 'Break / Refreshments', duration: 15, engagementScore: 7, energyCost: -10, description: 'Recharges participants. Essential for long programs.' },
    { id: 'qa', name: 'Q&A Session', duration: 30, engagementScore: 7, energyCost: 3, description: 'Audience questions. Increases sense of participation.' },
    { id: 'group_activity', name: 'Group Activity', duration: 45, engagementScore: 9, energyCost: 8, description: 'Team-based exercise. Highly engaging.' },
    { id: 'presentation', name: 'Presentation', duration: 30, engagementScore: 5, energyCost: 4, description: 'Standard presentation. Lower engagement if overused.' },
    { id: 'closing', name: 'Closing Ceremony', duration: 20, engagementScore: 6, energyCost: -5, description: 'Wrap-up, thanks, and final message.' }
  ],

  SPEAKERS: [
    { id: 'dr_rahman', name: 'Dr. Reshma Rahman', field: 'Mental Health', expertise: 9, popularity: 8, cost: 500, reliability: 9, description: 'Renowned psychologist. Excellent for mental health panels.' },
    { id: 'eng_williams', name: 'Eng. Marcus Williams', field: 'Agriculture/Tech', expertise: 9, popularity: 7, cost: 400, reliability: 8, description: 'Hydroponic farming expert. Perfect for STEM events.' },
    { id: 'minister_jones', name: 'Minister Shirley Jones', field: 'Government/Youth', expertise: 8, popularity: 9, cost: 0, reliability: 6, description: 'Government official. High prestige but may cancel last minute.' },
    { id: 'mr_davidson', name: 'Mr. Keith Davidson', field: 'Business/Leadership', expertise: 8, popularity: 8, cost: 350, reliability: 9, description: 'Successful entrepreneur. Strong draw for leadership events.' },
    { id: 'ms_amara', name: 'Ms. Yara Amara', field: 'Environment', expertise: 9, popularity: 7, cost: 200, reliability: 9, description: 'Environmental activist. Passionate and inspiring.' },
    { id: 'dr_patel', name: 'Dr. Anika Patel', field: 'Education', expertise: 8, popularity: 6, cost: 300, reliability: 9, description: 'Education researcher. Deep knowledge, moderate appeal.' },
    { id: 'local_celebrity', name: 'Desiree Bouterse-Lazo', field: 'Media/Inspiration', expertise: 6, popularity: 10, cost: 800, reliability: 7, description: 'Local media personality. Very high draw but expensive.' }
  ],

  RISKS: [
    { id: 'rain', name: 'Rain / Bad Weather', probability: 0.3, impact: 'attendance', severity: -20, mitigation: 'book_indoor_backup', mitigationEffect: 0.9, description: 'Weather affects outdoor attendance significantly.' },
    { id: 'low_attendance', name: 'Low Attendance', probability: 0.4, impact: 'revenue', severity: -25, mitigation: 'ticket_guarantees', mitigationEffect: 0.7, description: 'Fewer attendees than expected.' },
    { id: 'speaker_cancel', name: 'Speaker Cancellation', probability: 0.25, impact: 'satisfaction', severity: -30, mitigation: 'backup_speaker', mitigationEffect: 0.8, description: 'Keynote or panel speaker cancels last minute.' },
    { id: 'sponsor_withdraw', name: 'Sponsor Withdrawal', probability: 0.2, impact: 'budget', severity: -35, mitigation: 'diversify_sponsors', mitigationEffect: 0.75, description: 'A key sponsor pulls out before the event.' },
    { id: 'equipment_failure', name: 'Equipment Failure', probability: 0.2, impact: 'quality', severity: -20, mitigation: 'technical_backup', mitigationEffect: 0.9, description: 'AV or equipment fails during the event.' },
    { id: 'volunteer_shortage', name: 'Volunteer Shortage', probability: 0.3, impact: 'morale', severity: -25, mitigation: 'overrecruit', mitigationEffect: 0.85, description: 'Not enough volunteers show up on event day.' },
    { id: 'budget_overrun', name: 'Budget Overrun', probability: 0.35, impact: 'budget', severity: -20, mitigation: 'contingency_fund', mitigationEffect: 0.85, description: 'Costs exceed budget projections.' },
    { id: 'media_backlash', name: 'Social Media Backlash', probability: 0.1, impact: 'reputation', severity: -40, mitigation: 'pr_strategy', mitigationEffect: 0.7, description: 'Negative publicity spreads online.' }
  ],

  DYNAMIC_EVENTS: [
    { id: 'viral_post', name: 'Post Goes Viral!', probability: 0.12, effect: { attendance: 20, marketingEffectiveness: 15, communityReputation: 10 }, description: 'Your social media post went viral! Attendance is spiking.' },
    { id: 'gov_official', name: 'Government Official Attends', probability: 0.1, effect: { communityReputation: 20, sponsorSatisfaction: 15, communityImpact: 10 }, description: 'A government official will attend your event — adding prestige and media attention.' },
    { id: 'media_coverage', name: 'Media Coverage Secured', probability: 0.15, effect: { attendance: 15, communityReputation: 20, marketingEffectiveness: 10 }, description: 'Local media will cover your event. Expect higher turnout and wider impact.' },
    { id: 'competitor_event', name: 'Competing Event Same Day', probability: 0.2, effect: { attendance: -15, participantSatisfaction: -5 }, description: 'Another event is scheduled on the same day. Some attendees may choose the other event.' },
    { id: 'extra_donation', name: 'Surprise Donation', probability: 0.1, effect: { budget: 500, sponsorSatisfaction: 10 }, description: 'A generous donor has made an unexpected contribution to your project.' },
    { id: 'volunteer_burnout', name: 'Volunteer Team Burnout', probability: 0.2, trigger: 'high_workload', effect: { volunteerMorale: -20, teamEfficiency: -15, projectQuality: -10 }, description: 'Your team is overworked and morale is dropping. Mistakes are starting to happen.' },
    { id: 'sponsor_impressed', name: 'Sponsor Impressed by Update', probability: 0.15, effect: { sponsorSatisfaction: 20, budget: 300 }, description: 'Your sponsor loved the progress update you sent. They\'re considering additional support.' },
    { id: 'bad_weather', name: 'Storm Warning Issued', probability: 0.1, effect: { attendance: -25, riskExposure: 20 }, description: 'Weather authorities have issued a storm warning near your event date.' }
  ],

  EXPENSE_CATEGORIES: [
    { id: 'venue', name: 'Venue Rental', required: true, flexible: false },
    { id: 'food', name: 'Food & Catering', required: true, flexible: true },
    { id: 'drinks', name: 'Drinks', required: true, flexible: true },
    { id: 'marketing', name: 'Marketing Materials', required: false, flexible: true },
    { id: 'printing', name: 'Printing', required: false, flexible: true },
    { id: 'equipment', name: 'Equipment', required: false, flexible: true },
    { id: 'transport', name: 'Transportation', required: false, flexible: true },
    { id: 'decorations', name: 'Decorations', required: false, flexible: true },
    { id: 'speakers', name: 'Speaker Fees', required: false, flexible: true },
    { id: 'contingency', name: 'Contingency Fund', required: false, flexible: true }
  ],

  AWARDS: [
    { id: 'best_overall', name: 'Best Overall Project', icon: '🏆', criterion: 'totalScore', description: 'Highest combined project score.' },
    { id: 'best_marketing', name: 'Best Marketing Team', icon: '📢', criterion: 'marketingEffectiveness', description: 'Highest marketing effectiveness score.' },
    { id: 'best_budget', name: 'Best Budget Management', icon: '💰', criterion: 'budgetHealth', description: 'Most financially responsible team.' },
    { id: 'best_sponsor', name: 'Best Sponsor Relations', icon: '🤝', criterion: 'sponsorSatisfaction', description: 'Highest sponsor satisfaction score.' },
    { id: 'best_volunteer', name: 'Best Volunteer Management', icon: '❤️', criterion: 'volunteerMorale', description: 'Highest volunteer morale maintained.' },
    { id: 'highest_impact', name: 'Highest Community Impact', icon: '🌟', criterion: 'communityImpact', description: 'Greatest positive community change.' },
    { id: 'highest_attendance', name: 'Highest Attendance', icon: '👥', criterion: 'attendance', description: 'Most people reached.' },
    { id: 'best_risk', name: 'Best Risk Management', icon: '🛡️', criterion: 'riskManagement', description: 'Most prepared team.' }
  ],

  SCORING_WEIGHTS: {
    budgetHealth: 0.15,
    attendance: 0.15,
    participantSatisfaction: 0.15,
    communityImpact: 0.15,
    sponsorSatisfaction: 0.10,
    volunteerMorale: 0.10,
    marketingEffectiveness: 0.10,
    programQuality: 0.05,
    riskManagement: 0.05
  },

  STAR_THRESHOLDS: [
    { min: 0, max: 20, stars: 1, label: 'Needs Improvement' },
    { min: 21, max: 40, stars: 2, label: 'Basic Project' },
    { min: 41, max: 60, stars: 3, label: 'Good Project' },
    { min: 61, max: 80, stars: 4, label: 'Excellent Project' },
    { min: 81, max: 94, stars: 5, label: 'Outstanding Project' },
    { min: 95, max: 100, stars: 5, label: '⭐ Gold Standard Project ⭐', gold: true }
  ]
};

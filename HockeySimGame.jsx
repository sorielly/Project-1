import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import _ from 'lodash';

// ============================================================
// CONSTANTS
// ============================================================

const TEAM_DEFS = [
  { id: 'BLZ', name: 'Northbrook Blizzard', city: 'Northbrook', nickname: 'Blizzard', color: '#4FC3F7', darkColor: '#0277BD', abbr: 'NBL' },
  { id: 'WLV', name: 'Ridgeport Wolves', city: 'Ridgeport', nickname: 'Wolves', color: '#78909C', darkColor: '#37474F', abbr: 'RWV' },
  { id: 'FLC', name: 'Summit City Falcons', city: 'Summit City', nickname: 'Falcons', color: '#FFB74D', darkColor: '#E65100', abbr: 'SCF' },
  { id: 'THN', name: 'Lakewood Thunder', city: 'Lakewood', nickname: 'Thunder', color: '#CE93D8', darkColor: '#6A1B9A', abbr: 'LWT' },
  { id: 'TTN', name: 'Iron Valley Titans', city: 'Iron Valley', nickname: 'Titans', color: '#EF9A9A', darkColor: '#B71C1C', abbr: 'IVT' },
  { id: 'SHK', name: 'Coastal Harbor Sharks', city: 'Coastal Harbor', nickname: 'Sharks', color: '#80CBC4', darkColor: '#00695C', abbr: 'CHS' },
];

const FIRST_NAMES = [
  'Alex','Andrei','Anton','Blake','Brad','Brandon','Brayden','Brett','Caden','Cameron',
  'Carter','Chad','Charlie','Chase','Chris','Cody','Cole','Colin','Connor','Curtis',
  'Dallas','Daniel','Dave','Derek','Dylan','Ethan','Evan','Finn','Garrett','Hayden',
  'Henrik','Hunter','Jacob','Jake','Jamie','Jared','Jason','Jeff','Jeremy','Jesse',
  'Joel','John','Jonas','Jonathan','Jordan','Josh','Justin','Karl','Kevin','Kyle',
  'Liam','Logan','Lucas','Luke','Marcus','Mark','Mason','Matt','Max','Michael',
  'Mike','Nathan','Nick','Niklas','Noah','Nolan','Oliver','Owen','Patrick','Paul',
  'Peter','Philip','Reid','Riley','Ryan','Sam','Scott','Sean','Seth','Shane',
  'Simon','Stefan','Sven','Taylor','Thomas','Tim','Tom','Travis','Trevor','Tyler',
  'Victor','Wade','William','Zach','Erik','Lars','Mikael','Oskar','Patrik','Rasmus',
  'Rickard','Sebastian','Viktor','Alec','Brendan','Darnell','Elias','Felix','Grant','Ilya',
  'Ivan','Jakub','Janne','Juraj','Kris','Luc','Marek','Mats','Milan','Ondrej',
  'Pavel','Petr','Robert','Roman','Sergei','Tomas','Vladimir','Yaroslav','Aleksei','Boris',
  'Dmitri','Evgeni','Kirill','Maxim','Nikolai','Pavel','Valeri','Vadim','Vitali','Yuri',
  'Anze','Brendan','Devin','Dustin','Eric','Frederic','Geordie','Hugo','Isac','Jiri',
  'Kristoffer','Lukas','Marcel','Niclas','Olaf','Pekka','Riku','Sami','Teemu','Tuukka',
  'Artem','Bogdan','Danil','Evsei','Filip','Georgi','Henrik','Igor','Jan','Klaus',
];

const LAST_NAMES = [
  'Adams','Anderson','Armstrong','Baker','Barkov','Bergeron','Bishop','Blake','Bouchard','Brown',
  'Burns','Campbell','Carter','Chara','Clark','Clarke','Cole','Cooper','Crawford','Davis',
  'Doan','Duchene','Dumont','Eichel','Ellis','Evans','Ferguson','Fisher','Fleury','Foligno',
  'Forsberg','Getzlaf','Gibson','Green','Hall','Hamilton','Harris','Hayes','Hill','Hoffman',
  'Holland','Horvat','Hughes','Hunter','Iginla','Jackson','Jensen','Johnson','Johnston','Jones',
  'Kane','Karlsson','Keith','Kennedy','King','Kopitar','Kreider','Kuznetsov','Laine','Landeskog',
  'Lee','Lehner','Lewis','Lidstrom','MacKinnon','Malkin','Marner','Martin','Matthews','McAvoy',
  'McDonald','McDavid','Miller','Mitchell','Moore','Moreau','Murray','Nylander','Ovechkin','Parise',
  'Pastrnak','Pettersson','Pietrangelo','Price','Pronger','Rakell','Richards','Rinne','Roy','Shattenkirk',
  'Simmonds','Skinner','Smith','Stamkos','Stewart','Stone','Subban','Suzuki','Tavares','Thompson',
  'Thornton','Toews','Turris','Vanek','Voracek','Walker','Weber','White','Williams','Wilson',
  'Backstrom','Boeser','Caufield','DeAngelo','Ekholm','Forbort','Girard','Heiskanen','Jarnkrok','Keller',
  'Lindstrom','Meier','Nehring','Olivier','Pionk','Quinn','Reinhart','Severson','Trouba','Ullmark',
  'Vermette','Wheeler','Xhekaj','Yamamoto','Zuccarello','Aho','Bjork','Couture','Draisaitl','Ekblad',
  'Fabbri','Gaudreau','Hoglander','Inherited','Johansson','Killorn','Lafleur','Marchessault','Nichushkin','Panarin',
];

const FORWARD_ROLES = ['Sniper','Playmaker','Power Forward','Two-Way Forward','Grinder','Enforcer'];
const DEFENSE_ROLES = ['Offensive Defenseman','Defensive Defenseman','Two-Way Defenseman','Enforcer Defenseman'];
const GOALIE_ROLES = ['Butterfly','Hybrid','Stand Up'];

const SKATER_ATTRS = [
  'deking','handEye','passing','puckControl',
  'defensiveAwareness','shotBlocking','stickChecking',
  'offensiveAwareness','slapShotAccuracy','slapShotPower','wristShotAccuracy','wristShotPower',
  'acceleration','agility','balance','endurance','speed',
  'aggression','bodyChecking','fightingSkill','strength',
  'discipline','durability','faceoffs','poise'
];

const GOALIE_SKATING_ATTRS = ['acceleration','agility','balance','endurance','speed'];
const GOALIE_SPECIFIC_ATTRS = [
  'gloveHigh','gloveLow','stickHigh','stickLow','fiveHole',
  'angles','breakaway','pokeCheque','reboundControl','shotRecovery','vision'
];

// Role attribute tiers: 'primary'=high, 'secondary'=medium, 'tertiary'=low
const ROLE_ATTR_TIERS = {
  'Sniper': {
    primary: ['wristShotAccuracy','wristShotPower','slapShotAccuracy','slapShotPower','offensiveAwareness','speed','puckControl'],
    secondary: ['deking','handEye','acceleration','agility','passing','balance','discipline','poise'],
    tertiary: ['defensiveAwareness','bodyChecking','fightingSkill','strength','aggression','shotBlocking','stickChecking','faceoffs']
  },
  'Playmaker': {
    primary: ['passing','puckControl','offensiveAwareness','deking','speed','agility'],
    secondary: ['handEye','acceleration','balance','wristShotAccuracy','wristShotPower','discipline','poise','faceoffs'],
    tertiary: ['bodyChecking','aggression','strength','fightingSkill','slapShotAccuracy','slapShotPower','shotBlocking','stickChecking']
  },
  'Power Forward': {
    primary: ['strength','bodyChecking','puckControl','handEye','wristShotPower','offensiveAwareness','aggression'],
    secondary: ['wristShotAccuracy','slapShotPower','balance','endurance','passing','discipline','faceoffs'],
    tertiary: ['speed','agility','deking','fightingSkill','slapShotAccuracy','defensiveAwareness','shotBlocking']
  },
  'Two-Way Forward': {
    primary: ['offensiveAwareness','defensiveAwareness','speed','faceoffs','stickChecking','passing','puckControl'],
    secondary: ['wristShotAccuracy','wristShotPower','acceleration','agility','balance','endurance','discipline','poise'],
    tertiary: ['fightingSkill','bodyChecking','aggression','slapShotAccuracy','slapShotPower','shotBlocking','deking']
  },
  'Grinder': {
    primary: ['bodyChecking','aggression','strength','stickChecking','shotBlocking','endurance'],
    secondary: ['balance','defensiveAwareness','faceoffs','discipline','puckControl','speed'],
    tertiary: ['wristShotAccuracy','slapShotAccuracy','deking','poise','passing','offensiveAwareness','fightingSkill']
  },
  'Enforcer': {
    primary: ['fightingSkill','strength','aggression','bodyChecking','balance'],
    secondary: ['endurance','discipline','speed','stickChecking','defensiveAwareness'],
    tertiary: ['wristShotAccuracy','wristShotPower','slapShotAccuracy','slapShotPower','passing','puckControl','deking','poise','offensiveAwareness']
  },
  'Offensive Defenseman': {
    primary: ['slapShotAccuracy','slapShotPower','offensiveAwareness','passing','speed','defensiveAwareness'],
    secondary: ['wristShotAccuracy','wristShotPower','acceleration','agility','puckControl','discipline','poise'],
    tertiary: ['bodyChecking','strength','fightingSkill','shotBlocking','stickChecking','balance','aggression']
  },
  'Defensive Defenseman': {
    primary: ['defensiveAwareness','stickChecking','shotBlocking','bodyChecking','strength','balance'],
    secondary: ['aggression','endurance','faceoffs','discipline','speed','passing'],
    tertiary: ['offensiveAwareness','wristShotAccuracy','wristShotPower','slapShotAccuracy','slapShotPower','deking','fightingSkill']
  },
  'Two-Way Defenseman': {
    primary: ['defensiveAwareness','passing','speed','stickChecking','offensiveAwareness','slapShotAccuracy'],
    secondary: ['shotBlocking','bodyChecking','balance','agility','puckControl','discipline','endurance'],
    tertiary: ['fightingSkill','aggression','deking','wristShotAccuracy','faceoffs']
  },
  'Enforcer Defenseman': {
    primary: ['fightingSkill','strength','aggression','bodyChecking','defensiveAwareness'],
    secondary: ['balance','endurance','stickChecking','shotBlocking','discipline'],
    tertiary: ['passing','puckControl','offensiveAwareness','speed','deking','slapShotAccuracy','slapShotPower']
  },
  'Butterfly': {
    primary: ['fiveHole','gloveLow','stickLow','reboundControl'],
    secondary: ['angles','vision','gloveHigh','stickHigh','shotRecovery','balance'],
    tertiary: ['breakaway','pokeCheque','agility','speed']
  },
  'Hybrid': {
    primary: ['angles','vision','reboundControl','shotRecovery'],
    secondary: ['gloveHigh','gloveLow','stickHigh','stickLow','fiveHole','agility','balance'],
    tertiary: ['breakaway','pokeCheque','speed']
  },
  'Stand Up': {
    primary: ['angles','breakaway','pokeCheque','agility'],
    secondary: ['vision','gloveHigh','stickHigh','shotRecovery','reboundControl','speed'],
    tertiary: ['gloveLow','stickLow','fiveHole','balance']
  }
};

// Role weights for overall calculation
const ROLE_WEIGHTS = {
  'Sniper': { wristShotAccuracy:0.09,wristShotPower:0.07,slapShotAccuracy:0.07,slapShotPower:0.06,offensiveAwareness:0.07,speed:0.06,puckControl:0.05,deking:0.04,handEye:0.04,passing:0.03,acceleration:0.03,agility:0.03,poise:0.04,balance:0.02,endurance:0.02,discipline:0.03,durability:0.02,faceoffs:0.02,defensiveAwareness:0.03,shotBlocking:0.01,stickChecking:0.02,bodyChecking:0.01,aggression:0.01,fightingSkill:0.01,strength:0.02 },
  'Playmaker': { passing:0.10,puckControl:0.08,offensiveAwareness:0.08,deking:0.06,speed:0.06,agility:0.06,handEye:0.04,acceleration:0.04,wristShotAccuracy:0.04,poise:0.04,discipline:0.03,faceoffs:0.04,balance:0.03,endurance:0.03,defensiveAwareness:0.03,stickChecking:0.03,wristShotPower:0.03,slapShotAccuracy:0.02,slapShotPower:0.02,shotBlocking:0.01,bodyChecking:0.01,aggression:0.01,fightingSkill:0.01,strength:0.02,durability:0.02 },
  'Power Forward': { strength:0.07,bodyChecking:0.06,puckControl:0.06,handEye:0.06,wristShotPower:0.05,offensiveAwareness:0.05,aggression:0.05,wristShotAccuracy:0.05,slapShotPower:0.04,balance:0.05,endurance:0.04,passing:0.04,discipline:0.03,faceoffs:0.03,speed:0.04,agility:0.03,acceleration:0.03,deking:0.03,poise:0.03,defensiveAwareness:0.03,stickChecking:0.03,slapShotAccuracy:0.03,shotBlocking:0.02,fightingSkill:0.03,durability:0.02 },
  'Two-Way Forward': { offensiveAwareness:0.06,defensiveAwareness:0.06,speed:0.05,faceoffs:0.06,stickChecking:0.05,passing:0.05,puckControl:0.05,wristShotAccuracy:0.05,agility:0.04,balance:0.04,acceleration:0.03,endurance:0.04,discipline:0.04,poise:0.04,deking:0.03,handEye:0.03,wristShotPower:0.04,slapShotAccuracy:0.03,shotBlocking:0.04,bodyChecking:0.03,strength:0.03,aggression:0.02,fightingSkill:0.01,slapShotPower:0.02,durability:0.02 },
  'Grinder': { bodyChecking:0.08,aggression:0.07,strength:0.07,stickChecking:0.06,shotBlocking:0.06,endurance:0.06,balance:0.06,defensiveAwareness:0.05,faceoffs:0.05,discipline:0.04,puckControl:0.04,speed:0.04,durability:0.04,wristShotAccuracy:0.03,passing:0.03,deking:0.02,poise:0.02,offensiveAwareness:0.03,acceleration:0.03,agility:0.03,handEye:0.02,wristShotPower:0.02,slapShotAccuracy:0.02,slapShotPower:0.01,fightingSkill:0.03 },
  'Enforcer': { fightingSkill:0.10,strength:0.09,aggression:0.08,bodyChecking:0.08,balance:0.06,endurance:0.05,discipline:0.05,stickChecking:0.05,defensiveAwareness:0.05,speed:0.04,durability:0.04,shotBlocking:0.04,puckControl:0.03,passing:0.02,poise:0.02,offensiveAwareness:0.02,wristShotAccuracy:0.02,wristShotPower:0.02,deking:0.01,slapShotAccuracy:0.01,slapShotPower:0.01,faceoffs:0.02,handEye:0.02,acceleration:0.03,agility:0.03 },
  'Offensive Defenseman': { slapShotAccuracy:0.08,slapShotPower:0.07,offensiveAwareness:0.07,passing:0.07,speed:0.05,defensiveAwareness:0.05,wristShotAccuracy:0.05,wristShotPower:0.04,puckControl:0.05,agility:0.04,acceleration:0.03,balance:0.03,discipline:0.04,poise:0.04,deking:0.03,handEye:0.03,stickChecking:0.04,endurance:0.04,shotBlocking:0.03,bodyChecking:0.03,strength:0.03,aggression:0.02,fightingSkill:0.01,faceoffs:0.02,durability:0.02 },
  'Defensive Defenseman': { defensiveAwareness:0.10,stickChecking:0.08,shotBlocking:0.08,bodyChecking:0.07,strength:0.06,balance:0.05,aggression:0.05,endurance:0.05,faceoffs:0.04,discipline:0.05,speed:0.04,passing:0.04,puckControl:0.03,durability:0.03,acceleration:0.02,agility:0.02,poise:0.02,offensiveAwareness:0.02,wristShotAccuracy:0.02,wristShotPower:0.02,slapShotAccuracy:0.02,slapShotPower:0.02,deking:0.01,fightingSkill:0.03,handEye:0.02 },
  'Two-Way Defenseman': { defensiveAwareness:0.07,passing:0.06,speed:0.05,stickChecking:0.06,offensiveAwareness:0.05,slapShotAccuracy:0.05,shotBlocking:0.05,bodyChecking:0.04,balance:0.05,agility:0.04,acceleration:0.03,endurance:0.04,discipline:0.04,poise:0.03,puckControl:0.05,wristShotAccuracy:0.04,wristShotPower:0.03,slapShotPower:0.04,deking:0.02,handEye:0.02,strength:0.04,aggression:0.03,fightingSkill:0.02,faceoffs:0.02,durability:0.02 },
  'Enforcer Defenseman': { fightingSkill:0.09,strength:0.08,aggression:0.07,bodyChecking:0.07,defensiveAwareness:0.07,balance:0.06,endurance:0.05,stickChecking:0.05,shotBlocking:0.05,discipline:0.04,speed:0.03,durability:0.04,passing:0.03,puckControl:0.02,poise:0.02,offensiveAwareness:0.02,wristShotAccuracy:0.02,wristShotPower:0.02,slapShotAccuracy:0.02,slapShotPower:0.02,deking:0.01,acceleration:0.03,agility:0.03,faceoffs:0.02,handEye:0.02 },
};

const GOALIE_WEIGHTS = {
  angles:0.10,reboundControl:0.09,vision:0.09,gloveHigh:0.07,gloveLow:0.07,
  stickHigh:0.07,stickLow:0.07,fiveHole:0.07,shotRecovery:0.06,breakaway:0.05,
  pokeCheque:0.04,speed:0.03,agility:0.04,balance:0.04,acceleration:0.03,
  endurance:0.02
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function uuid() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function weightedRand(weights) {
  // weights: array of [item, weight]
  const total = weights.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [item, w] of weights) {
    r -= w;
    if (r <= 0) return item;
  }
  return weights[weights.length - 1][0];
}

// ============================================================
// PLAYER GENERATION
// ============================================================

function generateName(usedNames) {
  let full;
  let tries = 0;
  do {
    const first = FIRST_NAMES[randInt(0, FIRST_NAMES.length - 1)];
    const last = LAST_NAMES[randInt(0, LAST_NAMES.length - 1)];
    full = `${first} ${last}`;
    tries++;
  } while (usedNames.has(full) && tries < 200);
  usedNames.add(full);
  const parts = full.split(' ');
  return { firstName: parts[0], lastName: parts[1] };
}

function getPositionAndAlt(position) {
  if (position === 'G') return { position: 'G', altPosition: null };
  const forwards = ['LW','C','RW'];
  const defense = ['LD','RD'];
  if (forwards.includes(position)) {
    const others = forwards.filter(p => p !== position);
    const hasAlt = Math.random() < 0.35;
    return { position, altPosition: hasAlt ? others[randInt(0, others.length-1)] : null };
  }
  if (defense.includes(position)) {
    const other = position === 'LD' ? 'RD' : 'LD';
    const hasAlt = Math.random() < 0.25;
    return { position, altPosition: hasAlt ? other : null };
  }
  return { position, altPosition: null };
}

function generateAttributes(role, targetOvr, isGoalie) {
  const attrs = {};
  if (isGoalie) {
    const allGoalieAttrs = [...GOALIE_SPECIFIC_ATTRS, ...GOALIE_SKATING_ATTRS];
    const tiers = ROLE_ATTR_TIERS[role] || { primary: [], secondary: [], tertiary: [] };
    for (const attr of allGoalieAttrs) {
      let val;
      if (tiers.primary.includes(attr)) val = randInt(Math.max(1,targetOvr-5), Math.min(99,targetOvr+12));
      else if (tiers.secondary.includes(attr)) val = randInt(Math.max(1,targetOvr-10), Math.min(99,targetOvr+5));
      else val = randInt(Math.max(1,targetOvr-20), Math.min(99,targetOvr-2));
      attrs[attr] = clamp(val + randInt(-3,3), 1, 99);
    }
  } else {
    const tiers = ROLE_ATTR_TIERS[role] || { primary: [], secondary: [], tertiary: [] };
    for (const attr of SKATER_ATTRS) {
      let val;
      if (tiers.primary.includes(attr)) val = randInt(Math.max(1,targetOvr-5), Math.min(99,targetOvr+12));
      else if (tiers.secondary.includes(attr)) val = randInt(Math.max(1,targetOvr-10), Math.min(99,targetOvr+5));
      else val = randInt(Math.max(1,targetOvr-20), Math.min(99,targetOvr-2));
      attrs[attr] = clamp(val + randInt(-3,3), 1, 99);
    }
  }
  return attrs;
}

function calculateOverall(role, attributes, isGoalie) {
  if (isGoalie) {
    let total = 0;
    let wTotal = 0;
    const allGoalieAttrs = [...GOALIE_SPECIFIC_ATTRS, ...GOALIE_SKATING_ATTRS];
    for (const attr of allGoalieAttrs) {
      const w = GOALIE_WEIGHTS[attr] || 0.02;
      total += (attributes[attr] || 50) * w;
      wTotal += w;
    }
    return clamp(Math.round(total / wTotal), 1, 99);
  } else {
    const weights = ROLE_WEIGHTS[role];
    if (!weights) return 75;
    let total = 0;
    let wTotal = 0;
    for (const attr of SKATER_ATTRS) {
      const w = weights[attr] || 0.01;
      total += (attributes[attr] || 50) * w;
      wTotal += w;
    }
    return clamp(Math.round(total / wTotal), 1, 99);
  }
}

function makeEmptySeasonStats(isGoalie) {
  if (isGoalie) return { GP:0,W:0,L:0,OTL:0,SV:0,SA:0,GA:0,SO:0,minutes:0 };
  return { GP:0,G:0,A:0,PIM:0,SOG:0,HIT:0,BLK:0,TK:0,GV:0,FOW:0,FOL:0,PPG:0,PPA:0,SHG:0,SHA:0,GWG:0,OTG:0,plusMinus:0,TOI:0 };
}

function generatePlayer(position, role, targetOvr, lineNumber, isExtra, teamId, usedNames) {
  const isGoalie = position === 'G';
  const { firstName, lastName } = generateName(usedNames);
  const { position: pos, altPosition } = getPositionAndAlt(position);

  // Age distribution by line
  let age;
  if (lineNumber === 1) age = randInt(23, 31);
  else if (lineNumber === 2) age = randInt(22, 32);
  else if (lineNumber === 3) age = randInt(20, 34);
  else age = randInt(19, 36);
  if (isGoalie) age = lineNumber === 1 ? randInt(24, 33) : randInt(20, 36);

  const attributes = generateAttributes(role, targetOvr, isGoalie);
  let overall = calculateOverall(role, attributes, isGoalie);

  // Scale attributes if overall is off by more than 3
  const diff = targetOvr - overall;
  if (Math.abs(diff) > 3) {
    const scale = targetOvr / Math.max(overall, 1);
    const attrList = isGoalie ? [...GOALIE_SPECIFIC_ATTRS, ...GOALIE_SKATING_ATTRS] : SKATER_ATTRS;
    for (const attr of attrList) {
      attributes[attr] = clamp(Math.round(attributes[attr] * scale + randInt(-2,2)), 1, 99);
    }
    overall = calculateOverall(role, attributes, isGoalie);
  }

  // Phase 2: potential & development
  const potential = assignPotential(age, overall);
  const devRate = assignDevelopmentRate();
  const yearsInLeague = Math.max(0, age - 18);

  return {
    id: uuid(),
    firstName, lastName,
    age, position: pos, altPosition, role,
    overall,
    attributes,
    seasonStats: makeEmptySeasonStats(isGoalie),
    playoffStats: makeEmptySeasonStats(isGoalie),
    gameLog: [],
    lineNumber,
    isExtra,
    teamId,
    injury: null,
    rosterStatus: isExtra ? 'extra' : 'active',
    gamesPlayedSinceReturn: 0,
    goalieFatigue: 0,
    potential,
    scoutedPotential: Math.max(50, Math.min(99, potential + randInt(-4, 4))),
    potentialAccuracy: 'Known',
    peakOverall: overall,
    developmentRate: devRate,
    yearsInLeague,
    isRookie: yearsInLeague === 0,
    retired: false,
    retiredSeason: null,
    awardsWon: [],
    careerStats: makeEmptySeasonStats(isGoalie),
    careerPlayoffStats: makeEmptySeasonStats(isGoalie),
    seasonHistory: [],
    draftedSeason: null, draftedRound: null, draftedPick: null, draftedBy: null,
  };
}

// ============================================================
// TEAM GENERATION
// ============================================================

const ROSTER_SLOTS = [
  // 1st line: LW, C, RW
  { pos:'LW', line:1, isExtra:false }, { pos:'C', line:1, isExtra:false }, { pos:'RW', line:1, isExtra:false },
  // 2nd line
  { pos:'LW', line:2, isExtra:false }, { pos:'C', line:2, isExtra:false }, { pos:'RW', line:2, isExtra:false },
  // 3rd line
  { pos:'LW', line:3, isExtra:false }, { pos:'C', line:3, isExtra:false }, { pos:'RW', line:3, isExtra:false },
  // 4th line
  { pos:'LW', line:4, isExtra:false }, { pos:'C', line:4, isExtra:false }, { pos:'RW', line:4, isExtra:false },
  // D pairs
  { pos:'LD', line:1, isExtra:false }, { pos:'RD', line:1, isExtra:false },
  { pos:'LD', line:2, isExtra:false }, { pos:'RD', line:2, isExtra:false },
  { pos:'LD', line:3, isExtra:false }, { pos:'RD', line:3, isExtra:false },
  // Goalies
  { pos:'G', line:1, isExtra:false }, { pos:'G', line:2, isExtra:false },
  // Extras
  { pos:'LW', line:4, isExtra:true }, { pos:'RW', line:4, isExtra:true }, { pos:'LD', line:3, isExtra:true },
];

function getTargetOvr(pos, line) {
  if (pos === 'G') return line === 1 ? randInt(83,90) : randInt(74,82);
  if (line === 1) return randInt(85, 92);
  if (line === 2) return randInt(82, 87);
  if (line === 3) return randInt(76, 82);
  return randInt(70, 78);
}

function pickRole(pos) {
  const fwdWeights = [['Sniper',2],['Playmaker',2],['Power Forward',2],['Two-Way Forward',2],['Grinder',1],['Enforcer',0.5]];
  const defWeights = [['Offensive Defenseman',2],['Defensive Defenseman',2],['Two-Way Defenseman',2],['Enforcer Defenseman',0.5]];
  const goalWeights = [['Butterfly',2],['Hybrid',2],['Stand Up',1]];
  const fwdPos = ['LW','C','RW'];
  const defPos = ['LD','RD'];
  if (pos === 'G') return weightedRand(goalWeights);
  if (fwdPos.includes(pos)) return weightedRand(fwdWeights);
  return weightedRand(defWeights);
}

function generateTeam(teamDef, usedNames) {
  const players = [];
  for (const slot of ROSTER_SLOTS) {
    const role = pickRole(slot.pos);
    const targetOvr = getTargetOvr(slot.pos, slot.line);
    const p = generatePlayer(slot.pos, role, targetOvr, slot.line, slot.isExtra, teamDef.id, usedNames);
    players.push(p);
  }
  const teamObj = {
    ...teamDef,
    players,
    seasonStats: { GP:0,W:0,L:0,OTL:0,GF:0,GA:0,PPG:0,PPO:0,PKG_against:0,PKO:0,SF:0,SA:0 },
    playoffStats: { GP:0,W:0,L:0,GF:0,GA:0,PPG:0,PPO:0,PKG_against:0,PKO:0 },
    injuredReserve: [],
    dayToDay: [],
    strategy: null, // set after generation
  };
  teamObj.strategy = buildDefaultStrategy(teamObj);
  return teamObj;
}

function generateLeague() {
  const usedNames = new Set();
  const teams = TEAM_DEFS.map(def => generateTeam(def, usedNames));
  const freeAgents = generateFreeAgents(usedNames);
  return { teams, freeAgents };
}

// ============================================================
// FREE AGENT GENERATION
// ============================================================

function generateFreeAgents(usedNames) {
  const positions = [
    ...Array(8).fill('LW'), ...Array(8).fill('C'), ...Array(7).fill('RW'),
    ...Array(5).fill('LD'), ...Array(5).fill('RD'), ...Array(5).fill('RD'),
    ...Array(6).fill('G'), ...Array(6).fill('G'),
  ];
  const pool = positions.slice(0, 50);
  return pool.map(pos => {
    const role = pickRole(pos);
    const targetOvr = randInt(65, 82);
    const line = targetOvr >= 78 ? 2 : targetOvr >= 74 ? 3 : 4;
    return generatePlayer(pos, role, targetOvr, line, false, null, usedNames);
  });
}


// ============================================================
// LINE CHEMISTRY
// ============================================================

function getForwardLineChemistry(p1, p2, p3) {
  const roles = [p1.role, p2.role, p3.role].sort();
  const key = roles.join('|');
  const highCombos = [
    'Playmaker|Sniper|Two-Way Forward',
    'Playmaker|Power Forward|Sniper',
    'Playmaker|Playmaker|Sniper',
    'Two-Way Forward|Two-Way Forward|Two-Way Forward',
    'Grinder|Grinder|Two-Way Forward',
    'Playmaker|Sniper|Sniper',
  ];
  const lowCombos = [
    'Enforcer|Enforcer|Enforcer',
    'Sniper|Sniper|Sniper',
    'Grinder|Grinder|Grinder',
  ];
  // Check high combos
  for (const combo of highCombos) {
    if (key === combo.split('|').sort().join('|')) return 1 + randFloat(0.05, 0.10);
  }
  // Check low combos
  for (const combo of lowCombos) {
    if (key === combo.split('|').sort().join('|')) return 1 - randFloat(0.03, 0.08);
  }
  // Check Enforcer pairings
  const hasEnforcer = roles.includes('Enforcer');
  const hasPlaymaker = roles.includes('Playmaker');
  const hasSniper = roles.includes('Sniper');
  if (hasEnforcer && (hasPlaymaker || hasSniper)) return 1 - randFloat(0.03, 0.06);
  return 1.0;
}

function getDefensePairChemistry(p1, p2) {
  const roles = [p1.role, p2.role].sort().join('|');
  const highPairs = [
    'Defensive Defenseman|Offensive Defenseman',
    'Two-Way Defenseman|Two-Way Defenseman',
    'Defensive Defenseman|Two-Way Defenseman',
    'Offensive Defenseman|Two-Way Defenseman',
  ];
  const lowPairs = [
    'Defensive Defenseman|Defensive Defenseman',
    'Offensive Defenseman|Offensive Defenseman',
    'Enforcer Defenseman|Offensive Defenseman',
    'Enforcer Defenseman|Enforcer Defenseman',
  ];
  for (const pair of highPairs) {
    if (roles === pair.split('|').sort().join('|')) return 1 + randFloat(0.05, 0.08);
  }
  for (const pair of lowPairs) {
    if (roles === pair.split('|').sort().join('|')) return 1 - randFloat(0.03, 0.06);
  }
  return 1.0;
}


// ============================================================
// PHASE 6B — TEAM STRATEGY CONSTANTS
// ============================================================

const STRATEGY_META = {
  offensive: { label:'Offensive', icon:'⚔️', color:'#ef4444',
    desc:'Push the pace. More shots, more chances — both ways.' },
  defensive: { label:'Defensive', icon:'🛡️', color:'#3b82f6',
    desc:'Lock it down. Fewer chances against, fewer generated.' },
  balanced:  { label:'Balanced',  icon:'⚖️', color:'#a855f7',
    desc:'No extremes. Adapts to the flow of the game.' },
  physical:  { label:'Physical',  icon:'💥', color:'#f97316',
    desc:'Impose your will. Heavy hits, intimidation, more penalties.' },
};

const STRATEGY_MODIFIERS = {
  offensive: { shotGeneration:1.18, shotQuality:1.08, defensiveEfficiency:0.88,
    penaltyDrawRate:1.05, penaltyTakeRate:0.97, hitRate:0.90, fatigueRate:1.08, turnoverRate:1.06 },
  defensive: { shotGeneration:0.86, shotQuality:0.94, defensiveEfficiency:1.15,
    penaltyDrawRate:0.94, penaltyTakeRate:1.04, hitRate:1.05, fatigueRate:0.92, turnoverRate:0.90 },
  balanced:  { shotGeneration:1.00, shotQuality:1.00, defensiveEfficiency:1.00,
    penaltyDrawRate:1.00, penaltyTakeRate:1.00, hitRate:1.00, fatigueRate:1.00, turnoverRate:1.00 },
  physical:  { shotGeneration:0.96, shotQuality:0.97, defensiveEfficiency:1.05,
    penaltyDrawRate:1.12, penaltyTakeRate:1.20, hitRate:1.45, fatigueRate:1.10, turnoverRate:1.03 },
};

const MATCHUP_MODIFIERS = {
  'offensive_defensive': { home:{ shotQuality:0.94, turnoverRate:1.05 }, away:{ shotGeneration:0.95 } },
  'offensive_offensive': { home:{ shotGeneration:1.05, defensiveEfficiency:0.95 }, away:{ shotGeneration:1.05, defensiveEfficiency:0.95 } },
  'offensive_physical':  { home:{ shotQuality:0.96, fatigueRate:1.04 }, away:{ penaltyDrawRate:1.06 } },
  'defensive_physical':  { home:{ shotGeneration:0.94, defensiveEfficiency:1.03 }, away:{ shotGeneration:0.94, hitRate:0.95 } },
  'physical_physical':   { home:{ hitRate:1.10, penaltyTakeRate:1.10 }, away:{ hitRate:1.10, penaltyTakeRate:1.10 } },
  'defensive_defensive': { home:{ shotGeneration:0.92, shotQuality:0.96 }, away:{ shotGeneration:0.92, shotQuality:0.96 } },
};

const PP_FORMATION_WEIGHTS = {
  umbrella: {
    label:'1-3-1 Umbrella', desc:'Classic setup with a quarterback at the point.',
    keyAttributes:{ slapShotAccuracy:0.15, slapShotPower:0.12, passing:0.22, offensiveAwareness:0.18, puckControl:0.13, wristShotAccuracy:0.10, handEye:0.10 },
    posImportance:{ ld:1.3, rd:1.1, c:1.1, lw:1.0, rw:1.0 },
  },
  overload: {
    label:'Overload', desc:'Stack one side; move puck quickly.',
    keyAttributes:{ passing:0.25, wristShotAccuracy:0.18, offensiveAwareness:0.20, puckControl:0.15, speed:0.07, handEye:0.08, slapShotAccuracy:0.07 },
    posImportance:{ lw:1.2, c:1.1, rw:1.0, ld:1.1, rd:1.0 },
  },
  behind_the_net: {
    label:'Behind the Net', desc:'Center works behind net as distributor.',
    keyAttributes:{ passing:0.20, puckControl:0.18, strength:0.12, offensiveAwareness:0.18, wristShotAccuracy:0.12, balance:0.08, handEye:0.07, slapShotAccuracy:0.05 },
    posImportance:{ c:1.4, lw:1.1, rw:1.1, ld:1.0, rd:0.9 },
  },
};

const PK_FORMATION_WEIGHTS = {
  box: {
    label:'Box (Passive)', desc:'Protect the middle; force outside shots.',
    keyAttributes:{ defensiveAwareness:0.28, stickChecking:0.22, shotBlocking:0.20, bodyChecking:0.10, discipline:0.10, speed:0.10 },
    shgMultiplier:0.70, safetyRating:1.10,
  },
  diamond: {
    label:'Diamond (Hybrid)', desc:'1-2-1 shape; one forward pressures high.',
    keyAttributes:{ defensiveAwareness:0.24, stickChecking:0.20, speed:0.18, shotBlocking:0.14, offensiveAwareness:0.10, bodyChecking:0.08, discipline:0.06 },
    shgMultiplier:1.00, safetyRating:1.00,
  },
  aggressive: {
    label:'Aggressive', desc:'Heavy pressure on puck carrier. High risk, high reward.',
    keyAttributes:{ speed:0.24, stickChecking:0.22, defensiveAwareness:0.18, offensiveAwareness:0.14, bodyChecking:0.12, shotBlocking:0.05, discipline:0.05 },
    shgMultiplier:1.40, safetyRating:0.88,
  },
};

// ── Strategy Helpers ────────────────────────────────────────

function getMatchupModifiers(homeStrat, awayStrat) {
  const key = `${homeStrat}_${awayStrat}`;
  if (MATCHUP_MODIFIERS[key]) return MATCHUP_MODIFIERS[key];
  const rev = `${awayStrat}_${homeStrat}`;
  if (MATCHUP_MODIFIERS[rev]) return { home: MATCHUP_MODIFIERS[rev].away || {}, away: MATCHUP_MODIFIERS[rev].home || {} };
  return { home:{}, away:{} };
}

function mergeStratMods(base, extra) {
  const out = { ...base };
  for (const [k,v] of Object.entries(extra)) {
    if (typeof out[k] === 'number') out[k] *= v; else out[k] = v;
  }
  return out;
}

function composeGameStratMods(team, opponent) {
  const strat = team.strategy?.fiveOnFive || 'balanced';
  const oppStrat = opponent.strategy?.fiveOnFive || 'balanced';
  const base = { ...(STRATEGY_MODIFIERS[strat] || STRATEGY_MODIFIERS.balanced) };
  const matchup = getMatchupModifiers(strat, oppStrat);
  const myMatchupMods = team === team ? matchup.home : matchup.away; // team is always "home" perspective
  return mergeStratMods(base, myMatchupMods);
}

function getIceTimeWeight(player) {
  if (player.position === 'G') return 0;
  const isD = ['LD','RD'].includes(player.position);
  const line = player.lineNumber || 4;
  const fwdWeights = { 1:1.0, 2:0.8, 3:0.6, 4:0.4 };
  const defWeights = { 1:1.0, 2:0.8, 3:0.6 };
  return (isD ? defWeights : fwdWeights)[line] || 0.4;
}

function calculatePPScore(player) {
  if (player.position === 'G') return -Infinity;
  const a = player.attributes;
  let score = (a.wristShotAccuracy||50)*0.15 + (a.slapShotAccuracy||50)*0.12 +
    (a.slapShotPower||50)*0.08 + (a.passing||50)*0.20 + (a.offensiveAwareness||50)*0.18 +
    (a.puckControl||50)*0.15 + (a.handEye||50)*0.07 + (a.speed||50)*0.05;
  const isD = ['LD','RD'].includes(player.position);
  if (isD) score += ((a.slapShotPower||50) + (a.slapShotAccuracy||50)) * 0.05;
  const roleBonus = { 'Sniper':1.08,'Playmaker':1.10,'Offensive Defenseman':1.06,'Two-Way Forward':1.00,
    'Power Forward':1.03,'Two-Way Defenseman':0.95,'Grinder':0.85,'Enforcer':0.75,
    'Defensive Defenseman':0.80,'Enforcer Defenseman':0.70 };
  return score * (roleBonus[player.role] || 1.0);
}

function calculatePKScore(player) {
  if (player.position === 'G') return -Infinity;
  const a = player.attributes;
  let score = (a.defensiveAwareness||50)*0.25 + (a.stickChecking||50)*0.20 +
    (a.shotBlocking||50)*0.18 + (a.speed||50)*0.12 + (a.discipline||50)*0.10 +
    (a.faceoffs||50)*0.08 + (a.bodyChecking||50)*0.07;
  const roleBonus = { 'Two-Way Forward':1.12,'Grinder':1.08,'Defensive Defenseman':1.10,
    'Two-Way Defenseman':1.06,'Enforcer':0.95,'Sniper':0.82,'Playmaker':0.88,
    'Offensive Defenseman':0.85,'Power Forward':0.95,'Enforcer Defenseman':0.92 };
  return score * (roleBonus[player.role] || 1.0);
}

function autoGeneratePPUnits(team) {
  const healthySkaters = team.players.filter(p => p.position !== 'G' && !p.isExtra && (!p.injury?.active || (p.injury?.gamesTotal||0) < 5));
  const scored = _.orderBy(healthySkaters.map(p => ({ player:p, score:calculatePPScore(p) })), 'score', 'desc');
  const unit1Players = scored.slice(0,5).map(s => s.player);
  const unit2Players = scored.slice(5,10).map(s => s.player);
  return { unit1: assignPPPositions(unit1Players), unit2: assignPPPositions(unit2Players) };
}

function assignPPPositions(players) {
  const unit = { lw:null, c:null, rw:null, ld:null, rd:null };
  const fwds = players.filter(p => ['LW','C','RW'].includes(p.position));
  const defs = players.filter(p => ['LD','RD'].includes(p.position));
  for (const d of defs) {
    if (!unit.ld) unit.ld = d.id; else if (!unit.rd) unit.rd = d.id;
  }
  for (const f of fwds) {
    if (f.position === 'C' && !unit.c) unit.c = f.id;
    else if (f.position === 'LW' && !unit.lw) unit.lw = f.id;
    else if (f.position === 'RW' && !unit.rw) unit.rw = f.id;
    else {
      if (!unit.c) unit.c = f.id;
      else if (!unit.lw) unit.lw = f.id;
      else if (!unit.rw) unit.rw = f.id;
      else if (!unit.ld) unit.ld = f.id;
      else if (!unit.rd) unit.rd = f.id;
    }
  }
  return unit;
}

function autoGeneratePKUnits(team) {
  const healthySkaters = team.players.filter(p => p.position !== 'G' && !p.isExtra && (!p.injury?.active || (p.injury?.gamesTotal||0) < 5));
  const fwdScores = _.orderBy(healthySkaters.filter(p => ['LW','C','RW'].includes(p.position)).map(p => ({ player:p, score:calculatePKScore(p) })), 'score', 'desc');
  const defScores = _.orderBy(healthySkaters.filter(p => ['LD','RD'].includes(p.position)).map(p => ({ player:p, score:calculatePKScore(p) })), 'score', 'desc');
  return {
    unit1: { f1:fwdScores[0]?.player.id, f2:fwdScores[1]?.player.id, ld:defScores[0]?.player.id, rd:defScores[1]?.player.id },
    unit2: { f1:fwdScores[2]?.player.id, f2:fwdScores[3]?.player.id, ld:defScores[2]?.player.id, rd:defScores[3]?.player.id },
  };
}

function calculatePPEffectiveness(team, unit, formation) {
  if (!unit || !formation) return 1.0;
  const fw = PP_FORMATION_WEIGHTS[formation];
  if (!fw) return 1.0;
  const positions = ['lw','c','rw','ld','rd'];
  let totalScore = 0, totalWeight = 0;
  for (const pos of positions) {
    const pid = unit[pos]; if (!pid) continue;
    const p = team.players.find(pl => pl.id === pid); if (!p) continue;
    const posImp = fw.posImportance[pos] || 1.0;
    let ps = 0;
    for (const [attr, w] of Object.entries(fw.keyAttributes)) ps += (p.attributes[attr]||50) * w;
    totalScore += ps * posImp; totalWeight += posImp;
  }
  if (!totalWeight) return 1.0;
  const avg = totalScore / totalWeight;
  return Math.min(1.25, Math.max(0.75, 0.60 + (avg/99)*0.70));
}

function calculatePKEffectiveness(team, unit, formation) {
  if (!unit || !formation) return 1.0;
  const fw = PK_FORMATION_WEIGHTS[formation];
  if (!fw) return 1.0;
  const players = [unit.f1, unit.f2, unit.ld, unit.rd].map(id => team.players.find(p => p.id === id)).filter(Boolean);
  if (!players.length) return 1.0;
  let totalScore = 0;
  for (const p of players) {
    let ps = 0;
    for (const [attr, w] of Object.entries(fw.keyAttributes)) ps += (p.attributes[attr]||50) * w;
    totalScore += ps;
  }
  const avg = totalScore / players.length;
  return Math.min(1.25, Math.max(0.75, 0.60 + (avg/99)*0.70)) * (fw.safetyRating || 1.0);
}

function computePPMult(team) {
  const pp = team.strategy?.pp;
  if (!pp?.unit1 || !pp?.formation) return 1.0;
  return calculatePPEffectiveness(team, pp.unit1, pp.formation);
}

function computePKMult(team) {
  const pk = team.strategy?.pk;
  if (!pk?.unit1 || !pk?.formation) return 1.0;
  return calculatePKEffectiveness(team, pk.unit1, pk.formation);
}

function buildDefaultStrategy(team) {
  const ppUnits = autoGeneratePPUnits(team);
  const pkUnits = autoGeneratePKUnits(team);
  return {
    fiveOnFive: 'balanced',
    pp: { formation:'umbrella', ...ppUnits, unit1TimeSplit:0.60, aggression:'normal' },
    pk: { formation:'box', ...pkUnits, unit1TimeSplit:0.55 },
  };
}

// ============================================================
// GAME SIMULATION ENGINE
// ============================================================

function getActiveRoster(team) {
  const active = team.players.filter(p => !p.isExtra);
  const fwdLines = {};
  const defPairs = {};
  const goalies = [];
  for (const p of active) {
    if (p.position === 'G') { goalies.push(p); continue; }
    const isD = ['LD','RD'].includes(p.position);
    if (isD) {
      if (!defPairs[p.lineNumber]) defPairs[p.lineNumber] = [];
      defPairs[p.lineNumber].push(p);
    } else {
      if (!fwdLines[p.lineNumber]) fwdLines[p.lineNumber] = [];
      fwdLines[p.lineNumber].push(p);
    }
  }
  // Sort by line number
  const lines = [1,2,3,4].map(n => fwdLines[n] || []).filter(l => l.length > 0);
  const pairs = [1,2,3].map(n => defPairs[n] || []).filter(p => p.length > 0);
  const starter = goalies.find(g => g.lineNumber === 1) || goalies[0];
  return { lines, pairs, goalies, starter };
}

function getLinePP(team) {
  // Top PP unit: top 3 forwards by offensive skill, top 2 D by shot power
  const fwds = team.players.filter(p => ['LW','C','RW'].includes(p.position) && !p.isExtra);
  const defs = team.players.filter(p => ['LD','RD'].includes(p.position) && !p.isExtra);
  const sortedFwds = _.orderBy(fwds, p => (p.attributes.offensiveAwareness||0) + (p.attributes.wristShotAccuracy||0) + (p.attributes.slapShotPower||0), 'desc');
  const sortedDefs = _.orderBy(defs, p => (p.attributes.slapShotPower||0) + (p.attributes.passing||0), 'desc');
  return { forwards: sortedFwds.slice(0,3), defense: sortedDefs.slice(0,2) };
}

function getLinePK(team) {
  const fwds = team.players.filter(p => ['LW','C','RW'].includes(p.position) && !p.isExtra);
  const defs = team.players.filter(p => ['LD','RD'].includes(p.position) && !p.isExtra);
  const sortedFwds = _.orderBy(fwds, p => (p.attributes.defensiveAwareness||0) + (p.attributes.stickChecking||0), 'desc');
  const sortedDefs = _.orderBy(defs, p => (p.attributes.defensiveAwareness||0) + (p.attributes.shotBlocking||0), 'desc');
  return { forwards: sortedFwds.slice(0,2), defense: sortedDefs.slice(0,2) };
}

function attrVal(p, attr) {
  if (!p) return 50;
  if (p.attributes) return p.attributes[attr] || 50;
  return 50;
}

function simulateGame(homeTeamIn, awayTeamIn) {
  // Deep clone players for game state (don't mutate original)
  const homeTeam = { ...homeTeamIn, players: homeTeamIn.players.map(p => ({ ...p, attributes: { ...p.attributes }, seasonStats: { ...p.seasonStats } })) };
  const awayTeam = { ...awayTeamIn, players: awayTeamIn.players.map(p => ({ ...p, attributes: { ...p.attributes }, seasonStats: { ...p.seasonStats } })) };

  const homeRoster = getActiveRoster(homeTeam);
  const awayRoster = getActiveRoster(awayTeam);
  const homePP = getLinePP(homeTeam);
  const awayPP = getLinePP(awayTeam);
  const homePK = getLinePK(homeTeam);
  const awayPK = getLinePK(awayTeam);

  // Phase 6B: Strategy modifiers for this game
  const homeStratMods = composeGameStratMods(homeTeam, awayTeam);
  const awayStratMods = composeGameStratMods(awayTeam, homeTeam);
  const homePPMult = computePPMult(homeTeam);
  const awayPPMult = computePPMult(awayTeam);
  const homePKMult = computePKMult(homeTeam);
  const awayPKMult = computePKMult(awayTeam);
  const gameIntimidation = { home: 0, away: 0 };

  // Precompute chemistry for lines
  const homeLineChem = homeRoster.lines.map(line => {
    if (line.length >= 3) return getForwardLineChemistry(line[0], line[1], line[2]);
    return 1.0;
  });
  const awayLineChem = awayRoster.lines.map(line => {
    if (line.length >= 3) return getForwardLineChemistry(line[0], line[1], line[2]);
    return 1.0;
  });
  const homePairChem = homeRoster.pairs.map(pair => {
    if (pair.length >= 2) return getDefensePairChemistry(pair[0], pair[1]);
    return 1.0;
  });
  const awayPairChem = awayRoster.pairs.map(pair => {
    if (pair.length >= 2) return getDefensePairChemistry(pair[0], pair[1]);
    return 1.0;
  });

  // Game state
  const gameStats = {
    home: { goals:0, shots:0, hits:0, blocks:0, pim:0, fow:0, fol:0, ppg:0, ppo:0, pkg:0, pko:0, takeaways:0, giveaways:0 },
    away: { goals:0, shots:0, hits:0, blocks:0, pim:0, fow:0, fol:0, ppg:0, ppo:0, pkg:0, pko:0, takeaways:0, giveaways:0 },
  };

  const playerGameStats = {};
  const allPlayers = [...homeTeam.players.filter(p => !p.isExtra), ...awayTeam.players.filter(p => !p.isExtra)];
  for (const p of allPlayers) {
    const isGoalie = p.position === 'G';
    playerGameStats[p.id] = isGoalie
      ? { GP:1, W:0, L:0, OTL:0, SV:0, SA:0, GA:0, SO:0, minutes:0 }
      : { GP:1, G:0, A:0, PIM:0, SOG:0, HIT:0, BLK:0, TK:0, GV:0, FOW:0, FOL:0, PPG:0, PPA:0, SHG:0, SHA:0, GWG:0, OTG:0, plusMinus:0, TOI:0 };
  }

  // TOI tracking (seconds)
  const toi = {};
  for (const p of allPlayers) toi[p.id] = 0;

  const scoringEvents = [];
  let penalties = []; // { team:'home'|'away', endTime:number }
  let gameTime = 0; // seconds, max 3600 (60 min)
  let lineIdx = { home: 0, away: 0 };
  let pairIdx = { home: 0, away: 0 };
  let shiftTimer = { home: 0, away: 0 };

  const SHIFT_LEN = 30; // 30 second shifts
  const PERIOD_LEN = 1200; // 20 min

  // Home/away goalie
  const homeGoalie = homeRoster.starter;
  const awayGoalie = awayRoster.starter;
  if (homeGoalie) playerGameStats[homeGoalie.id].minutes = 60;
  if (awayGoalie) playerGameStats[awayGoalie.id].minutes = 60;

  function getCurrentLines(side) {
    const roster = side === 'home' ? homeRoster : awayRoster;
    const lineI = lineIdx[side] % Math.max(1, roster.lines.length);
    const pairI = pairIdx[side] % Math.max(1, roster.pairs.length);
    return {
      fwds: roster.lines[lineI] || [],
      defs: roster.pairs[pairI] || [],
      lineChem: (side === 'home' ? homeLineChem : awayLineChem)[lineI] || 1.0,
      pairChem: (side === 'home' ? homePairChem : awayPairChem)[pairI] || 1.0,
      lineI, pairI
    };
  }

  function advanceLines(side) {
    const roster = side === 'home' ? homeRoster : awayRoster;
    shiftTimer[side]++;
    const shiftLength = lineIdx[side] === 0 ? 2 : 1; // first line gets more ice
    if (shiftTimer[side] >= shiftLength) {
      lineIdx[side] = (lineIdx[side] + 1) % Math.max(1, roster.lines.length);
      pairIdx[side] = (pairIdx[side] + 1) % Math.max(1, roster.pairs.length);
      shiftTimer[side] = 0;
    }
  }

  function addTOI(players, secs) {
    for (const p of players) {
      if (p && playerGameStats[p.id]) {
        toi[p.id] = (toi[p.id] || 0) + secs;
      }
    }
  }

  function getActivePenalties(side, time) {
    return penalties.filter(pen => pen.team === side && pen.endTime > time);
  }

  function pickShooter(fwds, defs) {
    // Weight by offensive skill
    const candidates = [...fwds, ...defs.map(d => ({ ...d, _dWeight: 0.6 }))];
    if (!candidates.length) return null;
    const weights = candidates.map(p => {
      const offScore = (attrVal(p,'wristShotAccuracy') + attrVal(p,'wristShotPower') + attrVal(p,'offensiveAwareness')) / 3;
      return [p, offScore * (p._dWeight || 1.0)];
    });
    return weightedRand(weights);
  }

  function pickAssist1(scorer, fwds, defs) {
    const candidates = [...fwds.filter(p => p.id !== scorer.id), ...defs.map(d => ({ ...d, _weight: 0.6 }))];
    if (!candidates.length) return null;
    const weights = candidates.map(p => {
      const score = attrVal(p,'passing') * 0.4 + attrVal(p,'offensiveAwareness') * 0.3 + attrVal(p,'puckControl') * 0.3;
      return [p, score * (p._weight || 1.0)];
    });
    return weightedRand(weights);
  }

  function pickAssist2(scorer, a1, fwds, defs) {
    const candidates = [...fwds.filter(p => p.id !== scorer.id && p.id !== a1?.id), ...defs.map(d => ({ ...d, _weight: 0.6 }))].filter(p => p.id !== a1?.id);
    if (!candidates.length) return null;
    const weights = candidates.map(p => {
      const score = attrVal(p,'passing') * 0.4 + attrVal(p,'offensiveAwareness') * 0.3 + attrVal(p,'puckControl') * 0.3;
      return [p, score * (p._weight || 1.0)];
    });
    return weightedRand(weights);
  }

  function scoreGoal(attSide, defSide, fwds, defs, defFwds, defDefs, strength, time, period) {
    const side = attSide;
    gameStats[side].goals++;
    const defSideKey = defSide;

    const scorer = pickShooter(fwds, defs);
    if (!scorer) return;

    let a1 = null, a2 = null;
    if (Math.random() < 0.70) {
      a1 = pickAssist1(scorer, fwds, defs);
    }
    if (a1 && Math.random() < 0.50) {
      a2 = pickAssist2(scorer, a1, fwds, defs);
    }

    // Record goal
    if (playerGameStats[scorer.id]) {
      playerGameStats[scorer.id].G++;
      if (strength === 'PP') playerGameStats[scorer.id].PPG++;
      if (strength === 'SH') playerGameStats[scorer.id].SHG++;
      if (time >= 3600) playerGameStats[scorer.id].OTG++;
    }
    if (a1 && playerGameStats[a1.id]) {
      playerGameStats[a1.id].A++;
      if (strength === 'PP') playerGameStats[a1.id].PPA++;
      if (strength === 'SH') playerGameStats[a1.id].SHA++;
    }
    if (a2 && playerGameStats[a2.id]) {
      playerGameStats[a2.id].A++;
      if (strength === 'PP') playerGameStats[a2.id].PPA++;
      if (strength === 'SH') playerGameStats[a2.id].SHA++;
    }

    // Plus/minus (EV and SH only)
    if (strength === 'EV' || strength === 'SH') {
      for (const p of [...fwds, ...defs]) {
        if (playerGameStats[p.id]) playerGameStats[p.id].plusMinus++;
      }
      for (const p of [...defFwds, ...defDefs]) {
        if (playerGameStats[p.id]) playerGameStats[p.id].plusMinus--;
      }
    }

    const mins = Math.floor(time / 60);
    const secs = time % 60;
    const timeStr = `${String(mins % 20).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    scoringEvents.push({
      period, time: timeStr, gameTime: time,
      team: attSide, teamName: attSide === 'home' ? homeTeam.name : awayTeam.name,
      scorer: `${scorer.firstName} ${scorer.lastName}`,
      scorerId: scorer.id,
      a1: a1 ? `${a1.firstName} ${a1.lastName}` : null, a1Id: a1?.id,
      a2: a2 ? `${a2.firstName} ${a2.lastName}` : null, a2Id: a2?.id,
      strength,
      homeScore: gameStats.home.goals,
      awayScore: gameStats.away.goals,
    });
  }

  // Main simulation loop: 60 minutes in 30-sec shifts
  for (let t = 0; t < 3600; t += SHIFT_LEN) {
    const period = Math.floor(t / PERIOD_LEN) + 1;
    gameTime = t;

    // Remove expired penalties
    penalties = penalties.filter(p => p.endTime > t);

    const homeOnPP = getActivePenalties('away', t).length > 0;
    const awayOnPP = getActivePenalties('home', t).length > 0;

    const homeLines = getCurrentLines('home');
    const awayLines = getCurrentLines('away');

    let homeFwds, homeDefs, awayFwds, awayDefs;
    let homeStrength = 'EV', awayStrength = 'EV';

    if (homeOnPP) {
      homeFwds = homePP.forwards; homeDefs = homePP.defense;
      awayFwds = awayPK.forwards.slice(0,2); awayDefs = awayPK.defense.slice(0,2);
      homeStrength = 'PP'; awayStrength = 'SH';
    } else if (awayOnPP) {
      awayFwds = awayPP.forwards; awayDefs = awayPP.defense;
      homeFwds = homePK.forwards.slice(0,2); homeDefs = homePK.defense.slice(0,2);
      awayStrength = 'PP'; homeStrength = 'SH';
    } else {
      homeFwds = homeLines.fwds; homeDefs = homeLines.defs;
      awayFwds = awayLines.fwds; awayDefs = awayLines.defs;
    }

    addTOI([...homeFwds, ...homeDefs], SHIFT_LEN);
    addTOI([...awayFwds, ...awayDefs], SHIFT_LEN);

    // Simulate 1-3 events per shift
    const eventsThisShift = randInt(1, 3);
    for (let e = 0; e < eventsThisShift; e++) {
      // Determine possession: home or away (slight home ice advantage)
      const homeHasPuck = Math.random() < 0.52;
      const attSide = homeHasPuck ? 'home' : 'away';
      const defSide = homeHasPuck ? 'away' : 'home';
      const attFwds = homeHasPuck ? homeFwds : awayFwds;
      const attDefs = homeHasPuck ? homeDefs : awayDefs;
      const defFwds = homeHasPuck ? awayFwds : homeFwds;
      const defDefs = homeHasPuck ? awayDefs : homeDefs;
      const attGoalie = homeHasPuck ? awayGoalie : homeGoalie;
      const attLineChem = homeHasPuck
        ? (homeStrength === 'EV' ? homeLines.lineChem : 1.0)
        : (awayStrength === 'EV' ? awayLines.lineChem : 1.0);
      const strength = homeHasPuck
        ? (homeStrength === 'PP' ? 'PP' : homeStrength === 'SH' ? 'SH' : 'EV')
        : (awayStrength === 'PP' ? 'PP' : awayStrength === 'SH' ? 'SH' : 'EV');

      // Average attacker/defender attributes
      const allAtt = [...attFwds, ...attDefs].filter(Boolean);
      const allDef = [...defFwds, ...defDefs].filter(Boolean);
      const avgAttOff = allAtt.length ? _.meanBy(allAtt, p => attrVal(p,'offensiveAwareness')) : 75;
      const avgAttShot = allAtt.length ? _.meanBy(allAtt, p => (attrVal(p,'wristShotAccuracy') + attrVal(p,'slapShotAccuracy')) / 2) : 75;
      const avgDefDef = allDef.length ? _.meanBy(allDef, p => attrVal(p,'defensiveAwareness')) : 75;
      const avgDefStick = allDef.length ? _.meanBy(allDef, p => attrVal(p,'stickChecking')) : 75;
      const avgAttPuck = allAtt.length ? _.meanBy(allAtt, p => attrVal(p,'puckControl')) : 75;
      const avgDefBlock = allDef.length ? _.meanBy(allDef, p => attrVal(p,'shotBlocking')) : 75;
      const avgAttCheck = allAtt.length ? _.meanBy(allAtt, p => attrVal(p,'bodyChecking')) : 75;
      const avgAttDiscipline = allAtt.length ? _.meanBy(allAtt, p => attrVal(p,'discipline')) : 75;
      const defFwdCenter = defFwds.find(p => p.position === 'C') || defFwds[0];
      const attFwdCenter = attFwds.find(p => p.position === 'C') || attFwds[0];

      // PP/SH modifiers — enhanced by PP/PK unit effectiveness
      const ppEffMult = homeHasPuck
        ? homePPMult * (2.0 - awayPKMult)
        : awayPPMult * (2.0 - homePKMult);
      const ppShotMod = strength === 'PP' ? 1.4 * ppEffMult : strength === 'SH' ? 0.7 : 1.0;
      const ppGoalMod = strength === 'PP' ? 1.25 * ppEffMult : strength === 'SH' ? 0.8 : 1.0;

      // Strategy modifiers per possession (Phase 6B)
      const attStratMods = homeHasPuck ? homeStratMods : awayStratMods;
      const defStratMods = homeHasPuck ? awayStratMods : homeStratMods;
      // Intimidation debuff: Physical strategy debuffs the attacker proportionally
      const intimDebuff = gameIntimidation[defSide] > 0
        ? Math.max(0.94, 1.0 - gameIntimidation[defSide] * 0.15)
        : 1.0;

      // Roll event type
      const r = Math.random();
      const shotChance = 0.25 * ppShotMod
        * attStratMods.shotGeneration
        * (2.0 - defStratMods.defensiveEfficiency);
      if (r < shotChance) {
        // Shot on goal
        gameStats[attSide].shots++;
        if (attFwds[0] || attDefs[0]) {
          const shooter = pickShooter(attFwds, attDefs);
          if (shooter && playerGameStats[shooter.id]) playerGameStats[shooter.id].SOG++;
        }
        // Goalie save check
        if (attGoalie && playerGameStats[attGoalie.id]) playerGameStats[attGoalie.id].SA++;

        // Calculate goal probability
        const shooter2 = pickShooter(attFwds, attDefs);
        const shooterBonus = shooter2 ? (
          attrVal(shooter2,'wristShotAccuracy')*0.25 + attrVal(shooter2,'wristShotPower')*0.15 +
          attrVal(shooter2,'slapShotAccuracy')*0.15 + attrVal(shooter2,'slapShotPower')*0.10 +
          attrVal(shooter2,'offensiveAwareness')*0.15 + attrVal(shooter2,'handEye')*0.10 +
          attrVal(shooter2,'poise')*0.10
        ) / 99 : 0.75;
        const goalieBonus = attGoalie ? (
          attrVal(attGoalie,'angles')*0.15 + attrVal(attGoalie,'vision')*0.12 +
          attrVal(attGoalie,'reboundControl')*0.12 + attrVal(attGoalie,'gloveHigh')*0.08 +
          attrVal(attGoalie,'gloveLow')*0.08 + attrVal(attGoalie,'stickHigh')*0.08 +
          attrVal(attGoalie,'stickLow')*0.08 + attrVal(attGoalie,'fiveHole')*0.08 +
          attrVal(attGoalie,'shotRecovery')*0.08 + attrVal(attGoalie,'breakaway')*0.05 +
          attrVal(attGoalie,'pokeCheque')*0.04 + attrVal(attGoalie,'balance')*0.02 +
          attrVal(attGoalie,'agility')*0.02
        ) / 99 : 0.75;

        let goalProb = 0.08 * (0.5 + shooterBonus * 0.7) * (1.5 - goalieBonus * 0.7) * attLineChem * ppGoalMod * attStratMods.shotQuality * intimDebuff;
        goalProb = clamp(goalProb, 0.02, 0.18);

        if (Math.random() < goalProb) {
          scoreGoal(attSide, defSide, attFwds, attDefs, defFwds, defDefs, strength, t + e * 10, period);
          if (attGoalie && playerGameStats[attGoalie.id]) playerGameStats[attGoalie.id].GA++;
        } else {
          if (attGoalie && playerGameStats[attGoalie.id]) playerGameStats[attGoalie.id].SV++;
        }
      } else if (r < shotChance + 0.10) {
        // Shot blocked
        gameStats[defSide].blocks++;
        const blocker = defFwds.concat(defDefs).find(p => p) || defDefs[0];
        if (blocker && playerGameStats[blocker.id]) playerGameStats[blocker.id].BLK++;
      } else if (r < shotChance + 0.10 + 0.10) {
        // Turnover/giveaway
        gameStats[attSide].giveaways++;
        const attPlayer = attFwds[0] || attDefs[0];
        if (attPlayer && playerGameStats[attPlayer.id]) playerGameStats[attPlayer.id].GV++;
      } else if (r < shotChance + 0.10 + 0.10 + 0.08) {
        // Takeaway
        gameStats[defSide].takeaways++;
        const defPlayer = defFwds[0] || defDefs[0];
        if (defPlayer && playerGameStats[defPlayer.id]) playerGameStats[defPlayer.id].TK++;
      } else if (r < shotChance + 0.10 + 0.10 + 0.08 + 0.12) {
        // Hit — scaled by hitRate strategy modifier
        const hitRoll = Math.random();
        if (hitRoll < attStratMods.hitRate) {
          gameStats[attSide].hits++;
          const hitter = attFwds.concat(attDefs).filter(p => attrVal(p,'bodyChecking') > 60);
          const hitPlayer = hitter.length > 0 ? hitter[randInt(0, hitter.length-1)] : (attFwds[0] || attDefs[0]);
          if (hitPlayer && playerGameStats[hitPlayer.id]) playerGameStats[hitPlayer.id].HIT++;
          // Physical strategy builds intimidation from hits
          if (attStratMods.hitRate >= 1.40) {
            gameIntimidation[attSide] = Math.min(0.30, (gameIntimidation[attSide]||0) + 0.015);
          }
        }
      } else if (r < shotChance + 0.10 + 0.10 + 0.08 + 0.12 + 0.05) {
        // Faceoff
        const homeCenter = (homeHasPuck ? attFwdCenter : defFwdCenter);
        const awayCenter = (homeHasPuck ? defFwdCenter : attFwdCenter);
        const homeFO = attrVal(homeCenter, 'faceoffs');
        const awayFO = attrVal(awayCenter, 'faceoffs');
        const homeWins = Math.random() < (homeFO / (homeFO + awayFO));
        if (homeWins) {
          gameStats.home.fow++; gameStats.away.fol++;
          if (homeCenter && playerGameStats[homeCenter.id]) playerGameStats[homeCenter.id].FOW++;
          if (awayCenter && playerGameStats[awayCenter.id]) playerGameStats[awayCenter.id].FOL++;
        } else {
          gameStats.away.fow++; gameStats.home.fol++;
          if (awayCenter && playerGameStats[awayCenter.id]) playerGameStats[awayCenter.id].FOW++;
          if (homeCenter && playerGameStats[homeCenter.id]) playerGameStats[homeCenter.id].FOL++;
        }
      } else if (r < shotChance + 0.10 + 0.10 + 0.08 + 0.12 + 0.05 + 0.03) {
        // Penalty — scaled by penaltyTakeRate (def takes it) × penaltyDrawRate (att draws it)
        const penRate = defStratMods.penaltyTakeRate * attStratMods.penaltyDrawRate;
        if (Math.random() < penRate) {
          const penaltyPlayer = allAtt.length > 0 ? allAtt[randInt(0, allAtt.length-1)] : null;
          if (penaltyPlayer) {
            const penDuration = Math.random() < 0.85 ? 120 : 240;
            const penPIM = penDuration / 30;
            penalties.push({ team: defSide, endTime: t + penDuration, playerId: penaltyPlayer.id });
            gameStats[defSide].pim += penPIM;
            gameStats[attSide].ppo++;
            if (penaltyPlayer && playerGameStats[penaltyPlayer.id]) playerGameStats[penaltyPlayer.id].PIM += penPIM;
          }
        }
      }
    }

    // Advance line rotations
    advanceLines('home');
    advanceLines('away');

    // Period-end intimidation decay (Physical strategy)
    if (t > 0 && t % 1200 === 0) {
      gameIntimidation.home = Math.max(0, (gameIntimidation.home||0) - 0.05);
      gameIntimidation.away = Math.max(0, (gameIntimidation.away||0) - 0.05);
    }
  }

  // --- OVERTIME ---
  let isOT = false, isSO = false;
  let otGoalScored = false;
  if (gameStats.home.goals === gameStats.away.goals) {
    isOT = true;
    // 5 min 3-on-3
    const otFwdsH = homeRoster.lines[0] ? homeRoster.lines[0].slice(0,2) : [];
    const otDefsH = homeRoster.pairs[0] ? homeRoster.pairs[0].slice(0,1) : [];
    const otFwdsA = awayRoster.lines[0] ? awayRoster.lines[0].slice(0,2) : [];
    const otDefsA = awayRoster.pairs[0] ? awayRoster.pairs[0].slice(0,1) : [];

    for (let t = 3600; t < 3900 && !otGoalScored; t += SHIFT_LEN) {
      const eventsOT = randInt(1, 3);
      for (let e = 0; e < eventsOT && !otGoalScored; e++) {
        const homeHasPuck = Math.random() < 0.52;
        const attSide = homeHasPuck ? 'home' : 'away';
        const defSide = homeHasPuck ? 'away' : 'home';
        const attFwds = homeHasPuck ? otFwdsH : otFwdsA;
        const attDefs = homeHasPuck ? otDefsH : otDefsA;
        const defFwds = homeHasPuck ? otFwdsA : otFwdsH;
        const defDefs = homeHasPuck ? otDefsA : otDefsH;
        const attGoalie = homeHasPuck ? awayGoalie : homeGoalie;

        const r2 = Math.random();
        if (r2 < 0.30 * 1.2) { // higher shot rate in OT
          gameStats[attSide].shots++;
          const shooter3 = pickShooter(attFwds, attDefs);
          if (shooter3 && playerGameStats[shooter3.id]) playerGameStats[shooter3.id].SOG++;
          if (attGoalie && playerGameStats[attGoalie.id]) playerGameStats[attGoalie.id].SA++;

          const shooter4 = pickShooter(attFwds, attDefs);
          const shooterB = shooter4 ? (attrVal(shooter4,'wristShotAccuracy')*0.3 + attrVal(shooter4,'poise')*0.2 + attrVal(shooter4,'offensiveAwareness')*0.2 + attrVal(shooter4,'deking')*0.15 + attrVal(shooter4,'speed')*0.15) / 99 : 0.75;
          const goalieB = attGoalie ? (attrVal(attGoalie,'angles')*0.2 + attrVal(attGoalie,'vision')*0.2 + attrVal(attGoalie,'breakaway')*0.2 + attrVal(attGoalie,'reboundControl')*0.15 + attrVal(attGoalie,'agility')*0.1 + attrVal(attGoalie,'fiveHole')*0.15) / 99 : 0.75;
          let gp = 0.12 * (0.5 + shooterB * 0.7) * (1.5 - goalieB * 0.7);
          gp = clamp(gp, 0.04, 0.22);
          if (Math.random() < gp) {
            scoreGoal(attSide, defSide, attFwds, attDefs, defFwds, defDefs, 'EV', 3600 + (t-3600) + e*10, 4);
            if (attGoalie && playerGameStats[attGoalie.id]) playerGameStats[attGoalie.id].GA++;
            otGoalScored = true;
          } else {
            if (attGoalie && playerGameStats[attGoalie.id]) playerGameStats[attGoalie.id].SV++;
          }
        }
      }
    }

    // Shootout
    if (!otGoalScored) {
      isSO = true;
      let homeSOG = 0, awaySOG = 0;
      const homeShoShoters = (homeRoster.lines[0] || []).slice(0,3);
      const awayShoShooters = (awayRoster.lines[0] || []).slice(0,3);

      for (let round = 0; round < 3 || homeSOG === awaySOG; round++) {
        if (round >= 10) break; // prevent infinite loop
        const hS = homeShoShoters[round % Math.max(1, homeShoShoters.length)];
        const aS = awayShoShooters[round % Math.max(1, awayShoShooters.length)];
        const hGoalie = awayGoalie, aGoalie = homeGoalie;

        if (hS) {
          const sScore = (attrVal(hS,'deking')*0.3 + attrVal(hS,'wristShotAccuracy')*0.25 + attrVal(hS,'puckControl')*0.2 + attrVal(hS,'poise')*0.15 + attrVal(hS,'speed')*0.1) / 99;
          const gScore = hGoalie ? (attrVal(hGoalie,'breakaway')*0.3 + attrVal(hGoalie,'angles')*0.2 + attrVal(hGoalie,'fiveHole')*0.15 + attrVal(hGoalie,'vision')*0.15 + attrVal(hGoalie,'pokeCheque')*0.1 + attrVal(hGoalie,'agility')*0.1) / 99 : 0.75;
          if (Math.random() < clamp(0.30 * (0.5 + sScore) * (1.5 - gScore), 0.1, 0.6)) homeSOG++;
        }
        if (aS) {
          const sScore = (attrVal(aS,'deking')*0.3 + attrVal(aS,'wristShotAccuracy')*0.25 + attrVal(aS,'puckControl')*0.2 + attrVal(aS,'poise')*0.15 + attrVal(aS,'speed')*0.1) / 99;
          const gScore = aGoalie ? (attrVal(aGoalie,'breakaway')*0.3 + attrVal(aGoalie,'angles')*0.2 + attrVal(aGoalie,'fiveHole')*0.15 + attrVal(aGoalie,'vision')*0.15 + attrVal(aGoalie,'pokeCheque')*0.1 + attrVal(aGoalie,'agility')*0.1) / 99 : 0.75;
          if (Math.random() < clamp(0.30 * (0.5 + sScore) * (1.5 - gScore), 0.1, 0.6)) awaySOG++;
        }
        if (round >= 2 && homeSOG !== awaySOG) break;
      }
      if (homeSOG > awaySOG) gameStats.home.goals++;
      else gameStats.away.goals++;
    }
  }

  // Set TOI from seconds to minutes
  for (const p of allPlayers) {
    if (p.position !== 'G' && playerGameStats[p.id]) {
      playerGameStats[p.id].TOI = Math.round((toi[p.id] || 0) / 60 * 10) / 10;
    }
  }

  // Determine winner/loser
  const homeWin = gameStats.home.goals > gameStats.away.goals;
  const isOTL = isOT || isSO;

  // Game winning goal
  if (scoringEvents.length > 0) {
    const homeGoals = scoringEvents.filter(e => e.team === 'home');
    const awayGoals = scoringEvents.filter(e => e.team === 'away');
    if (homeWin && homeGoals.length >= gameStats.away.goals + 1) {
      const gwgEvent = homeGoals[gameStats.away.goals]; // the decisive goal
      if (gwgEvent && playerGameStats[gwgEvent.scorerId]) {
        playerGameStats[gwgEvent.scorerId].GWG++;
      }
    } else if (!homeWin && awayGoals.length >= gameStats.home.goals + 1) {
      const gwgEvent = awayGoals[gameStats.home.goals];
      if (gwgEvent && playerGameStats[gwgEvent.scorerId]) {
        playerGameStats[gwgEvent.scorerId].GWG++;
      }
    }
  }

  // Update goalie stats
  if (homeGoalie && playerGameStats[homeGoalie.id]) {
    const gs = playerGameStats[homeGoalie.id];
    gs.GA = gameStats.away.goals;
    gs.SA = gameStats.away.shots;
    gs.SV = Math.max(0, gs.SA - gs.GA);
    if (homeWin) gs.W = 1;
    else if (isOTL) gs.OTL = 1;
    else gs.L = 1;
    if (gs.GA === 0) gs.SO = 1;
  }
  if (awayGoalie && playerGameStats[awayGoalie.id]) {
    const gs = playerGameStats[awayGoalie.id];
    gs.GA = gameStats.home.goals;
    gs.SA = gameStats.home.shots;
    gs.SV = Math.max(0, gs.SA - gs.GA);
    if (!homeWin) gs.W = 1;
    else if (isOTL) gs.OTL = 1;
    else gs.L = 1;
    if (gs.GA === 0) gs.SO = 1;
  }

  // PP goals tracking
  gameStats.home.ppg = scoringEvents.filter(e => e.team === 'home' && e.strength === 'PP').length;
  gameStats.away.ppg = scoringEvents.filter(e => e.team === 'away' && e.strength === 'PP').length;

  return {
    homeTeamId: homeTeam.id, awayTeamId: awayTeam.id,
    homeTeamName: homeTeam.name, awayTeamName: awayTeam.name,
    homeScore: gameStats.home.goals, awayScore: gameStats.away.goals,
    isOT: isOT && !isSO, isSO,
    gameStats, scoringEvents,
    playerGameStats,
    homeGoalieId: homeGoalie?.id, awayGoalieId: awayGoalie?.id,
    homeStrategy: homeTeam.strategy?.fiveOnFive || 'balanced',
    awayStrategy: awayTeam.strategy?.fiveOnFive || 'balanced',
    homePPFormation: homeTeam.strategy?.pp?.formation || 'umbrella',
    awayPPFormation: awayTeam.strategy?.pp?.formation || 'umbrella',
    homePKFormation: homeTeam.strategy?.pk?.formation || 'box',
    awayPKFormation: awayTeam.strategy?.pk?.formation || 'box',
    peakIntimidation: Math.max(gameIntimidation.home, gameIntimidation.away),
  };
}


// ============================================================
// SEASON SIMULATOR
// ============================================================

function generateSchedule(teams) {
  const schedule = [];
  const n = teams.length;
  // Round-robin: each team plays each other ~16-17 times
  // Generate base matchups
  const matchups = [];
  for (let i = 0; i < n; i++) {
    for (let j = i+1; j < n; j++) {
      matchups.push([teams[i].id, teams[j].id]);
    }
  }
  // 6 teams => 15 unique matchups, need 82 games per team => 246 total games
  // Each matchup needs to appear ~246/15 ≈ 16.4 times
  // We'll do 16 rounds for some and 17 for others
  const gamesNeeded = 246;
  const roundsBase = Math.floor(gamesNeeded / matchups.length);
  const extra = gamesNeeded - roundsBase * matchups.length;

  for (let r = 0; r < roundsBase; r++) {
    for (const [home, away] of _.shuffle(matchups)) {
      schedule.push({ homeTeamId: r % 2 === 0 ? home : away, awayTeamId: r % 2 === 0 ? away : home });
    }
  }
  // Fill remainder
  const shuffled = _.shuffle(matchups);
  for (let i = 0; i < extra; i++) {
    const [home, away] = shuffled[i];
    schedule.push({ homeTeamId: home, awayTeamId: away });
  }
  return _.shuffle(schedule);
}

function accumulateStats(teams, gameResult) {
  const { homeTeamId, awayTeamId, homeScore, awayScore, isOT, isSO, gameStats, playerGameStats } = gameResult;
  const homeTeam = teams.find(t => t.id === homeTeamId);
  const awayTeam = teams.find(t => t.id === awayTeamId);
  const homeWin = homeScore > awayScore;
  const isOTLoss = isOT || isSO;

  if (homeTeam) {
    homeTeam.seasonStats.GP++;
    if (homeWin) homeTeam.seasonStats.W++;
    else if (isOTLoss) homeTeam.seasonStats.OTL++;
    else homeTeam.seasonStats.L++;
    homeTeam.seasonStats.GF += homeScore;
    homeTeam.seasonStats.GA += awayScore;
    homeTeam.seasonStats.PPG += gameStats.home.ppg || 0;
    homeTeam.seasonStats.PPO += gameStats.home.ppo || 0;
    homeTeam.seasonStats.SF += gameStats.home.shots || 0;
    homeTeam.seasonStats.SA += gameStats.away.shots || 0;
    homeTeam.seasonStats.PKG_against += gameStats.away.ppg || 0;
    homeTeam.seasonStats.PKO += gameStats.away.ppo || 0;
  }
  if (awayTeam) {
    awayTeam.seasonStats.GP++;
    if (!homeWin) awayTeam.seasonStats.W++;
    else if (isOTLoss) awayTeam.seasonStats.OTL++;
    else awayTeam.seasonStats.L++;
    awayTeam.seasonStats.GF += awayScore;
    awayTeam.seasonStats.GA += homeScore;
    awayTeam.seasonStats.PPG += gameStats.away.ppg || 0;
    awayTeam.seasonStats.PPO += gameStats.away.ppo || 0;
    awayTeam.seasonStats.SF += gameStats.away.shots || 0;
    awayTeam.seasonStats.SA += gameStats.home.shots || 0;
    awayTeam.seasonStats.PKG_against += gameStats.home.ppg || 0;
    awayTeam.seasonStats.PKO += gameStats.home.ppo || 0;
  }

  // Accumulate player stats
  const allTeams = [homeTeam, awayTeam].filter(Boolean);
  for (const team of allTeams) {
    for (const player of team.players) {
      const gs = playerGameStats[player.id];
      if (!gs) continue;
      const ss = player.seasonStats;
      if (player.position === 'G') {
        ss.GP += gs.GP || 0;
        ss.W += gs.W || 0;
        ss.L += gs.L || 0;
        ss.OTL += gs.OTL || 0;
        ss.SV += gs.SV || 0;
        ss.SA += gs.SA || 0;
        ss.GA += gs.GA || 0;
        ss.SO += gs.SO || 0;
        ss.minutes += gs.minutes || 60;
      } else {
        ss.GP += gs.GP || 0;
        ss.G += gs.G || 0;
        ss.A += gs.A || 0;
        ss.PIM += gs.PIM || 0;
        ss.SOG += gs.SOG || 0;
        ss.HIT += gs.HIT || 0;
        ss.BLK += gs.BLK || 0;
        ss.TK += gs.TK || 0;
        ss.GV += gs.GV || 0;
        ss.FOW += gs.FOW || 0;
        ss.FOL += gs.FOL || 0;
        ss.PPG += gs.PPG || 0;
        ss.PPA += gs.PPA || 0;
        ss.SHG += gs.SHG || 0;
        ss.SHA += gs.SHA || 0;
        ss.GWG += gs.GWG || 0;
        ss.OTG += gs.OTG || 0;
        ss.plusMinus += gs.plusMinus || 0;
        ss.TOI += gs.TOI || 0;
      }
    }
  }
}

function simulateSeason(teamsIn) {
  // Deep clone teams
  const teams = teamsIn.map(t => ({
    ...t,
    players: t.players.map(p => ({
      ...p,
      attributes: { ...p.attributes },
      seasonStats: makeEmptySeasonStats(p.position === 'G'),
    })),
    seasonStats: { GP:0,W:0,L:0,OTL:0,GF:0,GA:0,PPG:0,PPO:0,PKG_against:0,PKO:0,SF:0,SA:0 },
  }));

  const schedule = generateSchedule(teams);
  const results = [];

  for (const game of schedule) {
    const homeTeam = teams.find(t => t.id === game.homeTeamId);
    const awayTeam = teams.find(t => t.id === game.awayTeamId);
    if (!homeTeam || !awayTeam) continue;
    const result = simulateGame(homeTeam, awayTeam);
    accumulateStats(teams, result);
    results.push({ homeTeamId: result.homeTeamId, awayTeamId: result.awayTeamId, homeScore: result.homeScore, awayScore: result.awayScore, isOT: result.isOT, isSO: result.isSO });
  }

  return { teams, results };
}

// ============================================================
// HELPER FORMATTERS
// ============================================================

function fmtPct(val, denom, decimals=1) {
  if (!denom || denom === 0) return '0.0%';
  return ((val / denom) * 100).toFixed(decimals) + '%';
}

function fmtSVPct(sv, sa) {
  if (!sa || sa === 0) return '.000';
  return '.' + Math.round((sv/sa)*1000).toString().padStart(3,'0');
}

function fmtGAA(ga, minutes) {
  if (!minutes || minutes === 0) return '0.00';
  return ((ga * 60) / minutes).toFixed(2);
}

function fmtTOI(totalMinutes) {
  const m = Math.floor(totalMinutes);
  const s = Math.round((totalMinutes - m) * 60);
  return `${m}:${String(s).padStart(2,'0')}`;
}

function fmtTOIAvg(totalMin, gp) {
  if (!gp || gp === 0) return '0:00';
  return fmtTOI(totalMin / gp);
}

function getOvrColor(ovr) {
  if (ovr >= 90) return 'text-yellow-400 font-bold';
  if (ovr >= 85) return 'text-green-400 font-bold';
  if (ovr >= 80) return 'text-blue-400';
  if (ovr >= 75) return 'text-white';
  return 'text-gray-400';
}

function getPlusMinus(val) {
  if (val > 0) return <span className="text-green-400">+{val}</span>;
  if (val < 0) return <span className="text-red-400">{val}</span>;
  return <span>{val}</span>;
}

function getTeamColor(teams, teamId) {
  const t = teams.find(t => t.id === teamId);
  return t?.color || '#888';
}

function getStandings(teams) {
  return _.orderBy(teams, [
    t => t.seasonStats.W * 2 + t.seasonStats.OTL,
    t => t.seasonStats.W,
    t => t.seasonStats.GF - t.seasonStats.GA
  ], ['desc','desc','desc']);
}

function canPlayPosition(player, targetPos) {
  if (player.position === targetPos) return true;
  if (player.altPosition === targetPos) return true;
  return false;
}


// ============================================================
// REACT COMPONENTS
// ============================================================

// --- Attribute Bar ---
function AttrBar({ label, value }) {
  const pct = Math.round((value / 99) * 100);
  let color = 'bg-gray-500';
  if (value >= 85) color = 'bg-green-500';
  else if (value >= 75) color = 'bg-blue-500';
  else if (value >= 60) color = 'bg-yellow-500';
  return (
    <div className="flex items-center gap-2 text-xs mb-1">
      <span className="w-36 text-gray-300 text-right">{label}</span>
      <div className="flex-1 bg-gray-700 rounded h-2">
        <div className={`${color} h-2 rounded`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-white">{value}</span>
    </div>
  );
}

// --- Player Detail Panel ---
function PlayerDetail({ player, onClose }) {
  const isGoalie = player.position === 'G';
  const ss = player.seasonStats;
  const pos = player.altPosition ? `${player.position}/${player.altPosition}` : player.position;

  const skaterAttrGroups = [
    { label: 'Puck Skills', attrs: [['Deking','deking'],['Hand-Eye','handEye'],['Passing','passing'],['Puck Control','puckControl']] },
    { label: 'Defense', attrs: [['Def. Awareness','defensiveAwareness'],['Shot Blocking','shotBlocking'],['Stick Checking','stickChecking']] },
    { label: 'Offense', attrs: [['Off. Awareness','offensiveAwareness'],['Slap Shot Acc.','slapShotAccuracy'],['Slap Shot Pwr','slapShotPower'],['Wrist Shot Acc.','wristShotAccuracy'],['Wrist Shot Pwr','wristShotPower']] },
    { label: 'Skating', attrs: [['Acceleration','acceleration'],['Agility','agility'],['Balance','balance'],['Endurance','endurance'],['Speed','speed']] },
    { label: 'Physicality', attrs: [['Aggression','aggression'],['Body Checking','bodyChecking'],['Fighting Skill','fightingSkill'],['Strength','strength']] },
    { label: 'General', attrs: [['Discipline','discipline'],['Durability','durability'],['Faceoffs','faceoffs'],['Poise','poise']] },
  ];
  const goalieAttrGroups = [
    { label: 'Goalie', attrs: [['Glove High','gloveHigh'],['Glove Low','gloveLow'],['Stick High','stickHigh'],['Stick Low','stickLow'],['Five Hole','fiveHole'],['Angles','angles'],['Breakaway','breakaway'],['Poke Check','pokeCheque'],['Rebound Ctrl','reboundControl'],['Shot Recovery','shotRecovery'],['Vision','vision']] },
    { label: 'Skating', attrs: [['Acceleration','acceleration'],['Agility','agility'],['Balance','balance'],['Endurance','endurance'],['Speed','speed']] },
  ];
  const groups = isGoalie ? goalieAttrGroups : skaterAttrGroups;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h2 className="text-white text-xl font-bold">{player.firstName} {player.lastName}</h2>
            <div className="flex gap-3 text-sm mt-1">
              <span className="text-gray-400">{pos}</span>
              <span className="text-gray-400">{player.role}</span>
              <span className="text-gray-400">Age {player.age}</span>
              <span className={`font-bold ${getOvrColor(player.overall)}`}>OVR {player.overall}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        {/* Season Stats */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-gray-300 font-semibold mb-2 text-sm uppercase">Season Stats</h3>
          {isGoalie ? (
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {[['GP',ss.GP],['W',ss.W],['L',ss.L],['OTL',ss.OTL],['SV%',fmtSVPct(ss.SV,ss.SA)],['GAA',fmtGAA(ss.GA,ss.minutes)],['SA',ss.SA],['SV',ss.SV],['GA',ss.GA],['SO',ss.SO]].map(([l,v]) => (
                <div key={l} className="bg-gray-800 rounded p-2">
                  <div className="text-gray-400">{l}</div>
                  <div className="text-white font-bold">{v}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {[['GP',ss.GP],['G',ss.G],['A',ss.A],['P',(ss.G||0)+(ss.A||0)],['+/-',ss.plusMinus],['PIM',ss.PIM],['SOG',ss.SOG],['SH%',ss.SOG > 0 ? ((ss.G/ss.SOG)*100).toFixed(1)+'%':'0.0%'],['HIT',ss.HIT],['BLK',ss.BLK],['TK',ss.TK],['GV',ss.GV],['PPG',ss.PPG],['PPA',ss.PPA],['GWG',ss.GWG]].map(([l,v]) => (
                <div key={l} className="bg-gray-800 rounded p-2">
                  <div className="text-gray-400">{l}</div>
                  <div className={`font-bold ${l==='+/-' ? (v>0?'text-green-400':v<0?'text-red-400':'text-white') : 'text-white'}`}>{l==='+/-' && v>0 ? '+'+v : v}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attributes */}
        <div className="p-4">
          <h3 className="text-gray-300 font-semibold mb-2 text-sm uppercase">Attributes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map(group => (
              <div key={group.label}>
                <div className="text-gray-400 text-xs uppercase mb-1 font-semibold">{group.label}</div>
                {group.attrs.map(([label, key]) => (
                  <AttrBar key={key} label={label} value={player.attributes[key] || 0} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Roster Row ---
function RosterRow({ player, onClick, showLine=false }) {
  const pos = player.altPosition ? `${player.position}/${player.altPosition}` : player.position;
  const ss = player.seasonStats;
  const isGoalie = player.position === 'G';
  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer" onClick={() => onClick(player)}>
      {showLine && <td className="px-2 py-1 text-gray-400 text-xs text-center">{player.isExtra ? 'X' : player.lineNumber}</td>}
      <td className="px-2 py-1 text-white text-sm">{player.firstName} {player.lastName}</td>
      <td className="px-2 py-1 text-gray-300 text-xs text-center">{pos}</td>
      <td className="px-2 py-1 text-gray-300 text-xs">{player.role}</td>
      <td className={`px-2 py-1 text-xs text-center font-bold ${getOvrColor(player.overall)}`}>{player.overall}</td>
      <td className="px-2 py-1 text-gray-300 text-xs text-center">{player.age}</td>
      {isGoalie ? (
        <>
          <td className="px-2 py-1 text-gray-300 text-xs text-center">{ss.W}-{ss.L}-{ss.OTL}</td>
          <td className="px-2 py-1 text-gray-300 text-xs text-center">{fmtSVPct(ss.SV, ss.SA)}</td>
          <td className="px-2 py-1 text-gray-300 text-xs text-center">{fmtGAA(ss.GA, ss.minutes)}</td>
        </>
      ) : (
        <>
          <td className="px-2 py-1 text-gray-300 text-xs text-center">{ss.G}</td>
          <td className="px-2 py-1 text-gray-300 text-xs text-center">{ss.A}</td>
          <td className="px-2 py-1 text-gray-300 text-xs text-center">{(ss.G||0)+(ss.A||0)}</td>
          <td className="px-2 py-1 text-xs text-center">{getPlusMinus(ss.plusMinus)}</td>
        </>
      )}
    </tr>
  );
}

// --- Dashboard View ---
function DashboardView({ teams, seasonSimulated, onSimSeason, onRandomize, onNav, champion, awards, playoffs }) {
  const standings = useMemo(() => getStandings(teams), [teams]);

  // League leaders
  const allSkaters = useMemo(() => teams.flatMap(t => t.players.filter(p => p.position !== 'G' && !p.isExtra).map(p => ({ ...p, teamAbbr: t.abbr }))), [teams]);
  const topPoints = useMemo(() => _.orderBy(allSkaters, p => (p.seasonStats.G||0)+(p.seasonStats.A||0), 'desc').slice(0,5), [allSkaters]);
  const topGoals = useMemo(() => _.orderBy(allSkaters, p => p.seasonStats.G||0, 'desc').slice(0,5), [allSkaters]);
  const topAssists = useMemo(() => _.orderBy(allSkaters, p => p.seasonStats.A||0, 'desc').slice(0,5), [allSkaters]);
  const allGoalies = useMemo(() => teams.flatMap(t => t.players.filter(p => p.position === 'G' && !p.isExtra).map(p => ({ ...p, teamAbbr: t.abbr }))), [teams]);
  const topWins = useMemo(() => _.orderBy(allGoalies, p => p.seasonStats.W||0, 'desc').slice(0,5), [allGoalies]);

  return (
    <div className="p-4 space-y-6">
      {/* Champion banner */}
      {champion && (
        <div className="rounded-xl p-4 text-center border-2" style={{ backgroundColor: champion.darkColor, borderColor: champion.color }}>
          <div className="text-yellow-400 text-2xl font-bold">🏆 {champion.name} — CHAMPIONS 🏆</div>
          {awards?.connSmythe?.winner && <div className="text-yellow-200 text-sm mt-1">Conn Smythe: {awards.connSmythe.winner.firstName} {awards.connSmythe.winner.lastName}</div>}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {onSimSeason && (
          <button onClick={onSimSeason} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition">
            🏒 Drop the Puck — Sim Season
          </button>
        )}
        {seasonSimulated && !champion && (
          <button onClick={() => onNav('playoffs')} className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg transition">
            🥊 Go to Playoffs
          </button>
        )}
        <button onClick={() => onNav('simGame')} className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition">
          🎮 Sim Single Game
        </button>
        <button onClick={onRandomize} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition">
          🎲 Randomize League
        </button>
      </div>

      {/* Standings */}
      <div>
        <h2 className="text-white font-bold text-lg mb-2">League Standings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-xs">
                <th className="px-3 py-2 text-left">Team</th>
                <th className="px-3 py-2">GP</th><th className="px-3 py-2">W</th><th className="px-3 py-2">L</th>
                <th className="px-3 py-2">OTL</th><th className="px-3 py-2 text-blue-400">PTS</th>
                <th className="px-3 py-2">GF</th><th className="px-3 py-2">GA</th><th className="px-3 py-2">DIFF</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, i) => {
                const ss = team.seasonStats;
                const pts = ss.W * 2 + ss.OTL;
                const diff = ss.GF - ss.GA;
                return (
                  <tr key={team.id} className={`border-b border-gray-800 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-850'}`}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                        <span className="text-white">{team.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-300 text-center">{ss.GP}</td>
                    <td className="px-3 py-2 text-gray-300 text-center">{ss.W}</td>
                    <td className="px-3 py-2 text-gray-300 text-center">{ss.L}</td>
                    <td className="px-3 py-2 text-gray-300 text-center">{ss.OTL}</td>
                    <td className="px-3 py-2 text-blue-400 font-bold text-center">{pts}</td>
                    <td className="px-3 py-2 text-gray-300 text-center">{ss.GF}</td>
                    <td className="px-3 py-2 text-gray-300 text-center">{ss.GA}</td>
                    <td className={`px-3 py-2 text-center font-semibold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-300'}`}>{diff > 0 ? '+'+diff : diff}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* League Leaders */}
      {seasonSimulated && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Points Leaders', data: topPoints, stat: p => (p.seasonStats.G||0)+(p.seasonStats.A||0), label: 'PTS' },
            { title: 'Goals Leaders', data: topGoals, stat: p => p.seasonStats.G||0, label: 'G' },
            { title: 'Assists Leaders', data: topAssists, stat: p => p.seasonStats.A||0, label: 'A' },
            { title: 'Goalie Wins', data: topWins, stat: p => p.seasonStats.W||0, label: 'W' },
          ].map(({ title, data, stat, label }) => (
            <div key={title} className="bg-gray-800 rounded-lg p-3">
              <h3 className="text-gray-300 text-xs font-bold uppercase mb-2">{title}</h3>
              {data.map((p, i) => (
                <div key={p.id} className="flex justify-between text-xs py-1 border-b border-gray-700">
                  <span className="text-gray-400">{i+1}. {p.firstName[0]}. {p.lastName} <span className="text-gray-500">({p.teamAbbr})</span></span>
                  <span className="text-white font-bold">{stat(p)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Award winners summary */}
      {awards && (
        <div>
          <h2 className="text-white font-bold text-lg mb-2">Season Awards</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AWARD_DEFS.filter(a => awards[a.key]?.winner).map(a => {
              const w = awards[a.key].winner;
              const t = teams.find(t => t.id === w.teamId);
              return (
                <div key={a.key} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">{a.icon} {a.name}</div>
                  <div className="text-white text-sm font-bold">{w.firstName} {w.lastName}</div>
                  <div className="text-gray-400 text-xs">{t?.abbr} — {w.position}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Roster View ---
function RosterView({ teams }) {
  const [selectedTeam, setSelectedTeam] = useState(teams[0]?.id);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const team = teams.find(t => t.id === selectedTeam);
  if (!team) return null;

  const fwdLines = [1,2,3,4].map(line => ({
    line,
    players: team.players.filter(p => ['LW','C','RW'].includes(p.position) && p.lineNumber === line && !p.isExtra)
  }));
  const defPairs = [1,2,3].map(line => ({
    line,
    players: team.players.filter(p => ['LD','RD'].includes(p.position) && p.lineNumber === line && !p.isExtra)
  }));
  const goalies = team.players.filter(p => p.position === 'G');
  const extraFwds = team.players.filter(p => ['LW','C','RW'].includes(p.position) && p.isExtra);
  const extraDefs = team.players.filter(p => ['LD','RD'].includes(p.position) && p.isExtra);

  function LineCard({ line, players, title }) {
    const chem = players.length >= 3 ? getForwardLineChemistry(players[0], players[1], players[2]) : null;
    const chemPct = chem ? Math.round((chem - 1) * 100) : 0;
    return (
      <div className="bg-gray-800 rounded-lg p-3 mb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 text-xs font-bold uppercase">{title}</span>
          {chem && <span className={`text-xs font-semibold ${chemPct > 0 ? 'text-green-400' : chemPct < 0 ? 'text-red-400' : 'text-gray-400'}`}>CHEM {chemPct > 0 ? '+' : ''}{chemPct}%</span>}
        </div>
        <div className="flex gap-2">
          {['LW','C','RW'].map(pos => {
            const p = players.find(pl => canPlayPosition(pl, pos) || pl.position === pos);
            return (
              <div key={pos} className="flex-1 bg-gray-700 rounded p-2 cursor-pointer hover:bg-gray-600" onClick={() => p && setSelectedPlayer(p)}>
                <div className="text-gray-400 text-xs text-center mb-1">{pos}</div>
                {p ? (
                  <>
                    <div className="text-white text-xs text-center truncate">{p.lastName}</div>
                    <div className={`text-xs text-center font-bold ${getOvrColor(p.overall)}`}>{p.overall}</div>
                    <div className="text-gray-400 text-xs text-center">{p.role.split(' ')[0]}</div>
                  </>
                ) : <div className="text-gray-600 text-xs text-center">—</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function DefCard({ line, players, title }) {
    const chem = players.length >= 2 ? getDefensePairChemistry(players[0], players[1]) : null;
    const chemPct = chem ? Math.round((chem - 1) * 100) : 0;
    return (
      <div className="bg-gray-800 rounded-lg p-3 mb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 text-xs font-bold uppercase">{title}</span>
          {chem && <span className={`text-xs font-semibold ${chemPct > 0 ? 'text-green-400' : chemPct < 0 ? 'text-red-400' : 'text-gray-400'}`}>CHEM {chemPct > 0 ? '+' : ''}{chemPct}%</span>}
        </div>
        <div className="flex gap-2">
          {['LD','RD'].map(pos => {
            const p = players.find(pl => canPlayPosition(pl, pos) || pl.position === pos);
            return (
              <div key={pos} className="flex-1 bg-gray-700 rounded p-2 cursor-pointer hover:bg-gray-600" onClick={() => p && setSelectedPlayer(p)}>
                <div className="text-gray-400 text-xs text-center mb-1">{pos}</div>
                {p ? (
                  <>
                    <div className="text-white text-xs text-center truncate">{p.lastName}</div>
                    <div className={`text-xs text-center font-bold ${getOvrColor(p.overall)}`}>{p.overall}</div>
                    <div className="text-gray-400 text-xs text-center">{p.role.split(' ')[0]}</div>
                  </>
                ) : <div className="text-gray-600 text-xs text-center">—</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Team selector */}
      <div className="flex gap-2 flex-wrap mb-4">
        {teams.map(t => (
          <button key={t.id} onClick={() => setSelectedTeam(t.id)}
            className={`px-3 py-1 rounded text-sm font-semibold transition ${selectedTeam === t.id ? 'text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            style={selectedTeam === t.id ? { backgroundColor: t.darkColor, color: '#fff' } : {}}>
            {t.abbr}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }} />
        <h2 className="text-white text-xl font-bold">{team.name}</h2>
        <span className="text-gray-400 text-sm">Avg OVR: {Math.round(_.meanBy(team.players, 'overall'))}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Forward lines */}
        <div>
          <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Forward Lines</h3>
          {fwdLines.map(({ line, players }) => (
            <LineCard key={line} line={line} players={players} title={`${['1st','2nd','3rd','4th'][line-1]} Line`} />
          ))}
          {/* Extra forwards */}
          {extraFwds.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-3 mb-2 opacity-60">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">Scratched Forwards</div>
              {extraFwds.map(p => (
                <div key={p.id} className="flex justify-between items-center py-1 cursor-pointer hover:text-blue-400" onClick={() => setSelectedPlayer(p)}>
                  <span className="text-gray-300 text-xs">{p.firstName} {p.lastName} ({p.position})</span>
                  <span className={`text-xs ${getOvrColor(p.overall)}`}>{p.overall}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Defense pairs + goalies */}
        <div>
          <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Defense Pairs</h3>
          {defPairs.map(({ line, players }) => (
            <DefCard key={line} line={line} players={players} title={`${['1st','2nd','3rd'][line-1]} Pair`} />
          ))}
          {extraDefs.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-3 mb-2 opacity-60">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">Scratched Defense</div>
              {extraDefs.map(p => (
                <div key={p.id} className="flex justify-between items-center py-1 cursor-pointer hover:text-blue-400" onClick={() => setSelectedPlayer(p)}>
                  <span className="text-gray-300 text-xs">{p.firstName} {p.lastName} ({p.position})</span>
                  <span className={`text-xs ${getOvrColor(p.overall)}`}>{p.overall}</span>
                </div>
              ))}
            </div>
          )}

          <h3 className="text-gray-400 text-sm font-bold uppercase mb-2 mt-4">Goalies</h3>
          <div className="bg-gray-800 rounded-lg p-3">
            {goalies.map(p => (
              <div key={p.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0 cursor-pointer hover:bg-gray-700 rounded" onClick={() => setSelectedPlayer(p)}>
                <div>
                  <span className="text-white text-sm">{p.firstName} {p.lastName}</span>
                  <span className="text-gray-400 text-xs ml-2">{p.lineNumber === 1 ? 'Starter' : 'Backup'}</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className={`font-bold ${getOvrColor(p.overall)}`}>{p.overall}</span>
                  <span className="text-gray-400">{p.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Roster Table */}
      <div className="mt-6">
        <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Full Roster</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-xs">
                <th className="px-2 py-2 text-center">LN</th>
                <th className="px-2 py-2 text-left">Name</th>
                <th className="px-2 py-2 text-center">POS</th>
                <th className="px-2 py-2 text-left">Role</th>
                <th className="px-2 py-2 text-center">OVR</th>
                <th className="px-2 py-2 text-center">Age</th>
                <th className="px-2 py-2 text-center">G</th>
                <th className="px-2 py-2 text-center">A</th>
                <th className="px-2 py-2 text-center">P</th>
                <th className="px-2 py-2 text-center">+/-</th>
              </tr>
            </thead>
            <tbody>
              {_.orderBy(team.players, [p => p.isExtra ? 1 : 0, 'lineNumber', p => ['LW','C','RW','LD','RD','G'].indexOf(p.position)]).map((p, i) => (
                <RosterRow key={p.id} player={p} onClick={setSelectedPlayer} showLine={true} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPlayer && <PlayerDetail player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
    </div>
  );
}


// --- Single Game View ---
function SimGameView({ teams }) {
  const [homeId, setHomeId] = useState(teams[0]?.id);
  const [awayId, setAwayId] = useState(teams[1]?.id);
  const [result, setResult] = useState(null);
  const [simming, setSimming] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const allPlayers = useMemo(() => teams.flatMap(t => t.players), [teams]);

  function handleSim() {
    if (homeId === awayId) return;
    const home = teams.find(t => t.id === homeId);
    const away = teams.find(t => t.id === awayId);
    setSimming(true);
    setTimeout(() => {
      const r = simulateGame(home, away);
      setResult(r);
      setSimming(false);
    }, 50);
  }

  function getPlayerById(id) {
    return allPlayers.find(p => p.id === id);
  }

  return (
    <div className="p-4">
      {/* Team Selection */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="text-gray-400 text-xs uppercase block mb-1">Home Team</label>
          <select value={homeId} onChange={e => setHomeId(e.target.value)} className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm">
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="flex items-end pb-1">
          <span className="text-gray-400 font-bold">vs</span>
        </div>
        <div>
          <label className="text-gray-400 text-xs uppercase block mb-1">Away Team</label>
          <select value={awayId} onChange={e => setAwayId(e.target.value)} className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm">
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={handleSim} disabled={simming || homeId === awayId} className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition">
            {simming ? '⏳ Simulating...' : '🏒 Drop the Puck'}
          </button>
        </div>
      </div>

      {result && (() => {
        const homeTeam = teams.find(t => t.id === result.homeTeamId);
        const awayTeam = teams.find(t => t.id === result.awayTeamId);
        const gs = result.gameStats;
        const winnerSuffix = result.isSO ? ' (SO)' : result.isOT ? ' (OT)' : '';

        // Collect player stats for display
        const homePlayers = homeTeam.players.filter(p => !p.isExtra && result.playerGameStats[p.id]);
        const awayPlayers = awayTeam.players.filter(p => !p.isExtra && result.playerGameStats[p.id]);
        const homeSkaters = _.orderBy(homePlayers.filter(p => p.position !== 'G'), p => result.playerGameStats[p.id]?.TOI || 0, 'desc');
        const awaySkaters = _.orderBy(awayPlayers.filter(p => p.position !== 'G'), p => result.playerGameStats[p.id]?.TOI || 0, 'desc');
        const homeGoalie = homeTeam.players.find(p => p.id === result.homeGoalieId);
        const awayGoalie = awayTeam.players.find(p => p.id === result.awayGoalieId);

        // Period breakdown from scoring events
        const periodGoals = [0,1,2,3,4].map(per => ({
          home: result.scoringEvents.filter(e => e.team === 'home' && e.period === per+1).length,
          away: result.scoringEvents.filter(e => e.team === 'away' && e.period === per+1).length,
        }));

        return (
          <div className="space-y-4">
            {/* Score */}
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="flex justify-center items-center gap-8">
                <div>
                  <div className="text-white font-bold text-lg">{result.homeTeamName}</div>
                  <div className="text-5xl font-bold" style={{ color: homeTeam?.color }}>{result.homeScore}</div>
                </div>
                <div className="text-gray-400 text-2xl">—</div>
                <div>
                  <div className="text-white font-bold text-lg">{result.awayTeamName}</div>
                  <div className="text-5xl font-bold" style={{ color: awayTeam?.color }}>{result.awayScore}</div>
                </div>
              </div>
              {(result.isOT || result.isSO) && <div className="text-yellow-400 mt-2 font-semibold">Final{winnerSuffix}</div>}
            </div>

            {/* Period breakdown */}
            <div className="bg-gray-800 rounded-lg p-3">
              <h3 className="text-gray-400 text-xs font-bold uppercase mb-2">Period Breakdown</h3>
              <table className="w-full text-xs text-center">
                <thead>
                  <tr className="text-gray-400">
                    <th className="py-1 text-left px-2">Team</th>
                    <th className="py-1">P1</th><th className="py-1">P2</th><th className="py-1">P3</th>
                    {(result.isOT || result.isSO) && <th className="py-1">{result.isSO ? 'SO' : 'OT'}</th>}
                    <th className="py-1 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[{name: result.homeTeamName, side:'home'},{name: result.awayTeamName, side:'away'}].map(({name,side}) => (
                    <tr key={side} className="border-t border-gray-700">
                      <td className="py-1 text-left px-2 text-white">{name}</td>
                      {[1,2,3].map(per => (
                        <td key={per} className="py-1 text-gray-300">{result.scoringEvents.filter(e => e.team === side && e.period === per).length}</td>
                      ))}
                      {(result.isOT || result.isSO) && <td className="py-1 text-gray-300">{result.scoringEvents.filter(e => e.team === side && e.period === 4).length}</td>}
                      <td className="py-1 font-bold text-white">{side === 'home' ? result.homeScore : result.awayScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Box Score */}
            <div className="bg-gray-800 rounded-lg p-3">
              <h3 className="text-gray-400 text-xs font-bold uppercase mb-2">Box Score</h3>
              <table className="w-full text-xs text-center">
                <thead>
                  <tr className="text-gray-400">
                    <th className="py-1 text-left px-2">Team</th>
                    <th className="py-1">SOG</th><th className="py-1">HIT</th><th className="py-1">BLK</th>
                    <th className="py-1">PP</th><th className="py-1">TK</th><th className="py-1">GV</th>
                    <th className="py-1">FO%</th><th className="py-1">PIM</th>
                  </tr>
                </thead>
                <tbody>
                  {[{name: result.homeTeamName, g: gs.home, key:'home'},{name: result.awayTeamName, g: gs.away, key:'away'}].map(({name,g,key}) => (
                    <tr key={key} className="border-t border-gray-700">
                      <td className="py-1 text-left px-2 text-white">{name}</td>
                      <td className="py-1 text-gray-300">{g.shots}</td>
                      <td className="py-1 text-gray-300">{g.hits}</td>
                      <td className="py-1 text-gray-300">{g.blocks}</td>
                      <td className="py-1 text-gray-300">{g.ppg}/{g.ppo}</td>
                      <td className="py-1 text-gray-300">{g.takeaways}</td>
                      <td className="py-1 text-gray-300">{g.giveaways}</td>
                      <td className="py-1 text-gray-300">{g.fow + g.fol > 0 ? ((g.fow/(g.fow+g.fol))*100).toFixed(0)+'%' : '—'}</td>
                      <td className="py-1 text-gray-300">{g.pim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Scoring Summary */}
            {result.scoringEvents.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-3">
                <h3 className="text-gray-400 text-xs font-bold uppercase mb-2">Scoring Summary</h3>
                {[1,2,3,4].map(per => {
                  const events = result.scoringEvents.filter(e => e.period === per);
                  if (events.length === 0) return null;
                  return (
                    <div key={per} className="mb-3">
                      <div className="text-gray-500 text-xs mb-1">{per === 4 ? 'Overtime' : `${['1st','2nd','3rd'][per-1]} Period`}</div>
                      {events.map((ev, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-gray-700">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ev.team === 'home' ? homeTeam?.color : awayTeam?.color }} />
                          <span className="text-gray-400 w-10">{ev.time}</span>
                          <span className={`w-8 text-center text-xs rounded px-1 ${ev.strength === 'PP' ? 'bg-yellow-800 text-yellow-300' : ev.strength === 'SH' ? 'bg-red-900 text-red-300' : 'text-gray-500'}`}>{ev.strength}</span>
                          <span className="text-white font-semibold">{ev.scorer}</span>
                          {ev.a1 && <span className="text-gray-400">({ev.a1}{ev.a2 ? `, ${ev.a2}` : ''})</span>}
                          <span className="text-gray-500 ml-auto">{ev.homeScore}-{ev.awayScore}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Player Stats Tables */}
            {[{team: homeTeam, skaters: homeSkaters, goalie: homeGoalie}, {team: awayTeam, skaters: awaySkaters, goalie: awayGoalie}].map(({ team: t, skaters, goalie }) => (
              <div key={t.id} className="bg-gray-800 rounded-lg p-3">
                <h3 className="text-xs font-bold uppercase mb-2" style={{ color: t.color }}>{t.name}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-400">
                        <th className="py-1 text-left">Player</th>
                        <th className="py-1 text-center">POS</th><th className="py-1 text-center">G</th>
                        <th className="py-1 text-center">A</th><th className="py-1 text-center">P</th>
                        <th className="py-1 text-center">+/-</th><th className="py-1 text-center">SOG</th>
                        <th className="py-1 text-center">HIT</th><th className="py-1 text-center">BLK</th>
                        <th className="py-1 text-center">PIM</th><th className="py-1 text-center">TOI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skaters.map((p, i) => {
                        const pgs = result.playerGameStats[p.id];
                        if (!pgs) return null;
                        const pos = p.altPosition ? `${p.position}/${p.altPosition}` : p.position;
                        return (
                          <tr key={p.id} className={`border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${i % 2 === 0 ? '' : 'bg-gray-750'}`} onClick={() => setSelectedPlayer(p)}>
                            <td className="py-1 text-white">{p.firstName} {p.lastName}</td>
                            <td className="py-1 text-center text-gray-400">{pos}</td>
                            <td className="py-1 text-center text-white">{pgs.G}</td>
                            <td className="py-1 text-center text-white">{pgs.A}</td>
                            <td className="py-1 text-center text-white font-bold">{(pgs.G||0)+(pgs.A||0)}</td>
                            <td className="py-1 text-center">{getPlusMinus(pgs.plusMinus)}</td>
                            <td className="py-1 text-center text-gray-300">{pgs.SOG}</td>
                            <td className="py-1 text-center text-gray-300">{pgs.HIT}</td>
                            <td className="py-1 text-center text-gray-300">{pgs.BLK}</td>
                            <td className="py-1 text-center text-gray-300">{pgs.PIM}</td>
                            <td className="py-1 text-center text-gray-300">{fmtTOI(pgs.TOI)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {goalie && result.playerGameStats[goalie.id] && (() => {
                    const ggs = result.playerGameStats[goalie.id];
                    return (
                      <div className="mt-2 bg-gray-700 rounded p-2 flex gap-4 text-xs cursor-pointer hover:bg-gray-600" onClick={() => setSelectedPlayer(goalie)}>
                        <span className="text-white font-semibold">{goalie.firstName} {goalie.lastName} (G)</span>
                        <span className="text-gray-400">SA: {ggs.SA}</span>
                        <span className="text-gray-400">SV: {ggs.SV}</span>
                        <span className="text-gray-400">GA: {ggs.GA}</span>
                        <span className="text-white font-bold">SV%: {fmtSVPct(ggs.SV, ggs.SA)}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        );
      })()}
      {selectedPlayer && <PlayerDetail player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
    </div>
  );
}


// --- Season Stats View ---
function SeasonStatsView({ teams, seasonSimulated }) {
  const [sortKey, setSortKey] = useState('P');
  const [sortDir, setSortDir] = useState('desc');
  const [activeTab, setActiveTab] = useState('skaters');
  const [teamFilter, setTeamFilter] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const allSkaters = useMemo(() => {
    return teams.flatMap(t => t.players.filter(p => p.position !== 'G' && !p.isExtra).map(p => ({
      ...p, teamName: t.name, teamAbbr: t.abbr, teamId: t.id, teamColor: t.color
    })));
  }, [teams]);

  const allGoalies = useMemo(() => {
    return teams.flatMap(t => t.players.filter(p => p.position === 'G').map(p => ({
      ...p, teamName: t.name, teamAbbr: t.abbr, teamId: t.id, teamColor: t.color
    })));
  }, [teams]);

  const filteredSkaters = useMemo(() => {
    let sk = teamFilter === 'all' ? allSkaters : allSkaters.filter(p => p.teamId === teamFilter);
    const keyMap = { P: p => (p.seasonStats.G||0)+(p.seasonStats.A||0), G: p => p.seasonStats.G||0, A: p => p.seasonStats.A||0, 'G': p=>p.seasonStats.G, '+/-': p=>p.seasonStats.plusMinus||0, PIM: p=>p.seasonStats.PIM||0, SOG: p=>p.seasonStats.SOG||0, HIT: p=>p.seasonStats.HIT||0, BLK: p=>p.seasonStats.BLK||0, PPG: p=>p.seasonStats.PPG||0, PPP: p=>(p.seasonStats.PPG||0)+(p.seasonStats.PPA||0), GWG: p=>p.seasonStats.GWG||0, OVR: p=>p.overall };
    const sortFn = keyMap[sortKey] || (p => (p.seasonStats.G||0)+(p.seasonStats.A||0));
    return _.orderBy(sk, sortFn, sortDir);
  }, [allSkaters, sortKey, sortDir, teamFilter]);

  const filteredGoalies = useMemo(() => {
    let g = teamFilter === 'all' ? allGoalies : allGoalies.filter(p => p.teamId === teamFilter);
    const keyMap = { W: p=>p.seasonStats.W||0, 'SV%': p => p.seasonStats.SA > 0 ? p.seasonStats.SV/p.seasonStats.SA : 0, GAA: p => p.seasonStats.minutes > 0 ? -(p.seasonStats.GA*60/p.seasonStats.minutes) : 0, SO: p=>p.seasonStats.SO||0, SA: p=>p.seasonStats.SA||0, GP: p=>p.seasonStats.GP||0 };
    const sortFn = keyMap[sortKey] || (p => p.seasonStats.W||0);
    return _.orderBy(g, sortFn, sortDir);
  }, [allGoalies, sortKey, sortDir, teamFilter]);

  const teamStats = useMemo(() => {
    const standings = getStandings(teams);
    return standings.map(t => ({
      ...t,
      pts: t.seasonStats.W * 2 + t.seasonStats.OTL,
      pp: t.seasonStats.PPO > 0 ? (t.seasonStats.PPG / t.seasonStats.PPO * 100).toFixed(1) : '0.0',
      pk: t.seasonStats.PKO > 0 ? ((1 - t.seasonStats.PKG_against / t.seasonStats.PKO) * 100).toFixed(1) : '0.0',
      sfg: t.seasonStats.GP > 0 ? (t.seasonStats.SF / t.seasonStats.GP).toFixed(1) : '0.0',
      sag: t.seasonStats.GP > 0 ? (t.seasonStats.SA / t.seasonStats.GP).toFixed(1) : '0.0',
    }));
  }, [teams]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  function SortTh({ label, k }) {
    return (
      <th className="px-2 py-2 cursor-pointer hover:text-white whitespace-nowrap" onClick={() => toggleSort(k)}>
        {label} {sortKey === k ? (sortDir === 'desc' ? '▼' : '▲') : ''}
      </th>
    );
  }

  if (!seasonSimulated) {
    return <div className="p-8 text-center text-gray-400">Simulate a season first to view stats.</div>;
  }

  return (
    <div className="p-4">
      {/* Tab and Filter */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex gap-2">
          {['skaters','goalies','teams'].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSortKey(tab === 'goalies' ? 'W' : tab === 'teams' ? 'PTS' : 'P'); setSortDir('desc'); }}
              className={`px-4 py-1 rounded text-sm font-semibold capitalize ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              {tab}
            </button>
          ))}
        </div>
        {activeTab !== 'teams' && (
          <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)} className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm">
            <option value="all">All Teams</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
      </div>

      {activeTab === 'skaters' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 text-gray-400 sticky top-0">
                <th className="px-2 py-2 text-left">#</th>
                <th className="px-2 py-2 text-left">Name</th>
                <th className="px-2 py-2">Team</th>
                <th className="px-2 py-2">Pos</th>
                <SortTh label="GP" k="GP" />
                <SortTh label="G" k="G" />
                <SortTh label="A" k="A" />
                <SortTh label="P" k="P" />
                <SortTh label="+/-" k="+/-" />
                <SortTh label="PIM" k="PIM" />
                <SortTh label="SOG" k="SOG" />
                <SortTh label="HIT" k="HIT" />
                <SortTh label="BLK" k="BLK" />
                <SortTh label="PPG" k="PPG" />
                <SortTh label="PPP" k="PPP" />
                <SortTh label="GWG" k="GWG" />
                <SortTh label="OVR" k="OVR" />
              </tr>
            </thead>
            <tbody>
              {filteredSkaters.map((p, i) => {
                const ss = p.seasonStats;
                return (
                  <tr key={p.id} className={`border-b border-gray-800 hover:bg-gray-800 cursor-pointer ${i%2===0?'':'bg-gray-850'}`} onClick={() => setSelectedPlayer(p)}>
                    <td className="px-2 py-1 text-gray-500">{i+1}</td>
                    <td className="px-2 py-1 text-white">{p.firstName} {p.lastName}</td>
                    <td className="px-2 py-1 text-center text-gray-400">{p.teamAbbr}</td>
                    <td className="px-2 py-1 text-center text-gray-400">{p.position}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.GP}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.G}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.A}</td>
                    <td className="px-2 py-1 text-center text-white font-bold">{(ss.G||0)+(ss.A||0)}</td>
                    <td className="px-2 py-1 text-center">{getPlusMinus(ss.plusMinus)}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.PIM}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.SOG}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.HIT}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.BLK}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.PPG}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{(ss.PPG||0)+(ss.PPA||0)}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.GWG}</td>
                    <td className={`px-2 py-1 text-center font-bold ${getOvrColor(p.overall)}`}>{p.overall}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'goalies' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 text-gray-400 sticky top-0">
                <th className="px-2 py-2 text-left">#</th>
                <th className="px-2 py-2 text-left">Name</th>
                <th className="px-2 py-2">Team</th>
                <SortTh label="GP" k="GP" />
                <SortTh label="W" k="W" />
                <th className="px-2 py-2">L</th><th className="px-2 py-2">OTL</th>
                <SortTh label="SV%" k="SV%" />
                <SortTh label="GAA" k="GAA" />
                <SortTh label="SA" k="SA" />
                <th className="px-2 py-2">SV</th><th className="px-2 py-2">GA</th>
                <SortTh label="SO" k="SO" />
                <SortTh label="OVR" k="OVR" />
              </tr>
            </thead>
            <tbody>
              {filteredGoalies.map((p, i) => {
                const ss = p.seasonStats;
                return (
                  <tr key={p.id} className={`border-b border-gray-800 hover:bg-gray-800 cursor-pointer ${i%2===0?'':'bg-gray-850'}`} onClick={() => setSelectedPlayer(p)}>
                    <td className="px-2 py-1 text-gray-500">{i+1}</td>
                    <td className="px-2 py-1 text-white">{p.firstName} {p.lastName}</td>
                    <td className="px-2 py-1 text-center text-gray-400">{p.teamAbbr}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.GP}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.W}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.L}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.OTL}</td>
                    <td className="px-2 py-1 text-center text-white font-bold">{fmtSVPct(ss.SV, ss.SA)}</td>
                    <td className="px-2 py-1 text-center text-white">{fmtGAA(ss.GA, ss.minutes)}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.SA}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.SV}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.GA}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ss.SO}</td>
                    <td className={`px-2 py-1 text-center font-bold ${getOvrColor(p.overall)}`}>{p.overall}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-xs">
                <th className="px-3 py-2 text-left">Team</th>
                <th className="px-3 py-2">GP</th><th className="px-3 py-2">W</th><th className="px-3 py-2">L</th>
                <th className="px-3 py-2">OTL</th><th className="px-3 py-2 text-blue-400">PTS</th>
                <th className="px-3 py-2">GF</th><th className="px-3 py-2">GA</th><th className="px-3 py-2">DIFF</th>
                <th className="px-3 py-2">PP%</th><th className="px-3 py-2">PK%</th>
                <th className="px-3 py-2">SF/G</th><th className="px-3 py-2">SA/G</th>
              </tr>
            </thead>
            <tbody>
              {teamStats.map((team, i) => {
                const ss = team.seasonStats;
                const diff = ss.GF - ss.GA;
                return (
                  <tr key={team.id} className={`border-b border-gray-800 ${i%2===0?'bg-gray-900':'bg-gray-850'}`}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                        <span className="text-white">{team.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-gray-300">{ss.GP}</td>
                    <td className="px-3 py-2 text-center text-gray-300">{ss.W}</td>
                    <td className="px-3 py-2 text-center text-gray-300">{ss.L}</td>
                    <td className="px-3 py-2 text-center text-gray-300">{ss.OTL}</td>
                    <td className="px-3 py-2 text-center text-blue-400 font-bold">{team.pts}</td>
                    <td className="px-3 py-2 text-center text-gray-300">{ss.GF}</td>
                    <td className="px-3 py-2 text-center text-gray-300">{ss.GA}</td>
                    <td className={`px-3 py-2 text-center font-semibold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-300'}`}>{diff > 0 ? '+'+diff : diff}</td>
                    <td className="px-3 py-2 text-center text-gray-300">{team.pp}%</td>
                    <td className="px-3 py-2 text-center text-gray-300">{team.pk}%</td>
                    <td className="px-3 py-2 text-center text-gray-300">{team.sfg}</td>
                    <td className="px-3 py-2 text-center text-gray-300">{team.sag}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedPlayer && <PlayerDetail player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
    </div>
  );
}


// --- Trade View ---
function TradeView({ teams, onTradeComplete }) {
  const [teamAId, setTeamAId] = useState(teams[0]?.id);
  const [teamBId, setTeamBId] = useState(teams[1]?.id);
  const [tradeA, setTradeA] = useState([]);
  const [tradeB, setTradeB] = useState([]);
  const [tradeResult, setTradeResult] = useState(null);

  const teamA = teams.find(t => t.id === teamAId);
  const teamB = teams.find(t => t.id === teamBId);

  function toggleTrade(side, playerId) {
    if (side === 'A') {
      setTradeA(prev => prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]);
    } else {
      setTradeB(prev => prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]);
    }
  }

  function confirmTrade() {
    if (tradeA.length === 0 && tradeB.length === 0) return;
    const summary = {
      teamA: teamA.name, teamB: teamB.name,
      aGives: tradeA.map(id => teamA.players.find(p => p.id === id)),
      bGives: tradeB.map(id => teamB.players.find(p => p.id === id)),
    };
    onTradeComplete(teamAId, teamBId, tradeA, tradeB);
    setTradeResult(summary);
    setTradeA([]);
    setTradeB([]);
  }

  function TeamRosterList({ team, selected, side }) {
    return (
      <div className="overflow-y-auto max-h-96">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-700 text-gray-400">
              <th className="px-2 py-1 text-center">✓</th>
              <th className="px-2 py-1 text-left">Name</th>
              <th className="px-2 py-1 text-center">Pos</th>
              <th className="px-2 py-1 text-center">OVR</th>
              <th className="px-2 py-1 text-center">Age</th>
            </tr>
          </thead>
          <tbody>
            {_.orderBy(team.players, [p => ['LW','C','RW','LD','RD','G'].indexOf(p.position), 'lineNumber']).map((p, i) => {
              const pos = p.altPosition ? `${p.position}/${p.altPosition}` : p.position;
              const isSel = selected.includes(p.id);
              return (
                <tr key={p.id} className={`border-b border-gray-700 cursor-pointer ${isSel ? 'bg-blue-900' : i%2===0?'':'bg-gray-800'} hover:bg-gray-700`} onClick={() => toggleTrade(side, p.id)}>
                  <td className="px-2 py-1 text-center">{isSel ? '✓' : ''}</td>
                  <td className="px-2 py-1 text-white">{p.firstName} {p.lastName}{p.isExtra ? ' (X)' : ''}</td>
                  <td className="px-2 py-1 text-center text-gray-400">{pos}</td>
                  <td className={`px-2 py-1 text-center font-bold ${getOvrColor(p.overall)}`}>{p.overall}</td>
                  <td className="px-2 py-1 text-center text-gray-400">{p.age}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-white font-bold text-lg mb-4">Trade Center</h2>

      {tradeResult && (
        <div className="bg-green-900 border border-green-700 rounded-lg p-3 mb-4">
          <h3 className="text-green-300 font-bold mb-1">Trade Completed!</h3>
          <div className="text-xs text-green-200">
            <span className="font-semibold">{tradeResult.teamA}</span> receives: {tradeResult.bGives.map(p => p ? `${p.firstName} ${p.lastName}` : '').filter(Boolean).join(', ') || 'nothing'}<br/>
            <span className="font-semibold">{tradeResult.teamB}</span> receives: {tradeResult.aGives.map(p => p ? `${p.firstName} ${p.lastName}` : '').filter(Boolean).join(', ') || 'nothing'}
          </div>
          <button onClick={() => setTradeResult(null)} className="text-green-400 text-xs mt-2 hover:text-green-300">Dismiss</button>
        </div>
      )}

      {/* Team selectors */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="text-gray-400 text-xs uppercase block mb-1">Team A</label>
          <select value={teamAId} onChange={e => { setTeamAId(e.target.value); setTradeA([]); }} className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm">
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-xs uppercase block mb-1">Team B</label>
          <select value={teamBId} onChange={e => { setTeamBId(e.target.value); setTradeB([]); }} className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm">
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Trade builder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {teamA && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-3 py-2 font-bold" style={{ backgroundColor: teamA.darkColor }}>
              <span className="text-white">{teamA.name}</span>
              {tradeA.length > 0 && <span className="text-yellow-300 text-xs ml-2">({tradeA.length} selected)</span>}
            </div>
            <TeamRosterList team={teamA} selected={tradeA} side="A" />
          </div>
        )}
        {teamB && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-3 py-2 font-bold" style={{ backgroundColor: teamB.darkColor }}>
              <span className="text-white">{teamB.name}</span>
              {tradeB.length > 0 && <span className="text-yellow-300 text-xs ml-2">({tradeB.length} selected)</span>}
            </div>
            <TeamRosterList team={teamB} selected={tradeB} side="B" />
          </div>
        )}
      </div>

      {/* Trade summary */}
      {(tradeA.length > 0 || tradeB.length > 0) && (
        <div className="bg-gray-700 rounded-lg p-3 mb-4 text-xs">
          <div className="text-gray-300 mb-2">
            <span className="font-bold">{teamA?.name}</span> sends: {tradeA.map(id => { const p = teamA?.players.find(p => p.id === id); return p ? `${p.firstName} ${p.lastName} (${p.overall})` : ''; }).filter(Boolean).join(', ') || '—'}
          </div>
          <div className="text-gray-300">
            <span className="font-bold">{teamB?.name}</span> sends: {tradeB.map(id => { const p = teamB?.players.find(p => p.id === id); return p ? `${p.firstName} ${p.lastName} (${p.overall})` : ''; }).filter(Boolean).join(', ') || '—'}
          </div>
        </div>
      )}

      <button onClick={confirmTrade} disabled={tradeA.length === 0 && tradeB.length === 0}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-2 px-6 rounded-lg transition">
        Confirm Trade
      </button>
    </div>
  );
}

// --- Free Agency View ---
function FreeAgencyView({ teams, freeAgents, onSign, onRelease }) {
  const [selectedTeam, setSelectedTeam] = useState(teams[0]?.id);
  const [sortKey, setSortKey] = useState('overall');
  const [sortDir, setSortDir] = useState('desc');
  const [posFilter, setPosFilter] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedFA, setSelectedFA] = useState(null);

  const team = teams.find(t => t.id === selectedTeam);

  const filteredFAs = useMemo(() => {
    let fa = posFilter === 'all' ? freeAgents : freeAgents.filter(p => {
      if (posFilter === 'F') return ['LW','C','RW'].includes(p.position);
      if (posFilter === 'D') return ['LD','RD'].includes(p.position);
      if (posFilter === 'G') return p.position === 'G';
      return true;
    });
    const keyMap = { overall: p => p.overall, age: p => p.age };
    return _.orderBy(fa, keyMap[sortKey] || (p => p.overall), sortDir);
  }, [freeAgents, sortKey, sortDir, posFilter]);

  function handleSign(fa) {
    if (!team) return;
    if (team.players.length >= 23) {
      alert('Team is at roster limit (23). Release a player first.');
      return;
    }
    onSign(selectedTeam, fa.id);
  }

  return (
    <div className="p-4">
      <h2 className="text-white font-bold text-lg mb-4">Free Agency ({freeAgents.length} Available)</h2>

      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="text-gray-400 text-xs uppercase block mb-1">Sign to Team</label>
          <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm">
            {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.players.length}/23)</option>)}
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-xs uppercase block mb-1">Position</label>
          <select value={posFilter} onChange={e => setPosFilter(e.target.value)} className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm">
            <option value="all">All</option>
            <option value="F">Forwards</option>
            <option value="D">Defense</option>
            <option value="G">Goalies</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Free Agent Pool */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-gray-700 text-gray-200 text-sm font-bold">Free Agents</div>
          <div className="overflow-y-auto max-h-96">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-700 text-gray-400">
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-center">Pos</th>
                  <th className="px-2 py-1 text-center">OVR</th>
                  <th className="px-2 py-1 text-center">Age</th>
                  <th className="px-2 py-1 text-center">Role</th>
                  <th className="px-2 py-1"></th>
                </tr>
              </thead>
              <tbody>
                {filteredFAs.map((p, i) => {
                  const pos = p.altPosition ? `${p.position}/${p.altPosition}` : p.position;
                  return (
                    <tr key={p.id} className={`border-b border-gray-700 ${i%2===0?'':'bg-gray-750'}`}>
                      <td className="px-2 py-1 text-white cursor-pointer hover:text-blue-400" onClick={() => setSelectedPlayer(p)}>{p.firstName} {p.lastName}</td>
                      <td className="px-2 py-1 text-center text-gray-400">{pos}</td>
                      <td className={`px-2 py-1 text-center font-bold ${getOvrColor(p.overall)}`}>{p.overall}</td>
                      <td className="px-2 py-1 text-center text-gray-400">{p.age}</td>
                      <td className="px-2 py-1 text-gray-400">{p.role.split(' ')[0]}</td>
                      <td className="px-2 py-1">
                        <button onClick={() => handleSign(p)} className="bg-green-700 hover:bg-green-600 text-white text-xs px-2 py-0.5 rounded">Sign</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Roster (for releases) */}
        {team && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-3 py-2 font-bold text-sm" style={{ backgroundColor: team.darkColor }}>
              <span className="text-white">{team.name} Roster ({team.players.length}/23)</span>
            </div>
            <div className="overflow-y-auto max-h-96">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-700 text-gray-400">
                    <th className="px-2 py-1 text-left">Name</th>
                    <th className="px-2 py-1 text-center">Pos</th>
                    <th className="px-2 py-1 text-center">OVR</th>
                    <th className="px-2 py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {_.orderBy(team.players, [p => ['LW','C','RW','LD','RD','G'].indexOf(p.position), 'lineNumber']).map((p, i) => {
                    const pos = p.altPosition ? `${p.position}/${p.altPosition}` : p.position;
                    return (
                      <tr key={p.id} className={`border-b border-gray-700 ${i%2===0?'':'bg-gray-750'}`}>
                        <td className="px-2 py-1 text-white cursor-pointer hover:text-blue-400" onClick={() => setSelectedPlayer(p)}>{p.firstName} {p.lastName}{p.isExtra ? ' (X)' : ''}</td>
                        <td className="px-2 py-1 text-center text-gray-400">{pos}</td>
                        <td className={`px-2 py-1 text-center font-bold ${getOvrColor(p.overall)}`}>{p.overall}</td>
                        <td className="px-2 py-1">
                          <button onClick={() => onRelease(selectedTeam, p.id)} className="bg-red-800 hover:bg-red-700 text-white text-xs px-2 py-0.5 rounded">Release</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedPlayer && <PlayerDetail player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
    </div>
  );
}


// ============================================================
// ============================================================
// INJURY SYSTEM
// ============================================================

const INJURY_TYPES = [
  { name: 'Upper Body (Minor)',   severity: 'minor',        minGames: 1,  maxGames: 3,  weight: 30, description: 'Shoulder soreness / minor bruise' },
  { name: 'Lower Body (Minor)',   severity: 'minor',        minGames: 2,  maxGames: 5,  weight: 25, description: 'Minor knee tweak / ankle soreness' },
  { name: 'Upper Body (Moderate)',severity: 'moderate',     minGames: 5,  maxGames: 12, weight: 15, description: 'Separated shoulder / hand injury' },
  { name: 'Lower Body (Moderate)',severity: 'moderate',     minGames: 8,  maxGames: 18, weight: 12, description: 'Groin strain / hamstring pull' },
  { name: 'Concussion',           severity: 'major',        minGames: 5,  maxGames: 25, weight: 7,  description: 'Concussion protocol and recovery' },
  { name: 'Broken Bone',          severity: 'major',        minGames: 15, maxGames: 40, weight: 5,  description: 'Broken wrist / finger / foot' },
  { name: 'Knee/Ligament',        severity: 'severe',       minGames: 25, maxGames: 60, weight: 4,  description: 'MCL sprain / ACL partial tear' },
  { name: 'Season-Ending',        severity: 'season-ending',minGames: 82, maxGames: 82, weight: 2,  description: 'Major surgery required' },
];

function rollInjuryType(currentGame = 0, totalGames = 82) {
  const weights = INJURY_TYPES.map(t => [t, t.weight]);
  const type = weightedRand(weights);
  let games;
  if (type.severity === 'season-ending') {
    games = Math.max(1, totalGames - currentGame);
  } else {
    games = randInt(type.minGames, type.maxGames);
  }
  return {
    active: true,
    type: type.name,
    severity: type.severity,
    gamesRemaining: games,
    gamesTotal: games,
    gameOccurred: currentGame,
    description: `${type.name} (${games} ${games === 1 ? 'game' : 'games'})`,
  };
}

function rollForInjury(player, gameNumber = 0, isGoalie = false) {
  const BASE = isGoalie ? 0.0075 : 0.015;
  const dur = player.attributes?.durability || 50;
  const agg = player.attributes?.aggression || 50;
  const bc  = player.attributes?.bodyChecking || 50;
  const durabilityMod  = 1.5 - (dur / 99);            // 0.5 – 1.5
  const physicalityMod = 1.0 + ((agg + bc) / 198) * 0.3; // 1.0 – 1.3
  const prob = clamp(BASE * durabilityMod * physicalityMod, 0.003, 0.035);
  if (Math.random() < prob) return rollInjuryType(gameNumber);
  return null;
}

// Decrement injury counters after each game; return list of newly-returned players
function tickInjuries(teams) {
  const returned = [];
  const newTeams = teams.map(team => {
    const newPlayers = team.players.map(p => {
      if (!p.injury?.active) return p;
      const newRemaining = p.injury.gamesRemaining - 1;
      if (newRemaining <= 0) {
        returned.push({ teamId: team.id, playerId: p.id, playerName: `${p.firstName} ${p.lastName}`, injuryType: p.injury.type });
        return { ...p, injury: { ...p.injury, active: false, gamesRemaining: 0 }, rosterStatus: 'active', gamesPlayedSinceReturn: 0 };
      }
      return { ...p, injury: { ...p.injury, gamesRemaining: newRemaining } };
    });

    // Update IR / dayToDay lists
    const injuredIds = newPlayers.filter(p => p.injury?.active).map(p => p.id);
    const irIds = newPlayers.filter(p => p.injury?.active && (p.injury.gamesTotal >= 5)).map(p => p.id);
    const dtdIds = newPlayers.filter(p => p.injury?.active && (p.injury.gamesTotal < 5)).map(p => p.id);
    return { ...team, players: newPlayers, injuredReserve: irIds, dayToDay: dtdIds };
  });
  return { newTeams, returned };
}

// Get conditioning penalty multiplier for players recently returned from injury
function conditioningMult(player) {
  if (!player || player.injury?.active) return 1.0;
  if (!player.injury || player.injury.severity === 'minor') return 1.0;
  const g = player.gamesPlayedSinceReturn || 0;
  if (g <= 0) return 0.945;
  if (g === 1) return 0.970;
  if (g === 2) return 0.995;
  return 1.0;
}


// ============================================================
// PLAYOFF SIMULATION ENGINE
// ============================================================

// Simulate a single playoff game (reuses simulateGame core with playoff flags)
function simulatePlayoffGame(homeTeamIn, awayTeamIn, seriesState, isPlayoff = true) {
  // Determine if team faces elimination (opponent has 3 wins)
  const homeTeamId = homeTeamIn.id;
  const awayTeamId = awayTeamIn.id;
  const homeIsHigh = seriesState.highSeed.teamId === homeTeamId;
  const homeWins = homeIsHigh ? seriesState.highSeedWins : seriesState.lowSeedWins;
  const awayWins = homeIsHigh ? seriesState.lowSeedWins : seriesState.highSeedWins;
  const homeElim = awayWins === 3;
  const awayElim = homeWins === 3;

  // Clone teams
  const homeTeam = { ...homeTeamIn, players: homeTeamIn.players.map(p => ({ ...p, attributes: { ...p.attributes }, seasonStats: { ...p.seasonStats } })) };
  const awayTeam = { ...awayTeamIn, players: awayTeamIn.players.map(p => ({ ...p, attributes: { ...p.attributes }, seasonStats: { ...p.seasonStats } })) };

  // Mark healthy/injured players for simulation
  const activeHome = homeTeam.players.filter(p => !p.isExtra && (!p.injury?.active));
  const activeAway = awayTeam.players.filter(p => !p.isExtra && (!p.injury?.active));

  const homeRoster = getActiveRoster({ ...homeTeam, players: activeHome.length >= 12 ? activeHome : homeTeam.players.filter(p => !p.isExtra) });
  const awayRoster = getActiveRoster({ ...awayTeam, players: activeAway.length >= 12 ? activeAway : awayTeam.players.filter(p => !p.isExtra) });

  const homePP = getLinePP(homeTeam);
  const awayPP = getLinePP(awayTeam);
  const homePK = getLinePK(homeTeam);
  const awayPK = getLinePK(awayTeam);

  const homeLineChem = homeRoster.lines.map(line => line.length >= 3 ? getForwardLineChemistry(line[0], line[1], line[2]) : 1.0);
  const awayLineChem = awayRoster.lines.map(line => line.length >= 3 ? getForwardLineChemistry(line[0], line[1], line[2]) : 1.0);
  const homePairChem = homeRoster.pairs.map(pair => pair.length >= 2 ? getDefensePairChemistry(pair[0], pair[1]) : 1.0);
  const awayPairChem = awayRoster.pairs.map(pair => pair.length >= 2 ? getDefensePairChemistry(pair[0], pair[1]) : 1.0);

  const gameStats = {
    home: { goals:0, shots:0, hits:0, blocks:0, pim:0, fow:0, fol:0, ppg:0, ppo:0, pkg:0, pko:0, takeaways:0, giveaways:0 },
    away: { goals:0, shots:0, hits:0, blocks:0, pim:0, fow:0, fol:0, ppg:0, ppo:0, pkg:0, pko:0, takeaways:0, giveaways:0 },
  };

  const playerGameStats = {};
  const allActive = [...activeHome, ...activeAway];
  for (const p of allActive) {
    playerGameStats[p.id] = p.position === 'G'
      ? { GP:1,W:0,L:0,OTL:0,SV:0,SA:0,GA:0,SO:0,minutes:0 }
      : { GP:1,G:0,A:0,PIM:0,SOG:0,HIT:0,BLK:0,TK:0,GV:0,FOW:0,FOL:0,PPG:0,PPA:0,SHG:0,SHA:0,GWG:0,OTG:0,plusMinus:0,TOI:0 };
  }

  const toi = {};
  for (const p of allActive) toi[p.id] = 0;
  const scoringEvents = [];
  let penalties = [];
  let lineIdx = { home: 0, away: 0 };
  let pairIdx = { home: 0, away: 0 };
  let shiftTimer = { home: 0, away: 0 };
  const SHIFT_LEN = 30;

  const homeGoalie = homeRoster.starter;
  const awayGoalie = awayRoster.starter;
  if (homeGoalie && playerGameStats[homeGoalie.id]) playerGameStats[homeGoalie.id].minutes = 60;
  if (awayGoalie && playerGameStats[awayGoalie.id]) playerGameStats[awayGoalie.id].minutes = 60;

  // Poise multiplier for a player
  function getPoiseMultiplier(player, isElimTeam) {
    if (!player) return 1.0;
    const poise = player.attributes?.poise || 50;
    let mult = 0.90 + (poise / 99) * 0.20;
    if (isElimTeam) {
      if (poise > 80) mult *= 1.03;
      else if (poise < 40) mult *= 0.97;
    }
    return mult;
  }

  function getCurrentLines(side) {
    const roster = side === 'home' ? homeRoster : awayRoster;
    const lineI = lineIdx[side] % Math.max(1, roster.lines.length);
    const pairI = pairIdx[side] % Math.max(1, roster.pairs.length);
    return {
      fwds: roster.lines[lineI] || [],
      defs: roster.pairs[pairI] || [],
      lineChem: (side === 'home' ? homeLineChem : awayLineChem)[lineI] || 1.0,
      lineI, pairI
    };
  }

  function advanceLines(side) {
    const roster = side === 'home' ? homeRoster : awayRoster;
    shiftTimer[side]++;
    const shiftLength = lineIdx[side] === 0 ? 2 : 1;
    if (shiftTimer[side] >= shiftLength) {
      lineIdx[side] = (lineIdx[side] + 1) % Math.max(1, roster.lines.length);
      pairIdx[side] = (pairIdx[side] + 1) % Math.max(1, roster.pairs.length);
      shiftTimer[side] = 0;
    }
  }

  function addTOI(players, secs) {
    for (const p of players) { if (p && toi[p.id] !== undefined) toi[p.id] += secs; }
  }

  function getActivePens(side, time) {
    return penalties.filter(pen => pen.team === side && pen.endTime > time);
  }

  function pickShooterP(fwds, defs) {
    const candidates = [...fwds, ...defs.map(d => ({ ...d, _dW: 0.6 }))];
    if (!candidates.length) return null;
    return weightedRand(candidates.map(p => [p, ((attrVal(p,'wristShotAccuracy') + attrVal(p,'wristShotPower') + attrVal(p,'offensiveAwareness')) / 3) * (p._dW || 1.0)]));
  }

  function pickA1P(scorer, fwds, defs) {
    const c = [...fwds.filter(p => p.id !== scorer?.id), ...defs.map(d => ({ ...d, _w: 0.6 }))];
    if (!c.length) return null;
    return weightedRand(c.map(p => [p, (attrVal(p,'passing')*0.4 + attrVal(p,'offensiveAwareness')*0.3 + attrVal(p,'puckControl')*0.3) * (p._w||1.0)]));
  }

  function pickA2P(scorer, a1, fwds, defs) {
    const c = [...fwds.filter(p => p.id !== scorer?.id && p.id !== a1?.id), ...defs.filter(p => p.id !== a1?.id).map(d => ({ ...d, _w: 0.6 }))];
    if (!c.length) return null;
    return weightedRand(c.map(p => [p, (attrVal(p,'passing')*0.4 + attrVal(p,'offensiveAwareness')*0.3 + attrVal(p,'puckControl')*0.3) * (p._w||1.0)]));
  }

  function scoreGoalP(attSide, defSide, fwds, defs, defFwds, defDefs, strength, time, period) {
    gameStats[attSide].goals++;
    const scorer = pickShooterP(fwds, defs);
    if (!scorer) return;
    let a1 = null, a2 = null;
    if (Math.random() < 0.70) a1 = pickA1P(scorer, fwds, defs);
    if (a1 && Math.random() < 0.50) a2 = pickA2P(scorer, a1, fwds, defs);

    if (playerGameStats[scorer.id]) {
      playerGameStats[scorer.id].G++;
      if (strength === 'PP') playerGameStats[scorer.id].PPG++;
      if (strength === 'SH') playerGameStats[scorer.id].SHG++;
      if (time >= 3600) playerGameStats[scorer.id].OTG++;
    }
    if (a1 && playerGameStats[a1.id]) { playerGameStats[a1.id].A++; if (strength === 'PP') playerGameStats[a1.id].PPA++; if (strength === 'SH') playerGameStats[a1.id].SHA++; }
    if (a2 && playerGameStats[a2.id]) { playerGameStats[a2.id].A++; if (strength === 'PP') playerGameStats[a2.id].PPA++; if (strength === 'SH') playerGameStats[a2.id].SHA++; }

    if (strength === 'EV' || strength === 'SH') {
      for (const p of [...fwds,...defs]) { if (playerGameStats[p.id]) playerGameStats[p.id].plusMinus++; }
      for (const p of [...defFwds,...defDefs]) { if (playerGameStats[p.id]) playerGameStats[p.id].plusMinus--; }
    }

    const mins = Math.floor(time / 60) % 20;
    const secs = time % 60;
    scoringEvents.push({
      period, time: `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`, gameTime: time,
      team: attSide, teamName: attSide === 'home' ? homeTeam.name : awayTeam.name,
      scorer: `${scorer.firstName} ${scorer.lastName}`, scorerId: scorer.id,
      a1: a1 ? `${a1.firstName} ${a1.lastName}` : null, a1Id: a1?.id,
      a2: a2 ? `${a2.firstName} ${a2.lastName}` : null, a2Id: a2?.id,
      strength,
      homeScore: gameStats.home.goals, awayScore: gameStats.away.goals,
    });
  }

  // Playoff modifiers
  const PLAYOFF_HIT_MOD   = 1.20;
  const PLAYOFF_BLK_MOD   = 1.15;
  const PLAYOFF_PEN_MOD   = 0.90;
  const PLAYOFF_GV_MOD    = 0.90;
  const PLAYOFF_SHOT_MOD  = 1.05;
  const HOME_ICE_BOOST    = 1.03; // +3% for home team

  // Main sim loop: 60 minutes
  for (let t = 0; t < 3600; t += SHIFT_LEN) {
    const period = Math.floor(t / 1200) + 1;
    penalties = penalties.filter(p => p.endTime > t);

    const homeOnPP = getActivePens('away', t).length > 0;
    const awayOnPP = getActivePens('home', t).length > 0;
    const homeLines = getCurrentLines('home');
    const awayLines = getCurrentLines('away');

    let homeFwds, homeDefs, awayFwds, awayDefs;
    let homeStrength = 'EV', awayStrength = 'EV';

    if (homeOnPP) {
      homeFwds = homePP.forwards; homeDefs = homePP.defense;
      awayFwds = awayPK.forwards.slice(0,2); awayDefs = awayPK.defense.slice(0,2);
      homeStrength = 'PP'; awayStrength = 'SH';
    } else if (awayOnPP) {
      awayFwds = awayPP.forwards; awayDefs = awayPP.defense;
      homeFwds = homePK.forwards.slice(0,2); homeDefs = homePK.defense.slice(0,2);
      awayStrength = 'PP'; homeStrength = 'SH';
    } else {
      homeFwds = homeLines.fwds; homeDefs = homeLines.defs;
      awayFwds = awayLines.fwds; awayDefs = awayLines.defs;
    }

    addTOI([...homeFwds, ...homeDefs], SHIFT_LEN);
    addTOI([...awayFwds, ...awayDefs], SHIFT_LEN);

    const eventsThisShift = randInt(1, 3);
    for (let e = 0; e < eventsThisShift; e++) {
      const homeHasPuck = Math.random() < 0.52;
      const attSide = homeHasPuck ? 'home' : 'away';
      const defSide = homeHasPuck ? 'away' : 'home';
      const attFwds = homeHasPuck ? homeFwds : awayFwds;
      const attDefs = homeHasPuck ? homeDefs : awayDefs;
      const defFwds = homeHasPuck ? awayFwds : homeFwds;
      const defDefs = homeHasPuck ? awayDefs : homeDefs;
      const attGoalie = homeHasPuck ? awayGoalie : homeGoalie;
      const attLineChem = homeHasPuck ? (homeStrength==='EV' ? homeLines.lineChem : 1.0) : (awayStrength==='EV' ? awayLines.lineChem : 1.0);
      const strength = homeHasPuck ? homeStrength : awayStrength;
      const isElimAtt = homeHasPuck ? homeElim : awayElim;
      const elimBoost = isElimAtt ? 1.05 : 1.0;
      const homeIceMult = homeHasPuck ? HOME_ICE_BOOST : 1.0;

      const ppShotMod = strength === 'PP' ? 1.4 : strength === 'SH' ? 0.7 : 1.0;
      const ppGoalMod = strength === 'PP' ? 1.25 : strength === 'SH' ? 0.8 : 1.0;

      const allAtt = [...attFwds,...attDefs].filter(Boolean);
      const r = Math.random();
      const shotChance = 0.25 * ppShotMod * PLAYOFF_SHOT_MOD * elimBoost * homeIceMult;

      if (r < shotChance) {
        gameStats[attSide].shots++;
        const shooter = pickShooterP(attFwds, attDefs);
        if (shooter && playerGameStats[shooter.id]) playerGameStats[shooter.id].SOG++;
        if (attGoalie && playerGameStats[attGoalie.id]) playerGameStats[attGoalie.id].SA++;

        const shooter2 = pickShooterP(attFwds, attDefs);
        const poiseM = getPoiseMultiplier(shooter2, isElimAtt);
        const condM = shooter2 ? conditioningMult(shooter2) : 1.0;
        const shooterBonus = shooter2 ? (
          attrVal(shooter2,'wristShotAccuracy')*0.25 + attrVal(shooter2,'wristShotPower')*0.15 +
          attrVal(shooter2,'slapShotAccuracy')*0.15 + attrVal(shooter2,'slapShotPower')*0.10 +
          attrVal(shooter2,'offensiveAwareness')*0.15 + attrVal(shooter2,'handEye')*0.10 + attrVal(shooter2,'poise')*0.10
        ) / 99 : 0.75;
        const goaliePoiseM = attGoalie ? getPoiseMultiplier(attGoalie, homeHasPuck ? awayElim : homeElim) : 1.0;
        const goalieBonus = attGoalie ? (
          attrVal(attGoalie,'angles')*0.15 + attrVal(attGoalie,'vision')*0.12 + attrVal(attGoalie,'reboundControl')*0.12 +
          attrVal(attGoalie,'gloveHigh')*0.08 + attrVal(attGoalie,'gloveLow')*0.08 + attrVal(attGoalie,'stickHigh')*0.08 +
          attrVal(attGoalie,'stickLow')*0.08 + attrVal(attGoalie,'fiveHole')*0.08 + attrVal(attGoalie,'shotRecovery')*0.08 +
          attrVal(attGoalie,'breakaway')*0.05 + attrVal(attGoalie,'pokeCheque')*0.04 + attrVal(attGoalie,'balance')*0.02 + attrVal(attGoalie,'agility')*0.02
        ) / 99 : 0.75;

        let goalProb = 0.08 * (0.5 + shooterBonus * 0.7) * (1.5 - goalieBonus * 0.7) * attLineChem * ppGoalMod * poiseM * condM * homeIceMult;
        goalProb = clamp(goalProb / goaliePoiseM, 0.02, 0.18);

        if (Math.random() < goalProb) {
          scoreGoalP(attSide, defSide, attFwds, attDefs, defFwds, defDefs, strength, t + e * 10, period);
          if (attGoalie && playerGameStats[attGoalie.id]) playerGameStats[attGoalie.id].GA++;
        } else {
          if (attGoalie && playerGameStats[attGoalie.id]) playerGameStats[attGoalie.id].SV++;
        }
      } else if (r < shotChance + 0.10 * PLAYOFF_BLK_MOD) {
        gameStats[defSide].blocks++;
        const blocker = defFwds.concat(defDefs).find(p => p);
        if (blocker && playerGameStats[blocker.id]) playerGameStats[blocker.id].BLK++;
      } else if (r < shotChance + 0.10 * PLAYOFF_BLK_MOD + 0.10 * PLAYOFF_GV_MOD) {
        gameStats[attSide].giveaways++;
        const ap = attFwds[0] || attDefs[0];
        if (ap && playerGameStats[ap.id]) playerGameStats[ap.id].GV++;
      } else if (r < shotChance + 0.10 * PLAYOFF_BLK_MOD + 0.10 * PLAYOFF_GV_MOD + 0.08) {
        gameStats[defSide].takeaways++;
        const dp = defFwds[0] || defDefs[0];
        if (dp && playerGameStats[dp.id]) playerGameStats[dp.id].TK++;
      } else if (r < shotChance + 0.10 * PLAYOFF_BLK_MOD + 0.10 * PLAYOFF_GV_MOD + 0.08 + 0.12 * PLAYOFF_HIT_MOD) {
        gameStats[attSide].hits++;
        const hitter = allAtt.find(p => attrVal(p,'bodyChecking') > 60) || allAtt[0];
        if (hitter && playerGameStats[hitter.id]) playerGameStats[hitter.id].HIT++;
      } else if (r < shotChance + 0.10 * PLAYOFF_BLK_MOD + 0.10 * PLAYOFF_GV_MOD + 0.08 + 0.12 * PLAYOFF_HIT_MOD + 0.05) {
        // Faceoff
        const hC = (homeHasPuck ? attFwds : defFwds).find(p => p.position === 'C') || attFwds[0];
        const aC = (homeHasPuck ? defFwds : attFwds).find(p => p.position === 'C') || defFwds[0];
        const hFO = attrVal(hC,'faceoffs'), aFO = attrVal(aC,'faceoffs');
        const hW = Math.random() < (hFO / (hFO + aFO + 0.001));
        if (hW) {
          gameStats.home.fow++; gameStats.away.fol++;
          if (hC && playerGameStats[hC.id]) playerGameStats[hC.id].FOW++;
          if (aC && playerGameStats[aC.id]) playerGameStats[aC.id].FOL++;
        } else {
          gameStats.away.fow++; gameStats.home.fol++;
          if (aC && playerGameStats[aC.id]) playerGameStats[aC.id].FOW++;
          if (hC && playerGameStats[hC.id]) playerGameStats[hC.id].FOL++;
        }
      } else if (r < shotChance + 0.10 * PLAYOFF_BLK_MOD + 0.10 * PLAYOFF_GV_MOD + 0.08 + 0.12 * PLAYOFF_HIT_MOD + 0.05 + 0.03 * PLAYOFF_PEN_MOD) {
        // Penalty
        const defP = allAtt[randInt(0, Math.max(0, allAtt.length-1))];
        if (defP) {
          const penDur = Math.random() < 0.85 ? 120 : 240;
          penalties.push({ team: defSide, endTime: t + penDur, playerId: defP.id });
          gameStats[defSide].pim += penDur / 30;
          gameStats[attSide].ppo++;
          if (playerGameStats[defP.id]) playerGameStats[defP.id].PIM += penDur / 30;
        }
      }
    }
    advanceLines('home');
    advanceLines('away');
  }

  // --- PLAYOFF OVERTIME: 5-on-5, continuous 20-min periods, no shootout ---
  let isOT = false;
  let otPeriod = 0;
  let otGoalScored = false;
  let otShotsTiebreak = { home: 0, away: 0 };

  if (gameStats.home.goals === gameStats.away.goals) {
    isOT = true;

    // Use lines 1 and 2 for OT
    const otHomeFwds = [
      ...(homeRoster.lines[0] || []).slice(0,3),
      ...(homeRoster.lines[1] || []).slice(0,3),
    ];
    const otHomeDefs = [
      ...(homeRoster.pairs[0] || []).slice(0,2),
      ...(homeRoster.pairs[1] || []).slice(0,2),
    ];
    const otAwayFwds = [
      ...(awayRoster.lines[0] || []).slice(0,3),
      ...(awayRoster.lines[1] || []).slice(0,3),
    ];
    const otAwayDefs = [
      ...(awayRoster.pairs[0] || []).slice(0,2),
      ...(awayRoster.pairs[1] || []).slice(0,2),
    ];

    outerOT: for (let otP = 0; otP < 5 && !otGoalScored; otP++) {
      otPeriod = otP + 1;
      for (let t = 0; t < 1200 && !otGoalScored; t += SHIFT_LEN) {
        const eventsOT = randInt(1, 3);
        for (let e = 0; e < eventsOT && !otGoalScored; e++) {
          const homeHasPuck = Math.random() < 0.52;
          const attSide = homeHasPuck ? 'home' : 'away';
          const defSide = homeHasPuck ? 'away' : 'home';
          const attFwds = homeHasPuck ? otHomeFwds.slice(0,3) : otAwayFwds.slice(0,3);
          const attDefs = homeHasPuck ? otHomeDefs.slice(0,2) : otAwayDefs.slice(0,2);
          const defFwds = homeHasPuck ? otAwayFwds.slice(0,3) : otHomeFwds.slice(0,3);
          const defDefs = homeHasPuck ? otAwayDefs.slice(0,2) : otHomeDefs.slice(0,2);
          const attGoalie = homeHasPuck ? awayGoalie : homeGoalie;

          const r2 = Math.random();
          if (r2 < 0.28) { // slightly reduced shot rate in OT
            gameStats[attSide].shots++;
            otShotsTiebreak[attSide]++;
            const shooter = pickShooterP(attFwds, attDefs);
            if (shooter && playerGameStats[shooter.id]) playerGameStats[shooter.id].SOG++;
            if (attGoalie && playerGameStats[attGoalie.id]) playerGameStats[attGoalie.id].SA++;

            const poiseM = getPoiseMultiplier(shooter, homeHasPuck ? homeElim : awayElim);
            const shooterB = shooter ? (attrVal(shooter,'wristShotAccuracy')*0.3 + attrVal(shooter,'poise')*0.2 + attrVal(shooter,'offensiveAwareness')*0.2 + attrVal(shooter,'deking')*0.15 + attrVal(shooter,'speed')*0.15) / 99 : 0.75;
            const goalieB = attGoalie ? (attrVal(attGoalie,'angles')*0.2 + attrVal(attGoalie,'vision')*0.2 + attrVal(attGoalie,'breakaway')*0.2 + attrVal(attGoalie,'reboundControl')*0.15 + attrVal(attGoalie,'agility')*0.1 + attrVal(attGoalie,'fiveHole')*0.15) / 99 : 0.75;
            let gp = 0.10 * (0.5 + shooterB * 0.7) * (1.5 - goalieB * 0.7) * poiseM;
            gp = clamp(gp, 0.03, 0.20);
            if (Math.random() < gp) {
              scoreGoalP(attSide, defSide, attFwds, attDefs, defFwds, defDefs, 'EV', 3600 + otP*1200 + t + e*10, 4 + otP);
              if (attGoalie && playerGameStats[attGoalie.id]) playerGameStats[attGoalie.id].GA++;
              otGoalScored = true;
            } else {
              if (attGoalie && playerGameStats[attGoalie.id]) playerGameStats[attGoalie.id].SV++;
            }
          }
        }
      }
    }

    // After 5 OT periods, award win to team with more OT shots
    if (!otGoalScored) {
      const winSide = otShotsTiebreak.home >= otShotsTiebreak.away ? 'home' : 'away';
      gameStats[winSide].goals++;
    }
  }

  // TOI
  for (const p of allActive) {
    if (p.position !== 'G' && playerGameStats[p.id]) playerGameStats[p.id].TOI = Math.round((toi[p.id] || 0) / 60 * 10) / 10;
  }

  const homeWin = gameStats.home.goals > gameStats.away.goals;

  // GWG
  if (scoringEvents.length > 0) {
    const homeGoals = scoringEvents.filter(e => e.team === 'home');
    if (homeWin && homeGoals.length >= gameStats.away.goals + 1) {
      const gwgEvent = homeGoals[gameStats.away.goals];
      if (gwgEvent && playerGameStats[gwgEvent.scorerId]) playerGameStats[gwgEvent.scorerId].GWG++;
    } else {
      const awayGoals = scoringEvents.filter(e => e.team === 'away');
      if (!homeWin && awayGoals.length >= gameStats.home.goals + 1) {
        const gwgEvent = awayGoals[gameStats.home.goals];
        if (gwgEvent && playerGameStats[gwgEvent.scorerId]) playerGameStats[gwgEvent.scorerId].GWG++;
      }
    }
  }

  gameStats.home.ppg = scoringEvents.filter(e => e.team === 'home' && e.strength === 'PP').length;
  gameStats.away.ppg = scoringEvents.filter(e => e.team === 'away' && e.strength === 'PP').length;

  if (homeGoalie && playerGameStats[homeGoalie.id]) {
    const gs = playerGameStats[homeGoalie.id];
    gs.GA = gameStats.away.goals; gs.SA = gameStats.away.shots;
    gs.SV = Math.max(0, gs.SA - gs.GA);
    if (homeWin) gs.W = 1; else gs.L = 1;
    if (gs.GA === 0) gs.SO = 1;
  }
  if (awayGoalie && playerGameStats[awayGoalie.id]) {
    const gs = playerGameStats[awayGoalie.id];
    gs.GA = gameStats.home.goals; gs.SA = gameStats.home.shots;
    gs.SV = Math.max(0, gs.SA - gs.GA);
    if (!homeWin) gs.W = 1; else gs.L = 1;
    if (gs.GA === 0) gs.SO = 1;
  }

  return {
    homeTeamId: homeTeam.id, awayTeamId: awayTeam.id,
    homeTeamName: homeTeam.name, awayTeamName: awayTeam.name,
    homeScore: gameStats.home.goals, awayScore: gameStats.away.goals,
    isOT, otPeriods: isOT ? otPeriod : 0, isSO: false,
    gameStats, scoringEvents, playerGameStats,
    homeGoalieId: homeGoalie?.id, awayGoalieId: awayGoalie?.id,
  };
}

// Accumulate playoff stats into team.playoffStats and player.playoffStats
function accumulatePlayoffStats(teams, gameResult) {
  const { homeTeamId, awayTeamId, homeScore, awayScore, isOT, gameStats, playerGameStats } = gameResult;
  const homeTeam = teams.find(t => t.id === homeTeamId);
  const awayTeam = teams.find(t => t.id === awayTeamId);
  const homeWin = homeScore > awayScore;

  for (const [team, side, opSide, score, opScore] of [[homeTeam,'home','away',homeScore,awayScore],[awayTeam,'away','home',awayScore,homeScore]]) {
    if (!team) continue;
    const ps = team.playoffStats;
    ps.GP++; if (side==='home' ? homeWin : !homeWin) ps.W++; else ps.L++;
    ps.GF += score; ps.GA += opScore;
    ps.PPG += gameStats[side].ppg || 0;
    ps.PPO += gameStats[side].ppo || 0;
    ps.PKG_against += gameStats[opSide].ppg || 0;
    ps.PKO += gameStats[opSide].ppo || 0;
  }

  for (const team of [homeTeam, awayTeam].filter(Boolean)) {
    for (const player of team.players) {
      const gs = playerGameStats[player.id];
      if (!gs) continue;
      const ps = player.playoffStats;
      if (player.position === 'G') {
        ps.GP += gs.GP||0; ps.W += gs.W||0; ps.L += gs.L||0; ps.OTL += gs.OTL||0;
        ps.SV += gs.SV||0; ps.SA += gs.SA||0; ps.GA += gs.GA||0; ps.SO += gs.SO||0; ps.minutes += gs.minutes||60;
      } else {
        ps.GP += gs.GP||0; ps.G += gs.G||0; ps.A += gs.A||0; ps.PIM += gs.PIM||0;
        ps.SOG += gs.SOG||0; ps.HIT += gs.HIT||0; ps.BLK += gs.BLK||0;
        ps.TK += gs.TK||0; ps.GV += gs.GV||0; ps.FOW += gs.FOW||0; ps.FOL += gs.FOL||0;
        ps.PPG += gs.PPG||0; ps.PPA += gs.PPA||0; ps.SHG += gs.SHG||0; ps.SHA += gs.SHA||0;
        ps.GWG += gs.GWG||0; ps.OTG += gs.OTG||0; ps.plusMinus += gs.plusMinus||0; ps.TOI += gs.TOI||0;
      }
    }
  }
}

// Create initial playoff structure from seeded teams
function initPlayoffs(teams) {
  const standings = getStandings(teams);
  const top4 = standings.slice(0, 4);
  const makeEntry = (t, seed) => ({ teamId: t.id, teamName: t.name, seed });

  return {
    active: true,
    round: 'semifinals',
    series: [
      {
        id: 'sf1', round: 'semifinals',
        highSeed: makeEntry(top4[0], 1), lowSeed: makeEntry(top4[3], 4),
        highSeedWins: 0, lowSeedWins: 0,
        games: [], winner: null, status: 'active',
      },
      {
        id: 'sf2', round: 'semifinals',
        highSeed: makeEntry(top4[1], 2), lowSeed: makeEntry(top4[2], 3),
        highSeedWins: 0, lowSeedWins: 0,
        games: [], winner: null, status: 'active',
      },
      {
        id: 'final', round: 'finals',
        highSeed: null, lowSeed: null,
        highSeedWins: 0, lowSeedWins: 0,
        games: [], winner: null, status: 'pending',
      },
    ],
    champion: null,
    connSmythWinner: null,
    playoffStats: {},
  };
}

// Determine home team for a given game number in a series
function getSeriesHomeTeam(series, gameNumber) {
  // Games 1,2,5,7 → high seed home; Games 3,4,6 → low seed home
  const highSeedHome = [1,2,5,7].includes(gameNumber);
  return highSeedHome ? series.highSeed.teamId : series.lowSeed.teamId;
}

// Simulate one game in a series; return updated series
function simSeriesGame(series, teams) {
  if (series.status === 'complete') return { series, gameResult: null };
  const gameNumber = series.games.length + 1;
  const homeTeamId = getSeriesHomeTeam(series, gameNumber);
  const awayTeamId = homeTeamId === series.highSeed.teamId ? series.lowSeed.teamId : series.highSeed.teamId;
  const homeTeam = teams.find(t => t.id === homeTeamId);
  const awayTeam = teams.find(t => t.id === awayTeamId);
  if (!homeTeam || !awayTeam) return { series, gameResult: null };

  const result = simulatePlayoffGame(homeTeam, awayTeam, series);
  const homeIsHigh = series.highSeed.teamId === homeTeamId;
  const homeWon = result.homeScore > result.awayScore;

  let newHighWins = series.highSeedWins;
  let newLowWins = series.lowSeedWins;
  if (homeWon) { if (homeIsHigh) newHighWins++; else newLowWins++; }
  else { if (homeIsHigh) newLowWins++; else newHighWins++; }

  const gameEntry = {
    gameNumber, homeTeamId, awayTeamId,
    homeScore: result.homeScore, awayScore: result.awayScore,
    overtime: result.isOT, otPeriods: result.otPeriods || 0,
    scoringEvents: result.scoringEvents,
    gameStats: result.gameStats,
    playerGameStats: result.playerGameStats,
  };

  let winner = null;
  let newStatus = series.status;
  if (newHighWins === 4) { winner = series.highSeed.teamId; newStatus = 'complete'; }
  else if (newLowWins === 4) { winner = series.lowSeed.teamId; newStatus = 'complete'; }

  const newSeries = { ...series, highSeedWins: newHighWins, lowSeedWins: newLowWins, games: [...series.games, gameEntry], winner, status: newStatus };
  return { series: newSeries, gameResult: result };
}


// ============================================================
// AWARD CALCULATION
// ============================================================

function norm(value, leagueMax) {
  return (leagueMax && leagueMax > 0) ? Math.min(1, value / leagueMax) : 0;
}

function calculateAwards(teams) {
  const allSkaters = teams.flatMap(t =>
    t.players.filter(p => p.position !== 'G' && !p.isExtra).map(p => ({
      ...p, teamName: t.name, teamAbbr: t.abbr, teamId: t.id,
      stats: { ...p.seasonStats, points: (p.seasonStats.G||0)+(p.seasonStats.A||0), foWinPct: p.seasonStats.FOL + p.seasonStats.FOW > 0 ? (p.seasonStats.FOW/(p.seasonStats.FOW+p.seasonStats.FOL))*100 : 0, shPoints: (p.seasonStats.SHG||0)+(p.seasonStats.SHA||0) },
    }))
  );
  const allGoalies = teams.flatMap(t =>
    t.players.filter(p => p.position === 'G').map(p => ({
      ...p, teamName: t.name, teamAbbr: t.abbr, teamId: t.id,
      stats: { ...p.seasonStats, svPct: p.seasonStats.SA > 0 ? p.seasonStats.SV/p.seasonStats.SA : 0, wins: p.seasonStats.W||0, gaa: p.seasonStats.minutes > 0 ? (p.seasonStats.GA*60/p.seasonStats.minutes) : 0 },
    }))
  );
  const standings = getStandings(teams);

  // League maxes
  const lmPoints = Math.max(...allSkaters.map(p => p.stats.points), 1);
  const lmGoals  = Math.max(...allSkaters.map(p => p.seasonStats.G||0), 1);
  const lmAssists= Math.max(...allSkaters.map(p => p.seasonStats.A||0), 1);
  const lmPlusMinus = Math.max(...allSkaters.map(p => Math.abs(p.seasonStats.plusMinus||0)), 1);
  const lmTOI   = Math.max(...allSkaters.map(p => p.seasonStats.TOI||0), 1);
  const lmGWG   = Math.max(...allSkaters.map(p => p.seasonStats.GWG||0), 1);
  const lmSOG   = Math.max(...allSkaters.map(p => p.seasonStats.SOG||0), 1);
  const lmPIM   = Math.max(...allSkaters.map(p => p.seasonStats.PIM||0), 1);
  const lmHits  = Math.max(...allSkaters.map(p => p.seasonStats.HIT||0), 1);
  const lmTK    = Math.max(...allSkaters.map(p => p.seasonStats.TK||0), 1);
  const lmBLK   = Math.max(...allSkaters.map(p => p.seasonStats.BLK||0), 1);
  const lmSVP   = Math.max(...allGoalies.map(g => g.stats.svPct), 0.001);
  const lmGAA   = Math.max(...allGoalies.map(g => g.stats.gaa), 0.001);
  const lmWins  = Math.max(...allGoalies.map(g => g.stats.wins), 1);
  const lmSO    = Math.max(...allGoalies.map(g => g.seasonStats.SO||0), 1);
  const lmGP    = Math.max(...allGoalies.map(g => g.seasonStats.GP||0), 1);

  // Defenseman maxes
  const defs = allSkaters.filter(p => ['LD','RD'].includes(p.position));
  const lmDPoints = Math.max(...defs.map(p => p.stats.points), 1);
  const lmDPM = Math.max(...defs.map(p => Math.abs(p.seasonStats.plusMinus||0)), 1);
  const lmDBLK = Math.max(...defs.map(p => p.seasonStats.BLK||0), 1);
  const lmDTK = Math.max(...defs.map(p => p.seasonStats.TK||0), 1);
  const lmDTOI = Math.max(...defs.map(p => p.seasonStats.TOI||0), 1);
  const lmDHits = Math.max(...defs.map(p => p.seasonStats.HIT||0), 1);
  const lmDSOG = Math.max(...defs.map(p => p.seasonStats.SOG||0), 1);
  const fwds = allSkaters.filter(p => ['LW','C','RW'].includes(p.position));
  const lmFBLK = Math.max(...fwds.map(p => p.seasonStats.BLK||0), 1);
  const lmSHP  = Math.max(...fwds.map(p => (p.seasonStats.SHG||0)+(p.seasonStats.SHA||0)), 1);

  function hartScore(p) {
    const rank = standings.findIndex(t => t.id === p.teamId) + 1;
    const teamBonus = (7 - rank) / 6;
    const pm = p.seasonStats.plusMinus||0;
    return (
      norm(p.stats.points, lmPoints)*0.30 + norm(p.seasonStats.G||0, lmGoals)*0.15 +
      norm(Math.max(pm,0), lmPlusMinus)*0.10 + norm(p.seasonStats.TOI||0, lmTOI)*0.05 +
      norm(p.overall, 99)*0.10 + teamBonus*0.20 + norm(p.seasonStats.GWG||0, lmGWG)*0.10
    );
  }
  function norrisScore(p) {
    const pm = p.seasonStats.plusMinus||0;
    return (
      norm(p.stats.points, lmDPoints)*0.25 + norm(Math.max(pm,0), lmDPM)*0.20 +
      norm(p.seasonStats.BLK||0, lmDBLK)*0.15 + norm(p.seasonStats.TK||0, lmDTK)*0.10 +
      norm(p.seasonStats.TOI||0, lmDTOI)*0.10 + norm(p.attributes?.defensiveAwareness||50, 99)*0.10 +
      norm(p.seasonStats.HIT||0, lmDHits)*0.05 + norm(p.seasonStats.SOG||0, lmDSOG)*0.05
    );
  }
  function vezinaScore(g) {
    const gaaInv = lmGAA > 0 ? (lmGAA - g.stats.gaa) / lmGAA : 0;
    return (
      norm(g.stats.svPct, lmSVP)*0.35 + Math.max(0,gaaInv)*0.25 +
      norm(g.stats.wins, lmWins)*0.20 + norm(g.seasonStats.SO||0, lmSO)*0.10 +
      norm(g.seasonStats.GP||0, lmGP)*0.10
    );
  }
  function calderScore(p) {
    const pm = p.seasonStats.plusMinus||0;
    return (
      norm(p.stats.points, lmPoints)*0.35 + norm(p.seasonStats.G||0, lmGoals)*0.20 +
      norm(p.overall, 99)*0.15 + norm(Math.max(pm,0), lmPlusMinus)*0.10 +
      norm(p.seasonStats.TOI||0, lmTOI)*0.10 + norm(p.seasonStats.SOG||0, lmSOG)*0.10
    );
  }
  function selkeScore(p) {
    const pm = p.seasonStats.plusMinus||0;
    return (
      norm(Math.max(pm,0), lmPlusMinus)*0.20 + norm(p.seasonStats.TK||0, lmTK)*0.20 +
      norm(p.seasonStats.BLK||0, lmFBLK)*0.15 + norm(p.stats.foWinPct, 100)*0.15 +
      norm(p.attributes?.defensiveAwareness||50, 99)*0.15 + norm(p.attributes?.stickChecking||50, 99)*0.10 +
      norm((p.seasonStats.SHG||0)+(p.seasonStats.SHA||0), lmSHP)*0.05
    );
  }
  function ladyByngScore(p) {
    const pm = p.seasonStats.plusMinus||0;
    const pimPen = lmPIM > 0 ? 1 - (p.seasonStats.PIM||0) / lmPIM : 1;
    return (
      norm(p.stats.points, lmPoints)*0.40 + Math.max(0, pimPen)*0.35 +
      norm(Math.max(pm,0), lmPlusMinus)*0.15 + norm(p.attributes?.discipline||50, 99)*0.10
    );
  }

  function topFinalists(arr, scoreFn, n = 3, minGP = 60) {
    const eligible = arr.filter(p => (p.seasonStats.GP||0) >= minGP);
    if (!eligible.length) return null;
    const ranked = _.orderBy(eligible, scoreFn, 'desc').slice(0, n);
    return { winner: ranked[0], finalists: ranked, scores: ranked.map(p => ({ id: p.id, score: scoreFn(p) })) };
  }

  // Art Ross: pure points
  const artRossEligible = allSkaters.filter(p => (p.seasonStats.GP||0) >= 60);
  const artRoss = artRossEligible.length ? { winner: _.orderBy(artRossEligible, [p => p.stats.points, p => p.seasonStats.G||0], ['desc','desc'])[0], finalists: _.orderBy(artRossEligible, [p => p.stats.points, p => p.seasonStats.G||0], ['desc','desc']).slice(0,3) } : null;

  // Rocket Richard: pure goals
  const rocketRichard = artRossEligible.length ? { winner: _.orderBy(artRossEligible, [p => p.seasonStats.G||0, p => -(p.seasonStats.GP||0)], ['desc','asc'])[0], finalists: _.orderBy(artRossEligible, [p => p.seasonStats.G||0], ['desc']).slice(0,3) } : null;

  // Calder: age <= 21, GP >= 40
  const calderEligible = allSkaters.filter(p => p.age <= 21 && (p.seasonStats.GP||0) >= 40);
  const calder = calderEligible.length ? { winner: _.orderBy(calderEligible, calderScore, 'desc')[0], finalists: _.orderBy(calderEligible, calderScore, 'desc').slice(0,3) } : null;

  // Lady Byng: PIM <= 20, GP >= 60
  const lbEligible = allSkaters.filter(p => (p.seasonStats.GP||0) >= 60 && (p.seasonStats.PIM||0) <= 20);
  const ladyByng = lbEligible.length ? { winner: _.orderBy(lbEligible, ladyByngScore, 'desc')[0], finalists: _.orderBy(lbEligible, ladyByngScore, 'desc').slice(0,3) } : null;

  return {
    hart:          topFinalists(allSkaters, hartScore, 3, 60),
    artRoss,
    rocketRichard,
    norris:        topFinalists(defs, norrisScore, 3, 60),
    vezina:        topFinalists(allGoalies, vezinaScore, 3, 40),
    calder,
    selke:         topFinalists(fwds, selkeScore, 3, 60),
    ladyByng,
  };
}

function calculateConnSmythe(teams) {
  const allSkaters = teams.flatMap(t =>
    t.players.filter(p => p.position !== 'G' && !p.isExtra && (p.playoffStats?.GP||0) > 0).map(p => ({
      ...p, ps: p.playoffStats, teamName: t.name, teamAbbr: t.abbr
    }))
  );
  const allGoalies = teams.flatMap(t =>
    t.players.filter(p => p.position === 'G' && (p.playoffStats?.GP||0) > 0).map(p => ({
      ...p, ps: { ...p.playoffStats, svPct: p.playoffStats.SA > 0 ? p.playoffStats.SV/p.playoffStats.SA : 0, gaa: p.playoffStats.minutes > 0 ? (p.playoffStats.GA*60/p.playoffStats.minutes) : 0 }, teamName: t.name, teamAbbr: t.abbr
    }))
  );

  if (!allSkaters.length && !allGoalies.length) return null;

  const lmP   = Math.max(...allSkaters.map(p => (p.ps.G||0)+(p.ps.A||0)), 1);
  const lmG   = Math.max(...allSkaters.map(p => p.ps.G||0), 1);
  const lmGWG = Math.max(...allSkaters.map(p => p.ps.GWG||0), 1);
  const lmPM  = Math.max(...allSkaters.map(p => Math.abs(p.ps.plusMinus||0)), 1);
  const lmTOI = Math.max(...allSkaters.map(p => p.ps.TOI||0), 1);
  const lmSOG = Math.max(...allSkaters.map(p => p.ps.SOG||0), 1);

  const lmSVP  = Math.max(...allGoalies.map(g => g.ps.svPct), 0.001);
  const lmGAA  = Math.max(...allGoalies.map(g => g.ps.gaa), 0.001);
  const lmGWins= Math.max(...allGoalies.map(g => g.ps.W||0), 1);
  const lmGSO  = Math.max(...allGoalies.map(g => g.ps.SO||0), 1);
  const lmGGP  = Math.max(...allGoalies.map(g => g.ps.GP||0), 1);

  function skaterScore(p) {
    const pm = p.ps.plusMinus||0;
    return (
      norm((p.ps.G||0)+(p.ps.A||0), lmP)*0.30 + norm(p.ps.G||0, lmG)*0.20 +
      norm(p.ps.GWG||0, lmGWG)*0.15 + norm(Math.max(pm,0), lmPM)*0.15 +
      norm(p.ps.TOI||0, lmTOI)*0.05 + norm(p.attributes?.poise||50, 99)*0.10 + norm(p.ps.SOG||0, lmSOG)*0.05
    );
  }
  function goalieScore(g) {
    const gaaInv = lmGAA > 0 ? (lmGAA - g.ps.gaa) / lmGAA : 0;
    return (
      norm(g.ps.svPct, lmSVP)*0.30 + Math.max(0,gaaInv)*0.25 +
      norm(g.ps.W||0, lmGWins)*0.25 + norm(g.ps.SO||0, lmGSO)*0.10 + norm(g.ps.GP||0, lmGGP)*0.10
    );
  }

  const topSkater = allSkaters.length ? _.orderBy(allSkaters, skaterScore, 'desc')[0] : null;
  const topGoalie = allGoalies.length ? _.orderBy(allGoalies, goalieScore, 'desc')[0] : null;
  const topSkScore = topSkater ? skaterScore(topSkater) : 0;
  const topGoScore = topGoalie ? goalieScore(topGoalie) : 0;
  const winner = topGoScore > topSkScore ? topGoalie : topSkater;
  const finalists = _.orderBy([...allSkaters.slice(0,3), ...allGoalies.slice(0,2)], p => p.position === 'G' ? goalieScore(p) : skaterScore(p), 'desc').slice(0,3);

  return { winner, finalists };
}


// ============================================================
// PLAYOFF BRACKET & AWARDS UI
// ============================================================

function SeriesBox({ series, teams, onClick }) {
  const high = teams.find(t => t.id === series.highSeed?.teamId);
  const low  = teams.find(t => t.id === series.lowSeed?.teamId);
  const isPending = series.status === 'pending' || !series.highSeed;
  const isComplete = series.status === 'complete';

  if (isPending) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 min-w-48 cursor-default opacity-50">
        <div className="text-gray-500 text-xs text-center">TBD</div>
      </div>
    );
  }

  const title = series.round === 'finals' ? 'Championship Final' : `Semifinal — Series ${series.id === 'sf1' ? 'A' : 'B'}`;
  const highLeads = series.highSeedWins >= series.lowSeedWins;

  return (
    <div onClick={() => onClick(series)} className={`bg-gray-800 border rounded-lg p-3 min-w-52 cursor-pointer hover:border-blue-500 transition ${isComplete ? 'border-gray-600' : 'border-blue-700'}`}
      style={isComplete ? { borderColor: (high?.id === series.winner ? high?.color : low?.color) + '88' } : {}}>
      <div className="text-gray-400 text-xs mb-2 font-semibold uppercase">{title}</div>
      {[{ team: high, seed: series.highSeed.seed, wins: series.highSeedWins }, { team: low, seed: series.lowSeed.seed, wins: series.lowSeedWins }].map(({ team, seed, wins }) => {
        const isWinner = isComplete && team?.id === series.winner;
        const isLoser  = isComplete && team?.id !== series.winner;
        return (
          <div key={team?.id} className={`flex items-center justify-between py-1 ${isLoser ? 'opacity-40' : ''}`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team?.color || '#888' }} />
              <span className={`text-xs ${isWinner ? 'text-white font-bold' : 'text-gray-300'}`}>
                #{seed} {team?.name || 'TBD'}
              </span>
              {isWinner && <span className="text-yellow-400 text-xs">🏆</span>}
            </div>
            <span className={`text-sm font-bold ${isWinner ? 'text-green-400' : 'text-gray-400'}`}>{wins}</span>
          </div>
        );
      })}
      {!isComplete && (
        <div className="text-gray-500 text-xs mt-1 text-center">
          {series.highSeedWins}-{series.lowSeedWins} {series.games.length > 0 ? `(Gm ${series.games.length})` : '(Not started)'}
        </div>
      )}
      {isComplete && (
        <div className="text-xs mt-1 text-center font-semibold" style={{ color: (high?.id === series.winner ? high?.color : low?.color) }}>
          FINAL: {series.highSeedWins}-{series.lowSeedWins}
        </div>
      )}
    </div>
  );
}

function SeriesDetailModal({ series, teams, onClose }) {
  const [expandedGame, setExpandedGame] = useState(null);
  if (!series) return null;
  const high = teams.find(t => t.id === series.highSeed?.teamId);
  const low  = teams.find(t => t.id === series.lowSeed?.teamId);

  // Series stats leaders
  const playerStats = {};
  for (const game of series.games) {
    for (const [pid, gs] of Object.entries(game.playerGameStats || {})) {
      if (!playerStats[pid]) playerStats[pid] = { ...gs };
      else {
        for (const k of Object.keys(gs)) playerStats[pid][k] = (playerStats[pid][k]||0) + (gs[k]||0);
      }
    }
  }

  const allPlayers = teams.flatMap(t => t.players);
  const seriesSkaters = Object.entries(playerStats)
    .map(([pid, s]) => { const p = allPlayers.find(pl => pl.id === pid); return p ? { ...p, ps: s, pts: (s.G||0)+(s.A||0) } : null; })
    .filter(Boolean)
    .filter(p => p.position !== 'G');
  const seriesGoalies = Object.entries(playerStats)
    .map(([pid, s]) => { const p = allPlayers.find(pl => pl.id === pid); return p ? { ...p, ps: s } : null; })
    .filter(p => p?.position === 'G');
  const topPts   = _.orderBy(seriesSkaters, 'pts', 'desc').slice(0,5);
  const topGoals = _.orderBy(seriesSkaters, p => p.ps.G||0, 'desc').slice(0,3);
  const topGoalie = _.orderBy(seriesGoalies, g => g.ps.SA > 0 ? g.ps.SV/g.ps.SA : 0, 'desc').slice(0,2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <h2 className="text-white text-lg font-bold">{high?.name} vs {low?.name}</h2>
            <div className="text-gray-400 text-sm">{series.round === 'finals' ? 'Championship Final' : 'Semifinal'} — Series {series.highSeedWins}-{series.lowSeedWins}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>
        <div className="p-4 space-y-4">
          {/* Game-by-game results */}
          <div>
            <h3 className="text-gray-300 text-sm font-bold uppercase mb-2">Game Results</h3>
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-800 text-gray-400"><th className="px-2 py-1">Gm</th><th className="px-2 py-1 text-left">Home</th><th className="px-2 py-1 text-left">Away</th><th className="px-2 py-1">Score</th><th className="px-2 py-1">OT?</th><th className="px-2 py-1">GWG</th></tr></thead>
              <tbody>
                {series.games.map(game => {
                  const homeT = teams.find(t => t.id === game.homeTeamId);
                  const awayT = teams.find(t => t.id === game.awayTeamId);
                  const homeWon = game.homeScore > game.awayScore;
                  const gwgEvent = (game.scoringEvents||[]).filter(e => e.team === (homeWon ? 'home' : 'away')).find((e, i, arr) => i === (homeWon ? game.awayScore : game.homeScore));
                  return (
                    <tr key={game.gameNumber} className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer" onClick={() => setExpandedGame(expandedGame === game.gameNumber ? null : game.gameNumber)}>
                      <td className="px-2 py-1 text-center text-gray-400">Gm {game.gameNumber}</td>
                      <td className="px-2 py-1"><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: homeT?.color}}/>{homeT?.abbr}</span></td>
                      <td className="px-2 py-1"><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: awayT?.color}}/>{awayT?.abbr}</span></td>
                      <td className="px-2 py-1 text-center font-bold text-white">{game.homeScore}-{game.awayScore}</td>
                      <td className="px-2 py-1 text-center text-yellow-400">{game.overtime ? `OT${game.otPeriods > 1 ? game.otPeriods : ''}` : ''}</td>
                      <td className="px-2 py-1 text-gray-300">{gwgEvent ? gwgEvent.scorer : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Expanded game scoring summary */}
            {expandedGame && (() => {
              const game = series.games.find(g => g.gameNumber === expandedGame);
              if (!game) return null;
              return (
                <div className="bg-gray-800 rounded p-3 mt-2 text-xs">
                  <div className="text-gray-300 font-bold mb-2">Game {expandedGame} — Scoring Summary</div>
                  {(game.scoringEvents||[]).map((ev, i) => {
                    const t = teams.find(t => t.id === (ev.team === 'home' ? game.homeTeamId : game.awayTeamId));
                    return (
                      <div key={i} className="flex gap-2 items-center py-1 border-b border-gray-700">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: t?.color}} />
                        <span className="text-gray-400 w-12">P{ev.period} {ev.time}</span>
                        <span className={`w-6 text-center rounded px-1 ${ev.strength==='PP'?'bg-yellow-800 text-yellow-300':ev.strength==='SH'?'bg-red-900 text-red-300':'text-gray-500'}`}>{ev.strength}</span>
                        <span className="text-white font-semibold">{ev.scorer}</span>
                        {ev.a1 && <span className="text-gray-400">({ev.a1}{ev.a2 ? `, ${ev.a2}` : ''})</span>}
                        <span className="text-gray-500 ml-auto">{ev.homeScore}-{ev.awayScore}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Series leaders */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800 rounded p-2">
              <div className="text-gray-400 text-xs font-bold mb-1">Points Leaders</div>
              {topPts.map((p,i) => <div key={p.id} className="flex justify-between text-xs py-0.5"><span className="text-gray-300">{i+1}. {p.firstName[0]}. {p.lastName}</span><span className="text-white font-bold">{p.pts}P</span></div>)}
            </div>
            <div className="bg-gray-800 rounded p-2">
              <div className="text-gray-400 text-xs font-bold mb-1">Goals Leaders</div>
              {topGoals.map((p,i) => <div key={p.id} className="flex justify-between text-xs py-0.5"><span className="text-gray-300">{i+1}. {p.firstName[0]}. {p.lastName}</span><span className="text-white font-bold">{p.ps.G}G</span></div>)}
            </div>
            <div className="bg-gray-800 rounded p-2">
              <div className="text-gray-400 text-xs font-bold mb-1">Goalie Saves</div>
              {topGoalie.map((g,i) => <div key={g.id} className="flex justify-between text-xs py-0.5"><span className="text-gray-300">{i+1}. {g.firstName[0]}. {g.lastName}</span><span className="text-white font-bold">{fmtSVPct(g.ps.SV||0, g.ps.SA||0)}</span></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayoffView({ leagueState, onSimNextGame, onSimSeries, onSimAll, onStartPlayoffs, onReturnToDash }) {
  const { teams, playoffs, seasonSimulated, seasonPhase, awards } = leagueState;
  const [selectedSeries, setSelectedSeries] = useState(null);

  if (!seasonSimulated) {
    return <div className="p-8 text-center text-gray-400">Complete a regular season first to unlock the playoffs.</div>;
  }

  if (seasonPhase === 'postRegularSeason' || seasonPhase === 'awards') {
    return (
      <div className="p-8 text-center">
        <div className="text-white text-xl font-bold mb-4">Regular Season Complete!</div>
        <p className="text-gray-400 mb-6">Awards ceremony is ready. Start the playoffs after the ceremony.</p>
        <button onClick={onStartPlayoffs} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl text-lg transition">
          🏆 Begin Playoffs
        </button>
      </div>
    );
  }

  if (!playoffs?.active) {
    return (
      <div className="p-8 text-center">
        <button onClick={onStartPlayoffs} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl text-lg transition">
          🏒 Start Playoffs
        </button>
      </div>
    );
  }

  const standings = getStandings(teams);
  const eliminated = standings.slice(4);
  const activeSeries = playoffs.series.filter(s => s.status === 'active' && s.highSeed);
  const pendingSeries = playoffs.series.filter(s => s.status === 'pending');
  const completedSeries = playoffs.series.filter(s => s.status === 'complete');

  // Build bracket layout
  const sf1 = playoffs.series.find(s => s.id === 'sf1');
  const sf2 = playoffs.series.find(s => s.id === 'sf2');
  const fin = playoffs.series.find(s => s.id === 'final');

  return (
    <div className="p-4">
      <h2 className="text-white text-xl font-bold mb-4">Playoff Bracket</h2>

      {/* Bracket */}
      <div className="flex flex-wrap gap-6 items-start mb-6">
        <div className="space-y-4">
          <div className="text-gray-400 text-xs uppercase font-bold mb-2">Semifinals</div>
          <SeriesBox series={sf1} teams={teams} onClick={setSelectedSeries} />
          <SeriesBox series={sf2} teams={teams} onClick={setSelectedSeries} />
        </div>
        <div className="flex items-center self-center">
          <div className="text-gray-600 text-2xl px-2">→</div>
        </div>
        <div>
          <div className="text-gray-400 text-xs uppercase font-bold mb-2">Championship Final</div>
          <SeriesBox series={fin} teams={teams} onClick={setSelectedSeries} />
          {playoffs.champion && (
            <div className="mt-4 bg-yellow-900 border border-yellow-600 rounded-lg p-3 text-center">
              <div className="text-yellow-400 text-lg font-bold">🏆 CHAMPIONS 🏆</div>
              <div className="text-white font-bold text-xl">{teams.find(t => t.id === playoffs.champion)?.name}</div>
              {awards?.playoffs?.connSmythe?.winner && (
                <div className="text-yellow-300 text-xs mt-1">Conn Smythe: {awards.playoffs.connSmythe.winner.firstName} {awards.playoffs.connSmythe.winner.lastName}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Eliminated teams */}
      {eliminated.length > 0 && (
        <div className="text-gray-600 text-xs mb-4">
          Eliminated: {eliminated.map(t => t.name).join(', ')}
        </div>
      )}

      {/* Control buttons */}
      {!playoffs.champion && (
        <div className="flex flex-wrap gap-3 mb-4">
          <button onClick={onSimNextGame} className="bg-green-700 hover:bg-green-600 text-white text-sm font-bold py-2 px-4 rounded-lg transition">
            🏒 Sim Next Game
          </button>
          <button onClick={() => onSimSeries(activeSeries[0]?.id)} disabled={!activeSeries.length} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-bold py-2 px-4 rounded-lg transition">
            📺 Sim Current Series
          </button>
          <button onClick={onSimAll} className="bg-purple-700 hover:bg-purple-600 text-white text-sm font-bold py-2 px-4 rounded-lg transition">
            ⚡ Sim All Playoffs
          </button>
        </div>
      )}

      {playoffs.champion && (
        <button onClick={onReturnToDash} className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition">
          🏠 Return to Dashboard
        </button>
      )}

      {/* Playoff Stats */}
      {playoffs.active && <PlayoffStatsTable teams={teams} />}

      {selectedSeries && (
        <SeriesDetailModal
          series={selectedSeries}
          teams={teams}
          onClose={() => setSelectedSeries(null)}
        />
      )}
    </div>
  );
}

function PlayoffStatsTable({ teams }) {
  const [tab, setTab] = useState('skaters');
  const [sortKey, setSortKey] = useState('P');
  const [sortDir, setSortDir] = useState('desc');
  const [teamFilter, setTeamFilter] = useState('all');

  const allSkaters = useMemo(() => teams.flatMap(t => t.players.filter(p => p.position !== 'G' && (p.playoffStats?.GP||0) > 0).map(p => ({ ...p, teamAbbr: t.abbr, teamId: t.id }))), [teams]);
  const allGoalies = useMemo(() => teams.flatMap(t => t.players.filter(p => p.position === 'G' && (p.playoffStats?.GP||0) > 0).map(p => ({ ...p, teamAbbr: t.abbr, teamId: t.id }))), [teams]);

  const filteredSk = useMemo(() => {
    let sk = teamFilter === 'all' ? allSkaters : allSkaters.filter(p => p.teamId === teamFilter);
    const fn = sortKey === 'P' ? p => (p.playoffStats.G||0)+(p.playoffStats.A||0) : sortKey === 'G' ? p => p.playoffStats.G||0 : sortKey === 'A' ? p => p.playoffStats.A||0 : p => (p.playoffStats.G||0)+(p.playoffStats.A||0);
    return _.orderBy(sk, fn, sortDir);
  }, [allSkaters, sortKey, sortDir, teamFilter]);

  const filteredG = useMemo(() => {
    let g = teamFilter === 'all' ? allGoalies : allGoalies.filter(p => p.teamId === teamFilter);
    return _.orderBy(g, p => p.playoffStats.SA > 0 ? p.playoffStats.SV/p.playoffStats.SA : 0, 'desc');
  }, [allGoalies, teamFilter]);

  if (!allSkaters.length && !allGoalies.length) return <div className="text-gray-600 text-sm mt-4">No playoff games played yet.</div>;

  return (
    <div className="mt-6">
      <div className="flex gap-2 mb-3 flex-wrap">
        {['skaters','goalies'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded text-xs font-semibold capitalize ${tab===t?'bg-blue-600 text-white':'bg-gray-700 text-gray-300'}`}>{t}</button>
        ))}
        <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)} className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-xs">
          <option value="all">All Teams</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.abbr}</option>)}
        </select>
      </div>
      {tab === 'skaters' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-gray-800 text-gray-400">
              <th className="px-2 py-1 text-left">#</th><th className="px-2 py-1 text-left">Name</th><th className="px-2 py-1">Team</th>
              <th className="px-2 py-1">GP</th><th className="px-2 py-1">G</th><th className="px-2 py-1">A</th><th className="px-2 py-1">P</th><th className="px-2 py-1">+/-</th><th className="px-2 py-1">HIT</th><th className="px-2 py-1">SOG</th>
            </tr></thead>
            <tbody>
              {filteredSk.map((p, i) => {
                const ps = p.playoffStats;
                return (
                  <tr key={p.id} className={`border-b border-gray-800 ${i%2===0?'':'bg-gray-850'}`}>
                    <td className="px-2 py-1 text-gray-500">{i+1}</td>
                    <td className="px-2 py-1 text-white">{p.firstName} {p.lastName}</td>
                    <td className="px-2 py-1 text-center text-gray-400">{p.teamAbbr}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ps.GP}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ps.G}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ps.A}</td>
                    <td className="px-2 py-1 text-center font-bold text-white">{(ps.G||0)+(ps.A||0)}</td>
                    <td className="px-2 py-1 text-center">{getPlusMinus(ps.plusMinus||0)}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ps.HIT}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ps.SOG}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'goalies' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-gray-800 text-gray-400">
              <th className="px-2 py-1 text-left">Name</th><th className="px-2 py-1">Team</th>
              <th className="px-2 py-1">GP</th><th className="px-2 py-1">W</th><th className="px-2 py-1">L</th><th className="px-2 py-1">SV%</th><th className="px-2 py-1">GAA</th><th className="px-2 py-1">SO</th>
            </tr></thead>
            <tbody>
              {filteredG.map((p, i) => {
                const ps = p.playoffStats;
                return (
                  <tr key={p.id} className={`border-b border-gray-800 ${i%2===0?'':'bg-gray-850'}`}>
                    <td className="px-2 py-1 text-white">{p.firstName} {p.lastName}</td>
                    <td className="px-2 py-1 text-center text-gray-400">{p.teamAbbr}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ps.GP}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ps.W}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ps.L}</td>
                    <td className="px-2 py-1 text-center font-bold text-white">{fmtSVPct(ps.SV||0, ps.SA||0)}</td>
                    <td className="px-2 py-1 text-center text-white">{fmtGAA(ps.GA||0, ps.minutes||0)}</td>
                    <td className="px-2 py-1 text-center text-gray-300">{ps.SO}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Awards Ceremony View
const AWARD_DEFS = [
  { key: 'hart',          name: 'Hart Trophy',             icon: '🏆', desc: 'Most Valuable Player to his team' },
  { key: 'artRoss',       name: 'Art Ross Trophy',          icon: '🎯', desc: 'League scoring champion (most points)' },
  { key: 'rocketRichard', name: 'Rocket Richard Trophy',    icon: '🚀', desc: 'League goal-scoring champion' },
  { key: 'norris',        name: 'James Norris Trophy',      icon: '🛡️', desc: 'Best defenseman in the league' },
  { key: 'vezina',        name: 'Vezina Trophy',            icon: '🥅', desc: 'Best goaltender in the league' },
  { key: 'calder',        name: 'Calder Trophy',            icon: '⭐', desc: 'Best rookie (age 21 or under)' },
  { key: 'selke',         name: 'Frank J. Selke Trophy',    icon: '🔒', desc: 'Best defensive forward' },
  { key: 'ladyByng',      name: 'Lady Byng Trophy',         icon: '🕊️', desc: 'Most sportsmanlike skilled player' },
];

function AwardsCeremonyView({ awards, teams, onBeginPlayoffs }) {
  const [step, setStep] = useState(0);
  if (!awards) return <div className="p-8 text-center text-gray-400">No awards data available.</div>;

  const validAwards = AWARD_DEFS.filter(a => awards.regularSeason?.[a.key]);
  const currentAward = validAwards[step];
  const awardData = currentAward ? awards.regularSeason[currentAward.key] : null;

  function getPlayerTeam(player) {
    if (!player) return '';
    const t = teams.find(t => t.id === player.teamId);
    return t?.name || '';
  }

  function getPlayerStats(player) {
    if (!player) return '';
    if (player.position === 'G') {
      const ss = player.seasonStats;
      return `${ss.W}-${ss.L}-${ss.OTL} | SV%: ${fmtSVPct(ss.SV, ss.SA)} | GAA: ${fmtGAA(ss.GA, ss.minutes)} | SO: ${ss.SO}`;
    }
    const ss = player.seasonStats;
    const pts = (ss.G||0)+(ss.A||0);
    const pm = ss.plusMinus||0;
    return `${ss.G}G, ${ss.A}A, ${pts}PTS, ${pm >= 0 ? '+' : ''}${pm}`;
  }

  if (step >= validAwards.length) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="text-4xl mb-4">🏒</div>
        <h2 className="text-white text-2xl font-bold mb-4">Awards Complete!</h2>
        <p className="text-gray-400 mb-6">All regular season awards have been presented. Time for the playoffs!</p>
        <button onClick={onBeginPlayoffs} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl text-lg transition">
          Begin Playoffs →
        </button>
      </div>
    );
  }

  const winner = awardData?.winner;
  const finalists = awardData?.finalists || [];

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="text-gray-400 text-xs uppercase mb-2 text-center">Season Awards — {step + 1} of {validAwards.length}</div>
      <div className="bg-gray-800 border border-yellow-700 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">{currentAward.icon}</div>
        <h2 className="text-yellow-400 text-2xl font-bold mb-1">{currentAward.name}</h2>
        <p className="text-gray-400 text-sm mb-6">{currentAward.desc}</p>

        {/* Finalists */}
        <div className="space-y-2 mb-6">
          {finalists.slice(0).reverse().map((p, i) => {
            const isWinner = p.id === winner?.id;
            const rank = finalists.length - i;
            return (
              <div key={p.id} className={`rounded-lg p-3 border ${isWinner ? 'border-yellow-500 bg-yellow-900' : 'border-gray-700 bg-gray-700'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isWinner && <span className="text-yellow-400 text-xl">🏆</span>}
                    {!isWinner && <span className="text-gray-500 text-sm w-6">{rank}.</span>}
                    <div className="text-left">
                      <div className={`font-bold ${isWinner ? 'text-yellow-300 text-lg' : 'text-white'}`}>{p.firstName} {p.lastName}</div>
                      <div className="text-gray-400 text-xs">{getPlayerTeam(p)} — {p.position} — OVR {p.overall}</div>
                    </div>
                  </div>
                  <div className={`text-right text-xs ${isWinner ? 'text-yellow-200' : 'text-gray-400'}`}>{getPlayerStats(p)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between">
          <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0} className="bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white px-4 py-2 rounded-lg text-sm">
            ← Previous
          </button>
          <button onClick={() => setStep(s => s + 1)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-lg transition">
            {step < validAwards.length - 1 ? 'Next Award →' : 'Begin Playoffs →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Championship Celebration View
function ChampionshipView({ teams, playoffs, awards, onReturnToDash, onBeginOffseason }) {
  if (!playoffs?.champion) return null;
  const champion = teams.find(t => t.id === playoffs.champion);
  const connSmythe = awards?.playoffs?.connSmythe?.winner;
  const finalSeries = playoffs.series.find(s => s.id === 'final');
  const runnerUp = teams.find(t => t.id === (finalSeries?.winner === finalSeries?.highSeed?.teamId ? finalSeries?.lowSeed?.teamId : finalSeries?.highSeed?.teamId));

  return (
    <div className="min-h-screen" style={{ backgroundColor: champion?.darkColor || '#1a1a2e' }}>
      <div className="p-8 max-w-3xl mx-auto text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-white text-4xl font-bold mb-2 drop-shadow-lg">{champion?.name}</h1>
        <h2 className="text-yellow-400 text-2xl font-bold mb-6">ARE THE CHAMPIONS!</h2>
        {finalSeries && (
          <p className="text-white text-lg mb-8 opacity-80">
            Defeated the {runnerUp?.name} {Math.max(finalSeries.highSeedWins, finalSeries.lowSeedWins)} games to {Math.min(finalSeries.highSeedWins, finalSeries.lowSeedWins)}
          </p>
        )}

        {/* Conn Smythe */}
        {connSmythe && (
          <div className="bg-black bg-opacity-40 rounded-xl p-6 mb-8 text-center border border-yellow-600">
            <div className="text-3xl mb-2">🥇</div>
            <div className="text-yellow-400 font-bold uppercase text-sm mb-1">Conn Smythe Trophy — Playoff MVP</div>
            <div className="text-white text-2xl font-bold">{connSmythe.firstName} {connSmythe.lastName}</div>
            <div className="text-gray-300 text-sm">{teams.find(t => t.id === connSmythe.teamId)?.name} — {connSmythe.position} — OVR {connSmythe.overall}</div>
            {connSmythe.position === 'G' ? (
              <div className="text-yellow-200 text-sm mt-1">
                {connSmythe.playoffStats.GP} GP | {connSmythe.playoffStats.W}-{connSmythe.playoffStats.L} | {fmtSVPct(connSmythe.playoffStats.SV, connSmythe.playoffStats.SA)} SV% | {fmtGAA(connSmythe.playoffStats.GA, connSmythe.playoffStats.minutes)} GAA | {connSmythe.playoffStats.SO} SO
              </div>
            ) : (
              <div className="text-yellow-200 text-sm mt-1">
                {connSmythe.playoffStats.GP} GP | {connSmythe.playoffStats.G}G, {connSmythe.playoffStats.A}A, {(connSmythe.playoffStats.G||0)+(connSmythe.playoffStats.A||0)}PTS | {connSmythe.playoffStats.plusMinus >= 0 ? '+' : ''}{connSmythe.playoffStats.plusMinus}
              </div>
            )}
          </div>
        )}

        {/* Champion roster */}
        <div className="bg-black bg-opacity-30 rounded-xl p-4 mb-8 text-left">
          <div className="text-white font-bold text-sm uppercase mb-3">Championship Roster</div>
          <div className="grid grid-cols-2 gap-1">
            {_.orderBy(champion?.players.filter(p => !p.isExtra), [p => ['LW','C','RW','LD','RD','G'].indexOf(p.position), 'lineNumber']).map(p => {
              const ps = p.playoffStats;
              const pts = (ps?.G||0)+(ps?.A||0);
              return (
                <div key={p.id} className="flex justify-between items-center text-xs py-1 border-b border-white border-opacity-10">
                  <span className="text-white">{p.firstName} {p.lastName} <span className="text-yellow-400">({p.position})</span></span>
                  {p.position === 'G' ? (
                    <span className="text-gray-300">{ps.W}W {fmtSVPct(ps.SV||0, ps.SA||0)}</span>
                  ) : (
                    <span className="text-gray-300">{ps.G}G {ps.A}A = {pts}P</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={onReturnToDash} className="bg-white text-gray-900 font-bold py-3 px-8 rounded-xl text-lg hover:bg-yellow-300 transition">
            Dashboard
          </button>
          {onBeginOffseason && (
            <button onClick={onBeginOffseason} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl text-lg transition">
              Begin Offseason →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


// ============================================================
// INJURY REPORT VIEW
// ============================================================

function InjuryReportView({ teams }) {
  const [teamFilter, setTeamFilter] = useState('all');
  const [sortKey, setSortKey] = useState('gamesRemaining');

  const allInjured = useMemo(() => {
    return teams.flatMap(t =>
      t.players.filter(p => p.injury?.active).map(p => ({
        ...p, teamName: t.name, teamAbbr: t.abbr, teamId: t.id, teamColor: t.color
      }))
    );
  }, [teams]);

  const filtered = useMemo(() => {
    const base = teamFilter === 'all' ? allInjured : allInjured.filter(p => p.teamId === teamFilter);
    return _.orderBy(base, p => {
      if (sortKey === 'gamesRemaining') return p.injury.gamesRemaining;
      if (sortKey === 'severity') return ['minor','moderate','major','severe','season-ending'].indexOf(p.injury.severity);
      if (sortKey === 'team') return p.teamName;
      return p.injury.gamesRemaining;
    });
  }, [allInjured, teamFilter, sortKey]);

  const teamSummary = useMemo(() => {
    return teams.map(t => ({
      ...t,
      injured: t.players.filter(p => p.injury?.active).length,
      ir: (t.injuredReserve || []).length,
    })).filter(t => t.injured > 0);
  }, [teams]);

  function SeverityBadge({ sev }) {
    const colors = { minor: 'bg-yellow-800 text-yellow-300', moderate: 'bg-orange-800 text-orange-300', major: 'bg-red-800 text-red-300', severe: 'bg-red-900 text-red-200', 'season-ending': 'bg-purple-900 text-purple-200' };
    return <span className={`text-xs px-2 py-0.5 rounded font-semibold ${colors[sev] || 'bg-gray-700 text-gray-300'}`}>{sev}</span>;
  }

  return (
    <div className="p-4">
      <h2 className="text-white font-bold text-lg mb-4">🏥 League Injury Report</h2>

      {/* Team summary */}
      {teamSummary.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {teamSummary.map(t => (
            <div key={t.id} className="bg-gray-800 rounded px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-white font-semibold">{t.abbr}</span>
              </div>
              <div className="text-red-400">{t.injured} injured {t.ir > 0 ? `(${t.ir} IR)` : ''}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)} className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm">
          <option value="all">All Teams</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={sortKey} onChange={e => setSortKey(e.target.value)} className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm">
          <option value="gamesRemaining">Sort: Games Remaining</option>
          <option value="severity">Sort: Severity</option>
          <option value="team">Sort: Team</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-gray-500 text-sm p-8 text-center">No injuries to report. 🏒</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 text-gray-400">
                <th className="px-2 py-2 text-left">Player</th>
                <th className="px-2 py-2">Team</th>
                <th className="px-2 py-2">Pos</th>
                <th className="px-2 py-2 text-left">Injury</th>
                <th className="px-2 py-2">Severity</th>
                <th className="px-2 py-2">Rem.</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const pos = p.altPosition ? `${p.position}/${p.altPosition}` : p.position;
                const rem = p.injury.gamesRemaining;
                const isIR = p.injury.gamesTotal >= 5;
                const returning = rem <= 2;
                return (
                  <tr key={p.id} className={`border-b border-gray-800 ${i%2===0?'bg-gray-900':'bg-gray-850'} ${returning ? 'bg-opacity-80' : ''}`}>
                    <td className="px-2 py-2 text-white">
                      <span className="mr-1">🏥</span>{p.firstName} {p.lastName}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.teamColor }} />
                        {p.teamAbbr}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center text-gray-400">{pos}</td>
                    <td className="px-2 py-2 text-gray-300">{p.injury.type}</td>
                    <td className="px-2 py-2 text-center"><SeverityBadge sev={p.injury.severity} /></td>
                    <td className={`px-2 py-2 text-center font-bold ${returning ? 'text-green-400' : 'text-red-400'}`}>
                      {rem} {returning && '⚡'}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isIR ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
                        {isIR ? 'IR' : 'DTD'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// ============================================================


// ============================================================
// PHASE 6B — AI STRATEGY SELECTION
// ============================================================

function aiSelectStrategy(team) {
  const skaters = team.players.filter(p => p.position !== 'G' && !p.isExtra);
  if (!skaters.length) return 'balanced';

  let offScore = 0, defScore = 0, phyScore = 0, balScore = 0, totalWeight = 0;
  for (const p of skaters) {
    const w = getIceTimeWeight(p);
    const a = p.attributes;
    offScore += w * ((a.offensiveAwareness||50) + (a.speed||50) + (a.wristShotAccuracy||50) + (a.passing||50)) / (4*99);
    defScore += w * ((a.defensiveAwareness||50) + (a.stickChecking||50) + (a.shotBlocking||50) + (a.discipline||50)) / (4*99);
    phyScore += w * ((a.bodyChecking||50) + (a.strength||50) + (a.aggression||50) + (a.fightingSkill||50)) / (4*99);
    balScore += w * (p.overall/99);
    totalWeight += w;
  }
  if (!totalWeight) return 'balanced';
  offScore /= totalWeight; defScore /= totalWeight;
  phyScore /= totalWeight; balScore = (balScore/totalWeight) * 1.05;

  const scores = { offensive:offScore, defensive:defScore, physical:phyScore, balanced:balScore };
  return Object.entries(scores).sort((a,b) => b[1]-a[1])[0][0];
}

function aiSelectPPFormation(team) {
  const dmen = team.players.filter(p => ['LD','RD'].includes(p.position) && !p.isExtra);
  const centers = team.players.filter(p => p.position === 'C' && !p.isExtra);
  const bestD = _.maxBy(dmen, p => (p.attributes.slapShotAccuracy||50) + (p.attributes.passing||50));
  const bestC = _.maxBy(centers, p => (p.attributes.strength||50) + (p.attributes.passing||50));
  if (bestD && ((bestD.attributes.slapShotAccuracy||50) + (bestD.attributes.passing||50))/2 > 80) return 'umbrella';
  if (bestC && ((bestC.attributes.strength||50) + (bestC.attributes.passing||50))/2 > 78) return 'behind_the_net';
  return 'overload';
}

function aiSelectPKFormation(team) {
  const skaters = team.players.filter(p => p.position !== 'G' && !p.isExtra);
  if (!skaters.length) return 'diamond';
  const avgSpeed = _.meanBy(skaters, p => p.attributes.speed||50);
  const avgDef = _.meanBy(skaters, p => p.attributes.defensiveAwareness||50);
  if (avgSpeed > 78 && avgDef > 76) return 'aggressive';
  if (avgDef > 74) return 'box';
  return 'diamond';
}

function initAIStrategies(teams) {
  return teams.map((team, i) => {
    const fiveOnFive = i === 0 ? 'balanced' : aiSelectStrategy(team); // user team stays balanced on reset
    const ppFormation = aiSelectPPFormation(team);
    const pkFormation = aiSelectPKFormation(team);
    const ppUnits = autoGeneratePPUnits(team);
    const pkUnits = autoGeneratePKUnits(team);
    return {
      ...team,
      strategy: {
        fiveOnFive,
        pp: { formation: ppFormation, ...ppUnits, unit1TimeSplit: 0.60, aggression: 'normal' },
        pk: { formation: pkFormation, ...pkUnits, unit1TimeSplit: 0.55 },
      },
    };
  });
}

// Refresh PP/PK units at season start (roster may have changed)
function refreshTeamPPPK(team) {
  const ppUnits = autoGeneratePPUnits(team);
  const pkUnits = autoGeneratePKUnits(team);
  return {
    ...team,
    strategy: {
      ...team.strategy,
      pp: { ...(team.strategy?.pp || {}), ...ppUnits },
      pk: { ...(team.strategy?.pk || {}), ...pkUnits },
    },
  };
}

// ============================================================
// PHASE 2 — MULTI-SEASON PROGRESSION ENGINE
// ============================================================

// --- Potential Tiers ---
const POTENTIAL_TIERS = [
  { label: 'Franchise', min: 93, max: 99, weight: 2 },
  { label: 'Elite',     min: 87, max: 92, weight: 6 },
  { label: 'Top-6',     min: 83, max: 86, weight: 14 },
  { label: 'Top-9',     min: 79, max: 82, weight: 20 },
  { label: 'Bottom-6',  min: 74, max: 78, weight: 28 },
  { label: 'AHL',       min: 60, max: 73, weight: 30 },
];

function getPotentialLabel(potential) {
  for (const t of POTENTIAL_TIERS) {
    if (potential >= t.min && potential <= t.max) return t.label;
  }
  return potential >= 90 ? 'Franchise' : 'AHL';
}

function assignPotential(age, overall) {
  // Potential can't be lower than current overall; skews higher for younger players
  const tier = weightedRand(POTENTIAL_TIERS.map(t => [t.label, t.weight]));
  const t = POTENTIAL_TIERS.find(t => t.label === tier);
  const base = randInt(t.min, t.max);
  // Older players have potential closer to current overall
  if (age >= 30) return Math.max(overall, base - 10);
  if (age >= 27) return Math.max(overall, base - 5);
  return Math.max(overall, base);
}

function assignDevelopmentRate() {
  // 0.5=slow, 1.0=normal, 1.5=fast; normally distributed ~1.0
  const r = Math.random();
  if (r < 0.1) return 0.5 + Math.random() * 0.2;   // 10% slow
  if (r < 0.2) return 0.7 + Math.random() * 0.2;   // 10% below avg
  if (r < 0.7) return 0.9 + Math.random() * 0.2;   // 50% average
  if (r < 0.9) return 1.1 + Math.random() * 0.2;   // 20% above avg
  return 1.3 + Math.random() * 0.2;                 // 10% fast
}

// --- Development Algorithm ---
function developPlayer(player, seasonNumber) {
  if (player.retired) return player;
  const isGoalie = player.position === 'G';
  const age = player.age + 1; // aging for next season
  const { overall, potential, developmentRate } = player;

  let delta = 0;
  // Phase: growth (18-24), prime (25-29), decline (30+)
  if (age <= 24) {
    // Growth phase: room to potential matters
    const room = Math.max(0, potential - overall);
    delta = Math.round(room * 0.18 * developmentRate * (0.7 + Math.random() * 0.6));
    delta = Math.min(delta, 4); // cap +4 per season
  } else if (age <= 29) {
    // Prime: slight fluctuation
    delta = Math.round((Math.random() - 0.4) * 2 * developmentRate);
    delta = clamp(delta, -1, 2);
  } else if (age <= 33) {
    // Early decline
    delta = Math.round((Math.random() - 0.65) * 3);
    delta = clamp(delta, -3, 1);
  } else if (age <= 36) {
    // Decline
    delta = Math.round((Math.random() - 0.75) * 4);
    delta = clamp(delta, -4, 0);
  } else {
    // Sharp decline
    delta = Math.round((Math.random() - 0.85) * 5);
    delta = clamp(delta, -5, 0);
  }

  const newOverall = clamp(overall + delta, 40, 99);
  const newPeak = Math.max(player.peakOverall, newOverall);

  // Scale attributes proportionally
  const attrList = isGoalie ? [...GOALIE_SPECIFIC_ATTRS, ...GOALIE_SKATING_ATTRS] : SKATER_ATTRS;
  const newAttrs = { ...player.attributes };
  if (delta !== 0) {
    for (const attr of attrList) {
      const change = delta > 0 ? randInt(0, Math.min(delta, 2)) : randInt(Math.max(delta, -2), 0);
      newAttrs[attr] = clamp(newAttrs[attr] + change, 40, 99);
    }
  }

  return {
    ...player,
    age,
    overall: newOverall,
    attributes: newAttrs,
    peakOverall: newPeak,
    yearsInLeague: player.yearsInLeague + 1,
    isRookie: false,
  };
}

// --- Retirement System ---
function retirementProbability(player) {
  const { age, overall, peakOverall } = player;
  if (age < 33) return 0;
  const decline = Math.max(0, peakOverall - overall);
  let base = 0;
  if (age === 33) base = 0.02;
  else if (age === 34) base = 0.04;
  else if (age === 35) base = 0.08;
  else if (age === 36) base = 0.14;
  else if (age === 37) base = 0.22;
  else if (age === 38) base = 0.35;
  else if (age === 39) base = 0.50;
  else if (age === 40) base = 0.65;
  else base = 0.80;
  // Stars retire later
  const starBonus = overall >= 87 ? -0.10 : overall >= 82 ? -0.05 : 0;
  return clamp(base + decline * 0.005 + starBonus, 0, 0.95);
}

// --- Career stat accumulation helpers ---
function addStatObjects(a, b) {
  const result = { ...a };
  for (const k of Object.keys(b)) {
    if (typeof b[k] === 'number') result[k] = (result[k] || 0) + (b[k] || 0);
  }
  return result;
}

// --- Archive season for a player ---
function archivePlayerSeason(player, season, teamName, awards) {
  const seasonEntry = {
    season,
    teamName,
    age: player.age,
    overall: player.overall,
    stats: { ...player.seasonStats },
    playoffStats: { ...player.playoffStats },
    awards: awards.filter(a => a.playerId === player.id).map(a => a.name),
  };
  return {
    ...player,
    seasonHistory: [...(player.seasonHistory || []), seasonEntry],
    careerStats: addStatObjects(player.careerStats, player.seasonStats),
    careerPlayoffStats: addStatObjects(player.careerPlayoffStats, player.playoffStats),
    awardsWon: [...(player.awardsWon || []), ...seasonEntry.awards],
  };
}

// --- Run full offseason development pass ---
function runOffseasonDevelopment(teams, season) {
  return teams.map(team => ({
    ...team,
    players: team.players.map(p => {
      const developed = developPlayer(p, season);
      // Reset seasonal stats, keep career
      return {
        ...developed,
        seasonStats: makeEmptySeasonStats(p.position === 'G'),
        playoffStats: makeEmptySeasonStats(p.position === 'G'),
        gameLog: [],
        injury: null,
        rosterStatus: p.isExtra ? 'extra' : 'active',
        gamesPlayedSinceReturn: 0,
        goalieFatigue: 0,
      };
    }),
    seasonStats: { GP:0,W:0,L:0,OTL:0,GF:0,GA:0,PPG:0,PPO:0,PKG_against:0,PKO:0,SF:0,SA:0 },
    playoffStats: { GP:0,W:0,L:0,GF:0,GA:0,PPG:0,PPO:0,PKG_against:0,PKO:0 },
    injuredReserve: [],
    dayToDay: [],
  }));
}

// --- Archive season for all players ---
function archiveAllPlayerSeasons(teams, seasonNum, awards) {
  const allAwards = awards ? [
    ...Object.values(awards.regularSeason || {}).map(a => ({ playerId: a.winner?.id, name: a.name })),
    awards.playoffs?.connSmythe?.winner ? { playerId: awards.playoffs.connSmythe.winner.id, name: 'Conn Smythe' } : null,
  ].filter(Boolean) : [];

  return teams.map(team => ({
    ...team,
    players: team.players.map(p => archivePlayerSeason(p, seasonNum, team.name, allAwards)),
  }));
}

// --- Run retirements ---
function runRetirements(teams, freeAgents, seasonNum) {
  const retiredPlayers = [];
  const newTeams = teams.map(team => {
    const remaining = [];
    for (const p of team.players) {
      const prob = retirementProbability(p);
      if (Math.random() < prob) {
        retiredPlayers.push({ ...p, retired: true, retiredSeason: seasonNum, teamId: null });
      } else {
        remaining.push(p);
      }
    }
    return { ...team, players: remaining };
  });

  // FAs can also retire
  const remainingFAs = [];
  for (const p of freeAgents) {
    const prob = retirementProbability(p);
    if (Math.random() < prob) {
      retiredPlayers.push({ ...p, retired: true, retiredSeason: seasonNum, teamId: null });
    } else {
      remainingFAs.push(p);
    }
  }

  return { teams: newTeams, freeAgents: remainingFAs, retiredPlayers };
}

// --- Top season record tracking ---
function computeAllTimeRecords(history) {
  const records = {
    mostGoals: null, mostPoints: null, mostAssists: null,
    bestGoalieWins: null, bestSVPct: null,
    mostWins: null, mostGoalsTeam: null,
  };
  for (const season of history) {
    for (const player of season.playerSeasons || []) {
      const pts = (player.stats.G||0) + (player.stats.A||0);
      if (!records.mostGoals || (player.stats.G||0) > records.mostGoals.value) {
        records.mostGoals = { player, value: player.stats.G||0, season: season.season };
      }
      if (!records.mostPoints || pts > records.mostPoints.value) {
        records.mostPoints = { player, value: pts, season: season.season };
      }
      if (!records.mostAssists || (player.stats.A||0) > records.mostAssists.value) {
        records.mostAssists = { player, value: player.stats.A||0, season: season.season };
      }
      if (player.position === 'G') {
        const svPct = player.stats.SA > 0 ? player.stats.SV / player.stats.SA : 0;
        if (!records.bestSVPct || svPct > records.bestSVPct.value) {
          records.bestSVPct = { player, value: svPct, season: season.season };
        }
        if (!records.bestGoalieWins || (player.stats.W||0) > records.bestGoalieWins.value) {
          records.bestGoalieWins = { player, value: player.stats.W||0, season: season.season };
        }
      }
    }
    for (const team of season.teamStandings || []) {
      if (!records.mostWins || team.W > records.mostWins.value) {
        records.mostWins = { team, value: team.W, season: season.season };
      }
      if (!records.mostGoalsTeam || team.GF > records.mostGoalsTeam.value) {
        records.mostGoalsTeam = { team, value: team.GF, season: season.season };
      }
    }
  }
  return records;
}

// ============================================================
// ENTRY DRAFT ENGINE
// ============================================================

const SCOUTING_REPORT_TEMPLATES = [
  'High-end skill set, ready to contribute immediately.',
  'Raw talent with tremendous upside if developed properly.',
  'Smart positional player with strong two-way game.',
  'Physical specimen who needs to refine his skating.',
  'Elite speed and agility, shot needs work.',
  'Cerebral player with exceptional vision and passing.',
  'Hard-nosed competitor who plays bigger than his size.',
  'Boom-or-bust prospect; high ceiling, inconsistent.',
  'Safe pick, projects as a solid middle-six contributor.',
  'Undersized but explosive; makes up for it with compete level.',
];

function generateDraftProspect(round, pick, overallPick, season, usedNames) {
  // Prospects are 18-20 years old
  const age = 18 + Math.floor(Math.random() * 3);
  // Potential by round
  const potRange = round === 1 ? { min: 79, max: 99 } : round === 2 ? { min: 72, max: 88 } : { min: 60, max: 80 };
  const potential = randInt(potRange.min, potRange.max);
  // Current overall much lower than potential (raw prospect)
  const currentOvr = clamp(potential - randInt(8, 22), 45, 82);

  // Pick position (random)
  const pos = weightedRand([['LW',2],['C',3],['RW',2],['LD',2],['RD',2],['G',1]]);
  const isGoalie = pos === 'G';
  const role = pickRole(pos);
  const attrList = isGoalie ? [...GOALIE_SPECIFIC_ATTRS, ...GOALIE_SKATING_ATTRS] : SKATER_ATTRS;

  // Generate first/last name
  let firstName, lastName;
  let attempts = 0;
  do {
    firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    attempts++;
  } while (usedNames.has(`${firstName} ${lastName}`) && attempts < 20);
  usedNames.add(`${firstName} ${lastName}`);

  // Build attributes scaled to currentOvr
  const attributes = {};
  const tiers = ROLE_ATTR_TIERS[role] || { primary: [], secondary: [], tertiary: [] };
  for (const attr of attrList) {
    const tier = tiers.primary.includes(attr) ? 'primary' : tiers.secondary.includes(attr) ? 'secondary' : 'tertiary';
    const base = tier === 'primary' ? currentOvr + randInt(0, 8) : tier === 'secondary' ? currentOvr + randInt(-4, 4) : currentOvr + randInt(-12, 0);
    attributes[attr] = clamp(base + randInt(-3, 3), 40, 92);
  }

  // Scouting uncertainty — higher rounds have more hidden potential
  const hiddenBonus = round === 1 ? randInt(-3, 3) : round === 2 ? randInt(-5, 6) : randInt(-8, 10);
  const scoutedPotential = clamp(potential + hiddenBonus, 50, 99);
  const potAccuracy = Math.abs(hiddenBonus) <= 2 ? 'Accurate' : Math.abs(hiddenBonus) <= 5 ? 'Projected' : 'Unknown';

  const reportIdx = Math.floor(Math.random() * SCOUTING_REPORT_TEMPLATES.length);

  return {
    id: uuid(),
    firstName, lastName,
    age, position: pos, altPosition: null, role,
    overall: currentOvr,
    attributes,
    potential,
    scoutedPotential,
    potentialAccuracy: potAccuracy,
    scoutReport: SCOUTING_REPORT_TEMPLATES[reportIdx],
    peakOverall: currentOvr,
    developmentRate: assignDevelopmentRate() * 1.1, // prospects develop slightly faster
    yearsInLeague: 0,
    isRookie: true,
    retired: false,
    retiredSeason: null,
    awardsWon: [],
    careerStats: makeEmptySeasonStats(isGoalie),
    careerPlayoffStats: makeEmptySeasonStats(isGoalie),
    seasonHistory: [],
    draftedSeason: season,
    draftedRound: round,
    draftedPick: pick,
    draftedBy: null, // set when drafted
    seasonStats: makeEmptySeasonStats(isGoalie),
    playoffStats: makeEmptySeasonStats(isGoalie),
    gameLog: [],
    lineNumber: 4,
    isExtra: true,
    teamId: null,
    injury: null,
    rosterStatus: 'extra',
    gamesPlayedSinceReturn: 0,
    goalieFatigue: 0,
    // Draft metadata
    draftRound: round,
    draftPick: pick,
    overallPick,
    scouted: false,
    scoutingTokensSpent: 0,
    centralRank: overallPick + randInt(-3, 3), // slightly random vs actual rank
  };
}

function generateDraftClass(season, usedNames) {
  // 6 teams × 3 rounds = 18 picks
  const prospects = [];
  let overall = 1;
  for (let round = 1; round <= 3; round++) {
    for (let pick = 1; pick <= 6; pick++) {
      prospects.push(generateDraftProspect(round, pick, overall, season, usedNames));
      overall++;
    }
  }
  // Sort by central ranking (scouts' view)
  return _.orderBy(prospects, p => p.centralRank);
}

// Spending a scouting token on a prospect reveals their potential more accurately
function scoutProspect(prospect) {
  const newAccuracy = prospect.potentialAccuracy === 'Unknown' ? 'Projected' :
                      prospect.potentialAccuracy === 'Projected' ? 'Accurate' : 'Exact';
  const revealedPotential = newAccuracy === 'Exact' ? prospect.potential :
    prospect.potential + randInt(-2, 2);
  return {
    ...prospect,
    scouted: true,
    scoutingTokensSpent: (prospect.scoutingTokensSpent || 0) + 1,
    scoutedPotential: clamp(revealedPotential, 50, 99),
    potentialAccuracy: newAccuracy,
  };
}

// AI draft pick for non-user teams (picks best available by scoutedPotential)
function aiDraftPick(availableProspects) {
  if (!availableProspects.length) return null;
  return _.orderBy(availableProspects, p => p.scoutedPotential, 'desc')[0];
}

// Build draft order: snake draft based on reverse standings (worst team picks first)
function buildDraftOrder(teams, currentSeason) {
  const standings = getStandings(teams);
  // Reverse standings: worst team picks first
  const draftOrderTeams = [...standings].reverse();
  const picks = [];
  for (let round = 1; round <= 3; round++) {
    for (let i = 0; i < draftOrderTeams.length; i++) {
      picks.push({
        round,
        pick: i + 1,
        overallPick: (round - 1) * 6 + i + 1,
        teamId: draftOrderTeams[i].id,
        teamName: draftOrderTeams[i].name,
        isUserPick: draftOrderTeams[i].id === USER_TEAM_ID,
      });
    }
  }
  return picks;
}

// User team is always team index 0 (Northbrook Blizzard)
const USER_TEAM_ID = 'BLZ';

// ============================================================
// SEASON HISTORY HELPERS
// ============================================================

function buildSeasonRecord(teams, season, awards, champion) {
  const standings = getStandings(teams);
  const playerSeasons = teams.flatMap(team =>
    team.players.map(p => ({
      ...p,
      teamName: team.name,
      teamId: team.id,
    }))
  );

  return {
    season,
    champion: champion ? { teamId: champion.id, teamName: champion.name } : null,
    teamStandings: standings.map(t => ({ id: t.id, name: t.name, abbr: t.abbr, ...t.seasonStats })),
    playerSeasons,
    awards: awards || null,
    connSmythe: awards?.playoffs?.connSmythe?.winner || null,
  };
}


// ============================================================
// OFFSEASON WORKFLOW VIEW
// ============================================================

const OFFSEASON_STEPS = [
  { key: 'summary',          label: 'Season Summary',     icon: '📋' },
  { key: 'development',      label: 'Player Development', icon: '📈' },
  { key: 'retirements',      label: 'Retirements',        icon: '👴' },
  { key: 'draft',            label: 'Entry Draft',        icon: '🎓' },
  { key: 'freeAgency',       label: 'Free Agency',        icon: '✍️' },
  { key: 'rosterManagement', label: 'Roster Management',  icon: '📋' },
  { key: 'preseasonPreview', label: 'Preseason Preview',  icon: '🏒' },
];

function OffseasonWorkflowView({
  step, seasonNum, summary, developmentResults, retiredPlayers, draftState,
  teams, freeAgents, awards, champion,
  onAdvanceStep, onScoutProspect, onDraftPick, onSign, onRelease, onStartNewSeason,
}) {
  const stepIndex = OFFSEASON_STEPS.findIndex(s => s.key === step);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Step Progress Bar */}
      <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
        {OFFSEASON_STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div className={`flex flex-col items-center ${i <= stepIndex ? 'text-blue-400' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
                ${i < stepIndex ? 'bg-blue-600 border-blue-600 text-white' :
                  i === stepIndex ? 'bg-blue-900 border-blue-400 text-blue-300' :
                  'bg-gray-800 border-gray-700 text-gray-600'}`}>
                {i < stepIndex ? '✓' : s.icon}
              </div>
              <span className="text-xs mt-1 hidden sm:block">{s.label}</span>
            </div>
            {i < OFFSEASON_STEPS.length - 1 && (
              <div className={`h-0.5 w-6 sm:w-12 mx-1 ${i < stepIndex ? 'bg-blue-600' : 'bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 'summary' && (
        <OffseasonSummaryPanel seasonNum={seasonNum} summary={summary} awards={awards} champion={champion} teams={teams} onNext={onAdvanceStep} />
      )}
      {step === 'development' && (
        <DevelopmentResultsPanel results={developmentResults} onNext={onAdvanceStep} />
      )}
      {step === 'retirements' && (
        <RetirementsPanel retired={retiredPlayers} onNext={onAdvanceStep} />
      )}
      {step === 'draft' && (
        <DraftDayPanel draftState={draftState} teams={teams} onScout={onScoutProspect} onPick={onDraftPick} />
      )}
      {step === 'freeAgency' && (
        <OffseasonFAPanel teams={teams} freeAgents={freeAgents} onSign={onSign} onRelease={onRelease} onNext={onAdvanceStep} />
      )}
      {step === 'rosterManagement' && (
        <RosterManagementPanel teams={teams} onNext={onAdvanceStep} />
      )}
      {step === 'preseasonPreview' && (
        <PreseasonPreviewPanel teams={teams} seasonNum={seasonNum + 1} onStartSeason={onStartNewSeason} />
      )}
    </div>
  );
}

function OffseasonSummaryPanel({ seasonNum, summary, awards, champion, teams, onNext }) {
  const champTeam = champion ? teams.find(t => t.id === champion) : null;
  const topScorer = summary?.topScorer;
  const topGoals = summary?.topGoals;
  const topGoalie = summary?.topGoalie;
  return (
    <div className="space-y-4">
      <h2 className="text-white text-2xl font-bold text-center">Season {seasonNum} — Recap</h2>
      {champTeam && (
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: champTeam.darkColor }}>
          <div className="text-3xl mb-1">🏆</div>
          <div className="text-white text-xl font-bold">{champTeam.name}</div>
          <div className="text-yellow-400 font-semibold">Champions</div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {topScorer && (
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-gray-400 text-xs uppercase mb-1">Points Leader</div>
            <div className="text-white font-bold">{topScorer.firstName} {topScorer.lastName}</div>
            <div className="text-blue-300 text-sm">{(topScorer.seasonStats.G||0)+(topScorer.seasonStats.A||0)} PTS ({topScorer.seasonStats.G}G, {topScorer.seasonStats.A}A)</div>
          </div>
        )}
        {topGoals && (
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-gray-400 text-xs uppercase mb-1">Goals Leader</div>
            <div className="text-white font-bold">{topGoals.firstName} {topGoals.lastName}</div>
            <div className="text-blue-300 text-sm">{topGoals.seasonStats.G} G</div>
          </div>
        )}
        {topGoalie && (
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-gray-400 text-xs uppercase mb-1">Top Goalie</div>
            <div className="text-white font-bold">{topGoalie.firstName} {topGoalie.lastName}</div>
            <div className="text-blue-300 text-sm">{topGoalie.seasonStats.W}W — {fmtSVPct(topGoalie.seasonStats.SV||0, topGoalie.seasonStats.SA||0)} SV%</div>
          </div>
        )}
      </div>
      {awards?.regularSeason && (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-gray-400 text-xs uppercase mb-3">Award Winners</div>
          <div className="grid grid-cols-2 gap-2">
            {AWARD_DEFS.map(def => {
              const aw = awards.regularSeason[def.key];
              if (!aw?.winner) return null;
              return (
                <div key={def.key} className="flex items-center gap-2 text-sm">
                  <span>{def.icon}</span>
                  <div>
                    <span className="text-gray-400">{def.name}: </span>
                    <span className="text-white font-semibold">{aw.winner.firstName} {aw.winner.lastName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex justify-end">
        <button onClick={onNext} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-xl transition">
          Player Development →
        </button>
      </div>
    </div>
  );
}

function DevelopmentResultsPanel({ results, onNext }) {
  const [filter, setFilter] = useState('all');
  if (!results) return <div className="text-gray-400 p-8 text-center">No development data.</div>;
  const { improved, declined, unchanged } = results;
  const all = [...(improved||[]), ...(declined||[]), ...(unchanged||[])];
  const filtered = filter === 'improved' ? (improved||[]) : filter === 'declined' ? (declined||[]) : all;

  return (
    <div className="space-y-4">
      <h2 className="text-white text-2xl font-bold text-center">Player Development</h2>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-green-900 border border-green-700 rounded-xl p-3">
          <div className="text-green-300 text-2xl font-bold">{improved?.length || 0}</div>
          <div className="text-green-400 text-xs">Improved</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-3">
          <div className="text-gray-300 text-2xl font-bold">{unchanged?.length || 0}</div>
          <div className="text-gray-400 text-xs">Unchanged</div>
        </div>
        <div className="bg-red-900 border border-red-700 rounded-xl p-3">
          <div className="text-red-300 text-2xl font-bold">{declined?.length || 0}</div>
          <div className="text-red-400 text-xs">Declined</div>
        </div>
      </div>
      <div className="flex gap-2">
        {['all','improved','declined'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-sm capitalize ${filter===f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="overflow-y-auto max-h-72">
        <table className="w-full text-xs">
          <thead className="bg-gray-800 text-gray-400 sticky top-0">
            <tr>
              <th className="px-2 py-2 text-left">Player</th>
              <th className="px-2 py-2">Team</th>
              <th className="px-2 py-2">Age</th>
              <th className="px-2 py-2">Old OVR</th>
              <th className="px-2 py-2">New OVR</th>
              <th className="px-2 py-2">Change</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id || i} className={`border-b border-gray-800 ${i%2===0?'bg-gray-900':'bg-gray-850'}`}>
                <td className="px-2 py-1.5 text-white">{r.firstName} {r.lastName}</td>
                <td className="px-2 py-1.5 text-gray-400 text-center">{r.teamAbbr}</td>
                <td className="px-2 py-1.5 text-gray-400 text-center">{r.age}</td>
                <td className="px-2 py-1.5 text-center text-gray-300">{r.oldOvr}</td>
                <td className="px-2 py-1.5 text-center font-bold text-white">{r.newOvr}</td>
                <td className={`px-2 py-1.5 text-center font-bold ${r.delta > 0 ? 'text-green-400' : r.delta < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                  {r.delta > 0 ? '+' : ''}{r.delta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <button onClick={onNext} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-xl transition">
          Retirements →
        </button>
      </div>
    </div>
  );
}

function RetirementsPanel({ retired, onNext }) {
  return (
    <div className="space-y-4">
      <h2 className="text-white text-2xl font-bold text-center">Retirements</h2>
      {(!retired || retired.length === 0) ? (
        <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-gray-400">No players retired this offseason.</p>
        </div>
      ) : (
        <>
          <p className="text-gray-400 text-center text-sm">{retired.length} player{retired.length!==1?'s':''} hung up the skates.</p>
          <div className="overflow-y-auto max-h-80 space-y-2">
            {_.orderBy(retired, 'age', 'desc').map((p, i) => (
              <div key={p.id || i} className="bg-gray-800 rounded-xl p-3 border border-gray-700 flex justify-between items-center">
                <div>
                  <span className="text-white font-bold">{p.firstName} {p.lastName}</span>
                  <span className="text-gray-400 text-sm ml-2">— {p.position} — Age {p.age}</span>
                </div>
                <div className="text-right text-xs">
                  <div className="text-gray-300">OVR {p.overall} (Peak {p.peakOverall})</div>
                  <div className="text-gray-500">{p.yearsInLeague} seasons</div>
                  {p.awardsWon?.length > 0 && <div className="text-yellow-400">{p.awardsWon.length} award{p.awardsWon.length>1?'s':''}</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="flex justify-end">
        <button onClick={onNext} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-xl transition">
          Entry Draft →
        </button>
      </div>
    </div>
  );
}


// ============================================================
// DRAFT DAY PANEL
// ============================================================

function DraftDayPanel({ draftState, teams, onScout, onPick }) {
  const [selectedProspect, setSelectedProspect] = useState(null);
  if (!draftState) return null;

  const { prospects, picks, currentPickIndex, scoutingTokens, draftHistory, isComplete } = draftState;
  const availableProspects = prospects.filter(p => !draftHistory.some(d => d.prospectId === p.id));
  const currentPick = picks[currentPickIndex];
  const isUserPick = currentPick?.isUserPick && !isComplete;

  const potentialColor = (acc) => acc === 'Exact' ? 'text-green-400' : acc === 'Accurate' ? 'text-blue-400' : acc === 'Projected' ? 'text-yellow-400' : 'text-gray-400';

  if (isComplete) {
    return (
      <div className="space-y-4">
        <h2 className="text-white text-2xl font-bold text-center">Draft Complete!</h2>
        <div className="overflow-y-auto max-h-96 space-y-2">
          {draftHistory.map((pick, i) => {
            const prospect = [...prospects].find(p => p.id === pick.prospectId);
            const team = teams.find(t => t.id === pick.teamId);
            return (
              <div key={i} className={`bg-gray-800 rounded-lg p-3 border flex justify-between items-center
                ${pick.isUserPick ? 'border-blue-600' : 'border-gray-700'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs w-14">R{pick.round} P{pick.pick}</span>
                  <div>
                    <span className={`font-bold ${pick.isUserPick ? 'text-blue-300' : 'text-white'}`}>
                      {prospect?.firstName} {prospect?.lastName}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">({prospect?.position} — {prospect?.role})</span>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-gray-400">{team?.name}</div>
                  <div className="text-gray-300">OVR {prospect?.overall} | Pot ~{prospect?.scoutedPotential}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-bold">
          Entry Draft — Round {currentPick?.round}, Pick {currentPick?.pick}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-sm">🔬 Scouting Tokens: {scoutingTokens}</span>
        </div>
      </div>

      {/* Current pick header */}
      <div className={`rounded-xl p-3 border ${isUserPick ? 'bg-blue-900 border-blue-600' : 'bg-gray-800 border-gray-700'}`}>
        <div className="flex items-center justify-between">
          <div>
            <span className={`font-bold ${isUserPick ? 'text-blue-300' : 'text-white'}`}>
              {currentPick?.teamName}
            </span>
            {isUserPick && <span className="ml-2 text-yellow-400 text-sm">← YOUR PICK</span>}
          </div>
          <span className="text-gray-400 text-sm">Pick #{currentPick?.overallPick}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Prospects list */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="bg-gray-750 px-3 py-2 border-b border-gray-700 flex justify-between items-center">
            <span className="text-gray-300 text-sm font-semibold">Available Prospects ({availableProspects.length})</span>
          </div>
          <div className="overflow-y-auto max-h-80">
            {availableProspects.map((p, i) => (
              <div key={p.id}
                onClick={() => setSelectedProspect(p.id === selectedProspect ? null : p.id)}
                className={`px-3 py-2 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition
                  ${selectedProspect === p.id ? 'bg-gray-700 border-l-2 border-l-blue-500' : ''}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-white text-sm font-bold">{p.firstName} {p.lastName}</span>
                    <span className="text-gray-400 text-xs ml-2">{p.position} — {p.role.split(' ')[0]}</span>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-gray-300">OVR {p.overall}</div>
                    <div className={potentialColor(p.potentialAccuracy)}>Pot ~{p.scoutedPotential}</div>
                  </div>
                </div>
                {p.scouted && <div className="text-blue-400 text-xs mt-0.5 italic">"{p.scoutReport?.slice(0,50)}..."</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Selected prospect detail / action panel */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 min-h-40">
          {selectedProspect ? (() => {
            const p = availableProspects.find(pr => pr.id === selectedProspect);
            if (!p) return null;
            return (
              <div className="space-y-3">
                <div>
                  <div className="text-white font-bold text-lg">{p.firstName} {p.lastName}</div>
                  <div className="text-gray-400 text-sm">{p.position} — {p.role} — Age {p.age}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">Overall: </span><span className="text-white font-bold">{p.overall}</span></div>
                  <div><span className="text-gray-400">Potential: </span><span className={`font-bold ${potentialColor(p.potentialAccuracy)}`}>~{p.scoutedPotential} ({p.potentialAccuracy})</span></div>
                  <div><span className="text-gray-400">Scouts rank: </span><span className="text-gray-300">#{p.centralRank}</span></div>
                  <div><span className="text-gray-400">Dev rate: </span><span className="text-gray-300">{p.developmentRate >= 1.2 ? '⚡ Fast' : p.developmentRate >= 0.9 ? '→ Normal' : '🐢 Slow'}</span></div>
                </div>
                {p.scouted && <div className="text-blue-300 text-xs italic bg-gray-700 rounded-lg p-2">"{p.scoutReport}"</div>}
                <div className="flex gap-2 flex-wrap">
                  {isUserPick && scoutingTokens > 0 && p.potentialAccuracy !== 'Exact' && (
                    <button onClick={() => onScout(p.id)}
                      className="bg-yellow-700 hover:bg-yellow-600 text-white text-sm px-3 py-1.5 rounded-lg transition">
                      🔬 Scout (1 token)
                    </button>
                  )}
                  {isUserPick && (
                    <button onClick={() => onPick(p.id)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-4 py-1.5 rounded-lg transition">
                      Draft {p.firstName} {p.lastName}
                    </button>
                  )}
                  {!isUserPick && (
                    <button onClick={() => onPick(null)}
                      className="bg-gray-600 hover:bg-gray-500 text-white text-sm px-4 py-1.5 rounded-lg transition">
                      AI Pick →
                    </button>
                  )}
                </div>
              </div>
            );
          })() : (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-2xl mb-2">👆</div>
              <p className="text-sm">Select a prospect to view details</p>
              {!isUserPick && (
                <button onClick={() => onPick(null)} className="mt-4 bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition">
                  Advance (AI picks)
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Draft history */}
      {draftHistory.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
          <div className="text-gray-400 text-xs uppercase mb-2">Recent Picks</div>
          <div className="space-y-1">
            {[...draftHistory].reverse().slice(0, 5).map((pick, i) => {
              const prospect = prospects.find(p => p.id === pick.prospectId);
              const team = teams.find(t => t.id === pick.teamId);
              return (
                <div key={i} className={`text-xs flex justify-between ${pick.isUserPick ? 'text-blue-300' : 'text-gray-400'}`}>
                  <span>R{pick.round}P{pick.pick} — {team?.abbr}: {prospect?.firstName} {prospect?.lastName} ({prospect?.position})</span>
                  <span>OVR {prospect?.overall}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// OFFSEASON FREE AGENCY PANEL
// ============================================================

function OffseasonFAPanel({ teams, freeAgents, onSign, onRelease, onNext }) {
  const [selectedTeam, setSelectedTeam] = useState(USER_TEAM_ID);
  const [sortBy, setSortBy] = useState('overall');
  const team = teams.find(t => t.id === selectedTeam);
  const sortedFAs = _.orderBy(freeAgents, sortBy, 'desc');

  return (
    <div className="space-y-4">
      <h2 className="text-white text-2xl font-bold text-center">Offseason Free Agency</h2>
      <div className="flex items-center gap-3 flex-wrap">
        <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700">
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700">
          <option value="overall">Sort: Overall</option>
          <option value="potential">Sort: Potential</option>
          <option value="age">Sort: Age</option>
        </select>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Free agents */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="px-3 py-2 border-b border-gray-700 text-gray-300 text-sm font-semibold">
            Free Agents ({freeAgents.length})
          </div>
          <div className="overflow-y-auto max-h-72">
            {sortedFAs.slice(0, 40).map((p, i) => (
              <div key={p.id} className="px-3 py-2 border-b border-gray-700 flex justify-between items-center hover:bg-gray-700">
                <div>
                  <div className="text-white text-sm">{p.firstName} {p.lastName} <span className="text-gray-400">({p.position})</span></div>
                  <div className="text-gray-500 text-xs">Age {p.age} — OVR {p.overall} — Pot {p.potential}</div>
                </div>
                <button onClick={() => onSign(selectedTeam, p.id)}
                  className="bg-green-700 hover:bg-green-600 text-white text-xs px-2 py-1 rounded transition">
                  Sign
                </button>
              </div>
            ))}
            {freeAgents.length === 0 && <div className="text-gray-500 text-center py-6">No free agents available.</div>}
          </div>
        </div>

        {/* Team roster */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="px-3 py-2 border-b border-gray-700 text-gray-300 text-sm font-semibold">
            {team?.name} Roster ({team?.players.length}/23)
          </div>
          <div className="overflow-y-auto max-h-72">
            {_.orderBy(team?.players || [], ['lineNumber','position']).map((p, i) => (
              <div key={p.id} className="px-3 py-2 border-b border-gray-700 flex justify-between items-center hover:bg-gray-700">
                <div>
                  <div className="text-white text-sm">{p.firstName} {p.lastName} <span className="text-gray-400">({p.position})</span></div>
                  <div className="text-gray-500 text-xs">Age {p.age} — OVR {p.overall}</div>
                </div>
                <button onClick={() => onRelease(selectedTeam, p.id)}
                  className="bg-red-800 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition">
                  Release
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={onNext} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-xl transition">
          Roster Management →
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ROSTER MANAGEMENT PANEL
// ============================================================

function RosterManagementPanel({ teams, onNext }) {
  const [selectedTeam, setSelectedTeam] = useState(USER_TEAM_ID);
  const team = teams.find(t => t.id === selectedTeam);
  const playerCount = team?.players.length || 0;
  const hasIssues = playerCount < 20 || playerCount > 23;

  return (
    <div className="space-y-4">
      <h2 className="text-white text-2xl font-bold text-center">Roster Management</h2>
      <div className="flex items-center gap-3">
        <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700">
          {teams.map(t => {
            const cnt = t.players.length;
            const ok = cnt >= 20 && cnt <= 23;
            return <option key={t.id} value={t.id}>{t.name} ({cnt}/23) {ok ? '✓' : '⚠️'}</option>;
          })}
        </select>
        {hasIssues && <span className="text-yellow-400 text-sm">⚠️ Roster size issue</span>}
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="px-3 py-2 border-b border-gray-700 text-gray-300 text-sm font-semibold">
          {team?.name} — {playerCount} players
        </div>
        <div className="overflow-y-auto max-h-80">
          {_.orderBy(team?.players || [], ['position','lineNumber']).map((p, i) => (
            <div key={p.id} className="px-3 py-2 border-b border-gray-700 flex justify-between items-center">
              <div>
                <span className="text-white text-sm">{p.firstName} {p.lastName}</span>
                <span className="text-gray-400 text-sm ml-2">({p.position}) Line {p.lineNumber} {p.isExtra ? '• Extra' : ''}</span>
              </div>
              <div className="text-xs text-gray-400">
                OVR {p.overall} — Age {p.age} — Pot {p.potential}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={onNext} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-xl transition">
          Preseason Preview →
        </button>
      </div>
    </div>
  );
}

// ============================================================
// PRESEASON PREVIEW PANEL
// ============================================================

function PreseasonPreviewPanel({ teams, seasonNum, onStartSeason }) {
  const standings = getStandings(teams);
  return (
    <div className="space-y-4">
      <h2 className="text-white text-2xl font-bold text-center">Season {seasonNum} Preview</h2>
      <p className="text-gray-400 text-center text-sm">All rosters are set. Here are the preseason power rankings.</p>
      <div className="space-y-2">
        {standings.map((team, i) => {
          const avgOvr = Math.round(_.meanBy(team.players.filter(p => !p.isExtra), 'overall'));
          const topPlayer = _.maxBy(team.players, 'overall');
          return (
            <div key={team.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center gap-4">
              <div className="text-gray-400 text-lg font-bold w-6">{i+1}</div>
              <div className="w-3 h-8 rounded" style={{ backgroundColor: team.color }} />
              <div className="flex-1">
                <div className="text-white font-bold">{team.name}</div>
                <div className="text-gray-400 text-xs">Best: {topPlayer?.firstName} {topPlayer?.lastName} (OVR {topPlayer?.overall})</div>
              </div>
              <div className="text-right">
                <div className="text-blue-300 font-bold">{avgOvr}</div>
                <div className="text-gray-500 text-xs">Avg OVR</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center mt-6">
        <button onClick={onStartSeason}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl text-lg transition">
          🏒 Start Season {seasonNum}!
        </button>
      </div>
    </div>
  );
}


// ============================================================
// CAREER HISTORY VIEW
// ============================================================

function CareerHistoryView({ history, currentSeason, teams }) {
  const [tab, setTab] = useState('standings');
  const [selectedSeason, setSelectedSeason] = useState(history.seasons.length > 0 ? history.seasons[history.seasons.length - 1].season : null);

  const seasonData = history.seasons.find(s => s.season === selectedSeason);
  const records = computeAllTimeRecords(history.seasons);

  const allRetired = history.retiredPlayers || [];
  const allDraftHistory = history.draftHistory || [];

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-white text-2xl font-bold mb-4">History — Season {currentSeason}</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { key: 'standings', label: '🏆 Standings' },
          { key: 'records', label: '📊 Records' },
          { key: 'retired', label: '👴 Retired' },
          { key: 'draft', label: '🎓 Draft History' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition
              ${tab === t.key ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Season selector */}
      {(tab === 'standings') && history.seasons.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <label className="text-gray-400 text-sm">Season:</label>
          <select value={selectedSeason || ''} onChange={e => setSelectedSeason(Number(e.target.value))}
            className="bg-gray-800 text-white rounded-lg px-3 py-1.5 text-sm border border-gray-700">
            {history.seasons.map(s => (
              <option key={s.season} value={s.season}>Season {s.season}{s.champion ? ` — 🏆 ${s.champion.teamName}` : ''}</option>
            ))}
          </select>
        </div>
      )}

      {/* STANDINGS TAB */}
      {tab === 'standings' && (
        <div className="space-y-4">
          {history.seasons.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-500">
              No completed seasons yet. Simulate your first season to build history!
            </div>
          ) : seasonData ? (
            <>
              {seasonData.champion && (
                <div className="bg-yellow-900 border border-yellow-600 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-yellow-400 font-bold">Season {seasonData.season} Champions: {seasonData.champion.teamName}</div>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-800 text-gray-400">
                    <tr>
                      <th className="px-2 py-2 text-left">Team</th>
                      <th className="px-2 py-2">GP</th>
                      <th className="px-2 py-2">W</th>
                      <th className="px-2 py-2">L</th>
                      <th className="px-2 py-2">OTL</th>
                      <th className="px-2 py-2">PTS</th>
                      <th className="px-2 py-2">GF</th>
                      <th className="px-2 py-2">GA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {_.orderBy(seasonData.teamStandings, t => (t.W||0)*2+(t.OTL||0), 'desc').map((team, i) => (
                      <tr key={team.id} className={`border-b border-gray-800 ${i%2===0?'bg-gray-900':'bg-gray-850'}`}>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-2">
                            {seasonData.champion?.teamId === team.id && <span className="text-yellow-400">🏆</span>}
                            <span className="text-white font-semibold">{team.name}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-center text-gray-400">{team.GP}</td>
                        <td className="px-2 py-1.5 text-center text-white">{team.W}</td>
                        <td className="px-2 py-1.5 text-center text-gray-400">{team.L}</td>
                        <td className="px-2 py-1.5 text-center text-gray-400">{team.OTL}</td>
                        <td className="px-2 py-1.5 text-center font-bold text-blue-300">{(team.W||0)*2+(team.OTL||0)}</td>
                        <td className="px-2 py-1.5 text-center text-gray-300">{team.GF}</td>
                        <td className="px-2 py-1.5 text-center text-gray-300">{team.GA}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Season award winners */}
              {seasonData.awards?.regularSeason && (
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="text-gray-400 text-xs uppercase mb-3">Award Winners</div>
                  <div className="grid grid-cols-2 gap-2">
                    {AWARD_DEFS.map(def => {
                      const aw = seasonData.awards.regularSeason[def.key];
                      if (!aw?.winner) return null;
                      return (
                        <div key={def.key} className="flex items-center gap-2 text-xs">
                          <span>{def.icon}</span>
                          <span className="text-gray-400">{def.name}:</span>
                          <span className="text-white">{aw.winner.firstName} {aw.winner.lastName}</span>
                        </div>
                      );
                    })}
                    {seasonData.awards?.playoffs?.connSmythe?.winner && (
                      <div className="flex items-center gap-2 text-xs">
                        <span>🥇</span>
                        <span className="text-gray-400">Conn Smythe:</span>
                        <span className="text-white">{seasonData.awards.playoffs.connSmythe.winner.firstName} {seasonData.awards.playoffs.connSmythe.winner.lastName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500 text-center py-6">Select a season above.</div>
          )}
        </div>
      )}

      {/* RECORDS TAB */}
      {tab === 'records' && (
        <div className="space-y-3">
          {history.seasons.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-500">No history yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Most Points (Season)', rec: records.mostPoints, fmt: r => `${r.value} PTS` },
                { label: 'Most Goals (Season)', rec: records.mostGoals, fmt: r => `${r.value} G` },
                { label: 'Most Assists (Season)', rec: records.mostAssists, fmt: r => `${r.value} A` },
                { label: 'Most Goalie Wins', rec: records.bestGoalieWins, fmt: r => `${r.value} W` },
                { label: 'Best Save Pct', rec: records.bestSVPct, fmt: r => `.${Math.round(r.value*1000)}` },
                { label: 'Most Team Wins', rec: records.mostWins, fmt: r => `${r.value} W` },
                { label: 'Most Team Goals', rec: records.mostGoalsTeam, fmt: r => `${r.value} GF` },
              ].map(({ label, rec, fmt }) => (
                <div key={label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="text-gray-400 text-xs uppercase mb-1">{label}</div>
                  {rec ? (
                    <>
                      <div className="text-white font-bold">
                        {rec.player ? `${rec.player.firstName} ${rec.player.lastName}` : rec.team?.name}
                      </div>
                      <div className="text-blue-300 text-sm">{fmt(rec)} — Season {rec.season}</div>
                    </>
                  ) : <div className="text-gray-600 text-sm">No data yet</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RETIRED TAB */}
      {tab === 'retired' && (
        <div className="space-y-2">
          {allRetired.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-500">No retired players yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-800 text-gray-400">
                  <tr>
                    <th className="px-2 py-2 text-left">Player</th>
                    <th className="px-2 py-2">Pos</th>
                    <th className="px-2 py-2">Retired</th>
                    <th className="px-2 py-2">Age</th>
                    <th className="px-2 py-2">Peak</th>
                    <th className="px-2 py-2">Seasons</th>
                    <th className="px-2 py-2">Career G</th>
                    <th className="px-2 py-2">Career A</th>
                    <th className="px-2 py-2">Awards</th>
                  </tr>
                </thead>
                <tbody>
                  {_.orderBy(allRetired, 'peakOverall', 'desc').map((p, i) => (
                    <tr key={p.id || i} className={`border-b border-gray-800 ${i%2===0?'bg-gray-900':'bg-gray-850'}`}>
                      <td className="px-2 py-1.5 text-white font-semibold">{p.firstName} {p.lastName}</td>
                      <td className="px-2 py-1.5 text-center text-gray-400">{p.position}</td>
                      <td className="px-2 py-1.5 text-center text-gray-400">S{p.retiredSeason}</td>
                      <td className="px-2 py-1.5 text-center text-gray-400">{p.age}</td>
                      <td className="px-2 py-1.5 text-center text-blue-300 font-bold">{p.peakOverall}</td>
                      <td className="px-2 py-1.5 text-center text-gray-400">{p.yearsInLeague}</td>
                      <td className="px-2 py-1.5 text-center text-gray-300">{p.careerStats?.G || 0}</td>
                      <td className="px-2 py-1.5 text-center text-gray-300">{p.careerStats?.A || 0}</td>
                      <td className="px-2 py-1.5 text-center text-yellow-400">{p.awardsWon?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DRAFT HISTORY TAB */}
      {tab === 'draft' && (
        <div className="space-y-4">
          {allDraftHistory.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-500">No drafts completed yet.</div>
          ) : (
            allDraftHistory.map((draft, di) => (
              <div key={di} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="px-4 py-2 bg-gray-750 border-b border-gray-700 text-white font-semibold">
                  Season {draft.season} Draft
                </div>
                <div className="divide-y divide-gray-700">
                  {draft.picks.map((pick, i) => {
                    const team = teams.find(t => t.id === pick.teamId);
                    return (
                      <div key={i} className={`px-4 py-2 flex justify-between items-center text-sm
                        ${pick.isUserPick ? 'bg-blue-900 bg-opacity-30' : ''}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 text-xs w-12">R{pick.round}P{pick.pick}</span>
                          <div>
                            <span className={`font-bold ${pick.isUserPick ? 'text-blue-300' : 'text-white'}`}>
                              {pick.prospectName}
                            </span>
                            <span className="text-gray-400 text-xs ml-2">({pick.position} — {pick.role?.split(' ')[0]})</span>
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <div className="text-gray-400">{team?.name || pick.teamName}</div>
                          <div className="text-gray-300">OVR {pick.overall}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}



// ============================================================
// PHASE 6B — STRATEGY TAB UI
// ============================================================

function StrategyStatBar({ label, value, baseline=1.0 }) {
  const pct = Math.round((value - 1.0) * 100);
  const isPos = pct > 0;
  const isNeg = pct < 0;
  return (
    <div className="flex items-center justify-between text-xs py-0.5">
      <span className="text-gray-400 w-40">{label}</span>
      <span className={`font-bold w-16 text-right ${isPos ? 'text-green-400' : isNeg ? 'text-red-400' : 'text-gray-400'}`}>
        {isPos ? `▲ +${pct}%` : isNeg ? `▼ ${pct}%` : '— 0%'}
      </span>
    </div>
  );
}

function StrategyCard({ stratKey, selected, onSelect }) {
  const meta = STRATEGY_META[stratKey];
  const mods = STRATEGY_MODIFIERS[stratKey];
  const borderStyle = selected
    ? { border: `2px solid ${meta.color}`, boxShadow: `0 0 12px ${meta.color}40` }
    : {};
  return (
    <div onClick={() => onSelect(stratKey)}
      className={`cursor-pointer rounded-xl p-4 transition select-none
        ${selected ? 'bg-gray-800' : 'bg-gray-900 hover:bg-gray-800 border border-gray-700'}`}
      style={borderStyle}>
      <div className="text-2xl mb-1">{meta.icon}</div>
      <div className="text-white font-bold text-sm mb-1">{meta.label}</div>
      <div className="text-gray-400 text-xs mb-3 leading-tight">{meta.desc}</div>
      <StrategyStatBar label="Shot Generation" value={mods.shotGeneration} />
      <StrategyStatBar label="Shot Quality" value={mods.shotQuality} />
      <StrategyStatBar label="Def. Efficiency" value={mods.defensiveEfficiency} />
      <StrategyStatBar label="Hit Rate" value={mods.hitRate} />
      <StrategyStatBar label="Penalty Rate" value={mods.penaltyTakeRate} />
    </div>
  );
}

function RosterFitBar({ team, strategy }) {
  // Quick fit calculation (normalized)
  const skaters = team.players.filter(p => p.position !== 'G' && !p.isExtra);
  if (!skaters.length) return null;
  let fitSum = 0, wSum = 0;
  for (const p of skaters) {
    const w = getIceTimeWeight(p);
    const a = p.attributes;
    let fit = 0;
    if (strategy === 'offensive') fit = ((a.speed||50)*0.20 + (a.wristShotAccuracy||50)*0.15 + (a.slapShotAccuracy||50)*0.10 + (a.passing||50)*0.20 + (a.offensiveAwareness||50)*0.20 + (a.puckControl||50)*0.15) / 99;
    else if (strategy === 'defensive') fit = ((a.defensiveAwareness||50)*0.25 + (a.stickChecking||50)*0.20 + (a.shotBlocking||50)*0.15 + (a.bodyChecking||50)*0.10 + (a.discipline||50)*0.15 + (a.faceoffs||50)*0.15) / 99;
    else if (strategy === 'balanced') fit = p.overall / 99;
    else if (strategy === 'physical') fit = ((a.bodyChecking||50)*0.25 + (a.strength||50)*0.25 + (a.aggression||50)*0.20 + (a.fightingSkill||50)*0.10 + (a.durability||50)*0.10 + (a.balance||50)*0.10) / 99;
    fitSum += fit * w; wSum += w;
  }
  const normalizedFit = wSum ? fitSum / wSum : 0.5;
  const pct = Math.round(Math.min(100, Math.max(0, (normalizedFit / 0.75) * 100)));
  const label = pct >= 85 ? 'Excellent' : pct >= 70 ? 'Good' : pct >= 55 ? 'Average' : 'Poor';
  const color = pct >= 85 ? '#22c55e' : pct >= 70 ? '#86efac' : pct >= 55 ? '#fbbf24' : '#f87171';
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">Roster Fit</span>
        <span style={{ color }} className="font-bold">{pct}% ({label})</span>
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function PPUnitEditor({ team, unit, unitNum, formation, onChangePlayer }) {
  const [openSlot, setOpenSlot] = useState(null);
  const positions = ['lw','c','rw','ld','rd'];
  const ppEff = calculatePPEffectiveness(team, unit, formation);
  const effPct = Math.round((ppEff - 0.70) / (1.30 - 0.70) * 100);

  const allPPScored = _.orderBy(
    team.players.filter(p => p.position !== 'G' && !p.isExtra).map(p => ({ ...p, ppScore: Math.round(calculatePPScore(p)) })),
    'ppScore', 'desc'
  );

  function getPlayerById(id) { return team.players.find(p => p.id === id); }
  function isInOtherUnit(id) {
    if (!id) return false;
    const other = unitNum === 1 ? team.strategy?.pp?.unit2 : team.strategy?.pp?.unit1;
    return other && Object.values(other).includes(id);
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-white font-semibold text-sm">PP Unit {unitNum}</span>
        <span className="text-xs text-gray-400">Eff: <span className={`font-bold ${effPct >= 60 ? 'text-green-400' : effPct >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{effPct}/100</span></span>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-2">
        {positions.map(pos => {
          const pid = unit?.[pos];
          const player = pid ? getPlayerById(pid) : null;
          const isOpen = openSlot === pos;
          return (
            <div key={pos} className="relative">
              <div onClick={() => setOpenSlot(isOpen ? null : pos)}
                className={`rounded-lg p-2 text-center cursor-pointer border transition min-h-14
                  ${pid ? 'bg-gray-700 border-gray-600 hover:border-blue-400' : 'bg-gray-750 border-dashed border-gray-600 hover:border-gray-400'}`}>
                <div className="text-gray-500 text-xs uppercase mb-1">{pos.toUpperCase()}</div>
                {player ? (
                  <>
                    <div className="text-white text-xs font-bold leading-tight">{player.lastName}</div>
                    <div className="text-gray-400 text-xs">{player.position} {player.overall}</div>
                  </>
                ) : (
                  <div className="text-gray-600 text-xs">Empty</div>
                )}
              </div>
              {isOpen && (
                <div className="absolute z-20 top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-56 max-h-48 overflow-y-auto">
                  {allPPScored.map(p => {
                    const inOther = isInOtherUnit(p.id);
                    const inThis = unit && Object.entries(unit).some(([k,v]) => v === p.id && k !== pos);
                    return (
                      <div key={p.id}
                        onClick={() => { if (!inThis) { onChangePlayer(unitNum, pos, p.id); setOpenSlot(null); }}}
                        className={`px-3 py-2 text-xs flex justify-between items-center border-b border-gray-800
                          ${inThis ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700'}`}>
                        <div>
                          <span className={`font-bold ${unit?.[pos] === p.id ? 'text-blue-300' : 'text-white'}`}>{p.firstName[0]}. {p.lastName}</span>
                          <span className="text-gray-400 ml-1">({p.position})</span>
                          {inOther && <span className="text-yellow-500 ml-1 text-xs">[U{unitNum===1?2:1}]</span>}
                        </div>
                        <div className="text-right">
                          <div className="text-gray-300">{p.overall}</div>
                          <div className="text-blue-400">{p.ppScore}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PKUnitEditor({ team, unit, unitNum, formation, onChangePlayer }) {
  const [openSlot, setOpenSlot] = useState(null);
  const positions = ['f1','f2','ld','rd'];
  const pkEff = calculatePKEffectiveness(team, unit, formation);
  const effPct = Math.round((pkEff - 0.70) / (1.30 - 0.70) * 100);

  const allPKScored = _.orderBy(
    team.players.filter(p => p.position !== 'G' && !p.isExtra).map(p => ({ ...p, pkScore: Math.round(calculatePKScore(p)) })),
    'pkScore', 'desc'
  );

  function getPlayerById(id) { return team.players.find(p => p.id === id); }
  function isInOtherUnit(id) {
    if (!id) return false;
    const other = unitNum === 1 ? team.strategy?.pk?.unit2 : team.strategy?.pk?.unit1;
    return other && Object.values(other).includes(id);
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-white font-semibold text-sm">PK Unit {unitNum}</span>
        <span className="text-xs text-gray-400">Eff: <span className={`font-bold ${effPct >= 60 ? 'text-green-400' : effPct >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{effPct}/100</span></span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {positions.map(pos => {
          const pid = unit?.[pos];
          const player = pid ? getPlayerById(pid) : null;
          const isOpen = openSlot === pos;
          return (
            <div key={pos} className="relative">
              <div onClick={() => setOpenSlot(isOpen ? null : pos)}
                className={`rounded-lg p-2 text-center cursor-pointer border transition min-h-14
                  ${pid ? 'bg-gray-700 border-gray-600 hover:border-blue-400' : 'bg-gray-750 border-dashed border-gray-600 hover:border-gray-400'}`}>
                <div className="text-gray-500 text-xs uppercase mb-1">{pos === 'f1' ? 'F1' : pos === 'f2' ? 'F2' : pos.toUpperCase()}</div>
                {player ? (
                  <>
                    <div className="text-white text-xs font-bold leading-tight">{player.lastName}</div>
                    <div className="text-gray-400 text-xs">{player.position} {player.overall}</div>
                  </>
                ) : (
                  <div className="text-gray-600 text-xs">Empty</div>
                )}
              </div>
              {isOpen && (
                <div className="absolute z-20 top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-56 max-h-48 overflow-y-auto">
                  {allPKScored.map(p => {
                    const inThis = unit && Object.entries(unit).some(([k,v]) => v === p.id && k !== pos);
                    const inOther = isInOtherUnit(p.id);
                    return (
                      <div key={p.id}
                        onClick={() => { if (!inThis) { onChangePlayer(unitNum, pos, p.id); setOpenSlot(null); }}}
                        className={`px-3 py-2 text-xs flex justify-between items-center border-b border-gray-800
                          ${inThis ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700'}`}>
                        <div>
                          <span className={`font-bold ${unit?.[pos] === p.id ? 'text-blue-300' : 'text-white'}`}>{p.firstName[0]}. {p.lastName}</span>
                          <span className="text-gray-400 ml-1">({p.position})</span>
                          {inOther && <span className="text-yellow-500 ml-1 text-xs">[U{unitNum===1?2:1}]</span>}
                        </div>
                        <div className="text-right">
                          <div className="text-gray-300">{p.overall}</div>
                          <div className="text-blue-400">{p.pkScore}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeSplitSlider({ value, onChange, label1, label2 }) {
  const pct1 = Math.round(value * 100);
  const pct2 = 100 - pct1;
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label1}: {pct1}%</span>
        <span>{label2}: {pct2}%</span>
      </div>
      <input type="range" min={50} max={80} step={5} value={pct1}
        onChange={e => onChange(Number(e.target.value) / 100)}
        className="w-full accent-blue-500" />
    </div>
  );
}

function StrategyTabView({ team, onUpdate }) {
  const strat = team.strategy || buildDefaultStrategy(team);
  const [section, setSection] = useState('5v5');

  function handleStrategyChange(newFiveOnFive) {
    onUpdate({ ...strat, fiveOnFive: newFiveOnFive });
  }

  function handlePPFormation(f) {
    onUpdate({ ...strat, pp: { ...strat.pp, formation: f } });
  }

  function handlePKFormation(f) {
    onUpdate({ ...strat, pk: { ...strat.pk, formation: f } });
  }

  function handlePPAggression(a) {
    onUpdate({ ...strat, pp: { ...strat.pp, aggression: a } });
  }

  function handlePPUnitChange(unitNum, pos, playerId) {
    const unitKey = `unit${unitNum}`;
    onUpdate({ ...strat, pp: { ...strat.pp, [unitKey]: { ...strat.pp[unitKey], [pos]: playerId } } });
  }

  function handlePKUnitChange(unitNum, pos, playerId) {
    const unitKey = `unit${unitNum}`;
    onUpdate({ ...strat, pk: { ...strat.pk, [unitKey]: { ...strat.pk[unitKey], [pos]: playerId } } });
  }

  function handleAutoGenerate() {
    const ppUnits = autoGeneratePPUnits(team);
    const pkUnits = autoGeneratePKUnits(team);
    onUpdate({ ...strat, pp: { ...strat.pp, ...ppUnits }, pk: { ...strat.pk, ...pkUnits } });
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold">{team.name} — Team Strategy</h2>
        <button onClick={handleAutoGenerate}
          className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition">
          🔄 Auto-Generate Units
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { key:'5v5', label:'5v5 Strategy' },
          { key:'pp', label:'Power Play' },
          { key:'pk', label:'Penalty Kill' },
        ].map(s => (
          <button key={s.key} onClick={() => setSection(s.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${section===s.key ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* 5v5 Section */}
      {section === '5v5' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.keys(STRATEGY_META).map(k => (
              <StrategyCard key={k} stratKey={k} selected={strat.fiveOnFive === k} onSelect={handleStrategyChange} />
            ))}
          </div>
          <RosterFitBar team={team} strategy={strat.fiveOnFive} />
        </div>
      )}

      {/* PP Section */}
      {section === 'pp' && (
        <div className="space-y-4">
          {/* Formation selector */}
          <div>
            <div className="text-gray-400 text-xs uppercase mb-2">PP Formation</div>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(PP_FORMATION_WEIGHTS).map(([key, fw]) => (
                <div key={key} onClick={() => handlePPFormation(key)}
                  className={`cursor-pointer rounded-xl p-3 border transition
                    ${strat.pp?.formation === key ? 'bg-blue-900 border-blue-500' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}>
                  <div className="text-white font-semibold text-sm mb-1">{fw.label}</div>
                  <div className="text-gray-400 text-xs">{fw.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PP Aggression */}
          <div>
            <div className="text-gray-400 text-xs uppercase mb-2">PP Aggression</div>
            <div className="flex gap-2">
              {['conservative','normal','aggressive'].map(a => (
                <button key={a} onClick={() => handlePPAggression(a)}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition
                    ${strat.pp?.aggression === a ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* PP Units */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <PPUnitEditor team={team} unit={strat.pp?.unit1} unitNum={1} formation={strat.pp?.formation || 'umbrella'} onChangePlayer={handlePPUnitChange} />
              <TimeSplitSlider
                value={strat.pp?.unit1TimeSplit || 0.60}
                onChange={v => onUpdate({ ...strat, pp: { ...strat.pp, unit1TimeSplit: v } })}
                label1="Unit 1" label2="Unit 2"
              />
            </div>
            <PPUnitEditor team={team} unit={strat.pp?.unit2} unitNum={2} formation={strat.pp?.formation || 'umbrella'} onChangePlayer={handlePPUnitChange} />
          </div>
        </div>
      )}

      {/* PK Section */}
      {section === 'pk' && (
        <div className="space-y-4">
          {/* Formation selector */}
          <div>
            <div className="text-gray-400 text-xs uppercase mb-2">PK Formation</div>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(PK_FORMATION_WEIGHTS).map(([key, fw]) => (
                <div key={key} onClick={() => handlePKFormation(key)}
                  className={`cursor-pointer rounded-xl p-3 border transition
                    ${strat.pk?.formation === key ? 'bg-blue-900 border-blue-500' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}>
                  <div className="text-white font-semibold text-sm mb-1">{fw.label}</div>
                  <div className="text-gray-400 text-xs">{fw.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PK Units */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <PKUnitEditor team={team} unit={strat.pk?.unit1} unitNum={1} formation={strat.pk?.formation || 'box'} onChangePlayer={handlePKUnitChange} />
              <TimeSplitSlider
                value={strat.pk?.unit1TimeSplit || 0.55}
                onChange={v => onUpdate({ ...strat, pk: { ...strat.pk, unit1TimeSplit: v } })}
                label1="Unit 1" label2="Unit 2"
              />
            </div>
            <PKUnitEditor team={team} unit={strat.pk?.unit2} unitNum={2} formation={strat.pk?.formation || 'box'} onChangePlayer={handlePKUnitChange} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── League Strategy Overview ────────────────────────────────────────────────

function LeagueStrategyView({ teams }) {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-white text-2xl font-bold mb-4">League Strategies</h2>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-750 text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-center">5v5</th>
              <th className="px-4 py-3 text-center">PP Formation</th>
              <th className="px-4 py-3 text-center">PP Aggr.</th>
              <th className="px-4 py-3 text-center">PK Formation</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, i) => {
              const s = team.strategy || {};
              const stratMeta = STRATEGY_META[s.fiveOnFive || 'balanced'];
              const ppFw = PP_FORMATION_WEIGHTS[s.pp?.formation || 'umbrella'];
              const pkFw = PK_FORMATION_WEIGHTS[s.pk?.formation || 'box'];
              return (
                <tr key={team.id} className={`border-t border-gray-700 ${i%2===0?'bg-gray-900':'bg-gray-850'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                      <span className="text-white font-medium">{team.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span style={{ color: stratMeta?.color }} className="font-bold">
                      {stratMeta?.icon} {stratMeta?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300 text-xs">{ppFw?.label || '—'}</td>
                  <td className="px-4 py-3 text-center text-gray-300 text-xs capitalize">{s.pp?.aggression || 'normal'}</td>
                  <td className="px-4 py-3 text-center text-gray-300 text-xs">{pkFw?.label || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP COMPONENT — PHASE 2 (MULTI-SEASON)
// ============================================================

export default function HockeySimGame() {
  const [leagueState, setLeagueState] = useState(() => {
    const { teams, freeAgents } = generateLeague();
    return {
      teams, freeAgents,
      currentView: 'dashboard',
      seasonSimulated: false,
      simming: false,
      seasonPhase: 'preseason',
      playoffs: null,
      awards: null,
      // Phase 2
      currentSeason: 1,
      history: { seasons: [], retiredPlayers: [], draftHistory: [] },
      offseasonStep: null,
      draftState: null,
      developmentResults: null,
      retiredThisOffseason: null,
      offseasonSummary: null,
    };
  });

  const {
    teams, freeAgents, currentView, seasonSimulated, simming,
    seasonPhase, playoffs, awards,
    currentSeason, history, offseasonStep, draftState,
    developmentResults, retiredThisOffseason, offseasonSummary,
  } = leagueState;

  const mgmtLocked = ['playoffsSemifinals','playoffsFinals','championship'].includes(seasonPhase);
  const inOffseason = offseasonStep !== null;

  function setView(v) {
    setLeagueState(prev => ({ ...prev, currentView: v }));
  }

  function handleRandomize() {
    if (!window.confirm('Reset ALL data including history? Continue?')) return;
    const { teams: rawTeams, freeAgents: newFAs } = generateLeague();
    const newTeams = initAIStrategies(rawTeams);
    setLeagueState({
      teams: newTeams, freeAgents: newFAs, currentView: 'dashboard',
      seasonSimulated: false, simming: false, seasonPhase: 'preseason',
      playoffs: null, awards: null, currentSeason: 1,
      history: { seasons: [], retiredPlayers: [], draftHistory: [] },
      offseasonStep: null, draftState: null, developmentResults: null,
      retiredThisOffseason: null, offseasonSummary: null,
    });
  }

  // --- Regular Season Simulation ---
  function handleSimSeason() {
    setLeagueState(prev => ({ ...prev, simming: true }));
    setTimeout(() => {
      const { teams: simmedTeams } = simulateSeason(teams);
      const newAwards = calculateAwards(simmedTeams);
      setLeagueState(prev => ({
        ...prev, teams: simmedTeams, seasonSimulated: true, simming: false,
        seasonPhase: 'postRegularSeason',
        awards: { regularSeason: newAwards, playoffs: { connSmythe: null } },
        currentView: 'awards',
      }));
    }, 100);
  }

  // --- Playoffs ---
  function handleBeginPlayoffs() {
    const newPlayoffs = initPlayoffs(teams);
    setLeagueState(prev => ({
      ...prev, playoffs: newPlayoffs, seasonPhase: 'playoffsSemifinals', currentView: 'playoffs'
    }));
  }

  function advancePlayoffs(currentPlayoffs, currentTeams) {
    let pl = { ...currentPlayoffs, series: currentPlayoffs.series.map(s => ({ ...s, games: [...s.games] })) };
    let updatedTeams = currentTeams.map(t => ({ ...t, players: t.players.map(p => ({ ...p, playoffStats: { ...p.playoffStats } })), playoffStats: { ...t.playoffStats } }));
    const activeSf = pl.series.filter(s => s.status === 'active' && s.round === 'semifinals' && s.highSeed);
    const activeFin = pl.series.filter(s => s.status === 'active' && s.round === 'finals' && s.highSeed);
    const active = [...activeSf, ...activeFin];
    if (!active.length) return { pl, updatedTeams };
    for (const ser of active) {
      const { series: newSer, gameResult } = simSeriesGame(ser, updatedTeams);
      pl.series = pl.series.map(s => s.id === ser.id ? newSer : s);
      if (gameResult) accumulatePlayoffStats(updatedTeams, gameResult);
      break;
    }
    const sf1 = pl.series.find(s => s.id === 'sf1');
    const sf2 = pl.series.find(s => s.id === 'sf2');
    const fin = pl.series.find(s => s.id === 'final');
    if (sf1?.status === 'complete' && sf2?.status === 'complete' && fin?.status === 'pending') {
      const st = getStandings(updatedTeams);
      const sf1Seed = st.findIndex(t => t.id === sf1.winner) + 1;
      const sf2Seed = st.findIndex(t => t.id === sf2.winner) + 1;
      const [high, low] = sf1Seed <= sf2Seed ? [updatedTeams.find(t => t.id === sf1.winner), updatedTeams.find(t => t.id === sf2.winner)] : [updatedTeams.find(t => t.id === sf2.winner), updatedTeams.find(t => t.id === sf1.winner)];
      const [highSeed, lowSeed] = sf1Seed <= sf2Seed ? [sf1Seed, sf2Seed] : [sf2Seed, sf1Seed];
      pl.series = pl.series.map(s => s.id === 'final' ? { ...s, highSeed: { teamId: high.id, teamName: high.name, seed: highSeed }, lowSeed: { teamId: low.id, teamName: low.name, seed: lowSeed }, status: 'active' } : s);
    }
    const finUpdated = pl.series.find(s => s.id === 'final');
    if (finUpdated?.status === 'complete' && finUpdated.winner && !pl.champion) {
      pl.champion = finUpdated.winner;
      pl.round = 'complete';
    }
    return { pl, updatedTeams };
  }

  function handleSimNextGame() {
    if (!playoffs) return;
    setLeagueState(prev => {
      const { pl, updatedTeams } = advancePlayoffs(prev.playoffs, prev.teams);
      const newPhase = pl.champion ? 'championship' : pl.series.some(s => s.round === 'finals' && s.status === 'active') ? 'playoffsFinals' : 'playoffsSemifinals';
      let newAwards = prev.awards;
      if (pl.champion && !newAwards?.playoffs?.connSmythe?.winner) {
        const cs = calculateConnSmythe(updatedTeams);
        newAwards = { ...newAwards, playoffs: { connSmythe: cs } };
      }
      return { ...prev, playoffs: pl, teams: updatedTeams, seasonPhase: newPhase, awards: newAwards, currentView: pl.champion ? 'championship' : 'playoffs' };
    });
  }

  function handleSimSeriesAll(seriesId) {
    setLeagueState(prev => {
      let pl = prev.playoffs;
      let updatedTeams = prev.teams.map(t => ({ ...t, players: t.players.map(p => ({ ...p, playoffStats: { ...p.playoffStats } })), playoffStats: { ...t.playoffStats } }));
      for (let i = 0; i < 7; i++) {
        const ser = pl.series.find(s => (seriesId ? s.id === seriesId : true) && s.status === 'active' && s.highSeed);
        if (!ser) break;
        const { series: newSer, gameResult } = simSeriesGame(ser, updatedTeams);
        pl = { ...pl, series: pl.series.map(s => s.id === ser.id ? newSer : s) };
        if (gameResult) accumulatePlayoffStats(updatedTeams, gameResult);
        if (newSer.status === 'complete') break;
      }
      const sf1 = pl.series.find(s => s.id === 'sf1');
      const sf2 = pl.series.find(s => s.id === 'sf2');
      const fin = pl.series.find(s => s.id === 'final');
      if (sf1?.status === 'complete' && sf2?.status === 'complete' && fin?.status === 'pending') {
        const st = getStandings(updatedTeams);
        const sf1Seed = st.findIndex(t => t.id === sf1.winner) + 1;
        const sf2Seed = st.findIndex(t => t.id === sf2.winner) + 1;
        const [hId, lId, hS, lS] = sf1Seed <= sf2Seed ? [sf1.winner, sf2.winner, sf1Seed, sf2Seed] : [sf2.winner, sf1.winner, sf2Seed, sf1Seed];
        const hT = updatedTeams.find(t => t.id === hId), lT = updatedTeams.find(t => t.id === lId);
        pl.series = pl.series.map(s => s.id === 'final' ? { ...s, highSeed: { teamId: hId, teamName: hT?.name, seed: hS }, lowSeed: { teamId: lId, teamName: lT?.name, seed: lS }, status: 'active' } : s);
      }
      if (pl.series.find(s => s.id === 'final')?.status === 'complete' && !pl.champion) {
        pl.champion = pl.series.find(s => s.id === 'final').winner;
        pl.round = 'complete';
      }
      const newPhase = pl.champion ? 'championship' : pl.series.some(s => s.round === 'finals' && s.status === 'active') ? 'playoffsFinals' : 'playoffsSemifinals';
      let newAwards = prev.awards;
      if (pl.champion && !newAwards?.playoffs?.connSmythe?.winner) {
        const cs = calculateConnSmythe(updatedTeams);
        newAwards = { ...newAwards, playoffs: { connSmythe: cs } };
      }
      return { ...prev, playoffs: pl, teams: updatedTeams, seasonPhase: newPhase, awards: newAwards, currentView: pl.champion ? 'championship' : 'playoffs' };
    });
  }

  function handleSimAllPlayoffs() {
    setLeagueState(prev => {
      let pl = { ...prev.playoffs, series: prev.playoffs.series.map(s => ({ ...s })) };
      let updatedTeams = prev.teams.map(t => ({ ...t, players: t.players.map(p => ({ ...p, playoffStats: { ...p.playoffStats } })), playoffStats: { ...t.playoffStats } }));
      for (let i = 0; i < 50 && !pl.champion; i++) {
        const ser = pl.series.find(s => s.status === 'active' && s.highSeed);
        if (!ser) {
          const sf1 = pl.series.find(s => s.id === 'sf1');
          const sf2 = pl.series.find(s => s.id === 'sf2');
          const fin = pl.series.find(s => s.id === 'final');
          if (sf1?.status === 'complete' && sf2?.status === 'complete' && fin?.status === 'pending') {
            const st = getStandings(updatedTeams);
            const sf1Seed = st.findIndex(t => t.id === sf1.winner) + 1;
            const sf2Seed = st.findIndex(t => t.id === sf2.winner) + 1;
            const [hId, lId, hS, lS] = sf1Seed <= sf2Seed ? [sf1.winner, sf2.winner, sf1Seed, sf2Seed] : [sf2.winner, sf1.winner, sf2Seed, sf1Seed];
            const hT = updatedTeams.find(t => t.id === hId), lT = updatedTeams.find(t => t.id === lId);
            pl.series = pl.series.map(s => s.id === 'final' ? { ...s, highSeed: { teamId: hId, teamName: hT?.name, seed: hS }, lowSeed: { teamId: lId, teamName: lT?.name, seed: lS }, status: 'active' } : s);
            continue;
          }
          break;
        }
        const { series: newSer, gameResult } = simSeriesGame(ser, updatedTeams);
        pl = { ...pl, series: pl.series.map(s => s.id === ser.id ? newSer : s) };
        if (gameResult) accumulatePlayoffStats(updatedTeams, gameResult);
        if (pl.series.find(s => s.id === 'final')?.status === 'complete' && !pl.champion) {
          pl.champion = pl.series.find(s => s.id === 'final').winner;
          pl.round = 'complete';
        }
      }
      let newAwards = prev.awards;
      if (pl.champion && !newAwards?.playoffs?.connSmythe?.winner) {
        const cs = calculateConnSmythe(updatedTeams);
        newAwards = { ...newAwards, playoffs: { connSmythe: cs } };
      }
      return { ...prev, playoffs: pl, teams: updatedTeams, seasonPhase: pl.champion ? 'championship' : 'playoffsFinals', awards: newAwards, currentView: pl.champion ? 'championship' : 'playoffs' };
    });
  }

  // --- Offseason Begin: triggered from Championship screen ---
  function handleBeginOffseason() {
    setLeagueState(prev => {
      const { teams: archTeams } = { teams: archiveAllPlayerSeasons(prev.teams, prev.currentSeason, prev.awards) };
      const champion = prev.playoffs?.champion ? prev.teams.find(t => t.id === prev.playoffs.champion) : null;

      // Build season summary
      const allSkaters = archTeams.flatMap(t => t.players.filter(p => p.position !== 'G'));
      const allGoalies = archTeams.flatMap(t => t.players.filter(p => p.position === 'G'));
      const topScorer = _.maxBy(allSkaters, p => (p.seasonStats.G||0) + (p.seasonStats.A||0));
      const topGoals = _.maxBy(allSkaters, p => p.seasonStats.G||0);
      const topGoalie = _.maxBy(allGoalies, p => p.seasonStats.W||0);

      const seasonRecord = buildSeasonRecord(prev.teams, prev.currentSeason, prev.awards, champion);
      const newHistory = {
        ...prev.history,
        seasons: [...prev.history.seasons, seasonRecord],
      };

      return {
        ...prev,
        teams: archTeams,
        history: newHistory,
        seasonPhase: 'offseason',
        currentView: 'offseason',
        offseasonStep: 'summary',
        offseasonSummary: { topScorer, topGoals, topGoalie, champion: prev.playoffs?.champion },
      };
    });
  }

  function handleReturnToDash() {
    setLeagueState(prev => ({ ...prev, currentView: 'dashboard', seasonPhase: 'offseason' }));
  }

  // --- Offseason Step Advancement ---
  function handleAdvanceOffseasonStep() {
    setLeagueState(prev => {
      const currentIdx = OFFSEASON_STEPS.findIndex(s => s.key === prev.offseasonStep);
      const nextStep = OFFSEASON_STEPS[currentIdx + 1];

      if (!nextStep) return prev; // shouldn't happen

      // When advancing TO development step, run the development
      if (nextStep.key === 'development') {
        const beforeTeams = prev.teams;
        const afterTeams = runOffseasonDevelopment(prev.teams, prev.currentSeason);
        // Compute development deltas
        const improved = [], declined = [], unchanged = [];
        for (const team of afterTeams) {
          for (const newP of team.players) {
            const oldP = beforeTeams.flatMap(t => t.players).find(p => p.id === newP.id);
            if (!oldP) continue;
            const delta = newP.overall - oldP.overall;
            const entry = { ...newP, oldOvr: oldP.overall, newOvr: newP.overall, delta, teamAbbr: team.abbr };
            if (delta > 0) improved.push(entry);
            else if (delta < 0) declined.push(entry);
            else unchanged.push(entry);
          }
        }
        return { ...prev, teams: afterTeams, offseasonStep: 'development', developmentResults: { improved, declined, unchanged } };
      }

      // When advancing TO retirements step
      if (nextStep.key === 'retirements') {
        const { teams: teamsAfterRet, freeAgents: fasAfterRet, retiredPlayers } = runRetirements(prev.teams, prev.freeAgents, prev.currentSeason);
        const updatedHistory = {
          ...prev.history,
          retiredPlayers: [...prev.history.retiredPlayers, ...retiredPlayers],
        };
        return { ...prev, teams: teamsAfterRet, freeAgents: fasAfterRet, history: updatedHistory, offseasonStep: 'retirements', retiredThisOffseason: retiredPlayers };
      }

      // When advancing TO draft step
      if (nextStep.key === 'draft') {
        const usedNames = new Set(
          [...prev.teams.flatMap(t => t.players), ...prev.freeAgents].map(p => `${p.firstName} ${p.lastName}`)
        );
        const prospects = generateDraftClass(prev.currentSeason, usedNames);
        const picks = buildDraftOrder(prev.teams, prev.currentSeason);
        return {
          ...prev, offseasonStep: 'draft',
          draftState: {
            prospects,
            picks,
            currentPickIndex: 0,
            scoutingTokens: 3,
            draftHistory: [],
            isComplete: false,
          },
        };
      }

      return { ...prev, offseasonStep: nextStep.key };
    });
  }

  // --- Draft Actions ---
  function handleScoutProspect(prospectId) {
    setLeagueState(prev => {
      if (!prev.draftState || prev.draftState.scoutingTokens <= 0) return prev;
      const updatedProspects = prev.draftState.prospects.map(p =>
        p.id === prospectId ? scoutProspect(p) : p
      );
      return {
        ...prev,
        draftState: { ...prev.draftState, prospects: updatedProspects, scoutingTokens: prev.draftState.scoutingTokens - 1 },
      };
    });
  }

  function handleDraftPick(prospectId) {
    setLeagueState(prev => {
      if (!prev.draftState) return prev;
      const { draftState, teams } = prev;
      const currentPick = draftState.picks[draftState.currentPickIndex];
      if (!currentPick) return prev;

      const available = draftState.prospects.filter(p => !draftState.draftHistory.some(d => d.prospectId === p.id));

      // Determine which prospect is picked
      let pickedProspect;
      if (currentPick.isUserPick && prospectId) {
        pickedProspect = available.find(p => p.id === prospectId);
      } else {
        // AI pick
        pickedProspect = aiDraftPick(available);
      }
      if (!pickedProspect) return prev;

      const pickRecord = {
        round: currentPick.round,
        pick: currentPick.pick,
        overallPick: currentPick.overallPick,
        teamId: currentPick.teamId,
        teamName: currentPick.teamName,
        prospectId: pickedProspect.id,
        prospectName: `${pickedProspect.firstName} ${pickedProspect.lastName}`,
        position: pickedProspect.position,
        role: pickedProspect.role,
        overall: pickedProspect.overall,
        potential: pickedProspect.potential,
        isUserPick: currentPick.isUserPick,
      };

      // Add prospect to team
      const draftedProspect = { ...pickedProspect, teamId: currentPick.teamId, draftedBy: currentPick.teamId, isExtra: true, lineNumber: 4, rosterStatus: 'extra' };
      const newTeams = teams.map(t => t.id === currentPick.teamId ? { ...t, players: [...t.players, draftedProspect] } : t);

      const newDraftHistory = [...draftState.draftHistory, pickRecord];
      const nextPickIndex = draftState.currentPickIndex + 1;
      const isComplete = nextPickIndex >= draftState.picks.length;

      // If draft complete, save to history
      let newHistory = prev.history;
      if (isComplete) {
        const draftRecord = { season: prev.currentSeason, picks: newDraftHistory };
        newHistory = { ...prev.history, draftHistory: [...prev.history.draftHistory, draftRecord] };
      }

      return {
        ...prev,
        teams: newTeams,
        history: newHistory,
        draftState: { ...draftState, draftHistory: newDraftHistory, currentPickIndex: nextPickIndex, isComplete },
      };
    });
  }

  // --- Start new season ---
  function handleStartNewSeason() {
    setLeagueState(prev => ({
      ...prev,
      currentSeason: prev.currentSeason + 1,
      seasonSimulated: false,
      seasonPhase: 'preseason',
      playoffs: null,
      awards: null,
      offseasonStep: null,
      draftState: null,
      developmentResults: null,
      retiredThisOffseason: null,
      offseasonSummary: null,
      currentView: 'dashboard',
    }));
  }

  // --- Trades / FA / Sign / Release (same as before) ---
  function handleTradeComplete(teamAId, teamBId, tradeAIds, tradeBIds) {
    if (mgmtLocked) return;
    setLeagueState(prev => {
      const newTeams = prev.teams.map(t => {
        if (t.id === teamAId) {
          const incoming = prev.teams.find(tb => tb.id === teamBId)?.players.filter(p => tradeBIds.includes(p.id)).map(p => ({ ...p, teamId: teamAId })) || [];
          return { ...t, players: [...t.players.filter(p => !tradeAIds.includes(p.id)), ...incoming] };
        }
        if (t.id === teamBId) {
          const incoming = prev.teams.find(ta => ta.id === teamAId)?.players.filter(p => tradeAIds.includes(p.id)).map(p => ({ ...p, teamId: teamBId })) || [];
          return { ...t, players: [...t.players.filter(p => !tradeBIds.includes(p.id)), ...incoming] };
        }
        return t;
      });
      return { ...prev, teams: newTeams };
    });
  }

  function handleSign(teamId, faId) {
    setLeagueState(prev => {
      const fa = prev.freeAgents.find(p => p.id === faId);
      if (!fa) return prev;
      const newFAs = prev.freeAgents.filter(p => p.id !== faId);
      const newTeams = prev.teams.map(t => {
        if (t.id !== teamId) return t;
        if (t.players.filter(p => !p.injury?.active || (p.injury?.gamesTotal||0) < 5).length >= 23) return t;
        return { ...t, players: [...t.players, { ...fa, teamId, isExtra: true, lineNumber: 4, rosterStatus: 'extra' }] };
      });
      return { ...prev, teams: newTeams, freeAgents: newFAs };
    });
  }

  function handleRelease(teamId, playerId) {
    setLeagueState(prev => {
      const team = prev.teams.find(t => t.id === teamId);
      if (!team) return prev;
      const player = team.players.find(p => p.id === playerId);
      if (!player) return prev;
      const newTeams = prev.teams.map(t => t.id !== teamId ? t : { ...t, players: t.players.filter(p => p.id !== playerId) });
      return { ...prev, teams: newTeams, freeAgents: [...prev.freeAgents, { ...player, teamId: null, isExtra: false }] };
    });
  }

  // Phase 6B: Strategy handler
  function handleStrategyUpdate(teamId, newStrategy) {
    setLeagueState(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === teamId ? { ...t, strategy: newStrategy } : t),
    }));
  }

  // Determine strategy team to show (user's team = first team, BLZ)
  const strategyTeam = teams.find(t => t.id === USER_TEAM_ID) || teams[0];

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { key: 'roster', label: 'Rosters', icon: '👥' },
    { key: 'simGame', label: 'Sim Game', icon: '🎮' },
    { key: 'simSeason', label: 'Sim Season', icon: '📅' },
    { key: 'stats', label: 'Season Stats', icon: '📊' },
    { key: 'strategy', label: 'Strategy', icon: '♟️' },
    { key: 'leagueStrategy', label: 'League Strats', icon: '📋' },
    { key: 'trades', label: 'Trades', icon: '🔄', locked: mgmtLocked || inOffseason },
    { key: 'freeAgency', label: 'Free Agency', icon: '✍️', locked: mgmtLocked || inOffseason },
    { key: 'injuries', label: 'Injuries', icon: '🏥' },
    { key: 'awards', label: 'Awards', icon: '🏆', show: seasonSimulated },
    { key: 'playoffs', label: 'Playoffs', icon: '🥊', show: seasonSimulated || playoffs?.active },
    { key: 'history', label: 'History', icon: '📚' },
    { key: 'offseason', label: 'Offseason', icon: '🌙', show: inOffseason },
  ];

  const champion = playoffs?.champion ? teams.find(t => t.id === playoffs.champion) : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏒</span>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">Hockey Sim Manager</h1>
            <div className="text-gray-400 text-xs">Season {currentSeason} — {seasonPhase.replace(/([A-Z])/g, ' $1').trim()}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs hidden sm:block">📚 S{currentSeason} • {history.seasons.length} completed</span>
          <button onClick={handleRandomize} className="bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition">
            New League
          </button>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-gray-900 border-b border-gray-800 px-4 flex gap-1 overflow-x-auto">
        {navItems.filter(n => n.show !== false).map(item => (
          <button key={item.key} onClick={() => setView(item.key)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition
              ${currentView === item.key ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-white'}
              ${item.locked ? 'opacity-40 cursor-not-allowed' : ''}`}
            disabled={item.locked}>
            {item.icon} {item.label}
            {item.locked && <span className="text-red-400">🔒</span>}
          </button>
        ))}
      </nav>

      {simming && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700">
            <div className="text-4xl mb-4">🏒</div>
            <div className="text-white text-xl font-bold mb-2">Simulating Season {currentSeason}...</div>
            <div className="text-gray-400 text-sm">246 games in progress</div>
            <div className="mt-4 flex justify-center gap-1">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto">
        {currentView === 'dashboard' && (
          <DashboardView
            teams={teams}
            seasonSimulated={seasonSimulated}
            onSimSeason={['preseason','offseason'].includes(seasonPhase) && !inOffseason ? handleSimSeason : null}
            onRandomize={handleRandomize}
            onNav={setView}
            champion={champion}
            awards={awards?.regularSeason}
            playoffs={playoffs}
          />
        )}
        {currentView === 'roster' && <RosterView teams={teams} />}
        {currentView === 'simGame' && <SimGameView teams={teams} />}
        {currentView === 'simSeason' && (
          <div className="p-8 text-center">
            <h2 className="text-white text-2xl font-bold mb-4">Season {currentSeason} Simulator</h2>
            <p className="text-gray-400 mb-6">Simulate a full 82-game season for all 6 teams (246 total games).</p>
            <button onClick={handleSimSeason} disabled={simming || !['preseason','offseason'].includes(seasonPhase) || inOffseason}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl text-lg transition">
              🏒 Drop the Puck — Season {currentSeason}
            </button>
            {seasonSimulated && <div className="mt-6 text-green-400">✓ Season simulated! View standings or proceed to Awards.</div>}
          </div>
        )}
        {currentView === 'stats' && <SeasonStatsView teams={teams} seasonSimulated={seasonSimulated} />}
        {currentView === 'trades' && !mgmtLocked && !inOffseason && <TradeView teams={teams} onTradeComplete={handleTradeComplete} />}
        {(currentView === 'trades' && (mgmtLocked || inOffseason)) && <div className="p-8 text-center text-orange-400">🔒 Trades are locked.</div>}
        {currentView === 'freeAgency' && !mgmtLocked && !inOffseason && <FreeAgencyView teams={teams} freeAgents={freeAgents} onSign={handleSign} onRelease={handleRelease} />}
        {(currentView === 'freeAgency' && (mgmtLocked || inOffseason)) && <div className="p-8 text-center text-orange-400">🔒 Free agency is locked.</div>}
        {currentView === 'injuries' && <InjuryReportView teams={teams} />}
        {currentView === 'awards' && (
          <AwardsCeremonyView
            awards={awards}
            teams={teams}
            onBeginPlayoffs={handleBeginPlayoffs}
          />
        )}
        {currentView === 'playoffs' && seasonPhase !== 'championship' && (
          <PlayoffView
            leagueState={leagueState}
            onSimNextGame={handleSimNextGame}
            onSimSeries={handleSimSeriesAll}
            onSimAll={handleSimAllPlayoffs}
            onStartPlayoffs={handleBeginPlayoffs}
            onReturnToDash={handleReturnToDash}
          />
        )}
        {currentView === 'championship' && playoffs?.champion && (
          <ChampionshipView
            teams={teams}
            playoffs={playoffs}
            awards={awards}
            onReturnToDash={handleReturnToDash}
            onBeginOffseason={handleBeginOffseason}
          />
        )}
        {currentView === 'history' && (
          <CareerHistoryView
            history={history}
            currentSeason={currentSeason}
            teams={teams}
          />
        )}
        {currentView === 'strategy' && strategyTeam && (
          <StrategyTabView
            team={strategyTeam}
            onUpdate={s => handleStrategyUpdate(strategyTeam.id, s)}
          />
        )}
        {currentView === 'leagueStrategy' && (
          <LeagueStrategyView teams={teams} />
        )}
        {currentView === 'offseason' && (
          <OffseasonWorkflowView
            step={offseasonStep}
            seasonNum={currentSeason}
            summary={offseasonSummary}
            developmentResults={developmentResults}
            retiredPlayers={retiredThisOffseason}
            draftState={draftState}
            teams={teams}
            freeAgents={freeAgents}
            awards={awards}
            champion={offseasonSummary?.champion}
            onAdvanceStep={handleAdvanceOffseasonStep}
            onScoutProspect={handleScoutProspect}
            onDraftPick={handleDraftPick}
            onSign={handleSign}
            onRelease={handleRelease}
            onStartNewSeason={handleStartNewSeason}
          />
        )}
      </main>
    </div>
  );
}

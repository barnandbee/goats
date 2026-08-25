import { firstNames, lastNames, allTraits } from './constants';

export const generateStat = (min = 1, max = 20) => Math.floor(Math.random() * (max - min + 1)) + min;
export const generateName = () => `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

let nextId = Date.now();
export const getUniqueId = () => nextId++;

export const toRoman = (num) => { 
    const r = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]; 
    return r[num] || num.toString(); 
};

export const resolveGoatName = (baseName, herd) => {
    const existing = herd.filter(g => g.name.startsWith(baseName)).length;
    return existing === 0 ? baseName : `${baseName} ${toRoman(existing + 1)}`;
};

export const normalizeDate = (d) => { 
    const date = new Date(d); 
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()); 
};

export const timeDiff = (d1, d2) => Math.round((normalizeDate(d1) - normalizeDate(d2)) / (1000 * 60 * 60 * 24));

export const calcAWMP = (team) => { 
    if (team.PA === 0) return team.PF === 0 ? 0 : 200.0; 
    return (team.PF / team.PA) * 100; 
};

export const recalculateValue = (goat) => {
    let base = 500;
    
    if (goat.quality === 'world class') base += 750000;
    else if (goat.quality === 'elite') base += 350000;
    else if (goat.quality === 'excellent') base += 150000;
    else if (goat.quality === 'very good') base += 60000;
    else if (goat.quality === 'good') base += 25000;
    else if (goat.quality === 'decent') base += 10000;
    else if (goat.quality === 'average') base += 4000;
    else if (goat.quality === 'okay') base += 1500;
    else if (goat.quality === 'poor') base += 500;
    else if (goat.quality === 'wonderkid') base += 50000; // High premium for raw potential
    else base += 0; 

    const attrTotal = Object.values(goat.attributes).reduce((a, b) => a + b, 0);
    const attrValue = attrTotal * 200; 

    const potTotal = Object.values(goat.potential).reduce((a, b) => a + b, 0);
    const potValue = (potTotal - attrTotal) * 100;

    let ageMod = 1.0;
    if (goat.age > 8) ageMod = 0.5;
    else if (goat.age > 5) ageMod = 0.8;
    else if (goat.age < 3) ageMod = 1.2;

    const condMod = (goat.condition / 100) * 0.5 + 0.5; 
    const moraleMod = (goat.morale / 100) * 0.5 + 0.5;

    let finalValue = Math.round((base + attrValue + potValue) * ageMod * condMod * moraleMod);
    return Math.max(100, finalValue); 
};

export const createGoat = (quality, managerStyleId = null) => {
    let minStat, maxStat;
    switch (quality) { 
        case 'world class': minStat = 45; maxStat = 50; break; 
        case 'elite': minStat = 40; maxStat = 45; break; 
        case 'excellent': minStat = 35; maxStat = 40; break; 
        case 'very good': minStat = 30; maxStat = 35; break; 
        case 'good': minStat = 25; maxStat = 30; break; 
        case 'decent': minStat = 20; maxStat = 25; break; 
        case 'average': minStat = 15; maxStat = 20; break; 
        case 'okay': minStat = 10; maxStat = 15; break; 
        case 'poor': minStat = 5; maxStat = 10; break; 
        case 'very poor': default: minStat = 1; maxStat = 5; break; 
    }
    
    const attributes = { 
        AGI: generateStat(minStat, maxStat), STA: generateStat(minStat, maxStat), STR: generateStat(minStat, maxStat), 
        SPD: generateStat(minStat, maxStat), FOR: generateStat(minStat, maxStat), SEL: generateStat(minStat, maxStat), 
        DIG: generateStat(minStat, maxStat), BRV: generateStat(minStat, maxStat), DIS: generateStat(minStat, maxStat), 
        INT: generateStat(minStat, maxStat), MYL: generateStat(minStat, maxStat), MQL: generateStat(minStat, maxStat), 
        WQL: generateStat(minStat, maxStat) 
    };
    
    const potential = {}; 
    Object.keys(attributes).forEach(key => { potential[key] = Math.min(50, attributes[key] + generateStat(2, 8)); });
    
    let positiveChance = (['world class', 'elite', 'excellent'].includes(quality) ? 0.8 : ['very good', 'good', 'decent'].includes(quality) ? 0.6 : 0.4);
    if (managerStyleId === 'A') positiveChance += 0.20; 

    const traits = []; 
    const traitCount = Math.random() > 0.3 ? 1 : 2;
    for (let i = 0; i < traitCount; i++) {
        const isPositive = Math.random() < positiveChance;
        if (isPositive) traits.push(allTraits.positive[Math.floor(Math.random() * allTraits.positive.length)]); 
        else traits.push(allTraits.negative[Math.floor(Math.random() * allTraits.negative.length)]);
    }

    let minMorale = 60; let maxMorale = 90;
    if (managerStyleId === 'B') { minMorale = 75; maxMorale = 100; }
    
    let goat = { 
        id: getUniqueId(), name: generateName(), age: generateStat(1, 5), peakAge: generateStat(6, 9), 
        condition: generateStat(85, 100), morale: generateStat(minMorale, maxMorale), attributes, potential, 
        trainingFocus: 'resting', trainingBonus: 0, traits: [...new Map(traits.map(item => [item['name'], item])).values()], quality 
    };
    
    goat.value = recalculateValue(goat); 
    return goat;
};

// --- NEW WONDER KID GENERATOR ---
export const createWonderKid = (academyLevel = 1) => {
    const roll = Math.random();
    let minPot, maxPot;
    const bonus = academyLevel - 1; // Level 1 gives +0, Level 10 gives +9!
    
    // Weighted Potential
    if (roll > 0.95) { minPot = 45; maxPot = 50; }
    else if (roll > 0.80) { minPot = 38 + Math.floor(bonus/2); maxPot = 44 + Math.floor(bonus/2); }
    else if (roll > 0.50) { minPot = 30 + Math.floor(bonus/2); maxPot = 37 + Math.floor(bonus/2); }
    else { minPot = 20 + bonus; maxPot = 29 + bonus; }

    const attributes = {
        AGI: generateStat(5 + bonus, 12 + bonus), STA: generateStat(5 + bonus, 12 + bonus), STR: generateStat(5 + bonus, 12 + bonus),
        SPD: generateStat(5 + bonus, 12 + bonus), FOR: generateStat(5 + bonus, 12 + bonus), SEL: generateStat(5 + bonus, 12 + bonus),
        DIG: generateStat(5 + bonus, 12 + bonus), BRV: generateStat(5 + bonus, 12 + bonus), DIS: generateStat(5 + bonus, 12 + bonus),
        INT: generateStat(5 + bonus, 12 + bonus), MYL: generateStat(5 + bonus, 12 + bonus), MQL: generateStat(5 + bonus, 12 + bonus),
        WQL: generateStat(5 + bonus, 12 + bonus)
    };

    const potential = {};
    Object.keys(attributes).forEach(key => {
        potential[key] = Math.min(50, Math.max(attributes[key] + 5, generateStat(minPot, maxPot)));
    });

    const traits = [];
    const isPositive = Math.random() < (minPot >= 35 ? 0.8 : 0.5);
    if (isPositive) traits.push(allTraits.positive[Math.floor(Math.random() * allTraits.positive.length)]);
    else traits.push(allTraits.negative[Math.floor(Math.random() * allTraits.negative.length)]);

    let goat = {
        id: getUniqueId(),
        name: `Lil' ${firstNames[Math.floor(Math.random() * firstNames.length)]}`,
        age: 1, peakAge: generateStat(6, 9), condition: 100, morale: 100,
        attributes, potential, trainingFocus: 'resting', trainingBonus: 0,
        traits: [...new Map(traits.map(item => [item['name'], item])).values()],
        quality: 'wonderkid'
    };
    goat.value = recalculateValue(goat);
    return goat;
};

export const getHerdAverages = (goats) => {
    if (!goats || goats.length === 0) return { WQL: 25, productionScore: 25 };
    let totalWQL = 0; let totalProd = 0;
    goats.forEach(g => {
        totalWQL += (g.attributes.WQL || 25);
        totalProd += ((g.attributes.DIG || 25) + (g.attributes.MYL || 25) + (g.attributes.MQL || 25) + (g.attributes.WQL || 25)) / 4;
    });
    return { WQL: totalWQL / goats.length, productionScore: totalProd / goats.length };
};

export const checkGlobalAchievements = (state) => {
    if (!state || !state.herder || !state.record || !state.goats) return state;
    
    let newState = { ...state, record: { ...state.record, managerAwards: { ...(state.record.managerAwards || {}) } }, news: [...state.news] };
    let updated = false;

    if (newState.herder.name.toLowerCase() === 'turnip scart' && !newState.record.turnipSquaredAchieved) {
        if (newState.goats.some(g => g.name.toLowerCase() === 'turnip scart')) {
            newState.money = 10000000; newState.record.turnipSquaredAchieved = true;
            newState.news.unshift({ message: 'Turnip Scart Squared: you have shorted the financial system and won big!', type: 'good' });
            updated = true;
        }
    }
    if (newState.herder.name.toLowerCase() === 'curtains t. vinegar' && !newState.record.managerAwards['Malt-er Ego']) {
        newState.record.managerAwards['Malt-er Ego'] = 1;
        newState.news.unshift({ message: '🏆 Malt-er Ego Award unlocked!', type: 'good' });
        updated = true;
    }
    if (newState.goats.length === 0 && !newState.record.managerAwards['Clearance Sale']) {
        newState.record.managerAwards['Clearance Sale'] = 1;
        newState.news.unshift({ message: '🏆 Clearance Sale Award unlocked! You sold every goat.', type: 'good' });
        updated = true;
    }
    if (newState.farm.captainId && !newState.goats.some(g => g.id === newState.farm.captainId)) {
        newState.farm.captainId = null;
        if (!newState.record.managerAwards['Captainless']) {
            newState.news.unshift({ message: '🏆 Captainless Award unlocked! Your captain left the herd.', type: 'bad' });
        }
        newState.record.managerAwards['Captainless'] = (newState.record.managerAwards['Captainless'] || 0) + 1;
        updated = true;
    }

    // --- NEW: RED ED ---
    if (newState.herder.name === 'Ed' && newState.farm.kitColor === '#EF4444' && !newState.record.managerAwards['Red Ed']) {
        newState.record.managerAwards['Red Ed'] = 1;
        newState.news.unshift({ message: '🏆 Red Ed Award unlocked! A true crimson tactician.', type: 'good' });
        updated = true;
    }

    // --- NEW: LITTLE L ---
    if (newState.record.wins >= 50 && !newState.record.managerAwards['Little L']) {
        newState.record.managerAwards['Little L'] = 1;
        newState.news.unshift({ message: '🏆 Little L Award unlocked! You hit 50 career wins.', type: 'good' });
        updated = true;
    }

    return updated ? newState : state;
};
export const applyTeamRename = (state, newName) => {
    if (!newName || newName.trim() === '' || state.farm.name === newName) return state;
    const oldName = state.farm.name;
    
    // Selectively deep clone the state to avoid breaking Dates
    let nextState = { 
        ...state, 
        farm: { ...state.farm, name: newName },
        news: [{ message: `📝 The club has officially been renamed to ${newName}!`, type: 'good' }, ...state.news],
        leagueTables: { ...state.leagueTables }
    };
    
    for (let level in nextState.leagueTables) {
        nextState.leagueTables[level] = nextState.leagueTables[level].map(t => {
            let updatedT = { ...t };
            if (updatedT.name === oldName) updatedT.name = newName;
            updatedT.opponentsPlayed = updatedT.opponentsPlayed.map(opp => opp === oldName ? newName : opp);
            return updatedT;
        });
    }
    
    if (state.nationalCup) {
        nextState.nationalCup = { ...state.nationalCup, bracket: state.nationalCup.bracket.map(match => match.map(team => team === oldName ? newName : team)) };
        if (nextState.nationalCup.nextOpponent === oldName) nextState.nationalCup.nextOpponent = newName;
    }
    
    if (state.championsBleat) {
        nextState.championsBleat = { ...state.championsBleat, bracket: state.championsBleat.bracket.map(match => match.map(team => team === oldName ? newName : team)) };
        if (nextState.championsBleat.nextOpponent === oldName) nextState.championsBleat.nextOpponent = newName;
    }

    return nextState;
};
export const isPrime = (num) => {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
};
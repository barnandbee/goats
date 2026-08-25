import { getUniqueId, generateStat, createGoat, calcAWMP, recalculateValue, resolveGoatName, getHerdAverages, createWonderKid, isPrime } from './utils';
import { trainingRegimes, tacticalRoles, rivalHerdNames, europeanTeams, leagueStructure, majorTournamentsPool, competitionAttributes, corporateSponsors } from './constants';

export const generateMarketGoats = (leagueLevel = 5) => {
    const numGoats = generateStat(3, 10); const newMarketGoats = [];
    const getMarketQuality = (level) => {
        const roll = Math.random();
        if (level === 1) return roll > 0.8 ? 'world class' : roll > 0.4 ? 'elite' : roll > 0.1 ? 'excellent' : 'very good';
        if (level === 2) return roll > 0.9 ? 'elite' : roll > 0.5 ? 'excellent' : roll > 0.2 ? 'very good' : 'good';
        if (level === 3) return roll > 0.9 ? 'excellent' : roll > 0.6 ? 'very good' : roll > 0.3 ? 'good' : 'decent';
        if (level === 4) return roll > 0.9 ? 'very good' : roll > 0.6 ? 'good' : roll > 0.3 ? 'decent' : 'average';
        return roll > 0.9 ? 'good' : roll > 0.7 ? 'decent' : roll > 0.4 ? 'average' : roll > 0.1 ? 'okay' : 'poor';
    };
    for (let i = 0; i < numGoats; i++) newMarketGoats.push(createGoat(getMarketQuality(leagueLevel)));
    return newMarketGoats;
};

const generateOpponentRoster = (qualityScore, reqGoats) => {
    const roles = ['vanguard', 'anchor', 'scout', 'solo', 'solo'];
    return Array.from({ length: reqGoats }, (_, i) => {
        let q = 'average';
        if (qualityScore >= 95) q = 'world class';
        else if (qualityScore >= 85) q = 'elite';
        else if (qualityScore >= 75) q = 'excellent';
        else if (qualityScore >= 65) q = 'very good';
        else if (qualityScore >= 55) q = 'good';
        else if (qualityScore >= 45) q = 'decent';
        else if (qualityScore >= 35) q = 'average';
        else if (qualityScore >= 25) q = 'okay';
        else if (qualityScore >= 15) q = 'poor';
        else q = 'very poor';
        
        let g = createGoat(q);
        const statAvg = Math.round(Object.values(g.attributes).reduce((a,b)=>a+b,0) / 13);
        return { ...g, assignedRole: roles[i] || 'solo', scoutRating: statAvg };
    });
};

export const advanceDay = (prev) => {
    const newDate = new Date(prev.date); 
    newDate.setUTCDate(newDate.getUTCDate() + 1);
    let newsToday = []; let newRivalOffer = null; let comps = prev.scheduledCompetitions;
    let newLeague = { ...prev.league, seasonDay: (prev.league.seasonDay || 0) + 1 };
    let newSponsorshipOffer = prev.sponsorshipOffer;
    let currentMoney = prev.money;
    let newFollowing = { ...prev.following };

    if (newLeague.seasonDay === 3 && prev.goats.length > 0 && !prev.activeSponsor) {
        const averages = getHerdAverages(prev.goats);
        const leagueMults = [50, 20, 8, 3, 1]; const mult = leagueMults[prev.farm.leagueLevel - 1] || 1;
        newSponsorshipOffer = { sponsorName: corporateSponsors[Math.floor(Math.random() * corporateSponsors.length)], amount: Math.round(averages.productionScore * mult * 20) + generateStat(100, 500) };
    }

    const effectiveTrainingLevel = prev.farm.buildings.trainingPitch || 1;
    const medLevel = prev.farm.buildings.medicalCentre || 1; 
    const assistantBoost = (prev.assistantHerders?.length || 0) * 0.02; 

    const updatedGoats = prev.goats.map(goat => {
        let newGoat = { ...goat, attributes: { ...goat.attributes } };
        
        if (newGoat.trainingFocus === 'resting') {
            newGoat.condition = Math.min(100, newGoat.condition + 4 + medLevel); 
            newGoat.trainingBonus = Math.max(0, (newGoat.trainingBonus || 0) - 0.05);
        } else {
            newGoat.condition = Math.max(0, newGoat.condition - 5);
            newGoat.trainingBonus = Math.min(1.0, (newGoat.trainingBonus || 0) + 0.02);
        }
        
        if (newGoat.condition < 40 && newGoat.trainingFocus !== 'resting') { 
            newGoat.trainingFocus = 'resting'; 
            newsToday.push({ message: `🥵 ${newGoat.name} is exhausted and resting.`, type: 'bad' }); 
        }

        const focus = trainingRegimes[newGoat.trainingFocus];
        
        if (focus?.affected?.length > 0) {
            let dailyProb = 0.03 + (newGoat.trainingBonus * 0.05) + (effectiveTrainingLevel * 0.01) + assistantBoost;
            if (prev.herder.style.id === 'A' && focus?.affected?.includes('DIS')) dailyProb += 0.02;
            if (prev.herder.style.id === 'B' && (focus?.affected?.includes('STA') || focus?.affected?.includes('FOR'))) dailyProb += 0.02;
            
            if (Math.random() < dailyProb) {
                const attr = focus.affected[Math.floor(Math.random() * focus.affected.length)];
                if (newGoat.attributes[attr] < newGoat.potential[attr]) { 
                    newGoat.attributes[attr]++; 
                    newsToday.push({ message: `🏋️ ${newGoat.name} skill up: ${attr}!`, type: 'good'}); 
                }
            }
        } else if (newGoat.trainingFocus === 'resting' && newGoat.age < newGoat.peakAge) {
            if (Math.random() < 0.015) {
                const attrs = Object.keys(newGoat.attributes);
                const attr = attrs[Math.floor(Math.random() * attrs.length)];
                if (newGoat.attributes[attr] < newGoat.potential[attr]) newGoat.attributes[attr]++;
            }
        }
        
        newGoat.value = recalculateValue(newGoat); 
        return newGoat;
    });

    const eventRoll = Math.random();
    if (eventRoll < 0.03 && updatedGoats.length > 0) {
        const idx = Math.floor(Math.random() * updatedGoats.length);
        const injuries = [ { msg: "ate a Danger Berry in the paddock", drop: 30 }, { msg: "caught Saturday Bleat Fever and can't stop dancing", drop: 50 }, { msg: "tried to headbutt a tractor", drop: 40 }, { msg: "got stuck in a bramble bush", drop: 20 }, { msg: "stayed up all night staring at the moon", drop: 25 }, { msg: "twisted a hoof showing off to the herd", drop: 45 }, { msg: "got into a staring contest with a sheep and forgot to sleep", drop: 15 } ];
        const injury = injuries[Math.floor(Math.random() * injuries.length)];
        
        updatedGoats[idx].condition = Math.max(0, updatedGoats[idx].condition - injury.drop);
        
        const statDamageChance = Math.max(0.1, 0.4 - (medLevel * 0.03)); 
        if (Math.random() < statDamageChance) {
            const physAttrs = ['AGI', 'STA', 'STR', 'SPD'];
            const dropAttr = physAttrs[Math.floor(Math.random() * physAttrs.length)];
            updatedGoats[idx].attributes[dropAttr] = Math.max(1, updatedGoats[idx].attributes[dropAttr] - 1);
            updatedGoats[idx].potential[dropAttr] = Math.max(1, updatedGoats[idx].potential[dropAttr] - 1);
            newsToday.push({ message: `🚑 ${updatedGoats[idx].name} ${injury.msg}! (-${injury.drop}% Cond, -1 ${dropAttr})`, type: 'bad' });
        } else {
            newsToday.push({ message: `🤕 ${updatedGoats[idx].name} ${injury.msg}! (-${injury.drop}% Cond)`, type: 'bad' });
        }
        updatedGoats[idx].value = recalculateValue(updatedGoats[idx]);
        
    } else if (eventRoll < 0.05 && updatedGoats.length >= 5) {
        const target = [...updatedGoats].sort(() => 0.5 - Math.random())[0];
        newRivalOffer = { type: 'cash', goat: target, price: Math.round(target.value * 1.3), rivalName: rivalHerdNames[Math.floor(Math.random()*rivalHerdNames.length)] };
    } else if (eventRoll < 0.07 && updatedGoats.length >= 5) {
        const target = [...updatedGoats].sort(() => 0.5 - Math.random())[0];
        const tradeGoat = createGoat('good'); tradeGoat.value = Math.round(target.value * generateStat(80, 120) / 100);
        newRivalOffer = { type: 'trade', goat: target, tradeGoat, rivalName: rivalHerdNames[Math.floor(Math.random()*rivalHerdNames.length)] };
    } else if (eventRoll < 0.075 && updatedGoats.length >= 4) { 
        const target = [...updatedGoats].sort((a,b) => b.value - a.value)[0]; 
        const price = Math.round(target.value * generateStat(175, 250) / 100);
        newRivalOffer = { type: 'forced', goat: target, price, rivalName: rivalHerdNames[Math.floor(Math.random()*rivalHerdNames.length)] };
    }

    const majorEventRoll = Math.random();
    if (majorEventRoll < 0.015) {
        const eventTypes = ['takeover', 'viral', 'scandal', 'flu', 'hero', 'tax'];
        const ev = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        if (ev === 'takeover' && currentMoney < 500000) {
            const injection = generateStat(100000, 500000);
            currentMoney += injection;
            newsToday.push({ message: `👔 TAKEOVER! A wealthy eccentric farmer bought the club and injected $${injection.toLocaleString()}!`, type: 'good' });
        } else if (ev === 'viral' && updatedGoats.length > 0) {
            const target = updatedGoats[Math.floor(Math.random() * updatedGoats.length)];
            const fanBoost = Math.floor((newFollowing.fans || 100) * generateStat(5, 15) / 100) + 1000;
            newFollowing.fans += fanBoost;
            newsToday.push({ message: `📱 VIRAL! ${target.name}'s parkour video blew up on CaprineTok! Gained ${fanBoost.toLocaleString()} fans!`, type: 'good' });
        } else if (ev === 'scandal' && newFollowing.fans > 5000 && updatedGoats.length > 0) {
            const target = updatedGoats[Math.floor(Math.random() * updatedGoats.length)];
            const fanDrop = Math.floor(newFollowing.fans * generateStat(10, 20) / 100);
            newFollowing.fans = Math.max(100, newFollowing.fans - fanDrop);
            target.morale = Math.max(0, target.morale - 50);
            newsToday.push({ message: `📰 SCANDAL! ${target.name} was caught eating the Mayor's prize petunias! Lost ${fanDrop.toLocaleString()} fans.`, type: 'bad' });
        } else if (ev === 'flu' && updatedGoats.length > 2) {
            let hit = 0;
            updatedGoats.forEach(g => { if(Math.random() > 0.5) { g.condition = Math.max(0, g.condition - 40); hit++; } });
            if(hit > 0) newsToday.push({ message: `🦠 OUTBREAK! Caprine Flu sweeps through the herd! Condition plummets.`, type: 'bad' });
        } else if (ev === 'tax' && currentMoney > 50000) {
            const fine = Math.floor(currentMoney * generateStat(20, 50) / 100);
            currentMoney -= fine;
            newsToday.push({ message: `⚖️ AUDIT! The Goat Registration Authority fined the club $${fine.toLocaleString()} for "unlicensed grazing".`, type: 'bad' });
        } else if (ev === 'hero' && updatedGoats.length > 0) {
            const target = updatedGoats[Math.floor(Math.random() * updatedGoats.length)];
            const attrs = ['BRV', 'INT', 'MYL'];
            const buffAttr = attrs[Math.floor(Math.random() * attrs.length)];
            target.attributes[buffAttr] += 2; // UNCAPPED!
            target.potential[buffAttr] = Math.max(target.potential[buffAttr], target.attributes[buffAttr]);
            target.morale = 100;
            target.value = recalculateValue(target);
            newsToday.push({ message: `🦸 LOCAL HERO! ${target.name} heroically chased away a fox! (+2 ${buffAttr}, Max Morale)`, type: 'good' });
        }
    }
    
    comps.forEach(c => { if (new Date(c.date).toDateString() === newDate.toDateString()) newsToday.push({ message: `Tournament: ${c.name} happens TODAY! Enter via Competitions.`, type: 'good' }); });

    let competition = prev.competition;
    if (!prev.needsFormationSelection) {
        const pLeagueTable = prev.leagueTables[prev.farm.leagueLevel];
        if (newDate.getUTCDay() === 6 && prev.league.status === 'active') { 
            const playerTeam = pLeagueTable.find(t => t.name === prev.farm.name);
            if (playerTeam.P < 7) {
                const opp = pLeagueTable.find(t => t.name !== prev.farm.name && !playerTeam.opponentsPlayed.includes(t.name));
                if (opp) {
                    const attrs = [...competitionAttributes].sort(() => 0.5 - Math.random()).slice(0, 3);
                    const roster = generateOpponentRoster(opp.quality, 3);
                    competition = { id: 'league', isActive: true, stage: 'select', prize: 1500 * (6 - prev.farm.leagueLevel), details: { title: 'League Fixture', opponentName: opp.name, opponentQuality: opp.quality, requiredGoats: 3, keyAttributes: attrs, opponentRoster: roster } };
                }
            }
        } else if (prev.nationalCup?.isActive && newDate.toDateString() === new Date(prev.nationalCup.nextMatchDate).toDateString()) {
            const attrs = [...competitionAttributes].sort(() => 0.5 - Math.random()).slice(0, 3);
            let baseQ = 50;
            switch(prev.nationalCup.currentRound) {
                case 'Round of 32': baseQ = generateStat(25, 55); break;
                case 'Last 16': baseQ = generateStat(40, 70); break;
                case 'Quarter-Final': baseQ = generateStat(55, 85); break;
                case 'Semi-Final': baseQ = generateStat(70, 95); break;
                case 'Final': baseQ = generateStat(85, 100); break;
            }
            const oppQuality = Math.min(100, Math.max(1, baseQ));
            const roster = generateOpponentRoster(oppQuality, 3);
            competition = { id: 'cup', isActive: true, stage: 'select', prize: 5000, details: { title: `Goat Association Cup - ${prev.nationalCup.currentRound}`, opponentName: prev.nationalCup.nextOpponent, opponentQuality: oppQuality, requiredGoats: 3, keyAttributes: attrs, opponentRoster: roster } };
        } else if (prev.championsBleat?.isActive && newDate.toDateString() === new Date(prev.championsBleat.nextMatchDate).toDateString()) {
            const attrs = [...competitionAttributes].sort(() => 0.5 - Math.random()).slice(0, 3);
            const roster = generateOpponentRoster(100, 3);
            competition = { id: 'bleat', isActive: true, stage: 'select', prize: 15000, details: { title: `The Champions Bleat - ${prev.championsBleat.currentRound}`, opponentName: prev.championsBleat.nextOpponent, opponentQuality: 100, requiredGoats: 3, keyAttributes: attrs, opponentRoster: roster } };
        } else if (prev.worldCup?.isActive && newDate.toDateString() === new Date(prev.worldCup.nextMatchDate).toDateString()) {
            const attrs = [...competitionAttributes].sort(() => 0.5 - Math.random()).slice(0, 3);
            const roster = generateOpponentRoster(95, 3);
            competition = { id: 'worldCup', isActive: true, stage: 'select', prize: 25000, details: { title: `Goat World Cup - ${prev.worldCup.currentRound}`, opponentName: prev.worldCup.nextOpponent, opponentQuality: 95, requiredGoats: 3, keyAttributes: attrs, opponentRoster: roster } };
        }
    }

    return { 
        ...prev, date: newDate, league: newLeague, money: currentMoney, following: newFollowing,
        sponsorshipOffer: newSponsorshipOffer, goats: updatedGoats, marketGoats: generateMarketGoats(prev.farm.leagueLevel), 
        competition, news: [...newsToday, ...prev.news].slice(0, 15), scheduledCompetitions: comps, rivalOffer: newRivalOffer 
    };
};

export const startCompetition = (prev, tacticalAssignments, isForfeit = false) => {
    const { details, prize, id } = prev.competition;
    const diffMod = prev.difficultyMultiplier || 1.0;
    
    const opponentTeam = details.opponentRoster || generateOpponentRoster(details.opponentQuality, details.requiredGoats);

    let oScore = 0; let pScore = 0; let win; let playerTeamIds = [];

    if (isForfeit) {
        oScore = 150; pScore = 0; win = 'opponent';
    } else {
        const oScoreBase = opponentTeam.reduce((total, goat) => {
            const roleDef = tacticalRoles[goat.assignedRole];
            return total + details.keyAttributes.reduce((sum, attr) => {
                let val = goat.attributes[attr] || 25;
                if (roleDef && roleDef.bonuses.includes(attr)) val = Math.round(val * 1.2);
                return sum + val;
            }, 0);
        }, 0) + generateStat(-15, 15);
        oScore = Math.round(oScoreBase * diffMod);

        pScore = Object.entries(tacticalAssignments).reduce((total, [slotKey, goat]) => {
            if (!goat) return total;
            const roleId = slotKey.split('_')[1]; 
            const roleDef = tacticalRoles[roleId];
            return total + details.keyAttributes.reduce((sum, attr) => {
                let val = goat.attributes[attr] || 25;
                if (roleDef.bonuses.includes(attr)) val = Math.round(val * 1.2); 
                return sum + val;
            }, 0);
        }, 0) + generateStat(-15, 15) + (prev.herder.stats.tacticalNous * 2);

        if (id === 'league' && pScore === oScore) win = 'draw'; else win = pScore >= oScore ? 'player' : 'opponent';
        playerTeamIds = Object.values(tacticalAssignments).filter(Boolean).map(g => g.id);
    }

    const diff = Math.abs(pScore - oScore);
    const actualPrize = prev.herder.style.id === 'C' ? Math.round(prize * 1.05) : prize;
    
    const updatedGoats = prev.goats.map(g => {
        if (isForfeit) return { ...g, morale: Math.max(0, g.morale - 20) };
        if (playerTeamIds.includes(g.id)) {
            const conditionBoost = prev.herder.style.id === 'C' ? 10 : 0;
            return { ...g, condition: Math.min(100, g.condition + conditionBoost), morale: Math.min(100, g.morale + (win === 'player' ? 10 : -10)), trainingBonus: Math.min(1.0, g.trainingBonus + (win === 'player' ? 0.2 : 0.05)) };
        }
        return g;
    });
    
    let newFarm = { ...prev.farm, inventory: { ...(prev.farm.inventory || { farmingTools: 0 }) } };
    let rec = { ...prev.record, goatAppearances: { ...(prev.record.goatAppearances || {}) }, managerAwards: { ...(prev.record.managerAwards || {}) } }; 
    let allLeagueTables = { ...prev.leagueTables }; 
    let lge = { ...prev.league, goatsUsedThisSeason: [...(prev.league.goatsUsedThisSeason || [])] }; 
    let tro = [ ...prev.trophyCabinet ]; let newsToday = [ ...prev.news ]; 
    let bleat = { ...prev.championsBleat }; let nCup = { ...prev.nationalCup };
    let managerHistory = [ ...(prev.managerHistory || []) ]; let scheduledComps = [...prev.scheduledCompetitions]; let newFollowing = { ...prev.following };

    let newStats = { ...prev.herder.stats };
    let xpGained = win === 'player' ? 25 : win === 'draw' ? 10 : 5;
    newStats.xp += xpGained;
    
    while (newStats.xp >= newStats.nextLevelXp) {
        newStats.xp -= newStats.nextLevelXp;
        newStats.level += 1;
        newStats.nextLevelXp = newStats.level * 100;
        
        const statKeys = ['tacticalNous', 'motivation', 'scouting'];
        const boostStat = statKeys[Math.floor(Math.random() * 3)];
        newStats[boostStat] += 1;
        
        const statName = boostStat === 'tacticalNous' ? 'Tactical Nous' : boostStat === 'motivation' ? 'Motivation' : 'Scouting Eye';
        newsToday.push({ message: `🎉 LEVEL UP! You reached Manager Level ${newStats.level}! (+1 ${statName})`, type: 'good' });
    }
    let newHerder = { ...prev.herder, stats: newStats };

    if (isForfeit && !rec.managerAwards['Oh Deer']) {
        newsToday.push({ message: `🦌 Oh Deer Award unlocked! You forfeited a match.`, type: 'bad' });
        rec.managerAwards['Oh Deer'] = (rec.managerAwards['Oh Deer'] || 0) + 1;
    }

    rec.totalMatches++;
    if (win === 'player') {
        if (diff > (rec.biggestWinMargin || 0)) rec.biggestWinMargin = diff;
        rec.wins++; rec.currentWinStreak = (rec.currentWinStreak || 0) + 1;
        if (rec.currentWinStreak > (rec.longestWinStreak || 0)) rec.longestWinStreak = rec.currentWinStreak;
        rec.currentLossStreak = 0; newFollowing.fans += Math.round((diff + (actualPrize/100)) * (1 + (prev.farm.buildings.stadium * 0.1)));
        
        if (diff > 100 && !rec.managerAwards['Centurion']) { newsToday.push({ message: `🏆 Centurion Award unlocked! Won by over 100 points.`, type: 'good' }); rec.managerAwards['Centurion'] = (rec.managerAwards['Centurion'] || 0) + 1; }
        if (diff === 1 && !rec.managerAwards["By A Crab's Eye"]) { newsToday.push({ message: `🏆 By A Crab's Eye Award unlocked! Clutched a 1-point win!`, type: 'good' }); rec.managerAwards["By A Crab's Eye"] = (rec.managerAwards["By A Crab's Eye"] || 0) + 1; }

        if (playerTeamIds.length === 3) {
            const bottomThreeIds = [...prev.goats].sort((a,b) => a.value - b.value).slice(0, 3).map(g => g.id);
            if (playerTeamIds.every(id => bottomThreeIds.includes(id)) && !rec.managerAwards['Bleat of Faith']) {
                newsToday.push({ message: `🏆 Bleat of Faith Award unlocked!`, type: 'good' });
                rec.managerAwards['Bleat of Faith'] = (rec.managerAwards['Bleat of Faith'] || 0) + 1;
            }
        }
        
        if (playerTeamIds.length === 2 && !rec.managerAwards['Dynamic Duo']) {
            newsToday.push({ message: `🏆 Dynamic Duo Award unlocked! Won with just 2 goats!`, type: 'good' });
            rec.managerAwards['Dynamic Duo'] = (rec.managerAwards['Dynamic Duo'] || 0) + 1;
        }
        if (playerTeamIds.length === 1 && !rec.managerAwards['Lone Goat']) {
            newsToday.push({ message: `🏆 Lone Goat Award unlocked! Won with a single goat!`, type: 'good' });
            rec.managerAwards['Lone Goat'] = (rec.managerAwards['Lone Goat'] || 0) + 1;
        }

    } else if (win === 'draw') { 
        rec.draws++; rec.currentWinStreak = 0; rec.currentLossStreak = 0;
        if (!rec.managerAwards['Balancing Act']) {
            newsToday.push({ message: `🤸 Balancing Act Award unlocked! An exact tie!`, type: 'good' });
            rec.managerAwards['Balancing Act'] = (rec.managerAwards['Balancing Act'] || 0) + 1;
        }
    } else { 
        rec.losses++; if (diff > (rec.biggestLossMargin || 0)) rec.biggestLossMargin = diff;
        rec.currentLossStreak = (rec.currentLossStreak || 0) + 1;
        if (rec.currentLossStreak > (rec.longestLossStreak || 0)) rec.longestLossStreak = rec.currentLossStreak;
        rec.currentWinStreak = 0;
        if (diff === 1 && !rec.managerAwards["By A Crab's Tear"]) {
            newsToday.push({ message: `🦀 By A Crab's Tear Award unlocked! Lost by exactly 1 point.`, type: 'bad' });
            rec.managerAwards["By A Crab's Tear"] = (rec.managerAwards["By A Crab's Tear"] || 0) + 1;
        }
    }

    if (!isForfeit) {
        const slotKeys = Object.keys(tacticalAssignments);
        if (slotKeys.length === 3 && slotKeys.every(k => k.includes('_anchor')) && !rec.managerAwards['Triple A Battery']) {
            newsToday.push({ message: `🏆 Triple A Battery Award unlocked!`, type: 'good' });
            rec.managerAwards['Triple A Battery'] = (rec.managerAwards['Triple A Battery'] || 0) + 1;
        }
        if (slotKeys.length === 3 && tacticalAssignments['0_anchor'] && tacticalAssignments['1_scout'] && tacticalAssignments['2_scout'] && !rec.managerAwards['Smooth Peach']) {
            newsToday.push({ message: `🍑 Smooth Peach Award unlocked! A highly peculiar formation.`, type: 'good' });
            rec.managerAwards['Smooth Peach'] = (rec.managerAwards['Smooth Peach'] || 0) + 1;
        }
        
        const matchGoats = playerTeamIds.map(id => prev.goats.find(g => g.id === id)).filter(Boolean);
        if (matchGoats.some(g => g.age >= 10) && !rec.managerAwards['Not Obsolete Yet']) {
            newsToday.push({ message: `💾 Not Obsolete Yet Award unlocked! Used a 10+ year old goat in a match.`, type: 'good' });
            rec.managerAwards['Not Obsolete Yet'] = (rec.managerAwards['Not Obsolete Yet'] || 0) + 1;
        }
        if (matchGoats.length === 3 && matchGoats.every(g => g.name.split(' ')[0] === 'Luna') && !rec.managerAwards['Moonlight Shadow']) {
            newsToday.push({ message: `🌙 Moonlight Shadow Award unlocked! A lunar trio!`, type: 'good' });
            rec.managerAwards['Moonlight Shadow'] = (rec.managerAwards['Moonlight Shadow'] || 0) + 1;
        }
        if (isPrime(pScore) && !rec.managerAwards['Prime Time']) {
            newsToday.push({ message: `🧮 Prime Time Award unlocked! You scored a prime number.`, type: 'good' });
            rec.managerAwards['Prime Time'] = (rec.managerAwards['Prime Time'] || 0) + 1;
        }
        if (pScore >= 500 && !rec.managerAwards['Fünfhundert']) {
            newsToday.push({ message: `⛰️ Fünfhundert Award unlocked! You scored 500+ points!`, type: 'good' });
            rec.managerAwards['Fünfhundert'] = (rec.managerAwards['Fünfhundert'] || 0) + 1;
        }
        if (oScore >= 800 && !rec.managerAwards['Artificial Goat-pocalypse']) {
            newsToday.push({ message: `💥 Artificial Goat-pocalypse Award unlocked! Conceded 800+ points!`, type: 'bad' });
            rec.managerAwards['Artificial Goat-pocalypse'] = (rec.managerAwards['Artificial Goat-pocalypse'] || 0) + 1;
        }
        if (matchGoats.length === 3 && matchGoats.every(g => g.name.split(' ').pop() === 'Scart') && !rec.managerAwards['Need an HDMI']) {
            newsToday.push({ message: `📺 Need an HDMI Award unlocked! A trio of Scarts!`, type: 'good' });
            rec.managerAwards['Need an HDMI'] = (rec.managerAwards['Need an HDMI'] || 0) + 1;
        }
    }
    
    playerTeamIds.forEach(goatId => { 
        const goatObj = prev.goats.find(x => x.id === goatId); 
        if(goatObj) rec.goatAppearances[goatObj.name] = (rec.goatAppearances[goatObj.name] || 0) + 1; 
        if(!lge.goatsUsedThisSeason.includes(goatId)) lge.goatsUsedThisSeason.push(goatId);
    });

    const newHistoryItem = { id: getUniqueId(), date: new Date(prev.date), competitionName: details.title, opponent: details.opponentName, result: win === 'player' ? 'W' : win === 'draw' ? 'D' : 'L', pScore, oScore };
    const newMatchHistory = [newHistoryItem, ...(prev.matchHistory || [])];
    let endOfMatchMoney = prev.money + (win === 'player' ? actualPrize : 0);
    let seasonSummaryData = null;

    if (id === 'league') {
        Object.keys(allLeagueTables).forEach(level => {
            let tbl = allLeagueTables[level].map(team => ({ ...team, opponentsPlayed: [...team.opponentsPlayed] }));
            if (parseInt(level) === prev.farm.leagueLevel) {
                tbl = tbl.map(t => {
                    if(t.name === prev.farm.name) { 
                        t.P++; t.PF += pScore; t.PA += oScore; t.opponentsPlayed.push(details.opponentName); 
                        if(win==='player') { t.W++; t.Pts += 3; } else if(win==='draw') { t.D++; t.Pts += 1; } else t.L++; 
                    } else if(t.name === details.opponentName) { 
                        t.P++; t.PF += oScore; t.PA += pScore; t.opponentsPlayed.push(prev.farm.name); 
                        if(win==='player') t.L++; else if(win==='draw') { t.D++; t.Pts += 1; } else { t.W++; t.Pts += 3; } 
                    }
                    return t;
                });
            }

            let aiTeams = parseInt(level) === prev.farm.leagueLevel ? tbl.filter(t => t.name !== prev.farm.name && t.name !== details.opponentName) : tbl; 
            aiTeams.sort(() => 0.5 - Math.random());
            let matched = new Set();
            aiTeams.forEach(t1 => {
                if(matched.has(t1.name) || t1.P >= 7) return;
                const t2 = aiTeams.find(t => !matched.has(t.name) && t.P < 7 && !t1.opponentsPlayed.includes(t.name));
                if(t2) {
                    matched.add(t1.name); matched.add(t2.name);
                    const s1Base = Math.round(((t1.quality || 50) + generateStat(0, 40)) * diffMod);
                    const s2Base = Math.round(((t2.quality || 50) + generateStat(0, 40)) * diffMod);
                    const i1 = tbl.findIndex(x=>x.name===t1.name); const i2 = tbl.findIndex(x=>x.name===t2.name);
                    tbl[i1].P++; tbl[i2].P++; tbl[i1].PF += s1Base; tbl[i1].PA += s2Base; tbl[i2].PF += s2Base; tbl[i2].PA += s1Base;
                    tbl[i1].opponentsPlayed.push(t2.name); tbl[i2].opponentsPlayed.push(t1.name);
                    if(s1Base === s2Base) { tbl[i1].D++; tbl[i2].D++; tbl[i1].Pts+=1; tbl[i2].Pts+=1; }
                    else if(s1Base > s2Base) { tbl[i1].W++; tbl[i1].Pts+=3; tbl[i2].L++; } 
                    else { tbl[i2].W++; tbl[i2].Pts+=3; tbl[i1].L++; }
                }
            });
            allLeagueTables[level] = tbl;
        });

        if (allLeagueTables[prev.farm.leagueLevel].find(t=>t.name === prev.farm.name).P >= 7) { lge.status = 'finished'; }

    } else if (id === 'bleat') {
        if (win === 'player') {
            const rnds = ['Last 16', 'Quarter-Final', 'Semi-Final', 'Final', 'Champion!'];
            const next = rnds[rnds.indexOf(bleat.currentRound) + 1];
            if(next === 'Champion!') { tro.push({season: lge.seasonNumber, name: 'European Champion', icon: '🏆'}); bleat.isActive = false; } 
            else { bleat.currentRound = next; bleat.nextOpponent = europeanTeams[generateStat(0, 10)]; bleat.nextMatchDate = new Date(new Date(prev.date).setDate(prev.date.getDate() + 14)); }
        } else bleat.isActive = false;
    } else if (id === 'cup') {
        if (win === 'player') {
            const rnds = ['Round of 32', 'Last 16', 'Quarter-Final', 'Semi-Final', 'Final', 'Champion!'];
            const next = rnds[rnds.indexOf(nCup.currentRound) + 1];
            if(next === 'Champion!') { tro.push({season: lge.seasonNumber, name: 'Goat Association Cup', icon: '🏅'}); nCup.isActive = false; } 
            else { 
                nCup.currentRound = next; 
                const possibleOpps = [...europeanTeams, ...rivalHerdNames].sort(() => 0.5 - Math.random());
                nCup.nextOpponent = possibleOpps[0]; 
                nCup.nextMatchDate = new Date(new Date(prev.date).setDate(prev.date.getDate() + 14)); 
            }
        } else nCup.isActive = false;
    } else if (id === 'worldCup') {
        const wc = { ...prev.worldCup, groups: prev.worldCup.groups ? JSON.parse(JSON.stringify(prev.worldCup.groups)) : null, bracket: prev.worldCup.bracket ? JSON.parse(JSON.stringify(prev.worldCup.bracket)) : null };
        const simMatch = (t1, t2) => {
            const s1 = 90 + generateStat(0, 30); const s2 = 90 + generateStat(0, 30);
            t1.P++; t2.P++; t1.PF+=s1; t1.PA+=s2; t2.PF+=s2; t2.PA+=s1;
            if(s1>s2){ t1.W++; t1.Pts+=3; t2.L++; } else if(s1<s2){ t2.W++; t2.Pts+=3; t1.L++; } else{ t1.D++; t2.D++; t1.Pts+=1; t2.Pts+=1; }
        };

        if (wc.stage === 'group') {
            const groupA = wc.groups.A;
            const pTeam = groupA.find(t => t.name === wc.playerCountry);
            const oTeam = groupA.find(t => t.name === details.opponentName);
            pTeam.P++; oTeam.P++; pTeam.PF += pScore; pTeam.PA += oScore; oTeam.PF += oScore; oTeam.PA += pScore;
            if(win==='player'){ pTeam.W++; pTeam.Pts+=3; oTeam.L++; } else if(win==='draw'){ pTeam.D++; oTeam.D++; pTeam.Pts+=1; oTeam.Pts+=1; } else{ oTeam.W++; oTeam.Pts+=3; pTeam.L++; }

            const otherA = groupA.filter(t => t.name !== wc.playerCountry && t.name !== details.opponentName);
            if(otherA.length === 2) simMatch(otherA[0], otherA[1]);

            ['B','C','D','E','F','G','H'].forEach(g => {
                const grp = wc.groups[g];
                if(wc.currentRound === 'Matchday 1') { simMatch(grp[0], grp[1]); simMatch(grp[2], grp[3]); }
                else if(wc.currentRound === 'Matchday 2') { simMatch(grp[0], grp[2]); simMatch(grp[1], grp[3]); }
                else if(wc.currentRound === 'Matchday 3') { simMatch(grp[0], grp[3]); simMatch(grp[1], grp[2]); }
            });

            if (wc.currentRound === 'Matchday 1') { wc.currentRound = 'Matchday 2'; wc.nextOpponent = groupA.find(t => t.name !== wc.playerCountry && t.name !== details.opponentName && t.name !== wc.nextOpponent).name; wc.nextMatchDate = new Date(new Date(prev.date).setDate(prev.date.getDate() + 4)); }
            else if (wc.currentRound === 'Matchday 2') { wc.currentRound = 'Matchday 3'; wc.nextOpponent = groupA.find(t => t.name !== wc.playerCountry && t.P < 2).name; wc.nextMatchDate = new Date(new Date(prev.date).setDate(prev.date.getDate() + 4)); }
            else if (wc.currentRound === 'Matchday 3') {
                Object.keys(wc.groups).forEach(g => wc.groups[g].sort((a,b) => b.Pts - a.Pts || (b.PF-b.PA) - (a.PF-a.PA)));
                const pPos = wc.groups.A.findIndex(t => t.name === wc.playerCountry);
                if (pPos < 2) {
                    wc.stage = 'knockout'; wc.currentRound = 'Round of 16';
                    wc.bracket = [[wc.groups.A[0].name, wc.groups.B[1].name], [wc.groups.C[0].name, wc.groups.D[1].name], [wc.groups.E[0].name, wc.groups.F[1].name], [wc.groups.G[0].name, wc.groups.H[1].name], [wc.groups.B[0].name, wc.groups.A[1].name], [wc.groups.D[0].name, wc.groups.C[1].name], [wc.groups.F[0].name, wc.groups.E[1].name], [wc.groups.H[0].name, wc.groups.G[1].name]];
                    const playerMatch = wc.bracket.find(m => m.includes(wc.playerCountry));
                    wc.nextOpponent = playerMatch[0] === wc.playerCountry ? playerMatch[1] : playerMatch[0];
                    wc.nextMatchDate = new Date(new Date(prev.date).setDate(prev.date.getDate() + 5));
                    newsToday.push({ message: `🌍 Qualified for Knockouts! Next up: ${wc.nextOpponent}`, type: 'good' });
                } else {
                    wc.isActive = false; newsToday.push({ message: `🌍 Eliminated from the World Cup in the Group Stage.`, type: 'bad' });
                }
            }
        } else if (wc.stage === 'knockout') {
            if (win === 'player') {
                const rnds = ['Round of 16', 'Quarter-Final', 'Semi-Final', 'Final', 'Champion!'];
                const next = rnds[rnds.indexOf(wc.currentRound) + 1];
                if (next === 'Champion!') {
                    tro.push({ season: lge.seasonNumber, name: 'World Cup Winner', icon: '🌍' });
                    wc.isActive = false;
                    newsToday.push({ message: `🌍 GOAT WORLD CUP CHAMPIONS! A historic victory for ${wc.playerCountry}!`, type: 'good' });
                } else {
                    wc.currentRound = next;
                    const possible = ["Brazil Pantanal", "France Chamonix", "Argentina Pampas", "Germany Black Forest", "Italy Tuscany"].filter(t => t !== wc.playerCountry).sort(() => 0.5 - Math.random());
                    wc.nextOpponent = possible[0];
                    wc.nextMatchDate = new Date(new Date(prev.date).setDate(prev.date.getDate() + 4));
                }
            } else {
                wc.isActive = false; newsToday.push({ message: `🌍 Knocked out of the World Cup by ${details.opponentName}.`, type: 'bad' });
            }
        }
        return { 
            ...prev, money: endOfMatchMoney, following: newFollowing, herder: newHerder, farm: newFarm,
            competition: { ...prev.competition, stage: 'result', matchResult: { win, pScore, oScore } }, 
            goats: updatedGoats, record: rec, worldCup: wc, trophyCabinet: tro, 
            news: newsToday, matchHistory: newMatchHistory, managerHistory, scheduledCompetitions: scheduledComps
        };
    } else if (id === 'exhibition') {
        scheduledComps = scheduledComps.filter(c => c.name !== details.title);
        if (win === 'player') {
            const fanBoost = Math.round(newFollowing.fans * 0.15) + 2000;
            newFollowing.fans += fanBoost;
            newFarm.inventory.farmingTools += 1;
            newsToday.unshift({ message: `🎪 EXHIBITION WON! Gained ${fanBoost.toLocaleString()} fans and 1x Farming Tool!`, type: 'good' });
        } else {
            newsToday.unshift({ message: `🎪 Exhibition Lost. The fans were largely unimpressed.`, type: 'bad' });
        }
    } else {
        scheduledComps = scheduledComps.filter(c => c.name !== details.title);
    }

    if (lge.status === 'finished' && !bleat.isActive && !nCup.isActive && !prev.worldCup?.isActive) {
        const pTable = [...allLeagueTables[prev.farm.leagueLevel]].sort((a,b) => b.Pts - a.Pts || calcAWMP(b) - calcAWMP(a));
        const playerPos = pTable.findIndex(t => t.name === prev.farm.name) + 1;
        const playerTableData = pTable[playerPos - 1];
        const seasonMvp = [...updatedGoats].sort((a,b)=>b.value-a.value)[0]?.name;
        const topOverallGoatArr = Object.entries(rec.goatAppearances || {}).sort((a, b) => b[1] - a[1]);
        
        const kitStoreLevel = prev.farm.buildings.kitStore || 1; const avgWQL = getHerdAverages(updatedGoats).WQL;
        const replicaKitIncome = Math.round(newFollowing.fans * (avgWQL / 50) * (kitStoreLevel * 10));
        const shopIncome = Math.round(newFollowing.fans * (prev.farm.buildings.shop * 5));
        const totalIncome = shopIncome + replicaKitIncome;
        
        const preTaxMoney = Math.max(0, endOfMatchMoney + totalIncome);
        const taxPct = generateStat(10, 65); const taxAmount = Math.floor(preTaxMoney * (taxPct / 100));
        let taxNote = taxPct <= 15 ? "Suspicions of dodging tax, but you have a bleating good accountant." : taxPct <= 35 ? "Relatively normal tax paid." : taxPct <= 50 ? "High end tax, but you're seen as a luxury brand, so take the win!" : "Heavy taxation, blame the government or the board for messing up the paperwork, your choice.";
        
        endOfMatchMoney = Math.max(0, preTaxMoney - taxAmount);
        newsToday.unshift({ message: `End of Season Revenue: +$${totalIncome.toLocaleString()} from Shop & Kits!`, type: 'good' });

        let promoRelStatus = 'Retained';
        if (playerPos === 1 && prev.farm.leagueLevel > 1) promoRelStatus = 'Promoted';
        else if (playerPos === 8 && prev.farm.leagueLevel < 5) promoRelStatus = 'Relegated';

        if (playerPos === 1 && prev.farm.leagueLevel === 1) lge.qualifiedForChampionsBleat = true;

        if (lge.goatsUsedThisSeason.length >= prev.goats.length && prev.goats.length > 0 && !rec.managerAwards['Loyal Herder']) {
            newsToday.push({ message: `🏆 Loyal Herder Award unlocked!`, type: 'good' });
            rec.managerAwards['Loyal Herder'] = (rec.managerAwards['Loyal Herder'] || 0) + 1;
        }

        if (playerTableData.L === 0 && !rec.managerAwards['Undefeated']) {
            newsToday.push({ message: `🏆 Undefeated Award unlocked! An Invincible League Season!`, type: 'good' });
            rec.managerAwards['Undefeated'] = (rec.managerAwards['Undefeated'] || 0) + 1;
        }

        lge.goatsUsedThisSeason = [];

        seasonSummaryData = { 
            season: lge.seasonNumber, wins: playerTableData.W, draws: playerTableData.D, losses: playerTableData.L, 
            PF: playerTableData.PF, PA: playerTableData.PA, awmp: calcAWMP(playerTableData), 
            finalPosition: playerPos, MVP: seasonMvp, mostUsedGoat: topOverallGoatArr[0]?.[0] || 'N/A', 
            shopIncome, replicaKitIncome, taxPct, taxAmount, taxNote, preTaxMoney, promoRelStatus 
        };
    }

    return { 
        ...prev, money: endOfMatchMoney, following: newFollowing, herder: newHerder, farm: newFarm,
        competition: { ...prev.competition, stage: 'result', matchResult: { win, pScore, oScore } }, 
        goats: updatedGoats, record: rec, leagueTables: allLeagueTables, league: lge, trophyCabinet: tro, 
        news: newsToday, championsBleat: bleat, nationalCup: nCup, matchHistory: newMatchHistory, 
        managerHistory, scheduledCompetitions: scheduledComps, seasonSummaryData 
    };
};

export const processEndOfSeason = (prev) => {
    let newLeagueTables = { ...prev.leagueTables }; let newPlayerLeagueLevel = prev.farm.leagueLevel;
    let newsToday = [...prev.news]; let tro = [...prev.trophyCabinet];
    
    [1, 2, 3, 4, 5].forEach(level => { newLeagueTables[level] = [...prev.leagueTables[level]].sort((a,b) => b.Pts - a.Pts || calcAWMP(b) - calcAWMP(a)); });

    const pPos = newLeagueTables[newPlayerLeagueLevel].findIndex(t => t.name === prev.farm.name) + 1;
    const leagueDef = leagueStructure.find(l => l.level === newPlayerLeagueLevel);

    if (pPos === 1) { newsToday.push({message: `CHAMPIONS! You won the ${leagueDef.trophy}!`, type: 'good'}); tro.push({season: prev.league.seasonNumber, name: leagueDef.trophy, icon: '🏆'}); } 
    else if (pPos === 8) { newsToday.push({message: `RELEGATED! You received the ${leagueDef.relegationTrophy}.`, type: 'bad'}); tro.push({season: prev.league.seasonNumber, name: leagueDef.relegationTrophy, icon: '🥄'}); }

    let promoted = {}; let relegated = {}; 
    for (let i = 1; i <= 5; i++) { if (i > 1) promoted[i - 1] = newLeagueTables[i][0]; if (i < 5) relegated[i + 1] = newLeagueTables[i][7]; }
    
    let cupTeams = [];
    for (let i = 1; i <= 5; i++) {
        let currentTable = [...newLeagueTables[i]];
        if (i > 1) currentTable = currentTable.filter(t => t.name !== promoted[i - 1].name);
        if (i < 5) currentTable = currentTable.filter(t => t.name !== relegated[i + 1].name);
        if (promoted[i]) { let t = {...promoted[i]}; t.quality = Math.min(100, t.quality + 15); currentTable.push(t); }
        if (relegated[i]) { let t = {...relegated[i]}; t.quality = Math.max(10, t.quality - 15); currentTable.push(t); }
        newLeagueTables[i] = currentTable.map(team => ({...team, P:0, W:0, D:0, L:0, PF:0, PA:0, Pts:0, opponentsPlayed: []}));
        if (i <= 4) cupTeams = cupTeams.concat(newLeagueTables[i].map(t => t.name));
    }

    if (pPos === 1 && newPlayerLeagueLevel > 1) { newPlayerLeagueLevel--; newsToday.push({message: `PROMOTION! Welcome to League ${newPlayerLeagueLevel}.`, type: 'good'}); } 
    else if (pPos === 8 && newPlayerLeagueLevel < 5) { newPlayerLeagueLevel++; newsToday.push({message: `RELEGATION. You drop down to League ${newPlayerLeagueLevel}.`, type: 'bad'}); }

    cupTeams.sort(() => 0.5 - Math.random());
    const initialCupBracket = [];
    for(let i=0; i < cupTeams.length; i+=2) initialCupBracket.push([cupTeams[i], cupTeams[i+1]]);
    const isPlayerInCup = newPlayerLeagueLevel <= 4;
    const playerCupMatch = isPlayerInCup ? initialCupBracket.find(m => m.includes(prev.farm.name)) : null;
    let cupNextOpp = null; let cupNextDate = null;
    
    const mDate = new Date(prev.date); mDate.setUTCDate(mDate.getUTCDate() + (3 - mDate.getUTCDay()) % 7 + 7); 
    if (isPlayerInCup && playerCupMatch) { cupNextOpp = playerCupMatch[0] === prev.farm.name ? playerCupMatch[1] : playerCupMatch[0]; cupNextDate = mDate; }

    let retainedGoats = []; let newAssistants = []; let captainLost = false;

    prev.goats.forEach(g => {
        let goat = { ...g, age: g.age + 1 };
        
        if (goat.age > goat.peakAge) {
            const wanePct = generateStat(5, 12) / 100;
            Object.keys(goat.attributes).forEach(attr => { goat.attributes[attr] = Math.max(1, Math.round(goat.attributes[attr] * (1 - wanePct))); });
            goat.value = recalculateValue(goat);
        }

        let retireChance = 0;
        if (goat.age === 7) retireChance = 0.10; else if (goat.age === 8) retireChance = 0.25; else if (goat.age === 9) retireChance = 0.45; else if (goat.age === 10) retireChance = 0.70; else if (goat.age === 11) retireChance = 0.90; else if (goat.age >= 12) retireChance = 1.0;

        if (Math.random() < retireChance) {
            newAssistants.push({ id: goat.id, name: goat.name, quality: goat.quality, finalValue: goat.value });
            newsToday.unshift({ message: `👴 RETIREMENT: ${goat.name} has retired at age ${goat.age} and joined the staff as an Assistant Herder!`, type: 'good' });
            if (prev.farm.captainId === goat.id) captainLost = true;
        } else {
            retainedGoats.push(goat);
        }
    });

    let rec = { ...prev.record, managerAwards: { ...(prev.record.managerAwards || {}) } };
    const wonLeague = pPos === 1 && prev.farm.leagueLevel === 1;
    const wonCup = tro.some(t => t.season === prev.league.seasonNumber && t.name === 'Goat Association Cup');
    const wonBleat = tro.some(t => t.season === prev.league.seasonNumber && t.name === 'European Champion');

    if (wonLeague && wonCup && wonBleat && !rec.managerAwards['Treble Winners']) {
        newsToday.push({ message: `👑 Treble Winners Award unlocked! The ultimate caprine sweep!`, type: 'good' });
        rec.managerAwards['Treble Winners'] = (rec.managerAwards['Treble Winners'] || 0) + 1;
    }

    const playerTableData = newLeagueTables[newPlayerLeagueLevel][pPos - 1];
    if (pPos === 1 && calcAWMP(playerTableData) < 100 && !rec.managerAwards['Champion Conundrum']) {
        newsToday.push({ message: `🧩 Champion Conundrum Award unlocked! Won a league with AWMP under 100%.`, type: 'good' });
        rec.managerAwards['Champion Conundrum'] = (rec.managerAwards['Champion Conundrum'] || 0) + 1;
    }

    let newStats = { ...prev.herder.stats };
    let endOfSeasonXp = 25; 
    if (pPos === 1) endOfSeasonXp += 100;
    if (wonCup) endOfSeasonXp += 50;
    if (wonBleat) endOfSeasonXp += 100;
    
    newStats.xp += endOfSeasonXp;
    while (newStats.xp >= newStats.nextLevelXp) {
        newStats.xp -= newStats.nextLevelXp;
        newStats.level += 1;
        newStats.nextLevelXp = newStats.level * 100;
        
        const statKeys = ['tacticalNous', 'motivation', 'scouting'];
        const boostStat = statKeys[Math.floor(Math.random() * 3)];
        newStats[boostStat] += 1;
        
        const statName = boostStat === 'tacticalNous' ? 'Tactical Nous' : boostStat === 'motivation' ? 'Motivation' : 'Scouting Eye';
        newsToday.unshift({ message: `🎉 LEVEL UP! You reached Manager Level ${newStats.level}! (+1 ${statName})`, type: 'good' });
    }
    let newHerder = { ...prev.herder, stats: newStats };

    const academyLevel = prev.farm.buildings.youthAcademy || 1;
    const youthIntake = createWonderKid(academyLevel);
    newsToday.unshift({ message: `🌟 YOUTH INTAKE: The academy has produced a Wonder Kid! Welcome to the herd, ${youthIntake.name}!`, type: 'good' });

    let newLeague = { ...prev.league, seasonDay: 0, status: 'active', seasonNumber: prev.league.seasonNumber + 1, hasRolledDiceThisSeason: false };
    let newManagerHistory = [...(prev.managerHistory || [])];
    if (prev.seasonSummaryData) newManagerHistory.unshift({...prev.seasonSummaryData, finalLeagueLevel: newPlayerLeagueLevel});

    return { 
        ...prev, seasonSummaryData: null, needsFormationSelection: true, needsCaptainSelection: true, activeSponsor: null, 
        league: newLeague, leagueTables: newLeagueTables, record: rec, herder: newHerder,
        farm: { ...prev.farm, leagueLevel: newPlayerLeagueLevel, captainId: captainLost ? null : prev.farm.captainId },
        nationalCup: { isActive: isPlayerInCup, currentRound: 'Round of 32', bracket: initialCupBracket, nextMatchDate: cupNextDate, nextOpponent: cupNextOpp },
        goats: [...retainedGoats, youthIntake], 
        assistantHerders: [...(prev.assistantHerders || []), ...newAssistants],
        news: newsToday, trophyCabinet: tro, managerHistory: newManagerHistory
    };
}
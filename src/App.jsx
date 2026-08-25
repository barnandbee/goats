import React, { useState, useEffect } from 'react';
import { DollarSign, Moon, Home, Shield, Users, Sun, Megaphone, ShoppingCart, Trophy, Save, Upload, FilePlus2, Info } from 'lucide-react';

import { advanceDay, startCompetition, processEndOfSeason, generateMarketGoats } from './engine';
import { createGoat, getUniqueId, generateStat, resolveGoatName, checkGlobalAchievements, recalculateValue, createWonderKid, applyTeamRename } from './utils';
import { majorTournamentsPool, rivalHerdNames, europeanTeams, leagueStructure } from './constants';

import { Notification } from './components/Shared';
import { GoatProfile, RivalOfferModal, FormationSelectorModal, CompetitionModal, SeasonSummaryModal, SponsorshipOfferModal, CaptainSelectorModal, DiceOfDestinyModal, WorldCupSetupModal } from './components/Modals';
import { CharacterCreation, Dashboard, ManagerProfileScreen, FollowingScreen, HerdList, GoatMarketScreen, PastureManagementScreen, CompetitionsScreen, AboutScreen } from './screens/Screens';

export const worldCupTeams = [
    "Argentina Pampas", "France Chamonix", "Brazil Pantanal", "England New Forest",
    "Belgium Ardennes", "Portugal Algarve", "Netherlands Veluwe", "Spain Andalusia",
    "Italy Tuscany", "Croatia Dalmatia", "USA Yellowstone", "Colombia Andes",
    "Morocco Atlas", "Switzerland Alps", "Uruguay Grasslands", "Germany Black Forest",
    "Senegal Savannah", "Japan Hokkaido", "Denmark Jutland", "Mexico Sonora",
    "Sweden Lapland", "South Korea Jeju", "Poland Tatra", "Iran Zagros",
    "Serbia Balkans", "Wales Snowdonia", "Ukraine Steppe", "Peru Sacred Valley",
    "Australia Outback", "Ecuador Galapagos", "Scotland Highlands", "Canada Rockies"
];

const Header = ({ herder, farm, money, date, onAdvanceDay, hasPendingMatch }) => (
    <header className="bg-gray-800 text-white p-3 shadow-lg flex flex-wrap justify-between items-center sticky top-0 z-30 border-b border-gray-700">
        <div className="mb-2 md:mb-0"><h1 className="text-xl font-bold text-green-400">{farm}</h1><p className="text-sm text-gray-300">Herder: {herder}</p></div>
        <div className="flex items-center space-x-4">
            <div className="text-center"><p className="text-lg font-semibold text-yellow-400 flex items-center"><DollarSign className="w-4 h-4 mr-1" /> ${money.toLocaleString()}</p></div>
            <div className="text-center"><p className="text-sm text-gray-400">Date</p><p className="font-semibold">{date.toDateString()}</p></div>
            <button onClick={onAdvanceDay} disabled={hasPendingMatch} className={`${hasPendingMatch ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-2 px-4 rounded-lg shadow-md transition transform flex items-center`}>
                <Moon className="w-5 h-5 mr-2" /> {hasPendingMatch ? 'Match Pending' : 'Advance Day'}
            </button>
        </div>
    </header>
);

const Sidebar = ({ currentScreen, setScreen, onSave, onLoad, onNewGame }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home }, 
        { id: 'manager', label: 'Manager Profile', icon: Shield }, 
        { id: 'herd', label: 'My Herd', icon: Users }, 
        { id: 'pastures', label: 'Pastures', icon: Sun }, 
        { id: 'following', label: 'Following', icon: Megaphone }, 
        { id: 'market', label: 'Goat Market', icon: ShoppingCart }, 
        { id: 'competitions', label: 'Competitions', icon: Trophy },
        { id: 'about', label: 'About', icon: Info }
    ];
    return (
        <aside className="w-16 md:w-56 bg-gray-800 text-white p-2 md:p-4 flex flex-col justify-between transition-all duration-300 border-r border-gray-700">
            <div>
                <div className="mb-8 text-center hidden md:block"><span className="text-2xl font-black text-green-400 italic">GHM<span className="text-white">26</span></span></div>
                <nav><ul>{navItems.map(item => (<li key={item.id} className="mb-2"><button onClick={() => setScreen(item.id)} className={`w-full flex items-center p-3 rounded-lg transition duration-200 ${currentScreen === item.id ? 'bg-green-600 text-white shadow-inner' : 'hover:bg-gray-700 text-gray-300'}`}><item.icon className="h-6 w-6 md:mr-3" /><span className="hidden md:inline font-semibold">{item.label}</span></button></li>))}</ul></nav>
            </div>
            <div className="space-y-2">
                <button onClick={onSave} className="w-full flex items-center p-3 rounded-lg transition duration-200 text-gray-400 hover:bg-gray-700 hover:text-white"><Save className="h-6 w-6 md:mr-3" /><span className="hidden md:inline">Save</span></button>
                <button onClick={onLoad} className="w-full flex items-center p-3 rounded-lg transition duration-200 text-gray-400 hover:bg-gray-700 hover:text-white"><Upload className="h-6 w-6 md:mr-3" /><span className="hidden md:inline">Load</span></button>
                <button onClick={onNewGame} className="w-full flex items-center p-3 rounded-lg transition duration-200 text-gray-400 hover:bg-red-900 hover:text-white"><FilePlus2 className="h-6 w-6 md:mr-3" /><span className="hidden md:inline">New</span></button>
            </div>
        </aside>
    );
};

export default function App() {
    const [gameState, setGameState] = useState(null);
    const [currentScreen, setScreen] = useState('dashboard');
    const [selectedGoat, setSelectedGoat] = useState(null);
    const [showDiceModal, setShowDiceModal] = useState(false);
    const [notification, setNotification] = useState({ message: null, type: null });

    useEffect(() => {
        const fontLink = document.createElement('link'); fontLink.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800;900&display=swap'; fontLink.rel = 'stylesheet'; document.head.appendChild(fontLink);
        const link = document.querySelector("link[rel~='icon']") || document.createElement('link'); link.type = 'image/svg+xml'; link.rel = 'icon'; link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐐</text></svg>'; document.getElementsByTagName('head')[0].appendChild(link);
    }, []);

    const showNotification = (message, type = 'success') => { setNotification({ message, type }); setTimeout(() => setNotification({ message: null, type: null }), 4000); };
    
    const handleStartGame = (profile) => {
        let initialGoats = []; let money = profile.herd.startMoney;
        profile.herd.goatQualities.forEach(q => initialGoats.push(createGoat(q, profile.style.id)));
        initialGoats.push(createWonderKid(1));
        
        let herderName = profile.name; let kitCol = profile.kitColor; let fName = profile.herd.name; let tro = [];

        if (herderName.toLowerCase() === 'turnip scart') { kitCol = '#808080'; fName = 'Turnipville, Nebraska'; tro.push({ season: 1, name: 'Better Than A Carrot', icon: '🥕' }); }

        const startDate = new Date(Date.UTC(2027, 2, 1, 12, 0, 0));
        const pickedComps = [...majorTournamentsPool].sort(() => 0.5 - Math.random()).slice(0, 2).map(c => { const d = new Date(startDate); d.setUTCDate(d.getUTCDate() + generateStat(10, 50)); return { ...c, date: d.toISOString() }; });

        let allLeagueTables = {}; let rivalIndex = 0; let cupTeams = [];
        for (let level = 1; level <= 5; level++) {
            let teams = []; const aiQuality = leagueStructure.find(l => l.level === level).aiQuality;
            if (level === profile.herd.leagueLevel) teams.push({ id: getUniqueId(), name: fName, P:0, W:0, D:0, L:0, PF:0, PA:0, Pts:0, opponentsPlayed: [], quality: aiQuality });
            while (teams.length < 8) { teams.push({ id: getUniqueId(), name: rivalHerdNames[rivalIndex % rivalHerdNames.length], P:0, W:0, D:0, L:0, PF:0, PA:0, Pts:0, opponentsPlayed: [], quality: aiQuality }); rivalIndex++; }
            allLeagueTables[level] = teams;
            if (level <= 4) cupTeams = cupTeams.concat(teams.map(t => t.name));
        }

        cupTeams.sort(() => 0.5 - Math.random());
        const initialCupBracket = [];
        for(let i=0; i < cupTeams.length; i+=2) initialCupBracket.push([cupTeams[i], cupTeams[i+1]]);
        
        const isPlayerInCup = profile.herd.leagueLevel <= 4;
        const playerCupMatch = isPlayerInCup ? initialCupBracket.find(m => m.includes(fName)) : null;
        let cupNextOpp = null; let cupNextDate = null;
        if (isPlayerInCup && playerCupMatch) {
            cupNextOpp = playerCupMatch[0] === fName ? playerCupMatch[1] : playerCupMatch[0];
            const cDate = new Date(startDate); cDate.setUTCDate(cDate.getUTCDate() + (3 - cDate.getUTCDay()) % 7 + 7); 
            cupNextDate = cDate;
        }

        const initialState = { 
            needsFormationSelection: true, needsCaptainSelection: true, needsWorldCupSetup: false, seasonSummaryData: null, rivalOffer: null, sponsorshipOffer: null, activeSponsor: null,
            herder: { name: herderName, style: profile.style, stats: { level: 1, xp: 0, nextLevelXp: 100, tacticalNous: 5, motivation: 5, scouting: 5 } }, 
            farm: { name: fName, reputation: profile.herd.reputation, kitColor: kitCol, formation: null, captainId: null, inventory: { farmingTools: 0 }, buildings: { trainingPitch: 1, stadium: 1, shop: 1, kitStore: 1, medicalCentre: 1, youthAcademy: 1 }, leagueLevel: profile.herd.leagueLevel }, 
            following: { fans: profile.herd.startFans },
            goats: initialGoats, assistantHerders: [], marketGoats: generateMarketGoats(profile.herd.leagueLevel), money: money, date: startDate, competition: null, news: [{message: `Welcome to ${fName}! Get settled in.`, type: 'good'}], scheduledCompetitions: pickedComps, 
            league: { seasonNumber: 1, status: 'active', seasonDay: 0, offSeasonEndDate: null, qualifiedForChampionsBleat: false, goatsUsedThisSeason: [], hasRolledDiceThisSeason: false }, 
            leagueTables: allLeagueTables, 
            record: { wins: 0, losses: 0, draws: 0, totalMatches: 0, biggestWinMargin: 0, biggestLossMargin: 0, currentWinStreak: 0, longestWinStreak: 0, currentLossStreak: 0, longestLossStreak: 0, goatAppearances: {}, managerAwards: {}, turnipSquaredAchieved: false }, 
            trophyCabinet: tro, matchHistory: [], managerHistory: [], 
            championsBleat: {isQualified: false, isActive: false, currentRound: null, bracket: [], nextMatchDate: null, nextOpponent: null},
            nationalCup: { isActive: isPlayerInCup, currentRound: 'Round of 32', bracket: initialCupBracket, nextMatchDate: cupNextDate, nextOpponent: cupNextOpp },
            worldCup: { isActive: false, playerCountry: null, playerSquadIds: [], stage: 'group', currentRound: null, groups: null, bracket: null, nextMatchDate: null, nextOpponent: null }
        };
        setGameState(checkGlobalAchievements(initialState));
    };

    const handleSaveGame = () => { localStorage.setItem('GHM_SAVE', JSON.stringify(gameState)); showNotification('Saved!'); };
    const handleLoadGame = () => {
        try {
            const s = localStorage.getItem('GHM_SAVE');
            if (s) {
                const l = JSON.parse(s);
                l.date = new Date(l.date);
                if(l.league.offSeasonEndDate) l.league.offSeasonEndDate = new Date(l.league.offSeasonEndDate);
                if(l.championsBleat?.nextMatchDate) { l.championsBleat.nextMatchDate = new Date(l.championsBleat.nextMatchDate); if (l.championsBleat.nextMatchDate.getUTCDay() === 3) l.championsBleat.nextMatchDate.setUTCDate(l.championsBleat.nextMatchDate.getUTCDate() - 1); }
                if(l.nationalCup?.nextMatchDate) l.nationalCup.nextMatchDate = new Date(l.nationalCup.nextMatchDate);
                if(!l.nationalCup) l.nationalCup = { isActive: false, currentRound: null, bracket: [], nextMatchDate: null, nextOpponent: null };
                if(!l.assistantHerders) l.assistantHerders = []; 
                if(l.league.hasRolledDiceThisSeason === undefined) l.league.hasRolledDiceThisSeason = false;
                if(!l.farm.inventory) l.farm.inventory = { farmingTools: 0 };
                if(!l.worldCup) l.worldCup = { isActive: false, playerCountry: null, playerSquadIds: [], stage: 'group', currentRound: null, groups: null, bracket: null, nextMatchDate: null, nextOpponent: null };
                if(l.worldCup?.nextMatchDate) l.worldCup.nextMatchDate = new Date(l.worldCup.nextMatchDate);

                setGameState(checkGlobalAchievements(l)); showNotification('Loaded!');
            }
        } catch(e) { showNotification('Load Error', 'error'); }
    };

    const handleDiceComplete = (d1, d2, goatId, cost) => {
        setGameState(p => {
            let newMoney = p.money - cost;
            let newsMsg = ''; let newGoats = [...p.goats]; let isDisaster = false;

            if (d1 === d2) {
                if (d1 === 6) {
                    newMoney = 0; isDisaster = true; newsMsg = `🎲 DISASTER! Rolled Double 6. All funds lost!`;
                } else {
                    const buffAmount = d1 === 5 ? 2 : 1; const gIndex = newGoats.findIndex(g => g.id === goatId);
                    if (gIndex > -1) {
                        let goat = {...newGoats[gIndex]}; let attrsObj = {...goat.attributes};
                        Object.keys(attrsObj).forEach(attr => { attrsObj[attr] += buffAmount; goat.potential[attr] = Math.max(goat.potential[attr], attrsObj[attr]); });
                        goat.attributes = attrsObj; goat.value = recalculateValue(goat); newGoats[gIndex] = goat;
                        newsMsg = `🎲 SUCCESS! Double ${d1}. ${goat.name} gained +${buffAmount} to ALL attributes!`;
                    }
                }
            } else { newsMsg = `🎲 Rolled a ${d1} and a ${d2}. No effect. You lost the $${cost.toLocaleString()} fee.`; }

            return checkGlobalAchievements({ ...p, money: newMoney, goats: newGoats, league: { ...p.league, hasRolledDiceThisSeason: true }, news: [{ message: newsMsg, type: isDisaster ? 'bad' : d1===d2 ? 'good' : 'bad' }, ...p.news] });
        });
        setShowDiceModal(false);
    };

    const handleUseTool = (goatId) => {
        setGameState(p => {
            if (!p.farm.inventory || p.farm.inventory.farmingTools <= 0) return p;
            const newGoats = [...p.goats]; const gIndex = newGoats.findIndex(g => g.id === goatId);
            if (gIndex === -1) return p;
            
            const goat = { ...newGoats[gIndex] };
            const attrs = ['AGI', 'STA', 'STR', 'SPD', 'FOR', 'SEL', 'DIG', 'BRV', 'DIS', 'INT', 'MYL', 'MQL', 'WQL'];
            const buffAttrs = attrs.sort(() => 0.5 - Math.random()).slice(0, 3);
            buffAttrs.forEach(attr => { goat.attributes[attr] += 1; goat.potential[attr] = Math.max(goat.potential[attr], goat.attributes[attr]); });
            goat.value = recalculateValue(goat); newGoats[gIndex] = goat;

            return checkGlobalAchievements({ ...p, goats: newGoats, farm: { ...p.farm, inventory: { ...p.farm.inventory, farmingTools: p.farm.inventory.farmingTools - 1 } }, news: [{ message: `🛠️ Farming Tool Applied! ${goat.name} gained +1 to ${buffAttrs.join(', ')}.`, type: 'good' }, ...p.news] });
        });
    };

    const handleWorldCupConfirm = (country, selectedIds) => {
        setGameState(p => {
            let wc = { ...p.worldCup, playerCountry: country, playerSquadIds: selectedIds, isActive: true, stage: 'group', currentRound: 'Matchday 1' };
            let availableTeams = worldCupTeams.filter(t => t !== country).sort(() => 0.5 - Math.random());
            let groups = { A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [] };
            
            groups.A.push({ name: country, P:0, W:0, D:0, L:0, PF:0, PA:0, Pts:0 });
            for(let i=0; i<3; i++) groups.A.push({ name: availableTeams.pop(), P:0, W:0, D:0, L:0, PF:0, PA:0, Pts:0 });
            ['B','C','D','E','F','G','H'].forEach(g => { for(let i=0; i<4; i++) groups[g].push({ name: availableTeams.pop(), P:0, W:0, D:0, L:0, PF:0, PA:0, Pts:0 }); });
            
            wc.groups = groups;
            const mDate = new Date(p.date); mDate.setUTCDate(mDate.getUTCDate() + 5);
            wc.nextMatchDate = mDate; wc.nextOpponent = groups.A[1].name;

            return { ...p, needsWorldCupSetup: false, worldCup: wc, news: [{message: `🌍 The Goat World Cup begins! You are managing ${country}!`, type: 'good'}, ...p.news] };
        });
    };

    if (!gameState) return <CharacterCreation onStartGame={handleStartGame} />;

    const render = () => {
        switch (currentScreen) {
            case 'manager': return <ManagerProfileScreen herder={gameState.herder} farm={gameState.farm} farmMoney={gameState.money} league={gameState.league} record={gameState.record} trophies={gameState.trophyCabinet} historyArr={gameState.managerHistory} onRenameTeam={(newName) => setGameState(p => applyTeamRename(p, newName))} onRenameManager={(newName) => setGameState(p => ({...p, herder: {...p.herder, name: newName}}))} onOpenDiceModal={() => setShowDiceModal(true)} />;
            case 'following': return <FollowingScreen following={gameState.following} farmBuildings={gameState.farm.buildings} money={gameState.money} onUpgradeBuilding={(id, cost) => setGameState(p => checkGlobalAchievements({...p, money: Math.max(0, p.money - cost), farm: {...p.farm, buildings: {...p.farm.buildings, [id]: (p.farm.buildings[id] || 1) + 1}}}))} />;
            case 'herd': return <HerdList goats={gameState.goats} captainId={gameState.farm.captainId} onSelectGoat={setSelectedGoat} onSellGoat={(g)=>setGameState(p=>checkGlobalAchievements({...p, money: p.money+g.value, goats: p.goats.filter(x=>x.id!==g.id)}))} />;
            case 'market': return <GoatMarketScreen marketGoats={gameState.marketGoats || []} money={gameState.money} onSelectGoat={setSelectedGoat} onBuyGoat={(g, isRival)=>{
                setGameState(p=>{
                    const cost = g.value || 0; const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                    const newGoat = { ...g, name: resolveGoatName(g.name, p.goats), id: uniqueId };
                    const fanBoost = newGoat.value > 10000 ? Math.floor(Math.random() * 101) + 50 : 0;
                    let newRecord = { ...p.record, managerAwards: { ...(p.record?.managerAwards || {}) } };
                    let newsArr = [...(p.news || [])];
                    if (!newRecord.managerAwards['You Have Bought Yourself A Goat']) { newRecord.managerAwards['You Have Bought Yourself A Goat'] = 1; newsArr.unshift({ message: `🏆 'You Have Bought Yourself A Goat' Award unlocked! Welcome to the market.`, type: 'good' }); }
                    return checkGlobalAchievements({ ...p, money: Math.max(0, p.money - cost), goats: [...(p.goats || []), newGoat], following: { fans: (p.following?.fans || 0) + fanBoost }, marketGoats: (p.marketGoats || []).filter(mg => mg.id !== g.id), record: newRecord, news: newsArr });
                })
            }} />;
            case 'pastures': return <PastureManagementScreen goats={gameState.goats} assistantHerders={gameState.assistantHerders || []} farmInventory={gameState.farm.inventory} onUseTool={handleUseTool} onUpdateTraining={(id,f)=>setGameState(p=>({...p, goats: p.goats.map(g=>g.id===id?{...g, trainingFocus:f}:g)}))} onUpdateAllTraining={(f)=>setGameState(p=>({...p, goats: p.goats.map(g=> (g.condition >= 40 || f === 'resting') ? {...g, trainingFocus:f} : g)}))} />;
            case 'competitions': return <CompetitionsScreen {...gameState} leagueTable={gameState.leagueTables[gameState.farm.leagueLevel]} playerFarmName={gameState.farm.name} playerLeagueLevel={gameState.farm.leagueLevel} onActivateCompetition={(c)=>setGameState(p=>({...p, competition: { id: 'exhibition', isActive: true, stage: 'select', prize: 0, details: { title: c.name, opponentName: `${c.name} All-Stars`, opponentQuality: Math.min(95, 100 - (p.farm.leagueLevel * 15)), requiredGoats: c.details?.requiredGoats || 3, keyAttributes: c.details?.keyAttributes || ['AGI', 'STA', 'FOR'] } }}))} currentDate={gameState.date} />;
            case 'about': return <AboutScreen record={gameState.record} />;
            default: return <Dashboard {...gameState} leagueTable={gameState.leagueTables[gameState.farm.leagueLevel]} trophies={gameState.trophyCabinet} difficultyMultiplier={gameState.difficultyMultiplier || 1.0} setDifficultyMultiplier={(val) => setGameState(p => ({...p, difficultyMultiplier: val}))} activeSponsor={gameState.activeSponsor} competition={gameState.competition} onResumeMatch={() => setGameState(p => ({...p, competition: {...p.competition, isActive: true}}))} />;
        }
    };

    const isWorldCupMatch = gameState.competition?.id === 'worldCup';
    const compGoats = isWorldCupMatch ? gameState.goats.filter(g => gameState.worldCup.playerSquadIds.includes(g.id)) : gameState.goats;

    return (
        <div className="bg-gray-900 min-h-screen text-white flex relative" style={{ fontFamily: "'Manrope', sans-serif" }}>
            <Sidebar currentScreen={currentScreen} setScreen={setScreen} onSave={handleSaveGame} onLoad={handleLoadGame} onNewGame={()=>setGameState(null)} />
            <main className="flex-1 overflow-hidden flex flex-col">
                <Header herder={gameState.herder.name} farm={gameState.farm.name} money={gameState.money} date={gameState.date} hasPendingMatch={!!gameState.competition && gameState.competition.stage !== 'result'} onAdvanceDay={() => setGameState(p => checkGlobalAchievements(advanceDay(p)))} />
                <div className="flex-1 overflow-y-auto p-4">{render()}</div>
            </main>
            <Notification message={notification.message} type={notification.type} onDismiss={()=>setNotification({message:null})} />
            
            {gameState.needsWorldCupSetup && <WorldCupSetupModal goats={gameState.goats} playerCountry={gameState.worldCup?.playerCountry} worldCupTeams={worldCupTeams} onConfirm={handleWorldCupConfirm} />}
            {!gameState.competition && gameState.needsFormationSelection && <FormationSelectorModal onConfirm={(formation)=>setGameState(p=>({...p, farm: {...p.farm, formation}, needsFormationSelection: false}))} />}
            {!gameState.competition && !gameState.needsFormationSelection && gameState.needsCaptainSelection && gameState.goats.length > 0 && (
                <CaptainSelectorModal goats={gameState.goats} onConfirm={(id) => {
                    setGameState(p => {
                        const targetGoat = p.goats.find(g => g.id === id); const attrs = Object.keys(targetGoat.attributes); const randomAttr = attrs[Math.floor(Math.random() * attrs.length)];
                        const newGoats = p.goats.map(g => { if (g.id === id) { const updatedGoat = { ...g, attributes: { ...g.attributes, [randomAttr]: g.attributes[randomAttr] + 2 } }; updatedGoat.potential[randomAttr] = Math.max(updatedGoat.potential[randomAttr], updatedGoat.attributes[randomAttr]); updatedGoat.value = recalculateValue(updatedGoat); return updatedGoat; } return g; });
                        return { ...p, needsCaptainSelection: false, farm: { ...p.farm, captainId: id }, goats: newGoats, news: [{ message: `${targetGoat.name} named Captain! +2 to ${randomAttr}.`, type: 'good' }, ...p.news] };
                    });
                }} />
            )}

            {!gameState.competition && !gameState.needsCaptainSelection && !gameState.needsWorldCupSetup && gameState.seasonSummaryData && (
                <SeasonSummaryModal data={gameState.seasonSummaryData} onContinue={() => {
                    setGameState(p => {
                        const nextState = processEndOfSeason(p);
                        const startDate = new Date(nextState.date);
                        
                        nextState.scheduledCompetitions = [...majorTournamentsPool].sort(() => 0.5 - Math.random()).slice(0, 2).map(c => { const d = new Date(startDate); d.setUTCDate(d.getUTCDate() + generateStat(10, 50)); return { ...c, date: d.toISOString() }; });

                        if(nextState.league.qualifiedForChampionsBleat) {
                            nextState.championsBleat.isQualified = true; nextState.championsBleat.isActive = true; nextState.championsBleat.currentRound = 'Last 16';
                            const allTeams = [nextState.farm.name, ...[...europeanTeams].sort(() => 0.5 - Math.random()).slice(0, 15)];
                            const bracket = []; for(let i = 0; i < allTeams.length; i+=2) bracket.push([allTeams[i], allTeams[i+1]]);
                            nextState.championsBleat.bracket = bracket;
                            const playerMatch = bracket.find(m => m.includes(nextState.farm.name));
                            nextState.championsBleat.nextOpponent = playerMatch[0] === nextState.farm.name ? playerMatch[1] : playerMatch[0];
                            const mDate = new Date(startDate); 
                            mDate.setUTCDate(mDate.getUTCDate() + (9 - mDate.getUTCDay()) % 7 + 7);
                            nextState.championsBleat.nextMatchDate = mDate;
                            nextState.news.unshift({ message: `Qualified for Champions Bleat! Next vs ${nextState.championsBleat.nextOpponent}.`, type: 'good' });
                        }
                        nextState.league.qualifiedForChampionsBleat = false;
                        
                        // WORLD CUP TRIGGER (End of Season 4, 8, 12, etc.)
                        if (nextState.league.seasonNumber % 4 === 1 && nextState.league.seasonNumber > 1) {
                            nextState.needsWorldCupSetup = true;
                        }
                        
                        return checkGlobalAchievements(nextState);
                    });
                }} />
            )}

            {gameState.rivalOffer && <RivalOfferModal offer={gameState.rivalOffer} onAccept={()=>{ setGameState(p=>{ if(p.rivalOffer.type === 'forced' || p.rivalOffer.type === 'cash') { return checkGlobalAchievements({...p, money: p.money + p.rivalOffer.price, goats: p.goats.filter(x => x.id !== p.rivalOffer.goat.id), rivalOffer: null}); } else if (p.rivalOffer.type === 'trade') { const newGoat = { ...p.rivalOffer.tradeGoat, name: resolveGoatName(p.rivalOffer.tradeGoat.name, p.goats), id: getUniqueId() }; return checkGlobalAchievements({...p, goats: [...p.goats.filter(x => x.id !== p.rivalOffer.goat.id), newGoat], rivalOffer: null}); } }); }} onDecline={()=>{setGameState(p=>({...p, goats:p.goats.map(g=>g.id===p.rivalOffer.goat.id?{...g, morale:g.morale-15}:g), rivalOffer: null}));}} />}
            {gameState.sponsorshipOffer && <SponsorshipOfferModal offer={gameState.sponsorshipOffer} onAccept={()=>{ setGameState(p=>{ return checkGlobalAchievements({...p, money: p.money + p.sponsorshipOffer.amount, activeSponsor: p.sponsorshipOffer.sponsorName, sponsorshipOffer: null, news: [{message: `Signed sponsorship with ${p.sponsorshipOffer.sponsorName}!`, type: 'good'}, ...p.news]}); }); }} onDecline={()=>{setGameState(p=>({...p, sponsorshipOffer: null}));}} />}

            {gameState.competition?.isActive && <CompetitionModal competition={gameState.competition} playerFarm={gameState.farm} playerGoats={compGoats} onStart={(assignments, isForfeit) => setGameState(p => checkGlobalAchievements(startCompetition(p, assignments, isForfeit)))} onClose={(isFinished) => setGameState(p => {
                if (isFinished === true) return { ...p, competition: null };
                return { ...p, competition: { ...p.competition, isActive: false } };
            })} />}

            {showDiceModal && <DiceOfDestinyModal goats={gameState.goats} money={gameState.money} onClose={() => setShowDiceModal(false)} onComplete={handleDiceComplete} />}
            <GoatProfile goat={selectedGoat} isCaptain={gameState.farm.captainId === selectedGoat?.id} onClose={()=>setSelectedGoat(null)} />
        </div>
    );
}
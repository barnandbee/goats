import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Users, ListOrdered, Trophy, ClipboardList, CalendarDays, Megaphone, Building, ShoppingCart, Sun, Shield, Star, Globe, XCircle, Shirt, HeartPulse, GraduationCap } from 'lucide-react';
import { StatBar, StatCard, SortableHeader } from '../components/Shared';
import { tacticalRoles, trainingRegimes, startingHerds, managerStyles } from '../constants';
import { calcAWMP, createGoat } from '../utils';

export const CharacterCreation = ({ onStartGame }) => {
    const [name, setName] = useState(''); 
    const [style, setStyle] = useState(null); 
    const [herd, setHerd] = useState(null); 
    const [kitColor, setKitColor] = useState('#34D399');
    const kitColors = ['#34D399', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6'];
    const baseUrl = import.meta.env.BASE_URL;

    return (
        <div className="min-h-screen text-white flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.75), rgba(17, 24, 39, 0.90)), url('${baseUrl}goat_landing.png')` }}>
            <div className="w-full max-w-6xl bg-gray-800/80 backdrop-blur-md rounded-xl shadow-2xl p-8 space-y-8 border border-gray-700 animate-fade-in-up">
                <div className="text-center">
                    <h1 className="text-5xl font-black text-green-400 tracking-tighter italic drop-shadow-lg">GHM<span className="text-white">2027</span></h1>
                    <p className="text-gray-300 mt-2 font-bold tracking-widest uppercase text-sm">Professional Caprine Management Simulation</p>
                </div>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onStartGame({ name, style: managerStyles.find(s=>s.id===style), herd: startingHerds.find(h=>h.id===herd), kitColor }); }}>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-lg font-medium text-gray-200 mb-2">Manager Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name..." className="w-full bg-gray-900/60 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition" required />
                        </div>
                        <div>
                            <label className="block text-lg font-medium text-gray-200 mb-2">Primary Kit Color</label>
                            <div className="flex space-x-3 flex-wrap gap-y-2">
                                {kitColors.map(color => (
                                    <button key={color} type="button" onClick={() => setKitColor(color)} className={`w-10 h-10 rounded-full border-4 transition-transform ${kitColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'}`} style={{ backgroundColor: color }} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-200 mb-2">Managerial Style</label>
                        <div className="grid md:grid-cols-3 gap-4">
                            {managerStyles.map(s => (
                                <div key={s.id} onClick={() => setStyle(s.id)} className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${style === s.id ? 'border-green-500 bg-green-900/40 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'border-gray-700 bg-gray-900/60 hover:border-gray-500 hover:bg-gray-800/80'}`}>
                                    <h3 className="font-bold text-lg text-white">{s.name}</h3><p className="text-xs text-gray-300 mt-1">{s.desc}</p><p className="text-xs text-green-400 mt-2 font-bold">{s.bonus}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-200 mb-2">Select Starting Club</label>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {startingHerds.map(h => (
                                <div key={h.id} onClick={() => setHerd(h.id)} className={`p-4 rounded-lg cursor-pointer border-2 transition-all flex flex-col justify-between ${herd === h.id ? 'border-green-500 bg-green-900/40 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'border-gray-700 bg-gray-900/60 hover:border-gray-500 hover:bg-gray-800/80'}`}>
                                    <div>
                                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-widest">League {h.leagueLevel}</div>
                                        <h3 className="font-bold text-md text-white leading-tight mb-2">{h.name}</h3>
                                        <div className="text-yellow-400 text-xs mb-2">{h.reputation}</div>
                                        <p className="text-xs text-gray-300 mb-3 leading-tight">{h.challenge}</p>
                                    </div>
                                    <div>
                                        <div className="text-xs font-mono text-green-400 mb-1">${(h.startMoney/1000).toFixed(0)}k Budget</div>
                                        <p className="text-[10px] text-purple-400 font-bold uppercase">{h.perk}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button type="submit" disabled={!name || !style || !herd} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700/50 disabled:text-gray-500 text-white font-black py-4 rounded-lg text-xl uppercase tracking-widest transition shadow-lg backdrop-blur-sm">Begin Career</button>
                </form>
            </div>
        </div>
    );
};

export const Dashboard = ({ herder, farm, goats, news, record, trophies, league, leagueTable, date, difficultyMultiplier, setDifficultyMultiplier, activeSponsor, competition, onResumeMatch }) => {
    const topGoatsByValue = [...goats].sort((a, b) => b.value - a.value).slice(0, 5);
    const chartData = topGoatsByValue.map(g => ({ name: g.name.split(' ')[0], Value: g.value }));
    let upcomingMatch = null;
    if (league.status === 'active') {
        const playerTeam = leagueTable.find(t => t.name === farm.name);
        const opp = leagueTable.find(t => t.name !== farm.name && !playerTeam.opponentsPlayed.includes(t.name));
        if (opp) { 
            let daysUntilSat = 6 - date.getUTCDay(); 
            if (daysUntilSat <= 0) daysUntilSat += 7; 
            upcomingMatch = { opponent: opp.name, days: daysUntilSat }; 
        }
    }
    let diffLabel = 'Easy Grass Nibbling'; let diffColor = 'text-green-400'; let diffThumb = 'bg-green-500';
    if (difficultyMultiplier > 1.66) { diffLabel = 'Hard Grass'; diffColor = 'text-red-400'; diffThumb = 'bg-red-500'; }
    else if (difficultyMultiplier > 1.3) { diffLabel = 'Grass Middling'; diffColor = 'text-yellow-400'; diffThumb = 'bg-yellow-500'; }

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-4">
                <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">Welcome, {herder.name}!</h1>
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 w-full md:w-64">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2 flex justify-between"><span>Difficulty</span><span className={diffColor}>{diffLabel}</span></p>
                    <input type="range" min="1.0" max="2.0" step="0.05" value={difficultyMultiplier || 1.0} onChange={(e) => setDifficultyMultiplier(parseFloat(e.target.value))} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${diffThumb} opacity-80 hover:opacity-100 transition`} style={{ background: 'var(--tw-colors-gray-600)' }}/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard icon={<Users className="text-green-400"/>} label="Total Goats" value={goats.length} />
                <StatCard icon={<ListOrdered className="text-blue-400"/>} label="Total Record" value={`${record.wins}-${record.draws}-${record.losses}`} />
                <StatCard icon={<Trophy className="text-yellow-400"/>} label="Trophies" value={trophies.length} />
                <StatCard icon={<ClipboardList className="text-purple-400"/>} label="Style" value={herder.style.name} />
                <StatCard icon={<Shirt className="text-pink-400"/>} label="Sponsor" value={activeSponsor || "None"} />
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)] flex flex-col md:flex-row justify-between md:items-center">
                <div>
                    <h2 className="text-lg font-bold text-blue-400 flex items-center mb-1"><CalendarDays className="mr-2" size={20}/> Upcoming Fixture</h2>
                    {competition && competition.stage !== 'result' ? (
                        <p className="text-red-400 text-lg font-bold animate-pulse">MATCH PENDING TODAY: {competition.details.title} vs {competition.details.opponentName}</p>
                    ) : upcomingMatch ? (
                        <p className="text-white text-lg">League Match vs <strong>{upcomingMatch.opponent}</strong> in <span className="text-yellow-400 font-bold">{upcomingMatch.days} days</span>.</p>
                    ) : (
                        <p className="text-gray-400 italic">No league matches scheduled right now.</p>
                    )}
                </div>
                {competition && competition.stage !== 'result' && (
                    <button onClick={onResumeMatch} className="mt-4 md:mt-0 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg animate-bounce uppercase tracking-widest transition-colors">
                        Enter Match
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">Market Value Analysis</h2>
                    <div style={{ width: '100%', height: 300 }}><ResponsiveContainer><BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}><XAxis dataKey="name" stroke="#9CA3AF" /><YAxis stroke="#9CA3AF" tickFormatter={(v) => `$${v/1000}k`}/><Tooltip cursor={{fill: 'rgba(110, 231, 183, 0.1)'}} contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: '8px' }} labelStyle={{ color: '#E5E7EB' }}/><Bar dataKey="Value" fill="#34D399" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700"><h2 className="text-xl font-bold text-white mb-4">Trophy Cabinet</h2><div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">{trophies.length === 0 ? <p className="text-gray-500 col-span-2 italic text-sm">No awards yet...</p> : trophies.map((t, i) => (<div key={i} className="bg-gray-700/50 p-2 rounded-lg flex items-center"><span className="text-2xl mr-2">{t.icon}</span><div className="overflow-hidden"><p className="font-bold text-xs truncate">{t.name}</p><p className="text-[10px] text-gray-400 uppercase">Season {t.season}</p></div></div>))}</div></div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700"><h2 className="text-xl font-bold text-white mb-4">Farm News</h2><ul className="space-y-2 text-sm text-gray-300 max-h-40 overflow-y-auto pr-2">{news.length === 0 && <li className="text-gray-500 italic">No updates today.</li>}{news.map((item, index) => (<li key={index} className={`p-2 rounded-lg border-l-4 ${item.type === 'good' ? 'bg-green-900/20 border-green-500' : item.type === 'bad' ? 'bg-red-900/20 border-red-500' : 'bg-gray-700/50 border-gray-500'}`}>{item.message}</li>))}</ul></div>
                </div>
            </div>
        </div>
    );
};

export const FollowingScreen = ({ following, farmBuildings, money, onUpgradeBuilding }) => {
    const buildings = [
        { id: 'trainingPitch', name: 'Training Pitch', icon: <Sun size={24}/>, desc: 'Increases effectiveness of daily pasture training.', baseCost: 15000 },
        { id: 'stadium', name: 'Match Facilities', icon: <Building size={24}/>, desc: 'Boosts fan generation after competition wins.', baseCost: 20000 },
        { id: 'shop', name: 'Farm Shop', icon: <ShoppingCart size={24}/>, desc: 'Increases end-of-season income per fan.', baseCost: 10000 },
        { id: 'kitStore', name: 'Replica Kit Store', icon: <Shirt size={24}/>, desc: 'Generates kit revenue based on Wool Quality (WQL).', baseCost: 12000 },
        { id: 'medicalCentre', name: 'Medical Centre', icon: <HeartPulse size={24}/>, desc: 'Improves condition recovery and reduces permanent injury risks.', baseCost: 18000 },
        { id: 'youthAcademy', name: 'Youth Academy', icon: <GraduationCap size={24}/>, desc: 'Increases the starting attributes and potential of your annual Wonder Kid.', baseCost: 25000 }
    ];
    
    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">Following & Infrastructure</h2>
            <div className="bg-gradient-to-r from-blue-900 to-gray-900 p-6 rounded-xl border border-blue-500 shadow-lg text-center mb-8 relative overflow-hidden"><Megaphone className="absolute top-0 right-0 w-48 h-48 opacity-5 transform translate-x-8 -translate-y-8 text-white" /><p className="text-blue-300 font-bold uppercase tracking-widest text-sm mb-2 relative z-10">Total Fanbase</p><div className="text-6xl font-black text-white flex items-center justify-center relative z-10">{following.fans.toLocaleString()}</div><p className="text-gray-400 mt-4 text-sm relative z-10">Fans buy merchandise at the end of every season. Keep winning to grow your following!</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buildings.map(b => {
                    const currentLevel = farmBuildings[b.id] || 1; const cost = currentLevel * b.baseCost;
                    return (
                        <div key={b.id} className="bg-gray-800 p-5 rounded-lg border border-gray-700 flex flex-col justify-between hover:border-gray-500 transition duration-300">
                            <div><div className="flex justify-between items-center mb-3"><div className="bg-gray-700 p-2 rounded-full text-green-400">{b.icon}</div><span className="bg-gray-900 px-3 py-1 rounded text-xs font-bold text-white border border-gray-600 shadow-inner">Level {currentLevel}</span></div><h3 className="text-xl font-bold text-white mb-2">{b.name}</h3><p className="text-sm text-gray-400 mb-6">{b.desc}</p></div>
                            <button onClick={() => onUpgradeBuilding(b.id, cost)} disabled={money < cost || currentLevel >= 10} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 py-3 rounded font-bold text-white transition shadow">{currentLevel >= 10 ? 'MAX LEVEL' : `Upgrade ($${cost.toLocaleString()})`}</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const HerdList = ({ goats, captainId, onSelectGoat, onSellGoat }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const requestSort = (key) => { let direction = 'ascending'; if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending'; setSortConfig({ key, direction }); };
    const sortedGoats = [...goats].sort((a, b) => {
        let aValue = a[sortConfig.key]; let bValue = b[sortConfig.key];
        if (sortConfig.key.includes('.')) { const keys = sortConfig.key.split('.'); aValue = a; bValue = b; keys.forEach(k => { aValue = aValue?.[k]; bValue = bValue?.[k]; }); }
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-xl overflow-x-auto border border-gray-700 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-4">My Herd</h2>
            <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-green-400 uppercase bg-gray-700">
                    <tr><SortableHeader sortKey="name" sortConfig={sortConfig} requestSort={requestSort}>Name</SortableHeader><SortableHeader sortKey="age" sortConfig={sortConfig} requestSort={requestSort}>Age</SortableHeader><SortableHeader sortKey="condition" sortConfig={sortConfig} requestSort={requestSort}>Cond.</SortableHeader><SortableHeader sortKey="morale" sortConfig={sortConfig} requestSort={requestSort}>Morale</SortableHeader><SortableHeader sortKey="attributes.AGI" sortConfig={sortConfig} requestSort={requestSort}>AGI</SortableHeader><SortableHeader sortKey="attributes.STA" sortConfig={sortConfig} requestSort={requestSort}>STA</SortableHeader><SortableHeader sortKey="attributes.FOR" sortConfig={sortConfig} requestSort={requestSort}>FOR</SortableHeader><SortableHeader sortKey="value" sortConfig={sortConfig} requestSort={requestSort}>Value</SortableHeader><th className="px-4 py-3">Action</th></tr>
                </thead>
                <tbody>
                    {sortedGoats.map((goat, index) => (
                        <tr key={goat.id} className={`border-b border-gray-700 hover:bg-gray-600 transition duration-200 ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}`}>
                            <td className="px-4 py-2 font-medium text-white cursor-pointer hover:text-green-400 transition-colors" onClick={() => onSelectGoat(goat)}>{goat.name} {captainId === goat.id && <span className="bg-yellow-400 text-black text-[10px] font-black px-1 rounded ml-2" title="Captain">C</span>}</td>
                            <td className="px-4 py-2">{goat.age}</td>
                            <td className={`px-4 py-2 font-bold ${goat.condition < 40 ? 'text-red-500' : 'text-white'}`}>{goat.condition}%</td>
                            <td className="px-4 py-2">{goat.morale}%</td>
                            <td className="px-4 py-2"><StatBar value={goat.attributes.AGI} /></td>
                            <td className="px-4 py-2"><StatBar value={goat.attributes.STA} /></td>
                            <td className="px-4 py-2"><StatBar value={goat.attributes.FOR} /></td>
                            <td className="px-4 py-2 font-mono">${goat.value.toLocaleString()}</td>
                            <td className="px-4 py-2"><button onClick={() => onSellGoat(goat)} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 text-xs rounded shadow transition">Sell</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const GoatMarketScreen = ({ marketGoats = [], money, onBuyGoat, onSelectGoat }) => {
    const [view, setView] = useState('free');
    const rivalMarketGoats = useMemo(() => { return Array.from({length: 4}, () => { const g = createGoat('elite'); g.value = Math.round(g.value * 2.5); return g; }); }, [marketGoats]); 
    const displayGoats = view === 'free' ? marketGoats : rivalMarketGoats;
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-xl overflow-x-auto border border-gray-700 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
                <h2 className="text-2xl font-bold text-white">Goat Market</h2>
                <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700"><button onClick={()=>setView('free')} className={`px-4 py-2 rounded text-sm font-bold transition ${view === 'free' ? 'bg-green-600 text-white shadow-inner' : 'text-gray-400 hover:text-white'}`}>Free Agents</button><button onClick={()=>setView('rival')} className={`px-4 py-2 rounded text-sm font-bold transition ${view === 'rival' ? 'bg-purple-600 text-white shadow-inner' : 'text-gray-400 hover:text-white'}`}>Rival Buyouts</button></div>
            </div>
            <p className="text-gray-400 mb-6">{view === 'free' ? 'A new selection of unattached goats arrives each day.' : 'Poach elite talent from rival herds. Expect to pay a massive premium.'}</p>
            <table className="min-w-full text-sm text-left text-gray-300">
                <thead className={`text-xs uppercase bg-gray-700 ${view === 'free' ? 'text-green-400' : 'text-purple-400'}`}><tr><th scope="col" className="px-4 py-3">Name</th><th scope="col" className="px-4 py-3">Age</th><th scope="col" className="px-4 py-3">AGI</th><th scope="col" className="px-4 py-3">STA</th><th scope="col" className="px-4 py-3">FOR</th><th scope="col" className="px-4 py-3">{view === 'rival' ? 'Buyout Clause' : 'Price'}</th><th scope="col" className="px-4 py-3">Action</th></tr></thead>
                <tbody>
                    {displayGoats.length === 0 && (<tr><td colSpan="7" className="text-center py-8 text-gray-500 italic">The market is empty today. Check back tomorrow!</td></tr>)}
                    {displayGoats.map((goat, index) => (
                        <tr key={goat.id} className={`border-b border-gray-700 hover:bg-gray-600 transition duration-200 ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}`}>
                            <td className="px-4 py-2 font-medium text-white cursor-pointer hover:text-green-400 transition" onClick={() => onSelectGoat(goat)}>{goat.name} {view === 'rival' && <Star size={12} className="inline text-yellow-400 ml-1 mb-1"/>}</td>
                            <td className="px-4 py-2">{goat.age}</td>
                            <td className="px-4 py-2"><StatBar value={goat.attributes.AGI} /></td>
                            <td className="px-4 py-2"><StatBar value={goat.attributes.STA} /></td>
                            <td className="px-4 py-2"><StatBar value={goat.attributes.FOR} /></td>
                            <td className="px-4 py-2 text-yellow-400 font-mono font-semibold">${goat.value.toLocaleString()}</td>
                            <td className="px-4 py-2"><button onClick={() => onBuyGoat(goat, view === 'rival')} disabled={money < goat.value} className={`${view === 'free' ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} text-white font-bold py-1 px-4 text-xs rounded shadow transition disabled:bg-gray-600 disabled:cursor-not-allowed`}>{view === 'rival' ? 'Poach' : 'Buy'}</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const PastureManagementScreen = ({ goats, assistantHerders = [], farmInventory, onUseTool, onUpdateTraining, onUpdateAllTraining }) => {
    const totalBoost = assistantHerders.length * 2;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-2">Coaching Staff</h2>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <p className="text-gray-400 text-sm">Retired goats join your staff to help guide the next generation.</p>
                    <div className="mt-2 md:mt-0 bg-green-900/30 border border-green-500 text-green-400 px-4 py-2 rounded-lg font-bold text-sm">
                        Global Training Boost: +{totalBoost}%
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    {assistantHerders.length === 0 ? (
                        <p className="text-gray-600 italic text-sm w-full border border-dashed border-gray-600 p-4 rounded-lg text-center">No retired goats have joined your staff yet. They must reach at least age 7 to consider retirement!</p>
                    ) : (
                        assistantHerders.map(staff => (
                            <div key={staff.id} className="bg-gray-900 border border-gray-600 px-4 py-3 rounded-lg flex items-center space-x-3 shadow-md">
                                <span className="text-2xl" title="Assistant Herder">👨‍🏫</span>
                                <div>
                                    <p className="font-bold text-white text-sm leading-tight">{staff.name}</p>
                                    <p className="text-[10px] text-purple-400 uppercase tracking-widest">{staff.quality} Alum</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Tool Shed</h2>
                    <div className="bg-yellow-900/30 border border-yellow-500 text-yellow-400 px-4 py-2 rounded-lg font-bold text-sm">
                        Farming Tools: {farmInventory?.farmingTools || 0}
                    </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">Farming Tools are won in Exhibitions. Use them to permanently increase three random attributes by +1!</p>
                <div className="flex flex-wrap gap-2">
                    {goats.map(g => (
                        <button 
                            key={g.id} 
                            onClick={() => onUseTool(g.id)} 
                            disabled={(farmInventory?.farmingTools || 0) === 0}
                            className="bg-gray-900 border border-gray-600 hover:border-yellow-400 disabled:opacity-50 disabled:hover:border-gray-600 px-3 py-2 rounded text-sm text-white transition flex items-center"
                        >
                            {g.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-2">Pasture Management</h2>
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                    <p className="text-gray-400">Assign training focuses. Exhausted goats ({'<'} 40%) are forced to rest.</p>
                    <div className="flex items-center space-x-3 bg-gray-900 p-2 rounded-lg border border-gray-600 shadow-inner">
                        <span className="text-sm font-bold text-green-400">Set All To:</span>
                        <select onChange={(e) => { if(e.target.value) onUpdateAllTraining(e.target.value); e.target.value = ''; }} className="bg-gray-700 border border-gray-500 rounded-lg px-3 py-1 text-white focus:ring-2 focus:ring-green-500 focus:outline-none cursor-pointer">
                            <option value="">-- Select Regime --</option>
                            {Object.entries(trainingRegimes).map(([key, regime]) => (<option key={key} value={key}>{regime.name}</option>))}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-green-400 uppercase bg-gray-700"><tr><th scope="col" className="px-4 py-3">Goat</th><th scope="col" className="px-4 py-3">Current Focus</th><th scope="col" className="px-4 py-3">Condition</th></tr></thead>
                        <tbody>
                            {goats.map((goat, index) => (
                                <tr key={goat.id} className={`border-b border-gray-700 ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}`}>
                                    <td className="px-4 py-2 font-medium text-white">{goat.name}</td>
                                    <td className="px-4 py-2"><select value={goat.trainingFocus} onChange={(e) => onUpdateTraining(goat.id, e.target.value)} disabled={goat.condition < 40} className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer">{Object.entries(trainingRegimes).map(([key, regime]) => (<option key={key} value={key}>{regime.name}</option>))}</select></td>
                                    <td className={`px-4 py-2 font-bold ${goat.condition < 40 ? 'text-red-500' : 'text-white'}`}>{goat.condition < 40 ? `Exhausted (${goat.condition}%)` : `${goat.condition}%`}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const CompetitionsScreen = ({ leagueTable, playerFarmName, playerLeagueLevel, league, championsBleat, nationalCup, worldCup, scheduledCompetitions, currentDate, onActivateCompetition, matchHistory }) => {
    const getDaysUntil = (targetDate) => { const d1 = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())); const d2 = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())); return Math.round((d1 - d2) / (1000 * 60 * 60 * 24)); };
    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {worldCup?.isActive ? (
                     <div className="bg-gray-900 p-6 rounded-lg border border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] relative overflow-hidden">
                         <Globe className="absolute top-0 right-0 w-32 h-32 opacity-5 text-blue-400 transform translate-x-4 -translate-y-4" />
                         <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center relative z-10"><Globe className="mr-2"/> Goat World Cup</h2>
                         <div className="grid grid-cols-1 gap-2 text-sm relative z-10 mb-4">
                             <div className="bg-gray-800 p-3 rounded border border-gray-700 flex justify-between"><p className="text-gray-400 uppercase font-bold text-[10px] tracking-widest">Country</p><p className="font-bold text-white text-md">{worldCup.playerCountry}</p></div>
                             <div className="bg-gray-800 p-3 rounded border border-gray-700 flex justify-between"><p className="text-gray-400 uppercase font-bold text-[10px] tracking-widest">Round</p><p className="font-bold text-white text-md">{worldCup.currentRound}</p></div>
                             <div className="bg-gray-800 p-3 rounded border border-gray-700 flex justify-between"><p className="text-gray-400 uppercase font-bold text-[10px] tracking-widest">Next</p><p className="font-bold text-white text-md">{worldCup.nextOpponent} ({new Date(worldCup.nextMatchDate).toLocaleDateString()})</p></div>
                         </div>
                         {worldCup.stage === 'group' && worldCup.groups && (
                             <table className="min-w-full text-[10px] text-left text-gray-300">
                                <thead className="uppercase bg-gray-800 text-blue-400"><tr><th>Team</th><th>P</th><th>Pts</th><th>Diff</th></tr></thead>
                                <tbody>
                                    {worldCup.groups.A.map((t, i) => (
                                        <tr key={t.name} className={t.name === worldCup.playerCountry ? 'bg-blue-900/50 font-bold text-white' : ''}><td>{i+1}. {t.name}</td><td>{t.P}</td><td>{t.Pts}</td><td>{t.PF - t.PA}</td></tr>
                                    ))}
                                </tbody>
                             </table>
                         )}
                     </div>
                ) : null}

                {championsBleat.isQualified ? (
                     <div className="bg-gray-900 p-6 rounded-lg border border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] relative overflow-hidden">
                         <Globe className="absolute top-0 right-0 w-32 h-32 opacity-5 text-purple-400 transform translate-x-4 -translate-y-4" />
                         <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center relative z-10"><Globe className="mr-2"/> The Champions Bleat</h2>
                         {championsBleat.isActive ? (
                            <div className="grid grid-cols-1 gap-2 text-sm relative z-10">
                             <div className="bg-gray-800 p-3 rounded border border-gray-700 flex justify-between"><p className="text-gray-400 uppercase font-bold text-[10px] tracking-widest">Round</p><p className="font-bold text-white text-md">{championsBleat.currentRound}</p></div>
                             <div className="bg-gray-800 p-3 rounded border border-gray-700 flex justify-between"><p className="text-gray-400 uppercase font-bold text-[10px] tracking-widest">Opponent</p><p className="font-bold text-white text-md truncate" title={championsBleat.nextOpponent}>{championsBleat.nextOpponent}</p></div>
                             <div className="bg-gray-800 p-3 rounded border border-gray-700 flex justify-between"><p className="text-gray-400 uppercase font-bold text-[10px] tracking-widest">Date</p><p className="font-bold text-white text-md">{new Date(championsBleat.nextMatchDate).toDateString()}</p></div>
                            </div>
                         ) : <p className="text-gray-400 italic relative z-10">Eliminated / Concluded.</p>}
                     </div>
                ) : <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 flex items-center justify-center"><p className="text-gray-500 italic flex items-center"><Globe className="mr-2 opacity-50"/> Not qualified for Europe.</p></div>}

                {nationalCup?.isActive || nationalCup?.currentRound === 'Champion!' ? (
                     <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)] relative overflow-hidden">
                         <Trophy className="absolute top-0 right-0 w-32 h-32 opacity-5 text-yellow-400 transform translate-x-4 -translate-y-4" />
                         <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center relative z-10"><Trophy className="mr-2"/> Goat Association Cup</h2>
                         {nationalCup.isActive ? (
                            <div className="grid grid-cols-1 gap-2 text-sm relative z-10">
                             <div className="bg-gray-800 p-3 rounded border border-gray-700 flex justify-between"><p className="text-gray-400 uppercase font-bold text-[10px] tracking-widest">Round</p><p className="font-bold text-white text-md">{nationalCup.currentRound}</p></div>
                             <div className="bg-gray-800 p-3 rounded border border-gray-700 flex justify-between"><p className="text-gray-400 uppercase font-bold text-[10px] tracking-widest">Opponent</p><p className="font-bold text-white text-md truncate" title={nationalCup.nextOpponent}>{nationalCup.nextOpponent}</p></div>
                             <div className="bg-gray-800 p-3 rounded border border-gray-700 flex justify-between"><p className="text-gray-400 uppercase font-bold text-[10px] tracking-widest">Date</p><p className="font-bold text-white text-md">{new Date(nationalCup.nextMatchDate).toDateString()}</p></div>
                            </div>
                         ) : <p className="text-yellow-400 font-bold tracking-widest relative z-10 uppercase">Cup Champions!</p>}
                     </div>
                ) : <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 flex items-center justify-center"><p className="text-gray-500 italic flex items-center"><Trophy className="mr-2 opacity-50"/> Eliminated / Ineligible.</p></div>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white mb-4">Exhibitions & Showcases</h2>
                    {scheduledCompetitions.length === 0 && <p className="text-gray-500 italic bg-gray-800 p-4 rounded-lg border border-gray-700">No exhibitions remain this season.</p>}
                    {scheduledCompetitions.map(comp => {
                        const daysUntil = getDaysUntil(new Date(comp.date)); const isActive = daysUntil === 0;
                        return (
                            <div key={comp.id} className={`bg-gray-900 p-5 rounded-lg border transition duration-300 ${isActive ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'border-gray-700 hover:border-gray-500'}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow"><h3 className="text-xl font-bold text-green-400">{comp.name}</h3><p className="text-sm text-gray-400 flex items-center mt-2"><CalendarDays className="w-4 h-4 mr-2" /> {new Date(comp.date).toDateString()}</p><p className="mt-2 text-gray-300 text-sm">{comp.description}</p></div>
                                    <div className="text-right ml-4 bg-gray-800 p-3 rounded border border-gray-700"><div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Rewards</div><div className="text-green-400 font-bold text-sm leading-tight">+15% Fans<br/>1x Farming Tool</div></div>
                                </div>
                                <div className="mt-5 flex items-center justify-between border-t border-gray-800 pt-4"><span className={`text-sm font-bold tracking-widest uppercase ${isActive ? 'text-yellow-400 animate-pulse' : 'text-blue-400'}`}>{isActive ? "HAPPENING TODAY!" : `${daysUntil} Days Remaining`}</span><button onClick={() => onActivateCompetition(comp)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg text-sm shadow transition disabled:bg-gray-700 disabled:text-gray-500" disabled={!isActive}>Enter Showcase</button></div>
                            </div>
                        );
                    })}
                </div>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex flex-col h-full">
                    <h3 className="text-2xl font-bold text-white mb-4">League {playerLeagueLevel} - S{league.seasonNumber}</h3>
                    <div className="overflow-x-auto flex-grow">
                        <table className="min-w-full text-xs text-left text-gray-300">
                            <thead className="uppercase bg-gray-800 text-green-400 font-bold border-b border-gray-700"><tr><th className="px-2 py-3 text-center">Pos</th><th className="px-4 py-3">Team</th><th className="px-2 py-3 text-center">P</th><th className="px-2 py-3 text-center">Pts</th><th className="px-2 py-3 text-center" title="Aggregate Win Margin Percentage">AWMP%</th></tr></thead>
                            <tbody>
                                {[...leagueTable].sort((a,b) => b.Pts - a.Pts || calcAWMP(b) - calcAWMP(a)).map((team, index) => (
                                    <tr key={team.id} className={`border-b border-gray-800 transition ${team.name === playerFarmName ? 'bg-green-900/30 text-white font-bold' : 'hover:bg-gray-800/50'}`}>
                                        <td className="px-2 py-3 text-center">{index === 0 ? <span className="text-yellow-400">1</span> : index === 7 ? <span className="text-red-400">8</span> : index + 1}</td>
                                        <td className="px-4 py-3">{team.name}</td>
                                        <td className="px-2 py-3 text-center">{team.P}</td>
                                        <td className="px-2 py-3 text-center font-bold text-white">{team.Pts}</td>
                                        <td className="px-2 py-3 text-center text-gray-400">{calcAWMP(team).toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {matchHistory && matchHistory.length > 0 && (
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 lg:col-span-2 overflow-x-auto mt-2">
                        <h3 className="text-xl font-bold text-white mb-4">Match History</h3>
                        <table className="min-w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-green-400 uppercase bg-gray-800"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Competition</th><th className="px-4 py-3">Opponent</th><th className="px-4 py-3 text-center">Result</th><th className="px-4 py-3 text-center">Score</th></tr></thead>
                            <tbody>{matchHistory.map((m) => (<tr key={m.id} className="border-b border-gray-800 hover:bg-gray-700 transition"><td className="px-4 py-2">{new Date(m.date).toLocaleDateString()}</td><td className="px-4 py-2">{m.competitionName}</td><td className="px-4 py-2">{m.opponent}</td><td className="px-4 py-2 text-center font-bold">{m.result === 'W' ? <span className="text-green-400">W</span> : m.result === 'D' ? <span className="text-yellow-400">D</span> : <span className="text-red-400">L</span>}</td><td className="px-4 py-2 text-center font-mono font-bold tracking-widest">{m.pScore} - {m.oScore}</td></tr>))}</tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ManagerProfileScreen = ({ herder, farm, farmMoney, league, record, trophies, historyArr, onRenameTeam, onRenameManager, onOpenDiceModal }) => {
    const { stats } = herder;
    const winPercentage = record.totalMatches > 0 ? Math.round((record.wins / record.totalMatches) * 100) : 0;
    const topGoatArr = Object.entries(record.goatAppearances || {}).sort((a, b) => b[1] - a[1]);
    const topGoat = topGoatArr.length > 0 ? topGoatArr[0][0] : "None yet";
    const [selectedHistory, setSelectedHistory] = useState(null);
    
    // Team Rename State
    const [isEditingName, setIsEditingName] = useState(false);
    const [newTeamName, setNewTeamName] = useState(farm.name);
    
    // Manager Rename State
    const [isEditingManagerName, setIsEditingManagerName] = useState(false);
    const [newManagerName, setNewManagerName] = useState(herder.name);
    
    const isTurnip = herder.name.toLowerCase() === 'turnip scart';
    const diceCost = Math.max(100000, Math.floor(farmMoney * 0.1));
    const canAffordDice = farmMoney >= diceCost;

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">Manager Office</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-20 transform translate-x-8 -translate-y-8 rotate-12" style={{ backgroundColor: farm.kitColor }}></div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-16 h-16 flex items-center justify-center text-3xl shadow-lg border-2 border-gray-600" style={{ backgroundColor: farm.kitColor, color: '#fff', borderRadius: isTurnip ? '50% 50% 50% 5%' : '50%' }}>{isTurnip ? '🥕' : <Shield className="w-8 h-8" />}</div>
                            <div>
                                {isEditingManagerName ? (
                                    <div className="flex items-center mb-1">
                                        <input type="text" value={newManagerName} onChange={e => setNewManagerName(e.target.value)} className="bg-gray-900 text-white px-2 py-1 rounded border border-gray-600 text-xl font-bold w-48 focus:ring-1 focus:ring-green-500 outline-none" />
                                        <button onClick={() => { onRenameManager(newManagerName); setIsEditingManagerName(false); }} className="ml-2 text-xs bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded font-bold transition">Save</button>
                                    </div>
                                ) : (
                                    <h3 className="text-2xl font-bold text-white flex items-center">
                                        {herder.name}
                                        {record.wins >= 100 && <button onClick={() => setIsEditingManagerName(true)} className="ml-3 text-[10px] bg-purple-900/50 text-purple-400 border border-purple-800 hover:bg-purple-800 hover:text-white px-2 py-0.5 rounded transition uppercase tracking-widest">Rename</button>}
                                    </h3>
                                )}
                                
                                {isEditingName ? (
                                    <div className="flex items-center mt-1">
                                        <input type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} className="bg-gray-900 text-white px-2 py-1 rounded border border-gray-600 text-sm w-40 focus:ring-1 focus:ring-green-500 outline-none" />
                                        <button onClick={() => { onRenameTeam(newTeamName); setIsEditingName(false); }} className="ml-2 text-xs bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded font-bold transition">Save</button>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 flex items-center mt-1">
                                        {farm.name} Manager 
                                        {record.totalMatches >= 100 && <button onClick={() => setIsEditingName(true)} className="ml-2 text-[10px] bg-blue-900/50 text-blue-400 border border-blue-800 hover:bg-blue-800 hover:text-white px-2 py-0.5 rounded transition uppercase tracking-widest">Rename</button>}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded text-sm text-gray-300 border border-gray-700"><p><span className="font-bold text-gray-400">Style:</span> {herder.style.name}</p><p className="text-xs mt-1 text-green-400">{herder.style.desc}</p></div>
                        <div className="mt-4 bg-gray-900 p-3 rounded border border-gray-700"><p className="text-xs text-gray-400 mb-2 uppercase font-bold">Current Formation</p><div className="flex space-x-2">{farm.formation?.map((role, i) => (<div key={i} className="bg-gray-800 px-2 py-1 rounded border border-gray-600 text-xs flex items-center text-white">{tacticalRoles[role].icon}<span className="ml-1">{tacticalRoles[role].name}</span></div>))}</div></div>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl">
                    <div className="flex justify-between items-end mb-4"><h3 className="text-xl font-bold text-white">Manager Attributes</h3><div className="text-right"><p className="text-sm text-gray-400">Level {stats.level}</p><p className="text-xs font-mono text-green-400">{stats.xp} / {stats.nextLevelXp} XP</p></div></div>
                    <div className="w-full bg-gray-900 rounded-full h-2 mb-6 border border-gray-700"><div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-900 p-4 rounded border border-gray-700"><p className="text-xs text-gray-500 uppercase font-bold mb-1">Tactical Nous</p><p className="text-2xl font-black text-purple-400">{stats.tacticalNous}</p><p className="text-[10px] text-gray-400 mt-1">Improves Match Engine decisions.</p></div>
                        <div className="bg-gray-900 p-4 rounded border border-gray-700"><p className="text-xs text-gray-500 uppercase font-bold mb-1">Motivation</p><p className="text-2xl font-black text-yellow-400">{stats.motivation}</p><p className="text-[10px] text-gray-400 mt-1">Boosts post-match morale gains.</p></div>
                        <div className="bg-gray-900 p-4 rounded border border-gray-700"><p className="text-xs text-gray-500 uppercase font-bold mb-1">Scouting Eye</p><p className="text-2xl font-black text-blue-400">{stats.scouting}</p><p className="text-[10px] text-gray-400 mt-1">Reveals tighter potential ranges.</p></div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                 <h3 className="text-lg font-bold text-white mb-4">Career Record</h3>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                     <div><p className="text-3xl font-black text-white">{record.totalMatches}</p><p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Matches</p></div>
                     <div><p className="text-3xl font-black text-white">{record.wins}<span className="text-sm text-gray-500 font-normal">-</span>{record.draws}<span className="text-sm text-gray-500 font-normal">-</span>{record.losses}</p><p className="text-xs text-gray-400 uppercase tracking-widest mt-1">W - D - L</p></div>
                     <div><p className="text-3xl font-black text-green-400">{winPercentage}%</p><p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Win Rate</p></div>
                     <div><p className="text-3xl font-black text-blue-400">+{record.biggestWinMargin || 0}</p><p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Biggest Win</p></div>
                     <div className="overflow-hidden"><p className="text-xl font-black text-purple-400 truncate" title={topGoat}>{topGoat}</p><p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Most Used Goat</p></div>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 border-t border-gray-700 pt-4">
                     <div><p className="text-3xl font-black text-red-400">-{record.biggestLossMargin || 0}</p><p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Biggest Loss</p></div>
                     <div><p className="text-3xl font-black text-white">{record.longestWinStreak || 0}</p><p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Longest Win Streak</p></div>
                     <div><p className="text-3xl font-black text-white">{record.longestLossStreak || 0}</p><p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Longest Loss Streak</p></div>
                     <div><p className="text-3xl font-black text-white">{Object.keys(record.goatAppearances || {}).length}</p><p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Unique Goats Used</p></div>
                 </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Manager Awards</h3>
                <div className="flex flex-wrap gap-4">
                    {Object.keys(record.managerAwards || {}).length === 0 && <p className="text-gray-500 italic">No awards yet.</p>}
                    {Object.entries(record.managerAwards || {}).map(([award, count]) => {
                        let icon = '🏆';
                        if (award === 'Centurion') icon = '💯';
                        else if (award === 'Loyal Herder') icon = '🤝';
                        else if (award === 'Triple A Battery') icon = '⚓';
                        else if (award === 'Malt-er Ego') icon = '🎭';
                        else if (award === 'Bleat of Faith') icon = '🙏';
                        else if (award === 'Clearance Sale') icon = '🛒';
                        else if (award === 'Captainless') icon = '🫥';
                        else if (award === "By A Crab's Eye") icon = '🦀';
                        else if (award === "By A Crab's Tear") icon = '🦀';
                        else if (award === 'Balancing Act') icon = '🤸';
                        else if (award === 'Red Ed') icon = '🔴';
                        else if (award === 'Undefeated') icon = '🛡️';
                        else if (award === 'Little L') icon = '🌟';
                        else if (award === 'Smooth Peach') icon = '🍑';
                        else if (award === 'Oh Deer') icon = '🦌';
                        else if (award === 'Dynamic Duo') icon = '✌️';
                        else if (award === 'Lone Goat') icon = '🦸';
                        else if (award === 'Treble Winners') icon = '👑';
                        else if (award === 'You Have Bought Yourself A Goat') icon = '🐐';
                        else if (award === 'Prime Time') icon = '🧮';
                        else if (award === 'Moonlight Shadow') icon = '🌙';
                        else if (award === 'Not Obsolete Yet') icon = '💾';
                        else if (award === 'Fünfhundert') icon = '⛰️';
                        else if (award === 'Artificial Goat-pocalypse') icon = '💥';
                        else if (award === 'Need an HDMI') icon = '📺';
                        else if (award === 'Champion Conundrum') icon = '🧩';
                        else if (award === 'Poach') icon = '🍳';

                        return (
                            <div key={award} className="bg-gray-900 border border-yellow-500/50 p-4 rounded-lg text-center min-w-[140px] shadow-lg flex flex-col items-center justify-center">
                                <p className="text-3xl mb-2">{icon}</p>
                                <p className="font-bold text-sm text-yellow-400 text-center">{award}</p>
                                {count > 1 && <p className="text-xs text-gray-400 mt-1 font-bold">x {count}</p>}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-red-900/50 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 transform translate-x-4 -translate-y-4 text-red-500 text-9xl">🎲</div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center">🎲 Dice of Destiny</h3>
                    <p className="text-sm text-gray-300 mb-4">A high-stakes gamble with mysterious benefactors. Roll the dice to grant massive permanent stat boosts to ALL attributes. But beware... rolling a double six spells absolute financial ruin.</p>
                    
                    <button 
                        onClick={onOpenDiceModal} 
                        disabled={league.hasRolledDiceThisSeason || !canAffordDice}
                        className="bg-red-900/80 hover:bg-red-700 border border-red-500 text-white font-black uppercase tracking-widest py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {league.hasRolledDiceThisSeason ? 'Already Rolled This Season' : `Roll Dice ($${diceCost.toLocaleString()})`}
                    </button>
                    {!canAffordDice && !league.hasRolledDiceThisSeason && <p className="text-xs text-red-400 mt-2">Requires minimum $100,000 to access the table.</p>}
                </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Season Archives</h3>
                {historyArr && historyArr.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {historyArr.map(arch => (<button key={arch.season} onClick={() => setSelectedHistory(arch)} className="bg-gray-900 hover:bg-green-900/40 border border-gray-600 hover:border-green-500 text-white px-4 py-2 rounded transition font-bold shadow-md">Season {arch.season}</button>))}
                    </div>
                ) : <p className="text-gray-500 italic">No seasons completed yet.</p>}
            </div>

            {selectedHistory && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-2xl text-white max-w-lg w-full relative animate-fade-in-up">
                        <button onClick={() => setSelectedHistory(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XCircle size={24}/></button>
                        <h2 className="text-3xl font-black text-green-400 mb-6">Season {selectedHistory.season || '?'} Summary</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-900 p-4 rounded border border-gray-700"><p className="text-xs text-gray-500 uppercase font-bold">Final Position</p><p className="text-2xl font-bold text-white">{selectedHistory.finalPosition || '?'}</p></div>
                                <div className="bg-gray-900 p-4 rounded border border-gray-700"><p className="text-xs text-gray-500 uppercase font-bold">Record</p><p className="text-2xl font-bold text-white">{selectedHistory.wins || 0}-{selectedHistory.draws || 0}-{selectedHistory.losses || 0}</p></div>
                            </div>
                            <div className="bg-gray-900 p-4 rounded border border-gray-700">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Metrics</p>
                                <div className="flex justify-between text-sm"><span className="text-gray-400">Total Points Scored:</span><span className="font-bold">{selectedHistory.PF || 0}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-400">Total Points Conceded:</span><span className="font-bold">{selectedHistory.PA || 0}</span></div>
                                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-800"><span className="text-gray-400">AWMP (Tiebreaker):</span><span className="font-bold text-blue-400">{Number(selectedHistory.awmp || 0).toFixed(1)}%</span></div>
                            </div>
                            <div className="bg-gray-900 p-4 rounded border border-yellow-500/30">
                                <p className="text-xs text-yellow-500 uppercase font-bold mb-1">Herd MVPs & Economy</p>
                                <div className="flex justify-between text-sm"><span className="text-gray-400">Most Valuable:</span><span className="font-bold">{selectedHistory.MVP || 'N/A'}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-400">Following Income:</span><span className="font-bold text-green-400">+${(selectedHistory.income || 0).toLocaleString()}</span></div>
                                {selectedHistory.taxAmount !== undefined && (
                                    <div className="flex justify-between text-sm mt-1 border-t border-gray-800 pt-1"><span className="text-gray-400">Tax Deducted:</span><span className="font-bold text-red-400">-${(selectedHistory.taxAmount || 0).toLocaleString()}</span></div>
                                )}
                            </div>
                            {selectedHistory.promoRelStatus && selectedHistory.promoRelStatus !== 'Retained' && (
                                <div className={`mt-4 p-2 rounded text-center font-bold uppercase tracking-widest ${selectedHistory.promoRelStatus === 'Promoted' ? 'bg-green-900/50 text-green-400 border border-green-500' : 'bg-red-900/50 text-red-400 border border-red-500'}`}>
                                    {selectedHistory.promoRelStatus}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const AboutScreen = ({ record }) => {
    const awardsList = {
        'Centurion': { icon: '💯', desc: 'Won a match by over 100 points.' },
        'Loyal Herder': { icon: '🤝', desc: 'Used every goat in the herd during a single league season.' },
        'Triple A Battery': { icon: '⚓', desc: 'Started a match with three Anchor goats.' },
        'Malt-er Ego': { icon: '🎭', desc: "Named the manager 'Curtains T. Vinegar'." },
        'Bleat of Faith': { icon: '🙏', desc: 'Started a match with the three lowest-valued goats in the herd.' },
        'Clearance Sale': { icon: '🛒', desc: 'Sold every goat in the herd.' },
        'Captainless': { icon: '🫥', desc: "The herd's captain left or was sold." },
        "By A Crab's Eye": { icon: '🦀', desc: 'Clutched a win by exactly 1 point.' },
        "By A Crab's Tear": { icon: '🦀', desc: 'Lost a match by exactly 1 point.' },
        'Balancing Act': { icon: '🤸', desc: 'Drew a match with an exact tie.' },
        'Red Ed': { icon: '🔴', desc: "Named the manager 'Ed' and chose a red kit." },
        'Undefeated': { icon: '🛡️', desc: 'Went completely undefeated in a league season.' },
        'Little L': { icon: '🌟', desc: 'Reached 50 career wins.' },
        'Smooth Peach': { icon: '🍑', desc: 'Started a match with an Anchor, Scout, Scout formation.' },
        'Oh Deer': { icon: '🦌', desc: 'Forfeited a match.' },
        'Dynamic Duo': { icon: '✌️', desc: 'Won a match with only 2 goats.' },
        'Lone Goat': { icon: '🦸', desc: 'Won a match with only 1 goat.' },
        'Treble Winners': { icon: '👑', desc: 'Won the top-flight League, Cup, and Champions Bleat in a single season.' },
        'You Have Bought Yourself A Goat': { icon: '🐐', desc: 'Purchased your first goat from the market.' },
        'Prime Time': { icon: '🧮', desc: 'Finished a match with a prime number score.' },
        'Moonlight Shadow': { icon: '🌙', desc: 'Played a match with three goats whose first name is Luna.' },
        'Not Obsolete Yet': { icon: '💾', desc: 'Used a goat aged 10 or older in any match.' },
        'Fünfhundert': { icon: '⛰️', desc: 'Scored 500 points or more in a single match.' },
        'Artificial Goat-pocalypse': { icon: '💥', desc: 'Opposition scored 800 points or more against you during a match.' },
        'Need an HDMI': { icon: '📺', desc: 'Played a match with three goats that have the surname Scart.' },
        'Champion Conundrum': { icon: '🧩', desc: 'Finished first in any league with an AWMP% lower than 100%.' }
    };

    const unlockedAwards = Object.keys(record?.managerAwards || {}).filter(a => awardsList[a]);
    const totalAwards = Object.keys(awardsList).length;
    const unlockedCount = unlockedAwards.length;
    const progressPct = Math.round((unlockedCount / totalAwards) * 100);

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in max-w-4xl">
            <h2 className="text-3xl font-bold text-white mb-6">About GHM 2027</h2>
            
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-green-400 tracking-tighter italic mb-2">GHM<span className="text-white">2027</span></h1>
                    <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Professional Caprine Management Simulation</p>
                </div>

                <div className="relative z-10 space-y-4">
                    <h3 className="text-xl font-bold text-blue-400 border-b border-gray-700 pb-2">Key Features</h3>
                    <ul className="space-y-4 text-gray-300">
                        <li className="flex items-start"><span className="text-green-400 mr-3">🐐</span><div><strong>Dynamic 10-Tier Scouting:</strong> Scout, purchase, and aggressively poach rival goats using a comprehensive 50-point attribute system.</div></li>
                        <li className="flex items-start"><span className="text-green-400 mr-3">📋</span><div><strong>Tactical Match Engine:</strong> Assign specific tactical roles (Vanguard, Anchor, Scout) to counter opponent rosters and secure victory across multiple statistical fronts.</div></li>
                        <li className="flex items-start"><span className="text-green-400 mr-3">💰</span><div><strong>Deep Economy & Infrastructure:</strong> Manage stadium expansions, negotiate lucrative corporate sponsorships, and drive replica kit sales based on herd Wool Quality (WQL).</div></li>
                        <li className="flex items-start"><span className="text-green-400 mr-3">🧬</span><div><strong>The Circle of Life:</strong> Nurture 1-year-old Wonder Kids into club legends. Watch attributes naturally wane as players age, eventually hiring retired stars as Assistant Herders.</div></li>
                        <li className="flex items-start"><span className="text-green-400 mr-3">🏆</span><div><strong>Expansive Competitions:</strong> Climb a brutal 5-tier league system featuring promotion and relegation, battle through the Goat Association Cup, conquer Europe in the Champions Bleat, and battle globally in the World Cup.</div></li>
                    </ul>
                </div>

                <div className="relative z-10 mt-8 pt-8 border-t border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between md:items-end mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-yellow-400">Achievement Log</h3>
                            <p className="text-sm text-gray-400 mt-1">Discover hidden secrets through unique gameplay feats.</p>
                        </div>
                        <div className="text-right mt-4 md:mt-0">
                            <p className="text-3xl font-black text-white">{unlockedCount}<span className="text-lg text-gray-500 font-normal"> / {totalAwards}</span></p>
                            <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mt-1">{progressPct}% Unlocked</p>
                        </div>
                    </div>
                    
                    <div className="w-full bg-gray-900 rounded-full h-4 mb-8 border border-gray-700 shadow-inner overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(250,204,21,0.5)]" style={{ width: `${progressPct}%` }}></div>
                    </div>

                    {unlockedCount > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {unlockedAwards.map(award => (
                                <div key={award} className="bg-gray-900 p-4 rounded-lg border border-yellow-500/30 flex items-center space-x-4 shadow-lg hover:border-yellow-500 transition-colors">
                                    <span className="text-3xl bg-gray-800 p-2 rounded-full border border-gray-700">{awardsList[award]?.icon || '🏆'}</span>
                                    <div>
                                        <p className="font-bold text-yellow-400">{award}</p>
                                        <p className="text-xs text-gray-400 mt-1">{awardsList[award]?.desc || 'A secret achievement.'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-900 p-6 rounded-lg border border-dashed border-gray-600 text-center">
                            <p className="text-gray-500 italic">No secrets discovered yet. Keep playing to uncover them!</p>
                        </div>
                    )}
                </div>

                <div className="relative z-10 border-t border-gray-700 pt-6 mt-8">
                    <p className="text-gray-300 font-bold">&copy; Barnaby Mollett, 2026</p>
                    <p className="text-gray-400 mt-2 text-sm flex items-center">
                        Contact / Support: <a href="mailto:barnaby@futurereferenced.com" className="text-blue-400 hover:text-blue-300 font-bold ml-2 transition-colors">barnaby@futurereferenced.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
};
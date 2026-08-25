import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { StatBar } from './Shared';
import { tacticalRoles } from '../constants';

export const GoatProfile = ({ goat, isCaptain, onClose }) => {
    if (!goat) return null;
    const categories = { 
        'Physical': ['AGI', 'STA', 'STR', 'SPD'], 
        'Foraging': ['FOR', 'SEL', 'DIG'], 
        'Temperament': ['BRV', 'DIS', 'INT'], 
        'Production': ['MYL', 'MQL', 'WQL'] 
    };
    
    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 text-white rounded-xl shadow-2xl w-full max-w-4xl max-h-full overflow-y-auto">
                <div className="sticky top-0 bg-gray-900/95 p-6 border-b border-gray-700 flex justify-between items-center z-10 backdrop-blur">
                    <div>
                        <h2 className="text-4xl font-black text-green-400 tracking-tight">
                            {goat.name} {isCaptain && <span className="text-sm bg-yellow-400 text-black px-2 py-1 rounded ml-2 align-middle">© CAPTAIN</span>}
                        </h2>
                        <p className="text-gray-400 font-mono mt-1">Age: {goat.age} | Value: ${goat.value.toLocaleString()} | Quality: <span className="uppercase text-purple-400">{goat.quality}</span></p>
                    </div>
                    <button onClick={onClose} className="bg-gray-700 hover:bg-red-600 p-2 rounded-full transition-colors"><XCircle size={32} /></button>
                </div>
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                            <h3 className="font-black uppercase tracking-widest text-xs mb-3 text-green-400">Vitals</h3>
                            <div className="space-y-4">
                                <div><p className="text-xs text-gray-500 uppercase font-bold mb-1">Condition</p><StatBar value={(goat.condition/100)*50} /></div>
                                <div><p className="text-xs text-gray-500 uppercase font-bold mb-1">Morale</p><StatBar value={(goat.morale/100)*50} /></div>
                            </div>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                            <h3 className="font-black uppercase tracking-widest text-xs mb-3 text-green-400">Traits</h3>
                            <div className="space-y-2">
                                {goat.traits.map(t => (
                                    <div key={t.name} className="p-3 bg-gray-800 rounded-lg border-l-4 border-green-500">
                                        <p className="font-bold text-sm">{t.name}</p><p className="text-xs text-gray-400 leading-tight mt-1">{t.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(categories).map(([cat, attrs]) => (
                            <div key={cat} className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                <h3 className="font-black uppercase tracking-widest text-xs mb-4 text-purple-400">{cat}</h3>
                                <div className="space-y-3">
                                    {attrs.map(a => (
                                        <div key={a} className="flex items-center space-x-3">
                                            <span className="w-10 text-xs font-mono font-bold text-gray-500">{a}</span>
                                            <div className="flex-grow"><StatBar value={goat.attributes[a]} /></div>
                                            <span className="text-[10px] text-gray-600 font-bold">({goat.potential[a]})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CaptainSelectorModal = ({ goats, onConfirm }) => {
    const [selectedId, setSelectedId] = useState(null);
    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-md">
            <div className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-2xl text-center text-white max-w-2xl w-full animate-fade-in-up">
                <h2 className="text-3xl font-black text-yellow-400 mb-2">Select Your Captain</h2>
                <p className="text-gray-400 mb-6">Choose a leader for the season. They will receive a permanent +2 attribute boost. If they are sold or poached, you will be without a captain!</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 max-h-64 overflow-y-auto pr-2">
                    {goats.map(g => (
                        <div key={g.id} onClick={() => setSelectedId(g.id)} className={`p-4 rounded-lg cursor-pointer border-2 transition ${selectedId === g.id ? 'border-yellow-400 bg-yellow-900/30' : 'border-gray-600 bg-gray-900 hover:border-gray-500'}`}>
                            <p className="font-bold">{g.name}</p>
                            <p className="text-xs text-gray-400 mt-1 uppercase text-purple-400">{g.quality}</p>
                        </div>
                    ))}
                </div>
                <button onClick={() => onConfirm(selectedId)} disabled={!selectedId} className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:text-gray-500 px-6 py-4 rounded-lg font-black text-black text-xl transition-colors tracking-widest uppercase shadow-lg">Confirm Captain</button>
            </div>
        </div>
    );
};

export const RivalOfferModal = ({ offer, onAccept, onDecline }) => (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-2xl text-center text-white max-w-lg w-full animate-fade-in-up">
            {offer.type === 'forced' && (
                <div>
                    <h2 className="text-3xl font-black mb-4 text-red-400 tracking-widest">BOARD OVERRIDE!</h2>
                    <p className="text-lg">The Board of Directors received an astronomical offer of <strong className="text-yellow-400">${offer.price.toLocaleString()}</strong> from <strong>{offer.rivalName}</strong> for your star goat, <strong>{offer.goat.name}</strong>.</p>
                    <p className="text-gray-400 mt-4 mb-6 italic">They have accepted it on your behalf. The goat has been sold and funds added to your account.</p>
                    <button onClick={onAccept} className="bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg w-full font-bold uppercase tracking-widest transition">Acknowledge</button>
                </div>
            )}
            {offer.type === 'trade' && (
                <div>
                    <h2 className="text-3xl font-black mb-4 text-purple-400">Trade Proposal!</h2>
                    <p><strong>{offer.rivalName}</strong> wants to trade their goat <strong>{offer.tradeGoat.name}</strong> (Val: <span className="text-yellow-400">${offer.tradeGoat.value.toLocaleString()}</span>) for your <strong>{offer.goat.name}</strong> (Val: <span className="text-yellow-400">${offer.goat.value.toLocaleString()}</span>).</p>
                    <div className="flex space-x-4 justify-center mt-8">
                        <button onClick={onAccept} className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold flex-1">Accept Trade</button>
                        <button onClick={onDecline} className="bg-gray-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold flex-1">Decline</button>
                    </div>
                </div>
            )}
            {offer.type === 'cash' && (
                <div>
                    <h2 className="text-3xl font-black mb-4 text-green-400">Transfer Offer!</h2>
                    <p><strong>{offer.rivalName}</strong> wants to buy <strong>{offer.goat.name}</strong> for <strong className="text-yellow-400">${offer.price.toLocaleString()}</strong></p>
                    <p className="text-xs text-gray-400 mt-2 mb-6">(Declining will reduce the goat's morale)</p>
                    <div className="flex space-x-4 justify-center">
                        <button onClick={onAccept} className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold flex-1">Accept</button>
                        <button onClick={onDecline} className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold flex-1">Decline</button>
                    </div>
                </div>
            )}
        </div>
    </div>
);

export const FormationSelectorModal = ({ onConfirm }) => {
    const [slots, setSlots] = useState([null, null, null]);
    const isComplete = slots.every(s => s !== null);
    const assignSlot = (index, role) => { const newSlots = [...slots]; newSlots[index] = role; setSlots(newSlots); };

    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-md">
            <div className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-2xl text-center text-white max-w-2xl w-full animate-fade-in-up">
                <h2 className="text-3xl font-black text-green-400 mb-2">Tactical Setup</h2>
                <p className="text-gray-400 mb-8">Select your 3-goat formation for the upcoming season. This cannot be changed until next year!</p>
                <div className="flex justify-center gap-6 mb-8">
                    {[0,1,2].map(i => (
                        <div key={i} className={`p-4 border-2 rounded-xl flex flex-col items-center w-32 transition ${slots[i] ? 'border-green-500 bg-green-900/30' : 'border-gray-600 bg-gray-900'}`}>
                            <div className="mb-4 text-gray-400 text-xs font-bold uppercase tracking-widest">Slot {i+1}</div>
                            {slots[i] ? (
                                <div className="text-green-400 flex flex-col items-center">
                                    {tacticalRoles[slots[i]].icon} <span className="font-bold mt-2">{tacticalRoles[slots[i]].name}</span>
                                    <button onClick={()=>assignSlot(i, null)} className="text-xs text-red-400 mt-2 hover:underline">Clear</button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2 w-full">
                                    <button onClick={()=>assignSlot(i, 'vanguard')} className="text-xs p-2 bg-gray-700 hover:bg-gray-600 rounded">Vanguard</button>
                                    <button onClick={()=>assignSlot(i, 'anchor')} className="text-xs p-2 bg-gray-700 hover:bg-gray-600 rounded">Anchor</button>
                                    <button onClick={()=>assignSlot(i, 'scout')} className="text-xs p-2 bg-gray-700 hover:bg-gray-600 rounded">Scout</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <button onClick={() => onConfirm(slots)} disabled={!isComplete} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 px-6 py-4 rounded-lg font-black text-white text-xl transition-colors tracking-widest uppercase shadow-lg">Lock In Formation</button>
            </div>
        </div>
    );
};

export const CompetitionModal = ({ competition, playerFarm, playerGoats, onStart, onClose }) => {
    const isTeamMatch = competition.details.requiredGoats > 1;
    const initialSlots = isTeamMatch ? playerFarm.formation.reduce((acc, role, i) => { acc[`${i}_${role}`] = null; return acc; }, {}) : { '0_solo': null };
    const [assignments, setAssignments] = useState(initialSlots);
    const [selectedGoatId, setSelectedGoatId] = useState(null);

    if (competition.stage === 'result') {
        const { win, pScore, oScore } = competition.matchResult;
        return (
            <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-2xl text-center text-white max-w-sm w-full animate-fade-in-up">
                    <h2 className="text-4xl font-black mb-2 tracking-widest">{win === 'player' ? <span className="text-green-400">VICTORY</span> : win === 'draw' ? <span className="text-yellow-400">DRAW</span> : <span className="text-red-400">DEFEAT</span>}</h2>
                    <p className="text-gray-400 mb-8">{competition.details.title} vs {competition.details.opponentName}</p>
                    <div className="flex justify-center items-center space-x-6 mb-8 text-5xl font-bold font-mono">
                        <div className={win === 'player' ? 'text-green-400' : 'text-gray-400'}>{pScore}</div><div className="text-gray-600 text-3xl">-</div><div className={win === 'opponent' ? 'text-green-400' : 'text-gray-400'}>{oScore}</div>
                    </div>
                    <button onClick={() => onClose(true)} className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-bold text-white transition-colors">Continue</button>
                </div>
            </div>
        );
    }

    const handleAssign = (slotKey) => {
        if (!selectedGoatId) return;
        const goat = playerGoats.find(g => g.id === selectedGoatId);
        const newAssignments = { ...assignments };
        Object.keys(newAssignments).forEach(k => { if (newAssignments[k]?.id === goat.id) newAssignments[k] = null; });
        newAssignments[slotKey] = goat; setAssignments(newAssignments); setSelectedGoatId(null);
    };

    const handleClearSlot = (slotKey) => { setAssignments(prev => ({ ...prev, [slotKey]: null })); };
    const canStart = Object.values(assignments).some(val => val !== null);

    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-2 sm:p-4 backdrop-blur-md">
            <div className="bg-gray-800 border border-gray-700 p-4 sm:p-6 rounded-xl shadow-2xl text-white max-w-5xl w-full flex flex-col max-h-[95vh] overflow-y-auto animate-fade-in-up">
                
                <div className="text-center mb-6 border-b border-gray-700 pb-4 shrink-0">
                    <h2 className="text-2xl sm:text-3xl font-black text-green-400 uppercase tracking-widest">{competition.details.title}</h2>
                    <p className="text-lg sm:text-xl font-bold text-white mt-1">VS. {competition.details.opponentName}</p>
                    <p className="mt-2 text-xs text-gray-400">Tested Attributes: <span className="text-yellow-400 font-bold">{competition.details.keyAttributes.join(', ')}</span></p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 mb-6 flex-1">
                    {/* Left: Player Roster */}
                    <div className="lg:w-1/3 flex flex-col bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-bold mb-3 text-white border-b border-gray-700 pb-2 shrink-0">Your Roster</h3>
                        <div className="flex-1 max-h-48 lg:max-h-80 overflow-y-auto space-y-2 pr-2">
                            {playerGoats.map(g => {
                                const isAssigned = Object.values(assignments).some(ag => ag?.id === g.id);
                                const isExhausted = g.condition < 40;
                                const isDisabled = isAssigned || isExhausted;
                                
                                return (
                                    <div key={g.id} onClick={() => !isDisabled && setSelectedGoatId(g.id)} className={`p-3 rounded-lg border transition ${isExhausted ? 'opacity-50 bg-red-900/20 border-red-800 cursor-not-allowed' : isAssigned ? 'opacity-40 bg-gray-900 border-gray-800 cursor-not-allowed' : selectedGoatId === g.id ? 'bg-green-900/50 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-gray-800 border-gray-600 hover:border-gray-400 cursor-pointer'}`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-sm truncate">{g.name} {playerFarm.captainId === g.id && <span className="text-[10px] bg-yellow-400 text-black px-1 rounded ml-1">C</span>}</span>
                                            <span className={`text-xs font-bold ${isExhausted ? 'text-red-500 animate-pulse' : g.condition < 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                {isExhausted ? 'UNFIT' : `${g.condition}%`}
                                            </span>
                                        </div>
                                        <div className="flex space-x-3 text-[10px] text-gray-400">{competition.details.keyAttributes.map(attr => ( <span key={attr}>{attr}: <span className="text-white font-mono">{g.attributes[attr]}</span></span> ))}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Middle: Tactics Board */}
                    <div className="lg:w-1/3 flex flex-col bg-gray-900 p-4 rounded-lg border border-gray-700 shrink-0">
                        <h3 className="text-lg font-bold mb-3 text-white border-b border-gray-700 pb-2">Tactics Board</h3>
                        <div className="flex-1 space-y-4">
                            {Object.keys(assignments).map(slotKey => {
                                const roleId = slotKey.split('_')[1]; const roleInfo = tacticalRoles[roleId]; const assignedGoat = assignments[slotKey];
                                return (
                                    <div key={slotKey} className={`border rounded-lg p-3 ${selectedGoatId && !assignedGoat ? 'border-green-500 bg-green-900/20 animate-pulse' : 'border-gray-600 bg-gray-800'}`}>
                                        <div className="flex justify-between items-center mb-2"><span className="font-bold text-sm text-purple-400 flex items-center">{roleInfo.icon} <span className="ml-2">{roleInfo.name}</span></span></div>
                                        {assignedGoat ? (
                                            <div className="flex justify-between items-center bg-gray-900 p-2 rounded border border-green-500"><span className="font-bold text-sm text-white truncate">{assignedGoat.name}</span><button onClick={() => handleClearSlot(slotKey)} className="text-xs text-red-400 hover:text-red-300 ml-2 shrink-0">Clear</button></div>
                                        ) : (
                                            <button onClick={() => handleAssign(slotKey)} disabled={!selectedGoatId} className="w-full py-2 border border-dashed border-gray-500 rounded text-gray-400 text-sm hover:border-green-400 hover:text-green-400 transition disabled:opacity-50">Select fit goat, click here</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Opponent Roster */}
                    <div className="lg:w-1/3 flex flex-col bg-gray-900 p-4 rounded-lg border border-red-900/50 shrink-0">
                        <h3 className="text-lg font-bold mb-3 text-red-400 border-b border-gray-700 pb-2">Opposition Lineup</h3>
                        <div className="flex-1 space-y-4">
                            {competition.details.opponentRoster ? competition.details.opponentRoster.map((oppGoat, idx) => {
                                const roleInfo = tacticalRoles[oppGoat.assignedRole];
                                return (
                                    <div key={idx} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                                        <div className="flex justify-between items-center mb-2"><span className="font-bold text-sm text-red-400 flex items-center">{roleInfo?.icon} <span className="ml-2">{roleInfo?.name}</span></span></div>
                                        <div className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-600"><span className="font-bold text-sm text-gray-300 truncate">{oppGoat.name}</span><span className="text-xs text-yellow-400 font-mono ml-2 shrink-0">OVR {oppGoat.scoutRating}</span></div>
                                    </div>
                                );
                            }) : <p className="text-gray-500 italic text-sm text-center mt-8">Scouting data unavailable.</p>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-auto shrink-0">
                    <button onClick={() => onClose(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-4 rounded-lg font-black tracking-widest uppercase transition">Cancel</button>
                    <button onClick={() => { if(window.confirm('Are you sure you want to forfeit? This results in a heavy 0-150 loss and a massive morale drop for the herd.')) onStart({}, true); }} className="flex-1 bg-red-900/80 text-red-200 hover:bg-red-700 px-4 py-4 rounded-lg font-black tracking-widest uppercase transition border border-red-700">Forfeit</button>
                    <button onClick={() => onStart(assignments, false)} disabled={!canStart} className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 px-4 py-4 rounded-lg font-black text-white tracking-widest uppercase transition shadow-lg">Start Match</button>
                </div>
            </div>
        </div>
    );
};

export const SponsorshipOfferModal = ({ offer, onAccept, onDecline }) => {
    if (!offer) return null;
    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-2xl text-center text-white max-w-lg w-full animate-fade-in-up">
                <h2 className="text-3xl font-black mb-4 text-purple-400">Corporate Sponsorship!</h2>
                <p className="mb-4 text-gray-300">Your herd's production metrics (DIG, MYL, MQL, WQL) have attracted corporate interest for the upcoming season.</p>
                <p className="text-xl mb-6"><strong>{offer.sponsorName}</strong> is offering a one-year sponsorship signing bonus worth <strong className="text-yellow-400 font-mono text-2xl ml-2">${offer.amount.toLocaleString()}</strong>.</p>
                <div className="flex space-x-4 justify-center mt-8">
                    <button onClick={onAccept} className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold flex-1 transition shadow-lg">Sign Contract</button>
                    <button onClick={onDecline} className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold flex-1 transition shadow-lg">Decline</button>
                </div>
            </div>
        </div>
    );
};

export const SeasonSummaryModal = ({ data, onContinue }) => (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-md overflow-y-auto">
        <div className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-2xl text-center text-white max-w-xl w-full my-auto animate-fade-in-up">
            <h2 className="text-4xl font-black text-green-400 mb-2">Season {data.season} Complete!</h2>
            <p className="text-gray-400 mb-6">The board has reviewed your performance.</p>

            {data.promoRelStatus && data.promoRelStatus !== 'Retained' && (
                <div className={`mb-6 p-3 rounded-lg text-center font-black text-2xl uppercase tracking-widest ${data.promoRelStatus === 'Promoted' ? 'bg-green-900/50 text-green-400 border-2 border-green-500' : 'bg-red-900/50 text-red-400 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}>
                    YOU HAVE BEEN {data.promoRelStatus}!
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold">Final Position</p>
                    <p className="text-3xl font-bold text-white">{data.finalPosition} <span className="text-sm font-normal text-gray-400">(League {data.finalLeagueLevel || '?'})</span></p>
                </div>
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold">Record</p>
                    <p className="text-3xl font-bold text-white">{data.wins}-{data.draws}-{data.losses}</p>
                </div>
            </div>

            <div className="bg-gray-900 p-4 rounded border border-yellow-500/30 mb-6">
                <p className="text-xs text-yellow-500 uppercase font-bold mb-3">Finances & Taxation</p>
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Shop Income:</span><span className="font-bold text-green-400">+${(data.shopIncome || 0).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Replica Kit Sales (Wool Qty):</span><span className="font-bold text-green-400">+${(data.replicaKitIncome || 0).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm mb-1 mt-2 border-t border-gray-800 pt-2"><span className="text-gray-400">Pre-Tax Funds:</span><span className="font-bold">${data.preTaxMoney.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Gov. Tax Rate:</span><span className="font-bold text-red-400">{data.taxPct}%</span></div>
                <div className="flex justify-between text-sm mb-3"><span className="text-gray-400">Tax Deducted:</span><span className="font-bold text-red-400">-${data.taxAmount.toLocaleString()}</span></div>
                <p className="text-xs text-gray-400 italic bg-gray-800 p-2 rounded">"{data.taxNote}"</p>
            </div>

            <button onClick={onContinue} className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-lg font-black text-white text-xl transition-colors tracking-widest uppercase shadow-lg">Start Next Season</button>
        </div>
    </div>
);
export const DiceOfDestinyModal = ({ goats, money, onClose, onComplete }) => {
    const cost = Math.max(100000, Math.floor(money * 0.10));
    const [selectedGoatId, setSelectedGoatId] = useState(null);
    const [rolling, setRolling] = useState(false);
    const [result, setResult] = useState(null);

    const handleRoll = () => {
        setRolling(true);
        setTimeout(() => {
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            setResult({d1, d2});
            setTimeout(() => {
                onComplete(d1, d2, selectedGoatId, cost);
            }, 3500); // 3.5 seconds of agonizing suspense showing the result!
        }, 1500); // 1.5 seconds of rolling animation
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-md">
            <div className="bg-gray-800 border border-red-900/80 p-8 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.3)] text-center text-white max-w-md w-full animate-fade-in-up">
                <h2 className="text-3xl font-black text-red-400 mb-2">🎲 Dice of Destiny</h2>
                
                {!rolling && !result && (
                    <>
                        <p className="text-gray-300 mb-6">Cost to roll: <strong className="text-yellow-400">${cost.toLocaleString()}</strong></p>
                        <div className="mb-6 bg-gray-900 p-4 rounded text-left text-sm text-gray-400 border border-gray-700">
                            <p className="mb-1"><strong className="text-green-400">Double 1-4:</strong> Target gains 1-4 stats (+1)</p>
                            <p className="mb-1"><strong className="text-purple-400">Double 5:</strong> Target gains 5 stats (+2)</p>
                            <p className="mb-1 text-red-400 font-bold border-t border-gray-700 pt-1 mt-1"><strong className="text-red-500">Double 6:</strong> You lose ALL your money.</p>
                            <p className="mt-2 text-xs italic text-gray-500">Non-doubles result in losing the fee.</p>
                        </div>
                        
                        <div className="mb-6 text-left">
                            <label className="block text-gray-300 font-bold mb-2">Select Target Goat:</label>
                            <select 
                                className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white font-bold cursor-pointer outline-none focus:ring-1 focus:ring-red-500"
                                value={selectedGoatId || ''}
                                onChange={e => setSelectedGoatId(e.target.value)}
                            >
                                <option value="" disabled>-- Select a Target --</option>
                                {goats.map(g => <option key={g.id} value={g.id}>{g.name} (Value: ${g.value.toLocaleString()})</option>)}
                            </select>
                        </div>
                        
                        <div className="flex space-x-4">
                            <button onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg font-bold transition">Cancel</button>
                            <button onClick={handleRoll} disabled={!selectedGoatId || money < cost} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-black uppercase tracking-widest shadow-lg transition">Roll Dice</button>
                        </div>
                    </>
                )}

                {rolling && !result && (
                    <div className="py-12 animate-pulse">
                        <p className="text-6xl mb-4">🎲 🎲</p>
                        <p className="text-xl font-bold text-red-400 tracking-widest uppercase">Rolling...</p>
                    </div>
                )}

                {result && (
                    <div className="py-8 animate-fade-in-up">
                        <div className="flex justify-center space-x-8 text-6xl mb-6">
                            <div className="bg-white text-black w-24 h-24 flex items-center justify-center rounded-xl shadow-inner font-black">{result.d1}</div>
                            <div className="bg-white text-black w-24 h-24 flex items-center justify-center rounded-xl shadow-inner font-black">{result.d2}</div>
                        </div>
                        {result.d1 === result.d2 ? (
                            result.d1 === 6 ? (
                                <p className="text-2xl font-black text-red-500 animate-bounce leading-tight">DISASTER!<br/>ALL FUNDS LOST!</p>
                            ) : (
                                <p className="text-2xl font-black text-green-400 animate-bounce leading-tight">SUCCESS!<br/>MASSIVE BUFF GRANTED!</p>
                            )
                        ) : (
                            <p className="text-xl font-bold text-gray-400">No match.<br/>You lost the fee.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const WorldCupSetupModal = ({ goats, playerCountry, worldCupTeams, onConfirm }) => {
    const [selectedCountry, setSelectedCountry] = useState(playerCountry || '');
    const [selectedGoats, setSelectedGoats] = useState([]);

    const toggleGoat = (id) => {
        if (selectedGoats.includes(id)) {
            setSelectedGoats(selectedGoats.filter(g => g !== id));
        } else if (selectedGoats.length < 4) {
            setSelectedGoats([...selectedGoats, id]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-md">
            <div className="bg-gray-800 border border-blue-500/50 p-8 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.3)] text-white max-w-2xl w-full animate-fade-in-up">
                <h2 className="text-3xl font-black text-blue-400 mb-2 text-center">🌍 The Goat World Cup</h2>
                <p className="text-gray-300 text-center mb-6 text-sm">Every four years, the greatest herds on earth assemble. Select your national team and pick exactly 4 world-class goats to represent your country. The standard of play here is Elite.</p>
                
                <div className="mb-6 bg-gray-900 p-4 rounded border border-gray-700">
                    <label className="block text-gray-300 font-bold mb-2 uppercase tracking-widest text-xs">National Team Setup</label>
                    {playerCountry ? (
                        <p className="text-xl font-bold text-green-400 flex items-center">✅ Locked: {playerCountry}</p>
                    ) : (
                        <select 
                            className="w-full bg-gray-800 border border-blue-500 rounded p-3 text-white font-bold cursor-pointer outline-none focus:ring-2 focus:ring-blue-400"
                            value={selectedCountry}
                            onChange={e => setSelectedCountry(e.target.value)}
                        >
                            <option value="" disabled>-- Select Your Country --</option>
                            {worldCupTeams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    )}
                    {!playerCountry && <p className="text-xs text-red-400 mt-2 font-bold">WARNING: This choice is permanent for all future World Cups!</p>}
                </div>

                <div className="mb-6">
                    <label className="block text-gray-300 font-bold mb-2 uppercase tracking-widest text-xs">Select 4 Travelling Goats ({selectedGoats.length}/4)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                        {goats.map(g => (
                            <div key={g.id} onClick={() => toggleGoat(g.id)} className={`p-3 rounded border cursor-pointer flex justify-between items-center transition-colors ${selectedGoats.includes(g.id) ? 'bg-blue-900/50 border-blue-400 shadow-inner' : selectedGoats.length >= 4 ? 'bg-gray-900 border-gray-700 opacity-50 cursor-not-allowed' : 'bg-gray-800 border-gray-600 hover:border-gray-400'}`}>
                                <div><p className="font-bold">{g.name}</p><p className="text-xs text-gray-400">Value: ${g.value.toLocaleString()}</p></div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedGoats.includes(g.id) ? 'border-blue-400 bg-blue-500' : 'border-gray-500'}`}>{selectedGoats.includes(g.id) && <span className="text-white text-xs">✓</span>}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => onConfirm(selectedCountry, selectedGoats)} 
                    disabled={!selectedCountry || selectedGoats.length !== 4} 
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-lg font-black uppercase tracking-widest shadow-lg transition"
                >
                    Confirm World Cup Squad
                </button>
            </div>
        </div>
    );
};
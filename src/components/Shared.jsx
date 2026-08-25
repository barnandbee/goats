import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, XCircle } from 'lucide-react';

export const StatBar = ({ value }) => {
    const isLegendary = value > 50;
    // Cap the visual fill at 100% so the bar doesn't break out of its container
    const pct = Math.min(100, (value / 50) * 100);
    
    let color = 'bg-red-500';
    if (isLegendary) color = 'bg-purple-500';
    else if (value >= 40) color = 'bg-green-500';
    else if (value >= 25) color = 'bg-yellow-500';
    
    return (
        <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-700 h-2 rounded overflow-hidden shadow-inner">
                <div className={`${color} h-full ${isLegendary ? 'shadow-[0_0_8px_rgba(168,85,247,0.8)]' : ''}`} style={{ width: `${pct}%` }}></div>
            </div>
            <span className={`text-xs font-bold ${isLegendary ? 'text-purple-400 drop-shadow-[0_0_2px_rgba(168,85,247,0.8)]' : 'text-gray-300'}`}>{value}</span>
        </div>
    );
};

export const StatCard = ({ icon, label, value }) => (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md flex items-center space-x-4">
        <div className="bg-gray-700 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);

export const SortableHeader = ({ children, sortKey, sortConfig, requestSort }) => {
    const getSortIcon = () => { 
        if (sortConfig.key !== sortKey) return <ChevronsUpDown className="h-4 w-4 inline text-gray-500" />; 
        return sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4 inline" /> : <ChevronDown className="h-4 w-4 inline" />; 
    };
    return (
        <th scope="col" className="px-2 py-3 cursor-pointer hover:text-white" onClick={() => requestSort(sortKey)}>
            {children} {getSortIcon()}
        </th>
    );
};

export const Notification = ({ message, type, onDismiss }) => {
    if (!message) return null;
    return (
        <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 p-4 rounded shadow-lg z-50 flex justify-between items-center w-64 z-[999] animate-fade-in-up">
            <span className={type === 'error' ? 'text-red-400' : 'text-green-400'}>{message}</span>
            <button onClick={onDismiss} className="text-gray-400 hover:text-white transition-colors"><XCircle size={16}/></button>
        </div>
    );
};
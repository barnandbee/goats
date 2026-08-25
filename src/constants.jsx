import React from 'react';
import { Crosshair, Anchor, Navigation, Award } from 'lucide-react';

export const firstNames = ["Buckminster", "Vincent", "Billy", "Gruff", "Pebble", "Willow", "Hazel", "Barnaby", "Clover", "Angus", "Buttercup", "Daisy", "Elmer", "Ferdinand", "Gertie", "Apollo", "Bramble", "Chester", "Daphne", "Edgar", "Flora", "Gideon", "Homer", "Iris", "Jasper", "Kip", "Luna", "Milo", "Nala", "Orion", "Pippin", "Quincy", "Rusty", "Scout", "Turnip", "Ulysses", "Vinnie", "Winston", "Xena", "Yoshi", "Zeus"];
export const lastNames = ["Fuller", "van Goat", "the Kid", "Stonehoof", "Greenfield", "O'Malley", "McTavish", "Hornblower", "Flufferton", "Blackleg", "Whitewool", "Silvermane", "Trotter", "Meadows", "Cheesemaker", "Haystack", "Cloverfield", "Highlander", "Scruff", "Nibbles", "Stargazer", "Moonwalker", "Cliffjumper", "Pebbledash", "Dewdrop", "Bramblebush", "Thistle", "Crag", "Ridge", "Scart", "Vale", "Glen", "Brook", "Moss", "Fern", "Frost", "Snow"];

export const europeanTeams = ["Swiss Alpine Ascenders", "Norwegian Fjord Foragers", "Tuscan Sun Grazers", "Bavarian Brewers", "Scottish Highland Hoofers", "Iberian Ibex Imitators", "French Fromagers", "Dutch Dike Defenders", "Belgian Bluff Climbers", "Irish Clover Collectors", "Swedish Summit Seekers", "Polish Peak Performers", "Greek Gorge Goats", "Romanian Ramblers", "Czech Crystal Cavers"];

export const corporateSponsors = [
    "Trough & Co. Feeds", "Billy's Beard Trimmers", "Hoof & Polish Salons", "Alpine Ascend Gear",
    "Gruff's Hardware", "Meadow Sweet Dairies", "Bleat Beats Audio", "The Golden Horn Pub",
    "Cloven Hoof Cobblers", "Chevre Chic Boutique", "Ruminant Records", "Hay Bale Holidays",
    "Salt Lick City Bank", "Grazing Greens Landscaping", "Fleece & Co. Tailors"
];

export const rivalHerdNames = [
    "Blackwood Goats", "Thistlebottom Farm", "Whispering Pines", "Grumblecreek", "Stony Ridge", "Foggy Bottom", "Ironhoof Grazers",
    "Silver Creek GH", "Golden Fleece", "Highland Climbers", "Valley Foragers", "Mountain Kings", "Riverstone Rovers", "Canyon Wanderers",
    "Bramble Scrappers", "Meadow Grazers", "Forest Horns", "Peak Performers", "Abyss Jumpers", "Cliffside United", "Summit Seekers",
    "Timberland Trotters", "Frosty Peaks", "Emerald Pastures", "Ruby Ridge", "Sapphire Springs", "Obsidian Outcrops", "Granite Grazers",
    "Limestone Leapers", "Marble Meadows", "Quartz Quarry", "Slate Scramblers", "Basalt Bouncers", "Pumice Pushers", "Gravel Groovers"
];

export const allTraits = {
    positive: [{ name: "Pathfinder", desc: "Naturally finds efficient routes." }, { name: "Loyal", desc: "Always stays close to the herder." }, { name: "Calm Demeanor", desc: "Doesn't get spooked easily." }, { name: "Herd Leader", desc: "Improves morale of nearby goats." }, { name: "Pro-Social", desc: "Gets along well with others." }],
    negative: [{ name: "Wanderer", desc: "Prone to getting lost." }, { name: "Stubborn", desc: "Ignores commands frequently." }, { name: "Skittish", desc: "Panics easily from minor disturbances." }, { name: "Fence Tester", desc: "Constantly tries to escape enclosures." }, { name: "Aggressive", desc: "Bullies other goats, causing morale drops." }, { name: "Picky Eater", desc: "Lowers foraging effectiveness." }]
};

export const competitionAttributes = ['AGI', 'STA', 'STR', 'SPD', 'FOR', 'SEL', 'BRV', 'DIS', 'INT'];

export const trainingRegimes = { 
    resting: { name: "Resting", description: "Recovers condition.", affected: [] }, 
    rockyOutcrop: { name: "Rocky Outcrop", description: "Improves Agility and Bravery.", affected: ["AGI", "BRV"] }, 
    lushMeadow: { name: "Lush Meadow", description: "Improves Stamina and Foraging.", affected: ["STA", "FOR"] }, 
    obedienceSchool: { name: "Obedience School", description: "Improves Discipline and Intelligence.", affected: ["DIS", "INT"] } 
};

export const majorTournamentsPool = [
    { id: 't1', name: 'Summer County Fair', prize: 2500, description: "Judged on Milk Quality and Wool Quality.", details: { requiredGoats: 1, keyAttributes: ['MQL', 'WQL', 'condition'] } },
    { id: 't2', name: "Old Man's Peak Hill Climb", prize: 3500, description: "Athletic climb testing Agility, Stamina, and Bravery.", details: { requiredGoats: 1, keyAttributes: ['AGI', 'STA', 'BRV'] } },
    { id: 't3', name: "Great Forage Festival", prize: 3000, description: "Foraging contest testing FOR, SEL, and INT.", details: { requiredGoats: 2, keyAttributes: ['FOR', 'SEL', 'INT'] } },
    { id: 't4', name: "Heavyweight Haul", prize: 4000, description: "Pulling contest testing STR, STA, and BRV.", details: { requiredGoats: 2, keyAttributes: ['STR', 'STA', 'BRV'] } },
    { id: 't5', name: "The Speed Sprints", prize: 3500, description: "Sprint races testing SPD, AGI, and INT.", details: { requiredGoats: 1, keyAttributes: ['SPD', 'AGI', 'INT'] } }
];

export const managerStyles = [ 
    { id: 'A', name: 'The Traditionalist', desc: '+10% effectiveness on DIS training.', bonus: 'Less prone to bad traits.' }, 
    { id: 'B', name: 'The Naturalist', desc: '+10% effectiveness on STA & FOR.', bonus: 'Higher starting morale.' }, 
    { id: 'C', name: 'The Competitor', desc: '+5% to prize money.', bonus: 'Better condition on match days.' } 
];

export const leagueStructure = [
    { level: 1, name: "G.O.A.T. Premier League", trophy: "Golden Horn", relegationTrophy: "Wooden Spoon", aiQuality: 100 },
    { level: 2, name: "Billy the Kit Championship", trophy: "Silver Hoof", relegationTrophy: "Wooden Spoon", aiQuality: 80 },
    { level: 3, name: "Bleat Soda League One", trophy: "Bronze Bell", relegationTrophy: "Wooden Spoon", aiQuality: 60 },
    { level: 4, name: "Nanny Goat Nannies' League Two", trophy: "Iron Collar", relegationTrophy: "Wooden Spoon", aiQuality: 40 },
    { level: 5, name: "Hoof Roofing Conference", trophy: "Tin Pail", relegationTrophy: "Golden Wooden Spoon", aiQuality: 20 }
];

export const startingHerds = [
    { id: 'L1', name: 'Elderflower Meadows', leagueLevel: 1, reputation: '★★★★★', challenge: 'Win the Golden Horn.', perk: 'Elite budget & star goats.', startMoney: 1500000, startFans: 10000, goatQualities: ['world class', 'elite', 'elite', 'excellent', 'excellent', 'very good', 'very good'] },
    { id: 'L2', name: 'Stonewall Scrubs', leagueLevel: 2, reputation: '★★★★☆', challenge: 'Achieve promotion to the Premier League.', perk: 'Great budget & strong starters.', startMoney: 500000, startFans: 5000, goatQualities: ['excellent', 'very good', 'very good', 'good', 'good', 'decent', 'decent'] },
    { id: 'L3', name: 'Whispering Pines', leagueLevel: 3, reputation: '★★★☆☆', challenge: 'Build a solid foundation.', perk: 'Average budget & balanced mix.', startMoney: 150000, startFans: 2000, goatQualities: ['good', 'decent', 'decent', 'average', 'average', 'okay', 'okay'] },
    { id: 'L4', name: 'Rusty Gate Farm', leagueLevel: 4, reputation: '★★☆☆☆', challenge: 'Survive and develop youth.', perk: 'Poor budget & scrappy youth.', startMoney: 50000, startFans: 500, goatQualities: ['average', 'okay', 'okay', 'poor', 'poor', 'very poor', 'very poor'] },
    { id: 'L5', name: 'GH Muddy Puddle', leagueLevel: 5, reputation: '★☆☆☆☆', challenge: 'Escape the Golden Wooden Spoon.', perk: 'Zero budget & terrible goats.', startMoney: 5000, startFans: 50, goatQualities: ['poor', 'very poor', 'very poor', 'very poor', 'very poor', 'very poor', 'very poor'] }
];

export const tacticalRoles = {
    vanguard: { id: 'vanguard', name: 'Vanguard', icon: <Crosshair size={16}/>, desc: '+20% to AGI, SPD, BRV', bonuses: ['AGI', 'SPD', 'BRV'] },
    anchor: { id: 'anchor', name: 'Anchor', icon: <Anchor size={16}/>, desc: '+20% to STR, STA, DIS', bonuses: ['STR', 'STA', 'DIS'] },
    scout: { id: 'scout', name: 'Scout', icon: <Navigation size={16}/>, desc: '+20% to FOR, SEL, INT', bonuses: ['FOR', 'SEL', 'INT'] },
    solo: { id: 'solo', name: 'Solo Competitor', icon: <Award size={16}/>, desc: 'Standard Performance', bonuses: [] }
};
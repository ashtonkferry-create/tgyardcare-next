export interface QuestionOption {
  value: string;
  label: string;
  emoji: string;
  desc: string;
}

export interface ServiceQuestion {
  id: string;
  question: string;
  options: QuestionOption[];
}

export const SERVICE_QUESTIONS: Record<string, ServiceQuestion[]> = {
  mowing: [
    {
      id: 'frequency',
      question: 'How often do you want your lawn mowed?',
      options: [
        { value: 'weekly', label: 'Weekly', emoji: '📅', desc: 'Best for fast-growing lawns' },
        { value: 'biweekly', label: 'Bi-Weekly', emoji: '🗓️', desc: 'Most popular choice' },
        { value: 'monthly', label: 'Monthly', emoji: '📆', desc: 'Light maintenance' },
      ],
    },
    {
      id: 'condition',
      question: "What's your lawn's current condition?",
      options: [
        { value: 'good', label: 'Well Maintained', emoji: '✅', desc: 'Regular upkeep, looking good' },
        { value: 'average', label: 'Needs Some Work', emoji: '⚠️', desc: 'A few patches, some weeds' },
        { value: 'overgrown', label: 'Overgrown', emoji: '🌿', desc: "Hasn't been cut in a while" },
      ],
    },
  ],
  fertilization: [
    {
      id: 'lawn_health',
      question: 'How would you describe your lawn?',
      options: [
        { value: 'good', label: 'Mostly Green', emoji: '💚', desc: 'Some thin spots, few weeds' },
        { value: 'average', label: 'Patchy & Thin', emoji: '🟡', desc: 'Needs thickening up' },
        { value: 'poor', label: 'Lots of Weeds', emoji: '🌾', desc: 'Weeds taking over' },
      ],
    },
    {
      id: 'pets',
      question: 'Do you have pets that use the lawn?',
      options: [
        { value: 'no', label: 'No Pets', emoji: '🏡', desc: 'Standard treatment program' },
        { value: 'yes', label: 'Yes, Pets', emoji: '🐕', desc: 'We use pet-safe products' },
      ],
    },
  ],
  aeration: [
    {
      id: 'last_aeration',
      question: 'When was your lawn last aerated?',
      options: [
        { value: 'recent', label: 'Within 2 Years', emoji: '✅', desc: 'Good rhythm' },
        { value: 'overdue', label: '3+ Years Ago', emoji: '⚠️', desc: 'Soil compaction likely' },
        { value: 'never', label: 'Never', emoji: '🌱', desc: 'First-time service' },
      ],
    },
  ],
  'spring-cleanup': [
    {
      id: 'trees',
      question: 'How many trees are on your property?',
      options: [
        { value: 'few', label: 'A Few (1–5)', emoji: '🌳', desc: 'Light leaf/debris volume' },
        { value: 'several', label: 'Several (6–15)', emoji: '🌲', desc: 'Moderate cleanup' },
        { value: 'many', label: 'Many (15+)', emoji: '🌲', desc: 'Heavy cleanup needed' },
      ],
    },
  ],
  'fall-cleanup': [
    {
      id: 'trees',
      question: 'How many trees drop leaves on your property?',
      options: [
        { value: 'few', label: 'A Few (1–5)', emoji: '🍂', desc: 'Light leaf volume' },
        { value: 'several', label: 'Several (6–15)', emoji: '🍁', desc: 'Moderate leaf fall' },
        { value: 'many', label: 'Many (15+)', emoji: '🌿', desc: 'Heavy leaf removal' },
      ],
    },
  ],
  'leaf-removal': [
    {
      id: 'trees',
      question: 'How many trees drop leaves on your property?',
      options: [
        { value: 'few', label: 'A Few (1–5)', emoji: '🍂', desc: 'Light volume' },
        { value: 'several', label: 'Several (6–15)', emoji: '🍁', desc: 'Moderate' },
        { value: 'many', label: 'Many (15+)', emoji: '🌿', desc: 'Heavy' },
      ],
    },
  ],
  mulching: [
    {
      id: 'beds',
      question: 'How many garden beds need mulching?',
      options: [
        { value: 'small', label: '1–2 Beds', emoji: '🌸', desc: 'Small project' },
        { value: 'medium', label: '3–5 Beds', emoji: '🌺', desc: 'Medium project' },
        { value: 'large', label: '6+ Beds', emoji: '🌻', desc: 'Large property' },
      ],
    },
  ],
  'gutter-cleaning': [
    {
      id: 'stories',
      question: 'How many stories is your home?',
      options: [
        { value: '1', label: '1 Story', emoji: '🏠', desc: 'Ranch or bungalow' },
        { value: '2', label: '2 Stories', emoji: '🏡', desc: 'Most common' },
        { value: '3+', label: '3+ Stories', emoji: '🏢', desc: 'Taller home' },
      ],
    },
    {
      id: 'last_cleaned',
      question: 'When were your gutters last cleaned?',
      options: [
        { value: 'recent', label: 'Within 1 Year', emoji: '✅', desc: 'Regular maintenance' },
        { value: 'medium', label: '1–3 Years Ago', emoji: '⚠️', desc: 'May have buildup' },
        { value: 'unknown', label: 'Never / Unknown', emoji: '❓', desc: 'Full clean needed' },
      ],
    },
  ],
  'gutter-guards': [
    {
      id: 'stories',
      question: 'How many stories is your home?',
      options: [
        { value: '1', label: '1 Story', emoji: '🏠', desc: 'Ranch or bungalow' },
        { value: '2', label: '2 Stories', emoji: '🏡', desc: 'Most common' },
        { value: '3+', label: '3+ Stories', emoji: '🏢', desc: 'Taller home' },
      ],
    },
  ],
  'snow-removal': [
    {
      id: 'driveway',
      question: "What's your driveway situation?",
      options: [
        { value: 'single', label: 'Single Car', emoji: '🚗', desc: 'Up to 12 ft wide' },
        { value: 'double', label: 'Double Car', emoji: '🚙', desc: '12–24 ft wide' },
        { value: 'long', label: 'Long Driveway', emoji: '🛣️', desc: 'Over 50 ft long' },
      ],
    },
    {
      id: 'sidewalks',
      question: 'Do you need sidewalks cleared?',
      options: [
        { value: 'none', label: 'No Sidewalks', emoji: '🏠', desc: 'Driveway only' },
        { value: 'front', label: 'Front Walk', emoji: '🚶', desc: 'Front path to door' },
        { value: 'full', label: 'Full Perimeter', emoji: '🔄', desc: 'All sidewalks' },
      ],
    },
  ],
  herbicide: [
    {
      id: 'severity',
      question: 'How bad is your weed problem?',
      options: [
        { value: 'minor', label: 'Minor', emoji: '🌱', desc: 'Scattered weeds' },
        { value: 'moderate', label: 'Moderate', emoji: '⚠️', desc: 'Noticeable coverage' },
        { value: 'severe', label: 'Severe', emoji: '🌾', desc: 'Weeds dominating' },
      ],
    },
  ],
  weeding: [
    {
      id: 'area',
      question: 'What needs weeding?',
      options: [
        { value: 'beds', label: 'Garden Beds', emoji: '🌸', desc: 'Flower/plant beds' },
        { value: 'edges', label: 'Lawn Edges', emoji: '✂️', desc: 'Along walkways/drive' },
        { value: 'both', label: 'Both', emoji: '🏡', desc: 'Full property' },
      ],
    },
  ],
  'garden-beds': [
    {
      id: 'beds',
      question: 'How many garden beds need care?',
      options: [
        { value: 'small', label: '1–2 Beds', emoji: '🌸', desc: 'Small project' },
        { value: 'medium', label: '3–5 Beds', emoji: '🌺', desc: 'Medium project' },
        { value: 'large', label: '6+ Beds', emoji: '🌻', desc: 'Large property' },
      ],
    },
  ],
  pruning: [
    {
      id: 'plants',
      question: 'What needs pruning?',
      options: [
        { value: 'shrubs', label: 'Shrubs Only', emoji: '🌿', desc: 'Bushes and hedges' },
        { value: 'trees', label: 'Trees Only', emoji: '🌳', desc: 'Small to medium trees' },
        { value: 'both', label: 'Both', emoji: '🌲', desc: 'Full property' },
      ],
    },
  ],
  hardscaping: [
    {
      id: 'project_type',
      question: 'What type of hardscaping project?',
      options: [
        { value: 'patio', label: 'Patio', emoji: '🪑', desc: 'Outdoor living space' },
        { value: 'walkway', label: 'Walkway', emoji: '🚶', desc: 'Path or steps' },
        { value: 'wall', label: 'Retaining Wall', emoji: '🧱', desc: 'Grade or erosion control' },
        { value: 'multiple', label: 'Multiple', emoji: '🏗️', desc: 'More than one type' },
      ],
    },
  ],
};

export function getServiceQuestions(serviceSlug: string): ServiceQuestion[] {
  return SERVICE_QUESTIONS[serviceSlug] ?? [];
}

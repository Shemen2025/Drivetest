
import { Question } from './types';

export const QUESTIONS: Question[] = [
  {
    id: '1',
    category: 'Road and Traffic Signs',
    question: 'What does this sign mean?',
    options: [
      'No entry for motor vehicles',
      'End of clearway',
      'National speed limit applies',
      'Give way to oncoming traffic'
    ],
    correctAnswerIndex: 2,
    explanation: 'The circular sign with a diagonal black stripe on a white background signifies the end of all local speed limits and the start of the national speed limit.',
    imageUrl: 'https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=400&h=300&auto=format&fit=crop'
  },
  {
    id: '2',
    category: 'Safety Margins',
    question: 'In good conditions, what is the typical overall stopping distance at 70 mph?',
    options: [
      '53 metres (175 feet)',
      '60 metres (197 feet)',
      '73 metres (240 feet)',
      '96 metres (315 feet)'
    ],
    correctAnswerIndex: 3,
    explanation: 'At 70 mph, the thinking distance is 21m and the braking distance is 75m, giving a total stopping distance of 96m (315 feet).',
  },
  {
    id: '3',
    category: 'Vulnerable Road Users',
    question: 'You are waiting to emerge from a junction. A motorcyclist is approaching with a flashing left indicator. What should you do?',
    options: [
      'Pull out before they reach you',
      'Assume they are turning left and pull out',
      'Wait until the motorcyclist has started to turn',
      'Flash your lights to tell them to proceed'
    ],
    correctAnswerIndex: 2,
    explanation: 'Indicators on a motorcycle can be easily left on by mistake. Wait to see if they actually start to turn before pulling out.',
  },
  {
    id: '4',
    category: 'Rules of the Road',
    question: 'When may you drive over a footpath?',
    options: [
      'To overtake slow-moving traffic',
      'When the road is blocked',
      'To get into a property',
      'If there are no pedestrians'
    ],
    correctAnswerIndex: 2,
    explanation: 'You must not drive on or over a pavement, footpath or bridleway except to gain lawful access to property, or in the case of an emergency.',
  },
  {
    id: '5',
    category: 'Safety and Your Vehicle',
    question: 'What should you do if your anti-lock brakes (ABS) warning light stays on while driving?',
    options: [
      'Stop and call for assistance',
      'Have the system checked as soon as possible',
      'Continue as normal, it only affects emergency braking',
      'Top up the brake fluid'
    ],
    correctAnswerIndex: 1,
    explanation: 'If the ABS light stays on, it means there is a fault in the system. Your normal brakes will still work, but you won’t have the benefit of ABS in an emergency. Get it checked immediately.',
  }
];

export const CATEGORIES = [
  'Alertness', 'Attitude', 'Safety and Your Vehicle', 'Safety Margins', 
  'Hazard Awareness', 'Vulnerable Road Users', 'Other Types of Vehicle', 
  'Vehicle Handling', 'Motorway Rules', 'Rules of the Road', 
  'Road and Traffic Signs', 'Essential Documents', 
  'Incidents, Accidents and Emergencies', 'Vehicle Loading'
];

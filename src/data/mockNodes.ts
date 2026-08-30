import { Node } from '../types';

export const initialNodes: Node[] = [
  { 
    id: 'TSK-101', 
    title: 'Season 1 Theme & Episode Pitch', 
    description: 'Brainstorm core topics, student life discussions, and faculty interview targets.', 
    department: 'Research', 
    status: 'Completed', 
    priority: 'High',
    planned_start: '2026-09-01', 
    planned_end: '2026-09-05', 
    actual_start: '2026-09-01', 
    actual_end: '2026-09-04' 
  },
  { 
    id: 'TSK-102', 
    title: 'Faculty Interview Script & Questions', 
    description: 'Draft conversation prompts for the inaugural guest segment.', 
    department: 'Research', 
    status: 'Completed', 
    priority: 'Medium',
    planned_start: '2026-09-06', 
    planned_end: '2026-09-10', 
    actual_start: '2026-09-06', 
    actual_end: '2026-09-09' 
  },
  { 
    id: 'TSK-103', 
    title: 'Studio Mic Check & Rehearsal', 
    description: 'Dry run recording with hosts to test acoustics and input gains.', 
    department: 'Hosts', 
    status: 'In Progress', 
    priority: 'High',
    planned_start: '2026-09-11', 
    planned_end: '2026-09-14', 
    actual_start: '2026-09-11', 
    actual_end: null 
  },
  { 
    id: 'TSK-104', 
    title: 'Episode 01 Main Track Recording', 
    description: 'Live studio recording session with guest panel.', 
    department: 'Hosts', 
    status: 'To Do', 
    priority: 'Critical',
    planned_start: '2026-09-15', 
    planned_end: '2026-09-17', 
    actual_start: null, 
    actual_end: null 
  },
  { 
    id: 'TSK-105', 
    title: 'Audio Cleanup & Jingle Integration', 
    description: 'Noise gating, intro/outro music mixdown, and compression.', 
    department: 'Editing', 
    status: 'To Do', 
    priority: 'High',
    planned_start: '2026-09-18', 
    planned_end: '2026-09-22', 
    actual_start: null, 
    actual_end: null 
  },
  { 
    id: 'TSK-106', 
    title: 'Faculty Final Review & Sign-Off', 
    description: 'Teacher mentor review of final audio master before public launch.', 
    department: 'Teacher', 
    status: 'To Do', 
    priority: 'High',
    planned_start: '2026-09-23', 
    planned_end: '2026-09-25', 
    actual_start: null, 
    actual_end: null 
  },
  { 
    id: 'TSK-107', 
    title: 'Publish Episode 01 & Campus Broadcast', 
    description: 'Upload to stream hosting and share via student newsletter.', 
    department: 'Admin', 
    status: 'To Do', 
    priority: 'Critical',
    planned_start: '2026-09-26', 
    planned_end: '2026-09-27', 
    actual_start: null, 
    actual_end: null 
  }
];

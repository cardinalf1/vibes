export type DepartmentType = 'Teacher' | 'Hosts' | 'Research' | 'Editing' | 'Admin' | string;

export interface Department {
  id: string;
  name: string;
  color: string; // Hex color code
  description?: string;
  lead_username?: string;
  member_count?: number;
  created_at?: string;
}

export type Status = 'To Do' | 'In Progress' | 'Completed';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Role = 'Admin' | 'Teacher' | 'Hosts' | 'Research' | 'Editing' | 'Member' | 'Guest' | string;

export interface Node {
  id: string;
  title: string;
  description: string;
  department: string; // Department name or id
  status: Status;
  priority?: Priority;
  planned_start: string; // YYYY-MM-DD
  planned_end: string;
  actual_start: string | null;
  actual_end: string | null;
  dependency?: string; // ID of the node it depends on
  assigned_to?: string | null; // username
  assigned_name?: string | null;
  created_by?: string | null;
}

export type EpisodeStatus = 'Idea' | 'Scripting' | 'Recording' | 'Editing' | 'Review' | 'Published';

export interface Episode {
  id: string; // e.g. "EP-01", "VIBE-01"
  title: string;
  target_release_date: string; // YYYY-MM-DD
  status: EpisodeStatus;
  hosts?: string;
  guest_name?: string;
  audio_url?: string;
  audio_name?: string;
  runtime_minutes?: number;
  notes?: string;
  department_notes?: string;
  tags?: string[];
  created_at?: string;
}

export type ExpenditureCategory = 
  | 'Equipment' 
  | 'Studio & Acoustic' 
  | 'Software & Subscriptions' 
  | 'Marketing & Branding' 
  | 'Hosting & Distribution' 
  | 'Events & Guests';

export type ExpenditureStatus = 'Pending' | 'Pledged' | 'Purchased';

export interface ExpenditureItem {
  id: string;
  item_name: string;
  cost: number;
  category: ExpenditureCategory;
  needed_by: string; // YYYY-MM-DD
  status: ExpenditureStatus;
  pledged_by_username?: string | null;
  pledged_by_name?: string | null;
}

export interface NewsUpdate {
  id: string;
  title: string;
  content: string;
  created_at: string; // YYYY-MM-DD or ISO
  author: string;
  category?: 'Announcement' | 'Episode Drop' | 'Studio Update' | 'Milestone';
}

export interface AuthorizedUser {
  id: string;
  username: string; // Primary login handle
  name?: string;
  role: 'Admin' | 'Teacher' | 'Member' | 'Guest' | string;
  department: string; // e.g. 'Teacher' | 'Hosts' | 'Research' | 'Editing' | 'Admin'
  password?: string;
  notes?: string;
  created_at?: string;
  is_greenlit?: boolean;
}

export interface AccountRequest {
  id: string;
  username: string;
  name?: string;
  department?: string;
  notes?: string;
  status: 'Pending' | 'Approved' | 'Declined';
  created_at?: string;
}

// Built-in initial departments for Isha Vibes
export const initialDepartments: Department[] = [
  {
    id: 'dept-teacher',
    name: 'Teacher',
    color: '#c79016', // Golden Amber
    description: 'Faculty mentors, project supervisors, and educational guides.',
  },
  {
    id: 'dept-hosts',
    name: 'Hosts',
    color: '#883e66', // Plum / Rosewood
    description: 'Voice talents, interviewers, and student presenters.',
  },
  {
    id: 'dept-research',
    name: 'Research',
    color: '#3e6688', // Steel Blue
    description: 'Topic investigation, fact-checking, and scriptwriting.',
  },
  {
    id: 'dept-editing',
    name: 'Editing',
    color: '#b45f06', // Warm Rust
    description: 'Audio mastering, music scoring, sound effects, and post-production.',
  },
  {
    id: 'dept-admin',
    name: 'Admin',
    color: '#883712', // Deep Sienna
    description: 'Executive management, publishing schedule, and portal administration.',
  }
];

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
export type ReviewStatus = 'None' | 'Pending Review' | 'Approved' | 'Reverted';
export type PacingStatus = 'Optimal Velocity' | 'On Track' | 'Pacing Lag' | 'Critical Bottleneck';

export interface Node {
  id: string;
  title: string;
  description: string;
  department: string; // Department name
  status: Status;
  priority?: Priority;
  planned_start: string; // YYYY-MM-DD
  planned_end: string;
  actual_start: string | null;
  actual_end: string | null;
  dependency?: string; // ID of prerequisite task
  assigned_to?: string | null; // username
  assigned_name?: string | null;
  created_by?: string | null;
  // Overhaul review & episode properties
  episode_id?: string | null;
  review_status?: ReviewStatus;
  review_notes?: string | null;
  submitted_by?: string | null;
  submission_notes?: string | null;
}

export type EpisodeStatus = 'Idea' | 'Scripting' | 'Recording' | 'Editing' | 'Review' | 'Published';

export interface Episode {
  id: string; // e.g. "EP-01", "EP-02"
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
  assigned_crew?: Record<string, string[]>; // { [deptName]: ['username1', 'username2'] }
  pacing_status?: PacingStatus;
}

export interface SelfAssessment {
  id: string;
  username: string;
  student_name: string;
  department: string;
  episode_id?: string | null;
  scores: Record<string, number>; // questionId -> value (-3 to +3: -3 Strongly Disagree, +3 Strongly Agree)
  reflection_notes: string;
  submitted_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  username: string;
  details: Record<string, any>;
  created_at: string;
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

// 16Personalities-style 7-Point Likert Question Set for Student Podcasters
export interface LikertQuestion {
  id: string;
  category: string;
  prompt: string;
}

export const ASSESSMENT_QUESTIONS: LikertQuestion[] = [
  {
    id: 'q1',
    category: 'Collaboration & Communication',
    prompt: 'You actively communicate milestone progress and blockers with your department peers before deadlines.'
  },
  {
    id: 'q2',
    category: 'Creative Storytelling & Ideation',
    prompt: 'You consistently contribute original interview angles, narrative hooks, or script refinements.'
  },
  {
    id: 'q3',
    category: 'Technical Craft & Post-Production',
    prompt: 'You take pride in rigorous audio cleanliness, sound balance, and high technical production quality.'
  },
  {
    id: 'q4',
    category: 'Punctuality & Reliability',
    prompt: 'You deliver your assigned production deliverables ahead of schedule without requiring reminders.'
  },
  {
    id: 'q5',
    category: 'Feedback & Receptivity',
    prompt: 'When faculty or department leads suggest revisions, you incorporate feedback calmly and constructively.'
  },
  {
    id: 'q6',
    category: 'Problem Solving & Initiative',
    prompt: 'When unexpected studio issues arise (technical glitches, guest delays), you step up with pragmatic solutions.'
  },
  {
    id: 'q7',
    category: 'Cross-Department Support',
    prompt: 'You regularly assist students outside your immediate department (e.g. hosts helping research or editing).'
  },
  {
    id: 'q8',
    category: 'Studio Leadership & Team Spirit',
    prompt: 'You foster an encouraging, high-energy, and inclusive studio atmosphere for all student creators.'
  }
];

// Initial departments
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

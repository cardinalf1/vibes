import { Episode } from '../types';

export const initialEpisodes: Episode[] = [
  {
    id: 'EP-01',
    title: 'Welcome to Isha Vibes: Voices of Our Campus',
    target_release_date: '2026-09-27',
    status: 'Recording',
    hosts: 'Aarav & Maya',
    guest_name: 'Dr. Subramanian (Dean of Student Affairs)',
    runtime_minutes: 28,
    notes: 'Inaugural pilot discussing student initiatives, campus culture, and creative passions.',
    department_notes: 'Research completed script outline. Audio levels calibrated in Studio B.',
    tags: ['Pilot', 'Campus Life', 'Faculty Spotlight'],
    assigned_crew: {
      'Hosts': ['maya', 'aarav'],
      'Research': ['agga__33'],
      'Editing': ['aarav'],
      'Teacher': ['teacher'],
      'Admin': ['raghav']
    },
    pacing_status: 'Optimal Velocity'
  },
  {
    id: 'EP-02',
    title: 'The Art of Mindful Living & Student Well-being',
    target_release_date: '2026-10-10',
    status: 'Scripting',
    hosts: 'Maya',
    guest_name: 'Ananya S. (Yoga & Meditation Club Lead)',
    runtime_minutes: 32,
    notes: 'Interactive session exploring mindfulness practices during exams and daily life.',
    department_notes: 'Survey questions sent to student council. Script draft in progress.',
    tags: ['Well-being', 'Mindfulness', 'Student Stories'],
    assigned_crew: {
      'Hosts': ['maya'],
      'Research': ['agga__33'],
      'Editing': ['aarav'],
      'Teacher': ['teacher']
    },
    pacing_status: 'On Track'
  },
  {
    id: 'EP-03',
    title: 'Behind the Scenes: Science & Creativity Festival',
    target_release_date: '2026-10-24',
    status: 'Idea',
    hosts: 'Aarav',
    guest_name: 'Festival Organizing Committee',
    runtime_minutes: 35,
    notes: 'Live coverage of student projects, musical performances, and art showcases.',
    department_notes: 'Equipment checkout scheduled for recording week.',
    tags: ['Arts', 'Science', 'Special Event'],
    assigned_crew: {
      'Hosts': ['aarav'],
      'Research': ['agga__33'],
      'Teacher': ['teacher']
    },
    pacing_status: 'On Track'
  }
];

import Papa from 'papaparse';
import { Node, Episode, Status, EpisodeStatus } from '../types';

export const exportSystemData = (nodes: Node[], episodes: Episode[]) => {
  const data: any[] = [];

  nodes.forEach(n => {
    data.push({
      Type: 'Task',
      ID: n.id,
      Title: n.title,
      Description: n.description,
      Department: n.department,
      Status: n.status,
      Priority: n.priority || 'Medium',
      PlannedStart: n.planned_start,
      PlannedEnd: n.planned_end,
      ActualStart: n.actual_start || '',
      ActualEnd: n.actual_end || '',
      Dependency: n.dependency || '',
      TargetReleaseDate: '',
      Hosts: '',
      Guest: '',
      RuntimeMinutes: '',
      Notes: ''
    });
  });

  episodes.forEach(e => {
    data.push({
      Type: 'Episode',
      ID: e.id,
      Title: e.title,
      Description: e.notes || '',
      Department: 'Podcast',
      Status: e.status,
      Priority: '',
      PlannedStart: '',
      PlannedEnd: '',
      ActualStart: '',
      ActualEnd: '',
      Dependency: '',
      TargetReleaseDate: e.target_release_date,
      Hosts: e.hosts || '',
      Guest: e.guest_name || '',
      RuntimeMinutes: e.runtime_minutes || '',
      Notes: e.notes || ''
    });
  });

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'isha-vibes-production-data.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importSystemData = (file: File): Promise<{ nodes: Node[], episodes: Episode[] }> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const nodes: Node[] = [];
        const episodes: Episode[] = [];

        try {
          results.data.forEach((row: any) => {
            if (row.Type === 'Task' || row.Type === 'Node') {
              nodes.push({
                id: row.ID,
                title: row.Title,
                description: row.Description || '',
                department: row.Department || 'Research',
                status: (row.Status as Status) || 'To Do',
                priority: row.Priority || 'Medium',
                planned_start: row.PlannedStart,
                planned_end: row.PlannedEnd,
                actual_start: row.ActualStart || null,
                actual_end: row.ActualEnd || null,
                dependency: row.Dependency || undefined,
              });
            } else if (row.Type === 'Episode') {
              episodes.push({
                id: row.ID,
                title: row.Title,
                target_release_date: row.TargetReleaseDate || new Date().toISOString().split('T')[0],
                status: (row.Status as EpisodeStatus) || 'Idea',
                hosts: row.Hosts || undefined,
                guest_name: row.Guest || undefined,
                runtime_minutes: row.RuntimeMinutes ? Number(row.RuntimeMinutes) : undefined,
                notes: row.Notes || undefined,
              });
            }
          });
          resolve({ nodes, episodes });
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

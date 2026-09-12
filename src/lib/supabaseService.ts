import { supabase, isSupabaseConfigured } from './supabase';
import { Node, Episode, AuthorizedUser, Department, SelfAssessment, AuditLog } from '../types';

export const supabaseService = {
  // --- Departments ---
  async getDepartments(): Promise<Department[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) return [];
        throw error;
      }
      return (data || []) as Department[];
    } catch (e) {
      console.error('Error fetching departments:', e);
      return [];
    }
  },

  async upsertDepartment(dept: Department): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase
        .from('departments')
        .upsert({
          id: dept.id,
          name: dept.name,
          color: dept.color,
          description: dept.description || '',
          lead_username: dept.lead_username || null,
          created_at: dept.created_at || new Date().toISOString()
        });

      if (error) throw error;
    } catch (e) {
      console.error('Error upserting department:', e);
    }
  },

  async deleteDepartment(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.error('Error deleting department:', e);
    }
  },

  // --- Episodes (Master Episode Tracker) ---
  async getEpisodes(): Promise<Episode[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .order('target_release_date', { ascending: true });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) return [];
        throw error;
      }

      return (data || []).map(ep => {
        let assignedCrew = {};
        if (ep.department_notes && ep.department_notes.startsWith('{')) {
          try {
            const parsed = JSON.parse(ep.department_notes);
            if (parsed && typeof parsed === 'object' && parsed.crew) {
              assignedCrew = parsed.crew;
            }
          } catch (e) {
            // fallback
          }
        }
        return {
          ...ep,
          assigned_crew: Object.keys(assignedCrew).length > 0 ? assignedCrew : (ep.assigned_crew || {})
        };
      }) as Episode[];
    } catch (e) {
      console.error('Error fetching episodes:', e);
      return [];
    }
  },

  async upsertEpisode(ep: Episode): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      // Package assigned_crew safely in department_notes JSON envelope for backward & cloud compatibility
      const metadataEnvelope = JSON.stringify({
        notes: ep.department_notes || '',
        crew: ep.assigned_crew || {},
        pacing: ep.pacing_status || 'On Track'
      });

      const { error } = await supabase
        .from('episodes')
        .upsert({
          id: ep.id,
          title: ep.title,
          target_release_date: ep.target_release_date || new Date().toISOString().split('T')[0],
          status: ep.status,
          hosts: ep.hosts || null,
          guest_name: ep.guest_name || null,
          runtime_minutes: ep.runtime_minutes ? Number(ep.runtime_minutes) : null,
          notes: ep.notes || null,
          department_notes: metadataEnvelope,
          audio_url: ep.audio_url || null,
          audio_name: ep.audio_name || null,
          created_at: ep.created_at || new Date().toISOString()
        });

      if (error) throw error;
    } catch (e) {
      console.error('Error upserting episode:', e);
    }
  },

  async deleteEpisode(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase
        .from('episodes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.error('Error deleting episode:', e);
    }
  },

  // --- Nodes / Tasks (Gantt & Roadmap) ---
  async getNodes(): Promise<Node[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('nodes')
        .select('*')
        .order('planned_start', { ascending: true });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) return [];
        throw error;
      }

      return (data || []).map(node => {
        let desc = node.description || '';
        let epId = node.dependency?.startsWith('EP-') ? node.dependency : (node.episode_id || 'EP-01');
        let reviewStatus = 'None';
        let reviewNotes = null;
        let submittedBy = null;
        let submissionNotes = null;

        let assignees: string[] = [];

        if (desc.startsWith('{')) {
          try {
            const parsed = JSON.parse(desc);
            desc = parsed.text || '';
            if (parsed.episode_id) epId = parsed.episode_id;
            if (parsed.review_status) reviewStatus = parsed.review_status;
            if (parsed.review_notes) reviewNotes = parsed.review_notes;
            if (parsed.submitted_by) submittedBy = parsed.submitted_by;
            if (parsed.submission_notes) submissionNotes = parsed.submission_notes;
            if (parsed.assignees && Array.isArray(parsed.assignees)) {
              assignees = parsed.assignees;
            }
          } catch (e) {
            // Keep plain string
          }
        }

        if (assignees.length === 0 && node.assigned_to) {
          assignees = node.assigned_to.split(',').map((s: string) => s.trim()).filter(Boolean);
        }

        return {
          ...node,
          description: desc,
          episode_id: epId,
          review_status: reviewStatus as any,
          review_notes: reviewNotes,
          submitted_by: submittedBy,
          submission_notes: submissionNotes,
          assignees: assignees
        };
      }) as Node[];
    } catch (e) {
      console.error('Error fetching nodes:', e);
      return [];
    }
  },

  async upsertNode(node: Node): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const assigneesList = node.assignees && node.assignees.length > 0 
        ? node.assignees 
        : (node.assigned_to ? node.assigned_to.split(',').map(s => s.trim()).filter(Boolean) : []);

      const descEnvelope = JSON.stringify({
        text: node.description || '',
        episode_id: node.episode_id || 'EP-01',
        review_status: node.review_status || 'None',
        review_notes: node.review_notes || null,
        submitted_by: node.submitted_by || null,
        submission_notes: node.submission_notes || null,
        assignees: assigneesList
      });

      const assignedToStr = assigneesList.length > 0 ? assigneesList.join(',') : (node.assigned_to || null);

      const { error } = await supabase
        .from('nodes')
        .upsert({
          id: node.id,
          title: node.title,
          description: descEnvelope,
          department: node.department,
          status: node.status || 'To Do',
          priority: node.priority || 'Medium',
          planned_start: node.planned_start || new Date().toISOString().split('T')[0],
          planned_end: node.planned_end || node.planned_start || new Date().toISOString().split('T')[0],
          actual_start: node.actual_start ? node.actual_start : null,
          actual_end: node.actual_end ? node.actual_end : null,
          dependency: node.episode_id || node.dependency || null,
          assigned_to: assignedToStr,
          assigned_name: node.assigned_name ? node.assigned_name : null
        });

      if (error) throw error;
    } catch (e) {
      console.error('Error upserting node:', e);
    }
  },

  async deleteNode(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase
        .from('nodes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.error('Error deleting node:', e);
    }
  },

  // --- Self-Assessments (16personalities Likert Scale) ---
  async getSelfAssessments(): Promise<SelfAssessment[]> {
    if (!isSupabaseConfigured || !supabase) {
      const saved = localStorage.getItem('vibes_self_assessments');
      return saved ? JSON.parse(saved) : [];
    }
    try {
      const { data, error } = await supabase
        .from('news_updates')
        .select('*')
        .eq('category', 'SelfAssessment')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => {
        let parsed = { scores: {}, reflection_notes: '', department: 'Research', student_name: row.author, episode_id: 'EP-01' };
        try {
          parsed = JSON.parse(row.content);
        } catch (e) {}
        return {
          id: row.id,
          username: row.author,
          student_name: parsed.student_name || row.title,
          department: parsed.department || 'Research',
          episode_id: parsed.episode_id || 'EP-01',
          scores: parsed.scores || {},
          reflection_notes: parsed.reflection_notes || '',
          submitted_at: row.created_at
        };
      });
    } catch (e) {
      console.error('Error fetching self assessments:', e);
      return [];
    }
  },

  async submitSelfAssessment(assessment: Omit<SelfAssessment, 'id' | 'submitted_at'>): Promise<void> {
    const id = `SA-${Date.now()}-${assessment.username}`;
    const payload = {
      id,
      title: `${assessment.student_name} (${assessment.department})`,
      content: JSON.stringify({
        student_name: assessment.student_name,
        department: assessment.department,
        episode_id: assessment.episode_id || null,
        scores: assessment.scores,
        reflection_notes: assessment.reflection_notes
      }),
      author: assessment.username,
      category: 'SelfAssessment',
      created_at: new Date().toISOString()
    };

    if (!isSupabaseConfigured || !supabase) {
      const saved = localStorage.getItem('vibes_self_assessments');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift({ id, ...assessment, submitted_at: payload.created_at });
      localStorage.setItem('vibes_self_assessments', JSON.stringify(list));
      return;
    }

    try {
      const { error } = await supabase.from('news_updates').upsert(payload);
      if (error) throw error;
    } catch (e) {
      console.error('Error submitting self assessment:', e);
      throw e;
    }
  },

  // --- Audit Logs (Activity Telemetry) ---
  async getAuditLogs(): Promise<AuditLog[]> {
    if (!isSupabaseConfigured || !supabase) {
      const saved = localStorage.getItem('vibes_audit_logs');
      return saved ? JSON.parse(saved) : [];
    }
    try {
      const { data, error } = await supabase
        .from('news_updates')
        .select('*')
        .eq('category', 'AuditLog')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      return (data || []).map(row => {
        let details = {};
        try {
          details = JSON.parse(row.content);
        } catch (e) {}
        return {
          id: row.id,
          action: row.title,
          entity_type: (details as any).entity_type || 'system',
          entity_id: (details as any).entity_id || null,
          username: row.author,
          details: details as any,
          created_at: row.created_at
        };
      });
    } catch (e) {
      console.error('Error fetching audit logs:', e);
      return [];
    }
  },

  async logAuditEvent(
    action: string,
    entity_type: string,
    entity_id: string | null,
    username: string,
    details: Record<string, any>
  ): Promise<void> {
    const id = `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullDetails = {
      action,
      entity_type,
      entity_id,
      username,
      ...details
    };

    const payload = {
      id,
      title: action,
      content: JSON.stringify(fullDetails),
      author: username,
      category: 'AuditLog',
      created_at: new Date().toISOString()
    };

    // Save locally
    const saved = localStorage.getItem('vibes_audit_logs');
    const list = saved ? JSON.parse(saved) : [];
    list.unshift({ id, action, entity_type, entity_id, username, details: fullDetails, created_at: payload.created_at });
    if (list.length > 300) list.pop();
    localStorage.setItem('vibes_audit_logs', JSON.stringify(list));

    if (!isSupabaseConfigured || !supabase) return;

    try {
      await supabase.from('news_updates').upsert(payload);
    } catch (e) {
      console.warn('Failed to commit cloud audit log:', e);
    }
  },

  // --- Authorized Users ---
  async getAuthorizedUsers(): Promise<AuthorizedUser[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('authorized_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) return [];
        throw error;
      }
      return (data || []) as AuthorizedUser[];
    } catch (e) {
      console.error('Error fetching authorized users:', e);
      return [];
    }
  },

  async upsertAuthorizedUser(user: AuthorizedUser): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const cleanUsername = user.username.toLowerCase().trim();
      const { error } = await supabase
        .from('authorized_users')
        .upsert({
          id: user.id || `AUTH-${cleanUsername}`,
          username: cleanUsername,
          name: user.name || user.username,
          role: user.role,
          department: user.department || 'Research',
          password: user.password || '',
          notes: user.notes || '',
          created_at: user.created_at || new Date().toISOString(),
          is_greenlit: user.is_greenlit ?? true
        });

      if (error) throw error;
    } catch (e) {
      console.error('Error upserting authorized user:', e);
    }
  },

  async updateUserPassword(username: string, newPassword: string): Promise<void> {
    const cleanUsername = username.toLowerCase().trim();
    if (!isSupabaseConfigured || !supabase) {
      const saved = localStorage.getItem('vibes_auth_users');
      if (saved) {
        const users: AuthorizedUser[] = JSON.parse(saved);
        const updated = users.map(u => u.username.toLowerCase() === cleanUsername ? { ...u, password: newPassword } : u);
        localStorage.setItem('vibes_auth_users', JSON.stringify(updated));
      }
      return;
    }
    try {
      const { error } = await supabase
        .from('authorized_users')
        .update({ password: newPassword })
        .eq('username', cleanUsername);

      if (error) throw error;
    } catch (e) {
      console.error('Error updating password:', e);
      throw e;
    }
  },

  async deleteAuthorizedUser(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase
        .from('authorized_users')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.error('Error deleting authorized user:', e);
    }
  },

  // --- Account Requests ---
  async getAccountRequests(): Promise<any[]> {
    if (!isSupabaseConfigured || !supabase) {
      const saved = localStorage.getItem('vibes_account_requests');
      return saved ? JSON.parse(saved) : [];
    }
    try {
      const { data, error } = await supabase
        .from('account_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching account requests:', e);
      return [];
    }
  },

  async createAccountRequest(username: string, notes: string): Promise<void> {
    const cleanUsername = username.toLowerCase().trim();
    if (!isSupabaseConfigured || !supabase) {
      const saved = localStorage.getItem('vibes_account_requests');
      const list = saved ? JSON.parse(saved) : [];
      if (!list.some((r: any) => r.username === cleanUsername)) {
        list.push({
          id: `req-${Date.now()}`,
          username: cleanUsername,
          notes: notes.trim(),
          status: 'Pending',
          created_at: new Date().toISOString()
        });
        localStorage.setItem('vibes_account_requests', JSON.stringify(list));
      }
      return;
    }
    try {
      const { error } = await supabase
        .from('account_requests')
        .upsert({
          id: `REQ-${Date.now()}`,
          username: cleanUsername,
          notes: notes.trim(),
          status: 'Pending',
          created_at: new Date().toISOString()
        });
      if (error) throw error;
    } catch (e) {
      console.error('Error creating account request:', e);
      throw e;
    }
  },

  async deleteAccountRequest(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      const saved = localStorage.getItem('vibes_account_requests');
      const list = saved ? JSON.parse(saved) : [];
      const updated = list.filter((e: any) => e.id !== id);
      localStorage.setItem('vibes_account_requests', JSON.stringify(updated));
      return;
    }
    try {
      const { error } = await supabase
        .from('account_requests')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error('Error deleting account request:', e);
    }
  },

  async clearAuditLogs(): Promise<void> {
    localStorage.removeItem('vibes_audit_logs');
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase
        .from('news_updates')
        .delete()
        .eq('category', 'AuditLog');
      if (error) throw error;
    } catch (e) {
      console.error('Error clearing audit logs:', e);
    }
  },

  // --- UNIVERSAL CSV EXPORTERS (AI INGESTION READY WITH DATE FILTERING) ---
  downloadCSV(filename: string, csvContent: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  exportEpisodesAndTasksCSV(episodes: Episode[], nodes: Node[], sinceDate?: string) {
    const headers = [
      'Episode ID', 'Episode Title', 'Episode Status', 'Target Release', 'Cast & Crew',
      'Task ID', 'Task Title', 'Department', 'Task Status', 'Review Status', 'Assignee',
      'Planned Start', 'Planned End', 'Actual Start', 'Actual End', 'Teacher Notes'
    ];

    const cutoff = sinceDate ? new Date(sinceDate).getTime() : 0;
    const rows: string[][] = [];

    episodes.forEach(ep => {
      const epNodes = nodes.filter(n => {
        const matchesEp = (n.episode_id || 'EP-01') === ep.id;
        if (!matchesEp) return false;
        if (!cutoff) return true;
        const taskTime = new Date(n.planned_start || ep.created_at || '').getTime();
        return taskTime >= cutoff;
      });

      const crewStr = ep.assigned_crew 
        ? Object.entries(ep.assigned_crew).map(([dept, members]) => `${dept}: ${members.join(';')}`).join(' | ')
        : (ep.hosts || '');

      if (epNodes.length === 0 && (!cutoff || new Date(ep.created_at || ep.target_release_date).getTime() >= cutoff)) {
        rows.push([
          `"${ep.id}"`, `"${ep.title.replace(/"/g, '""')}"`, `"${ep.status}"`, `"${ep.target_release_date}"`, `"${crewStr}"`,
          '""', '""', '""', '""', '""', '""', '""', '""', '""', '""', '""'
        ]);
      } else {
        epNodes.forEach(n => {
          rows.push([
            `"${ep.id}"`, `"${ep.title.replace(/"/g, '""')}"`, `"${ep.status}"`, `"${ep.target_release_date}"`, `"${crewStr}"`,
            `"${n.id}"`, `"${n.title.replace(/"/g, '""')}"`, `"${n.department}"`, `"${n.status}"`, `"${n.review_status || 'None'}"`,
            `"${n.assigned_name || n.assigned_to || 'Unassigned'}"`, `"${n.planned_start}"`, `"${n.planned_end}"`,
            `"${n.actual_start || ''}"`, `"${n.actual_end || ''}"`, `"${(n.review_notes || '').replace(/"/g, '""')}"`
          ]);
        });
      }
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const suffix = sinceDate ? `_since_${sinceDate.slice(0, 10)}` : '';
    this.downloadCSV(`isha_vibes_episodes_and_tasks${suffix}_${Date.now()}.csv`, csvContent);
  },

  exportStudentAssessmentsCSV(assessments: SelfAssessment[], sinceDate?: string) {
    const cutoff = sinceDate ? new Date(sinceDate).getTime() : 0;
    const filtered = cutoff 
      ? assessments.filter(a => new Date(a.submitted_at).getTime() >= cutoff)
      : assessments;

    const headers = [
      'Submission ID', 'Timestamp', 'Username', 'Student Name', 'Department', 'Episode Target',
      'Q1_Collaboration', 'Q2_Storytelling', 'Q3_Technical_Craft', 'Q4_Punctuality',
      'Q5_Feedback_Receptivity', 'Q6_Problem_Solving', 'Q7_Cross_Dept_Support', 'Q8_Leadership',
      'Average_Score', 'Open_Reflection_Text'
    ];

    const rows = filtered.map(a => {
      const qScores = [
        a.scores?.q1 ?? 0,
        a.scores?.q2 ?? 0,
        a.scores?.q3 ?? 0,
        a.scores?.q4 ?? 0,
        a.scores?.q5 ?? 0,
        a.scores?.q6 ?? 0,
        a.scores?.q7 ?? 0,
        a.scores?.q8 ?? 0
      ];
      const avg = (qScores.reduce((sum, val) => sum + val, 0) / qScores.length).toFixed(2);

      return [
        `"${a.id}"`, `"${a.submitted_at}"`, `"${a.username}"`, `"${a.student_name.replace(/"/g, '""')}"`,
        `"${a.department}"`, `"${a.episode_id || 'General'}"`,
        ...qScores.map(s => String(s)),
        `"${avg}"`,
        `"${(a.reflection_notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const suffix = sinceDate ? `_since_${sinceDate.slice(0, 10)}` : '';
    this.downloadCSV(`isha_vibes_student_assessments${suffix}_${Date.now()}.csv`, csvContent);
  },

  exportAuditLogsCSV(logs: AuditLog[], sinceDate?: string) {
    const cutoff = sinceDate ? new Date(sinceDate).getTime() : 0;
    const filtered = cutoff 
      ? logs.filter(l => new Date(l.created_at).getTime() >= cutoff)
      : logs;

    const headers = ['Log ID', 'Timestamp', 'Actor Username', 'Action / Event', 'Entity Type', 'Entity ID', 'Full Event Details'];
    const rows = filtered.map(l => [
      `"${l.id}"`,
      `"${l.created_at}"`,
      `"${l.username}"`,
      `"${l.action}"`,
      `"${l.entity_type}"`,
      `"${l.entity_id || ''}"`,
      `"${JSON.stringify(l.details).replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const suffix = sinceDate ? `_since_${sinceDate.slice(0, 10)}` : '';
    this.downloadCSV(`isha_vibes_audit_telemetry${suffix}_${Date.now()}.csv`, csvContent);
  },

  exportTeamRosterCSV(users: AuthorizedUser[]) {
    const headers = ['User ID', 'Username', 'Display Name', 'System Role', 'Department', 'Notes', 'Created At', 'Active Status'];
    const rows = users.map(u => [
      `"${u.id}"`,
      `"${u.username}"`,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${u.role}"`,
      `"${u.department}"`,
      `"${(u.notes || '').replace(/"/g, '""')}"`,
      `"${u.created_at || ''}"`,
      `"${u.is_greenlit ? 'Greenlit' : 'Dormant'}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    this.downloadCSV(`isha_vibes_roster_${Date.now()}.csv`, csvContent);
  }
};

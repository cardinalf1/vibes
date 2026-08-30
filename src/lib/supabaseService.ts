import { supabase, isSupabaseConfigured } from './supabase';
import { Node, Episode, ExpenditureItem, NewsUpdate, AuthorizedUser, Department } from '../types';

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
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.warn('Table "departments" does not exist yet.');
          return [];
        }
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

  // --- Episodes (Podcast Audio Tracker) ---
  async getEpisodes(): Promise<Episode[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .order('target_release_date', { ascending: true });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.warn('Table "episodes" does not exist yet.');
          return [];
        }
        throw error;
      }
      return (data || []) as Episode[];
    } catch (e) {
      console.error('Error fetching episodes:', e);
      return [];
    }
  },

  async upsertEpisode(ep: Episode): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase
        .from('episodes')
        .upsert({
          id: ep.id,
          title: ep.title,
          target_release_date: ep.target_release_date,
          status: ep.status,
          hosts: ep.hosts || null,
          guest_name: ep.guest_name || null,
          runtime_minutes: ep.runtime_minutes || null,
          notes: ep.notes || null,
          department_notes: ep.department_notes || null,
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

  // --- Nodes (Podcast Roadmap Tasks) ---
  async getNodes(): Promise<Node[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('nodes')
        .select('*')
        .order('planned_start', { ascending: true });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.warn('Table "nodes" does not exist yet.');
          return [];
        }
        throw error;
      }
      return (data || []) as Node[];
    } catch (e) {
      console.error('Error fetching nodes:', e);
      return [];
    }
  },

  async upsertNode(node: Node): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase
        .from('nodes')
        .upsert({
          id: node.id,
          title: node.title,
          description: node.description,
          department: node.department,
          status: node.status,
          priority: node.priority || 'Medium',
          planned_start: node.planned_start,
          planned_end: node.planned_end,
          actual_start: node.actual_start,
          actual_end: node.actual_end,
          dependency: node.dependency || null,
          assigned_to: node.assigned_to || null,
          assigned_name: node.assigned_name || null
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

  // --- Expenditures (Budget & Studio Costs) ---
  async getExpenditures(): Promise<ExpenditureItem[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('expenditures')
        .select('*')
        .order('needed_by', { ascending: true });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.warn('Table "expenditures" does not exist yet.');
          return [];
        }
        throw error;
      }
      return (data || []) as ExpenditureItem[];
    } catch (e) {
      console.error('Error fetching expenditures:', e);
      return [];
    }
  },

  async upsertExpenditure(item: ExpenditureItem): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase
        .from('expenditures')
        .upsert({
          id: item.id,
          item_name: item.item_name,
          cost: item.cost,
          category: item.category,
          needed_by: item.needed_by,
          status: item.status,
          pledged_by_username: item.pledged_by_username || null,
          pledged_by_name: item.pledged_by_name || null
        });

      if (error) throw error;
    } catch (e) {
      console.error('Error upserting expenditure:', e);
    }
  },

  async deleteExpenditure(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase
        .from('expenditures')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.error('Error deleting expenditure:', e);
    }
  },

  // --- News & Announcements ---
  async getNewsUpdates(): Promise<NewsUpdate[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('news_updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as NewsUpdate[];
    } catch (e) {
      console.error('Error fetching news updates:', e);
      return [];
    }
  },

  async upsertNewsUpdate(news: NewsUpdate): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase
        .from('news_updates')
        .upsert({
          id: news.id,
          title: news.title,
          content: news.content,
          created_at: news.created_at,
          author: news.author,
          category: news.category || 'Announcement'
        });

      if (error) throw error;
    } catch (e) {
      console.error('Error upserting news update:', e);
    }
  },

  async deleteNewsUpdate(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase
        .from('news_updates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.error('Error deleting news update:', e);
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
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.warn('Table "authorized_users" does not exist yet.');
          return [];
        }
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
          id: user.id,
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
      // Local storage fallback
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
          created_at: new Date().toISOString().split('T')[0]
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
  }
};

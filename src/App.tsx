import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { EpisodeHub } from './components/EpisodeHub';
import { EpisodeDetailView } from './components/EpisodeDetailView';
import { SelfAssessment } from './components/SelfAssessment';
import { TeacherReviewPanel } from './components/TeacherReviewPanel';
import { AssessmentReports } from './components/AssessmentReports';
import { ActivityLogsPanel } from './components/ActivityLogsPanel';
import { DepartmentManager } from './components/DepartmentManager';
import { AccessControlPanel } from './components/AccessControlPanel';
import { SettingsModal } from './components/SettingsModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { initialNodes } from './data/mockNodes';
import { initialEpisodes } from './data/mockEpisodes';
import { 
  Role, Status, Node, Department, Episode, 
  AuthorizedUser, initialDepartments, Priority, 
  SelfAssessment as SelfAssessmentType, AuditLog, EpisodeStatus 
} from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { supabaseService } from './lib/supabaseService';
import { useAuth } from './components/AuthGate';

const defaultAuthorizedUsers: AuthorizedUser[] = [
  {
    id: "AUTH-admin",
    username: "admin",
    name: "Lead Admin",
    role: "Admin",
    department: "Admin",
    password: "Cardinal@2026",
    notes: "Master Studio Administrator",
    is_greenlit: true
  },
  {
    id: "AUTH-raghav",
    username: "raghav",
    name: "Raghav",
    role: "Admin",
    department: "Admin",
    password: "raghav",
    notes: "Lead Admin - Raghav",
    is_greenlit: true
  },
  {
    id: "AUTH-teacher",
    username: "teacher",
    name: "Faculty Mentor",
    role: "Teacher",
    department: "Teacher",
    password: "teacher2026",
    notes: "Faculty Supervisor & Reviewer",
    is_greenlit: true
  },
  {
    id: "AUTH-maya",
    username: "maya",
    name: "Maya Patel",
    role: "Member",
    department: "Hosts",
    password: "vibes2026",
    notes: "Season 1 Co-Host",
    is_greenlit: true
  },
  {
    id: "AUTH-aarav",
    username: "aarav",
    name: "Aarav Sharma",
    role: "Member",
    department: "Editing",
    password: "vibes2026",
    notes: "Sound Design & Post-Production Lead",
    is_greenlit: true
  },
  {
    id: "AUTH-agga__33",
    username: "agga__33",
    name: "Agastya Bansal",
    role: "Member",
    department: "Research",
    password: "vibes2026",
    notes: "Lead Scripting & Topic Researcher",
    is_greenlit: true
  }
];

export default function App() {
  const { isSupabaseActive, role: authRole, user, name: authName, username: authUsername, signOut } = useAuth();
  const isTeacherOrAdmin = authRole === 'Admin' || authRole === 'Teacher';
  const [currentRole, setCurrentRole] = useState<string>(authRole || 'Member');

  useEffect(() => {
    if (authRole) setCurrentRole(authRole);
  }, [authRole]);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Main Persistent States
  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('vibes_departments');
    return saved ? JSON.parse(saved) : initialDepartments;
  });

  const [nodes, setNodes] = useState<Node[]>(() => {
    const saved = localStorage.getItem('vibes_nodes');
    return saved ? JSON.parse(saved) : initialNodes;
  });

  const [episodes, setEpisodes] = useState<Episode[]>(() => {
    const saved = localStorage.getItem('vibes_episodes');
    return saved ? JSON.parse(saved) : initialEpisodes;
  });

  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>(() => {
    const saved = localStorage.getItem('vibes_auth_users');
    return saved ? JSON.parse(saved) : defaultAuthorizedUsers;
  });

  const [accountRequests, setAccountRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('vibes_account_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [selfAssessments, setSelfAssessments] = useState<SelfAssessmentType[]>(() => {
    const saved = localStorage.getItem('vibes_self_assessments');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('vibes_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Navigation & View States
  const [activeModule, setActiveModule] = useState<string>('Episodes');
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [simulatedDate, setSimulatedDate] = useState<string>('2026-09-12');

  // Sync to local storage
  useEffect(() => { localStorage.setItem('vibes_departments', JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem('vibes_nodes', JSON.stringify(nodes)); }, [nodes]);
  useEffect(() => { localStorage.setItem('vibes_episodes', JSON.stringify(episodes)); }, [episodes]);
  useEffect(() => { localStorage.setItem('vibes_auth_users', JSON.stringify(authorizedUsers)); }, [authorizedUsers]);
  useEffect(() => { localStorage.setItem('vibes_self_assessments', JSON.stringify(selfAssessments)); }, [selfAssessments]);
  useEffect(() => { localStorage.setItem('vibes_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);

  // Initial Fetch & Seed from Supabase
  useEffect(() => {
    async function initSupabase() {
      if (!isSupabaseActive) return;
      try {
        let remoteDepts = await supabaseService.getDepartments();
        let remoteNodes = await supabaseService.getNodes();
        let remoteEpisodes = await supabaseService.getEpisodes();
        let remoteAuthUsers = await supabaseService.getAuthorizedUsers();
        let remoteAccountRequests = await supabaseService.getAccountRequests();
        let remoteAssessments = await supabaseService.getSelfAssessments();
        let remoteLogs = await supabaseService.getAuditLogs();

        // Seed individual tables if empty on remote
        if (remoteDepts.length === 0) {
          for (const dept of initialDepartments) await supabaseService.upsertDepartment(dept);
          remoteDepts = await supabaseService.getDepartments();
        }
        if (remoteNodes.length === 0) {
          for (const node of initialNodes) await supabaseService.upsertNode(node);
          remoteNodes = await supabaseService.getNodes();
        }
        if (remoteEpisodes.length === 0) {
          for (const ep of initialEpisodes) await supabaseService.upsertEpisode(ep);
          remoteEpisodes = await supabaseService.getEpisodes();
        }
        if (remoteAuthUsers.length === 0) {
          for (const usr of defaultAuthorizedUsers) await supabaseService.upsertAuthorizedUser(usr);
          remoteAuthUsers = await supabaseService.getAuthorizedUsers();
        }

        setDepartments(remoteDepts);
        setNodes(remoteNodes);
        setEpisodes(remoteEpisodes);
        setAuthorizedUsers(remoteAuthUsers);
        setAccountRequests(remoteAccountRequests);
        if (remoteAssessments.length > 0) setSelfAssessments(remoteAssessments);
        if (remoteLogs.length > 0) setAuditLogs(remoteLogs);
      } catch (err) {
        console.error('Failed to sync on mount:', err);
      }
    }
    initSupabase();
  }, [isSupabaseActive]);

  // Real-Time Subscriptions
  useEffect(() => {
    if (!isSupabaseActive || !supabase) return;

    const channel = supabase
      .channel('vibes-realtime-overhaul-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newDept = payload.new as Department;
          setDepartments(prev => {
            const exists = prev.some(d => d.id === newDept.id);
            if (exists) return prev.map(d => d.id === newDept.id ? newDept : d);
            return [...prev, newDept];
          });
        } else if (payload.eventType === 'DELETE') {
          const delId = (payload.old as any)?.id;
          if (delId) setDepartments(prev => prev.filter(d => d.id !== delId));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'episodes' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const rawEp = payload.new as any;
          // Unpack assigned_crew and pacing_status from department_notes envelope
          let assignedCrew: Record<string, string[]> = {};
          let pacing = 'On Track';
          let deptNotes = rawEp.department_notes || '';

          if (rawEp.department_notes && typeof rawEp.department_notes === 'string') {
            try {
              const parsed = JSON.parse(rawEp.department_notes);
              if (parsed.crew && typeof parsed.crew === 'object') {
                assignedCrew = parsed.crew;
              }
              if (parsed.pacing) {
                pacing = parsed.pacing;
              }
              if (parsed.notes) {
                deptNotes = parsed.notes;
              }
            } catch (e) {}
          }

          const newEp: Episode = {
            ...rawEp,
            department_notes: deptNotes,
            assigned_crew: Object.keys(assignedCrew).length > 0 ? assignedCrew : (rawEp.assigned_crew || {}),
            pacing_status: (pacing as any) || 'On Track'
          };

          setEpisodes(prev => {
            const exists = prev.some(e => e.id === newEp.id);
            if (exists) return prev.map(e => e.id === newEp.id ? newEp : e);
            return [newEp, ...prev];
          });
          // Update selectedEpisode if currently viewing
          setSelectedEpisode(curr => curr && curr.id === newEp.id ? newEp : curr);
        } else if (payload.eventType === 'DELETE') {
          const delId = (payload.old as any)?.id;
          if (delId) {
            setEpisodes(prev => prev.filter(e => e.id !== delId));
            setSelectedEpisode(curr => curr && curr.id === delId ? null : curr);
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nodes' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newNode = payload.new as Node;
          // Unpack description envelope if needed
          let desc = newNode.description || '';
          let epId = newNode.dependency?.startsWith('EP-') ? newNode.dependency : (newNode.episode_id || 'EP-01');
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
            } catch (e) {}
          }

          if (assignees.length === 0 && newNode.assigned_to) {
            assignees = newNode.assigned_to.split(',').map((s: string) => s.trim()).filter(Boolean);
          }

          const processedNode: Node = {
            ...newNode,
            description: desc,
            episode_id: epId,
            review_status: reviewStatus as any,
            review_notes: reviewNotes,
            submitted_by: submittedBy,
            submission_notes: submissionNotes,
            assignees: assignees
          };

          setNodes(prev => {
            const exists = prev.some(n => n.id === processedNode.id);
            if (exists) return prev.map(n => n.id === processedNode.id ? processedNode : n);
            return [...prev, processedNode];
          });
        } else if (payload.eventType === 'DELETE') {
          const delId = (payload.old as any)?.id;
          if (delId) setNodes(prev => prev.filter(n => n.id !== delId));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'authorized_users' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newUser = payload.new as AuthorizedUser;
          setAuthorizedUsers(prev => {
            const exists = prev.some(u => u.id === newUser.id);
            if (exists) return prev.map(u => u.id === newUser.id ? newUser : u);
            return [newUser, ...prev];
          });

          if (userRef.current?.username && newUser.username?.toLowerCase() === userRef.current.username.toLowerCase()) {
            if (newUser.is_greenlit === false) {
              alert('Your account authorization has been set to dormant. Logging out.');
              signOut();
            }
          }
        } else if (payload.eventType === 'DELETE') {
          const delId = (payload.old as any)?.id;
          if (delId) setAuthorizedUsers(prev => prev.filter(u => u.id !== delId));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'account_requests' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newReq = payload.new;
          setAccountRequests(prev => {
            const exists = prev.some(r => r.id === newReq.id);
            if (exists) return prev.map(r => r.id === newReq.id ? newReq : r);
            return [newReq, ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          const delId = (payload.old as any)?.id;
          if (delId) setAccountRequests(prev => prev.filter(r => r.id !== delId));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news_updates' }, payload => {
        // News updates handles self-assessments and audit logs
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const row = payload.new as any;
          if (row.category === 'SelfAssessment') {
            let parsed = { scores: {}, reflection_notes: '', department: 'Research', student_name: row.author, episode_id: 'EP-01' };
            try { parsed = JSON.parse(row.content); } catch (e) {}
            const item: SelfAssessmentType = {
              id: row.id,
              username: row.author,
              student_name: parsed.student_name || row.title,
              department: parsed.department || 'Research',
              episode_id: parsed.episode_id || 'EP-01',
              scores: parsed.scores || {},
              reflection_notes: parsed.reflection_notes || '',
              submitted_at: row.created_at
            };
            setSelfAssessments(prev => {
              const exists = prev.some(a => a.id === item.id);
              if (exists) return prev.map(a => a.id === item.id ? item : a);
              return [item, ...prev];
            });
          } else if (row.category === 'AuditLog') {
            let details = {};
            try { details = JSON.parse(row.content); } catch (e) {}
            const logItem: AuditLog = {
              id: row.id,
              action: row.title,
              entity_type: (details as any).entity_type || 'system',
              entity_id: (details as any).entity_id || null,
              username: row.author,
              details: details as any,
              created_at: row.created_at
            };
            setAuditLogs(prev => {
              const exists = prev.some(l => l.id === logItem.id);
              if (exists) return prev.map(l => l.id === logItem.id ? logItem : l);
              return [logItem, ...prev];
            });
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isSupabaseActive, signOut]);

  // --- Handlers & Micro-Event Telemetry Logging ---

  const logEvent = (action: string, entityType: string, entityId: string | null, details: Record<string, any>) => {
    supabaseService.logAuditEvent(action, entityType, entityId, authUsername || 'system', details).catch(console.warn);
  };

  // Episode Handlers
  const handleCreateEpisode = (epData: Omit<Episode, 'id' | 'created_at'>) => {
    const maxEpNum = episodes.reduce((max, ep) => {
      const match = ep.id.match(/^EP-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const newId = `EP-${String(maxEpNum + 1).padStart(2, '0')}`;
    const newEp: Episode = {
      id: newId,
      ...epData,
      created_at: new Date().toISOString()
    };
    setEpisodes(prev => [newEp, ...prev]);
    supabaseService.upsertEpisode(newEp).catch(console.error);
    logEvent('EPISODE_CREATED', 'episode', newId, { title: newEp.title, target_date: newEp.target_release_date });
  };

  const handleEditEpisode = (id: string, updatedEp: Episode) => {
    setEpisodes(prev => prev.map(e => e.id === id ? updatedEp : e));
    if (selectedEpisode && selectedEpisode.id === id) setSelectedEpisode(updatedEp);
    supabaseService.upsertEpisode(updatedEp).catch(console.error);
    logEvent('EPISODE_UPDATED', 'episode', id, { title: updatedEp.title, status: updatedEp.status });
  };

  const handleUpdateEpisodeStatus = (id: string, status: EpisodeStatus) => {
    const updated = episodes.map(e => e.id === id ? { ...e, status } : e);
    setEpisodes(updated);
    const found = updated.find(e => e.id === id);
    if (found) {
      if (selectedEpisode && selectedEpisode.id === id) setSelectedEpisode(found);
      supabaseService.upsertEpisode(found).catch(console.error);
      logEvent('EPISODE_STATUS_CHANGED', 'episode', id, { new_status: status });
    }
  };

  const handleDeleteEpisode = (id: string) => {
    setEpisodes(prev => prev.filter(e => e.id !== id));
    if (selectedEpisode && selectedEpisode.id === id) setSelectedEpisode(null);
    supabaseService.deleteEpisode(id).catch(console.error);
    logEvent('EPISODE_DELETED', 'episode', id, {});
  };

  // Node & Review Handlers
  const handleCreateNode = (taskData: {
    title: string;
    description: string;
    department: string;
    priority: Priority;
    planned_start: string;
    planned_end: string;
    dependency?: string;
    assigned_to?: string | null;
    assignees?: string[];
    episode_id?: string;
  }) => {
    const newId = `TSK-${Date.now().toString().slice(-4)}`;
    const assigneesList = taskData.assignees && taskData.assignees.length > 0
      ? taskData.assignees
      : (taskData.assigned_to ? taskData.assigned_to.split(',').map(s => s.trim()).filter(Boolean) : []);

    const assignedNames = assigneesList.map(u => {
      const found = authorizedUsers.find(au => au.username === u);
      return found ? (found.name || u) : u;
    });

    const newNode: Node = {
      id: newId,
      title: taskData.title,
      description: taskData.description,
      department: taskData.department,
      status: 'To Do',
      priority: taskData.priority,
      planned_start: taskData.planned_start,
      planned_end: taskData.planned_end,
      actual_start: null,
      actual_end: null,
      dependency: taskData.dependency,
      assigned_to: assigneesList.length > 0 ? assigneesList.join(',') : null,
      assigned_name: assignedNames.length > 0 ? assignedNames.join(', ') : null,
      assignees: assigneesList,
      episode_id: taskData.episode_id || selectedEpisode?.id || 'EP-01',
      review_status: 'None'
    };

    setNodes(prev => [...prev, newNode]);
    supabaseService.upsertNode(newNode).catch(console.error);
    logEvent('TASK_CREATED', 'task', newId, {
      title: newNode.title,
      department: newNode.department,
      episode_id: newNode.episode_id,
      assignees: assigneesList
    });
  };

  const handleUpdateTaskStatus = (id: string, newStatus: Status) => {
    const updated = nodes.map(n => {
      if (n.id !== id) return n;
      const copy = { ...n, status: newStatus };
      if (newStatus === 'In Progress' && !copy.actual_start) copy.actual_start = simulatedDate;
      if (newStatus === 'Completed' && !copy.actual_end) {
        if (!copy.actual_start) copy.actual_start = simulatedDate;
        copy.actual_end = simulatedDate;
      }
      return copy;
    });
    setNodes(updated);
    const item = updated.find(n => n.id === id);
    if (item) {
      supabaseService.upsertNode(item).catch(console.error);
      logEvent('TASK_STATUS_CHANGED', 'task', id, { new_status: newStatus, department: item.department });
    }
  };

  const handleSubmitTaskForReview = async (id: string, proofNotes: string) => {
    const updated = nodes.map(n => {
      if (n.id !== id) return n;
      return {
        ...n,
        review_status: 'Pending Review' as const,
        submitted_by: authUsername || 'student',
        submission_notes: proofNotes
      };
    });
    setNodes(updated);
    const item = updated.find(n => n.id === id);
    if (item) {
      await supabaseService.upsertNode(item);
      logEvent('TASK_SUBMITTED_FOR_REVIEW', 'task', id, {
        task_title: item.title,
        department: item.department,
        episode_id: item.episode_id,
        notes: proofNotes
      });
    }
  };

  const handleApproveTask = async (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = nodes.map(n => {
      if (n.id !== id) return n;
      return {
        ...n,
        status: 'Completed' as const,
        review_status: 'Approved' as const,
        actual_end: todayStr
      };
    });
    setNodes(updated);
    const item = updated.find(n => n.id === id);
    if (item) {
      await supabaseService.upsertNode(item);
      logEvent('TASK_APPROVED', 'task', id, {
        task_title: item.title,
        department: item.department,
        episode_id: item.episode_id
      });
    }
  };

  const handleRevertTask = async (id: string, feedbackNotes: string) => {
    const updated = nodes.map(n => {
      if (n.id !== id) return n;
      return {
        ...n,
        status: 'In Progress' as const,
        review_status: 'Reverted' as const,
        review_notes: feedbackNotes
      };
    });
    setNodes(updated);
    const item = updated.find(n => n.id === id);
    if (item) {
      await supabaseService.upsertNode(item);
      logEvent('TASK_REVERTED', 'task', id, {
        task_title: item.title,
        target_department: item.department,
        episode_id: item.episode_id,
        notes: feedbackNotes
      });
    }
  };

  const handleAssignStudentToTask = (id: string, username: string | null, mode: 'set' | 'add' | 'remove' = 'add') => {
    let modifiedNode: Node | null = null;
    setNodes(prev => {
      return prev.map(n => {
        if (n.id !== id) return n;
        let currentAssignees = n.assignees && n.assignees.length > 0
          ? [...n.assignees]
          : (n.assigned_to ? n.assigned_to.split(',').map(s => s.trim()).filter(Boolean) : []);

        if (mode === 'add' && username) {
          if (!currentAssignees.includes(username)) currentAssignees.push(username);
        } else if (mode === 'remove' && username) {
          currentAssignees = currentAssignees.filter(u => u !== username);
        } else if (mode === 'set') {
          currentAssignees = username ? [username] : [];
        }

        const assignedNames = currentAssignees.map(u => {
          const found = authorizedUsers.find(au => au.username === u);
          return found ? (found.name || u) : u;
        });

        const updated: Node = {
          ...n,
          assignees: currentAssignees,
          assigned_to: currentAssignees.length > 0 ? currentAssignees.join(',') : null,
          assigned_name: assignedNames.length > 0 ? assignedNames.join(', ') : null
        };
        modifiedNode = updated;
        return updated;
      });
    });

    if (modifiedNode) {
      supabaseService.upsertNode(modifiedNode).catch(console.error);
      logEvent(username ? (mode === 'remove' ? 'STUDENT_UNASSIGNED_FROM_TASK' : 'STUDENT_ASSIGNED_TO_TASK') : 'STUDENT_UNASSIGNED_FROM_TASK', 'task', id, {
        assigned_student: username,
        assignees: (modifiedNode as Node).assignees,
        task_title: (modifiedNode as Node).title,
        department: (modifiedNode as Node).department
      });
    }
  };

  const handleMoveStudentBetweenTasks = (fromTaskId: string, toTaskId: string, username: string) => {
    let fromNode: Node | null = null;
    let toNode: Node | null = null;

    setNodes(prev => {
      return prev.map(n => {
        if (n.id === fromTaskId) {
          const currentAssignees = (n.assignees && n.assignees.length > 0
            ? n.assignees
            : (n.assigned_to ? n.assigned_to.split(',').map(s => s.trim()).filter(Boolean) : [])
          ).filter(u => u !== username);

          const assignedNames = currentAssignees.map(u => {
            const found = authorizedUsers.find(au => au.username === u);
            return found ? (found.name || u) : u;
          });

          const updated: Node = {
            ...n,
            assignees: currentAssignees,
            assigned_to: currentAssignees.length > 0 ? currentAssignees.join(',') : null,
            assigned_name: assignedNames.length > 0 ? assignedNames.join(', ') : null
          };
          fromNode = updated;
          return updated;
        }

        if (n.id === toTaskId) {
          const currentAssignees = [...(n.assignees && n.assignees.length > 0
            ? n.assignees
            : (n.assigned_to ? n.assigned_to.split(',').map(s => s.trim()).filter(Boolean) : [])
          )];
          if (!currentAssignees.includes(username)) currentAssignees.push(username);

          const assignedNames = currentAssignees.map(u => {
            const found = authorizedUsers.find(au => au.username === u);
            return found ? (found.name || u) : u;
          });

          const updated: Node = {
            ...n,
            assignees: currentAssignees,
            assigned_to: currentAssignees.length > 0 ? currentAssignees.join(',') : null,
            assigned_name: assignedNames.length > 0 ? assignedNames.join(', ') : null
          };
          toNode = updated;
          return updated;
        }

        return n;
      });
    });

    if (fromNode) supabaseService.upsertNode(fromNode).catch(console.error);
    if (toNode) supabaseService.upsertNode(toNode).catch(console.error);

    logEvent('STUDENT_MOVED_BETWEEN_TASKS', 'task', toTaskId, {
      student: username,
      from_task: fromTaskId,
      to_task: toTaskId
    });
  };

  const handleDeleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    supabaseService.deleteNode(id).catch(console.error);
    logEvent('TASK_DELETED', 'task', id, {});
  };

  // Self-Assessment Submission Handler
  const handleSubmitAssessment = async (assessment: Omit<SelfAssessmentType, 'id' | 'submitted_at'>) => {
    await supabaseService.submitSelfAssessment(assessment);
    const updatedList = await supabaseService.getSelfAssessments();
    setSelfAssessments(updatedList);
    logEvent('ASSESSMENT_SUBMITTED', 'self_assessment', assessment.username, {
      student_name: assessment.student_name,
      department: assessment.department,
      episode_id: assessment.episode_id
    });
  };

  // User & Roster Handlers
  const handleAddAuthorizedUser = async (userData: Omit<AuthorizedUser, 'id'>) => {
    const cleanUsername = userData.username.toLowerCase().trim();
    const newUser: AuthorizedUser = {
      id: `AUTH-${Date.now()}`,
      ...userData,
      username: cleanUsername
    };
    setAuthorizedUsers(prev => [newUser, ...prev]);
    await supabaseService.upsertAuthorizedUser(newUser);
    logEvent('USER_PROVISIONED', 'user', cleanUsername, { role: newUser.role, department: newUser.department });
  };

  const handleUpdateAuthorizedUser = (user: AuthorizedUser) => {
    const prevUser = authorizedUsers.find(u => u.id === user.id);
    const deptChanged = prevUser && prevUser.department !== user.department;
    setAuthorizedUsers(prev => prev.map(u => u.id === user.id ? user : u));
    supabaseService.upsertAuthorizedUser(user).catch(console.error);
    if (deptChanged) {
      logEvent('MEMBER_DEPARTMENT_CHANGED', 'user', user.username, {
        previous_department: prevUser.department,
        new_department: user.department
      });
    } else {
      logEvent('USER_UPDATED', 'user', user.username, { role: user.role, department: user.department });
    }
  };

  const handleDeleteAuthorizedUser = (id: string) => {
    const user = authorizedUsers.find(u => u.id === id);
    setAuthorizedUsers(prev => prev.filter(u => u.id !== id));
    supabaseService.deleteAuthorizedUser(id).catch(console.error);
    logEvent('USER_DELETED', 'user', user?.username || id, {});
  };

  const handleUpdateMyPassword = async (newPassword: string) => {
    const targetUsername = authUsername || user?.username;
    if (!targetUsername) throw new Error('No active user session detected.');
    await supabaseService.updateUserPassword(targetUsername, newPassword);
    setAuthorizedUsers(prev => prev.map(u => 
      u.username.toLowerCase() === targetUsername.toLowerCase() ? { ...u, password: newPassword } : u
    ));
    logEvent('USER_PASSWORD_CHANGED', 'user', targetUsername, {});
  };

  const handleDeleteAccountRequest = (id: string) => {
    setAccountRequests(prev => prev.filter(r => r.id !== id));
    supabaseService.deleteAccountRequest(id).catch(console.error);
  };

  // Department Handlers
  const handleAddDepartment = (deptData: Omit<Department, 'id'>) => {
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      ...deptData,
      created_at: new Date().toISOString()
    };
    setDepartments(prev => [...prev, newDept]);
    supabaseService.upsertDepartment(newDept).catch(console.error);
    logEvent('DEPARTMENT_CREATED', 'department', newDept.name, {});
  };

  const handleUpdateDepartment = (dept: Department) => {
    setDepartments(prev => prev.map(d => d.id === dept.id ? dept : d));
    supabaseService.upsertDepartment(dept).catch(console.error);
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    supabaseService.deleteDepartment(id).catch(console.error);
  };

  const handleClearAuditLogs = async () => {
    setAuditLogs([]);
    await supabaseService.clearAuditLogs();
    logEvent('LOGS_CLEARED', 'system', null, { cleared_by: authUsername });
  };

  const pendingReviewsCount = nodes.filter(n => n.review_status === 'Pending Review').length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0e14] text-[#f1f5f9] font-sans selection:bg-[#3e6688]/40 selection:text-white">
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeModule={activeModule}
        onModuleChange={(mod) => {
          setActiveModule(mod);
          if (mod !== 'Episodes') setSelectedEpisode(null);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenChangePassword={() => setIsPasswordModalOpen(true)}
        isSupabaseActive={isSupabaseActive}
        pendingReviewCount={pendingReviewsCount}
      />

      <main className="flex-1 overflow-hidden p-4 sm:p-6 bg-gradient-to-b from-[#0b0e14] via-[#0e121a] to-[#0b0e14]">
        {/* 1. Episode Hub / Episode Detail View */}
        {activeModule === 'Episodes' && (
          selectedEpisode ? (
            <EpisodeDetailView
              episode={selectedEpisode}
              nodes={nodes}
              departments={departments}
              users={authorizedUsers}
              onBack={() => setSelectedEpisode(null)}
              onUpdateEpisode={(ep) => handleEditEpisode(ep.id, ep)}
              onCreateTask={handleCreateNode}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onSubmitTaskForReview={handleSubmitTaskForReview}
              onAssignStudentToTask={handleAssignStudentToTask}
              onMoveStudentBetweenTasks={handleMoveStudentBetweenTasks}
              onDeleteTask={handleDeleteNode}
            />
          ) : (
            <EpisodeHub
              episodes={episodes}
              nodes={nodes}
              departments={departments}
              users={authorizedUsers}
              onSelectEpisode={(ep) => setSelectedEpisode(ep)}
              onAddEpisode={handleCreateEpisode}
              onEditEpisode={handleEditEpisode}
              onDeleteEpisode={handleDeleteEpisode}
              onUpdateEpisodeStatus={handleUpdateEpisodeStatus}
              currentRole={currentRole}
            />
          )
        )}

        {/* 2. Self-Assessment (16personalities-Style Student Form) */}
        {activeModule === 'Self-Assessment' && !isTeacherOrAdmin && (
          <SelfAssessment
            episodes={episodes}
            pastAssessments={selfAssessments}
            onSubmitAssessment={handleSubmitAssessment}
          />
        )}

        {/* 3. Teacher QA Review Queue */}
        {activeModule === 'Review Queue' && isTeacherOrAdmin && (
          <TeacherReviewPanel
            nodes={nodes}
            episodes={episodes}
            departments={departments}
            onApproveTask={handleApproveTask}
            onRevertTask={handleRevertTask}
          />
        )}

        {/* 4. Assessment Reports (Teacher View of Student Responses) */}
        {(activeModule === 'Assessment Reports' || (activeModule === 'Self-Assessment' && isTeacherOrAdmin)) && isTeacherOrAdmin && (
          <AssessmentReports
            assessments={selfAssessments}
            episodes={episodes}
          />
        )}

        {/* 5. Telemetry & Logs */}
        {activeModule === 'Telemetry & Logs' && isTeacherOrAdmin && (
          <ActivityLogsPanel
            logs={auditLogs}
            episodes={episodes}
            nodes={nodes}
            assessments={selfAssessments}
            users={authorizedUsers}
            onClearLogs={handleClearAuditLogs}
            isAdmin={authRole === 'Admin'}
          />
        )}

        {/* 6. Departments & Roster */}
        {activeModule === 'Departments & Roster' && isTeacherOrAdmin && (
          <DepartmentManager
            departments={departments}
            users={authorizedUsers}
            onAddDepartment={handleAddDepartment}
            onUpdateDepartment={handleUpdateDepartment}
            onDeleteDepartment={handleDeleteDepartment}
            onAddUser={handleAddAuthorizedUser}
            onUpdateUser={handleUpdateAuthorizedUser}
            onDeleteUser={handleDeleteAuthorizedUser}
            currentRole={authRole}
          />
        )}

        {/* 7. Access Control Panel */}
        {activeModule === 'Access Control' && isTeacherOrAdmin && (
          <AccessControlPanel
            authorizedUsers={authorizedUsers}
            onAddAuthorizedUser={handleAddAuthorizedUser}
            onDeleteAuthorizedUser={handleDeleteAuthorizedUser}
            onUpdateAuthorizedUser={handleUpdateAuthorizedUser}
            accountRequests={accountRequests}
            onDeleteAccountRequest={handleDeleteAccountRequest}
            departments={departments}
          />
        )}
      </main>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onUpdatePassword={handleUpdateMyPassword}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentRole={currentRole}
        simulatedDate={simulatedDate}
        onDateChange={setSimulatedDate}
        onExport={() => {
          const data = { departments, nodes, episodes, authorizedUsers, selfAssessments, auditLogs };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `isha-vibes-full-backup-${Date.now()}.json`;
          link.click();
        }}
        onImport={(file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = JSON.parse(e.target?.result as string);
              if (data.departments) setDepartments(data.departments);
              if (data.nodes) setNodes(data.nodes);
              if (data.episodes) setEpisodes(data.episodes);
              if (data.authorizedUsers) setAuthorizedUsers(data.authorizedUsers);
              alert('State restored successfully!');
            } catch (err) {
              alert('Invalid state backup file.');
            }
          };
          reader.readAsText(file);
        }}
      />
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { TopStats } from './components/TopStats';
import { Header } from './components/Header';
import { GanttChart } from './components/GanttChart';
import { NodeList } from './components/NodeList';
import { NewNodeModal } from './components/NewNodeModal';
import { EpisodeHub } from './components/EpisodeHub';
import { DepartmentManager } from './components/DepartmentManager';
import { SettingsModal } from './components/SettingsModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { TeamTodos } from './components/TeamTodos';
import { BudgetLedger } from './components/BudgetLedger';
import { AccessControlPanel } from './components/AccessControlPanel';
import { initialNodes } from './data/mockNodes';
import { initialEpisodes } from './data/mockEpisodes';
import { 
  Role, Status, Node, Department, Episode, 
  ExpenditureItem, NewsUpdate, AuthorizedUser, initialDepartments, Priority 
} from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { supabaseService } from './lib/supabaseService';
import { useAuth } from './components/AuthGate';
import { PublicWelcome } from './components/PublicWelcome';

// Initial podcast equipment & studio costs
const defaultExpenditures: ExpenditureItem[] = [
  {
    id: "EXP-101",
    item_name: "Shure SM7B Dynamic Vocal Microphone (2x Units)",
    cost: 72000,
    category: "Equipment",
    needed_by: "2026-09-10",
    status: "Purchased",
    pledged_by_username: null,
    pledged_by_name: null
  },
  {
    id: "EXP-102",
    item_name: "Focusrite Scarlett 4i4 USB Audio Interface",
    cost: 21500,
    category: "Equipment",
    needed_by: "2026-09-12",
    status: "Purchased",
    pledged_by_username: null,
    pledged_by_name: null
  },
  {
    id: "EXP-103",
    item_name: "Acoustic Foam Soundproofing Panels (Studio B)",
    cost: 14500,
    category: "Studio & Acoustic",
    needed_by: "2026-09-15",
    status: "Purchased",
    pledged_by_username: null,
    pledged_by_name: null
  },
  {
    id: "EXP-104",
    item_name: "Descript & Adobe Audition Annual Education Licences",
    cost: 18000,
    category: "Software & Subscriptions",
    needed_by: "2026-09-20",
    status: "Pledged",
    pledged_by_username: null,
    pledged_by_name: null
  },
  {
    id: "EXP-105",
    item_name: "Campus Banner & Student Broadcast Posters",
    cost: 6500,
    category: "Marketing & Branding",
    needed_by: "2026-09-25",
    status: "Pending",
    pledged_by_username: null,
    pledged_by_name: null
  }
];

const defaultNews: NewsUpdate[] = [
  {
    id: "NEWS-101",
    title: "Isha Vibes Studio Inauguration",
    content: "Welcome to the official production hub of Isha Vibes! Student hosts and audio editors can now coordinate episode schedules and access recorded masters in real time.",
    created_at: "2026-09-01",
    author: "Faculty Mentor",
    category: "Announcement"
  },
  {
    id: "NEWS-102",
    title: "Season 1 Pilot Recording Scheduled",
    content: "Episode 01 recording dry run is scheduled for next Tuesday in Studio B with our guest faculty panel. Research outlines have been locked.",
    created_at: "2026-09-05",
    author: "Lead Host",
    category: "Studio Update"
  }
];

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
  }
];

export default function App() {
  const { isSupabaseActive, role: authRole, user, name: authName, username: authUsername, signOut, setIsLoggingIn } = useAuth();
  const isAdmin = authRole === 'Admin' || authRole === 'Teacher';
  const [currentRole, setCurrentRole] = useState<string>('Teacher');

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Persistent States with localStorage fallbacks
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

  const [expenditures, setExpenditures] = useState<ExpenditureItem[]>(() => {
    const saved = localStorage.getItem('vibes_expenditures');
    return saved ? JSON.parse(saved) : defaultExpenditures;
  });

  const [newsUpdates, setNewsUpdates] = useState<NewsUpdate[]>(() => {
    const saved = localStorage.getItem('vibes_news');
    return saved ? JSON.parse(saved) : defaultNews;
  });

  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>(() => {
    const saved = localStorage.getItem('vibes_auth_users');
    return saved ? JSON.parse(saved) : defaultAuthorizedUsers;
  });

  const [accountRequests, setAccountRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('vibes_account_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [simulatedDate, setSimulatedDate] = useState<string>('2026-09-12');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<string>('Command Center');
  const [supabaseLoading, setSupabaseLoading] = useState(false);

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem('vibes_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('vibes_nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('vibes_episodes', JSON.stringify(episodes));
  }, [episodes]);

  useEffect(() => {
    localStorage.setItem('vibes_expenditures', JSON.stringify(expenditures));
  }, [expenditures]);

  useEffect(() => {
    localStorage.setItem('vibes_news', JSON.stringify(newsUpdates));
  }, [newsUpdates]);

  useEffect(() => {
    localStorage.setItem('vibes_auth_users', JSON.stringify(authorizedUsers));
  }, [authorizedUsers]);

  // Initial Fetch & Seed from Supabase
  useEffect(() => {
    async function initSupabase() {
      if (!isSupabaseActive) {
        setSupabaseLoading(false);
        return;
      }
      try {
        setSupabaseLoading(true);
        let remoteDepts = await supabaseService.getDepartments();
        let remoteNodes = await supabaseService.getNodes();
        let remoteEpisodes = await supabaseService.getEpisodes();
        let remoteExpenditures = await supabaseService.getExpenditures();
        let remoteNews = await supabaseService.getNewsUpdates();
        let remoteAuthUsers = await supabaseService.getAuthorizedUsers();
        let remoteAccountRequests = await supabaseService.getAccountRequests();

        // Seed if remote tables are completely empty
        if (remoteDepts.length === 0 && remoteNodes.length === 0) {
          console.log('Supabase tables empty, auto-seeding default Isha Vibes dataset...');
          for (const dept of initialDepartments) {
            await supabaseService.upsertDepartment(dept);
          }
          for (const node of initialNodes) {
            await supabaseService.upsertNode(node);
          }
          for (const ep of initialEpisodes) {
            await supabaseService.upsertEpisode(ep);
          }
          for (const exp of defaultExpenditures) {
            await supabaseService.upsertExpenditure(exp);
          }
          for (const news of defaultNews) {
            await supabaseService.upsertNewsUpdate(news);
          }
          for (const usr of defaultAuthorizedUsers) {
            await supabaseService.upsertAuthorizedUser(usr);
          }

          remoteDepts = await supabaseService.getDepartments();
          remoteNodes = await supabaseService.getNodes();
          remoteEpisodes = await supabaseService.getEpisodes();
          remoteExpenditures = await supabaseService.getExpenditures();
          remoteNews = await supabaseService.getNewsUpdates();
          remoteAuthUsers = await supabaseService.getAuthorizedUsers();
        }

        if (remoteDepts.length > 0) setDepartments(remoteDepts);
        if (remoteNodes.length > 0) setNodes(remoteNodes);
        if (remoteEpisodes.length > 0) setEpisodes(remoteEpisodes);
        if (remoteExpenditures.length > 0) setExpenditures(remoteExpenditures);
        if (remoteNews.length > 0) setNewsUpdates(remoteNews);
        if (remoteAuthUsers.length > 0) setAuthorizedUsers(remoteAuthUsers);
        if (remoteAccountRequests.length > 0) setAccountRequests(remoteAccountRequests);
      } catch (err) {
        console.error('Failed to sync with Supabase on mount:', err);
      } finally {
        setSupabaseLoading(false);
      }
    }

    initSupabase();
  }, [isSupabaseActive]);

  // Real-Time Subscriptions
  useEffect(() => {
    if (!isSupabaseActive || !supabase) return;

    const channel = supabase
      .channel('vibes-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newDept = payload.new as Department;
          setDepartments(prev => {
            const exists = prev.some(d => d.id === newDept.id);
            if (exists) return prev.map(d => d.id === newDept.id ? newDept : d);
            return [...prev, newDept];
          });
        } else if (payload.eventType === 'DELETE') {
          setDepartments(prev => prev.filter(d => d.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nodes' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newNode = payload.new as Node;
          setNodes(prev => {
            const exists = prev.some(n => n.id === newNode.id);
            if (exists) return prev.map(n => n.id === newNode.id ? newNode : n);
            return [...prev, newNode];
          });
        } else if (payload.eventType === 'DELETE') {
          setNodes(prev => prev.filter(n => n.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'episodes' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newEp = payload.new as Episode;
          setEpisodes(prev => {
            const exists = prev.some(e => e.id === newEp.id);
            if (exists) return prev.map(e => e.id === newEp.id ? newEp : e);
            return [...prev, newEp];
          });
        } else if (payload.eventType === 'DELETE') {
          setEpisodes(prev => prev.filter(e => e.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenditures' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newExp = payload.new as ExpenditureItem;
          setExpenditures(prev => {
            const exists = prev.some(e => e.id === newExp.id);
            if (exists) return prev.map(e => e.id === newExp.id ? newExp : e);
            return [...prev, newExp];
          });
        } else if (payload.eventType === 'DELETE') {
          setExpenditures(prev => prev.filter(e => e.id !== payload.old.id));
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

          // If current logged-in user got dormant, log them out
          if (userRef.current?.username && newUser.username?.toLowerCase() === userRef.current.username.toLowerCase()) {
            if (newUser.is_greenlit === false) {
              alert('Your account authorization has been set to dormant. Logging out.');
              signOut();
            }
          }
        } else if (payload.eventType === 'DELETE') {
          setAuthorizedUsers(prev => prev.filter(u => u.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSupabaseActive, signOut]);

  // --- Password Management ---
  const handleUpdateMyPassword = async (newPassword: string) => {
    const targetUsername = authUsername || user?.username;
    if (!targetUsername) throw new Error('No active user session detected.');
    await supabaseService.updateUserPassword(targetUsername, newPassword);
    setAuthorizedUsers(prev => prev.map(u => 
      u.username.toLowerCase() === targetUsername.toLowerCase() ? { ...u, password: newPassword } : u
    ));
  };

  // --- Department Handlers ---
  const handleAddDepartment = (deptData: Omit<Department, 'id'>) => {
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      ...deptData,
      created_at: new Date().toISOString()
    };
    setDepartments(prev => [...prev, newDept]);
    supabaseService.upsertDepartment(newDept).catch(console.error);
  };

  const handleUpdateDepartment = (dept: Department) => {
    setDepartments(prev => prev.map(d => d.id === dept.id ? dept : d));
    supabaseService.upsertDepartment(dept).catch(console.error);
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    supabaseService.deleteDepartment(id).catch(console.error);
  };

  // --- Node / Task Handlers ---
  const handleCreateNode = (nodeData: { 
    title: string; 
    description: string; 
    department: string; 
    priority: Priority;
    planned_start: string; 
    planned_end: string; 
    dependency?: string 
  }) => {
    const newId = `TSK-${String(nodes.length + 101)}`;
    const newNode: Node = {
      id: newId,
      ...nodeData,
      status: 'To Do',
      actual_start: null,
      actual_end: null,
    };
    setNodes(prev => [...prev, newNode]);
    supabaseService.upsertNode(newNode).catch(console.error);
  };

  const handleUpdateStatus = (id: string, newStatus: Status) => {
    const updated = nodes.map(node => {
      if (node.id !== id) return node;
      const copy = { ...node, status: newStatus };
      if (newStatus === 'In Progress' && !copy.actual_start) copy.actual_start = simulatedDate;
      if (newStatus === 'Completed' && !copy.actual_end) {
        if (!copy.actual_start) copy.actual_start = simulatedDate;
        copy.actual_end = simulatedDate;
      }
      return copy;
    });
    setNodes(updated);
    const modified = updated.find(n => n.id === id);
    if (modified) supabaseService.upsertNode(modified).catch(console.error);
  };

  const handleDeleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    supabaseService.deleteNode(id).catch(console.error);
  };

  const handleAssignTodo = (id: string, assignedTo: string | null) => {
    const updated = nodes.map(n => n.id === id ? { ...n, assigned_to: assignedTo } : n);
    setNodes(updated);
    const modified = updated.find(n => n.id === id);
    if (modified) supabaseService.upsertNode(modified).catch(console.error);
  };

  const handleEditTodo = (id: string, updatedTodo: Node) => {
    setNodes(prev => prev.map(n => n.id === id ? updatedTodo : n));
    supabaseService.upsertNode(updatedTodo).catch(console.error);
  };

  // --- Budget / Expenditure Handlers ---
  const handleAddExpenditure = (itemData: Omit<ExpenditureItem, 'id' | 'pledged_by_username' | 'pledged_by_name'>) => {
    const newItem: ExpenditureItem = {
      id: `EXP-${Date.now()}`,
      ...itemData,
      pledged_by_username: null,
      pledged_by_name: null
    };
    setExpenditures(prev => [...prev, newItem]);
    supabaseService.upsertExpenditure(newItem).catch(console.error);
  };

  const handleDeleteExpenditure = (id: string) => {
    setExpenditures(prev => prev.filter(e => e.id !== id));
    supabaseService.deleteExpenditure(id).catch(console.error);
  };

  const handleUpdateExpenditureStatus = (id: string, status: ExpenditureItem['status']) => {
    const updated = expenditures.map(e => e.id === id ? { ...e, status } : e);
    setExpenditures(updated);
    const item = updated.find(e => e.id === id);
    if (item) supabaseService.upsertExpenditure(item).catch(console.error);
  };

  // --- Access Control Handlers ---
  const handleAddAuthorizedUser = async (userData: Omit<AuthorizedUser, 'id'>) => {
    const cleanUsername = userData.username.toLowerCase().trim();
    const newUser: AuthorizedUser = {
      id: `AUTH-${Date.now()}`,
      ...userData,
      username: cleanUsername
    };
    setAuthorizedUsers(prev => [newUser, ...prev]);
    try {
      await supabaseService.upsertAuthorizedUser(newUser);
    } catch (err) {
      console.error('Error adding user:', err);
    }
  };

  const handleDeleteAuthorizedUser = (id: string) => {
    setAuthorizedUsers(prev => prev.filter(u => u.id !== id));
    supabaseService.deleteAuthorizedUser(id).catch(console.error);
  };

  const handleUpdateAuthorizedUser = (user: AuthorizedUser) => {
    setAuthorizedUsers(prev => prev.map(u => u.id === user.id ? user : u));
    supabaseService.upsertAuthorizedUser(user).catch(console.error);
  };

  const handleRequestAccount = async (username: string, notes: string) => {
    await supabaseService.createAccountRequest(username, notes);
    const reqs = await supabaseService.getAccountRequests();
    setAccountRequests(reqs);
  };

  const handleDeleteAccountRequest = (id: string) => {
    setAccountRequests(prev => prev.filter(r => r.id !== id));
    supabaseService.deleteAccountRequest(id).catch(console.error);
  };

  const activeEpisode = episodes[0] || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0e14] text-[#f1f5f9] font-sans selection:bg-[#3e6688]/40 selection:text-white">
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenChangePassword={() => setIsPasswordModalOpen(true)}
        isSupabaseActive={isSupabaseActive}
      />

      <main className="flex-1 overflow-hidden p-4 sm:p-6 bg-gradient-to-b from-[#0b0e14] via-[#0e121a] to-[#0b0e14]">
        {/* Guest View: Public Welcome & Join Portal */}
        {authRole === 'Guest' && activeModule === 'Command Center' ? (
          <div className="h-full overflow-y-auto">
            <PublicWelcome
              nodes={nodes}
              departments={departments}
              expenditures={expenditures}
              simulatedDate={simulatedDate}
              onRequestAccount={handleRequestAccount}
              onOpenLogin={() => setIsLoggingIn && setIsLoggingIn(true)}
            />
          </div>
        ) : (
          <>
            {/* 1. Command Center */}
            {activeModule === 'Command Center' && (
              <div className="flex flex-col h-full gap-4">
                <TopStats
                  activeEpisode={activeEpisode}
                  nodes={nodes}
                  departments={departments}
                  memberCount={authorizedUsers.length}
                />
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                  <div className="lg:col-span-2 h-full min-h-0">
                    <GanttChart 
                      nodes={nodes} 
                      departments={departments}
                      simulatedDate={simulatedDate} 
                    />
                  </div>
                  <div className="h-full min-h-0">
                    <NodeList
                      nodes={nodes}
                      currentRole={currentRole}
                      onUpdateStatus={handleUpdateStatus}
                      onDeleteNode={handleDeleteNode}
                      onOpenCreateModal={() => setIsModalOpen(true)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Episode Production Ledger */}
            {activeModule === 'Episodes' && (
              <div className="h-full">
                <EpisodeHub
                  episodes={episodes}
                  setEpisodes={setEpisodes}
                  currentRole={currentRole}
                />
              </div>
            )}

            {/* 3. Departments & Member Roster */}
            {activeModule === 'Departments & Roster' && (
              <div className="h-full">
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
              </div>
            )}

            {/* 4. Action Items & To-Dos */}
            {activeModule === 'To-Dos' && (
              <div className="h-full overflow-y-auto">
                <TeamTodos
                  nodes={nodes}
                  authorizedUsers={authorizedUsers}
                  departments={departments}
                  currentRole={currentRole}
                  onAddTodo={(todo) => handleCreateNode({ ...todo, priority: 'Medium' })}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteTodo={handleDeleteNode}
                  onAssignTodo={handleAssignTodo}
                  onEditTodo={handleEditTodo}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {/* 5. Budget & Studio Costs */}
            {activeModule === 'Budget & Studio' && (
              <div className="h-full">
                <BudgetLedger
                  expenditures={expenditures}
                  onAddExpenditure={handleAddExpenditure}
                  onDeleteExpenditure={handleDeleteExpenditure}
                  onUpdateStatus={handleUpdateExpenditureStatus}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {/* 6. Access Control Panel */}
            {activeModule === 'Access Control' && isAdmin && (
              <div className="h-full">
                <AccessControlPanel
                  authorizedUsers={authorizedUsers}
                  onAddAuthorizedUser={handleAddAuthorizedUser}
                  onDeleteAuthorizedUser={handleDeleteAuthorizedUser}
                  onUpdateAuthorizedUser={handleUpdateAuthorizedUser}
                  accountRequests={accountRequests}
                  onDeleteAccountRequest={handleDeleteAccountRequest}
                  departments={departments}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Self-Service Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onUpdatePassword={handleUpdateMyPassword}
      />

      {/* Task Creation Modal */}
      <NewNodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateNode}
        existingNodes={nodes}
        departments={departments}
      />

      {/* Studio & Supabase Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentRole={currentRole}
        simulatedDate={simulatedDate}
        onDateChange={setSimulatedDate}
        onExport={() => {
          const data = { departments, nodes, episodes, expenditures, newsUpdates, authorizedUsers };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'isha-vibes-state-backup.json';
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
              if (data.expenditures) setExpenditures(data.expenditures);
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

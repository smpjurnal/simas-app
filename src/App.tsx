// Force re-build

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, UserRole, JournalEntry } from './types';
import { INITIAL_JOURNAL_CATEGORIES, USERS, INITIAL_JOURNAL_ENTRIES } from './constants';
import { loadState, saveState } from './utils/storage';
import LoginScreen from './components/LoginScreen';
import StudentDashboard from './components/dashboards/StudentDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import ParentDashboard from './components/dashboards/ParentDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import Layout from './components/Layout';
import ErrorScreen from './components/ErrorScreen';

const API_URL = process.env.NODE_ENV === 'production' ? `https://${process.env.REACT_APP_VERCEL_URL}/api` : '/api';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalCategories, setJournalCategories] = useState<string[]>([]);
  const [attendanceSettings, setAttendanceSettings] = useState({ startTime: '07:00', endTime: '09:00' });
  const [schoolName, setSchoolName] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, journalsResponse] = await Promise.all([
          fetch(`${API_URL}/users`).then(res => res.json()),
          fetch(`${API_URL}/journals`).then(res => res.json()),
        ]);
        setUsers(usersResponse);
        setJournalEntries(journalsResponse);
        setJournalCategories(loadState('journalCategories', INITIAL_JOURNAL_CATEGORIES));
        setAttendanceSettings(loadState('attendanceSettings', { startTime: '07:00', endTime: '09:00' }));
        setSchoolName(loadState('schoolName', ''));
        setTheme(loadState('theme', 'light'));
      } catch (e: any) {
        console.error("Gagal mengambil data dari API:", e);
        setError("Gagal mengambil data dari server. Silakan coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => { if (!isLoading) saveState('journalCategories', journalCategories); }, [journalCategories, isLoading]);
  useEffect(() => { if (!isLoading) saveState('attendanceSettings', attendanceSettings); }, [attendanceSettings, isLoading]);
  useEffect(() => { if (!isLoading) saveState('schoolName', schoolName); }, [schoolName, isLoading]);
  useEffect(() => { if (!isLoading) saveState('theme', theme); }, [theme, isLoading]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      const updatedUser = users.find(u => u.id === currentUser.id);
      if (updatedUser) {
        if (JSON.stringify(currentUser) !== JSON.stringify(updatedUser)) {
          setCurrentUser(updatedUser);
        }
      } else {
        setCurrentUser(null);
      }
    }
  }, [users, currentUser]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleLogin = async (identifier: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data);
      } else {
        setLoginError(data.message || "Gagal untuk masuk");
      }
    } catch (error) {
      setLoginError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddJournal = async (newJournalData: Partial<JournalEntry>) => {
    const response = await fetch(`${API_URL}/journals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJournalData),
    });
    const newJournal = await response.json();
    setJournalEntries(prev => [newJournal, ...prev]);
  };

  const handleUpdateJournal = async (updatedJournal: JournalEntry) => {
    await fetch(`${API_URL}/journals/${updatedJournal.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedJournal),
      }
    );
    setJournalEntries(prev => prev.map(j => j.id === updatedJournal.id ? updatedJournal : j));
  };

  const handleDeleteJournal = async (journalId: string) => {
    await fetch(`${API_URL}/journals/${journalId}`, { method: 'DELETE' });
    setJournalEntries(prev => prev.filter(j => j.id !== journalId));
  };

  const handleAddUser = async (newUser: User) => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    const addedUser = await response.json();
    setUsers(prev => [addedUser, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const handleUpdateUser = async (updatedUser: User) => {
    await fetch(`${API_URL}/users/${updatedUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser),
    });
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteUser = async (userId: string) => {
    await fetch(`${API_URL}/users/${userId}`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== userId));
  };
  
  const handleResetData = useCallback(async () => {
    await fetch(`${API_URL}/users/reset_application_data`, { method: 'DELETE' });
    const [usersResponse, journalsResponse] = await Promise.all([
      fetch(`${API_URL}/users`).then(res => res.json()),
      fetch(`${API_URL}/journals`).then(res => res.json()),
    ]);
    setUsers(usersResponse);
    setJournalEntries(journalsResponse);
  }, []);

  const DashboardComponent = useMemo(() => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case UserRole.STUDENT:
        return <StudentDashboard 
                  user={currentUser}
                  journalCategories={journalCategories}
                  attendanceSettings={attendanceSettings}
                  journals={journalEntries}
                  onAddJournal={handleAddJournal}
                  onUpdateJournal={handleUpdateJournal}
                  onDeleteJournal={handleDeleteJournal}
                />;
      case UserRole.TEACHER:
        return <TeacherDashboard 
                  user={currentUser} 
                  journals={journalEntries}
                  onUpdateJournal={handleUpdateJournal}
                  users={users}
                />;
      case UserRole.PARENT:
        return <ParentDashboard 
                  user={currentUser} 
                  journals={journalEntries}
                  users={users}
                />;
      case UserRole.ADMIN:
        return <AdminDashboard 
                  user={currentUser}
                  users={users}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  journalCategories={journalCategories}
                  onJournalCategoriesChange={setJournalCategories}
                  attendanceSettings={attendanceSettings}
                  onAttendanceSettingsChange={setAttendanceSettings}
                  journals={journalEntries}
                  onResetData={handleResetData}
                />;
      default:
        return <div>Invalid user role</div>;
    }
  }, [currentUser, journalCategories, attendanceSettings, users, journalEntries, handleResetData]);

  if (isLoading) {
    return null;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <Layout user={currentUser} onLogout={handleLogout} toggleTheme={toggleTheme} theme={theme}>
      {currentUser ? (
        DashboardComponent
      ) : (
        <LoginScreen onLogin={handleLogin} error={loginError} isLoggingIn={isLoggingIn} />
      )}
    </Layout>
  );
};

export default App;

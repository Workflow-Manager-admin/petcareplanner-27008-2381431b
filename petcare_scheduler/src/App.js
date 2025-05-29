import React, { useState, useMemo } from 'react';
import './App.css';
import PetProfiles from './PetProfiles';
import TaskScheduler from './TaskScheduler';
import Dashboard from './Dashboard';
import HealthLog from './HealthLog';
import Notifications from './Notifications';

/**
 * PUBLIC_INTERFACE
 * PetCarePlanner main root container.
 * Provides basic navigation, persistent navbar, and scaffolded feature placeholders.
 */
function App() {
  // Navigation state: main views
  const [view, setView] = useState('dashboard');

  // App-level pet state
  const [pets, setPets] = useState([]);
  // App-level health logs state: { [petId]: [ {id, date, time, type, notes}] }
  const [healthLogs, setHealthLogs] = useState({});

  // Notifications/reminders state (array of {id, text, icon, time, ...})
  const [notifications, setNotifications] = useState([]);
  // Track per-session dismissed ids so reminders do not reappear until new ones are generated
  const [dismissedNotifIds, setDismissedNotifIds] = useState([]);

  // PUBLIC_INTERFACE
  // Auto-generate notifications from tasks/events that are upcoming today/future
  // For V1 they are session-only, calculated on render.

  function getUpcomingTaskNotifications(allPets) {
    const notifList = [];
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 10); // today YYYY-MM-DD
    // Show only reminders for today and very soon upcoming tasks (simulate future expansion)
    allPets.forEach(pet => {
      (pet.tasks || []).forEach(task => {
        // Only show if task is today and not completed
        const frequency = (task.frequency || "Daily");
        let shouldRemind = false;
        if (frequency === "Daily") shouldRemind = true;
        else if (frequency === "Weekly") shouldRemind = (now.getDay() === 1); // only Monday
        else if (frequency === "Every Other Day") shouldRemind = true;
        else shouldRemind = true; // fallback
        // Check if already completed/skipped today
        const status = (task.statusByDate && task.statusByDate[nowStr]) || "pending";
        if (shouldRemind && status !== "completed") {
          // Reminder 1h before or just list all for tasks soon/today
          notifList.push({
            id: `task-${pet.id}-${task.id}`,
            text: `Upcoming: ${task.type} for ${pet.name}`,
            icon: "⏰",
            time: task.time ? `@ ${task.time}` : "",
            kind: "task"
          });
        }
      });
    });
    return notifList;
  }
  // Same for notable health events, e.g., vet/vaccination soon. (V1: health logs are not future scheduled)
  // Extensible for future.

  // Always compute notifications from fresh pets/healthLogs state (exclude dismissed)
  const inAppNotifications = useMemo(() => {
    // Notifications from upcoming tasks
    let notifArr = getUpcomingTaskNotifications(pets);

    // Notifications from upcoming health events
    notifArr = notifArr.concat(getUpcomingHealthEventNotifications(pets, healthLogs));

    // Remove dismissed
    notifArr = notifArr.filter(n => !dismissedNotifIds.includes(n.id));
    // Sort by kind and time for nicer grouping (optionally can do here)
    return notifArr;
  }, [pets, healthLogs, dismissedNotifIds]);

  // Effect: Populate notifications on pets or healthLogs state update
  React.useEffect(() => {
    setNotifications(inAppNotifications);
  }, [inAppNotifications]);

  // Dismiss handler
  function handleDismissNotification(notifId) {
    setDismissedNotifIds(ids => [...ids, notifId]);
  }

  // Reset notifications when center viewed (simulate restore, e.g., "View All")
  function handleShowNotificationCenter() {
    setView('notifications');
    setDismissedNotifIds([]);
  }

  // PUBLIC_INTERFACE
  // Dashboard is now a real feature, taking `pets` (including any tasks) as data
  function PetDashboard() {
    return (
      <Dashboard pets={pets} setPets={setPets} />
    );
  }
  // Route-integrated TaskScheduler
  function TaskSchedulerRoute() {
    return (
      <TaskScheduler pets={pets} setPets={setPets} />
    );
  }
  // Route-integrated HealthLog
  function HealthLogRoute() {
    return (
      <HealthLog
        pets={pets}
        healthLogs={healthLogs}
        setHealthLogs={setHealthLogs}
      />
    );
  }
  function NotificationCenter() {
    return (
      <section>
        <h2 className="title" style={{ fontSize: '2rem'}}>Notification Center</h2>
        <div className="description">Reminders for upcoming care and health events.</div>
        <div style={{marginTop: 32, color: 'var(--text-secondary)'}}>[Notifications feature coming soon]</div>
      </section>
    );
  }

  // Navigation button data
  const navOptions = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'pets', label: 'Pets' },
    { key: 'scheduler', label: 'Scheduler' },
    { key: 'health', label: 'Health Log' },
    { key: 'notifications', label: 'Notifications' }
  ];

  // Main render for view
  let mainContent;
  switch (view) {
    case 'dashboard': mainContent = <PetDashboard/>; break;
    case 'pets': mainContent = <PetProfiles pets={pets} setPets={setPets}/>; break;
    case 'scheduler': mainContent = <TaskSchedulerRoute/>; break;
    case 'health': mainContent = <HealthLogRoute/>; break;
    case 'notifications': mainContent = <NotificationCenter/>; break;
    default: mainContent = <PetDashboard/>;
  }

  return (
    <div className="app">
      {/* Dismissible notifications bar, visible everywhere, not in modal */}
      <Notifications
        notifications={notifications}
        onDismiss={handleDismissNotification}
        onShowCenter={handleShowNotificationCenter}
      />

      {/* Top navbar, persistent */}
      <nav className="navbar">
        <div className="container" style={{width: "100%"}}>
          <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', width: '100%'
              }}>
            <div className="logo" tabIndex={0} aria-label="PetCarePlanner Home" style={{cursor: "pointer"}}
                onClick={()=>setView('dashboard')}>
              <span className="logo-symbol" aria-hidden="true" style={{fontWeight: 700, fontSize: "1.5em"}}>🐾</span> PetCarePlanner
            </div>
            {/* Notification indicator area (right side of top bar) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Notification badge with count */}
              {view !== 'notifications' && (
                <button
                  className="btn"
                  aria-label={`Show Notifications (${notifications.length})`}
                  onClick={handleShowNotificationCenter}
                  style={{
                    background: notifications.length > 0
                      ? 'var(--accent, #2196F3)'
                      : 'var(--kavia-orange)',
                    boxShadow: notifications.length > 0 ? "0 2px 8px #2196F388" : undefined,
                    color: "#fff",
                    position: "relative",
                    fontWeight: 600
                  }}
                >
                  🔔
                  {notifications.length > 0 && (
                    <span
                      style={{
                        background: "var(--kavia-orange)",
                        color: "#fff",
                        borderRadius: "50%",
                        fontSize: "0.81em",
                        padding: "2.5px 7px",
                        fontWeight: 800,
                        position: "absolute",
                        top: "-7px",
                        right: "-13px",
                        border: "2px solid var(--kavia-dark)"
                      }}
                      aria-label={`${notifications.length} unread notifications`}
                    >
                      {notifications.length}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Navigation bar for switching between views */}
      <nav
        style={{
          display: 'flex',
          gap: 8,
          background: "var(--kavia-dark)",
          borderBottom: "1px solid var(--border-color)",
          marginTop: 68,
          // sticky nav on mobile after main navbar
          position: 'sticky', top: '68px', zIndex: 50, padding: "8px 0"
        }}
        aria-label="Section navigation"
      >
        <div className="container" style={{display:"flex", gap: 8, flexWrap:'wrap'}}>
          {navOptions.map(opt => (
            <button
              key={opt.key}
              className="btn"
              onClick={() => setView(opt.key)}
              style={{
                background: view === opt.key ? "var(--kavia-orange)" : "transparent",
                color: view === opt.key ? "#fff" : "var(--text-secondary)",
                border: view === opt.key ? "" : "1px solid var(--border-color)",
                fontWeight: 500
              }}
              aria-current={view === opt.key ? "page" : undefined}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </nav>

      <main>
        <div className="container" style={{ padding: "40px 0" }}>
          {mainContent}
        </div>
      </main>
    </div>
  );
}

export default App;
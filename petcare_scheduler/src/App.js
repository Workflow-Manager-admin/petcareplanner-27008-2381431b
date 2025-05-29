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
  // Enhanced: Generate notifications for both upcoming tasks AND scheduled health events

  function getUpcomingTaskNotifications(allPets) {
    const notifList = [];
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 10); // today YYYY-MM-DD

    allPets.forEach(pet => {
      (pet.tasks || []).forEach(task => {
        // Only show if task is scheduled today (according to recurrence) and not completed
        const frequency = (task.frequency || "Daily");
        let shouldRemind = false;
        if (frequency === "Daily") {
          shouldRemind = true;
        } else if (frequency === "Weekly") {
          // For simplicity: assuming "Weekly" means every Monday
          shouldRemind = (now.getDay() === 1);
        } else if (frequency === "Every Other Day") {
          // Easiest, just alternate days (very basic)
          const start = new Date();
          start.setDate(start.getDate() % 2 === 0 ? start.getDate() : start.getDate()-1);
          shouldRemind = true; // As in foundation, treat as daily (refined logic can be added)
        } else {
          shouldRemind = true; // fallback/custom
        }
        // Check completion
        const status = (task.statusByDate && task.statusByDate[nowStr]) || "pending";
        if (shouldRemind && status !== "completed") {
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

  // Generate notifications for upcoming health/vet events -- any healthLogs in the future or today
  function getUpcomingHealthEventNotifications(petsArr, healthLogsObj) {
    const notifList = [];
    // Find health logs (per pet) that are scheduled for the future (date is today or later)
    const now = new Date();
    const nowISO = now.toISOString().slice(0, 10);

    petsArr.forEach(pet => {
      const petHealthLogs = (healthLogsObj && healthLogsObj[pet.id]) || [];
      petHealthLogs.forEach(event => {
        // Only show if scheduled for today or future
        if (event && event.date) {
          // Date in form "YYYY-MM-DD"
          if (event.date >= nowISO) {
            notifList.push({
              id: `health-${pet.id}-${event.id}`,
              text: `Upcoming: ${event.type} for ${pet.name}`,
              icon: "💉",
              time: event.time ? `@ ${event.time}` : "",
              kind: "health"
            });
          }
        }
      });
    });
    return notifList;
  }

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
    // Show all available notifications for today/future, including previously dismissed
    const notifList = [
      ...getUpcomingTaskNotifications(pets),
      ...getUpcomingHealthEventNotifications(pets, healthLogs)
    ];

    // Dismissed notifications
    const dismissed = notifList.filter(n => dismissedNotifIds.includes(n.id));
    const activeNotifs = notifList.filter(n => !dismissedNotifIds.includes(n.id));

    return (
      <section>
        <h2 className="title" style={{ fontSize: '2rem'}}>Notification Center</h2>
        <div className="description" style={{marginBottom:20}}>
          Reminders for upcoming care and health events.
        </div>
        <div>
          {notifList.length === 0 && (
            <div style={{padding:"38px 0", color: "var(--text-secondary)"}}>
              No upcoming tasks or health reminders.
            </div>
          )}
          {notifList.length > 0 && (
            <>
              <ul style={{listStyle: "none", padding: 0}}>
                {activeNotifs.map(notif => (
                  <li key={notif.id} style={{
                    background: "rgba(30,30,30,0.95)",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px #111a1a44",
                    border: "1.5px solid var(--accent, #2196F3)",
                    padding: "15px 22px",
                    margin: "15px 0",
                    display: "flex",
                    gap: 13,
                    alignItems: "center",
                    color: "#fff"
                  }}>
                    <span style={{fontSize: 22, marginRight:10}}>{notif.icon}</span>
                    <div>
                      <div style={{fontWeight: 600}}>{notif.text}</div>
                      {notif.time && (
                        <div style={{fontSize: "0.98em", color: "var(--text-secondary)", marginTop: 2}}>
                          {notif.time}
                        </div>
                      )}
                    </div>
                    <button
                      className="btn"
                      style={{
                        marginLeft: "auto",
                        background:"var(--kavia-orange)",
                        fontWeight: 500,
                        padding: "5px 14px",
                        fontSize: "0.97em"
                      }}
                      onClick={()=>handleDismissNotification(notif.id)}
                      aria-label="Dismiss reminder"
                    >
                      Dismiss
                    </button>
                  </li>
                ))}
                {dismissed.length > 0 && (
                  <li style={{margin:"18px 0 0 0", color:"var(--text-secondary)", fontSize:"0.97em"}}>
                    <strong>Recently dismissed:</strong>
                    <ul style={{listStyle:"none", padding:0}}>
                      {dismissed.map(n=>(
                        <li key={n.id} style={{
                          opacity:0.7,
                          padding:"7px 0 0 17px",
                          fontStyle:"italic",
                          fontSize:"0.97em"
                        }}>
                          {n.icon} {n.text} {n.time && <span style={{marginLeft:7}}>{n.time}</span>}
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
            </>
          )}
        </div>
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

  // DEMO/DEV: Insert sample test data if state is empty for better interactive testing of notification logic
  React.useEffect(() => {
    if (pets.length === 0) {
      // (simulate today/future notifications)
      const today = new Date().toISOString().slice(0, 10);
      setPets([
        {
          id: "dog-1",
          name: "Buddy",
          species: "Dog",
          breed: "Labrador",
          age: "4",
          tasks: [
            {
              id: "t1",
              type: "Feeding",
              details: "Chicken and rice",
              frequency: "Daily",
              time: "09:00",
              statusByDate: {}
            },
            {
              id: "t2",
              type: "Walk",
              details: "30 minutes in park",
              frequency: "Daily",
              time: "18:00",
              statusByDate: {}
            }
          ]
        },
        {
          id: "cat-2",
          name: "Mittens",
          species: "Cat",
          breed: "Siamese",
          age: "2",
          tasks: [
            {
              id: "t3",
              type: "Medication",
              details: "Thyroid pill",
              frequency: "Daily",
              time: "07:30",
              statusByDate: {}
            }
          ]
        }
      ]);
      setHealthLogs({
        "dog-1": [
          {
            id: "h1",
            date: today,
            time: "14:00",
            type: "Vet Visit",
            notes: "Regular checkup"
          }
        ],
        "cat-2": [
          {
            id: "h2",
            date: today,
            time: "",
            type: "Vaccination",
            notes: "Rabies booster"
          }
        ]
      });
    }
    // eslint-disable-next-line
  }, []);

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
                    fontWeight: 600,
                    border: notifications.length > 0 ? "2px solid var(--kavia-orange)" : ""
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

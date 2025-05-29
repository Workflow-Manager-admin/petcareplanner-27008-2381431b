import React, { useState } from 'react';
import './App.css';
import PetProfiles from './PetProfiles';

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

  // Placeholder feature components except Pets (now replaced)
  function PetDashboard() {
    // Will eventually render task list organized by pet
    return (
      <section>
        <h2 className="title" style={{ fontSize: '2rem'}}>Daily Dashboard</h2>
        <div className="description">All today's care tasks for your pets appear here.</div>
        <div style={{marginTop: 32, color: 'var(--text-secondary)'}}>[Dashboard feature coming soon]</div>
      </section>
    );
  }
  function TaskScheduler() {
    return (
      <section>
        <h2 className="title" style={{ fontSize: '2rem'}}>Task Scheduler</h2>
        <div className="description">Schedule feedings, walks, meds, and more.</div>
        <div style={{marginTop: 32, color: 'var(--text-secondary)'}}>[Scheduler feature coming soon]</div>
      </section>
    );
  }
  function HealthLog() {
    return (
      <section>
        <h2 className="title" style={{ fontSize: '2rem'}}>Health & Medical Log</h2>
        <div className="description">Log vet visits, vaccinations, medications, and events.</div>
        <div style={{marginTop: 32, color: 'var(--text-secondary)'}}>[Health Log feature coming soon]</div>
      </section>
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
    case 'scheduler': mainContent = <TaskScheduler/>; break;
    case 'health': mainContent = <HealthLog/>; break;
    case 'notifications': mainContent = <NotificationCenter/>; break;
    default: mainContent = <PetDashboard/>;
  }

  return (
    <div className="app">
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
              {/* In the future: status badges, number of pending reminders, etc. */}
              {view !== 'notifications' && (
                <button
                  className="btn"
                  aria-label="Show Notifications"
                  onClick={() => setView('notifications')}
                  style={{ background: 'var(--kavia-orange)' }}
                >🔔</button>
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
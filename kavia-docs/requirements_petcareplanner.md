# PetCarePlanner Requirements Document

## 1. Introduction

This document outlines the product and architectural requirements for the **PetCarePlanner** React application. The app is a personal pet care assistant for households managing one or more pets, supporting multi-pet profiles, scheduling recurring care tasks, a unified daily dashboard, health and medical event logging, reminders/notifications, and a modern, visually cohesive user interface with a custom dark theme.

The purpose of this document is to establish clear, testable requirements that support both implementation and verification of the app’s features, behaviors, and architecture.

---

## 2. Technology Stack and Architectural Choices

- **Frontend Framework:** React JS (v18.x)
- **Programming Language:** JavaScript (ES6+)
- **Styling:** Custom CSS; modern, responsive design with a dark theme. Primary color #4CAF50, secondary #FFC107, accent #2196F3 (see detailed UI section).
- **Frontend Libraries:** No third-party UI component libraries (pure React, custom CSS).
- **State Management:** Local React state only (no Redux, no context API unless necessary).
- **Backend:** None (no server or persistent API; foundational version stores all data in local state for session).
- **Testing:** Jest with React Testing Library (default with Create React App).
- **Responsiveness:** Must display optimally on both desktop and mobile browsers.
- **Accessibility:** Follows WCAG 2.1 AA basic guidelines for contrast and navigation.

---

## 3. Functional Requirements

### 3.1 Multi-Pet Profiles (CRUD)

- Users can **create**, **read**, **update**, and **delete** pet profiles.
- Each pet profile must include:
  - Name (string)
  - Species (cat, dog, etc.; freeform or select)
  - Breed (optional string)
  - Age (in years or months)
  - Photo (optional; image upload or avatar placeholder if none)
- All pet profiles are visible in a central “Pets” section and are used throughout task and log assignment.
- Deleting a pet profile will remove associated tasks and event logs after a user confirmation step.

### 3.2 Recurring Care Task Scheduling

- Users can create and manage **recurring tasks** for each pet, such as:
  - Feeding, walking, grooming, administering medications, custom tasks
- Recurrence options must include: daily, weekly, specific days of week.
- Each task is associated with:
  - One pet profile
  - Task type/name (string)
  - Recurrence details
  - Time(s) of day
  - Optional description
- The scheduling system must generate daily tasks for display and completion based on recurrence logic.

### 3.3 Daily Task Dashboard

- Default screen shows a **daily dashboard** listing all scheduled tasks for today, organized:
  - By pet
  - Chronologically by time
- Tasks are displayed with status: pending/completed/skipped.
- Users can toggle task completion directly from the dashboard (single tap/click).
- Completed tasks remain visible (with checked style), but cannot be triggered again for the same day.

### 3.4 Health & Medical Event Logging

- For each pet, users may log health- and medical-related events:
  - Vet visits, vaccinations, medications, notes on illness/behavior
- Event log entries include:
  - Date/time
  - Event type/category
  - Description/notes
- Logs are viewable in a timeline/list per pet; users can edit or delete log entries.

### 3.5 Reminders & Notifications

- System sets **reminders/notifications** for:
  - Upcoming recurring tasks (based on schedule, e.g. feeding at 6PM)
  - Health or vet events (e.g. annual vaccination reminders)
- For foundational version, notifications/reminders are surfaced as top-of-screen banners in the UI—no push notifications or OS-level alerts.
- Notification count/indicators are visible in the top notification bar.

---

## 4. UI & UX Requirements

### 4.1 Floating Action Button

- A **floating action button** (FAB) is present on all main task and dashboard screens.
- FAB provides quick access to add a new pet or schedule a new care task.
- Button is circular, uses accent color (#2196F3), and displays a plus (+) icon.

### 4.2 Top Notification Bar

- The top of the app features a **notification/navigation bar**:
  - Persistent across all screens
  - Background: var(--kavia-dark), border: var(--border-color)
  - Shows app logo/name on left, notification/reminder count/icons on right
  - Responsive: adapts to mobile/desktop widths

### 4.3 Navigation and Containers

- Main screens: Dashboard (default), Pets, Health Logs, Settings.
- Navigation uses custom React components (no external router library unless react-router is added in future).
- All main “containers” (dashboard, pets, logs) are logically separated.

### 4.4 Visual Theming

- All UI uses a **dark theme** with:
  - Background: #1A1A1A (var(--kavia-dark))
  - Text color: #ffffff with secondary #FFFFFFB3 (rgba)
  - Buttons, navigation, and FAB honor the primary/accent palette.
  - Clean, modern, and accessible font and layout (Inter, Roboto, or system sans-serif).

---

## 5. Non-Functional Requirements

- **Performance:** App must load and respond instantly, performing all state updates and UI changes in under 250ms.
- **Security:** No sensitive data is handled. Acceptable to store all data in volatile memory.
- **Scalability:** App handles multiple pets (10+) and reasonable numbers of tasks/logs per pet (200+ total records) without UI slowdowns.
- **Extensibility:** Codebase is modular; new features or screens should be straightforward to add.
- **Browser Support:** Must work in latest Chrome, Firefox, Safari, Edge; functional in mobile browsers.

---

## 6. Testability & Verification Criteria

Each requirement above is testable via user interface testing (manual or automated):

- All CRUD operations for pets, tasks, and logs are verified through UI flows.
- Task recurrence is tested by verifying daily dashboard accuracy and repeating logic.
- UI elements (FAB, notification bar, theming) are tested for presence, accessibility, and responsiveness.
- Reminders are verified by their timely appearance in the notification bar and dashboard.
- Visual verification confirms that custom palette, dark theme, and layout adhere to provided specifications.

---

## 7. Out of Scope for Foundational Version

- No authentication, user accounts, or data persistence between app reloads.
- No integration with third-party calendar or notification services.
- No cloud backend, sync, or API features.
- No advanced scheduling (e.g., intervals beyond weekly or custom calendars).

---

## 8. Appendix

### 8.1 Color Reference

- Primary: **#4CAF50** (green)
- Secondary: **#FFC107** (amber)
- Accent: **#2196F3** (blue)
- Dark theme background: **#1A1A1A**
- Kavia orange (branding): **#E87A41** (used for highlights and some text)

### 8.2 Sample CSS Variables
```css
:root {
  --kavia-orange: #E87A41;
  --kavia-dark: #1A1A1A;
  --text-color: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
}
```

---

This requirements document serves as the canonical reference for all stages of the PetCarePlanner foundational product development and associated test planning. Changes or extensions must be reviewed and incorporated here.

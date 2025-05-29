import React, { useMemo } from "react";

/**
 * PUBLIC_INTERFACE
 * Dashboard - Shows all scheduled care tasks for today, grouped by pet and ordered by time.
 * Props:
 *   pets: array (App-level; each with {id, name, species, tasks[]})
 *   setPets: App-level setter (to mark tasks completed, etc.)
 */
function Dashboard({ pets, setPets }) {
  // Get today's tasks scheduled for all pets
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().slice(0, 10); // 'YYYY-MM-DD'

  // Helper: produce displayable time from "08:00" etc.
  function formatTime(val) {
    if (!val) return "";
    let [h, m] = val.split(":");
    if (h === undefined) return "";
    let hour = parseInt(h, 10);
    let suffix = hour >= 12 ? "PM" : "AM";
    let norm = hour % 12 || 12;
    return `${norm}:${m}${suffix}`;
  }

  // Build array of {pet, task} for today's schedule, sorted by pet name and task time
  // Remove useMemo for todayTasks and recalculate on every render for absolute freshness (performance tradeoff is fine for this scale)
  const todayTasks = (() => {
    let all = [];
    for (const pet of pets) {
      if (!pet.tasks || !Array.isArray(pet.tasks)) continue;
      for (const task of pet.tasks) {
        // Recurrence logic (very basic, matching on "Daily" or "Weekly", etc)
        const shouldShow =
          task.frequency === "Daily"
            || (task.frequency === "Weekly" &&
                todayDate.getDay() === 1) // for demo: show only Mondays for "Weekly"
            || task.frequency === "Every Other Day" // naive: treat as daily for demo
            || task.frequency === "Custom"; // treat as daily for now
        if (!shouldShow) continue;

        // Each task should have a "statusByDate" map { [dateStr]: 'completed'|'skipped' }
        all.push({
          pet,
          task,
        });
      }
    }
    // Sort first by pet name, then by time
    all.sort((a, b) => {
      if (a.pet.name < b.pet.name) return -1;
      if (a.pet.name > b.pet.name) return 1;
      if (!a.task.time) return 1;
      if (!b.task.time) return -1;
      return a.task.time.localeCompare(b.task.time);
    });
    return all;
  })();

  // Handler: mark a task as completed (today)
  function handleToggleTask(petId, taskId) {
    setPets((prevPets) =>
      prevPets.map((pet) => {
        if (pet.id !== petId) return pet;
        const updatedTasks =
          Array.isArray(pet.tasks)
            ? pet.tasks.map((t) => {
                if (t.id !== taskId) return t;
                const statusByDate = { ...(t.statusByDate || {}) };
                const status = statusByDate[todayStr] === "completed"
                  ? undefined // toggle off for demo (not typical in real app)
                  : "completed";
                if (status) statusByDate[todayStr] = status;
                else delete statusByDate[todayStr];
                return { ...t, statusByDate };
              })
            : [];
        return { ...pet, tasks: updatedTasks };
      })
    );
  }

  // Handler: reschedule/edit task -- for now, displays a prompt to set a new time for today
  function handleRescheduleTask(petId, taskId, oldTime) {
    const newTime = prompt("Enter new time for this task today (HH:MM):", oldTime || "08:00");
    if (!newTime) return;
    setPets(prevPets =>
      prevPets.map(pet =>
        pet.id !== petId
          ? pet
          : {
              ...pet,
              tasks: (pet.tasks || []).map(t =>
                t.id !== taskId ? t : { ...t, time: newTime }
              ),
            }
      )
    );
  }

  // Group by pet for display
  const groupedByPet = (() => {
    const group = {};
    for (const entry of todayTasks) {
      const pname = entry.pet.name || "Unnamed";
      if (!group[pname]) group[pname] = [];
      group[pname].push(entry.task);
    }
    return group;
  })();

  return (
    <section>
      <h2 className="title" style={{ fontSize: "2rem" }}>
        Daily Dashboard
      </h2>
      <div className="description">
        All scheduled and recurring tasks for your pets, organized for today.
      </div>
      {todayTasks.length === 0 ? (
        <div style={{ color: "var(--text-secondary)", marginTop: 36 }}>
          No scheduled tasks for today.
        </div>
      ) : (
        <div style={{ marginTop: 30 }}>
          {Object.keys(groupedByPet).map((petName, i) => (
            <div key={petName} style={{ marginBottom: 33 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--kavia-orange)",
                  fontSize: 19,
                  marginBottom: 5,
                }}
              >
                {petName}
              </div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: 2 }}>
                {groupedByPet[petName]
                  .sort((a, b) =>
                    (a.time || "").localeCompare(b.time || "")
                  )
                  .map((task, idx) => {
                    const status = (task.statusByDate && task.statusByDate[todayStr]) || "pending";
                    const isCompleted = status === "completed";
                    return (
                      <li
                        key={task.id}
                        style={{
                          background: "#252525",
                          borderRadius: 7,
                          padding: "18px 17px",
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                          marginBottom: 14,
                          boxShadow:
                            "0 2px 16px -8px rgba(0,0,0,0.13)",
                        }}
                      >
                        <button
                          aria-label={`Mark ${task.type} as complete`}
                          title={
                            isCompleted ? "Undo complete" : "Complete this task"
                          }
                          onClick={() =>
                            handleToggleTask(
                              pets.find((p) => p.name === petName).id,
                              task.id
                            )
                          }
                          style={{
                            width: 26,
                            height: 26,
                            border: "none",
                            borderRadius: "50%",
                            background: isCompleted
                              ? "var(--primary, #4CAF50)"
                              : "var(--border-color)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: "1.25em",
                            marginRight: 7,
                            cursor: isCompleted ? "default" : "pointer",
                            outline: isCompleted
                              ? "2.5px solid var(--primary, #4CAF50)"
                              : "1px solid var(--border-color)",
                          }}
                          disabled={isCompleted}
                          tabIndex={0}
                        >
                          {isCompleted ? "✔" : ""}
                        </button>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              color: isCompleted
                                ? "var(--primary, #4CAF50)"
                                : "var(--text-color, #fff)",
                              textDecoration: isCompleted
                                ? "line-through"
                                : "none",
                              fontSize: "1.07em",
                            }}
                          >
                            {task.type}
                          </div>
                          <div
                            style={{
                              color: "#fff",
                              opacity: 0.78,
                              fontSize: "0.99em",
                              marginTop: 2,
                              textDecoration: isCompleted
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {task.details}
                          </div>
                        </div>
                        <div
                          style={{
                            marginLeft: "auto",
                            fontWeight: 500,
                            color: "var(--accent, #2196F3)",
                            fontSize: "1.04em",
                            minWidth: 68,
                            letterSpacing: "0.02em",
                            textAlign: "right",
                          }}
                        >
                          {formatTime(task.time)}
                        </div>
                        <button
                          className="btn"
                          style={{
                            background: "var(--accent, #2196F3)",
                            color: "#fff",
                            padding: "6px 17px",
                            marginLeft: 14,
                            border: "none",
                            borderRadius: 6,
                            fontSize: "0.98em",
                          }}
                          aria-label="Reschedule"
                          onClick={() =>
                            handleRescheduleTask(
                              pets.find((p) => p.name === petName).id,
                              task.id,
                              task.time
                            )
                          }
                          disabled={isCompleted}
                        >
                          ⏰ Reschedule
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Dashboard;

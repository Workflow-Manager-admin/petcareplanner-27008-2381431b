import React, { useState } from "react";

/**
 * PUBLIC_INTERFACE
 * HealthLog
 * Provides an interface to add, view, and delete health/medical events for each pet.
 *
 * Props:
 *   pets: array of pet objects
 *   healthLogs: { [petId]: [logEntry, ...] }
 *   setHealthLogs: function to update healthLogs state
 */
function HealthLog({ pets, healthLogs, setHealthLogs }) {
  // Select pet for which to show/add logs
  const [selectedPetId, setSelectedPetId] = useState(
    pets.length > 0 ? `${pets[0].id}` : ""
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: "",
    time: "",
    type: "Vet Visit",
    notes: "",
  });
  const [deleteIdx, setDeleteIdx] = useState(null);

  // PUBLIC_INTERFACE
  // Add health event log for the selected pet
  function handleAddHealthLog(e) {
    e.preventDefault();
    if (!form.date || !form.type.trim() || !selectedPetId) {
      alert("Please select a date and event type.");
      return;
    }
    const entry = {
      id: Date.now() + Math.random(),
      date: form.date,
      time: form.time,
      type: form.type,
      notes: form.notes,
    };
    setHealthLogs((prev) => {
      const petLogs = prev[selectedPetId] || [];
      return {
        ...prev,
        [selectedPetId]: [entry, ...petLogs], // newest first
      };
    });
    setForm({ date: "", time: "", type: "Vet Visit", notes: "" });
    setShowForm(false);
  }

  // PUBLIC_INTERFACE
  // Delete a health log entry for the selected pet
  function handleDeleteLog(idx) {
    setDeleteIdx(idx);
  }
  function confirmDelete() {
    setHealthLogs((prev) => {
      const petLogs = prev[selectedPetId] || [];
      const logs = [...petLogs];
      logs.splice(deleteIdx, 1);
      return {
        ...prev,
        [selectedPetId]: logs,
      };
    });
    setDeleteIdx(null);
  }
  function cancelDelete() {
    setDeleteIdx(null);
  }

  // Inline styles for card and list
  const logCardStyle = {
    background: "#232323",
    borderRadius: 8,
    padding: "16px 16px",
    marginBottom: 16,
    color: "var(--text-color)",
    boxShadow: "0 1px 8px #181a1c48",
    border: "1px solid var(--border-color)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  };

  function PetSelector() {
    return (
      <select
        className="btn"
        style={{ minWidth: 120, fontWeight: 600 }}
        value={selectedPetId}
        onChange={(e) => setSelectedPetId(e.target.value)}
      >
        {pets.map((p) => (
          <option key={p.id} value={`${p.id}`}>
            {p.name}
          </option>
        ))}
      </select>
    );
  }

  // For accessibility, focus the first input when modal opens
  // (would need ref, skipping for brevity since not required)

  const logsForPet =
    selectedPetId && healthLogs[selectedPetId]
      ? healthLogs[selectedPetId]
      : [];

  const selectedPet = pets.find((p) => `${p.id}` === selectedPetId);

  return (
    <section>
      <h2 className="title" style={{ fontSize: "2rem" }}>
        Health & Medical Log
      </h2>
      <div className="description">
        Log vet visits, vaccinations, medications, notes and view health history by pet.
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", margin: "26px 0 14px 0" }}>
        <strong>Pet:</strong>
        {pets.length === 0 ? (
          <span style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            Please add a pet to begin logging health events.
          </span>
        ) : (
          <PetSelector />
        )}
        {selectedPet && (
          <span style={{ color: "var(--text-secondary)", fontSize: 14, marginLeft: 6 }}>
            ({selectedPet.species || "n/a"})
          </span>
        )}
        <button
          className="btn"
          style={{ marginLeft: "auto", background: "var(--accent, #2196F3)", color: "#fff" }}
          onClick={() => setShowForm(true)}
          disabled={!selectedPetId}
        >
          + Add Event
        </button>
      </div>

      {selectedPetId && logsForPet.length === 0 && (
        <div style={{ color: "var(--text-secondary)", marginTop: 34 }}>
          No health or medical events logged for this pet.
        </div>
      )}

      {selectedPetId && logsForPet.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {logsForPet.map((entry, idx) => (
            <div key={entry.id} style={logCardStyle}>
              <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
                <span
                  style={{
                    background: "var(--kavia-orange)",
                    color: "#fff",
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: 14,
                    padding: "4px 10px",
                    marginRight: 8,
                    width: 94,
                    textAlign: "center",
                    display: "inline-block",
                  }}
                >
                  {entry.type}
                </span>
                <span style={{ fontWeight: 600, color: "#fff", fontSize: 15 }}>
                  {entry.date}
                  {entry.time && (
                    <span style={{ marginLeft: 7, color: "var(--text-secondary)", fontSize: "0.95em" }}>
                      {entry.time}
                    </span>
                  )}
                </span>
                <button
                  className="btn"
                  aria-label="Delete event"
                  style={{
                    marginLeft: "auto",
                    fontSize: 13,
                    background: "#8B1A1A",
                    color: "#fff",
                    padding: "4px 12px",
                  }}
                  onClick={() => handleDeleteLog(idx)}
                  tabIndex={0}
                >
                  🗑
                </button>
              </div>
              {entry.notes && (
                <div
                  style={{
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                    fontSize: 15,
                    marginTop: 8,
                  }}
                >
                  {entry.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div
          className="modal-bg"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.78)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          tabIndex={-1}
        >
          <div
            className="modal-content"
            style={{
              background: "var(--kavia-dark)",
              color: "#fff",
              borderRadius: 10,
              boxShadow: "0 2px 24px #10101088",
              minWidth: 340,
              padding: "36px 25px",
              maxWidth: 420,
            }}
          >
            <h3 style={{ marginBottom: 17, fontSize: 21, color: "var(--kavia-orange)" }}>
              Add Health Event
            </h3>
            <form
              className="modal-form"
              autoComplete="off"
              onSubmit={handleAddHealthLog}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              <label>
                Date
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
              </label>
              <label>
                Time
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                />
              </label>
              <label>
                Event Type
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  required
                >
                  <option>Vet Visit</option>
                  <option>Vaccination</option>
                  <option>Medication</option>
                  <option>Illness/Behavior</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Notes
                <input
                  type="text"
                  value={form.notes}
                  maxLength={160}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Summary, treatment, etc."
                />
              </label>
              <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
                <button
                  type="submit"
                  className="btn btn-large"
                  style={{ background: "var(--kavia-orange)", minWidth: 96 }}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-color)",
                  }}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deleteIdx !== null && (
        <div
          className="modal-bg"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.8)",
            zIndex: 1001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "var(--kavia-dark)",
              color: "#fff",
              borderRadius: 10,
              boxShadow: "0 2px 24px #10101088",
              minWidth: 340,
              padding: "36px 25px",
              maxWidth: 400,
            }}
          >
            <h3 style={{ marginBottom: 14, color: "var(--kavia-orange)" }}>
              Delete Health Event
            </h3>
            <div style={{ marginBottom: 17 }}>
              Are you sure you want to delete this health event? This action cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <button className="btn btn-danger" style={{background: "#8B1A1A"}} onClick={confirmDelete}>
                Delete
              </button>
              <button
                className="btn"
                style={{
                  background: "transparent",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                }}
                onClick={cancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default HealthLog;

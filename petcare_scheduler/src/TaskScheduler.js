import React, { useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * TaskScheduler component for recurring care task management,
 * supports add/edit/delete/scheduling tasks for each pet.
 * Integrated with App-level pets/tasks state.
 *
 * Props:
 * - pets: array of pet objects
 * - setPets: update pets state (used for storing tasks per pet)
 */
import React, { useState, useEffect } from 'react';

/**
 * PUBLIC_INTERFACE
 * TaskScheduler component for recurring care task management,
 * supports add/edit/delete/scheduling tasks for each pet.
 * Integrated with App-level pets/tasks state.
 *
 * Props:
 * - pets: array of pet objects
 * - setPets: update pets state (used for storing tasks per pet)
 */
function TaskScheduler({ pets, setPets }) {
  // Modal/task editor state
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // If not null, editing existing task
  // Always keep selectedPetId pointing to a valid pet after pets list changes
  const [selectedPetId, setSelectedPetId] = useState(pets.length > 0 ? String(pets[0].id) : '');

  // When `pets` changes, update selectedPetId as appropriate
  useEffect(() => {
    if (pets.length === 0) {
      setSelectedPetId('');
    } else {
      // If current selectedPetId is still present, keep it; else default to first pet
      const petIds = pets.map(p => String(p.id));
      if (!petIds.includes(String(selectedPetId))) {
        setSelectedPetId(String(pets[0].id));
      }
    }
    // eslint-disable-next-line
  }, [pets]);

  // Helper: generate unique taskId
  function genTaskId() {
    return 'task-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  }

  // Resolve tasks for selected pet (empty array if not found)
  function getTasksForPet(petId) {
    const pet = pets.find((p) => String(p.id) === String(petId));
    return (pet && Array.isArray(pet.tasks)) ? pet.tasks : [];
  }

  // Add or edit task for current pet
  function handleSaveTask(task) {
    setPets((prevPets) =>
      prevPets.map((pet) => {
        if (pet.id !== selectedPetId) return pet;
        let updatedTasks = Array.isArray(pet.tasks) ? [...pet.tasks] : [];
        if (editingTask) {
          // Edit
          updatedTasks = updatedTasks.map((t) =>
            t.id === editingTask.id ? { ...task, id: editingTask.id } : t
          );
        } else {
          // Add new
          updatedTasks.push({ ...task, id: genTaskId() });
        }
        return { ...pet, tasks: updatedTasks };
      })
    );
    setEditingTask(null);
    setShowModal(false);
  }

  // Delete task for pet
  function handleDeleteTask(taskId) {
    setPets((prevPets) =>
      prevPets.map((pet) => {
        if (pet.id !== selectedPetId) return pet;
        const updatedTasks = (pet.tasks || []).filter((t) => t.id !== taskId);
        return { ...pet, tasks: updatedTasks };
      })
    );
  }

  // UI for task form (add or edit)
  function TaskForm({ onSave, initial }) {
    const [type, setType] = useState(initial?.type || 'Feeding');
    const [details, setDetails] = useState(initial?.details || '');
    const [frequency, setFrequency] = useState(initial?.frequency || 'Daily');
    const [time, setTime] = useState(initial?.time || '08:00');

    // PUBLIC_INTERFACE
    function handleSubmit(e) {
      e.preventDefault();
      onSave({ type, details, frequency, time });
    }
    return (
      <form className="modal-form" onSubmit={handleSubmit}>
        <label>
          Task Type
          <select value={type} onChange={e=>setType(e.target.value)} required>
            <option>Feeding</option>
            <option>Walking</option>
            <option>Medication</option>
            <option>Play</option>
            <option>Grooming</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          Details
          <input type="text" value={details} onChange={e=>setDetails(e.target.value)} placeholder="e.g. Chicken meal, 1 pill, etc." required />
        </label>
        <label>
          Frequency
          <select value={frequency} onChange={e=>setFrequency(e.target.value)} required>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Every Other Day</option>
            <option>Custom</option>
          </select>
        </label>
        <label>
          Scheduled Time
          <input type="time" value={time} onChange={e=>setTime(e.target.value)} required />
        </label>
        <div style={{ display:'flex', gap:12, marginTop:24 }}>
          <button type="submit" className="btn btn-large" style={{background:"var(--kavia-orange)"}}>
            Save Task
          </button>
          <button type="button" className="btn" onClick={()=>setShowModal(false)}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // Pet Selector Dropdown
  function PetSelector() {
    return (
      <select
        className="btn"
        style={{minWidth:120, fontWeight:600, marginBottom:16}}
        value={selectedPetId || ''}
        onChange={e=>setSelectedPetId(e.target.value)}
      >
        {pets.map((pet) => (
          <option key={pet.id} value={String(pet.id)}>
            {pet.name}
          </option>
        ))}
      </select>
    );
  }

  // Main view
  const tasks = selectedPetId ? getTasksForPet(selectedPetId) : [];
  const selectedPet = pets.find((p) => p.id === selectedPetId);

  return (
    <section>
      <h2 className="title" style={{ fontSize: '2rem'}}>Task Scheduler</h2>
      <div className="description" style={{marginBottom:24}}>
        Schedule feedings, walks, meds, and recurring care for each pet below.<br/>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
        <strong style={{fontWeight:500}}>Choose Pet:</strong>
        <PetSelector />
        {selectedPet && (
          <span style={{color:"var(--text-secondary)", fontSize:14}}>
            {selectedPet.species ? `(${selectedPet.species})` : ''}
          </span>
        )}
        <button
          className="btn"
          style={{marginLeft:'auto'}}
          onClick={() => { setEditingTask(null); setShowModal(true); }}
          disabled={!selectedPet}
        >
          + Add Task
        </button>
      </div>
      {!selectedPet && (
        <div style={{color:"var(--text-secondary)", marginTop:16}}>Please add/select a pet to start scheduling tasks.</div>
      )}
      {selectedPet && (
        <div>
          <table className="scheduler-table" style={{marginTop:12, width:'100%', background:'rgba(30,30,30,0.96)', borderRadius:7}}>
            <thead>
              <tr style={{background:'var(--kavia-dark)'}}>
                <th>Type</th>
                <th>Details</th>
                <th>Frequency</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} style={{color:"var(--text-secondary)", textAlign:"center"}}>No scheduled tasks for this pet.</td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.type}</td>
                  <td>{task.details}</td>
                  <td>{task.frequency}</td>
                  <td>{task.time}</td>
                  <td>
                    <button
                      className="btn"
                      title="Edit"
                      onClick={() => { setEditingTask(task); setShowModal(true); }}
                      style={{marginRight:8, fontSize:13, padding:'4px 10px'}}
                    >
                      ✎ Edit
                    </button>
                    <button
                      className="btn"
                      title="Delete"
                      onClick={() => { if(window.confirm('Delete this task?')) handleDeleteTask(task.id); }}
                      style={{fontSize:13, background:'#8B1A1A', color:'#fff', padding:'4px 10px'}}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for add/edit task */}
      {showModal && (
        <div
          className="modal-bg"
          style={{
            position: "fixed", left:0, top:0, width:"100vw", height:"100vh",
            background:"rgba(0,0,0,0.7)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center"
          }}
        >
          <div
            className="modal-content"
            style={{
              background:"var(--kavia-dark)",
              color:"#fff",
              borderRadius:10,
              boxShadow: "0 2px 24px #10101088",
              minWidth: 350,
              padding:"36px 25px"
            }}
          >
            <h3 style={{marginBottom:16}}>{editingTask ? "Edit Task" : "Add Task"}</h3>
            <TaskForm
              onSave={handleSaveTask}
              initial={editingTask}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default TaskScheduler;

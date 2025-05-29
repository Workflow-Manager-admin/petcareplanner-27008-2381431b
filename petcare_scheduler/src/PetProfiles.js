import React, { useState, useRef } from 'react';

/**
 * PUBLIC_INTERFACE
 * PetProfiles component: List/add/edit/delete pet profiles, with photo support.
 *
 * Props:
 *   pets: array of pet objects ({id, name, species, breed, age, photo})
 *   setPets: function to update pets list
 */
function PetProfiles({ pets, setPets }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({id: null, name: '', species: '', breed: '', age: '', photo: null});
  const [editMode, setEditMode] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [deleteId, setDeleteId] = useState(null); // id of pet pending deletion
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setFormData({id: null, name: '', species: '', breed: '', age: '', photo: null});
    setPreviewPhoto(null);
    setEditMode(false);
    setShowForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // PUBLIC_INTERFACE
  function handleAddNew() {
    setFormData({id: null, name: '', species: '', breed: '', age: '', photo: null});
    setPreviewPhoto(null);
    setEditMode(false);
    setShowForm(true);
  }

  // PUBLIC_INTERFACE
  function handleEdit(pet) {
    setFormData({...pet});
    setPreviewPhoto(pet.photo || null);
    setEditMode(true);
    setShowForm(true);
  }

  // PUBLIC_INTERFACE
  function handleDelete(id) {
    setDeleteId(id);
  }

  // PUBLIC_INTERFACE
  function confirmDelete() {
    setPets(pets.filter(p=>p.id!==deleteId));
    setDeleteId(null);
    // TODO: In a full app, remove associated tasks/logs here too.
  }

  function cancelDelete() {
    setDeleteId(null);
  }

  // PUBLIC_INTERFACE
  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) { setPreviewPhoto(null); setFormData(f => ({ ...f, photo: null })); return; }
    const reader = new window.FileReader();
    reader.onload = function(evt) {
      setPreviewPhoto(evt.target.result);
      setFormData(f => ({ ...f, photo: evt.target.result })); // Save as base64 for preview
    };
    reader.readAsDataURL(file);
  }

  // PUBLIC_INTERFACE
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  }

  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    // Validation (minimal): name/species required
    if (!formData.name.trim() || !formData.species.trim()) {
      alert('Name and species are required.');
      return;
    }

    if (editMode) {
      setPets(pets.map(p => (p.id === formData.id ? { ...formData } : p)));
    } else {
      const newPet = {
        ...formData,
        id: Date.now() + Math.random()
      };
      setPets([...pets, newPet]);
    }
    resetForm();
  }

  // Avatar fallback
  function avatarFromName(name) {
    const initial = name && name[0] ? name[0].toUpperCase() : '?';
    return (
      <div className="pet-avatar-fallback">
        {initial}
      </div>
    );
  }

  return (
    <section>
      <h2 className="title" style={{ fontSize: '2rem'}}>My Pets</h2>
      <div className="description">Manage or view details for your pets.</div>
      <div className="pet-profiles-list">
        {pets.length === 0 &&
          <div className="pet-empty-msg" style={{marginTop: 32, color: 'var(--text-secondary)'}}>
            No pets yet. Add your first pet!
          </div>
        }
        {pets.map(pet =>
          <div key={pet.id} className="pet-card">
            <div className="pet-avatar-container">
              {pet.photo
                ? <img className="pet-avatar-img" src={pet.photo} alt={`${pet.name} avatar`} />
                : avatarFromName(pet.name)
              }
            </div>
            <div className="pet-info">
              <div className="pet-name">{pet.name || <span className="pet-missing">Unnamed</span>}</div>
              <div className="pet-meta">
                {pet.species && <span className="pet-species">{pet.species}</span>}
                {pet.breed && <span className="pet-breed">({pet.breed})</span>}
                {pet.age && <span className="pet-age">Age: {pet.age}</span>}
              </div>
            </div>
            <div className="pet-actions">
              <button className="btn btn-small" aria-label={`Edit ${pet.name} profile`} onClick={()=>handleEdit(pet)}>✏️</button>
              <button className="btn btn-small btn-danger" aria-label={`Delete ${pet.name} profile`} onClick={()=>handleDelete(pet.id)}>🗑️</button>
            </div>
          </div>
        )}
      </div>
      <div style={{marginTop: 36}}>
        <button className="btn btn-large" onClick={handleAddNew}>+ Add Pet</button>
      </div>

      {/* Add/Edit Pet Modal/Form */}
      {showForm &&
        <div className="pet-modal-overlay">
          <div className="pet-modal">
            <h3>{editMode ? "Edit Pet" : "Add Pet"}</h3>
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="pet-form-row">
                <label>
                  Name<span style={{color: "var(--kavia-orange)"}}>*</span>
                  <input type="text" name="name" value={formData.name} autoFocus onChange={handleChange} maxLength={32} required />
                </label>
              </div>
              <div className="pet-form-row">
                <label>
                  Species<span style={{color: "var(--kavia-orange)"}}>*</span>
                  <input type="text" name="species" value={formData.species} onChange={handleChange} maxLength={24} required placeholder="e.g., Dog, Cat"/>
                </label>
              </div>
              <div className="pet-form-row">
                <label>
                  Breed
                  <input type="text" name="breed" value={formData.breed} onChange={handleChange} maxLength={36} />
                </label>
              </div>
              <div className="pet-form-row">
                <label>
                  Age
                  <input type="text" name="age" value={formData.age} onChange={handleChange} maxLength={12} placeholder="e.g., 4 years"/>
                </label>
              </div>
              <div className="pet-form-row">
                <label>
                  Photo
                  <input
                    type="file"
                    name="photo"
                    accept="image/png, image/jpeg, image/jpg"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                  />
                </label>
                <div>
                  {previewPhoto &&
                    <img
                      src={previewPhoto}
                      alt="Preview"
                      className="pet-photo-preview"
                    />
                  }
                  {!previewPhoto &&
                    <div className="pet-photo-preview place">
                      {avatarFromName(formData.name)}
                    </div>
                  }
                </div>
              </div>
              <div className="pet-form-actions">
                <button type="submit" className="btn btn-large" style={{marginRight: 16}}>{editMode ? "Save" : "Add"}</button>
                <button className="btn" type="button" onClick={resetForm} style={{background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)"}}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      }

      {/* Confirm Delete Modal */}
      {deleteId !== null && (
        <div className="pet-modal-overlay">
          <div className="pet-modal">
            <h3>Delete Pet</h3>
            <div>Are you sure you want to delete this pet's profile? This cannot be undone.</div>
            <div className="pet-form-actions">
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
              <button className="btn" style={{background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)"}} onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default PetProfiles;

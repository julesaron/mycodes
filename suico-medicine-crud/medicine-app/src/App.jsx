/*
 * Name     : Jannine Daeve Suico
 * Section  : INF241
 * Activity : Medicine Management (React JS + PHP + MySQL CRUD)
 * File     : medicine-app/src/App.jsx
 */
import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost/api/index.php'; // Adjust path based on your local web server setup

// Empty form - one field for each column of tblMedicine
const emptyForm = {
  brandName: '',
  genericName: '',
  dateManufactured: '',
  dateExpired: '',
  manufacturer: '',
  batchNumber: '',
};

// Today's date in YYYY-MM-DD format (same format as the MySQL DATE type)
const pad = (number) => String(number).padStart(2, '0');
const now = new Date();
const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

// Styles
const styles = {
  page: {
    maxWidth: '1300px', margin: '30px auto', padding: '0 20px',
    fontFamily: 'Arial, sans-serif', color: '#222',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px',
    marginBottom: '20px', borderRadius: '6px', background: '#15803d', color: '#fff',
  },
  form: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', padding: '20px',
    marginBottom: '24px', border: '1px solid #d4d4d4', borderRadius: '6px', background: '#f9fafb',
  },
  success: { padding: '10px 14px', marginBottom: '16px', borderRadius: '4px', color: '#14532d', background: '#dcfce7' },
  error: { padding: '10px 14px', marginBottom: '16px', borderRadius: '4px', color: '#991b1b', background: '#fee2e2' },
  label: { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', fontWeight: 'bold' },
  input: {
    padding: '9px 10px', fontSize: '14px', fontFamily: 'inherit',
    border: '1px solid #b5b5b5', borderRadius: '4px',
  },
  button: {
    padding: '9px 20px', fontSize: '14px', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer',
  },
  table: { width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' },
  editButton: {
    marginRight: '6px', padding: '5px 12px', fontSize: '13px', color: '#1d4ed8',
    background: '#fff', border: '1px solid #1d4ed8', borderRadius: '4px', cursor: 'pointer',
  },
  deleteButton: {
    padding: '5px 12px', fontSize: '13px', color: '#b91c1c',
    background: '#fff', border: '1px solid #b91c1c', borderRadius: '4px', cursor: 'pointer',
  },
};

function App() {
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null); // { type: 'success' or 'error', text: '...' }

  // Read: Fetch medicines from API
  const fetchMedicines = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (Array.isArray(data)) {
        setMedicines(data);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setMessage({ type: 'error', text: 'Cannot connect to the API. Make sure Apache and MySQL are running.' });
    }
  };

  // Fetch all medicines on component mount
  useEffect(() => {
    fetchMedicines();
  }, []);

  // Handle Form Inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create & Update Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(formData).some((value) => value.trim() === '')) {
      return setMessage({ type: 'error', text: 'Please complete all fields' });
    }
    if (formData.dateExpired <= formData.dateManufactured) {
      return setMessage({ type: 'error', text: 'Date Expired must be later than Date Manufactured' });
    }

    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId ? { medicineID: editingId, ...formData } : formData;

    try {
      const response = await fetch(API_URL, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setMessage({ type: 'success', text: result.message });
        fetchMedicines();
        resetForm();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setMessage({ type: 'error', text: 'Failed to save the medicine. Please try again.' });
    }
  };

  // Populate Form for Editing
  const handleEdit = (medicine) => {
    setEditingId(medicine.medicineID);
    setFormData({
      brandName: medicine.brandName,
      genericName: medicine.genericName,
      dateManufactured: medicine.dateManufactured,
      dateExpired: medicine.dateExpired,
      manufacturer: medicine.manufacturer,
      batchNumber: medicine.batchNumber,
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete Handler
  const handleDelete = async (medicine) => {
    const question = `Are you sure you want to delete ${medicine.brandName} (Batch ${medicine.batchNumber})?`;
    if (!window.confirm(question)) return;

    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineID: medicine.medicineID }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setMessage({ type: 'success', text: result.message });
        fetchMedicines();
        if (editingId === medicine.medicineID) resetForm();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Error deleting medicine:', error);
      setMessage({ type: 'error', text: 'Failed to delete the medicine. Please try again.' });
    }
  };

  // Reset Form State
  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h2 style={{ margin: 0 }}>Medicine Management</h2>
        <span>Database: dbPharma &nbsp;|&nbsp; Table: tblMedicine</span>
      </header>

      {/* Success / Error Message */}
      {message && (
        <div style={message.type === 'success' ? styles.success : styles.error}>{message.text}</div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3 style={{ gridColumn: '1 / -1', margin: 0 }}>
          {editingId ? `Edit Medicine (ID: ${editingId})` : 'Add New Medicine'}
        </h3>

        <label style={styles.label}>
          Medicine Brand Name
          <input
            type="text"
            name="brandName"
            placeholder="e.g. Biogesic"
            value={formData.brandName}
            onChange={handleChange}
            maxLength="100"
            required
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Generic Name
          <input
            type="text"
            name="genericName"
            placeholder="e.g. Paracetamol"
            value={formData.genericName}
            onChange={handleChange}
            maxLength="150"
            required
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Date Manufactured
          <input
            type="date"
            name="dateManufactured"
            value={formData.dateManufactured}
            onChange={handleChange}
            max={today}
            required
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Date Expired
          <input
            type="date"
            name="dateExpired"
            value={formData.dateExpired}
            onChange={handleChange}
            min={formData.dateManufactured}
            required
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Manufacturer
          <input
            type="text"
            name="manufacturer"
            placeholder="e.g. United Laboratories, Inc."
            value={formData.manufacturer}
            onChange={handleChange}
            maxLength="100"
            required
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Batch Number
          <input
            type="text"
            name="batchNumber"
            placeholder="e.g. BIO250314"
            value={formData.batchNumber}
            onChange={handleChange}
            maxLength="20"
            required
            style={styles.input}
          />
        </label>

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ ...styles.button, background: editingId ? '#1d4ed8' : '#15803d' }}>
            {editingId ? 'Update Medicine' : 'Add Medicine'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} style={{ ...styles.button, background: '#6b7280' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Medicines Table */}
      <h3 style={{ margin: '0 0 10px' }}>Medicine List ({medicines.length})</h3>
      <table border="1" cellPadding="10" cellSpacing="0" style={styles.table}>
        <thead>
          <tr style={{ background: '#f2f2f2' }}>
            <th>ID</th>
            <th>Brand Name</th>
            <th>Generic Name</th>
            <th>Date Manufactured</th>
            <th>Date Expired</th>
            <th>Manufacturer</th>
            <th>Batch Number</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {medicines.length > 0 ? (
            medicines.map((medicine) => {
              const isExpired = medicine.dateExpired < today;
              const isEditing = editingId === medicine.medicineID;
              return (
                <tr key={medicine.medicineID} style={{ background: isEditing ? '#fef9c3' : '#fff' }}>
                  <td>{medicine.medicineID}</td>
                  <td><strong>{medicine.brandName}</strong></td>
                  <td>{medicine.genericName}</td>
                  <td>{medicine.dateManufactured}</td>
                  <td>{medicine.dateExpired}</td>
                  <td>{medicine.manufacturer}</td>
                  <td>{medicine.batchNumber}</td>
                  <td style={{ color: isExpired ? '#b91c1c' : '#15803d', fontWeight: 'bold' }}>
                    {isExpired ? 'Expired' : 'Valid'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button onClick={() => handleEdit(medicine)} style={styles.editButton}>Edit</button>
                    <button onClick={() => handleDelete(medicine)} style={styles.deleteButton}>Delete</button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center' }}>No medicines found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#777' }}>
        Jannine Daeve Suico &nbsp;|&nbsp; INF241
      </p>
    </div>
  );
}

export default App;

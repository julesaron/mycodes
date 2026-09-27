import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost/api/index.php'; // Adjust path based on your local web server setup

// Empty form (the names match the columns of tblMedicine)
const emptyForm = {
  brand_name: '',
  generic_name: '',
  manufacturer: '',
  batch_number: '',
  date_manufactured: '',
  date_expired: '',
};

// Input fields of the form
const formFields = [
  { name: 'brand_name', label: 'Brand Name', type: 'text', placeholder: 'e.g. Biogesic', maxLength: 100 },
  { name: 'generic_name', label: 'Generic Name', type: 'text', placeholder: 'e.g. Paracetamol', maxLength: 100 },
  { name: 'manufacturer', label: 'Manufacturer', type: 'text', placeholder: 'e.g. Unilab, Inc.', maxLength: 150 },
  { name: 'batch_number', label: 'Batch Number', type: 'text', placeholder: 'e.g. BGS-2503-118', maxLength: 50 },
  { name: 'date_manufactured', label: 'Date Manufactured', type: 'date' },
  { name: 'date_expired', label: 'Date Expired', type: 'date' },
];

// Today's date in YYYY-MM-DD format
const getToday = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
};

// Converts 2025-03-12 to Mar 12, 2025
const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// Status of a medicine based on its expiry date
const getStatus = (dateExpired) => {
  const daysLeft = (new Date(dateExpired) - new Date(getToday())) / (1000 * 60 * 60 * 24);

  if (daysLeft <= 0) return { label: 'Expired', color: '#b91c1c', background: '#fee2e2' };
  if (daysLeft <= 90) return { label: 'Near Expiry', color: '#b45309', background: '#fef3c7' };
  return { label: 'Valid', color: '#15803d', background: '#dcfce7' };
};

function App() {
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      setMessage({ type: 'error', text: 'Cannot connect to the API. Make sure Apache and MySQL are running in XAMPP.' });
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

  // Check the form before sending it to the API
  const validateForm = () => {
    if (Object.values(formData).some((value) => value.trim() === '')) {
      return 'Please complete all fields.';
    }
    if (formData.date_manufactured > getToday()) {
      return 'Date manufactured cannot be a future date.';
    }
    if (formData.date_expired <= formData.date_manufactured) {
      return 'Date expired must be later than date manufactured.';
    }
    return null;
  };

  // Create & Update Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId ? { id: editingId, ...formData } : formData;

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
      setMessage({ type: 'error', text: 'Something went wrong while saving. Please try again.' });
    }
  };

  // Populate Form for Editing
  const handleEdit = (medicine) => {
    setEditingId(medicine.id);
    setFormData({
      brand_name: medicine.brand_name,
      generic_name: medicine.generic_name,
      manufacturer: medicine.manufacturer,
      batch_number: medicine.batch_number,
      date_manufactured: medicine.date_manufactured,
      date_expired: medicine.date_expired,
    });
    setMessage({ type: '', text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete Handler
  const handleDelete = async (medicine) => {
    if (!window.confirm(`Delete ${medicine.brand_name} (Batch No. ${medicine.batch_number})?`)) return;

    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: medicine.id }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setMessage({ type: 'success', text: result.message });
        if (editingId === medicine.id) resetForm();
        fetchMedicines();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Error deleting medicine:', error);
      setMessage({ type: 'error', text: 'Something went wrong while deleting. Please try again.' });
    }
  };

  // Reset Form State
  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logo}>Rx</div>
          <div>
            <h1 style={styles.title}>Pharmacy Medicine Management</h1>
            <p style={styles.subtitle}>React JS + PHP + MySQL CRUD &nbsp;|&nbsp; Database: dbPharma &nbsp;|&nbsp; Table: tblMedicine</p>
          </div>
        </div>
        <div style={styles.student}>
          <strong>Jules Aron P. Timbas</strong>
          <span>INF241</span>
        </div>
      </header>

      {/* Input Form */}
      <section style={styles.card}>
        <h2 style={styles.cardTitle}>{editingId ? `Edit Medicine (ID: ${editingId})` : 'Add New Medicine'}</h2>

        {message.text && (
          <div style={{ ...styles.alert, ...(message.type === 'success' ? styles.success : styles.error) }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {formFields.map((field) => (
            <label key={field.name} style={styles.label}>
              {field.label}
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                value={formData[field.name]}
                onChange={handleChange}
                style={styles.input}
              />
            </label>
          ))}

          <div style={styles.buttons}>
            <button type="submit" style={styles.primaryButton}>
              {editingId ? 'Update Medicine' : 'Add Medicine'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={styles.secondaryButton}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Medicines Table */}
      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Medicine List ({medicines.length})</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Brand Name</th>
                <th style={styles.th}>Generic Name</th>
                <th style={styles.th}>Manufacturer</th>
                <th style={styles.th}>Batch Number</th>
                <th style={styles.th}>Date Manufactured</th>
                <th style={styles.th}>Date Expired</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.length > 0 ? (
                medicines.map((medicine, index) => {
                  const status = getStatus(medicine.date_expired);
                  const rowStyle = editingId === medicine.id ? styles.editingRow : index % 2 === 1 ? styles.stripedRow : undefined;
                  return (
                    <tr key={medicine.id} style={rowStyle}>
                      <td style={styles.td}>{medicine.id}</td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{medicine.brand_name}</td>
                      <td style={{ ...styles.td, whiteSpace: 'normal' }}>{medicine.generic_name}</td>
                      <td style={styles.td}>{medicine.manufacturer}</td>
                      <td style={styles.td}>{medicine.batch_number}</td>
                      <td style={styles.td}>{formatDate(medicine.date_manufactured)}</td>
                      <td style={styles.td}>{formatDate(medicine.date_expired)}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, color: status.color, background: status.background }}>
                          <span style={{ ...styles.dot, background: status.color }} />
                          {status.label}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => handleEdit(medicine)} style={styles.editButton}>Edit</button>
                        <button onClick={() => handleDelete(medicine)} style={styles.deleteButton}>Delete</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={styles.empty}>No medicines found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// Inline styles
const styles = {
  page: { maxWidth: '1400px', margin: '0 auto', padding: '28px 24px', fontFamily: "'Segoe UI', Roboto, Arial, sans-serif", color: '#1e293b' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px',
    padding: '22px 28px', borderRadius: '16px', color: '#ffffff', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '16px' },
  logo: {
    width: '54px', height: '54px', borderRadius: '14px', background: '#ffffff', color: '#1d4ed8',
    fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: { margin: 0, fontSize: '26px', color: '#ffffff' },
  subtitle: { margin: '4px 0 0', fontSize: '14px', color: '#dbeafe' },
  student: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '14px',
    padding: '8px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.15)',
  },
  card: { background: '#ffffff', borderRadius: '16px', padding: '22px 26px', marginBottom: '24px', border: '1px solid #e2e8f0' },
  cardTitle: { margin: '0 0 18px', paddingLeft: '10px', fontSize: '18px', color: '#1e293b', borderLeft: '4px solid #2563eb' },
  alert: { padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', borderLeftWidth: '4px', borderLeftStyle: 'solid' },
  success: { background: '#f0fdf4', color: '#166534', borderLeftColor: '#22c55e' },
  error: { background: '#fef2f2', color: '#991b1b', borderLeftColor: '#ef4444' },
  form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' },
  label: { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' },
  input: { padding: '10px 12px', fontSize: '14px', fontFamily: 'inherit', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#f8fafc' },
  buttons: { gridColumn: '1 / -1', display: 'flex', gap: '10px' },
  primaryButton: {
    padding: '10px 22px', fontSize: '14px', fontWeight: 600, color: '#ffffff',
    background: '#2563eb', border: 'none', borderRadius: '10px', cursor: 'pointer',
  },
  secondaryButton: {
    padding: '10px 22px', fontSize: '14px', fontWeight: 600, color: '#334155',
    background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: { padding: '12px', textAlign: 'left', whiteSpace: 'nowrap', color: '#1e40af', background: '#eff6ff', borderBottom: '2px solid #bfdbfe' },
  td: { padding: '12px', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' },
  stripedRow: { background: '#f8fafc' },
  editingRow: { background: '#fefce8' },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
    borderRadius: '999px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
  },
  dot: { width: '7px', height: '7px', borderRadius: '50%' },
  editButton: {
    padding: '6px 14px', marginRight: '8px', color: '#1d4ed8', background: '#eff6ff',
    border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
  },
  deleteButton: {
    padding: '6px 14px', color: '#b91c1c', background: '#fef2f2',
    border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
  },
  empty: { padding: '24px', textAlign: 'center', color: '#64748b' },
};

export default App;

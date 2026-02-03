import React, { useState, useEffect } from 'react';
import cuentaService from '../services/cuentaService';
import './CuentasList.css';

const CuentasList = () => {
  const [cuentas, setCuentas] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState(null);
  const [formData, setFormData] = useState({
    socioId: '',
    numeroCuenta: '',
    saldo: 0,
    tipoCuenta: 'AHORRO'
  });

  useEffect(() => {
    loadCuentas();
  }, [page, search]);

  const loadCuentas = async () => {
    setLoading(true);
    try {
      const data = await cuentaService.getAll(page, 10, search);
      setCuentas(Array.isArray(data) ? data : []);
      // Si la API devuelve paginación, usar: setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error cargando cuentas:', error);
      alert('Error al cargar cuentas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCuenta) {
        await cuentaService.update(editingCuenta.id, formData);
        alert('Cuenta actualizada exitosamente');
      } else {
        await cuentaService.create(formData);
        alert('Cuenta creada exitosamente');
      }
      setShowForm(false);
      setEditingCuenta(null);
      resetForm();
      loadCuentas();
    } catch (error) {
      console.error('Error guardando cuenta:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (cuenta) => {
    setEditingCuenta(cuenta);
    setFormData({
      socioId: cuenta.socioId,
      numeroCuenta: cuenta.numeroCuenta,
      saldo: cuenta.saldo,
      tipoCuenta: cuenta.tipoCuenta
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta cuenta?')) {
      try {
        await cuentaService.delete(id);
        alert('Cuenta eliminada exitosamente');
        loadCuentas();
      } catch (error) {
        console.error('Error eliminando cuenta:', error);
        alert('Error al eliminar: ' + error.message);
      }
    }
  };

  const handleDeposito = async (id) => {
    const monto = parseFloat(prompt('Ingrese monto a depositar:'));
    if (monto && monto > 0) {
      try {
        await cuentaService.deposito(id, monto);
        alert('Depósito realizado exitosamente');
        loadCuentas();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const handleRetiro = async (id) => {
    const monto = parseFloat(prompt('Ingrese monto a retirar:'));
    if (monto && monto > 0) {
      try {
        await cuentaService.retiro(id, monto);
        alert('Retiro realizado exitosamente');
        loadCuentas();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      socioId: '',
      numeroCuenta: '',
      saldo: 0,
      tipoCuenta: 'AHORRO'
    });
  };

  const handleNewCuenta = () => {
    resetForm();
    setEditingCuenta(null);
    setShowForm(true);
  };

  return (
    <div className="cuentas-container">
      <h1>Gestión de Cuentas</h1>
      
      <div className="actions-bar">
        <input
          type="text"
          placeholder="Buscar por número de cuenta..."
          value={search}
          onChange={handleSearch}
          className="search-input"
        />
        <button onClick={handleNewCuenta} className="btn-primary">
          Nueva Cuenta
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingCuenta ? 'Editar Cuenta' : 'Nueva Cuenta'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ID del Socio (UUID):</label>
                <input
                  type="text"
                  value={formData.socioId}
                  onChange={(e) => setFormData({...formData, socioId: e.target.value})}
                  required
                  placeholder="123e4567-e89b-12d3-a456-426614174000"
                />
              </div>
              <div className="form-group">
                <label>Número de Cuenta:</label>
                <input
                  type="text"
                  value={formData.numeroCuenta}
                  onChange={(e) => setFormData({...formData, numeroCuenta: e.target.value})}
                  required
                  pattern="[0-9A-Z\-]+"
                  placeholder="001-123456"
                />
              </div>
              <div className="form-group">
                <label>Saldo Inicial:</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.saldo}
                  onChange={(e) => setFormData({...formData, saldo: parseFloat(e.target.value)})}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Tipo de Cuenta:</label>
                <select
                  value={formData.tipoCuenta}
                  onChange={(e) => setFormData({...formData, tipoCuenta: e.target.value})}
                >
                  <option value="AHORRO">Ahorro</option>
                  <option value="CORRIENTE">Corriente</option>
                  <option value="PLAZO_FIJO">Plazo Fijo</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Guardar</button>
                <button type="button" onClick={() => {setShowForm(false); setEditingCuenta(null);}} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <table className="cuentas-table">
            <thead>
              <tr>
                <th>Número de Cuenta</th>
                <th>Tipo</th>
                <th>Saldo</th>
                <th>Socio ID</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No hay cuentas registradas</td>
                </tr>
              ) : (
                cuentas.map((cuenta) => (
                  <tr key={cuenta.id}>
                    <td>{cuenta.numeroCuenta}</td>
                    <td>{cuenta.tipoCuenta}</td>
                    <td className="amount">${cuenta.saldo?.toFixed(2)}</td>
                    <td className="uuid">{cuenta.socioId?.substring(0, 8)}...</td>
                    <td>
                      <span className={`status ${cuenta.activo ? 'active' : 'inactive'}`}>
                        {cuenta.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="actions">
                      <button onClick={() => handleDeposito(cuenta.id)} className="btn-success" title="Depósito">
                        💰
                      </button>
                      <button onClick={() => handleRetiro(cuenta.id)} className="btn-warning" title="Retiro">
                        💸
                      </button>
                      <button onClick={() => handleEdit(cuenta)} className="btn-edit" title="Editar">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(cuenta.id)} className="btn-delete" title="Eliminar">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))} 
              disabled={page === 0}
              className="btn-secondary"
            >
              Anterior
            </button>
            <span className="page-info">Página {page + 1}</span>
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={cuentas.length < 10}
              className="btn-secondary"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CuentasList;

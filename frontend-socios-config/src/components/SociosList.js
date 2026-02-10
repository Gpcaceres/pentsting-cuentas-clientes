import React, { useState, useEffect } from 'react';
import socioService from '../services/socioService';
import './SociosList.css';

const SociosList = () => {
  const [socios, setSocios] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSocio, setEditingSocio] = useState(null);
  const [formData, setFormData] = useState({
    identificacion: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    tipoIdentificacion: 'CEDULA'
  });

  useEffect(() => {
    loadSocios();
  }, [page, search]);

  const loadSocios = async () => {
    setLoading(true);
    try {
      const data = await socioService.getAll(page, 10, search);
      setSocios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando socios:', error);
      alert('Error al cargar socios: ' + error.message);
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
      if (editingSocio) {
        await socioService.update(editingSocio.id, formData);
        alert('Socio actualizado exitosamente');
      } else {
        await socioService.create(formData);
        alert('Socio creado exitosamente');
      }
      setShowForm(false);
      setEditingSocio(null);
      resetForm();
      loadSocios();
    } catch (error) {
      console.error('Error guardando socio:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (socio) => {
    setEditingSocio(socio);
    setFormData({
      identificacion: socio.identificacion,
      nombres: socio.nombres,
      apellidos: socio.apellidos,
      email: socio.email || '',
      telefono: socio.telefono || '',
      direccion: socio.direccion || '',
      tipoIdentificacion: socio.tipoIdentificacion
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este socio?')) {
      try {
        await socioService.delete(id);
        alert('Socio eliminado exitosamente');
        loadSocios();
      } catch (error) {
        console.error('Error eliminando socio:', error);
        alert('Error al eliminar: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      identificacion: '',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      direccion: '',
      tipoIdentificacion: 'CEDULA'
    });
  };

  const handleNewSocio = () => {
    resetForm();
    setEditingSocio(null);
    setShowForm(true);
  };

  return (
    <div className="socios-container">
      <h1>Gestión de Socios</h1>
      
      <div className="actions-bar">
        <input
          type="text"
          placeholder="Buscar por nombre o identificación..."
          value={search}
          onChange={handleSearch}
          className="search-input"
        />
        <button onClick={handleNewSocio} className="btn-primary">
          Nuevo Socio
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingSocio ? 'Editar Socio' : 'Nuevo Socio'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Identificación:</label>
                  <select
                    value={formData.tipoIdentificacion}
                    onChange={(e) => setFormData({...formData, tipoIdentificacion: e.target.value})}
                  >
                    <option value="CEDULA">Cédula</option>
                    <option value="RUC">RUC</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Identificación:</label>
                  <input
                    type="text"
                    value={formData.identificacion}
                    onChange={(e) => setFormData({...formData, identificacion: e.target.value})}
                    required
                    pattern="[0-9]{10,13}"
                    placeholder="1712345678"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Nombres:</label>
                  <input
                    type="text"
                    value={formData.nombres}
                    onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                    required
                    pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+"
                    placeholder="Juan Carlos"
                  />
                </div>
                <div className="form-group">
                  <label>Apellidos:</label>
                  <input
                    type="text"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                    required
                    pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+"
                    placeholder="Pérez González"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="juan.perez@email.com"
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono:</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    pattern="[0-9]{9,10}"
                    placeholder="0987654321"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dirección:</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  placeholder="Av. Principal 123"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Guardar</button>
                <button type="button" onClick={() => {setShowForm(false); setEditingSocio(null);}} className="btn-secondary">
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
          <table className="socios-table">
            <thead>
              <tr>
                <th>Identificación</th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {socios.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">No hay socios registrados</td>
                </tr>
              ) : (
                socios.map((socio) => (
                  <tr key={socio.id}>
                    <td>{socio.identificacion}</td>
                    <td>{socio.nombres}</td>
                    <td>{socio.apellidos}</td>
                    <td>{socio.email || '-'}</td>
                    <td>{socio.telefono || '-'}</td>
                    <td>
                      <span className={`status ${socio.activo ? 'active' : 'inactive'}`}>
                        {socio.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="actions">
                      <button onClick={() => handleEdit(socio)} className="btn-edit" title="Editar">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(socio.id)} className="btn-delete" title="Eliminar">
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
              disabled={socios.length < 10}
              className="btn-secondary"
            >
              Siguiente
            </button>
          </div>

          <div className="summary">
            <h3>Resumen</h3>
            <p>Total de socios en esta página: <strong>{socios.length}</strong></p>
            <p>Socios activos: <strong>{socios.filter(s => s.activo).length}</strong></p>
            <p>Socios inactivos: <strong>{socios.filter(s => !s.activo).length}</strong></p>
          </div>
        </>
      )}
    </div>
  );
};

export default SociosList;

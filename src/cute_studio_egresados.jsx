import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Constants ───────────────────────────────────────────────────────────────

const ESTADOS = [
  { value: 'pendiente',  label: 'Pendiente',   icon: '⏳' },
  { value: 'en_proceso', label: 'En proceso',  icon: '🔧' },
  { value: 'listo',      label: 'Listo',        icon: '✅' },
  { value: 'entregado',  label: 'Entregado',    icon: '📦' },
]

const TALLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const EMPTY_PEDIDO = {
  nombre_alumno: '',
  curso: '',
  talle: 'M',
  color: '',
  cantidad: 1,
  diseno: '',
  imagen_url: '',
  estado: 'pendiente',
  notas: '',
  precio: '',
  seña: '',
  fecha_entrega: '',
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function fmtPeso(val) {
  if (!val && val !== 0) return '—'
  return `$${Number(val).toLocaleString('es-AR')}`
}

function fmtFecha(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function estadoInfo(estado) {
  return ESTADOS.find(e => e.value === estado) || ESTADOS[0]
}

// ─── Toast hook ──────────────────────────────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState([])

  const show = useCallback((msg, type = 'default') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  return { toasts, show }
}

// ─── Toast renderer ──────────────────────────────────────────────────────────

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
      ))}
    </div>
  )
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function EstadoBadge({ estado }) {
  const info = estadoInfo(estado)
  return (
    <span className={`badge badge-${estado}`}>
      {info.icon} {info.label}
    </span>
  )
}

// ─── Stats Cards ─────────────────────────────────────────────────────────────

function StatsBar({ pedidos }) {
  const counts = pedidos.reduce((acc, p) => {
    acc[p.estado] = (acc[p.estado] || 0) + 1
    return acc
  }, {})

  const totalCobrado = pedidos.reduce((s, p) => s + (Number(p.seña) || 0), 0)
  const totalPendCobro = pedidos
    .filter(p => p.estado !== 'entregado')
    .reduce((s, p) => s + (Number(p.precio) - Number(p.seña) || 0), 0)

  return (
    <div className="stats-grid">
      <div className="stat-card stat-total">
        <div className="stat-value">{pedidos.length}</div>
        <div className="stat-label">Total pedidos</div>
      </div>
      <div className="stat-card stat-pendiente">
        <div className="stat-value">{counts.pendiente || 0}</div>
        <div className="stat-label">Pendientes</div>
      </div>
      <div className="stat-card stat-proceso">
        <div className="stat-value">{counts.en_proceso || 0}</div>
        <div className="stat-label">En proceso</div>
      </div>
      <div className="stat-card stat-listo">
        <div className="stat-value">{counts.listo || 0}</div>
        <div className="stat-label">Listos</div>
      </div>
      <div className="stat-card stat-entregado">
        <div className="stat-value">{counts.entregado || 0}</div>
        <div className="stat-label">Entregados</div>
      </div>
      <div className="stat-card" style={{ borderLeft: '3px solid var(--pink-400)' }}>
        <div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--pink-600)' }}>
          {fmtPeso(totalCobrado)}
        </div>
        <div className="stat-label">Total cobrado</div>
      </div>
      <div className="stat-card" style={{ borderLeft: '3px solid var(--yellow-600)' }}>
        <div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--yellow-600)' }}>
          {fmtPeso(totalPendCobro)}
        </div>
        <div className="stat-label">Saldo pendiente</div>
      </div>
    </div>
  )
}

// ─── Upload area ─────────────────────────────────────────────────────────────

function ImageUpload({ currentUrl, onUpload }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || '')
  const [drag, setDrag] = useState(false)

  useEffect(() => { setPreview(currentUrl || '') }, [currentUrl])

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Error al subir imagen')
      const { url } = await res.json()
      onUpload(url)
    } catch (err) {
      alert(err.message)
      setPreview(currentUrl || '')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className={`upload-area ${drag ? 'drag-over' : ''}`}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
    >
      <input
        type="file"
        accept="image/*"
        onChange={e => handleFile(e.target.files[0])}
      />
      {preview
        ? <img src={preview} alt="preview" className="upload-preview" />
        : (
          <>
            <div className="upload-icon">🖼️</div>
            <p>Arrastrá o hacé clic para subir el diseño</p>
          </>
        )
      }
      {uploading && <p className="upload-progress">Subiendo imagen…</p>}
    </div>
  )
}

// ─── Pedido Modal ─────────────────────────────────────────────────────────────

function PedidoModal({ pedido, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_PEDIDO, ...pedido })
  const [saving, setSaving] = useState(false)

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))
  const setNum = field => e => setForm(f => ({ ...f, [field]: e.target.value.replace(/[^0-9.]/g, '') }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre_alumno.trim()) return
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{pedido?.id ? '✏️ Editar pedido' : '➕ Nuevo pedido'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              {/* Alumno */}
              <div className="form-group form-full">
                <label>Nombre del alumno *</label>
                <input
                  value={form.nombre_alumno}
                  onChange={set('nombre_alumno')}
                  placeholder="Ej: Valentina García"
                  required
                />
              </div>

              {/* Curso */}
              <div className="form-group">
                <label>Curso</label>
                <input
                  value={form.curso}
                  onChange={set('curso')}
                  placeholder="Ej: 5to A"
                />
              </div>

              {/* Talle */}
              <div className="form-group">
                <label>Talle</label>
                <select value={form.talle} onChange={set('talle')}>
                  {TALLES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* Color */}
              <div className="form-group">
                <label>Color</label>
                <input
                  value={form.color}
                  onChange={set('color')}
                  placeholder="Ej: Rosa pastel"
                />
              </div>

              {/* Cantidad */}
              <div className="form-group">
                <label>Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={form.cantidad}
                  onChange={set('cantidad')}
                />
              </div>

              {/* Diseño */}
              <div className="form-group form-full">
                <label>Diseño</label>
                <input
                  value={form.diseno}
                  onChange={set('diseno')}
                  placeholder="Ej: Chimuelos + nombre bordado"
                />
              </div>

              {/* Imagen */}
              <div className="form-group form-full">
                <label>Imagen del diseño</label>
                <ImageUpload
                  currentUrl={form.imagen_url}
                  onUpload={url => setForm(f => ({ ...f, imagen_url: url }))}
                />
              </div>

              {/* Estado */}
              <div className="form-group">
                <label>Estado</label>
                <select value={form.estado} onChange={set('estado')}>
                  {ESTADOS.map(e => (
                    <option key={e.value} value={e.value}>{e.icon} {e.label}</option>
                  ))}
                </select>
              </div>

              {/* Fecha entrega */}
              <div className="form-group">
                <label>Fecha de entrega</label>
                <input
                  type="date"
                  value={form.fecha_entrega || ''}
                  onChange={set('fecha_entrega')}
                />
              </div>

              {/* Precio */}
              <div className="form-group">
                <label>Precio total ($)</label>
                <input
                  value={form.precio}
                  onChange={setNum('precio')}
                  placeholder="0"
                />
              </div>

              {/* Seña */}
              <div className="form-group">
                <label>Seña cobrada ($)</label>
                <input
                  value={form.seña}
                  onChange={setNum('seña')}
                  placeholder="0"
                />
              </div>

              {/* Notas */}
              <div className="form-group form-full">
                <label>Notas</label>
                <textarea
                  value={form.notas}
                  onChange={set('notas')}
                  placeholder="Aclaraciones, pedidos especiales…"
                />
              </div>

            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando…' : '💾 Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal confirm-dialog">
        <div className="modal-header">
          <h2>⚠️ Confirmar</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
            <button className="btn btn-danger" onClick={onConfirm}>Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }) {
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <img src={src} alt="diseño" />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CuteStudioEgresados() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [modal, setModal] = useState(null)       // null | { pedido }
  const [confirm, setConfirm] = useState(null)   // null | { id, nombre }
  const [lightbox, setLightbox] = useState(null) // null | url
  const { toasts, show: toast } = useToast()

  // ── Fetch all ──
  const fetchPedidos = useCallback(async () => {
    try {
      const res = await fetch('/api/pedidos')
      if (!res.ok) throw new Error('Error al cargar pedidos')
      setPedidos(await res.json())
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchPedidos() }, [fetchPedidos])

  // ── Save (create or update) ──
  async function savePedido(form) {
    const isEdit = Boolean(form.id)
    const url = isEdit ? `/api/pedidos/${form.id}` : '/api/pedidos'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) throw new Error('Error al guardar el pedido')
    const saved = await res.json()
    if (isEdit) {
      setPedidos(ps => ps.map(p => p.id === saved.id ? saved : p))
      toast('Pedido actualizado ✓', 'success')
    } else {
      setPedidos(ps => [saved, ...ps])
      toast('Pedido creado ✓', 'success')
    }
  }

  // ── Delete ──
  async function deletePedido(id) {
    const res = await fetch(`/api/pedidos/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast('Error al eliminar', 'error'); return }
    setPedidos(ps => ps.filter(p => p.id !== id))
    toast('Pedido eliminado', 'success')
    setConfirm(null)
  }

  // ── Quick status change ──
  async function changeEstado(pedido, newEstado) {
    const updated = { ...pedido, estado: newEstado }
    const res = await fetch(`/api/pedidos/${pedido.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    if (!res.ok) { toast('Error al actualizar estado', 'error'); return }
    const saved = await res.json()
    setPedidos(ps => ps.map(p => p.id === saved.id ? saved : p))
    toast(`Estado actualizado a "${estadoInfo(newEstado).label}"`, 'success')
  }

  // ── Filtered list ──
  const filtered = pedidos.filter(p => {
    const matchSearch =
      !search ||
      p.nombre_alumno?.toLowerCase().includes(search.toLowerCase()) ||
      p.curso?.toLowerCase().includes(search.toLowerCase()) ||
      p.diseno?.toLowerCase().includes(search.toLowerCase())
    const matchEstado = filterEstado === 'todos' || p.estado === filterEstado
    return matchSearch && matchEstado
  })

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <img src="/img/logo1.png" alt="Cute Studio" className="header-logo" />
          <div>
            <div className="header-title">Cute Studio</div>
            <div className="header-subtitle">Gestión de pedidos — Egresados</div>
          </div>
        </div>
      </header>

      <div className="app-wrapper">
        {/* Stats */}
        <StatsBar pedidos={pedidos} />

        {/* Controls */}
        <div className="controls-bar">
          <input
            className="search-input"
            placeholder="Buscar por alumno, curso o diseño…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="filter-select"
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            {ESTADOS.map(e => (
              <option key={e.value} value={e.value}>{e.icon} {e.label}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => setModal({ pedido: null })}>
            ➕ Nuevo pedido
          </button>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <div className="table-scroll">
            {loading ? (
              <div className="empty-state">
                <div className="empty-icon">⏳</div>
                <p>Cargando pedidos…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎓</div>
                <p>{search || filterEstado !== 'todos' ? 'No hay pedidos que coincidan.' : 'Todavía no hay pedidos. ¡Agregá el primero!'}</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Alumno</th>
                    <th>Curso</th>
                    <th>Diseño</th>
                    <th>Talle</th>
                    <th>Color</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                    <th>Seña</th>
                    <th>Estado</th>
                    <th>Entrega</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td>
                        {p.imagen_url
                          ? <img
                              src={p.imagen_url}
                              alt="diseño"
                              className="design-thumb"
                              onClick={() => setLightbox(p.imagen_url)}
                            />
                          : <div className="no-image">🖼️</div>
                        }
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.nombre_alumno}</td>
                      <td>{p.curso || '—'}</td>
                      <td>{p.diseno || '—'}</td>
                      <td>{p.talle}</td>
                      <td>{p.color || '—'}</td>
                      <td>{p.cantidad}</td>
                      <td>{fmtPeso(p.precio)}</td>
                      <td>{fmtPeso(p.seña)}</td>
                      <td>
                        <select
                          value={p.estado}
                          onChange={e => changeEstado(p, e.target.value)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontSize: '0.8rem',
                            padding: 0,
                          }}
                        >
                          {ESTADOS.map(e => (
                            <option key={e.value} value={e.value}>{e.icon} {e.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>{fmtFecha(p.fecha_entrega)}</td>
                      <td>
                        <div className="td-actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setModal({ pedido: p })}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setConfirm({ id: p.id, nombre: p.nombre_alumno })}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pagination hint */}
        {filtered.length > 0 && (
          <p style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.5rem' }}>
            Mostrando {filtered.length} de {pedidos.length} pedidos
          </p>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <PedidoModal
          pedido={modal.pedido}
          onSave={savePedido}
          onClose={() => setModal(null)}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message={`¿Eliminar el pedido de ${confirm.nombre}? Esta acción no se puede deshacer.`}
          onConfirm={() => deletePedido(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {lightbox && (
        <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}

      <ToastContainer toasts={toasts} />
    </>
  )
}

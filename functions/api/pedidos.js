/**
 * GET  /api/pedidos  — lista todos los pedidos
 * POST /api/pedidos  — crea un pedido nuevo
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS })
}

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT * FROM pedidos ORDER BY fecha_pedido DESC`
    ).all()
    return Response.json(results, { headers: CORS })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: CORS })
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json()

    if (!data.nombre_alumno?.trim()) {
      return Response.json(
        { error: 'nombre_alumno es requerido' },
        { status: 400, headers: CORS }
      )
    }

    const stmt = env.DB.prepare(`
      INSERT INTO pedidos
        (nombre_alumno, curso, talle, color, cantidad, diseno, imagen_url,
         estado, notas, precio, seña, fecha_entrega)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = await stmt.bind(
      data.nombre_alumno.trim(),
      data.curso        || null,
      data.talle        || 'M',
      data.color        || null,
      Number(data.cantidad) || 1,
      data.diseno       || null,
      data.imagen_url   || null,
      data.estado       || 'pendiente',
      data.notas        || null,
      data.precio  !== '' ? Number(data.precio)  : null,
      data.seña    !== '' ? Number(data.seña)    : null,
      data.fecha_entrega || null,
    ).run()

    const { results } = await env.DB.prepare(
      `SELECT * FROM pedidos WHERE id = ?`
    ).bind(result.meta.last_row_id).all()

    return Response.json(results[0], { status: 201, headers: CORS })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: CORS })
  }
}

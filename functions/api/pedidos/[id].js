/**
 * GET    /api/pedidos/:id  — obtiene un pedido
 * PUT    /api/pedidos/:id  — actualiza un pedido
 * DELETE /api/pedidos/:id  — elimina un pedido
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS })
}

export async function onRequestGet({ env, params }) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT * FROM pedidos WHERE id = ?`
    ).bind(params.id).all()

    if (!results.length) {
      return Response.json({ error: 'Pedido no encontrado' }, { status: 404, headers: CORS })
    }
    return Response.json(results[0], { headers: CORS })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: CORS })
  }
}

export async function onRequestPut({ request, env, params }) {
  try {
    const data = await request.json()

    if (!data.nombre_alumno?.trim()) {
      return Response.json(
        { error: 'nombre_alumno es requerido' },
        { status: 400, headers: CORS }
      )
    }

    await env.DB.prepare(`
      UPDATE pedidos SET
        nombre_alumno = ?,
        curso         = ?,
        talle         = ?,
        color         = ?,
        cantidad      = ?,
        diseno        = ?,
        imagen_url    = ?,
        estado        = ?,
        notas         = ?,
        precio        = ?,
        seña          = ?,
        fecha_entrega = ?
      WHERE id = ?
    `).bind(
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
      params.id,
    ).run()

    const { results } = await env.DB.prepare(
      `SELECT * FROM pedidos WHERE id = ?`
    ).bind(params.id).all()

    if (!results.length) {
      return Response.json({ error: 'Pedido no encontrado' }, { status: 404, headers: CORS })
    }
    return Response.json(results[0], { headers: CORS })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: CORS })
  }
}

export async function onRequestDelete({ env, params }) {
  try {
    // Si el pedido tiene imagen, la eliminamos del bucket R2
    const { results } = await env.DB.prepare(
      `SELECT imagen_url FROM pedidos WHERE id = ?`
    ).bind(params.id).all()

    if (results.length && results[0].imagen_url) {
      try {
        // La URL tiene formato /api/designs/<key> — extraemos la key
        const key = results[0].imagen_url.split('/api/designs/')[1]
        if (key) await env.DESIGNS.delete(key)
      } catch {
        // Si falla el borrado en R2, continuamos igual
      }
    }

    await env.DB.prepare(
      `DELETE FROM pedidos WHERE id = ?`
    ).bind(params.id).run()

    return Response.json({ success: true }, { headers: CORS })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: CORS })
  }
}

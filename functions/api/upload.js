/**
 * POST /api/upload — sube una imagen a R2 y devuelve la URL pública
 *
 * Espera un FormData con el campo "file" (imagen).
 * La URL devuelta tiene formato /api/designs/<key> que es servida
 * por la función functions/api/designs/[key].js
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function onRequestOptions() {
  return new Response(null, { headers: CORS })
}

export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return Response.json(
        { error: 'No se recibió ningún archivo' },
        { status: 400, headers: CORS }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: `Tipo de archivo no permitido: ${file.type}` },
        { status: 400, headers: CORS }
      )
    }

    const buffer = await file.arrayBuffer()
    if (buffer.byteLength > MAX_SIZE) {
      return Response.json(
        { error: 'El archivo supera el límite de 5 MB' },
        { status: 400, headers: CORS }
      )
    }

    // Generamos un nombre único: timestamp + nombre original sanitizado
    const ext = file.name.split('.').pop().toLowerCase() || 'jpg'
    const safeName = file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40)
    const key = `${Date.now()}_${safeName}.${ext}`

    await env.DESIGNS.put(key, buffer, {
      httpMetadata: { contentType: file.type },
    })

    return Response.json(
      { url: `/api/designs/${key}` },
      { status: 201, headers: CORS }
    )
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: CORS })
  }
}

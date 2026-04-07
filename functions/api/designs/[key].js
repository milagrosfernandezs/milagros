/**
 * GET /api/designs/:key — sirve una imagen desde el bucket R2
 */

export async function onRequestGet({ env, params }) {
  try {
    const object = await env.DESIGNS.get(params.key)

    if (!object) {
      return new Response('Imagen no encontrada', { status: 404 })
    }

    const headers = new Headers()
    headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg')
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('ETag', object.httpEtag)

    return new Response(object.body, { headers })
  } catch (err) {
    return new Response(err.message, { status: 500 })
  }
}

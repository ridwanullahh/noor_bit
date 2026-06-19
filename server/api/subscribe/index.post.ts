/**
 * BismiLlah Ar-Rahman Ar-Roheem
 * POST /api/subscribe — Handle email subscriptions
 */
export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  const body = await readBody(event)

  if (!body?.email || typeof body.email !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  const email = body.email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address' })
  }

  const subscription = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    email,
    name: body.name?.trim() || '',
    quran: body.quran !== false,
    hadith: body.hadith !== false,
    frequency: body.frequency || 'daily',
    collections: Array.isArray(body.collections) ? body.collections : ['nawawi', 'muslim'],
    createdAt: new Date().toISOString(),
    confirmed: false,
  }

  const storage = useStorage('subscriptions')
  const existing = await storage.getItem<string[]>(`emails`) || []

  if (existing.includes(email)) {
    return { success: true, message: 'Already subscribed', existing: true }
  }

  existing.push(email)
  await storage.setItem(`emails`, existing)
  await storage.setItem(`sub:${subscription.id}`, subscription)

  return { success: true, message: 'Subscribed successfully', id: subscription.id }
})

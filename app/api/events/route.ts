// ... inside POST method:
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const allowed = await rateLimit(`events:${ip}`, 60, 60_000);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
// ... rest of function
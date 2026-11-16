// ... inside POST method after auth check:
  const allowed = await rateLimit(`fb_publish:${session.sub}`, 5, 60_000);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
// ... rest of function
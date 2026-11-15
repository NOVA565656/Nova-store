// ... imports ...
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    await requireRoleForVerifiedSession(session, 'seller');
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.kind }, { status: e.status });
    throw e;
  }

  const allowed = await rateLimit(`create_listing:${session.sub}`, 5, 60_000);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  
  // ... rest of the function remains the same
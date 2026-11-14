export function logAuthFail(kind: string, route: string): void {
  console.error(JSON.stringify({
    event: 'auth_fail',
    kind,
    route,
    ts: new Date().toISOString(),
  }));
}
import Header from '@/components/Header';

export const metadata = { title: 'Marketplace' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        {/* Header is async (reads session); React 18 supports async server components */}
        {/* @ts-expect-error Async Server Component */}
        <Header />
        {children}
      </body>
    </html>
  );
}
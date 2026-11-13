import Header from '@/components/Header';

export const metadata = { title: 'Marketplace' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <Header />
        {children}
      </body>
    </html>
  );
}
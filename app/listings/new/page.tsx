'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewListing() {
  const router = useRouter();
  const [type, setType] = useState<'product' | 'skill' | null>(null);
  const [form, setForm] = useState({ title: '', description: '', proof_url: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...form }),
    });
    if (res.ok) {
      router.push('/dashboard');
    } else {
      alert('Failed to create listing');
    }
  };

  if (!type) {
    return (
      <div style={{ padding: '2rem', display: 'flex', gap: '1rem' }}>
        <button onClick={() => setType('product')} style={{ padding: '2rem', borderRadius: 12, border: '1px solid #ccc' }}>I'm listing a Product</button>
        <button onClick={() => setType('skill')} style={{ padding: '2rem', borderRadius: 12, border: '1px solid #ccc' }}>I'm offering a Skill</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
      <h1>New {type}</h1>
      <input placeholder="Title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
      <textarea placeholder="Description" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      {type === 'skill' && (
        <input placeholder="Proof URL (GitHub, Portfolio)" required value={form.proof_url} onChange={e => setForm({ ...form, proof_url: e.target.value })} />
      )}
      <button type="submit">Submit for AI Review</button>
    </form>
  );
}
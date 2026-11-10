import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle'|'saving'|'success'|'error'>('idle');
  return <section className="border-y border-border bg-secondary py-12"><div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-6 px-6 md:flex-row md:items-center md:px-8"><div><p className="text-xs text-primary">A LITTLE INSPIRATION, IN YOUR INBOX</p><h2 className="mt-2 font-display text-3xl">Stay close to what matters.</h2></div><form className="w-full md:max-w-md" onSubmit={async e => { e.preventDefault(); setState('saving'); const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim().toLowerCase() }); setState(!error || error.code === '23505' ? 'success' : 'error'); }}><div className="flex gap-2"><Input type="email" required maxLength={255} aria-label="Newsletter email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} disabled={state==='success'} /><Button type="submit" size="icon" aria-label="Subscribe" disabled={state==='saving'||state==='success'}>{state==='success'?<Check/>:<ArrowRight/>}</Button></div>{state==='success'&&<p role="status" className="mt-2 text-sm text-primary">Thank you — you’re subscribed.</p>}{state==='error'&&<p role="alert" className="mt-2 text-sm text-destructive">Could not subscribe. Please try again.</p>}</form></div></section>;
}
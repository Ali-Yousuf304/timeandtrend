import { useEffect, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { usePromoMessages } from '@/hooks/use-promo-messages';
export function PromoBar(){const {pathname}=useLocation();const {messages}=usePromoMessages(true);const [announcements,setAnnouncements]=useState<string[]>([]);useEffect(()=>{supabase.from('banners').select('title').eq('active',true).eq('placement','announcement').order('sort_order').then(({data})=>setAnnouncements((data??[]).map(b=>b.title)));},[]);if(pathname.startsWith('/admin'))return null;const lines=announcements.length?announcements:messages.map(m=>m.message);if(!lines.length)return null;return <div className="bg-ink px-4 py-2 text-center text-[11px] text-ink-foreground">{lines.join(' | ')}</div>;}

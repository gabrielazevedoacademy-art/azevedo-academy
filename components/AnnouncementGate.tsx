'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { publicImage } from '@/lib/admin/storage';
import { createClient } from '@/lib/supabase/client';
import AnnouncementModal, { type AnnouncementView } from './AnnouncementModal';

// Onde o banner não aparece: painel, telas de login/conta e no meio de uma aula
const SKIP = /^\/(admin|entrar|cadastro|recuperar-senha|nova-senha|verificar|seguranca|auth|conta-excluida|privacidade|termos)(\/|$)|^\/cursos\/[^/]+\/aula\//;
const SESSION_KEY = 'aa-banner-fechado';

function closedThisSession(id: string) {
  try {
    return sessionStorage.getItem(SESSION_KEY) === id;
  } catch {
    return false;
  }
}

// Mostra a novidade do momento para quem está logado, uma vez por visita (ou nunca mais, se a pessoa marcar)
export default function AnnouncementGate() {
  const path = usePathname();
  const [item, setItem] = useState<(AnnouncementView & { id: string }) | null>(null);

  useEffect(() => {
    if (SKIP.test(path)) return;
    const supabase = createClient();
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      supabase.rpc('my_announcement').then(({ data: rows }) => {
        const a = (rows ?? [])[0];
        if (!alive || !a || closedThisSession(a.id)) return;
        setItem({
          id: a.id,
          title: a.title,
          body: a.body,
          imageUrl: publicImage(a.image_path),
          ctaLabel: a.cta_label,
          ctaUrl: a.cta_url
        });
      });
    });
    return () => {
      alive = false;
    };
  }, [path]);

  if (!item) return null;

  return (
    <AnnouncementModal
      a={item}
      onClose={(dontShow) => {
        try {
          sessionStorage.setItem(SESSION_KEY, item.id);
        } catch {}
        if (dontShow) createClient().from('announcement_dismissals').insert({ announcement_id: item.id }).then(() => {});
        setItem(null);
      }}
    />
  );
}

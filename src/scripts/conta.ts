// Menu da conta: abrir/fechar, alternar Entrar/Criar conta e autenticar via Supabase (quando configurado).
const URL_SUPA = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const CHAVE_SUPA = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

async function cliente() {
  if (!URL_SUPA || !CHAVE_SUPA) return null;
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(URL_SUPA, CHAVE_SUPA);
}

export function iniciarConta() {
  const raiz = document.querySelector<HTMLElement>('[data-conta]');
  if (!raiz) return;
  const botao = raiz.querySelector<HTMLButtonElement>('[data-conta-btn]')!;
  const painel = raiz.querySelector<HTMLElement>('[data-conta-painel]')!;
  const abas = raiz.querySelectorAll<HTMLButtonElement>('[data-aba]');
  const form = raiz.querySelector<HTMLFormElement>('[data-conta-form]')!;
  const msg = raiz.querySelector<HTMLElement>('[data-conta-msg]')!;
  const enviar = raiz.querySelector<HTMLButtonElement>('[data-conta-enviar]')!;
  const logado = raiz.querySelector<HTMLElement>('[data-conta-logado]')!;
  const deslogado = raiz.querySelector<HTMLElement>('[data-conta-deslogado]')!;
  let modo: 'entrar' | 'criar' = 'entrar';

  const abrir = (sim: boolean) => {
    botao.setAttribute('aria-expanded', String(sim));
    painel.classList.toggle('is-open', sim);
    if (sim) setTimeout(() => painel.querySelector<HTMLInputElement>('input:not([hidden])')?.focus(), 180);
  };
  botao.addEventListener('click', () => abrir(botao.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('click', (e) => { if (!raiz.contains(e.target as Node)) abrir(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { abrir(false); botao.focus(); } });
  document.querySelectorAll('[data-abrir-conta]').forEach((el) => el.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation(); trocar((el as HTMLElement).dataset.abrirConta as 'entrar' | 'criar'); abrir(true);
  }));

  function trocar(novo: 'entrar' | 'criar') {
    modo = novo;
    raiz!.dataset.modo = novo;
    abas.forEach((a) => a.setAttribute('aria-selected', String(a.dataset.aba === novo)));
    form.querySelectorAll<HTMLElement>('[data-so-criar]').forEach((el) => {
      el.hidden = novo !== 'criar';
      el.querySelector('input')?.toggleAttribute('required', novo === 'criar');
    });
    (form.querySelector('[name=senha]') as HTMLInputElement).autocomplete = novo === 'criar' ? 'new-password' : 'current-password';
    enviar.textContent = novo === 'criar' ? 'Criar conta' : 'Entrar';
    msg.textContent = ''; msg.className = 'conta__msg';
  }
  abas.forEach((a) => a.addEventListener('click', () => trocar(a.dataset.aba as 'entrar' | 'criar')));

  function mostrarUsuario(email: string | null, nome?: string) {
    logado.hidden = !email; deslogado.hidden = !!email;
    botao.querySelector('[data-conta-rotulo]')!.textContent = email ? (nome || email).split(/[ @]/)[0] : 'Entrar';
    botao.classList.toggle('is-logado', !!email);
    if (email) {
      raiz!.querySelector('[data-conta-email]')!.textContent = email;
      raiz!.querySelector('[data-conta-nome]')!.textContent = nome || 'Sua conta';
      raiz!.querySelector('[data-conta-inicial]')!.textContent = (nome || email)[0].toUpperCase();
    }
  }

  const aviso = (texto: string, tipo: 'erro' | 'ok' | 'info' = 'erro') => { msg.textContent = texto; msg.className = `conta__msg is-${tipo}`; };

  cliente().then(async (supa) => {
    if (!supa) return;
    const { data } = await supa.auth.getSession();
    const u = data.session?.user;
    if (u) mostrarUsuario(u.email ?? null, u.user_metadata?.nome);
    supa.auth.onAuthStateChange((_e, s) => mostrarUsuario(s?.user.email ?? null, s?.user.user_metadata?.nome));
    raiz.querySelector('[data-conta-sair]')?.addEventListener('click', () => supa.auth.signOut());
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = new FormData(form);
    const email = String(dados.get('email')).trim();
    const senha = String(dados.get('senha'));
    const nome = String(dados.get('nome') || '').trim();
    const supa = await cliente();
    if (!supa) { aviso('As contas estão quase prontas. Volte em breve para entrar.', 'info'); return; }
    enviar.disabled = true;
    try {
      if (modo === 'criar') {
        const { error, data } = await supa.auth.signUp({ email, password: senha, options: { data: { nome } } });
        if (error) throw error;
        if (!data.session) aviso('Conta criada. Confirme pelo link que enviamos para o seu e-mail.', 'ok');
        else abrir(false);
      } else {
        const { error } = await supa.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        abrir(false);
      }
    } catch (err: any) {
      const m = String(err?.message || '');
      aviso(
        /invalid login/i.test(m) ? 'E-mail ou senha incorretos.' :
        /registered/i.test(m) ? 'Já existe uma conta com esse e-mail. Use Entrar.' :
        /password/i.test(m) ? 'A senha precisa ter pelo menos 6 caracteres.' :
        'Não foi possível concluir agora. Tente de novo em instantes.'
      );
    } finally {
      enviar.disabled = false;
    }
  });
}

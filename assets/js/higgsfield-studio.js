(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const state = { model: null, history: readHistory() };
  const labels = { processing: 'Processando', completed: 'Concluído', failed: 'Falhou', canceled: 'Cancelado', cancelled: 'Cancelado', moderated: 'Bloqueado pela moderação', blocked: 'Bloqueado pela moderação', nsfw: 'Bloqueado pela moderação' };

  async function api(path, options = {}) {
    const response = await fetch(`/api/higgsfield/${path}`, { credentials: 'same-origin', ...options, headers: { ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Falha na requisição (${response.status}).`);
    return data;
  }
  async function boot() {
    const { authenticated } = await api('session');
    $('login-view').hidden = authenticated; $('app-view').hidden = !authenticated;
    if (authenticated) await loadModel();
    renderHistory();
  }
  $('login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); $('login-error').textContent = '';
    try { await api('login', { method: 'POST', body: JSON.stringify({ password: $('password').value }) }); $('password').value = ''; await boot(); }
    catch (error) { $('login-error').textContent = error.message; }
  });
  $('logout').addEventListener('click', async () => { await api('logout', { method: 'POST' }); await boot(); });

  async function loadModel() {
    const data = await api('catalog');
    state.model = data.models[0];
    $('model').value = state.model.name;
    $('workflow').value = state.model.workflowLabel;
    const params = $('parameters'); params.replaceChildren();
    const heading = document.createElement('h3'); heading.textContent = 'Parâmetros'; params.append(heading);
    Object.entries(state.model.fields).forEach(([name, rule]) => {
      const label = document.createElement('label'); label.htmlFor = `param-${name}`; label.textContent = rule.label;
      const input = document.createElement('select');
      rule.values.forEach((value) => input.add(new Option(String(value), String(value))));
      input.value = String(rule.default); input.id = `param-${name}`; input.dataset.parameter = name;
      params.append(label, input);
    });
  }
  $('prompt').addEventListener('input', () => { $('prompt-count').textContent = `${$('prompt').value.length} caracteres`; });
  $('clear-prompt').addEventListener('click', () => { $('prompt').value = ''; $('prompt').dispatchEvent(new Event('input')); $('prompt').focus(); });

  $('generation-form').addEventListener('submit', async (event) => {
    event.preventDefault(); setBusy(true); notice(''); updateStatus('processing');
    try {
      const parameters = {};
      document.querySelectorAll('[data-parameter]').forEach((input) => { parameters[input.dataset.parameter] = input.dataset.parameter === 'duration' ? Number(input.value) : input.value; });
      const data = await api('generate', { method: 'POST', body: JSON.stringify({ modelId: state.model.id, workflow: state.model.workflow, prompt: $('prompt').value, parameters }) });
      saveJob(data); renderResult(data); updateStatus(data.status);
      if (['canceled', 'cancelled', 'moderated', 'blocked', 'nsfw'].includes(data.status)) notice(labels[data.status], true);
    } catch (error) { notice(error.message, true); updateStatus('failed'); }
    finally { setBusy(false); }
  });
  function setBusy(value) { $('generate').disabled = value; $('generate').textContent = value ? 'Gerando…' : 'Gerar'; }
  function updateStatus(status) { const known = status || 'failed'; $('status').textContent = labels[known] || known; $('status-dot').className = `status-dot ${known === 'completed' ? 'done' : known === 'processing' ? 'active' : ''}`; }
  function renderResult(job) {
    const host = $('result'); host.replaceChildren();
    (job.results || []).forEach((item) => { const video = document.createElement('video'); video.src = item.url; video.controls = true; const link = document.createElement('a'); link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.download = ''; link.textContent = 'Abrir / baixar resultado'; host.append(video, link); });
    if (job.error) { const error = document.createElement('p'); error.className = 'error'; error.textContent = job.error; host.append(error); }
  }
  function notice(message, error = false) { $('notice').hidden = !message; $('notice').textContent = message; $('notice').classList.toggle('error', error); }
  function readHistory() { try { const value = JSON.parse(localStorage.getItem('hf-studio-history') || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } }
  function saveJob(job) { const safe = { requestId: job.requestId, status: job.status, results: job.results || [], generation: job.generation }; state.history = [safe, ...state.history.filter((item) => item.requestId !== safe.requestId)].slice(0, 20); localStorage.setItem('hf-studio-history', JSON.stringify(state.history)); renderHistory(); }
  function renderHistory() {
    const host = $('history'); host.replaceChildren();
    if (!state.history.length) { const empty = document.createElement('p'); empty.className = 'muted'; empty.textContent = 'Nenhuma geração ainda.'; host.append(empty); return; }
    state.history.forEach((item) => { const card = document.createElement('article'); card.className = 'history-item'; const title = document.createElement('strong'); title.textContent = 'Seedance 2.5'; const date = document.createElement('p'); date.className = 'muted small'; date.textContent = item.generation?.createdAt ? new Date(item.generation.createdAt).toLocaleString('pt-BR') : ''; const status = document.createElement('p'); status.textContent = `Status: ${labels[item.status] || item.status || '—'}`; const details = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = 'Prompt e parâmetros'; const prompt = document.createElement('p'); prompt.textContent = item.generation?.prompt || ''; const pre = document.createElement('pre'); pre.textContent = JSON.stringify(item.generation?.parameters || {}, null, 2); details.append(summary, prompt, pre); card.append(title, date, status, details); (item.results || []).forEach((result) => { const link = document.createElement('a'); link.href = result.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Ver resultado'; card.append(link); }); host.append(card); });
  }
  $('clear-history').addEventListener('click', () => { state.history = []; localStorage.removeItem('hf-studio-history'); renderHistory(); });
  boot().catch(() => { $('login-error').textContent = 'Não foi possível carregar a ferramenta.'; });
})();

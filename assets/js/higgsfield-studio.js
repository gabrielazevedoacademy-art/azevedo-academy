(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const state = { models: [], model: null, files: {}, job: null, timer: null, history: readHistory() };
  const terminal = new Set(['completed', 'failed', 'canceled', 'cancelled', 'nsfw', 'moderated', 'blocked']);
  const labels = { queued: 'Na fila', pending: 'Na fila', in_progress: 'Processando', processing: 'Processando', completed: 'Concluído', failed: 'Falhou', canceled: 'Cancelado', cancelled: 'Cancelado', nsfw: 'Bloqueado pela moderação', moderated: 'Bloqueado pela moderação', blocked: 'Bloqueado' };

  async function api(path, options = {}) {
    const response = await fetch(`/api/higgsfield/${path}`, { credentials: 'same-origin', ...options, headers: { ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Falha na requisição (${response.status}).`);
    return data;
  }
  async function boot() {
    const { authenticated } = await api('session');
    $('login-view').hidden = authenticated; $('app-view').hidden = !authenticated;
    if (authenticated) await loadCatalog();
    renderHistory();
  }
  $('login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); $('login-error').textContent = '';
    try { await api('login', { method: 'POST', body: JSON.stringify({ password: $('password').value }) }); $('password').value = ''; await boot(); }
    catch (error) { $('login-error').textContent = error.message; }
  });
  $('logout').addEventListener('click', async () => { await api('logout', { method: 'POST' }); clearTimeout(state.timer); state.job = null; await boot(); });

  async function loadCatalog() {
    const data = await api('catalog'); state.models = data.models;
    renderModels();
  }
  function renderModels() {
    const media = $('media').value; const available = state.models.filter((model) => model.media === media);
    $('model').replaceChildren(...available.map((model) => new Option(model.name, model.id)));
    state.model = available.find((model) => model.id === $('model').value) || available[0];
    renderConfig();
  }
  function renderConfig() {
    const model = state.models.find((item) => item.id === $('model').value); if (!model) return;
    state.model = model; state.files = {}; $('workflow').value = model.workflowLabel;
    const params = $('parameters'); params.replaceChildren();
    const heading = document.createElement('h3'); heading.textContent = 'Parâmetros'; params.append(heading);
    Object.entries(model.fields).forEach(([name, rule]) => {
      const label = document.createElement('label'); label.htmlFor = `param-${name}`; label.textContent = rule.label;
      let input;
      if (rule.type === 'enum') { input = document.createElement('select'); rule.values.forEach((value) => input.add(new Option(String(value), String(value)))); input.value = String(rule.default); }
      else { input = document.createElement('input'); input.type = 'number'; input.min = rule.min; input.max = rule.max; input.placeholder = rule.optional ? 'Opcional' : ''; }
      input.id = `param-${name}`; input.dataset.parameter = name; params.append(label, input);
    });
    renderUploads();
  }
  function renderUploads() {
    const host = $('uploads'); host.replaceChildren();
    state.model.uploads.forEach((rule) => {
      const label = document.createElement('label'); label.className = 'drop-zone'; label.textContent = `${rule.label} — arraste ou selecione`;
      const input = document.createElement('input'); input.type = 'file'; input.accept = rule.accept.join(','); input.multiple = rule.max > 1;
      const detail = document.createElement('small'); detail.className = 'muted'; detail.textContent = ` ${rule.accept.map((type) => type.split('/')[1].toUpperCase()).join(', ')} · até ${Math.round(rule.maxBytes / 1048576)} MB`;
      label.append(detail, input); host.append(label);
      input.addEventListener('change', () => chooseFiles(rule, [...input.files], label));
      label.addEventListener('dragover', (event) => { event.preventDefault(); label.classList.add('drag'); });
      label.addEventListener('dragleave', () => label.classList.remove('drag'));
      label.addEventListener('drop', (event) => { event.preventDefault(); label.classList.remove('drag'); chooseFiles(rule, [...event.dataTransfer.files], label); });
    });
  }
  function chooseFiles(rule, files, label) {
    const selected = files.slice(0, rule.max);
    const invalid = selected.find((file) => !rule.accept.includes(file.type) || file.size > rule.maxBytes);
    if (invalid || selected.length < rule.min) return notice('Arquivo incompatível, excede o tamanho ou quantidade permitida.', true);
    state.files[rule.name] = selected; label.querySelectorAll('.preview').forEach((item) => item.remove());
    selected.filter((file) => file.type.startsWith('image/')).forEach((file) => { const image = document.createElement('img'); image.className = 'preview'; image.alt = `Prévia de ${file.name}`; image.src = URL.createObjectURL(file); image.onload = () => URL.revokeObjectURL(image.src); label.append(image); });
  }
  $('media').addEventListener('change', renderModels); $('model').addEventListener('change', renderConfig);
  $('prompt').addEventListener('input', () => { $('prompt-count').textContent = `${$('prompt').value.length} caracteres`; });
  $('clear-prompt').addEventListener('click', () => { $('prompt').value = ''; $('prompt').dispatchEvent(new Event('input')); $('prompt').focus(); });

  $('generation-form').addEventListener('submit', async (event) => {
    event.preventDefault(); setBusy(true); notice(''); updateStatus('sending');
    try {
      const uploads = {};
      for (const rule of state.model.uploads) {
        const files = state.files[rule.name] || [];
        if (files.length < rule.min) throw new Error(`Envie: ${rule.label}.`);
        uploads[rule.name] = [];
        for (const file of files) {
          notice(`Enviando ${file.name}…`);
          const result = await api(`upload?modelId=${encodeURIComponent(state.model.id)}&field=${encodeURIComponent(rule.name)}`, { method: 'POST', headers: { 'Content-Type': file.type, 'X-File-Name': file.name }, body: file });
          uploads[rule.name].push(result.url);
        }
      }
      const parameters = {}; document.querySelectorAll('[data-parameter]').forEach((input) => { if (input.value !== '') parameters[input.dataset.parameter] = input.type === 'number' ? Number(input.value) : input.value; });
      const data = await api('generate', { method: 'POST', body: JSON.stringify({ modelId: state.model.id, workflow: state.model.workflow, prompt: $('prompt').value, parameters, uploads }) });
      state.job = { ...data, generation: data.generation }; saveJob(state.job); renderResult(state.job); updateStatus(data.status || 'queued');
      setBusy(false);
    } catch (error) { notice(error.message, true); updateStatus('failed'); setBusy(false); }
  });
  function setBusy(value) { $('generate').disabled = value; $('generate').textContent = value ? 'Gerando…' : 'Gerar'; }
  function updateStatus(status) { const known = status || 'pending'; $('status').textContent = known === 'sending' ? 'Enviando' : labels[known] || known; $('status-dot').className = `status-dot ${terminal.has(known) ? (known === 'completed' ? 'done' : '') : known === 'sending' || known === 'queued' || known === 'processing' || known === 'in_progress' ? 'active' : ''}`; }
  function renderResult(job) {
    const host = $('result'); host.replaceChildren();
    (job.results || []).forEach((item) => { const media = document.createElement(state.model?.media === 'video' ? 'video' : 'img'); media.src = item.url; if (media.tagName === 'VIDEO') media.controls = true; else media.alt = 'Resultado gerado'; const link = document.createElement('a'); link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.download = ''; link.textContent = 'Abrir / baixar resultado'; host.append(media, link); });
    if (job.error) { const error = document.createElement('p'); error.className = 'error'; error.textContent = job.error; host.append(error); }
  }
  function notice(message, error = false) { $('notice').hidden = !message; $('notice').textContent = message; $('notice').classList.toggle('error', error); }
  function readHistory() { try { return JSON.parse(localStorage.getItem('hf-studio-history') || '[]'); } catch { return []; } }
  function saveJob(job) { const safe = { requestId: job.requestId, status: job.status, results: job.results || [], generation: job.generation }; state.history = [safe, ...state.history.filter((item) => item.requestId !== safe.requestId)].slice(0, 20); localStorage.setItem('hf-studio-history', JSON.stringify(state.history)); renderHistory(); }
  function renderHistory() {
    const host = $('history'); host.replaceChildren();
    if (!state.history.length) { const empty = document.createElement('p'); empty.className = 'muted'; empty.textContent = 'Nenhuma geração ainda.'; host.append(empty); return; }
    state.history.forEach((item) => { const card = document.createElement('article'); card.className = 'history-item'; const title = document.createElement('strong'); title.textContent = state.models.find((model) => model.id === item.generation?.modelId)?.name || item.generation?.modelId || 'Geração'; const date = document.createElement('p'); date.className = 'muted small'; date.textContent = item.generation?.createdAt ? new Date(item.generation.createdAt).toLocaleString('pt-BR') : ''; const status = document.createElement('p'); status.textContent = `Status: ${labels[item.status] || item.status || '—'}`; const details = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = 'Prompt e parâmetros'; const prompt = document.createElement('p'); prompt.textContent = item.generation?.prompt || ''; const pre = document.createElement('pre'); pre.textContent = JSON.stringify(item.generation?.parameters || {}, null, 2); details.append(summary, prompt, pre); card.append(title, date, status, details); (item.results || []).forEach((result) => { const link = document.createElement('a'); link.href = result.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Ver resultado'; card.append(link); }); host.append(card); });
  }
  $('clear-history').addEventListener('click', () => { state.history = []; localStorage.removeItem('hf-studio-history'); renderHistory(); });
  boot().catch(() => { $('login-error').textContent = 'Não foi possível carregar a ferramenta.'; });
})();

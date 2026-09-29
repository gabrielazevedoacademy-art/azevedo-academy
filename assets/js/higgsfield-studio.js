(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const state = {
    catalog: [],
    model: null,
    references: {},
    uploadMessages: {},
    uploads: 0,
    history: readHistory(),
    timer: null,
    startedAt: null
  };

  const labels = {
    ready: 'Pronto para gerar',
    queued: 'Na fila',
    pending: 'Na fila',
    in_progress: 'Processando',
    processing: 'Processando',
    completed: 'Concluído',
    failed: 'Falhou',
    canceled: 'Cancelado',
    cancelled: 'Cancelado',
    moderated: 'Bloqueado pela moderação',
    blocked: 'Bloqueado pela moderação',
    nsfw: 'Bloqueado pela moderação'
  };

  async function api(path, options = {}) {
    const response = await fetch('/api/higgsfield/' + path, {
      credentials: 'same-origin',
      ...options,
      headers: {
        ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Falha na requisição (' + response.status + ').');
    return data;
  }

  async function boot() {
    const session = await api('session');
    $('login-view').hidden = session.authenticated;
    $('app-view').hidden = !session.authenticated;
    if (session.authenticated) await loadCatalog();
    renderHistory();
  }

  $('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    $('login-error').textContent = '';
    try {
      await api('login', { method: 'POST', body: JSON.stringify({ password: $('password').value }) });
      $('password').value = '';
      await boot();
    } catch (error) {
      $('login-error').textContent = error.message;
    }
  });

  $('logout').addEventListener('click', async () => {
    await api('logout', { method: 'POST' });
    stopElapsed();
    await boot();
  });

  async function loadCatalog() {
    const data = await api('catalog');
    state.catalog = Array.isArray(data.models) ? data.models : [];
    if (!state.catalog.length) throw new Error('Nenhum modelo disponível.');
    renderFamilies();
  }

  function unique(items, key, labelKey) {
    const map = new Map();
    items.forEach((item) => {
      if (!map.has(item[key])) map.set(item[key], item[labelKey]);
    });
    return [...map].map(([value, label]) => ({ value, label }));
  }

  function fillSelect(select, items, preferred) {
    select.replaceChildren(...items.map((item) => new Option(item.label, item.value)));
    if (preferred && items.some((item) => item.value === preferred)) select.value = preferred;
  }

  function renderFamilies(preferred) {
    fillSelect($('family'), unique(state.catalog, 'family', 'familyLabel'), preferred || $('family').value);
    renderWorkflows();
  }

  function renderWorkflows(preferred) {
    const models = state.catalog.filter((item) => item.family === $('family').value);
    fillSelect($('workflow'), unique(models, 'workflow', 'workflowLabel'), preferred || $('workflow').value);
    renderVariants();
  }

  function renderVariants(preferred) {
    const models = state.catalog.filter((item) => item.family === $('family').value && item.workflow === $('workflow').value);
    const variants = unique(models, 'variant', 'variantLabel');
    fillSelect($('variant'), variants, preferred || $('variant').value);
    $('variant-wrap').hidden = variants.length <= 1 && variants[0]?.value === 'default';
    selectCurrentModel();
  }

  function selectCurrentModel() {
    const model = state.catalog.find((item) =>
      item.family === $('family').value &&
      item.workflow === $('workflow').value &&
      item.variant === $('variant').value
    ) || state.catalog[0];

    state.model = model;
    state.references = {};
    state.uploadMessages = {};
    $('model-title').textContent = model.familyLabel + (model.variantLabel !== 'Padrão' ? ' ' + model.variantLabel : '');
    $('model-description').textContent = model.description || '';
    $('prompt').required = Boolean(model.prompt?.required);
    $('prompt').placeholder = model.prompt?.placeholder || 'Descreva com detalhes o resultado desejado…';
    $('prompt-hint').textContent = model.prompt?.required ? 'Prompt obrigatório para este workflow.' : 'Prompt opcional para este workflow.';
    renderParameters();
    renderReferences();
    resetResult();
  }

  $('family').addEventListener('change', () => renderWorkflows());
  $('workflow').addEventListener('change', () => renderVariants());
  $('variant').addEventListener('change', selectCurrentModel);

  function renderParameters() {
    const host = $('parameters');
    host.replaceChildren();

    Object.entries(state.model.fields || {}).forEach(([name, rule]) => {
      const field = document.createElement('div');
      field.className = 'parameter-field' + (rule.type === 'boolean' ? ' full' : '');

      if (rule.type === 'boolean') {
        const row = document.createElement('div');
        row.className = 'switch-row';
        const label = document.createElement('label');
        label.htmlFor = 'param-' + name;
        label.textContent = rule.label;
        const input = document.createElement('select');
        input.id = 'param-' + name;
        input.dataset.parameter = name;
        input.dataset.type = rule.type;
        input.add(new Option('Sim', 'true'));
        input.add(new Option('Não', 'false'));
        input.value = String(Boolean(rule.default));
        row.append(label, input);
        field.append(row);
        host.append(field);
        return;
      }

      const label = document.createElement('label');
      label.htmlFor = 'param-' + name;
      label.textContent = rule.label;
      let input;

      if (rule.type === 'enum') {
        input = document.createElement('select');
        rule.values.forEach((value) => input.add(new Option(String(value), String(value))));
        input.value = String(rule.default);
      } else {
        input = document.createElement('input');
        input.type = 'number';
        input.min = rule.min;
        input.max = rule.max;
        input.step = rule.type === 'integer' ? 1 : (rule.step || 0.1);
        input.value = rule.default;
      }

      input.id = 'param-' + name;
      input.dataset.parameter = name;
      input.dataset.type = rule.type;
      field.append(label, input);
      host.append(field);
    });
  }

  function humanKind(kind) {
    return kind === 'image' ? 'Imagem' : kind === 'video' ? 'Vídeo' : 'Áudio';
  }

  function formatBytes(value) {
    if (!value) return '';
    if (value >= 1024 * 1024 * 1024) return Math.round(value / (1024 * 1024 * 1024)) + ' GB';
    return Math.round(value / (1024 * 1024)) + ' MB';
  }

  function renderReferences() {
    const panel = $('references-panel');
    const host = $('references');
    const rules = state.model.references || [];
    panel.hidden = !rules.length;
    host.replaceChildren();

    if (!rules.length) return;

    rules.forEach((rule) => {
      if (!state.references[rule.name]) state.references[rule.name] = [];

      const card = document.createElement('article');
      card.className = 'reference-card' + (rule.required ? ' required' : '');

      const head = document.createElement('div');
      head.className = 'reference-head';
      const title = document.createElement('strong');
      title.textContent = rule.label + (rule.required ? ' *' : '');
      const kind = document.createElement('span');
      kind.className = 'reference-kind';
      kind.textContent = humanKind(rule.kind);
      head.append(title, kind);

      const zone = document.createElement('label');
      zone.className = 'upload-zone';
      const icon = document.createElement('span');
      icon.className = 'upload-icon';
      icon.textContent = '↑';
      const copy = document.createElement('span');
      copy.className = 'upload-copy';
      copy.textContent = 'Clique ou arraste' + (rule.multiple ? ' arquivos' : ' um arquivo') + (rule.maxBytes ? ' · até ' + formatBytes(rule.maxBytes) : '');
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = rule.accept.join(',');
      input.multiple = Boolean(rule.multiple);
      zone.append(icon, copy, input);

      input.addEventListener('change', () => uploadFiles(rule, [...input.files]));
      zone.addEventListener('dragover', (event) => {
        event.preventDefault();
        zone.classList.add('drag');
      });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
      zone.addEventListener('drop', (event) => {
        event.preventDefault();
        zone.classList.remove('drag');
        uploadFiles(rule, [...event.dataTransfer.files]);
      });

      const urlRow = document.createElement('div');
      urlRow.className = 'url-row';
      const urlInput = document.createElement('input');
      urlInput.type = 'url';
      urlInput.placeholder = 'ou cole uma URL HTTPS';
      const addUrl = document.createElement('button');
      addUrl.type = 'button';
      addUrl.textContent = 'Adicionar';
      addUrl.addEventListener('click', () => {
        try {
          const parsed = new URL(urlInput.value.trim());
          if (parsed.protocol !== 'https:') throw new Error();
          addReference(rule, parsed.href, 'URL externa');
          urlInput.value = '';
        } catch {
          notice('Use uma URL HTTPS válida.', true);
        }
      });
      urlRow.append(urlInput, addUrl);

      const progress = document.createElement('p');
      progress.className = 'upload-progress';
      progress.textContent = state.uploadMessages[rule.name] || '';

      const items = document.createElement('div');
      items.className = 'reference-items';
      renderReferenceItems(rule, items);

      card.append(head, zone, urlRow, progress, items);
      host.append(card);
    });
  }

  function renderReferenceItems(rule, host) {
    host.replaceChildren();
    const items = state.references[rule.name] || [];

    items.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'reference-item';

      let visual;
      if (rule.kind === 'image') {
        visual = document.createElement('img');
        visual.className = 'reference-thumb';
        visual.src = item.url;
        visual.alt = '';
      } else {
        visual = document.createElement('span');
        visual.className = 'reference-file-icon';
        visual.textContent = rule.kind === 'video' ? 'VID' : 'AUD';
      }

      const name = document.createElement('span');
      name.className = 'reference-name';
      name.textContent = item.name || item.url;

      const remove = document.createElement('button');
      remove.className = 'remove-ref';
      remove.type = 'button';
      remove.setAttribute('aria-label', 'Remover referência');
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        state.references[rule.name].splice(index, 1);
        renderReferences();
      });

      row.append(visual, name, remove);
      host.append(row);
    });
  }

  function addReference(rule, url, name) {
    const list = state.references[rule.name] || [];
    if (!rule.multiple) {
      state.references[rule.name] = [{ url, name }];
    } else {
      if (list.length >= rule.max) {
        notice(rule.label + ': limite de ' + rule.max + ' arquivo(s).', true);
        return;
      }
      list.push({ url, name });
      state.references[rule.name] = list;
    }
    renderReferences();
  }

  async function uploadFiles(rule, files) {
    if (!files.length) return;
    const current = state.references[rule.name] || [];
    const available = rule.multiple ? Math.max(0, rule.max - current.length) : 1;
    const selected = files.slice(0, available);

    if (!selected.length) {
      notice(rule.label + ': limite de arquivos atingido.', true);
      return;
    }

    for (const file of selected) {
      if (!rule.accept.includes(file.type)) {
        notice('Tipo de arquivo incompatível em ' + rule.label + '.', true);
        continue;
      }
      if (rule.maxBytes && file.size > rule.maxBytes) {
        notice(file.name + ' excede o limite de ' + formatBytes(rule.maxBytes) + '.', true);
        continue;
      }

      state.uploads += 1;
      state.uploadMessages[rule.name] = 'Enviando ' + file.name + '…';
      renderReferences();
      refreshGenerateButton();

      try {
        const ticket = await api('upload-url', {
          method: 'POST',
          body: JSON.stringify({ contentType: file.type, size: file.size })
        });

        const response = await fetch(ticket.uploadUrl, {
          method: 'PUT',
          headers: ticket.headers || { 'Content-Type': file.type },
          body: file
        });

        if (!response.ok) throw new Error('Upload recusado pelo armazenamento.');
        addReference(rule, ticket.publicUrl, file.name);
        state.uploadMessages[rule.name] = 'Upload concluído.';
      } catch (error) {
        state.uploadMessages[rule.name] = '';
        notice(error.message + ' Você também pode colar uma URL HTTPS.', true);
      } finally {
        state.uploads = Math.max(0, state.uploads - 1);
        renderReferences();
        refreshGenerateButton();
      }
    }
  }

  $('prompt').addEventListener('input', () => {
    $('prompt-count').textContent = $('prompt').value.length + ' caracteres';
  });

  $('clear-prompt').addEventListener('click', () => {
    $('prompt').value = '';
    $('prompt').dispatchEvent(new Event('input'));
    $('prompt').focus();
  });

  function collectParameters() {
    const parameters = {};
    document.querySelectorAll('[data-parameter]').forEach((input) => {
      const type = input.dataset.type;
      let value = input.value;
      if (type === 'integer' || type === 'number') value = Number(value);
      if (type === 'boolean') value = value === 'true';
      parameters[input.dataset.parameter] = value;
    });
    return parameters;
  }

  function collectReferences() {
    const output = {};
    (state.model.references || []).forEach((rule) => {
      const items = state.references[rule.name] || [];
      if (rule.required && !items.length) throw new Error('Envie: ' + rule.label + '.');
      if (!items.length) return;
      output[rule.name] = rule.multiple ? items.map((item) => item.url) : items[0].url;
    });
    return output;
  }

  $('generation-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (state.uploads) {
      notice('Aguarde o upload terminar antes de gerar.', true);
      return;
    }

    setGenerating(true);
    notice('');
    updateStatus('processing', 'Aguardando a Higgsfield concluir a geração.');
    startElapsed();

    try {
      const data = await api('generate', {
        method: 'POST',
        body: JSON.stringify({
          modelId: state.model.id,
          workflow: state.model.workflow,
          prompt: $('prompt').value,
          parameters: collectParameters(),
          references: collectReferences()
        })
      });

      saveJob(data);
      renderResult(data);
      updateStatus(data.status, data.status === 'completed' ? 'Vídeo recebido com sucesso.' : 'A geração terminou com o status informado pela API.');
      if (['canceled', 'cancelled', 'moderated', 'blocked', 'nsfw'].includes(data.status)) notice(labels[data.status] || data.status, true);
    } catch (error) {
      notice(error.message, true);
      updateStatus('failed', 'A geração não foi concluída.');
    } finally {
      stopElapsed();
      setGenerating(false);
    }
  });

  function setGenerating(value) {
    state.generating = value;
    refreshGenerateButton();
  }

  function refreshGenerateButton() {
    const busy = Boolean(state.generating || state.uploads);
    $('generate').disabled = busy;
    $('generate').querySelector('span').textContent = state.uploads ? 'Enviando arquivo…' : state.generating ? 'Gerando vídeo…' : 'Gerar vídeo';
  }

  function updateStatus(status, detail) {
    const known = status || 'failed';
    $('status').textContent = labels[known] || known;
    $('status-detail').textContent = detail || '';
    $('status-dot').className = 'status-dot ' + (known === 'completed' ? 'done' : ['processing', 'queued', 'pending', 'in_progress'].includes(known) ? 'active' : '');
  }

  function startElapsed() {
    stopElapsed();
    state.startedAt = Date.now();
    $('elapsed').hidden = false;
    const tick = () => {
      const total = Math.floor((Date.now() - state.startedAt) / 1000);
      const minutes = String(Math.floor(total / 60)).padStart(2, '0');
      const seconds = String(total % 60).padStart(2, '0');
      $('elapsed').textContent = minutes + ':' + seconds;
    };
    tick();
    state.timer = setInterval(tick, 1000);
  }

  function stopElapsed() {
    clearInterval(state.timer);
    state.timer = null;
    state.startedAt = null;
    $('elapsed').hidden = true;
  }

  function resetResult() {
    const host = $('result');
    host.replaceChildren();
    const placeholder = document.createElement('div');
    placeholder.className = 'result-placeholder';
    const ring = document.createElement('span');
    ring.className = 'play-ring';
    ring.textContent = '▶';
    const text = document.createElement('p');
    text.textContent = 'Seu vídeo aparecerá aqui.';
    placeholder.append(ring, text);
    host.append(placeholder);
    updateStatus('ready', 'Configure o modelo, escreva o prompt e inicie a geração.');
  }

  function renderResult(job) {
    const host = $('result');
    host.replaceChildren();

    if (job.results && job.results.length) {
      job.results.forEach((item) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'result-video';
        const video = document.createElement('video');
        video.src = item.url;
        video.controls = true;
        video.playsInline = true;
        const actions = document.createElement('div');
        actions.className = 'result-actions';
        const link = document.createElement('a');
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = '';
        link.textContent = 'Abrir / baixar vídeo';
        actions.append(link);
        wrapper.append(video, actions);
        host.append(wrapper);
      });
      return;
    }

    const message = document.createElement('p');
    message.className = 'result-error';
    message.textContent = job.error || 'A API não retornou uma URL de vídeo.';
    host.append(message);
  }

  function notice(message, error = false) {
    $('notice').hidden = !message;
    $('notice').textContent = message;
    $('notice').classList.toggle('error', error);
  }

  function readHistory() {
    try {
      const value = JSON.parse(localStorage.getItem('hf-studio-history') || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function saveJob(job) {
    const safe = {
      id: job.requestId || String(Date.now()),
      requestId: job.requestId,
      status: job.status,
      results: job.results || [],
      generation: job.generation
    };
    state.history = [safe, ...state.history.filter((item) => (item.id || item.requestId) !== safe.id)].slice(0, 20);
    localStorage.setItem('hf-studio-history', JSON.stringify(state.history));
    renderHistory();
  }

  function renderHistory() {
    const host = $('history');
    host.replaceChildren();

    if (!state.history.length) {
      const empty = document.createElement('p');
      empty.className = 'muted empty-state';
      empty.textContent = 'Nenhuma geração ainda.';
      host.append(empty);
      return;
    }

    state.history.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'history-item';

      const top = document.createElement('div');
      top.className = 'history-top';
      const title = document.createElement('strong');
      const modelName = item.generation?.modelName || 'Higgsfield';
      const variant = item.generation?.variant && item.generation.variant !== 'Padrão' ? ' ' + item.generation.variant : '';
      title.textContent = modelName + variant;
      const chip = document.createElement('span');
      chip.className = 'history-chip';
      chip.textContent = labels[item.status] || item.status || '—';
      top.append(title, chip);

      const date = document.createElement('p');
      date.textContent = item.generation?.createdAt ? new Date(item.generation.createdAt).toLocaleString('pt-BR') : '';

      const workflow = document.createElement('p');
      workflow.textContent = item.generation?.workflowLabel || item.generation?.workflow || '';

      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = 'Prompt e parâmetros';
      const prompt = document.createElement('p');
      prompt.textContent = item.generation?.prompt || 'Sem prompt';
      const pre = document.createElement('pre');
      pre.textContent = JSON.stringify({
        ...(item.generation?.parameters || {}),
        referências: item.generation?.references || {}
      }, null, 2);
      details.append(summary, prompt, pre);

      card.append(top, date, workflow, details);

      (item.results || []).forEach((result) => {
        const link = document.createElement('a');
        link.href = result.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Ver resultado';
        card.append(link);
      });

      host.append(card);
    });
  }

  $('clear-history').addEventListener('click', () => {
    state.history = [];
    localStorage.removeItem('hf-studio-history');
    renderHistory();
  });

  boot().catch((error) => {
    $('login-error').textContent = error.message || 'Não foi possível carregar a ferramenta.';
  });
})();

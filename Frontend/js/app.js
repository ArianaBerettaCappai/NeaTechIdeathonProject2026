'use strict';

const FAENA = '2026-11-04';
const ESTABLECIMIENTOS = {
  A: 'Establecimiento A',
  B: 'Establecimiento B',
  C: 'Establecimiento C',
  F: 'Frigorífico'
};
const movimiento = (origen, destino, salida, ingreso, documento) => ({
  origen, destino, salida, ingreso, documento
});

const animales = [
  { id: 'AR-000123', tipo: 'electrónica', titular: 'Productor López', nacimiento: '2025-03-10', movimientos: [
    movimiento('A','B','2025-09-02','2025-09-03','DT-e 0001'),
    movimiento('B','C','2026-03-15','2026-03-16','DT-e 0002'),
    movimiento('C','F','2026-10-30','2026-10-31','DT-e 0003')
  ]},
  { id: 'AR-000124', tipo: 'electrónica', titular: 'Productor López', nacimiento: '2025-03-12', movimientos: [
    movimiento('A','B','2025-09-02','2025-09-03','DT-e 0001'),
    movimiento('B','C','2026-03-15','2026-03-16',null),
    movimiento('C','F','2026-10-30','2026-10-31','DT-e 0003')
  ]},
  { id: 'AR-000125', tipo: 'analógica (CUIG)', titular: 'Productor Gómez', nacimiento: '2024-11-20', movimientos: [
    movimiento('A','B','2025-08-10','2025-08-11','DT-e 0007'),
    movimiento('C','F','2026-10-28','2026-10-29','DT-e 0011')
  ]},
  { id: 'AR-000126', tipo: 'electrónica', titular: 'Productor Gómez', nacimiento: '2025-04-01', movimientos: [
    movimiento('A','B','2026-03-15','2026-03-10','DT-e 0012'),
    movimiento('B','F','2026-10-29','2026-10-30','DT-e 0013')
  ]},
  { id: 'AR-000127', tipo: 'analógica (CUIG)', titular: 'Productor Gómez', nacimiento: '2024-12-05', movimientos: [
    movimiento('A','B','2025-08-10','2025-08-11','DT-e 0007'),
    movimiento('B','F','2026-10-28','2026-10-29','DT-e 0014')
  ]},
  { id: 'AR-000128', tipo: 'electrónica', titular: null, nacimiento: '2025-05-02', movimientos: [
    movimiento('A','B','2025-09-02','2025-09-03','DT-e 0001'),
    movimiento('B','F','2026-10-30','2026-10-31','DT-e 0015')
  ]}
];

const state = { documents: [], selectedAnimal: 0, sealedText: null };
const $ = (selector) => document.querySelector(selector);

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}
function formatDate(value) {
  if (!value) return 'Sin fecha';
  const parts = value.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
}
function badge(kind, label) {
  const className = kind === 'ok' ? 'tag-ok' : kind === 'bad' ? 'tag-bad' : kind === 'warn' ? 'tag-warn' : 'tag-neutral';
  return `<span class="tag ${className}">${escapeHTML(label)}</span>`;
}
function ownerFor(animal) {
  if (!animal.titular) return 'Sin dato';
  return $('#buyerView').checked ? 'Oculto en vista comprador' : animal.titular;
}
function checkAnimal(animal) {
  const gaps = [];
  let ubicacionActual = 'A';
  if (!animal.titular) gaps.push('Falta el titular del animal.');
  for (const move of animal.movimientos) {
    if (move.origen !== ubicacionActual) {
      gaps.push(`Posible salto de trazabilidad: se esperaba un movimiento desde ${ESTABLECIMIENTOS[ubicacionActual]} y figura ${ESTABLECIMIENTOS[move.origen]}.`);
    }
    if (!move.documento) gaps.push(`Falta el DT-e del movimiento ${ESTABLECIMIENTOS[move.origen]} → ${ESTABLECIMIENTOS[move.destino]}.`);
    if (move.ingreso < move.salida) {
      gaps.push(`Fechas incoherentes en ${ESTABLECIMIENTOS[move.origen]} → ${ESTABLECIMIENTOS[move.destino]}: el ingreso figura antes de la salida.`);
    }
    ubicacionActual = move.destino;
  }
  if (ubicacionActual !== 'F') gaps.push('No consta el ingreso al frigorífico.');
  return gaps;
}
function animalEvents(animal) {
  const events = [
    { title: 'Nacimiento e identificación', date: formatDate(animal.nacimiento), source: 'Constancia de identificación SENASA (simulada)', confidence: 'registrado' }
  ];
  if (animal.titular) {
    events.push({ title: `Titular declarado: ${ownerFor(animal)}`, date: formatDate(animal.nacimiento), source: 'Declaración del productor (simulada)', confidence: 'declarado' });
  }
  for (const move of animal.movimientos) {
    const hasDoc = Boolean(move.documento);
    const datesOkay = move.ingreso >= move.salida;
    events.push({
      title: `${ESTABLECIMIENTOS[move.origen]} → ${ESTABLECIMIENTOS[move.destino]}`,
      date: `Salida ${formatDate(move.salida)} · Ingreso ${formatDate(move.ingreso)}`,
      source: move.documento ? `Documento: ${move.documento} (simulado)` : 'Sin documento respaldatorio adjunto',
      confidence: !hasDoc ? 'declarado' : datesOkay ? 'contrastado' : 'registrado'
    });
  }
  return events;
}
function allGaps() {
  const gaps = [];
  animales.forEach((animal) => checkAnimal(animal).forEach((gap) => gaps.push(`${animal.id}: ${gap}`)));
  if (!state.documents.length) gaps.push('Lote: no se adjuntaron documentos sanitarios.');
  else if (state.documents.some((doc) => doc.expiry < FAENA)) gaps.push('Lote: hay documentos sanitarios vencidos antes de la fecha de faena.');
  return gaps;
}
function evaluateRules() {
  const missingOwners = animales.filter((animal) => !animal.titular).length;
  const animalsWithGaps = animales.filter((animal) => checkAnimal(animal).length > 0).length;
  const electronic = animales.filter((animal) => animal.tipo === 'electrónica').length;
  const pct = Math.round((electronic / animales.length) * 1000) / 10;
  let health;
  if (!state.documents.length) health = { kind: 'bad', status: 'Faltante', detail: 'No hay documentos sanitarios adjuntos.' };
  else if (state.documents.some((doc) => doc.expiry < FAENA)) health = { kind: 'bad', status: 'Vencido', detail: 'Hay documentos vencidos a la fecha de faena.' };
  else health = { kind: 'ok', status: 'Adjuntado', detail: 'Los documentos adjuntos no están vencidos a la fecha de faena; su validez no fue autenticada.' };

  return [
    { name: 'Identidad y titularidad', kind: missingOwners ? 'warn' : 'ok', status: missingOwners ? 'Con faltantes' : 'Datos presentes', detail: missingOwners ? `${missingOwners} animal sin titular informado.` : 'Todos los animales tienen titular informado.' },
    { name: 'Historial de movimientos', kind: animalsWithGaps ? 'warn' : 'ok', status: animalsWithGaps ? 'Revisar' : 'Sin alertas', detail: `${animalsWithGaps} de ${animales.length} animales presentan observaciones.` },
    { name: 'Documentación sanitaria', ...health },
    { name: 'Identificación electrónica', kind: 'neutral', status: 'Informativo', detail: `${pct}% electrónica y ${Math.round((100 - pct) * 10) / 10}% analógica (rodeo mixto simulado).` },
    { name: 'Fuente por cada dato', kind: 'ok', status: 'Fuentes descriptas', detail: 'El prototipo etiqueta las fuentes simuladas; no valida su autenticidad.' },
    { name: 'Habilitación de establecimientos', kind: 'neutral', status: 'No evaluada', detail: 'Fuera del alcance del prototipo.' },
    { name: 'Evidencia ambiental', kind: 'neutral', status: 'No evaluada', detail: 'Fuera del alcance del prototipo.' },
    { name: 'Requisitos del destino', kind: 'neutral', status: 'No evaluados', detail: 'Requiere un perfil de mercado validado.' }
  ];
}
function overallState() {
  const rules = evaluateRules();
  if (rules.some((rule) => rule.kind === 'warn' || rule.kind === 'bad')) return { kind: 'warn', label: 'Requiere revisión' };
  return { kind: 'ok', label: 'Sin alertas detectadas' };
}
function renderOverview() {
  const rules = evaluateRules();
  const gaps = allGaps();
  const electronic = animales.filter((animal) => animal.tipo === 'electrónica').length;
  const alertAnimals = animales.filter((animal) => checkAnimal(animal).length > 0).length;
  const status = overallState();

  $('#lotSummary').textContent = `LOTE-DEMO-014 · Faena prevista ${formatDate(FAENA)} · ${animales.length} animales (datos simulados).`;
  $('#heroAnimalCount').textContent = animales.length;
  $('#heroAlertCount').textContent = alertAnimals;
  $('#heroFaena').textContent = formatDate(FAENA);
  $('#metricIdentity').textContent = animales.some((animal) => !animal.titular) ? 'Incompleta' : 'Presente';
  $('#metricMovements').textContent = alertAnimals ? `${alertAnimals} con alertas` : 'Sin alertas';
  $('#metricHealth').textContent = state.documents.length ? `${state.documents.length} adjunto(s)` : 'Pendiente';
  $('#metricElectronic').textContent = `${Math.round((electronic / animales.length) * 100)}%`;
  $('#overallStatus').className = `tag ${status.kind === 'ok' ? 'tag-ok' : 'tag-warn'}`;
  $('#overallStatus').textContent = status.label;
  $('#rulesTable').innerHTML = rules.map((rule) => `<tr><td>${escapeHTML(rule.name)}</td><td>${badge(rule.kind, rule.status)}</td><td>${escapeHTML(rule.detail)}</td></tr>`).join('');
  $('#gapCount').textContent = gaps.length;
  $('#gapsList').innerHTML = gaps.length
    ? gaps.map((gap) => `<li>${escapeHTML(gap)}</li>`).join('')
    : '<li class="all-clear">No se detectaron faltantes con las reglas actuales.</li>';
}
function renderAnimalList() {
  const search = $('#animalSearch').value.trim().toLowerCase();
  const filter = $('#animalFilter').value;
  const filtered = animales.map((animal, index) => ({ animal, index })).filter(({ animal }) => {
    const matchesSearch = animal.id.toLowerCase().includes(search);
    const gaps = checkAnimal(animal).length;
    const matchesFilter = filter === 'all'
      || (filter === 'alerts' && gaps > 0)
      || (filter === 'clear' && gaps === 0)
      || (filter === 'electronic' && animal.tipo === 'electrónica')
      || (filter === 'analog' && animal.tipo.includes('analógica'));
    return matchesSearch && matchesFilter;
  });
  $('#animalListCount').textContent = `${filtered.length} ${filtered.length === 1 ? 'registro' : 'registros'}`;
  $('#animalEmpty').hidden = filtered.length > 0;
  $('#animalList').innerHTML = filtered.map(({ animal, index }) => {
    const alerts = checkAnimal(animal).length;
    return `<li><button type="button" data-index="${index}" aria-current="${index === state.selectedAnimal ? 'true' : 'false'}">
      <span><span class="animal-id">${escapeHTML(animal.id)}</span><span class="animal-type">${escapeHTML(animal.tipo)}</span></span>
      <span class="mini-count">${alerts ? `${alerts} alerta(s)` : 'Sin alertas'}</span>
    </button></li>`;
  }).join('');
  if (!filtered.some(({ index }) => index === state.selectedAnimal) && filtered.length) state.selectedAnimal = filtered[0].index;
  renderAnimalDetail();
}
function renderAnimalDetail() {
  const animal = animales[state.selectedAnimal];
  if (!animal) {
    $('#animalDetail').innerHTML = '<p class="empty-state">No hay animales para mostrar.</p>';
    return;
  }
  const gaps = checkAnimal(animal);
  const events = animalEvents(animal);
  $('#animalDetail').innerHTML = `
    <div class="detail-top"><div><p class="eyebrow">FICHA INDIVIDUAL</p><h3>${escapeHTML(animal.id)}</h3><p class="detail-meta">Identificación ${escapeHTML(animal.tipo)} · Titular: ${escapeHTML(ownerFor(animal))}</p></div>${badge(gaps.length ? 'warn' : 'ok', gaps.length ? `${gaps.length} observación(es)` : 'Sin alertas')}</div>
    <ol class="timeline">${events.map((event) => `<li><strong>${escapeHTML(event.title)}</strong><small>${escapeHTML(event.date)}</small><small>Fuente: ${escapeHTML(event.source)}</small>${badge(event.confidence === 'contrastado' ? 'ok' : event.confidence === 'registrado' ? 'warn' : 'neutral', `Nivel: ${event.confidence}`)}</li>`).join('')}</ol>
    ${gaps.length ? `<div class="detail-alerts"><strong>Observaciones para revisar</strong><ul>${gaps.map((gap) => `<li>${escapeHTML(gap)}</li>`).join('')}</ul></div>` : '<div class="detail-clear">No se detectaron inconsistencias con las reglas actuales.</div>'}`;
}
function renderDocuments() {
  $('#documentCount').textContent = state.documents.length;
  $('#documentsTable').innerHTML = state.documents.length ? state.documents.map((doc, index) => {
    const expired = doc.expiry < FAENA;
    return `<tr><td><span class="doc-name">${escapeHTML(doc.name)}</span><span class="doc-hash">SHA-256: ${escapeHTML(doc.hash.slice(0, 18))}…</span></td><td>${formatDate(doc.expiry)}</td><td>${badge(expired ? 'bad' : 'ok', expired ? 'Vencido para la faena' : 'Fecha compatible')}</td><td><button class="small-button" type="button" data-remove-doc="${index}" aria-label="Eliminar ${escapeHTML(doc.name)}">Eliminar</button></td></tr>`;
  }).join('') : '<tr><td colspan="4" class="table-empty">Todavía no hay documentos adjuntos.</td></tr>';
}
function renderAll() {
  renderOverview();
  renderAnimalList();
  renderDocuments();
}
function canonicalize(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
async function sha256(value) {
  if (!globalThis.crypto?.subtle) throw new Error('Este navegador no permite calcular SHA-256 en este contexto. Abrí el proyecto desde localhost o un contexto seguro (HTTPS).');
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
function buildDossier() {
  const animalData = animales.map((animal) => ({
    id: animal.id,
    identificacion: animal.tipo,
    titular: $('#buyerView').checked ? null : animal.titular,
    titularOcultoEnVistaComprador: $('#buyerView').checked,
    eventos: animalEvents(animal).map((event) => ({
      hecho: event.title, detalle: event.date, fuente: event.source, confianza: event.confidence
    })),
    observaciones: checkAnimal(animal)
  }));
  return {
    perfil: 'legajo-ganadero-demo-v1',
    aviso: 'Evaluación de evidencias. No es una certificación oficial.',
    datos: 'SIMULADOS',
    lote: { id: 'LOTE-DEMO-014', faena: FAENA, cantidadAnimales: animales.length },
    reglas: evaluateRules().map(({ name, status, detail }) => ({ regla: name, resultado: status, detalle: detail })),
    documentos: state.documents.map(({ name, size, expiry, hash }) => ({ nombre: name, bytes: size, vence: expiry, sha256: hash })),
    faltantes: allGaps(),
    animales: animalData,
    estado: overallState().label,
    generado: new Date().toISOString()
  };
}
async function emitDossier() {
  const message = $('#emitMessage');
  message.textContent = '';
  try {
    const dossier = buildDossier();
    const hash = await sha256(canonicalize(dossier));
    state.sealedText = JSON.stringify({ expediente: dossier, sello: { algoritmo: 'SHA-256', hash } }, null, 2);
    $('#hashValue').textContent = hash;
    $('#hashBox').hidden = false;
    $('#verifyText').value = state.sealedText;
    $('#downloadDossier').disabled = false;
    message.textContent = 'Expediente generado. Revisá el aviso: el sello comprueba integridad, no veracidad.';
    $('#verificationResult').textContent = '';
  } catch (error) {
    message.textContent = error.message || 'No se pudo generar el expediente.';
  }
}
function setVerificationResult(message, success) {
  const element = $('#verificationResult');
  element.textContent = message;
  element.className = `verification-result ${success ? 'success' : 'error'}`;
}
async function verifyDossier() {
  try {
    const parsed = JSON.parse($('#verifyText').value);
    if (!parsed || !parsed.expediente || !parsed.sello || parsed.sello.algoritmo !== 'SHA-256' || typeof parsed.sello.hash !== 'string') {
      throw new Error('La estructura no corresponde a un expediente válido de este prototipo.');
    }
    const hash = await sha256(canonicalize(parsed.expediente));
    if (hash === parsed.sello.hash) setVerificationResult('Integridad correcta: la huella coincide con el contenido.', true);
    else setVerificationResult('La huella no coincide. El contenido pudo cambiar o el expediente no es válido.', false);
  } catch (error) {
    setVerificationResult(error.message || 'No se pudo verificar el expediente.', false);
  }
}
function downloadDossier() {
  if (!state.sealedText) return;
  const blob = new Blob([state.sealedText], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'expediente-LOTE-DEMO-014.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportReport() {
  window.print();
}

$('#menuToggle').addEventListener('click', () => {
  const nav = $('#mainNav');
  const open = nav.classList.toggle('is-open');
  $('#menuToggle').setAttribute('aria-expanded', String(open));
});
$('#mainNav').addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    $('#mainNav').classList.remove('is-open');
    $('#menuToggle').setAttribute('aria-expanded', 'false');
  }
});
$('#buyerView').addEventListener('change', () => {
  renderAnimalList();
});
$('#animalSearch').addEventListener('input', renderAnimalList);
$('#animalFilter').addEventListener('change', renderAnimalList);
$('#animalList').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-index]');
  if (!button) return;
  state.selectedAnimal = Number(button.dataset.index);
  renderAnimalList();
});
$('#documentForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const file = $('#documentFile').files[0];
  const expiry = $('#documentExpiry').value;
  const message = $('#documentMessage');
  if (!file || !expiry) {
    message.textContent = 'Seleccioná un archivo y una fecha de vencimiento.';
    return;
  }
  message.textContent = 'Calculando huella…';
  try {
    const hash = await sha256(await file.arrayBuffer());
    state.documents.push({ name: file.name, size: file.size, expiry, hash });
    $('#documentFile').value = '';
    message.textContent = 'Documento agregado a esta sesión. El archivo no se subió a ningún servidor.';
    renderAll();
  } catch (error) {
    message.textContent = error.message || 'No se pudo procesar el archivo.';
  }
});
$('#documentsTable').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-remove-doc]');
  if (!button) return;
  state.documents.splice(Number(button.dataset.removeDoc), 1);
  $('#documentMessage').textContent = 'Documento quitado de la sesión.';
  renderAll();
});
$('#emitDossier').addEventListener('click', emitDossier);
$('#downloadDossier').addEventListener('click', downloadDossier);
$('#verifyDossier').addEventListener('click', verifyDossier);
$('#tamperDossier').addEventListener('click', () => {
  const input = $('#verifyText');
  if (!input.value.trim()) {
    setVerificationResult('Primero generá un expediente o pegá un JSON.', false);
    return;
  }
  try {
    const parsed = JSON.parse(input.value);
    if (!parsed.expediente) throw new Error('No se encontró el contenido del expediente.');
    parsed.expediente.pruebaDeAlteracion = 'Este dato se agregó para la demostración.';
    input.value = JSON.stringify(parsed, null, 2);
    verifyDossier();
  } catch (error) {
    setVerificationResult(error.message || 'No se pudo alterar el contenido.', false);
  }
});
$('#verifyFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    $('#verifyText').value = await file.text();
    setVerificationResult('Archivo JSON cargado. Presioná “Verificar integridad”.', true);
  } catch {
    setVerificationResult('No se pudo leer el archivo seleccionado.', false);
  }
});
$('#exportReport').addEventListener('click', exportReport);

renderAll();

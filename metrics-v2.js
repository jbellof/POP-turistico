'use strict';

// Trayecto 3 - Instrumentación parcial de métricas V2.
// Este incremento implementa la parte de Juan Esteban Bello Figueroa:
// pertinencia (ya existente), claridad del destino, tiempo de interacción,
// finalización sin asistencia y estructura de registro. La utilidad de las
// actividades queda preparada pero deshabilitada hasta que HU7 sea implementada.

const metricCopy = {
  es: {
    clarity: '¿Qué tan clara fue la información ampliada del destino?',
    assistance: '¿Completaste el flujo sin ayuda de otra persona?',
    yes: 'Sí',
    no: 'No',
    activity: '¿Qué tan útiles fueron las actividades recomendadas?',
    activityPending: 'Esta métrica se habilitará cuando se implemente HU7.',
    required: 'Completa la valoración de pertinencia, claridad y finalización sin asistencia.',
    time: 'Tiempo de interacción',
    seconds: 's',
    clarityShort: 'Claridad',
    assistanceShort: 'Sin asistencia',
    activityShort: 'Utilidad actividades',
    notApplicable: 'Pendiente HU7'
  },
  en: {
    clarity: 'How clear was the expanded destination information?',
    assistance: 'Did you complete the flow without help from another person?',
    yes: 'Yes',
    no: 'No',
    activity: 'How useful were the recommended activities?',
    activityPending: 'This metric will be enabled when HU7 is implemented.',
    required: 'Complete relevance, clarity and completion-without-assistance ratings.',
    time: 'Interaction time',
    seconds: 's',
    clarityShort: 'Clarity',
    assistanceShort: 'Without assistance',
    activityShort: 'Activity usefulness',
    notApplicable: 'Pending HU7'
  }
};

const metricState = {
  startedAt: null,
  interactionSeconds: null
};

function mc() {
  return metricCopy[lang] || metricCopy.es;
}

function makeScale(name, ariaPrefix) {
  const wrap = document.createElement('div');
  wrap.className = 'ratings';
  for (let i = 1; i <= 5; i++) {
    const label = element('label', '', 'rating');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    input.value = i;
    input.required = true;
    input.setAttribute('aria-label', `${ariaPrefix} ${i}/5`);
    label.append(input, element('span', i));
    wrap.append(label);
  }
  return wrap;
}

function makeBinary(name) {
  const wrap = document.createElement('div');
  wrap.className = 'ratings metric-binary';
  [['yes', '1'], ['no', '0']].forEach(([key, value]) => {
    const label = element('label', '', 'rating metric-choice');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    input.value = value;
    input.required = true;
    const span = element('span', mc()[key]);
    span.dataset.metricKey = key;
    label.append(input, span);
    wrap.append(label);
  });
  return wrap;
}

function installMetricFields() {
  const form = $('feedbackForm');
  const commentLabel = form.querySelector('label[for="comment"]');

  const clarityField = document.createElement('fieldset');
  clarityField.id = 'clarityMetric';
  const clarityLegend = element('legend', mc().clarity);
  clarityLegend.dataset.metricKey = 'clarity';
  clarityField.append(clarityLegend, makeScale('clarity', mc().clarity));

  const assistanceField = document.createElement('fieldset');
  assistanceField.id = 'assistanceMetric';
  const assistanceLegend = element('legend', mc().assistance);
  assistanceLegend.dataset.metricKey = 'assistance';
  assistanceField.append(assistanceLegend, makeBinary('noAssistance'));

  const activityField = document.createElement('fieldset');
  activityField.id = 'activityMetric';
  activityField.hidden = true;
  activityField.disabled = true;
  const activityLegend = element('legend', mc().activity);
  activityLegend.dataset.metricKey = 'activity';
  const pending = element('p', mc().activityPending, 'micro');
  pending.dataset.metricKey = 'activityPending';
  activityField.append(activityLegend, makeScale('activityUsefulness', mc().activity), pending);

  form.insertBefore(clarityField, commentLabel);
  form.insertBefore(assistanceField, commentLabel);
  form.insertBefore(activityField, commentLabel);
}

function updateMetricLanguage() {
  document.querySelectorAll('[data-metric-key]').forEach(el => {
    const key = el.dataset.metricKey;
    if (mc()[key]) el.textContent = mc()[key];
  });
  const download = $('download');
  if (download) download.textContent = lang === 'es' ? 'Descargar resultados de la sesión' : 'Download session results';
  renderRows();
  renderReceipt();
}

// Inicio del cronómetro al comenzar a interactuar con el perfilamiento.
$('profileForm').addEventListener('focusin', () => {
  if (metricState.startedAt === null) metricState.startedAt = performance.now();
});

// El listener base valida primero el perfil y genera la recomendación.
$('profileForm').addEventListener('submit', () => {
  if (!$('profileError').hidden || !current) return;
  const end = performance.now();
  metricState.interactionSeconds = metricState.startedAt === null
    ? null
    : Math.max(0, Math.round((end - metricState.startedAt) / 100) / 10);
});

installMetricFields();

// Intercepta el guardado base para incluir las métricas V2 sin duplicar registros.
$('feedbackForm').addEventListener('submit', event => {
  event.preventDefault();
  event.stopImmediatePropagation();
  if (!current || saved) return;

  const relevance = document.querySelector('input[name="rating"]:checked');
  const clarity = document.querySelector('input[name="clarity"]:checked');
  const assistance = document.querySelector('input[name="noAssistance"]:checked');
  const activityField = $('activityMetric');
  const activity = activityField && !activityField.hidden
    ? document.querySelector('input[name="activityUsefulness"]:checked')
    : null;

  const missing = !relevance || !clarity || !assistance || (activityField && !activityField.hidden && !activity);
  $('ratingError').hidden = !missing;
  if (missing) {
    $('ratingError').textContent = mc().required;
    (!relevance
      ? document.querySelector('input[name="rating"]')
      : !clarity
        ? document.querySelector('input[name="clarity"]')
        : !assistance
          ? document.querySelector('input[name="noAssistance"]')
          : document.querySelector('input[name="activityUsefulness"]'))?.focus();
    return;
  }

  records.push({
    ...current,
    score: Number(relevance.value),
    clarity: Number(clarity.value),
    noAssistance: assistance.value === '1',
    interactionSeconds: metricState.interactionSeconds,
    activityUsefulness: activity ? Number(activity.value) : null,
    comment: $('comment').value.trim()
  });

  saved = true;
  $('feedbackForm').hidden = true;
  $('receipt').hidden = false;
  $('download').disabled = false;
  renderReceipt();
  renderRows();
}, true);

// Amplía la tabla de sesión con métricas V2.
const sessionHeader = document.querySelector('#session thead tr');
[
  ['time', mc().time],
  ['clarityShort', mc().clarityShort],
  ['assistanceShort', mc().assistanceShort],
  ['activityShort', mc().activityShort]
].forEach(([key, text]) => {
  const th = element('th', text);
  th.dataset.metricKey = key;
  sessionHeader.append(th);
});

renderRows = function renderRowsV2() {
  const body = $('sessionRows');
  body.replaceChildren();
  if (!records.length) {
    const row = document.createElement('tr');
    const cell = element('td', t('empty'));
    cell.colSpan = 9;
    row.append(cell);
    body.append(row);
    return;
  }

  records.forEach((r, i) => {
    const row = document.createElement('tr');
    [
      i + 1,
      profileText(r.profile),
      r.destination[0],
      `${r.score}/5`,
      r.comment || t('none'),
      r.interactionSeconds == null ? '—' : `${r.interactionSeconds} ${mc().seconds}`,
      r.clarity == null ? '—' : `${r.clarity}/5`,
      r.noAssistance == null ? '—' : (r.noAssistance ? mc().yes : mc().no),
      r.activityUsefulness == null ? mc().notApplicable : `${r.activityUsefulness}/5`
    ].forEach(value => row.append(element('td', value)));
    body.append(row);
  });
};

renderReceipt = function renderReceiptV2() {
  if (!saved || !records.length) return;
  const r = records[records.length - 1];
  $('receipt').replaceChildren(
    element('strong', t('thanks')),
    element('p', `${t('destination')}: ${r.destination[0]}`),
    element('p', `${t('rating')}: ${r.score}/5`),
    element('p', `${mc().clarityShort}: ${r.clarity}/5`),
    element('p', `${mc().time}: ${r.interactionSeconds == null ? '—' : `${r.interactionSeconds} ${mc().seconds}`}`),
    element('p', `${mc().assistanceShort}: ${r.noAssistance ? mc().yes : mc().no}`),
    element('p', `${t('comment')}: ${r.comment || t('none')}`)
  );
};

// Sustituye el botón para descargar un CSV con las métricas V2.
const oldDownload = $('download');
const newDownload = oldDownload.cloneNode(true);
oldDownload.replaceWith(newDownload);

newDownload.addEventListener('click', () => {
  const quote = value => '"' + String(value ?? '').replace(/^[=+@\-\t\r]/, "'$&").replace(/"/g, '""') + '"';
  const rows = [
    ['#', t('profile') || 'Perfil', t('destination'), t('rating'), mc().clarityShort, mc().time, mc().assistanceShort, mc().activityShort, t('comment')],
    ...records.map((r, i) => [
      i + 1,
      profileText(r.profile),
      r.destination[0],
      r.score,
      r.clarity,
      r.interactionSeconds ?? '',
      r.noAssistance ? mc().yes : mc().no,
      r.activityUsefulness ?? '',
      r.comment
    ])
  ];
  const blob = new Blob(['\ufeff' + rows.map(row => row.map(quote).join(',')).join('\r\n')], {type: 'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'pop-turistico-metricas-v2.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

$('newTest').addEventListener('click', () => {
  metricState.startedAt = null;
  metricState.interactionSeconds = null;
});

$('language').addEventListener('click', updateMetricLanguage);

// Adriana podrá activar esta métrica una vez HU7 esté implementada.
window.enableActivityMetricV2 = function enableActivityMetricV2() {
  const field = $('activityMetric');
  field.hidden = false;
  field.disabled = false;
};

renderRows();

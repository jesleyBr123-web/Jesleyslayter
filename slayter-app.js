/* SLAYTER TRAINER — núcleo, casca do app e gráficos */
(function(){
'use strict';

/* ─── Utilidades ─────────────────────────────────────────── */
const $  = (s, r) => (r||document).querySelector(s);
const $$ = (s, r) => Array.from((r||document).querySelectorAll(s));
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => new Intl.NumberFormat('pt-BR').format(Math.round(n));
const brl = n => 'R$ ' + n.toFixed(2).replace('.', ',');
const kg  = n => fmt(n) + ' kg';

window.S = {}; // namespace compartilhado com slayter-views.js

function ico(name, size, sw){
  size = size || 17;
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(sw||1.7)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#i-'+name+'"/></svg>';
}
S.ico = ico; S.esc = esc; S.fmt = fmt; S.brl = brl; S.kg = kg; S.$ = $; S.$$ = $$;

function ago(min){
  if (min < 1) return 'agora';
  if (min < 60) return min + ' min';
  const h = Math.floor(min/60);
  if (h < 24) return h + ' h';
  const d = Math.floor(h/24);
  return d === 1 ? 'ontem' : d + ' dias';
}
S.ago = ago;

/* ─── Armazenamento local (tolerante a falhas) ───────────── */
const KEY = 'slayter.v1';
function load(){
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; }
  catch(e){ return null; }
}
function save(){
  try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch(e){ /* modo privado: segue sem persistir */ }
}
S.save = save;

/* ─── Estado ─────────────────────────────────────────────── */
const DEFAULT = {
  logado: false, onboard: null, view: 'home', adminTab: 'alunos',
  plano: ALUNO.plano, nome: ALUNO.nome, ini: ALUNO.ini,
  coins: ALUNO.coins, streak: ALUNO.streak, feitos: ALUNO.semanaFeitos,
  ledger: LEDGER_SEED.slice(),
  posts: FEED_SEED.map(p => Object.assign({}, p, { liked:false })),
  chats: JSON.parse(JSON.stringify(CHATS)),
  chatAtivo: 'geral',
  hist: HISTORICO.slice(),
  cargas: {}, obs: {}, resgates: [],
  filtro: 'todos', busca: '', comTab: 'feed',
  notif: { treino:true, novoTreino:true, feed:true, coment:true, conquista:true, desafio:true, coin:true, jesley:true, cobranca:true },
  bloqueados: [], assinaturaAtiva: true, cancelSolicitado: false
};
let ST = Object.assign({}, DEFAULT, load() || {});
S.get = () => ST;
S.set = (patch) => { Object.assign(ST, patch); save(); };

/* ─── Toasts ─────────────────────────────────────────────── */
function toast(msg, kind){
  const box = $('#toasts');
  const t = document.createElement('div');
  t.className = 'toast' + (kind ? ' ' + kind : '');
  t.innerHTML = msg;
  box.appendChild(t);
  setTimeout(() => { t.style.transition='opacity .3s'; t.style.opacity='0'; setTimeout(()=>t.remove(), 320); }, 3600);
}
S.toast = toast;

/* ─── Modais ─────────────────────────────────────────────── */
let modalStack = [];
function modal(opts){
  const root = $('#modalRoot');
  const wrap = document.createElement('div');
  wrap.className = 'scrim';
  wrap.innerHTML =
    '<div class="modal'+(opts.wide?' modal-wide':'')+'" role="dialog" aria-modal="true" aria-label="'+esc(opts.title||'')+'">'+
      '<div class="modal-head"><h3>'+esc(opts.title||'')+'</h3>'+
        (opts.noClose?'':'<button class="xbtn" data-close aria-label="Fechar">'+ico('close',17)+'</button>')+
      '</div>'+
      '<div class="modal-body">'+(opts.body||'')+'</div>'+
      (opts.foot ? '<div class="modal-foot">'+opts.foot+'</div>' : '')+
    '</div>';
  root.appendChild(wrap);
  modalStack.push(wrap);
  wrap.addEventListener('click', e => {
    if (e.target === wrap && !opts.noClose) closeModal();
    if (e.target.closest('[data-close]')) closeModal();
  });
  if (opts.onMount) opts.onMount(wrap);
  return wrap;
}
function closeModal(){ const m = modalStack.pop(); if (m) m.remove(); }
function closeAllModals(){ while(modalStack.length) modalStack.pop().remove(); }
S.modal = modal; S.closeModal = closeModal; S.closeAllModals = closeAllModals;
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalStack.length) closeModal(); });

/* ═══════════════ GRÁFICOS ═══════════════════════════════════
   Paleta validada para superfície escura. Séries identificadas
   por legenda + rótulo direto — nunca por cor sozinha.        */

function barPath(x, y, w, hh, r){
  r = Math.max(0, Math.min(r, w/2, hh));
  return 'M'+x+','+(y+hh)+' L'+x+','+(y+r)+' Q'+x+','+y+' '+(x+r)+','+y+
         ' L'+(x+w-r)+','+y+' Q'+(x+w)+','+y+' '+(x+w)+','+(y+r)+' L'+(x+w)+','+(y+hh)+' Z';
}
/* Escala com marcas redondas: escolhe entre 4 e 5 divisões a que
   deixa menos espaço morto acima da maior barra. */
function scaleFor(maxV){
  if (!(maxV > 0)) return { max:1, ticks:4 };
  const alvo = maxV * 1.04;
  let best = null;
  [4,5].forEach(t => {
    const raw = alvo / t;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    const s = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 4 ? 4 : n <= 5 ? 5 : 10) * mag;
    const m = s * t;
    if (!best || m < best.max) best = { max:m, ticks:t };
  });
  return best;
}

/* Barras verticais — série única */
function chartBars(o){
  const W = 640, H = o.h || 190, L = 42, R = 10, T = 14, B = 26;
  const iw = W - L - R, ih = H - T - B;
  const sc = scaleFor(Math.max.apply(null, o.values)), max = sc.max, TK = sc.ticks;
  const n = o.values.length;
  const slot = iw / n, bw = Math.max(6, Math.min(o.bw || 30, slot - 6));
  let g = '';
  for (let i = 0; i <= TK; i++){
    const y = T + ih - (ih * i / TK);
    g += '<line class="gridline" x1="'+L+'" y1="'+y+'" x2="'+(W-R)+'" y2="'+y+'"/>'+
         '<text class="axis" x="'+(L-7)+'" y="'+(y+3.5)+'" text-anchor="end">'+(o.yfmt?o.yfmt(max*i/TK):fmt(max*i/TK))+'</text>';
  }
  let bars = '', hits = '';
  o.values.forEach((v, i) => {
    const bh = ih * (v / max), x = L + slot*i + (slot-bw)/2, y = T + ih - bh;
    const on = o.hi === i;
    bars += '<path d="'+barPath(x, y, bw, bh, 4)+'" fill="'+(on ? 'var(--accent)' : (o.color||'var(--accent)'))+'" opacity="'+(o.hi==null||on?1:.42)+'"/>';
    if (o.labelEvery && (i % o.labelEvery === 0 || i === n-1))
      bars += '<text class="glabel" x="'+(x+bw/2)+'" y="'+(y-6)+'" text-anchor="middle" style="font-weight:600">'+(o.vfmt?o.vfmt(v):fmt(v))+'</text>';
    bars += '<text class="axis" x="'+(x+bw/2)+'" y="'+(H-8)+'" text-anchor="middle">'+esc(o.labels[i])+'</text>';
    hits += '<rect x="'+(L+slot*i)+'" y="'+T+'" width="'+slot+'" height="'+ih+'" fill="transparent" data-i="'+i+'"/>';
  });
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(o.alt||'')+'" preserveAspectRatio="xMidYMid meet">'+g+bars+hits+'</svg>';
}

/* Área + linha — série única, com destaque no ponto final */
function chartArea(o){
  const W = 640, H = o.h || 190, L = 48, R = 12, T = 14, B = 26;
  const iw = W - L - R, ih = H - T - B;

  /* Linha de base. Por padrão parte do zero. Com o.zoom, a escala se ajusta à
     faixa dos dados — necessário para medidas corporais: peso entre 79 e 84 kg
     numa escala de 0 a 100 vira uma reta, e some justamente a variação que o
     aluno quer ver. Só vale em linha, nunca em barra. */
  let lo = 0, hi, passo, TK;
  if (o.zoom){
    const mn = Math.min.apply(null, o.values), mx = Math.max.apply(null, o.values);
    const faixa = (mx - mn) || Math.max(mx * 0.05, 1);
    const alvo = faixa * 1.9 / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(alvo)));
    const nn = alvo / mag;
    passo = (nn <= 1 ? 1 : nn <= 2 ? 2 : nn <= 2.5 ? 2.5 : nn <= 5 ? 5 : 10) * mag;
    lo = Math.floor((mn - faixa*0.4) / passo) * passo;
    hi = Math.ceil((mx + faixa*0.4) / passo) * passo;
    TK = Math.max(2, Math.round((hi - lo) / passo));
  } else {
    const sc = scaleFor(Math.max.apply(null, o.values));
    hi = sc.max; TK = sc.ticks; passo = hi / TK;
  }
  const max = hi;
  const n = o.values.length;
  const px = i => L + (n === 1 ? iw/2 : iw * i / (n-1));
  const py = v => T + ih - ih * ((v - lo) / (hi - lo));
  let g = '';
  for (let i = 0; i <= TK; i++){
    const y = T + ih - (ih*i/TK), val = lo + (hi-lo)*i/TK;
    g += '<line class="gridline" x1="'+L+'" y1="'+y+'" x2="'+(W-R)+'" y2="'+y+'"/>'+
         '<text class="axis" x="'+(L-7)+'" y="'+(y+3.5)+'" text-anchor="end">'+(o.yfmt?o.yfmt(val):fmt(val))+'</text>';
  }
  let d = '', a = '';
  o.values.forEach((v,i) => { const c = (i?' L':'M')+px(i)+','+py(v); d += c; });
  a = d + ' L'+px(n-1)+','+(T+ih)+' L'+px(0)+','+(T+ih)+' Z';
  let lab = '', hits = '';
  o.labels.forEach((lb,i) => {
    if (i % (o.labelEvery||1) === 0 || i === n-1)
      lab += '<text class="axis" x="'+px(i)+'" y="'+(H-8)+'" text-anchor="middle">'+esc(lb)+'</text>';
    hits += '<rect x="'+(px(i)-iw/(2*(n-1)))+'" y="'+T+'" width="'+(iw/(n-1))+'" height="'+ih+'" fill="transparent" data-i="'+i+'"/>';
  });
  const last = n-1;
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(o.alt||'')+'" preserveAspectRatio="xMidYMid meet">'+
    '<defs><linearGradient id="ag'+(o.uid||'')+'" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0%" stop-color="'+(o.color||'var(--accent)')+'" stop-opacity=".26"/>'+
      '<stop offset="100%" stop-color="'+(o.color||'var(--accent)')+'" stop-opacity="0"/></linearGradient></defs>'+
    g + '<path d="'+a+'" fill="url(#ag'+(o.uid||'')+')"/>'+
    '<path d="'+d+'" fill="none" stroke="'+(o.color||'var(--accent)')+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'+
    '<circle cx="'+px(last)+'" cy="'+py(o.values[last])+'" r="4.5" fill="'+(o.color||'var(--accent)')+'" stroke="var(--surface)" stroke-width="2"/>'+
    '<text class="glabel" x="'+px(last)+'" y="'+(py(o.values[last])-11)+'" text-anchor="end" style="font-weight:600">'+(o.vfmt?o.vfmt(o.values[last]):fmt(o.values[last]))+'</text>'+
    lab + hits + '</svg>';
}

/* Linhas múltiplas — legenda obrigatória + rótulo direto */
function chartLines(o){
  const W = 640, H = o.h || 210, L = 40, R = 96, T = 16, B = 26;
  const iw = W - L - R, ih = H - T - B;
  let mx = 0; o.series.forEach(s => s.v.forEach(v => { if (v > mx) mx = v; }));
  const sc = scaleFor(mx), max = sc.max, TK = sc.ticks, n = o.labels.length;
  const px = i => L + iw * i / (n-1);
  const py = v => T + ih - ih*(v/max);
  let g = '';
  for (let i = 0; i <= TK; i++){
    const y = T + ih - (ih*i/TK);
    g += '<line class="gridline" x1="'+L+'" y1="'+y+'" x2="'+(W-R)+'" y2="'+y+'"/>'+
         '<text class="axis" x="'+(L-7)+'" y="'+(y+3.5)+'" text-anchor="end">'+fmt(max*i/TK)+'</text>';
  }
  let paths = '';
  o.series.forEach(s => {
    let d = '';
    s.v.forEach((v,i) => { d += (i?' L':'M')+px(i)+','+py(v); });
    paths += '<path d="'+d+'" fill="none" stroke="'+s.cor+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    s.v.forEach((v,i) => { paths += '<circle cx="'+px(i)+'" cy="'+py(v)+'" r="3.4" fill="'+s.cor+'" stroke="var(--surface)" stroke-width="1.6"/>'; });
    const ly = py(s.v[n-1]);
    paths += '<text class="glabel" x="'+(W-R+9)+'" y="'+(ly+3.5)+'" style="font-weight:600">'+fmt(s.v[n-1])+' kg</text>';
  });
  let lab = '';
  o.labels.forEach((lb,i) => { lab += '<text class="axis" x="'+px(i)+'" y="'+(H-8)+'" text-anchor="middle">'+esc(lb)+'</text>'; });
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(o.alt||'')+'" preserveAspectRatio="xMidYMid meet">'+g+paths+lab+'</svg>';
}

/* Barras horizontais — magnitude ordenada */
function chartHBars(o){
  const rowH = 24, W = 470, H = o.pairs.length * rowH + 8, L = 104, R = 40;
  const iw = W - L - R;
  const max = Math.max.apply(null, o.pairs.map(p => p[1]));
  let s = '';
  o.pairs.forEach((p, i) => {
    const y = i * rowH + 4, bw = Math.max(2, iw * (p[1]/max)), bh = 12;
    s += '<text class="glabel" x="'+(L-9)+'" y="'+(y+bh/2+3.5)+'" text-anchor="end">'+esc(p[0])+'</text>'+
         '<path d="'+barPath(L, y, bw, bh, 4)+'" fill="'+(o.color||'var(--accent)')+'" opacity="'+(0.45 + 0.55*(p[1]/max))+'"/>'+
         '<text class="axis" x="'+(L+bw+8)+'" y="'+(y+bh/2+3.5)+'" style="font-weight:600">'+p[1]+'</text>';
  });
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(o.alt||'')+'" preserveAspectRatio="xMidYMid meet">'+s+'</svg>';
}

/* Anel de descanso */
function ring(pct, label, color){
  const r = 32, c = 2*Math.PI*r;
  return '<div class="timerring"><svg width="74" height="74" viewBox="0 0 74 74">'+
    '<circle cx="37" cy="37" r="'+r+'" fill="none" stroke="var(--surface-3)" stroke-width="5"/>'+
    '<circle cx="37" cy="37" r="'+r+'" fill="none" stroke="'+(color||'var(--accent)')+'" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+c+'" stroke-dashoffset="'+(c*(1-pct))+'" transform="rotate(-90 37 37)"/>'+
    '</svg><div class="tval">'+label+'</div></div>';
}

S.chartBars = chartBars; S.chartArea = chartArea; S.chartLines = chartLines;
S.chartHBars = chartHBars; S.ring = ring;

/* Tooltip de gráfico */
function attachTip(root){
  $$('.chartbox[data-tip]', root).forEach(box => {
    const svg = $('svg', box); if (!svg) return;
    const spec = JSON.parse(box.getAttribute('data-tip'));
    let tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;pointer-events:none;background:var(--surface-2);border:1px solid var(--line-2);border-radius:3px;padding:7px 10px;font-size:.75rem;line-height:1.45;white-space:nowrap;box-shadow:0 8px 22px rgba(0,0,0,.5);opacity:0;transition:opacity .12s;z-index:5';
    box.style.position = 'relative';
    box.appendChild(tip);
    svg.addEventListener('pointermove', e => {
      const t = e.target.closest('[data-i]');
      if (!t){ tip.style.opacity = '0'; return; }
      const i = +t.getAttribute('data-i');
      const rb = box.getBoundingClientRect();
      tip.innerHTML = '<b>'+esc(spec.labels[i])+'</b><br><span class="dim">'+esc(spec.title)+'</span> '+esc(spec.vals[i]);
      tip.style.opacity = '1';
      const x = Math.min(Math.max(e.clientX - rb.left + 12, 4), rb.width - tip.offsetWidth - 4);
      tip.style.left = x + 'px';
      tip.style.top = Math.max(4, e.clientY - rb.top - tip.offsetHeight - 10) + 'px';
    });
    svg.addEventListener('pointerleave', () => { tip.style.opacity = '0'; });
  });
}
S.attachTip = attachTip;

/* ═══════════════ SITE PÚBLICO ═══════════════════════════ */
const FEATURES = [
  ['dumbbell','Treinos','Divisão semanal montada para o seu nível, com séries, repetições, descanso e registro de carga a cada sessão.'],
  ['play','Vídeos','Demonstração de execução exercício por exercício, com técnica e pontos de atenção descritos.'],
  ['chart','Evolução','Frequência, cargas, volume por grupamento, metas, sequência e conquistas — progresso que dá para ver.'],
  ['brain','Mente Slayter','Pensamentos, reflexões, vídeos e áudios sobre disciplina, constância e estilo de vida.'],
  ['users','Comunidade','Feed para compartilhar conquistas, chat por canais e um ambiente moderado para treinar acompanhado.'],
  ['coin','CoinSlayter','Moedas por constância e participação, trocadas por benefícios em parceiros da plataforma.']
];

function plates(nivel){
  const map = { 'Iniciante':['var(--s3)'], 'Intermediário':['var(--s3)','var(--s4)'], 'Premium':['var(--s3)','var(--s4)','var(--s2)','var(--accent)'] };
  const hs  = { 'Iniciante':[13], 'Intermediário':[13,17], 'Premium':[11,15,19,22] };
  const c = map[nivel] || map.Iniciante, hh = hs[nivel] || hs.Iniciante;
  return '<span class="plates">' + c.map((x,i) => '<i style="background:'+x+';height:'+hh[i]+'px"></i>').join('') + '</span>';
}
S.plates = plates;

const PILAR_IC = { 'Técnica':'target', 'Consistência':'clock', 'Progressão':'chart', 'Disciplina':'shield',
  'Bem-estar':'heart', 'Qualidade de vida':'flame', 'Resultado':'trophy' };

function cardCaso(c, i){
  const n = String(i+1).padStart(2,'0');
  if (c) return '<article class="case">'+
    '<figure class="photo">'+(c.foto?'<img src="'+esc(c.foto)+'" alt="'+esc(c.nome)+'">':'<span class="grain knurl"></span>')+
    '<figcaption><span>'+esc(c.nome)+' · '+esc(c.tempo)+'</span></figcaption></figure>'+
    '<div class="case-body"><p class="slot" style="color:var(--ink)">“'+esc(c.relato)+'”</p>'+
    '<div class="case-rows">'+c.dados.map(d =>
      '<div><span>'+esc(d[0])+'</span><em>'+esc(d[1])+'</em></div>').join('')+'</div></div></article>';

  return '<article class="case">'+
    '<figure class="photo">'+
      '<span class="grain knurl"></span>'+
      '<span class="photo-glyph">'+ico('camera',30,1.3)+'</span>'+
      '<figcaption><span>Foto autorizada do aluno</span></figcaption>'+
    '</figure>'+
    '<div class="case-body">'+
      '<span class="chip">Caso '+n+'</span>'+
      '<div class="slot"><b>Aluno</b>Nome e tempo de acompanhamento</div>'+
      '<div class="slot"><b>Relato</b>Depoimento escrito pelo próprio aluno, publicado com autorização.</div>'+
      '<div class="case-rows">'+
        '<div><span>Carga inicial → atual</span><em>—</em></div>'+
        '<div><span>Frequência média</span><em>—</em></div>'+
        '<div><span>Período documentado</span><em>—</em></div>'+
      '</div>'+
    '</div></article>';
}

function renderPublic(){
  $('#methodGrid').innerHTML = METODO.map(m =>
    '<div class="pillar"><div class="ic">'+ico(PILAR_IC[m[0]] || 'bolt', 19)+'</div>'+
    '<h3>'+esc(m[0])+'</h3><p>'+esc(m[1])+'</p></div>').join('');

  const casos = (typeof CASOS !== 'undefined' && CASOS.length) ? CASOS : [null,null,null];
  $('#casesGrid').innerHTML = casos.map(cardCaso).join('');

  const pr = PLANOS.filter(p => p.destaque)[0];
  $('#planHero').innerHTML =
    '<div class="plan-hero">'+
      '<div class="plan-hero-left">'+
        '<div class="plan-level">'+plates('Premium')+'<span class="sub">'+esc(pr.sub)+'</span></div>'+
        '<h3>Slayter<br>Trainer</h3>'+
        '<div class="price-xl"><span class="cur">R$</span><b>'+pr.preco.toFixed(2).replace('.',',')+'</b><small>'+esc(pr.per)+'</small></div>'+
        '<button class="btn btn-primary btn-lg" data-buy="'+pr.id+'">'+esc(pr.cta)+'</button>'+
        '<div class="plan-foot">Fidelidade de 3 meses. Cancelamento com 30 dias de antecedência da próxima cobrança.</div>'+
      '</div>'+
      '<div class="plan-hero-right">'+
        '<p class="plan-desc" style="font-size:.9375rem">'+esc(pr.desc)+'</p>'+
        '<ul>'+pr.curto.map(i => '<li>'+ico('check',15,2.4)+'<span>'+esc(i)+'</span></li>').join('')+'</ul>'+
        '<button class="textlink" data-detalhe="premium" style="align-self:flex-start">Ver tudo o que está incluído</button>'+
      '</div>'+
    '</div>';

  $('#plansGrid').innerHTML = PLANOS.filter(p => !p.destaque).map(p =>
    '<div class="plan">'+
      '<div class="plan-level">'+plates(p.nivel)+'<span class="eyebrow plain" style="color:var(--ink-3)">Nível '+esc(p.nivel)+'</span></div>'+
      '<h3>'+esc(p.nome)+'</h3>'+
      '<div class="price"><span class="cur">R$</span><b>'+p.preco.toFixed(2).replace('.',',')+'</b><small>'+esc(p.per)+'</small></div>'+
      '<p class="plan-desc">'+esc(p.desc)+'</p>'+
      '<ul>'+p.itens.map(i => '<li>'+ico('check',14,2.2)+'<span>'+esc(i)+'</span></li>').join('')+'</ul>'+
      '<button class="btn btn-ghost btn-block" data-buy="'+p.id+'">'+esc(p.cta)+'</button>'+
      '<div class="plan-foot">Fidelidade de 3 meses. Cancelamento com 30 dias de antecedência da próxima cobrança.</div>'+
    '</div>').join('');

  $('#featureGrid').innerHTML = FEATURES.map(f =>
    '<div class="rec-item"><span class="ic">'+ico(f[0], 20)+'</span>'+
      '<div><b>'+esc(f[1])+'</b><p>'+esc(f[2])+'</p></div></div>').join('');

  $('#journeyGrid').innerHTML = JORNADA.map(j =>
    '<div class="jstep"><b>'+esc(j[0])+'</b><span>'+esc(j[1])+'</span></div>').join('');
}

/* ═══════════════ NAVEGAÇÃO DO APP ═══════════════════════ */
const NAV = [
  ['home','Início','home'],
  ['treinos','Meus treinos','dumbbell'],
  ['exercicios','Exercícios','library'],
  ['evolucao','Minha evolução','chart'],
  ['comunidade','Comunidade','users'],
  ['coin','CoinSlayter','coin'],
  ['mente','Mente Slayter','brain'],
  ['plano','Meu plano','card'],
  ['perfil','Perfil','user']
];
const TITLES = { home:'Início', treinos:'Meus treinos', exercicios:'Exercícios', evolucao:'Minha evolução',
  comunidade:'Comunidade Slayter', coin:'CoinSlayter', mente:'Mente Slayter', plano:'Meu plano',
  perfil:'Perfil', admin:'Painel administrativo', treinar:'Treino em andamento' };
S.NAV = NAV;

function renderNav(){
  $('#railNav').innerHTML = NAV.map(n =>
    '<button class="navitem'+(ST.view===n[0]?' on':'')+'" data-view="'+n[0]+'">'+ico(n[2])+esc(n[1])+
    (n[0]==='comunidade'?'<span class="badge">3</span>':'')+'</button>').join('');
  const tabs = [['home','Início','home'],['treinos','Treinos','dumbbell'],['exercicios','Exercícios','library'],['comunidade','Feed','users'],['mais','Mais','grid']];
  $('#tabBar').innerHTML = tabs.map(t =>
    '<button class="tabbtn'+(ST.view===t[0]?' on':'')+'" data-view="'+t[0]+'">'+ico(t[2],19)+'<span>'+esc(t[1])+'</span></button>').join('');
  $('#railName').textContent = ST.nome;
  $('#railPlan').textContent = ST.plano === 'premium' ? 'Premium · Ativo' : (ST.plano === 'intermediario' ? 'Intermediário' : 'Iniciante');
  const ehJesley = ST.nome === ALUNO.nome;
  $('#railAvatar').textContent = ST.ini;
  $('#barAvatar').textContent = ST.ini;
  $('#railAvatar').classList.toggle('jsp', ehJesley);
  $('#barAvatar').classList.toggle('jsp', ehJesley);
  $('#adminLink').hidden = !ALUNO.admin;
}

function go(view){
  if (view === 'mais'){ sheetMais(); return; }
  ST.view = view; save();
  $('#viewTitle').textContent = TITLES[view] || 'Slayter Trainer';
  renderNav();
  const root = $('#viewRoot');
  root.classList.toggle('view-wide', view === 'admin');
  root.innerHTML = (S.views[view] || S.views.home)();
  window.scrollTo(0,0);
  attachTip(root);
  if (S.after && S.after[view]) S.after[view](root);
}
S.go = go;

function sheetMais(){
  modal({ title:'Navegar', body:
    '<div class="stack gap-s">'+ NAV.slice(3).map(n =>
      '<button class="navitem" data-view="'+n[0]+'" data-close>'+ico(n[2])+esc(n[1])+'</button>').join('')+
      (ALUNO.admin ? '<button class="navitem" data-view="admin" data-close>'+ico('shield')+'Painel administrativo</button>' : '')+
      '<button class="navitem" data-act="sair" data-close>'+ico('logout')+'Sair da conta</button>'+
    '</div>' });
}

function entrarApp(){
  ST.logado = true; save();
  $('#site').hidden = true; $('#app').hidden = false;
  document.body.style.overflow = '';
  renderNav(); go(ST.view === 'treinar' ? 'home' : ST.view);
}
S.entrarApp = entrarApp;

function sairApp(){
  ST.logado = false; ST.view = 'home'; save();
  $('#app').hidden = true; $('#site').hidden = false;
  closeAllModals(); window.scrollTo(0,0);
  toast('Você saiu da conta.');
}

/* ═══════════════ ENTRADA, ONBOARDING, CHECKOUT ══════════ */
function telaEntrar(){
  modal({ title:'Entrar na plataforma', wide:true, body:
    '<div class="authsplit">'+
    '<figure class="authphoto"><img src="img/campanha.jpg" alt="Jesley Slayter — Força, Dedicação, Resultados"></figure>'+
    '<div class="stack gap-m">'+
      '<div class="field"><label class="label" for="loginMail">E-mail</label><input class="input" id="loginMail" type="email" value="'+esc(ALUNO.email)+'" autocomplete="username"></div>'+
      '<div class="field"><label class="label" for="loginPass">Senha</label><input class="input" id="loginPass" type="password" value="demonstracao" autocomplete="current-password"></div>'+
      '<div class="between"><label class="check"><input type="checkbox" id="loginKeep" checked> Manter conectado</label>'+
      '<button class="tiny linkish" data-act="recuperar">Esqueci minha senha</button></div>'+
      '<div class="notice info">'+ico('lock',15)+'<div>Login seguro: senha com hash, verificação em duas etapas opcional e recuperação por e-mail.</div></div>'+
    '</div></div>',
    foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" data-act="login-ok">Entrar</button>' });
}

function telaRecuperar(){
  modal({ title:'Recuperar senha', body:
    '<div class="stack gap-m"><p class="muted tiny" style="margin:0">Informe o e-mail cadastrado. Enviaremos um link de redefinição válido por 30 minutos.</p>'+
    '<div class="field"><label class="label" for="recMail">E-mail</label><input class="input" id="recMail" type="email" placeholder="seu@email.com"></div></div>',
    foot:'<button class="btn btn-ghost" data-close>Voltar</button><button class="btn btn-primary" data-act="rec-ok">Enviar link</button>' });
}

/* ── Onboarding ── */
const OB_STEPS = [
  { k:'nome',  t:'Como podemos te chamar?', tipo:'texto', ph:'Seu nome' },
  { k:'idade', t:'Qual a sua idade?', tipo:'num', ph:'Ex.: 32' },
  { k:'objetivo', t:'Qual o seu objetivo principal?', tipo:'opt',
    ops:[['Ganho de massa muscular','Hipertrofia e força'],['Emagrecimento','Composição corporal'],['Saúde e qualidade de vida','Bem-estar e disposição'],['Performance','Força e condicionamento']] },
  { k:'nivel', t:'Qual o seu nível de treinamento?', tipo:'opt',
    ops:[['Iniciante','Começando ou retomando'],['Intermediário','Treino há mais de 6 meses'],['Avançado','Rotina consolidada há anos']] },
  { k:'freq', t:'Quantos dias por semana você quer treinar?', tipo:'opt',
    ops:[['2 dias','Rotina apertada'],['3 dias','Equilíbrio inicial'],['4 dias','Divisão completa'],['5 dias ou mais','Volume alto']] },
  { k:'exp', t:'Qual a sua experiência com musculação?', tipo:'opt',
    ops:[['Nunca treinei','Primeira vez na academia'],['Menos de 6 meses','Ainda aprendendo a técnica'],['6 meses a 2 anos','Já conheço os exercícios'],['Mais de 2 anos','Experiência consolidada']] },
  { k:'pref', t:'Preferências de treino', tipo:'multi',
    ops:[['Musculação','Base da metodologia'],['Treino em casa','Pouco equipamento'],['Cardio incluído','Condicionamento'],['Foco em pernas',''],['Foco em superiores',''],['Mobilidade','Amplitude e articulações']] }
];
let ob = { i:0, ans:{} };

function onboarding(){
  ob = { i:0, ans:{} };
  modal({ title:'Vamos começar sua jornada Slayter', noClose:false, body:'<div id="obBody"></div>',
    foot:'<button class="btn btn-ghost" data-act="ob-prev">Voltar</button><button class="btn btn-primary" data-act="ob-next">Continuar</button>',
    onMount: () => obRender() });
}
function obRender(){
  const s = OB_STEPS[ob.i], box = $('#obBody'); if (!box) return;
  let body = '<div class="steps" style="margin-bottom:20px">'+OB_STEPS.map((_,i)=>'<i class="'+(i<=ob.i?'on':'')+'"></i>').join('')+'</div>'+
    '<div class="eyebrow plain" style="margin-bottom:10px">Passo '+(ob.i+1)+' de '+OB_STEPS.length+'</div>'+
    '<h3 class="d3" style="margin-bottom:16px">'+esc(s.t)+'</h3>';
  if (s.tipo === 'texto' || s.tipo === 'num')
    body += '<input class="input" id="obInput" type="'+(s.tipo==='num'?'number':'text')+'" placeholder="'+esc(s.ph)+'" value="'+esc(ob.ans[s.k]||'')+'">';
  else
    body += '<div class="optgrid">'+s.ops.map(o =>
      '<button class="opt'+(isSel(s,o[0])?' on':'')+'" data-ob="'+esc(o[0])+'"><b>'+esc(o[0])+'</b>'+(o[1]?'<span>'+esc(o[1])+'</span>':'')+'</button>').join('')+'</div>';
  if (s.tipo === 'multi') body += '<p class="help mt-s">Pode escolher mais de uma opção.</p>';
  box.innerHTML = body;
}
function isSel(s, v){
  const a = ob.ans[s.k];
  return s.tipo === 'multi' ? Array.isArray(a) && a.indexOf(v) >= 0 : a === v;
}
function obPick(v){
  const s = OB_STEPS[ob.i];
  if (s.tipo === 'multi'){
    const a = Array.isArray(ob.ans[s.k]) ? ob.ans[s.k] : [];
    const i = a.indexOf(v); if (i >= 0) a.splice(i,1); else a.push(v);
    ob.ans[s.k] = a;
  } else { ob.ans[s.k] = v; }
  obRender();
}
function obNext(){
  const s = OB_STEPS[ob.i];
  if (s.tipo === 'texto' || s.tipo === 'num'){
    const v = ($('#obInput')||{}).value;
    if (!v || !String(v).trim()){ toast('Preencha este campo para continuar.'); return; }
    ob.ans[s.k] = String(v).trim();
  } else if (!ob.ans[s.k] || (s.tipo==='multi' && !ob.ans[s.k].length)){
    toast('Escolha uma opção para continuar.'); return;
  }
  if (ob.i < OB_STEPS.length - 1){ ob.i++; obRender(); }
  else obFim();
}
function obFim(){
  const nivel = ob.ans.nivel || 'Iniciante';
  const rec = nivel === 'Iniciante' ? PLANOS[0] : nivel === 'Intermediário' ? PLANOS[1] : PLANOS[2];
  ST.onboard = ob.ans;
  ST.nome = ob.ans.nome || ALUNO.nome;
  ST.ini = ST.nome.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  save();
  closeModal();
  modal({ title:'Vamos começar sua jornada Slayter', body:
    '<div class="stack gap-m">'+
      '<h3 class="d3">Tudo certo, '+esc(ST.nome.split(' ')[0])+'.</h3>'+
      '<p class="muted" style="margin:0">Com base no que você respondeu, o ponto de partida recomendado dentro da metodologia é:</p>'+
      '<div class="panel-2 pad-l" style="display:flex;flex-direction:column;gap:10px">'+
        '<div class="plan-level">'+plates(rec.nivel)+'<span class="chip chip-accent">Recomendado</span></div>'+
        '<h4 class="d3" style="font-size:1.25rem">'+esc(rec.nome)+'</h4>'+
        '<div class="price"><span class="cur">R$</span><b style="font-size:1.75rem">'+rec.preco.toFixed(2).replace('.',',')+'</b><small>'+esc(rec.per)+'</small></div>'+
        '<p class="tiny muted" style="margin:0">'+esc(rec.desc)+'</p>'+
      '</div>'+
      '<div class="notice">'+ico('info',15)+'<div>Esta recomendação considera apenas o nível de treino que você informou. <b>Não é diagnóstico médico nem nutricional</b> e não substitui avaliação profissional.</div></div>'+
      '<p class="tiny dim" style="margin:0">Você pode escolher qualquer um dos três planos — a recomendação é só um ponto de partida.</p>'+
    '</div>',
    foot:'<button class="btn btn-ghost" data-go="planos" data-close>Ver todos os planos</button><button class="btn btn-primary" data-buy="'+rec.id+'">Continuar com '+esc(rec.nivel)+'</button>' });
}

/* ── Checkout ── */
let ck = { plano:null, metodo:'pix', aceite:false };
function checkout(planoId){
  closeAllModals();
  ck = { plano: PLANOS.filter(p => p.id === planoId)[0] || PLANOS[0], metodo:'pix', aceite:false };
  modal({ title:'Finalizar contratação', wide:true, body:'<div id="ckBody"></div>',
    foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" data-act="ck-pay" id="ckPay" disabled>Confirmar e pagar</button>',
    onMount: () => ckRender() });
}
function ckRender(){
  const p = ck.plano, recorrente = p.id === 'premium';
  const box = $('#ckBody'); if (!box) return;
  box.innerHTML =
  '<div class="split" style="gap:20px">'+
    '<div class="stack gap-m">'+
      '<div>'+
        '<div class="eyebrow" style="margin-bottom:10px">Forma de pagamento</div>'+
        '<div class="optgrid" style="grid-template-columns:1fr 1fr">'+
          '<button class="opt'+(ck.metodo==='pix'?' on':'')+'" data-pay="pix"><b>'+ico('pix',15)+' PIX</b><span>Confirmação imediata</span></button>'+
          '<button class="opt'+(ck.metodo==='cartao'?' on':'')+'" data-pay="cartao"><b>'+ico('card',15)+' Cartão de crédito</b><span>'+(recorrente?'Cobrança recorrente automática':'Parcela única')+'</span></button>'+
        '</div>'+
      '</div>'+
      '<div id="ckDados"></div>'+
      (ck.metodo === 'pix' ? ckPix() : ckCartao(recorrente))+
      '<div>'+
        '<div class="eyebrow" style="margin-bottom:10px">Termos de contratação</div>'+
        '<div class="panel-2 pad" style="max-height:186px;overflow-y:auto">'+termosResumo(p, recorrente)+'</div>'+
      '</div>'+
      '<label class="check"><input type="checkbox" id="ckAceite"'+(ck.aceite?' checked':'')+'> Li e aceito os termos de contratação, a <b>fidelidade de 3 meses</b> e a política de cancelamento, que exige solicitação com <b>30 dias de antecedência</b> em relação à próxima cobrança.</label>'+
    '</div>'+
    '<div class="panel pad-l stack gap-m" style="position:sticky;top:12px">'+
      '<div class="eyebrow plain" style="color:var(--ink-3)">Resumo do pedido</div>'+
      '<div class="plan-level">'+plates(p.nivel)+'<b style="font-size:.9375rem">'+esc(p.nome)+'</b></div>'+
      '<hr class="hr">'+
      '<div class="between tiny"><span class="muted">Periodicidade</span><b>'+(recorrente?'Mensal recorrente':'Pagamento único')+'</b></div>'+
      '<div class="between tiny"><span class="muted">Fidelidade</span><b>3 meses</b></div>'+
      '<div class="between tiny"><span class="muted">Forma de pagamento</span><b>'+(ck.metodo==='pix'?'PIX':'Cartão de crédito')+'</b></div>'+
      '<hr class="hr">'+
      '<div class="between"><span class="muted tiny">Total hoje</span><span class="price"><span class="cur">R$</span><b style="font-size:1.75rem">'+p.preco.toFixed(2).replace('.',',')+'</b></span></div>'+
      (recorrente?'<p class="tiny dim" style="margin:0">Depois, '+brl(p.preco)+' por mês, com cobrança automática na mesma data.</p>':'<p class="tiny dim" style="margin:0">Acesso liberado imediatamente após a confirmação.</p>')+
      '<div class="tiny dim" style="display:flex;gap:7px;align-items:flex-start">'+ico('lock',14)+'<span>Dados de cartão são processados pelo provedor de pagamento. A plataforma não armazena número completo, CVV nem dados sensíveis.</span></div>'+
      '<hr class="hr">'+
      '<p class="tiny dim" style="margin:0">Ambiente de apresentação: o meio de pagamento ainda não está conectado, nenhuma cobrança é feita.</p>'+
    '</div>'+
  '</div>';
  ckSync();
}
function ckPix(){
  if (S.online) return '<div class="panel-2 pad-l stack gap-m">'+
    '<b style="font-size:.9375rem">Pagamento via PIX</b>'+
    '<p class="tiny muted" style="margin:0">Ao confirmar, a plataforma gera um QR Code exclusivo para esta compra. '+
    'Assim que o pagamento cai, seu acesso é liberado automaticamente — sem precisar mandar comprovante para ninguém.</p>'+
    (ck.plano && ck.plano.per === '/mês'
      ? '<label class="check"><input type="checkbox" id="ckPixAuto" checked> Ativar <b>Pix Automático</b>: você autoriza uma vez no aplicativo do banco e as próximas mensalidades passam a ser debitadas sozinhas.</label>'
      : '')+
  '</div>';

  return '<div class="panel-2 pad-l stack gap-m">'+
    '<b style="font-size:.9375rem">Pagamento via PIX</b>'+
    '<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">'+
      '<div style="width:118px;height:118px;border:1px solid var(--line-2);border-radius:3px;display:flex;align-items:center;justify-content:center;background:var(--bg-deep);text-align:center;padding:10px">'+
        '<span class="tiny dim">QR Code do PIX</span></div>'+
      '<div class="stack gap-s" style="flex:1;min-width:190px">'+
        '<span class="label">PIX copia e cola</span>'+
        '<div class="panel pad tiny dim" style="word-break:break-all;font-family:ui-monospace,monospace">código gerado na confirmação</div>'+
        '<p class="tiny dim" style="margin:0">Após a confirmação do pagamento, o acesso é liberado automaticamente.</p>'+
      '</div></div></div>';
}
function ckCartao(rec){
  if (S.online) return '<div class="panel-2 pad-l stack gap-m">'+
    '<b style="font-size:.9375rem">Cartão de crédito</b>'+
    '<div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">'+
      '<div class="field" style="grid-column:1/-1"><label class="label" for="ccNum">Número do cartão</label>'+
        '<input class="input" id="ccNum" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000"></div>'+
      '<div class="field"><label class="label" for="ccMes">Mês</label><input class="input" id="ccMes" inputmode="numeric" autocomplete="cc-exp-month" placeholder="MM" maxlength="2"></div>'+
      '<div class="field"><label class="label" for="ccAno">Ano</label><input class="input" id="ccAno" inputmode="numeric" autocomplete="cc-exp-year" placeholder="AAAA" maxlength="4"></div>'+
      '<div class="field"><label class="label" for="ccCvv">CVV</label><input class="input" id="ccCvv" inputmode="numeric" autocomplete="cc-csc" placeholder="000" maxlength="4"></div>'+
      '<div class="field"><label class="label" for="ccCep">CEP do titular</label><input class="input" id="ccCep" inputmode="numeric" autocomplete="postal-code" placeholder="00000-000"></div>'+
      '<div class="field"><label class="label" for="ccNumEnd">Número do endereço</label><input class="input" id="ccNumEnd" placeholder="123"></div>'+
      '<div class="field"><label class="label" for="ccTel">Telefone</label><input class="input" id="ccTel" inputmode="tel" autocomplete="tel" placeholder="(00) 00000-0000"></div>'+
      '<div class="field" style="grid-column:1/-1"><label class="label" for="ccNome">Nome impresso no cartão</label>'+
        '<input class="input" id="ccNome" autocomplete="cc-name" placeholder="Como está no cartão"></div>'+
    '</div>'+
    (rec?'<p class="tiny dim" style="margin:0">Autorização de cobrança recorrente mensal, cancelável conforme a política de cancelamento.</p>':'')+
    '<p class="tiny dim" style="margin:0">Os dados do cartão vão direto para o provedor de pagamento e não são armazenados pela plataforma.</p>'+
  '</div>';

  return '<div class="panel-2 pad-l stack gap-m">'+
    '<b style="font-size:.9375rem">Cartão de crédito</b>'+
    '<div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">'+
      '<div class="field" style="grid-column:1/-1"><label class="label">Número do cartão</label><input class="input" disabled placeholder="•••• •••• •••• ••••"></div>'+
      '<div class="field"><label class="label">Validade</label><input class="input" disabled placeholder="MM/AA"></div>'+
      '<div class="field"><label class="label">CVV</label><input class="input" disabled placeholder="•••"></div>'+
      '<div class="field" style="grid-column:1/-1"><label class="label">Nome impresso</label><input class="input" disabled placeholder="Como está no cartão"></div>'+
    '</div>'+
    (rec?'<p class="tiny dim" style="margin:0">Autorização de cobrança recorrente mensal, cancelável conforme a política de cancelamento.</p>':'')+
    '<p class="tiny dim" style="margin:0">Campos desativados nesta apresentação — não insira dados reais de cartão.</p>'+
  '</div>';
}
function termosResumo(p, rec){
  return '<div class="tiny muted" style="line-height:1.75">'+
    '<b style="color:var(--ink)">1. Objeto.</b> Contratação do '+esc(p.nome)+' da plataforma Slayter Trainer, que dá acesso a conteúdos de treinamento, biblioteca de exercícios e recursos da metodologia Jesley Slayter.<br><br>'+
    '<b style="color:var(--ink)">2. Preço e periodicidade.</b> '+brl(p.preco)+' '+(rec?'por mês, com cobrança automática na mesma data de cada ciclo':'em pagamento único')+'.<br><br>'+
    '<b style="color:var(--ink)">3. Fidelidade.</b> O plano tem período mínimo de permanência de <b style="color:var(--ink)">3 (três) meses</b> contados da data de contratação.<br><br>'+
    '<b style="color:var(--ink)">4. Cancelamento.</b> Solicitações de cancelamento devem ser realizadas com antecedência mínima de <b style="color:var(--ink)">30 (trinta) dias</b> em relação à próxima cobrança, observadas as condições do contrato de fidelidade.<br><br>'+
    '<b style="color:var(--ink)">5. Natureza do serviço.</b> Os conteúdos têm caráter informativo e educativo. Não constituem consulta médica, prescrição nutricional ou avaliação física individualizada, e não substituem acompanhamento profissional presencial quando necessário.<br><br>'+
    '<b style="color:var(--ink)">6. Resultados.</b> A plataforma não garante resultados específicos. A evolução depende de constância, contexto individual, saúde, sono, alimentação e histórico de treino.<br><br>'+
    '<b style="color:var(--ink)">7. Dados pessoais.</b> O tratamento de dados segue a Política de Privacidade e a Lei nº 13.709/2018 (LGPD). Dados financeiros sensíveis são processados pelo provedor de pagamento.<br><br>'+
    '<b style="color:var(--ink)">8. Direito de arrependimento.</b> Compras on-line observam o prazo de 7 (sete) dias previsto no artigo 49 do Código de Defesa do Consumidor.<br><br>'+
    '<span style="color:var(--ink-3)">Minuta em rascunho, pendente de revisão jurídica antes da operação comercial.</span></div>';
}
function ckSync(){
  const btn = $('#ckPay'); const ac = $('#ckAceite');
  if (btn) btn.disabled = !(ac && ac.checked);
}
function ckPagar(){
  if (S.pagarOnline) return S.pagarOnline(ck);
  const p = ck.plano;
  closeModal();
  ST.plano = p.id; ST.logado = true; ST.assinaturaAtiva = true; save();
  modal({ title:'Contratação confirmada', body:
    '<div class="stack gap-m center" style="align-items:center;text-align:center">'+
      '<div style="width:56px;height:56px;border-radius:50%;background:var(--good-soft);border:1px solid rgba(79,178,134,.4);display:flex;align-items:center;justify-content:center;color:var(--good)">'+ico('check',26,2.4)+'</div>'+
      '<h3 class="d3">Bem-vindo ao Slayter Trainer</h3>'+
      '<p class="muted" style="margin:0;max-width:44ch">'+esc(p.nome)+' ativo. Seu acesso à plataforma está liberado e o primeiro treino já está montado no seu painel.</p>'+
      '<div class="panel-2 pad tiny muted" style="width:100%;text-align:left">'+esc(p.nome)+' · '+brl(p.preco)+' · '+(ck.metodo==='pix'?'PIX':'Cartão de crédito')+' · Fidelidade até 18/12/2026</div>'+
    '</div>',
    foot:'<button class="btn btn-primary btn-block" data-act="ir-app">Ir para a plataforma</button>' });
}

/* ═══════════════ DOCUMENTOS LEGAIS ══════════════════════ */
const DOCS = {
  termos: ['Termos de uso', '<p>Rascunho para revisão jurídica.</p><p>O uso da plataforma Slayter Trainer pressupõe a aceitação destes termos. Os conteúdos de treinamento, vídeos, textos e materiais são de autoria de Jesley Slayter e destinam-se ao uso pessoal e intransferível do aluno. É vedada a reprodução, revenda ou compartilhamento das credenciais de acesso.</p><p>Os conteúdos têm caráter informativo e educativo, não configuram prescrição médica, nutricional ou fisioterapêutica e não substituem avaliação profissional individualizada. O aluno declara estar apto à prática de exercícios físicos ou ter buscado orientação profissional quando necessário.</p><p>A plataforma não garante resultados específicos de composição corporal, desempenho ou estética.</p>'],
  privacidade: ['Política de privacidade', '<p>Rascunho para revisão jurídica e adequação à LGPD (Lei nº 13.709/2018).</p><p><b>Dados coletados:</b> nome, e-mail, idade, respostas do onboarding, registros de treino (carga, repetições, observações), interações na comunidade e histórico de assinatura.</p><p><b>Finalidades:</b> execução do contrato, personalização da experiência de treino, funcionamento da comunidade, comunicação sobre a assinatura e melhoria do serviço.</p><p><b>Base legal:</b> execução de contrato, consentimento (comunicações opcionais) e legítimo interesse (segurança e prevenção a fraude).</p><p><b>Dados financeiros:</b> números de cartão e dados sensíveis de pagamento são processados diretamente pelo provedor de pagamento e não são armazenados pela plataforma.</p><p><b>Seus direitos:</b> confirmação de tratamento, acesso, correção, portabilidade, anonimização, revogação de consentimento e eliminação. Os pedidos podem ser feitos na área Perfil › Privacidade e dados.</p>'],
  cancelamento: ['Política de cancelamento', '<p>Rascunho para revisão jurídica.</p><p>Todos os planos possuem período de fidelidade de <b>3 (três) meses</b> contados da data de contratação, apresentado ao aluno antes da finalização da compra.</p><p><b>Regra comercial da plataforma:</b> "Solicitações de cancelamento devem ser realizadas com antecedência mínima de 30 dias em relação à próxima cobrança, observadas as condições do contrato de fidelidade."</p><p>Durante a fidelidade, o cancelamento antecipado pode implicar as consequências previstas em contrato. Compras on-line observam ainda o direito de arrependimento de 7 dias previsto no artigo 49 do Código de Defesa do Consumidor.</p><p>O cancelamento pode ser solicitado em Meu plano › Cancelar assinatura.</p>'],
  lgpd: ['Tratamento de dados (LGPD)', '<p>A plataforma coleta consentimentos separados para: comunicações de marketing, uso de imagem em publicações da comunidade e recomendações personalizadas de conteúdo. Cada consentimento pode ser revogado a qualquer momento em Perfil › Privacidade e dados, sem prejuízo do acesso contratado.</p><p>Ferramentas disponíveis ao aluno: exportar meus dados, corrigir cadastro, revogar consentimentos e solicitar exclusão da conta.</p><p>Encarregado de dados (DPO): a ser designado antes da operação comercial.</p>'],
  suporte: ['Suporte ao aluno', '<p>Canal de atendimento da plataforma. Na versão de produção: chat interno com a equipe, prazo de resposta informado e histórico de chamados.</p><p>Assuntos: acesso e senha, dúvidas sobre treino, cobrança e assinatura, denúncias na comunidade.</p>'],
  parcerias: ['Seja um parceiro', '<p>Marcas, academias e serviços podem integrar o clube de vantagens CoinSlayter. O parceiro define o benefício, o desconto, a validade e o estoque; a plataforma define o custo em CoinSlayter e faz a curadoria.</p><p>Cadastro e gestão pelo painel administrativo, em CoinSlayter › Parceiros.</p>']
};
function abrirDoc(k){
  const d = DOCS[k]; if (!d) return;
  modal({ title:d[0], body:'<div class="muted" style="line-height:1.75;font-size:.875rem">'+d[1]+'</div>',
    foot:'<button class="btn btn-ghost" data-close>Fechar</button>' });
}
S.abrirDoc = abrirDoc;

/* ═══════════════ NOTIFICAÇÕES ═══════════════════════════ */
const NOTIFS = [
  ['flame','Sequência de 18 dias','Você está a 12 dias do bônus de constância de 500 CoinSlayter.', 8],
  ['dumbbell','Treino de hoje disponível','Superior — empurrar · 6 exercícios · ~70 min', 120],
  ['comment','Jesley Slayter comentou','"Profundidade mantida é o detalhe que importa. Parabéns."', 180],
  ['coin','Novo benefício no clube','Núcleo Reab: avaliação funcional com 50% de desconto.', 600],
  ['brain','Novo pensamento publicado','"Constância vence intensidade."', 1440],
  ['card','Próxima cobrança em 24 dias','Premium · R$ 89,90 · 12/10/2026', 2880]
];
function painelNotif(){
  modal({ title:'Notificações', body:
    '<div class="stack">'+NOTIFS.map(n =>
      '<div style="display:flex;gap:12px;padding:13px 0;border-bottom:1px solid var(--line)">'+
        '<span style="color:var(--accent);flex:none;margin-top:1px">'+ico(n[0],18)+'</span>'+
        '<div style="flex:1;min-width:0"><b style="font-size:.875rem;display:block">'+esc(n[1])+'</b>'+
        '<span class="tiny muted">'+esc(n[2])+'</span></div>'+
        '<span class="tiny dim nowrap">'+ago(n[3])+'</span></div>').join('')+
    '</div>',
    foot:'<button class="btn btn-ghost btn-sm" data-view="perfil" data-close>Preferências</button><button class="btn btn-primary btn-sm" data-act="notif-lidas">Marcar como lidas</button>' });
}

/* ═══════════════ DELEGAÇÃO DE EVENTOS ═══════════════════ */
document.addEventListener('click', e => {
  const t = e.target;

  const doc = t.closest('[data-doc]');
  if (doc){ e.preventDefault(); abrirDoc(doc.getAttribute('data-doc')); return; }

  const goEl = t.closest('[data-go]');
  if (goEl){
    e.preventDefault();
    const k = goEl.getAttribute('data-go');
    if (k === 'top') window.scrollTo({top:0,behavior:'smooth'});
    else { const s = document.getElementById(k); if (s) s.scrollIntoView({behavior:'smooth'}); }
    return;
  }

  const buy = t.closest('[data-buy]');
  if (buy){ checkout(buy.getAttribute('data-buy')); return; }

  const det = t.closest('[data-detalhe]');
  if (det){
    const p = PLANOS.filter(x => x.id === det.getAttribute('data-detalhe'))[0];
    modal({ title:p.nome + ' — tudo incluído', body:
      '<ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:11px">'+
      p.itens.map(i => '<li style="display:flex;gap:10px;font-size:.9375rem;line-height:1.5">'+
        '<span style="color:var(--accent);flex:none;margin-top:2px">'+ico('check',15,2.4)+'</span>'+esc(i)+'</li>').join('')+
      '</ul>',
      foot:'<button class="btn btn-ghost" data-close>Fechar</button><button class="btn btn-primary" data-buy="'+p.id+'">'+esc(p.cta)+'</button>' });
    return;
  }

  const pay = t.closest('[data-pay]');
  if (pay){ ck.metodo = pay.getAttribute('data-pay'); ckRender(); return; }

  const obEl = t.closest('[data-ob]');
  if (obEl){ obPick(obEl.getAttribute('data-ob')); return; }

  const view = t.closest('[data-view]');
  if (view){ if (!ST.logado) { entrarApp(); } go(view.getAttribute('data-view')); return; }

  const act = t.closest('[data-act]');
  if (act){
    if (act.tagName === 'A') e.preventDefault();
    const a = act.getAttribute('data-act');
    switch(a){
      case 'entrar': telaEntrar(); break;
      case 'recuperar': closeModal(); telaRecuperar(); break;
      case 'rec-ok': closeModal(); toast('Se o e-mail estiver cadastrado, o link de redefinição será enviado.'); break;
      case 'login-ok':
        if (S.loginOnline) { S.loginOnline(); break; }
        closeModal(); entrarApp(); toast('Bem-vindo de volta, '+esc(ST.nome.split(' ')[0])+'.', 'good'); break;
      case 'comecar': onboarding(); break;
      case 'ob-next': obNext(); break;
      case 'ob-prev': if (ob.i > 0){ ob.i--; obRender(); } else closeModal(); break;
      case 'ck-pay': ckPagar(); break;
      case 'ir-app': closeModal(); entrarApp(); break;
      case 'sair': sairApp(); break;
      case 'notificacoes': painelNotif(); break;
      case 'notif-lidas': closeModal(); $('#notifDot').hidden = true; toast('Notificações marcadas como lidas.'); break;
      case 'media': toast('Slot de mídia: aqui entra o vídeo gravado por Jesley Slayter.'); break;
      default: if (S.onAct) S.onAct(a, act, e);
    }
    return;
  }

  if (S.onClick) S.onClick(e);
});

document.addEventListener('change', e => {
  if (e.target.id === 'ckAceite'){ ck.aceite = e.target.checked; ckSync(); }
  if (S.onChange) S.onChange(e);
});

/* ═══════════════ INICIALIZAÇÃO ══════════════════════════ */
/* chamada ao final de slayter-views.js, quando as telas já existem */
function medirDemo(){
  const d = document.querySelector('.demobar');
  document.documentElement.style.setProperty('--demoh', (d ? d.offsetHeight : 0) + 'px');
}
window.addEventListener('resize', medirDemo);

/* Exposto para slayter-online.js, que assume o checkout quando há servidor. */
S.ck = () => ck;
S.ckRender = () => ckRender();
S.ckSync = () => ckSync();
S.sucessoCompra = (titulo, html, rodape) => modal({ title:titulo, body:html, foot:rodape });

S.boot = function(){
  renderPublic();
  medirDemo();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medirDemo);
  if (ST.logado) entrarApp();
};

})();

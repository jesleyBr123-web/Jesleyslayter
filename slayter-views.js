/* SLAYTER TRAINER — telas do aplicativo */
(function(){
'use strict';
const { ico, esc, fmt, brl, kg, $, $$, ago, toast, modal, closeModal, go, plates,
        chartBars, chartArea, chartLines, chartHBars, ring, save } = S;
const ST = S.get();

const EXMAP = {}; EX.forEach(e => EXMAP[e.id] = e);
const GRUPO_NOME = {}; GRUPOS.forEach(g => GRUPO_NOME[g.id] = g.nome);
const NIVEL_DO_PLANO = { iniciante:'Iniciante', intermediario:'Intermediário', premium:'Premium' };
const nivel = () => NIVEL_DO_PLANO[ST.plano] || 'Iniciante';
const meusTreinos = () => TREINOS.filter(t => t.nivel === nivel());
const treinoDeHoje = () => { const l = meusTreinos(); return l[ST.feitos % l.length]; };
const primeiro = () => (ST.nome || 'Aluno').split(' ')[0];

function tip(title, labels, vals){ return esc(JSON.stringify({ title:title, labels:labels, vals:vals })); }

/* ── Técnicas de intensidade ─────────────────────────────── */
const extraDe = (it) => it[4] || {};
const tecDe   = (it) => { const x = extraDe(it); return x.tec ? TECNICAS[x.tec] : (x.bi ? TECNICAS.bi : null); };
const ehMulti = (id) => !!(EXMAP[id] || {}).mt;

function selo(it, curto){
  const x = extraDe(it);
  if (x.tec === 'drop') return '<span class="selo drop">'+(curto?'DROP':'DROP SET')+'</span>';
  if (x.tec === 'rp')   return '<span class="selo rp">'+(curto?'R-P':'REST-PAUSE')+'</span>';
  return '';
}

/* Agrupa itens em bi-sets consecutivos e devolve blocos para render. */
function blocos(itens){
  const out = [];
  for (let i = 0; i < itens.length; i++){
    const bi = extraDe(itens[i]).bi;
    if (bi && itens[i+1] && extraDe(itens[i+1]).bi === bi){
      out.push({ bi:bi, itens:[itens[i], itens[i+1]], de:i });
      i++;
    } else out.push({ itens:[itens[i]], de:i });
  }
  return out;
}

/* Linhas compactas de exercício, com o par de bi-set amarrado. */
function linhasTreino(t){
  let n = 0;
  return blocos(t.itens).map(b => {
    const linhas = b.itens.map(it => {
      const ex = EXMAP[it[0]];
      n++;
      return '<button class="exrow" data-ex="'+esc(ex.id)+'">'+
        '<span class="ix num">'+String(n).padStart(2,'0')+'</span>'+
        '<span class="nm">'+esc(ex.nome)+'</span>'+
        selo(it, true)+
        '<span class="sr">'+it[1]+' × '+esc(it[2])+'</span>'+
        '<span style="color:var(--ink-3)">'+ico('chev',14)+'</span></button>';
    }).join('');
    return b.bi
      ? '<div class="biset"><span class="biset-tag">Bi-set</span>'+linhas+'</div>'
      : linhas;
  }).join('');
}
function secHead(t, extra){ return '<div class="sec-head"><h2>'+esc(t)+'</h2>'+(extra||'')+'</div>'; }

/* Cálculo de anilhas por lado (barra olímpica de 20 kg) */
function anilhas(total){
  let porLado = (total - 20) / 2;
  if (porLado <= 0) return null;
  const disp = [20,15,10,5,2.5,1.25], out = [];
  disp.forEach(p => { while (porLado >= p - 0.001){ out.push(p); porLado = +(porLado - p).toFixed(2); } });
  return porLado > 0.01 ? null : out;
}
const CORPLACA = { 20:'var(--s1)', 15:'var(--s4)', 10:'var(--s3)', 5:'var(--ink-2)', 2.5:'var(--s2)', 1.25:'var(--ink-3)' };
function barraVisual(total){
  const a = anilhas(total);
  if (!a || !a.length) return '<span class="tiny dim">Barra de 20 kg sem anilhas</span>';
  return '<span class="platebar"><i class="pw" style="height:8px"></i>'+
    a.map(p => '<i style="background:'+CORPLACA[p]+';height:'+(p>=20?24:p>=15?21:p>=10?18:p>=5?14:10)+'px"></i>').join('')+
    '</span><span class="tiny dim">'+a.map(p => String(p).replace('.',',')).join(' + ')+' kg por lado</span>';
}

/* ═══════════════ INÍCIO ═════════════════════════════════ */
function vHome(){
  const t = treinoDeHoje();
  const dias = ['D','S','T','Q','Q','S','S'];
  const feitosSemana = [1,1,0,1,0,0,0];
  return ''+
  '<div class="stack gap-l">'+
    '<div>'+
      '<div class="eyebrow" style="margin-bottom:10px">'+new Date().toLocaleDateString('pt-BR',{weekday:'long', day:'2-digit', month:'long'})+'</div>'+
      '<h2 class="d2">Olá, '+esc(primeiro())+'!</h2>'+
    '</div>'+

    '<div class="tiles">'+
      '<div class="tile"><span class="k">Sequência</span><span class="v num">'+ST.streak+'<span class="u">dias</span></span><span class="d">Sem semana vazia</span></div>'+
      '<div class="tile"><span class="k">Semana</span><span class="v num">'+ST.feitos+'/'+ALUNO.semanaMeta+'</span><span class="d">Treinos da meta</span></div>'+
      '<div class="tile"><span class="k">Treinos no total</span><span class="v num">'+ALUNO.treinosTotal+'</span><span class="d">Desde '+esc(ALUNO.desde)+'</span></div>'+
      '<div class="tile"><span class="k">CoinSlayter</span><span class="v num" style="color:var(--brass)">'+fmt(ST.coins)+'</span><span class="d">Saldo disponível</span></div>'+
    '</div>'+

    '<div class="today"><div class="today-in">'+
      '<div class="between">'+
        '<div><div class="eyebrow" style="margin-bottom:8px">Seu treino de hoje</div>'+
        '<h3 class="d3">'+esc(t.nome)+'</h3>'+
        '<p class="tiny muted" style="margin:6px 0 0">'+esc(t.foco)+' · '+t.itens.length+' exercícios · ~'+t.dur+' min</p></div>'+
        '<span class="chip chip-accent">Treino '+esc(t.cod)+' · '+esc(t.nivel)+'</span>'+
      '</div>'+
      '<div class="today-ex">'+linhasTreino(t)+'</div>'+
      '<div style="display:flex;gap:10px;flex-wrap:wrap">'+
        '<button class="btn btn-primary" data-act="iniciar-treino">Começar treino '+ico('arrow',15)+'</button>'+
        '<button class="btn btn-ghost" data-view="treinos">Ver a semana</button>'+
      '</div>'+
    '</div></div>'+

    '<div class="split">'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Frequência das últimas 12 semanas','<span class="tiny dim">treinos por semana</span>')+
        '<div class="chartbox" data-tip="'+tip('Treinos:', FREQ_12S.map((_,i)=>'Semana '+(i+1)), FREQ_12S.map(v=>v+' treinos'))+'">'+
          chartBars({ values:FREQ_12S, labels:FREQ_12S.map((_,i)=>'S'+(i+1)), h:180, labelEvery:0,
            yfmt:v=>fmt(v), alt:'Treinos por semana nas últimas 12 semanas, variando de 2 a 4.' })+'</div>'+
        '<p class="tiny dim" style="margin:0">Média de 3,25 treinos por semana no período. Meta atual: '+ALUNO.semanaMeta+' por semana.</p>'+
      '</div>'+
      '<div class="stack gap-m">'+
        '<div class="panel pad-l stack gap-m">'+
          '<div class="eyebrow plain" style="color:var(--ink-3)">Sua semana</div>'+
          '<div class="streak">'+dias.map((d,i)=>'<i class="'+(feitosSemana[i]?'on':'')+'" title="'+d+'"></i>').join('')+'</div>'+
          '<div class="row between tiny dim">'+dias.map(d=>'<span style="flex:1;text-align:center">'+d+'</span>').join('')+'</div>'+
          '<hr class="hr">'+
          '<div class="between tiny"><span class="muted">Meta semanal</span><b>'+ST.feitos+' de '+ALUNO.semanaMeta+'</b></div>'+
          '<div class="bar"><i style="width:'+(ST.feitos/ALUNO.semanaMeta*100)+'%"></i></div>'+
        '</div>'+
        '<div class="thought">'+
          '<div class="eyebrow plain" style="color:var(--ink-3)">Mente Slayter</div>'+
          '<p>“'+esc(PENSAMENTOS[1].t)+'”</p>'+
          '<span class="sig">Jesley Slayter</span>'+
          '<button class="btn btn-ghost btn-sm" data-view="mente" style="align-self:flex-start">Ler mais</button>'+
        '</div>'+
      '</div>'+
    '</div>'+

    '<div class="panel pad-l stack gap-m">'+
      secHead('Histórico recente','<button class="btn btn-ghost btn-xs" data-view="evolucao">Ver evolução completa</button>')+
      '<div class="tablebox"><table class="t"><thead><tr><th>Data</th><th>Treino</th><th class="num">Duração</th><th class="num">Séries</th><th class="num">Tonelagem</th><th class="num">RPE</th></tr></thead><tbody>'+
        ST.hist.slice(0,5).map(h => '<tr><td class="num nowrap" style="text-align:left">'+esc(h.d)+'</td><td>'+esc(h.t)+'</td>'+
          '<td class="num">'+h.dur+' min</td><td class="num">'+h.ser+'</td><td class="num">'+fmt(h.ton)+' kg</td><td class="num">'+h.rpe+'</td></tr>').join('')+
      '</tbody></table></div>'+
    '</div>'+

  '</div>';
}

/* ═══════════════ MEUS TREINOS ═══════════════════════════ */
function vTreinos(){
  const l = meusTreinos(), hoje = treinoDeHoje();
  return '<div class="stack gap-l">'+
    '<div><div class="eyebrow" style="margin-bottom:10px">Divisão do nível '+esc(nivel())+'</div>'+
    '<h2 class="d2">Sua semana de treino</h2>'+
    '<p class="lead" style="margin-top:12px">'+l.length+' sessões organizadas dentro da metodologia. Repita o ciclo respeitando ao menos um dia de recuperação entre sessões do mesmo grupamento.</p>'+
    (nivel() === 'Premium'
      ? '<div class="panel-2 pad mt-m" style="display:flex;gap:12px;align-items:flex-start">'+
        '<span style="color:var(--accent);flex:none;margin-top:1px">'+ico('bolt',17)+'</span>'+
        '<div><b style="font-size:.875rem;display:block;margin-bottom:3px">Estrutura avançada</b>'+
        '<span class="tiny muted">Sete exercícios por sessão: quatro multiarticulares na frente, com carga alta e descanso longo, e três isolados no fim, onde entram bi-set, drop set e rest-pause. '+
        '<button class="linkish" data-act="tecnicas">Ver as técnicas</button></span></div></div>'
      : '')+
    '</div>'+

    '<div class="cols cols-2">'+ l.map(t => {
      const ehHoje = t.id === hoje.id;
      return '<div class="panel pad-l stack gap-m"'+(ehHoje?' style="border-color:var(--accent-line)"':'')+'>'+
        '<div class="between"><span class="chip'+(ehHoje?' chip-accent':'')+'">Treino '+esc(t.cod)+'</span>'+
        (ehHoje?'<span class="tiny" style="color:var(--accent)">Hoje</span>':'<span class="tiny dim">~'+t.dur+' min</span>')+'</div>'+
        '<div><h3 class="h4" style="font-size:1.125rem">'+esc(t.nome)+'</h3>'+
        '<p class="tiny dim" style="margin:4px 0 0">'+esc(t.foco)+'</p></div>'+
        '<div class="today-ex">'+linhasTreino(t)+'</div>'+
        (t.final ? '<p class="tiny dim" style="margin:0">Finalizador de core: '+esc((EXMAP[t.final[0]]||{}).nome||'')+' — '+esc(t.final[1])+'</p>' : '')+
        '<button class="btn '+(ehHoje?'btn-primary':'btn-ghost')+' btn-block" data-start="'+esc(t.id)+'">'+(ehHoje?'Começar treino':'Treinar esta sessão')+'</button>'+
      '</div>';
    }).join('')+'</div>'+

    (nivel() === 'Premium' && typeof CARDIO_PREMIUM !== 'undefined'
      ? '<div class="panel pad-l stack gap-m">'+
        secHead(CARDIO_PREMIUM.titulo)+
        '<p class="tiny muted" style="margin:0">'+esc(CARDIO_PREMIUM.desc)+'</p>'+
        '<div class="today-ex">'+CARDIO_PREMIUM.itens.map(c =>
          '<button class="exrow" data-ex="'+esc(c[0])+'"><span class="nm">'+esc((EXMAP[c[0]]||{}).nome||'')+'</span>'+
          '<span class="sr">'+esc(c[1])+'</span></button>').join('')+'</div>'+
      '</div>' : '')+

    '<div class="notice info">'+ico('info',15)+'<div>Sua divisão muda conforme o nível contratado. Quem evolui de plano recebe automaticamente a divisão do novo nível, com progressão organizada pelo administrador da plataforma.</div></div>'+
  '</div>';
}

/* ═══════════════ EXECUÇÃO DO TREINO ═════════════════════ */
let RUN = null, RUNTIMER = null;

function iniciarTreino(tid){
  const t = TREINOS.filter(x => x.id === tid)[0] || treinoDeHoje();
  RUN = { tid:t.id, inicio:Date.now(), sets:{}, obs:{}, rest:0, restTotal:0 };
  t.itens.forEach(it => {
    const ultima = (ST.cargas[it[0]] || [])[0] || '';
    RUN.sets[it[0]] = Array.from({length: it[1]}, () => ({ kg: ultima, reps:'', done:false }));
  });
  go('treinar');
}

function vTreinar(){
  if (!RUN) return vTreinos();
  const t = TREINOS.filter(x => x.id === RUN.tid)[0];
  let total = 0, feitos = 0;
  Object.keys(RUN.sets).forEach(k => RUN.sets[k].forEach(s => { total++; if (s.done) feitos++; }));
  return '<div class="stack gap-l">'+
    '<div class="panel pad-l stack gap-m" style="position:sticky;top:64px;z-index:20;border-color:var(--accent-line)">'+
      '<div class="between">'+
        '<div><div class="eyebrow" style="margin-bottom:6px">Treino em andamento</div>'+
        '<h3 class="d3">'+esc(t.nome)+'</h3></div>'+
        '<div style="text-align:right"><div class="num" id="runClock" style="font-family:var(--fd);font-weight:800;font-size:1.5rem;letter-spacing:-.02em">00:00</div>'+
        '<div class="tiny dim">'+feitos+' de '+total+' séries</div></div>'+
      '</div>'+
      '<div class="bar good"><i id="runBar" style="width:'+(total?feitos/total*100:0)+'%"></i></div>'+
      '<div id="restBox" hidden></div>'+
    '</div>'+

    t.itens.map((it, xi) => {
      const ex = EXMAP[it[0]], sets = RUN.sets[ex.id];
      const x = extraDe(it), tec = tecDe(it);
      /* Par do bi-set: o exercício vizinho que compartilha a mesma letra. */
      let par = null;
      if (x.bi){
        const antes = t.itens[xi-1], depois = t.itens[xi+1];
        if (antes && extraDe(antes).bi === x.bi) par = EXMAP[antes[0]];
        else if (depois && extraDe(depois).bi === x.bi) par = EXMAP[depois[0]];
      }
      return '<div class="panel pad-l stack gap-m'+(x.bi?' em-biset':'')+'" id="exblock-'+esc(ex.id)+'">'+
        '<div class="between">'+
          '<div style="min-width:0"><div class="eyebrow plain" style="color:var(--ink-3);margin-bottom:5px">'+String(xi+1).padStart(2,'0')+' · '+esc(GRUPO_NOME[ex.mg])+(ehMulti(ex.id)?' · Multiarticular':' · Isolado')+'</div>'+
          '<h3 class="h4" style="font-size:1.0625rem">'+esc(ex.nome)+'</h3>'+
          '<p class="tiny dim" style="margin:4px 0 0">'+it[1]+' séries × '+esc(it[2])+' · '+
            (it[3] ? 'descanso '+it[3]+'s' : (x.bi ? 'emenda no próximo, sem descanso' : 'descanso livre'))+'</p></div>'+
          '<button class="btn btn-ghost btn-xs" data-ex="'+esc(ex.id)+'">Técnica e vídeo</button>'+
        '</div>'+
        (tec ? '<div class="tecbox'+(x.tec||'bi')+'">'+
          '<div class="row gap-s" style="gap:8px;align-items:center">'+
            '<span class="selo '+(x.tec||'bi')+'">'+esc(tec.sigla)+'</span>'+
            (par ? '<b class="tiny">com '+esc(par.nome)+'</b>' : '')+
            '<button class="tiny linkish" data-act="tecnicas" style="margin-left:auto">o que é</button>'+
          '</div>'+
          '<p class="tiny muted" style="margin:7px 0 0">'+esc(tec.como)+'</p>'+
        '</div>' : '')+
        '<div class="stack gap-s">'+
          '<div class="setgrid head"><span>Sér</span><span>Carga (kg)</span><span>Reps</span><span>RIR</span><span></span></div>'+
          sets.map((s, si) =>
            ((x.tec && si === sets.length-1)
              ? '<div class="setmarca">'+ico('bolt',12)+' Última série — aplique o '+esc(tec.nome.toLowerCase())+'</div>' : '')+
            '<div class="setgrid'+(s.done?' setdone':'')+((x.tec && si === sets.length-1)?' setfinal':'')+'" data-set="'+esc(ex.id)+':'+si+'">'+
              '<span class="setno">'+(si+1)+'</span>'+
              '<input class="setinput" type="number" inputmode="decimal" step="0.5" placeholder="—" value="'+esc(s.kg)+'" data-f="kg" id="set-'+esc(ex.id)+'-'+si+'-kg" aria-label="Carga série '+(si+1)+'">'+
              '<input class="setinput" type="number" inputmode="numeric" placeholder="'+esc(String(it[2]).split('–')[0])+'" value="'+esc(s.reps)+'" data-f="reps" id="set-'+esc(ex.id)+'-'+si+'-reps" aria-label="Repetições série '+(si+1)+'">'+
              '<input class="setinput" type="number" inputmode="numeric" placeholder="2" value="'+esc(s.rir||'')+'" data-f="rir" id="set-'+esc(ex.id)+'-'+si+'-rir" aria-label="Repetições em reserva série '+(si+1)+'">'+
              '<button class="setcheck'+(s.done?' on':'')+'" data-done="'+esc(ex.id)+':'+si+'" aria-label="Concluir série '+(si+1)+'" aria-pressed="'+(s.done?'true':'false')+'">'+ico('check',15,2.4)+'</button>'+
            '</div>').join('')+
        '</div>'+
        (ex.barra ? '<div class="platecalc" id="plate-'+esc(ex.id)+'">'+barraVisual(parseFloat(sets[0].kg)||20)+'</div>' : '')+
        '<div class="field"><label class="label" for="obs-'+esc(ex.id)+'">Observações</label>'+
        '<input class="input" id="obs-'+esc(ex.id)+'" data-obs="'+esc(ex.id)+'" placeholder="Sensação, dor, ajuste de execução, altura do banco…" value="'+esc(RUN.obs[ex.id]||'')+'"></div>'+
      '</div>';
    }).join('')+

    (t.final ? '<div class="panel pad-l stack gap-s" style="border-style:dashed">'+
      '<div class="eyebrow plain" style="color:var(--ink-3)">Finalizador de core</div>'+
      '<div class="between"><b style="font-size:.9375rem">'+esc((EXMAP[t.final[0]]||{}).nome||'')+'</b>'+
      '<span class="tiny muted num">'+esc(t.final[1])+'</span></div>'+
      '<p class="tiny dim" style="margin:0">Fora da conta das 7 séries principais. Faça se sobrar energia — nunca no lugar do treino.</p>'+
    '</div>' : '')+

    '<div style="display:flex;gap:10px;flex-wrap:wrap">'+
      '<button class="btn btn-primary" data-act="concluir-treino">Concluir treino</button>'+
      '<button class="btn btn-ghost" data-act="abandonar-treino">Sair sem salvar</button>'+
    '</div>'+
  '</div>';
}

function tickRun(){
  if (!RUN){ clearInterval(RUNTIMER); RUNTIMER = null; return; }
  const c = $('#runClock');
  if (!c){ clearInterval(RUNTIMER); RUNTIMER = null; return; }
  {
    const s = Math.floor((Date.now() - RUN.inicio)/1000);
    c.textContent = String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
  }
  if (RUN.rest > 0){
    RUN.rest--;
    const box = $('#restBox');
    if (box){
      box.hidden = false;
      box.innerHTML = '<div class="timerwrap">'+
        ring(RUN.restTotal ? RUN.rest/RUN.restTotal : 0, String(Math.floor(RUN.rest/60)).padStart(2,'0')+':'+String(RUN.rest%60).padStart(2,'0'))+
        '<div style="flex:1"><b style="font-size:.9375rem;display:block">Descanso</b>'+
        '<span class="tiny muted">Respire fundo. A próxima série começa quando o anel zerar.</span></div>'+
        '<button class="btn btn-ghost btn-sm" data-act="pular-descanso">Pular</button></div>';
    }
    if (RUN.rest === 0){
      const b = $('#restBox'); if (b) b.hidden = true;
      toast('Descanso concluído. Próxima série.', 'good');
    }
  }
}

function concluirTreino(){
  const t = TREINOS.filter(x => x.id === RUN.tid)[0];
  let ton = 0, ser = 0;
  Object.keys(RUN.sets).forEach(k => RUN.sets[k].forEach(s => {
    if (s.done){ ser++; ton += (parseFloat(s.kg)||0) * (parseInt(s.reps,10)||0); }
  }));
  const dur = Math.max(1, Math.round((Date.now() - RUN.inicio)/60000));
  // registra cargas para pré-preenchimento futuro
  Object.keys(RUN.sets).forEach(k => {
    const maior = Math.max.apply(null, RUN.sets[k].map(s => parseFloat(s.kg)||0));
    if (maior > 0) ST.cargas[k] = [maior].concat((ST.cargas[k]||[]).slice(0,9));
  });
  ST.obs = Object.assign(ST.obs || {}, RUN.obs);
  ST.hist = [{ d:new Date().toLocaleDateString('pt-BR'), t:t.nome, dur:dur, ser:ser, ton:Math.round(ton), rpe:8 }].concat(ST.hist);
  ST.feitos = Math.min(ALUNO.semanaMeta, ST.feitos + 1);
  ST.coins += 25;
  ST.ledger = [{ d:'Hoje', t:'Treino concluído — '+t.nome, v:+25 }].concat(ST.ledger);
  save();
  const resumo = { t:t.nome, dur:dur, ser:ser, ton:Math.round(ton) };
  RUN = null;
  modal({ title:'Treino concluído', body:
    '<div class="stack gap-m">'+
      '<div class="tiles">'+
        '<div class="tile"><span class="k">Duração</span><span class="v num">'+resumo.dur+'<span class="u">min</span></span></div>'+
        '<div class="tile"><span class="k">Séries feitas</span><span class="v num">'+resumo.ser+'</span></div>'+
        '<div class="tile"><span class="k">Tonelagem</span><span class="v num">'+fmt(resumo.ton)+'<span class="u">kg</span></span></div>'+
        '<div class="tile"><span class="k">CoinSlayter</span><span class="v num" style="color:var(--brass)">+25</span></div>'+
      '</div>'+
      '<p class="muted tiny" style="margin:0">Registro salvo no seu histórico. As cargas ficam guardadas e aparecem pré-preenchidas na próxima sessão deste treino.</p>'+
      '<label class="check"><input type="checkbox" id="pubFeed" checked> Publicar esta conquista no feed da Comunidade Slayter</label>'+
    '</div>',
    foot:'<button class="btn btn-ghost" data-close>Fechar</button><button class="btn btn-primary" data-act="fim-treino" data-resumo="'+esc(JSON.stringify(resumo))+'">Concluir</button>' });
}

/* ═══════════════ BIBLIOTECA DE EXERCÍCIOS ═══════════════ */
function vExercicios(){
  const f = ST.filtro, q = (ST.busca||'').toLowerCase();
  const lista = EX.filter(e => (f === 'todos' || e.mg === f) &&
    (!q || e.nome.toLowerCase().indexOf(q) >= 0 || GRUPO_NOME[e.mg].toLowerCase().indexOf(q) >= 0 || e.eq.toLowerCase().indexOf(q) >= 0));
  return '<div class="stack gap-m">'+
    '<div><div class="eyebrow" style="margin-bottom:10px">Biblioteca</div><h2 class="d2">Exercícios</h2>'+
    '<p class="lead" style="margin-top:12px">'+EX.length+' exercícios com técnica de execução, pontos de atenção, séries, repetições e descanso sugeridos.</p></div>'+
    '<div style="position:relative">'+
      '<span style="position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--ink-3)">'+ico('search',16)+'</span>'+
      '<input class="input" id="exBusca" placeholder="Buscar por exercício, grupo ou equipamento…" value="'+esc(ST.busca||'')+'" style="padding-left:38px">'+
    '</div>'+
    '<div class="filters">'+
      '<button class="fchip'+(f==='todos'?' on':'')+'" data-filtro="todos">Todos</button>'+
      GRUPOS.map(g => '<button class="fchip'+(f===g.id?' on':'')+'" data-filtro="'+g.id+'">'+esc(g.nome)+'</button>').join('')+
    '</div>'+
    (lista.length ? '<div class="exgrid">'+lista.map(e =>
      '<button class="excard" data-ex="'+esc(e.id)+'">'+
        '<span class="exthumb"><span class="tg knurl"></span>'+
          '<span class="lvl chip">'+esc(e.nivel)+'</span>'+
          '<span class="pl">'+ico('play',15,2)+'</span>'+
        '</span>'+
        '<span class="exbody"><span class="mg">'+esc(GRUPO_NOME[e.mg])+' · '+esc(e.eq)+'</span>'+
          '<b>'+esc(e.nome)+'</b>'+
          '<span class="pr">'+e.s+' × '+esc(e.r)+(e.d?' · '+e.d+'s':'')+'</span>'+
        '</span></button>').join('')+'</div>'
      : '<div class="panel empty">Nenhum exercício encontrado para esta busca.</div>')+
  '</div>';
}

function abrirExercicio(id){
  const e = EXMAP[id]; if (!e) return;
  const ultima = (ST.cargas[id]||[])[0];
  modal({ title:e.nome, wide:true, body:
    '<div class="split" style="gap:20px">'+
      '<div class="stack gap-m">'+
        '<div class="mediaslot wide"><span class="grain knurl"></span>'+
          '<button class="play" data-act="media" aria-label="Reproduzir vídeo demonstrativo">'+ico('play',18,2)+'</button>'+
          '<span class="cap">Vídeo demonstrativo — gravado por Jesley Slayter</span></div>'+
        '<div><div class="eyebrow" style="margin-bottom:10px">Técnica de execução</div>'+
          '<ol class="tiny muted" style="margin:0;padding-left:18px;line-height:1.85">'+e.tec.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></div>'+
        '<div><div class="eyebrow" style="margin-bottom:10px">Principais pontos de atenção</div>'+
          '<ul class="tiny" style="margin:0;padding-left:0;list-style:none;display:flex;flex-direction:column;gap:8px">'+
          e.at.map(x=>'<li style="display:flex;gap:9px"><span style="color:var(--warn);flex:none;margin-top:1px">'+ico('alert',14)+'</span><span class="muted">'+esc(x)+'</span></li>').join('')+'</ul></div>'+
      '</div>'+
      '<div class="stack gap-m">'+
        '<div class="panel-2 pad stack gap-s">'+
          '<div class="between tiny"><span class="muted">Grupo muscular</span><b>'+esc(GRUPO_NOME[e.mg])+'</b></div>'+
          '<div class="between tiny"><span class="muted">Equipamento</span><b>'+esc(e.eq)+'</b></div>'+
          '<div class="between tiny"><span class="muted">Nível</span><b>'+esc(e.nivel)+'</b></div>'+
          '<hr class="hr">'+
          '<div class="between tiny"><span class="muted">Séries</span><b>'+e.s+'</b></div>'+
          '<div class="between tiny"><span class="muted">Repetições</span><b>'+esc(e.r)+'</b></div>'+
          '<div class="between tiny"><span class="muted">Descanso</span><b>'+(e.d?e.d+' segundos':'livre')+'</b></div>'+
        '</div>'+
        (e.barra ? '<div class="panel-2 pad stack gap-s"><span class="label">Montagem da barra</span>'+
          '<div class="platecalc">'+barraVisual(ultima || 60)+'</div>'+
          '<span class="tiny dim">Cálculo para '+fmt(ultima||60)+' kg com barra olímpica de 20 kg.</span></div>' : '')+
        '<div class="field"><label class="label" for="exKg">Registrar carga (kg)</label>'+
          '<input class="input" id="exKg" type="number" step="0.5" placeholder="'+(ultima?esc(String(ultima)):'Ex.: 60')+'" value="'+(ultima?esc(String(ultima)):'')+'"></div>'+
        '<div class="field"><label class="label" for="exObs">Observações</label>'+
          '<textarea class="textarea" id="exObs" placeholder="O que você quer lembrar na próxima vez?">'+esc(ST.obs[id]||'')+'</textarea></div>'+
        (ST.cargas[id] && ST.cargas[id].length ? '<div class="panel-2 pad"><span class="label">Últimas cargas</span><div class="tiny muted mt-s">'+ST.cargas[id].slice(0,6).map(c=>fmt(c)+' kg').join(' · ')+'</div></div>' : '')+
      '</div>'+
    '</div>',
    foot:'<button class="btn btn-ghost" data-close>Fechar</button><button class="btn btn-primary" data-act="salvar-ex" data-id="'+esc(id)+'">Salvar registro</button>' });
}

/* ═══════════════ MINHA EVOLUÇÃO ═════════════════════════ */
function vEvolucao(){
  const totalTon = TON_12S.reduce((a,b)=>a+b,0);
  return '<div class="stack gap-l">'+
    '<div><div class="eyebrow" style="margin-bottom:10px">Desempenho e constância</div><h2 class="d2">Minha evolução</h2></div>'+

    '<div class="tiles">'+
      '<div class="tile"><span class="k">Sequência atual</span><span class="v num">'+ST.streak+'<span class="u">dias</span></span><span class="d">Recorde: 26 dias</span></div>'+
      '<div class="tile"><span class="k">Treinos no período</span><span class="v num">'+FREQ_12S.reduce((a,b)=>a+b,0)+'</span><span class="d">Últimas 12 semanas</span></div>'+
      '<div class="tile"><span class="k">Tonelagem acumulada</span><span class="v num">'+fmt(totalTon/1000)+'<span class="u">t</span></span><span class="d">Carga × repetições</span></div>'+
      '<div class="tile"><span class="k">Frequência média</span><span class="v num">3,3</span><span class="d">Treinos por semana</span></div>'+
    '</div>'+

    '<div class="panel pad-l stack gap-m">'+
      secHead('Evolução de carga nos exercícios base','<span class="tiny dim">kg · máximo da sessão</span>')+
      '<div class="legend">'+CARGA_SERIES.map(s=>'<span><i style="background:'+s.cor+'"></i>'+esc(s.nome)+'</span>').join('')+'</div>'+
      '<div class="chartbox">'+chartLines({ labels:CARGA_MESES,
        series:CARGA_SERIES.map(s=>({ nome:s.nome, cor:s.cor, v:s.v })), h:220,
        alt:'Carga máxima por mês: agachamento de 70 a 97 kg, supino de 52 a 67 kg, levantamento terra de 90 a 122 kg.' })+'</div>'+
      '<p class="tiny dim" style="margin:0">Progressão média de 5,4% ao mês nos três movimentos, com amplitude e cadência mantidas.</p>'+
    '</div>'+

    '<div class="split">'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Volume semanal','<span class="tiny dim">kg movimentados</span>')+
        '<div class="chartbox" data-tip="'+tip('Volume:', TON_12S.map((_,i)=>'Semana '+(i+1)), TON_12S.map(v=>fmt(v)+' kg'))+'">'+
          chartArea({ values:TON_12S, labels:TON_12S.map((_,i)=>'S'+(i+1)), uid:'v', labelEvery:2,
            yfmt:v=>fmt(v/1000)+'t', vfmt:v=>fmt(v/1000)+'t',
            alt:'Volume semanal subindo de 8.420 kg para cerca de 15.000 kg em 12 semanas.' })+'</div>'+
      '</div>'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Volume por grupamento','<span class="tiny dim">séries no mês</span>')+
        '<div class="chartbox">'+chartHBars({ pairs:VOL_GRUPO, alt:'Séries por grupamento muscular no mês, de 26 em costas a 8 em panturrilhas.' })+'</div>'+
      '</div>'+
    '</div>'+

    blocoComposicao()+

    '<div class="split">'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Metas')+
        '<div class="stack gap-m">'+METAS.map(m => {
          const p = Math.min(100, m.a/m.b*100);
          return '<div><div class="between tiny" style="margin-bottom:6px"><b>'+esc(m.t)+'</b>'+
            '<span class="muted num">'+fmt(m.a)+' / '+fmt(m.b)+' '+esc(m.u)+'</span></div>'+
            '<div class="bar"><i style="width:'+p+'%"></i></div></div>';
        }).join('')+'</div>'+
        '<button class="btn btn-ghost btn-sm" data-act="nova-meta" style="align-self:flex-start">Definir nova meta</button>'+
      '</div>'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Conquistas')+
        '<div class="stack gap-s">'+CONQUISTAS.map(c =>
          '<div style="display:flex;gap:12px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line)">'+
            '<span style="flex:none;color:'+(c.ok?'var(--brass)':'var(--ink-3)')+'">'+ico('trophy',19)+'</span>'+
            '<div style="flex:1;min-width:0"><b style="font-size:.8125rem;display:block">'+esc(c.t)+'</b>'+
            '<span class="tiny dim">'+esc(c.d)+'</span>'+
            (c.ok?'':'<div class="bar" style="margin-top:6px;height:3px"><i style="width:'+c.p+'%"></i></div>')+'</div>'+
            (c.ok?'<span class="chip chip-good">Conquistado</span>':'<span class="tiny dim nowrap">'+c.p+'%</span>')+
          '</div>').join('')+'</div>'+
      '</div>'+
    '</div>'+

    '<div class="panel pad-l stack gap-m">'+
      secHead('Histórico completo')+
      '<div class="tablebox"><table class="t"><thead><tr><th>Data</th><th>Treino</th><th class="num">Duração</th><th class="num">Séries</th><th class="num">Tonelagem</th><th class="num">RPE</th></tr></thead><tbody>'+
        ST.hist.map(h => '<tr><td class="num" style="text-align:left">'+esc(h.d)+'</td><td>'+esc(h.t)+'</td>'+
        '<td class="num">'+h.dur+' min</td><td class="num">'+h.ser+'</td><td class="num">'+fmt(h.ton)+' kg</td><td class="num">'+h.rpe+'</td></tr>').join('')+
      '</tbody></table></div>'+
      '<p class="tiny dim" style="margin:0">RPE: percepção subjetiva de esforço de 1 a 10, registrada ao fim de cada sessão.</p>'+
    '</div>'+
  '</div>';
}

/* ═══════════════ COMPOSIÇÃO CORPORAL ════════════════════ */
const medidas = () => (ST.medidas && ST.medidas.length) ? ST.medidas : MEDIDAS_SEED;

function blocoComposicao(){
  const l = medidas();
  const rot = l.map(m => m.data.slice(8,10) + '/' + m.data.slice(5,7));
  const ult = l[l.length-1], pri = l[0];
  const alt = (ST.anamnese || {}).altura_cm;
  const imc = alt && ult.peso ? (ult.peso / Math.pow(alt/100, 2)) : null;
  const dPeso = ult.peso - pri.peso, dCint = ult.cintura - pri.cintura;
  const sinal = (n) => (n > 0 ? '+' : '') + n.toFixed(1).replace('.', ',');

  return '<div class="panel pad-l stack gap-m">'+
    secHead('Composição corporal',
      '<button class="btn btn-ghost btn-xs" data-act="nova-medida">'+ico('plus',13)+' Registrar medida</button>')+
    '<div class="tiles">'+
      '<div class="tile"><span class="k">Peso atual</span><span class="v num">'+ult.peso.toFixed(1).replace('.',',')+'<span class="u">kg</span></span><span class="d">'+sinal(dPeso)+' kg no período</span></div>'+
      '<div class="tile"><span class="k">Cintura</span><span class="v num">'+ult.cintura.toFixed(1).replace('.',',')+'<span class="u">cm</span></span><span class="d">'+sinal(dCint)+' cm no período</span></div>'+
      '<div class="tile"><span class="k">Braço</span><span class="v num">'+(ult.braco||0).toFixed(1).replace('.',',')+'<span class="u">cm</span></span><span class="d">'+sinal((ult.braco||0)-(pri.braco||0))+' cm</span></div>'+
      (imc ? '<div class="tile"><span class="k">IMC de referência</span><span class="v num">'+imc.toFixed(1).replace('.',',')+'</span><span class="d">Só acompanhamento</span></div>'
           : '<div class="tile"><span class="k">IMC</span><span class="v" style="font-size:.9375rem;color:var(--ink-3)">Informe a altura</span><span class="d">Na sua ficha</span></div>')+
    '</div>'+
    '<div class="cols cols-2">'+
      '<div><div class="tiny dim" style="margin-bottom:6px">Peso corporal (kg)</div>'+
        '<div class="chartbox" data-tip="'+tip('Peso:', rot, l.map(m=>m.peso.toFixed(1).replace('.',',')+' kg'))+'">'+
        chartArea({ values:l.map(m=>m.peso), labels:rot, uid:'pes', h:160, zoom:true,
          yfmt:v=>v.toFixed(v%1?1:0).replace('.',','), vfmt:v=>v.toFixed(1).replace('.',','),
          alt:'Peso corporal subindo de '+pri.peso+' para '+ult.peso+' kg.' })+'</div></div>'+
      '<div><div class="tiny dim" style="margin-bottom:6px">Circunferência de cintura (cm)</div>'+
        '<div class="chartbox" data-tip="'+tip('Cintura:', rot, l.map(m=>m.cintura.toFixed(1).replace('.',',')+' cm'))+'">'+
        chartArea({ values:l.map(m=>m.cintura), labels:rot, uid:'cin', h:160, zoom:true, color:'var(--s1)',
          yfmt:v=>v.toFixed(v%1?1:0).replace('.',','), vfmt:v=>v.toFixed(1).replace('.',','),
          alt:'Cintura caindo de '+pri.cintura+' para '+ult.cintura+' cm.' })+'</div></div>'+
    '</div>'+
    '<p class="tiny dim" style="margin:0">Peso e cintura têm unidades diferentes, então cada um tem seu próprio gráfico — juntar os dois numa escala só distorceria a leitura. '+
    'O IMC aqui é referência de acompanhamento, não classificação nem diagnóstico.</p>'+
  '</div>';
}

function telaNovaMedida(){
  const campos = [['peso','Peso (kg)','Ex.: 84,0'],['cintura','Cintura (cm)','Na altura do umbigo'],
    ['braco','Braço (cm)','Contraído, no maior ponto'],['coxa','Coxa (cm)','Terço médio'],
    ['peito','Peito (cm)','Na linha dos mamilos'],['gordura','Gordura corporal (%)','Se tiver a medição']];
  modal({ title:'Registrar medida', body:
    '<div class="stack gap-m">'+
      '<div class="field"><label class="label" for="mdData">Data</label>'+
        '<input class="input" id="mdData" type="date" value="'+new Date().toISOString().slice(0,10)+'"></div>'+
      '<div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">'+
        campos.map(c => '<div class="field"><label class="label" for="md-'+c[0]+'">'+esc(c[1])+'</label>'+
          '<input class="input" id="md-'+c[0]+'" type="number" step="0.1" inputmode="decimal" placeholder="'+esc(c[2])+'"></div>').join('')+
      '</div>'+
      '<p class="help">Meça sempre no mesmo horário e nas mesmas condições — de manhã, em jejum, antes de treinar. Comparar medida da manhã com medida da noite não diz nada.</p>'+
    '</div>',
    foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" data-act="salvar-medida">Salvar</button>' });
}

/* ═══════════════ ANAMNESE ═══════════════════════════════ */
function telaAnamnese(){
  const a = ST.anamnese || {};
  const campo = (c) => {
    const [id, rot, tipo, extra] = c;
    const v = a[id] == null ? '' : a[id];
    if (tipo === 'check')
      return '<label class="check" style="grid-column:1/-1"><input type="checkbox" id="an-'+id+'"'+(v?' checked':'')+'> '+esc(rot)+'</label>';
    if (tipo === 'sel')
      return '<div class="field"><label class="label" for="an-'+id+'">'+esc(rot)+'</label><select class="select" id="an-'+id+'">'+
        '<option value=""></option>'+extra.split('|').map(o=>'<option'+(o===v?' selected':'')+'>'+esc(o)+'</option>').join('')+'</select></div>';
    if (tipo === 'texto')
      return '<div class="field" style="grid-column:1/-1"><label class="label" for="an-'+id+'">'+esc(rot)+'</label>'+
        '<textarea class="textarea" id="an-'+id+'" placeholder="'+esc(extra)+'" style="min-height:64px">'+esc(v)+'</textarea></div>';
    return '<div class="field"><label class="label" for="an-'+id+'">'+esc(rot)+'</label>'+
      '<input class="input" id="an-'+id+'" type="'+(tipo==='date'?'date':'number')+'" '+(tipo==='num'?'inputmode="decimal" step="0.1" ':'')+
      'placeholder="'+esc(extra)+'" value="'+esc(v)+'"></div>';
  };

  modal({ title:'Minha ficha', wide:true, body:
    '<div class="stack gap-l">'+
      '<p class="tiny muted" style="margin:0">Quanto mais completo, melhor o treino que chega até você. '+
      'Nada aqui é obrigatório — mas lesão, dor e condição de saúde mudam a escolha dos exercícios.</p>'+
      ANAMNESE_CAMPOS.map(bloco =>
        '<div>'+
          '<div class="eyebrow" style="margin-bottom:12px">'+esc(bloco.g)+
            (bloco.sensivel ? ' <span class="chip chip-warn" style="margin-left:8px">Dado sensível</span>' : '')+'</div>'+
          (bloco.sensivel ? '<p class="tiny dim" style="margin:0 0 12px">Informação de saúde tem proteção reforçada na LGPD. Fica visível só para você e para Jesley Slayter, é usada apenas para montar o seu treino, e você pode apagar quando quiser.</p>' : '')+
          '<div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">'+bloco.campos.map(campo).join('')+'</div>'+
        '</div>').join('')+
      '<label class="check"><input type="checkbox" id="anConsent"'+(ST.anamneseConsent?' checked':'')+'> '+
        'Autorizo o registro destas informações, <b>incluindo as de saúde</b>, para montar e ajustar meu treino na plataforma. '+
        'Sei que posso revogar e apagar a qualquer momento, sem perder o acesso.</label>'+
      '<div class="notice">'+ico('alert',15)+'<div>Esta ficha organiza informações para o acompanhamento do treino. '+
      '<b>Não é avaliação médica nem física</b>. Dor persistente, condição de saúde ou retorno de lesão pedem avaliação de um profissional de saúde antes de treinar.</div></div>'+
    '</div>',
    foot:'<div style="margin-right:auto">'+(ST.anamnese?'<button class="btn btn-danger btn-sm" data-act="apagar-ficha">Apagar meus dados</button>':'')+'</div>'+
      '<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" data-act="salvar-ficha">Salvar ficha</button>' });
}

/* ═══════════════ COMUNIDADE ═════════════════════════════ */
function vComunidade(){
  return '<div class="stack gap-l">'+
    '<div><div class="eyebrow" style="margin-bottom:10px">Exclusivo para alunos</div><h2 class="d2">Comunidade Slayter</h2>'+
    '<p class="lead" style="margin-top:12px">Espaço para compartilhar evolução, tirar dúvidas e treinar junto. Respeito é regra, não recomendação.</p></div>'+

    '<div class="tabs" id="comTabs">'+
      '<button class="tab'+(ST.comTab!=='chat'?' on':'')+'" data-com="feed">Feed</button>'+
      '<button class="tab'+(ST.comTab==='chat'?' on':'')+'" data-com="chat">Chat</button>'+
    '</div>'+
    (ST.comTab === 'chat' ? blocoChat() : blocoFeed())+
  '</div>';
}

function blocoFeed(){
  return '<div class="split" style="align-items:start">'+
    '<div class="stack gap-m">'+
      '<div class="panel pad stack gap-s">'+
        '<div style="display:flex;gap:11px"><span class="avatar accent">'+esc(ST.ini)+'</span>'+
        '<textarea class="textarea" id="novoPost" placeholder="Compartilhe seu treino, uma conquista ou uma dúvida…" style="min-height:66px"></textarea></div>'+
        '<div class="between"><span class="tiny dim">Publicações aprovadas valem +10 CoinSlayter (até 3 por semana).</span>'+
        '<button class="btn btn-primary btn-sm" data-act="publicar">Publicar</button></div>'+
      '</div>'+
      '<div class="stack gap-m" id="feedList">'+ST.posts.map(cardPost).join('')+'</div>'+
    '</div>'+
    '<div class="stack gap-m">'+
      '<div class="panel pad-l stack gap-s">'+
        '<div class="eyebrow plain" style="color:var(--ink-3)">Regras da comunidade</div>'+
        '<ul class="tiny muted" style="margin:0;padding-left:16px;line-height:1.85">'+
          '<li>Respeito a todas as pessoas, sem exceção.</li>'+
          '<li>Sem promessa de resultado garantido.</li>'+
          '<li>Sem venda de produtos ou serviços sem autorização.</li>'+
          '<li>Sem conteúdo que incentive prática de risco.</li>'+
          '<li>Dúvidas de saúde: procure um profissional.</li>'+
        '</ul>'+
        '<p class="tiny dim" style="margin:6px 0 0">Use o menu de cada publicação para denunciar ou bloquear. A moderação é feita pela equipe da plataforma.</p>'+
      '</div>'+
      '<div class="panel pad-l stack gap-s">'+
        '<div class="eyebrow plain" style="color:var(--ink-3)">Desafio do mês</div>'+
        '<h4 class="h4">Setembro — 16 sessões</h4>'+
        '<div class="between tiny"><span class="muted">Seu progresso</span><b>11 de 16</b></div>'+
        '<div class="bar"><i style="width:68%"></i></div>'+
        '<p class="tiny dim" style="margin:0">Concluir o desafio vale +300 CoinSlayter.</p>'+
      '</div>'+
    '</div>'+
  '</div>';
}

function cardPost(p){
  const js = p.autor === 'Jesley Slayter';
  return '<article class="post" data-post="'+esc(p.id)+'">'+
    '<header class="post-head">'+
      '<span class="avatar'+(p.admin?' accent':'')+(js?' jsp':'')+'">'+esc(p.ini)+'</span>'+
      '<div class="who" style="flex:1;min-width:0"><b>'+esc(p.autor)+(p.admin?' <span class="chip chip-accent" style="margin-left:4px">Criador</span>':'')+'</b>'+
      '<span>'+ago(p.min)+' atrás</span></div>'+
      '<div class="menu"><button class="xbtn" data-menu="'+esc(p.id)+'" aria-label="Opções da publicação">'+ico('more',17)+'</button></div>'+
    '</header>'+
    '<p class="post-text">'+esc(p.txt)+'</p>'+
    (p.att ? '<div class="post-att">'+
      '<span class="chip '+(p.att.tipo==='PR'?'chip-accent':'')+'">'+esc(p.att.tipo === 'PR' ? 'Recorde' : 'Treino')+'</span>'+
      '<div class="m"><b>'+esc(p.att.v)+'</b><span>'+esc(p.att.ex)+'</span></div>'+
      '<span class="tiny dim" style="margin-left:auto">'+esc(p.att.sub)+'</span></div>' : '')+
    '<footer class="post-acts">'+
      '<button class="pact'+(p.liked?' on':'')+'" data-like="'+esc(p.id)+'">'+ico('heart',15)+'<span class="num">'+fmt(p.likes)+'</span></button>'+
      '<button class="pact" data-com-open="'+esc(p.id)+'">'+ico('comment',15)+'<span class="num">'+p.coms.length+'</span></button>'+
    '</footer>'+
    (p.coms.length ? '<div class="stack" style="border-top:1px solid var(--line)">'+p.coms.map(c =>
      '<div class="comment"><span class="avatar sm">'+esc(c.ini)+'</span><div class="cb"><b>'+esc(c.a)+'</b>'+esc(c.t)+'</div></div>').join('')+'</div>' : '')+
    '<div hidden data-combox="'+esc(p.id)+'" style="display:flex;gap:9px;padding-top:9px">'+
      '<input class="input" data-cominput="'+esc(p.id)+'" placeholder="Escreva um comentário respeitoso…">'+
      '<button class="btn btn-ghost btn-sm" data-com-send="'+esc(p.id)+'">'+ico('send',15)+'</button></div>'+
  '</article>';
}

function blocoChat(){
  const c = ST.chats.filter(x => x.id === ST.chatAtivo)[0] || ST.chats[0];
  return '<div class="chat showlist">'+
    '<div class="chat-list">'+ST.chats.map(x =>
      '<button class="chat-item'+(x.id===c.id?' on':'')+'" data-chat="'+esc(x.id)+'">'+
        '<span class="avatar sm'+(x.oficial?' accent':'')+'">'+esc(x.oficial?'!':(x.dm?'JS':'#'))+'</span>'+
        '<span class="ci"><b>'+esc(x.nome)+'</b><span>'+esc(x.msgs.length?x.msgs[x.msgs.length-1].t:x.sub)+'</span></span>'+
      '</button>').join('')+'</div>'+
    '<div class="chat-main">'+
      '<div class="chat-head"><span class="avatar sm'+(c.oficial?' accent':'')+'">'+esc(c.oficial?'!':(c.dm?'JS':'#'))+'</span>'+
        '<div style="flex:1;min-width:0"><b style="font-size:.875rem;display:block">'+esc(c.nome)+'</b><span class="tiny dim">'+esc(c.sub)+'</span></div>'+
        '<button class="xbtn" data-act="chat-info" aria-label="Sobre este canal">'+ico('info',17)+'</button></div>'+
      '<div class="chat-msgs" id="chatMsgs">'+c.msgs.map(m => {
        if (m.a === 'sys') return '<div class="msg sys"><div class="bub">'+ico('bell',14)+' '+esc(m.t)+'</div></div>';
        if (m.a === 'me') return '<div class="msg me"><span class="avatar sm accent">'+esc(ST.ini)+'</span><div><div class="bub">'+esc(m.t)+'</div></div></div>';
        return '<div class="msg"><span class="avatar sm">'+esc(m.ini||'?')+'</span><div><span class="who">'+esc(m.a)+'</span><div class="bub">'+esc(m.t)+'</div></div></div>';
      }).join('')+'</div>'+
      (c.oficial ? '<div class="chat-compose"><span class="tiny dim" style="padding:8px">Canal somente leitura — comunicados oficiais da plataforma.</span></div>'
        : '<div class="chat-compose"><input class="input" id="chatInput" placeholder="Escreva uma mensagem…">'+
          '<button class="btn btn-primary btn-sm" data-act="chat-send">'+ico('send',15)+'</button></div>')+
    '</div>'+
  '</div>';
}

/* ═══════════════ COINSLAYTER ════════════════════════════ */
/* Próximo benefício ainda fora de alcance — o gancho de continuidade */
function proximoBeneficio(){
  const livres = BENEFICIOS.filter(b => ST.resgates.indexOf(b.id) < 0);
  const fora = livres.filter(b => b.custo > ST.coins).sort((a,b) => a.custo - b.custo);
  if (fora.length) return { b:fora[0], falta: fora[0].custo - ST.coins };
  const caro = livres.sort((a,b) => b.custo - a.custo)[0];
  return caro ? { b:caro, falta:0 } : null;
}
function nomeParceiro(pid){ const p = PARCEIROS.filter(x => x.id === pid)[0]; return p ? p.nome : ''; }

function blocoProximo(){
  const n = proximoBeneficio();
  if (!n) return '';
  const anterior = Math.max(0, n.b.custo - (n.falta || 0) - 0);
  const pct = Math.min(100, ST.coins / n.b.custo * 100);
  return '<div class="nextben">'+
    '<div class="between"><span class="eyebrow plain" style="color:var(--ink-3)">Próximo benefício</span>'+
    '<span class="chip chip-brass">'+ico('coin',12)+' '+fmt(n.b.custo)+'</span></div>'+
    '<b style="font-size:.9375rem;display:block;margin:8px 0 3px">'+esc(n.b.tit)+'</b>'+
    '<span class="tiny dim">'+esc(nomeParceiro(n.b.pid))+'</span>'+
    '<div class="bar brass" style="margin:12px 0 8px"><i style="width:'+pct+'%"></i></div>'+
    (n.falta > 0
      ? '<span class="tiny" style="color:var(--brass)">Faltam '+fmt(n.falta)+' CoinSlayter para desbloquear.</span>'
      : '<span class="tiny" style="color:var(--good)">Disponível para resgate agora.</span>')+
  '</div>';
}

/* Tela de recompensa — o momento que traz o aluno de volta */
function telaGanho(qtd, titulo){
  const n = proximoBeneficio();
  modal({ title: titulo || 'Recompensa', body:
    '<div class="reward">'+
      '<span class="reward-coin">'+ico('coin',30,1.6)+'</span>'+
      '<span class="reward-lbl">Você ganhou</span>'+
      '<div class="reward-v">+'+fmt(qtd)+'</div>'+
      '<span class="reward-unit">CoinSlayter</span>'+
      '<div class="reward-saldo">Saldo atual <b>'+fmt(ST.coins)+'</b></div>'+
      (n ? '<div class="reward-next">'+
        (n.falta > 0
          ? '<p style="margin:0 0 4px">Você está a <b style="color:var(--brass)">'+fmt(n.falta)+' Coins</b> de desbloquear:</p>'
          : '<p style="margin:0 0 4px">Você já pode desbloquear:</p>')+
        '<b style="font-size:.9375rem">'+esc(n.b.tit)+'</b>'+
        '<span class="tiny dim" style="display:block;margin-top:2px">'+esc(nomeParceiro(n.b.pid))+'</span>'+
        '<div class="bar brass" style="margin-top:11px"><i style="width:'+Math.min(100, ST.coins/n.b.custo*100)+'%"></i></div>'+
      '</div>' : '')+
    '</div>',
    foot:'<button class="btn btn-ghost" data-close>Fechar</button><button class="btn btn-brass" data-act="ver-beneficios">Ver benefícios</button>' });
}
S.telaGanho = telaGanho;

function vCoin(){
  const pmap = {}; PARCEIROS.forEach(p => pmap[p.id] = p);
  return '<div class="stack gap-l">'+
    '<div><div class="eyebrow" style="margin-bottom:10px">Clube de vantagens</div><h2 class="d2">CoinSlayter</h2>'+
    '<p class="lead" style="margin-top:12px">Moedas acumuladas por constância e participação, trocadas por benefícios em parceiros da plataforma.</p></div>'+

    '<div class="split">'+
      '<div class="wallet">'+
        '<span class="eyebrow plain" style="color:var(--ink-3)">Saldo CoinSlayter</span>'+
        '<div class="bal">'+fmt(ST.coins)+'</div>'+
        '<span class="tiny muted">Moedas disponíveis para resgate</span>'+
        '<hr class="hr" style="margin:14px 0">'+
        '<div class="between tiny"><span class="muted">Ganhos nos últimos 30 dias</span><b style="color:var(--good)">+'+fmt(ST.ledger.filter(l=>l.v>0).reduce((a,b)=>a+b.v,0))+'</b></div>'+
        '<div class="between tiny" style="margin-top:6px"><span class="muted">Resgatado</span><b>'+fmt(Math.abs(ST.ledger.filter(l=>l.v<0).reduce((a,b)=>a+b.v,0)))+'</b></div>'+
        blocoProximo()+
      '</div>'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Como ganhar moedas')+
        '<div class="tablebox" style="border:0"><table class="t" style="min-width:0"><tbody>'+
          REGRAS_COIN.map(r => '<tr><td>'+esc(r[0])+'<div class="tiny dim">'+esc(r[2])+'</div></td>'+
            '<td class="num" style="color:var(--brass);font-weight:700">'+esc(r[1])+'</td></tr>').join('')+
        '</tbody></table></div>'+
      '</div>'+
    '</div>'+

    '<div>'+secHead('Benefícios disponíveis','<span class="tiny dim">'+BENEFICIOS.length+' ofertas ativas</span>')+
      '<div class="cols cols-3">'+BENEFICIOS.map(b => {
        const p = pmap[b.pid], pode = ST.coins >= b.custo, usado = ST.resgates.indexOf(b.id) >= 0;
        return '<div class="benefit">'+
          '<div class="ph"><span class="plogo">'+esc(p.sig)+'</span>'+
            '<div style="min-width:0"><b style="font-size:.8125rem;display:block">'+esc(p.nome)+'</b>'+
            '<span class="tiny dim">'+esc(p.cat)+'</span></div>'+
            '<span class="disc" style="margin-left:auto">'+esc(b.disc)+'</span></div>'+
          '<p class="tiny muted" style="margin:0;flex:1">'+esc(b.tit)+'</p>'+
          '<div class="between tiny"><span class="chip chip-brass">'+ico('coin',12)+' '+fmt(b.custo)+'</span>'+
          '<span class="dim">'+esc(b.val)+'</span></div>'+
          '<button class="btn '+(usado?'btn-ghost':'btn-brass')+' btn-sm btn-block" data-resg="'+esc(b.id)+'"'+((!pode||usado)?' disabled':'')+'>'+
            (usado ? 'Benefício resgatado' : pode ? 'Resgatar benefício' : 'Faltam '+fmt(b.custo-ST.coins)+' moedas')+'</button>'+
        '</div>';
      }).join('')+'</div>'+
    '</div>'+

    '<div class="split">'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Histórico de moedas')+
        '<div class="ledger">'+ST.ledger.slice(0,10).map(l =>
          '<div class="ledrow"><span style="color:'+(l.v>0?'var(--good)':'var(--ink-3)')+'">'+ico(l.v>0?'plus':'coin',15)+'</span>'+
          '<div style="min-width:0"><div>'+esc(l.t)+'</div><span class="tiny dim">'+esc(l.d)+'</span></div>'+
          '<span class="amt '+(l.v>0?'pos':'neg')+'">'+(l.v>0?'+':'')+fmt(l.v)+'</span></div>').join('')+'</div>'+
      '</div>'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Parceiros')+
        '<div class="stack gap-s">'+PARCEIROS.map(p =>
          '<div style="display:flex;gap:11px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line)">'+
            '<span class="plogo">'+esc(p.sig)+'</span>'+
            '<div style="flex:1;min-width:0"><b style="font-size:.8125rem;display:block">'+esc(p.nome)+'</b>'+
            '<span class="tiny dim">'+esc(p.desc)+'</span></div>'+
            '<span class="chip">'+esc(p.cat)+'</span></div>').join('')+'</div>'+
        '<p class="tiny dim" style="margin:0">Parceiros exibidos a título de exemplo até a assinatura dos contratos do clube de vantagens.</p>'+
      '</div>'+
    '</div>'+
  '</div>';
}

/* ═══════════════ MENTE SLAYTER ══════════════════════════ */
function vMente(){
  return '<div class="stack gap-l">'+
    '<div><div class="eyebrow" style="margin-bottom:10px">Conteúdo autoral</div><h2 class="d2">Mente Slayter</h2>'+
    '<p class="lead" style="margin-top:12px">Pensamentos, reflexões e conteúdos sobre disciplina, constância e estilo de vida — escritos e gravados por Jesley Slayter.</p></div>'+

    '<div class="bandsplit">'+
      '<figure class="bandphoto"><img src="img/firmeza.jpg" alt="Jesley Slayter carregando anilhas de 20 kg"></figure>'+
      '<div class="bandtext" style="background:linear-gradient(140deg,rgba(242,112,58,.09),var(--bg-deep) 55%)">'+
        '<p class="quotebig">Firmeza com os processos e <b>gentileza com as pessoas.</b></p>'+
        '<div class="quote-by">O princípio que sustenta o método</div>'+
      '</div></div>'+

    '<div>'+secHead('Pensamentos')+
      '<div class="stack gap-m">'+PENSAMENTOS.map(p =>
        '<div class="thought"><div class="between"><span class="chip">'+esc(p.tag)+'</span><span class="tiny dim">'+ago(p.dias*1440)+' atrás</span></div>'+
        '<p>“'+esc(p.t)+'”</p>'+
        '<p class="tiny muted" style="margin:0;font-family:var(--fb);line-height:1.7">'+esc(p.c)+'</p>'+
        '<span class="sig">Jesley Slayter</span></div>').join('')+'</div>'+
    '</div>'+

    '<div>'+secHead('Vídeos, áudios e materiais')+
      '<div class="cols cols-3">'+CONTEUDOS.map(c =>
        '<div class="mediacard">'+
          '<div class="exthumb" style="aspect-ratio:16/9"><span class="tg knurl"></span>'+
            '<span class="lvl chip">'+esc(c.tipo)+'</span><span class="pl">'+ico(c.tipo==='Texto'?'library':'play',15,2)+'</span></div>'+
          '<div class="exbody" style="padding:14px"><b style="font-size:.9375rem">'+esc(c.t)+'</b>'+
          '<span class="tiny muted" style="line-height:1.55">'+esc(c.desc)+'</span>'+
          '<span class="pr">'+esc(c.dur)+'</span></div>'+
        '</div>').join('')+'</div>'+
    '</div>'+

    '<div class="notice">'+ico('alert',15)+'<div>Conteúdos de alimentação publicados aqui têm <b>caráter educativo</b> e não substituem o acompanhamento individualizado de um nutricionista.</div></div>'+
  '</div>';
}

/* ═══════════════ MEU PLANO ══════════════════════════════ */
function vPlano(){
  const p = PLANOS.filter(x => x.id === ST.plano)[0] || PLANOS[0];
  const rec = p.id === 'premium';
  const status = !ST.assinaturaAtiva ? ['Cancelada','chip-bad'] : ST.cancelSolicitado ? ['Cancelamento solicitado','chip-warn'] : ['Ativa','chip-good'];
  return '<div class="stack gap-l">'+
    '<div><div class="eyebrow" style="margin-bottom:10px">Assinatura</div><h2 class="d2">Minha assinatura</h2></div>'+

    '<div class="split">'+
      '<div class="panel pad-l stack gap-m">'+
        '<div class="between"><div class="plan-level">'+plates(p.nivel)+'<h3 class="h4" style="font-size:1.125rem">'+esc(p.nome)+'</h3></div>'+
        '<span class="chip '+status[1]+'">'+esc(status[0])+'</span></div>'+
        '<hr class="hr">'+
        '<div class="stack gap-s">'+
          '<div class="between tiny"><span class="muted">Valor</span><b>'+brl(p.preco)+' '+(rec?'/ mês':'(pagamento único)')+'</b></div>'+
          '<div class="between tiny"><span class="muted">Data de contratação</span><b>'+esc(ALUNO.desde)+'</b></div>'+
          '<div class="between tiny"><span class="muted">Próxima cobrança</span><b>'+(rec?esc(ALUNO.proxima):'—')+'</b></div>'+
          '<div class="between tiny"><span class="muted">Período de fidelidade</span><b>3 meses · até 12/09/2026</b></div>'+
          '<div class="between tiny"><span class="muted">Forma de pagamento</span><b>Cartão de crédito •••• 4417</b></div>'+
        '</div>'+
        '<hr class="hr">'+
        '<div style="display:flex;gap:10px;flex-wrap:wrap">'+
          '<button class="btn btn-ghost btn-sm" data-act="trocar-plano">Trocar de plano</button>'+
          '<button class="btn btn-ghost btn-sm" data-act="trocar-pagamento">Alterar pagamento</button>'+
          '<button class="btn btn-danger btn-sm" data-act="cancelar">Cancelar assinatura</button>'+
        '</div>'+
      '</div>'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Condições comerciais')+
        '<div class="stack gap-s tiny muted" style="line-height:1.7">'+
          '<p style="margin:0"><b style="color:var(--ink)">Fidelidade de 3 meses.</b> Período mínimo de permanência contado da data de contratação, apresentado antes da compra.</p>'+
          '<p style="margin:0"><b style="color:var(--ink)">Cancelamento.</b> "Solicitações de cancelamento devem ser realizadas com antecedência mínima de 30 dias em relação à próxima cobrança, observadas as condições do contrato de fidelidade."</p>'+
          '<p style="margin:0"><b style="color:var(--ink)">Arrependimento.</b> Compras on-line observam o direito de arrependimento de 7 dias (art. 49 do CDC).</p>'+
        '</div>'+
        '<div class="notice">'+ico('alert',15)+'<div>Minuta em rascunho, pendente de revisão jurídica e adequação ao CDC e à LGPD antes da operação comercial.</div></div>'+
      '</div>'+
    '</div>'+

    '<div class="panel pad-l stack gap-m">'+
      secHead('Histórico de pagamentos')+
      '<div class="tablebox"><table class="t"><thead><tr><th>Data</th><th>Descrição</th><th>Forma</th><th class="num">Valor</th><th>Status</th></tr></thead><tbody>'+
        [['12/09/2026','Premium — mensalidade','Cartão •••• 4417',89.90,'Pago'],
         ['12/08/2026','Premium — mensalidade','Cartão •••• 4417',89.90,'Pago'],
         ['12/07/2026','Premium — mensalidade','Cartão •••• 4417',89.90,'Pago'],
         ['12/06/2026','Premium — primeira cobrança','PIX',89.90,'Pago']].map(r =>
          '<tr><td class="num" style="text-align:left">'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td class="dim">'+esc(r[2])+'</td>'+
          '<td class="num">'+brl(r[3])+'</td><td><span class="chip chip-good">'+esc(r[4])+'</span></td></tr>').join('')+
      '</tbody></table></div>'+
      '<p class="tiny dim" style="margin:0">Notas fiscais e recibos são emitidos pelo provedor de pagamento na versão de produção.</p>'+
    '</div>'+
  '</div>';
}

/* ═══════════════ PERFIL ═════════════════════════════════ */
const NOTIF_LABELS = [
  ['treino','Lembrete de treino'],['novoTreino','Novo treino disponível'],['feed','Nova publicação no feed'],
  ['coment','Comentários nas minhas publicações'],['conquista','Conquistas'],['desafio','Desafios'],
  ['coin','Novos benefícios CoinSlayter'],['jesley','Conteúdo novo de Jesley Slayter'],['cobranca','Avisos de assinatura e cobrança']
];
function vPerfil(){
  const ob = ST.onboard || {};
  return '<div class="stack gap-l">'+
    '<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">'+
      '<span class="avatar accent lg'+(ST.nome === ALUNO.nome ? ' jsp' : '')+'">'+esc(ST.ini)+'</span>'+
      '<div><h2 class="d2" style="font-size:clamp(1.5rem,3.4vw,2.1rem)">'+esc(ST.nome)+'</h2>'+
      '<p class="tiny dim" style="margin:4px 0 0">'+esc(ALUNO.email)+' · Aluno desde '+esc(ALUNO.desde)+'</p></div>'+
    '</div>'+

    '<div class="split">'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Minha ficha','<button class="btn btn-primary btn-xs" data-act="ficha">'+(ST.anamnese?'Editar ficha':'Preencher ficha')+'</button>')+
        (ST.anamnese
          ? '<div class="stack gap-s tiny">'+
            [['Altura', (ST.anamnese.altura_cm||'—')+' cm'],
             ['Objetivo', ST.anamnese.objetivo || '—'],
             ['Experiência', ST.anamnese.experiencia || '—'],
             ['Sono', (ST.anamnese.sono_horas||'—')+' h por noite'],
             ['Lesões declaradas', ST.anamnese.lesoes || 'Nenhuma'],
             ['Liberação médica', ST.anamnese.liberacao_medica ? 'Sim' : 'Não informada']
            ].map(x => '<div class="between"><span class="muted">'+esc(x[0])+'</span><b style="text-align:right;max-width:60%">'+esc(x[1])+'</b></div>').join('')+
            '</div>'
          : '<p class="tiny muted" style="margin:0">Altura, objetivo, histórico de lesão e rotina. É o que permite ajustar o treino ao seu caso em vez de entregar o mesmo para todo mundo.</p>')+
      '</div>'+

      '<div class="panel pad-l stack gap-m">'+
        secHead('Dados e preferências de treino','<button class="btn btn-ghost btn-xs" data-act="editar-perfil">Editar</button>')+
        '<div class="stack gap-s tiny">'+
          ['Idade|'+(ob.idade||ALUNO.idade)+' anos',
           'Objetivo|'+(ob.objetivo||ALUNO.objetivo),
           'Nível de treinamento|'+(ob.nivel||ALUNO.nivel),
           'Frequência semanal desejada|'+(ob.freq||(ALUNO.freq+' dias')),
           'Experiência com musculação|'+(ob.exp||ALUNO.exp),
           'Preferências|'+(Array.isArray(ob.pref)?ob.pref.join(', '):'Musculação, Cardio incluído')
          ].map(x => { const a = x.split('|');
            return '<div class="between"><span class="muted">'+esc(a[0])+'</span><b style="text-align:right">'+esc(a[1])+'</b></div>'; }).join('')+
        '</div>'+
      '</div>'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Notificações')+
        '<div class="stack gap-s">'+NOTIF_LABELS.map(n =>
          '<div class="between"><span class="tiny">'+esc(n[1])+'</span>'+
          '<label class="switch"><input type="checkbox" data-notif="'+n[0]+'" id="nt-'+n[0]+'"'+(ST.notif[n[0]]?' checked':'')+'><span></span></label></div>').join('')+'</div>'+
      '</div>'+
    '</div>'+

    '<div class="split">'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Segurança da conta')+
        '<div class="stack gap-s">'+
          '<button class="navitem" data-act="trocar-senha">'+ico('lock')+'Alterar senha</button>'+
          '<button class="navitem" data-act="sessoes">'+ico('shield')+'Sessões ativas</button>'+
          '<button class="navitem" data-act="verificacao">'+ico('check')+'Verificação em duas etapas</button>'+
        '</div>'+
        '<p class="tiny dim" style="margin:0">Login seguro, recuperação de senha por e-mail e proteção dos dados do usuário fazem parte da arquitetura da plataforma.</p>'+
      '</div>'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Privacidade e dados (LGPD)')+
        '<div class="stack gap-s">'+
          '<button class="navitem" data-act="exportar">'+ico('chart')+'Exportar meus dados</button>'+
          '<button class="navitem" data-doc="privacidade">'+ico('info')+'Política de privacidade</button>'+
          '<button class="navitem" data-act="consentimentos">'+ico('edit')+'Gerenciar consentimentos</button>'+
          '<button class="navitem" data-act="excluir-conta" style="color:var(--bad)">'+ico('trash')+'Excluir minha conta</button>'+
        '</div>'+
      '</div>'+
    '</div>'+

    '<div class="panel pad-l stack gap-s">'+
      secHead('Documentos')+
      '<div style="display:flex;gap:10px;flex-wrap:wrap">'+
        '<button class="btn btn-ghost btn-sm" data-doc="termos">Termos de uso</button>'+
        '<button class="btn btn-ghost btn-sm" data-doc="privacidade">Política de privacidade</button>'+
        '<button class="btn btn-ghost btn-sm" data-doc="cancelamento">Política de cancelamento</button>'+
        '<button class="btn btn-ghost btn-sm" data-doc="lgpd">Tratamento de dados</button>'+
      '</div>'+
    '</div>'+
  '</div>';
}

/* ═══════════════ PAINEL ADMINISTRATIVO ══════════════════ */
const ADMIN_TABS = [['alunos','Alunos'],['treinos','Treinos'],['conteudo','Conteúdo'],['comunidade','Comunidade'],['coin','CoinSlayter'],['financeiro','Financeiro']];
function vAdmin(){
  const tab = ST.adminTab || 'alunos';
  return '<div class="stack gap-l">'+
    '<div class="between"><div><div class="eyebrow" style="margin-bottom:10px">Acesso exclusivo · Jesley Slayter</div>'+
    '<h2 class="d2">Painel administrativo</h2></div>'+
    '<span class="chip chip-accent">'+ico('shield',13)+' Administrador</span></div>'+
    '<div class="tabs">'+ADMIN_TABS.map(t =>
      '<button class="tab'+(tab===t[0]?' on':'')+'" data-admtab="'+t[0]+'">'+esc(t[1])+'</button>').join('')+'</div>'+
    ({ alunos:admAlunos, treinos:admTreinos, conteudo:admConteudo, comunidade:admComunidade, coin:admCoin, financeiro:admFin }[tab] || admAlunos)()+
  '</div>';
}

function admAlunos(){
  const stChip = s => s==='Ativo'?'chip-good':s==='Inadimplente'?'chip-bad':'chip-warn';
  return '<div class="stack gap-m">'+
    '<div class="tiles">'+
      '<div class="tile"><span class="k">Alunos ativos</span><span class="v num">388</span><span class="d">+24 no mês</span></div>'+
      '<div class="tile"><span class="k">Inadimplentes</span><span class="v num" style="color:var(--bad)">11</span><span class="d">2,8% da base</span></div>'+
      '<div class="tile"><span class="k">Em fidelidade</span><span class="v num">163</span><span class="d">Primeiros 3 meses</span></div>'+
      '<div class="tile"><span class="k">Cancelamentos no mês</span><span class="v num">6</span><span class="d">Taxa de 1,5%</span></div>'+
    '</div>'+
    '<div class="panel pad-l stack gap-m">'+
      secHead('Base de alunos','<div style="display:flex;gap:8px"><button class="btn btn-ghost btn-xs" data-act="adm-exportar">Exportar CSV</button><button class="btn btn-primary btn-xs" data-act="adm-novo-aluno">'+ico('plus',13)+' Cadastrar aluno</button></div>')+
      '<div class="tablebox"><table class="t"><thead><tr><th>Aluno</th><th>Plano</th><th>Status</th><th>Fidelidade</th><th class="num">Valor</th><th>Desde</th><th></th></tr></thead><tbody>'+
        ALUNOS_ADMIN.map((a,i) => '<tr><td><b>'+esc(a.n)+'</b><div class="tiny dim">'+esc(a.e)+'</div></td>'+
          '<td>'+esc(a.p)+'</td><td><span class="chip '+stChip(a.s)+'">'+esc(a.s)+'</span></td>'+
          '<td class="dim">'+esc(a.f)+'</td><td class="num">'+brl(a.v)+'</td><td class="num">'+esc(a.d)+'</td>'+
          '<td><div style="display:flex;gap:4px;justify-content:flex-end">'+
            '<button class="xbtn" data-adm-aluno="'+i+'" aria-label="Editar aluno">'+ico('edit',15)+'</button>'+
            '<button class="xbtn" data-adm-susp="'+i+'" aria-label="Suspender acesso">'+ico('ban',15)+'</button>'+
          '</div></td></tr>').join('')+
      '</tbody></table></div>'+
      '<p class="tiny dim" style="margin:0">Dados de demonstração. O administrador pode cadastrar, editar e visualizar alunos, gerenciar assinaturas, ver status de pagamento e suspender acesso quando aplicável.</p>'+
    '</div>'+
  '</div>';
}

function admTreinos(){
  return '<div class="stack gap-m">'+
    '<div class="split">'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Treinos publicados','<button class="btn btn-primary btn-xs" data-act="adm-novo-treino">'+ico('plus',13)+' Criar treino</button>')+
        '<div class="tablebox"><table class="t" style="min-width:520px"><thead><tr><th>Treino</th><th>Nível</th><th class="num">Exercícios</th><th class="num">Duração</th><th></th></tr></thead><tbody>'+
          TREINOS.map(t => '<tr><td><b>'+esc(t.cod)+' — '+esc(t.nome)+'</b><div class="tiny dim">'+esc(t.foco)+'</div></td>'+
            '<td><span class="chip">'+esc(t.nivel)+'</span></td><td class="num">'+t.itens.length+'</td><td class="num">'+t.dur+' min</td>'+
            '<td><div style="display:flex;gap:4px;justify-content:flex-end"><button class="xbtn" data-act="adm-edit" aria-label="Editar">'+ico('edit',15)+'</button></div></td></tr>').join('')+
        '</tbody></table></div>'+
      '</div>'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Biblioteca','<button class="btn btn-ghost btn-xs" data-act="adm-novo-ex">'+ico('plus',13)+' Novo exercício</button>')+
        '<div class="stack gap-s">'+GRUPOS.map(g => {
          const n = EX.filter(e => e.mg === g.id).length;
          return '<div class="between tiny" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>'+esc(g.nome)+'</span>'+
            '<span class="dim num">'+n+' exercício'+(n>1?'s':'')+'</span></div>';
        }).join('')+'</div>'+
        '<p class="tiny dim" style="margin:0">Em cada exercício o administrador define nome, vídeo, técnica, pontos de atenção, séries, repetições e descanso.</p>'+
      '</div>'+
    '</div>'+
  '</div>';
}

function admConteudo(){
  return '<div class="stack gap-m">'+
  '<div class="panel pad-l stack gap-m">'+
    secHead('Casos de alunos (página inicial)','<button class="btn btn-primary btn-xs" data-act="adm-novo-caso">'+ico('plus',13)+' Publicar caso</button>')+
    '<div class="tablebox"><table class="t" style="min-width:560px"><thead><tr><th>Aluno</th><th>Tempo</th><th>Autorização de imagem</th><th>Relato</th><th>Status</th><th></th></tr></thead><tbody>'+
      [1,2,3].map(i => '<tr><td class="dim">Vaga '+String(i).padStart(2,'0')+'</td><td class="dim">—</td>'+
        '<td><span class="chip chip-warn">Pendente</span></td><td class="dim">—</td>'+
        '<td><span class="chip">Não publicado</span></td>'+
        '<td><button class="xbtn" data-act="adm-novo-caso" aria-label="Preencher caso">'+ico('edit',15)+'</button></td></tr>').join('')+
    '</tbody></table></div>'+
    '<p class="tiny dim" style="margin:0">Um caso só vai ao ar com autorização de uso de imagem e relato assinados pelo aluno. A evolução exibida vem dos registros de treino da própria plataforma.</p>'+
  '</div>'+
  '<div class="split">'+
    '<div class="panel pad-l stack gap-m">'+
      secHead('Mente Slayter','<button class="btn btn-primary btn-xs" data-act="adm-novo-pensamento">'+ico('plus',13)+' Publicar</button>')+
      '<div class="stack gap-s">'+PENSAMENTOS.map(p =>
        '<div style="display:flex;gap:11px;padding:10px 0;border-bottom:1px solid var(--line)">'+
          '<span class="chip">'+esc(p.tag)+'</span>'+
          '<div style="flex:1;min-width:0"><b style="font-size:.8125rem;display:block">“'+esc(p.t)+'”</b>'+
          '<span class="tiny dim">publicado '+ago(p.dias*1440)+' atrás</span></div>'+
          '<button class="xbtn" data-act="adm-edit" aria-label="Editar">'+ico('edit',15)+'</button></div>').join('')+'</div>'+
    '</div>'+
    '<div class="panel pad-l stack gap-m">'+
      secHead('Vídeos, áudios e materiais','<button class="btn btn-ghost btn-xs" data-act="adm-novo-conteudo">'+ico('plus',13)+' Novo</button>')+
      '<div class="stack gap-s">'+CONTEUDOS.map(c =>
        '<div class="between" style="padding:9px 0;border-bottom:1px solid var(--line)">'+
          '<div style="min-width:0"><b style="font-size:.8125rem;display:block">'+esc(c.t)+'</b>'+
          '<span class="tiny dim">'+esc(c.tipo)+' · '+esc(c.dur)+'</span></div>'+
          '<button class="xbtn" data-act="adm-edit" aria-label="Editar">'+ico('edit',15)+'</button></div>').join('')+'</div>'+
      '<button class="btn btn-ghost btn-sm" data-act="adm-novo-desafio">Criar desafio mensal</button>'+
    '</div>'+
  '</div>'+
  '</div>';
}

function admComunidade(){
  return '<div class="stack gap-m">'+
    '<div class="tiles">'+
      '<div class="tile"><span class="k">Publicações no mês</span><span class="v num">1.284</span></div>'+
      '<div class="tile"><span class="k">Denúncias abertas</span><span class="v num" style="color:var(--warn)">2</span></div>'+
      '<div class="tile"><span class="k">Usuários bloqueados</span><span class="v num">4</span></div>'+
      '<div class="tile"><span class="k">Tempo médio de resposta</span><span class="v num">3<span class="u">h</span></span></div>'+
    '</div>'+
    '<div class="panel pad-l stack gap-m">'+
      secHead('Fila de denúncias')+
      '<div class="tablebox"><table class="t"><thead><tr><th>Tipo</th><th>Autor</th><th>Motivo</th><th>Recebida</th><th>Status</th><th></th></tr></thead><tbody>'+
        DENUNCIAS.map((d,i) => '<tr><td>'+esc(d.q)+'</td><td class="dim">'+esc(d.a)+'</td><td>'+esc(d.m)+'</td>'+
          '<td class="dim num">'+ago(d.min)+'</td><td><span class="chip '+(d.st==='Aberta'?'chip-warn':'chip-good')+'">'+esc(d.st)+'</span></td>'+
          '<td><div style="display:flex;gap:4px;justify-content:flex-end">'+
            '<button class="xbtn" data-act="adm-remover" aria-label="Remover conteúdo">'+ico('trash',15)+'</button>'+
            '<button class="xbtn" data-act="adm-bloquear" aria-label="Bloquear usuário">'+ico('ban',15)+'</button>'+
            '<button class="xbtn" data-act="adm-arquivar" aria-label="Arquivar denúncia">'+ico('check',15)+'</button>'+
          '</div></td></tr>').join('')+
      '</tbody></table></div>'+
    '</div>'+
    '<div class="panel pad-l stack gap-m">'+
      secHead('Enviar comunicado')+
      '<div class="field"><label class="label" for="admAviso">Mensagem para o canal Avisos da plataforma</label>'+
      '<textarea class="textarea" id="admAviso" placeholder="Ex.: Novo ciclo de treinos publicado…"></textarea></div>'+
      '<button class="btn btn-primary btn-sm" data-act="adm-enviar-aviso" style="align-self:flex-start">Enviar comunicado</button>'+
    '</div>'+
  '</div>';
}

function admCoin(){
  const pmap = {}; PARCEIROS.forEach(p => pmap[p.id] = p);
  return '<div class="stack gap-m">'+
    '<div class="tiles">'+
      '<div class="tile"><span class="k">Moedas em circulação</span><span class="v num" style="color:var(--brass)">742.510</span></div>'+
      '<div class="tile"><span class="k">Resgates no mês</span><span class="v num">218</span></div>'+
      '<div class="tile"><span class="k">Parceiros ativos</span><span class="v num">'+PARCEIROS.length+'</span></div>'+
      '<div class="tile"><span class="k">Campanha ativa</span><span class="v" style="font-size:1rem">Setembro 2×</span><span class="d">15 a 30/09</span></div>'+
    '</div>'+
    '<div class="split">'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Benefícios','<button class="btn btn-primary btn-xs" data-act="adm-novo-beneficio">'+ico('plus',13)+' Criar benefício</button>')+
        '<div class="tablebox"><table class="t" style="min-width:560px"><thead><tr><th>Parceiro</th><th>Benefício</th><th class="num">Custo</th><th class="num">Estoque</th><th>Validade</th><th></th></tr></thead><tbody>'+
          BENEFICIOS.map(b => '<tr><td><b>'+esc(pmap[b.pid].nome)+'</b><div class="tiny dim">'+esc(pmap[b.pid].cat)+'</div></td>'+
            '<td>'+esc(b.tit)+'</td><td class="num" style="color:var(--brass)">'+fmt(b.custo)+'</td><td class="num">'+b.est+'</td>'+
            '<td class="dim">'+esc(b.val.replace('Válido até ',''))+'</td>'+
            '<td><button class="xbtn" data-act="adm-edit" aria-label="Editar">'+ico('edit',15)+'</button></td></tr>').join('')+
        '</tbody></table></div>'+
      '</div>'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Regras de ganho','<button class="btn btn-ghost btn-xs" data-act="adm-edit">Editar</button>')+
        '<div class="stack gap-s tiny">'+REGRAS_COIN.map(r =>
          '<div class="between" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>'+esc(r[0])+'</span>'+
          '<b style="color:var(--brass)">'+esc(r[1])+'</b></div>').join('')+'</div>'+
        '<button class="btn btn-ghost btn-sm" data-act="adm-nova-campanha">Criar campanha especial</button>'+
        '<button class="btn btn-ghost btn-sm" data-act="adm-novo-parceiro">Cadastrar parceiro</button>'+
      '</div>'+
    '</div>'+
  '</div>';
}

function admFin(){
  return '<div class="stack gap-m">'+
    '<div class="tiles">'+
      '<div class="tile"><span class="k">Receita do mês</span><span class="v num">'+brl(RECEITA_V[RECEITA_V.length-1])+'</span><span class="d">+11,6% vs. agosto</span></div>'+
      '<div class="tile"><span class="k">Receita recorrente</span><span class="v num">'+brl(214*89.90)+'</span><span class="d">214 assinaturas Premium</span></div>'+
      '<div class="tile"><span class="k">Ticket médio</span><span class="v num">'+brl(73.40)+'</span></div>'+
      '<div class="tile"><span class="k">Inadimplência</span><span class="v num">2,8<span class="u">%</span></span><span class="d">11 alunos</span></div>'+
    '</div>'+
    '<div class="split">'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Receita dos últimos 6 meses','<span class="tiny dim">reais</span>')+
        '<div class="chartbox" data-tip="'+tip('Receita:', RECEITA_MESES, RECEITA_V.map(v=>brl(v)))+'">'+
          chartBars({ values:RECEITA_V, labels:RECEITA_MESES, h:200, bw:44, labelEvery:5,
            yfmt:v=>fmt(v/1000)+'k', vfmt:v=>fmt(v/1000)+'k',
            alt:'Receita mensal subindo de R$ 18.420 em abril para R$ 34.910 em setembro.' })+'</div>'+
      '</div>'+
      '<div class="panel pad-l stack gap-m">'+
        secHead('Assinaturas por plano','<span class="tiny dim">ativas</span>')+
        '<div class="chartbox">'+chartHBars({ pairs:MIX_PLANOS, alt:'Premium com 214 assinaturas, Intermediário 96 e Iniciante 78.' })+'</div>'+
        '<div class="stack gap-s tiny">'+MIX_PLANOS.map(m =>
          '<div class="between" style="padding:6px 0;border-bottom:1px solid var(--line)"><span>'+esc(m[0])+'</span>'+
          '<b>'+brl(m[1] * (m[0]==='Premium'?89.90:m[0]==='Intermediário'?59.90:29.90))+'</b></div>').join('')+'</div>'+
      '</div>'+
    '</div>'+
    '<div class="panel pad-l stack gap-m">'+
      secHead('Movimentações recentes','<button class="btn btn-ghost btn-xs" data-act="adm-exportar">Exportar</button>')+
      '<div class="tablebox"><table class="t"><thead><tr><th>Data</th><th>Aluno</th><th>Tipo</th><th>Forma</th><th class="num">Valor</th><th>Status</th></tr></thead><tbody>'+
        [['18/09/2026','Paula Ribeiro','Contratação — Iniciante','PIX',29.90,'Pago','chip-good'],
         ['17/09/2026','Bianca Lopes','Renovação — Intermediário','Cartão',59.90,'Pago','chip-good'],
         ['17/09/2026','Diego Farias','Renovação — Premium','Cartão',89.90,'Recusado','chip-bad'],
         ['16/09/2026','Thiago Nogueira','Cancelamento solicitado','—',0,'Em análise','chip-warn'],
         ['15/09/2026','Camila Torres','Renovação — Premium','Cartão',89.90,'Pago','chip-good']].map(r =>
          '<tr><td class="num" style="text-align:left">'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td>'+
          '<td class="dim">'+esc(r[3])+'</td><td class="num">'+(r[4]?brl(r[4]):'—')+'</td>'+
          '<td><span class="chip '+r[6]+'">'+esc(r[5])+'</span></td></tr>').join('')+
      '</tbody></table></div>'+
    '</div>'+
  '</div>';
}

/* ═══════════════ REGISTRO DE TELAS ══════════════════════ */
S.views = { home:vHome, treinos:vTreinos, treinar:vTreinar, exercicios:vExercicios, evolucao:vEvolucao,
  comunidade:vComunidade, coin:vCoin, mente:vMente, plano:vPlano, perfil:vPerfil, admin:vAdmin };

S.after = {
  treinar: () => { if (RUNTIMER) clearInterval(RUNTIMER); RUNTIMER = setInterval(tickRun, 1000); tickRun(); },
  comunidade: () => { const m = $('#chatMsgs'); if (m) m.scrollTop = m.scrollHeight; }
};

/* ═══════════════ AÇÕES ══════════════════════════════════ */
function simples(t, msg, foot){
  modal({ title:t, body:'<p class="muted" style="margin:0;line-height:1.7">'+msg+'</p>',
    foot: foot || '<button class="btn btn-primary" data-close>Entendi</button>' });
}

S.onAct = function(a, el){
  switch(a){
    case 'iniciar-treino': iniciarTreino(treinoDeHoje().id); break;
    case 'abandonar-treino':
      modal({ title:'Sair sem salvar', body:'<p class="muted" style="margin:0">As séries registradas nesta sessão serão descartadas. Deseja continuar?</p>',
        foot:'<button class="btn btn-ghost" data-close>Voltar ao treino</button><button class="btn btn-danger" data-act="abandonar-ok">Descartar treino</button>' });
      break;
    case 'abandonar-ok': RUN = null; S.closeModal(); go('treinos'); break;
    case 'concluir-treino': concluirTreino(); break;
    case 'pular-descanso': RUN.rest = 0; { const b = $('#restBox'); if (b) b.hidden = true; } break;
    case 'fim-treino': {
      const pub = $('#pubFeed') && $('#pubFeed').checked;
      const r = JSON.parse(el.getAttribute('data-resumo'));
      if (pub){
        ST.posts = [{ id:'p'+Date.now(), autor:ST.nome, ini:ST.ini, min:0, liked:false, likes:0, coms:[],
          txt:'Treino concluído dentro da metodologia. Seguindo o processo.',
          att:{ tipo:'TREINO', ex:r.t, v:r.dur+' min', sub:r.ser+' séries · '+fmt(r.ton)+' kg movimentados' } }].concat(ST.posts);
        ST.coins += 10;
        ST.ledger = [{ d:'Hoje', t:'Publicação no feed da comunidade', v:+10 }].concat(ST.ledger);
        save();
      }
      S.closeModal();
      go('home');
      telaGanho(pub ? 35 : 25, 'Treino concluído');
      break;
    }
    case 'publicar': {
      const box = $('#novoPost'), txt = box ? box.value.trim() : '';
      if (!txt){ S.toast('Escreva algo antes de publicar.'); return; }
      ST.posts = [{ id:'p'+Date.now(), autor:ST.nome, ini:ST.ini, min:0, txt:txt, liked:false, likes:0, coms:[] }].concat(ST.posts);
      ST.coins += 10;
      ST.ledger = [{ d:'Hoje', t:'Publicação no feed da comunidade', v:+10 }].concat(ST.ledger);
      save(); go('comunidade'); telaGanho(10, 'Publicação no feed');
      break;
    }
    case 'chat-send': {
      const inp = $('#chatInput'), v = inp ? inp.value.trim() : '';
      if (!v) return;
      const c = ST.chats.filter(x => x.id === ST.chatAtivo)[0];
      c.msgs.push({ a:'me', t:v, min:0 }); save(); go('comunidade');
      break;
    }
    case 'chat-info': simples('Sobre este canal','Cada canal tem regras próprias de participação. Publicações que desrespeitem outros alunos podem ser removidas e o autor bloqueado pela moderação.'); break;
    case 'salvar-ex': {
      const id = el.getAttribute('data-id');
      const k = parseFloat(($('#exKg')||{}).value);
      const o = ($('#exObs')||{}).value || '';
      if (k > 0) ST.cargas[id] = [k].concat((ST.cargas[id]||[]).slice(0,9));
      ST.obs[id] = o; save(); S.closeModal(); S.toast('Registro salvo.', 'good');
      break;
    }
    case 'tecnicas':
      modal({ title:'Técnicas de intensidade', body:
        '<div class="stack gap-m">'+
          '<p class="muted tiny" style="margin:0">Ferramentas para levar uma série além da falha sem aumentar a carga. '+
          'Entram apenas na <b>última série</b> e apenas em exercícios seguros para falhar — nunca no agachamento livre ou no levantamento terra.</p>'+
          Object.keys(TECNICAS).map(k => {
            const t = TECNICAS[k];
            return '<div class="tecbox'+k+'">'+
              '<div class="row gap-s" style="gap:9px;align-items:center"><span class="selo '+k+'">'+esc(t.sigla)+'</span>'+
              '<b style="font-size:.9375rem">'+esc(t.nome)+'</b></div>'+
              '<p class="tiny muted" style="margin:8px 0 0">'+esc(t.desc)+'</p>'+
              '<p class="tiny" style="margin:6px 0 0;color:var(--ink)">'+esc(t.como)+'</p></div>';
          }).join('')+
          '<div class="notice">'+ico('alert',15)+'<div>Técnica de intensidade gera muito mais fadiga do que série reta. Se o seu sono, apetite ou desempenho caírem por mais de uma semana, tire as técnicas antes de tirar o treino.</div></div>'+
        '</div>',
        foot:'<button class="btn btn-primary" data-close>Entendi</button>' });
      break;
    case 'ficha': telaAnamnese(); break;
    case 'salvar-ficha': {
      if (!($('#anConsent') || {}).checked)
        return S.toast('Marque a autorização para guardarmos a ficha.');
      const dados = {};
      ANAMNESE_CAMPOS.forEach(b => b.campos.forEach(c => {
        const el = $('#an-' + c[0]);
        if (!el) return;
        dados[c[0]] = c[2] === 'check' ? (el.checked ? 1 : 0)
                    : c[2] === 'num'   ? (el.value === '' ? null : Number(el.value))
                    : el.value || null;
      }));
      ST.anamnese = dados; ST.anamneseConsent = true; save();
      if (S.online && S.api)
        S.api('/api/eu/anamnese', { metodo:'PUT', corpo:{ ...dados, consentimento:true } }).catch(()=>{});
      S.closeModal(); go('perfil');
      const avisos = [];
      if (dados.lesoes) avisos.push('lesão');
      if (dados.dores) avisos.push('dor atual');
      S.toast(avisos.length
        ? 'Ficha salva. Marquei ' + avisos.join(' e ') + ' para Jesley revisar antes de liberar carga alta.'
        : 'Ficha salva.', 'good');
      break;
    }
    case 'apagar-ficha':
      modal({ title:'Apagar meus dados de saúde', body:
        '<p class="muted" style="margin:0;line-height:1.7">Remove altura, histórico de lesão, condições de saúde e medicação. '+
        'Sua conta, assinatura e histórico de treinos continuam intactos.</p>',
        foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-danger" data-act="apagar-ficha-ok">Apagar</button>' });
      break;
    case 'apagar-ficha-ok':
      ST.anamnese = null; ST.anamneseConsent = false; save();
      if (S.online && S.api) S.api('/api/eu/anamnese', { metodo:'DELETE' }).catch(()=>{});
      S.closeAllModals(); go('perfil'); S.toast('Dados de saúde apagados.');
      break;
    case 'nova-medida': telaNovaMedida(); break;
    case 'salvar-medida': {
      const n = (id) => { const el = $('#md-' + id); const v = el && el.value !== '' ? Number(el.value) : null;
        return Number.isFinite(v) ? v : null; };
      const m = { data: ($('#mdData')||{}).value || new Date().toISOString().slice(0,10),
        peso:n('peso'), cintura:n('cintura'), braco:n('braco'), coxa:n('coxa'), peito:n('peito'), gordura:n('gordura') };
      if (m.peso == null && m.cintura == null && m.braco == null)
        return S.toast('Informe ao menos peso, cintura ou braço.');
      const base = (ST.medidas && ST.medidas.length) ? ST.medidas : MEDIDAS_SEED.slice();
      const ant = base[base.length-1] || {};
      /* Campos em branco herdam a última medida, para o gráfico não quebrar. */
      ST.medidas = base.concat([{ data:m.data,
        peso: m.peso ?? ant.peso ?? 0, cintura: m.cintura ?? ant.cintura ?? 0,
        braco: m.braco ?? ant.braco ?? 0, coxa:m.coxa, peito:m.peito, gordura:m.gordura }]);
      save();
      if (S.online && S.api)
        S.api('/api/eu/medidas', { metodo:'POST', corpo:{ data:m.data, peso_kg:m.peso, cintura_cm:m.cintura,
          braco_cm:m.braco, coxa_cm:m.coxa, peito_cm:m.peito, gordura_pct:m.gordura } }).catch(()=>{});
      S.closeModal(); go('evolucao'); S.toast('Medida registrada.', 'good');
      break;
    }
    case 'nova-meta': simples('Definir meta','Na versão completa você escolhe o tipo de meta (frequência, carga, tonelagem ou sequência), o valor alvo e o prazo. O acompanhamento aparece aqui e nas notificações.'); break;
    case 'trocar-plano': go('plano'); S.closeModal(); S.toast('Escolha o novo plano na área de assinatura.'); break;
    case 'trocar-pagamento': simples('Alterar forma de pagamento','A troca do meio de pagamento é feita no ambiente seguro do provedor. A plataforma não armazena número completo do cartão, CVV ou dados sensíveis.'); break;
    case 'cancelar':
      modal({ title:'Cancelar assinatura', body:
        '<div class="stack gap-m">'+
          '<div class="notice">'+ico('alert',15)+'<div><b>Regra comercial da plataforma:</b> "Solicitações de cancelamento devem ser realizadas com antecedência mínima de 30 dias em relação à próxima cobrança, observadas as condições do contrato de fidelidade."</div></div>'+
          '<div class="panel-2 pad stack gap-s tiny">'+
            '<div class="between"><span class="muted">Próxima cobrança</span><b>'+esc(ALUNO.proxima)+'</b></div>'+
            '<div class="between"><span class="muted">Fidelidade</span><b>Cumprida em 12/09/2026</b></div>'+
            '<div class="between"><span class="muted">Efeito do pedido</span><b>Encerra em 18/10/2026</b></div>'+
          '</div>'+
          '<div class="field"><label class="label" for="cancelMotivo">Motivo (opcional)</label>'+
          '<select class="select" id="cancelMotivo"><option>Prefiro não informar</option><option>Questão financeira</option><option>Falta de tempo</option><option>Mudança de objetivo</option><option>Não me adaptei à plataforma</option></select></div>'+
          '<p class="tiny dim" style="margin:0">Compras on-line observam o direito de arrependimento de 7 dias (art. 49 do CDC). A minuta de cancelamento está pendente de revisão jurídica.</p>'+
        '</div>',
        foot:'<button class="btn btn-ghost" data-close>Manter assinatura</button><button class="btn btn-danger" data-act="cancelar-ok">Solicitar cancelamento</button>' });
      break;
    case 'cancelar-ok': ST.cancelSolicitado = true; save(); S.closeModal(); go('plano'); S.toast('Solicitação registrada. Você recebeu a confirmação por e-mail.'); break;
    case 'editar-perfil': simples('Editar perfil','Nome, idade, objetivo, nível, frequência desejada e preferências podem ser atualizados a qualquer momento. A alteração de nível ajusta a recomendação de treino, sem alterar o plano contratado.'); break;
    case 'trocar-senha': simples('Alterar senha','Fluxo com senha atual, nova senha e confirmação. A senha é armazenada com hash e nunca em texto puro.'); break;
    case 'sessoes': simples('Sessões ativas','Lista de dispositivos conectados com data, local aproximado e opção de encerrar sessão remotamente.'); break;
    case 'verificacao': simples('Verificação em duas etapas','Camada adicional de segurança por aplicativo autenticador ou código por e-mail.'); break;
    case 'exportar': S.toast('Exportação solicitada. O arquivo com seus dados é enviado por e-mail em até 15 dias, conforme a LGPD.'); break;
    case 'consentimentos':
      modal({ title:'Gerenciar consentimentos', body:
        '<div class="stack gap-m">'+
        [['Comunicações de marketing','E-mails sobre novidades, campanhas e conteúdos.'],
         ['Uso de imagem na comunidade','Permitir que suas publicações apareçam no feed para outros alunos.'],
         ['Recomendações personalizadas','Usar seu histórico de treino para sugerir conteúdos.']].map((c,i) =>
          '<div class="between" style="gap:16px"><div><b style="font-size:.875rem;display:block">'+esc(c[0])+'</b>'+
          '<span class="tiny dim">'+esc(c[1])+'</span></div>'+
          '<label class="switch"><input type="checkbox" id="cons'+i+'"'+(i<2?' checked':'')+'><span></span></label></div>').join('')+
        '<p class="tiny dim" style="margin:0">Revogar um consentimento não afeta o acesso ao plano contratado.</p></div>',
        foot:'<button class="btn btn-primary" data-close>Salvar preferências</button>' });
      break;
    case 'excluir-conta':
      modal({ title:'Excluir minha conta', body:
        '<div class="stack gap-m"><div class="notice" style="border-left-color:var(--bad)">'+ico('alert',15)+
        '<div>A exclusão remove seu perfil, histórico de treinos, publicações e saldo CoinSlayter. A ação é definitiva.</div></div>'+
        '<p class="tiny muted" style="margin:0">Se houver assinatura ativa dentro do período de fidelidade, o pedido segue as condições contratuais. Dados que a plataforma precise manter por obrigação legal ou fiscal são conservados pelo prazo exigido em lei, conforme a LGPD.</p></div>',
        foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-danger" data-close>Solicitar exclusão</button>' });
      break;
    case 'adm-exportar': S.toast('Arquivo CSV gerado no ambiente de produção.'); break;
    case 'adm-novo-aluno': admForm('Cadastrar aluno', [['Nome completo','text'],['E-mail','email'],['Plano','select:Iniciante|Intermediário|Premium'],['Status','select:Ativo|Suspenso'],['Data de contratação','date']]); break;
    case 'adm-novo-treino': admForm('Criar treino', [['Nome do treino','text'],['Código (A, B, C…)','text'],['Nível','select:Iniciante|Intermediário|Premium'],['Foco','text'],['Duração estimada (min)','number']], 'Depois de criado, adicione exercícios definindo séries, repetições e descanso para cada um.'); break;
    case 'adm-novo-ex': admForm('Novo exercício', [['Nome do exercício','text'],['Grupo muscular','select:'+GRUPOS.map(g=>g.nome).join('|')],['Equipamento','text'],['Nível','select:Iniciante|Intermediário|Avançado'],['URL do vídeo demonstrativo','text'],['Séries padrão','number'],['Repetições padrão','text'],['Descanso (segundos)','number'],['Técnica de execução','textarea'],['Pontos de atenção','textarea']]); break;
    case 'adm-novo-pensamento': admForm('Publicar pensamento', [['Frase','text'],['Categoria','select:Princípio|Constância|Técnica|Mentalidade|Recuperação|Disciplina'],['Texto de apoio','textarea']]); break;
    case 'adm-novo-conteudo': admForm('Novo conteúdo', [['Título','text'],['Tipo','select:Vídeo|Áudio|Texto'],['Duração','text'],['Descrição','textarea'],['Arquivo ou URL','text']]); break;
    case 'adm-novo-desafio': admForm('Criar desafio', [['Nome do desafio','text'],['Meta (sessões)','number'],['Início','date'],['Fim','date'],['Recompensa em CoinSlayter','number']]); break;
    case 'adm-novo-beneficio': admForm('Criar benefício', [['Parceiro','select:'+PARCEIROS.map(p=>p.nome).join('|')],['Título do benefício','text'],['Desconto','text'],['Custo em CoinSlayter','number'],['Estoque','number'],['Validade','date']]); break;
    case 'adm-novo-parceiro': admForm('Cadastrar parceiro', [['Nome do parceiro','text'],['Categoria','select:Suplementos|Academias|Moda fitness|Serviços|Produtos'],['Descrição','textarea'],['Contato','text']]); break;
    case 'adm-nova-campanha': admForm('Criar campanha especial', [['Nome da campanha','text'],['Multiplicador de moedas','select:1,5×|2×|3×'],['Início','date'],['Fim','date'],['Regra aplicada','select:Treinos concluídos|Publicações|Desafios|Tudo']]); break;
    case 'adm-enviar-aviso': {
      const v = ($('#admAviso')||{}).value;
      if (!v || !v.trim()){ S.toast('Escreva o comunicado antes de enviar.'); return; }
      const c = ST.chats.filter(x => x.id === 'avisos')[0];
      c.msgs.push({ a:'sys', t:v.trim(), min:0 }); save();
      $('#admAviso').value = '';
      S.toast('Comunicado enviado ao canal Avisos da plataforma.', 'good');
      break;
    }
    case 'adm-remover': S.toast('Conteúdo removido e autor notificado.'); break;
    case 'adm-bloquear': S.toast('Usuário bloqueado. Ele deixa de publicar e comentar.'); break;
    case 'adm-arquivar': S.toast('Denúncia arquivada.', 'good'); break;
    case 'adm-edit': simples('Editar item','No painel completo, cada item abre um formulário com todos os campos editáveis, pré-visualização e histórico de alterações.'); break;
    case 'denunciar':
      modal({ title:'Denunciar publicação', body:
        '<div class="stack gap-m"><div class="field"><label class="label" for="denMotivo">Motivo</label>'+
        '<select class="select" id="denMotivo"><option>Desrespeito a outro aluno</option><option>Promessa de resultado sem base</option><option>Divulgação de produto sem autorização</option><option>Conteúdo que incentiva prática de risco</option><option>Outro</option></select></div>'+
        '<div class="field"><label class="label" for="denDet">Detalhes (opcional)</label><textarea class="textarea" id="denDet"></textarea></div>'+
        '<p class="tiny dim" style="margin:0">A denúncia vai para a fila de moderação da plataforma e é analisada pela equipe.</p></div>',
        foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" data-act="denuncia-ok">Enviar denúncia</button>' });
      break;
    case 'denuncia-ok': S.closeModal(); S.toast('Denúncia enviada para a moderação.', 'good'); break;
    case 'bloquear-user': S.closeModal(); S.toast('Usuário bloqueado. Você não verá mais as publicações dele.'); break;
    case 'ocultar-post': S.closeModal(); S.toast('Publicação ocultada do seu feed.'); break;
  }
};

function admForm(titulo, campos, nota){
  modal({ title:titulo, body:
    '<div class="stack gap-m">'+campos.map((c,i) => {
      const id = 'af'+i;
      let ctrl;
      if (c[1] === 'textarea') ctrl = '<textarea class="textarea" id="'+id+'"></textarea>';
      else if (c[1].indexOf('select:') === 0)
        ctrl = '<select class="select" id="'+id+'">'+c[1].slice(7).split('|').map(o=>'<option>'+esc(o)+'</option>').join('')+'</select>';
      else ctrl = '<input class="input" id="'+id+'" type="'+c[1]+'">';
      return '<div class="field"><label class="label" for="'+id+'">'+esc(c[0])+'</label>'+ctrl+'</div>';
    }).join('')+
    (nota ? '<div class="notice info">'+ico('info',15)+'<div>'+esc(nota)+'</div></div>' : '')+
    '</div>',
    foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" data-close>Salvar</button>' });
}

/* ═══════════════ CLIQUES ESPECÍFICOS ════════════════════ */
S.onClick = function(e){
  const t = e.target;

  const exEl = t.closest('[data-ex]');
  if (exEl){ abrirExercicio(exEl.getAttribute('data-ex')); return; }

  const start = t.closest('[data-start]');
  if (start){ iniciarTreino(start.getAttribute('data-start')); return; }

  const f = t.closest('[data-filtro]');
  if (f){ ST.filtro = f.getAttribute('data-filtro'); save(); go('exercicios'); return; }

  const done = t.closest('[data-done]');
  if (done && RUN){
    const [id, i] = done.getAttribute('data-done').split(':');
    const s = RUN.sets[id][+i];
    s.done = !s.done;
    const row = done.closest('.setgrid');
    row.classList.toggle('setdone', s.done);
    done.classList.toggle('on', s.done);
    done.setAttribute('aria-pressed', s.done ? 'true' : 'false');
    let total = 0, feitos = 0;
    Object.keys(RUN.sets).forEach(k => RUN.sets[k].forEach(x => { total++; if (x.done) feitos++; }));
    const b = $('#runBar'); if (b) b.style.width = (feitos/total*100)+'%';
    if (s.done){
      const tr = TREINOS.filter(x => x.id === RUN.tid)[0];
      const it = tr.itens.filter(x => x[0] === id)[0];
      if (it && it[3]){ RUN.restTotal = it[3]; RUN.rest = it[3]; }
    }
    return;
  }

  const like = t.closest('[data-like]');
  if (like){
    const p = ST.posts.filter(x => x.id === like.getAttribute('data-like'))[0];
    if (p){ p.liked = !p.liked; p.likes += p.liked ? 1 : -1; save();
      like.classList.toggle('on', p.liked);
      $('span', like).textContent = fmt(p.likes); }
    return;
  }

  const co = t.closest('[data-com-open]');
  if (co){
    const box = document.querySelector('[data-combox="'+co.getAttribute('data-com-open')+'"]');
    if (box){ box.hidden = !box.hidden; if (!box.hidden) $('input', box).focus(); }
    return;
  }

  const cs = t.closest('[data-com-send]');
  if (cs){
    const id = cs.getAttribute('data-com-send');
    const inp = document.querySelector('[data-cominput="'+id+'"]');
    const v = inp ? inp.value.trim() : '';
    if (!v) return;
    const p = ST.posts.filter(x => x.id === id)[0];
    p.coms.push({ a:ST.nome, ini:ST.ini, t:v }); save(); go('comunidade');
    return;
  }

  const mn = t.closest('[data-menu]');
  if (mn){
    $$('.menu-pop').forEach(x => x.remove());
    const pop = document.createElement('div');
    pop.className = 'menu-pop';
    pop.innerHTML = '<button data-act="ocultar-post">'+ico('eye',15)+'Ocultar publicação</button>'+
      '<button data-act="denunciar">'+ico('flag',15)+'Denunciar</button>'+
      '<button class="danger" data-act="bloquear-user">'+ico('ban',15)+'Bloquear autor</button>';
    mn.parentElement.appendChild(pop);
    setTimeout(() => document.addEventListener('click', function off(){ $$('.menu-pop').forEach(x=>x.remove()); document.removeEventListener('click', off); }), 0);
    return;
  }

  const ch = t.closest('[data-chat]');
  if (ch){ ST.chatAtivo = ch.getAttribute('data-chat'); ST.comTab = 'chat'; save(); go('comunidade'); return; }

  const cm = t.closest('[data-com]');
  if (cm){ ST.comTab = cm.getAttribute('data-com'); save(); go('comunidade'); return; }

  const at = t.closest('[data-admtab]');
  if (at){ ST.adminTab = at.getAttribute('data-admtab'); save(); go('admin'); return; }

  const rg = t.closest('[data-resg]');
  if (rg){ resgatar(rg.getAttribute('data-resg')); return; }

  const aa = t.closest('[data-adm-aluno]');
  if (aa){ const a = ALUNOS_ADMIN[+aa.getAttribute('data-adm-aluno')];
    admForm('Editar — '+a.n, [['Nome completo','text'],['E-mail','email'],['Plano','select:Iniciante|Intermediário|Premium'],['Status','select:Ativo|Suspenso|Inadimplente'],['Observações internas','textarea']]); return; }

  const as = t.closest('[data-adm-susp]');
  if (as){ S.toast('Acesso suspenso. O aluno mantém o histórico e volta ao regularizar a situação.'); return; }
};

function resgatar(bid){
  const b = BENEFICIOS.filter(x => x.id === bid)[0];
  const p = PARCEIROS.filter(x => x.id === b.pid)[0];
  modal({ title:'Resgatar benefício', body:
    '<div class="stack gap-m">'+
      '<div class="panel-2 pad-l stack gap-s">'+
        '<div class="ph" style="display:flex;align-items:center;gap:10px"><span class="plogo">'+esc(p.sig)+'</span>'+
        '<div><b style="font-size:.875rem;display:block">'+esc(p.nome)+'</b><span class="tiny dim">'+esc(p.cat)+'</span></div></div>'+
        '<p style="margin:6px 0 0;font-size:.9375rem">'+esc(b.tit)+'</p>'+
        '<span class="tiny dim">'+esc(b.val)+'</span>'+
      '</div>'+
      '<div class="between tiny"><span class="muted">Custo</span><b style="color:var(--brass)">'+fmt(b.custo)+' CoinSlayter</b></div>'+
      '<div class="between tiny"><span class="muted">Saldo após o resgate</span><b>'+fmt(ST.coins - b.custo)+'</b></div>'+
      '<p class="tiny dim" style="margin:0">O código de resgate é gerado pela plataforma e apresentado ao parceiro no momento da compra.</p>'+
    '</div>',
    foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-brass" data-act="resg-ok" data-b="'+esc(bid)+'">Confirmar resgate</button>' });
}

const _onAct = S.onAct;
S.onAct = function(a, el, e){
  if (a === 'resg-ok'){
    const b = BENEFICIOS.filter(x => x.id === el.getAttribute('data-b'))[0];
    ST.coins -= b.custo;
    ST.resgates = ST.resgates.concat([b.id]);
    ST.ledger = [{ d:'Hoje', t:'Resgate — '+PARCEIROS.filter(p=>p.id===b.pid)[0].nome, v:-b.custo }].concat(ST.ledger);
    save(); S.closeModal();
    modal({ title:'Benefício resgatado', body:
      '<div class="stack gap-m center" style="align-items:center;text-align:center">'+
        '<div style="width:52px;height:52px;border-radius:50%;background:var(--brass-soft);border:1px solid var(--brass-line);display:flex;align-items:center;justify-content:center;color:var(--brass)">'+ico('check',24,2.4)+'</div>'+
        '<p class="muted" style="margin:0">'+esc(b.tit)+'</p>'+
        '<div class="panel-2 pad" style="width:100%"><span class="label">Código de resgate</span>'+
        '<div style="font-family:var(--fd);font-weight:800;font-size:1.25rem;letter-spacing:.1em;margin-top:6px">SLT-'+b.id.toUpperCase()+'-2026</div></div>'+
        '<span class="tiny dim">'+esc(b.val)+' · apresente o código no parceiro</span>'+
        (function(){ const n = proximoBeneficio();
          return n ? '<div class="reward-next" style="width:100%;text-align:left">'+
            (n.falta > 0
              ? '<p style="margin:0 0 4px">Próximo: faltam <b style="color:var(--brass)">'+fmt(n.falta)+' Coins</b> para</p>'
              : '<p style="margin:0 0 4px">Você já pode desbloquear:</p>')+
            '<b style="font-size:.875rem">'+esc(n.b.tit)+'</b>'+
            '<div class="bar brass" style="margin-top:10px"><i style="width:'+Math.min(100, ST.coins/n.b.custo*100)+'%"></i></div></div>' : ''; })()+
      '</div>',
      foot:'<button class="btn btn-primary btn-block" data-close>Fechar</button>' });
    setTimeout(() => go('coin'), 50);
    return;
  }
  if (a === 'ver-beneficios'){ S.closeModal(); go('coin'); return; }
  if (a === 'adm-novo-caso'){
    admForm('Publicar caso de aluno', [
      ['Nome do aluno','text'], ['Tempo de acompanhamento','text'],
      ['Foto autorizada (arquivo)','text'],
      ['Relato escrito pelo aluno','textarea'],
      ['Carga inicial → atual','text'], ['Frequência média','text'], ['Período documentado','text']
    ], 'Obrigatório antes de publicar: autorização de uso de imagem e de relato assinada pelo aluno, arquivada com data. Sem o aceite registrado, o caso não vai ao ar.');
    return;
  }
  _onAct(a, el, e);
};

/* ═══════════════ ALTERAÇÕES DE CAMPO ════════════════════ */
S.onChange = function(e){
  const n = e.target.getAttribute && e.target.getAttribute('data-notif');
  if (n){ ST.notif[n] = e.target.checked; save(); return; }
};

document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'exBusca'){ ST.busca = t.value; save();
    clearTimeout(window._bt);
    window._bt = setTimeout(() => { const pos = t.selectionStart; go('exercicios');
      const nb = $('#exBusca'); if (nb){ nb.focus(); nb.setSelectionRange(pos, pos); } }, 260);
    return; }
  if (RUN && t.closest('[data-set]')){
    const [id, i] = t.closest('[data-set]').getAttribute('data-set').split(':');
    RUN.sets[id][+i][t.getAttribute('data-f')] = t.value;
    if (+i === 0){
      const pc = $('#plate-'+id);
      if (pc) pc.innerHTML = barraVisual(parseFloat(t.value) || 20);
    }
    return;
  }
  const ob = t.getAttribute && t.getAttribute('data-obs');
  if (ob && RUN){ RUN.obs[ob] = t.value; }
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (e.target.id === 'chatInput'){ e.preventDefault(); S.onAct('chat-send', e.target); }
  const ci = e.target.getAttribute && e.target.getAttribute('data-cominput');
  if (ci){ e.preventDefault();
    const btn = document.querySelector('[data-com-send="'+ci+'"]'); if (btn) btn.click(); }
});

/* Telas registradas — pode iniciar */
S.boot();

})();

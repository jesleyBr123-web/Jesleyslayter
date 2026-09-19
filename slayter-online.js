/* Camada online — assume o login e o checkout quando existe um servidor.

   Se a plataforma estiver sendo servida pelo backend (slayter-trainer-api),
   este arquivo detecta o servidor e passa a fazer cobrança de verdade.
   Se não houver servidor (página aberta solta, apresentação), tudo continua
   funcionando em modo de demonstração — nada quebra. */
(function(){
'use strict';
const { $, esc, ico, toast, modal, closeModal, closeAllModals } = S;
const ST = S.get();

const CHAVE_TOKEN = 'slayter.token';
let token = null;
try { token = localStorage.getItem(CHAVE_TOKEN); } catch {}

async function api(caminho, opcoes = {}){
  const r = await fetch(caminho, {
    method: opcoes.metodo || 'GET',
    headers: {
      'Content-Type':'application/json',
      ...(token ? { Authorization:'Bearer ' + token } : {})
    },
    body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined
  });
  let dados = null;
  try { dados = await r.json(); } catch {}
  if (!r.ok) throw Object.assign(new Error(dados?.erro || 'Falha na comunicação com o servidor.'), { status:r.status, dados });
  return dados;
}
S.api = api;

function guardarSessao(resposta){
  token = resposta.token || token;
  try { if (token) localStorage.setItem(CHAVE_TOKEN, token); } catch {}
  if (resposta.aluno) aplicarAluno(resposta.aluno);
}
function aplicarAluno(aluno){
  S.set({
    nome: aluno.nome,
    ini: (aluno.nome || 'A').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase(),
    plano: aluno.assinatura?.plano || ST.plano,
    logado: true
  });
  S.alunoServidor = aluno;
}

/* ── Bloco "Seus dados" dentro do checkout ─────────────────────── */
function camposConta(){
  if (S.alunoServidor) return '<div class="panel-2 pad tiny muted">Comprando como <b style="color:var(--ink)">'+
    esc(S.alunoServidor.nome)+'</b> · '+esc(S.alunoServidor.email)+'</div>';
  return '<div>'+
    '<div class="eyebrow" style="margin-bottom:10px">Seus dados</div>'+
    '<div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">'+
      '<div class="field" style="grid-column:1/-1"><label class="label" for="ckNome">Nome completo</label>'+
        '<input class="input" id="ckNome" autocomplete="name" placeholder="Como no documento"></div>'+
      '<div class="field"><label class="label" for="ckEmail">E-mail</label>'+
        '<input class="input" id="ckEmail" type="email" autocomplete="email" placeholder="seu@email.com"></div>'+
      '<div class="field"><label class="label" for="ckSenha">Criar senha</label>'+
        '<input class="input" id="ckSenha" type="password" autocomplete="new-password" placeholder="mínimo 8 caracteres"></div>'+
      '<div class="field"><label class="label" for="ckCpf">CPF</label>'+
        '<input class="input" id="ckCpf" inputmode="numeric" placeholder="000.000.000-00"></div>'+
      '<div class="field"><label class="label" for="ckTel">Telefone</label>'+
        '<input class="input" id="ckTel" inputmode="tel" autocomplete="tel" placeholder="(00) 00000-0000"></div>'+
    '</div>'+
    '<p class="help mt-s">Esses dados criam seu acesso e são exigidos para emitir a cobrança.</p>'+
  '</div>';
}

/* O checkout é redesenhado pelo app a cada troca de forma de pagamento.
   Este observador preenche o espaço reservado sempre que ele reaparece.
   Só é ligado quando existe servidor. */
let observador = null;
function ligarObservador(){
  observador = new MutationObserver(() => {
    const alvo = document.getElementById('ckDados');
    if (alvo && !alvo.dataset.pronto){ alvo.dataset.pronto = '1'; alvo.innerHTML = camposConta(); }
  });
  observador.observe(document.getElementById('modalRoot'), { childList:true, subtree:true });
}

const limpar = (v) => String(v || '').replace(/\D/g, '');

/* ── Login de verdade ──────────────────────────────────────────── */
const loginOnline = async function(){
  const email = ($('#loginMail') || {}).value;
  const senha = ($('#loginPass') || {}).value;
  try {
    const r = await api('/api/auth/login', { metodo:'POST', corpo:{ email, senha } });
    guardarSessao(r);
    closeAllModals();
    S.entrarApp();
    toast('Bem-vindo de volta, ' + esc(r.aluno.nome.split(' ')[0]) + '.', 'good');
  } catch (e) {
    toast(esc(e.message));
  }
};

/* ── Checkout de verdade ───────────────────────────────────────── */
const pagarOnline = async function(ck){
  const plano = ck.plano;
  const botao = $('#ckPay');
  if (botao){ botao.disabled = true; botao.textContent = 'Processando…'; }

  const desfazer = (msg) => {
    if (botao){ botao.disabled = false; botao.textContent = 'Confirmar e pagar'; }
    if (msg) toast(esc(msg));
  };

  try {
    /* 1. Conta */
    if (!S.alunoServidor){
      const nome  = ($('#ckNome')  || {}).value;
      const email = ($('#ckEmail') || {}).value;
      const senha = ($('#ckSenha') || {}).value;
      const cpf   = limpar(($('#ckCpf') || {}).value);
      const tel   = limpar(($('#ckTel') || {}).value);
      if (!nome || !email || !senha || !cpf) return desfazer('Preencha nome, e-mail, senha e CPF.');
      try {
        guardarSessao(await api('/api/auth/registrar', { metodo:'POST',
          corpo:{ nome, email, senha, cpfCnpj:cpf, telefone:tel } }));
      } catch (e) {
        if (e.status === 409){
          guardarSessao(await api('/api/auth/login', { metodo:'POST', corpo:{ email, senha } }));
        } else return desfazer(e.message);
      }
    }

    /* 2. Cobrança */
    const cpf = limpar(($('#ckCpf') || {}).value) || undefined;
    const corpo = { plano: plano.id, aceite: true, cpfCnpj: cpf, telefone: limpar(($('#ckTel')||{}).value) || undefined };

    if (ck.metodo === 'cartao'){
      const num = limpar(($('#ccNum') || {}).value);
      if (num.length < 13) return desfazer('Confira o número do cartão.');
      corpo.metodo = 'CREDIT_CARD';
      corpo.cartao = {
        numero: num, mes: ($('#ccMes')||{}).value, ano: ($('#ccAno')||{}).value,
        cvv: ($('#ccCvv')||{}).value, nome: ($('#ccNome')||{}).value
      };
      corpo.titular = {
        nome: ($('#ccNome')||{}).value, cpfCnpj: cpf,
        cep: limpar(($('#ccCep')||{}).value), numero: ($('#ccNumEnd')||{}).value,
        telefone: limpar(($('#ccTel')||{}).value)
      };
    } else {
      const auto = $('#ckPixAuto');
      corpo.metodo = (auto && auto.checked && plano.per === '/mês') ? 'PIX_AUTOMATICO' : 'PIX';
    }

    const r = await api('/api/checkout', { metodo:'POST', corpo });
    closeAllModals();

    /* Mercado Pago: cartão e assinatura são autorizados na página deles. */
    if (r.tipo === 'REDIRECIONAR' && r.url){
      toast('Levando você ao ambiente seguro de pagamento…');
      setTimeout(() => { location.href = r.url; }, 700);
      return;
    }
    if (r.qrCode) return telaPix(r, plano);
    return telaConfirmada(r, plano);

  } catch (e) {
    desfazer(e.message);
  }
};

/* Tela do Pix: QR real da cobrança + acompanhamento automático. */
function telaPix(r, plano){
  const recorrente = r.tipo === 'PIX_AUTOMATICO';
  modal({ title:'Pague com PIX', noClose:false, body:
    '<div class="stack gap-m" style="align-items:center;text-align:center">'+
      (r.qrCode.imagem
        ? '<img src="data:image/png;base64,'+esc(r.qrCode.imagem)+'" alt="QR Code do PIX" '+
          'style="width:210px;height:210px;background:#fff;padding:10px;border-radius:4px">'
        : '<div class="panel-2 pad" style="width:210px;height:210px;display:flex;align-items:center;justify-content:center">'+
          '<span class="tiny dim">QR Code indisponível</span></div>')+
      '<div style="width:100%;text-align:left">'+
        '<span class="label">PIX copia e cola</span>'+
        '<div class="panel pad tiny" id="pixPayload" style="word-break:break-all;font-family:ui-monospace,monospace;margin-top:6px">'+
          esc(r.qrCode.copiaECola)+'</div>'+
        '<button class="btn btn-ghost btn-sm mt-s" data-act="copiar-pix">Copiar código</button>'+
      '</div>'+
      '<div class="panel-2 pad" style="width:100%;text-align:left">'+
        '<div class="row gap-s" style="gap:9px"><span id="pixSpin" style="color:var(--accent)">'+ico('clock',16)+'</span>'+
        '<span class="tiny" id="pixStatus">Aguardando a confirmação do pagamento…</span></div>'+
      '</div>'+
      (recorrente
        ? '<p class="tiny muted" style="margin:0">Depois de pagar, o aplicativo do seu banco vai pedir para autorizar a recorrência. Com isso, as próximas mensalidades são debitadas automaticamente.</p>'
        : '<p class="tiny muted" style="margin:0">Assim que o pagamento for confirmado, seu acesso é liberado nesta tela — não precisa enviar comprovante.</p>')+
    '</div>',
    foot:'<button class="btn btn-ghost" data-close>Fechar</button>' });

  if (!r.pagamentoId) return;
  let tentativas = 0;
  const relogio = setInterval(async () => {
    if (!document.getElementById('pixStatus')){ clearInterval(relogio); return; }
    if (++tentativas > 150){ clearInterval(relogio); return; }   // ~10 minutos
    try {
      const s = await api('/api/checkout/' + encodeURIComponent(r.pagamentoId) + '/status');
      if (s.pago){
        clearInterval(relogio);
        closeAllModals();
        const eu = await api('/api/eu');
        aplicarAluno(eu.aluno);
        telaConfirmada({ tipo:'PIX' }, plano);
      }
    } catch { /* rede instável: tenta de novo no próximo ciclo */ }
  }, 4000);
}

function telaConfirmada(r, plano){
  modal({ title:'Contratação confirmada', body:
    '<div class="stack gap-m" style="align-items:center;text-align:center">'+
      '<div style="width:56px;height:56px;border-radius:50%;background:var(--good-soft);border:1px solid rgba(79,178,134,.4);display:flex;align-items:center;justify-content:center;color:var(--good)">'+
        ico('check',26,2.4)+'</div>'+
      '<h3 class="d3">Bem-vindo ao Slayter Trainer</h3>'+
      '<p class="muted" style="margin:0;max-width:44ch">'+esc(plano.nome)+' ativo. Seu acesso está liberado e o primeiro treino já está montado no seu painel.</p>'+
      (r.tipo === 'CARTAO_RECORRENTE'
        ? '<p class="tiny dim" style="margin:0">Cartão final '+esc(r.cartaoFinal || '')+' · cobrança mensal automática</p>' : '')+
    '</div>',
    foot:'<button class="btn btn-primary btn-block" data-act="ir-app">Ir para a plataforma</button>' });
}

/* Primeiro acesso: quem comprou fora da plataforma escolhe a senha aqui. */
function telaDefinirSenha(){
  modal({ title:'Crie sua senha', noClose:true, body:
    '<div class="stack gap-m">'+
      '<p class="muted" style="margin:0">Sua compra foi confirmada e o acesso está liberado. '+
      'Escolha uma senha para entrar nas próximas vezes.</p>'+
      '<div class="field"><label class="label" for="novaSenha">Senha</label>'+
        '<input class="input" id="novaSenha" type="password" autocomplete="new-password" placeholder="mínimo 8 caracteres"></div>'+
      '<div class="field"><label class="label" for="novaSenha2">Repita a senha</label>'+
        '<input class="input" id="novaSenha2" type="password" autocomplete="new-password"></div>'+
    '</div>',
    foot:'<button class="btn btn-primary btn-block" data-act="salvar-senha">Salvar e começar</button>' });
}

/* Ações extras desta camada. Só entram em cena com servidor. */
const acaoAnterior = S.onAct;
function ligarAcoes(){
S.onAct = function(a, el, e){
  if (a === 'copiar-pix'){
    const texto = (document.getElementById('pixPayload') || {}).textContent || '';
    if (navigator.clipboard) navigator.clipboard.writeText(texto).then(
      () => toast('Código PIX copiado.', 'good'), () => toast('Selecione e copie o código manualmente.'));
    else toast('Selecione e copie o código manualmente.');
    return;
  }
  if (a === 'salvar-senha'){
    const s1 = ($('#novaSenha')||{}).value, s2 = ($('#novaSenha2')||{}).value;
    if (!s1 || s1.length < 8) return toast('A senha precisa de pelo menos 8 caracteres.');
    if (s1 !== s2) return toast('As duas senhas não são iguais.');
    api('/api/eu/senha', { metodo:'POST', corpo:{ novaSenha:s1 } })
      .then(() => { closeAllModals(); toast('Senha criada. Bom treino.', 'good'); })
      .catch(err => toast(esc(err.message)));
    return;
  }
  if (a === 'sair' && token){
    token = null;
    S.alunoServidor = null;
    try { localStorage.removeItem(CHAVE_TOKEN); } catch {}
  }
  acaoAnterior(a, el, e);
};
}

/* ── Detecção do servidor ──────────────────────────────────────────
   Sem servidor, nada acima é ligado: a plataforma segue em modo de
   demonstração, exatamente como quando está publicada solta.        */
(async () => {
  try {
    const controle = new AbortController();
    const prazo = setTimeout(() => controle.abort(), 2500);
    const r = await fetch('/api/saude', { signal: controle.signal });
    clearTimeout(prazo);
    if (!r.ok) return;
    const saude = await r.json();
    if (!saude?.ok) return;

    S.online = true;
    S.ambiente = saude.ambiente;
    S.loginOnline = loginOnline;
    S.pagarOnline = pagarOnline;
    ligarObservador();
    ligarAcoes();
    console.info('[slayter] servidor detectado — ambiente: ' + saude.ambiente);

    /* Primeiro acesso de quem comprou fora (Hotmart): o link traz ?acesso=... */
    const chaveAcesso = new URLSearchParams(location.search).get('acesso');
    if (chaveAcesso){
      history.replaceState(null, '', location.pathname);
      try {
        const r = await api('/api/acesso/' + encodeURIComponent(chaveAcesso));
        guardarSessao(r);
        S.entrarApp();
        if (r.precisaDefinirSenha) telaDefinirSenha();
        else toast('Acesso liberado. Bem-vindo ao Slayter Trainer.', 'good');
      } catch (e) {
        toast(esc(e.message));
      }
      return;
    }

    if (token){
      try {
        const eu = await api('/api/eu');
        aplicarAluno(eu.aluno);
        if (eu.aluno.acesso) S.entrarApp();
      } catch {
        token = null;
        try { localStorage.removeItem(CHAVE_TOKEN); } catch {}
      }
    }
  } catch {
    /* Sem servidor: a plataforma segue em modo de demonstração. */
  }
})();

})();

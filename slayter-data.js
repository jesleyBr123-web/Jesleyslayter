/* SLAYTER TRAINER — base de conteúdo de demonstração
   Todo o conteúdo abaixo é editável pelo painel administrativo. */

const GRUPOS = [
  { id:'peito',       nome:'Peito' },
  { id:'costas',      nome:'Costas' },
  { id:'ombros',      nome:'Ombros' },
  { id:'biceps',      nome:'Bíceps' },
  { id:'triceps',     nome:'Tríceps' },
  { id:'quadriceps',  nome:'Quadríceps' },
  { id:'posteriores', nome:'Posteriores' },
  { id:'gluteos',     nome:'Glúteos' },
  { id:'panturrilhas',nome:'Panturrilhas' },
  { id:'abdomen',     nome:'Abdômen' },
  { id:'cardio',      nome:'Cardio' }
];

const EX = [
  // ── PEITO ──────────────────────────────────────────────
  { id:'supino-reto-barra', nome:'Supino reto com barra', mg:'peito', eq:'Barra', nivel:'Iniciante', mt:1, barra:true,
    tec:['Deite com os olhos alinhados sob a barra e os pés firmes no chão.','Retraia as escápulas e mantenha uma leve arcada natural na lombar.','Pegada pouco mais larga que os ombros, punhos alinhados sobre os cotovelos.','Desça a barra controlado até a linha do mamilo, tocando de leve.','Empurre sem travar o cotovelo no fim do movimento.'],
    at:['Cotovelos a ~45° do tronco, nunca abertos a 90°.','Não quique a barra no peito.','Escápulas presas do começo ao fim da série.'], s:4, r:'8–10', d:90 },
  { id:'supino-inclinado-halter', nome:'Supino inclinado com halteres', mg:'peito', eq:'Halteres', nivel:'Iniciante', mt:1,
    tec:['Banco entre 30° e 45° — acima disso o ombro assume o trabalho.','Halteres na linha do peito alto, palmas levemente voltadas para dentro.','Desça até sentir alongamento sem perder a retração escapular.','Suba conduzindo os halteres levemente para o centro.'],
    at:['Quanto maior a inclinação, menos peito e mais ombro.','Não bata os halteres no topo — perde tensão.'], s:3, r:'10–12', d:75 },
  { id:'crucifixo-maquina', nome:'Crucifixo na máquina (peck deck)', mg:'peito', eq:'Máquina', nivel:'Iniciante',
    tec:['Ajuste o banco para que as mãos fiquem na altura do peito.','Cotovelos levemente flexionados e fixos durante todo o movimento.','Feche até quase encostar as mãos, segurando meio segundo.','Volte controlando a fase excêntrica.'],
    at:['Não transforme em supino: o ângulo do cotovelo não muda.','Amplitude completa vale mais que carga alta aqui.'], s:3, r:'12–15', d:60 },
  { id:'crossover', nome:'Crossover na polia', mg:'peito', eq:'Polia', nivel:'Intermediário',
    tec:['Um pé à frente, tronco levemente inclinado, core firme.','Puxe os cabos em arco até cruzar na linha do umbigo.','Segure a contração por 1 segundo antes de voltar.'],
    at:['Evite empurrar com os ombros à frente das escápulas.','Carga moderada — o exercício é de tensão, não de força máxima.'], s:3, r:'12–15', d:60 },
  { id:'paralelas', nome:'Paralelas (mergulho)', mg:'peito', eq:'Peso corporal', nivel:'Avançado', mt:1,
    tec:['Apoie as mãos nas barras, braços estendidos, escápulas deprimidas.','Incline o tronco cerca de 30° à frente para enfatizar o peito.','Desça até o ombro ficar na linha do cotovelo, não além.','Empurre as barras para baixo até estender, sem travar bruscamente.'],
    at:['Tronco ereto desloca o esforço para o tríceps; inclinado, para o peito.','Não desça além da linha do ombro — é onde a articulação sofre.','Use lastro só depois de dominar 12 repetições limpas.'], s:3, r:'8–12', d:90 },
  { id:'crucifixo-halteres', nome:'Crucifixo com halteres', mg:'peito', eq:'Halteres', nivel:'Intermediário',
    tec:['Deitado no banco, halteres acima do peito, cotovelos levemente flexionados.','Abra os braços em arco até sentir o alongamento no peitoral.','Mantenha o ângulo do cotovelo fixo durante todo o movimento.','Feche conduzindo pelos cotovelos, não pelas mãos.'],
    at:['Amplitude vem do alongamento, não da carga.','Se o ombro incomodar na descida, reduza a abertura.'], s:3, r:'12–15', d:60 },
  { id:'flexao', nome:'Flexão de braço', mg:'peito', eq:'Peso corporal', nivel:'Iniciante', mt:1,
    tec:['Mãos pouco mais largas que os ombros, corpo em linha reta.','Desça até o peito quase tocar o chão.','Empurre o chão mantendo o abdômen contraído.'],
    at:['Quadril não sobe nem cai.','Se não conseguir a amplitude total, apoie os joelhos.'], s:3, r:'até 2 RIR', d:60 },

  // ── COSTAS ─────────────────────────────────────────────
  { id:'barra-fixa', nome:'Barra fixa (pegada pronada)', mg:'costas', eq:'Peso corporal', nivel:'Intermediário', mt:1,
    tec:['Pegada pouco mais larga que os ombros.','Inicie deprimindo as escápulas antes de flexionar o cotovelo.','Puxe até o queixo passar a barra, peito em direção à barra.','Desça controlado até quase estender o cotovelo.'],
    at:['Sem balanço de quadril.','Se ainda não executa, use elástico ou máquina assistida.'], s:4, r:'6–10', d:105 },
  { id:'barra-supinada', nome:'Barra fixa supinada', mg:'costas', eq:'Peso corporal', nivel:'Intermediário', mt:1,
    tec:['Pegada supinada na largura dos ombros, palmas voltadas para você.','Deprima as escápulas antes de puxar.','Puxe levando o peito à barra, cotovelos rentes ao tronco.','Desça controlado até quase estender o cotovelo.'],
    at:['A pegada supinada recruta mais bíceps — é puxada e rosca ao mesmo tempo.','Sem balanço de quadril; se precisar, use elástico.'], s:3, r:'8–10', d:105 },
  { id:'remada-alta', nome:'Remada alta com barra', mg:'ombros', eq:'Barra', nivel:'Intermediário', mt:1,
    tec:['Pegada pronada pouco mais larga que os ombros.','Puxe a barra rente ao corpo liderando com os cotovelos.','Suba até a barra chegar na linha do peito alto.','Desça controlado sem soltar a tensão.'],
    at:['Pegada muito fechada aumenta o atrito no ombro — prefira a mais larga.','Não passe os cotovelos da linha dos ombros.','Se houver desconforto no ombro, troque pela elevação lateral.'], s:3, r:'10–12', d:90 },
  { id:'puxada-frente', nome:'Puxada frontal na polia alta', mg:'costas', eq:'Polia', nivel:'Iniciante', mt:1,
    tec:['Coxas travadas no apoio, tronco levemente inclinado para trás.','Puxe a barra em direção ao peito alto, cotovelos descendo junto ao corpo.','Aperte as escápulas no fim e retorne controlando.'],
    at:['Nunca puxe atrás da nuca.','O movimento começa nas escápulas, não nas mãos.'], s:4, r:'10–12', d:75 },
  { id:'remada-curvada', nome:'Remada curvada com barra', mg:'costas', eq:'Barra', nivel:'Intermediário', mt:1, barra:true,
    tec:['Quadril para trás, tronco a ~45°, coluna neutra.','Barra próxima às coxas, puxe em direção ao umbigo.','Cotovelos rentes ao corpo, escápulas se aproximando.'],
    at:['Lombar nunca arredonda — se arredondar, reduza a carga.','Sem impulso de quadril para levantar o peso.'], s:4, r:'8–10', d:90 },
  { id:'remada-unilateral', nome:'Remada unilateral com halter', mg:'costas', eq:'Halteres', nivel:'Iniciante', mt:1,
    tec:['Apoie joelho e mão no banco, coluna paralela ao chão.','Puxe o halter em direção ao quadril, não ao ombro.','Alongue completamente na descida.'],
    at:['Tronco não rotaciona para ajudar a subida.','Pescoço alinhado com a coluna.'], s:3, r:'10–12 (cada lado)', d:75 },
  { id:'remada-baixa', nome:'Remada baixa na polia', mg:'costas', eq:'Polia', nivel:'Iniciante', mt:1,
    tec:['Joelhos levemente flexionados, coluna ereta.','Puxe o triângulo até o abdômen, cotovelos junto ao corpo.','Deixe as escápulas se abrirem na volta sem soltar a postura.'],
    at:['Evite balançar o tronco para frente e para trás.','Ombros longe das orelhas.'], s:3, r:'10–12', d:75 },
  { id:'pulldown', nome:'Pullover na polia alta', mg:'costas', eq:'Polia', nivel:'Intermediário',
    tec:['Cotovelos semi-flexionados e fixos.','Leve a barra do nível do rosto até as coxas com o tronco inclinado.','Sinta o latíssimo alongando no topo.'],
    at:['O cotovelo não flexiona — senão vira tríceps.','Carga leve a moderada.'], s:3, r:'12–15', d:60 },

  // ── OMBROS ─────────────────────────────────────────────
  { id:'desenvolvimento-halter', nome:'Desenvolvimento com halteres', mg:'ombros', eq:'Halteres', nivel:'Iniciante', mt:1,
    tec:['Sentado com apoio, halteres na altura das orelhas.','Empurre para cima descrevendo um leve arco.','Desça até o cotovelo passar levemente da linha do ombro.'],
    at:['Não hiperestenda a lombar ao empurrar.','Punho firme e alinhado ao antebraço.'], s:4, r:'8–12', d:90 },
  { id:'elevacao-lateral', nome:'Elevação lateral', mg:'ombros', eq:'Halteres', nivel:'Iniciante',
    tec:['Cotovelos levemente flexionados, tronco firme.','Suba até a linha dos ombros liderando com o cotovelo.','Desça em 2 segundos, sem deixar o peso cair.'],
    at:['Sem impulso de tronco.','Trapézio relaxado — ombro não sobe junto.'], s:4, r:'12–15', d:50 },
  { id:'elevacao-posterior', nome:'Crucifixo inverso (posterior de ombro)', mg:'ombros', eq:'Máquina', nivel:'Iniciante',
    tec:['Peito apoiado, cotovelos quase estendidos.','Abra os braços na linha dos ombros.','Segure a contração por 1 segundo.'],
    at:['Não puxe com o cotovelo dobrado — vira remada.','Carga leve, foco em sentir a porção posterior.'], s:3, r:'15–20', d:50 },
  { id:'desenvolvimento-militar', nome:'Desenvolvimento militar com barra', mg:'ombros', eq:'Barra', nivel:'Avançado', mt:1, barra:true,
    tec:['Barra apoiada na clavícula, pegada pouco mais larga que os ombros.','Glúteo e abdômen contraídos, costelas para baixo.','Empurre passando a cabeça por baixo da barra no topo.'],
    at:['Evite arquear a lombar para compensar mobilidade.','Se o ombro incomodar, volte ao desenvolvimento com halteres.'], s:4, r:'6–8', d:120 },
  { id:'encolhimento', nome:'Encolhimento de ombros', mg:'ombros', eq:'Halteres', nivel:'Iniciante',
    tec:['Braços estendidos ao lado do corpo.','Eleve os ombros em direção às orelhas, sem rodar.','Segure 1 segundo no topo e desça controlado.'],
    at:['Sem rotação de ombro.','Pescoço neutro.'], s:3, r:'12–15', d:60 },

  // ── BÍCEPS ─────────────────────────────────────────────
  { id:'rosca-direta', nome:'Rosca direta com barra', mg:'biceps', eq:'Barra', nivel:'Iniciante', barra:true,
    tec:['Cotovelos colados ao tronco, punhos neutros.','Suba até a contração máxima sem levar o cotovelo à frente.','Desça em 2 segundos controlando.'],
    at:['Sem balanço de lombar.','Amplitude completa: estenda o cotovelo embaixo.'], s:3, r:'10–12', d:60 },
  { id:'rosca-alternada', nome:'Rosca alternada com halteres', mg:'biceps', eq:'Halteres', nivel:'Iniciante',
    tec:['Inicie com as palmas voltadas para o corpo.','Supine o punho durante a subida.','Alterne os braços mantendo o tronco imóvel.'],
    at:['Ombro não participa da subida.','Um braço por vez, sem pressa.'], s:3, r:'10–12 (cada)', d:60 },
  { id:'rosca-martelo', nome:'Rosca martelo', mg:'biceps', eq:'Halteres', nivel:'Iniciante',
    tec:['Pegada neutra durante todo o movimento.','Cotovelo fixo ao lado do tronco.','Trabalha braquial e braquiorradial junto ao bíceps.'],
    at:['Punho estável, sem quebrar.','Evite subir com impulso de ombro.'], s:3, r:'10–12', d:60 },
  { id:'rosca-scott', nome:'Rosca no banco Scott', mg:'biceps', eq:'Máquina', nivel:'Intermediário',
    tec:['Axila encostada no topo do apoio.','Desça até quase estender, sem soltar a tensão.','Suba sem tirar o braço do apoio.'],
    at:['Cuidado com a extensão total sob carga alta.','Cadência lenta na descida.'], s:3, r:'12–15', d:60 },

  // ── TRÍCEPS ────────────────────────────────────────────
  { id:'triceps-polia', nome:'Tríceps na polia (barra reta)', mg:'triceps', eq:'Polia', nivel:'Iniciante',
    tec:['Cotovelos colados ao tronco e fixos.','Estenda até travar suavemente, contraindo.','Volte apenas até 90° para manter tensão.'],
    at:['Tronco não inclina para empurrar.','Ombro não participa — só o cotovelo se move.'], s:3, r:'12–15', d:60 },
  { id:'supino-fechado', nome:'Supino fechado com barra', mg:'triceps', eq:'Barra', nivel:'Intermediário', mt:1,
    tec:['Deitado, pegada na largura dos ombros — não mais estreita que isso.','Cotovelos rentes ao tronco durante toda a descida.','Desça a barra até a base do peito e empurre.','O tríceps é quem termina o movimento no topo.'],
    at:['Pegada fechada demais força o punho e não recruta mais tríceps.','Cotovelo aberto transforma o exercício em supino comum.'], s:3, r:'8–10', d:90 },
  { id:'triceps-frances', nome:'Tríceps francês com halter', mg:'triceps', eq:'Halteres', nivel:'Intermediário',
    tec:['Halter acima da cabeça, cotovelos apontando para cima.','Desça atrás da cabeça controlando.','Estenda sem abrir os cotovelos.'],
    at:['Cotovelos permanecem próximos.','Comece com carga leve — a articulação sente.'], s:3, r:'10–12', d:60 },
  { id:'triceps-testa', nome:'Tríceps testa', mg:'triceps', eq:'Barra', nivel:'Intermediário',
    tec:['Deitado, barra W acima da testa.','Flexione apenas o cotovelo, braço parado.','Estenda até quase travar.'],
    at:['Se doer o cotovelo, troque pela polia.','Controle total na descida.'], s:3, r:'10–12', d:60 },
  { id:'mergulho-banco', nome:'Mergulho no banco', mg:'triceps', eq:'Peso corporal', nivel:'Iniciante', mt:1,
    tec:['Mãos na borda do banco, quadril próximo ao apoio.','Desça até o cotovelo formar ~90°.','Empurre sem travar bruscamente.'],
    at:['Não desça demais — protege o ombro.','Ombros afastados das orelhas.'], s:3, r:'12–15', d:60 },

  // ── QUADRÍCEPS ─────────────────────────────────────────
  { id:'agachamento-livre', nome:'Agachamento livre', mg:'quadriceps', eq:'Barra', nivel:'Intermediário', mt:1, barra:true,
    tec:['Barra apoiada no trapézio, pés na largura dos ombros.','Inspire, trave o core e desça empurrando o quadril para trás.','Desça até coxa paralela ou abaixo, conforme sua mobilidade.','Suba empurrando o chão com o meio do pé.'],
    at:['Joelho acompanha a direção do pé.','Lombar neutra — nada de "wink" acentuado.','Use suporte de segurança na gaiola.'], s:4, r:'6–10', d:150 },
  { id:'leg-press', nome:'Leg press 45°', mg:'quadriceps', eq:'Máquina', nivel:'Iniciante', mt:1,
    tec:['Pés na largura dos ombros, no meio da plataforma.','Desça até ~90° de joelho sem tirar o quadril do banco.','Empurre sem travar o joelho no topo.'],
    at:['Lombar sempre encostada.','Amplitude sem descolar o quadril é mais importante que carga.'], s:4, r:'10–12', d:105 },
  { id:'cadeira-extensora', nome:'Cadeira extensora', mg:'quadriceps', eq:'Máquina', nivel:'Iniciante',
    tec:['Eixo da máquina alinhado ao joelho.','Estenda até quase travar, segurando 1 segundo.','Desça em 2 segundos.'],
    at:['Evite carga excessiva com amplitude curta.','Quadril fixo no banco.'], s:3, r:'12–15', d:60 },
  { id:'agachamento-hack', nome:'Agachamento hack', mg:'quadriceps', eq:'Máquina', nivel:'Intermediário', mt:1,
    tec:['Costas inteiramente apoiadas no encosto, pés na largura dos ombros.','Pés um pouco à frente do quadril para poupar o joelho.','Desça até a coxa passar da paralela, controlando.','Empurre pelo meio do pé sem travar o joelho no topo.'],
    at:['Lombar colada no apoio do início ao fim.','Pé muito atrás joga toda a carga no joelho.'], s:3, r:'10–12', d:90 },
  { id:'afundo', nome:'Afundo com halteres', mg:'quadriceps', eq:'Halteres', nivel:'Intermediário', mt:1,
    tec:['Passo à frente firme, tronco ereto.','Desça até o joelho de trás quase tocar o chão.','Suba empurrando com o calcanhar da perna da frente.'],
    at:['Joelho da frente alinhado ao pé.','Comece sem carga até dominar o equilíbrio.'], s:3, r:'10–12 (cada)', d:90 },
  { id:'agachamento-bulgaro', nome:'Agachamento búlgaro', mg:'quadriceps', eq:'Halteres', nivel:'Avançado', mt:1,
    tec:['Pé de trás apoiado no banco, pé da frente adiantado.','Desça verticalmente controlando o tronco.','Suba pelo calcanhar da perna de apoio.'],
    at:['Exige equilíbrio — apoie-se numa barra se precisar.','Volume alto gera muita dor tardia: progrida devagar.'], s:3, r:'8–10 (cada)', d:90 },

  // ── POSTERIORES ────────────────────────────────────────
  { id:'stiff', nome:'Stiff com barra', mg:'posteriores', eq:'Barra', nivel:'Intermediário', mt:1, barra:true,
    tec:['Joelhos levemente flexionados e fixos.','Empurre o quadril para trás deixando a barra rente às pernas.','Desça até sentir alongamento no posterior, não além.','Suba contraindo glúteo e posterior.'],
    at:['Coluna neutra do início ao fim.','Amplitude é definida pelo alongamento, não pelo chão.'], s:4, r:'8–10', d:105 },
  { id:'mesa-flexora', nome:'Mesa flexora', mg:'posteriores', eq:'Máquina', nivel:'Iniciante',
    tec:['Quadril encostado no apoio, eixo alinhado ao joelho.','Flexione até a contração máxima.','Volte em 2–3 segundos.'],
    at:['Quadril não sobe do banco.','Evite dar tranco no início.'], s:3, r:'12–15', d:60 },
  { id:'flexora-em-pe', nome:'Flexora em pé (unilateral)', mg:'posteriores', eq:'Máquina', nivel:'Iniciante',
    tec:['Tronco estável, quadril neutro.','Flexione o joelho levando o calcanhar ao glúteo.','Retorne controlado.'],
    at:['Sem rodar o quadril.','Um lado de cada vez, mesma cadência.'], s:3, r:'12–15 (cada)', d:50 },
  { id:'levantamento-terra', nome:'Levantamento terra', mg:'posteriores', eq:'Barra', nivel:'Avançado', mt:1, barra:true,
    tec:['Barra sobre o meio do pé, canela próxima.','Quadril acima do joelho, peito aberto, dorsal ativa.','Empurre o chão e estenda quadril e joelho juntos.','Trave no topo sem hiperestender a lombar.'],
    at:['Exercício técnico: aprenda com carga leve.','Se a coluna arredondar, a série acabou.','Não faça no mesmo dia de agachamento pesado no início.'], s:3, r:'4–6', d:180 },

  // ── GLÚTEOS ────────────────────────────────────────────
  { id:'elevacao-pelvica', nome:'Elevação pélvica com barra', mg:'gluteos', eq:'Barra', nivel:'Iniciante', mt:1, barra:true,
    tec:['Escápulas apoiadas no banco, barra sobre o quadril com proteção.','Empurre o chão com os calcanhares e estenda o quadril.','Segure 1 segundo no topo com o glúteo contraído.'],
    at:['Queixo levemente para baixo, costelas fechadas.','Não hiperestenda a lombar para "subir mais".'], s:4, r:'10–12', d:90 },
  { id:'cadeira-abdutora', nome:'Cadeira abdutora', mg:'gluteos', eq:'Máquina', nivel:'Iniciante',
    tec:['Tronco levemente inclinado à frente para focar no glúteo médio.','Abra controlando e segure 1 segundo.','Volte sem bater as placas.'],
    at:['Evite usar impulso de tronco.','Cadência constante.'], s:3, r:'15–20', d:50 },
  { id:'coice-polia', nome:'Extensão de quadril na polia', mg:'gluteos', eq:'Polia', nivel:'Iniciante',
    tec:['Tronco firme, apoio nas mãos.','Estenda o quadril levando o calcanhar para trás e para cima.','Contraia no topo sem arquear a lombar.'],
    at:['Movimento vem do quadril, não da lombar.','Amplitude curta e bem feita supera amplitude com compensação.'], s:3, r:'12–15 (cada)', d:50 },

  // ── PANTURRILHAS ───────────────────────────────────────
  { id:'panturrilha-em-pe', nome:'Panturrilha em pé', mg:'panturrilhas', eq:'Máquina', nivel:'Iniciante',
    tec:['Joelho estendido, antepé no degrau.','Suba até a máxima flexão plantar, segure 1 segundo.','Desça até alongar completamente.'],
    at:['Sem quicar — a panturrilha responde a tempo sob tensão.','Amplitude total sempre.'], s:4, r:'12–15', d:45 },
  { id:'panturrilha-sentado', nome:'Panturrilha sentado', mg:'panturrilhas', eq:'Máquina', nivel:'Iniciante',
    tec:['Joelho a 90°, joelheira firme sobre a coxa.','Eleve os calcanhares o máximo possível.','Desça alongando por 2 segundos.'],
    at:['Trabalha mais o sóleo que a versão em pé.','Carga moderada e cadência controlada.'], s:3, r:'15–20', d:45 },

  // ── ABDÔMEN ────────────────────────────────────────────
  { id:'prancha', nome:'Prancha isométrica', mg:'abdomen', eq:'Peso corporal', nivel:'Iniciante',
    tec:['Cotovelos sob os ombros, corpo em linha.','Contraia abdômen e glúteo, respire normalmente.','Segure o tempo alvo mantendo a postura.'],
    at:['Quadril não sobe nem afunda.','Se perder a linha, encerre a série.'], s:3, r:'30–45 s', d:45 },
  { id:'abdominal-supra', nome:'Abdominal supra no solo', mg:'abdomen', eq:'Peso corporal', nivel:'Iniciante',
    tec:['Joelhos flexionados, mãos ao lado da cabeça sem puxar o pescoço.','Suba tirando as escápulas do chão.','Desça controlado sem relaxar totalmente.'],
    at:['Não puxe a nuca com as mãos.','Movimento curto e concentrado.'], s:3, r:'15–20', d:45 },
  { id:'elevacao-pernas', nome:'Elevação de pernas suspenso', mg:'abdomen', eq:'Peso corporal', nivel:'Intermediário',
    tec:['Pendurado na barra, ombros ativos.','Eleve as pernas retroversionando a pelve.','Desça devagar sem balançar.'],
    at:['O ganho vem da retroversão do quadril, não de levantar a perna.','Sem embalo.'], s:3, r:'10–15', d:60 },
  { id:'prancha-lateral', nome:'Prancha lateral', mg:'abdomen', eq:'Peso corporal', nivel:'Iniciante',
    tec:['Cotovelo sob o ombro, corpo alinhado.','Eleve o quadril e mantenha.','Repita dos dois lados.'],
    at:['Quadril não cai para trás.','Respiração contínua.'], s:3, r:'25–40 s (cada)', d:45 },

  // ── CARDIO ─────────────────────────────────────────────
  { id:'esteira-z2', nome:'Caminhada inclinada (Zona 2)', mg:'cardio', eq:'Esteira', nivel:'Iniciante',
    tec:['Inclinação 8–12%, velocidade que permita conversar com esforço leve.','Mantenha por 20 a 40 minutos.','Postura ereta, sem se apoiar no corrimão.'],
    at:['Se não conseguir falar frases completas, reduza o ritmo.','Excelente para dias de recuperação.'], s:1, r:'25–40 min', d:0 },
  { id:'bike-intervalado', nome:'Bike — intervalado curto', mg:'cardio', eq:'Bicicleta', nivel:'Intermediário',
    tec:['5 min de aquecimento progressivo.','8 a 10 tiros de 30 s forte / 90 s leve.','5 min de volta à calma.'],
    at:['Não faça intervalado em dia de perna pesada.','Respeite os intervalos de recuperação.'], s:1, r:'8–10 tiros', d:90 },
  { id:'remo-ergometro', nome:'Remo ergômetro', mg:'cardio', eq:'Remo', nivel:'Intermediário',
    tec:['Sequência: pernas, tronco, braços — e o inverso na volta.','Puxe até o final das costelas.','Cadência constante.'],
    at:['Não puxe primeiro com os braços.','Coluna neutra durante toda a remada.'], s:1, r:'15–20 min', d:0 }
];

/* ── Técnicas de intensidade ─────────────────────────────────
   Usadas só na última série e só em exercícios seguros para levar
   à falha. Nunca em agachamento livre ou levantamento terra. */
const TECNICAS = {
  bi:   { sigla:'BI-SET', nome:'Bi-set',
          desc:'Dois exercícios executados em sequência, sem descanso entre eles. O descanso vem só ao final do par.',
          como:'Termine o primeiro e vá direto para o segundo. Deixe a carga do segundo já separada antes de começar.' },
  drop: { sigla:'DROP SET', nome:'Drop set',
          desc:'Aumenta o tempo sob tensão além da falha, sem aumentar a carga do exercício.',
          como:'Só na última série: chegue à falha técnica, reduza cerca de 25% da carga na hora e siga até falhar de novo. Duas quedas.' },
  rp:   { sigla:'REST-PAUSE', nome:'Rest-pause',
          desc:'Permite acumular repetições próximas da falha com a carga cheia.',
          como:'Só na última série: chegue à falha técnica, descanse 15 a 20 segundos e faça mais 3 a 5 repetições. Repita duas vezes.' }
};

/* ── Treinos por nível ─────────────────────────────────────
   Item: [exercicioId, séries, repetições, descanso, extra?]
   extra: { tec:'drop'|'rp', bi:'A' }  — itens seguidos com o mesmo
   "bi" formam um par executado sem descanso entre eles. */
const TREINOS = [
  { id:'ini-a', nivel:'Iniciante', cod:'A', nome:'Corpo inteiro A', foco:'Empurrar · Pernas · Core', dur:48,
    itens:[['agachamento-livre',3,'8–10',120],['supino-reto-barra',3,'8–10',90],['remada-unilateral',3,'10–12',75],['desenvolvimento-halter',3,'10–12',75],['prancha',3,'30–45 s',45]] },
  { id:'ini-b', nivel:'Iniciante', cod:'B', nome:'Corpo inteiro B', foco:'Puxar · Posterior · Core', dur:50,
    itens:[['leg-press',3,'10–12',105],['puxada-frente',3,'10–12',75],['supino-inclinado-halter',3,'10–12',75],['mesa-flexora',3,'12–15',60],['abdominal-supra',3,'15–20',45]] },
  { id:'ini-c', nivel:'Iniciante', cod:'C', nome:'Corpo inteiro C', foco:'Glúteo · Ombro · Braço', dur:46,
    itens:[['elevacao-pelvica',3,'10–12',90],['remada-baixa',3,'10–12',75],['elevacao-lateral',3,'12–15',50],['rosca-alternada',3,'10–12',60],['triceps-polia',3,'12–15',60]] },

  /* No Intermediário entram os primeiros bi-sets, só nos isolados do fim —
     o aluno aprende a técnica num lugar seguro antes de chegar ao Premium. */
  { id:'int-a', nivel:'Intermediário', cod:'A', nome:'Superior — empurrar', foco:'Peito · Ombro · Tríceps', dur:62,
    itens:[['supino-reto-barra',4,'8–10',90],['supino-inclinado-halter',3,'10–12',75],['desenvolvimento-halter',4,'8–12',90],['elevacao-lateral',4,'12–15',50],['triceps-polia',3,'12–15',0,{bi:'A'}],['triceps-frances',3,'10–12',75,{bi:'A'}]] },
  { id:'int-b', nivel:'Intermediário', cod:'B', nome:'Inferior — quadríceps', foco:'Quadríceps · Panturrilha', dur:64,
    itens:[['agachamento-livre',4,'6–10',150],['leg-press',4,'10–12',105],['afundo',3,'10–12',90],['cadeira-extensora',3,'12–15',60],['panturrilha-em-pe',4,'12–15',45]] },
  { id:'int-c', nivel:'Intermediário', cod:'C', nome:'Superior — puxar', foco:'Costas · Bíceps · Posterior de ombro', dur:60,
    itens:[['barra-fixa',4,'6–10',105],['remada-curvada',4,'8–10',90],['puxada-frente',3,'10–12',75],['elevacao-posterior',3,'15–20',50],['rosca-direta',3,'10–12',0,{bi:'B'}],['rosca-martelo',3,'10–12',75,{bi:'B'}]] },
  { id:'int-d', nivel:'Intermediário', cod:'D', nome:'Inferior — posterior e glúteo', foco:'Posterior · Glúteo · Core', dur:58,
    itens:[['stiff',4,'8–10',105],['elevacao-pelvica',4,'10–12',90],['mesa-flexora',3,'12–15',60],['cadeira-abdutora',3,'15–20',50],['elevacao-pernas',3,'10–15',60]] },

  /* PREMIUM — divisão avançada.
     7 exercícios por sessão: 4 multiarticulares na frente, com carga e
     descanso longo, e 3 isolados no fim, onde entram as técnicas de
     intensidade. Técnica sempre na última série, nunca nos levantamentos
     pesados de coluna livre. */
  { id:'pre-a', nivel:'Premium', cod:'A', nome:'Push — força e densidade', foco:'Peito · Ombro · Tríceps', dur:78,
    final:['prancha',"3 × 40–60 s"],
    itens:[
      ['supino-reto-barra',5,'5–7',150],
      ['desenvolvimento-militar',4,'6–8',120],
      ['supino-inclinado-halter',4,'8–10',105],
      ['paralelas',3,'8–12',90,{tec:'rp'}],
      ['crossover',3,'12–15',0,{bi:'A'}],
      ['elevacao-lateral',3,'12–15',75,{bi:'A'}],
      ['triceps-polia',4,'10–12',60,{tec:'drop'}]] },

  { id:'pre-b', nivel:'Premium', cod:'B', nome:'Pull — espessura e largura', foco:'Costas · Bíceps · Posterior de ombro', dur:76,
    itens:[
      ['barra-fixa',4,'6–8',120],
      ['remada-curvada',4,'8–10',105],
      ['puxada-frente',4,'10–12',90],
      ['remada-baixa',3,'10–12',90,{tec:'rp'}],
      ['pulldown',3,'12–15',0,{bi:'B'}],
      ['elevacao-posterior',4,'15–20',75,{bi:'B'}],
      ['rosca-scott',4,'10–12',60,{tec:'drop'}]] },

  { id:'pre-c', nivel:'Premium', cod:'C', nome:'Legs — quadríceps e força', foco:'Quadríceps · Panturrilha', dur:82,
    final:['elevacao-pernas',"3 × 12–15"],
    itens:[
      ['agachamento-livre',5,'5–8',180],
      ['leg-press',4,'10–12',105,{tec:'drop'}],
      ['agachamento-hack',3,'10–12',90],
      ['agachamento-bulgaro',3,'8–10 (cada)',90],
      ['cadeira-extensora',4,'12–15',75,{tec:'rp'}],
      ['panturrilha-em-pe',4,'10–12',0,{bi:'C'}],
      ['panturrilha-sentado',3,'15–20',60,{bi:'C'}]] },

  { id:'pre-d', nivel:'Premium', cod:'D', nome:'Posterior e glúteo', foco:'Posteriores · Glúteos', dur:74,
    itens:[
      ['levantamento-terra',4,'4–6',180],
      ['stiff',4,'8–10',120],
      ['elevacao-pelvica',4,'8–12',105,{tec:'rp'}],
      ['afundo',3,'10–12 (cada)',90],
      ['mesa-flexora',4,'12–15',75,{tec:'drop'}],
      ['cadeira-abdutora',3,'15–20',0,{bi:'D'}],
      ['coice-polia',3,'12–15 (cada)',60,{bi:'D'}]] },

  { id:'pre-e', nivel:'Premium', cod:'E', nome:'Ombro e braço — volume e detalhe', foco:'Ombros · Bíceps · Tríceps', dur:70,
    final:['prancha-lateral',"3 × 30–45 s (cada)"],
    itens:[
      ['desenvolvimento-halter',4,'8–10',105],
      ['remada-alta',3,'10–12',90],
      ['barra-supinada',3,'8–10',105],
      ['supino-fechado',3,'8–10',90,{tec:'rp'}],
      ['elevacao-lateral',4,'12–15',75,{tec:'drop'}],
      ['rosca-martelo',3,'10–12',0,{bi:'E'}],
      ['triceps-frances',3,'10–12',60,{bi:'E'}]] }
];

/* Cardio do Premium: fora das sessões de força, para não competir com a
   recuperação. Dois dias de folga por semana com Zona 2. */
const CARDIO_PREMIUM = {
  titulo:'Condicionamento — dias de folga',
  desc:'Duas sessões por semana, nos dias sem musculação. Não faça na véspera do treino C ou D.',
  itens:[['esteira-z2','25–40 min'],['bike-intervalado','8 a 10 tiros, 1× por semana no máximo']]
};

const PLANOS = [
  { id:'iniciante', nome:'Plano Iniciante', preco:29.90, per:'pagamento único', nivel:'Iniciante', destaque:false,
    desc:'Indicado para quem está começando ou retomando os treinos.',
    itens:['Treinos para iniciantes','Orientações de execução','Organização dos exercícios','Progressão inicial','Acesso à plataforma'],
    cta:'Começar treinamento' },
  { id:'intermediario', nome:'Plano Intermediário', preco:59.90, per:'pagamento único', nivel:'Intermediário', destaque:false,
    desc:'Para alunos que já têm experiência com musculação e querem evoluir.',
    itens:['Treinos intermediários','Maior variedade de exercícios','Progressão de treinamento','Orientações técnicas','Organização dos treinos','Acesso à plataforma'],
    cta:'Quero evoluir' },
  { id:'premium', nome:'Slayter Trainer', preco:89.90, per:'/mês', nivel:'Premium', destaque:true,
    sub:'Experiência completa',
    desc:'Treinos estruturados dentro da metodologia, conteúdos avançados, materiais motivacionais e o clube de vantagens da plataforma.',
    curto:['Treinos','Técnica','Evolução','Dicas alimentares educativas','Mente Slayter','Comunidade','CoinSlayter','Benefícios exclusivos'],
    itens:['Treinos estruturados dentro da metodologia disponível na plataforma','Conteúdos avançados','Dicas alimentares de caráter educativo','Materiais motivacionais','Pensamentos e conteúdos exclusivos de Jesley Slayter','Comunidade Slayter','CoinSlayter','Feed da comunidade','Área de chat','Benefícios e descontos de parceiros'],
    cta:'Começar agora' }
];

/* Casos de alunos — publicados pelo painel, sempre com autorização
   de uso de imagem e relato do próprio aluno. */
const CASOS = [];

const METODO = [
  ['Técnica','Amplitude, cadência e postura antes de carga. A execução correta é o que torna o treino seguro e repetível ao longo dos anos.'],
  ['Consistência','O treino que você faz sempre vale mais do que o treino perfeito que você faz uma vez. A rotina é construída semana a semana.'],
  ['Progressão','Carga, repetição, cadência ou amplitude: algo precisa avançar de forma organizada, registrada e dentro do seu contexto.'],
  ['Disciplina','Disciplina sem extremismo. Combinado cumprido, mesmo nos dias em que a motivação não aparece.'],
  ['Bem-estar','Treinar deve melhorar o seu dia, não destruí-lo. Sono, recuperação e humor fazem parte do resultado.'],
  ['Qualidade de vida','Força para a vida real: subir escada, carregar peso, brincar com os filhos, envelhecer com autonomia.'],
  ['Resultado','Resultado concreto vem de processo respeitado. Sem atalho, sem promessa milagrosa, sem comparação com o treino do outro.']
];

const JORNADA = [
  ['Descobrir','Conheça o método e o estilo de treino.'],
  ['Escolher plano','Três níveis, condições claras antes da contratação.'],
  ['Pagar','PIX ou cartão, com termos apresentados na compra.'],
  ['Onboarding','Perguntas rápidas para organizar o ponto de partida.'],
  ['Receber treino','Sua divisão semanal montada dentro da metodologia.'],
  ['Treinar','Execução guiada, vídeo, séries, repetições e descanso.'],
  ['Registrar','Carga, repetições e observações a cada série.'],
  ['Comunidade','Feed, chat e troca com quem treina junto.'],
  ['CoinSlayter','Moedas por constância, trocadas por benefícios.'],
  ['Evoluir','Histórico, gráficos e metas para o próximo ciclo.']
];

/* ── Mente Slayter ──────────────────────────────────────── */
const PENSAMENTOS = [
  { t:'Firmeza com os processos e gentileza com as pessoas.', c:'Esse é o eixo de tudo o que eu ensino. Firmeza é com o combinado, com o horário, com a série que falta. Gentileza é com quem está do outro lado — inclusive com você mesmo, no dia em que o corpo pediu calma.', tag:'Princípio', dias:1 },
  { t:'Constância vence intensidade.', c:'O treino insano de segunda não paga o sofá de quarta, quinta e sexta. Quem aparece sempre constrói uma base que o pico isolado nunca alcança.', tag:'Constância', dias:3 },
  { t:'Carga é consequência, técnica é decisão.', c:'Você escolhe executar bem. O peso vem depois, sozinho, como resultado de meses de execução limpa. Inverter essa ordem é a forma mais rápida de parar de treinar.', tag:'Técnica', dias:6 },
  { t:'Você não está atrasado. Você está começando.', c:'Comparar seu primeiro mês com o quinto ano de alguém é o jeito mais eficiente de desistir. Seu histórico compete com o seu histórico.', tag:'Mentalidade', dias:9 },
  { t:'Descanso também é treino.', c:'O estímulo acontece na academia, a adaptação acontece no sono. Quem entende isso progride mais e se machuca menos.', tag:'Recuperação', dias:13 },
  { t:'Disciplina não é rigidez.', c:'Rigidez quebra. Disciplina se ajusta: reduz a série, troca o exercício, encurta a sessão — mas não abandona a semana.', tag:'Disciplina', dias:17 }
];

const CONTEUDOS = [
  { tipo:'Vídeo', t:'Como organizar sua semana de treino', dur:'8 min', desc:'Montando a divisão semanal de acordo com a sua rotina real, não com a ideal.' },
  { tipo:'Áudio', t:'Os três dias mais difíceis', dur:'12 min', desc:'O que fazer no dia sem vontade, no dia sem tempo e no dia sem energia.' },
  { tipo:'Texto', t:'Progressão de carga sem pressa', dur:'5 min', desc:'Quando aumentar, quanto aumentar e como registrar para não se perder.' },
  { tipo:'Vídeo', t:'Aquecimento que vale a pena', dur:'6 min', desc:'Protocolo curto e específico antes das séries principais.' },
  { tipo:'Texto', t:'Alimentação: princípios gerais', dur:'7 min', desc:'Conteúdo educativo sobre hábitos. Não substitui acompanhamento de nutricionista.' },
  { tipo:'Áudio', t:'Firmeza e gentileza na prática', dur:'15 min', desc:'Como aplicar o princípio da marca dentro e fora da academia.' }
];

/* ── Comunidade ─────────────────────────────────────────── */
const FEED_SEED = [
  { id:'p1', autor:'Jesley Slayter', ini:'JS', admin:true, min:42,
    txt:'Semana nova. Lembrete de sempre: ninguém precisa bater recorde hoje. Precisa aparecer, executar bem e registrar. O resto o tempo resolve.\n\nFirmeza com os processos, gentileza com as pessoas.',
    likes:128, coms:[{a:'Renata M.', ini:'RM', t:'Precisava ler isso numa segunda 😅'}, {a:'Diego F.', ini:'DF', t:'Anotado, professor.'}] },
  { id:'p2', autor:'Camila Torres', ini:'CT', min:95,
    txt:'12 semanas no Intermediário. Agachamento saiu de 40kg para 62,5kg mantendo a profundidade. O que mudou foi parar de pular o treino B.',
    att:{ tipo:'PR', ex:'Agachamento livre', v:'62,5 kg', sub:'Recorde pessoal · 8 repetições' },
    likes:64, coms:[{a:'Jesley Slayter', ini:'JS', t:'Profundidade mantida é o detalhe que importa. Parabéns.'}] },
  { id:'p3', autor:'Marcelo Aguiar', ini:'MA', min:180,
    txt:'Treino C concluído. Terceira semana sem falhar nenhuma sessão — primeira vez na vida que consigo isso.',
    att:{ tipo:'TREINO', ex:'Inferior — posterior e glúteo', v:'58 min', sub:'5 exercícios · 17 séries · 4.820 kg movimentados' },
    likes:37, coms:[] },
  { id:'p4', autor:'Renata Mendes', ini:'RM', min:320,
    txt:'Alguém mais sente muito mais o glúteo na elevação pélvica quando fecha as costelas? Mudou tudo pra mim depois da dica do vídeo.',
    likes:22, coms:[{a:'Camila Torres', ini:'CT', t:'Sim! E o queixo pra baixo também ajuda.'}] }
];

const CHATS = [
  { id:'avisos', nome:'Avisos da plataforma', sub:'Comunicados oficiais', oficial:true, msgs:[
    { a:'sys', t:'Novo ciclo de treinos Premium publicado. A divisão A–E foi atualizada com progressão de carga para as próximas 6 semanas.', min:60 },
    { a:'sys', t:'Campanha CoinSlayter de setembro: treinos concluídos entre os dias 15 e 30 valem moedas em dobro.', min:1440 }
  ]},
  { id:'geral', nome:'Comunidade Slayter', sub:'Canal geral', msgs:[
    { a:'Diego F.', ini:'DF', t:'Bom dia, tropa. Quem treina antes das 7h aqui?', min:55 },
    { a:'Camila Torres', ini:'CT', t:'Presente. 6h15 todo dia, sem exceção.', min:50 },
    { a:'me', t:'Vou tentar entrar nesse grupo das 6h. Hoje foi 7h30.', min:44 },
    { a:'Jesley Slayter', ini:'JS', t:'Horário bom é o horário que cabe na sua rotina e que você consegue repetir. Constância acima de horário ideal.', min:38 }
  ]},
  { id:'iniciantes', nome:'Primeiros passos', sub:'Canal de iniciantes', msgs:[
    { a:'Marcelo Aguiar', ini:'MA', t:'Dúvida: dor muscular no dia seguinte é obrigatória?', min:200 },
    { a:'Jesley Slayter', ini:'JS', t:'Não. Dor tardia é uma resposta comum no começo, não é medida de qualidade do treino. Progressão registrada é a medida.', min:195 }
  ]},
  { id:'jesley', nome:'Jesley Slayter', sub:'Mensagem direta', dm:true, msgs:[
    { a:'Jesley Slayter', ini:'JS', t:'Fala! Vi que você fechou a semana completa. Como está a recuperação entre os treinos de perna?', min:120 }
  ]}
];

/* ── CoinSlayter ────────────────────────────────────────── */
const PARCEIROS = [
  { id:'nc', nome:'Nutrição Cedro',    cat:'Suplementos',    sig:'NC', desc:'Loja de suplementos e alimentação esportiva.' },
  { id:'fp', nome:'Forja Performance', cat:'Academias',      sig:'FP', desc:'Rede de academias parceiras da metodologia.' },
  { id:'lm', nome:'Linha Mestra',      cat:'Moda fitness',   sig:'LM', desc:'Vestuário de treino e acessórios.' },
  { id:'nr', nome:'Núcleo Reab',       cat:'Serviços',       sig:'NR', desc:'Fisioterapia esportiva e avaliação funcional.' },
  { id:'cv', nome:'Casa Verde Meal',   cat:'Serviços',       sig:'CV', desc:'Marmitas e refeições porcionadas.' }
];

const BENEFICIOS = [
  { id:'b1', pid:'nc', tit:'15% em toda a linha de proteínas', custo:400, disc:'15%', val:'Válido até 31/10/2026', est:38 },
  { id:'b2', pid:'fp', tit:'Isenção da matrícula + 1ª mensalidade com 30%', custo:1200, disc:'30%', val:'Válido até 30/11/2026', est:12 },
  { id:'b3', pid:'lm', tit:'R$ 40 de desconto acima de R$ 199', custo:300, disc:'R$ 40', val:'Válido até 31/12/2026', est:60 },
  { id:'b4', pid:'nr', tit:'Avaliação funcional com 50% de desconto', custo:900, disc:'50%', val:'Válido até 15/12/2026', est:9 },
  { id:'b5', pid:'cv', tit:'10 refeições pelo preço de 8', custo:650, disc:'20%', val:'Válido até 30/11/2026', est:25 },
  { id:'b6', pid:'lm', tit:'Kit completo de treino — R$ 300 em produtos', custo:2000, disc:'Kit', val:'Válido até 31/12/2026', est:6 }
];

const REGRAS_COIN = [
  ['Treino concluído e registrado', '+25', 'Até 1 vez por dia'],
  ['Semana completa da sua meta',   '+150','Ao fechar a meta semanal'],
  ['Sequência de 30 dias ativos',   '+500','Bônus de constância'],
  ['Publicação aprovada no feed',   '+10', 'Até 3 por semana'],
  ['Desafio mensal concluído',      '+300','Conforme o desafio ativo'],
  ['Campanha especial',             'Variável','Definida pelo administrador']
];

const LEDGER_SEED = [
  { d:'Hoje',        t:'Treino concluído — Superior: empurrar', v:+25 },
  { d:'Ontem',       t:'Treino concluído — Inferior: quadríceps', v:+25 },
  { d:'2 dias atrás',t:'Semana completa (4 de 4 treinos)', v:+150 },
  { d:'4 dias atrás',t:'Publicação no feed da comunidade', v:+10 },
  { d:'8 dias atrás',t:'Resgate — Nutrição Cedro · 15% proteínas', v:-400 },
  { d:'12 dias atrás',t:'Desafio de setembro concluído', v:+300 },
  { d:'16 dias atrás',t:'Sequência de 30 dias ativos', v:+500 }
];

/* ── Dados do aluno de demonstração ─────────────────────── */
const ALUNO = {
  nome:'Jesley Slayter', primeiro:'Jesley', ini:'JS', email:'jesleyBr123@icloud.com',
  plano:'premium', nivel:'Premium', desde:'12/06/2026', proxima:'12/10/2026',
  idade:32, objetivo:'Ganho de massa muscular', freq:4, exp:'Mais de 2 anos',
  coins:1830, streak:18, semanaMeta:4, semanaFeitos:3, treinosTotal:96, admin:true
};

// Frequência: treinos por semana nas últimas 12 semanas
const FREQ_12S = [2,3,3,2,4,3,4,4,3,4,4,3];
// Tonelagem semanal (kg movimentados) nas mesmas 12 semanas
const TON_12S  = [8420,11150,11980,9240,14680,12100,15320,16040,13890,16720,17450,14980];
// Evolução de carga (kg) — 3 exercícios-chave, 1 ponto por mês
const CARGA_MESES = ['Abr','Mai','Jun','Jul','Ago','Set'];
const CARGA_SERIES = [
  { nome:'Agachamento livre', cor:'var(--s1)', v:[70,75,80,85,92,97] },
  { nome:'Supino reto',       cor:'var(--s2)', v:[52,55,57,60,62,67] },
  { nome:'Levantamento terra',cor:'var(--s3)', v:[90,95,102,110,115,122] }
];
// Volume por grupamento no mês (séries)
const VOL_GRUPO = [['Costas',26],['Peito',22],['Quadríceps',21],['Ombros',19],['Posteriores',15],['Bíceps',12],['Tríceps',12],['Glúteos',10],['Abdômen',9],['Panturrilhas',8]];

/* Medidas de demonstração — o aluno registra as dele pela plataforma. */
const MEDIDAS_SEED = [
  { data:'2026-04-05', peso:79.8, cintura:86.0, braco:36.5 },
  { data:'2026-05-04', peso:80.6, cintura:85.4, braco:37.0 },
  { data:'2026-06-07', peso:81.4, cintura:85.0, braco:37.4 },
  { data:'2026-07-06', peso:82.3, cintura:84.6, braco:38.0 },
  { data:'2026-08-03', peso:83.1, cintura:84.1, braco:38.3 },
  { data:'2026-09-07', peso:84.0, cintura:83.5, braco:38.9 }
];

const ANAMNESE_CAMPOS = [
  { g:'Dados básicos', campos:[
    ['altura_cm','Altura (cm)','num','Ex.: 178'],
    ['nascimento','Data de nascimento','date',''],
    ['sexo','Sexo','sel','Masculino|Feminino|Prefiro não informar'] ]},
  { g:'Rotina de treino', campos:[
    ['objetivo','Objetivo principal','sel','Ganho de massa muscular|Emagrecimento|Saúde e qualidade de vida|Performance'],
    ['experiencia','Experiência com musculação','sel','Nunca treinei|Menos de 6 meses|6 meses a 2 anos|Mais de 2 anos'],
    ['freq_semanal','Dias por semana que consegue treinar','num','Ex.: 4'],
    ['horario','Horário habitual','sel','Manhã|Tarde|Noite|Varia'],
    ['local_treino','Onde treina','sel','Academia|Em casa|Academia e casa'] ]},
  { g:'Saúde', sensivel:true, campos:[
    ['lesoes','Lesões ou cirurgias (quando e onde)','texto','Ex.: tendinite no ombro direito em 2024'],
    ['condicoes','Condições de saúde','texto','Ex.: hipertensão controlada, asma'],
    ['medicacao','Medicação de uso contínuo','texto','Se houver'],
    ['dores','Dor ou desconforto atual','texto','Onde e em qual movimento'],
    ['liberacao_medica','Tenho liberação médica para exercício','check',''] ]},
  { g:'Estilo de vida', campos:[
    ['sono_horas','Horas de sono por noite','num','Ex.: 7'],
    ['nivel_estresse','Nível de estresse','sel','Baixo|Moderado|Alto'],
    ['atividade_diaria','Rotina fora do treino','sel','Sentado a maior parte do dia|Em pé ou caminhando|Trabalho físico pesado'],
    ['restricao_alimentar','Restrição alimentar','texto','Alergia, intolerância, dieta específica'],
    ['observacoes','Algo mais que eu deva saber','texto',''] ]}
];

const CONQUISTAS = [
  { t:'Primeira semana completa', d:'4 de 4 treinos registrados', ok:true },
  { t:'30 dias de constância',    d:'Sequência sem semana vazia',  ok:true },
  { t:'Primeiro recorde pessoal', d:'Carga superada com técnica mantida', ok:true },
  { t:'100 treinos registrados',  d:'96 de 100 concluídos',        ok:false, p:96 },
  { t:'Ciclo Premium completo',   d:'Divisão A–E por 8 semanas',   ok:false, p:62 },
  { t:'Mentor da comunidade',     d:'50 comentários úteis no feed', ok:false, p:34 }
];

const METAS = [
  { t:'4 treinos por semana', a:3, b:4, u:'treinos' },
  { t:'Agachamento 100 kg',   a:97, b:100, u:'kg' },
  { t:'18.000 kg na semana',  a:14980, b:18000, u:'kg' }
];

/* ── Histórico de treinos ───────────────────────────────── */
const HISTORICO = [
  { d:'17/09/2026', t:'Superior — empurrar', dur:64, ser:21, ton:5240, rpe:8 },
  { d:'16/09/2026', t:'Inferior — quadríceps', dur:71, ser:18, ton:9860, rpe:9 },
  { d:'14/09/2026', t:'Superior — puxar', dur:59, ser:20, ton:6180, rpe:7 },
  { d:'12/09/2026', t:'Inferior — posterior e glúteo', dur:57, ser:17, ton:8320, rpe:8 },
  { d:'11/09/2026', t:'Superior — empurrar', dur:62, ser:21, ton:5040, rpe:8 },
  { d:'09/09/2026', t:'Condicionamento e core', dur:44, ser:10, ton:1240, rpe:6 }
];

/* ── Financeiro / admin (demonstração) ──────────────────── */
const ALUNOS_ADMIN = [
  { n:'Camila Torres',   e:'camila.t@exemplo.com',   p:'Premium',       s:'Ativo',      v:89.90, d:'12/03/2026', f:'Cumprida' },
  { n:'Marcelo Aguiar',  e:'m.aguiar@exemplo.com',   p:'Intermediário', s:'Ativo',      v:59.90, d:'02/08/2026', f:'Em curso' },
  { n:'Renata Mendes',   e:'renata.m@exemplo.com',   p:'Premium',       s:'Ativo',      v:89.90, d:'19/05/2026', f:'Cumprida' },
  { n:'Diego Farias',    e:'diego.f@exemplo.com',    p:'Premium',       s:'Inadimplente',v:89.90, d:'07/07/2026', f:'Em curso' },
  { n:'Paula Ribeiro',   e:'paula.r@exemplo.com',    p:'Iniciante',     s:'Ativo',      v:29.90, d:'01/09/2026', f:'Em curso' },
  { n:'Thiago Nogueira', e:'thiago.n@exemplo.com',   p:'Premium',       s:'Cancelamento solicitado', v:89.90, d:'15/02/2026', f:'Cumprida' },
  { n:'Bianca Lopes',    e:'bianca.l@exemplo.com',   p:'Intermediário', s:'Ativo',      v:59.90, d:'23/08/2026', f:'Em curso' },
  { n:'Rafael Coimbra',  e:'rafael.c@exemplo.com',   p:'Premium',       s:'Suspenso',   v:89.90, d:'11/01/2026', f:'Cumprida' }
];

const RECEITA_MESES = ['Abr','Mai','Jun','Jul','Ago','Set'];
const RECEITA_V = [18420, 21160, 24980, 27340, 31280, 34910];
const MIX_PLANOS = [['Premium',214],['Intermediário',96],['Iniciante',78]];

const DENUNCIAS = [
  { q:'Publicação', a:'Usuário 4821', m:'Divulgação de produto sem autorização', st:'Aberta', min:40 },
  { q:'Comentário', a:'Usuário 1190', m:'Comentário desrespeitoso com outro aluno', st:'Aberta', min:210 },
  { q:'Publicação', a:'Usuário 3307', m:'Promessa de resultado sem base', st:'Resolvida', min:2880 }
];

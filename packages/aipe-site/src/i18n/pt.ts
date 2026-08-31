/**
 * Portuguese (pt-BR) copy — mirrors `en.ts` key-for-key and type-for-type.
 * Written as natural Brazilian Portuguese, not translated word-for-word. CLI
 * commands, flags, harness ids, ledger status tokens, the cost formula and
 * terminal transcripts stay English in both locales — they are code.
 */

import type { Translations } from "./index";

const pt: Translations = {
  nav: {
    home: "Início da AIPe",
    why: "Por quê",
    company: "Empresa",
    how: "Como",
    laws: "Leis",
    harnesses: "Harnesses",
    cost: "Custo",
    docs: "Docs",
    github: "GitHub",
    getStarted: "Começar",
    toggleMenu: "Abrir menu",
  },

  langToggle: {
    label: "Idioma",
  },

  hero: {
    eyebrow: "Engenheiro de Produto com IA · uma CLI standalone, não um plugin",
    headlineLine1: "Você traz a demanda.",
    headlineLine2: "Ela comanda a área de engenharia.",
    bodyBefore:
      "A AIPe transforma o seu agente de código num coordenador de engenharia e você no Engenheiro de Produto. Entregue uma demanda; ela decompõe o trabalho, despacha um especialista por repositório ",
    bodyEmphasis: "em paralelo",
    bodyAfter:
      " — cada um isolado no seu próprio git worktree — e devolve PRs, sob uma única lei de despacho e um portão de evidências.",
    copy: "copiar",
    copied: "copiado",
    seeHow: "Veja como funciona →",
    readDocs: "Ler a documentação",
    scene: {
      coordinator: "coordenador",
      harnesses: "fan-out · harnesses",
      reject: "QA reprova → loop",
      repos: "merge nos repos",
    },
  },

  // Cena ambiente do Fluxo — três agentes em dois repos, despachados em
  // paralelo, rodando, entregando, revisados, mesclados, em loop. Tokens de
  // status/lei (parallel, dispatched, delivered, verified, merged) seguem em
  // inglês pela fronteira comando/fala; só a prosa traduz.
  flow: {
    section: {
      eyebrow: "Veja rodando",
      title: "Despacho, revisão, reprovação, conserto, promoção — a história inteira.",
      lead:
        "Não um diagrama de como funciona — a coisa funcionando, do início ao fim. O coordenador entrega uma demanda a três especialistas em dois repositórios; a lei de despacho deixa os três rodarem de uma vez; um QA por repo gateia o trabalho; um deles é reprovado e consertado na hora; o que é aprovado mescla em `dev`, e depois um PR separado promove para `main`. Roda sozinho — não há nada para apertar.",
    },
    terminalHeader: "coordenador — console",
    labels: {
      coordinator: "coordenador",
      dispatchLaw: "lei de despacho",
      parallel: "parallel",
      units: "unidades",
      repos: "repos",
      placed: "posicionado",
      worktree: "worktree",
      ledger: "ledger",
      receiving: "recebendo a demanda…",
      dispatching: "despachando…",
      qaRole: "QA",
      prOpened: "PR aberto",
      prToDev: "PR → dev",
      prMergedToDev: "mesclado em dev",
      promotePr: "promove → main",
      promoteMerged: "mesclado em main",
      inReview: "em revisão",
      rejected: "reprovado",
      fixing: "consertando",
      reviewing: "revisando",
      approved: "aprovado",
    },
    captions: {
      demand: "o coordenador recebe a demanda",
      validate: "dois repos → a lei roda em paralelo",
      "dispatch-1": "agente 1 de 3 despachado — entra em cena",
      "dispatch-2": "agente 2 de 3 despachado — junta-se ao time",
      "dispatch-3": "agente 3 de 3 — 3 agentes, 2 repos, de uma vez",
      work: "três worktrees, trabalhando em paralelo",
      deliver: "cada agente entrega sua evidência",
      "pr-dev": "cada entrega abre um PR em dev",
      "qa-review": "um QA por repo começa a revisar",
      "qa-reject": "um QA reprova — precisa de conserto",
      "dev-fix": "o mesmo dev conserta, no ramo dev",
      "qa-approve": "o QA revisa de novo e aprova",
      "merge-dev": "PRs aprovados mesclam em dev",
      promote: "dev promove para main — novo PR",
      "merge-main": "mesclado na main · ledger fecha",
    },
    script: {
      demand: "entregue três unidades em dois repos — e mostre rodando de uma vez",
      reviewAfter: "a revisão chega depois do trabalho, nunca antes",
      rejectionFinding: "faltou caso de borda no desempate de waves",
    },
    previousCycle: (merged: number, repos: number) => `ciclo anterior: ${merged} mesclados em ${repos} repos`,
    aria: {
      label:
        "A AIPe despachando três agentes em dois repositórios, um de cada vez: Lawson em openvibes-embark/aipe-site, depois Marco em openvibes-embark/embark-site, depois Jane em agentistics/web, todos rodando em paralelo uma vez despachados, cada um no seu próprio harness e tier de modelo. Cada agente abre um pull request em dev; um QA por repositório gateia o trabalho; um PR é reprovado e o mesmo desenvolvedor conserta no mesmo ramo, nunca o QA; o QA então aprova e os PRs mesclam em dev; um pull request de promoção separado leva dev para main e mescla, fechando o ledger. A cena roda em loop, carregando adiante um resumo do que acabou de terminar em vez de apagá-lo.",
    },
  },

  console: {
    section: {
      eyebrow: "Veja rodando",
      title: "Uma demanda, executada passo a passo.",
      lead:
        "É uma jornada real acontecendo. O terminal à esquerda são os comandos que de fato rodam; o palco à direita são as decisões e alocações que cada um dispara. Avance passo a passo, ou deixe rodar.",
    },
    title: "O Console",
    journeyPrefix: "· jornada",
    terminalHeader: "terminal — o que realmente roda",
    stageHeader: "o palco — as decisões sendo tomadas",
    running: "rodando",
    aria: {
      group:
        "O Console — dois painéis no seu ritmo: o terminal à esquerda, o palco das decisões à direita",
      scrub: "Navegar pelos passos",
      prev: "Passo anterior",
      next: "Próximo passo",
      play: "Reproduzir",
      pause: "Pausar",
      replay: "Repetir",
      restart: "Recomeçar",
      speed: (s: number) => `Velocidade ${s}×, toque para mudar`,
    },
    captions: {
      demand: "o coordenador recebe a demanda",
      journey: "uma demanda → uma jornada",
      unit: "uma unidade · aipe-site",
      route: "roteado → sdd-lite (base)",
      envelope: "envelope 64 · travado",
      law: "mesma package → serializa",
      worktree: "worktree talhado · isolado",
      dispatch: "wave 1 roda · wave 2 espera",
      deliver: "entregue · com evidência",
      evidence: "sem evidência → rejeitado",
      "qa-block": "sem verificar, não dá merge",
      verify: "verificado pela QA",
      merged: "merge feito · travado",
    },
    // Ver a REGRA (fronteira comando/fala) e SCRIPT_KEYS em consoleScript.ts: só a
    // narração vive aqui e traduz; comandos, tokens de máquina e identificadores
    // ficam em inglês. `{unit}` é um identificador literal, injetado na renderização.
    script: {
      demand:
        "Precisamos do site público da AIPe — uma package em openvibes-embark. Faça um site genuinamente bom, e que MOSTRE o trabalho multi-agente e multi-harness em vez de descrevê-lo.",
      oneDemandOneLedger: "1 demanda → 1 ledger",
      oneUnit: "uma unidade produtora: {unit} (0 arestas)",
      routed: "roteado",
      awaitingSignature: "aguardando assinatura do PE",
      serialize: "serializa",
      noEvidence: "sem evidência",
      straightFromDelivered: "direto do delivered",
      notVerified: "não verificado",
      immutable: "imutável",
    },
    glossary: {
      title: "As palavras, em linguagem simples",
      journey: "o registro durável de uma demanda, do início ao merge",
      unit: "a fatia de trabalho de um repo — aqui, a package aipe-site",
      sddLite: "a base sempre presente: um plano curto por escrito antes de qualquer código, em toda tarefa",
      envelope: "um jeito de rodar uma unidade (modo · tier · esforço) e seu custo",
      harness: "o agente de código que de fato executa um especialista — aqui, o Claude Code",
      tier: "o quão capaz o modelo precisa ser — tiers mais fortes custam mais",
      costIndex: "um número relativo para comparar execuções — nunca dinheiro",
      gated: "precisa da aprovação do Product Engineer antes de rodar",
      wave: "trabalho que roda de uma vez; a mesma package espera a próxima wave",
      worktree: "uma cópia isolada do repo, para execuções paralelas nunca colidirem",
      gate: "uma checagem que barra o “feito” até ser provado — evidência, depois QA",
      ledger: "o registro append-only onde cada passo é escrito",
    },
    // Ordem de leitura do glossário: as etapas numeradas acontecem em sequência; os
    // conceitos (decisões e coisas) se ligam a uma etapa em vez de serem uma. Ver a
    // classificação, justificada contra o fluxo operate do aipe, em SPEC.md.
    flow: {
      stepsTitle: "A ordem em que acontece",
      conceptsTitle: "Os conceitos que se ligam a ela",
      kindDecision: "decisão",
      kindThing: "coisa",
      loop: "pode voltar",
      legend: "1–5 são as etapas, em ordem · um traço marca um conceito, não uma etapa · ↺ marca uma etapa que pode repetir",
      loopNote: "um gate que reprova abre um loop de correção — o fluxo não é uma linha reta",
    },
    axes: {
      mode: "modo",
      harness: "harness",
      tier: "tier",
      effort: "esforço",
    },
    labels: {
      coordinator: "coordenador",
      unit: "unidade",
      floor: "base",
      envelope: "envelope",
      costIndex: "cost-index",
      gated: "travado",
      notMoney: "índice relativo, não dinheiro",
      wave: "wave",
      queued: "na fila",
      running: "rodando",
      worktree: "worktree",
      evidenceGate: "evidência",
      qaGate: "QA",
      blocked: "bloqueado",
      open: "aberto",
      rejected: "rejeitado",
      ledger: "ledger",
    },
  },

  problem: {
    eyebrow: "O problema",
    title: "Coordenar agentes em muitos repositórios é um trabalho. Agora, ele é seu.",
    lead: "Um único agente de código é poderoso em um repositório. No instante em que uma demanda toca vários, todo o custo de coordenação cai sobre você.",
    items: [
      {
        title: "Você é o roteador",
        body: "Um agente, um repositório, uma conversa. Toda demanda que atravessa serviços transforma você no barramento de mensagens — copiando contexto entre chats, reexplicando a mesma arquitetura, segurando o plano na cabeça.",
      },
      {
        title: "Trabalho que poderia ser paralelo roda em série",
        body: "Três repositórios precisam da mesma feature. Nada impede que rodem ao mesmo tempo — exceto que você só consegue acompanhar uma sessão por vez, então elas ficam na fila atrás da sua atenção.",
      },
      {
        title: "Sem isolamento, sem desfazer",
        body: "Agentes editam sua árvore de trabalho no lugar. Uma mudança pela metade colide com a seguinte; uma execução ruim deixa você limpando a bagunça em vez de mesclar.",
      },
      {
        title: "“Pronto” é uma autoavaliação",
        body: "O agente diz que passou. Ele rodou alguma coisa? Não há portão entre um resumo confiante e uma mesclagem — então a revisão é sua, toda vez.",
      },
      {
        title: "A ordem entre repositórios é chute",
        body: "A API tem que chegar antes do cliente que a chama. Erre a ordem e você entrega um build contra um contrato que ainda não existe.",
      },
      {
        title: "A trilha de auditoria evapora",
        body: "Qual agente fez o quê, com qual evidência, em que ordem? Isso some no topo de um terminal. Semana que vem, nada disso é recuperável.",
      },
    ],
  },

  company: {
    eyebrow: "A analogia da empresa",
    title: "A AIPe conduz seus repositórios como uma empresa conduz seus times.",
    lead: "É o modelo mental sobre o qual o produto inteiro é construído: você é o executivo com a demanda; o coordenador é seu líder de engenharia; os especialistas são contratados por repositório.",
    note1: "Tudo além da saída bruta do agente em disco é uma CLI ",
    note2:
      " determinística e testada; o julgamento do coordenador vive em texto. O organograma é real, e você pode vê-lo trabalhar.",
    roles: [
      {
        role: "Engenheiro de Produto",
        who: "Você.",
        does: "Define a missão e a prioridade, aprova o orçamento e decide qualquer coisa que cruze as fronteiras entre repositórios. No comando, aprovando entre as fases.",
      },
      {
        role: "Coordenador",
        who: "Um agente coordenador que você nomeia, rodando no seu harness — Claude Code por padrão.",
        does: "Lê o estado de cada repositório, decompõe cada demanda, despacha os especialistas, revisa o que volta e escala as decisões entre repositórios para você.",
      },
      {
        role: "Especialistas",
        who: "Um dev + um QA, contratados por repositório.",
        does: "Subagentes que vestem uma persona instalada dentro do repositório. Cada um trabalha confinado ao seu próprio worktree e abre o seu próprio PR — e nunca edita outro repositório.",
      },
    ],
  },

  how: {
    eyebrow: "Como funciona",
    title: "Duas fases, ambas completas: faça o onboarding uma vez, depois opere.",
    lead: "O onboarding ensina o seu mundo ao coordenador. A operação é o ciclo que ele roda em cada demanda a partir daí.",
    onboarding: {
      heading: "Onboarding",
      meta: "4 passos · uma vez",
      sub: "Cada passo é uma skill; o próximo só destrava quando o anterior termina. Rodar de novo preenche apenas o que falta.",
      steps: [
        { title: "Declare os repositórios", body: "Nomeie os repositórios do seu contexto — URLs e caminhos — em .aipe/brain.yaml." },
        { title: "Clone-os em disco", body: "Baixe os repositórios localmente e re-hidrate as personas e a toolbox." },
        { title: "Descubra as relações", body: "Mapeie como os repositórios dependem uns dos outros e preencha a stack de cada um." },
        { title: "Contrate os especialistas", body: "Instale uma persona de dev + uma de QA por repositório em .aipe/personas.yaml." },
      ],
    },
    operation: {
      heading: "Operação",
      meta: "/operate · toda demanda",
      sub: "O coordenador roda este ciclo para cada demanda que você traz, respeitando as dependências entre os seus repositórios.",
      steps: [
        { body: "Uma demanda abre uma jornada — o registro durável de tudo que foi despachado." },
        { body: "A demanda é dividida em tarefas por repositório." },
        { body: "As tarefas são sequenciadas por dependência primeiro, usando o grafo de relações entre repositórios." },
        { body: "Cada onda valida a lei, provisiona um worktree e envia cada especialista em paralelo." },
        { body: "Cada especialista devolve uma entrega — um PR com evidência anexada." },
        { body: "Qualquer coisa entre repositórios volta para você; é decisão do PE antes da próxima onda." },
      ],
    },
  },

  laws: {
    eyebrow: "As leis",
    title: "Seis restrições das quais o coordenador não escapa na conversa.",
    lead: "Não são diretrizes. São portões determinísticos aplicados pela CLI aipe — a razão pela qual o trabalho paralelo continua seguro e 'pronto' significa algo.",
    items: [
      {
        title: "A lei do despacho paralelo",
        body: "O mesmo pacote nunca roda duas vezes ao mesmo tempo — o trabalho na mesma unidade serializa; repositórios distintos rodam em paralelo, com teto de 16 simultâneos. Julgado mecanicamente, nunca na mão. Um lote é válido como proposto ou rejeitado; nunca é reordenado sem avisar.",
      },
      {
        title: "Isolamento por worktree",
        body: "Cada despacho trabalha no seu próprio git worktree, no seu próprio branch. Nada edita sua árvore de trabalho no lugar. O desmonte se recusa a apagar trabalho não commitado ou não enviado, a não ser que você force.",
      },
      {
        title: "O portão de evidências",
        body: "Uma entrega que se diz pronta tem que carregar os comandos que rodou e um resumo do que a saída mostrou. Uma autoavaliação vazia é REJEITADA pelo registro — verificar-antes-de-concluir não é opcional.",
      },
      {
        title: "O portão de QA",
        body: "Toda entrega de dev é reconferida por uma persona de QA independente contra o diff e os critérios de aceite — não contra o relato do dev. Uma unidade só é 'verified' quando esse cético a aprova; qualquer achado Crítico ou Importante bloqueia a mesclagem.",
      },
      {
        title: "Escalonamento entre repositórios",
        body: "Um especialista nunca edita outro repositório — ele escala a necessidade ao coordenador, que a leva até você. Um consumidor não pode despachar até o produtor do qual depende ter chegado. Escopo entre repositórios é decisão do PE.",
      },
      {
        title: "Contenção de sessão",
        body: "Um especialista despachado como sessão real nunca pode abrir ou matar uma sessão do agentop — um hook no seu próprio worktree o impede. A única saída autorizada, aipe session grant, é limitada a um único par (jornada, sessão).",
      },
    ],
  },

  statement: {
    lead: "Instalar conteúdo é fácil. ",
    emphasis: "Conter uma sessão é a promessa",
    trail: " — e é a razão inteira de a AIPe governar menos harnesses do que poderia hospedar.",
    sub: "Toda outra ferramenta de agente copia uma skill e torce. A AIPe não inicia uma sessão que não consiga impedir de sair do worktree — então o número que ela suporta é menor, e honesto.",
  },

  harnessSection: {
    eyebrow: "Multi-harness",
    title: "Dez harnesses podem hospedá-la. Dois, a AIPe consegue conter de verdade. Os dois números são honestos.",
    lead: "O agentop pode rodar uma sessão da AIPe em qualquer um de dez CLIs de agente — os mesmos dez que o PDD alcança. Mas o modo sessão precisa de contenção real, e só claude-code e gemini passam nessa régua hoje. Veja a contagem honesta abaixo, teste o despacho ao vivo, depois leia o ledger completo de três estados — cada afirmação com fonte — mais abaixo.",
  },

  harnessBay: {
    hostContain: {
      hostLabel: "agentop hospeda",
      hostNote: "CLIs de agente que o agentop consegue rodar numa sessão — os dez do print, os mesmos dez que o PDD alcança.",
      containLabel: "AIPe contém de verdade",
      containNote: "desses, os que a AIPe governa sem supervisão em modo sessão. Hospedar uma sessão e contê-la são trabalhos diferentes.",
    },
    installVsContain: {
      title: "Instalar conteúdo, ou conter a sessão?",
      body: "O PDD alcança dez harnesses porque instala CONTEÚDO — skills e prompts. Qualquer agente que lê um arquivo passa. A AIPe exige mais: ela precisa CONTER a sessão, o que pede um hook que barra um comando antes de ele rodar e é confiado sem nenhum humano presente. Instalar é fácil; conter é a promessa — e é por isso que o número de suporte pleno da AIPe é menor. Não menos capaz, mais responsável.",
      rule: "aipe/src/harness/types.ts — “A harness whose adapter returns null cannot be contained — and is therefore NOT eligible for session-mode dispatch. That is the whole eligibility rule: AIPe never starts a session it cannot govern.”",
    },
    selected: "selecionado",
    sessionEligible: "elegível para sessão",
    notContainable: "não contível",
    workspacePrefix: "workspace:",
    sessionRejected: "despacho de sessão rejeitado",
    containment: "Contenção: ",
    whyNotContained: "Por que não pode ser contido: ",
    workspaceHarnessAt: "Harness de workspace no",
    geminiNoteBefore: " — ainda elegível para sessão como harness de despacho de ",
    geminiNoteEmphasis: "unidade",
    geminiNoteAfter: ", que é o que habilita o QA entre modelos.",
  },

  harnessCompat: {
    eyebrow: "Ledger de contenção",
    title: "Dez harnesses que o agentop pode hospedar. Três estados, nunca dois.",
    lead: '"Sem adapter ainda" e "não pode ser contido" costumavam colapsar num único rótulo "em breve" — foi exatamente isso que escondeu o achado do Antigravity abaixo. Cada afirmação aqui remete à documentação da própria ferramenta, não a um resumo dela.',
    adapterShipped: "Adapter da AIPe: lançado",
    adapterNone: "Adapter da AIPe: ainda não",
    sourceLabel: "Fonte primária",
    readSource: "Ler a fonte",
    accessedLabel: "Acessado em",
    caveatLabel: "Ressalva",
    groups: {
      shipped: {
        label: "Lançado — provado capaz",
        body: "A AIPe tem um adapter, e a documentação da própria ferramenta prova que um hook de bloqueio headless se sustenta.",
      },
      "proven-limit": {
        label: "Provado incapaz — um limite real",
        body: "A documentação da própria ferramenta mostra que a contenção exige um humano presente. Isso não é backlog: construir um adapter não mudaria o veredito.",
      },
      backlog: {
        label: "Não implementado — a doc já prova que dá",
        body: "Ainda não existe adapter da AIPe, mas a documentação da própria ferramenta já descreve um mecanismo de bloqueio headless. Trabalho não feito, não um limite provado.",
      },
      "open-question": {
        label: "Não estabelecido — a doc não responde",
        body: "Nem provado capaz, nem provado incapaz. A fonte primária não responde à pergunta que importa.",
      },
    },
  },

  cost: {
    eyebrow: "Controle de custo",
    title: "Precifique cada jeito de rodar uma unidade — antes de gastar um token.",
    lead: "Quatro eixos decidem quanto um despacho custa e se ele precisa da sua assinatura. A AIPe enumera e precifica cada envelope viável; ela nunca escolhe por você.",
  },

  envelope: {
    harnessHint: "eixo de viabilidade — não um multiplicador",
    costIndex: "cost-index",
    coarseNote:
      "Um índice relativo aproximado, nunca moeda. A AIPe não tem como saber seu preço por token, seu plano ou seus limites de uso — ela ordena os jeitos de rodar uma unidade, não os cobra.",
    viable: "envelope VIÁVEL",
    nonViable: "NÃO VIÁVEL — excluído",
    rejectPrefix: "reject:",
    sessionRequiresContainable:
      "O modo sessão exige um harness contível; este não pode ser contido sem supervisão.",
    gated: "TRAVADO — precisa da assinatura do PE",
    // O token de domínio (ultracode, frontier, …) é literal e fica em inglês; a
    // frase ao redor traduz. Ver `gateReasonLabel`.
    gateIntensityNeedsSignature: (intensity: string) => `intensidade ${intensity} precisa da sua assinatura`,
    gateTierNeedsSignature: (tier: string) => `tier ${tier} precisa da sua assinatura`,
    ungated: "LIVRE",
    autoDispatchable: "— despacha automaticamente",
    perEnvelope: "por-envelope",
    gatedIntensities: "intensidades travadas",
    gatedTiers: "tiers travados",
    perWave: "por-onda (aplicado só quando as unidades são agrupadas numa onda)",
    referenceEnvelopes: "envelopes de referência",
    thEnvelope: "envelope",
    thIndex: "índice",
    thStatus: "status",
    nonViablePrefix: "não viável ·",
    gatedLabel: "travado",
    ungatedLabel: "livre",
    noteNotContainable: "não contível em sessão",
    noteSessionEligible: "elegível para sessão",
    noteSubagentOnly: "só subagente",
  },

  getStarted: {
    eyebrow: "Começar",
    title: "Instale, inicie e diga oi.",
    lead: "Três passos até um coordenador funcionando. Sem passo de marketplace, nada instalado globalmente — a integração vive na pasta de workspace que você cria.",
    copy: "copiar",
    copied: "copiado",
    // A única linha autoral do transcript (o resto é saída real do `aipe start`,
    // que fica em inglês): um comentário `#` é narração, então traduz.
    replayComment: "# abra a pasta no seu harness e é só dizer oi",
    steps: [
      { body: "Instale o binário standalone do aipe — sem precisar de Bun, Node ou npm." },
      { body: "Escolha seu harness e nomeie o workspace. Ele cria uma pasta aipe-<nome>/ publicável." },
      { body: "Abra a pasta no seu harness e cumprimente o coordenador. Ele conduz o onboarding a partir daí." },
    ],
    readDocs: "Ler a documentação",
    viewGithub: "Ver no GitHub",
  },

  footer: {
    tagline: "O Engenheiro de Produto com IA — uma CLI standalone que coordena especialistas pelos seus repositórios, no harness de agente que você escolher.",
    product: "Produto",
    learn: "Aprender",
    howItWorks: "Como funciona",
    theLaws: "As leis",
    costControl: "Controle de custo",
    docs: "Docs",
    getStarted: "Começar",
    github: "GitHub",
    umbrella: "openvibes.tech — o guarda-chuva open source",
    latestRelease: "último release ↗",
  },

  docs: {
    documentation: "Documentação",
    closeMenu: "Fechar menu",
    close: "fechar",
    codeBlock: {
      copy: "copiar",
      copied: "copiado",
    },
    groups: {
      "get-started": "Primeiros passos",
      phases: "As duas fases",
      operation: "Operação",
      laws: "Leis e convenções",
      capabilities: "Capacidades",
      reference: "Referência",
    },
  },
};

export default pt;

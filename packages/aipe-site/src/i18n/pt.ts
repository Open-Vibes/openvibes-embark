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
    eyebrow: "Engenheiro de Produto com IA · um plugin do Claude Code",
    headlineLine1: "Você traz a demanda.",
    headlineLine2: "Ela comanda a área de engenharia.",
    bodyBefore:
      "A AIPe transforma o Claude num coordenador de engenharia e você no Engenheiro de Produto. Entregue uma demanda; ela decompõe o trabalho, despacha um especialista por repositório ",
    bodyEmphasis: "em paralelo",
    bodyAfter:
      " — cada um isolado no seu próprio git worktree — e devolve PRs, sob uma única lei de despacho e um portão de evidências.",
    copy: "copiar",
    copied: "copiado",
    seeHow: "Veja como funciona →",
    readDocs: "Ler a documentação",
    sceneCaption: "uma demanda — o terminal, e o que cada linha significa",
  },

  console: {
    title: "O Console",
    journeyPrefix: "· jornada",
    terminalHeader: "terminal — o que realmente roda",
    meaningHeader: "o que essa linha significa — ligado à esquerda",
    replay: "repetir",
    aria: {
      group:
        "O Console — um passo a passo em dois painéis, no seu ritmo: o terminal à esquerda, o significado de cada linha à direita",
      scrub: "Navegar pelos passos",
      prev: "Passo anterior",
      next: "Próximo passo",
      play: "Reproduzir",
      pause: "Pausar",
      replay: "Repetir",
      restart: "Recomeçar",
      speed: (s: number) => `Velocidade ${s}×, toque para mudar`,
      step: (n: number, title: string) => `Passo ${n}: ${title}`,
    },
    srStep: (n: number, total: number) => `Passo ${n} de ${total}`,
    detail: {
      match: "combina",
      skip: "ignora",
      floor: "base",
      costNote: "índice relativo aproximado, nunca dinheiro",
      gated: "TRAVADO",
      wave: "onda",
      then: "depois",
      sameSerialize: "— o mesmo pacote serializa; repositórios distintos rodariam em paralelo",
    },
    steps: {
      demand: {
        title: "A entrada inteira é uma frase",
        plain:
          "Um Engenheiro de Produto entrega uma demanda em palavras comuns. Essa é a entrada inteira. Tudo deste lado é o coordenador transformando-a em trabalho despachado e registrado — ninguém escreve tickets nem conecta agentes na mão.",
      },
      journey: {
        title: "Uma demanda → uma jornada",
        plain:
          "A demanda abre uma jornada: um registro durável que vai gravar cada passo daqui até um PR mesclado. Nada foi despachado ainda — isto é só o registro sendo aberto.",
      },
      decompose: {
        title: "Uma unidade de trabalho, e seu piso de confiabilidade",
        plain:
          "O coordenador lê como os repositórios se relacionam. O aipe-site é um nó novinho — nada depende dele e ele não depende de nada — então há exatamente uma unidade de trabalho. O piso de qualquer unidade são duas pessoas: um dev para construir e um QA independente para conferir.",
      },
      "skill-match": {
        title: "Qual método serve — e qual é exagero",
        plain:
          "Antes de construir, o coordenador pergunta qual framework serve ao trabalho. O sdd-lite — uma spec curta mais um plano — é o piso, sempre presente. Os kits pesados guiados por spec são recusados aqui: um site com foco em interface não é para o que eles servem. A mesma regra mantém um kit pesado longe de uma mudança de uma linha; a escolha é mecânica, não por intuição.",
      },
      envelope: {
        title: "Quanta potência — e precisa de aprovação",
        plain:
          "Cada unidade ganha um envelope de execução em quatro eixos: modo de execução, tier do modelo, esforço e qual harness. O produto deles é um índice de custo relativo aproximado (nunca dinheiro). Este dá 64 e usa um eixo travado (esforço ultracode), então não pode despachar até o PE assinar embaixo.",
      },
      law: {
        title: "A única lei que o coordenador não dobra",
        plain:
          "Lawson e Viola estão os dois no aipe-site. A lei de despacho proíbe o mesmo pacote rodar duas vezes ao mesmo tempo, então propor os dois juntos é rejeitado como está — e serializado: Lawson na onda 1, o QA da Viola na onda 2, sobre o branch dele. Dois repositórios DIFERENTES teriam rodado lado a lado, até 16 de uma vez.",
      },
      worktree: {
        title: "Uma cópia isolada para trabalhar",
        plain:
          "O especialista da onda 1 ganha seu próprio git worktree — uma cópia de trabalho separada do repositório. Especialistas em paralelo nunca pisam nos arquivos uns dos outros, e as mudanças de cada um chegam como um pull request próprio.",
      },
      dispatch: {
        title: "A onda 1 sai; a onda 2 espera",
        plain:
          "O dev é despachado como uma sessão desacoplada, com a sua própria janela de contexto inteira. O QA fica na fila atrás dele — mesmo pacote, próxima onda — então os dois nunca rodam ao mesmo tempo. O registro agora diz: dispatched.",
      },
      deliver: {
        title: "Entregue — com prova",
        plain:
          "Lawson abre o PR e registra como delivered, anexando o comando exato que rodou e o que ele mostrou. Uma entrega TEM que carregar essa evidência; o registro é o comando e seu resultado, não uma alegação.",
      },
      "evidence-gate": {
        title: "Uma alegação vazia é rejeitada na hora",
        plain:
          "Se ele tivesse registrado 'delivered' sem comando e sem resultado, o registro rejeita a escrita — evidence-required. 'Deve funcionar' não é evidência. É exatamente por isso que a entrega acima carregou um comando e sua saída.",
      },
      "qa-gate": {
        title: "Não dá para mesclar na palavra do dev",
        plain:
          "Uma mesclagem direto de delivered é barrada: a unidade não está verificada. A onda 2 roda — Viola, um QA independente no seu próprio worktree, confere contra o diff, não contra o relato do Lawson — e registra verified com a evidência dela. Só agora a unidade é liberada.",
      },
      merged: {
        title: "Mesclada, e agora imutável",
        plain:
          "Com um QA verificado em mãos, o PR é mesclado. A unidade fica imutável — nunca é redespachada — e o worktree dela é desmontado.",
      },
      verify: {
        title: "O registro se confere sozinho",
        plain:
          "Um lint determinístico final relê o registro inteiro e confirma que está consistente: toda entrega carregou evidência, toda mesclagem foi verificada antes, nenhum worktree solto. Uma demanda, despachada e registrada, de ponta a ponta.",
      },
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
        who: "O Claude principal, com um nome que você dá a ele.",
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

  harnessSection: {
    eyebrow: "Multi-harness",
    title: "Quatro harnesses. Dois podem ser contidos. Essa é a linha honesta.",
    lead: "A AIPe pode despachar um especialista para diferentes CLIs de agente — e cruzar o trabalho de um modelo com o de outro. Mas o modo sessão precisa de contenção real, e só claude-code e gemini têm isso hoje. Escolha uma faixa e veja o que muda.",
  },

  harnessBay: {
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
    pending: "pendente",
    pendingSr: "Nota de roadmap pendente: ",
    pendingBefore: "A contenção de sessão para ",
    pendingMiddle: " e ",
    pendingNotShipped: " ",
    pendingNotShippedEmphasis: "não foi lançada",
    pendingAfter:
      " — está travada num bypass de confiança não interativo e documentado para cada um. Até lá, a validação de despacho não assistida os rejeita de propósito.",
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
    steps: [
      { body: "Instale o binário standalone do aipe — sem precisar de Bun, Node ou npm." },
      { body: "Escolha seu harness e nomeie o workspace. Ele cria uma pasta aipe-<nome>/ publicável." },
      { body: "Abra a pasta no seu harness e cumprimente o coordenador. Ele conduz o onboarding a partir daí." },
    ],
    readDocs: "Ler a documentação",
    viewGithub: "Ver no GitHub",
  },

  footer: {
    tagline: "O Engenheiro de Produto com IA — um plugin do Claude Code que coordena especialistas pelos seus repositórios.",
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

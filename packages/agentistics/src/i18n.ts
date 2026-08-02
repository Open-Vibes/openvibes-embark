type Lang = "en" | "pt";

const T: Record<Lang, Record<string, string>> = {
  en: {
    // Nav
    "nav.dashboard": "Dashboard",
    "nav.cli": "CLI",
    "nav.release": "Team Mode",
    "nav.features": "Features",
    "nav.install": "Install",
    "nav.docs": "Docs",
    "nav.github": "GitHub ↗",

    // Hero
    "hero.badge": "local-first · zero cloud · open source",
    "hero.title.1": "Every token",
    "hero.title.2": "counts.",
    "hero.sub.1": "Local analytics dashboard for AI coding assistants.",
    "hero.sub.2": "Tokens, costs, agent metrics and activity heatmap —",
    "hero.sub.3": "parsed straight from",
    "hero.cta.primary": "Get started",
    "hero.cta.secondary": "See it in action →",
    "hero.stat.tokens": "tokens today",
    "hero.stat.cost": "total cost",
    "hero.stat.sessions": "sessions",
    "hero.stat.streak": "streak",

    // Preview section
    "preview.tag": "Dashboard",
    "preview.title.1": "Every metric.",
    "preview.title.2": "One interface.",
    "preview.sub": "Real recordings of a running instance — driven against a synthetic demo fleet, so the numbers are real and the names are not.",
    "preview.tab.machine": "Machine",
    "preview.tab.central": "Central",
    "preview.tab.repos": "Repositories",
    "preview.tab.tags": "Tags",
    "preview.tab.compare": "Compare",
    "preview.tab.custom": "Custom layouts",
    "preview.tab.mobile": "Mobile",
    "preview.pdf.title": "PDF Export",
    "preview.pdf.sub": "One-click report — dark & light themes, shareable anywhere",
    "preview.cta.label": "Ready to see your own data?",
    "preview.cta.github": "Get started on GitHub",

    // Terminals section
    "terminals.tag": "CLI",
    "terminals.title.1": "One CLI.",
    "terminals.title.2": "Every real mode.",
    "terminals.sub": "Bare agentop opens the control center — one full-screen application that adds nothing to your scrollback. Every mode underneath it is still a real, independent command. All recorded live, nothing scripted.",
    "terminals.pick": "Pick a command",
    "terminals.commands": "Commands",
    "terminals.d.start": "the control center",
    "terminals.d.setup": "solo / central / member",
    "terminals.d.tui": "live dashboard, no browser",
    "terminals.d.status": "services + health",
    "terminals.d.member": "the centrals it pushes to",
    "terminals.d.central": "host the aggregator",
    "terminals.d.watch": "the OTel daemon only",

    // Release — Team Mode + unified CLI
    "release.tag": "New in v1.7",
    "release.title.1": "One machine.",
    "release.title.2": "Or a whole team.",
    "release.sub": "agentistics is the single-machine app. agentistics central aggregates metrics from every machine on your team into one live view — without ever storing your chats.",

    "release.tab.central": "agentistics central",
    "release.tab.iam": "Accounts & access",
    "release.tab.sharing": "What you share",
    "release.tab.repos": "Repositories & CI",
    "release.tab.harness": "Six harnesses",

    "release.central.title": "agentistics central — the team aggregator",
    "release.central.desc": "Machines push computed metrics only. Chat is never stored centrally: opening a transcript pulls it on demand, over a reverse WebSocket, from the machine that holds it.",
    "release.central.point1.title": "Accounts, not a shared password",
    "release.central.point1.desc": "First boot prints a one-time setup token and asks you to create the owner. Everyone else is invited, with their own login and role.",
    "release.central.point2.title": "Live presence + latency",
    "release.central.point2.desc": "Presence is WebSocket-authoritative — a machine goes offline within seconds of disconnecting, and the latency shown is real ping/pong round-trip.",
    "release.central.point3.title": "Auto-reconciliation",
    "release.central.point3.desc": "Wipe the database, rotate a token or move the endpoint: members notice and re-push their full history. A revoked machine resets itself to solo.",
    "release.central.point4.title": "A machine can serve several centrals",
    "release.central.point4.desc": "Different clients, different employers, different rules for each — one machine, one install.",

    "release.iam.title": "Accounts, teams and a second factor",
    "release.iam.desc": "A central is not a password everyone shares. Accounts carry argon2id passwords, optional TOTP, and a role that decides what they can reach.",
    "release.iam.point1.title": "A one-time owner setup token",
    "release.iam.point1.desc": "Printed on first boot and consumed once. Reissue it with agentop setup-token — refused as soon as an owner exists.",
    "release.iam.point2.title": "Step-up where it counts",
    "release.iam.point2.desc": "Editing an account, deleting a team and changing a password ask for a second proof. Enrolling a machine or a repo does not — a prompt people meet daily is one they clear without reading.",
    "release.iam.point3.title": "Teams are scope keys, not labels",
    "release.iam.point3.desc": "Being in a team is seeing it. There is deliberately no team everybody joins, because that team would show everyone everything.",
    "release.iam.point4.title": "Locked out? There is a way back",
    "release.iam.point4.desc": "agentop reset-password works from the host, which is the only place a last owner can prove they own the deployment.",

    "release.sharing.title": "You decide what leaves each machine",
    "release.sharing.desc": "Every connection carries its own rules across two dimensions — repositories and projects — as a denylist (share everything except these) or an allowlist (share only these).",
    "release.sharing.point1.title": "The rules never travel",
    "release.sharing.point1.desc": "A central is told a per-dimension count and nothing more. It never learns the name of a repository you withheld from it.",
    "release.sharing.point2.title": "Your machines warn each other",
    "release.sharing.point2.desc": "Before you start sharing a repository, the picker names the sibling machines that hide it — read over a sealed, key-pinned channel between your own machines, never from the central.",
    "release.sharing.point3.title": "It warns, it never blocks",
    "release.sharing.point3.desc": "And it says so: a machine knows only what its siblings announced, so an absent warning is never proof that nobody restricts it.",
    "release.sharing.point4.title": "Applying a proposal can only narrow",
    "release.sharing.point4.desc": "A sibling can offer its rules; accepting them intersects, never replaces. The button that hides things can never start sharing hidden ones.",

    "release.repos.title": "Repositories, CI runs and tags",
    "release.repos.desc": "Metrics group by normalized git remote, so one repository unifies across people, checkout paths and machines.",
    "release.repos.point1.title": "Grouped by git remote",
    "release.repos.point1.desc": "host/org/repo, independent of where it is checked out. Sessions with no remote are set aside rather than split across machines.",
    "release.repos.point2.title": "GitHub Actions, keyless",
    "release.repos.point2.desc": "A runner pushes with agentop ci-push, authenticated by GitHub OIDC against a registered-repos allowlist. The central stamps the repository itself, so a runner cannot mis-report which repo it ran for.",
    "release.repos.point3.title": "Dynamic Workflows",
    "release.repos.point3.desc": "Multi-agent orchestration runs render as a phase-by-phase timeline — what fanned out, what it cost.",
    "release.repos.point4.title": "Tags",
    "release.repos.point4.desc": "Save a grouping of repos, projects, machines or accounts, optionally pinned to a date range, and get its totals in one click. Aggregate-only: counts and sums, never session rows.",

    "release.harness.title": "One dashboard, six coding agents",
    "release.harness.desc": "Claude Code, Codex CLI, Gemini CLI, Copilot CLI, Antigravity and Kimi Code all report into one dashboard. /compare puts them side by side.",
    "release.harness.point1.title": "Per-harness pages",
    "release.harness.point1.desc": "/h/:harness gives every agent its own Overview and an honest \"Data & sources\" tab saying what it can and cannot see.",
    "release.harness.point2.title": "Honest N/A, not fake zeros",
    "release.harness.point2.desc": "A metric a harness genuinely cannot produce shows as N/A. A confident zero is worse than an admission.",

    // Features
    "features.tag": "Features",
    "features.title.1": "Everything you need to",
    "features.title.2": "understand your AI usage",
    "feat.1.title": "Token tracking — per model, per session, per type",
    "feat.1.desc": "Input, output, cache read and cache write tokens broken down separately for every session and every model. Understand exactly where your token budget goes and which cache strategies save you the most.",
    "feat.2.title": "Cost analysis in USD & BRL",
    "feat.2.desc": "Real costs in USD and BRL with live exchange rates. Blended cost-per-token across your entire model mix. Per-model breakdown with exact Anthropic pricing so you know which model is costing what.",
    "feat.3.title": "Agent metrics — deep per-invocation data",
    "feat.3.desc": "Every Agent tool call is tracked individually: duration, token usage, cost, and detailed tool stats including file reads, edits, bash executions, and searches. Compare success rates per agent type across your sessions.",
    "feat.4.title": "Activity heatmap & streak tracking",
    "feat.4.desc": "GitHub-style contribution heatmap of your AI coding activity across 52 weeks. Streak counter that tracks consecutive active days — without penalizing you for not having worked yet today. Intensity reflects token volume per day.",
    "feat.5.title": "Model breakdown by project",
    "feat.5.desc": "Token and cost distribution across every Claude model in your usage history. Filter by project to identify which workstreams lean most heavily on expensive models. Donut chart and per-model table with share percentages.",
    "feat.6.title": "100% local — zero cloud, zero telemetry",
    "feat.6.desc": "Reads directly from ~/.claude/ on your filesystem. No cloud sync, no account creation, no analytics, no telemetry. A single binary that parses JSONL files locally and serves everything from your machine.",
    "feat.7.title": "OpenTelemetry export",
    "feat.7.desc": "Export your AI usage metrics to any OTel-compatible backend. Token counters, cost gauge, session count, streak days, git line stats, and per-tool-type call counts. Works with Prometheus, Grafana, Datadog, and any OTLP endpoint.",
    "feat.8.title": "PDF export — dark & light themes",
    "feat.8.desc": "One-click export of your full analytics report as a PDF. Includes token usage, cost breakdown, session history, model distribution, and agent metrics. Choose between dark and light themes — perfect for sharing with your team.",

    // How
    "how.tag": "Install",
    "how.title.1": "Up and running",
    "how.title.2": "in 30 seconds",
    "how.sub": "Single binary, no config, no dependencies. Drop it anywhere in your $PATH and start exploring your AI usage immediately.",
    "how.step1.title": "Download the binary",
    "how.step1.desc": "One-line install for Linux/macOS. Or clone and build from source with Bun.",
    "how.step2.title": "Run agentop server",
    "how.step2.desc": "Starts the api + MCP on port 47291 and the web dashboard on port 47292. Your ~/.claude/ is read directly — no config needed.",
    "how.step3.title": "Watch metrics live",
    "how.step3.desc": "Use agentop tui for a fullscreen terminal dashboard or agentop watch to stream OTel metrics to your observability stack.",

    // Arch
    "arch.tag": "Architecture",
    "arch.title.1": "Data flow from",
    "arch.title.2": "file to insight",
    "arch.sub": "Every session is a JSONL file. Agentistics parses them locally, aggregates stats-cache, extracts agent metrics, and streams live updates via SSE — all without ever touching a remote server.",

    // CTA
    "cta.title": "Start tracking your AI usage today",
    "cta.sub": "Open source · Local first · Built with Bun + React + TypeScript",
    "cta.primary": "View on GitHub",
    "cta.secondary": "Read the docs",

    // Footer
    "footer.tagline.1": "Local analytics for AI coding assistants.",
    "footer.tagline.2": "Built for the vibe coding era.",
    "footer.col.project": "Project",
    "footer.col.resources": "Resources",
    "footer.link.releases": "Releases",
    "footer.link.issues": "Issues",
    "footer.link.changelog": "Changelog",
    "footer.link.install": "Install guide",
    "footer.link.cli": "CLI reference",
    "footer.link.release": "Team Mode",
    "footer.link.features": "Features",
    "footer.link.arch": "Architecture",
    "footer.made": "Made with vibes by",
    "footer.rights": "© 2025 agentistics. MIT License.",
  },
  pt: {
    // Nav
    "nav.dashboard": "Dashboard",
    "nav.cli": "CLI",
    "nav.release": "Modo Time",
    "nav.features": "Recursos",
    "nav.install": "Instalar",
    "nav.docs": "Docs",
    "nav.github": "GitHub ↗",

    // Hero
    "hero.badge": "local-first · zero cloud · código aberto",
    "hero.title.1": "Cada token",
    "hero.title.2": "importa.",
    "hero.sub.1": "Dashboard local de analytics para assistentes de IA.",
    "hero.sub.2": "Tokens, custos, métricas de agentes e heatmap de atividade —",
    "hero.sub.3": "direto do",
    "hero.cta.primary": "Começar",
    "hero.cta.secondary": "Ver em ação →",
    "hero.stat.tokens": "tokens hoje",
    "hero.stat.cost": "custo total",
    "hero.stat.sessions": "sessões",
    "hero.stat.streak": "sequência",

    // Preview section
    "preview.tag": "Dashboard",
    "preview.title.1": "Cada métrica.",
    "preview.title.2": "Uma interface.",
    "preview.sub": "Gravações reais de uma instância rodando — feitas contra uma frota de demonstração sintética, então os números são reais e os nomes não.",
    "preview.tab.machine": "Máquina",
    "preview.tab.central": "Central",
    "preview.tab.repos": "Repositórios",
    "preview.tab.tags": "Tags",
    "preview.tab.compare": "Comparar",
    "preview.tab.custom": "Layouts customizados",
    "preview.tab.mobile": "Mobile",
    "preview.pdf.title": "Exportar PDF",
    "preview.pdf.sub": "Relatório em um clique — temas dark & light, fácil de compartilhar",
    "preview.cta.label": "Pronto para ver seus próprios dados?",
    "preview.cta.github": "Começar no GitHub",

    // Terminals section
    "terminals.tag": "CLI",
    "terminals.title.1": "Um CLI.",
    "terminals.title.2": "Todo modo real.",
    "terminals.sub": "O agentop puro abre o control center — uma aplicação em tela cheia que não deixa nada no seu scrollback. Cada modo por trás dele continua sendo um comando real e independente. Tudo gravado ao vivo, nada roteirizado.",
    "terminals.pick": "Escolha um comando",
    "terminals.commands": "Comandos",
    "terminals.d.start": "o control center",
    "terminals.d.setup": "solo / central / membro",
    "terminals.d.tui": "dashboard ao vivo, sem navegador",
    "terminals.d.status": "serviços + saúde",
    "terminals.d.member": "os centrais para onde envia",
    "terminals.d.central": "hospedar o agregador",
    "terminals.d.watch": "só o daemon OTel",

    // Release — Team Mode + CLI unificada
    "release.tag": "Novo na v1.7",
    "release.title.1": "Uma máquina.",
    "release.title.2": "Ou o time inteiro.",
    "release.sub": "agentistics é o app de uma máquina. agentistics central agrega as métricas de todas as máquinas do time numa visão ao vivo — sem nunca guardar seus chats.",

    "release.tab.central": "agentistics central",
    "release.tab.iam": "Contas e acesso",
    "release.tab.sharing": "O que você compartilha",
    "release.tab.repos": "Repositórios e CI",
    "release.tab.harness": "Seis harnesses",

    "release.central.title": "agentistics central — o agregador do time",
    "release.central.desc": "As máquinas enviam apenas métricas calculadas. Chat nunca é guardado no central: abrir um transcript busca ao vivo, por WebSocket reverso, na máquina que o tem.",
    "release.central.point1.title": "Contas, não uma senha compartilhada",
    "release.central.point1.desc": "O primeiro boot imprime um token de setup de uso único e pede que você crie o owner. O resto é convidado, com login e papel próprios.",
    "release.central.point2.title": "Presença e latência ao vivo",
    "release.central.point2.desc": "A presença é autoritativa por WebSocket — a máquina fica offline segundos após desconectar, e a latência mostrada é ping/pong real.",
    "release.central.point3.title": "Reconciliação automática",
    "release.central.point3.desc": "Apagou o banco, rotacionou um token ou mudou o endpoint: os membros percebem e reenviam todo o histórico. Uma máquina revogada volta sozinha para solo.",
    "release.central.point4.title": "Uma máquina pode servir vários centrais",
    "release.central.point4.desc": "Clientes diferentes, empregadores diferentes, regras diferentes para cada um — uma máquina, uma instalação.",

    "release.iam.title": "Contas, times e segundo fator",
    "release.iam.desc": "Um central não é uma senha que todo mundo divide. As contas têm senha com argon2id, TOTP opcional e um papel que decide o que alcançam.",
    "release.iam.point1.title": "Um token de owner de uso único",
    "release.iam.point1.desc": "Impresso no primeiro boot e consumido uma vez. Reemita com agentop setup-token — recusado assim que existe um owner.",
    "release.iam.point2.title": "Step-up onde importa",
    "release.iam.point2.desc": "Editar uma conta, apagar um time e trocar senha pedem uma segunda prova. Cadastrar uma máquina ou um repo, não — um prompt que aparece todo dia é um prompt que se clica sem ler.",
    "release.iam.point3.title": "Time é chave de escopo, não rótulo",
    "release.iam.point3.desc": "Estar no time É ver o time. De propósito não existe um time do qual todos participam, porque esse time mostraria tudo para todos.",
    "release.iam.point4.title": "Travou pra fora? Existe volta",
    "release.iam.point4.desc": "agentop reset-password funciona a partir do host, o único lugar onde o último owner consegue provar que o deployment é dele.",

    "release.sharing.title": "Você decide o que sai de cada máquina",
    "release.sharing.desc": "Cada conexão tem regras próprias em duas dimensões — repositórios e projetos — como denylist (compartilha tudo menos isso) ou allowlist (compartilha só isso).",
    "release.sharing.point1.title": "As regras nunca viajam",
    "release.sharing.point1.desc": "O central recebe uma contagem por dimensão e nada mais. Ele nunca fica sabendo o nome do repositório que você escondeu dele.",
    "release.sharing.point2.title": "Suas máquinas se avisam",
    "release.sharing.point2.desc": "Antes de você começar a compartilhar um repositório, o seletor nomeia as máquinas irmãs que o escondem — lido por um canal selado e com chave fixada entre as suas máquinas, nunca pelo central.",
    "release.sharing.point3.title": "Avisa, nunca bloqueia",
    "release.sharing.point3.desc": "E diz isso: uma máquina só sabe o que as irmãs anunciaram, então a ausência de aviso nunca é prova de que ninguém restringe aquilo.",
    "release.sharing.point4.title": "Aplicar uma proposta só pode restringir",
    "release.sharing.point4.desc": "Uma irmã pode oferecer as regras dela; aceitar faz interseção, nunca substituição. O botão que esconde coisas jamais passa a compartilhar o que estava escondido.",

    "release.repos.title": "Repositórios, execuções de CI e tags",
    "release.repos.desc": "As métricas agrupam pelo remote git normalizado, então um repositório se unifica entre pessoas, caminhos de checkout e máquinas.",
    "release.repos.point1.title": "Agrupado por remote git",
    "release.repos.point1.desc": "host/org/repo, independente de onde está clonado. Sessões sem remote ficam à parte em vez de rachar o repo entre máquinas.",
    "release.repos.point2.title": "GitHub Actions, sem chave",
    "release.repos.point2.desc": "O runner envia com agentop ci-push, autenticado por OIDC do GitHub contra uma allowlist de repos registrados. O central carimba o repositório, então o runner não consegue mentir sobre qual repo rodou.",
    "release.repos.point3.title": "Dynamic Workflows",
    "release.repos.point3.desc": "As execuções de orquestração multi-agente viram uma timeline fase a fase — o que abriu em paralelo e quanto custou.",
    "release.repos.point4.title": "Tags",
    "release.repos.point4.desc": "Salve um agrupamento de repos, projetos, máquinas ou contas, opcionalmente preso a um período, e tenha os totais em um clique. Só agregado: contagens e somas, nunca linhas de sessão.",

    "release.harness.title": "Um dashboard, seis agentes de código",
    "release.harness.desc": "Claude Code, Codex CLI, Gemini CLI, Copilot CLI, Antigravity e Kimi Code reportam todos pro mesmo dashboard. /compare coloca eles lado a lado.",
    "release.harness.point1.title": "Páginas por harness",
    "release.harness.point1.desc": "/h/:harness dá a cada agente sua própria Overview e uma aba \"Data & sources\" honesta, dizendo o que ele consegue e o que não consegue ver.",
    "release.harness.point2.title": "N/A honesto, não zero fake",
    "release.harness.point2.desc": "Uma métrica que o harness realmente não produz aparece como N/A. Um zero confiante é pior que uma admissão.",

    // Features
    "features.tag": "Recursos",
    "features.title.1": "Tudo que você precisa para",
    "features.title.2": "entender seu uso de IA",
    "feat.1.title": "Rastreamento de tokens — por modelo, sessão e tipo",
    "feat.1.desc": "Tokens de entrada, saída, cache read e cache write discriminados por sessão e por modelo. Entenda exatamente onde vai seu orçamento de tokens e quais estratégias de cache te poupam mais.",
    "feat.2.title": "Análise de custos em USD e BRL",
    "feat.2.desc": "Custos reais em USD e BRL com taxas de câmbio ao vivo. Custo-por-token ponderado por todo o mix de modelos. Breakdown por modelo com precificação exata da Anthropic.",
    "feat.3.title": "Métricas de agentes — dados detalhados por invocação",
    "feat.3.desc": "Cada chamada Agent é rastreada individualmente: duração, uso de tokens, custo e estatísticas de ferramentas incluindo leituras, edições, execuções bash e buscas. Compare taxas de sucesso por tipo de agente.",
    "feat.4.title": "Heatmap de atividade e sequência",
    "feat.4.desc": "Heatmap de contribuição no estilo GitHub da sua atividade com IA ao longo de 52 semanas. Contador de sequência que rastreia dias ativos consecutivos — sem penalizar por ainda não ter trabalhado hoje.",
    "feat.5.title": "Breakdown de modelos por projeto",
    "feat.5.desc": "Distribuição de tokens e custos por todos os modelos Claude no seu histórico. Filtre por projeto para identificar quais fluxos de trabalho usam mais os modelos mais caros. Gráfico donut e tabela por modelo.",
    "feat.6.title": "100% local — sem nuvem, sem telemetria",
    "feat.6.desc": "Lê diretamente do ~/.claude/ no seu sistema de arquivos. Sem sync na nuvem, sem criação de conta, sem analytics, sem telemetria. Um binário único que parseia arquivos JSONL localmente.",
    "feat.7.title": "Exportação OpenTelemetry",
    "feat.7.desc": "Exporte métricas de uso de IA para qualquer backend compatível com OTel. Contadores de tokens, gauge de custo, contagem de sessões, dias de sequência e stats do git. Funciona com Prometheus, Grafana, Datadog e qualquer endpoint OTLP.",
    "feat.8.title": "Exportação PDF — temas dark e light",
    "feat.8.desc": "Exportação com um clique do relatório completo como PDF. Inclui uso de tokens, breakdown de custos, histórico de sessões, distribuição de modelos e métricas de agentes. Escolha entre temas dark e light para compartilhar com o time.",

    // How
    "how.tag": "Instalar",
    "how.title.1": "Pronto em",
    "how.title.2": "30 segundos",
    "how.sub": "Binário único, sem configuração, sem dependências. Coloque em qualquer lugar do seu $PATH e explore seu uso de IA imediatamente.",
    "how.step1.title": "Baixe o binário",
    "how.step1.desc": "Instalação em uma linha para Linux/macOS. Ou clone e compile com Bun.",
    "how.step2.title": "Execute agentop server",
    "how.step2.desc": "Inicia a api + MCP na porta 47291 e o dashboard web na porta 47292. Seu ~/.claude/ é lido diretamente — sem configuração.",
    "how.step3.title": "Veja as métricas ao vivo",
    "how.step3.desc": "Use agentop tui para um dashboard em terminal ou agentop watch para exportar métricas OTel.",

    // Arch
    "arch.tag": "Arquitetura",
    "arch.title.1": "Fluxo de dados do",
    "arch.title.2": "arquivo ao insight",
    "arch.sub": "Cada sessão é um arquivo JSONL. O Agentistics analisa localmente, agrega o stats-cache, extrai métricas de agentes e transmite atualizações via SSE — tudo sem tocar em servidores remotos.",

    // CTA
    "cta.title": "Comece a rastrear seu uso de IA hoje",
    "cta.sub": "Código aberto · Local first · Feito com Bun + React + TypeScript",
    "cta.primary": "Ver no GitHub",
    "cta.secondary": "Ler a documentação",

    // Footer
    "footer.tagline.1": "Analytics local para assistentes de IA.",
    "footer.tagline.2": "Feito para a era do vibe coding.",
    "footer.col.project": "Projeto",
    "footer.col.resources": "Recursos",
    "footer.link.releases": "Releases",
    "footer.link.issues": "Issues",
    "footer.link.changelog": "Changelog",
    "footer.link.install": "Guia de instalação",
    "footer.link.cli": "Referência CLI",
    "footer.link.release": "Modo Time",
    "footer.link.features": "Recursos",
    "footer.link.arch": "Arquitetura",
    "footer.made": "Feito com vibes por",
    "footer.rights": "© 2025 agentistics. Licença MIT.",
  },
};

let currentLang: Lang = "en";

function applyTranslations(lang: Lang): void {
  const dict = T[lang];
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n")!;
    const text = dict[key];
    if (text !== undefined) el.textContent = text;
  });
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  const btn = document.getElementById("lang-toggle");
  if (btn) btn.textContent = lang === "en" ? "PT" : "EN";
}

export function initI18n(): void {
  const saved = localStorage.getItem("agentistics-lang") as Lang | null;
  if (saved === "en" || saved === "pt") {
    currentLang = saved;
  } else {
    const browser = navigator.language.toLowerCase();
    currentLang = browser.startsWith("pt") ? "pt" : "en";
  }

  applyTranslations(currentLang);

  const btn = document.getElementById("lang-toggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "pt" : "en";
    localStorage.setItem("agentistics-lang", currentLang);
    applyTranslations(currentLang);
  });
}

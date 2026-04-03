import { useState, useEffect } from 'react'
import { Sun, Moon, Languages, ArrowLeftRight } from 'lucide-react'

const translations = {
  en: {
    title: 'LDP vs RSVP-TE Reference',
    subtitle: 'Interactive comparison of LDP and RSVP-TE: label distribution, traffic engineering capabilities, FRR, and when to use each.',
    comparison: 'Comparison Table',
    diagrams: 'How They Work',
    whenToUse: 'When to Use',
    references: 'References',
    refList: [
      'RFC 5036 - LDP Specification',
      'RFC 3209 - RSVP-TE Extensions to RSVP for LSP Tunnels',
      'RFC 4090 - Fast Reroute Extensions to RSVP-TE for LSP Tunnels',
    ],
    builtBy: 'Built by',
    feature: 'Feature',
    ldp: 'LDP',
    rsvpte: 'RSVP-TE',
    rows: [
      { feature: 'Label Distribution Method', ldp: 'Downstream Unsolicited: labels distributed automatically based on IGP', rsvpte: 'Signaling-based: labels allocated along explicit PATH/RESV messages' },
      { feature: 'Traffic Engineering', ldp: 'None — follows IGP shortest path only', rsvpte: 'Full TE: explicit path, bandwidth reservation, affinity constraints' },
      { feature: 'Bandwidth Reservation', ldp: 'Not supported', rsvpte: 'Yes — reserves bandwidth on each hop via admission control' },
      { feature: 'Fast Reroute (FRR)', ldp: 'IP FRR (LFA/rLFA) only — no MPLS-level FRR', rsvpte: 'MPLS FRR with backup LSPs (Facility Backup, One-to-One)' },
      { feature: 'Topology Awareness', ldp: 'Relies entirely on IGP', rsvpte: 'Uses CSPF (Constrained SPF) with TEDB for path computation' },
      { feature: 'Scalability', ldp: 'High — simple, low state per LSR', rsvpte: 'Lower — O(N*M) state: N tunnels × M hops, soft-state refresh overhead' },
      { feature: 'Configuration Complexity', ldp: 'Very simple (global enable on interfaces)', rsvpte: 'High — requires explicit tunnel configuration and CSPF tuning' },
      { feature: 'Protocol Overhead', ldp: 'Low — TCP session for label distribution', rsvpte: 'High — periodic RESV refresh (can be mitigated with RSVP Refresh Reduction)' },
      { feature: 'Path Diversity / ECMP', ldp: 'Inherits ECMP from IGP', rsvpte: 'Explicit path control — can force specific paths regardless of ECMP' },
      { feature: 'Use with SR', ldp: 'Can coexist, but LDP/SR interworking needed at domain boundary', rsvpte: 'Being replaced by SR-TE in modern designs (no separate protocol)' },
      { feature: 'Typical Use Case', ldp: 'Simple MPLS core, L3VPN backhaul, no TE requirements', rsvpte: 'Service Provider TE: guaranteed BW, path diversity, protection' },
    ],
    ldpDiagram: [
      '1. Routers discover neighbors via LDP Hello (multicast 224.0.0.2, UDP 646)',
      '2. TCP session established for label exchange',
      '3. Each router distributes labels for all FEC it knows from IGP',
      '4. No bandwidth reservation — labels follow IGP shortest path',
      '5. If IGP changes, new labels are distributed automatically',
    ],
    rsvpDiagram: [
      '1. Ingress LSR sends PATH message hop-by-hop along explicit route',
      '2. PATH message carries bandwidth request and ERO (Explicit Route Object)',
      '3. Egress LSR responds with RESV message (upstream, allocating labels)',
      '4. Each transit router performs admission control and allocates resources',
      '5. Periodic RESV refresh (default 30s) maintains soft state',
      '6. RESV Teardown or PATH Error removes the LSP',
    ],
    whenLdp: [
      'Simple MPLS core without TE requirements',
      'L3VPN (BGP/MPLS VPN) deployments over MPLS backbone',
      'When SR-MPLS migration is not yet planned',
      'Environments prioritizing operational simplicity',
      'Legacy networks where RSVP-TE overhead is undesirable',
    ],
    whenRsvp: [
      'Traffic Engineering with guaranteed bandwidth (video, TDM-over-MPLS)',
      'Path diversity requirements (primary + secondary explicit paths)',
      'MPLS FRR for sub-50ms protection (Facility Backup)',
      'Wholesale carrier networks with SLA-based path commitments',
      'Before SR-TE was available — legacy SP TE deployments',
    ],
    modernNote: 'Modern recommendation: Segment Routing (SR-MPLS or SRv6) replaces both LDP and RSVP-TE in greenfield deployments, offering TE capabilities without per-LSP signaling state.',
  },
  pt: {
    title: 'Referencia LDP vs RSVP-TE',
    subtitle: 'Comparacao interativa de LDP e RSVP-TE: distribuicao de labels, capacidades de engenharia de trafego, FRR e quando usar cada um.',
    comparison: 'Tabela Comparativa',
    diagrams: 'Como Funcionam',
    whenToUse: 'Quando Usar',
    references: 'Referencias',
    refList: [
      'RFC 5036 - Especificacao LDP',
      'RFC 3209 - Extensoes RSVP-TE para LSP Tunnels',
      'RFC 4090 - Extensoes Fast Reroute para RSVP-TE',
    ],
    builtBy: 'Criado por',
    feature: 'Caracteristica',
    ldp: 'LDP',
    rsvpte: 'RSVP-TE',
    rows: [
      { feature: 'Metodo de Distribuicao de Labels', ldp: 'Downstream Unsolicited: labels distribuidos automaticamente com base no IGP', rsvpte: 'Baseado em sinalizacao: labels alocados ao longo de mensagens PATH/RESV explicitas' },
      { feature: 'Engenharia de Trafego', ldp: 'Nenhuma — segue apenas o menor caminho IGP', rsvpte: 'TE completo: caminho explicito, reserva de banda, restricoes de afinidade' },
      { feature: 'Reserva de Banda', ldp: 'Nao suportado', rsvpte: 'Sim — reserva banda em cada salto via controle de admissao' },
      { feature: 'Fast Reroute (FRR)', ldp: 'Somente IP FRR (LFA/rLFA) — sem FRR em nivel MPLS', rsvpte: 'MPLS FRR com LSPs de backup (Facility Backup, One-to-One)' },
      { feature: 'Consciencia de Topologia', ldp: 'Depende completamente do IGP', rsvpte: 'Usa CSPF (Constrained SPF) com TEDB para calculo de caminho' },
      { feature: 'Escalabilidade', ldp: 'Alta — simples, baixo estado por LSR', rsvpte: 'Menor — estado O(N*M): N tunnels × M saltos, overhead de refresh de soft state' },
      { feature: 'Complexidade de Configuracao', ldp: 'Muito simples (habilitacao global nas interfaces)', rsvpte: 'Alta — requer configuracao explicita de tunnels e ajuste de CSPF' },
      { feature: 'Overhead de Protocolo', ldp: 'Baixo — sessao TCP para distribuicao de labels', rsvpte: 'Alto — refresh RESV periodico (pode ser mitigado com RSVP Refresh Reduction)' },
      { feature: 'Diversidade de Caminho / ECMP', ldp: 'Herda ECMP do IGP', rsvpte: 'Controle explicito de caminho — pode forcar caminhos especificos independente de ECMP' },
      { feature: 'Uso com SR', ldp: 'Pode coexistir, mas requer interworking LDP/SR na fronteira do dominio', rsvpte: 'Sendo substituido por SR-TE em projetos modernos (sem protocolo separado)' },
      { feature: 'Caso de Uso Tipico', ldp: 'Nucleo MPLS simples, backhaul L3VPN, sem requisitos de TE', rsvpte: 'TE de provedor de servicos: banda garantida, diversidade de caminho, protecao' },
    ],
    ldpDiagram: [
      '1. Roteadores descobrem vizinhos via LDP Hello (multicast 224.0.0.2, UDP 646)',
      '2. Sessao TCP estabelecida para troca de labels',
      '3. Cada roteador distribui labels para todos os FECs conhecidos via IGP',
      '4. Sem reserva de banda — labels seguem o menor caminho IGP',
      '5. Se o IGP mudar, novos labels sao distribuidos automaticamente',
    ],
    rsvpDiagram: [
      '1. LSR de ingresso envia mensagem PATH salto-a-salto ao longo da rota explicita',
      '2. Mensagem PATH carrega a solicitacao de banda e o ERO (Explicit Route Object)',
      '3. LSR de egresso responde com mensagem RESV (sentido upstream, alocando labels)',
      '4. Cada roteador de transito realiza controle de admissao e aloca recursos',
      '5. Refresh RESV periodico (padrao 30s) mantem o soft state',
      '6. RESV Teardown ou PATH Error remove o LSP',
    ],
    whenLdp: [
      'Nucleo MPLS simples sem requisitos de TE',
      'Deployments L3VPN (BGP/MPLS VPN) sobre backbone MPLS',
      'Quando a migracao para SR-MPLS ainda nao esta planejada',
      'Ambientes que priorizam simplicidade operacional',
      'Redes legadas onde o overhead do RSVP-TE e indesejavel',
    ],
    whenRsvp: [
      'Engenharia de trafego com banda garantida (video, TDM-over-MPLS)',
      'Requisitos de diversidade de caminho (caminhos primario + secundario)',
      'MPLS FRR para protecao sub-50ms (Facility Backup)',
      'Redes de atacado com compromissos de caminho baseados em SLA',
      'Antes do SR-TE ser disponivel — deployments legados de TE em SP',
    ],
    modernNote: 'Recomendacao moderna: Segment Routing (SR-MPLS ou SRv6) substitui tanto LDP quanto RSVP-TE em novos deployments, oferecendo capacidades de TE sem estado de sinalizacao por LSP.',
  },
} as const

type Lang = keyof typeof translations
type View = 'comparison' | 'diagrams' | 'whenToUse'

export default function LdpVsRsvpReference() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [view, setView] = useState<View>('comparison')

  const t = translations[lang]
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <ArrowLeftRight size={18} className="text-white" />
            </div>
            <span className="font-semibold">LDP vs RSVP-TE</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/ldp-vs-rsvp-reference" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          {/* View selector */}
          <div className="flex flex-wrap gap-2">
            {([['comparison', t.comparison], ['diagrams', t.diagrams], ['whenToUse', t.whenToUse]] as [View, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setView(key)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${view === key ? 'bg-red-500 text-white border-red-500' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Comparison table */}
          {view === 'comparison' && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 overflow-x-auto">
              <h2 className="font-semibold mb-4">{t.comparison}</h2>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="text-left py-2 pr-4 text-xs uppercase tracking-wide text-zinc-400 font-medium w-1/4">{t.feature}</th>
                    <th className="text-left py-2 pr-4 pb-2 text-xs uppercase tracking-wide font-medium">
                      <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">LDP</span>
                    </th>
                    <th className="text-left py-2 text-xs uppercase tracking-wide font-medium">
                      <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">RSVP-TE</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((row, i) => (
                    <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 pr-4 font-medium text-xs text-zinc-600 dark:text-zinc-400">{row.feature}</td>
                      <td className="py-3 pr-4 text-xs text-zinc-600 dark:text-zinc-400">{row.ldp}</td>
                      <td className="py-3 text-xs text-zinc-600 dark:text-zinc-400">{row.rsvpte}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Diagrams */}
          {view === 'diagrams' && (
            <div className="grid gap-6 lg:grid-cols-2">
              {[
                { title: 'LDP', color: 'bg-blue-500', border: 'border-blue-500', steps: t.ldpDiagram },
                { title: 'RSVP-TE', color: 'bg-red-500', border: 'border-red-500', steps: t.rsvpDiagram },
              ].map(proto => (
                <div key={proto.title} className={`rounded-xl border-2 ${proto.border} bg-white dark:bg-zinc-900 overflow-hidden`}>
                  <div className={`${proto.color} px-6 py-4`}>
                    <h2 className="text-white font-bold text-lg">{proto.title} — Label Distribution</h2>
                  </div>
                  <div className="p-6">
                    <ol className="space-y-3">
                      {proto.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className={`w-6 h-6 rounded-full ${proto.color} text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5`}>{i + 1}</span>
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* When to use */}
          {view === 'whenToUse' && (
            <div className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-2">
                {[
                  { title: t.ldp, color: 'bg-blue-500', border: 'border-blue-500', items: t.whenLdp },
                  { title: t.rsvpte, color: 'bg-red-500', border: 'border-red-500', items: t.whenRsvp },
                ].map(proto => (
                  <div key={proto.title} className={`rounded-xl border-2 ${proto.border} bg-white dark:bg-zinc-900 overflow-hidden`}>
                    <div className={`${proto.color} px-6 py-4`}>
                      <h2 className="text-white font-bold">Use {proto.title} when...</h2>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-2.5">
                        {proto.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${proto.color}`} />
                            <span className="text-zinc-600 dark:text-zinc-400">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 p-5">
                <div className="text-xs uppercase tracking-wide text-amber-600 dark:text-amber-400 font-medium mb-2">Modern Note</div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.modernNote}</p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="font-semibold mb-3">{t.references}</h2>
            <ul className="space-y-1">
              {t.refList.map(ref => (
                <li key={ref} className="text-sm text-zinc-500 dark:text-zinc-400 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>{ref}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-red-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}

Produto: MSFS 2024 – Career Manager

Solicitante: CEO Rodrigo

Problema: a versão mobile está inferior à desktop. O menu inferior é incompleto (não reflete as seções novas), navegação é confusa e vários componentes não se adaptam bem a telas pequenas.

1) Objetivos

Entregar UX/UI responsiva de alto nível para celulares e tablets (PWA).

Replicar a IA de menu por seções (Operacional, Financeiro, Administrativo) também no mobile.

Manter paridade funcional com desktop, priorizando descoberta e eficiência no touch.

Melhorar performance perceptiva (skeletons, lazy, transições leves) e acessibilidade (WCAG AA).

Fora do escopo (neste PRD)

Redesenho visual completo do tema.

Mudanças de regra de negócio.

2) Personas & cenários-chave

Piloto/Usuário usando celular durante/entre voos para registrar voos, ver metas e lancar despesas/receitas.

Gestão consultando painéis financeiros e relatórios em tablets.

3) Arquitetura de navegação (Mobile)
3.1. Menu Hambúrguer completo (recomendado)

Ícone no header (esquerda) abre drawer de largura 80% com TODAS as seções.

Seções colapsáveis com ícone “+ / –” (FAQ-like), estado persistido (localStorage).

Itens:

Operacional: Voos, Histórico, Manutenção (nova), Tempo Real, Ranking, Metas

Financeiro: Financeiro, Compras (nova), Relatórios Financeiros (nova)

Administrativo: Perfil, Configurações

Motivo: garante paridade com desktop, alta escalabilidade, e reduz truncamentos do bottom bar.

3.2. Bottom bar (atalhos)

4–5 ações mais usadas (ex.: Dashboard, Voos, Financeiro, Perfil, Mais).

Mais abre o mesmo drawer do hambúrguer, evitando menus duplicados.

3.3. Deep-link & estado

Abrir rota direta expande a seção correspondente no drawer.

Item ativo destacado em bottom bar e no drawer.

4) Breakpoints & layout

XS ≤ 360px (telas muito pequenas): 1 coluna, densidade máxima.

SM 361–480px (telefones): 1 coluna, cards compactos.

MD 481–768px (grandes/mini-tablets): 1–2 colunas conforme container.

LG 769–1024px (tablets): 2–3 colunas.

Orientação: suportar portrait/landscape (safe-areas / notches).

Tipografia fluida (ex.): font-size: clamp(14px, 1.7vw, 16px).
Grid: 8px spacing; cards com tap target ≥ 44x44px.

5) Padrões de UI (móvel)
5.1. Cards e listas

Cards compactos; informações primárias visíveis; ações secundárias em menu “⋮”.

Em listas, permitir swipe (opcional) para ações comuns (editar/excluir).

Status badge sempre tocável (alterar status) e demais áreas abrem detalhes.

5.2. Tabelas/relatórios

Converter em listas de cards com labels ou usar colunas essenciais e coluna “Mais” que expande.

5.3. Filtros & busca

Em mobile, filtros em sheet/modal full-height; ações Aplicar/limpar fixas no rodapé do modal.

5.4. Formulários (ex.: lançamentos financeiros)

Tipo de teclado correto (numérico, e-mail, data).

Máscaras/validações em tempo real.

Auto-save opcional; feedback com toasts.

5.5. Componentes críticos

Charts responsivos (container-query).

Skeletons para cards e gráficos.

Toast/Sheet para ações rápidas.

Pull-to-refresh (opcional) em listas extensas.

6) IA do Menu (JSON sugerido)

{
  "shortcutTabs": ["dashboard", "voos", "financeiro", "perfil", "more"],
  "drawer": [
    { "type":"section","id":"operacional","label":"Operacional","items":[
      {"id":"voos","to":"/voos","icon":"plane"},
      {"id":"historico","to":"/historico","icon":"history"},
      {"id":"manutencao","to":"/manutencao","icon":"wrench"},
      {"id":"tempo-real","to":"/tempo-real","icon":"activity"},
      {"id":"ranking","to":"/ranking","icon":"trophy"},
      {"id":"metas","to":"/metas","icon":"target"}
    ]},
    { "type":"section","id":"financeiro","label":"Financeiro","items":[
      {"id":"financeiro","to":"/financeiro","icon":"wallet"},
      {"id":"compras","to":"/compras","icon":"shopping-cart"},
      {"id":"relatorios","to":"/financeiro/relatorios","icon":"bar-chart"}
    ]},
    { "type":"section","id":"adm","label":"Administrativo","items":[
      {"id":"perfil","to":"/perfil","icon":"user"},
      {"id":"config","to":"/configuracoes","icon":"settings"}
    ]}
  ]
}

7) Performance & PWA

First interaction < 100ms nas telas críticas.

Lazy-load de rotas e gráficos pesados.

Cache inteligente (RTK Query/React Query) + revalidação.

Mensagens offline/retry claras.

Ícones SVG otimizados, imagens WebP/AVIF.

8) Acessibilidade

WCAG AA: contraste, foco visível, labels.

Hit areas ≥ 44x44px; aria-expanded, role="button" nos cabeçalhos de seção.

Prefer-reduced-motion respeitado em animações.

9) Conteúdo & língua

Respeitar PT/EN com i18n; números/datas localizados.

Tipos e abreviações consistentes (nm, h, CR, etc.).

10) Métricas de sucesso

+25% retenção em mobile das telas Voos/Financeiro.

−40% tempo para registrar voo/lançamento financeiro.

−80% erros de navegação (404/voltas desnecessárias).

CLS e INP dentro de metas Core Web Vitals.

11) Critérios de aceite

 Hambúrguer com todas as seções (Operacional, Financeiro, Administrativo) + estado persistido.

 Bottom bar com atalhos e item Mais abrindo o mesmo drawer.

 Navegação direta expande seção correta e destaca item ativo.

 Cards responsivos; ações principais visíveis; “⋮” para secundárias.

 Filtros em sheet; formulários otimizados para touch/teclado.

 Charts e tabelas legíveis em XS/SM (sem overflow horizontal).

 Acessibilidade AA e targets 44x44 verificados.

 PWA com skeletons e lazy; sem flashes ou layout shift crítico.

12) Entregáveis

Fluxos e wireframes mobile/tablet (Figma).

Protótipo navegável (hambúrguer + bottom bar).

Biblioteca de componentes responsivos (tokens, espaçamentos, tipografia fluida).

Guia de uso (docs curtas por componente).

13) Plano (alto nível)

UX: fluxos, IA e wireframes (mobile/tablet).

UI: protótipo e tokens responsivos.

Dev: drawer, bottom bar, container queries, refator de cards/tabelas.

QA: matriz de devices (iPhone SE/Pro Max, Android 360–480–800px, iPad Mini/Air/Pro; portrait/landscape).

Telemetria: eventos chave (open drawer, taps nos atalhos, tempo de tarefa).

14) Observações do solicitante

O menu inferior atual é incompleto. A versão final deve refletir as seções novas e/ou oferecer o hambúrguer completo.

Prioridade para Voos e Financeiro no uso diário.
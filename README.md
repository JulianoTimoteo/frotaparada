# 🚜 Controle de Frotas Paradas

Sistema web para monitoramento e gestão de frotas paradas (caminhões, colhedoras e transbordos) com integração ao Firebase e visualização de Ordens de Serviço (OS) da oficina.

---

## Funcionalidades

- **📋 Painel de Frotas Paradas** — Registro e acompanhamento de veículos parados com motivo, horário, duração prevista e retorno calculado automaticamente
- **🔧 OS Oficina** — Visualização de Ordens de Serviço com cards por frota, status (Atrasada/No Prazo/Sem Previsão/Vence Hoje) e filtro por equipe
- **⏱ Cronômetro em tempo real** — Contagem regressiva para o retorno esperado, barra de progresso visual e alarme sonoro ao estourar o prazo
- **🔄 Sincronização Firebase** — Dados salvos localmente (localStorage) e sincronizados com Firestore em tempo real
- **🔎 Autocomplete de frota** — Sugestão automática dos números de frota cadastrados
- **📥 Exportar CSV** — Exportação completa dos dados
- **📷 Print** — Captura de tela da aba ativa com `html2canvas`
- **🌙 Tema Claro/Escuro** — Alternância entre temas
- **⌨️ Atalhos de teclado** — `F10` insere hora atual no campo "Hora Parada"; `Tab/Enter` navega entre campos; `Ctrl+Duplo Clique` desbloqueia campos readonly
- **🔄 Integração automática com OS** — Linhas geradas automaticamente nas abas de frota a partir de ordens de serviço do dia (via AgroAnalytics Firebase)
- **🛑 Limpeza automática** — Linhas "Via Sistema" de OS fechadas são removidas automaticamente

---

## Estrutura do Projeto

```
frotas-paradas/
├── index.html              # Aplicação completa (HTML + CSS + JS)
├── styles.css              # Estilos complementares (placeholder)
├── firebaseConfig.js       # Configuração do Firebase (módulo ES)
├── initFirebase.js         # Inicialização do Firebase (módulo ES)
├── frotas-config.js        # Configuração das frotas disponíveis (módulo ES)
├── carregarDadosOficina.js # Módulo para carregar dados da oficina (módulo ES)
└── README.md               # Este arquivo
```

---

## Tecnologias

- **Firebase Firestore** — Banco de dados NoSQL em tempo real (configurações separadas para Frotas Paradas e AgroAnalytics)
- **html2canvas** — Captura de tela para funcionalidade de print
- **CSS Custom Properties** — Temas dinâmicos (claro/escuro)
- **Vanilla JavaScript (ES6+)** — Sem frameworks, toda a lógica no `index.html`

---

## Configuração

### Firebase

Duas conexões Firebase são utilizadas:

1. **Frotas Paradas** (`frotasparadas`) — Armazena dados das frotas ativas e histórico
   - Coleção: `frotas_ativas/{tableId}` — registros das tabelas
   - Coleção: `historico_paradas` — histórico de remoções
   - Configuração embutida no `index.html`

2. **AgroAnalytics** (`agroanalytics-api`) — Fonte de dados das OS da oficina
   - Estrutura: `/oficina/{equipe}/frotas/{frota}/ordens/{cod_os}`
   - Configuração embutida no `index.html`

> ⚠️ As credenciais estão hardcoded no `index.html` (apenas para ambiente interno). Não há autenticação implementada.

---

## Como Usar

1. Abra o `index.html` diretamente no navegador (não requer servidor)
2. Na aba **Caminhões**, clique em "＋ Adicionar" para registrar um veículo parado
3. Preencha Frota, Data, Motivo, Hora Parada e Previsão de Duração
4. Clique em "✔ Salvar" para confirmar (o campo "Hora Parada" torna-se readonly)
5. Na aba **🔧 OS Oficina**, visualize as ordens de serviço carregadas automaticamente
6. Use os botões de filtro por equipe e a busca textual
7. Alterne entre "Principal (Hoje)" e "Histórico OS (Tudo)" no topo

### Atalhos

| Tecla | Ação |
|-------|------|
| `F10` | Insere hora atual no campo "Hora Parada" |
| `Tab` / `Enter` | Navega entre campos editáveis |
| `Ctrl + Duplo Clique` | Desbloqueia campos readonly (Hora Parada / Retorno) |

---

## Fluxo de Dados

1. **localStorage** — Persistência primária offline
2. **Firebase (Frotas Paradas)** — Sincronização secundária via botão "🔄 Sincronizar" ou automática ao salvar
3. **Firebase (AgroAnalytics)** — Leitura de ordens de serviço da oficina (somente leitura)
4. **OS → Frotas** — OS do dia atual são automaticamente inseridas como linhas "Via Sistema" nas tabelas de frota, e removidas quando a OS é fechada

---

## Observações

- Sistema desenvolvido para ambiente interno da Usina (ambiente de produção local)
- As configurações de frota (`FROTAS_DISPONIVEIS`) são mantidas no `frotas-config.js` e também inline no `index.html`
- Novas frotas podem ser cadastradas automaticamente ao digitar um número de frota válido (prefixo compatível)
- O arquivo `styles.css` contém apenas placeholders; os estilos reais estão embutidos no `<style>` do `index.html`

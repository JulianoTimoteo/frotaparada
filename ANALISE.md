# Análise Completa do Programa — Frotas Paradas

> **Data da análise:** 20/07/2026
> **Versão analisada:** Atual (conforme arquivos no repositório)
> **Propósito:** Documentar a arquitetura, estrutura, dependências e comportamento do sistema antes de iniciar novas implementações.

---

## 1. Visão Geral

O **Controle de Frotas Paradas** é um sistema web *single-page* (SPA) desenvolvido em JavaScript puro para gerenciamento de veículos agrícolas e industriais que estão temporariamente parados por manutenção ou outros motivos. Ele também consome ordens de serviço (OS) de um sistema externo (AgroAnalytics) e as exibe em uma aba dedicada, além de integrá-las automaticamente às tabelas de frota.

Público-alvo: equipe de oficina, supervisores de frota e gestão operacional de uma usina sucroenergética.

---

## 2. Arquitetura

### 2.1. Componentes do Projeto

| Arquivo | Tipo | Tamanho | Função |
|---------|------|---------|--------|
| `index.html` | HTML + CSS + JS (inline) | ~2700 linhas | Aplicação completa — markup, estilos e toda a lógica JS |
| `firebaseConfig.js` | Módulo ES | 11 linhas | Exporta configuração do Firebase (com `process.env`) |
| `initFirebase.js` | Módulo ES | 8 linhas | Inicializa Firebase Firestore |
| `frotas-config.js` | Módulo ES | 29 linhas | Constantes: `FROTAS_DISPONIVEIS`, `PREFIXOS_VALIDOS`, `TABELAS`, `CONTADORES`, `GCS`, `PILLS` |
| `carregarDadosOficina.js` | Módulo ES | 13 linhas | Função simples para carregar dados da oficina (substituída pela lógica inline no `index.html`) |
| `styles.css` | CSS | 16 linhas | Placeholders (estilos reais estão no `<style>` do `index.html`) |

### 2.2. Observação sobre Módulos ES

Os arquivos `firebaseConfig.js`, `initFirebase.js`, `frotas-config.js` e `carregarDadosOficina.js` são módulos ES (`export default`), mas o `index.html` carrega o Firebase via CDN com `firebase-app-compat.js` e `firebase-firestore-compat.js` (script clássico) **e não importa nenhum desses módulos**. Todo o código funcional está inline no `index.html`, com as configurações duplicadas:

- `firebaseConfig.js` usa `process.env` (não funciona no navegador sem bundler)
- `frotas-config.js` repete os mesmos dados que estão inline no `index.html`
- `carregarDadosOficina.js` tem uma implementação diferente da que está inline

> **Conclusão:** Os arquivos `.js` separados são **resquícios de uma arquitetura anterior ou planejada**, mas não são utilizados pela aplicação em execução. O sistema real roda exclusivamente com o `index.html`.

---

## 3. Estrutura de Dados

### 3.1. Tabelas de Frota

Seis tabelas, divididas em abas (atualmente apenas a aba Caminhões está implementada no HTML, mas as estruturas de colhedora e transbordo existem nas constantes):

| ID da Tabela | Categoria | Prefixo | Contador ID |
|---|---|---|---|
| `tabela-cam-proprio` | Caminhão Próprio | 31... | `contador-cam-proprio` |
| `tabela-cam-terceiro` | Caminhão Terceiro | 91... | `contador-cam-terceiro` |
| `tabela-cam-borracharia` | Borracharia | 31..., 91... | `contador-cam-borracharia` |
| `tabela-col-proprio` | Colhedora Própria | 80... | `contador-col-proprio` |
| `tabela-col-terceiro` | Colhedora Terceira | 93... | `contador-col-terceiro` |
| `tabela-transbordo` | Transbordo | 92... | `contador-transbordo` |

### 3.2. Estrutura de uma Linha (registro de frota parada)

| Campo | Tipo | Exemplo | Observação |
|---|---|---|---|
| `frota` | string | `311015` | Número da frota |
| `dataEntrada` | string | `20/07/2026` | Data no formato DD/MM/AAAA |
| `motivo` | string | `TROCA DE EMBREAGEM` | Descrição do motivo |
| `horarioParada` | string | `08:30` | Hora que parou (formato HH:MM) |
| `previsaoRetorno` | string | `02:30` | Duração prevista (HH:MM ou minutos puros) |
| `horarioRetorno` | string | `11:00` | Calculado automaticamente |
| `dataRetornoCompleta` | string (ISO) | `2026-07-20T11:00:00.000Z` | Timestamp completo do retorno (atributo `data-hora-retorno` na tr) |
| `tempoAdicionado` | boolean | `true` | Se houve acréscimo de tempo via modal de atraso |
| `osOrigin` | boolean | `true` | Se a linha foi gerada automaticamente por uma OS |
| `cod_os_origin` | string | `718898` | Código da OS de origem |

### 3.3. Estrutura de uma OS (Ordem de Serviço — AgroAnalytics)

| Campo | Tipo | Exemplo |
|---|---|---|
| `cod_os` | string | `718898` |
| `frota_cc` | string | `80116 - CASE 8800` |
| `apelido` | string | `COLHEDORA DE CANA PICADA` |
| `data_entrada` | string | `20/07/2026` |
| `data_previsao` | string | `22/07/2026` |
| `descricao_servico` | string | `TROCA DE MOTOR` |
| `oficina` | string | `OFICINA CENTRAL` |
| `dias_permanencia` | number | `2` |
| `updated_at` | Timestamp | Firestore Timestamp |

---

## 4. Fluxo de Dados Detalhado

### 4.1. Persistência

```
Usuário edita → localStorage (imediato) → Firebase (assíncrono, 100ms debounce)
                     ↑                        ↓
                Carregamento inicial     Sincronização manual (botão)
                     ↑                        ↓
               localStorage ← Firebase (syncFirebase)
```

### 4.2. Ciclo de Vida das OS

```
Firebase AgroAnalytics
  → collectionGroup("ordens") ou /resumo_oficina/{YYYY-MM-DD}
    → _osCache (array global)
      → _render() → Cards na aba OS Oficina
      → _processarOSParaFrotasParadas() → Linhas "Via Sistema" nas tabelas
      → _limparOSFechadasDasFrotas() → Remove linhas de OS já fechadas
```

### 4.3. Carregamento Inicial (window.onload)

1. `initFirebase()` — Conecta Firestore (Frotas Paradas)
2. `_carregarFrotasCustom()` — Carrega frotas customizadas do localStorage
3. Carrega cada tabela do localStorage → `_criarLinha()` para cada registro
4. `carregarTudoFirebase()` — Sobrescreve com dados do Firebase (se existirem)
5. `carregarDadosOficina(false)` — Carrega OS do AgroAnalytics em background
6. `_processarOSParaFrotasParadas()` — Cria linhas "Via Sistema"
7. `_limparOSFechadasDasFrotas()` — Remove OS já fechadas

---

## 5. Firestore — Estrutura no Banco

### 5.1. Frotas Paradas (projeto `frotasparadas`)

```
/frotas_ativas/{tableId}
  ├── registros: [{ frota, dataEntrada, motivo, horarioParada, previsaoRetorno, horarioRetorno, dataRetornoCompleta, tempoAdicionado, osOrigin, cod_os_origin }]
  └── atualizado: string (ISO)

/historico_paradas/{autoId}
  ├── frota, tipo, dataEntrada, motivo, parada, previsaoRetorno, horarioRetorno, duracao, timestamp, data
```

### 5.2. AgroAnalytics (projeto `agroanalytics-api`)

```
/oficina/{apelido_equipe}/frotas/{frota}/ordens/{cod_os}
  ├── cod_os, frota_cc, apelido, data_entrada, data_previsao
  ├── descricao_servico, oficina, dias_permanencia, updated_at

/resumo_oficina/{YYYY-MM-DD}
  └── grupos: { [equipe]: [ { cod_os, frota_cc, ... } ] }
```

---

## 6. Funcionalidades em Detalhe

### 6.1. Cadastro de Frota Parada
- Botão "＋ Adicionar" → cria nova linha com data atual preenchida
- Autocomplete no campo Frota (baseado em `FROTAS_DISPONIVEIS`)
- Validação de prefixo (ex: 31... para caminhão próprio)
- Auto-cadastro de frotas novas (se prefixo válido)
- Confirmação → campo "Hora Parada" torna-se readonly (proteção contra edição acidental)

### 6.2. Cálculo de Retorno
- `horaParada + duracaoPrevista = horarioRetorno`
- Se ultrapassa 24h, avança os dias
- `data-hora-retorno` armazenado como ISO timestamp na `<tr>`
- Cronômetro atualizado a cada 1 segundo

### 6.3. Cronômetro e Barra de Progresso
- **Com previsão:** mostra "Falta Xh Ymin" (azul) ou "Atrasado Xh Ymin" (vermelho com animação pulsante) + barra de progresso
- **Sem previsão:** mostra "Parado Xh Ymin" (vermelho, sem barra)
- Barra de progresso: verde (<70%), amarela (70-99%), vermelha (100%+)

### 6.4. Alarme e Modal de Atraso
- Quando o cronômetro atinge o prazo, toca alarme sonoro (3 bipes 880Hz)
- Se a linha está salva e atrasa, abre modal para:
  - **Adicionar Tempo Extra** — soma minutos à previsão atual (formato flexível: `30` = 30 min, `130` = 1h30)
  - **Remover Frota** — remove a linha e salva no histórico
- O alarme não repete para a mesma frota+timestamp (Set `_alarmeSet`)

### 6.5. Edição de Campos Readonly
- **Ctrl + Duplo Clique** desbloqueia campos Hora Parada e Retorno
- Visual amarelo no campo desbloqueado (`data-unlocked="true"`)
- Enter ou blur confirma e retorna ao readonly

### 6.6. OS Oficina (Aba)
- Carregamento via Firebase AgroAnalytics com 6 estratégias de fallback
- Resumo diário (`/resumo_oficina/{date}`) é priorizado
- Filtros: Hoje (padrão) / Histórico, busca textual, filtro por equipe
- Cards por frota com status: Atrasada, Vence Hoje, No Prazo, S/ Previsão

### 6.7. Integração OS → Frotas
- OS do dia atual geram linhas "Via Sistema" nas tabelas de frota automaticamente
- Reconhecimento de serviços de borracharia via keywords
- OS de revisão periódica (ex: "REVISÃO DE 75.000 KM") são ignoradas
- Ao fechar a OS no sistema de origem, a linha é removida automaticamente

### 6.8. Temas
- Escuro (padrão) / Claro
- Tema salvo no localStorage
- Cores e estilos completamente redefinidos para cada tema

### 6.9. Exportação e Print
- CSV: exporta todas as tabelas com BOM UTF-8
- Print: clona a aba ativa, substitui inputs por spans, captura com html2canvas, copia para área de transferência ou baixa PNG

### 6.10. Teclado
- `F10`: insere hora atual no campo "Hora Parada" (se editável)
- `Tab/Enter`: navegação entre campos de input no tbody
- No campo Previsão, Enter interpreta a duração e foca no botão Salvar

---

## 7. Configurações e Dependências

### 7.1. Firebase — Chaves e Configurações

**Frotas Paradas** (embutido no `index.html`):
```js
apiKey: "AIzaSyBRvOpraQrwmXegstKtqLMDXkC9Uk0s4Hw"
authDomain: "frotasparadas.firebaseapp.com"
projectId: "frotasparadas"
```

**AgroAnalytics** (embutido no `index.html`):
```js
apiKey: "AIzaSyADUuqh_THzGInTSytxzUFEwHV5LmwdvYc"
authDomain: "agroanalytics-api.firebaseapp.com"
projectId: "agroanalytics-api"
```

### 7.2. CDNs Externas
- `html2canvas` 1.4.1
- `firebase-app-compat` 10.12.2
- `firebase-firestore-compat` 10.12.2

---

## 8. Limitações e Pontos de Atenção

| # | Limitação | Descrição |
|---|-----------|-----------|
| 1 | **Código monolítico** | ~2700 linhas no `index.html` sem separação de concerns |
| 2 | **Módulos ES não utilizados** | `firebaseConfig.js`, `initFirebase.js`, `frotas-config.js` e `carregarDadosOficina.js` não são importados pelo `index.html` (config duplicada) |
| 3 | **Chaves Firebase expostas** | As API Keys estão hardcoded no HTML (sem segurança, mas é ambiente interno) |
| 4 | **Sem autenticação** | Qualquer pessoa com acesso ao HTML pode ler/escrever no Firestore |
| 5 | **Apenas aba Caminhões implementada** | As abas de Colhedora e Transbordo existem nas constantes mas não têm seção HTML renderizada |
| 6 | **`firebaseConfig.js` usa `process.env`** | Não funciona no navegador sem bundler (webpack/vite) |
| 7 | **Sem testes** | Nenhum teste automatizado presente |
| 8 | **Duas inicializações Firebase** | Frotas Paradas + AgroAnalytics, em projetos distintos |
| 9 | **Estilos duplicados** | `styles.css` tem placeholders, mas o CSS real está inline no HTML |

---

## 9. Dependências entre Componentes

```
index.html
├── styles (inline, ~700 linhas de CSS)
├── firebase-app-compat (CDN)
├── firebase-firestore-compat (CDN)
├── html2canvas (CDN)
├── FROTAS_DISPONIVEIS (duplicado de frotas-config.js)
├── PREFIXOS_VALIDOS (duplicado de frotas-config.js)
├── Funções:
│   ├── initFirebase()          — Conecta Frotas Paradas
│   ├── salvarTabelaFirebase()  — Salva tabela no Firestore
│   ├── carregarTudoFirebase()  — Carrega dados do Firestore
│   ├── _criarLinha()           — Cria linha na tabela
│   ├── _ativarListeners()      — Input listeners + auto-save
│   ├── _recalcular()           — Calcula horário de retorno
│   ├── _atualizarCronometroLinha() — Atualiza cronômetro + barra
│   ├── _criarAutocomplete()    — Autocomplete de frota
│   ├── _confirmarLinha()       — Salva linha (readonly + Firebase)
│   ├── _processarOSParaFrotasParadas() — Integração OS → Frotas
│   ├── _limparOSFechadasDasFrotas() — Limpeza de OS fechadas
│   ├── carregarDadosOficina()  — Carrega OS do AgroAnalytics
│   ├── _render()               — Renderiza cards de OS
│   ├── exportarCSV()           — Exportação CSV
│   ├── tirarPrint()            — Print com html2canvas
│   └── toggleTema()            — Alterna tema claro/escuro
└── Variáveis globais:
    ├── db                      — Firestore (Frotas Paradas)
    ├── _dbAgro                 — Firestore (AgroAnalytics)
    ├── _osCache                — Cache das OS carregadas
    ├── _addedOSCodigos         — Set de códigos de OS já adicionados
    ├── _alarmeSet              — Set de alarmes já disparados
    ├── _equipeFiltro           — Filtro de equipe atual
    └── _osModoExibicao         — Modo "HOJE" ou "HISTORICO"
```

---

## 10. Resumo para Novas Implementações

**O que NÃO pode ser alterado sem consentimento:**
- Todo o código existente nos 6 arquivos do projeto
- As regras de negócio (cálculo de retorno, validação de frota, fluxo de salvamento)
- As configurações de Firebase e frotas
- O CSS e layout atuais
- O comportamento de autocomplete, cronômetro e alarme

**O que PODE ser feito:**
- Adicionar novas funcionalidades (novas abas, novos recursos, novos scripts)
- Criar novos arquivos (HTML parcial, JS, CSS)
- Estender o comportamento existente **sem modificar** o que já funciona
- Se for necessária alteração em código existente, **consultar o usuário primeiro**

---

## 11. Checklist para Novas Features

- [ ] Testar que o `index.html` abre sem erros no console
- [ ] Verificar se a feature requer novos módulos/scripts ou modificação no existente
- [ ] Se modificar código existente, obter autorização explícita do usuário
- [ ] Validar compatibilidade com tema claro/escuro
- [ ] Garantir que a persistência (localStorage + Firebase) não é quebrada
- [ ] Verificar se a funcionalidade precisa de novas entradas no `FROTAS_DISPONIVEIS` ou `PREFIXOS_VALIDOS`
- [ ] Atualizar este documento se a arquitetura for alterada significativamente

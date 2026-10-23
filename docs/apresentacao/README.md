# Material Institucional de Apresentação — Urboa

Este diretório contém o material oficial de apresentação comercial e técnica da plataforma **Urboa**, desenvolvido especificamente para reuniões com prefeitos, secretários municipais (Obras, Educação, Saúde, Administração), controladorias e procuradorias.

---

## 📦 Conteúdo Disponível

| Arquivo | Formato | Finalidade | Como Visualizar / Usar |
|---|---|---|---|
| **[`index.html`](file:///Users/ch4rle2/.gemini/antigravity-ide/scratch/predial-monorepo/docs/apresentacao/index.html)** | Web Deck Interativo (16:9) | Apresentação em telão / projetor / reuniões virtuais | Abra no Chrome ou qualquer navegador |
| **[`apresentacao-urboa-deck.pdf`](file:///Users/ch4rle2/.gemini/antigravity-ide/scratch/predial-monorepo/docs/apresentacao/apresentacao-urboa-deck.pdf)** | Slides em PDF | Envio antecipado para a prefeitura ou impressão em lâminas | Leitor de PDF padrão |
| **[`one-pager.html`](file:///Users/ch4rle2/.gemini/antigravity-ide/scratch/predial-monorepo/docs/apresentacao/one-pager.html)** | One-Pager / Folder (A4) | Material executivo de 2 páginas pronto para impressão | Abra no navegador ou imprima (`Ctrl+P` / `Cmd+P`) |
| **[`urboa-one-pager.pdf`](file:///Users/ch4rle2/.gemini/antigravity-ide/scratch/predial-monorepo/docs/apresentacao/urboa-one-pager.pdf)** | Folder Comercial em PDF | Envio por e-mail pós-reunião ou impressão gráfica (2 páginas A4) | Leitor de PDF padrão |

---

## 🖥️ 1. Apresentação em Slides (`index.html`)

Apresentação no formato **1920×1080** com escalonamento automático para a resolução da tela, paleta corporativa Navy (`#0A2540`) e Sky (`#38BDF8`), tipografia editorial (Newsreader + Geist) e telas reais da plataforma.

### 🎮 Atalhos de Navegação
- **`→` / `Espaço` / `PageDown`**: Próximo slide
- **`←` / `Backspace` / `PageUp`**: Slide anterior
- **`Home` / `End`**: Primeiro / Último slide
- **`F`**: Alternar modo Tela Cheia
- **Clique no mouse**: 
  - Clique no lado esquerdo da tela (terço inicial): volta
  - Clique no restante da tela: avança
- **Toque (Touchscreen)**: Deslizar para os lados
- **URL com Hash**: Você pode enviar um link direto para um slide específico, ex: `index.html#8` abre diretamente o slide do Técnico.

### 📑 Estrutura dos 16 Slides
1. **Capa**: Identidade institucional, lema *"Chamados resolvidos. Contas em dia."*
2. **O Cenário Atual**: 4 dores clássicas da manutenção predial pública (pedidos no WhatsApp, prazos sem dono, ausência de fotos, contratos estourados).
3. **A Solução**: Arquitetura de 4 perfis colaborativos (Solicitante, Gestor, Técnico, Admin).
4. **Ciclo de Vida com Travas**: 5 etapas obrigatórias (Triagem → Agendado → Execução → Validação → Concluído) com travas duras e "A Bola da Vez".
5. **Para o Solicitante**: Abertura em 45 segundos, anexo de fotos, urgência local e aceite antes do encerramento.
6. **Para o Gestor**: Painel Hoje com alertas de urgências de 4h, fila de decisões e agenda unificada.
7. **Visão da Rede**: Mosaico interativo com Quadro Kanban, inventário territorial de prédios e agenda preventiva ABNT NBR 5674.
8. **Em Campo (Técnico)**: Pauta diária no celular, congelamento automático de SLA por falta de peça e consumo de materiais.
9. **Matriz de Prazos (SLA)**: Prazos fatais (4h Urgente, 24h Alta, 72h Média, 7 dias Baixa) e fórmula legal de suspensão.
10. **Governança & Contratos**: Hard block orçamentário contra estouro de empenho e trilha de auditoria imutável (sem `DELETE`).
11. **Ouvidoria 156 Integrada**: Conversão direta de protocolos do munícipe em ordens de serviço com resposta automática do antes/depois.
12. **Copilot IA "Urbi"**: Consultas em linguagem natural com citação da base oficial de dados da prefeitura.
13. **Relatórios & Prestação de Contas**: MTTR, conformidade de prazos, custos por secretaria e exportação para o TCE.
14. **Segurança & Tecnologia**: Multi-tenancy municipal isolado, RBAC rigoroso, banco PostGIS e arquitetura moderna em nuvem.
15. **Implantação Rápida**: Metodologia em 4 passos (Diagnóstico ➔ Configuração ➔ Piloto ➔ Expansão) e proposta de demo de 20 minutos.
16. **Encerramento**: Chamada para ação e contatos institucionais.

---

## 📄 2. One-Pager Executivo (`one-pager.html`)

Formatado em **A4 (2 páginas)** com design de alto padrão pronto para impressão física ou anexo em propostas e e-mails:

- **Página 1**: Proposta de valor, comparação direta antes vs. depois, os 4 perfis municipais e métricas de impacto (45s de abertura, 4h SLA crítico, 100% comprovado com fotos).
- **Página 2**: Linha do tempo das 5 etapas da OS com as travas do sistema, módulos de Ouvidoria 156 e Almoxarifado/SINAPI, tabela de prazos regulamentares, selos de conformidade jurídica/fiscal e chamada para demonstração piloto.

---

## 🖨️ Como Gerar Novos PDFs

Se você modificar os textos ou estilos, execute o comando abaixo no terminal da raiz do monorepo:

```bash
# Exportar One-Pager e Deck para PDF via Google Chrome
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="docs/apresentacao/urboa-one-pager.pdf" "file://$(pwd)/docs/apresentacao/one-pager.html"

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="docs/apresentacao/apresentacao-urboa-deck.pdf" "file://$(pwd)/docs/apresentacao/index.html"
```

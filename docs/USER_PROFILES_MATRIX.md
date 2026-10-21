# Matriz Oficial de Perfis e Usuários por Cenário

Este documento documenta os papéis (RBAC - Role-Based Access Control), permissões operacionais e a lista completa de contas de acesso dividida nos três cenários: **Desenvolvimento Local**, **Staging (Homologação)** e **Produção**.

---

## 1. Níveis de Acesso e Matriz de Permissões (RBAC)

| Módulo / Funcionalidade | ADMIN | GESTOR | TÉCNICO | SOLICITANTE |
|---|:---:|:---:|:---:|:---:|
| **Visão Geral / Dashboards Executivos** | Total | Total da Secretaria | Chamados Próprios | Chamados do Prédio |
| **Abertura de Chamado (OS)** | Total | Total | - | Própria Unidade |
| **Triagem e Distribuição de OS** | Total | Total | - | - |
| **Execução, Pausa e Conclusão de OS** | Total | Total | Chamados Atribuídos | - |
| **Registro de Fotos de Conclusão** | Sim | Sim | Obrigatório no Término | - |
| **Medição Financeira e Consumo de Materiais** | Total | Total | Registro de Itens | - |
| **Gestão de Contratos e Saldo de Empenho** | Total | Total | Leitura Básica | - |
| **Agenda de Vistorias e Laudos Preventivos** | Total | Total | Execução e Laudo | - |
| **Ouvidoria 156 (Análise e Resposta Oficial)** | Total | Total | - | - |
| **Conversão de Manifestação em OS** | Total | Total | - | - |
| **Configurações de SLA e Parâmetros** | Total | - | - | - |
| **Gestão de Usuários e Equipe Técnica** | Total | Visualização | - | - |
| **Trilha de Auditoria (AuditoriaLog)** | Total | Leitura Secretaria | - | - |

---

## 2. Cenário 1: Desenvolvimento Local (Localhost)

Criados automaticamente ao executar: `pnpm db:seed`
- **Senha Padrão Dev**: `Urboa@2026!` (ou configurável via `SEED_DEFAULT_PASSWORD`)

| Nome do Perfil | Role | Login / E-mail | Especialidade | Prédio / Atribuição | Propósito de Teste |
|---|---|---|---|---|---|
| **Administrador Raiz** | `ADMIN` | `admin@urboa.gov.br` | Sistema | Prefeitura Municipal | Testes de tenant, configuração de SLAs, logs de auditoria |
| **Mariana Alves** | `GESTOR` | `gestor@urboa.gov.br` | Zeladoria | Secretaria de Obras | Triagem de OSs, aprovação de orçamentos e contratos |
| **Carlos Silva** | `TECNICO` | `carlos.tecnico@urboa.gov.br` | ELÉTRICA | Equipe de Campo 1 | Atendimento de OS elétrica, consumo de fios/disjuntores |
| **Roberto Santos** | `TECNICO` | `roberto.tecnico@urboa.gov.br` | HIDRÁULICA | Equipe de Campo 2 | Atendimento de vazamentos, encanamento e bombas |
| **Marcos Oliveira** | `TECNICO` | `marcos.tecnico@urboa.gov.br` | PINTURA | Equipe de Campo 3 | Pintura, acabamento e laudos de fachadas |
| **Lucas Pereira** | `TECNICO` | `lucas.tecnico@urboa.gov.br` | CLIMATIZAÇÃO | Equipe de Campo 4 | Ar-condicionado de hospitais e salas de aula |
| **Profª Maria Clara** | `SOLICITANTE` | `maria.escola@urboa.gov.br` | Educação | EMEF Monteiro Lobato | Abertura de chamados escolares (lâmpada, telhado) |
| **Dr. Marcelo Ramos** | `SOLICITANTE` | `marcelo.ubs@urboa.gov.br` | Saúde | UBS Central | Chamados críticos de saúde (queda de energia, gerador) |
| **Fernanda Lima** | `SOLICITANTE` | `fernanda.prefeitura@urboa.gov.br` | Adm Geral | Paço Municipal | Chamados administrativos de rotina |

---

## 3. Cenário 2: Homologação e Testes (Staging / QA)

Criados na esteira de homologação para validação de fluxos e regressão pré-deploy.
- **Senha Padrão QA**: Gerada pelo script de seed de staging e compartilhada exclusivamente no cofre de segredos da equipe de QA.

| Nome do Perfil | Role | Login / E-mail | Finalidade nos Testes de Homologação |
|---|---|---|---|
| **QA Admin Master** | `ADMIN` | `qa.admin@urboa.gov.br` | Validar criação de novos usuários, ativação de módulos e telas de auditoria |
| **QA Gestor Obras** | `GESTOR` | `qa.gestor@urboa.gov.br` | Validar fluxos de despacho, regras de estouro de SLA e bloqueio de empenho |
| **QA Técnico Eletricista** | `TECNICO` | `qa.tecnico.eletrica@urboa.gov.br` | Validar upload de evidência fotográfica no mobile/desktop e cálculo de materiais |
| **QA Técnico Hidráulico** | `TECNICO` | `qa.tecnico.hidraulica@urboa.gov.br` | Validar pausa de OS por falta de insumo e retomada de cronômetro MTTR |
| **QA Solicitante Escola** | `SOLICITANTE` | `qa.escola@urboa.gov.br` | Testar abertura de chamados, interface simplificada e notificações |
| **QA Solicitante UBS** | `SOLICITANTE` | `qa.ubs@urboa.gov.br` | Testar abertura de chamado com prioridade URGENTE e cálculo de SLA fatal |

---

## 4. Cenário 3: Produção (Live / Município)

### 4.1. Regra Fundamental de Produção
> ⚠️ **NENHUM USUÁRIO FICTÍCIO OU DE TESTE DEVE EXISTIR NO BANCO DE PRODUÇÃO.**
> O banco de produção contém apenas os servidores públicos e técnicos cadastrados oficialmente pelos gestores da prefeitura.

### 4.2. Usuário de Inicialização (Bootstrap / Tenant Zero)
Criado uma única vez pelo script `pnpm db:seed:prod` durante a implantação inicial:
- **Nome**: Administrador do Sistema
- **E-mail**: Definido via variável de ambiente `ADMIN_INITIAL_EMAIL` (ex: `admin@prefeitura.gov.br`)
- **Senha**: Definida via variável de ambiente `ADMIN_INITIAL_PASSWORD` (mínimo de 12 caracteres, com símbolos e números).

### 4.3. Fluxo de Provisionamento de Novos Usuários em Produção
1. O Administrador inicial acessa o painel de Produção.
2. Cadastra os Gestores de cada secretaria (Saúde, Educação, Obras).
3. Cada Gestor cadastra seus técnicos de campo e vincula os diretores/solicitantes aos seus respectivos prédios públicos.
4. Toda criação de usuário gera um evento imutável na tabela `AuditoriaLog` contendo autor, data e dados cadastrais.

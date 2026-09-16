# Visão geral do produto — Todo API

## Contexto

Atividade acadêmica com objetivo de demonstrar, de ponta a ponta, a técnica de
**engenharia orientada a especificação (Spec-Driven Development — SDD)**:
escrever as especificações do sistema (o quê e por quê) antes da implementação
(o como), e usar essas especificações como fonte de verdade durante todo o
desenvolvimento.

O sistema escolhido é deliberadamente simples — uma API de lista de tarefas
(to-do list) — para que o foco da atividade fique no **processo de engenharia**
(especificar → implementar → versionar → integrar/entregar continuamente →
publicar em nuvem) e não na complexidade do domínio.

## Problema

Uma pessoa quer gerenciar uma lista de tarefas via API HTTP: criar tarefas,
listar o que falta fazer, marcar como concluída e remover tarefas que não
fazem mais sentido.

## Objetivo

Fornecer uma API REST mínima e correta para CRUD de tarefas, com:

- Especificação completa antes do código (este diretório `specs/`).
- Testes automatizados que verificam o contrato descrito nas specs.
- Containerização (Docker) para paridade entre ambiente local e produção.
- Integração contínua (CI) via GitHub Actions a cada push/PR.
- Entrega contínua (CD): a cada push na branch principal, build da imagem e
  deploy automático em uma instância AWS EC2.

## Fora de escopo

- Autenticação/autorização (é um sistema de demonstração de processo, não de
  segurança multi-usuário).
- Interface visual (frontend). A entrega é a API.
- Alta disponibilidade, múltiplas instâncias, balanceamento de carga — uma
  única instância EC2 é suficiente para o objetivo didático.

## Pilha tecnológica

| Camada | Escolha | Motivo |
|---|---|---|
| Runtime | Node.js 20 + Express | Leve, rápido de especificar/testar, sem build step |
| Persistência | Arquivo JSON em disco (`data/tasks.json`) | Sem dependência de banco externo — reduz custo e complexidade da infra AWS para o escopo da atividade |
| Testes | Jest + Supertest | Padrão de mercado para testar APIs HTTP em Node |
| Empacotamento | Docker | Mesma imagem roda local e na EC2 — elimina "funciona na minha máquina" |
| CI/CD | GitHub Actions | Requisito explícito da atividade |
| Nuvem | AWS EC2 (instância única, free tier) | Requisito explícito da atividade; EC2 é a opção mais simples/direta pedida no enunciado |

## Documentos desta pasta

1. `01-product-overview.md` — este documento.
2. `02-requirements.md` — requisitos funcionais e não funcionais.
3. `03-data-model.md` — modelo de dados da tarefa.
4. `04-api-contract.md` — contrato de cada endpoint (request/response).
5. `05-architecture.md` — arquitetura, decisões técnicas, pipeline CI/CD.
6. `06-deploy-aws.md` — plano de deploy manual na AWS EC2.

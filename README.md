# Todo API — atividade de SDD + CI/CD + AWS

API simples de lista de tarefas, desenvolvida com a técnica **Spec-Driven
Development (SDD)**: as especificações em [`specs/`](specs/) foram escritas
antes do código e são a fonte de verdade do contrato implementado.

## Documentação (ordem de leitura sugerida)

1. [specs/01-product-overview.md](specs/01-product-overview.md) — visão geral e objetivo.
2. [specs/02-requirements.md](specs/02-requirements.md) — requisitos funcionais/não funcionais.
3. [specs/03-data-model.md](specs/03-data-model.md) — modelo de dados.
4. [specs/04-api-contract.md](specs/04-api-contract.md) — contrato de cada endpoint.
5. [specs/05-architecture.md](specs/05-architecture.md) — arquitetura e pipeline CI/CD.
6. [specs/06-deploy-aws.md](specs/06-deploy-aws.md) — passo a passo de deploy na AWS EC2.

## Rodando localmente

```bash
npm install
npm test        # roda a suíte Jest + Supertest
npm start        # sobe em http://localhost:3000
```

## Rodando com Docker

```bash
docker compose up --build
curl http://localhost:3000/health
```

## Pipeline

- **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)): roda os
  testes em todo push e pull request.
- **CD** ([`.github/workflows/cd.yml`](.github/workflows/cd.yml)): a cada push
  na `main` que passar no CI, builda a imagem, publica no GitHub Container
  Registry e faz deploy via SSH na instância AWS EC2 (configuração em
  [specs/06-deploy-aws.md](specs/06-deploy-aws.md)).

## Exemplos de uso

```bash
# criar tarefa
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Estudar SDD"}'

# listar tarefas pendentes
curl "http://localhost:3000/tasks?done=false"

# concluir tarefa
curl -X PATCH http://localhost:3000/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"done":true}'

# excluir tarefa
curl -X DELETE http://localhost:3000/tasks/<id>
```

# Arquitetura

## Visão geral

```
┌─────────────┐    push/PR     ┌────────────────────┐
│  Repositório │ ─────────────▶ │   GitHub Actions   │
│    GitHub    │                │  (CI: test)        │
└─────────────┘                │  (CD: build+deploy)│
                                └─────────┬──────────┘
                                          │ SSH (só na main)
                                          ▼
                                ┌────────────────────┐
                                │   AWS EC2 (t2/t3    │
                                │   micro, free tier) │
                                │  Docker rodando a   │
                                │  imagem da API      │
                                └─────────┬──────────┘
                                          │ HTTP :3000
                                          ▼
                                     Usuário/cliente
```

## Camadas da aplicação

- `src/store.js` — camada de persistência (leitura/escrita do
  `data/tasks.json`), isolada do resto para poder ser testada e, se um dia o
  domínio crescer, trocada por um banco real sem tocar nas rotas.
- `src/routes/tasks.js` — camada HTTP: valida entrada, chama a store,
  traduz o resultado para as respostas descritas em `04-api-contract.md`.
- `src/app.js` — monta o Express, plugs de middleware (JSON parser) e as
  rotas. Exportado sem "escutar" porta nenhuma, para que os testes (Supertest)
  subam a aplicação em memória sem abrir socket real.
- `src/server.js` — único ponto que efetivamente chama `app.listen()`, lendo
  `PORT` do ambiente (RNF-05). Separado de `app.js` justamente para os testes
  não precisarem abrir uma porta de rede.
- `public/` — frontend básico (RF-10, ver `07-frontend.md`), servido como
  arquivos estáticos pelo próprio `app.js` via `express.static`. Mesma
  origem da API: sem CORS, sem servidor HTTP adicional, sem novo recurso AWS.

## Decisão: arquivo JSON em vez de banco de dados

Um banco de dados real (Postgres, MySQL) exigiria um serviço gerenciado
adicional (RDS) ou um segundo container, aumentando custo e superfície de
configuração da AWS sem agregar valor ao objetivo didático da atividade (que é
demonstrar o *processo* SDD + CI/CD, não escalabilidade de dados). O trade-off
aceito: escrita não é segura sob alta concorrência (duas requisições
simultâneas de escrita podem se sobrescrever) — irrelevante para o volume de
uso de uma demonstração acadêmica de instância única.

## Decisão: Docker como unidade de deploy

A mesma imagem Docker roda em três lugares: máquina do desenvolvedor,
pipeline de CI (para testes, opcionalmente) e a instância EC2 de produção.
Isso elimina divergência de versão do Node ou de dependências do sistema
operacional entre ambientes.

## Pipeline CI/CD (GitHub Actions)

Dois workflows, em `.github/workflows/`:

### `ci.yml` — Integração contínua

Disparado em todo `push` e `pull_request`. Passos:
1. Checkout do código.
2. Setup do Node.js 20.
3. `npm ci` (instalação determinística a partir do lockfile).
4. `npm audit --audit-level=high` — varredura de segurança das dependências
   (SCA — Software Composition Analysis). Falha o job se houver
   vulnerabilidade de severidade alta/crítica com correção disponível
   (RNF-08).
5. `npm test` (Jest + Supertest, valida o contrato da API).

Se qualquer passo falhar, o workflow falha e (em um PR) bloqueia o merge
(RNF-07).

### `cd.yml` — Entrega contínua

Disparado em `push` para a branch `main`, e só roda se o `ci.yml` daquele
commit passou (via `workflow_run`, para nunca publicar código com teste
quebrado). Passos:
1. Build da imagem Docker (local, sem publicar ainda).
2. **Scan de segurança da imagem (Trivy)** — varre a imagem construída em
   busca de vulnerabilidades conhecidas no SO base e nas dependências
   empacotadas. Severidade crítica/alta com correção disponível interrompe o
   workflow **antes do push** — nenhuma imagem vulnerável chega a ser
   publicada ou implantada (RNF-08). Vulnerabilidades sem correção disponível
   ainda (`ignore-unfixed`) não bloqueiam, pois não haveria ação possível.
3. Push da imagem (só executa se o scan passou) para o GitHub Container
   Registry (`ghcr.io`), autenticado com o `GITHUB_TOKEN` automático da
   Action — não exige nenhum segredo adicional para essa etapa.
4. Conexão via SSH na instância EC2 (usando os segredos `EC2_HOST`,
   `EC2_SSH_KEY`, `EC2_USER` configurados no repositório) e execução de um
   script remoto que: faz `docker pull` da imagem nova, para o container
   antigo e sobe o novo com o mesmo volume de dados (`data/`), preservando as
   tarefas já cadastradas (RNF-02).

Esses três segredos (`EC2_HOST`, `EC2_SSH_KEY`, `EC2_USER`) só existem depois
que a instância EC2 é criada manualmente (ver `06-deploy-aws.md`) — por isso o
CD é a última peça a ficar realmente ativa: os workflows já ficam prontos no
repositório desde o primeiro commit, mas o job de deploy só terá efeito prático
depois que os segredos forem cadastrados em Settings → Secrets and variables →
Actions do repositório no GitHub.

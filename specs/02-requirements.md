# Requisitos

## Requisitos funcionais

| ID | Requisito |
|---|---|
| RF-01 | O sistema deve permitir criar uma tarefa com um título obrigatório e uma descrição opcional. |
| RF-02 | O sistema deve permitir listar todas as tarefas cadastradas. |
| RF-03 | O sistema deve permitir listar as tarefas filtrando por status (pendente/concluída). |
| RF-04 | O sistema deve permitir consultar uma tarefa específica pelo seu identificador. |
| RF-05 | O sistema deve permitir atualizar o título e/ou a descrição de uma tarefa existente. |
| RF-06 | O sistema deve permitir marcar uma tarefa como concluída ou reabri-la (voltar a pendente). |
| RF-07 | O sistema deve permitir excluir uma tarefa. |
| RF-08 | O sistema deve responder com erro 404 ao operar sobre uma tarefa inexistente. |
| RF-09 | O sistema deve responder com erro 400 quando o título da tarefa não for informado na criação. |
| RF-10 | O sistema deve fornecer uma interface web básica (HTML/CSS/JS) que permita criar, listar, concluir/reabrir e excluir tarefas, consumindo os mesmos endpoints da API. |

## Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF-01 | A API deve expor um endpoint de verificação de saúde (`/health`) que responde 200 sem tocar no armazenamento, usado por monitoramento e pelo pipeline de deploy para confirmar que o serviço subiu. |
| RNF-02 | Os dados devem persistir entre reinicializações do processo (não apenas em memória), sobrevivendo a um restart do container. |
| RNF-03 | Toda a lógica de negócio deve ter cobertura de teste automatizado que valide o contrato descrito em `04-api-contract.md`. |
| RNF-04 | A aplicação deve ser executável via uma única imagem Docker, sem dependências externas de banco de dados. |
| RNF-05 | A porta da aplicação deve ser configurável via variável de ambiente `PORT` (necessário porque a orquestração de containers costuma injetar a porta dinamicamente). |
| RNF-06 | Todo push na branch principal deve disparar automaticamente: build, testes, build da imagem Docker e deploy na instância AWS configurada — sem etapa manual, exceto o provisionamento inicial da instância. |
| RNF-07 | Toda alteração de código deve passar pelos testes automatizados no GitHub Actions antes de poder ser mesclada — falha de teste bloqueia o CD. |
| RNF-08 | O pipeline deve varrer vulnerabilidades de segurança conhecidas antes do deploy: dependências Node (`npm audit`) no CI e a imagem Docker final (Trivy) no CD. Vulnerabilidade crítica/alta com correção disponível bloqueia o deploy. |

## Histórias de usuário (referência)

- Como usuário da API, quero criar uma tarefa informando um título, para registrar algo que preciso fazer.
- Como usuário da API, quero listar minhas tarefas pendentes, para saber o que ainda falta fazer.
- Como usuário da API, quero marcar uma tarefa como concluída, para acompanhar meu progresso.
- Como usuário da API, quero excluir uma tarefa, para remover itens que não fazem mais sentido.
- Como responsável pela operação do sistema, quero que cada push na branch principal resulte em uma nova versão publicada automaticamente, para não depender de deploy manual.

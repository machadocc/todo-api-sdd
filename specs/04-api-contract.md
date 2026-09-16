# Contrato da API

Base URL local: `http://localhost:3000`. Todas as respostas são JSON.

## `GET /health`

Verifica se o processo está de pé (RNF-01). Não toca no armazenamento.

- **200** → `{ "status": "ok" }`

## `POST /tasks`

Cria uma tarefa (RF-01).

**Request body:**
```json
{ "title": "Comprar leite", "description": "opcional" }
```

- **201** → corpo: objeto `Task` completo (ver `03-data-model.md`).
- **400** → `title` ausente/vazio:
  ```json
  { "error": "title é obrigatório" }
  ```

## `GET /tasks`

Lista tarefas (RF-02, RF-03).

**Query params (opcionais):**
- `done=true` | `done=false` — filtra por status.

- **200** → array de objetos `Task` (vazio se não houver tarefas).

## `GET /tasks/:id`

Consulta uma tarefa (RF-04).

- **200** → objeto `Task`.
- **404** → `{ "error": "tarefa não encontrada" }` (RF-08).

## `PATCH /tasks/:id`

Atualiza campos de uma tarefa (RF-05, RF-06). Todos os campos do body são
opcionais; apenas os enviados são alterados.

**Request body (exemplo — concluir uma tarefa):**
```json
{ "done": true }
```

**Request body (exemplo — editar texto):**
```json
{ "title": "Novo título", "description": "Nova descrição" }
```

- **200** → objeto `Task` atualizado.
- **400** → tipo inválido em algum campo enviado (ex.: `done` não booleano, ou
  `title` enviado vazio).
- **404** → tarefa inexistente (RF-08).

## `DELETE /tasks/:id`

Remove uma tarefa (RF-07).

- **204** → sem corpo.
- **404** → tarefa inexistente (RF-08).

# Modelo de dados

## Entidade: Task

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | string (UUID v4) | sim (gerado pelo sistema) | Identificador único da tarefa. |
| `title` | string, 1–200 caracteres | sim | Título da tarefa. |
| `description` | string, até 1000 caracteres | não | Detalhamento opcional da tarefa. |
| `done` | boolean | sim (default `false`) | Se a tarefa está concluída. |
| `createdAt` | string (ISO 8601) | sim (gerado pelo sistema) | Data/hora de criação. |
| `updatedAt` | string (ISO 8601) | sim (gerado/atualizado pelo sistema) | Data/hora da última modificação. |

### Regras de validação

- `title` vazio, ausente ou só espaços em branco → rejeitar (RF-09).
- `description`, quando enviado, deve ser string (pode ser vazia).
- `done`, quando enviado em atualização, deve ser booleano.
- Campos não reconhecidos no corpo da requisição são ignorados (não geram erro).

## Persistência

Armazenamento em arquivo único `data/tasks.json`, contendo um array de
objetos `Task`. Escrita é sempre do arquivo inteiro (reescrita atômica via
arquivo temporário + rename), suficiente para o volume de uso de uma
demonstração acadêmica (não pensado para concorrência alta — ver
`05-architecture.md`).

Exemplo do arquivo:

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Estudar para a prova de Redes",
    "description": "Capítulos 4 e 5",
    "done": false,
    "createdAt": "2026-09-15T20:00:00.000Z",
    "updatedAt": "2026-09-15T20:00:00.000Z"
  }
]
```

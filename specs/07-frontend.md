# Frontend básico

Atende RF-10. Interface mínima, sem framework, servida pela própria API
(mesma origem — sem CORS, sem build step, sem infraestrutura extra na AWS).

## Estrutura

```
public/
├── index.html   # marcação da página (form + lista)
├── style.css    # estilo mínimo
└── app.js       # lógica: fetch nos endpoints de /tasks
```

Servido via `express.static` (ver `05-architecture.md`), acessível em `/`
na mesma porta da API (`http://<host>:3000/`).

## Telas / interações

Uma única tela:

1. **Formulário de criação** — campo de título (obrigatório) e descrição
   (opcional) + botão "Adicionar". Ao enviar, chama `POST /tasks` e insere o
   item no topo da lista sem recarregar a página.
2. **Filtro** — três botões: "Todas", "Pendentes", "Concluídas". Refaz o
   `GET /tasks` (com `?done=`) e re-renderiza a lista.
3. **Lista de tarefas** — cada item mostra:
   - checkbox (marcado = concluída) → `PATCH /tasks/:id` com `{ done }` ao
     alternar.
   - título e descrição.
   - botão "Excluir" → `DELETE /tasks/:id`, remove o item da lista na
     resposta 204.
4. **Estado vazio** — mensagem "Nenhuma tarefa" quando a lista filtrada
   estiver vazia.

## Fora de escopo

- Edição de título/descrição pela UI (a API já suporta via `PATCH`, mas a
  interface não expõe — mantém o frontend no nível "básico" pedido).
- Autenticação, paginação, responsividade avançada.
- Qualquer build step (bundler, transpilador) — JS puro, direto no
  navegador, consistente com o objetivo didático de manter o sistema simples.

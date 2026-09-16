const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");
const { createApp } = require("../src/app");

let dataFile;
let app;

beforeEach(() => {
  dataFile = path.join(os.tmpdir(), `tasks-test-${Date.now()}-${Math.random()}.json`);
  app = createApp({ dataFile });
});

afterEach(() => {
  if (fs.existsSync(dataFile)) fs.unlinkSync(dataFile);
});

describe("GET /health", () => {
  it("responde 200 com status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("POST /tasks", () => {
  it("cria uma tarefa com título e descrição", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Comprar leite", description: "1 litro" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: "Comprar leite",
      description: "1 litro",
      done: false,
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
  });

  it("cria uma tarefa sem descrição", async () => {
    const res = await request(app).post("/tasks").send({ title: "Só título" });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe("");
  });

  it("rejeita título ausente (RF-09)", async () => {
    const res = await request(app).post("/tasks").send({ description: "sem título" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("rejeita título vazio/em branco", async () => {
    const res = await request(app).post("/tasks").send({ title: "   " });
    expect(res.status).toBe(400);
  });
});

describe("GET /tasks", () => {
  it("lista todas as tarefas", async () => {
    await request(app).post("/tasks").send({ title: "A" });
    await request(app).post("/tasks").send({ title: "B" });

    const res = await request(app).get("/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("filtra por done=true e done=false", async () => {
    const created = await request(app).post("/tasks").send({ title: "A" });
    await request(app).post("/tasks").send({ title: "B" });
    await request(app).patch(`/tasks/${created.body.id}`).send({ done: true });

    const doneRes = await request(app).get("/tasks?done=true");
    expect(doneRes.body).toHaveLength(1);
    expect(doneRes.body[0].title).toBe("A");

    const pendingRes = await request(app).get("/tasks?done=false");
    expect(pendingRes.body).toHaveLength(1);
    expect(pendingRes.body[0].title).toBe("B");
  });
});

describe("GET /tasks/:id", () => {
  it("retorna a tarefa existente", async () => {
    const created = await request(app).post("/tasks").send({ title: "A" });
    const res = await request(app).get(`/tasks/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  it("retorna 404 para tarefa inexistente (RF-08)", async () => {
    const res = await request(app).get("/tasks/id-que-nao-existe");
    expect(res.status).toBe(404);
  });
});

describe("PATCH /tasks/:id", () => {
  it("marca como concluída e permite reabrir", async () => {
    const created = await request(app).post("/tasks").send({ title: "A" });

    const done = await request(app).patch(`/tasks/${created.body.id}`).send({ done: true });
    expect(done.status).toBe(200);
    expect(done.body.done).toBe(true);

    const reopened = await request(app).patch(`/tasks/${created.body.id}`).send({ done: false });
    expect(reopened.body.done).toBe(false);
  });

  it("atualiza título e descrição", async () => {
    const created = await request(app).post("/tasks").send({ title: "Antigo" });
    const res = await request(app)
      .patch(`/tasks/${created.body.id}`)
      .send({ title: "Novo", description: "Nova descrição" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Novo");
    expect(res.body.description).toBe("Nova descrição");
  });

  it("rejeita done não booleano", async () => {
    const created = await request(app).post("/tasks").send({ title: "A" });
    const res = await request(app).patch(`/tasks/${created.body.id}`).send({ done: "sim" });
    expect(res.status).toBe(400);
  });

  it("retorna 404 para tarefa inexistente", async () => {
    const res = await request(app).patch("/tasks/nao-existe").send({ done: true });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /tasks/:id", () => {
  it("remove a tarefa existente", async () => {
    const created = await request(app).post("/tasks").send({ title: "A" });
    const res = await request(app).delete(`/tasks/${created.body.id}`);
    expect(res.status).toBe(204);

    const getRes = await request(app).get(`/tasks/${created.body.id}`);
    expect(getRes.status).toBe(404);
  });

  it("retorna 404 para tarefa inexistente", async () => {
    const res = await request(app).delete("/tasks/nao-existe");
    expect(res.status).toBe(404);
  });
});

describe("persistência entre instâncias (RNF-02)", () => {
  it("sobrevive à recriação do app com o mesmo arquivo", async () => {
    await request(app).post("/tasks").send({ title: "Persistente" });

    const secondApp = createApp({ dataFile });
    const res = await request(secondApp).get("/tasks");
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Persistente");
  });
});

const path = require("path");
const { createApp } = require("./app");

const PORT = process.env.PORT || 3000;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "..", "data", "tasks.json");

const app = createApp({ dataFile: DATA_FILE });

app.listen(PORT, () => {
  console.log(`todo-api ouvindo na porta ${PORT}`);
});

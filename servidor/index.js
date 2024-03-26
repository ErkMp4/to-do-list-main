const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "todolist",
});

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao MySQL:", err);
  } else {
    console.log("Conexão bem-sucedida com o MySQL");
  }
});

app.post("/adicionar", (req, res) => {
  const { nome, descricao, data, situacao } = req.body;
  const sql = `INSERT INTO todolist.tarefas (nome, descricao, data, situacao) VALUES (?, ?, ?, ?)`;
  const values = [nome, descricao, data, situacao];
  connection.query(sql, values, (error, results, fields) => {
    if (error) {
      console.error("Erro ao adicionar tarefa:", error);
      res.status(500).send("Erro ao adicionar tarefa");
    } else {
      console.log("Tarefa adicionada com sucesso:", results);
      res.status(200).send("Tarefa adicionada com sucesso");
    }
  });
});

app.get("/exibir", (req, res) => {
  const sql = "SELECT id, nome, descricao, data, situacao FROM tarefas";
  connection.query(sql, (error, results) => {
    if (error) {
      throw error;
    }
    res.json(results);
  });
});

app.put("/editar/:id", (req, res) => {
  const { id } = req.params;
  const { nome, descricao } = req.body;
  const sql = "UPDATE tarefas SET nome = ?, descricao = ? WHERE id = ?";
  connection.query(sql, [nome, descricao, id], (error, results) => {
    if (error) {
      throw error;
    }
    res.json({ status: "success", message: "Tarefa editada com sucesso." });
  });
});

app.delete("/excluir/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM tarefas WHERE id = ?";
  connection.query(sql, [id], (error, results) => {
    if (error) {
      throw error;
    }
    res.json({ status: "success", message: "Tarefa excluída com sucesso." });
  });
});

app.get("/buscar", (req, res) => {
  const { descricao } = req.query;
  const sql =
    "SELECT id, nome, descricao, data, situacao FROM todolist.tarefas WHERE descricao LIKE ?";
  const searchValue = `%${descricao}%`;
  connection.query(sql, [searchValue], (error, results) => {
    if (error) {
      console.error("Erro ao buscar tarefas por descrição:", error);
      res.status(500).send("Erro ao buscar tarefas por descrição");
    } else {
      console.log("Tarefas encontradas com sucesso:", results);
      res.status(200).json(results);
    }
  });
});

app.get("/exibirOrdenadoPorData", (req, res) => {
  const sql =
    "SELECT id, nome, descricao, data, situacao FROM tarefas ORDER BY data DESC";
  connection.query(sql, (error, results) => {
    if (error) {
      console.error("Erro ao buscar tarefas ordenadas por data:", error);
      res.status(500).send("Erro ao buscar tarefas ordenadas por data");
    } else {
      console.log(
        "Tarefas ordenadas por data encontradas com sucesso:",
        results
      );
      res.status(200).json(results);
    }
  });
});

app.post("/marcarConcluido/:id", (req, res) => {
  const { id } = req.params;
  const sqlSelect = "SELECT * FROM tarefas WHERE id = ?";
  connection.query(sqlSelect, [id], (error, results) => {
    if (error) {
      console.error("Erro ao selecionar tarefa:", error);
      res.status(500).send("Erro ao selecionar tarefa");
    } else {
      if (results.length === 0) {
        res.status(404).send("Tarefa não encontrada");
      } else {
        const tarefa = results[0];
        const sqlInsertConcluida = `INSERT INTO tarefas_concluidas (id, nome, descricao, data, situacao) VALUES (?, ?, ?, ?, ?)`;
        const values = [
          tarefa.id,
          tarefa.nome,
          tarefa.descricao,
          tarefa.data,
          tarefa.situacao,
        ];
        connection.query(
          sqlInsertConcluida,
          values,
          (errorInsert, resultsInsert) => {
            if (errorInsert) {
              console.error("Erro ao adicionar tarefa concluída:", errorInsert);
              res.status(500).send("Erro ao adicionar tarefa concluída");
            } else {
              const sqlDeleteTarefa = "DELETE FROM tarefas WHERE id = ?";
              connection.query(
                sqlDeleteTarefa,
                [id],
                (errorDelete, resultsDelete) => {
                  if (errorDelete) {
                    console.error("Erro ao excluir tarefa:", errorDelete);
                    res.status(500).send("Erro ao excluir tarefa");
                  } else {
                    console.log(
                      "Tarefa marcada como concluída e movida para tarefas concluídas:",
                      tarefa
                    );
                    res
                      .status(200)
                      .json({
                        status: "success",
                        message:
                          "Tarefa marcada como concluída e movida para tarefas concluídas.",
                      });
                  }
                }
              );
            }
          }
        );
      }
    }
  });
});

app.get("/concluidas", (req, res) => {
  const sql =
    "SELECT id, nome, descricao, data, situacao FROM tarefas_concluidas";
  connection.query(sql, (error, results) => {
    if (error) {
      throw error;
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

CREATE DATABASE todolist;

USE todolist;

-- Criação da tabela tarefas
CREATE TABLE IF NOT EXISTS tarefas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(300),
    descricao VARCHAR(600),
    data DATE,
    situacao BOOLEAN
);

-- Criação da tabela tarefas_concluidas
CREATE TABLE IF NOT EXISTS tarefas_concluidas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(300),
    descricao VARCHAR(600),
    data DATE,
    situacao BOOLEAN
);

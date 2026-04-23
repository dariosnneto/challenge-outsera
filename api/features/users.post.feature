# language: pt
Funcionalidade: POST /api/users — Criação de usuários, login e registro

  @CT-A006-CRIAR-NOVO-USUARIO
  Cenário: Criar um novo usuário
    Dado que faço um POST em "/api/users" com os dados:
      | name | John        |
      | job  | QA Engineer |
    Então o status da resposta deve ser 201
    E o campo "id" deve ser uma string não vazia
    E o campo "createdAt" deve ser uma data ISO válida

  @CT-A007-REALIZAR-LOGIN-COM-CREDENCIAIS-VALIDAS
  Cenário: Realizar login com credenciais válidas
    Dado que faço um POST em "/api/login" com os dados:
      | email    | eve.holt@reqres.in |
      | password | cityslicka         |
    Então o status da resposta deve ser 200
    E o campo "token" deve ser uma string não vazia

  @CT-A008-REGISTRAR-NOVO-USUARIO
  Cenário: Registrar um novo usuário
    Dado que faço um POST em "/api/register" com os dados:
      | email    | eve.holt@reqres.in |
      | password | pistol             |
    Então o status da resposta deve ser 200
    E o campo "id" deve ser um número
    E o campo "token" deve ser uma string não vazia

  @CT-A009-CRIAR-USUARIO-COM-CORPO-VAZIO
  Cenário: Criar usuário com corpo vazio
    # reqres.in é uma API simulada que aceita qualquer body em POST e o ecoa de volta.
    # Uma API real de produção deveria retornar 400 aqui.
    Dado que faço um POST em "/api/users" com corpo vazio
    Então o status da resposta deve ser 201

  @CT-A010-REALIZAR-LOGIN-SEM-SENHA
  Cenário: Realizar login sem senha
    Dado que faço um POST em "/api/login" com os dados:
      | email | eve.holt@reqres.in |
    Então o status da resposta deve ser 400
    E o campo "error" deve ser uma string não vazia

  @CT-A011-REGISTRAR-USUARIO-COM-EMAIL-NAO-CADASTRADO
  Cenário: Registrar usuário com e-mail não cadastrado
    Dado que faço um POST em "/api/register" com os dados:
      | email    | not-a-registered@email.com |
      | password | pass                       |
    Então o status da resposta deve ser 400
    E o campo "error" deve ser uma string não vazia

  @CT-A012-REALIZAR-LOGIN-COM-SENHA-INCORRETA
  Cenário: Realizar login com senha incorreta
    # reqres.in não valida senhas — qualquer senha não vazia para um e-mail válido retorna 200.
    # Uma API real de produção deveria retornar 401 ou 400 aqui.
    Dado que faço um POST em "/api/login" com os dados:
      | email    | eve.holt@reqres.in |
      | password | wrongpassword      |
    Então o status da resposta deve ser 200
    E o campo "token" deve ser uma string não vazia

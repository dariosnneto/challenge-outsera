# language: pt
Funcionalidade: POST /api/users — Criação de usuários, login e registro

  @CT-A006-CRIAR-NOVO-USUARIO
  Cenário: Criar um novo usuário
    Dado que faço um POST em "/api/users" com os dados:
      | name | Jane Tester |
      | job  | QA Engineer |
    Então o status da resposta deve ser 201
    E o campo "id" deve ser uma string não vazia
    E o campo "createdAt" deve ser uma data ISO válida

  @CT-A007-REALIZAR-LOGIN-COM-CREDENCIAIS-VALIDAS
  Cenário: Realizar login com credenciais válidas
    # eve.holt@reqres.in é um dos e-mails pré-cadastrados no reqres.in
    Dado que faço um POST em "/api/login" com os dados:
      | email    | eve.holt@reqres.in |
      | password | cityslicka         |
    Então o status da resposta deve ser 200
    E o campo "token" deve ser uma string não vazia

  @CT-A008-REGISTRAR-NOVO-USUARIO
  Cenário: Registrar um novo usuário
    # eve.holt@reqres.in é um dos e-mails pré-cadastrados no reqres.in
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

  @CT-A010-CAMPO-OBRIGATORIO-AUSENTE
  Esquema do Cenário: POST sem campo obrigatório retorna erro 400
    Dado que faço um POST em "<endpoint>" com os dados:
      | <campo> | <valor> |
    Então o status da resposta deve ser 400
    E o campo "error" deve ser uma string não vazia

    Exemplos:
      | endpoint      | campo | valor              | descricao                          |
      | /api/login    | email | eve.holt@reqres.in | login sem senha                    |
      | /api/register | email | nao@cadastrado.com | registro com e-mail não cadastrado |

  @CT-A012-REALIZAR-LOGIN-COM-SENHA-INCORRETA
  Cenário: Realizar login com senha incorreta
    # reqres.in não valida senhas — qualquer senha não vazia para um e-mail válido retorna 200.
    # Uma API real de produção deveria retornar 401 ou 400 aqui.
    Dado que faço um POST em "/api/login" com os dados:
      | email    | eve.holt@reqres.in |
      | password | senha-incorreta    |
    Então o status da resposta deve ser 200
    E o campo "token" deve ser uma string não vazia

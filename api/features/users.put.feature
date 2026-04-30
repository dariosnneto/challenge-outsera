# language: pt
Funcionalidade: PUT e PATCH /api/users — Atualização de usuários

  @CT-A013-ATUALIZAR-USUARIO-POR-COMPLETO
  Cenário: Atualizar um usuário por completo
    Dado que faço um PUT em "/api/users/2" com os dados:
      | name | Nome Atualizado |
      | job  | QA Sênior       |
    Então o status da resposta deve ser 200
    E o campo "name" deve ser igual a "Nome Atualizado"
    E o campo "job" deve ser igual a "QA Sênior"
    E o campo "updatedAt" deve ser uma data ISO válida

  @CT-A014-ATUALIZAR-PARCIALMENTE-USUARIO
  Cenário: Atualizar parcialmente um usuário
    Dado que faço um PATCH em "/api/users/2" com os dados:
      | name | Atualização Parcial |
    Então o status da resposta deve ser 200
    E o campo "name" deve ser igual a "Atualização Parcial"
    E o campo "updatedAt" deve ser uma data ISO válida

  @CT-A015-ATUALIZAR-USUARIO-INEXISTENTE
  Cenário: Atualizar um usuário inexistente
    # reqres.in não persiste dados, portanto todo PUT retorna 200 independente do ID.
    # Uma API real de produção deveria retornar 404 para recursos inexistentes.
    Dado que faço um PUT em "/api/users/999" com os dados:
      | name | Usuário Fantasma |
      | job  | Indefinido       |
    Então o status da resposta deve ser 200
    E o campo "updatedAt" deve ser uma data ISO válida

  @CT-A016-ATUALIZAR-USUARIO-COM-CORPO-INVALIDO
  Cenário: Atualizar usuário com corpo em formato inválido
    # reqres.in aceita qualquer body e retorna 200 — documenta a tolerância do mock.
    Dado que faço um PUT em "/api/users/2" com corpo texto "conteudo-invalido"
    Então o status da resposta deve ser 200

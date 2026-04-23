# language: pt
Funcionalidade: PUT e PATCH /api/users — Atualização de usuários

  @CT024-ATUALIZAR-USUARIO-POR-COMPLETO
  Cenário: Atualizar um usuário por completo
    Dado que faço um PUT em "/api/users/2" com os dados:
      | name | Updated Name |
      | job  | Senior QA    |
    Então o status da resposta deve ser 200
    E o campo "name" deve ser igual a "Updated Name"
    E o campo "job" deve ser igual a "Senior QA"
    E o campo "updatedAt" deve ser uma data ISO válida

  @CT025-ATUALIZAR-PARCIALMENTE-USUARIO
  Cenário: Atualizar parcialmente um usuário
    Dado que faço um PATCH em "/api/users/2" com os dados:
      | name | Partial Update |
    Então o status da resposta deve ser 200
    E o campo "name" deve ser igual a "Partial Update"
    E o campo "updatedAt" deve ser uma data ISO válida

  @CT026-ATUALIZAR-USUARIO-INEXISTENTE
  Cenário: Atualizar um usuário inexistente
    # reqres.in não persiste dados, portanto todo PUT retorna 200 independente do ID.
    # Uma API real de produção deveria retornar 404 para recursos inexistentes.
    Dado que faço um PUT em "/api/users/999" com os dados:
      | name | Ghost User |
      | job  | Unknown    |
    Então o status da resposta deve ser 200
    E o campo "updatedAt" deve ser uma data ISO válida

  @CT027-ATUALIZAR-USUARIO-COM-CORPO-INVALIDO
  Cenário: Atualizar usuário com corpo em formato inválido
    # reqres.in aceita qualquer body e retorna 200 — documenta a tolerância do mock.
    Dado que faço um PUT em "/api/users/2" com corpo texto "not-json-at-all"
    Então o status da resposta deve ser 200

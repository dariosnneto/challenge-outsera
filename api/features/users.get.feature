# language: pt
Funcionalidade: GET /api/users — Consulta de usuários

  @CT012-LISTAR-USUARIOS-PAGINADOS
  Cenário: Listar usuários paginados
    Dado que faço um GET em "/api/users" com parâmetro "page" igual a "1"
    Então o status da resposta deve ser 200
    E o cabeçalho "content-type" deve conter "application/json"
    E o campo "page" deve ser igual a 1
    E o campo "total" deve ser um número
    E o campo "data" deve ser uma lista não vazia

  @CT013-BUSCAR-USUARIO-POR-ID
  Cenário: Buscar um usuário por ID
    Dado que faço um GET em "/api/users/2"
    Então o status da resposta deve ser 200
    E o campo "data.id" deve ser igual a 2
    E o campo "data.email" deve ser uma string não vazia

  @CT014-VALIDAR-PAGINACAO-COM-DADOS-DISTINTOS
  Cenário: Validar paginação com dados distintos entre páginas
    Dado que faço um GET em "/api/users" com parâmetro "page" igual a "1"
    E que faço um GET em "/api/users" com parâmetro "page" igual a "2"
    Então as páginas não devem compartilhar IDs de usuários

  @CT015-BUSCAR-USUARIO-INEXISTENTE
  Cenário: Buscar um usuário inexistente
    Dado que faço um GET em "/api/users/999"
    Então o status da resposta deve ser 404
    E o corpo da resposta deve ser um objeto vazio

  @CT016-BUSCAR-RECURSO-DESCONHECIDO
  Cenário: Buscar um recurso desconhecido
    Dado que faço um GET em "/api/unknown/999"
    Então o status da resposta deve ser 404
    E o corpo da resposta deve ser um objeto vazio

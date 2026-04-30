# language: pt
Funcionalidade: DELETE /api/users — Remoção de usuários

  @CT-A017-DELETAR-USUARIO
  Cenário: Deletar um usuário existente retorna 204 sem corpo
    Dado que faço um DELETE em "/api/users/2"
    Então o status da resposta deve ser 204
    E o corpo da resposta deve estar vazio
    E o cabeçalho "content-type" não deve estar presente

  @CT-A018-DELETAR-USUARIO-INEXISTENTE
  Esquema do Cenário: Deletar qualquer ID retorna 204 sem corpo
    # reqres.in não persiste dados nem valida IDs em DELETE.
    # Uma API real de produção deveria retornar 404 para IDs inexistentes.
    Dado que faço um DELETE em "<endpoint>"
    Então o status da resposta deve ser 204
    E o corpo da resposta deve estar vazio

    Exemplos:
      | endpoint        | descricao              |
      | /api/users/2    | usuário existente      |
      | /api/users/999  | usuário inexistente    |

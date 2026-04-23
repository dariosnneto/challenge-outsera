# language: pt
Funcionalidade: DELETE /api/users — Remoção de usuários

  @CT028-DELETAR-USUARIO
  Cenário: Deletar um usuário
    Dado que faço um DELETE em "/api/users/2"
    Então o status da resposta deve ser 204
    E o corpo da resposta deve estar vazio
    E o cabeçalho "content-type" não deve estar presente

  @CT029-DELETAR-USUARIO-INEXISTENTE
  Cenário: Deletar um usuário inexistente
    # reqres.in não persiste dados nem valida IDs em DELETE.
    # Uma API real de produção deveria retornar 404 aqui.
    Dado que faço um DELETE em "/api/users/999"
    Então o status da resposta deve ser 204
    E o corpo da resposta deve estar vazio

  @CT030-VALIDAR-AUSENCIA-CONTENT-TYPE-AO-DELETAR
  Cenário: Validar ausência de Content-Type ao deletar usuário
    # RFC 7230: uma resposta 204 não deve incluir corpo, portanto Content-Type não é esperado.
    Dado que faço um DELETE em "/api/users/2"
    Então o status da resposta deve ser 204
    E o cabeçalho "content-type" não deve estar presente

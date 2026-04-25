# language: pt

Funcionalidade: Login no aplicativo móvel
  Como usuário do My Demo App
  Quero realizar login com minhas credenciais
  Para acessar o catálogo de produtos

  @CT-M001
  Cenário: Login bem-sucedido exibe a tela de produtos
    Dado que estou na tela de login
    Quando faço login com usuário "bob@example.com" e senha "10203040"
    Então devo ver a tela de produtos

  @CT-M002
  Cenário: Login com credenciais inválidas exibe mensagem de erro
    Dado que estou na tela de login
    Quando faço login com usuário "usuario@invalido.com" e senha "senhaerrada"
    Então devo ver a mensagem de erro de login

  @CT-M003
  Cenário: Login e navegação para detalhes do produto
    Dado que estou na tela de login
    Quando faço login com usuário "bob@example.com" e senha "10203040"
    E toco no primeiro produto da lista
    Então devo ver os detalhes do produto

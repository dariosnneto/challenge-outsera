# language: pt
Funcionalidade: Login

  Contexto:
    Dado que estou na página de login

  @CT001-LOGIN-BEM-SUCEDIDO-REDIRECIONA-PARA-PAINEL
  Cenário: Login bem-sucedido redireciona para o painel
    Quando faço login com usuário "standard_user" e senha "secret_sauce"
    Então devo estar no painel

  @CT002-LOGIN-BEM-SUCEDIDO-EXIBE-TITULO-PRODUTOS
  Cenário: Login bem-sucedido exibe o título Produtos
    Quando faço login com usuário "standard_user" e senha "secret_sauce"
    Então o título da página deve ser "Products"

  @CT003-LOGIN-COM-CREDENCIAIS-INVALIDAS
  Esquema do Cenário: Login com credenciais inválidas exibe mensagem de erro
    Quando faço login com usuário "<usuario>" e senha "<senha>"
    Então devo ver uma mensagem de erro contendo "<erro>"

    Exemplos:
      | usuario         | senha        | erro                                 |
      | standard_user   | wrongpass    | Username and password do not match   |
      | nonexistent     | secret_sauce | Username and password do not match   |
      | locked_out_user | secret_sauce | Sorry, this user has been locked out |

  @CT004-LOGIN-COM-USUARIO-EM-BRANCO
  Cenário: Login com usuário em branco exibe erro de campo obrigatório
    Quando faço login com usuário "" e senha "secret_sauce"
    Então devo ver uma mensagem de erro contendo "Username is required"

  @CT005-LOGIN-COM-SENHA-EM-BRANCO
  Cenário: Login com senha em branco exibe erro de campo obrigatório
    Quando faço login com usuário "standard_user" e senha ""
    Então devo ver uma mensagem de erro contendo "Password is required"

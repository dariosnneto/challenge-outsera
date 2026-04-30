# language: pt
Funcionalidade: Login

  Contexto:
    Dado que estou na página de login

  @CT-E001-LOGIN-BEM-SUCEDIDO-REDIRECIONA-PARA-PAINEL
  Cenário: Login bem-sucedido redireciona para o painel
    Quando faço login com usuário "standard_user" e senha "secret_sauce"
    Então devo estar no painel

  @CT-E002-LOGIN-BEM-SUCEDIDO-EXIBE-TITULO-PRODUTOS
  Cenário: Login bem-sucedido exibe o título Produtos
    Quando faço login com usuário "standard_user" e senha "secret_sauce"
    Então o título da página deve ser "Products"

  @CT-E003-LOGIN-COM-CREDENCIAIS-INVALIDAS
  Esquema do Cenário: Login com credenciais inválidas exibe mensagem de erro
    Quando faço login com usuário "<usuario>" e senha "<senha>"
    Então devo ver uma mensagem de erro contendo "<erro>"

    Exemplos:
      | usuario         | senha        | erro                                 |
      | standard_user   | wrongpass    | Username and password do not match   |
      | nonexistent     | secret_sauce | Username and password do not match   |
      | locked_out_user | secret_sauce | Sorry, this user has been locked out |

  @CT-E004-LOGIN-COM-USUARIO-EM-BRANCO
  @CT-E005-LOGIN-COM-SENHA-EM-BRANCO
  Esquema do Cenário: Login com campo obrigatório em branco exibe erro
    Quando faço login com usuário "<usuario>" e senha "<senha>"
    Então devo ver uma mensagem de erro contendo "<erro>"

    Exemplos:
      | usuario       | senha        | erro                  | descricao          |
      |               | secret_sauce | Username is required  | usuário em branco  |
      | standard_user |              | Password is required  | senha em branco    |

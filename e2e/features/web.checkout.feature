# language: pt
Funcionalidade: Checkout

  Contexto:
    Dado que estou logado como "standard_user"

  @CT-E006-CHECKOUT-COMPLETO-COM-UM-PRODUTO
  Cenário: Checkout completo com um produto exibe confirmação
    Quando adiciono "Sauce Labs Backpack" ao carrinho
    E vou ao carrinho
    E prossigo para o checkout
    E preencho o formulário com nome "John", sobrenome "Doe", CEP "12345"
    E continuo para o resumo do pedido
    E finalizo o pedido
    Então devo ver a mensagem de confirmação "Thank you for your order!"

  @CT-E007-CHECKOUT-COMPLETO-COM-MULTIPLOS-PRODUTOS
  Cenário: Checkout completo com múltiplos produtos é concluído com sucesso
    Quando adiciono "Sauce Labs Backpack" ao carrinho
    E adiciono "Sauce Labs Bike Light" ao carrinho
    E vou ao carrinho
    E prossigo para o checkout
    E preencho o formulário com nome "Jane", sobrenome "Smith", CEP "67890"
    E continuo para o resumo do pedido
    E finalizo o pedido
    Então devo ver a mensagem de confirmação "Thank you for your order!"

  @CT-E008-CHECKOUT-SEM-NOME
  @CT-E009-CHECKOUT-SEM-SOBRENOME
  @CT-E010-CHECKOUT-SEM-CEP
  Esquema do Cenário: Checkout com campo obrigatório em branco exibe erro
    Quando adiciono "Sauce Labs Backpack" ao carrinho
    E vou ao carrinho
    E prossigo para o checkout
    E preencho o formulário com nome "<nome>", sobrenome "<sobrenome>", CEP "<cep>"
    E continuo para o resumo do pedido
    Então devo ver um erro de checkout contendo "<erro>"

    Exemplos:
      | nome  | sobrenome | cep   | erro                    | descricao     |
      |       | Doe       | 12345 | First Name is required  | sem nome      |
      | John  |           | 12345 | Last Name is required   | sem sobrenome |
      | John  | Doe       |       | Postal Code is required | sem CEP       |

  @CT-E011-REMOVER-PRODUTO-DO-CARRINHO
  Cenário: Remover produto do carrinho antes do checkout deixa o carrinho vazio
    Quando adiciono "Sauce Labs Backpack" ao carrinho
    E vou ao carrinho
    E removo "Sauce Labs Backpack" do carrinho
    Então o carrinho deve estar vazio

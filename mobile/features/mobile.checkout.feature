# language: pt

Funcionalidade: Formulário de checkout no aplicativo móvel
  Como usuário autenticado do My Demo App
  Quero preencher o formulário de entrega
  Para finalizar minha compra

  Contexto:
    Dado que estou autenticado com usuário "bob@example.com" e senha "10203040"
    E adicionei um produto ao carrinho
    E naveguei até o checkout

  @CT-M004
  Cenário: Preencher formulário completo e avançar para pagamento
    Quando preencho o formulário com os dados:
      | campo       | valor               |
      | fullName    | João Silva          |
      | address     | Rua das Flores, 123 |
      | city        | São Paulo           |
      | state       | SP                  |
      | zip         | 01310-100           |
      | country     | Brasil              |
    E toco em "To Payment button"
    Então devo avançar para a tela de pagamento

  @CT-M005
  Cenário: Enviar formulário sem nome completo exibe erro
    Quando toco em "To Payment button" sem preencher o formulário
    Então devo ver o erro de campo obrigatório no formulário

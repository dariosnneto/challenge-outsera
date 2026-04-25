/** Generated from: e2e\features\web.checkout.feature */
import { test } from "playwright-bdd";

test.describe("Checkout", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("que estou logado como \"standard_user\"", null, { page });
  });

  test("Checkout completo com um produto exibe confirmação", { tag: ["@CT-E006-CHECKOUT-COMPLETO-COM-UM-PRODUTO"] }, async ({ When, page, And, Then }) => {
    await When("adiciono \"Sauce Labs Backpack\" ao carrinho", null, { page });
    await And("vou ao carrinho", null, { page });
    await And("prossigo para o checkout", null, { page });
    await And("preencho o formulário com nome \"John\", sobrenome \"Doe\", CEP \"12345\"", null, { page });
    await And("continuo para o resumo do pedido", null, { page });
    await And("finalizo o pedido", null, { page });
    await Then("devo ver a mensagem de confirmação \"Thank you for your order!\"", null, { page });
  });

  test("Checkout completo com múltiplos produtos é concluído com sucesso", { tag: ["@CT-E007-CHECKOUT-COMPLETO-COM-MULTIPLOS-PRODUTOS"] }, async ({ When, page, And, Then }) => {
    await When("adiciono \"Sauce Labs Backpack\" ao carrinho", null, { page });
    await And("adiciono \"Sauce Labs Bike Light\" ao carrinho", null, { page });
    await And("vou ao carrinho", null, { page });
    await And("prossigo para o checkout", null, { page });
    await And("preencho o formulário com nome \"Jane\", sobrenome \"Smith\", CEP \"67890\"", null, { page });
    await And("continuo para o resumo do pedido", null, { page });
    await And("finalizo o pedido", null, { page });
    await Then("devo ver a mensagem de confirmação \"Thank you for your order!\"", null, { page });
  });

  test("Checkout sem nome exibe erro", { tag: ["@CT-E008-CHECKOUT-SEM-NOME"] }, async ({ When, page, And, Then }) => {
    await When("adiciono \"Sauce Labs Backpack\" ao carrinho", null, { page });
    await And("vou ao carrinho", null, { page });
    await And("prossigo para o checkout", null, { page });
    await And("preencho o formulário com nome \"\", sobrenome \"Doe\", CEP \"12345\"", null, { page });
    await And("continuo para o resumo do pedido", null, { page });
    await Then("devo ver um erro de checkout contendo \"First Name is required\"", null, { page });
  });

  test("Checkout sem sobrenome exibe erro", { tag: ["@CT-E009-CHECKOUT-SEM-SOBRENOME"] }, async ({ When, page, And, Then }) => {
    await When("adiciono \"Sauce Labs Backpack\" ao carrinho", null, { page });
    await And("vou ao carrinho", null, { page });
    await And("prossigo para o checkout", null, { page });
    await And("preencho o formulário com nome \"John\", sobrenome \"\", CEP \"12345\"", null, { page });
    await And("continuo para o resumo do pedido", null, { page });
    await Then("devo ver um erro de checkout contendo \"Last Name is required\"", null, { page });
  });

  test("Checkout sem CEP exibe erro", { tag: ["@CT-E010-CHECKOUT-SEM-CEP"] }, async ({ When, page, And, Then }) => {
    await When("adiciono \"Sauce Labs Backpack\" ao carrinho", null, { page });
    await And("vou ao carrinho", null, { page });
    await And("prossigo para o checkout", null, { page });
    await And("preencho o formulário com nome \"John\", sobrenome \"Doe\", CEP \"\"", null, { page });
    await And("continuo para o resumo do pedido", null, { page });
    await Then("devo ver um erro de checkout contendo \"Postal Code is required\"", null, { page });
  });

  test("Remover produto do carrinho antes do checkout deixa o carrinho vazio", { tag: ["@CT-E011-REMOVER-PRODUTO-DO-CARRINHO"] }, async ({ When, page, And, Then }) => {
    await When("adiciono \"Sauce Labs Backpack\" ao carrinho", null, { page });
    await And("vou ao carrinho", null, { page });
    await And("removo \"Sauce Labs Backpack\" do carrinho", null, { page });
    await Then("o carrinho deve estar vazio", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e\\features\\web.checkout.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
  $lang: ({}, use) => use("pt"),
});

const bddFileMeta = {
  "Checkout completo com um produto exibe confirmação": {"pickleLocation":"8:3","tags":["@CT-E006-CHECKOUT-COMPLETO-COM-UM-PRODUTO"],"ownTags":["@CT-E006-CHECKOUT-COMPLETO-COM-UM-PRODUTO"]},
  "Checkout completo com múltiplos produtos é concluído com sucesso": {"pickleLocation":"18:3","tags":["@CT-E007-CHECKOUT-COMPLETO-COM-MULTIPLOS-PRODUTOS"],"ownTags":["@CT-E007-CHECKOUT-COMPLETO-COM-MULTIPLOS-PRODUTOS"]},
  "Checkout sem nome exibe erro": {"pickleLocation":"29:3","tags":["@CT-E008-CHECKOUT-SEM-NOME"],"ownTags":["@CT-E008-CHECKOUT-SEM-NOME"]},
  "Checkout sem sobrenome exibe erro": {"pickleLocation":"38:3","tags":["@CT-E009-CHECKOUT-SEM-SOBRENOME"],"ownTags":["@CT-E009-CHECKOUT-SEM-SOBRENOME"]},
  "Checkout sem CEP exibe erro": {"pickleLocation":"47:3","tags":["@CT-E010-CHECKOUT-SEM-CEP"],"ownTags":["@CT-E010-CHECKOUT-SEM-CEP"]},
  "Remover produto do carrinho antes do checkout deixa o carrinho vazio": {"pickleLocation":"56:3","tags":["@CT-E011-REMOVER-PRODUTO-DO-CARRINHO"],"ownTags":["@CT-E011-REMOVER-PRODUTO-DO-CARRINHO"]},
};
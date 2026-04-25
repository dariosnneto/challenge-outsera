/** Generated from: e2e\features\web.login.feature */
import { test } from "playwright-bdd";

test.describe("Login", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("que estou na página de login", null, { page });
  });

  test("Login bem-sucedido redireciona para o painel", { tag: ["@CT-E001-LOGIN-BEM-SUCEDIDO-REDIRECIONA-PARA-PAINEL"] }, async ({ When, page, Then }) => {
    await When("faço login com usuário \"standard_user\" e senha \"secret_sauce\"", null, { page });
    await Then("devo estar no painel", null, { page });
  });

  test("Login bem-sucedido exibe o título Produtos", { tag: ["@CT-E002-LOGIN-BEM-SUCEDIDO-EXIBE-TITULO-PRODUTOS"] }, async ({ When, page, Then }) => {
    await When("faço login com usuário \"standard_user\" e senha \"secret_sauce\"", null, { page });
    await Then("o título da página deve ser \"Products\"", null, { page });
  });

  test.describe("Login com credenciais inválidas exibe mensagem de erro", () => {

    test("Example #1", { tag: ["@CT-E003-LOGIN-COM-CREDENCIAIS-INVALIDAS"] }, async ({ When, page, Then }) => {
      await When("faço login com usuário \"standard_user\" e senha \"wrongpass\"", null, { page });
      await Then("devo ver uma mensagem de erro contendo \"Username and password do not match\"", null, { page });
    });

    test("Example #2", { tag: ["@CT-E003-LOGIN-COM-CREDENCIAIS-INVALIDAS"] }, async ({ When, page, Then }) => {
      await When("faço login com usuário \"nonexistent\" e senha \"secret_sauce\"", null, { page });
      await Then("devo ver uma mensagem de erro contendo \"Username and password do not match\"", null, { page });
    });

    test("Example #3", { tag: ["@CT-E003-LOGIN-COM-CREDENCIAIS-INVALIDAS"] }, async ({ When, page, Then }) => {
      await When("faço login com usuário \"locked_out_user\" e senha \"secret_sauce\"", null, { page });
      await Then("devo ver uma mensagem de erro contendo \"Sorry, this user has been locked out\"", null, { page });
    });

  });

  test("Login com usuário em branco exibe erro de campo obrigatório", { tag: ["@CT-E004-LOGIN-COM-USUARIO-EM-BRANCO"] }, async ({ When, page, Then }) => {
    await When("faço login com usuário \"\" e senha \"secret_sauce\"", null, { page });
    await Then("devo ver uma mensagem de erro contendo \"Username is required\"", null, { page });
  });

  test("Login com senha em branco exibe erro de campo obrigatório", { tag: ["@CT-E005-LOGIN-COM-SENHA-EM-BRANCO"] }, async ({ When, page, Then }) => {
    await When("faço login com usuário \"standard_user\" e senha \"\"", null, { page });
    await Then("devo ver uma mensagem de erro contendo \"Password is required\"", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e\\features\\web.login.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
  $lang: ({}, use) => use("pt"),
});

const bddFileMeta = {
  "Login bem-sucedido redireciona para o painel": {"pickleLocation":"8:3","tags":["@CT-E001-LOGIN-BEM-SUCEDIDO-REDIRECIONA-PARA-PAINEL"],"ownTags":["@CT-E001-LOGIN-BEM-SUCEDIDO-REDIRECIONA-PARA-PAINEL"]},
  "Login bem-sucedido exibe o título Produtos": {"pickleLocation":"13:3","tags":["@CT-E002-LOGIN-BEM-SUCEDIDO-EXIBE-TITULO-PRODUTOS"],"ownTags":["@CT-E002-LOGIN-BEM-SUCEDIDO-EXIBE-TITULO-PRODUTOS"]},
  "Login com credenciais inválidas exibe mensagem de erro|Example #1": {"pickleLocation":"24:7","tags":["@CT-E003-LOGIN-COM-CREDENCIAIS-INVALIDAS"]},
  "Login com credenciais inválidas exibe mensagem de erro|Example #2": {"pickleLocation":"25:7","tags":["@CT-E003-LOGIN-COM-CREDENCIAIS-INVALIDAS"]},
  "Login com credenciais inválidas exibe mensagem de erro|Example #3": {"pickleLocation":"26:7","tags":["@CT-E003-LOGIN-COM-CREDENCIAIS-INVALIDAS"]},
  "Login com usuário em branco exibe erro de campo obrigatório": {"pickleLocation":"29:3","tags":["@CT-E004-LOGIN-COM-USUARIO-EM-BRANCO"],"ownTags":["@CT-E004-LOGIN-COM-USUARIO-EM-BRANCO"]},
  "Login com senha em branco exibe erro de campo obrigatório": {"pickleLocation":"34:3","tags":["@CT-E005-LOGIN-COM-SENHA-EM-BRANCO"],"ownTags":["@CT-E005-LOGIN-COM-SENHA-EM-BRANCO"]},
};
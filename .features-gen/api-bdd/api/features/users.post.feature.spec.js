/** Generated from: api\features\users.post.feature */
import { test } from "playwright-bdd";

test.describe("POST /api/users — Criação de usuários, login e registro", () => {

  test("Criar um novo usuário", { tag: ["@CT017-CRIAR-NOVO-USUARIO"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um POST em \"/api/users\" com os dados:", {"dataTable":{"rows":[{"cells":[{"value":"name"},{"value":"John"}]},{"cells":[{"value":"job"},{"value":"QA Engineer"}]}]}}, { request });
    await Then("o status da resposta deve ser 201", null, { request });
    await And("o campo \"id\" deve ser uma string não vazia", null, { request });
    await And("o campo \"createdAt\" deve ser uma data ISO válida", null, { request });
  });

  test("Realizar login com credenciais válidas", { tag: ["@CT018-REALIZAR-LOGIN-COM-CREDENCIAIS-VALIDAS"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um POST em \"/api/login\" com os dados:", {"dataTable":{"rows":[{"cells":[{"value":"email"},{"value":"eve.holt@reqres.in"}]},{"cells":[{"value":"password"},{"value":"cityslicka"}]}]}}, { request });
    await Then("o status da resposta deve ser 200", null, { request });
    await And("o campo \"token\" deve ser uma string não vazia", null, { request });
  });

  test("Registrar um novo usuário", { tag: ["@CT019-REGISTRAR-NOVO-USUARIO"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um POST em \"/api/register\" com os dados:", {"dataTable":{"rows":[{"cells":[{"value":"email"},{"value":"eve.holt@reqres.in"}]},{"cells":[{"value":"password"},{"value":"pistol"}]}]}}, { request });
    await Then("o status da resposta deve ser 200", null, { request });
    await And("o campo \"id\" deve ser um número", null, { request });
    await And("o campo \"token\" deve ser uma string não vazia", null, { request });
  });

  test("Criar usuário com corpo vazio", { tag: ["@CT020-CRIAR-USUARIO-COM-CORPO-VAZIO"] }, async ({ Given, request, Then }) => {
    await Given("que faço um POST em \"/api/users\" com corpo vazio", null, { request });
    await Then("o status da resposta deve ser 201", null, { request });
  });

  test("Realizar login sem senha", { tag: ["@CT021-REALIZAR-LOGIN-SEM-SENHA"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um POST em \"/api/login\" com os dados:", {"dataTable":{"rows":[{"cells":[{"value":"email"},{"value":"eve.holt@reqres.in"}]}]}}, { request });
    await Then("o status da resposta deve ser 400", null, { request });
    await And("o campo \"error\" deve ser uma string não vazia", null, { request });
  });

  test("Registrar usuário com e-mail não cadastrado", { tag: ["@CT022-REGISTRAR-USUARIO-COM-EMAIL-NAO-CADASTRADO"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um POST em \"/api/register\" com os dados:", {"dataTable":{"rows":[{"cells":[{"value":"email"},{"value":"not-a-registered@email.com"}]},{"cells":[{"value":"password"},{"value":"pass"}]}]}}, { request });
    await Then("o status da resposta deve ser 400", null, { request });
    await And("o campo \"error\" deve ser uma string não vazia", null, { request });
  });

  test("Realizar login com senha incorreta", { tag: ["@CT023-REALIZAR-LOGIN-COM-SENHA-INCORRETA"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um POST em \"/api/login\" com os dados:", {"dataTable":{"rows":[{"cells":[{"value":"email"},{"value":"eve.holt@reqres.in"}]},{"cells":[{"value":"password"},{"value":"wrongpassword"}]}]}}, { request });
    await Then("o status da resposta deve ser 200", null, { request });
    await And("o campo \"token\" deve ser uma string não vazia", null, { request });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("api\\features\\users.post.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
  $lang: ({}, use) => use("pt"),
});

const bddFileMeta = {
  "Criar um novo usuário": {"pickleLocation":"5:3","tags":["@CT017-CRIAR-NOVO-USUARIO"],"ownTags":["@CT017-CRIAR-NOVO-USUARIO"]},
  "Realizar login com credenciais válidas": {"pickleLocation":"14:3","tags":["@CT018-REALIZAR-LOGIN-COM-CREDENCIAIS-VALIDAS"],"ownTags":["@CT018-REALIZAR-LOGIN-COM-CREDENCIAIS-VALIDAS"]},
  "Registrar um novo usuário": {"pickleLocation":"22:3","tags":["@CT019-REGISTRAR-NOVO-USUARIO"],"ownTags":["@CT019-REGISTRAR-NOVO-USUARIO"]},
  "Criar usuário com corpo vazio": {"pickleLocation":"31:3","tags":["@CT020-CRIAR-USUARIO-COM-CORPO-VAZIO"],"ownTags":["@CT020-CRIAR-USUARIO-COM-CORPO-VAZIO"]},
  "Realizar login sem senha": {"pickleLocation":"38:3","tags":["@CT021-REALIZAR-LOGIN-SEM-SENHA"],"ownTags":["@CT021-REALIZAR-LOGIN-SEM-SENHA"]},
  "Registrar usuário com e-mail não cadastrado": {"pickleLocation":"45:3","tags":["@CT022-REGISTRAR-USUARIO-COM-EMAIL-NAO-CADASTRADO"],"ownTags":["@CT022-REGISTRAR-USUARIO-COM-EMAIL-NAO-CADASTRADO"]},
  "Realizar login com senha incorreta": {"pickleLocation":"53:3","tags":["@CT023-REALIZAR-LOGIN-COM-SENHA-INCORRETA"],"ownTags":["@CT023-REALIZAR-LOGIN-COM-SENHA-INCORRETA"]},
};
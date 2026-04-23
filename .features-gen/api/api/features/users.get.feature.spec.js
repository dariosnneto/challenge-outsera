/** Generated from: api\features\users.get.feature */
import { test } from "playwright-bdd";

test.describe("GET /api/users — Consulta de usuários", () => {

  test("Listar usuários paginados", { tag: ["@CT-A001-LISTAR-USUARIOS-PAGINADOS"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um GET em \"/api/users\" com parâmetro \"page\" igual a \"1\"", null, { request });
    await Then("o status da resposta deve ser 200", null, { request });
    await And("o cabeçalho \"content-type\" deve conter \"application/json\"", null, { request });
    await And("o campo \"page\" deve ser igual a 1", null, { request });
    await And("o campo \"total\" deve ser um número", null, { request });
    await And("o campo \"data\" deve ser uma lista não vazia", null, { request });
  });

  test("Buscar um usuário por ID", { tag: ["@CT-A002-BUSCAR-USUARIO-POR-ID"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um GET em \"/api/users/2\"", null, { request });
    await Then("o status da resposta deve ser 200", null, { request });
    await And("o campo \"data.id\" deve ser igual a 2", null, { request });
    await And("o campo \"data.email\" deve ser uma string não vazia", null, { request });
  });

  test("Validar paginação com dados distintos entre páginas", { tag: ["@CT-A003-VALIDAR-PAGINACAO-COM-DADOS-DISTINTOS"] }, async ({ Given, request, And, Then }) => {
    await Given("que faço um GET em \"/api/users\" com parâmetro \"page\" igual a \"1\"", null, { request });
    await And("que faço um GET em \"/api/users\" com parâmetro \"page\" igual a \"2\"", null, { request });
    await Then("as páginas não devem compartilhar IDs de usuários", null, { request });
  });

  test("Buscar um usuário inexistente", { tag: ["@CT-A004-BUSCAR-USUARIO-INEXISTENTE"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um GET em \"/api/users/999\"", null, { request });
    await Then("o status da resposta deve ser 404", null, { request });
    await And("o corpo da resposta deve ser um objeto vazio", null, { request });
  });

  test("Buscar um recurso desconhecido", { tag: ["@CT-A005-BUSCAR-RECURSO-DESCONHECIDO"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um GET em \"/api/unknown/999\"", null, { request });
    await Then("o status da resposta deve ser 404", null, { request });
    await And("o corpo da resposta deve ser um objeto vazio", null, { request });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("api\\features\\users.get.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
  $lang: ({}, use) => use("pt"),
});

const bddFileMeta = {
  "Listar usuários paginados": {"pickleLocation":"5:3","tags":["@CT-A001-LISTAR-USUARIOS-PAGINADOS"],"ownTags":["@CT-A001-LISTAR-USUARIOS-PAGINADOS"]},
  "Buscar um usuário por ID": {"pickleLocation":"14:3","tags":["@CT-A002-BUSCAR-USUARIO-POR-ID"],"ownTags":["@CT-A002-BUSCAR-USUARIO-POR-ID"]},
  "Validar paginação com dados distintos entre páginas": {"pickleLocation":"21:3","tags":["@CT-A003-VALIDAR-PAGINACAO-COM-DADOS-DISTINTOS"],"ownTags":["@CT-A003-VALIDAR-PAGINACAO-COM-DADOS-DISTINTOS"]},
  "Buscar um usuário inexistente": {"pickleLocation":"27:3","tags":["@CT-A004-BUSCAR-USUARIO-INEXISTENTE"],"ownTags":["@CT-A004-BUSCAR-USUARIO-INEXISTENTE"]},
  "Buscar um recurso desconhecido": {"pickleLocation":"33:3","tags":["@CT-A005-BUSCAR-RECURSO-DESCONHECIDO"],"ownTags":["@CT-A005-BUSCAR-RECURSO-DESCONHECIDO"]},
};
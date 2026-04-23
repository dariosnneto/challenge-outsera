/** Generated from: api\features\users.put.feature */
import { test } from "playwright-bdd";

test.describe("PUT e PATCH /api/users — Atualização de usuários", () => {

  test("Atualizar um usuário por completo", { tag: ["@CT024-ATUALIZAR-USUARIO-POR-COMPLETO"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um PUT em \"/api/users/2\" com os dados:", {"dataTable":{"rows":[{"cells":[{"value":"name"},{"value":"Updated Name"}]},{"cells":[{"value":"job"},{"value":"Senior QA"}]}]}}, { request });
    await Then("o status da resposta deve ser 200", null, { request });
    await And("o campo \"name\" deve ser igual a \"Updated Name\"", null, { request });
    await And("o campo \"job\" deve ser igual a \"Senior QA\"", null, { request });
    await And("o campo \"updatedAt\" deve ser uma data ISO válida", null, { request });
  });

  test("Atualizar parcialmente um usuário", { tag: ["@CT025-ATUALIZAR-PARCIALMENTE-USUARIO"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um PATCH em \"/api/users/2\" com os dados:", {"dataTable":{"rows":[{"cells":[{"value":"name"},{"value":"Partial Update"}]}]}}, { request });
    await Then("o status da resposta deve ser 200", null, { request });
    await And("o campo \"name\" deve ser igual a \"Partial Update\"", null, { request });
    await And("o campo \"updatedAt\" deve ser uma data ISO válida", null, { request });
  });

  test("Atualizar um usuário inexistente", { tag: ["@CT026-ATUALIZAR-USUARIO-INEXISTENTE"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um PUT em \"/api/users/999\" com os dados:", {"dataTable":{"rows":[{"cells":[{"value":"name"},{"value":"Ghost User"}]},{"cells":[{"value":"job"},{"value":"Unknown"}]}]}}, { request });
    await Then("o status da resposta deve ser 200", null, { request });
    await And("o campo \"updatedAt\" deve ser uma data ISO válida", null, { request });
  });

  test("Atualizar usuário com corpo em formato inválido", { tag: ["@CT027-ATUALIZAR-USUARIO-COM-CORPO-INVALIDO"] }, async ({ Given, request, Then }) => {
    await Given("que faço um PUT em \"/api/users/2\" com corpo texto \"not-json-at-all\"", null, { request });
    await Then("o status da resposta deve ser 200", null, { request });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("api\\features\\users.put.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
  $lang: ({}, use) => use("pt"),
});

const bddFileMeta = {
  "Atualizar um usuário por completo": {"pickleLocation":"5:3","tags":["@CT024-ATUALIZAR-USUARIO-POR-COMPLETO"],"ownTags":["@CT024-ATUALIZAR-USUARIO-POR-COMPLETO"]},
  "Atualizar parcialmente um usuário": {"pickleLocation":"15:3","tags":["@CT025-ATUALIZAR-PARCIALMENTE-USUARIO"],"ownTags":["@CT025-ATUALIZAR-PARCIALMENTE-USUARIO"]},
  "Atualizar um usuário inexistente": {"pickleLocation":"23:3","tags":["@CT026-ATUALIZAR-USUARIO-INEXISTENTE"],"ownTags":["@CT026-ATUALIZAR-USUARIO-INEXISTENTE"]},
  "Atualizar usuário com corpo em formato inválido": {"pickleLocation":"33:3","tags":["@CT027-ATUALIZAR-USUARIO-COM-CORPO-INVALIDO"],"ownTags":["@CT027-ATUALIZAR-USUARIO-COM-CORPO-INVALIDO"]},
};
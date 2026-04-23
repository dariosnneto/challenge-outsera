/** Generated from: api\features\users.delete.feature */
import { test } from "playwright-bdd";

test.describe("DELETE /api/users — Remoção de usuários", () => {

  test("Deletar um usuário", { tag: ["@CT028-DELETAR-USUARIO"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um DELETE em \"/api/users/2\"", null, { request });
    await Then("o status da resposta deve ser 204", null, { request });
    await And("o corpo da resposta deve estar vazio", null, { request });
    await And("o cabeçalho \"content-type\" não deve estar presente", null, { request });
  });

  test("Deletar um usuário inexistente", { tag: ["@CT029-DELETAR-USUARIO-INEXISTENTE"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um DELETE em \"/api/users/999\"", null, { request });
    await Then("o status da resposta deve ser 204", null, { request });
    await And("o corpo da resposta deve estar vazio", null, { request });
  });

  test("Validar ausência de Content-Type ao deletar usuário", { tag: ["@CT030-VALIDAR-AUSENCIA-CONTENT-TYPE-AO-DELETAR"] }, async ({ Given, request, Then, And }) => {
    await Given("que faço um DELETE em \"/api/users/2\"", null, { request });
    await Then("o status da resposta deve ser 204", null, { request });
    await And("o cabeçalho \"content-type\" não deve estar presente", null, { request });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("api\\features\\users.delete.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
  $lang: ({}, use) => use("pt"),
});

const bddFileMeta = {
  "Deletar um usuário": {"pickleLocation":"5:3","tags":["@CT028-DELETAR-USUARIO"],"ownTags":["@CT028-DELETAR-USUARIO"]},
  "Deletar um usuário inexistente": {"pickleLocation":"12:3","tags":["@CT029-DELETAR-USUARIO-INEXISTENTE"],"ownTags":["@CT029-DELETAR-USUARIO-INEXISTENTE"]},
  "Validar ausência de Content-Type ao deletar usuário": {"pickleLocation":"20:3","tags":["@CT030-VALIDAR-AUSENCIA-CONTENT-TYPE-AO-DELETAR"],"ownTags":["@CT030-VALIDAR-AUSENCIA-CONTENT-TYPE-AO-DELETAR"]},
};
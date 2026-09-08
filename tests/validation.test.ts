import test from "node:test";
import assert from "node:assert/strict";
import {
  ideaSchema,
  emailSchema,
  codeSchema,
  idSchema,
} from "../lib/validation";

test("ideas trim text and reject blank or oversized content", () => {
  assert.deepEqual(
    ideaSchema.parse({ title: "  Useful idea  ", description: "  Notes  " }),
    { title: "Useful idea", description: "Notes" },
  );
  for (const title of ["", "   ", "x".repeat(121)])
    assert.equal(
      ideaSchema.safeParse({ title, description: "" }).success,
      false,
    );
  assert.equal(
    ideaSchema.safeParse({ title: "Valid", description: "x".repeat(2001) })
      .success,
    false,
  );
});
test("auth inputs and record identifiers reject malformed requests", () => {
  assert.equal(emailSchema.safeParse("not-an-email").success, false);
  assert.equal(emailSchema.parse("Justus@EXAMPLE.com"), "justus@example.com");
  assert.equal(codeSchema.safeParse("123456").success, true);
  assert.equal(codeSchema.safeParse("12abc6").success, false);
  assert.equal(idSchema.safeParse("not-an-id").success, false);
});

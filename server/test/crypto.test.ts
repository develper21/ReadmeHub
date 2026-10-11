import assert from "node:assert/strict";
import test from "node:test";
import { decryptToken, encryptToken, randomToken, sha256 } from "../src/crypto.js";

test("encrypted tokens round-trip and use a fresh nonce", () => {
  const first = encryptToken("github-access-token");
  const second = encryptToken("github-access-token");

  assert.equal(decryptToken(first), "github-access-token");
  assert.notEqual(first, second);
});

test("encrypted tokens fail authentication if their tag is changed", () => {
  const [iv, encrypted, tag] = encryptToken("sensitive-token").split(":");
  const changedTag = `${tag[0] === "0" ? "1" : "0"}${tag.slice(1)}`;

  assert.throws(() => decryptToken(`${iv}:${encrypted}:${changedTag}`));
});

test("sha256 returns the expected hexadecimal digest", () => {
  assert.equal(
    sha256("hello"),
    "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  );
});

test("random tokens have the requested number of bytes encoded as hex", () => {
  assert.match(randomToken(16), /^[0-9a-f]{32}$/);
});

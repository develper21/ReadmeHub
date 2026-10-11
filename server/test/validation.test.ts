import assert from "node:assert/strict";
import test from "node:test";
import {
  chatSchema,
  generateSchema,
  issueSchema,
  loginSchema,
  parseOr400,
  registerSchema,
} from "../src/validation.js";

test("register schema accepts valid credentials and optional display name", () => {
  assert.deepEqual(
    parseOr400(registerSchema, {
      email: "reader@example.com",
      password: "secure-pass",
      displayName: "Reader",
    }),
    {
      email: "reader@example.com",
      password: "secure-pass",
      displayName: "Reader",
    },
  );
});

test("register schema rejects invalid emails and out-of-range passwords", () => {
  for (const input of [
    { email: "not-an-email", password: "secure-pass" },
    { email: "reader@example.com", password: "short" },
    { email: "reader@example.com", password: "p".repeat(129) },
  ]) {
    assert.throws(() => parseOr400(registerSchema, input), (error: Error & { status?: number }) => {
      return error.status === 400;
    });
  }
});

test("login schema rejects a missing password", () => {
  assert.throws(
    () => parseOr400(loginSchema, { email: "reader@example.com", password: "" }),
    (error: Error & { status?: number }) => error.status === 400,
  );
});

test("generate schema fills optional prompt fields with empty strings", () => {
  assert.deepEqual(parseOr400(generateSchema, { projectName: "ReadmeHub" }), {
    projectName: "ReadmeHub",
    description: "",
    techStack: "",
    repoFullName: "",
    repoUrl: "",
  });
});

test("chat schema enforces non-empty messages and a session id", () => {
  assert.throws(() => parseOr400(chatSchema, { sessionId: "", message: "Hello" }), {
    status: 400,
  });
  assert.throws(() => parseOr400(chatSchema, { sessionId: "session-1", message: "" }), {
    status: 400,
  });
});

test("issue schema defaults priority and rejects unsupported priorities", () => {
  assert.deepEqual(parseOr400(issueSchema, { title: "Broken link" }), {
    title: "Broken link",
    description: "",
    priority: "medium",
  });
  assert.throws(
    () => parseOr400(issueSchema, { title: "Broken link", priority: "urgent" }),
    { status: 400 },
  );
});

/** Local-only, real Supabase + HTTP smoke test. Never accepts a remote project. */
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { createClient } from "@supabase/supabase-js";
import { load } from "cheerio";

async function main() {
  const local = JSON.parse(
    execFileSync("pnpm", ["supabase", "status", "-o", "json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }),
  );
  assert.equal(
    new URL(local.API_URL).hostname,
    "127.0.0.1",
    "Only the local Supabase stack is allowed",
  );
  assert.equal(
    new URL(local.API_URL).port,
    "55431",
    "Use this starter's isolated test stack",
  );
  const key = local.PUBLISHABLE_KEY || local.ANON_KEY;
  const admin = createClient(local.API_URL, local.SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const publicClient = () =>
    createClient(local.API_URL, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  const alice = publicClient();
  const bob = publicClient();
  const anonymous = publicClient();
  const userIds: string[] = [];
  const run = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const aliceEmail = `alice-${run}@example.test`;
  const bobEmail = `bob-${run}@example.test`;
  let server: ReturnType<typeof spawn> | undefined;
  try {
    for (const [client, email] of [
      [alice, aliceEmail],
      [bob, bobEmail],
    ] as const) {
      const password = `local-only-${run}-Password1!`;
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      assert.equal(error, null);
      userIds.push(data.user!.id);
      assert.equal(
        (await client.auth.signInWithPassword({ email, password })).error,
        null,
      );
    }
    const { data: record, error } = await alice
      .from("ideas")
      .insert({
        title: "Private test idea",
        description: "Owner only",
        user_id: userIds[0],
      })
      .select()
      .single();
    assert.equal(error, null);
    assert.equal(
      (await alice.from("ideas").select().eq("id", record.id)).data?.length,
      1,
    );
    assert.equal(
      (await bob.from("ideas").select().eq("id", record.id)).data?.length,
      0,
    );
    assert.ok(
      (await anonymous.from("ideas").select()).error,
      "Anonymous reads are denied",
    );
    assert.ok(
      (
        await anonymous
          .from("ideas")
          .insert({ title: "Anonymous", user_id: userIds[0] })
      ).error,
    );
    assert.ok(
      (
        await bob
          .from("ideas")
          .insert({ title: "Forged owner", user_id: userIds[0] })
      ).error,
    );
    assert.equal(
      (
        await bob
          .from("ideas")
          .update({ title: "Intrusion" })
          .eq("id", record.id)
          .select()
      ).data?.length,
      0,
    );
    assert.equal(
      (await bob.from("ideas").delete().eq("id", record.id).select()).data
        ?.length,
      0,
    );
    assert.ok(
      (
        await alice
          .from("ideas")
          .update({ user_id: userIds[1] })
          .eq("id", record.id)
      ).error,
      "Ownership is immutable",
    );
    assert.ok(
      (await alice.from("ideas").insert({ title: "   ", user_id: userIds[0] }))
        .error,
    );
    assert.ok(
      (
        await alice.from("ideas").insert({
          title: "Too long",
          description: "x".repeat(2001),
          user_id: userIds[0],
        })
      ).error,
    );
    assert.equal(
      (
        await alice
          .from("ideas")
          .update({ title: "Updated" })
          .eq("id", record.id)
      ).error,
      null,
    );
    assert.equal(
      (await alice.from("ideas").select().eq("id", record.id).single()).data
        ?.title,
      "Updated",
    );
    assert.equal(
      (await alice.from("ideas").delete().eq("id", record.id)).error,
      null,
    );
    assert.equal(
      (await alice.from("ideas").select().eq("id", record.id)).data?.length,
      0,
    );
    console.log(
      "PASS: database CRUD, anonymous denial, cross-account isolation, immutable ownership and DB validation",
    );

    const env = {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: local.API_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
    };
    execFileSync("pnpm", ["build"], { env, stdio: "pipe" });
    const portProbe = createServer();
    portProbe.listen(0, "127.0.0.1");
    await once(portProbe, "listening");
    const address = portProbe.address();
    assert.ok(address && typeof address === "object");
    const port = address.port;
    await new Promise<void>((resolve) => portProbe.close(() => resolve()));
    server = spawn(
      process.execPath,
      [
        "node_modules/next/dist/bin/next",
        "start",
        "--hostname",
        "127.0.0.1",
        "--port",
        String(port),
      ],
      { env, stdio: "ignore" },
    );
    const origin = `http://127.0.0.1:${port}`;
    for (let i = 0; i < 100; i++) {
      try {
        if ((await fetch(origin)).ok) break;
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    const cookies = new Map<string, string>();
    async function request(path: string, init: RequestInit = {}) {
      const response = await fetch(`${origin}${path}`, {
        ...init,
        redirect: "manual",
        headers: {
          Cookie: [...cookies]
            .map(([name, value]) => `${name}=${value}`)
            .join("; "),
          Origin: origin,
          ...init.headers,
        },
      });
      for (const cookie of response.headers.getSetCookie()) {
        const [part] = cookie.split(";");
        const i = part.indexOf("=");
        cookies.set(part.slice(0, i), part.slice(i + 1));
      }
      return response;
    }
    async function submit(
      path: string,
      html: string,
      selector: string,
      fields: Record<string, string>,
    ) {
      const $ = load(html);
      const form = $(selector).first();
      assert.ok(form.length, `Missing form ${selector}`);
      const body = new FormData();
      form.find('input[type="hidden"]').each((_, input) => {
        body.append($(input).attr("name")!, $(input).attr("value") ?? "");
      });
      for (const [name, value] of Object.entries(fields)) body.set(name, value);
      return request(path, { method: "POST", body });
    }
    let response = await request("/ideas");
    assert.equal(response.status, 307);
    assert.equal(response.headers.get("location"), "/login");
    const login = await (await request("/login")).text();
    response = await submit("/login", login, "form", { email: aliceEmail });
    const sentHtml = await response.text();
    assert.ok(
      sentHtml.includes("Check your email"),
      "OTP request succeeds through the real Server Action",
    );
    const inbox = local.MAILPIT_URL || local.INBUCKET_URL;
    async function getCode(email: string) {
      let code = "";
      for (let attempt = 0; attempt < 30 && !code; attempt++) {
        const messages = await (await fetch(`${inbox}/api/v1/messages`)).json();
        const message = messages.messages?.find(
          (item: { To: { Address: string }[] }) =>
            item.To.some((to) => to.Address === email),
        );
        if (message) {
          const body = await (
            await fetch(`${inbox}/api/v1/message/${message.ID}`)
          ).json();
          code = String(body.Text || body.HTML).match(/\b\d{6}\b/)?.[0] ?? "";
        }
        if (!code) await new Promise((resolve) => setTimeout(resolve, 200));
      }
      assert.ok(code, "Sign-in email contains a code");
      return code;
    }
    const code = await getCode(aliceEmail);
    response = await submit(
      "/login",
      sentHtml,
      'form:has(input[name="code"])',
      { email: aliceEmail, code },
    );
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "/ideas");
    let html = await (await request("/ideas")).text();
    assert.ok(html.includes("A blank page."));
    response = await submit("/ideas", html, 'form:has(input[name="title"])', {
      title: "HTTP workflow idea",
      description: "Saved through a server action",
    });
    html = await response.text();
    assert.ok(html.includes("Idea added."));
    html = await (await request("/ideas")).text();
    assert.ok(html.includes("HTTP workflow idea"));
    const { data: saved } = await alice
      .from("ideas")
      .select()
      .eq("title", "HTTP workflow idea")
      .single();
    assert.ok(saved);
    response = await submit(
      "/ideas",
      html,
      `form:has(input[name="id"][value="${saved.id}"]):has(input[name="title"])`,
      { id: saved.id, title: "HTTP workflow edited", description: "Updated" },
    );
    assert.ok((await response.text()).includes("Changes saved."));
    html = await (await request("/ideas")).text();
    assert.ok(html.includes("HTTP workflow edited"));
    response = await submit(
      "/ideas",
      html,
      `form:has(input[name="id"][value="${saved.id}"]):not(:has(input[name="title"]))`,
      { id: saved.id },
    );
    assert.ok(response.ok);
    assert.equal(
      (await alice.from("ideas").select().eq("id", saved.id)).data?.length,
      0,
    );
    html = await (await request("/ideas")).text();
    response = await submit("/ideas", html, "header form", {});
    assert.equal(response.status, 303);
    assert.equal((await request("/ideas")).headers.get("location"), "/login");
    const newcomerEmail = `new-${run}@example.test`;
    const signupHtml = await (
      await submit("/login", await (await request("/login")).text(), "form", {
        email: newcomerEmail,
      })
    ).text();
    const { data: registered } = await admin.auth.admin.listUsers();
    const newcomer = registered.users.find(
      (user) => user.email === newcomerEmail,
    );
    assert.ok(newcomer, "First sign-in registers an account");
    userIds.push(newcomer.id);
    const signupCode = await getCode(newcomerEmail);
    const verifiedSignup = await submit(
      "/login",
      signupHtml,
      'form:has(input[name="code"])',
      { email: newcomerEmail, code: signupCode },
    );
    assert.equal(verifiedSignup.status, 303);
    assert.ok(
      (await (await request("/ideas")).text()).includes("A blank page."),
    );
    console.log(
      "PASS: first-time email-code signup and empty private workspace",
    );
    console.log(
      "PASS: production HTTP sign-in email/code, session cookies, protected route, empty state, create/read/update/delete and sign-out",
    );
  } finally {
    server?.kill("SIGTERM");
    for (const id of userIds) await admin.auth.admin.deleteUser(id);
  }
}
main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Integration test failed",
  );
  process.exitCode = 1;
});

"use client";
import { useActionState, useState } from "react";
import { requestCode, verifyCode } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, send, sending] = useActionState(requestCode, {});
  const [verified, verify, verifying] = useActionState(verifyCode, {});
  return (
    <div className="space-y-6">
      <form action={send} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium">
            Email address
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClass}
              placeholder="you@example.com"
            />
          </div>
        </div>
        <Button
          type="submit"
          size="xl"
          disabled={sending || verifying}
          className="w-full"
        >
          {sending
            ? "Sending code…"
            : sent.success
              ? "Send a new code"
              : "Email me a code"}
        </Button>
        <p aria-live="polite" className="text-sm leading-6">
          {sent.error || sent.success}
        </p>
      </form>
      {sent.success && (
        <form
          action={verify}
          className="space-y-4 border-t border-black/15 pt-6"
        >
          <input type="hidden" name="email" value={sent.email} />
          <div>
            <label htmlFor="code" className="text-sm font-medium">
              Sign-in code
            </label>
            <div className="mt-2">
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                pattern="[0-9]{6,10}"
                minLength={6}
                maxLength={10}
                className={fieldClass}
                aria-describedby="code-help"
              />
            </div>
            <p id="code-help" className="mt-2 text-sm text-charcoal">
              Use the code sent to {sent.email}.
            </p>
          </div>
          <Button
            type="submit"
            disabled={verifying || sending}
            size="xl"
            className="w-full"
          >
            {verifying ? "Signing in…" : "Open workspace"}
          </Button>
          <p role="alert" className="text-sm">
            {verified.error}
          </p>
        </form>
      )}
    </div>
  );
}

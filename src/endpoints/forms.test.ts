import assert from "node:assert/strict";
import test from "node:test";

import type { BackstageClient } from "../client.js";
import type { FormDefinition } from "../types/form.js";
import { FormService } from "./forms.js";

test("FormService reads an account-scoped public form definition", async () => {
  const form = {
    id: "f18eb17a-459c-421b-b224-b66252b37e2d",
    title: "Contact",
    type: "email",
    action: "https://backstage.example.test/api/wa/forms/form-one",
    redirect_url: null,
    recaptcha_site_key: "public-site-key",
    fields: [
      { id: "field-1", name: "email", label: "Email", type: "email", required: true, options: null, order: 0 },
    ],
  } satisfies FormDefinition;
  const requests: Array<{ path: string; options?: RequestInit }> = [];
  const client = {
    get: async (path: string, options?: RequestInit) => {
      requests.push({ path, options });
      return { data: form };
    },
  } as unknown as BackstageClient;

  const result = await new FormService(client).getFormDefinition("f18eb17a-459c-421b-b224-b66252b37e2d", { cache: "no-store" });

  assert.deepEqual(requests, [{ path: "/forms/f18eb17a-459c-421b-b224-b66252b37e2d", options: { cache: "no-store" } }]);
  assert.deepEqual(result, form);
});

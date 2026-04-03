"use client";

import { useActionState } from "react";

import { createPortfolioAction, defaultActionState } from "@/app/admin/actions";
import { FormField, FormPanel } from "@/components/ui/form-field";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type ClientOption = {
  id: string;
  displayName: string;
};

export function CreatePortfolioForm({
  clients
}: Readonly<{
  clients: ClientOption[];
}>) {
  const [state, action] = useActionState(createPortfolioAction, defaultActionState);

  return (
    <form action={action} className="space-y-4">
      {clients.length === 0 ? (
        <p className="rounded-2xl border border-[#1f4d3a]/10 bg-[#1f4d3a]/5 px-4 py-3 text-sm text-[#476457]">
          Primero crea un cliente para poder asignarle un portfolio.
        </p>
      ) : null}
      <FormPanel title="Datos del portfolio" subtitle="Una estructura simple y clara para empezar a registrar activos y movimientos.">
        <div className="space-y-4">
          <FormField label="Cliente asignado">
            <Select defaultValue={clients[0]?.id} disabled={clients.length === 0} name="clientId" required>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.displayName}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Nombre del portfolio">
              <Input name="name" placeholder="Core Wealth Portfolio" required />
            </FormField>
            <FormField label="Codigo">
              <Input name="code" placeholder="WM-CORE-01" />
            </FormField>
          </div>
          <input name="baseCurrency" type="hidden" value="ARS" />
        </div>
      </FormPanel>
      {state.message ? (
        <p className={state.status === "error" ? "text-sm text-rose-700" : "text-sm text-[#1f4d3a]"}>
          {state.message}
        </p>
      ) : null}
      <FormSubmitButton className="h-12 w-full rounded-[18px]" pendingLabel="Creando portfolio...">
        Crear portfolio
      </FormSubmitButton>
    </form>
  );
}

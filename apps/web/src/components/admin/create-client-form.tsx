"use client";

import { useActionState } from "react";

import { createClientAction, defaultActionState } from "@/app/admin/actions";
import { FormField, FormPanel } from "@/components/ui/form-field";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateClientForm() {
  const [state, action] = useActionState(createClientAction, defaultActionState);

  return (
    <form action={action} className="space-y-4">
      <FormPanel title="Identidad del cliente" subtitle="La informacion basica que define la cuenta y su presencia en el portal.">
        <div className="space-y-4">
          <FormField label="Nombre del cliente">
            <Input name="displayName" placeholder="Maria Torres Family Office" required />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Email portal" hint="Solo si va a tener acceso directo al portal.">
              <Input name="email" placeholder="cliente@dominio.com" type="email" />
            </FormField>
            <FormField label="Password inicial" hint="Temporal, luego puede ser reemplazada.">
              <Input name="portalPassword" placeholder="Password temporal" type="password" />
            </FormField>
          </div>
          <input name="baseCurrency" type="hidden" value="ARS" />
          <FormField label="Comentario inicial" hint="Opcional. Contexto comercial, perfil o lineamientos generales del asesor.">
            <Textarea name="advisorComment" placeholder="Cliente de perfil conservador, con foco en preservacion y liquidez." />
          </FormField>
        </div>
      </FormPanel>
      {state.message ? (
        <p className={state.status === "error" ? "text-sm text-rose-700" : "text-sm text-[#1f4d3a]"}>
          {state.message}
        </p>
      ) : null}
      <FormSubmitButton className="h-12 w-full rounded-[18px]" pendingLabel="Creando cliente...">
        Crear cliente
      </FormSubmitButton>
    </form>
  );
}

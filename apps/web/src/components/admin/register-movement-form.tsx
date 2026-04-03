"use client";

import { useActionState } from "react";

import { registerMovementAction, defaultActionState } from "@/app/admin/actions";
import { FormField, FormPanel } from "@/components/ui/form-field";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type PortfolioOption = {
  id: string;
  name: string;
  client: {
    displayName: string;
  };
};

export function RegisterMovementForm({
  portfolios
}: Readonly<{
  portfolios: PortfolioOption[];
}>) {
  const [state, action] = useActionState(registerMovementAction, defaultActionState);

  return (
    <form action={action} className="space-y-4">
      {portfolios.length === 0 ? (
        <p className="rounded-2xl border border-[#1f4d3a]/10 bg-[#1f4d3a]/5 px-4 py-3 text-sm text-[#476457]">
          Crea primero un portfolio para poder registrar movimientos.
        </p>
      ) : null}
      <FormPanel title="Detalle del movimiento" subtitle="Un registro limpio y trazable de cada compra, venta o ajuste del portfolio.">
        <div className="space-y-4">
          <FormField label="Portfolio">
            <Select defaultValue={portfolios[0]?.id} disabled={portfolios.length === 0} name="portfolioId" required>
              {portfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.client.displayName} · {portfolio.name}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_164px]">
            <FormField label="Activo">
              <Input name="assetName" placeholder="Apple Inc." required />
            </FormField>
            <FormField label="Ticker">
              <Input name="ticker" placeholder="AAPL o NVDA.US" />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_140px]">
            <FormField label="Clase de activo">
              <Select defaultValue="EQUITY" name="assetClass" required>
                <option value="EQUITY">Equity</option>
                <option value="BOND">Bond</option>
                <option value="FUND">Fund</option>
                <option value="ETF">ETF</option>
                <option value="CASH">Cash</option>
                <option value="ALTERNATIVE">Alternative</option>
                <option value="OTHER">Other</option>
              </Select>
            </FormField>
            <FormField label="Tipo de movimiento">
              <Select defaultValue="BUY" name="movementType" required>
                <option value="BUY">Compra</option>
                <option value="SELL">Venta</option>
                <option value="ADJUSTMENT">Ajuste</option>
                <option value="DIVIDEND">Dividendo</option>
                <option value="FEE">Fee</option>
              </Select>
            </FormField>
            <FormField label="Moneda">
              <Input defaultValue="ARS" maxLength={3} name="assetCurrency" required />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Fecha de compra / venta">
              <Input name="tradeDate" required type="date" />
            </FormField>
            <FormField label="Fecha de liquidacion">
              <Input name="settlementDate" type="date" />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Cantidad">
              <Input min="0" name="quantity" required step="0.0001" type="number" />
            </FormField>
            <FormField label="Precio">
              <Input min="0" name="price" required step="0.0001" type="number" />
            </FormField>
          </div>

          <FormField label="Notas" hint="Aclaraciones internas o contexto de la decision del asesor.">
            <Textarea name="notes" placeholder="Compra gradual para aumentar exposicion a tecnologia de calidad." />
          </FormField>

          <label className="flex min-h-[52px] items-center gap-3 rounded-[18px] border border-[#1f4d3a]/10 bg-white px-4 text-[14px] text-[#476457] shadow-[0_1px_2px_rgba(23,49,38,0.04)]">
            <input className="h-4 w-4 rounded border-[#1f4d3a]/20" name="visibleToClient" type="checkbox" />
            Mostrar este movimiento en el portal del cliente
          </label>
        </div>
      </FormPanel>
      {state.message ? (
        <p className={state.status === "error" ? "text-sm text-rose-700" : "text-sm text-[#1f4d3a]"}>
          {state.message}
        </p>
      ) : null}
      <FormSubmitButton className="h-12 w-full rounded-[18px]" pendingLabel="Registrando movimiento...">
        Registrar movimiento
      </FormSubmitButton>
    </form>
  );
}

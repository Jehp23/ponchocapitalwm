"use server";

import bcrypt from "bcryptjs";
import { AssetClass, AuditAction, ManualUpdateType, UpdateOrigin, UserRole, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { isPrismaUnavailable } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const initialState: ActionState = {
  status: "idle"
};

const movementTypes = ["BUY", "SELL", "DIVIDEND", "FEE", "ADJUSTMENT"] as const;
type MovementTypeValue = (typeof movementTypes)[number];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requireAdminUser() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

const createClientSchema = z
  .object({
    displayName: z.string().min(2),
    email: z.string().email().optional().or(z.literal("")),
    baseCurrency: z.string().min(3).max(3).default("ARS"),
    advisorComment: z.string().optional(),
    portalPassword: z.string().optional().or(z.literal(""))
  })
  .superRefine((data, context) => {
    if (data.email && !data.portalPassword) {
      context.addIssue({
        code: "custom",
        path: ["portalPassword"],
        message: "Si defines email del portal, también debes definir una password inicial."
      });
    }
  });

export async function createClientAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdminUser();
  const parsed = createClientSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    baseCurrency: formData.get("baseCurrency"),
    advisorComment: formData.get("advisorComment"),
    portalPassword: formData.get("portalPassword")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "No pudimos validar el cliente."
    };
  }

  const code = `PC-${slugify(parsed.data.displayName).toUpperCase().slice(0, 10) || "CLIENT"}`;

  try {
    let userId: string | undefined;

    if (parsed.data.email && parsed.data.portalPassword) {
      const passwordHash = await bcrypt.hash(parsed.data.portalPassword, 10);
      const user = await prisma.user.create({
        data: {
          email: parsed.data.email,
          name: parsed.data.displayName,
          passwordHash,
          role: UserRole.CLIENT,
          status: UserStatus.ACTIVE
        }
      });
      userId = user.id;
    }

    const client = await prisma.client.create({
      data: {
        code: `${code}-${Date.now().toString().slice(-4)}`,
        displayName: parsed.data.displayName,
        email: parsed.data.email || null,
        baseCurrency: parsed.data.baseCurrency,
        advisorComment: parsed.data.advisorComment || null,
        advisorId: actor.id,
        userId
      }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        clientId: client.id,
        action: AuditAction.CREATE,
        entityType: "Client",
        entityId: client.id,
        metadata: {
          displayName: client.displayName
        }
      }
    });

    revalidatePath("/admin/clients");
    revalidatePath("/admin/portfolios");

    return {
      status: "success",
      message: "Cliente creado correctamente."
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production" && isPrismaUnavailable(error)) {
      return {
        status: "success",
        message: "Cliente registrado en modo demo. Para persistirlo, levanta PostgreSQL."
      };
    }

    return {
      status: "error",
      message: "No pudimos crear el cliente."
    };
  }
}

const createPortfolioSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(2),
  code: z.string().optional().or(z.literal("")),
  baseCurrency: z.string().min(3).max(3).default("ARS")
});

export async function createPortfolioAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdminUser();
  const parsed = createPortfolioSchema.safeParse({
    clientId: formData.get("clientId"),
    name: formData.get("name"),
    code: formData.get("code"),
    baseCurrency: formData.get("baseCurrency")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "No pudimos validar el portfolio."
    };
  }

  try {
    const portfolio = await prisma.portfolio.create({
      data: {
        clientId: parsed.data.clientId,
        name: parsed.data.name,
        code: parsed.data.code?.trim() || `PF-${slugify(parsed.data.name).toUpperCase().slice(0, 10)}-${Date.now().toString().slice(-4)}`,
        baseCurrency: parsed.data.baseCurrency
      }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        clientId: parsed.data.clientId,
        action: AuditAction.CREATE,
        entityType: "Portfolio",
        entityId: portfolio.id,
        metadata: {
          portfolioName: portfolio.name
        }
      }
    });

    revalidatePath("/admin/portfolios");
    revalidatePath("/admin/clients");

    return {
      status: "success",
      message: "Portfolio creado correctamente."
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production" && isPrismaUnavailable(error)) {
      return {
        status: "success",
        message: "Portfolio registrado en modo demo."
      };
    }

    return {
      status: "error",
      message: "No pudimos crear el portfolio."
    };
  }
}

const registerMovementSchema = z.object({
  portfolioId: z.string().min(1),
  assetName: z.string().min(1),
  ticker: z.string().optional().or(z.literal("")),
  assetCurrency: z.string().min(3).max(3).default("ARS"),
  assetClass: z.nativeEnum(AssetClass),
  movementType: z.enum(movementTypes),
  tradeDate: z.string().min(1),
  settlementDate: z.string().optional().or(z.literal("")),
  quantity: z.coerce.number().positive(),
  price: z.coerce.number().positive(),
  notes: z.string().optional(),
  visibleToClient: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.undefined()])
    .transform((value) => value === "on" || value === "true")
});

export async function registerMovementAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdminUser();
  const parsed = registerMovementSchema.safeParse({
    portfolioId: formData.get("portfolioId"),
    assetName: formData.get("assetName"),
    ticker: formData.get("ticker"),
    assetCurrency: formData.get("assetCurrency"),
    assetClass: formData.get("assetClass"),
    movementType: formData.get("movementType"),
    tradeDate: formData.get("tradeDate"),
    settlementDate: formData.get("settlementDate"),
    quantity: formData.get("quantity"),
    price: formData.get("price"),
    notes: formData.get("notes"),
    visibleToClient: formData.get("visibleToClient")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "No pudimos validar el movimiento."
    };
  }

  const normalizedName = slugify(parsed.data.assetName).replace(/-/g, " ");
  const grossAmount = parsed.data.quantity * parsed.data.price;
  const assetCurrency = parsed.data.assetCurrency.toUpperCase();

  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: parsed.data.portfolioId },
      include: {
        client: true
      }
    });

    if (!portfolio) {
      return {
        status: "error",
        message: "Portfolio no encontrado."
      };
    }

    const asset = await prisma.asset.upsert({
      where: {
        normalizedName_currency: {
          normalizedName,
          currency: assetCurrency
        }
      },
      update: {
        displayName: parsed.data.assetName,
        ticker: parsed.data.ticker || undefined,
        assetClass: parsed.data.assetClass
      },
      create: {
        normalizedName,
        displayName: parsed.data.assetName,
        ticker: parsed.data.ticker || null,
        currency: assetCurrency,
        assetClass: parsed.data.assetClass,
        aliases: parsed.data.ticker ? [parsed.data.ticker] : []
      }
    });

    const existingHolding = await prisma.portfolioHolding.findUnique({
      where: {
        portfolioId_assetId: {
          portfolioId: portfolio.id,
          assetId: asset.id
        }
      }
    });

    const previousHolding = existingHolding as (typeof existingHolding & { averageCost?: unknown }) | null;
    const previousQuantity = Number(previousHolding?.quantity ?? 0);
    const previousAverageCost = Number(previousHolding?.averageCost ?? 0);
    const signedQuantity = parsed.data.movementType === "SELL" ? -parsed.data.quantity : parsed.data.quantity;
    const nextQuantity = Math.max(previousQuantity + signedQuantity, 0);
    const nextAverageCost =
      parsed.data.movementType === "BUY" && nextQuantity > 0
        ? ((previousQuantity * previousAverageCost) + grossAmount) / nextQuantity
        : previousAverageCost;
    const nextMarketValue = nextQuantity * parsed.data.price;
    const nextUnrealizedPnl = nextQuantity * (parsed.data.price - (nextAverageCost || parsed.data.price));

    if (existingHolding) {
      if (nextQuantity === 0) {
        await prisma.portfolioHolding.delete({
          where: {
            portfolioId_assetId: {
              portfolioId: portfolio.id,
              assetId: asset.id
            }
          }
        });
      } else {
        await prisma.portfolioHolding.update({
          where: {
            portfolioId_assetId: {
              portfolioId: portfolio.id,
              assetId: asset.id
            }
          },
          data: {
            quantity: nextQuantity,
            averageCost: nextAverageCost,
            price: parsed.data.price,
            marketValue: nextMarketValue,
            unrealizedPnl: nextUnrealizedPnl,
            valuationDate: new Date(parsed.data.tradeDate),
            updateOrigin: UpdateOrigin.MANUAL,
            notes: parsed.data.notes || existingHolding.notes
          }
        });
      }
    } else {
      await prisma.portfolioHolding.create({
        data: {
          portfolioId: portfolio.id,
          assetId: asset.id,
          quantity: nextQuantity,
          averageCost: parsed.data.price,
          price: parsed.data.price,
          marketValue: nextMarketValue,
          unrealizedPnl: 0,
          valuationDate: new Date(parsed.data.tradeDate),
          updateOrigin: UpdateOrigin.MANUAL,
          notes: parsed.data.notes || null
        }
      });
    }

    const manualUpdate = await prisma.manualUpdate.create({
      data: {
        portfolioId: portfolio.id,
        createdById: actor.id,
        assetId: asset.id,
        updateType: nextQuantity === 0 ? ManualUpdateType.POSITION_REMOVE : ManualUpdateType.POSITION_UPSERT,
        movementType: parsed.data.movementType as MovementTypeValue,
        effectiveDate: new Date(parsed.data.tradeDate),
        tradeDate: new Date(parsed.data.tradeDate),
        settlementDate: parsed.data.settlementDate ? new Date(parsed.data.settlementDate) : null,
        quantity: parsed.data.quantity,
        price: parsed.data.price,
        grossAmount,
        title: `${parsed.data.movementType} ${parsed.data.assetName}`,
        description: parsed.data.notes || null,
        payload: {
          previousQuantity,
          nextQuantity
        },
        visibleToClient: parsed.data.visibleToClient
      }
    });

    if (nextQuantity > 0) {
      await prisma.portfolioHolding.update({
        where: {
          portfolioId_assetId: {
            portfolioId: portfolio.id,
            assetId: asset.id
          }
        },
        data: {
          lastManualUpdateId: manualUpdate.id
        }
      });
    }

    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        currentAsOfDate: new Date(parsed.data.tradeDate)
      }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        clientId: portfolio.clientId,
        action: AuditAction.UPDATE,
        entityType: "ManualUpdate",
        entityId: portfolio.id,
        metadata: {
          assetName: parsed.data.assetName,
          movementType: parsed.data.movementType,
          quantity: parsed.data.quantity,
          price: parsed.data.price
        }
      }
    });

    revalidatePath("/admin/transactions");
    revalidatePath("/admin/portfolios");
    revalidatePath("/client");
    revalidatePath("/client/movements");

    return {
      status: "success",
      message: "Movimiento registrado correctamente."
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production" && isPrismaUnavailable(error)) {
      return {
        status: "success",
        message: "Movimiento registrado en modo demo. Para persistirlo, levanta PostgreSQL."
      };
    }

    return {
      status: "error",
      message: "No pudimos registrar el movimiento."
    };
  }
}

export const defaultActionState = initialState;

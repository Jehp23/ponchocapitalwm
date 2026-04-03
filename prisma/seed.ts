process.loadEnvFile?.(".env");

import bcrypt from "bcryptjs";
import { PrismaClient, UserRole, UserStatus, AssetClass, ImportBatchStatus, UpdateOrigin, ManualUpdateType, MovementType, NoteVisibility, AuditAction, PortfolioVisibilityStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("PonchoAdmin123", 10);
  const clientPasswordHash = await bcrypt.hash("PonchoClient123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ponchocapital.com" },
    update: {},
    create: {
      email: "admin@ponchocapital.com",
      name: "Camila Andrade",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    }
  });

  const clientUser = await prisma.user.upsert({
    where: { email: "client@ponchocapital.com" },
    update: {},
    create: {
      email: "client@ponchocapital.com",
      name: "Santiago Varela",
      passwordHash: clientPasswordHash,
      role: UserRole.CLIENT,
      status: UserStatus.ACTIVE
    }
  });

  const client = await prisma.client.upsert({
    where: { code: "PC-001" },
    update: {},
    create: {
      code: "PC-001",
      displayName: "Santiago Varela",
      legalName: "Santiago Varela Family Portfolio",
      email: "client@ponchocapital.com",
      baseCurrency: "USD",
      advisorId: admin.id,
      userId: clientUser.id,
      advisorComment: "Estrategia defensiva con foco en preservacion y oportunidades selectivas.",
      lastPublishedAt: new Date("2026-04-01T00:00:00.000Z")
    }
  });

  const portfolio = await prisma.portfolio.upsert({
    where: { code: "SV-CORE" },
    update: {},
    create: {
      clientId: client.id,
      code: "SV-CORE",
      name: "Core Wealth Portfolio",
      baseCurrency: "USD",
      visibilityStatus: PortfolioVisibilityStatus.PUBLISHED,
      currentAsOfDate: new Date("2026-04-01T00:00:00.000Z")
    }
  });

  const [apple, treasury, cash] = await Promise.all([
    prisma.asset.upsert({
      where: { normalizedName_currency: { normalizedName: "apple inc", currency: "USD" } },
      update: {},
      create: {
        normalizedName: "apple inc",
        displayName: "Apple Inc.",
        ticker: "AAPL",
        assetClass: AssetClass.EQUITY,
        currency: "USD",
        aliases: ["APPLE", "AAPL"]
      }
    }),
    prisma.asset.upsert({
      where: { normalizedName_currency: { normalizedName: "us treasury 2030", currency: "USD" } },
      update: {},
      create: {
        normalizedName: "us treasury 2030",
        displayName: "US Treasury 2030",
        ticker: "UST2030",
        assetClass: AssetClass.BOND,
        currency: "USD",
        aliases: ["TREASURY 2030"]
      }
    }),
    prisma.asset.upsert({
      where: { normalizedName_currency: { normalizedName: "cash usd", currency: "USD" } },
      update: {},
      create: {
        normalizedName: "cash usd",
        displayName: "Cash USD",
        ticker: "USD",
        assetClass: AssetClass.CASH,
        currency: "USD",
        aliases: ["CASH"]
      }
    })
  ]);

  const batch = await prisma.importBatch.create({
    data: {
      clientId: client.id,
      portfolioId: portfolio.id,
      uploadedById: admin.id,
      fileName: "allaria_bootstrap_2026_04_01.xlsx",
      status: ImportBatchStatus.SUCCESS,
      valuationDate: new Date("2026-04-01T00:00:00.000Z"),
      processedRows: 3,
      summary: {
        createdHoldings: 3,
        importedAssets: 3
      }
    }
  });

  await prisma.importRow.createMany({
    data: [
      {
        batchId: batch.id,
        rowNumber: 2,
        rawPayload: { asset: "Apple Inc.", quantity: 120, price: 211.5, marketValue: 25380 },
        normalized: { normalizedName: "apple inc", quantity: 120, price: 211.5, marketValue: 25380 },
        status: "PROCESSED",
        errors: [],
        warnings: []
      },
      {
        batchId: batch.id,
        rowNumber: 3,
        rawPayload: { asset: "US Treasury 2030", quantity: 85, price: 101.9, marketValue: 8661.5 },
        normalized: { normalizedName: "us treasury 2030", quantity: 85, price: 101.9, marketValue: 8661.5 },
        status: "PROCESSED",
        errors: [],
        warnings: []
      },
      {
        batchId: batch.id,
        rowNumber: 4,
        rawPayload: { asset: "Cash USD", quantity: 1, price: 16240, marketValue: 16240 },
        normalized: { normalizedName: "cash usd", quantity: 1, price: 16240, marketValue: 16240 },
        status: "PROCESSED",
        errors: [],
        warnings: []
      }
    ]
  });

  await prisma.portfolioHolding.createMany({
    data: [
      {
        portfolioId: portfolio.id,
        assetId: apple.id,
        quantity: "120",
        averageCost: "186.20",
        price: "211.50",
        marketValue: "25380.00",
        unrealizedPnl: "3036.00",
        valuationDate: new Date("2026-04-01T00:00:00.000Z"),
        updateOrigin: UpdateOrigin.IMPORT,
        lastImportBatchId: batch.id
      },
      {
        portfolioId: portfolio.id,
        assetId: treasury.id,
        quantity: "85",
        averageCost: "99.40",
        price: "101.90",
        marketValue: "8661.50",
        unrealizedPnl: "212.50",
        valuationDate: new Date("2026-04-01T00:00:00.000Z"),
        updateOrigin: UpdateOrigin.IMPORT,
        lastImportBatchId: batch.id
      },
      {
        portfolioId: portfolio.id,
        assetId: cash.id,
        quantity: "1",
        averageCost: "16240.00",
        price: "16240.00",
        marketValue: "16240.00",
        unrealizedPnl: "0.00",
        valuationDate: new Date("2026-04-01T00:00:00.000Z"),
        updateOrigin: UpdateOrigin.IMPORT,
        lastImportBatchId: batch.id
      }
    ],
    skipDuplicates: true
  });

  const publishedSnapshot = await prisma.portfolioSnapshot.create({
    data: {
      portfolioId: portfolio.id,
      snapshotDate: new Date("2026-04-01T00:00:00.000Z"),
      totalValue: "50281.50",
      publishedAt: new Date("2026-04-01T12:00:00.000Z"),
      publishedById: admin.id,
      sourceLabel: "Published after initial import",
      basedOnImportId: batch.id,
      summary: {
        publishedVersion: 1,
        note: "Bootstrap inicial desde Excel de Allaria"
      }
    }
  });

  await prisma.positionSnapshot.createMany({
    data: [
      {
        snapshotId: publishedSnapshot.id,
        assetId: apple.id,
        quantity: "120",
        price: "211.50",
        marketValue: "25380.00",
        weight: "0.504762",
        sourceOrigin: UpdateOrigin.IMPORT
      },
      {
        snapshotId: publishedSnapshot.id,
        assetId: treasury.id,
        quantity: "85",
        price: "101.90",
        marketValue: "8661.50",
        weight: "0.172261",
        sourceOrigin: UpdateOrigin.IMPORT
      },
      {
        snapshotId: publishedSnapshot.id,
        assetId: cash.id,
        quantity: "1",
        price: "16240.00",
        marketValue: "16240.00",
        weight: "0.322977",
        sourceOrigin: UpdateOrigin.IMPORT
      }
    ],
    skipDuplicates: true
  });

  await prisma.manualUpdate.create({
    data: {
      portfolioId: portfolio.id,
      createdById: admin.id,
      assetId: apple.id,
      updateType: ManualUpdateType.PRICE_ADJUSTMENT,
      movementType: MovementType.BUY,
      effectiveDate: new Date("2026-04-02T00:00:00.000Z"),
      tradeDate: new Date("2026-03-29T00:00:00.000Z"),
      settlementDate: new Date("2026-03-31T00:00:00.000Z"),
      quantity: "5.00",
      price: "214.20",
      grossAmount: "1071.00",
      title: "Ajuste manual de valuacion",
      description: "Actualizacion interna posterior al cierre para reflejar informacion validada por el asesor.",
      payload: {
        previousPrice: 211.5,
        newPrice: 214.2
      },
      visibleToClient: true
    }
  });

  await prisma.advisorNote.create({
    data: {
      clientId: client.id,
      portfolioId: portfolio.id,
      authorId: admin.id,
      title: "Comentario mensual",
      body: "Mantuvimos una posicion conservadora en liquidez mientras revisamos nuevas oportunidades de ingreso gradual.",
      visibility: NoteVisibility.CLIENT_VISIBLE,
      publishedAt: new Date("2026-04-01T12:00:00.000Z")
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      clientId: client.id,
      action: AuditAction.PUBLISH,
      entityType: "PortfolioSnapshot",
      entityId: publishedSnapshot.id,
      metadata: {
        portfolioCode: portfolio.code,
        source: "initial_import"
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

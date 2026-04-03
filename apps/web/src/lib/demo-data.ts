export const demoUsers = {
  admin: {
    id: "demo-admin",
    email: "admin@ponchocapital.com",
    name: "Camila Andrade",
    role: "ADMIN" as const,
    password: "PonchoAdmin123"
  },
  client: {
    id: "demo-client-user",
    email: "client@ponchocapital.com",
    name: "Santiago Varela",
    role: "CLIENT" as const,
    password: "PonchoClient123",
    clientId: "demo-client"
  }
};

export const demoClient = {
  id: "demo-client",
  code: "PC-001",
  displayName: "Santiago Varela",
  email: "client@ponchocapital.com",
  baseCurrency: "ARS",
  advisorComment: "Estrategia defensiva con foco en preservacion y oportunidades selectivas.",
  lastPublishedAt: new Date("2026-04-01T12:00:00.000Z"),
  notes: [
    {
      id: "demo-note-1",
      title: "Comentario mensual",
      body: "Mantuvimos una posicion conservadora en liquidez mientras revisamos nuevas oportunidades de ingreso gradual."
    }
  ],
  portfolios: [
    {
      id: "demo-portfolio",
      name: "Core Wealth Portfolio",
      code: "SV-CORE",
      baseCurrency: "ARS",
      visibilityStatus: "PUBLISHED",
      currentAsOfDate: new Date("2026-04-01T00:00:00.000Z"),
      holdings: [
        {
          id: "holding-1",
          quantity: 120,
          averageCost: 186.2,
          price: 211.5,
          marketValue: 25380,
          unrealizedPnl: 3036,
          updateOrigin: "IMPORT",
          asset: { displayName: "Apple Inc.", assetClass: "EQUITY", currency: "USD" }
        },
        {
          id: "holding-2",
          quantity: 85,
          averageCost: 99.4,
          price: 101.9,
          marketValue: 8661.5,
          unrealizedPnl: 212.5,
          updateOrigin: "IMPORT",
          asset: { displayName: "US Treasury 2030", assetClass: "BOND", currency: "USD" }
        },
        {
          id: "holding-3",
          quantity: 1,
          averageCost: 16240,
          price: 16240,
          marketValue: 16240,
          unrealizedPnl: 0,
          updateOrigin: "IMPORT",
          asset: { displayName: "Cash USD", assetClass: "CASH", currency: "USD" }
        }
      ],
      snapshots: [
        {
          id: "snapshot-jan",
          snapshotDate: new Date("2026-01-31T00:00:00.000Z"),
          totalValue: 47200
        },
        {
          id: "snapshot-feb",
          snapshotDate: new Date("2026-02-28T00:00:00.000Z"),
          totalValue: 48650
        },
        {
          id: "snapshot-mar",
          snapshotDate: new Date("2026-03-31T00:00:00.000Z"),
          totalValue: 49540
        },
        {
          id: "snapshot-apr",
          snapshotDate: new Date("2026-04-01T00:00:00.000Z"),
          totalValue: 50281.5
        }
      ],
      manualUpdates: [
        {
          id: "update-1",
          title: "Ajuste manual de valuacion",
          description: "Actualizacion interna posterior al cierre para reflejar informacion validada por el asesor.",
          updateType: "PRICE_ADJUSTMENT",
          movementType: "BUY",
          effectiveDate: new Date("2026-04-02T00:00:00.000Z"),
          tradeDate: new Date("2026-03-29T00:00:00.000Z"),
          settlementDate: new Date("2026-03-31T00:00:00.000Z"),
          quantity: 5,
          price: 214.2,
          grossAmount: 1071,
          visibleToClient: true,
          createdBy: { name: "Camila Andrade" },
          asset: { displayName: "Apple Inc." }
        }
      ]
    }
  ]
};

export const demoAdminOverview = {
  clients: 1,
  portfolios: 1,
  imports: [
    {
      id: "import-1",
      fileName: "allaria_bootstrap_2026_04_01.xlsx",
      valuationDate: new Date("2026-04-01T00:00:00.000Z"),
      status: "SUCCESS",
      client: { displayName: "Santiago Varela" },
      portfolio: { name: "Core Wealth Portfolio" },
      uploadedBy: { name: "Camila Andrade" }
    }
  ],
  snapshots: [
    {
      id: "snapshot-apr",
      snapshotDate: new Date("2026-04-01T00:00:00.000Z"),
      portfolio: {
        name: "Core Wealth Portfolio",
        client: { displayName: "Santiago Varela" }
      },
      publishedBy: { name: "Camila Andrade" }
    }
  ],
  updates: [
    {
      id: "update-1",
      title: "Ajuste manual de valuacion",
      effectiveDate: new Date("2026-04-02T00:00:00.000Z"),
      portfolio: { client: { displayName: "Santiago Varela" } },
      createdBy: { name: "Camila Andrade" },
      updateType: "PRICE_ADJUSTMENT",
      movementType: "BUY",
      tradeDate: new Date("2026-03-29T00:00:00.000Z"),
      settlementDate: new Date("2026-03-31T00:00:00.000Z"),
      quantity: 5,
      price: 214.2,
      grossAmount: 1071,
      asset: { displayName: "Apple Inc." }
    }
  ],
  notes: [
    {
      id: "note-1",
      title: "Comentario mensual",
      visibility: "CLIENT_VISIBLE",
      publishedAt: new Date("2026-04-01T12:00:00.000Z"),
      client: { displayName: "Santiago Varela" },
      author: { name: "Camila Andrade" }
    }
  ]
};

export const demoAdminLists = {
  clients: [
    {
      id: "demo-client",
      displayName: "Santiago Varela",
      code: "PC-001",
      advisor: { name: "Camila Andrade" },
      portfolios: [{ id: "demo-portfolio" }]
    }
  ],
  portfolios: [
    {
      id: "demo-portfolio",
      name: "Core Wealth Portfolio",
      client: { displayName: "Santiago Varela" },
      visibilityStatus: "PUBLISHED",
      holdings: [{}, {}, {}]
    }
  ],
  users: [
    {
      id: "demo-admin",
      name: "Camila Andrade",
      email: "admin@ponchocapital.com",
      role: "ADMIN",
      status: "ACTIVE"
    },
    {
      id: "demo-client-user",
      name: "Santiago Varela",
      email: "client@ponchocapital.com",
      role: "CLIENT",
      status: "ACTIVE"
    }
  ],
  logs: [
    {
      id: "audit-1",
      action: "PUBLISH",
      entityType: "PortfolioSnapshot",
      client: { displayName: "Santiago Varela" },
      actor: { name: "Camila Andrade" },
      createdAt: new Date("2026-04-01T12:00:00.000Z")
    }
  ]
};

export function isPrismaUnavailable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return message.includes("Can't reach database server") || message.includes("Environment variable not found: DATABASE_URL");
}

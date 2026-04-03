type PositionInput = {
  assetClass: string;
  marketValue: number;
};

type ProjectionPoint = {
  label: string;
  value: number;
  annualReturn: number;
};

export function calculatePortfolioTotalValue(positions: PositionInput[]) {
  return positions.reduce((sum, position) => sum + position.marketValue, 0);
}

export function calculateAllocation(positions: PositionInput[]) {
  const total = calculatePortfolioTotalValue(positions);
  const grouped = new Map<string, number>();

  positions.forEach((position) => {
    grouped.set(position.assetClass, (grouped.get(position.assetClass) ?? 0) + position.marketValue);
  });

  return Array.from(grouped.entries()).map(([name, value]) => ({
    name,
    value,
    weight: total === 0 ? 0 : value / total
  }));
}

export function calculateSimpleReturn(currentValue: number, previousValue: number) {
  if (previousValue === 0) {
    return 0;
  }

  return (currentValue - previousValue) / previousValue;
}

export function calculateGainPercentage(currentValue: number, costBasis: number) {
  if (costBasis === 0) {
    return 0;
  }

  return (currentValue - costBasis) / costBasis;
}

export function buildPerformanceSeries(
  snapshots: Array<{
    snapshotDate: Date;
    totalValue: number;
  }>
) {
  return snapshots.map((snapshot) => ({
    label: snapshot.snapshotDate.toLocaleDateString("es-AR", { month: "short", year: "2-digit" }),
    value: snapshot.totalValue
  }));
}

export function calculateAveragePeriodicReturn(values: number[]) {
  if (values.length < 2) {
    return 0;
  }

  const returns: number[] = [];

  for (let index = 1; index < values.length; index += 1) {
    const previous = values[index - 1];
    const current = values[index];

    if (previous === 0) {
      continue;
    }

    returns.push((current - previous) / previous);
  }

  if (returns.length === 0) {
    return 0;
  }

  return returns.reduce((sum, value) => sum + value, 0) / returns.length;
}

export function annualizePeriodicReturn(periodicReturn: number, periodsPerYear: number) {
  return (1 + periodicReturn) ** periodsPerYear - 1;
}

export function projectPortfolioValue(currentValue: number, annualReturn: number, years: number) {
  return currentValue * (1 + annualReturn) ** years;
}

export function buildProjectionScenarios(currentValue: number, annualReturn: number): ProjectionPoint[] {
  const conservativeReturn = Math.max(annualReturn - 0.04, -0.12);
  const baseReturn = Math.max(Math.min(annualReturn, 0.22), -0.08);
  const dynamicReturn = Math.min(baseReturn + 0.04, 0.28);

  return [
    {
      label: "6 meses",
      value: projectPortfolioValue(currentValue, baseReturn, 0.5),
      annualReturn: baseReturn
    },
    {
      label: "12 meses",
      value: projectPortfolioValue(currentValue, baseReturn, 1),
      annualReturn: baseReturn
    },
    {
      label: "Escenario conservador",
      value: projectPortfolioValue(currentValue, conservativeReturn, 1),
      annualReturn: conservativeReturn
    },
    {
      label: "Escenario dinamico",
      value: projectPortfolioValue(currentValue, dynamicReturn, 1),
      annualReturn: dynamicReturn
    }
  ];
}

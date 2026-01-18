'use client'

import { useState, useCallback } from 'react'
import { DensityToggle, useDensityPreference, type TableDensity } from '@/components/ui/density-toggle'
import { ResultsSummary } from '@/components/dashboard/transaction-filters'
import { TransactionTable } from '@/components/dashboard/transaction-table'
import { InsiderTradesEmptyState } from './empty-state-client'
import type { InsiderTransactionWithDetails } from '@/types/database'

interface TransactionsWithDensityProps {
  transactions: InsiderTransactionWithDetails[]
  total: number
  pageStart: number
  pageEnd: number
}

export function TransactionsWithDensity({
  transactions,
  total,
  pageStart,
  pageEnd,
}: TransactionsWithDensityProps) {
  const [density, setDensity] = useDensityPreference('insider-trades-density')

  if (transactions.length === 0) {
    return (
      <div className="p-8">
        <InsiderTradesEmptyState />
      </div>
    )
  }

  return (
    <>
      {/* Results Summary Bar with Density Toggle */}
      <ResultsSummary
        start={pageStart}
        end={pageEnd}
        total={total}
        loading={false}
      >
        <DensityToggle value={density} onChange={setDensity} />
      </ResultsSummary>

      {/* Transaction Table */}
      <TransactionTable
        transactions={transactions}
        totalCount={total}
        pageStart={pageStart}
        pageEnd={pageEnd}
        showResultsSummary={false}
        expandable={true}
        maxHeight="calc(100vh - 380px)"
        density={density}
        onDensityChange={setDensity}
      />
    </>
  )
}

import { ChainId, Currency, CurrencyAmount, Ether, Percent, TradeType, Trade as V2Trade } from '@sushiswap/sdk'
import React, { useCallback, useMemo } from 'react'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../../../modals/TransactionConfirmationModal'

import { useETHBalances } from '../../../state/wallet/hooks'

import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'

import { useOutputAmount } from '../../../state/application/hooks'
import { getGasInNativeTokenPrice, getDestinationChainName } from '../../../services/umbria/fetchers/service'

import { useDispatch } from 'react-redux'
import { updateOutputAmount } from '../../../state/application/actions'
import { useEffect } from 'react'
/*
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param args either a pair of V2 trades or a pair of V3 trades
 */
function tradeMeaningfullyDiffers(
  ...args: [V2Trade<Currency, Currency, TradeType>, V2Trade<Currency, Currency, TradeType>]
): boolean {
  const [tradeA, tradeB] = args
  return false
}

export default function ConfirmSwapModal({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  minerBribe,
}: {
  isOpen: boolean
  trade: V2Trade<Currency, Currency, TradeType> | undefined
  originalTrade: V2Trade<Currency, Currency, TradeType> | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  recipient: string | null
  allowedSlippage: Percent
  minerBribe?: string
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage: string | undefined
  onDismiss: () => void
}) {
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade]
  )

  const modalHeader = useCallback(() => {
    return trade ? (
      <SwapModalHeader
        trade={trade}
        allowedSlippage={allowedSlippage}
        recipient={recipient}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
        minerBribe={minerBribe}
      />
    ) : null
  }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade])

  const modalBottom = useCallback(() => {
    return trade ? (
      <SwapModalFooter
        onConfirm={onConfirm}
        trade={trade}
        disabledConfirm={!useOutputAmount().transactionTooSmall}
        swapErrorMessage={useOutputAmount().transactionTooSmall ? swapErrorMessage : 'Transaction is too small!'}
      />
    ) : null
  }, [onConfirm, showAcceptChanges, swapErrorMessage, trade])

  // text to show while loading
  const pendingText = ''

  const pendingText2 = ''
  const confirmationContent = useCallback(
    () => (
      <ConfirmationModalContent
        title="Confirm Bridge"
        onDismiss={onDismiss}
        topContent={modalHeader}
        bottomContent={modalBottom}
      />
    ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage]
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
      pendingText2={pendingText2}
      currencyToAdd={trade?.outputAmount.currency}
    />
  )
}

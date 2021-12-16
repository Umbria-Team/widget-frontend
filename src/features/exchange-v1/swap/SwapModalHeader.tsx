import { AlertTriangle, ArrowDown } from 'react-feather'
import { Currency, Percent, TradeType, Trade as V2Trade } from '@sushiswap/sdk'
import React, { useState, useEffect } from 'react'
import { getSigner, isAddress, shortenAddress } from '../../../functions'

import { AdvancedSwapDetails } from './AdvancedSwapDetails'
import Card from '../../../components/Card'
import CurrencyLogo from '../../../components/CurrencyLogo'
import { Field } from '../../../state/swap/actions'
import { RowBetween } from '../../../components/Row'
import TradePrice from './TradePrice'
import Typography from '../../../components/Typography'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../hooks/useActiveWeb3React'
import { useLingui } from '@lingui/react'
import { useUSDCValue } from '../../../hooks/useUSDCPrice'
import { warningSeverity } from '../../../functions'
import { updateOutputAmount } from '../../../state/application/actions'
import { useDispatch } from 'react-redux'
import { getGasInNativeTokenPrice, getDestinationChainName } from '../../../services/umbria/fetchers/service'
import { useOutputAmount, useBlockNumber, useCloseModals } from '../../../state/application/hooks'
import { getNetworkLibrary } from '../../../functions/getNetworkLibrary'
import { NETWORK_ICON, NETWORK_LABEL } from '../../../config/networks'
import { useSourceChain, useDestinationChain } from '../../../state/application/hooks'

var tokenUpdated = false

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
  minerBribe,
}: {
  trade: V2Trade<Currency, Currency, TradeType>
  allowedSlippage: Percent
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
  minerBribe?: string
}) {
  const { i18n } = useLingui()

  const destinationChain = useDestinationChain()

  const [showInverted, setShowInverted] = useState<boolean>(false)

  const fiatValueInput = useUSDCValue(trade.inputAmount)
  const fiatValueOutput = useUSDCValue(trade.outputAmount)

  const feePercentage = 0.006

  const dispatch = useDispatch()

  let inputAmount = parseFloat(trade.inputAmount.toSignificant(6))
  let outputFee = inputAmount * 0.005
  const outputAmount = useOutputAmount()

  let gasAmount = 0

  let updatedBlock = 0

  let transactionTooSmall = false

  useEffect(() => {
    // Update debounced value after delay

    // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.
    getGasInNativeTokenPrice(NETWORK_LABEL[destinationChain], trade.inputAmount.currency.symbol).then(
      (costToTransferToken) => {
        if (costToTransferToken >= inputAmount) {
          transactionTooSmall = false
        } else {
          transactionTooSmall = true
        }

        let outputCurrencySymbol = trade.inputAmount.currency.symbol

        if (trade.inputAmount.currency.symbol == 'ETH') {
          outputCurrencySymbol = 'WETH (On Polygon)'
        } else if (trade.inputAmount.currency.symbol == 'WETH') {
          outputCurrencySymbol = 'ETH'
        } else if (trade.inputAmount.currency.symbol == 'MATIC') {
          outputCurrencySymbol = 'WMATIC (On Ethereum)'
        } else if (trade.inputAmount.currency.symbol == 'WMATIC') {
          outputCurrencySymbol = 'MATIC'
        }

        dispatch(
          updateOutputAmount({
            amount: costToTransferToken,
            gasFee: costToTransferToken,
            liquidityProviderFee: 0.005 * inputAmount,
            transactionTooSmall: transactionTooSmall,
            outputCurrencySymbol: outputCurrencySymbol,
          })
        )
      }
    )
  }, [])

  const priceImpactSeverity = warningSeverity(trade.priceImpact)

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CurrencyLogo currency={trade.inputAmount.currency} size={48} />
            <div className="overflow-ellipsis w-[220px] overflow-hidden font-bold text-2xl text-high-emphesis">
              {trade.inputAmount.toSignificant(6)}
            </div>
          </div>
          <div className="ml-3 text-2xl font-medium text-high-emphesis">{trade.inputAmount.currency.symbol}</div>
        </div>
        <div className="ml-3 mr-3 min-w-[24px]">
          <ArrowDown size={24} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CurrencyLogo currency={trade.inputAmount.currency} size={48} />
            <div
              className={`overflow-ellipsis w-[220px] overflow-hidden font-bold text-2xl
               'text-high-emphesis'`}
            >
              {outputAmount.transactionTooSmall ? (inputAmount - outputAmount.amount).toFixed(6) : 0}
            </div>
          </div>
          <div className="ml-3 text-2xl font-medium text-high-emphesis">{outputAmount.outputCurrencySymbol}</div>
        </div>
      </div>

      <TradePrice
        price={trade.executionPrice}
        showInverted={showInverted}
        setShowInverted={setShowInverted}
        className="px-0"
      />

      <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} minerBribe={minerBribe} />

      {recipient !== null ? (
        <div className="flex-start">
          <>
            {`Output will be sent to`}{' '}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </>
        </div>
      ) : null}
    </div>
  )
}

import { ChainId, Currency, CurrencyAmount, Ether, Percent, TradeType, Trade as V2Trade } from '@sushiswap/sdk'
import React, { useMemo } from 'react'
import { RowBetween, RowFixed } from '../../../components/Row'

import { ANALYTICS_URL } from '../../../constants'
import ExternalLink from '../../../components/ExternalLink'
import FormattedPriceImpact from './FormattedPriceImpact'
import QuestionHelper from '../../../components/QuestionHelper'
import SwapRoute from './SwapRoute'
import { computeRealizedLPFeePercent } from '../../../functions/prices'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../hooks/useActiveWeb3React'
import { useLingui } from '@lingui/react'
import { NETWORK_ICON, NETWORK_LABEL } from '../../../config/networks'

import { useOutputAmount, useSourceChain, useDestinationChain } from '../../../state/application/hooks'
import { getDestinationChainName, getSourceChainName } from '../../../services/umbria/fetchers/service'
import { getGasInNativeTokenPrice } from '../../../services/umbria/fetchers/service'
import { useDispatch } from 'react-redux'
export interface AdvancedSwapDetailsProps {
  trade?: V2Trade<Currency, Currency, TradeType>
  allowedSlippage: Percent
  minerBribe?: string
}

export function AdvancedSwapDetails({ trade, allowedSlippage, minerBribe }: AdvancedSwapDetailsProps) {
  const { i18n } = useLingui()
  const { chainId } = useActiveWeb3React()

  const formattedInputAmount = parseFloat(trade.inputAmount.toSignificant(4))
  const intermediateOutput = parseFloat(trade.inputAmount.toSignificant(4))
  const fee = intermediateOutput * 0.002

  const destinationChain = useDestinationChain()
  const sourceChain = useSourceChain()
  const dispatch = useDispatch()
  const outputAmount = useOutputAmount()

  let transactionTooSmall = false

  const { realizedLPFee, priceImpact } = useMemo(() => {
    if (!trade) return { realizedLPFee: undefined, priceImpact: undefined }

    return {}
  }, [trade])

  return !trade ? null : (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-row items-center justify-between">
        <span className="flex items-center">
          <div className="text-sm text-secondary">{`Network Fee`}</div>
          <QuestionHelper
            text={`This is an estimate of how much it will cost for us to transfer funds to you on the destination network. We calculate this amount and take the equivalent amount from your sent funds to pay for gas`}
          />
        </span>
        <p>{outputAmount.gasFee}</p>
      </div>
      <div className="flex flex-row items-center justify-between">
        <span className="flex items-center">
          <div className="text-sm text-secondary">{`Bridge Fee`}</div>
          <QuestionHelper
            text={`This is the fee that we charge for using the bridge. This goes to liquidity providers (0.6% of the transaction)`}
          />
        </span>
        <p>{outputAmount.liquidityProviderFee}</p>
      </div>

      <div className="flex flex-row items-center justify-between">
        <span className="flex items-center">
          <div className="text-sm text-secondary">{`Route`}</div>
          <QuestionHelper
            text={`The tokens will be sent from the source network and received back from us on the destination network`}
          />
        </span>
        <p>
          {NETWORK_LABEL[sourceChain]} to {NETWORK_LABEL[destinationChain]}
        </p>
      </div>

      <RowBetween>
        <RowFixed></RowFixed>
      </RowBetween>
    </div>
  )
}

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

export interface AdvancedSwapDetailsProps {
  trade?: V2Trade<Currency, Currency, TradeType>
  allowedSlippage: Percent
  minerBribe?: string
}

export function AdvancedSwapDetails({ trade, allowedSlippage, minerBribe }: AdvancedSwapDetailsProps) {
  const { i18n } = useLingui()

  const { chainId } = useActiveWeb3React()

  var otherChainId = 0

  if (chainId == 1) {
    otherChainId = 137
  } else {
    otherChainId = 1
  }

  const { realizedLPFee, priceImpact } = useMemo(() => {
    if (!trade) return { realizedLPFee: undefined, priceImpact: undefined }

    return {}
  }, [trade])

  return !trade ? null : (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-row items-center justify-between">
        <span className="flex items-center">
          <div className="text-sm text-secondary">{i18n._(t`Route`)}</div>
          <QuestionHelper
            text={i18n._(
              t`The tokens will be sent from the source network and received back from us on the destination network`
            )}
          />
        </span>
        <p>
          {NETWORK_LABEL[chainId]} to {NETWORK_LABEL[otherChainId]}
        </p>
      </div>

      <RowBetween>
        <RowFixed></RowFixed>
      </RowBetween>
    </div>
  )
}

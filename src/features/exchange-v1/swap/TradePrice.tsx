import { Currency, Price } from '@sushiswap/sdk'
import React, { useCallback } from 'react'

import Typography from '../../../components/Typography'
import { classNames } from '../../../functions'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

interface TradePriceProps {
  price: Price<Currency, Currency>
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
  className?: string
}

export default function TradePrice({ price, showInverted, setShowInverted, className }: TradePriceProps) {
  const { i18n } = useLingui()

  let formattedPrice: string

  try {
    formattedPrice = showInverted ? price.toSignificant(4) : price.invert()?.toSignificant(4)
  } catch (error) {
    formattedPrice = '0'
  }

  const label = showInverted ? `${price.quoteCurrency?.symbol}` : `${price.baseCurrency?.symbol} `

  const labelInverted = showInverted ? `${price.baseCurrency?.symbol} ` : `${price.quoteCurrency?.symbol}`

  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])

  const text = `${'1 ' + labelInverted + ' = ' + formattedPrice ?? '-'} ${label}`

  return (
    <div
      onClick={flipPrice}
      title={text}
      className={classNames(
        'flex justify-between w-full px-5 py-1 cursor-pointer rounded-b-md text-secondary hover:text-primary',
        className
      )}
    ></div>
  )
}

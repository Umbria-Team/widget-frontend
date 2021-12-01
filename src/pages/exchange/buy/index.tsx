import { ChainId, Currency, CurrencyAmount, JSBI, Token, Trade as V2Trade } from '@sushiswap/sdk'
import { ApprovalState, useApproveCallbackFromTrade } from '../../../hooks/useApproveCallback'
import { BottomGrouping, SwapCallbackError } from '../../../features/exchange-v1/swap/styleds'
import { ButtonError } from '../../../components/Button'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAllTokens, useCurrency } from '../../../hooks/Tokens'
import { useRef } from 'react'
import { BigNumber } from 'ethers'
import { hexlify } from '@ethersproject/bytes'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../../state/swap/hooks'
import {
  useExpertModeManager,
  useUserArcherETHTip,
  useUserArcherGasPrice,
  useUserArcherUseRelay,
  useUserSingleHopOnly,
  useUserSlippageTolerance,
  useUserTransactionTTL,
} from '../../../state/user/hooks'
import {
  useDestinationChain,
  useNetworkModalToggle,
  useSourceChain,
  useToggleSettingsMenu,
  useWalletModalToggle,
} from '../../../state/application/hooks'
import useWrapCallback, { WrapType } from '../../../hooks/useWrapCallback'
import { ARCHER_RELAY_URI } from '../../../config/archer'
import Button from '../../../components/Button'
import ConfirmSwapModal from '../../../features/exchange-v1/swap/ConfirmSwapModal'
import Container from '../../../components/Container'
import CurrencyInputPanel from '../../../components/CurrencyInputPanel'
import DoubleGlowShadow from '../../../components/DoubleGlowShadow'
import { Field } from '../../../state/swap/actions'
import Head from 'next/head'
import SwapHeader from '../../../features/trade/Header'
import TokenWarningModal from '../../../modals/TokenWarningModal'
import UnsupportedCurrencyFooter from '../../../features/exchange-v1/swap/UnsupportedCurrencyFooter'
import Web3Connect from '../../../components/Web3Connect'
import { computeFiatValuePriceImpact } from '../../../functions/trade'
import { maxAmountSpend } from '../../../functions/currency'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../hooks/useActiveWeb3React'
import useENSAddress from '../../../hooks/useENSAddress'
import { useLingui } from '@lingui/react'
import usePrevious from '../../../hooks/usePrevious'
import { useRouter } from 'next/router'
import { useSwapCallback } from '../../../hooks/useSwapCallback'
import { useUSDCValue } from '../../../hooks/useUSDCPrice'
import { warningSeverity } from '../../../functions/prices'
import Web3Network from '../../../components/Web3Network'
import { Contract } from 'ethers'
import { getAvailability, getMaxAssetBridge, getGasToTransfer } from '../../../services/umbria/fetchers/service'
import { BRIDGE_ADDRESS_DEFAULT, BRIDGE_PAIRS, NETWORK_LABEL } from '../../../config/networks'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { setSourceChain, setDestinationChain, setFMTPrice } from '../../../state/application/actions'
import { useDispatch } from 'react-redux'
import Typography from '../../../components/Typography'
import TradePrice from '../../../features/exchange-v1/swap/TradePrice'
import { useOutputAmount } from '../../../state/application/hooks'
import { updateOutputAmount } from '../../../state/application/actions'
import FMT_ABI from '../../../constants/abis/fmt-vendor.json'
import { useFMTPrice } from '../../../state/application/hooks'
import { getSigner } from '../../../functions'
export default function Buy() {
  const { i18n } = useLingui()

  const loadedUrlParams = useDefaultsFromURLSearch()

  const destinationChain = useDestinationChain()
  const sourceChain = useSourceChain()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken ?? false) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !Boolean(token.address in defaultTokens)
    })

  const dispatch = useDispatch()

  const { account, chainId, library } = useActiveWeb3React()

  const toggleNetworkModal = useNetworkModalToggle()

  const router = useRouter()

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()
  const toggleSettings = useToggleSettingsMenu()

  // get custom setting values for user
  const [ttl] = useUserTransactionTTL()
  const [useArcher] = useUserArcherUseRelay()
  const [archerETHTip] = useUserArcherETHTip()
  const [archerGasPrice] = useUserArcherGasPrice()
  const outputAmount = useOutputAmount()

  const fmtPrice = useFMTPrice()

  // archer
  const archerRelay = chainId ? ARCHER_RELAY_URI?.[chainId] : undefined
  // const doArcher = archerRelay !== undefined && useArcher
  const doArcher = undefined

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    allowedSlippage,
  } = useDerivedSwapInfo(doArcher)

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)

  const trade = showWrap ? undefined : v2Trade

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount,
          }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
          },
    [independentField, parsedAmount, showWrap, trade]
  )

  const fiatValueInput = useUSDCValue(parsedAmounts[Field.INPUT])
  const fiatValueOutput = useUSDCValue(parsedAmounts[Field.OUTPUT])
  const priceImpact = computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()

  const isValid = !swapInputError

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
    router.push('/swap/')
  }, [router])

  // modal and loading
  const [{ showConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toExact() ?? '',
  }

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  const routeNotFound = !trade?.route

  // check whether the user has approved the router on the input token
  const [approvalState, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage, doArcher)

  const signatureData = undefined

  // const {
  //   state: signatureState,
  //   signatureData,
  //   gatherPermitSignature,
  // } = useERC20PermitFromTrade(trade, allowedSlippage)

  const handleApprove = useCallback(async () => {
    await approveCallback()
    // if (signatureState === UseERC20PermitState.NOT_SIGNED && gatherPermitSignature) {
    //   try {
    //     await gatherPermitSignature()
    //   } catch (error) {
    //     // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
    //     if (error?.code !== 4001) {
    //       await approveCallback()
    //     }
    //   }
    // } else {
    //   await approveCallback()
    // }
  }, [approveCallback])
  // }, [approveCallback, gatherPermitSignature, signatureState])

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  const getContract = function () {
    let walletSigner = library.getSigner()

    var abi = FMT_ABI.abi

    let contract = new Contract('0x4AdB0b7929fC51d711E518E1D494def420441b7b', abi, walletSigner)

    return contract
  }

  const componentIsMounted = useRef(true)

  const calculateOutputPrice = async function () {
    let inputAmount = formattedAmounts[Field.INPUT]

    let calculatedAmount = fmtPrice.valueOf()
    let inputAmountNumber = formattedAmounts[Field.OUTPUT].valueOf()

    let totalStr = (calculatedAmount * inputAmountNumber).toString()

    formattedAmounts[Field.INPUT] = totalStr
  }

  useEffect(() => {}, [calculateOutputPrice()])

  useEffect(() => {
    async function fetchPrice() {
      let price = await getContract().tokensPerEth()

      let bg = BigNumber.from(price)
      let divisor = BigNumber.from(10).pow(18)

      let pricePer = bg.div(divisor).toNumber()

      dispatch(setFMTPrice(pricePer))
    }

    fetchPrice()
  }, [])

  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const showMaxButton = false
  const addTransaction = useTransactionAdder()

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient,
    signatureData,
    doArcher ? ttl : undefined
  )

  const handleSwap = async () => {}

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED))
  const handleConfirmDismiss = useCallback(() => {
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm,
    })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    //maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.)
  }, [maxInputAmount, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection]
  )

  const swapIsUnsupported = false

  return (
    <Container id="swap-page" className="py-4 md:py-8 lg:py-12">
      <Head>
        <title>Umbria | Narni</title>
        <meta
          key="description"
          name="description"
          content="Umbria Bridge allows for swapping of ERC20 compatible tokens across multiple networks"
        />
      </Head>
      <div className="p-4 mb-3 space-y-3">
        <Typography component="h1" variant="h2">
          {i18n._(t`Buy FMT`)}
        </Typography>
      </div>
      <DoubleGlowShadow>
        <div className="p-4 space-y-4 rounded bg-dark-900 z-1">
          <SwapHeader
            input={currencies[Field.INPUT]}
            output={currencies[Field.OUTPUT]}
            allowedSlippage={allowedSlippage}
          />

          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={null}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
            minerBribe={doArcher ? archerETHTip : undefined}
          />

          <div>
            <CurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeOutput}
              label={independentField === Field.INPUT && !showWrap ? i18n._(t`Exchange For`) : i18n._(t`Exchange For:`)}
              showMaxButton={false}
              hideBalance={false}
              fiatValue={fiatValueOutput ?? undefined}
              priceImpact={priceImpact}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              showCommonBases={true}
              id="swap-currency-output"
            />
            {Boolean(trade) && (
              <div className="p-1 -mt-2 cursor-pointer rounded-b-md bg-dark-800">
                <TradePrice
                  price={trade?.executionPrice}
                  showInverted={false}
                  setShowInverted={() => {}}
                  className="bg-dark-900"
                />
              </div>
            )}
          </div>

          <div>
            <CurrencyInputPanel
              // priceImpact={priceImpact}
              label={
                independentField === Field.OUTPUT && !showWrap ? i18n._(t`Payment Amount`) : i18n._(t`Payment Amount`)
              }
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={showMaxButton}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              fiatValue={fiatValueInput ?? undefined}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              showCommonBases={true}
              id="swap-currency-input"
            />

            <div className="p-3 rounded sm:inline"></div>
          </div>

          <BottomGrouping>
            {swapIsUnsupported ? (
              <Button color="red" size="lg" disabled>
                {i18n._(t`Unsupported Asset`)}
              </Button>
            ) : !account ? (
              <Web3Connect size="lg" color="blue" className="w-full" />
            ) : showWrap ? (
              <Button color="gradient" size="lg" disabled={Boolean(wrapInputError)} onClick={onWrap}>
                {wrapInputError ??
                  (wrapType === WrapType.WRAP
                    ? i18n._(t`Wrap`)
                    : wrapType === WrapType.UNWRAP
                    ? i18n._(t`Unwrap`)
                    : null)}
              </Button>
            ) : (
              <ButtonError
                onClick={async () => {
                  try {
                    let tx = await getContract().buyTokens({
                      from: library.getSigner()._address,
                      gasLimit: 5000000,
                      value: hexlify(2),
                    })
                  } catch (ex) {
                    console.log(ex)
                  }
                }}
                id="swap-button"
                disabled={false}
                error={isValid && !swapCallbackError}
              >
                {swapInputError ? i18n._(t`Buy`) : i18n._(t`Buy`)}
              </ButtonError>
            )}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
          </BottomGrouping>
          {/* {!swapIsUnsupported ? (
        <AdvancedSwapDetailsDropdown trade={trade} />
      ) : (
        <UnsupportedCurrencyFooter
          show={swapIsUnsupported}
          currencies={[currencies.INPUT, currencies.OUTPUT]}
        />
      )} */}

          {!swapIsUnsupported ? null : (
            <UnsupportedCurrencyFooter show={swapIsUnsupported} currencies={[currencies.INPUT, currencies.OUTPUT]} />
          )}
        </div>
      </DoubleGlowShadow>
    </Container>
  )
}

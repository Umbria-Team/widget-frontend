import { ChainId, Currency, CurrencyAmount, JSBI, Token, Trade as V2Trade } from '@sushiswap/sdk'
import { ApprovalState, useApproveCallbackFromTrade } from '../../../hooks/useApproveCallback'
import { BottomGrouping, SwapCallbackError } from '../../../features/exchange-v1/swap/styleds'
import { ButtonError } from '../../../components/Button'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAllTokens, useCurrency } from '../../../hooks/Tokens'
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
import { useIsSwapUnsupported } from '../../../hooks/useIsSwapUnsupported'
import { useLingui } from '@lingui/react'
import usePrevious from '../../../hooks/usePrevious'
import { useRouter } from 'next/router'
import { useSwapCallback } from '../../../hooks/useSwapCallback'
import { useUSDCValue } from '../../../hooks/useUSDCPrice'
import { warningSeverity } from '../../../functions/prices'
import Web3Network from '../../../components/Web3Network'
import { Contract } from 'ethers'
import {
  getAvailability,
  getMaxAssetBridge,
  getSourceChainName,
  getGasToTransfer,
} from '../../../services/umbria/fetchers/service'
import { BRIDGE_ADDRESS_DEFAULT, BRIDGE_PAIRS, NETWORK_LABEL } from '../../../config/networks'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { ERC20_BYTES32_ABI } from '../../../constants/abis/erc20'
import { updateOutputAmount } from '../../../state/application/actions'
import { setSourceChain, setDestinationChain } from '../../../state/application/actions'

import { hexlify } from '@ethersproject/bytes'

import cookie from 'cookie-cutter'
import { useDispatch } from 'react-redux'
import { getGasInNativeTokenPrice } from '../../../services/umbria/fetchers/service'
export default function Swap() {
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

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approvalState, approvalSubmitted])

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

  const [singleHopOnly] = useUserSingleHopOnly()

  dispatch(
    setSourceChain({
      chainId: chainId.toString(),
    })
  )

  if (chainId.toString() == '1') {
    dispatch(
      setDestinationChain({
        chainId: '137',
      })
    )
  } else {
    dispatch(
      setDestinationChain({
        chainId: '1',
      })
    )
  }

  const handleSwap = async () => {
    if (currencies.INPUT.isNative) {
      getAvailability().then((res) => {
        if (res) {
          var wrappedNativeAssetAddress = ''

          const destinationChainName = NETWORK_LABEL[destinationChain]

          if (destinationChainName == 'ethereum') {
            wrappedNativeAssetAddress = '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'
          } else {
            wrappedNativeAssetAddress = '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0'
          }

          getGasToTransfer(destinationChainName, currencies.INPUT.symbol).then((res) => {
            getMaxAssetBridge(destinationChainName, wrappedNativeAssetAddress).then((maxTransfer) => {
              if (parseFloat(res.costToTransfer) >= formattedAmounts[Field.INPUT]) {
                setSwapState({
                  attemptingTxn: false,
                  showConfirm: false,
                  swapErrorMessage: 'Amount to bridge is too low and would not cover the fees',
                  txHash: null,
                })
              } else {
                library
                  .getSigner()
                  .sendTransaction({
                    to: BRIDGE_ADDRESS_DEFAULT,
                    value: formattedAmounts[Field.INPUT].toBigNumber(),
                  })
                  .then((res) => {
                    console.log(res)
                    addTransaction(res)

                    setSwapState({
                      attemptingTxn: true,
                      showConfirm: false,
                      swapErrorMessage: undefined,
                      txHash: res.hash,
                    })
                  })
                  .catch((err) => {
                    console.log(err)
                  })
              }
            })
          })
        } else {
          setSwapState({
            attemptingTxn: false,
            showConfirm,
            swapErrorMessage: 'Bridge is currently down for maintenance. Please try again later.',
            txHash: null,
          })
        }
      })
    } else {
      let inputCurr: any = currencies.INPUT

      getAvailability().then((res) => {
        if (res) {
          const destinationChainName = NETWORK_LABEL[sourceChain]

          getMaxAssetBridge(destinationChainName, inputCurr.address).then((maxTransfer) => {
            let walletSigner = library.getSigner()
            let provider = library.provider

            let input: any = currencies.INPUT
            // general token send

            let contract = new Contract(input.address, ERC20_BYTES32_ABI, walletSigner)

            let numberOfTokens = formattedAmounts[Field.INPUT]

            console.log(maxTransfer)

            if (parseFloat(formattedAmounts[Field.INPUT]) <= maxTransfer) {
              contract
                .transfer(BRIDGE_ADDRESS_DEFAULT, numberOfTokens.toBigNumber())

                .then((res) => {
                  console.log(res)
                  addTransaction(res)
                  setSwapState({
                    attemptingTxn: true,
                    showConfirm: false,
                    swapErrorMessage: undefined,
                    txHash: res.hash,
                  })
                })
            } else {
              setSwapState({
                attemptingTxn: false,
                showConfirm,
                swapErrorMessage: 'Bridge cannot support a transaction this large',
                txHash: null,
              })
            }
          })
        } else {
          setSwapState({
            attemptingTxn: false,
            showConfirm,
            swapErrorMessage: 'Bridge is currently down for maintenance. Please try again later.',
            txHash: null,
          })
        }
      })
    }
  }

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  // const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);
  const priceImpactSeverity = useMemo(() => {
    const executionPriceImpact = trade?.priceImpact
    return warningSeverity(
      executionPriceImpact && priceImpact
        ? executionPriceImpact.greaterThan(priceImpact)
          ? executionPriceImpact
          : priceImpact
        : executionPriceImpact ?? priceImpact
    )
  }, [priceImpact, trade])

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({
      showConfirm: false,
      attemptingTxn,
      swapErrorMessage,
      txHash,
    })
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

  // useEffect(() => {
  //   if (
  //     doArcher &&
  //     parsedAmounts[Field.INPUT] &&
  //     maxAmountInput &&
  //     parsedAmounts[Field.INPUT]?.greaterThan(maxAmountInput)
  //   ) {
  //     handleMaxInput();
  //   }
  // }, [handleMaxInput, parsedAmounts, maxAmountInput, doArcher]);

  const swapIsUnsupported = false

  const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode

  const [animateSwapArrows, setAnimateSwapArrows] = useState<boolean>(false)

  const previousChainId = usePrevious<ChainId>(chainId)

  // useEffect(() => {
  //   if (
  //     previousChainId &&
  //     previousChainId !== chainId &&
  //     router.asPath.includes(Currency.getNativeCurrencySymbol(previousChainId))
  //   ) {
  //     router.push(`/swap/${Currency.getNativeCurrencySymbol(chainId)}`);
  //   }
  // }, [chainId, previousChainId, router]);

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
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
      />
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
            <Web3Network />
          </div>

          <div>
            <CurrencyInputPanel
              // priceImpact={priceImpact}
              label={independentField === Field.OUTPUT && !showWrap ? `Swap From (est.):` : `Asset:`}
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
                {`Unsupported Asset`}
              </Button>
            ) : !account ? (
              <Web3Connect size="lg" color="blue" className="w-full" />
            ) : showWrap ? (
              <Button color="gradient" size="lg" disabled={Boolean(wrapInputError)} onClick={onWrap}>
                {wrapInputError ??
                  (wrapType === WrapType.WRAP ? `Wrap` : wrapType === WrapType.UNWRAP ? `Unwrap` : null)}
              </Button>
            ) : (
              <ButtonError
                onClick={() => {
                  if (isExpertMode) {
                    handleSwap()
                  } else {
                    setSwapState({
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined,
                    })
                  }
                }}
                id="swap-button"
                disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
              >
                {swapInputError ? `Bridge` : `Bridge`}
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

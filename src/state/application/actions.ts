import { createAction } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'

export type PopupContent =
  | {
      txn: {
        hash: string
        success: boolean
        summary?: string
      }
    }
  | {
      listUpdate: {
        listUrl: string
        oldList: TokenList
        newList: TokenList
        auto: boolean
      }
    }

export enum ApplicationModal {
  WALLET,
  SETTINGS,
  SELF_CLAIM,
  ADDRESS_CLAIM,
  CLAIM_POPUP,
  MENU,
  DELEGATE,
  VOTE,
  LANGUAGE,
  NETWORK,
}

export const setSourceChain = createAction<{
  chainId: string
}>('application/setSourceChain')

export const setDestinationChain = createAction<{
  chainId: string
}>('application/setDestinationChain')

export const updateOutputAmount = createAction<{
  amount: number
  gasFee: number
  liquidityProviderFee: number
  transactionTooSmall: boolean
  outputCurrencySymbol: string
}>('application/updateOutputAmount')
export const updateBlockNumber = createAction<{
  chainId: number
  blockNumber: number
}>('application/updateBlockNumber')
export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const addPopup = createAction<{
  key?: string
  removeAfterMs?: number | null
  content: PopupContent
}>('application/addPopup')
export const removePopup = createAction<{ key: string }>('application/removePopup')
export const setKashiApprovalPending = createAction<string>('application/setKashiApprovalPending')

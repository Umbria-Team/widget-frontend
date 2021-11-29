import { createReducer, nanoid } from '@reduxjs/toolkit'
import {
  addPopup,
  ApplicationModal,
  PopupContent,
  removePopup,
  setKashiApprovalPending,
  setOpenModal,
  updateBlockNumber,
  updateOutputAmount,
  setSourceChain,
  setDestinationChain,
} from './actions'

type PopupList = Array<{
  key: string
  show: boolean
  content: PopupContent
  removeAfterMs: number | null
}>

export interface ApplicationState {
  readonly blockNumber: { readonly [chainId: number]: number }
  outputAmount: { amount: number; gasFee: number; liquidityProviderFee: number }
  sourceChain: { chainId: string }
  destinationChain: { chainId: string }
  readonly popupList: PopupList
  readonly openModal: ApplicationModal | null
  kashiApprovalPending: string
}

const initialState: ApplicationState = {
  blockNumber: {},
  popupList: [],
  outputAmount: { amount: 0, gasFee: 0, liquidityProviderFee: 0 },
  sourceChain: { chainId: '' },
  destinationChain: { chainId: '' },
  openModal: null,
  kashiApprovalPending: '',
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    })
    .addCase(setSourceChain, (state, action) => {
      if (state.sourceChain) state.sourceChain = action.payload
    })
    .addCase(setDestinationChain, (state, action) => {
      if (state.destinationChain) state.destinationChain = action.payload
    })
    .addCase(updateOutputAmount, (state, action) => {
      if (state.outputAmount) state.outputAmount = action.payload
    })
    .addCase(setOpenModal, (state, action) => {
      state.openModal = action.payload
    })
    .addCase(addPopup, (state, { payload: { content, key, removeAfterMs = 15000 } }) => {
      state.popupList = (key ? state.popupList.filter((popup) => popup.key !== key) : state.popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs,
        },
      ])
    })
    .addCase(removePopup, (state, { payload: { key } }) => {
      state.popupList.forEach((p) => {
        if (p.key === key) {
          p.show = false
        }
      })
    })
    .addCase(setKashiApprovalPending, (state, action) => {
      state.kashiApprovalPending = action.payload
    })
)

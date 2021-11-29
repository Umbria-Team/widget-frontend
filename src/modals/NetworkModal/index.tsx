import { NETWORK_ICON, NETWORK_LABEL, BRIDGE_PAIRS } from '../../config/networks'
import { useModalOpen, useNetworkModalToggle } from '../../state/application/hooks'

import { ApplicationModal } from '../../state/application/actions'
import { ChainId } from '@sushiswap/sdk'
import Image from 'next/image'
import Modal from '../../components/Modal'
import ModalHeader from '../../components/ModalHeader'
import React from 'react'
import cookie from 'cookie-cutter'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { forEach } from 'lodash'
import { useWalletModalToggle, useSourceChain, useDestinationChain } from '../../state/application/hooks'
import { setDestinationChain, setSourceChain } from '../../state/application/actions'
import { useDispatch } from 'react-redux'
import { getDestinationChainName, getSourceChainName } from '../../services/umbria/fetchers/service'

export const SUPPORTED_NETWORKS: {
  [chainId in ChainId]?: {
    chainId: string
    chainName: string
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
    rpcUrls: string[]
    blockExplorerUrls: string[]
  }
} = {
  [ChainId.MAINNET]: {
    chainId: '0x1',
    chainName: 'Ethereum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3'],
    blockExplorerUrls: ['https://etherscan.com'],
  },
  [ChainId.FANTOM]: {
    chainId: '0xfa',
    chainName: 'Fantom',
    nativeCurrency: {
      name: 'Fantom',
      symbol: 'FTM',
      decimals: 18,
    },
    rpcUrls: ['https://rpcapi.fantom.network'],
    blockExplorerUrls: ['https://ftmscan.com'],
  },
  [ChainId.BSC]: {
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
  [ChainId.MATIC]: {
    chainId: '0x89',
    chainName: 'Polygon',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mainnet.maticvigil.com'], // ['https://matic-mainnet.chainstacklabs.com/'],
    blockExplorerUrls: ['https://explorer-mainnet.maticvigil.com'],
  },
  [ChainId.HECO]: {
    chainId: '0x80',
    chainName: 'Heco',
    nativeCurrency: {
      name: 'Heco Token',
      symbol: 'HT',
      decimals: 18,
    },
    rpcUrls: ['https://http-mainnet.hecochain.com'],
    blockExplorerUrls: ['https://hecoinfo.com'],
  },
  [ChainId.XDAI]: {
    chainId: '0x64',
    chainName: 'xDai',
    nativeCurrency: {
      name: 'xDai Token',
      symbol: 'xDai',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.xdaichain.com'],
    blockExplorerUrls: ['https://blockscout.com/poa/xdai'],
  },
  [ChainId.HARMONY]: {
    chainId: '0x63564C40',
    chainName: 'Harmony',
    nativeCurrency: {
      name: 'One Token',
      symbol: 'ONE',
      decimals: 18,
    },
    rpcUrls: [
      'https://api.harmony.one',
      'https://s1.api.harmony.one',
      'https://s2.api.harmony.one',
      'https://s3.api.harmony.one',
    ],
    blockExplorerUrls: ['https://explorer.harmony.one/'],
  },
  [ChainId.AVALANCHE]: {
    chainId: '0xA86A',
    chainName: 'Avalanche',
    nativeCurrency: {
      name: 'Avalanche Token',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://cchain.explorer.avax.network'],
  },
  [ChainId.OKEX]: {
    chainId: '0x42',
    chainName: 'OKEx',
    nativeCurrency: {
      name: 'OKEx Token',
      symbol: 'OKT',
      decimals: 18,
    },
    rpcUrls: ['https://exchainrpc.okex.org'],
    blockExplorerUrls: ['https://www.oklink.com/okexchain'],
  },
  [ChainId.ARBITRUM]: {
    chainId: '0xA4B1',
    chainName: 'Arbitrum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://mainnet-arb-explorer.netlify.app'],
  },
  [ChainId.CELO]: {
    chainId: '0xA4EC',
    chainName: 'Celo',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18,
    },
    rpcUrls: ['https://forno.celo.org'],
    blockExplorerUrls: ['https://explorer.celo.org'],
  },
  [ChainId.PALM]: {
    chainId: '0x2A15C308D',
    chainName: 'Palm',
    nativeCurrency: {
      name: 'Palm',
      symbol: 'PALM',
      decimals: 18,
    },
    rpcUrls: ['https://palm-mainnet.infura.io/v3/da5fbfafcca14b109e2665290681e267'],
    blockExplorerUrls: ['https://explorer.palm.io'],
  },
  [ChainId.MOONRIVER]: {
    chainId: '0x505',
    chainName: 'Moonriver',
    nativeCurrency: {
      name: 'Moonriver',
      symbol: 'MOVR',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.moonriver.moonbeam.network'],
    blockExplorerUrls: ['https://blockscout.moonriver.moonbeam.network'],
  },
}

var destinationModalVisible = false

function showDestinationModal(visible: boolean) {
  destinationModalVisible = !destinationModalVisible
}

export default function NetworkModal(): JSX.Element | null {
  const { chainId, library, account } = useActiveWeb3React()
  const networkModalOpen = useModalOpen(ApplicationModal.NETWORK)
  const toggleNetworkModal = useNetworkModalToggle()
  const toggleWalletModal = useWalletModalToggle()

  if (!chainId) return null

  let networkButtons = []

  const sourceChain = getSourceChainName()
  const destinationChain = getDestinationChainName()

  const dispatch = useDispatch()

  BRIDGE_PAIRS.forEach((pair, index) => {
    if (pair.enabled) {
      networkButtons.push(
        <div key={index}>
          <button
            key={index}
            className="w-full col-span-1 p-px rounded bg-gradient-to-r from-blue to-pink"
            onClick={() => {
              const params = SUPPORTED_NETWORKS[pair.source]

              if (!account) {
                toggleWalletModal()
              } else {
                console.log(params)
                library?.send('wallet_addEthereumChain', [params, account]).then((res) => {})
                library
                  ?.send('wallet_switchEthereumChain', [{ chainId: `0x${pair.source}` }, account])
                  .then((res) => {})
                dispatch(setDestinationChain({ chainId: pair.destination.toString() }))
                dispatch(setSourceChain({ chainId: pair.source.toString() }))
                toggleNetworkModal()
              }
            }}
          >
            <div className="flex items-center w-full h-full p-3 space-x-3 rounded bg-dark-1000">
              <Image
                src={NETWORK_ICON[pair.source]}
                alt={`Switch to ${NETWORK_LABEL[pair.source]} Network`}
                className="rounded-md"
                width="32px"
                height="32px"
              />
              <div className="font-bold text-primary">
                {NETWORK_LABEL[pair.source]} to {NETWORK_LABEL[pair.destination]}
              </div>
            </div>
          </button>
        </div>
      )
    }
  })

  return (
    <Modal isOpen={networkModalOpen} onDismiss={toggleNetworkModal} maxWidth={672}>
      <div className="mb-6 text-lg text-primary">
        You are currently connected to the <span className="font-bold text-blue">{sourceChain}</span> network and are
        bridging to the <span className="font-bold text-blue">{destinationChain}</span>
        {networkButtons}
      </div>
    </Modal>
  )
}

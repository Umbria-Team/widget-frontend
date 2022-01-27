import { NETWORK_ICON, NETWORK_LABEL } from '../../config/networks'

import Image from 'next/image'
import NetworkModel from '../../modals/NetworkModal'
import React from 'react'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import {
  useNetworkModalToggle,
  useWalletModalToggle,
  useDestinationChain,
  useSourceChain,
} from '../../state/application/hooks'
import { Shuffle } from 'react-feather'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { setSourceChain, setDestinationChain } from '../../state/application/actions'
import { getDestinationChainName, getSourceChainName } from '../../services/umbria/fetchers/service'
import { ChevronDownIcon } from '@heroicons/react/outline'

function Web3Network(): JSX.Element | null {
  const { account, chainId, library } = useActiveWeb3React()
  const dispatch = useDispatch()
  const toggleWalletModal = useWalletModalToggle()
  const toggleSourceModal = useNetworkModalToggle()
  var destinationChain = useDestinationChain()
  var sourceChain = useSourceChain()
  var otherChainId = 0

  if (!account) {
    return (
      <div className="flex items-center rounded bg-dark-900 hover:bg-dark-800 p-0.5 whitespace-nowrap text-sm font-bold cursor-pointer select-none pointer-events-auto">
        <div
          className="grid grid-flow-col px-3 py-2 space-x-2 text-sm rounded-lg pointer-events-auto auto-cols-max bg-dark-1000 text-secondary"
          onClick={() => toggleWalletModal()}
        >
          <span className="text-primary">
            Please connect an account before selecting which networks to bridge across
          </span>
        </div>
        <NetworkModel />
      </div>
    )
  }

  if (!chainId) {
    return null
  }

  function updateNetworks() {}

  return (
    <div className="flex items-center rounded bg-dark-1000 hover:bg-dark-800 p-0.5 whitespace-nowrap text-sm font-bold cursor-pointer select-none pointer-events-auto">
      <div
        className="grid grid-flow-col px-3 py-2 space-x-2 text-sm rounded-lg pointer-events-auto auto-cols-max bg-dark-1000 text-secondary"
        onClick={() => toggleSourceModal()}
      >
        <div>
          <span className="text-primary">
            Bridging from {NETWORK_LABEL[sourceChain]} to {NETWORK_LABEL[destinationChain]}
          </span>
        </div>
        <div>
          <ChevronDownIcon width={16} height={16} className="ml-2 stroke-current" />
        </div>
      </div>
      <NetworkModel />
    </div>
  )
}

export default Web3Network

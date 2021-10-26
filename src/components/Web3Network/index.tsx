import { NETWORK_ICON, NETWORK_LABEL } from '../../config/networks'

import Image from 'next/image'
import NetworkModel from '../../modals/NetworkModal'
import React from 'react'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useNetworkModalToggle } from '../../state/application/hooks'
import { Shuffle } from 'react-feather'
import cookie from 'cookie-cutter'

function Web3Network(): JSX.Element | null {
  const { chainId } = useActiveWeb3React()

  const toggleSourceModal = useNetworkModalToggle()

  var otherChainId = 0

  if (!chainId) return null

  return (
    <div className="flex items-center rounded bg-dark-900 hover:bg-dark-800 p-0.5 whitespace-nowrap text-sm font-bold cursor-pointer select-none pointer-events-auto">
      <div
        className="grid grid-flow-col px-3 py-2 space-x-2 text-sm rounded-lg pointer-events-auto auto-cols-max bg-dark-1000 text-secondary"
        onClick={() => toggleSourceModal()}
      >
        <Image
          src={NETWORK_ICON[cookie.get('chainId')]}
          alt="Switch Source Network"
          className="rounded-md"
          width="22px"
          height="22px"
        />
        <span className="text-primary">
          Bridging from {NETWORK_LABEL[cookie.get('chainId')]} to {NETWORK_LABEL[cookie.get('otherChainId')]}
        </span>
      </div>
      <NetworkModel />
    </div>
  )
}

export default Web3Network

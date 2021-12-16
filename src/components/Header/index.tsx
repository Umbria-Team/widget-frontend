import { ChainId, Currency, NATIVE, SUSHI_ADDRESS } from '@sushiswap/sdk'
import { Feature, featureEnabled } from '../../functions/feature'
import React, { useEffect, useState } from 'react'

import More from './More'
import { Popover } from '@headlessui/react'
import Web3Status from '../Web3Status'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useETHBalances } from '../../state/wallet/hooks'
import { useSourceChain, useDestinationChain } from '../../state/application/hooks'
import cookie from 'cookie-cutter'
import { setDestinationChain, setSourceChain } from '../../state/application/actions'
import { useDispatch } from 'react-redux'
function AppBar(): JSX.Element {
  const { account, chainId, library } = useActiveWeb3React()
  const dispatch = useDispatch()
  const initialChain = ChainId.MAINNET.toString()
  const initialDestination = ChainId.MATIC.toString()

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']

  return (
    //     // <header className="flex flex-row justify-between w-screen flex-nowrap">
    <header className="flex-shrink-0 w-full">
      <Popover as="nav" className="z-10 w-full bg-transparent header-border-b">
        {({ open }) => (
          <>
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="fixed bottom-0 left-0 z-10 flex flex-row items-center justify-center w-full p-4 lg:w-auto bg-dark-1000 lg:relative lg:p-0 lg:bg-transparent">
                  <div className="flex items-center justify-between w-full space-x-2 sm:justify-end">
                    {library && library.provider.isMetaMask && <div className="hidden sm:inline-block"></div>}

                    <div className="w-auto flex items-center rounded bg-dark-900 hover:bg-dark-800 p-0.5 whitespace-nowrap text-sm font-bold cursor-pointer select-none pointer-events-auto">
                      {account && chainId && userEthBalance && (
                        <>
                          <div className="px-3 py-2 text-primary text-bold">
                            {userEthBalance?.toSignificant(4)} {NATIVE[chainId].symbol}
                          </div>
                        </>
                      )}

                      <Web3Status />
                    </div>
                    <div className="w-auto flex items-center rounded bg-dark-900 hover:bg-dark-800 p-0.5 whitespace-nowrap text-sm font-bold cursor-pointer select-none pointer-events-auto">
                      <div className="px-3 py-2 text-primary text-bold">
                        <span>
                          <a href="https://discord.umbria.network" target="_blank">
                            Discord / Support
                          </a>
                        </span>
                      </div>
                    </div>
                    <div className="w-auto flex items-center rounded bg-dark-900 hover:bg-dark-800 p-0.5 whitespace-nowrap text-sm font-bold cursor-pointer select-none pointer-events-auto">
                      <div className="px-3 py-2 text-primary text-bold">
                        <span>
                          <a href="https://bridge.umbria.network/docs/docs-page.html">Docs</a>
                        </span>
                      </div>
                    </div>
                    <More />
                  </div>
                </div>
                <div className="flex -mr-2 sm:hidden">
                  {/* Mobile menu button */}
                  <Popover.Button className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:text-high-emphesis focus:outline-none">
                    <span className="sr-only">{`Open main menu`}</span>
                  </Popover.Button>
                </div>
              </div>
            </div>
          </>
        )}
      </Popover>
    </header>
  )
}

export default AppBar

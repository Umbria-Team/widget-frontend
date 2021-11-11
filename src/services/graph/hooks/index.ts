import {
  getMasterChefV1Farms,
  getMasterChefV1PairAddreses,
  getMasterChefV1SushiPerBlock,
  getMasterChefV1TotalAllocPoint,
  getMasterChefV2Farms,
  getMasterChefV2PairAddreses,
  getMiniChefFarms,
  getMiniChefPairAddreses,
} from '../fetchers'
import { useEffect, useMemo } from 'react'
import useSWR, { SWRConfiguration } from 'swr'

import { ChainId } from '@sushiswap/sdk'
import concat from 'lodash/concat'
import useActiveWeb3React from '../../../hooks/useActiveWeb3React'

export * from './bentobox'
export * from './blocks'
export * from './exchange'

export function useMasterChefV1TotalAllocPoint(swrConfig = undefined) {
  const { chainId } = useActiveWeb3React()
  const shouldFetch = chainId && chainId === ChainId.MAINNET
  const { data } = useSWR(
    shouldFetch ? 'masterChefV1TotalAllocPoint' : null,
    () => getMasterChefV1TotalAllocPoint(),
    swrConfig
  )
  return data
}

export function useMasterChefV1SushiPerBlock(swrConfig = undefined) {
  const { chainId } = useActiveWeb3React()
  const shouldFetch = chainId && chainId === ChainId.MAINNET
  const { data } = useSWR(
    shouldFetch ? 'masterChefV1SushiPerBlock' : null,
    () => getMasterChefV1SushiPerBlock(),
    swrConfig
  )
  return data
}

interface useFarmsProps {
  chainId: number
}

export function useMasterChefV1PairAddresses() {
  const { chainId } = useActiveWeb3React()
  const shouldFetch = chainId && chainId === ChainId.MAINNET
  const { data } = useSWR(shouldFetch ? ['masterChefV1PairAddresses', chainId] : null, (_) =>
    getMasterChefV1PairAddreses()
  )
  return useMemo(() => {
    if (!data) return []
    return data.map((data) => data.pair)
  }, [data])
}

export function useMasterChefV2PairAddresses() {
  const { chainId } = useActiveWeb3React()
  const shouldFetch = chainId && chainId === ChainId.MAINNET
  const { data } = useSWR(shouldFetch ? ['masterChefV2PairAddresses', chainId] : null, (_) =>
    getMasterChefV2PairAddreses()
  )
  return useMemo(() => {
    if (!data) return []
    return data.map((data) => data.pair)
  }, [data])
}

export function useMiniChefPairAddresses() {
  const { chainId } = useActiveWeb3React()
  const shouldFetch = chainId && [ChainId.MATIC, ChainId.XDAI, ChainId.HARMONY, ChainId.ARBITRUM].includes(chainId)
  const { data } = useSWR(shouldFetch ? ['miniChefPairAddresses', chainId] : null, (_, chainId) =>
    getMiniChefPairAddreses(chainId)
  )
  return useMemo(() => {
    if (!data) return []
    return data.map((data) => data.pair)
  }, [data])
}

export function useFarmPairAddresses() {
  const masterChefV1PairAddresses = useMasterChefV1PairAddresses()
  const masterChefV2PairAddresses = useMasterChefV2PairAddresses()
  const miniChefPairAddresses = useMiniChefPairAddresses()
  return useMemo(
    () => concat(masterChefV1PairAddresses, masterChefV2PairAddresses, miniChefPairAddresses),
    [masterChefV1PairAddresses, masterChefV2PairAddresses, miniChefPairAddresses]
  )
}

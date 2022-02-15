import { ChainId } from '@sushiswap/sdk'
import { ETH2X_FLI } from './tokens'
import { WNATIVE } from '@sushiswap/sdk'
const Arbitrum = 'https://raw.githubusercontent.com/sushiswap/icons/master/network/arbitrum.jpg'
const Avalanche = '/images/networks/avalanche-network.jpg'
const Bsc = '/images/networks/bsc-network.jpg'
const Fantom = '/images/networks/fantom-network.jpg'
const Goerli = '/images/networks/goerli-network.jpg'
const Harmony = '/images/networks/harmonyone-network.jpg'
const Heco = '/images/networks/heco-network.jpg'
const Kovan = '/images/networks/kovan-network.jpg'
const Mainnet = '/images/networks/mainnet-network.jpg'
const Matic = '/images/networks/matic-network.jpg'
const Moonbeam = '/images/networks/moonbeam-network.jpg'
const OKEx = '/images/networks/okex-network.jpg'
const Polygon = '/images/networks/polygon-network.jpg'
const Rinkeby = '/images/networks/rinkeby-network.jpg'
const Ropsten = '/images/networks/ropsten-network.jpg'
const xDai = '/images/networks/xdai-network.jpg'
const Celo = '/images/networks/celo-network.jpg'
const Palm = 'https://raw.githubusercontent.com/sushiswap/icons/master/network/palm.jpg'
const Moonriver = 'https://raw.githubusercontent.com/sushiswap/icons/master/network/moonriver.jpg'

export const NETWORK_ICON = {
  [ChainId.MAINNET]: Mainnet,
  [ChainId.ROPSTEN]: Ropsten,
  [ChainId.RINKEBY]: Rinkeby,
  [ChainId.GÖRLI]: Goerli,
  [ChainId.KOVAN]: Kovan,
  [ChainId.FANTOM]: Fantom,
  [ChainId.FANTOM_TESTNET]: Fantom,
  [ChainId.BSC]: Bsc,
  [ChainId.BSC_TESTNET]: Bsc,
  [ChainId.MATIC]: Polygon,
  [ChainId.MATIC_TESTNET]: Matic,
  [ChainId.XDAI]: xDai,
  [ChainId.ARBITRUM]: Arbitrum,
  [ChainId.ARBITRUM_TESTNET]: Arbitrum,
  [ChainId.MOONBEAM_TESTNET]: Moonbeam,
  [ChainId.AVALANCHE]: Avalanche,
  [ChainId.AVALANCHE_TESTNET]: Avalanche,
  [ChainId.HECO]: Heco,
  [ChainId.HECO_TESTNET]: Heco,
  [ChainId.HARMONY]: Harmony,
  [ChainId.HARMONY_TESTNET]: Harmony,
  [ChainId.OKEX]: OKEx,
  [ChainId.OKEX_TESTNET]: OKEx,
  [ChainId.CELO]: Celo,
  [ChainId.PALM]: Palm,
  [ChainId.MOONRIVER]: Moonriver,
}

export const BRIDGE_ADDRESS_DEFAULT = '0x4103c267Fba03A1Df4fe84Bc28092d629Fa3f422'
export const BRIDGE_ADDRESS_BSC = '0xA88902d6E93922893EE77234ED1C3ba4Bec90224'
export const BRIDGE_ADDRESS_AVALANCHE = '0xCe473D30bB1DFda0747EdCCDaeb3DE30042cE948'
export const BRIDGE_ADDRESS_FANTOM = '0x9021A2F42087bBf1ebB77639e010164BEbd01e37'
export const BRIDGE_ADDRESS_ETH_MATIC = BRIDGE_ADDRESS_DEFAULT
export const BRIDGE_ADDRESS_MATIC_ETH = BRIDGE_ADDRESS_DEFAULT

export const BRIDGE_PAIRS = [
  {
    source: ChainId.MATIC,
    destination: ChainId.MAINNET,
    address: BRIDGE_ADDRESS_DEFAULT,
    enabled: true,
    currencies: [
      WNATIVE[137],
      {
        chainId: 137,
        decimals: 6,
        symbol: 'USDC',
        name: 'USD Coin',
        isNative: false,
        isToken: true,
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      },
      {
        chainId: 137,
        decimals: 8,
        symbol: 'WBTC',
        name: 'Wrapped Bitcoin',
        isNative: false,
        isToken: true,
        address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      },
      {
        chainId: 137,
        decimals: 18,
        symbol: 'WETH',
        name: 'Wrapped Ether',
        isNative: false,
        isToken: true,
        address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      },
      {
        chainId: 137,
        decimals: 6,
        symbol: 'USDT',
        name: 'Tether USD',
        isNative: false,
        isToken: true,
        address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      },
      {
        chainId: 137,
        decimals: 18,
        symbol: 'UMBR',
        name: 'UMBR',
        isNative: false,
        isToken: true,
        address: '0x2e4b0Fb46a46C90CB410FE676f24E466753B469f',
      },
      {
        chainId: 137,
        decimals: 18,
        symbol: 'GHST',
        name: 'GHST',
        isNative: false,
        isToken: true,
        address: '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7',
      },
    ],
  },
  {
    source: ChainId.MAINNET,
    destination: ChainId.MATIC,
    address: BRIDGE_ADDRESS_DEFAULT,
    enabled: true,
    currencies: [
      {
        chainId: 1,
        decimals: 6,
        symbol: 'USDC',
        name: 'USD Coin',
        isNative: false,
        isToken: true,
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      },
      {
        chainId: 1,
        decimals: 6,
        symbol: 'USDT',
        name: 'Tether USD',
        isNative: false,
        isToken: true,
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      },
      {
        chainId: 1,
        decimals: 8,
        symbol: 'WBTC',
        name: 'Wrapped BTC',
        isNative: false,
        isToken: true,
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      },
      {
        chainId: 1,
        decimals: 18,
        symbol: 'UMBR',
        name: ' UMBR (Eth)',
        isNative: false,
        isToken: true,
        address: '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7',
      },
      {
        chainId: 1,
        decimals: 18,
        symbol: 'WMATIC',
        name: 'Wrapped Matic',
        isNative: false,
        isToken: true,
        address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      },
      {
        chainId: 1,
        decimals: 18,
        symbol: 'GHST',
        name: 'GHST',
        isNative: false,
        isToken: true,
        address: '0x3F382DbD960E3a9bbCeaE22651E88158d2791550',
      },
    ],
  },
  {
    source: ChainId.MAINNET,
    destination: ChainId.FANTOM,
    address: BRIDGE_ADDRESS_FANTOM,
    enabled: true,
    currencies: [],
  },
  {
    source: ChainId.FANTOM,
    destination: ChainId.MAINNET,
    address: BRIDGE_ADDRESS_FANTOM,
    enabled: true,
    currencies: [
      {
        chainId: 250,
        decimals: 18,
        symbol: 'ETH',
        name: 'ETH',
        isNative: false,
        isToken: true,
        address: '0x74b23882a30290451a17c44f4f05243b6b58c76d',
      },
    ],
  },
  {
    source: ChainId.MAINNET,
    destination: ChainId.BSC,
    address: BRIDGE_ADDRESS_BSC,
    enabled: true,
    currencies: [WNATIVE[1]],
  },
  {
    source: ChainId.BSC,
    destination: ChainId.MAINNET,
    address: BRIDGE_ADDRESS_BSC,
    enabled: true,
    currencies: [
      {
        chainId: 97,
        decimals: 18,
        symbol: 'ETH',
        name: 'ETH',
        isNative: false,
        isToken: true,
        address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
      },
    ],
  },
  {
    source: ChainId.MAINNET,
    destination: ChainId.AVALANCHE,
    address: BRIDGE_ADDRESS_AVALANCHE,
    enabled: true,
    currencies: [WNATIVE[1]],
  },
  {
    source: ChainId.AVALANCHE,
    destination: ChainId.MAINNET,
    address: BRIDGE_ADDRESS_AVALANCHE,
    enabled: true,
    currencies: [
      {
        chainId: 43114,
        decimals: 18,
        symbol: 'WETH',
        name: 'WETH',
        isNative: false,
        isToken: true,
        address: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',
      },
    ],
  },
]

export const NETWORK_LABEL: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: 'Ethereum',
  [ChainId.RINKEBY]: 'Rinkeby',
  [ChainId.ROPSTEN]: 'Ropsten',
  [ChainId.GÖRLI]: 'Görli',
  [ChainId.KOVAN]: 'Kovan',
  [ChainId.FANTOM]: 'Fantom',
  [ChainId.FANTOM_TESTNET]: 'Fantom Testnet',
  [ChainId.MATIC]: 'Polygon',
  [ChainId.MATIC_TESTNET]: 'Matic Testnet',
  [ChainId.XDAI]: 'xDai',
  [ChainId.ARBITRUM]: 'Arbitrum',
  [ChainId.ARBITRUM_TESTNET]: 'Arbitrum Testnet',
  [ChainId.BSC]: 'BSC',
  [ChainId.BSC_TESTNET]: 'BSC Testnet',
  [ChainId.MOONBEAM_TESTNET]: 'Moonbase',
  [ChainId.AVALANCHE]: 'Avalanche',
  [ChainId.AVALANCHE_TESTNET]: 'Fuji',
  [ChainId.HECO]: 'HECO',
  [ChainId.HECO_TESTNET]: 'HECO Testnet',
  [ChainId.HARMONY]: 'Harmony',
  [ChainId.HARMONY_TESTNET]: 'Harmony Testnet',
  [ChainId.OKEX]: 'OKEx',
  [ChainId.OKEX_TESTNET]: 'OKEx',
  [ChainId.CELO]: 'Celo',
  [ChainId.PALM]: 'Palm',
  [ChainId.MOONRIVER]: 'Moonriver',
}

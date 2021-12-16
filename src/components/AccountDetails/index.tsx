import React, { FC, useCallback } from 'react'
import { SUPPORTED_WALLETS, injected } from '../../config/wallets'

import { AppDispatch } from '../../state'
import Button from '../Button'
import Copy from './Copy'
import ExternalLink from '../ExternalLink'
import Image from 'next/image'
import { ExternalLink as LinkIcon } from 'react-feather'
import ModalHeader from '../ModalHeader'
import Transaction from './Transaction'
import Typography from '../Typography'
import { clearAllTransactions } from '../../state/transactions/actions'
import { getExplorerLink } from '../../functions/explorer'
import { shortenAddress } from '../../functions'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useDispatch } from 'react-redux'
import { useLingui } from '@lingui/react'
import { getTransactionDetails } from '../../services/umbria/fetchers/service'

const WalletIcon: FC<{ size?: number; src: string; alt: string }> = ({ size, src, alt, children }) => {
  return (
    <div className="flex flex-row items-end justify-center mr-2 flex-nowrap md:items-center">
      <Image src={src} alt={alt} width={size} height={size} />
      {children}
    </div>
  )
}

function renderTransactions(transactions: string[]) {
  return (
    <div className="flex flex-col gap-2 flex-nowrap">
      {transactions.map((hash, i) => {
        var transaction = <Transaction key={i} hash={hash} />

        return transaction
      })}
    </div>
  )
}

interface AccountDetailsProps {
  toggleWalletModal: () => void
  pendingTransactions: string[]
  confirmedTransactions: string[]
  ENSName?: string
  openOptions: () => void
}

const AccountDetails: FC<AccountDetailsProps> = ({
  toggleWalletModal,
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  openOptions,
}) => {
  const { i18n } = useLingui()
  const { chainId, account, connector } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()

  function formatConnectorName() {
    const { ethereum } = window
    const isMetaMask = !!(ethereum && ethereum.isMetaMask)
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        (k) =>
          SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === 'METAMASK'))
      )
      .map((k) => SUPPORTED_WALLETS[k].name)[0]
    return <div className="font-medium text-baseline text-secondary">Connected with {name}</div>
  }

  function getStatusIcon() {
    if (connector === injected) {
      return null
      // return <IconWrapper size={16}>{/* <Identicon /> */}</IconWrapper>
    } else if (connector.constructor.name === 'WalletConnectConnector') {
      return <WalletIcon src="/wallet-connect.png" alt="Wallet Connect" size={16} />
    } else if (connector.constructor.name === 'WalletLinkConnector') {
      return <WalletIcon src="/coinbase.svg" alt="Coinbase" size={16} />
    }
    return null
  }

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }))
  }, [dispatch, chainId])

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        <ModalHeader title="Account" onClose={toggleWalletModal} />
        <div className="space-y-3">
          <div className="flex items-center justify-between"></div>
          <div id="web3-account-identifier-row" className="flex flex-col justify-center space-y-3">
            {ENSName ? (
              <div className="bg-dark-800">
                {getStatusIcon()}
                <Typography>{ENSName}</Typography>
              </div>
            ) : (
              <div className="px-3 py-2 rounded bg-dark-800">
                {getStatusIcon()}
                <Typography>{account && shortenAddress(account)}</Typography>
              </div>
            )}
            <div className="flex items-center gap-2 space-x-3">
              {chainId && account && (
                <ExternalLink
                  color="blue"
                  startIcon={<LinkIcon size={16} />}
                  href={chainId && getExplorerLink(chainId, ENSName || account, 'address')}
                >
                  <Typography variant="sm">{`View on explorer`}</Typography>
                </ExternalLink>
              )}
              {account && (
                <Copy toCopy={account}>
                  <Typography variant="sm">{`Copy Address`}</Typography>
                </Copy>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Typography weight={700}>{`Recent Transactions`}</Typography>
          <div>
            <Button variant="outlined" color="gray" size="xs" onClick={clearAllTransactionsCallback}>
              {`Clear all`}
            </Button>
          </div>
        </div>
        {!!pendingTransactions.length || !!confirmedTransactions.length ? (
          <>
            {renderTransactions(pendingTransactions)}
            {renderTransactions(confirmedTransactions)}
          </>
        ) : (
          <Typography variant="sm" className="text-secondary">
            {`Your transactions will appear here...`}
          </Typography>
        )}
      </div>
    </div>
  )
}

export default AccountDetails

import Container from '../../../components/Container'
import Head from 'next/head'
import Typography from '../../../components/Typography'
import useSWR from 'swr'
import transakSDK from '@transak/transak-sdk'
import { getAddress } from '@ethersproject/address'
import DoubleGlowShadow from '../../../components/DoubleGlowShadow'
import { useActiveWeb3React } from '../../../hooks'
import Button from '../../../components/Button'

export default function Status({ fallbackData }) {
  const { account, chainId, library } = useActiveWeb3React()

  return (
    <Container id="dashboard-page" className="py-4 md:py-8 lg:py-12" maxWidth="2xl">
      <Head>
        <title>Umbria | Buy Crypto</title>
        <meta key="description" name="description" content="Chains..." />
      </Head>
      <DoubleGlowShadow>
        <div className="p-4 space-y-4 rounded bg-dark-900 z-1">
          <div className="w-full max-w-6xl mx-auto">
            <Typography component="h1" variant="h1" className="w-full mb-4 text-center">
              Purchase (Via 3rd party)
            </Typography>
            <Typography component="h2" className="text-center">
              From this page, you can purchase cryptocurrency through our partner Transak. Please note that you are not
              purchasing from Umbria, and any queries should be directed to Transak support.
              <div
                className="px-3 py-2 text-primary text-bold"
                style={{
                  marginTop: '20px',
                  textAlign: 'center',
                }}
                onClick={() => {
                  let accountAddress = account ? account.toString() : ''

                  let transak = new transakSDK({
                    apiKey: '4fcd6904-706b-4aff-bd9d-77422813bbb7', // Your API Key (Required)
                    environment: 'STAGING', // STAGING/PRODUCTION (Required)
                    defaultCryptoCurrency: 'ETH',
                    walletAddress: accountAddress, // Your customer wallet address
                    themeColor: '0D0415', // App theme color in hex
                    email: '', // Your customer email address (Optional)
                    redirectURL: '',
                    hostURL: window.location.origin, // Required field
                    widgetHeight: '650px',
                    widgetWidth: '450px',
                  })

                  // To get all the events
                  transak.on(transak.ALL_EVENTS, (data) => {
                    console.log(data)
                  })

                  transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, (orderData) => {
                    transak.close()
                  })

                  // This will trigger when the user marks payment is made.
                  transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
                    console.log(orderData)
                    transak.close()
                  })

                  transak.init()
                }}
              >
                <Button color="gradient" size="lg">
                  Purchase
                </Button>
              </div>
            </Typography>
          </div>
        </div>
      </DoubleGlowShadow>
    </Container>
  )
}

export async function getStaticProps() {
  return { props: {} }
}

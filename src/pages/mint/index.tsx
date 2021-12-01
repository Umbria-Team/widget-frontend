import Container from '../../components/Container'
import Head from 'next/head'
import Typography from '../../components/Typography'
import useSWR from 'swr'
const getChains = (url = 'https://chainid.network/chains.json') => fetch(url).then((res) => res.json())

export default function Chains({ fallbackData }) {
  const res = useSWR('https://chainid.network/chains.json', getChains, { fallbackData })
  const { data } = res
  return (
    <Container id="chains-page" className="py-1 space-y-1 md:py-8 lg:py-6" maxWidth="16xl">
      <Head>
        <title>Mint | FunkoBits V2</title>
        <meta key="description" name="description" content="Chains..." />
      </Head>
      <div className="w-full max-w-6xl mx-auto" style={{ height: '700px', minWidth: '1024px' }}>
        <div className="h-full p-1 rounded bg-dark-900 text-primary">
          <pre className="h-full p-4 rounded bg-dark-1000">
            <iframe width="100%" height="100%" src="http://funkobitsnft.com/" />
          </pre>
        </div>
      </div>
    </Container>
  )
}

export async function getStaticProps() {
  return { props: { fallbackData: await getChains() } }
}

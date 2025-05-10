import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../app/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Countdown App</title>
        <meta name="description" content="Countdown to July 7th, 2:00 AM" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  )
} 
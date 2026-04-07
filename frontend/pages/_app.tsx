import type { AppProps } from "next/app";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  // Global Next.js app wrapper that injects shared styles.
  return <Component {...pageProps} />;
}

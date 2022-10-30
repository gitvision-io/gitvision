import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth/core/types";
import { Navbar } from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps & { pageProps: { session: Session; disableLayout?: boolean } }) {
  return (
    <SessionProvider session={session}>
      {!pageProps.disableLayout && (
        <>
          <Navbar />
          <div className="px-4 py-10 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-10">
            <Component {...pageProps} />
          </div>
          <Footer />
        </>
      )}
      {pageProps.disableLayout && <Component {...pageProps} />}
    </SessionProvider>
  );
}

export default MyApp;

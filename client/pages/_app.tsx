import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider, useSession } from "next-auth/react";
import { Session } from "next-auth/core/types";
import { Navbar } from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { asyncRefreshUser } from "../services/state";

const InnerComponent = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const [, refreshUser] = useAtom(asyncRefreshUser);
  useEffect(() => {
    if (session.status === "authenticated") {
      refreshUser();
    }
  }, [refreshUser, session.status]);

  return <>{children}</>;
};

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps & { pageProps: { session: Session; disableLayout?: boolean } }) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Gitvision</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {!pageProps.disableLayout && (
        <>
          <Navbar />
          <div className="px-4 py-10 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-10">
            <InnerComponent>
              <Component {...pageProps} />
            </InnerComponent>
          </div>
          <Footer />
        </>
      )}
      {pageProps.disableLayout && <Component {...pageProps} />}
    </SessionProvider>
  );
}

export default MyApp;

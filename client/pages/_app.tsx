import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Footer from "../components/layout/Footer";
import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { asyncRefreshUser } from "../core/services/state";

const InnerComponent = ({ children }: { children: React.ReactNode }) => {
  const [, refreshUser] = useAtom(asyncRefreshUser);
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return <>{children}</>;
};

function MyApp({
  Component,
  pageProps,
}: AppProps & { pageProps: { disableLayout?: boolean } }) {
  return (
    <>
      <Head>
        <title>Gitvision</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="px-4 py-10 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-10">
        <InnerComponent>
          <Component {...pageProps} />
        </InnerComponent>
      </div>
      <Footer />
    </>
  );
}

export default MyApp;

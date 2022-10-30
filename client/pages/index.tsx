import type { NextPage } from "next";
import Banner from "../components/index/Banner";
import Features from "../components/index/Features";
import Pricings from "../components/index/Pricings";

const Home: NextPage = () => {
  return (
    <>
      <Banner />
      <Features />
      <Pricings />
    </>
  );
};

export default Home;

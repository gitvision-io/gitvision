import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Content } from "../components/Content";
import { Content1 } from "../components/Content1";
import { Content2 } from "../components/Content2";
import Footer from "../components/Footer";
import Nav from "../components/Nav";

const Home: NextPage = () => {
  return (
    <>
      <Nav />
      <Content />
      <Content1 />
      <Content2 />
      <Footer />
    </>
  );
};

export default Home;

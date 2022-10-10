import type { NextPage } from "next";
import { Content } from "../components/index/Content";
import { Content1 } from "../components/index/Content1";
import { Content2 } from "../components/index/Content2";

const Home: NextPage = () => {
  return (
    <>
      <Content />
      <Content1 />
      <Content2 />
    </>
  );
};

export default Home;

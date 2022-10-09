import type { NextPage } from "next";
import { Content } from "../components/Content";
import { Content1 } from "../components/Content1";
import { Content2 } from "../components/Content2";

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

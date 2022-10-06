import React from "react";
import Example from "../components/Dropdown";
import Footer from "../components/Footer";
import { Navbar } from "../components/Navbar";

function home() {
  const organizations = [
    {
      name: "flagshipio",
    },
    {
      name: "chadi",
    },
  ];

  const time = [
    { name: "last hour" },
    { name: "last 5 hour" },
    { name: "yesterday" },
    { name: "last week" },
  ];

  const repositories = [
    {
      name: "flagship-js-sdk",
    },
    {
      name: "flagship-ts-sdk",
    },
    {
      name: "flagship-go-sdk",
    },
  ];
  return (
    <div>
      <Navbar />
      <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
        <div className="grid row-gap-8 sm:grid-cols-5">
          <div className="text-center pr-8">
            <Example label={"Organization"} information={organizations} />
          </div>
          <div className="text-center pr-8">
            <Example label={"Time"} information={time} />
          </div>
          <div className="text-center">
            <Example label={"Repositories"} information={repositories} />
          </div>
        </div>
      </div>
      <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
        <div className="grid row-gap-8 sm:grid-cols-3">
          <div className="text-center">
            <p className="font-bold">Contributors</p>
            <h6 className="text-5xl font-bold text-deep-purple-accent-400">
              144K
            </h6>
          </div>
          <div className="text-center">
            <p className="font-bold">Active repository</p>
            <h6 className="text-5xl font-bold text-deep-purple-accent-400">
              12.9K
            </h6>
          </div>
          <div className="text-center">
            <p className="font-bold">Open issues</p>
            <h6 className="text-5xl font-bold text-deep-purple-accent-400">
              27.3K
            </h6>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default home;

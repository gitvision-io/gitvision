import Link from "next/link";
import React, { useState, useContext, useEffect } from "react";

function SignIn() {
  return (
    <>
      <div className="grid lg:grid-cols-2 min-h-screen dark:bg-deep-purple-900 dark:text-white">
        <div className="bg-gray-100 dark:bg-deep-purple-600 hidden lg:grid place-items-center">
          <div className="h-64 w-64 dark:bg-white bg-gray-900 rounded-full" />
          <div className="absolute bottom-0 h-1/2 w-1/2 dark:bg-gray-800/50 bg-gray-100/50 backdrop-blur-lg" />
        </div>
        <div className="grid place-items-center">
          <div className="max-w-sm w-full space-y-10">
            <div className="flex flex-col w-full max-w-md px-4 py-8 bg-white rounded-lg shadow dark:bg-white sm:px-6 md:px-8 lg:px-10">
              <div className="self-center mb-6 text-xl font-light text-gray-600 sm:text-2xl dark:text-black">
                Login To GitDashboard
              </div>
              <div className="self-center mb-6 text-xl font-light text-gray-600 sm:text-2xl dark:text-black">
                You’ll be taken to your repo provider to authenticate
              </div>
              <div className="flex gap-4 item-center">
                <Link href="/home">
                  <button
                    type="button"
                    className="py-2 px-4 flex justify-center items-center  bg-gray-600 hover:bg-gray-800 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                  >
                    Github
                  </button>
                </Link>
              </div>
              <div className="mt-8">
                <div className="flex gap-4 item-center">
                  <Link href="/home">
                    <button
                      type="button"
                      className="py-2 px-4 flex justify-center items-center  bg-orange-700 hover:bg-orange-900 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                    >
                      Gitlab
                    </button>
                  </Link>
                </div>
              </div>
              <div className="mt-8">
                <div className="flex gap-4 item-center">
                  <Link href="/home">
                    <button
                      type="button"
                      className="py-2 px-4 flex justify-center items-center  bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                    >
                      Bitbucket
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignIn;

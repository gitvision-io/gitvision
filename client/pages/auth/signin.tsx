import { getProviders, signIn } from "next-auth/react";

export default function Signin({
  providers,
}: {
  providers: { name: string; id: string }[];
}) {
  return (
    <>
      <div className="grid lg:grid-cols-2 min-h-screen dark:bg-deep-purple-900 dark:text-white">
        <div className="bg-gray-100 dark:bg-deep-purple-600 hidden lg:grid place-items-center relative">
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

              {Object.values(providers).map((provider) => (
                <div className="flex gap-4 item-center" key={provider.id}>
                  <button
                    type="button"
                    className="py-2 px-4 flex justify-center items-center  bg-gray-600 hover:bg-gray-800 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                    onClick={() =>
                      signIn(provider.id, { callbackUrl: "/dashboard" })
                    }
                  >
                    Github
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers, disableLayout: true },
  };
}

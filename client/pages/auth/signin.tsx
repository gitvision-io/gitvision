import { getProviders, signIn } from "next-auth/react";

export default function Signin({
  providers,
}: {
  providers: { name: string; id: string }[];
}) {
  return (
    <div className="flex h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-lg drop-shadow-lg bg-opacity-75 bg-deep-purple-accent-700 lg:-mt-28">
        <svg
          className="absolute inset-x-0 -bottom-1 text-white rounded-lg"
          viewBox="0 0 1160 163"
        >
          <path
            fill="currentColor"
            d="M-164 13L-104 39.7C-44 66 76 120 196 141C316 162 436 152 556 119.7C676 88 796 34 916 13C1036 -8 1156 2 1216 7.7L1276 13V162.5H1216C1156 162.5 1036 162.5 916 162.5C796 162.5 676 162.5 556 162.5C436 162.5 316 162.5 196 162.5C76 162.5 -44 162.5 -104 162.5H-164V13Z"
          />
        </svg>
        <div className="relative px-4 py-16 mx-auto overflow-hidden sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-28">
          <div className="flex flex-col items-center justify-between lg:flex-row">
            <div className="w-full max-w-xl mb-12 xl:mb-0 xl:pr-16 xl:w-7/12">
              <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl sm:leading-none">
                Sign to Gitvision using one of our compatible providers
              </h2>
              <p className="max-w-xl mb-4 text-base text-gray-200 md:text-lg">
                And access powerful insights to your git organizations right
                now.
              </p>
            </div>
            <div className="w-full max-w-xl xl:px-8 xl:w-5/12">
              <div className="bg-white rounded shadow-2xl p-7 sm:p-10">
                <h3 className="mb-4 text-xl font-semibold sm:text-center sm:mb-6 sm:text-2xl">
                  Sign in to access the dashboard
                </h3>
                <form>
                  <div className="mt-4 mb-2 sm:mb-4">
                    {Object.values(providers).map((provider) => (
                      <div className="flex gap-4 item-center" key={provider.id}>
                        <button
                          type="button"
                          className="py-2 px-4 flex justify-center items-center  bg-gray-600 hover:bg-gray-800 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                          onClick={() =>
                            signIn(provider.id, { callbackUrl: "/dashboard" })
                          }
                        >
                          {provider.name}
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 sm:text-sm">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers, disableLayout: true },
  };
}

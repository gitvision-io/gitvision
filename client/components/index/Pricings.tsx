import Link from "next/link";

const pricings = [
  {
    title: "Free",
    tag: "In beta",
    price: "$0",
    features: [
      "Unlimited organization",
      "Unlimited repositories",
      "6 month data retention",
    ],
    link: (
      <Link href="/api/auth/signin">
        <a className="inline-flex items-center justify-center w-full h-12 px-6 mt-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md bg-deep-purple-accent-400 hover:bg-deep-purple-accent-700 focus:shadow-outline focus:outline-none">
          Get started
        </a>
      </Link>
    ),
  },
];

const Pricings = () => {
  return (
    <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
      <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        <div>
          <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-teal-900 uppercase rounded-full bg-teal-accent-400">
            Our Pricing
          </p>
        </div>
        <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
          Transparent pricing. Pay as you grow.
        </h2>
        <p className="text-base text-gray-700 md:text-lg">
          All features are free. Pay for more retention and usage.
        </p>
      </div>
      <div className="grid max-w-md gap-10 row-gap-5 lg:max-w-screen-lg sm:row-gap-10 lg:grid-cols-3 xl:max-w-screen-lg sm:mx-auto">
        {pricings.map((p) => (
          <div
            key={p.title}
            className="col-start-2 relative flex flex-col justify-between p-8 transition-shadow duration-300 bg-white border rounded shadow-sm sm:items-center hover:shadow border-deep-purple-accent-400"
          >
            <div className="absolute inset-x-0 top-0 flex justify-center -mt-3">
              <div className="inline-block px-3 py-1 text-xs font-medium tracking-wider text-white uppercase rounded bg-deep-purple-accent-400">
                {p.tag}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{p.title}</div>
              <div className="flex items-center justify-center mt-2">
                <div className="mr-1 text-5xl font-bold">{p.price}</div>
                <div className="text-gray-700">/ mo</div>
              </div>
              <div className="mt-2 space-y-3">
                {p.features.map((f) => (
                  <div key={f} className="text-gray-700">
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div>{p.link}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricings;

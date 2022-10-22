import { Menu, Transition } from "@headlessui/react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ForwardedRef, forwardRef, Fragment, useState } from "react";
import { classNames } from "../../common/utils";
import Button from "../common/Button";

// This component is to forward onClick event from Menu.Item to close the menu on item click
const CustomLink = forwardRef(
  (
    props: { href: string; children: React.ReactNode; className: string },
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    const { href, children, className, ...rest } = props;
    return (
      <Link href={href}>
        <a ref={ref} className={className} {...rest}>
          {children}
        </a>
      </Link>
    );
  }
);

CustomLink.displayName = "CustomLink";

export const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const mainMenuItems =
    session && router.pathname != "/"
      ? [
          {
            label: "Dashboard",
            link: "/dashboard",
          },
        ]
      : [
          {
            label: "Product",
            link: "/#product",
          },
          {
            label: "Features",
            link: "/#features",
          },
          {
            label: "Pricing",
            link: "/#pricing",
          },
          {
            label: "About us",
            link: "/#about-us",
          },
        ];

  const userMenuItems = [
    {
      label: "Dashboard",
      link: "/dashboard",
    },
    {
      label: "Profile",
      link: "/profile",
    },
    {
      label: "Settings",
      link: "/settings",
    },
  ];

  return (
    <div className="px-4 py-5 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
      <div className="relative flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <a
              aria-label="Company"
              title="Company"
              className="inline-flex items-center mr-8"
            >
              <svg
                className="w-8 text-deep-purple-accent-400"
                viewBox="0 0 24 24"
                strokeLinejoin="round"
                strokeWidth="2"
                strokeLinecap="round"
                strokeMiterlimit="10"
                stroke="currentColor"
                fill="none"
              >
                <rect x="3" y="1" width="7" height="12" />
                <rect x="3" y="17" width="7" height="6" />
                <rect x="14" y="1" width="7" height="6" />
                <rect x="14" y="11" width="7" height="12" />
              </svg>
              <span className="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase">
                Git Dashboard
              </span>
            </a>
          </Link>
          {status !== "loading" && (
            <ul className="flex items-center hidden space-x-8 lg:flex">
              {mainMenuItems.map((item) => (
                <li key={item.link}>
                  <Link href={item.link}>
                    <a
                      aria-label={item.label}
                      title={item.label}
                      className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-deep-purple-accent-400"
                    >
                      {item.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        {!session && (
          <Button size="sm" isLink href="/auth/signin" variant="success">
            Sign in
          </Button>
        )}
        {session && (
          <ul className="flex items-center hidden space-x-8 lg:flex">
            <li className="font-medium tracking-wide text-gray-700 transition-colors duration-200">
              Welcome {session?.user?.email}
            </li>
            <li>
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="sr-only">Open user menu</span>
                    {session.user?.image && (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={session.user?.image}
                        alt=""
                      />
                    )}
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {userMenuItems.map((mi) => (
                      <Menu.Item key={mi.label}>
                        {({ active }) => (
                          <CustomLink
                            href={mi.link}
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            )}
                          >
                            {mi.label}
                          </CustomLink>
                        )}
                      </Menu.Item>
                    ))}
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? "bg-gray-100" : "",
                            "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          )}
                          onClick={() =>
                            signOut({ callbackUrl: "/auth/signin" })
                          }
                        >
                          Sign out
                        </a>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </li>
          </ul>
        )}
        <div className="lg:hidden">
          <button
            aria-label="Open Menu"
            title="Open Menu"
            className="p-2 -mr-1 transition duration-200 rounded focus:outline-none focus:shadow-outline hover:bg-deep-purple-50 focus:bg-deep-purple-50"
            onClick={() => setIsMenuOpen(true)}
          >
            <svg className="w-5 text-gray-600" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M23,13H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,13,23,13z"
              />
              <path
                fill="currentColor"
                d="M23,6H1C0.4,6,0,5.6,0,5s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,6,23,6z"
              />
              <path
                fill="currentColor"
                d="M23,20H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,20,23,20z"
              />
            </svg>
          </button>
          {isMenuOpen && (
            <div className="absolute top-0 left-0 w-full z-10">
              <div className="p-5 bg-white border rounded shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Link href="/">
                      <a
                        aria-label="Company"
                        title="Company"
                        className="inline-flex items-center"
                      >
                        <svg
                          className="w-8 text-deep-purple-accent-400"
                          viewBox="0 0 24 24"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeMiterlimit="10"
                          stroke="currentColor"
                          fill="none"
                        >
                          <rect x="3" y="1" width="7" height="12" />
                          <rect x="3" y="17" width="7" height="6" />
                          <rect x="14" y="1" width="7" height="6" />
                          <rect x="14" y="11" width="7" height="12" />
                        </svg>
                        <span className="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase">
                          Company
                        </span>
                      </a>
                    </Link>
                  </div>
                  <div>
                    <button
                      aria-label="Close Menu"
                      title="Close Menu"
                      className="p-2 -mt-2 -mr-2 transition duration-200 rounded hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 text-gray-600" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M19.7,4.3c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l6.3,6.3l-6.3,6.3 c-0.4,0.4-0.4,1,0,1.4C4.5,19.9,4.7,20,5,20s0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3 c0.4-0.4,0.4-1,0-1.4L13.4,12l6.3-6.3C20.1,5.3,20.1,4.7,19.7,4.3z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <nav>
                  <ul className="space-y-4">
                    {mainMenuItems.map((item) => (
                      <li key={item.link}>
                        <a
                          href={item.link}
                          aria-label={item.label}
                          title={item.label}
                          className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-deep-purple-accent-400"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                    {session && (
                      <>
                        <li>
                          <div className="inline-flex items-center justify-center w-full h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md bg-deep-purple-accent-400 hover:bg-deep-purple-accent-700 focus:shadow-outline focus:outline-none">
                            <button
                              type="button"
                              className="flex items-center focus:outline-none"
                              aria-label="toggle profile dropdown"
                              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            >
                              <div className="w-8 h-8 overflow-hidden border-2 border-gray-400 rounded-full">
                                {session.user?.image && (
                                  <img
                                    src={session.user?.image}
                                    className="object-cover w-full h-full"
                                    alt="avatar"
                                  />
                                )}
                              </div>

                              <h3 className="mx-2 text-white dark:text-gray-200 lg:hidden">
                                {session.user?.email}
                              </h3>
                            </button>
                          </div>
                        </li>
                        {isUserMenuOpen &&
                          userMenuItems.map((item) => (
                            <li key={item.link}>
                              <a
                                href={item.link}
                                aria-label={item.label}
                                title={item.label}
                                className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-deep-purple-accent-400"
                              >
                                {item.label}
                              </a>
                            </li>
                          ))}
                      </>
                    )}
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

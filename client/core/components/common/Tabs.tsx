import { Tab } from "@headlessui/react";
import React from "react";
import { classNames } from "../../common/utils";

const Tabs = ({
  tabs,
}: {
  tabs: { label: string; component: React.ReactNode }[];
}) => {
  return (
    <Tab.Group>
      <Tab.List className="flex space-x-1 rounded-xl py-2">
        {tabs.map((t) => (
          <Tab
            key={t.label}
            className={({ selected }) =>
              classNames(
                "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-gray-700",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-gray-400 focus-visible:outline-none",
                selected
                  ? "bg-white shadow font-bold"
                  : "text-gray-700 hover:bg-white/[0.6] hover:text-gray-900"
              )
            }
          >
            {t.label}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {tabs.map((t) => (
          <Tab.Panel key={t.label} className="bg-white rounded-lg">
            {t.component}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default Tabs;

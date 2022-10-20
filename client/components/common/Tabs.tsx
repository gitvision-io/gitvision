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
      <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
        {tabs.map((t) => (
          <Tab
            key={t.label}
            className={({ selected }) =>
              classNames(
                "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-white shadow"
                  : "text-blue-700 hover:bg-white/[0.12] hover:text-white"
              )
            }
          >
            {t.label}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {tabs.map((t) => (
          <Tab.Panel key={t.label}>{t.component}</Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default Tabs;

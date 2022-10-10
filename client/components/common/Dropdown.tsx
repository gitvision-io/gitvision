import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

type DropdownSingleValue = string | number;
type DropdownValue = DropdownSingleValue | DropdownSingleValue[];

interface DropdownProps {
  label: string;
  items: { label: string; value: DropdownSingleValue }[];
  value?: DropdownValue;
  onChange: (value: DropdownValue) => void;
  multiple: boolean;
  disabled: boolean;
}

const Dropdown = ({
  label,
  items,
  value,
  onChange,
  multiple,
  disabled,
}: DropdownProps) => {
  const selected = items.find((i) => i.value === value);
  const selectedMultiple = multiple
    ? items.filter((i) =>
        ((value || []) as DropdownSingleValue[]).includes(i.value)
      )
    : [];

  return (
    <Listbox
      value={multiple ? selectedMultiple : selected}
      onChange={(v) =>
        onChange(
          multiple
            ? (v as { label: string; value: DropdownSingleValue }[]).map(
                (i) => i.value
              )
            : (v as { label: string; value: DropdownSingleValue }).value
        )
      }
      multiple={multiple}
      disabled={disabled}
    >
      {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium text-gray-700">
            {label}
          </Listbox.Label>
          <div className="relative mt-1">
            <Listbox.Button
              className={`relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-200`}
            >
              <span className="flex items-center">
                <span className="ml-3 block truncate">
                  {multiple && `${selectedMultiple.length} selected`}
                  {!multiple && (selected?.label || "Select a value")}
                </span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {items.map((item) => (
                  <Listbox.Option
                    key={item.value}
                    className={({ active }) =>
                      classNames(
                        active ? "text-white bg-indigo-600" : "text-gray-900",
                        "relative cursor-default select-none py-2 pl-3 pr-9"
                      )
                    }
                    value={item}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "ml-3 block truncate"
                            )}
                          >
                            {item.label}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-indigo-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};

Dropdown.defaultProps = {
  multiple: false,
  disabled: false,
};

export default Dropdown;

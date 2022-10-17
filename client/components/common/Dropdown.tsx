import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

type DropdownSingleValue = string | number;
export type DropdownValue = DropdownSingleValue | DropdownSingleValue[];

interface DropdownProps {
  label: string;
  items: { label: string; value: DropdownSingleValue }[];
  value?: DropdownValue;
  onChange: (value: DropdownValue) => void;
  multiple: boolean;
  disabled: boolean;
  defaultSelect: string;
}

const Dropdown = ({
  label,
  items,
  value,
  onChange,
  multiple,
  disabled,
  defaultSelect,
}: DropdownProps) => {
  const selected = items.find((i) => i.value === value)?.value;
  const selectedMultiple = (
    multiple
      ? items.filter((i) =>
          ((value || []) as DropdownSingleValue[]).includes(i.value)
        )
      : []
  ).map((v) => v.value);

  const isAllSelected = multiple && selectedMultiple.length === items.length;

  const onChangeLocal = (v: DropdownValue) => {
    let toChange = v;
    if (Array.isArray(v) && v.includes("all_items")) {
      toChange = isAllSelected ? [] : items.map((i) => i.value);
    }
    onChange(toChange);
  };

  return (
    <Listbox
      value={multiple ? selectedMultiple : selected}
      onChange={onChangeLocal}
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
                  {!multiple && (selected || defaultSelect)}
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
                {multiple && (
                  <Listbox.Option
                    className={({ active }) =>
                      classNames(
                        active ? "text-white bg-indigo-600" : "text-gray-900",
                        "relative cursor-default select-none py-2 pl-3 pr-9"
                      )
                    }
                    value="all_items"
                  >
                    <div className="flex items-center">
                      <span
                        className="font-normal ml-3 block truncate"
                        title="Select all"
                      >
                        Select all
                      </span>
                    </div>
                  </Listbox.Option>
                )}

                {items.map((item) => (
                  <Listbox.Option
                    key={item.value}
                    className={({ active }) =>
                      classNames(
                        active ? "text-white bg-indigo-600" : "text-gray-900",
                        "relative cursor-default select-none py-2 pl-3 pr-9"
                      )
                    }
                    value={item.value}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "ml-3 block truncate"
                            )}
                            title={item.label}
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
  defaultSelect: "Select a value",
};

export default Dropdown;

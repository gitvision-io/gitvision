import { signOut } from "next-auth/react";
import React from "react";
import { useState } from "react";
import Button from "../components/common/Button";
import { getInstance } from "../services/api";

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const revokeApplication = () => {
    setIsLoading(true);
    getInstance()
      .delete("/api/users/me/gitProvider")
      .then(() => {
        setIsLoading(false);
        signOut({
          callbackUrl: "/auth/signin",
        });
      });
  };

  return (
    <div className="mt-10 sm:mt-0">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Your settings
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Manage your application settings
            </p>
          </div>
        </div>
        <div className="mt-5 md:col-span-2 md:mt-0">
          <form>
            <p className="mb-3 text-lg text-gray-900 dark:text-white">
              Github application settings
            </p>
            <div className="overflow-hidden shadow sm:rounded-md">
              <div className="bg-gray-50 px-4 py-3 text-left sm:px-6">
                <Button
                  isLoading={isLoading}
                  isDisabled={isLoading}
                  onClick={revokeApplication}
                >
                  Revoke application access
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;

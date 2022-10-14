import { GetServerSidePropsContext } from "next";
import React, { FormEvent } from "react";
import { useState } from "react";
import { SESSION_COOKIE_NAME } from "../common/constants";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { getInstance, setToken } from "../services/api";

interface User {
  id: string;
  githubId: string;
  email: string;
  name: string;
}

const Profile = ({ user }: { user: User }) => {
  const [userState, setUserState] = useState(user);
  const [isLoading, setIsLoading] = useState(false);

  const [alert, setAlert] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setAlert(false);

    getInstance()
      .put("/api/users/me/profile", {
        name: userState.name,
      })
      .then(() => {
        setIsLoading(false);
        setAlert(true);
      });
  };

  return (
    <div className="mt-10 sm:mt-0">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Your profile
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Fill out your personal informations
            </p>
          </div>
        </div>
        <div className="mt-5 md:col-span-2 md:mt-0">
          <form onSubmit={onSubmit}>
            <div className="overflow-hidden shadow sm:rounded-md">
              <div className="bg-white px-4 py-5 sm:p-6">
                {alert && <Alert variant="success">Profile saved!</Alert>}
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <Input
                      id="user-id"
                      label="ID"
                      type="text"
                      readOnly
                      value={user.id}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <Input
                      id="email-address"
                      label="Email address"
                      type="email"
                      value={userState.email}
                      readOnly
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <Input
                      id="name"
                      label="Name"
                      value={userState.name}
                      onChange={(e) =>
                        setUserState({ ...userState, name: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                <Button
                  type="submit"
                  variant="success"
                  isLoading={isLoading}
                  isDisabled={isLoading}
                >
                  Save
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  setToken(context.req.cookies[SESSION_COOKIE_NAME] || "");
  const user = await getInstance()
    .get("/api/users/me")
    .then((res) => res.data);
  return {
    props: { user }, // will be passed to the page component as props
  };
}

export default Profile;

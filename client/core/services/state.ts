import { atom } from "jotai";
import { User } from "../common/types";
import { getInstance } from "./api";

const userState = atom<User | null>(null);

const asyncRefreshUser = atom(null, async (get, set) => {
  const user = await getInstance().get("/api/users/me");
  set(userState, user.data);
});

export { userState, asyncRefreshUser };

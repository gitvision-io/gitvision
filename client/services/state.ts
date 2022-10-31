import { atom } from "jotai";
import { User } from "../common/types";

const userState = atom<User | null>(null);

export { userState };

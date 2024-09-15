import { create } from "zustand";

export interface dataType {
  avatar_url?: string | null | undefined;
  avatar_filename?: string | null | undefined;
  full_name?: string | null | undefined;
  bio?: string | null | undefined;
  gender?: string | null | undefined;
  sport?: string | null | undefined;
  birthDate?: string | null | undefined;
  usersId: string;
  username?: string;
}

export interface userDataType {
  data: dataType;
  setUserData(data: dataType): void;
  removeUserData(): void;
}

const userDataStore = create<userDataType>((set) => ({
  data: { usersId: "" },
  setUserData(data: dataType) {
    set({ data });
  },
  removeUserData() {
    set({ data: { usersId: "" } });
  },
}));

export default userDataStore;
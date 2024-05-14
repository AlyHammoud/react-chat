import { DocumentData, doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firabase";
type User = {
  id: string;
  username: string;
  avatar: string;
  email: string;
  blocked: string[];
};
type Store<T> = {
  currentUser?: T | null;
  isLoading: boolean;
  fetchUserInfo: (uid: string | null) => void;
  setIsLoading: (loading: boolean) => void;
};

export const useUserStore = create<Store<User>>()((set) => ({
  currentUser: null,
  fetchUserInfo: async (uid) => {
    if (!uid) return set({ currentUser: null, isLoading: false });

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ currentUser: docSnap.data() as User, isLoading: false });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    } catch (error) {
      console.log(error.message);
      set({ currentUser: null, isLoading: false });
    }
  },

  isLoading: true,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
}));

import { DocumentData, doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firabase";

import { useUserStore } from "./userStore";
type User = {
  id: string;
  username: string;
  avatar: string;
  email: string;
  blocked: string[];
};

type Store<T> = {
  chatId: string | null;
  user: T | null;
  isCurrentUserBlocked: boolean;
  isReceiverBlocked: boolean;
  changeChat: (chatId: string | null, user: T | null) => void;
  changeBlock: () => void;
};

export const useChatStore = create<Store<User>>()((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,

  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    // check if current user is blocked
    if (user?.blocked.includes(currentUser!.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    }

    //check if we blocked user
    if (user?.blocked.includes(currentUser!.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    }

    return set({
      chatId,
      user: user,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },

  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },
}));

import React, { useEffect, useState } from "react";
import "./chatList.css";

import { db } from "../../../lib/firabase";
import { useUserStore } from "../../../lib/userStore";
import {
  DocumentData,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import AddUser from "./addUser/AddUser";
import { useChatStore } from "../../../lib/chatStore";

type Props = {};

const ChatList = (props: Props) => {
  const { currentUser } = useUserStore();
  const { changeChat, chatId } = useChatStore();

  const [chats, setChats] = useState<DocumentData[]>([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "userchats", currentUser!.id),
      async (res) => {
        const items = res.data()?.chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return {
            ...item,
            user,
          };
        });

        const chatData = await Promise.all(promises);

        if (chatData) {
          const chatArray = chatData;
          setChats(chatArray.sort((a, b) => b.updatedAt - a.updatedAt));
        }
      }
    );

    return () => {
      unsub();
    };
  }, [currentUser!.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((chat) => {
      const { user, ...item } = chat;
      return item;
    });

    const chatIndex = userChats.findIndex((chat) => chatId == chat.id);

    userChats[chatIndex].isSeen = true;

    const userChatRef = doc(db, "userchats", currentUser!.id);

    try {
      await updateDoc(userChatRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredChats = chats.filter((c) => {
    return c?.user.username?.toLowerCase().includes(input?.toLowerCase());
  });

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            name="search"
            id=""
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          onClick={() => setAddMode((prev) => !prev)}
          alt=""
          className="add"
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{ backgroundColor: chat.isSeen ? "transparent" : "blue" }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser!.id)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            alt=""
          />
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser!.id)
                ? "User"
                : chat.user.username}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;

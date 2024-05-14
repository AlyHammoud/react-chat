import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import "./chat.css";

import EmojiPicker from "emoji-picker-react";
import {
  DocumentData,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../lib/firabase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

type Props = {};
type Image = {
  file: File | null;
  url: string | null;
};
const Chat = (props: Props) => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();

  const [open, setOpen] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [chat, setChat] = useState<DocumentData | null>(null);
  const [img, setImg] = useState<Image>({
    file: null,
    url: null,
  });

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "chats", chatId || ""), (res) => {
      if (res.data()) {
        setChat(res?.data() ?? null);
      }
    });

    return () => {
      unsub();
    };
  });

  const handleEmoji = (event: any, emojiObject: any) => {
    setText((prev) => prev + event.emoji);
    setOpen(false);
  };

  // alert(JSON.stringify(chat));
  const handleSend = async () => {
    if (!text) return;

    let imgUrl: string | null = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      await updateDoc(doc(db, "chats", chatId ?? ""), {
        messages: arrayUnion({
          sendId: currentUser!.id,
          text: text,
          createdAt: new Date(),
          img: imgUrl,
        }),
      });

      const userIds = [currentUser?.id, user?.id];
      userIds.forEach(async (id) => {
        const userChatRef = doc(db, "userchats", id!);
        const userChatsSnapShot = await getDoc(userChatRef);

        if (userChatsSnapShot.exists()) {
          const userChatsData = userChatsSnapShot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId == chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id == currentUser!.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }

    setImg({
      file: null,
      url: "",
    });

    setText("");
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };
  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>{user?.email}</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {!chat?.messages ? (
          <div className="message own">
            <div className="texts">
              <p>No Messages Yet !</p>
              <span>1 min ago</span>
            </div>
          </div>
        ) : (
          chat.messages.map((message) => (
            <div
              className={`message ${
                currentUser!.id == message.sendId ? "own" : ""
              }`}
              key={message.createdAt}
            >
              <div className="texts">
                {message.img && <img src={message.img} alt="" />}
                <p>{message.text}</p>
                {/* <span>{message.createdAt}</span> */}
              </div>
            </div>
          ))
        )}
        {img.url && (
          <div className={`message own`}>
            <div className="texts">
              <img src={img.url} alt="" />

              {/* <span>{message.createdAt}</span> */}
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            name=""
            id="file"
            onChange={handleImage}
            style={{ display: "none" }}
          />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        {/* <input
          type="text"
          placeholder="Type a message..."
          name=""
          id=""
          value={text!}
          onChange={(e) => setText(e.target.value)}
        /> */}
        <textarea
          name=""
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "cannot send a message"
              : "Type a message..."
          }
          id=""
          value={text!}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;

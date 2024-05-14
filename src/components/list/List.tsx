import "./list.css";
import React from "react";
import UserInfo from "./userInfo/UserInfo";
import ChatList from "./chatList/ChatList";

type Props = {};

const List = (props: Props) => {
  return (
    <div className="list">
      <UserInfo />
      <ChatList />
    </div>
  );
};

export default List;

import React from "react";
import "./userInfo.css";

import { useUserStore } from "../../../lib/userStore";

type Props = {};

const UserInfo = (props: Props) => {
  const { currentUser } = useUserStore();
  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser?.avatar || "./avatar.png"} />
        <h2>{currentUser?.username || "No Name"} </h2>
      </div>
      <div className="icons">
        <img src="./more.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </div>
    </div>
  );
};

export default UserInfo;

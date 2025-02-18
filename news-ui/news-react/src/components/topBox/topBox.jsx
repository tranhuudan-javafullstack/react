import React from 'react';
import './topbox.scss';
import { Alert } from 'antd'

const AVATAR_NAMES = [
  "Samantha", "Daisy", "Simba", "Jasmine", "Boo", "Bailey", "Toby", "Sugar", "Spooky", "Cuddles",
  "Buddy", "Oscar", "Boots", "Sheba", "Harley", "Buster", "Scooter", "Mimi", "Abby", "Tinkerbell"
];

function getRandomAvatar() {
  const avatarRandom = AVATAR_NAMES[Math.floor(Math.random() * AVATAR_NAMES.length)];
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${avatarRandom}`;
}

const TopBox = ({ comments = [] }) => {
  return (
    <div className="topBox">
      <h2 style={{ marginBottom: '25px' }}>Bình luận mới nhất</h2>
      <div className="list">
        {Array.isArray(comments) && comments.length > 0 ? (
          comments.map((comment) => (
            <div className="listItem" key={comment.commentId}>
              <div className="createdAt">
                <span  >
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="commentContent">
                <p>{comment.commentContent}</p>
              </div>
              <div className="user">
                <img
                  src={comment.userImg || getRandomAvatar()}
                  alt=""
                />
                <div className="userTexts">
                  <span className="username">{comment.username || 'Người ẩn danh'}</span>
                  <span className="email">{comment.email || 'No email'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <Alert message="Chưa có bình luận nào" type="info" />
        )}
      </div>
    </div>
  );
};

export default TopBox;

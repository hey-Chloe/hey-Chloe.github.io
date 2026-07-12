'use client';

import { useState } from 'react';

type Friend = {
  name: string;
  url: string;
  avatar: string;
  domain: string;
};

export default function FriendCard({ friend }: { friend: Friend }) {
  const [failed, setFailed] = useState(false);

  return (
    <a
      href={friend.url}
      target="_blank"
      rel="noopener noreferrer"
      className="friend-paper no-underline"
    >
      {failed ? (
        <span className="friend-avatar friend-avatar--fallback" aria-label={`${friend.name} avatar`}>
          {friend.name.slice(0, 1).toUpperCase()}
        </span>
      ) : (
        <img
          src={friend.avatar}
          alt={`${friend.name} avatar`}
          className="friend-avatar"
          onError={() => setFailed(true)}
        />
      )}
      <span className="min-w-0">
        <strong className="friend-name">{friend.name}</strong>
        <span className="friend-domain">{friend.domain}</span>
      </span>
    </a>
  );
}

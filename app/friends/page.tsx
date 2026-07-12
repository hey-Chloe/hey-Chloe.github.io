import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';
import FriendCard from '@/components/FriendCard';

export const metadata: Metadata = {
  title: 'Friends',
  description: 'Chloe 的友链页面。'
};

const friends = [
  {
    name: 'SnowCat',
    url: 'https://sadsnowcat.com',
    avatar: 'https://sadsnowcat.com/images/head.jpg',
    domain: 'sadsnowcat.com'
  },
  {
    name: 'S0loWalker',
    url: 'https://s0lowalker.github.io/',
    avatar: 'https://github.com/s0lowalker.png',
    domain: 's0lowalker.github.io'
  }
];

export default function FriendsPage() {
  return (
    <PageIntro title="Friends">
      <section className="friends-sheet mx-auto mt-14 max-w-[800px] p-8 sm:p-10">
        <h2 className="friends-heading">Friendly Links</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {friends.map((friend) => <FriendCard key={friend.url} friend={friend} />)}
        </div>
      </section>
    </PageIntro>
  );
}

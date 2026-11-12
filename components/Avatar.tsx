import type { ViewUser } from '@/lib/user';

export default function Avatar({ user, size = 38 }: { user: ViewUser; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }} aria-hidden="true">
      {user.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatar} alt="" referrerPolicy="no-referrer" />
      ) : (
        user.initial
      )}
    </span>
  );
}

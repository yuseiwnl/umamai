export default function ProfileStats({ postsCount }: { postsCount: number }) {
  return (
    <div className="mt-2 grid grid-cols-3 gap-8">
      <div className="flex flex-col items-center">
        <span className="text-xl font-semibold">{postsCount}</span>
        <span className="text-xs uppercase tracking-wide text-slate-500">
          Posts
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xl font-semibold">0</span>
        <span className="text-xs uppercase tracking-wide text-slate-500">
          Followers
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xl font-semibold">0</span>
        <span className="text-xs uppercase tracking-wide text-slate-500">
          Following
        </span>
      </div>
    </div>
  );
}

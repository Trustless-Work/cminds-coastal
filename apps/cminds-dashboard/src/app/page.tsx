import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">CMinds Dashboard</h1>
      <Link className="text-sm underline" href="/login">
        Sign in
      </Link>
    </div>
  );
}

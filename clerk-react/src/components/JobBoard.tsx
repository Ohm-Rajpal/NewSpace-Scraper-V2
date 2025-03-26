import { SignOutButton } from "@clerk/clerk-react";

export default function JobBoard() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-3xl font-bold mb-4">Welcome to My App</h1>
    <SignOutButton>
      <button className="px-4 py-2 bg-blue-500 text-white rounded">Sign In</button>
    </SignOutButton>
  </div>
  );
}
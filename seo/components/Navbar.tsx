import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-[#07090b] text-white px-4 py-3 flex justify-between items-center border-b border-gray-800">
      <Link href='/' className="text-xl font-bold tracking-tight">Change</Link>
      <nav className="hidden md:flex space-x-4 text-sm">
        <Link href='/dashboard/seo'>Dashboard</Link>
      </nav>
    </header>
  );
}

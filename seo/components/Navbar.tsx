import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-[#07090b] text-white px-6 py-2 flex justify-between items-center border-b border-gray-800">
      <Link href='/' className="text-2xl font-bold tracking-tight hover:text-gray-300 transition-colors">
        Change
      </Link>
      <nav className="hidden md:flex space-x-6 text-sm font-medium">
        <Link
          href='/dashboard/seo'
          className="px-3 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Dashboard
        </Link>
      </nav>
    </header>
  );
}

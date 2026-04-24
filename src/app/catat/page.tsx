import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { CatatEditor } from "@/components/catat-editor";

export default async function CatatPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col mt-8">
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">MyApplied</h1>
            <nav className="hidden sm:flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Dashboard
              </Link>
              <Link
                href="/catat"
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              >
                Catat
              </Link>
            </nav>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {session?.user?.email}
                </p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/auth/login" });
                }}
              >
                <button
                  type="submit"
                  className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors whitespace-nowrap"
                >
                  Keluar
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16 px-4 sm:px-6 lg:px-8 pb-6 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Catatan Bebas</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Satu halaman catatan dengan rich text. Perubahan disimpan otomatis ke database.
            </p>
          </div>
          <CatatEditor />
        </div>
      </main>
    </div>
  );
}

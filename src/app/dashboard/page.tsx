import { auth, signOut } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { ApplicationsList } from "@/components/applications-list";
import { HeaderSearch } from "@/components/header-search";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">MyApplied</h1>
            
            {/* Search Bar in Header - Always visible */}
            <div className="flex-1">
              <HeaderSearch />
            </div>
            
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

      {/* Main Content - with top padding for fixed header */}
      <div className="pt-14 flex-1">
        <ApplicationsList />
      </div>
    </div>
  );
}

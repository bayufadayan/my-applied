import { auth, signOut } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { ApplicationsList } from "@/components/applications-list";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MyApplied</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kelola lamaran kerja Anda
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="text-right hidden sm:block">
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
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Keluar
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ApplicationsList />
      </main>
    </div>
  );
}

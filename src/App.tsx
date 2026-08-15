import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ChefHat, Calendar, ShoppingCart, Settings, BookOpen, Plus, Camera, Search, User, Search as SearchIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Layout Component
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: BookOpen, label: 'Recepty' },
    { path: '/plan', icon: Calendar, label: 'Plán' },
    { path: '/ai-chef', icon: ChefHat, label: 'AI Kuchař' },
    { path: '/cart', icon: ShoppingCart, label: 'Nákup' },
    { path: '/settings', icon: Settings, label: 'Nastavení' }
  ];

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 font-sans">
      <aside className="hidden md:flex flex-col w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
            <ChefHat className="text-orange-500" />
            Win3 Chef
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active 
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white" 
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800 flex justify-around p-2 pb-safe z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg gap-1",
                active ? "text-orange-500" : "text-neutral-500 dark:text-neutral-400"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  );
}

// Pages Placeholders
import Dashboard from './pages/Dashboard';
import RecipeDetail from './pages/RecipeDetail';
import RecipeEditor from './pages/RecipeEditor';
import MealPlanner from './pages/MealPlanner';
import ShoppingList from './pages/ShoppingList';
import SettingsPage from './pages/SettingsPage';
import AIChef from './pages/AIChef';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/recipe/new" element={<RecipeEditor />} />
          <Route path="/recipe/edit/:id" element={<RecipeEditor />} />
          <Route path="/plan" element={<MealPlanner />} />
          <Route path="/cart" element={<ShoppingList />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/ai-chef" element={<AIChef />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

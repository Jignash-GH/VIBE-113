import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { Quiz } from './components/Quiz';
import { Home } from './components/Home';
import { Loader2 } from 'lucide-react';
import { HelpProvider } from './contexts/HelpContext';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (profile && !profile.learning_level) {
    return <Quiz onComplete={() => window.location.reload()} />;
  }

  return <Home />;
}

function App() {
  return (
    <AuthProvider>
      <HelpProvider>
        <AppContent />
      </HelpProvider>
    </AuthProvider>
  );
}

export default App;

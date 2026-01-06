import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { Quiz } from './components/Quiz';
import { Home } from './components/Home';
import { Loader2 } from 'lucide-react';
import { HelpProvider } from './contexts/HelpContext';
import { useState } from 'react';

function AppContent() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleQuizComplete = async () => {
    setQuizCompleted(true);
    // Refresh profile to get the latest data after quiz completion
    await refreshProfile();
  };

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
    return <Quiz onComplete={handleQuizComplete} />;
  }

  if (quizCompleted) {
    // Force re-render to refresh profile data
    return <Home key="refresh-after-quiz" />;
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

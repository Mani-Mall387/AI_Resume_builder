import { Outlet , Navigate } from 'react-router-dom'
import './App.css'
import { useUser } from '@clerk/clerk-react'
import SignInPage from './auth/sign-in/sign-in'
import Header from './components/ui/custom/Header';
import { Toaster } from 'sonner';
import { Textarea } from "@/components/ui/textarea"

// import { Toaster } from "@/components/ui/toaster"
function App() {
  const {user, isLoaded, isSignedIn}=useUser(); //this will give the infomation- its loaded or not

  if (!isSignedIn && isLoaded) {
    return <Navigate to='/auth/sign-in' />;
  }
  return (
    <>
      <div>
        <Header />
        <Outlet />
        <Toaster />
      </div>
    </>
  );
}

export default App

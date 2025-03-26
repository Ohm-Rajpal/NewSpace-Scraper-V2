import { SignedIn, SignedOut } from '@clerk/clerk-react'
import Landing from "./components/Landing.tsx";
import JobBoard from "./components/JobBoard.tsx";

export default function App() {
  return (
    <header>

      {/* landing page if not singed in */}
      <SignedOut>
        {/* should have a sign in page and just have the NewSpace portal */}
        <Landing /> 
      </SignedOut>

      {/* logged in page will show NewSpace Job Board */}
      <SignedIn>
        {/* should have sign out page and should display  */}
        <JobBoard />
      </SignedIn>
    </header>
  )
}


import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#0a192f', // Full dark blue background
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <SignedOut>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
            maxWidth: '500px',
            background: 'rgba(255, 255, 255, 0.1)', // Semi-transparent card
            backdropFilter: 'blur(10px)',
            padding: '50px',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: 'white',
            }}
          >
            NewSpace JobBoard
          </h1>
          <p
            style={{
              fontSize: '18px',
              marginBottom: '30px',
              color: '#ccd6f6', // Lighter blue for contrast
            }}
          >
            Sign in to explore top aerospace jobs 🚀
          </p>
          <SignInButton>
            <button
              style={{
                backgroundColor: '#64ffda',
                color: '#0a192f',
                fontWeight: 'bold',
                padding: '14px 40px',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#4de1c3';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#64ffda';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>


      <SignedIn>
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
          }}
        >
          NewSpace JobBoard
        </div>
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
          }}
        >
          <UserButton />
        </div>
      </SignedIn>

      
    </div>
  );
}

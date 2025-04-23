import React, { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import axios from 'axios';

interface Job {
  title: string;
  company_name: string;
  location: string;
  description: string;
  qualifications: string;
  responsibilities: string;
  link?: string;
}

const App: React.FC = () => {
  const [jobData, setJobData] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const dataExtraction = async () => {
    try {
      const response = await axios.get('https://newspace-scraper-v2.onrender.com/api/read');
      return response.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const formatData = async (): Promise<Job[]> => {
    try {
      const jobData = await dataExtraction();
      return jobData.map((job: Job) => ({
        title: job.title,
        company_name: job.company_name,
        location: job.location,
        description: job.description,
        qualifications: job.qualifications,
        responsibilities: job.responsibilities,
        link: job.link,
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const formattedData = await formatData();
      setJobData(formattedData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#0a192f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        margin: 0,
        overflow: 'hidden',
        position: 'relative',
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
            background: 'rgba(255, 255, 255, 0.1)', 
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
              color: '#ccd6f6', 
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
        {/* Sign Out Button Positioned Absolutely */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10,
          }}
        >
          <UserButton
            appearance={{
              elements: {
                userButtonTrigger: {
                  width: '50px',
                  height: '50px',
                },
                userButtonAvatarBox: {
                  width: '50px',
                  height: '50px',
                }
              }
            }}
          />
        </div>

        <div 
          style={{
            width: '100%',
            maxWidth: '1400px', // Increased max-width for better centering
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              color: 'white',
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '30px',
              textAlign: 'center',
              width: '100%',
            }}
          >
            NewSpace JobBoard
          </h1>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '30px', // Increased spacing between cards
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {isLoading ? (
              <div 
                style={{
                  gridColumn: 'span full',
                  color: 'white',
                  textAlign: 'center',
                  fontSize: '20px',
                }}
              >
                Loading jobs...
              </div>
            ) : jobData.length > 0 ? (
              jobData.map((job, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '25px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    color: 'white',
                    maxWidth: '400px', // Limit card width
                    width: '100%',
                  }}
                  onClick={() => window.open(job.link || '#', '_blank')}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <h2 
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#64ffda',
                      marginBottom: '10px',
                    }}
                  >
                    {job.title}
                  </h2>
                  <p 
                    style={{
                      color: '#ccd6f6',
                      marginBottom: '5px',
                    }}
                  >
                    {job.company_name}
                  </p>
                  <p 
                    style={{
                      color: '#8892b0',
                      marginBottom: '15px',
                    }}
                  >
                    {job.location}
                  </p>

                  <div>
                    <h3 
                      style={{
                        color: '#64ffda',
                        marginBottom: '5px',
                      }}
                    >
                      Qualifications:
                    </h3>
                    <p 
                      style={{
                        color: '#ccd6f6',
                        marginBottom: '10px',
                      }}
                    >
                      {job.qualifications}
                    </p>

                    <h3 
                      style={{
                        color: '#64ffda',
                        marginBottom: '5px',
                      }}
                    >
                      Responsibilities:
                    </h3>
                    <p 
                      style={{
                        color: '#ccd6f6',
                        marginBottom: '15px',
                      }}
                    >
                      {job.responsibilities}
                    </p>
                  </div>

                  <button
                    style={{
                      backgroundColor: '#64ffda',
                      color: '#0a192f',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      width: '100%', // Full-width button
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(job.link || '#', '_blank');
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#4de1c3';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#64ffda';
                    }}
                  >
                    View Job
                  </button>
                </div>
              ))
            ) : (
              <div 
                style={{
                  gridColumn: 'span full',
                  color: 'white',
                  textAlign: 'center',
                  fontSize: '20px',
                }}
              >
                No jobs found
              </div>
            )}
          </div>
        </div>
      </SignedIn>
    </div>
  );
};

export default App;
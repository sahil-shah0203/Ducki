"use client";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../public/duck.png";

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface AsteroidComponentProps {
  key: number;
  style: React.CSSProperties;
}

const AsteroidComponent: React.FC<AsteroidComponentProps> = ({ key, style }) => {
  return (
    <div key={key} style={style} className="asteroid">
      <Image src={logo} alt="Duck Logo" width={50} height={50} />
    </div>
  );
};

export default function Landing() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);

  useEffect(() => {
    if (isSignedIn) {
      router.push("/main");
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAsteroids((prevAsteroids) => [
        ...prevAsteroids,
        {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
        },
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animationLoop = () => {
      setAsteroids((prevAsteroids) =>
        prevAsteroids.map((asteroid) => {
          asteroid.x += asteroid.vx;
          asteroid.y += asteroid.vy;

          if (asteroid.x < 0 || asteroid.x > window.innerWidth) {
            asteroid.vx = -asteroid.vx;
          }
          if (asteroid.y < 0 || asteroid.y > window.innerHeight) {
            asteroid.vy = -asteroid.vy;
          }

          return asteroid;
        })
      );

      requestAnimationFrame(animationLoop);
    };

    animationLoop();
  }, []);

  const renderAsteroids = () => {
    return asteroids.map((asteroid, index) => (
      <AsteroidComponent
        key={index}
        style={{
          position: "absolute",
          left: asteroid.x,
          top: asteroid.y,
        }}
      />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 relative">
      <div className="mb-8 flex items-center">
        <h1 className="text-6xl font-bold text-gray-800">ducki</h1>
      </div>
      <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <SignInButton>
            <button className="rounded bg-blue-500 px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-blue-600">
              Sign In
            </button>
          </SignInButton>
        </div>
        <p className="text-center text-gray-600">
          Welcome to ducki! Please sign in to access your account.
        </p>
      </div>
      {renderAsteroids()}
    </div>
  );
}
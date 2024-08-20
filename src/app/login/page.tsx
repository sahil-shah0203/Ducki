"use client";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../../public/duck.png";
import Background from "../Background";

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface AsteroidComponentProps {
  id: number;
  style: React.CSSProperties;
}

const AsteroidComponent: React.FC<AsteroidComponentProps> = ({ style }) => {
  return (
    <div style={style} className="asteroid">
      <Image src={logo} alt="Duck Logo" width={50} height={50} />
    </div>
  );
};

export default function Landing() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);

  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    if (isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (asteroidsRef.current.length < 10) {
        setAsteroids((prevAsteroids) => {
          const newAsteroids = [
            ...prevAsteroids,
            {
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
            },
          ];
          asteroidsRef.current = newAsteroids;
          return newAsteroids;
        });
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animationLoop = () => {
      setAsteroids((prevAsteroids) => {
        const newAsteroids = prevAsteroids.map((asteroid) => {
          const newAsteroid = { ...asteroid };
          newAsteroid.x += newAsteroid.vx;
          newAsteroid.y += newAsteroid.vy;

          if (newAsteroid.x < 0 || newAsteroid.x > window.innerWidth) {
            newAsteroid.vx = -newAsteroid.vx;
          }
          if (newAsteroid.y < 0 || newAsteroid.y > window.innerHeight) {
            newAsteroid.vy = -newAsteroid.vy;
          }

          return newAsteroid;
        });
        asteroidsRef.current = newAsteroids;
        return newAsteroids;
      });

      requestAnimationFrame(animationLoop);
    };

    animationLoop();
  }, []);

  const renderAsteroids = () => {
    return asteroids.map((asteroid, index) => (
      <AsteroidComponent
        key={index}
        id={index}
        style={{
          position: "absolute",
          left: asteroid.x,
          top: asteroid.y,
        }}
      />
    ));
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Background />
      <div className="mb-8 flex items-center">
        <h1 className="text-6xl font-bold text-white">ducki</h1>
      </div>
      <input
        type="password"
        value={inputValue}
        onChange={handleInputChange}
        className="mb-4 w-64 rounded border px-2 py-1"
        placeholder="Enter password for beta use..."
      />
      {inputValue.includes("beta0Yay!") && (
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
      )}
      {renderAsteroids()}
    </div>
  );
}

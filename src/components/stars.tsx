'use client';
import { useEffect, useState } from 'react';

export function Stars() {
  const [stars, setStars] = useState<
    {
      top: string;
      left: string;
      size: string;
      duration: string;
      delay: string;
    }[]
  >([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 100 }).map(() => {
        const size = Math.random() * 2 + 1;
        return {
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          size: `${size}px`,
          duration: `${Math.random() * 2 + 1}s`,
          delay: `${Math.random() * 2}s`,
        };
      });
      setStars(newStars);
    };
    generateStars();
  }, []);

  return (
    <div id="stars-container">
      {stars.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDuration: star.duration,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
}

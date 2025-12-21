import { useEffect, useRef } from "react";

interface YandexConstructorMapProps {
  src: string;
  height: number;
}

export function YandexConstructorMap({ src, height }: YandexConstructorMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      style={{ height: `${height}px`, width: "100%" }}
      className="w-full"
    />
  );
}

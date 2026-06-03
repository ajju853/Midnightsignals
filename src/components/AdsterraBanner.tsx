import React, { useEffect, useRef } from "react";

interface AdsterraBannerProps {
  code: string;
  type?: "script" | "atoptions";
  atOptions?: {
    key: string;
    format: string;
    height: number;
    width: number;
    params: Record<string, string>;
  };
  className?: string;
}

const AdsterraBanner: React.FC<AdsterraBannerProps> = ({ code, type, atOptions, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
    if (type === "atoptions" && atOptions) {
      const s = document.createElement("script");
      s.innerHTML = `window.atOptions = ${JSON.stringify(atOptions)};`;
      containerRef.current?.appendChild(s);
      const script = document.createElement("script");
      script.src = `https://www.highperformanceformat.com/${atOptions.key}/invoke.js`;
      script.async = false;
      containerRef.current?.appendChild(script);
    } else {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = code;
      script.async = true;
      containerRef.current?.appendChild(script);
    }
  }, [code]);

  return <div ref={containerRef} className={className} />;
};

export default AdsterraBanner;

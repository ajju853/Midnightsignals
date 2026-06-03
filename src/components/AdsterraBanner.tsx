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

// Shared sequential queue for HPF ads to prevent atOptions race
const hpfQueue: Array<{
  atOptions: NonNullable<AdsterraBannerProps["atOptions"]>;
  container: HTMLDivElement;
}> = [];
let hpfProcessing = false;

function processHpfQueue() {
  if (hpfProcessing || hpfQueue.length === 0) return;
  hpfProcessing = true;
  const item = hpfQueue.shift()!;
  (window as any).atOptions = item.atOptions;
  const s = document.createElement("script");
  s.src = `https://www.highperformanceformat.com/${item.atOptions.key}/invoke.js`;
  s.async = false;
  s.onload = s.onerror = () => {
    hpfProcessing = false;
    processHpfQueue();
  };
  item.container.appendChild(s);
}

const AdsterraBanner: React.FC<AdsterraBannerProps> = ({ code, type, atOptions, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    if (type === "atoptions" && atOptions) {
      hpfQueue.push({ atOptions, container: containerRef.current });
      if (!hpfProcessing) processHpfQueue();
    } else {
      const script = document.createElement("script");
      script.src = code;
      script.async = true;
      containerRef.current.appendChild(script);
    }
  }, [code]);

  return <div ref={containerRef} className={className} />;
};

export default AdsterraBanner;

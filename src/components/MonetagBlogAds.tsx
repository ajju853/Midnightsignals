import React, { useEffect } from "react";

export default function MonetagBlogAds() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://quge5.com/88/tag.min.js";
    script.dataset.zone = "245788";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
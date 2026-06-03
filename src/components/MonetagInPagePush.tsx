import React, { useEffect } from "react";

export default function MonetagInPagePush() {
  useEffect(() => {
    (function (s) {
      s.dataset.zone = "11095355";
      s.src = "https://nap5k.com/tag.min.js";
    })(
      [document.documentElement, document.body]
        .filter(Boolean)
        .pop()
        .appendChild(document.createElement("script"))
    );
  }, []);

  return null;
}
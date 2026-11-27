import { useState } from "react";
import { allMessages, LANGUAGES } from "../allMessages";

export default function ExampleMessages({ onPick }) {
  const [lang, setLang] = useState("English");
  const list = allMessages.filter((m) => m.language === lang);

  return (
    <section className="card">
      <h2>Examples</h2>
      <div className="tabs" role="tablist">
        {LANGUAGES.map((l) => (
          <button
            key={l}
            role="tab"
            aria-selected={l === lang}
            className={`tab ${l === lang ? "active" : ""}`}
            onClick={() => setLang(l)}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="examples">
        {list.map((m) => (
          <button key={m.id} className="example" onClick={() => onPick(m.text)} dir="auto">
            <span className="example-label">{m.label.replace(/^[A-Za-z]+: /, "")}</span>
            <span className="example-text">{m.text}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

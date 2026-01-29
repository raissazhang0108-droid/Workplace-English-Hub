import React, { useMemo, useState } from "react";
import WordsPage from "./pages/WordsPage.jsx";
import SentencesPage from "./pages/SentencesPage.jsx";
import DialoguesPage from "./pages/DialoguesPage.jsx";

export default function App() {
  const tabs = useMemo(
    () => [
      { key: "words", label: "单词", render: () => <WordsPage /> },
      { key: "sentences", label: "句子", render: () => <SentencesPage /> },
      { key: "dialogues", label: "场景对话", render: () => <DialoguesPage /> }
    ],
    []
  );

  const [active, setActive] = useState("words");
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: 16, fontFamily: "system-ui, -apple-system" }}>
      <h1 style={{ margin: 0 }}>Workplace English Hub</h1>
      <p style={{ marginTop: 8, color: "#444" }}>单词 / 句子 / 场景对话：增删改查</p>

      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: t.key === active ? "#111" : "#fff",
              color: t.key === active ? "#fff" : "#111",
              cursor: "pointer"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        {current.render()}
      </div>
    </div>
  );
}
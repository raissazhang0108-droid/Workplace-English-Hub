import React, { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../api.js";

export default function WordsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ word: "", meaning_cn: "", example_en: "", notes: "" });
  const [editingId, setEditingId] = useState(null);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/words");
      setItems(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        word: form.word.trim(),
        meaning_cn: form.meaning_cn.trim(),
        example_en: form.example_en?.trim() || null,
        notes: form.notes?.trim() || null
      };

      if (!payload.word || !payload.meaning_cn) {
        setError("word 和 meaning_cn 必填");
        return;
      }

      if (editingId) {
        await apiPut(`/api/words/${editingId}`, payload);
      } else {
        await apiPost("/api/words", payload);
      }

      setForm({ word: "", meaning_cn: "", example_en: "", notes: "" });
      setEditingId(null);
      await refresh();
    } catch (e2) {
      setError(String(e2));
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      word: item.word ?? "",
      meaning_cn: item.meaning_cn ?? "",
      example_en: item.example_en ?? "",
      notes: item.notes ?? ""
    });
  }

  async function remove(id) {
    setError("");
    try {
      await apiDelete(`/api/words/${id}`);
      await refresh();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>单词（CRUD）</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input placeholder="word (必填)" value={form.word} onChange={(e) => setForm((s) => ({ ...s, word: e.target.value }))} />
        <input placeholder="meaning_cn (必填)" value={form.meaning_cn} onChange={(e) => setForm((s) => ({ ...s, meaning_cn: e.target.value }))} />
        <input placeholder="example_en" value={form.example_en} onChange={(e) => setForm((s) => ({ ...s, example_en: e.target.value }))} />
        <input placeholder="notes" value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} />

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={{ padding: "8px 12px" }}>{editingId ? "保存修改" : "新增"}</button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ word: "", meaning_cn: "", example_en: "", notes: "" });
              }}
              style={{ padding: "8px 12px" }}
            >
              取消编辑
            </button>
          )}
          <button type="button" onClick={refresh} style={{ padding: "8px 12px" }}>刷新</button>
        </div>
      </form>

      {error && <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>}
      {loading ? <p>加载中...</p> : null}

      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        {items.map((it) => (
          <div key={it.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{it.word}</div>
                <div style={{ color: "#333" }}>{it.meaning_cn}</div>
                {it.example_en ? <div style={{ marginTop: 6, color: "#555" }}>例句：{it.example_en}</div> : null}
                {it.notes ? <div style={{ marginTop: 6, color: "#777" }}>备注：{it.notes}</div> : null}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
                <button onClick={() => startEdit(it)}>编辑</button>
                <button onClick={() => remove(it.id)} style={{ color: "crimson" }}>删除</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
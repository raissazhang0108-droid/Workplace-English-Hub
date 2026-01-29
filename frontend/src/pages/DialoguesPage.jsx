import React, { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../api.js";

export default function DialoguesPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    scene: "",
    dialogue_en: "",
    dialogue_cn: ""
  });

  async function refresh() {
    setError("");
    try {
      setItems(await apiGet("/api/dialogues"));
    } catch (e) {
      setError(String(e));
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
        title: form.title.trim(),
        scene: form.scene?.trim() || null,
        dialogue_en: form.dialogue_en.trim(),
        dialogue_cn: form.dialogue_cn?.trim() || null
      };

      if (!payload.title || !payload.dialogue_en) {
        setError("title 和 dialogue_en 必填");
        return;
      }

      if (editingId) await apiPut(`/api/dialogues/${editingId}`, payload);
      else await apiPost("/api/dialogues", payload);

      setEditingId(null);
      setForm({ title: "", scene: "", dialogue_en: "", dialogue_cn: "" });
      await refresh();
    } catch (e2) {
      setError(String(e2));
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title ?? "",
      scene: item.scene ?? "",
      dialogue_en: item.dialogue_en ?? "",
      dialogue_cn: item.dialogue_cn ?? ""
    });
  }

  async function remove(id) {
    setError("");
    try {
      await apiDelete(`/api/dialogues/${id}`);
      await refresh();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>场景对话（CRUD）</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input placeholder="title (必填)" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
        <input placeholder="scene (可选)" value={form.scene} onChange={(e) => setForm((s) => ({ ...s, scene: e.target.value }))} />
        <textarea rows={6} placeholder="dialogue_en (必填，支持多行，例如：A: ...)" value={form.dialogue_en} onChange={(e) => setForm((s) => ({ ...s, dialogue_en: e.target.value }))} />
        <textarea rows={6} placeholder="dialogue_cn (可选，多行翻译)" value={form.dialogue_cn} onChange={(e) => setForm((s) => ({ ...s, dialogue_cn: e.target.value }))} />

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={{ padding: "8px 12px" }}>{editingId ? "保存修改" : "新增"}</button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ title: "", scene: "", dialogue_en: "", dialogue_cn: "" });
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

      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        {items.map((it) => (
          <div key={it.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{it.title}</div>
                {it.scene ? <div style={{ marginTop: 6, color: "#555" }}>场景：{it.scene}</div> : null}
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 600 }}>英文</div>
                  <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{it.dialogue_en}</pre>
                </div>
                {it.dialogue_cn ? (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 600 }}>中文</div>
                    <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{it.dialogue_cn}</pre>
                  </div>
                ) : null}
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
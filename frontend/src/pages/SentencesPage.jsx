import React, { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../api.js";

function parseTags(text) {
  return (text || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinTags(tags) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

export default function SentencesPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    sentence_en: "",
    translation_cn: "",
    scene: "",
    notes: "",
    scene_categories: "",
    topic_categories: "",
    domain_categories: ""
  });

  async function refresh() {
    setError("");
    try {
      setItems(await apiGet("/api/sentences"));
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
        sentence_en: form.sentence_en.trim(),
        translation_cn: form.translation_cn.trim(),
        scene: form.scene?.trim() || null,
        notes: form.notes?.trim() || null,
        scene_categories: parseTags(form.scene_categories),
        topic_categories: parseTags(form.topic_categories),
        domain_categories: parseTags(form.domain_categories)
      };

      if (!payload.sentence_en || !payload.translation_cn) {
        setError("sentence_en 和 translation_cn 必填");
        return;
      }

      if (editingId) await apiPut(`/api/sentences/${editingId}`, payload);
      else await apiPost("/api/sentences", payload);

      setEditingId(null);
      setForm({
        sentence_en: "",
        translation_cn: "",
        scene: "",
        notes: "",
        scene_categories: "",
        topic_categories: "",
        domain_categories: ""
      });
      await refresh();
    } catch (e2) {
      setError(String(e2));
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      sentence_en: item.sentence_en ?? "",
      translation_cn: item.translation_cn ?? "",
      scene: item.scene ?? "",
      notes: item.notes ?? "",
      scene_categories: joinTags(item.scene_categories),
      topic_categories: joinTags(item.topic_categories),
      domain_categories: joinTags(item.domain_categories)
    });
  }

  async function remove(id) {
    setError("");
    try {
      await apiDelete(`/api/sentences/${id}`);
      await refresh();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>句子（CRUD + 分类）</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <textarea rows={3} placeholder="sentence_en (必填)" value={form.sentence_en} onChange={(e) => setForm((s) => ({ ...s, sentence_en: e.target.value }))} />
        <textarea rows={3} placeholder="translation_cn (必填)" value={form.translation_cn} onChange={(e) => setForm((s) => ({ ...s, translation_cn: e.target.value }))} />
        <input placeholder="scene（可选，例如：会议/邮件/联调）" value={form.scene} onChange={(e) => setForm((s) => ({ ...s, scene: e.target.value }))} />
        <input placeholder="notes（可选）" value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} />

        <input placeholder="场景标签（逗号分隔，例如：会议, 邮件沟通）" value={form.scene_categories} onChange={(e) => setForm((s) => ({ ...s, scene_categories: e.target.value }))} />
        <input placeholder="主题标签（逗号分隔，例如：排期, 风险提示, 澄清）" value={form.topic_categories} onChange={(e) => setForm((s) => ({ ...s, topic_categories: e.target.value }))} />
        <input placeholder="业务域标签（逗号分隔，例如：电商, QA, 通用职场）" value={form.domain_categories} onChange={(e) => setForm((s) => ({ ...s, domain_categories: e.target.value }))} />

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={{ padding: "8px 12px" }}>{editingId ? "保存修改" : "新增"}</button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({
                  sentence_en: "",
                  translation_cn: "",
                  scene: "",
                  notes: "",
                  scene_categories: "",
                  topic_categories: "",
                  domain_categories: ""
                });
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
              <div>
                <div style={{ fontWeight: 700 }}>{it.sentence_en}</div>
                <div style={{ color: "#333", marginTop: 6 }}>{it.translation_cn}</div>

                {it.scene ? <div style={{ marginTop: 6, color: "#555" }}>场景：{it.scene}</div> : null}

                {(it.scene_categories?.length || it.topic_categories?.length || it.domain_categories?.length) ? (
                  <div style={{ marginTop: 6, color: "#555" }}>
                    {it.scene_categories?.length ? <div>场景标签：{it.scene_categories.join(" / ")}</div> : null}
                    {it.topic_categories?.length ? <div>主题标签：{it.topic_categories.join(" / ")}</div> : null}
                    {it.domain_categories?.length ? <div>业务域标签：{it.domain_categories.join(" / ")}</div> : null}
                  </div>
                ) : null}

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

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.main import app


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"ok": True}


def test_words_crud_and_conflict(client):
    payload = {
        "word": "follow up",
        "meaning_cn": "跟进",
        "example_en": "I will follow up with you tomorrow.",
        "notes": "常用于邮件/会议",
    }

    r = client.post("/api/words", json=payload)
    assert r.status_code == 200
    created = r.json()
    assert created["word"] == payload["word"]
    word_id = created["id"]

    r = client.get("/api/words")
    assert r.status_code == 200
    assert any(x["id"] == word_id for x in r.json())

    r = client.post("/api/words", json=payload)
    assert r.status_code == 409

    update_payload = {
        "word": "follow up",
        "meaning_cn": "后续跟进",
        "example_en": "I'll follow up on this action item.",
        "notes": None,
    }
    r = client.put(f"/api/words/{word_id}", json=update_payload)
    assert r.status_code == 200
    assert r.json()["meaning_cn"] == "后续跟进"
    assert r.json()["notes"] is None

    r = client.delete(f"/api/words/{word_id}")
    assert r.status_code == 200
    assert r.json() == {"deleted": True}

    r = client.put("/api/words/999999", json=update_payload)
    assert r.status_code == 404

    r = client.delete("/api/words/999999")
    assert r.status_code == 404


def test_sentences_crud(client):
    payload = {
        "sentence_en": "Could you share the latest update by EOD?",
        "translation_cn": "你能在下班前分享最新进展吗？",
        "scene": "邮件沟通",
        "notes": None,
    }

    r = client.post("/api/sentences", json=payload)
    assert r.status_code == 200
    created = r.json()
    sid = created["id"]

    r = client.get("/api/sentences")
    assert r.status_code == 200
    assert any(x["id"] == sid for x in r.json())

    update_payload = {
        "sentence_en": "Could you share the latest update by EOD today?",
        "translation_cn": "你能在今天下班前分享最新进展吗？",
        "scene": "邮件沟通",
        "notes": "更明确时间",
    }
    r = client.put(f"/api/sentences/{sid}", json=update_payload)
    assert r.status_code == 200
    assert r.json()["notes"] == "更明确时间"

    r = client.delete(f"/api/sentences/{sid}")
    assert r.status_code == 200
    assert r.json() == {"deleted": True}

    r = client.delete("/api/sentences/999999")
    assert r.status_code == 404


def test_dialogues_crud_and_validation(client):
    invalid = {"title": "", "scene": None, "dialogue_en": "", "dialogue_cn": None}
    r = client.post("/api/dialogues", json=invalid)
    assert r.status_code == 422

    payload = {
        "title": "1:1 状态同步",
        "scene": "会议",
        "dialogue_en": "A: How are things going?\nB: On track. I'll share a brief update.",
        "dialogue_cn": "A：进展如何？\nB：按计划进行。我会简要同步。",
    }
    r = client.post("/api/dialogues", json=payload)
    assert r.status_code == 200
    created = r.json()
    did = created["id"]

    r = client.get("/api/dialogues")
    assert r.status_code == 200
    assert any(x["id"] == did for x in r.json())

    update_payload = {
        "title": "1:1 状态同步（更新）",
        "scene": "会议",
        "dialogue_en": payload["dialogue_en"] + "\nA: Great, thanks.",
        "dialogue_cn": payload["dialogue_cn"] + "\nA：好的，谢谢。",
    }
    r = client.put(f"/api/dialogues/{did}", json=update_payload)
    assert r.status_code == 200
    assert r.json()["title"].endswith("更新")

    r = client.delete(f"/api/dialogues/{did}")
    assert r.status_code == 200
    assert r.json() == {"deleted": True}

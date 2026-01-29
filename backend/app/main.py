from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select

from .db import Base, engine, get_db
from . import models, schemas

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Workplace English Hub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


# Words CRUD
@app.get("/api/words", response_model=list[schemas.WordOut])
def list_words(db: Session = Depends(get_db)):
    items = db.execute(select(models.Word).order_by(models.Word.updated_at.desc())).scalars().all()
    return items


@app.post("/api/words", response_model=schemas.WordOut)
def create_word(payload: schemas.WordCreate, db: Session = Depends(get_db)):
    exists = db.execute(select(models.Word).where(models.Word.word == payload.word)).scalar_one_or_none()
    if exists:
        raise HTTPException(status_code=409, detail="Word already exists")
    item = models.Word(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put("/api/words/{word_id}", response_model=schemas.WordOut)
def update_word(word_id: int, payload: schemas.WordUpdate, db: Session = Depends(get_db)):
    item = db.get(models.Word, word_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump().items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/words/{word_id}")
def delete_word(word_id: int, db: Session = Depends(get_db)):
    item = db.get(models.Word, word_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    return {"deleted": True}


# Sentences CRUD
@app.get("/api/sentences", response_model=list[schemas.SentenceOut])
def list_sentences(db: Session = Depends(get_db)):
    items = db.execute(select(models.Sentence).order_by(models.Sentence.updated_at.desc())).scalars().all()
    return items


@app.post("/api/sentences", response_model=schemas.SentenceOut)
def create_sentence(payload: schemas.SentenceCreate, db: Session = Depends(get_db)):
    item = models.Sentence(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put("/api/sentences/{sentence_id}", response_model=schemas.SentenceOut)
def update_sentence(sentence_id: int, payload: schemas.SentenceUpdate, db: Session = Depends(get_db)):
    item = db.get(models.Sentence, sentence_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump().items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/sentences/{sentence_id}")
def delete_sentence(sentence_id: int, db: Session = Depends(get_db)):
    item = db.get(models.Sentence, sentence_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    return {"deleted": True}


# Dialogues CRUD
@app.get("/api/dialogues", response_model=list[schemas.DialogueOut])
def list_dialogues(db: Session = Depends(get_db)):
    items = db.execute(select(models.Dialogue).order_by(models.Dialogue.updated_at.desc())).scalars().all()
    return items


@app.post("/api/dialogues", response_model=schemas.DialogueOut)
def create_dialogue(payload: schemas.DialogueCreate, db: Session = Depends(get_db)):
    item = models.Dialogue(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put("/api/dialogues/{dialogue_id}", response_model=schemas.DialogueOut)
def update_dialogue(dialogue_id: int, payload: schemas.DialogueUpdate, db: Session = Depends(get_db)):
    item = db.get(models.Dialogue, dialogue_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump().items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/dialogues/{dialogue_id}")
def delete_dialogue(dialogue_id: int, db: Session = Depends(get_db)):
    item = db.get(models.Dialogue, dialogue_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    return {"deleted": True}
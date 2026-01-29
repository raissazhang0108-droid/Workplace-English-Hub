from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base


class Word(Base):
    __tablename__ = "words"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    word: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    meaning_cn: Mapped[str] = mapped_column(String(512))
    example_en: Mapped[str | None] = mapped_column(Text, default=None)
    notes: Mapped[str | None] = mapped_column(Text, default=None)

    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Sentence(Base):
    __tablename__ = "sentences"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    sentence_en: Mapped[str] = mapped_column(Text)
    translation_cn: Mapped[str] = mapped_column(Text)
    scene: Mapped[str | None] = mapped_column(String(256), default=None)
    notes: Mapped[str | None] = mapped_column(Text, default=None)

    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Dialogue(Base):
    __tablename__ = "dialogues"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(256), index=True)
    scene: Mapped[str | None] = mapped_column(String(256), default=None)
    dialogue_en: Mapped[str] = mapped_column(Text)
    dialogue_cn: Mapped[str | None] = mapped_column(Text, default=None)

    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
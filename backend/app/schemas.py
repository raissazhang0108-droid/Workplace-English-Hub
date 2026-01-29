from pydantic import BaseModel


class WordBase(BaseModel):
    word: str
    meaning_cn: str
    example_en: str | None = None
    notes: str | None = None


class WordCreate(WordBase):
    pass


class WordUpdate(WordBase):
    pass


class WordOut(WordBase):
    id: int

    class Config:
        from_attributes = True


class SentenceBase(BaseModel):
    sentence_en: str
    translation_cn: str
    scene: str | None = None
    notes: str | None = None


class SentenceCreate(SentenceBase):
    pass


class SentenceUpdate(SentenceBase):
    pass


class SentenceOut(SentenceBase):
    id: int

    class Config:
        from_attributes = True


class DialogueBase(BaseModel):
    title: str
    scene: str | None = None
    dialogue_en: str
    dialogue_cn: str | None = None


class DialogueCreate(DialogueBase):
    pass


class DialogueUpdate(DialogueBase):
    pass


class DialogueOut(DialogueBase):
    id: int

    class Config:
        from_attributes = True
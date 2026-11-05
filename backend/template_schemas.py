from datetime import datetime
from typing import Annotated, Literal, Optional, Union

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from schemas import AnswerKeyMode, ArithmeticTopic, TopicModifiers, TopicSelection, WorksheetRequest
from template_tags import normalize_template_tags


class SavedTopic(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: Optional[str] = Field(None, max_length=100)
    subject: Literal["Arithmetic"] = "Arithmetic"
    topicId: ArithmeticTopic
    topicName: Optional[str] = Field(None, min_length=1, max_length=100)
    instructions: str = Field("", max_length=500)
    modifiers: TopicModifiers = Field(default_factory=TopicModifiers)

    @model_validator(mode="after")
    def validate_topic(self):
        TopicSelection(topic_id=self.topicId, topic_name=self.topicName, modifiers=self.modifiers)
        if self.topicId != "subtraction" and self.modifiers.allow_negative_answers:
            raise ValueError("Only subtraction supports negative answers.")
        return self


class SavedSection(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: Optional[str] = Field(None, max_length=100)
    mode: Literal["single", "mixed"]
    topics: list[SavedTopic] = Field(..., min_length=1, max_length=4)
    pageCount: int = Field(1, ge=1, le=50)
    problemsPerPage: int = Field(10, ge=1, le=50)
    instructions: str = Field("", max_length=500)
    shareModifiers: bool = False
    sharedModifiers: Optional[TopicModifiers] = None


class SavedHeader(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: Optional[str] = Field(None, max_length=100)
    mode: Literal["header"]
    title: str = Field(..., min_length=1, max_length=100)
    instructions: str = Field("", max_length=500)


class SavedWorksheetSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sections: list[Annotated[Union[SavedSection, SavedHeader], Field(discriminator="mode")]] = Field(
        ..., min_length=1, max_length=40
    )
    answerKeyMode: AnswerKeyMode = "none"
    workflowMode: Literal["single", "mixed", "multi-section", "accordion"] = "accordion"

    @model_validator(mode="after")
    def validate_generation(self):
        sections = []
        topic_sections = [section for section in self.sections if isinstance(section, SavedSection)]
        for section in self.sections:
            if isinstance(section, SavedHeader):
                sections.append({"mode": "header", "title": section.title, "instructions": section.instructions})
                continue
            topics = []
            for topic in section.topics:
                source_modifiers = topic.modifiers
                if section.shareModifiers:
                    source_modifiers = section.sharedModifiers or section.topics[0].modifiers
                modifiers = source_modifiers.model_dump()
                if topic.topicId != "subtraction":
                    modifiers["allow_negative_answers"] = False
                if topic.topicId != "division":
                    modifiers["division_mode"] = "exact"
                topics.append({"topic_id": topic.topicId, "topic_name": topic.topicName,
                    "instructions": topic.instructions, "modifiers": modifiers})
            sections.append({"mode": section.mode, "topics": topics, "page_count": section.pageCount,
                "problems_per_page": section.problemsPerPage, "instructions": section.instructions})
        WorksheetRequest(sections=sections, answer_key_mode=self.answerKeyMode)
        if self.workflowMode in ("single", "mixed") and (
            len(topic_sections) != 1 or topic_sections[0].mode != self.workflowMode
        ):
            raise ValueError("Workflow mode must match the worksheet sections.")
        return self


def validate_saved_settings(settings):
    return SavedWorksheetSettings.model_validate(settings).model_dump(mode="json")


class TemplateListParams(BaseModel):
    skip: int = Field(0, ge=0)
    limit: int = Field(10, ge=1, le=100)
    q: Optional[str] = None
    tags: Optional[list[str]] = None
    sort_by: Literal["created_at", "likes_count"] = "created_at"
    sort_order: Literal["asc", "desc"] = "desc"


class TemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    settings_json: dict = Field(..., description="JSON representation of worksheet settings")
    is_public: bool = False
    tags: list[str] = Field(default_factory=list)

    @field_validator("name")
    @classmethod
    def validate_name(cls, name):
        name = name.strip()
        if not name:
            raise ValueError("Template name cannot be blank.")
        return name


class TemplateCreate(TemplateBase):
    @field_validator("settings_json")
    @classmethod
    def validate_settings(cls, settings):
        return validate_saved_settings(settings)

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, tags):
        return normalize_template_tags(tags)


class TemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    settings_json: Optional[dict] = None
    is_public: Optional[bool] = None
    tags: Optional[list[str]] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, name):
        if name is None:
            raise ValueError("Template name cannot be null.")
        name = name.strip()
        if not name:
            raise ValueError("Template name cannot be blank.")
        return name

    @field_validator("settings_json", "is_public", "tags")
    @classmethod
    def validate_non_nullable_update_fields(cls, value):
        if value is None:
            raise ValueError("This field cannot be null.")
        return value

    @field_validator("settings_json")
    @classmethod
    def validate_settings(cls, settings):
        return validate_saved_settings(settings)

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, tags):
        return normalize_template_tags(tags)


class TemplateResponse(TemplateBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    likes_count: int
    is_liked: bool = False
    is_favorited: bool = False
    created_at: datetime
    updated_at: datetime
    owner_username: Optional[str] = None

    @classmethod
    def from_orm_with_owner(cls, template_obj, user_obj=None):
        data = cls.model_validate(template_obj).model_dump()
        data["owner_username"] = user_obj.username if user_obj else None
        return data
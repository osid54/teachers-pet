from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Table
from sqlalchemy.orm import relationship, Mapped, mapped_column, declarative_base
from datetime import datetime
from typing import Optional

Base = declarative_base()

user_likes_template = Table(
    "user_likes_template",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("template_id", Integer, ForeignKey("templates.id"), primary_key=True)
)

user_favorites_template = Table(
    "user_favorites_template",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("template_id", Integer, ForeignKey("templates.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    templates: Mapped[list["Template"]] = relationship("Template", back_populates="owner", cascade="all, delete-orphan")

    liked_templates: Mapped[list["Template"]] = relationship(
        "Template",
        secondary=user_likes_template,
        backref="likers" # Allows Template.likers to access users who liked it
    )
    favorited_templates: Mapped[list["Template"]] = relationship(
        "Template",
        secondary=user_favorites_template,
        backref="favoriters" # Allows Template.favoriters to access users who favorited it
    )

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"


class Template(Base):
    __tablename__ = "templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    settings_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    likes_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    tags: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    owner: Mapped["User"] = relationship("User", back_populates="templates")

    def __repr__(self):
        return f"<Template(id={self.id}, name='{self.name}', user_id={self.user_id})>"
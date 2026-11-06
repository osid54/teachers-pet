TEMPLATE_TAGS = (
    "Arithmetic", "Algebra", "Geometry", "Easy", "Medium", "Hard", "Mixed", "Standard",
)


def normalize_template_tags(tags):
    if len(tags) > 32:
        raise ValueError("A template can contain at most 32 tag entries.")
    normalized = []
    for tag in tags:
        tag = tag.strip()
        if tag not in TEMPLATE_TAGS:
            raise ValueError(f"Unknown template tag: {tag!r}.")
        if tag not in normalized:
            normalized.append(tag)
    return normalized
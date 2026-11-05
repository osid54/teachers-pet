import unittest
from copy import deepcopy
from datetime import datetime

from pydantic import ValidationError

from template_schemas import TemplateCreate, TemplateListParams, TemplateResponse, TemplateUpdate
from template_tags import TEMPLATE_TAGS


def valid_settings():
    return {"sections": [{"id": "section", "mode": "single", "topics": [{
        "id": "topic", "subject": "Arithmetic", "topicId": "addition",
    }], "pageCount": 1, "problemsPerPage": 10}]}


class TemplateTagSchemaTests(unittest.TestCase):
    def test_creation_and_update_share_the_catalog_and_deduplicate_tags(self):
        tags = [" Arithmetic ", "Easy", "Arithmetic"]
        create = TemplateCreate(name=" Practice ", settings_json=valid_settings(), tags=tags)
        update = TemplateUpdate(tags=tags)
        self.assertEqual(create.name, "Practice")
        self.assertEqual(create.tags, ["Arithmetic", "Easy"])
        self.assertEqual(update.tags, create.tags)
        for tag in TEMPLATE_TAGS:
            self.assertEqual(TemplateCreate(name="Practice", settings_json=valid_settings(), tags=[tag]).tags, [tag])

    def test_requests_reject_unknown_blank_or_excessive_tags(self):
        for tags in (["Not in catalog"], [""], ["Arithmetic"] * 33):
            with self.subTest(tags=tags), self.assertRaises(ValidationError):
                TemplateCreate(name="Practice", settings_json=valid_settings(), tags=tags)
            with self.subTest(update=tags), self.assertRaises(ValidationError):
                TemplateUpdate(tags=tags)

    def test_updates_allow_omitted_fields_but_reject_explicit_nulls(self):
        self.assertEqual(TemplateUpdate().model_dump(exclude_unset=True), {})
        self.assertEqual(TemplateUpdate(tags=[]).tags, [])
        for field in ("tags", "name", "settings_json", "is_public"):
            with self.subTest(field=field), self.assertRaises(ValidationError):
                TemplateUpdate.model_validate({field: None})

    def test_existing_response_tags_are_not_revalidated_as_new_requests(self):
        response = TemplateResponse(id=1, user_id=1, name="Practice", settings_json={}, tags=["Historical tag"],
            likes_count=0, created_at=datetime(2026, 1, 1), updated_at=datetime(2026, 1, 1))
        self.assertEqual(response.tags, ["Historical tag"])


class TemplateSettingsSchemaTests(unittest.TestCase):
    def test_create_and_update_normalize_settings_without_losing_editor_state(self):
        settings = valid_settings()
        settings["sections"].insert(0, {"id": "header", "mode": "header", "title": "Warm-up"})
        settings["answerKeyMode"] = "inline"
        created = TemplateCreate(name="Practice", settings_json=settings).settings_json
        updated = TemplateUpdate(settings_json=settings).model_dump(exclude_unset=True)["settings_json"]
        self.assertEqual(created, updated)
        self.assertEqual(created["sections"][0]["id"], "header")
        self.assertEqual(created["sections"][1]["topics"][0]["id"], "topic")
        self.assertEqual(created["sections"][1]["topics"][0]["modifiers"]["digits"], 2)
        self.assertEqual(created["answerKeyMode"], "inline")

    def test_missing_editor_defaults_are_persisted(self):
        settings = {"sections": [{"mode": "single", "topics": [{"topicId": "addition"}]}]}
        saved = TemplateCreate(name="Practice", settings_json=settings).settings_json
        self.assertEqual(saved["sections"][0]["topics"][0]["subject"], "Arithmetic")
        self.assertEqual(saved["sections"][0]["pageCount"], 1)
        self.assertEqual(saved["workflowMode"], "accordion")

    def test_invalid_settings_are_rejected_on_create_and_update(self):
        invalid_settings = [{}, {"sections": []}, {"sections": [{"mode": "header", "title": "Title"}]}]
        for field, value in (("mode", "unknown"), ("mode", "mixed"), ("pageCount", 0),
                             ("problemsPerPage", 51), ("instructions", "x" * 501)):
            settings = valid_settings()
            settings["sections"][0][field] = value
            invalid_settings.append(settings)
        for field, value in (("topicId", "unsupported"), ("subject", "Unknown"), ("topicName", " "),
                             ("modifiers", {"digits": 6}), ("modifiers", {"negative_probability": 2}),
                             ("modifiers", {"allow_negative_answers": True}),
                             ("modifiers", {"division_mode": "remainder", "decimal_places": 1})):
            settings = valid_settings()
            settings["sections"][0]["topics"][0][field] = value
            invalid_settings.append(settings)
        for field, value in (("answerKeyMode", "unknown"), ("workflowMode", "mixed"), ("unexpected", "x")):
            settings = valid_settings()
            settings[field] = value
            invalid_settings.append(settings)
        trailing_header = valid_settings()
        trailing_header["sections"].append({"mode": "header", "title": "Dangling"})
        invalid_settings.append(trailing_header)
        for settings in invalid_settings:
            with self.subTest(settings=settings):
                with self.assertRaises(ValidationError):
                    TemplateCreate(name="Practice", settings_json=settings)
                with self.assertRaises(ValidationError):
                    TemplateUpdate(settings_json=settings)

    def test_single_and_mixed_topic_counts_and_total_limits_match_generation(self):
        single = valid_settings()
        single["sections"][0]["topics"] *= 2
        too_many_topics = deepcopy(single)
        too_many_topics["sections"][0].update(mode="mixed", topics=[{"topicId": "addition"}] * 5)
        too_many_sections = valid_settings()
        too_many_sections["sections"] *= 21
        too_many_problems = valid_settings()
        too_many_problems["sections"][0].update(pageCount=50, problemsPerPage=50)
        too_many_problems["sections"] *= 5
        for settings in (single, too_many_topics, too_many_sections, too_many_problems):
            with self.subTest(settings=settings), self.assertRaises(ValidationError):
                TemplateCreate(name="Practice", settings_json=settings)

    def test_shared_mixed_modifiers_preserve_topic_specific_behavior(self):
        settings = {"workflowMode": "mixed", "sections": [{"mode": "mixed", "shareModifiers": True,
            "sharedModifiers": {"digits": 3, "allow_negative_answers": True},
            "topics": [{"topicId": "addition"}, {"topicId": "subtraction"}]}]}
        saved = TemplateCreate(name="Mixed", settings_json=settings).settings_json
        self.assertTrue(saved["sections"][0]["shareModifiers"])
        self.assertTrue(saved["sections"][0]["sharedModifiers"]["allow_negative_answers"])
        self.assertEqual(saved["sections"][0]["sharedModifiers"]["digits"], 3)

    def test_metadata_only_updates_do_not_require_new_settings(self):
        self.assertEqual(TemplateUpdate(name="Renamed").model_dump(exclude_unset=True), {"name": "Renamed"})
        response = TemplateResponse(id=1, user_id=1, name="Old", settings_json={"legacy": True},
            likes_count=0, created_at=datetime(2026, 1, 1), updated_at=datetime(2026, 1, 1))
        self.assertEqual(response.settings_json, {"legacy": True})

    def test_listing_parameters_share_bounds_and_sort_options(self):
        params = TemplateListParams(skip=10, limit=11, tags=["Arithmetic", "Easy"], sort_by="likes_count")
        self.assertEqual(params.skip, 10)
        self.assertEqual(params.tags, ["Arithmetic", "Easy"])
        for field, value in (("skip", -1), ("limit", 0), ("limit", 101),
                             ("sort_by", "unknown"), ("sort_order", "unknown")):
            with self.subTest(field=field, value=value), self.assertRaises(ValidationError):
                TemplateListParams.model_validate({field: value})


if __name__ == "__main__":
    unittest.main()
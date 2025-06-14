from unittest.mock import patch

import pytest

from app.core.exceptions import InternalException
from app.store import Store
from app.task.models import (
    DifficultyEnum,
    SortByEnum,
    SortOrderEnum,
    TaskStatusEnum,
)


class TestGetTasksBasic:
    @pytest.mark.asyncio
    async def test_with_private(self, store: Store, raw_tasks):
        result = await store.task.get_tasks_with_filters(with_private=True)

        assert len(result["tasks"]) == len(raw_tasks)
        assert result["count"] == len(raw_tasks)

    @pytest.mark.asyncio
    async def test_public_only(self, store: Store, raw_tasks):
        result = await store.task.get_tasks_with_filters()

        public_tasks = [task for task in raw_tasks if task.is_public]
        assert len(result["tasks"]) == len(public_tasks)
        assert result["count"] == len(public_tasks)

    @pytest.mark.asyncio
    async def test_pagination(self, store: Store, raw_tasks):
        result = await store.task.get_tasks_with_filters(skip=1, limit=2)
        public_tasks = [task for task in raw_tasks if task.is_public]

        assert len(result["tasks"]) == 2
        assert result["tasks"][0].id == public_tasks[1].id
        assert result["tasks"][1].id == public_tasks[2].id
        assert result["count"] == len(public_tasks)

    @pytest.mark.asyncio
    async def test_internal_error(self, store):
        with patch.object(
            store.task.session,
            "execute",
            side_effect=Exception("Database connection error"),
        ):
            with pytest.raises(InternalException):
                await store.task.get_tasks_with_filters()


class TestGetTasksSearch:
    @pytest.mark.asyncio
    async def test_search_public(self, store: Store, raw_tasks):
        result = await store.task.get_tasks_with_filters(search="Title 2")

        assert len(result["tasks"]) == 1
        assert result["count"] == 1
        assert result["tasks"][0].title == "Title 2"

    @pytest.mark.asyncio
    async def test_search_public_not_found_private(
        self, store: Store, raw_tasks
    ):
        result = await store.task.get_tasks_with_filters(search="Title 3")

        assert len(result["tasks"]) == 0
        assert result["count"] == 0

    @pytest.mark.asyncio
    async def test_no_match(self, store):
        result = await store.task.get_tasks_with_filters(search="Nonexistent")

        assert len(result["tasks"]) == 0
        assert result["count"] == 0


class TestGetTasksSort:
    @pytest.mark.asyncio
    async def test_id_asc(self, store: Store, raw_tasks):
        result = await store.task.get_tasks_with_filters(
            sort_by=SortByEnum.id, sort_order=SortOrderEnum.asc
        )
        assert result["tasks"] == sorted(
            result["tasks"], key=lambda task: task.id
        )

        assert result["count"] == len(
            [task for task in raw_tasks if task.is_public]
        )

    @pytest.mark.asyncio
    async def test_invalide_sort_by(self, store: Store, raw_tasks):
        result = await store.task.get_tasks_with_filters(
            sort_by="good",  # type: ignore[arg-type]
            sort_order=SortOrderEnum.asc,
        )
        assert result["tasks"] == sorted(
            result["tasks"], key=lambda task: task.id
        )

        assert result["count"] == len(
            [task for task in raw_tasks if task.is_public]
        )

    @pytest.mark.asyncio
    async def test_id_desc(self, store: Store, raw_tasks):
        result = await store.task.get_tasks_with_filters(
            sort_by=SortByEnum.id, sort_order=SortOrderEnum.desc
        )
        assert result["tasks"] == sorted(
            result["tasks"], key=lambda task: task.id, reverse=True
        )

        assert result["count"] == len(
            [task for task in raw_tasks if task.is_public]
        )

    @pytest.mark.asyncio
    async def test_difficulty_asc(self, store: Store, raw_tasks):
        result = await store.task.get_tasks_with_filters(
            sort_by=SortByEnum.difficulty, sort_order=SortOrderEnum.asc
        )
        difficulties = [task.difficulty for task in result["tasks"]]
        assert difficulties == sorted(
            difficulties, key=["easy", "medium", "hard"].index
        )

        assert result["count"] == len(
            [task for task in raw_tasks if task.is_public]
        )

    @pytest.mark.asyncio
    async def test_difficulty_desc(self, store: Store, raw_tasks):
        result = await store.task.get_tasks_with_filters(
            sort_by=SortByEnum.difficulty, sort_order=SortOrderEnum.desc
        )
        difficulties = [task.difficulty for task in result["tasks"]]
        assert difficulties == sorted(
            difficulties, key=["easy", "medium", "hard"].index, reverse=True
        )

        assert result["count"] == len(
            [task for task in raw_tasks if task.is_public]
        )

    @pytest.mark.asyncio
    async def test_acceptance_desc(self, store: Store, raw_tasks):
        public_tasks_acceptances = [
            task.acceptance for task in raw_tasks if task.is_public
        ]

        result = await store.task.get_tasks_with_filters(
            sort_by=SortByEnum.acceptance, sort_order=SortOrderEnum.desc
        )
        acceptances = [task.acceptance for task in result["tasks"]]

        assert acceptances == sorted(public_tasks_acceptances, reverse=True)

        assert result["count"] == len(public_tasks_acceptances)

    @pytest.mark.asyncio
    async def test_acceptance_asc(self, store: Store, raw_tasks):
        public_tasks_acceptances = [
            task.acceptance for task in raw_tasks if task.is_public
        ]
        result = await store.task.get_tasks_with_filters(
            sort_by=SortByEnum.acceptance, sort_order=SortOrderEnum.asc
        )
        acceptances = [task.acceptance for task in result["tasks"]]

        assert acceptances == sorted(public_tasks_acceptances)

        assert result["count"] == len(public_tasks_acceptances)

    @pytest.mark.asyncio
    async def test_acceptance_desc_with_private(self, store: Store, raw_tasks):
        public_tasks_acceptances = [task.acceptance for task in raw_tasks]

        result = await store.task.get_tasks_with_filters(
            sort_by=SortByEnum.acceptance,
            sort_order=SortOrderEnum.desc,
            with_private=True,
        )
        acceptances = [task.acceptance for task in result["tasks"]]

        assert acceptances == sorted(public_tasks_acceptances, reverse=True)

        assert result["count"] == len(public_tasks_acceptances)

    @pytest.mark.asyncio
    async def test_acceptance_asc_with_private(self, store: Store, raw_tasks):
        public_tasks_acceptances = [task.acceptance for task in raw_tasks]
        result = await store.task.get_tasks_with_filters(
            sort_by=SortByEnum.acceptance,
            sort_order=SortOrderEnum.asc,
            with_private=True,
        )
        acceptances = [task.acceptance for task in result["tasks"]]

        assert acceptances == sorted(public_tasks_acceptances)

        assert result["count"] == len(public_tasks_acceptances)


class TestGetTasksFilter:
    @pytest.mark.asyncio
    async def test_difficulty(self, store: Store, raw_tasks):
        result = await store.task.get_tasks_with_filters(
            difficulties=[DifficultyEnum.easy]
        )
        easy_tasks = [
            task
            for task in raw_tasks
            if task.difficulty == DifficultyEnum.easy and task.is_public
        ]

        assert len(result["tasks"]) == len(easy_tasks)
        assert all(
            task.difficulty == DifficultyEnum.easy for task in result["tasks"]
        )
        assert result["count"] == len(easy_tasks)

    @pytest.mark.asyncio
    async def test_solved(self, store: Store, user, many_tasks_many_attempts):
        result = await store.task.get_tasks_with_filters(
            user_id=user.id, statuses=[TaskStatusEnum.solved], with_private=True
        )

        assert result["count"] == 2
        for task in result["tasks"]:
            assert task.user_attempt_status == TaskStatusEnum.solved

    @pytest.mark.asyncio
    async def test_attempted(
        self, store: Store, user, many_tasks_many_attempts
    ):
        result = await store.task.get_tasks_with_filters(
            user_id=user.id,
            statuses=[TaskStatusEnum.attempted],
            with_private=True,
        )

        assert result["count"] == 6
        for task in result["tasks"]:
            assert task.user_attempt_status == TaskStatusEnum.attempted

    @pytest.mark.asyncio
    async def test_todo(self, store: Store, user, many_tasks_many_attempts):
        result = await store.task.get_tasks_with_filters(
            user_id=user.id, statuses=[TaskStatusEnum.todo], with_private=True
        )

        assert result["count"] == 2
        for task in result["tasks"]:
            assert task.user_attempt_status == TaskStatusEnum.todo

    @pytest.mark.asyncio
    async def test_empty_status_list(
        self, store: Store, user, many_tasks_many_attempts
    ):
        tasks = many_tasks_many_attempts

        result = await store.task.get_tasks_with_filters(
            user_id=user.id, statuses=[], with_private=True
        )

        assert result["count"] == len(tasks)
        assert len(result["tasks"]) == len(tasks)

    @pytest.mark.asyncio
    async def test_without_attempts_todo(self, store: Store, user, raw_tasks):
        result = await store.task.get_tasks_with_filters(
            user_id=user.id, statuses=[TaskStatusEnum.todo], with_private=True
        )

        assert result["count"] == len(raw_tasks)
        assert len(result["tasks"]) == len(raw_tasks)

    @pytest.mark.asyncio
    async def test_without_attempts_attempted(
        self, store: Store, user, raw_tasks
    ):
        result = await store.task.get_tasks_with_filters(
            user_id=user.id,
            statuses=[TaskStatusEnum.attempted],
            with_private=True,
        )

        assert result["count"] == 0
        assert len(result["tasks"]) == 0

    @pytest.mark.asyncio
    async def test_without_attempts_solved(self, store: Store, user, raw_tasks):
        result = await store.task.get_tasks_with_filters(
            user_id=user.id, statuses=[TaskStatusEnum.solved], with_private=True
        )

        assert result["count"] == 0
        assert len(result["tasks"]) == 0

    @pytest.mark.asyncio
    async def test_invalide_status(self, store: Store, user, raw_tasks):
        result = await store.task.get_tasks_with_filters(
            user_id=user.id,
            statuses=["good"],  # type: ignore[list-item]
            with_private=True,
        )

        assert result["count"] == len(raw_tasks)
        assert len(result["tasks"]) == len(raw_tasks)

    @pytest.mark.asyncio
    async def test_task_with_attempt(
        self, store: Store, user, one_task_many_attempts
    ):
        result = await store.task.get_tasks_with_filters(
            user_id=user.id, statuses=[TaskStatusEnum.todo], with_private=True
        )

        assert result["count"] == 0
        assert len(result["tasks"]) == 0


class TestGetTasksCombined:
    @pytest.mark.asyncio
    async def test_status_with_pagination(
        self, store: Store, user, many_tasks_many_attempts
    ):
        result = await store.task.get_tasks_with_filters(
            user_id=user.id,
            statuses=[TaskStatusEnum.solved],
            skip=1,
            limit=1,
            with_private=True,
        )

        assert result["count"] == 2
        assert len(result["tasks"]) == 1

        assert result["tasks"][0].user_attempt_status == TaskStatusEnum.solved

    @pytest.mark.asyncio
    async def test_status_with_difficulty(
        self, store: Store, user, many_tasks_many_attempts
    ):
        result = await store.task.get_tasks_with_filters(
            user_id=user.id,
            statuses=[TaskStatusEnum.solved],
            difficulties=[DifficultyEnum.easy],
            with_private=True,
        )

        for task in result["tasks"]:
            assert task.difficulty == DifficultyEnum.easy
            assert task.user_attempt_status == TaskStatusEnum.solved

    @pytest.mark.asyncio
    async def test_status_with_search(
        self, store: Store, user, many_tasks_many_attempts
    ):
        result = await store.task.get_tasks_with_filters(
            user_id=user.id,
            statuses=[TaskStatusEnum.solved],
            search="Title",
            with_private=True,
        )

        for task in result["tasks"]:
            assert "Title" in task.title
            assert task.user_attempt_status == TaskStatusEnum.solved

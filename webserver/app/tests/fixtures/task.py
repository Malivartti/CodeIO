import random

import pytest_asyncio
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.store import Store
from app.task.models import DifficultyEnum, Tag, TagCreate, Task, TaskCreate
from app.user.models import User


@pytest_asyncio.fixture
async def task(store: Store, user: User) -> Task:
    task_create = TaskCreate(
        user_id=user.id,
        title="Подсчет уникальных символов",
        description="## Описание задачи\nДана последовательность строк, "
        "содержащих только строчные латинские буквы. Необходимо:\n"
        "1. Для каждой строки подсчитать количество уникальных символов\n"
        "2. Найти произведение этих количеств для всех строк\n\n"
        "## Формат входных данных\n- Первая строка содержит число n — "
        "количество строк\n- Следующие n строк содержат только строчные "
        "латинские буквы\n- Длина строк может быть различной, строки не пустые"
        "\n\n## Формат выходных данных\nОдно число — произведение количеств "
        "уникальных символов во всех строках\n\n## Пример\n**Входные данные:**"
        "\n```\n3\nhello\nworld\nabc\n```\n\n**Выходные данные:**\n```\n60\n```"
        "\n\n**Объяснение:**\n- Первая строка hello: уникальные символы "
        "{h, e, l, o}, количество = 4\n- Вторая строка world: уникальные "
        "символы {w, o, r, l, d}, количество = 5\n- Третья строка abc: "
        "уникальные символы {a, b, c}, количество = 3\n- Произведение: "
        "4 * 5 * 3 = 60",
        difficulty=DifficultyEnum.easy,
        time_limit_seconds=1,
        memory_limit_megabytes=64,
        tests=[
            [["3", "hello", "world", "abc"], ["60"]],
            [["2", "aaa", "abcd"], ["4"]],
        ],
        is_public=False,
    )
    return await store.task.create_task(task_create=task_create)


@pytest_asyncio.fixture
async def task2(store: Store, user: User) -> Task:
    task_create = TaskCreate(
        user_id=user.id,
        title="Сортировка четных чисел",
        description="# Сортировка четных чисел\n\n## Описание задачи\nДана "
        "последовательность строк с целыми числами. Необходимо:\n1. В каждой "
        "строке выбрать только четные числа\n2. Объединить все четные числа "
        "из всех строк в один список\n3. Отсортировать полученный список по "
        "возрастанию\n\n## Формат входных данных\n- Первая строка содержит "
        "число **n** — количество строк с числами\n- Следующие **n** строк "
        "содержат целые числа, разделенные пробелами\n- Длина строк может "
        "быть различной, строки могут быть пустыми\n\n## Формат выходных "
        "данных\nОдно число — сумма всех четных чисел после их сортировки "
        "(или 0, если четных чисел нет)\n\n## Пример\n**Входные данные:**\n"
        "```\n3\n1 4 3 2\n6 5 8\n7 9\n```\n\n**Выходные данные:**\n"
        "```\n2 4 6 8\n```\n\n**Объяснение:**\n- Первая строка: четные "
        "числа — 4, 2\n- Вторая строка: четные числа — 6, 8\n- Третья "
        "строка: нет четных чисел\n- Общий список четных чисел: [4, 2, 6, 8]"
        "\n- После сортировки: [2, 4, 6, 8]\n",
        difficulty=DifficultyEnum.easy,
        time_limit_seconds=1,
        memory_limit_megabytes=64,
        tests=[
            [["3", "1 4 3 2", "6 5 8", "7 9"], ["2 4 6 8"]],
            [["2", "1 3 5", ""], ["0"]],
        ],
        is_public=False,
    )
    return await store.task.create_task(task_create=task_create)


@pytest_asyncio.fixture
async def raw_task(store: Store, user: User) -> Task:
    task_create = TaskCreate(
        user_id=user.id,
        title="Title 1",
        description="Description 1",
        difficulty=DifficultyEnum.easy,
        time_limit_seconds=1,
        memory_limit_megabytes=64,
        tests=[
            [["input1"], ["output1"]],
            [["input2"], ["output2"]],
        ],
        is_public=True,
    )
    return await store.task.create_task(task_create=task_create)


@pytest_asyncio.fixture
async def raw_tasks(store: Store, user: User) -> list[Task]:
    difficulty = {
        0: DifficultyEnum.easy,
        1: DifficultyEnum.medium,
        2: DifficultyEnum.hard,
    }
    tasks = []

    for i in range(1, 11):
        task_create = TaskCreate(
            user_id=user.id,
            title=f"Title {i}",
            description=f"Description {i}",
            difficulty=difficulty[i % 3],
            time_limit_seconds=1,
            memory_limit_megabytes=64,
            tests=[
                [["input1"], ["output1"]],
                [["input2"], ["output2"]],
            ],
            is_public=i % 2 == 0,
        )
        tasks.append(await store.task.create_task(task_create=task_create))
    return tasks


@pytest_asyncio.fixture
async def tag(store: Store) -> Tag:
    tag_create = TagCreate(name="String")
    return await store.task.create_tag(tag_create=tag_create)


@pytest_asyncio.fixture
async def tags(store: Store) -> list[Tag]:
    tags = []
    for i in range(1, 4):
        tag_create = TagCreate(name=f"Tag {i}")
        tags.append(await store.task.create_tag(tag_create=tag_create))
    return tags


@pytest_asyncio.fixture
async def raw_tasks_with_tags(
    store: Store, raw_tasks: list[Task], tags: list[Tag]
) -> list[Task]:
    for task in raw_tasks:
        num_tags = random.randint(0, len(tags))
        selected_tags = random.sample(tags, num_tags)
        for tag in selected_tags:
            await store.task.add_tag_to_task(task_id=task.id, tag_id=tag.id)

    result = await store.session.execute(
        select(Task).options(selectinload(Task.tags))  # type: ignore[arg-type]  # pyright: ignore[reportArgumentType]
    )

    return list(result.scalars().all())

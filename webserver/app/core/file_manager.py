import uuid
from pathlib import Path

import aiofiles.os
from fastapi import HTTPException, UploadFile, status


class FileManager:
    def __init__(
        self,
        *,
        upload_dir: str = "uploads",
        max_file_size: int = 5 * 1024 * 1024,  # 5MB
        allowed_extensions: set[str] | None = None,
        chunk_size: int = 1024 * 1024,  # 1MB
    ):
        self.upload_dir = Path(upload_dir)
        self.max_file_size = max_file_size
        self.allowed_extensions = allowed_extensions or set()
        self.chunk_size = chunk_size

        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def _validate_file(self, file: UploadFile) -> None:
        if file.size and file.size > self.max_file_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Размер файла слишком большой. Максимальный размер: "
                f"{self.max_file_size // (1024 * 1024)}MB",
            )

        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Имя файла не указано",
            )

        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in self.allowed_extensions:
            allowed = ", ".join(self.allowed_extensions)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Неподдерживаемый формат файла. Разрешены: {allowed}",
            )

    def _generate_unique_filename(self, original_filename: str) -> str:
        file_extension = Path(original_filename).suffix.lower()
        return f"{uuid.uuid4()}{file_extension}"

    async def save_file(
        self, file: UploadFile, subdirectory: str | None = None
    ) -> str:
        self._validate_file(file)

        save_dir = self.upload_dir
        if subdirectory:
            save_dir /= subdirectory
            save_dir.mkdir(parents=True, exist_ok=True)

        assert file.filename is not None
        unique_filename = self._generate_unique_filename(file.filename)
        file_path = save_dir / unique_filename

        try:
            async with aiofiles.open(file_path, "wb") as buffer:
                content = await file.read()
                await buffer.write(content)

            return unique_filename  # noqa: TRY300

        except Exception as e:
            if file_path.exists():
                await aiofiles.os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при сохранении файла",
            ) from e
        finally:
            await file.close()

    async def delete_file(
        self, filename: str, subdirectory: str | None = None
    ) -> bool:
        file_dir = self.upload_dir
        if subdirectory:
            file_dir /= subdirectory

        file_path = file_dir / filename

        try:
            if file_path.exists():
                await aiofiles.os.remove(file_path)
                return True
            return False  # noqa: TRY300
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при удалении файла",
            ) from e

    def get_file_path(
        self, filename: str, subdirectory: str | None = None
    ) -> Path:
        file_dir = self.upload_dir
        if subdirectory:
            file_dir /= subdirectory

        return file_dir / filename

    def file_exists(
        self, filename: str, subdirectory: str | None = None
    ) -> bool:
        file_path = self.get_file_path(filename, subdirectory)
        return file_path.exists()

    def get_file_url(
        self,
        filename: str,
        base_url: str = "/api/v1/files",
        subdirectory: str | None = None,
    ) -> str:
        if subdirectory:
            return f"{base_url}/{subdirectory}/{filename}"
        return f"{base_url}/{filename}"


file_manager = FileManager()

from fastapi.datastructures import UploadFile

from app.core.file_manager import FileManager


class AvatarFileManager(FileManager):
    def __init__(self):
        super().__init__(
            upload_dir="uploads/avatars",
            max_file_size=5 * 1024 * 1024,  # 5MB
            allowed_extensions={".jpg", ".jpeg", ".png", ".gif", ".webp"},
        )

    async def save_avatar(self, file: UploadFile) -> str:
        return await self.save_file(file)

    async def delete_avatar(self, filename: str) -> bool:
        return await self.delete_file(filename)

    def get_avatar_url(self, filename: str) -> str:
        return self.get_file_url(filename, base_url="/api/v1/users/me/avatar")


avatar_file_manager = AvatarFileManager()

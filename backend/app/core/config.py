from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    redis_url: str
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_default_region: str = "us-east-1"
    s3_bucket_name: str
    s3_endpoint_url: str | None = None
    openai_api_key: str
    anthropic_api_key: str
    secret_key: str
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    environment: str = "development"
    debug: bool = True

    class Config:
        env_file = ".env"


settings = Settings()

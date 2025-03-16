from pydantic import BaseModel, ConfigDict


class RecBaseModel(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

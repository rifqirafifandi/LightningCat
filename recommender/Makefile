.PHONY: codegen fmt serve

codegen:
	datamodel-codegen --input oas.yaml --output src/recommender/model.py --input-file-type openapi --output-model-type pydantic_v2.BaseModel

fmt:
	uvx nb-clean clean notebooks
	uvx ruff format

serve:
	uvicorn recommender.app:app --reload

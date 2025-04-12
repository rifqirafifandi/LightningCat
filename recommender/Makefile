.PHONY: codegen fmt serve docker-build

codegen:
	datamodel-codegen --use-subclass-enum --collapse-root-models --input oas.yaml --output src/recommender/model.py --target-python-version "3.10" --input-file-type openapi --output-model-type pydantic_v2.BaseModel --base-class recommender.base.RecBaseModel

fmt:
	uvx nb-clean clean notebooks
	uvx ruff format

serve:
	uvicorn recommender.app:app --reload --host 0.0.0.0

docker-build:
	docker build --tag recommender .

docker-serve:
	docker run --publish 8000:8000 recommender:latest

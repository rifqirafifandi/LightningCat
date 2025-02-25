.PHONY: codegen fmt

codegen:
	datamodel-codegen --input oas.yaml --output src/model.py

fmt:
	uvx nb-clean clean notebooks
	uvx ruff format

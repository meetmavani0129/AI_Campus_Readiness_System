"""Wrapper module for domain prediction.

Exports the same API as the `ml_models` implementation to simplify import paths.
"""

from ml_models.domain_prediction import predict_domain

__all__ = ["predict_domain"]

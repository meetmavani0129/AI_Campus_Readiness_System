"""Wrapper module for ML-ready readiness model.

This module provides a stable import path for higher-level components that
expect a `ml_engine` package.
"""

from ml_models.readiness_model import predict_readiness, get_readiness_category

__all__ = ["predict_readiness", "get_readiness_category"]

"""Placement prediction helper used by the frontend and backend."""

from ml_models.placement_predictor import predict_placement


def estimate_placement_probability(cgpa: float, coding: int, technical: int, communication: int, projects: int, internships: int) -> int:
    """Returns placement probability (0-100) based on the trained placement model."""

    return predict_placement({
        "CGPA": cgpa,
        "Coding_Ability": coding,
        "Technical_Score": technical,
        "Communication_Score": communication,
        "Projects": projects,
        "Internships": internships,
    })

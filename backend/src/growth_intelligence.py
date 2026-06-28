def learning_velocity(
    certifications,
    projects
):

    score = (
        len(certifications) * 2
        + len(projects)
    )

    return min(
        round(score / 10, 2),
        1.0
    )


def adaptability_score(
    behavioral_signals
):

    score = (
        behavioral_signals.get(
            "initiative",
            0
        )
        +
        behavioral_signals.get(
            "collaboration",
            0
        )
    )

    return min(
        round(score / 5, 2),
        1.0
    )


def leadership_trajectory(
    leadership_signals
):

    return min(
        round(
            len(
                leadership_signals
            ) / 5,
            2
        ),
        1.0
    )


def growth_potential(
    learning,
    adaptability,
    leadership
):

    return round(
        (
            learning +
            adaptability +
            leadership
        ) / 3,
        2
    )
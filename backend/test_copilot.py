from src.recruiter_copilot import RecruiterCopilot

copilot = RecruiterCopilot()

candidates = [
    {
        "name": "Alice",
        "parsed_skills": [
            "python",
            "fastapi",
            "aws"
        ],
        "final_score": 0.91,
        "risk_score": 10
    },
    {
        "name": "Bob",
        "parsed_skills": [
            "react",
            "javascript"
        ],
        "final_score": 0.72,
        "risk_score": 25
    }
]

result = copilot.answer(

    query="Find senior Python engineers with low risk and generate interview questions",

    candidates=candidates

)

print(result)
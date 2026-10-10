from src.ranker import rank_candidates

jd_text = """
We are hiring a Backend Engineer.
Python is required.
Strong Python backend experience is mandatory.
Experience with FastAPI and Docker required.
"""

resume_1 = """
Built scalable REST APIs using FastAPI and Python.
Worked with deep learning models in PyTorch.
Deployed services using Docker.
"""

resume_2 = """
Experienced graphic designer specializing in Adobe tools and UI mockups.
"""

results = rank_candidates(jd_text, [resume_1, resume_2])

for r in results:
    print("\n", r["candidate_id"])
    print("Final Score:", r["final_score"])
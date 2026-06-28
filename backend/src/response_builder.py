from typing import Any, Dict, List


class ResponseBuilder:

    @staticmethod
    def success(
        intent: str,
        execution_plan: List[str],
        data: Dict[str, Any]
    ) -> Dict[str, Any]:

        return {
            "success": True,
            "intent": intent,
            "execution_plan": execution_plan,
            "data": data
        }

    @staticmethod
    def error(
        message: str,
        execution_plan: List[str] | None = None
    ) -> Dict[str, Any]:

        return {
            "success": False,
            "message": message,
            "execution_plan": execution_plan or []
        }
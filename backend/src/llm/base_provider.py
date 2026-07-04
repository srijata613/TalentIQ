from abc import ABC, abstractmethod


class BaseLLMProvider(ABC):

    @abstractmethod
    def extract_resume(self, resume_text: str):
        pass
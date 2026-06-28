from abc import ABC, abstractmethod
from typing import Dict


class BaseAgent(ABC):

    def __init__(self):

        self.name = self.__class__.__name__

    @abstractmethod
    def run(
        self,
        context: Dict
    ) -> Dict:
        pass
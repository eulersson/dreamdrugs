import abc

class Model(metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def run(self, *args, **kwargs):
        """To be called every time the backend endpoint is hit. All the args
        and kwargs supplied to it should come from the request's parameters."""

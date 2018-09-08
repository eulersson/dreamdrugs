import abc
import random

import redis
r = redis.StrictRedis(host='database')

import logging
log = logging.getLogger('dreambox')


class Model(metaclass=abc.ABCMeta):
    """
    Base for any kind of computing model that generates images.

    Attributes:
        progress (int): Percentage of completion for the current computation.
        job_id (int): Identifier for that particular run task.
    """

    def __init__(self, *args, **kwargs):
        self.progress = 0
        self.job_id = random.randint(0, 999) # TODO: Use sequencial instead.

    def update_progress(self, progress):
        """
        Called from the model to let the frontend know about progress change.
        """
        self.progress = progress
        log.warn(self.job_id)
        log.warn(progress)
        r.publish(str(self.job_id), progress)

    def set_error_state(self):
        """
        If problems ocurred during model computation 999 is the convention.
        """
        r.publish(str(self.job_id), 999)

    @abc.abstractmethod
    def run(self, *args, **kwargs):
        """
        To be called every time the backend endpoint is hit. All the args
        and kwargs supplied to it should come from the request's parameters.
        """

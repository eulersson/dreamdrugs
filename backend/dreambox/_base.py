import abc
import random
import inspect

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

    # TODO: Make the decorated function preserve docstrings and signature.
    @staticmethod
    def signature_info(**sig_kw):
        def decorator(f):
            run_func_arg_spec = inspect.getfullargspec(f)
            keywords = run_func_arg_spec.args[-len(run_func_arg_spec.defaults):]
            defaults = dict(zip(keywords, run_func_arg_spec.defaults))

            assert set(sig_kw.keys()) == set(keywords), \
                "Signature information does not match function's actual " \
                "signature: %s" % (set(sig_kw.keys()) - set(keywords))

            f.spec = {}
            for key, value in sig_kw.items():
                f.spec[key] = {
                    'default': defaults[key],
                    'validation': sig_kw[key].to_dict(),
                }
            return f
        return decorator

    @classmethod
    def get_signature(cls):
        """
        Returns information to the frontend about what parameters the run
        function accepts, their defaults and ranges.
        """
        return cls.run.spec

    def update_progress(self, progress):
        """
        Called from the model to let the frontend know about progress updates.
        """
        self.progress = progress
        r.publish(str(self.job_id), int(round(progress, 0)))

    def notify_error(self, msg):
        """
        Tell all the subscribed clients the computation failed.
        """
        r.publish(str(self.job_id), 'FAILED %s' % msg)

    def notify_finished(self):
        """
        Tell all the subscribed clients the computation finished.
        """
        r.publish(str(self.job_id), 'FINISHED')

    @abc.abstractmethod
    def run(self, *args, **kwargs):
        """
        To be called every time the backend endpoint is hit. All the args
        and kwargs supplied to it should come from the POST request's JSON data.
        """

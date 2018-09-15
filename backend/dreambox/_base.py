import abc
import random
import inspect

from dreambox.validators import ValidationError

import redis
redis_client = redis.StrictRedis(host='database')


class Model(metaclass=abc.ABCMeta):
    """
    Base for any kind of computing model that generates images.

    Attributes:
        progress (int): Percentage of completion for the current computation.
        job_id (int): Identifier for that particular run task. The handle the
            frontend has in order to retrieve progress updates.
    """

    def __init__(self, *args, **kwargs):
        self.progress = 0
        self.job_id = random.randint(0, 999) # TODO: Use sequencial instead.

    @staticmethod
    def accepts(**validators):
        """
        Allows keyword argument validation on the Model's run function. That
        has various advantages:

            * Enforcing arguments of a specific type.
            * Constraint the possible values of the arguments.
            * Inform the frontend what kind of data the run function takes so
              it can expose the right widgets dynamically to interact with it.

        The way you would normally use the accepts decorator is::

            from dreambox.validators import StringOneOf, IntBetween
            @accepts(name=stringOneOf('dog', 'cat'), age=IntBetween(0, 30))
            def run(name='dog', age=3):
                pass

        If one of the arguments can also have a default of None::

            @accepts(age=IntBetween(0, 30, optional=True)
            def run(age=None):
                if age is None:
                    # do stuff
        """
        def decorator(f):
            run_func_arg_spec = inspect.getfullargspec(f)
            keywords = run_func_arg_spec.args[-len(run_func_arg_spec.defaults):]
            defaults = dict(zip(keywords, run_func_arg_spec.defaults))

            assert set(validators.keys()) == set(keywords), \
                "Signature information does not match function's actual " \
                "signature: %s" % (set(validators.keys()) - set(keywords))

            f.spec = {}
            for key, validator in validators.items():
                try:
                    validator(defaults[key])
                except ValidationError as e:
                    raise ValidationError("{}: {}".format(key, str(e)))

                f.spec[key] = {
                    'default': defaults[key],
                    'validation': validators[key].to_json(),
                }

            return f
        return decorator

    @classmethod
    def get_signature(cls):
        """
        Returns information to the frontend about what parameters the run
        function accepts, their default values, ranges, choices, etc...
        """
        return cls.run.spec

    def update_progress(self, progress):
        """
        Called from the model to let the frontend know about progress updates.
        """
        self.progress = progress
        redis_client.publish(str(self.job_id), int(round(progress, 0)))

    def notify_error(self, msg):
        """
        Tell all the subscribed clients the computation failed.
        """
        redis_client.publish(str(self.job_id), 'FAILED %s' % msg)

    def notify_finished(self):
        """
        Tell all the subscribed clients the computation finished with success.
        """
        redis_client.publish(str(self.job_id), 'FINISHED')

    @abc.abstractmethod
    def run(self, *args, **kwargs):
        """
        To be called every time the backend endpoint is hit. All the args
        and kwargs supplied to it should come from the POST request's JSON data.
        """

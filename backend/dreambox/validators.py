import abc


class ValidationError(Exception): pass

class Validator(metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def __call__(self, value):
        pass

    @abc.abstractmethod
    def to_dict(self):
        pass


class Typed(metaclass=abc.ABCMeta):
    _type = None

    def __call__(self, value):
        if not isinstance(value, self._type):
            raise ValidationError("%s is not of type %s" % (value, self._type.__name__))

    def to_dict(self):
        return {'type': self._type.__name__}


class TypedBetween(Typed, metaclass=abc.ABCMeta):
    def __init__(self, min, max):
        self.min = self._type(min)
        self.max = self._type(max)

    def __call__(self, value):
        super(TypedBetween, self).__call__(value)

        if value < self.min or value > self.max:
            raise ValidationError(
                "%s must be between %s and %s" % (value, self.min, self.max)
            )

    def to_dict(self):
        return {
            **super(TypedBetween, self).to_dict(),
            'range': [self.min, self.max]
        }


class TypedOneOf(Typed):
    _type = None

    def __init__(self, *allowed):
        self.allowed = allowed

    def __call__(self, value):
        super(TypedOneOf, self).__call__(value)
        if value not in self.allowed:
            raise ValidationError(
                "%s is not any of: %s." % (value, ', '.join(self.allowed))
            )

    def to_dict(self):
        return {
            **super(TypedOneOf, self).to_dict(),
            'choices': list(self.allowed)
        }


class IsBoolean(Typed):
    _type = bool


class IntBetween(TypedBetween):
    _type = int


class FloatBetween(TypedBetween):
    _type = float


class StringOneOf(TypedOneOf):
    _type = str


class IntOneOf(TypedOneOf):
    _type = int

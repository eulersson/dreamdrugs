"""
Validators have two main functions in the application.

The first one is data validation on the backend side as to contraint the range
of values an argument takes.

The second is to inform the backend what are the arguments of a particular
model, so that it can construct the UI widgets properly to send valid values
to the backend.

In order to describe and validate a model's run function signature you need to
decorate it with dreamdrugs.Model.accepts as follows::

    @Model.accepts()
        blend=FloatBetween(0.0, 1.0),
        depth_level=IntBetween(1, 10),
        layer_name=StringOneOf(['mixed4a', 'mixed4b'])
    )
    def run(impath, blend=0.5, depth_level=4, layer_name='mixed4a'):'
        # Body of the function...
"""
import abc


class ValidationError(Exception):
    """
    Exception to raise on validation failure.
    """


class _Validator(metaclass=abc.ABCMeta):
    """
    Base class for all validators. Inheriting classes have to implement
    :meth:`validate` and :meth:`to_json`.

    Arguments:
        *args: Allows subclasses to manipulate them as they wish.
        optional (bool, optional): It will not validate against None.

    Attributes:
        optional (bool): It will not validate against None.
    """

    def __init__(self, optional=False):
        self.optional = optional

    def __call__(self, value):
        """
        Calling the validator object passing a value does the validation.
        """
        # An optional validator is permissive when a None value is passed.
        if self.optional:
            if value:
                self.validate(value)

        # Mandatory validators must always validate.
        else:
            self.validate(value)

    @abc.abstractmethod
    def validate(self, value):
        """
        Validation does not have to return a value, but instead, on failed
        validations, :class:`ValidationError` needs to be raised.
        """

    @abc.abstractmethod
    def to_json(self):
        """
        Returns the JSON representation of the validators that is going to be
        used by the frontend to create the right widget for that parameter.

        Returns:
            dict: Dictionary to be converted to JSON and sent out to frontend.
        """
        return {'optional': self.optional}


class _Typed(_Validator, metaclass=abc.ABCMeta):
    """
    Base class for validators that need to get their type checked.

    Attributes:
        _type (type): Object type as would be returned by `type(3)`.
    """

    _type = None

    def validate(self, value):
        """
        Ensures value is of type :attribute:`_type`.

        Arguments:
            value (object): Value to check type against.
        """
        if not isinstance(value, self._type):
            raise ValidationError(
                "%s is not of type '%s'" % (value, self._type.__name__)
            )

    def to_json(self):
        """
        Returns the valid type as the 'type' JSON entry.
        """
        return {**super(_Typed, self).to_json(), 'type': self._type.__name__}


class _Between(_Validator, metaclass=abc.ABCMeta):
    """
    Base class for validators that must fall between a range `[min, max]`.

    Attributes:
        min (int): Minimum, lower bound.
        max (int): Maximum, upper bound.
    """

    def __init__(self, min, max, **kwargs):
        super(_Between, self).__init__(**kwargs)
        self.min = self._type(min)
        self.max = self._type(max)

    def validate(self, value):
        """
        Ensures value is between :attribute:`min` and :attribute:`max`.
        """
        if value < self.min or value > self.max:
            raise ValidationError(
                "%s must be between %s and %s" % (value, self.min, self.max)
            )

    def to_json(self):
        """
        Returns the valid range as the 'range' property in the JSON object.
        """
        return {**super(_Between, self).to_json(), 'range': [self.min, self.max]}


class _OneOf(_Validator, metaclass=abc.ABCMeta):
    """
    Base class for validators that must check a value to be one among a
    selection of choices.

    Attributes:
        allowed (list): Available choices.
    """

    def __init__(self, *allowed, **kwargs):
        super(_OneOf, self).__init__(**kwargs)
        self.allowed = allowed

    def validate(self, value):
        """
        Value needs to be in :attribute:`allowed`.
        """
        if value not in self.allowed:
            raise ValidationError("{} is not any of: {}".format(value, self.allowed))

    def to_json(self):
        """
        Returns allowed elements (list) as the 'choices' JSON property.
        """
        return {**super(_OneOf, self).to_json(), 'choices': list(self.allowed)}


class IsBoolean(_Typed):
    """
    Ensure value is either True or False.
    """

    _type = bool


class IntBetween(_Between, _Typed):
    """
    Ensure value is an integer compressed between two other integers.

    Arguments:
        min (float): Lower bound.
        max (float): Higher bound.
    """

    _type = int


class FloatBetween(_Between, _Typed):
    """
    Ensure value is a floating point number compressed between two other
    floating point numbers.

    Arguments:
        min (float): Lower bound.
        max (float): Higher bound.
    """

    _type = float


class StringOneOf(_OneOf, _Typed):
    """
    Value has to be one of a list of strings.

    Arguments:
        allowed (list of str): Available strings to choose from.
    """

    _type = str


class IntOneOf(_OneOf, _Typed):
    """
    Value has to be one of a list of integer numbers.

    Arguments:
        allowed (list of int): Available integer numbers to choose from.
    """

    _type = int

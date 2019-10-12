import pytest

from dreambox.validators import (
    _Validator,
    _Typed,
    ValidationError,
    IntBetween,
    IntOneOf,
    FloatBetween,
    StringOneOf,
)


class TrackCalledValidator(_Validator):
    """
    Mocked validator to track if the validation method got called or not.
    """

    def __init__(self, *args, **kwargs):
        self.validate_called = False
        return super().__init__(*args, **kwargs)

    def validate(self, value):
        self.validate_called = True

    def to_json(self):
        return super().to_json()


def test_cannot_instantiate_abstract_validator():
    """
    Instancing the base class must fail. It needs to be subclassed.
    """
    with pytest.raises(TypeError, match=r"Can't instantiate abstract class"):
        _Validator()


def test_must_implement_validate_and_to_json_methods():
    """
    All validators must implement the `to_json` and `validate` functions.
    """

    class IncompleteValidator(_Validator):
        pass

    with pytest.raises(
        TypeError,
        match=(
            r"Can't instantiate abstract class _Validator with abstract methods "
            "to_json, validate"
        ),
    ):
        _Validator()


def test_mandatory_validator():
    """
    Given a mandatory validator
    When a None value is passed
    Then it does run validation
    """
    mandatory_validator = TrackCalledValidator(optional=False)
    assert mandatory_validator.to_json() == {"optional": False}
    mandatory_validator(None)
    assert mandatory_validator.validate_called == True


def test_optional_validator():
    """
    Given an optional validator
    When a None value is passed
    Then it does not run validation
    """
    optional_validator = TrackCalledValidator(optional=True)
    assert optional_validator.to_json() == {"optional": True}
    optional_validator(None)
    assert optional_validator.validate_called == False


def test_typed_validator():
    """
    Test type restriction validation.
    """

    class TypedValidator(_Typed):
        _type = str

    typed_validator = TypedValidator()
    typed_validator("a string is ok")

    with pytest.raises(ValidationError, match=r"88 is not of type 'str'"):
        typed_validator(88)

    assert typed_validator.to_json() == {'optional': False, 'type': 'str'}


def test_between_validators():
    """
    Test ranges can be validated.
    """
    # Inner ranges Must not raise errors.
    IntBetween(1, 10)(5)
    FloatBetween(1.7, 10.3)(5)

    # Limits are included within the ranges.
    IntBetween(1, 10)(10)
    IntBetween(1, 10)(1)
    FloatBetween(1.7, 10.3)(10.3)
    FloatBetween(1.7, 10.3)(1.7)

    # Outer ranges must fail validation.
    with pytest.raises(ValidationError, match=r"^11 must be between 1 and 10$"):
        IntBetween(1, 10)(11)

    with pytest.raises(ValidationError, match=r"^11.2 must be between 1.7 and 10.3$"):
        FloatBetween(1.7, 10.3)(11.2)

    assert IntBetween(1, 10).to_json() == {
        'optional': False,
        'range': [1, 10],
        'type': 'int',
    }

    assert FloatBetween(1.7, 10.3).to_json() == {
        'optional': False,
        'range': [1.7, 10.3],
        'type': 'float',
    }


def test_one_of_validators():
    """
    Test restricting values to specific enumeration of possibilities.
    """
    IntOneOf(1, 2, 3)(2)
    StringOneOf('foo', 'bar')('foo')

    with pytest.raises(ValidationError, match=r"^4 is not any of: \(1, 2, 3\)"):
        IntOneOf(1, 2, 3)(4)

    with pytest.raises(ValidationError, match=r"^baz is not any of: \('foo', 'bar'\)$"):
        StringOneOf('foo', 'bar')('baz')

    assert IntOneOf(1, 2, 3).to_json() == {
        'choices': [1, 2, 3],
        'optional': False,
        'type': 'int',
    }

    assert StringOneOf('foo', 'bar').to_json() == {
        'choices': ['foo', 'bar'],
        'optional': False,
        'type': 'str',
    }

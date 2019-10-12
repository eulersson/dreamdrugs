import pytest

from dreambox.validators import _Validator


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


class TestValidator:
    def test_cannot_instantiate(self):
        with pytest.raises(TypeError, match="Can't instantiate abstract class"):
            _Validator()

    def test_mandatory(self):
        """
        Given a mandatory validator
        When a None value is passed
        Then it does run validation
        """
        mandatory_validator = TrackCalledValidator(optional=False)
        assert mandatory_validator.to_json() == {"optional": False}
        mandatory_validator(None)
        assert mandatory_validator.validate_called == True

    def test_optional(self):
        """
        Given an optional validator
        When a None value is passed
        Then it does not run validation
        """
        optional_validator = TrackCalledValidator(optional=True)
        assert optional_validator.to_json() == {"optional": True}
        optional_validator(None)
        assert optional_validator.validate_called == False

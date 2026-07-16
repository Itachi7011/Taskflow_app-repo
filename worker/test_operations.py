# test_operations.py
from operations import run_operation, op_word_count


def test_uppercase():
    assert run_operation("uppercase", "hello world") == "HELLO WORLD"


def test_lowercase():
    assert run_operation("lowercase", "HELLO World") == "hello world"


def test_reverse():
    assert run_operation("reverse", "abcdef") == "fedcba"


def test_word_count_simple():
    assert run_operation("word_count", "the quick brown fox") == "4"


def test_word_count_extra_whitespace():
    # multiple spaces/newlines shouldnt be counted as extra words
    assert op_word_count("hello    world\n\nfoo") == "3"


def test_unknown_operation_raises():
    try:
        run_operation("does_not_exist", "text")
        assert False, "expected a ValueError"
    except ValueError:
        pass

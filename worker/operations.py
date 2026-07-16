# operations.py
#
# each of these just takes the input text and gives back the processed
# result as a string. keeping them dumb and simple on purpose, this is
# the whole "AI processing" for this assignment, nothing fancier needed.


def op_uppercase(text: str) -> str:
    return text.upper()


def op_lowercase(text: str) -> str:
    return text.lower()


def op_reverse(text: str) -> str:
    return text[::-1]


def op_word_count(text: str) -> str:
    # split() with no args already handles multiple spaces/newlines fine,
    # dont need to overthink this with regex or anything
    words = text.split()
    return str(len(words))


# maps the operationType string (comming from mongo/node) to the actual function
OPERATIONS = {
    "uppercase": op_uppercase,
    "lowercase": op_lowercase,
    "reverse": op_reverse,
    "word_count": op_word_count,
}


def run_operation(operation_type: str, text: str) -> str:
    func = OPERATIONS.get(operation_type)
    if not func:
        raise ValueError(f"Unknown operation type: {operation_type}")
    return func(text)

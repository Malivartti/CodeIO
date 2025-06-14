from contextvars import ContextVar, Token

_explicit_transaction: ContextVar[bool] = ContextVar(
    "explicit_transaction", default=False
)


def is_in_explicit_transaction() -> bool:
    return _explicit_transaction.get()


def set_explicit_transaction(in_transaction: bool) -> Token[bool]:
    return _explicit_transaction.set(in_transaction)


def reset_explicit_transaction(token: Token[bool]) -> None:
    _explicit_transaction.reset(token)

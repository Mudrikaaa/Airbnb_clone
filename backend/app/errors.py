"""Domain errors raised by services.

Services don't know about HTTP; they raise these, and one handler in main.py turns them into
`{"detail": "..."}` responses with the right status code.
"""


class AppError(Exception):
    status_code = 400

    def __init__(self, detail: str):
        super().__init__(detail)
        self.detail = detail


class NotFoundError(AppError):
    status_code = 404


class NotAuthenticatedError(AppError):
    status_code = 401


class ForbiddenError(AppError):
    status_code = 403


class ConflictError(AppError):
    status_code = 409


class InvalidRequestError(AppError):
    """Well-formed input that breaks a business rule (e.g. too many guests)."""

    status_code = 422

// Utility functions for error handling
export function isMongooseValidationError(
  error: unknown,
): error is { name: string; errors: Record<string, { message: string }> } {
  return (
    error !== null &&
    typeof error === "object" &&
    "name" in error &&
    (error as any).name === "ValidationError" &&
    "errors" in error
  )
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return "An unknown error occurred"
}

export function getErrorMessage(err: unknown, fallback: string = "An error occurred"): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: { message?: string } } }).response;
    if (res?.data?.message && typeof res.data.message === "string") {
      return res.data.message;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

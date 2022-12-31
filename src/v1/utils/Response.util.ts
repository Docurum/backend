export const successResp = <T>(status: number, message: T): { status: number; message: T } => {
  return {
    status,
    message,
  };
};

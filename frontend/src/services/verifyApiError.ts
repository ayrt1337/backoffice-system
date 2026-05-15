import router from "../router";
import { useServerError } from "../composables/useServerError";
import { useUnauthorized } from "../composables/useUnauthorized";

const { showServerErrorPage } = useServerError();
const { showUnauthorizedPage } = useUnauthorized();

export const verifyApiError = (
  statusCode: number | undefined
): boolean => {
  if (!statusCode) {
    showServerErrorPage(true);
    return false;
  }

  switch (statusCode) {
    case 401: {
      router.push("/login");
      return false;
    }
    case 403: {
      showUnauthorizedPage(true);
      return false;
    }
    case 500: {
      showServerErrorPage(true);
      return false;
    }
    default: {
      return true;
    }
  }
};

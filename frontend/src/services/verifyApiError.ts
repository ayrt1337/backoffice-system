import router from "../router";
import { useToast } from "../composables/useToast";
import { useServerError } from "../composables/useServerError";
import { useUnauthorized } from "../composables/useUnauthorized";

const { showToast } = useToast();
const { showServerErrorPage } = useServerError();
const { showUnauthorizedPage } = useUnauthorized();

export const verifyApiError = (
  statusCode: number | undefined,
  isMethodGet: boolean = true,
): boolean => {
  if (!statusCode) {
    if (isMethodGet) {
      showServerErrorPage(true);
      return false;
    }

    showToast("Ops! Algo deu errado.", "error");
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
      if (isMethodGet) {
        showServerErrorPage(true);
        return false;
      }

      showToast("Ops! Algo deu errado.", "error");
      return false;
    }
    default: {
      return true;
    }
  }
};

import router from "../router";
import { useToast } from "../composables/useToast";

const { showToast } = useToast();

export const verifyApiError = (statusCode: number, isMethodGet: boolean = true): boolean => {
  switch (statusCode) {
    case 401: {
      router.push("/login");
      return false;
    }
    case 403: {
      // SHOW 403 PAGE
      return false;
    }
    case 500: {
      if (isMethodGet) {
        // SHOW 500 PAGE
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

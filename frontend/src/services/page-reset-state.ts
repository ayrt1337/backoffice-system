import { useServerError } from "../composables/use-server-error";
import { useUnauthorized } from "../composables/use-unauthorized";

const { showServerErrorPage } = useServerError();
const { showUnauthorizedPage } = useUnauthorized();

export const resetPageState = () => {
  showServerErrorPage(false);
  showUnauthorizedPage(false);
};

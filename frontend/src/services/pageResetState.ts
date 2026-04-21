import { useServerError } from "../composables/useServerError";
import { useUnauthorized } from "../composables/useUnauthorized";

const { showServerErrorPage } = useServerError();
const { showUnauthorizedPage } = useUnauthorized();

export const resetPageState = () => {
    showServerErrorPage(false);
    showUnauthorizedPage(false);
};
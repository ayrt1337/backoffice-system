import { useServerError } from "../composables/useServerError";
import { useUnauthorized } from "../composables/useUnauthorized";
import { useLoading } from "../composables/useLoading";

const { showLoadingPage } = useLoading();
const { showServerErrorPage } = useServerError();
const { showUnauthorizedPage } = useUnauthorized();

export const resetPageState = () => {
    showLoadingPage(true);
    showServerErrorPage(false);
    showUnauthorizedPage(false);
};
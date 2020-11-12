import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/crmTab/index.html")
@PreventIframe("/crmTab/config.html")
@PreventIframe("/crmTab/remove.html")
export class CrmTab {
}

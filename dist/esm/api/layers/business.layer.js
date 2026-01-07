import { ControlsLayer } from './controls.layer.js';
export class BusinessLayer extends ControlsLayer {
    page;
    browser;
    constructor(page, browser) {
        super(browser, page);
        this.page = page;
        this.browser = browser;
    }
    /**
     * Querys product catalog
     * @param id Buisness profile id ('00000@c.us')
     */
    async getBusinessProfilesProducts(id) {
        return this.page.evaluate(({ id }) => {
            WAPI.getBusinessProfilesProducts(id);
        }, { id });
    }
    /**
     * Sends product with product image to given chat id
     * @param to Chat id
     * @param base64 Base64 image data
     * @param caption Message body
     * @param businessId Business id number that owns the product ('0000@c.us')
     * @param productId Product id, see method getBusinessProfilesProducts for more info
     */
    async sendImageWithProduct(to, base64, caption, businessId, productId) {
        return this.page.evaluate(({ to, base64, businessId, caption, productId }) => {
            WAPI.sendImageWithProduct(base64, to, caption, businessId, productId);
        }, { to, base64, businessId, caption, productId });
    }
}
//# sourceMappingURL=business.layer.js.map
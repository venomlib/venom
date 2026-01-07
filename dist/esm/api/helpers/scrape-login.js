export async function scrapeLogin(page) {
    const result = await page
        .evaluate(() => {
        const count = document.querySelector('._9a59P');
        let data;
        data = false;
        if (count != null) {
            const text = count.textContent, timeNumber = text.match('Invalid');
            if (timeNumber) {
                data = true;
            }
            return data;
        }
    })
        .catch(() => undefined);
    return result;
}
//# sourceMappingURL=scrape-login.js.map
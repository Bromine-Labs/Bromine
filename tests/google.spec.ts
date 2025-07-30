import { test, expect, FrameLocator, Page } from "@playwright/test";
test.describe("Google", () => {
    test("The front page can load.", async ({ page }) => {

        await page.route("**", route => route.continue());
        await page.goto("http://localhost:4321/");
        await page.waitForSelector("#address");
        const bar = page.locator("#address");
        const title = await page.locator("h1.text-text.font-semibold").textContent();
        const frame = page.frameLocator("iframe");
        expect(title).toBe("bromine");
  
        expect(bar).not.toBeNull();

        await bar.fill("https://www.google.com/");

        await page.waitForTimeout(1000);
    
        await bar.press("Enter");



        const search = await frame.locator("textarea[Title='Search']").first().waitFor({ state: "visible" });
        expect(search).not.toBeNull();
    });

    test("The Google Apps menu opens and content is visible.", async ({ page }) => {

        await page.route("**", route => route.continue());
        await page.goto("http://localhost:4321/");
        await page.waitForSelector("#address");
        const bar = page.locator("#address");
        const title = await page.locator("h1.text-text.font-semibold").textContent();
        const frame = page.frameLocator("iframe");
        expect(title).toBe("bromine");
  
        expect(bar).not.toBeNull();

        await bar.fill("https://www.google.com/");

        await page.waitForTimeout(1000);
    
        await bar.press("Enter");
        
        frame.locator("a[aria-label='Google apps']").first().click();

        const appsMenuFrame = frame.locator("iframe[name='app']");
        await appsMenuFrame.waitFor({ state: "visible" });

        await appsMenuFrame.contentFrame().locator("c-wiz").first().waitFor({ state: "visible" });

        const appsMenu = await appsMenuFrame.getAttribute("src");

        expect(appsMenu).not.toBeNull();
    });
})

import type { Browser, ElementHandle, GoToOptions, LaunchOptions, Page } from 'puppeteer';
import puppeteer from "puppeteer-extra";
const UserAgent = require('user-agents');
const AnonymizeUAPlugin = require('puppeteer-extra-plugin-anonymize-ua');
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const UserPrefsPlugin = require('puppeteer-extra-plugin-user-preferences');

puppeteer.use(StealthPlugin());
puppeteer.use(UserPrefsPlugin({
  userPrefs: {
    intl: { accept_languages: 'pt-BR,pt' },
    timezone_id: 'America/Sao_Paulo',
    download: {
      prompt_for_download: false,
      open_pdf_in_system_reader: true
    },
    plugins: {
        always_open_pdf_externally: true
    }
  },
}));
puppeteer.use(AnonymizeUAPlugin());

type CustomSelectOptions = {
  selectorSelectIndex?: number;
}

export class Automation {
  public browser = {} as Browser;
  public page = {} as Page;
  public multiplierTime: number = 1;
  public downloadPath: string = '';

  async open(launchOptions: LaunchOptions = {}) {
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--profile-directory=Profile 1', "--no-sandbox", '--disable-setuid-sandbox', '--disable-features=PasswordLeakDetection'],
      ...launchOptions
    });
    await this.newPage()
  }

  async newPage() {
    this.page = await this.browser.newPage();
    await this.page.setRequestInterception(true);

    this.page.on('request', (request) => {
      request.continue();
    });

    const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
    await this.page.setUserAgent(userAgent);
  }

  async configDownload(path: string) {
    const client = await this.page.createCDPSession();
    this.downloadPath = path;
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: this.downloadPath,
    });
  }

  async setPage(page: Page) {
    this.page = page;
  }

  async goto(url: string, options: GoToOptions = {}) {
    await this.page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: this.time(30000),
      ...options
    });
    await this.sleep(1000);
  }

  async closeVoidPages() {
    const client = await this.browser.target().createCDPSession();
    await client.send('Target.setDiscoverTargets', { discover: true });

    const { targetInfos } = await client.send('Target.getTargets');

    const blankTabs = targetInfos.filter(target =>
      target.url === '' && target.type === 'page' && target.title === ''
    );

    for (const tab of blankTabs) {
      await client.send('Target.closeTarget', { targetId: tab.targetId });
    }
  }

  async type(selector: string, value: string) {
    await this.page.waitForSelector(selector, { timeout: this.time(2000) });
    await this.page.type(selector, value);
  }

  async click(selector: string, verifyDisabled?: boolean) {
    if (verifyDisabled) await this.page.waitForSelector(`${selector}:not([disabled])`, { timeout: this.time(20000) });
    else await this.page.waitForSelector(selector, { timeout: this.time(4000) });

    await this.sleep(300);
    await this.page.click(selector);
  }

  async select(selector: string, option: string) {
    await this.page.waitForSelector(selector, { timeout: this.time(2000) });
    await this.page.select(selector, option);
  }

  async customSelect(selectorSelect: string, itemSelect: string, itemValue: string, options?: CustomSelectOptions) {
    await this.page.waitForSelector(selectorSelect, { timeout: this.time(2000) });

    let select: ElementHandle<Element> | null;

    if (options?.selectorSelectIndex) {
      const selects = await this.page.$$(selectorSelect);
      select = selects[options.selectorSelectIndex];
    } else {
      select = await this.page.$(selectorSelect);
    }

    if (!select) {
      throw Error('select não encontrado seletor: ' + selectorSelect);
    }

    await select.click();
    await this.sleep(1000);

    await this.page.waitForSelector(itemSelect, { timeout: this.time(2000) });
    const itens = await select.$$(itemSelect);

    for (const item of itens) {
      const value = await this.page.evaluate(el => el.textContent?.trim(), item);
      if (value === itemValue) {
        await item.click();
        break;
      }
    }
  }

  async get(selector: string, options?: { index?: number, text?: string, timeout?: number }): Promise<ElementHandle<Element> | null> {
    try {
      await this.page.waitForSelector(selector, { timeout: this.time(options?.timeout ?? 2000) });
    } catch (error) {
      return null;
    }

    const elements = await this.page.$$(selector);

    if (options?.index !== undefined && elements[options.index]) {
      return elements[options.index];
    }

    if (options?.text) {
      for (const element of elements) {
        const textContent = await this.page.evaluate(el => el.textContent?.trim(), element);
        if (textContent === options.text) {
          return element;
        }
      }
    }

    return null;
  }

  async getValue(selector: string, options?: { index: number }): Promise<string> {
    await this.page.waitForSelector(selector, { timeout: this.time(2000) });

    const value = await this.page.$$eval(selector, (elements, index) => {
      const el = index !== undefined && elements[index] ? elements[index] : elements[0];

      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        return el.value.trim();
      }
      return el.textContent?.trim();
    }, options?.index);

    return value?.replace(/\s+/g, ' ').trim() || '';
  }

  async script(cb: Function) {
    await this.page.evaluate(cb as any);
  }

  async close() {
    await this.browser.close();
  }

  time (timeInMilliseconds: number) {
    return (timeInMilliseconds * this.multiplierTime);
  }

  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async setNewAgent() {
      const userAgent = new UserAgent({
          deviceCategory: "desktop",
          platform: "Linux x86_64",
      });

      await this.page.setUserAgent(userAgent.toString());
  }

  async waitForElement(selector: string, text?: string, time = 500000) {
    if (!text) {
      await this.page.waitForSelector(selector, { timeout: this.time(5000) });
    } else {
      await this.page.waitForFunction(
        (sel, txt) => {
          const elements = document.querySelectorAll(sel);
          return Array.from(elements).some(
            element => element.textContent && element.textContent.includes(txt)
          );
        },
        { timeout: this.time(time) },
        selector,
        text
      );
    }
  }
}

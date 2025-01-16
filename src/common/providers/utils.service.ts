import { Injectable } from '@nestjs/common';
import { parse, HTMLElement } from 'node-html-parser';

@Injectable()
export class UtilService {
  public async makeRequestWithRetries(url: string, maxAttemts: number = 3, attemptDelay: number = 5000): Promise<string> {
    let attempts = 0;

    while (attempts < maxAttemts) {
      try {
        const response = await fetch(url);
        return await response.text();
      }
      catch (e) {
        attempts++;
        if (attempts === maxAttemts) throw e;
        
        console.log(`Error fetching ${url}, attempt ${attempts}`);
        await this.delay(attemptDelay);
      }
    }
  }

  public async getHtmlFromUrl(url: string): Promise<HTMLElement> {
    const response = await this.makeRequestWithRetries(url);
    return parse(response);
  }

  public getConcatedUrl(baseUrl: string, parts: string): string {
    const url = new URL(baseUrl);
    return url.protocol + '//' + url.host + parts;
  }

  public async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async delayRandom(ms: number) {
    const rand = Math.random() * ms + ms;
    return new Promise(resolve => setTimeout(resolve, rand));
  }

  public getDataFromJsonString<T>(jsonString: string, field: string, defaultValue: T): T | null {
    const start = jsonString.indexOf(field);
    const comma = jsonString.indexOf(':', start);
    if (comma === -1 || start === -1) return null;

    let result = '', isQuotaOpen = false, quotaChar = '"';
    const endChar = ",", stack = [];
    const structs = {
      "{": "}",
      "[": "]"
    };

    for (let i = comma + 1; i < jsonString.length; i++) {
      let char = jsonString[i];
      if (structs[char] && !isQuotaOpen) stack.push(structs[char]);

      while (stack.length) {
        result += char;
        if (char === stack[stack.length - 1]) stack.pop();
        i++;
        char = jsonString[i];
      }
      
      if (char === quotaChar && jsonString[i - 1] !== '\\') {
        isQuotaOpen = !isQuotaOpen;
        continue;
      }

      if (char === endChar && !isQuotaOpen) break;

      result += char;
    }
    
    if (result === '') return null;

    if (typeof defaultValue == "number") {
      return parseFloat(result) as unknown as T ?? null;
    }
    if (typeof defaultValue == "string") return result as unknown as T ?? null;
    if (defaultValue instanceof Array) return this.parseArrayFromString(result) as unknown as T;

    throw new Error(`Not implemented for ${typeof defaultValue}`);
  }

  private parseArrayFromString(string: string): string[] {
    return string.replace(/\[|\]|\"/g, '').split(',').map(s => s.trim());
  }
}
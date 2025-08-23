// whatsapp.service.ts
import { Injectable } from '@angular/core';

export interface WhatsAppMessageOptions {
  phone: string;
  message: string;
  countryCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private readonly DEFAULT_COUNTRY_CODE = '972'; // ישראל
  private readonly APP_DETECTION_TIMEOUT = 1200;
  private readonly DOUBLE_CLICK_PROTECTION_TIMEOUT = 3000;
  
  private sendingStates = new Map<string, boolean>();

  /**
   * שליחת הודעה דרך WhatsApp (פותח את האפליקציה עם הודעה מוכנה)
   * הערה: WhatsApp דורש לחיצה ידנית על "שלח" מסיבות אבטחה
   * @param options אפשרויות ההודעה
   * @returns Promise<boolean> - האם החלון נפתח בהצלחה
   */
  async sendMessage(options: WhatsAppMessageOptions): Promise<boolean> {
    const { phone, message, countryCode = this.DEFAULT_COUNTRY_CODE } = options;
    
    // הגנה מפני לחיצות כפולות
    const protectionKey = `${phone}_${Date.now()}`;
    if (this.sendingStates.get(protectionKey)) {
      console.warn('WhatsApp message already being sent');
      return false;
    }
    
    this.sendingStates.set(protectionKey, true);
    
    try {
      const cleanPhone = this.cleanPhoneNumber(phone);
      const fullPhone = `${countryCode}${cleanPhone}`;
      const encodedMessage = encodeURIComponent(message);
      const phoneParam = `phone=${fullPhone}&text=${encodedMessage}`;
      
      const isMobile = this.isMobileDevice();
      
      if (isMobile) {
        this.openMobileWhatsApp(phoneParam);
        return true;
      } else {
        return await this.tryDesktopWhatsApp(phoneParam);
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    } finally {
      // איפוס ההגנה אחרי זמן קצוב
      setTimeout(() => {
        this.sendingStates.delete(protectionKey);
      }, this.DOUBLE_CLICK_PROTECTION_TIMEOUT);
    }
  }

  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  private isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private openMobileWhatsApp(phoneParam: string): void {
    window.location.href = `whatsapp://send?${phoneParam}`;
  }

  private async tryDesktopWhatsApp(phoneParam: string): Promise<boolean> {
    try {
      const appOpened = await this.checkDesktopAppAvailability(`whatsapp://send?${phoneParam}`);
      
      if (!appOpened) {
        this.openWhatsAppWeb(phoneParam);
      }
      
      return true;
    } catch (error) {
      console.error('Error trying desktop WhatsApp:', error);
      this.openWhatsAppWeb(phoneParam);
      return false;
    }
  }

  private checkDesktopAppAvailability(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      let appOpened = false;
      let timeoutId: number;
      
      const handleVisibilityChange = () => {
        if (document.hidden) {
          appOpened = true;
          cleanup();
          resolve(true);
        }
      };
      
      const handleBlur = () => {
        appOpened = true;
        cleanup();
        resolve(true);
      };
      
      const cleanup = () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleBlur);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
      
      // הוספת מאזינים
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleBlur);
      
      // ניסיון פתיחת האפליקציה
      try {
        window.location.href = url;
      } catch (error) {
        console.error('Error opening WhatsApp app:', error);
        cleanup();
        resolve(false);
        return;
      }
      
      // טיימאאוט - אם תוך זמן קצר לא נפתחה האפליקציה
      timeoutId = window.setTimeout(() => {
        cleanup();
        resolve(appOpened);
      }, this.APP_DETECTION_TIMEOUT);
    });
  }

  /**
   * העתקת הודעה ללוח (כחלופה לWhatsApp)
   */
  async copyMessageToClipboard(message: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(message);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

   private openWhatsAppWeb(phoneParam: string): void {
    const webUrl = `https://web.whatsapp.com/send?${phoneParam}`;
    window.open(webUrl, '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes');
  }

  /**
   * פתיחת WhatsApp עם אפשרות גיבוי להעתקה
   */
  async sendMessageWithFallback(options: WhatsAppMessageOptions): Promise<{success: boolean, method: 'whatsapp' | 'clipboard' | 'failed'}> {
    const whatsappSuccess = await this.sendMessage(options);
    
    if (whatsappSuccess) {
      return { success: true, method: 'whatsapp' };
    }
    
    // אם WhatsApp נכשל - נציע העתקה
    const clipboardSuccess = await this.copyMessageToClipboard(options.message);
    
    if (clipboardSuccess) {
      return { success: true, method: 'clipboard' };
    }
    
    return { success: false, method: 'failed' };
  }
  
  

}
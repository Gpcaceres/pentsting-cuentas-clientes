import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as xss from 'xss';

/**
 * Interceptor que sanitiza todos los inputs para prevenir ataques XSS
 * Limpia recursivamente todos los strings en el body de la petición
 */
@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    if (request.body) {
      request.body = this.sanitizeObject(request.body);
    }
    
    if (request.query) {
      request.query = this.sanitizeObject(request.query);
    }
    
    if (request.params) {
      request.params = this.sanitizeObject(request.params);
    }
    
    return next.handle();
  }

  /**
   * Sanitiza recursivamente un objeto, limpiando todos los strings
   */
  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  }

  /**
   * Sanitiza un string individual removiendo scripts y HTML malicioso
   */
  private sanitizeString(str: string): string {
    // Remueve tags HTML y scripts maliciosos
    const xssFilter: any = xss.default || xss;
    let cleaned = xssFilter(str, {
      whiteList: {}, // No permite ningún tag HTML
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    });
    
    // Remueve caracteres peligrosos adicionales
    cleaned = cleaned
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .trim();
    
    return cleaned;
  }
}

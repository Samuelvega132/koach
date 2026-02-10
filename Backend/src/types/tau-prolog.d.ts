/**
 * ============================================
 * DECLARACIONES DE TIPOS PARA TAU-PROLOG
 * ============================================
 * Tipos TypeScript para el Motor de Inferencia Prolog
 */

declare module 'tau-prolog' {
  namespace type {
    interface Session {
      consult(program: string, options: {
        success: () => void;
        error: (err: any) => void;
      }): void;
      
      query(goal: string, options: {
        success: () => void;
        error: (err: any) => void;
      }): void;
      
      /**
       * Obtiene la siguiente respuesta de la consulta Prolog
       * Usa callbacks para manejar el resultado
       */
      answer(options: {
        success: (answer: any) => void;
        fail: () => void;
        error: (err: any) => void;
      }): void;
      
      /**
       * Alternativa: obtiene todas las respuestas de una vez
       */
      answers(callback: (answer: any) => void, limit?: number): void;
    }
    
    interface Answer {
      id: string;
      links: Record<string, any>;
    }
  }
  
  function create(limit?: number): type.Session;
  function format_answer(answer: any): string | null;
}

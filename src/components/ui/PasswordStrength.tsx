import { X, Check } from 'lucide-react';
import { cn } from "@/lib/utils"; // Importando a função 'cn' para classes condicionais

// Definindo os critérios de validação
const passwordCriteria = [
  { id: 'length', text: 'Pelo menos 8 caracteres', regex: /.{8,}/ },
  { id: 'uppercase', text: 'Pelo menos uma letra maiúscula', regex: /[A-Z]/ },
  { id: 'lowercase', text: 'Pelo menos uma letra minúscula', regex: /[a-z]/ },
  { id: 'number', text: 'Pelo menos um número', regex: /[0-9]/ },
  { id: 'special', text: 'Pelo menos um caractere especial', regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ },
];

interface PasswordStrengthProps {
  password?: string;
}

export const PasswordStrength = ({ password = "" }: PasswordStrengthProps) => {
  // Não mostra nada se a senha estiver vazia
  if (!password) {
    return null;
  }

  return (
    <div className="space-y-2 p-4 mt-2 bg-muted/50 border rounded-lg animate-fade-in">
      <p className="text-sm font-semibold text-foreground">A senha deve conter:</p>
      <ul className="space-y-1">
        {passwordCriteria.map((criterion) => {
          const isValid = criterion.regex.test(password);
          return (
            <li key={criterion.id} className="flex items-center text-sm">
              {isValid ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <X className="w-4 h-4 mr-2 text-destructive" />
              )}
              <span className={cn(
                "transition-colors",
                isValid ? "text-green-500" : "text-muted-foreground"
              )}>
                {criterion.text}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

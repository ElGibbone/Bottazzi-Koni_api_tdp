"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
/**
 * Middleware per verificare i ruoli dell'utente
 * @param allowedRoles Array di ruoli autorizzati ad accedere alla risorsa
 */
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // Verifica che l'utente sia autenticato
            if (!req.user) {
                res.status(401).json({ message: 'Utente non autenticato' });
                return;
            }
            // Verifica che l'utente abbia uno dei ruoli consentiti
            if (!allowedRoles.includes(req.user.role)) {
                res.status(403).json({
                    message: 'Accesso negato',
                    error: 'insufficient_permissions',
                    details: 'Non hai i permessi necessari per accedere a questa risorsa'
                });
                return;
            }
            // Se l'utente ha i permessi necessari, procedi
            next();
        }
        catch (error) {
            console.error('Errore nel middleware dei ruoli:', error);
            res.status(500).json({
                message: 'Errore del server',
                error: 'server_error',
                details: 'Si è verificato un errore interno. Riprova più tardi.'
            });
        }
    };
};
exports.roleMiddleware = roleMiddleware;

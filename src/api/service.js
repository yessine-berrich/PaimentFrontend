import axios from "axios";

// Configuration de base
const API_URL = "/api";
const USERS_AUTH_PREFIX = `${API_URL}/users/auth`; // Pour la connexion et l'inscription
const USERS_PREFIX = `${API_URL}/users`; // Pour la gestion des utilisateurs
const SESSIONS_PREFIX = `${API_URL}/sessions`; // Pour la gestion des sessions

// --- Fonctions d'Authentification et Utilisateur ---

/**
 * Envoie les identifiants (POST /api/users/auth/login)
 */
export const login = async (email, password) => {
    const FULL_LOGIN_PATH = `${USERS_AUTH_PREFIX}/login`; 

    const response = await axios.post(FULL_LOGIN_PATH, { 
        email,
        password,
    });
    
    // Si l'API retourne un statut 2xx mais contient un champ d'erreur explicite
    if (response.data.success === false) {
        throw new Error(response.data.message);
    }

    return response.data.token; 
};

/**
 * Récupère les informations de l'utilisateur (GET /api/users/current-user)
 */
export const getCurrentUser = async (token) => {
    const FULL_CURRENT_USER_PATH = `${USERS_PREFIX}/current-user`;

    const response = await axios.get(FULL_CURRENT_USER_PATH, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.user || response.data;
};

/**
 * Envoie les données d'inscription pour créer un nouveau compte.
 */
export const register = async (registerDto) => {
    const FULL_REGISTER_PATH = `${USERS_AUTH_PREFIX}/register`;
    const response = await axios.post(FULL_REGISTER_PATH, registerDto);
    return response.data;
};

/**
 * Met à jour le profil de l'utilisateur (Email, mot de passe, RIB, Banque).
 * PUT /api/users/me
 */
export const updateProfile = async (updateDto, token) => {
    const FULL_UPDATE_PATH = `${USERS_PREFIX}/me`; 
    const response = await axios.put(FULL_UPDATE_PATH, updateDto, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data; 
};

/**
 * Récupère tous les utilisateurs (actifs et inactifs). GET /api/users
 */
export const getAllUsers = async (token) => {
    const FULL_PATH = USERS_PREFIX; 
    const response = await axios.get(FULL_PATH, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data; 
};

/**
 * Met à jour le statut d'activation d'un utilisateur. PUT /api/users/status
 */
export const updateStatus = async (statusDto, token) => {
    const FULL_PATH = `${USERS_PREFIX}/status`; 
    const response = await axios.put(FULL_PATH, statusDto, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; 
};

/**
 * Supprime un utilisateur par son ID. DELETE /api/users/:id
 */
export const deleteUser = async (userId, token) => {
    const FULL_PATH = `${USERS_PREFIX}/${userId}`; 
    await axios.delete(FULL_PATH, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

/**
 * Récupère TOUS les utilisateurs, puis filtre par rôle spécifié.
 * (Note: C'est un filtre côté client, idéalement ce serait côté serveur)
 */
export const getUsersByRole = async (role, token) => {
    // Note: Utilise la fonction locale pour éviter des appels multiples si déjà mise en cache
    const allUsers = await getAllUsers(token); 
    const filteredUsers = allUsers.filter(user => user.role === role);
    return filteredUsers;
};

// --- Fonctions CRUD pour les Sessions ---

/**
 * Crée une nouvelle session. POST /api/sessions
 */
export const createSession = async (sessionData, token) => {
    const response = await axios.post(SESSIONS_PREFIX, sessionData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

/**
 * Récupère toutes les sessions. GET /api/sessions
 */
export const getAllSessions = async (token) => {
    const response = await axios.get(SESSIONS_PREFIX, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

/**
 * Met à jour une session existante par son ID. PATCH /api/sessions/:id
 */
export const updateSession = async (sessionId, updateData, token) => {
    const FULL_PATH = `${SESSIONS_PREFIX}/${sessionId}`; 
    const response = await axios.patch(FULL_PATH, updateData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; 
};

/**
 * Supprime une session par son ID. DELETE /api/sessions/:id
 */
export const deleteSession = async (sessionId, token) => {
    const FULL_PATH = `${SESSIONS_PREFIX}/${sessionId}`; 
    await axios.delete(FULL_PATH, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// --- Fonction pour l'Affectation des Formateurs ---

/**
 * Affecte des formateurs à une session.
 * POST /api/sessions/:id/affecter-formateurs
 * @param {number} sessionId - L'ID de la session à modifier.
 * @param {number[]} trainerIds - Le tableau d'IDs des formateurs à affecter.
 * @param {string} token - Le jeton d'authentification.
 */
export const assignTrainersToSession = async (sessionId, trainerIds, token) => {
    const FULL_PATH = `${SESSIONS_PREFIX}/${sessionId}/affecter-formateurs`; 
    
    // 🚨 CORRECTION MAJEURE: 
    // Changement de 'trainerIds' à 'formateurIds' pour correspondre à la validation du backend.
    const response = await axios.post(FULL_PATH, { formateurIds: trainerIds }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// 🚨 NE PAS AJOUTER D'EXPORTATION DE COMPOSANT ICI, C'EST UN FICHIER D'API PURE
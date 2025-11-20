import axios from "axios";

const API_URL = "/api";
const USERS_AUTH_PREFIX = `${API_URL}/users/auth`; // Pour la connexion
const USERS_PREFIX = `${API_URL}/users`; // Pour l'utilisateur courant

/**
 * Envoie les identifiants (POST /api/users/auth/login)
 */
export const login = async (email, password) => {
  const FULL_LOGIN_PATH = `${USERS_AUTH_PREFIX}/login`; 

  const response = await axios.post(FULL_LOGIN_PATH, { 
    email,
    password,
  });
  
  // 🚨 VÉRIFICATION CRITIQUE DU STATUT D'AUTHENTIFICATION 🚨
  // Si le backend retourne { success: false, message: "..." } avec statut 200
  if (response.data.success === false) {
      // Lance une erreur avec le message du backend
      throw new Error(response.data.message);
  }

  // Si le backend retourne { success: true, token: "...", user: {...} }
  return response.data.token; 
};

/**
 * Récupère les informations de l'utilisateur (GET /api/users/current-user)
 */
export const getCurrentUser = async (token) => {
  // 🚨 CORRECTION DU CHEMIN : Suppression de '/auth'
  const FULL_CURRENT_USER_PATH = `${USERS_PREFIX}/current-user`;

  const response = await axios.get(FULL_CURRENT_USER_PATH, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // Si la réponse de current-user est similaire à celle de login, elle est encapsulée sous 'user'
  // Si elle renvoie directement l'objet utilisateur, utilisez response.data
  return response.data.user || response.data;
};

/**
 * Envoie les données d'inscription pour créer un nouveau compte.
 * @param {object} registerDto - Contient tous les champs requis.
 * @returns {Promise<object>} La réponse du backend (message et objet utilisateur).
 */
export const register = async (registerDto) => {
  // Le chemin est : /api/users/auth/register
  const FULL_REGISTER_PATH = `${USERS_AUTH_PREFIX}/register`;

  const response = await axios.post(FULL_REGISTER_PATH, registerDto);

  // La réponse contient l'objet { message: "...", user: { ... } }
  return response.data;
};


/**
 * Met à jour le profil de l'utilisateur (Email, mot de passe, RIB, Banque).
 * PUT /api/users/me
 * @param {object} updateDto - Les données à mettre à jour (ex: { rib, banque, password })
 * @param {string} token - Le jeton JWT de l'utilisateur
 * @returns {Promise<object>} Les données utilisateur mises à jour
 */
export const updateProfile = async (updateDto, token) => {
  const FULL_UPDATE_PATH = `/api/users/me`; 

  const response = await axios.put(FULL_UPDATE_PATH, updateDto, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  // Le backend retourne l'objet User mis à jour.
  return response.data; 
};

/**
 * Récupère tous les utilisateurs (actifs et inactifs).
 * GET /api/users
 * @param {string} token - Le jeton JWT (ADMIN ou COMPTABLE)
 * @returns {Promise<Array<object>>} La liste de tous les utilisateurs
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
 * Met à jour le statut d'activation d'un utilisateur.
 * PUT /api/users/status
 * @param {object} statusDto - { userId: number, est_actif: boolean }
 * @param {string} token - Le jeton JWT (ADMIN)
 * @returns {Promise<object>} L'utilisateur mis à jour
 */
export const updateStatus = async (statusDto, token) => {
  const FULL_PATH = `${USERS_PREFIX}/status`; 

  const response = await axios.put(FULL_PATH, statusDto, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return response.data; 
};

/**
 * Supprime un utilisateur par son ID.
 * DELETE /api/users/:id
 * @param {number} userId - L'ID de l'utilisateur à supprimer
 * @param {string} token - Le jeton JWT (ADMIN)
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId, token) => {
  const FULL_PATH = `${USERS_PREFIX}/${userId}`; 

  await axios.delete(FULL_PATH, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Récupère TOUS les utilisateurs, puis filtre par rôle spécifié.
 * * 🚨 Cette fonction est utilisée comme solution temporaire/rapide 
 * car la route /api/users/role/:role n'existe pas.
 * * @param {string} role - Le rôle des utilisateurs à filtrer (ex: 'COORDINATEUR').
 * @param {string} token - Le jeton JWT de l'utilisateur (doit être ADMIN ou COMPTABLE).
 * @returns {Promise<Array<object>>} La liste des utilisateurs filtrés.
 */
export const getUsersByRole = async (role, token) => {
    // 1. Appeler la fonction existante pour récupérer TOUS les utilisateurs.
    // Cette route est déjà sécurisée pour les rôles COMPTABLE et ADMIN.
    const allUsers = await getAllUsers(token); 
    
    // 2. Filtrer la liste des utilisateurs reçue côté frontend.
    const filteredUsers = allUsers.filter(user => user.role === role);
    
    return filteredUsers;
};

// --- Routes CRUD pour les Sessions ---

const SESSIONS_PREFIX = `${API_URL}/sessions`;

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
 * Met à jour une session existante par son ID.
 * PATCH /api/sessions/:id
 * @param {number} sessionId - L'ID de la session à mettre à jour.
 * @param {object} updateData - Les données de mise à jour (UpdateSessionDto).
 * @param {string} token - Le jeton JWT (COMPTABLE).
 * @returns {Promise<object>} La session mise à jour.
 */
export const updateSession = async (sessionId, updateData, token) => {
  const FULL_PATH = `${SESSIONS_PREFIX}/${sessionId}`; 

  const response = await axios.patch(FULL_PATH, updateData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return response.data; 
};

/**
 * Supprime une session par son ID.
 * DELETE /api/sessions/:id
 * @param {number} sessionId - L'ID de la session à supprimer.
 * @param {string} token - Le jeton JWT (COMPTABLE).
 * @returns {Promise<void>}
 */
export const deleteSession = async (sessionId, token) => {
  const FULL_PATH = `${SESSIONS_PREFIX}/${sessionId}`; 

  await axios.delete(FULL_PATH, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
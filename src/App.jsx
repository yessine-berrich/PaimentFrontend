import React, { useState, useEffect } from 'react';
import { getCurrentUser } from './api/service';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent'; 
import AdminDashboard from './components/admin/AdminDashboard'; // 🚨 Import du tableau de bord Admin
import './App.css'; 
import ComptableDashboard from './components/comptable/ComptableDashboard';

function App() {
  // 1. État pour le jeton JWT (tentative de lecture du localStorage au montage)
  const [token, setToken] = useState(localStorage.getItem('jwtToken')); 
  
  // 2. État pour les données de l'utilisateur (contient le rôle)
  const [user, setUser] = useState(null);
  
  // 3. État pour la vue actuelle ('login', 'register', ou 'dashboard' si connecté)
  const [currentView, setCurrentView] = useState(token ? 'dashboard' : 'login'); 
  
  // 4. États d'interface
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Appelé après une connexion réussie.
   */
  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    setCurrentView('dashboard');
  };
  
  /**
   * Fonction de Déconnexion : supprime le token et réinitialise l'état.
   */
  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setToken(null);
    setUser(null);
    setError(null);
    setCurrentView('login');
  };

  /**
   * Charge les données utilisateur et vérifie la validité du token.
   */
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      setUser(null);

      if (token) {
        try {
          const userData = await getCurrentUser(token);
          setUser(userData); 
          setCurrentView('dashboard'); 
        } catch (err) {
          // Token invalide ou expiré
          console.error("Token invalide ou expiré:", err);
          handleLogout(); 
          setError("Session expirée ou invalide. Veuillez vous reconnecter.");
        }
      } else if (currentView !== 'register') {
        setCurrentView('login');
      }
      setLoading(false);
    };
    
    fetchUser();
  }, [token]); 

  // --- Logique de Rendu JSX ---

  if (loading) {
    return (
      <div className="container">
        <p>⏳ Vérification de la session en cours...</p>
      </div>
    );
  }
  
  // Rendu 1: Utilisateur connecté (ADMIN ou autre rôle)
  if (user) {
    
    // 🚨 VÉRIFICATION DU RÔLE ADMINISTRATEUR
    if (user.role === 'ADMIN') {
        // Affiche le tableau de bord spécifique aux administrateurs
        return <AdminDashboard user={user} onLogout={handleLogout} />;
    }

    if (user.role === 'COMPTABLE') {
        return <ComptableDashboard user={user} onLogout={handleLogout} />;
    }
    
    // Rendu pour les rôles non-admin (FORMATEUR, COMPTABLE, COORDINATEUR)
    const userID = user.id || user.sub; 
    
    return (
        <div className="container">
            <h1>Espace Utilisateur : {user.role}</h1>
            <div className="user-info">
                <h2>Bienvenue, ID: {userID}</h2>
                <p>Email: <strong>{user.email}</strong></p>
                <button 
                    onClick={handleLogout} 
                    style={{ marginTop: '20px', padding: '10px' }}>
                    Se déconnecter
                </button>
            </div>
        </div>
    );
  }

  // Rendu 2: Connexion / Inscription
  return (
    <div className="container">
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
      
      {currentView === 'login' ? (
        // Affiche le formulaire de connexion
        <>
          <LoginComponent onLoginSuccess={handleLoginSuccess} />
          <p style={{ marginTop: '15px' }}>
            Pas encore de compte ? 
            <a href="#" onClick={() => { setCurrentView('register'); setError(null); }}> S'inscrire ici</a>
          </p>
        </>
      ) : (
        // Affiche le formulaire d'inscription
        <RegisterComponent 
          onRegistrationComplete={() => { 
            setCurrentView('login'); 
            setError("Inscription réussie. Veuillez contacter l'administrateur pour l'activation."); 
          }} 
        />
      )}
    </div>
  );
}

export default App;
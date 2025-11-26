import React, { useState, useEffect } from 'react';
import { getCurrentUser } from './api/service';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent'; 
import AdminDashboard from './components/admin/AdminDashboard'; 
import './App.css'; 
import ComptableDashboard from './components/comptable/ComptableDashboard';
import CoordinateurDashboard from './components/coordinateur/CoordinateurDashboard'; 
// 🚨 NOUVEAU: Import du tableau de bord Formateur
import FormateurDashboard from './components/formateur/FormateurDashboard'; 

function App() {
    const [token, setToken] = useState(localStorage.getItem('jwtToken')); 
    const [user, setUser] = useState(null); 
    const [currentView, setCurrentView] = useState(token ? 'dashboard' : 'login'); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleUserUpdate = (updatedUser) => {
        console.log('App.js: Mise à jour de l\'état user réussie.', updatedUser);
        setUser(updatedUser); 
    };

    const handleLoginSuccess = (newToken) => {
        setToken(newToken);
        setCurrentView('dashboard');
    };
    
    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        setToken(null);
        setUser(null);
        setError(null);
        setCurrentView('login');
    };

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
    
    if (user) {
        
        if (user.role === 'ADMIN') {
            return <AdminDashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
        }

        if (user.role === 'COMPTABLE') {
            return <ComptableDashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
        }
        
        if (user.role === 'COORDINATEUR') {
            return <CoordinateurDashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
        }
        
        // 🚨 NOUVEAU: Rendu pour le rôle FORMATEUR
        if (user.role === 'FORMATEUR') {
            return <FormateurDashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
        }
        
        // Rendu par défaut pour les autres rôles
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
                <>
                    <LoginComponent onLoginSuccess={handleLoginSuccess} />
                    <p style={{ marginTop: '15px' }}>
                        Pas encore de compte ? 
                        <a href="#" onClick={() => { setCurrentView('register'); setError(null); }}> S'inscrire ici</a>
                    </p>
                </>
            ) : (
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
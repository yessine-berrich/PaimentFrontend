// src/components/coordinateur/CoordinateurDashboard.jsx

import React, { useState } from 'react';
import Profile from './Profile'; // Réutilisation du composant Profile
// 🚨 Le CSS doit être dans le bon dossier
import './CoordinateurDashboard.css'; 

// Importez vos composants de vue spécifiques ici
// import GestionFormateurs from './GestionFormateurs'; 
// import SuiviSessions from './SuiviSessions'; 
// import MesClients from './MesClients'; 


const coordinatorViews = {
    PROFILE: 'Mon Profil',
    // 🚨 Rôles spécifiques au Coordinateur (Pas de gestion de session de paiement)
    GESTION_USERS: 'Gestion des Utilisateurs', 
    GESTION_SESSIONS: 'Gestion des Événements/Formations',
};

function CoordinateurDashboard({ user, onLogout, onUserUpdate }) {
    const [currentView, setCurrentView] = useState(coordinatorViews.PROFILE); 
    
    const renderContent = () => {
        switch (currentView) {
            case coordinatorViews.PROFILE:
                // Transmission de onUserUpdate est CRUCIALE pour le fonctionnement du Profile
                return <Profile user={user} onUserUpdate={onUserUpdate} />;
            
            case coordinatorViews.GESTION_USERS:
                return <h2>🛠️ Gestion des Utilisateurs (Bientôt disponible)</h2>;
                
            case coordinatorViews.GESTION_SESSIONS:
                return <h2>📅 Gestion des Formations et Événements (Bientôt disponible)</h2>;
            
            default:
                return <h2>Bienvenue, Coordinateur {user.prenom} {user.nom}. Sélectionnez une option dans le menu.</h2>;
        }
    };
    
    return (
        <div className="coordinateur-dashboard-layout">
            <header className="dashboard-header">
                <h1>📚 Tableau de Bord Coordinateur</h1>
                <div>
                    <span>Connecté en tant que: **{user.email}**</span>
                    <button onClick={onLogout} className="logout-button" style={{ marginLeft: '15px' }}>
                        Se déconnecter
                    </button>
                </div>
            </header>

            <div className="main-content-area">
                {/* 🧭 Sidebar de Navigation */}
                <nav className="dashboard-sidebar">
                    <h3>Menu</h3>
                    <ul>
                        {/* Afficher les liens de navigation */}
                        {Object.values(coordinatorViews).map(view => (
                            <li key={view} className={currentView === view ? 'active' : ''}>
                                <button onClick={() => setCurrentView(view)}>{view}</button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* 🖼️ Zone de Contenu Principal */}
                <div className="view-container">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default CoordinateurDashboard;
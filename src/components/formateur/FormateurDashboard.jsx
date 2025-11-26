// src/components/formateur/FormateurDashboard.jsx

import React, { useState } from 'react';
import Profile from './Profile'; // Réutilisation du composant Profile
import './FormateurDashboard.css'; 

// Définir les options de navigation pour le Formateur
const formateurViews = {
    PROFILE: 'Mon Profil',
    MES_SESSIONS: 'Mes Sessions de Formation',
    // Autres vues spécifiques au Formateur (à ajouter plus tard)
    // PAIEMENTS: 'Historique des Paiements',
};

function FormateurDashboard({ user, onLogout, onUserUpdate }) {
    // État pour gérer la vue active (initialisé sur 'PROFILE')
    const [currentView, setCurrentView] = useState(formateurViews.PROFILE); 
    
    // Fonction pour déterminer le contenu à afficher
    const renderContent = () => {
        switch (currentView) {
            case formateurViews.PROFILE:
                // Transmission de onUserUpdate est CRUCIALE pour le fonctionnement du Profile
                return <Profile user={user} onUserUpdate={onUserUpdate} />;
            
            case formateurViews.MES_SESSIONS:
                return <h2>📚 Mes Sessions de Formation (A implémenter)</h2>;
            
            default:
                return <h2>Bienvenue, Formateur {user.prenom} {user.nom}. Prêt à commencer ?</h2>;
        }
    };
    
    return (
        <div className="formateur-dashboard-layout">
            <header className="dashboard-header">
                <h1>👨‍🏫 Tableau de Bord Formateur</h1>
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
                        {Object.values(formateurViews).map(view => (
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

export default FormateurDashboard;
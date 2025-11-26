// src/components/comptable/ComptableDashboard.jsx

import React, { useState } from 'react';
import SessionManagement from './SessionManagement';
import Profile from './Profile'; 
import Sidebar from './Sidebar'; 
import './ComptableDashboard.css';

/**
 * Tableau de bord du Comptable.
 * * @param {object} props - Les props du composant.
 * @param {object} props.user - Les données de l'utilisateur connecté (source de vérité).
 * @param {function} props.onLogout - Fonction de déconnexion.
 * @param {function} props.onUserUpdate - Fonction pour mettre à jour l'état 'user' dans App.js.
 */
// 🚨 Ajout de 'onUserUpdate' dans la déstructuration des props
function ComptableDashboard({ user, onLogout, onUserUpdate }) { 
    // État pour suivre la vue active dans le dashboard
    const [currentView, setCurrentView] = useState('sessions');

    // Fonction pour rendre le composant de la vue sélectionnée
    const renderView = () => {
        // Sécurité: Si les données utilisateur ne sont pas chargées, on affiche un message
        if (!user) {
            return <p>Chargement des données utilisateur...</p>;
        }
        
        switch (currentView) {
            case 'sessions':
                // Composant principal de la gestion comptable
                return <SessionManagement />;
            case 'profile':
                // 🚨 CORRECTION CRUCIALE : On passe la fonction onUserUpdate au composant Profile
                return <Profile user={user} onUserUpdate={onUserUpdate} />; 
            default:
                return <SessionManagement />;
        }
    };

    return (
        <div className="comptable-dashboard-layout">
            
            <header className="dashboard-header">
                {/* Affichage du nom/prénom de l'utilisateur connecté pour une meilleure UX */}
                <h1>Espace Comptable 💰 ({user.prenom} {user.nom})</h1> 
                <button onClick={onLogout} className="logout-button">
                    Déconnexion
                </button>
            </header>
            
            <div className="main-content-area">
                <Sidebar 
                    onViewChange={setCurrentView} 
                    currentView={currentView}
                />
                <div className="view-container">
                    {renderView()}
                </div>
            </div>
            
        </div>
    );
}

export default ComptableDashboard;
import React from 'react';
import SessionManagement from './SessionManagement'; // Importer la nouvelle page
import './ComptableDashboard.css'; 

function ComptableDashboard({  onLogout }) {
    return (
          <div className="comptable-dashboard">
            
            {/* Utilisation de la classe CSS pour l'en-tête */}
            <header className="dashboard-header">
                <h1>Espace Comptable </h1>
                
               
                
                {/* Utilisation de la classe CSS pour le bouton de déconnexion */}
                <button onClick={onLogout} className="logout-button">
                    Déconnexion
                </button>
            </header>
            
            {/* Afficher la page de gestion des sessions */}
            <SessionManagement /> 
        </div>
    );
}

export default ComptableDashboard;
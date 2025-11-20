import React from 'react';
import SessionManagement from './SessionManagement'; // Importer la nouvelle page

function ComptableDashboard({ user, onLogout }) {
    return (
        <div style={{ padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '15px', marginBottom: '30px' }}>
                <h1>Espace Comptable 💰</h1>
                <p>Bienvenue, {user.nom} ({user.role})</p>
                <button onClick={onLogout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Déconnexion</button>
            </header>
            
            {/* Afficher la page de gestion des sessions */}
            <SessionManagement /> 
        </div>
    );
}

export default ComptableDashboard;
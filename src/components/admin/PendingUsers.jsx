import React from 'react';

function PendingUsers() {
    return (
        <div className="view-content">
            <h2>⏳ Utilisateurs en Attente d'Activation</h2>
            <p>Liste des utilisateurs (Formateurs, Comptables, etc.) avec est_actif = false.</p>
            {/* Le tableau de données d'activation sera implémenté ici */}
        </div>
    );
}

export default PendingUsers;
// src/components/admin/Sidebar.jsx

import React from 'react';
import '../admin/Sidebar.css'; 

function Sidebar({ onViewChange, currentView }) {
    const navItems = [
        // Remplacement des vues Admin par des vues pertinentes pour le Comptable
        { id: 'sessions', label: '🗓️ Sessions / Paiements' }, // C'est la gestion des sessions/paiements
        { id: 'profile', label: '👤 Mon Profil' },
    ];

    return (
        <div className="sidebar">
            <h3>Navigation</h3>
            <ul className="nav-list">
                {navItems.map((item) => (
                    <li key={item.id} className="nav-item">
                        <a 
                            href="#" 
                            onClick={(e) => {
                                e.preventDefault();
                                onViewChange(item.id);
                            }}
                            // Appliquer la classe 'active' si c'est la vue courante
                            className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                        >
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Sidebar;
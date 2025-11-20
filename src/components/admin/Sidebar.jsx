import React from 'react';
import './Sidebar.css'; // 👈 Importez le fichier CSS ici

function Sidebar({ onViewChange, currentView }) {
    const navItems = [
        // Utiliser uniquement le texte, les emojis seront gérés si besoin par le composant appelant
        { id: 'all_users', label: '👥 Tous les Utilisateurs' }, 
        { id: 'pending', label: '⏳ Utilisateurs en attente' },
        { id: 'active', label: '✅ Utilisateurs actifs' },
        { id: 'profile', label: '👤 Mon Profil' },
    ];

    return (
        // Remplacement de style={styles.sidebar} par className="sidebar"
        <div className="sidebar">
            <h3>Administration</h3>
            {/* Remplacement de style={styles.navList} par className="nav-list" */}
            <ul className="nav-list">
                {navItems.map((item) => (
                    // Remplacement de style={styles.navItem} par className="nav-item"
                    <li key={item.id} className="nav-item">
                        <a 
                            href="#" 
                            onClick={(e) => {
                                e.preventDefault(); // Empêcher le rechargement de la page
                                onViewChange(item.id);
                            }}
                            // Application des classes : nav-link et la classe 'active' si c'est la vue courante
                            className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                            // Suppression des styles inline conditionnels
                        >
                            {/* Le label inclut déjà les emojis */}
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ⚠️ Suppression de la constante 'styles' car elle est maintenant dans le fichier CSS

export default Sidebar;
import React from 'react';

function Sidebar({ onViewChange, currentView }) {
    const navItems = [
        { id: 'all_users', label: '👥 Tous les Utilisateurs' }, // 🚨 NOUVELLE OPTION
        { id: 'pending', label: '⏳ Utilisateurs en attente' },
        { id: 'active', label: '✅ Utilisateurs actifs' },
        { id: 'profile', label: '👤 Mon Profil' },
    ];

    return (
        <div className="sidebar" style={styles.sidebar}>
            <h3>Administration</h3>
            <ul style={styles.navList}>
                {navItems.map((item) => (
                    <li key={item.id} style={styles.navItem}>
                        <a 
                            href="#" 
                            onClick={() => onViewChange(item.id)}
                            style={{
                                ...styles.navLink,
                                backgroundColor: currentView === item.id ? '#007bff' : 'transparent',
                                color: currentView === item.id ? 'white' : '#333',
                            }}
                        >
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Styles basiques pour un affichage rapide
const styles = {
    sidebar: {
        width: '250px',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        height: '100vh',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        position: 'fixed',
    },
    navList: {
        listStyle: 'none',
        padding: 0,
        marginTop: '20px',
    },
    navItem: {
        marginBottom: '10px',
    },
    navLink: {
        textDecoration: 'none',
        padding: '10px',
        display: 'block',
        borderRadius: '5px',
        transition: 'background-color 0.2s',
    }
};

export default Sidebar;
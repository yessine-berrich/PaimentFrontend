import React, { useState } from 'react';
import Sidebar from './Sidebar';
// Importer les vues (vous devrez les créer)
import PendingUsers from './PendingUsers'; 
import ActiveUsers from './ActiveUsers'; 
import Profile from './Profile'; 
import AllUsers from './AllUsers';

function AdminDashboard({ user, onLogout }) {
    // État pour simuler le routage de l'interface admin
    const [currentView, setCurrentView] = useState('all_users'); 

    const renderView = () => {
        switch (currentView) {
            case 'all_users':
                // Passer l'utilisateur courant pour gérer les permissions et l'auto-suppression
                return <AllUsers adminUser={user} />;
            case 'pending':
                return <PendingUsers />;
            case 'active':
                return <ActiveUsers />;
            case 'profile':
                return <Profile adminUser={user} />; 
            default:
                return <h2>Vue non trouvée</h2>;
        }
    };

    return (
        <div style={styles.dashboardContainer}>
            <Sidebar onViewChange={setCurrentView} currentView={currentView} />
            
            <div style={styles.mainContent}>
                <header style={styles.header}>
                    <h1>Panneau d'Administration</h1>
                    <button onClick={onLogout} style={styles.logoutButton}>
                        Déconnexion
                    </button>
                </header>
                
                {/* Rendu de la vue sélectionnée */}
                {renderView()}
            </div>
        </div>
    );
}

const styles = {
    dashboardContainer: {
        display: 'flex',
    },
    mainContent: {
        marginLeft: '250px', // Correspond à la largeur de la Sidebar
        padding: '20px',
        width: 'calc(100% - 250px)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '1px solid #ddd',
        paddingBottom: '15px'
    },
    logoutButton: {
        padding: '8px 15px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    }
};

export default AdminDashboard;
import React, { useState } from 'react';
import Sidebar from './Sidebar';
// Importer les vues (vous devrez les créer)
import PendingUsers from './PendingUsers'; 
import ActiveUsers from './ActiveUsers'; 
import Profile from './Profile'; 
import AllUsers from './AllUsers';
// 👈 N'oubliez pas l'import CSS
import './AdminDashboard.css'; 

function AdminDashboard({ user, onLogout }) {
    // État pour simuler le routage de l'interface admin
    const [currentView, setCurrentView] = useState('all_users'); 

    const renderView = () => {
        switch (currentView) {
            case 'all_users':
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
        // Remplacement de style={styles.dashboardContainer} par className="dashboard-container"
        <div className="dashboard-container">
            <Sidebar onViewChange={setCurrentView} currentView={currentView} />
            
            {/* Remplacement de style={styles.mainContent} par className="main-content" */}
            <div className="main-content">
                {/* Remplacement de style={styles.header} par className="header" */}
                <header className="header">
                    <h1>Panneau d'Administration</h1>
                    {/* Remplacement de style={styles.logoutButton} par className="logout-button" */}
                    <button onClick={onLogout} className="logout-button">
                        Déconnexion
                    </button>
                </header>
                
                {/* Rendu de la vue sélectionnée */}
                <div className="view-content">
                    {renderView()}
                </div>
            </div>
        </div>
    );
}



export default AdminDashboard;
import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, updateStatus, deleteUser } from '../../api/service';

function AllUsers({ adminUser }) {
    const token = localStorage.getItem('jwtToken');
    const isAdmin = adminUser.role === 'ADMIN';

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);

    // Fonction pour charger la liste des utilisateurs
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        setStatusMessage(null);
        try {
            const data = await getAllUsers(token);
            setUsers(data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Erreur lors du chargement des utilisateurs.";
            setError(errorMessage);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // --- Gestion des Actions Administratives ---

    /**
     * Change le statut actif/inactif d'un utilisateur.
     */
    const handleToggleStatus = async (userId, currentStatus) => {
        if (!isAdmin) return;
        if (!window.confirm(`Voulez-vous vraiment ${currentStatus ? 'DÉSACTIVER' : 'ACTIVER'} cet utilisateur ?`)) return;

        setStatusMessage(null);
        try {
            const newStatus = !currentStatus;
            
            // Appel de l'API de mise à jour du statut
            const updatedUser = await updateStatus({ userId, est_actif: newStatus }, token);

            // Mettre à jour la liste locale des utilisateurs
            setUsers(prevUsers => 
                prevUsers.map(u => 
                    u.id === userId ? { ...u, est_actif: newStatus } : u
                )
            );
            setStatusMessage(`Statut de ${updatedUser.nom} ${updatedUser.prenom} mis à jour.`);

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Échec de la mise à jour du statut.";
            setError(errorMessage);
        }
    };
    
    /**
     * Supprime un utilisateur.
     */
    const handleDeleteUser = async (userId, userName) => {
        if (!isAdmin) return;
        if (!window.confirm(`Êtes-vous sûr de vouloir SUPPRIMER l'utilisateur ${userName} ? Cette action est irréversible.`)) return;

        setStatusMessage(null);
        try {
            await deleteUser(userId, token);

            // Retirer l'utilisateur de la liste locale
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
            setStatusMessage(`Utilisateur ${userName} supprimé avec succès.`);
            
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Échec de la suppression de l'utilisateur.";
            setError(errorMessage);
        }
    };


    // --- Rendu ---

    if (loading) {
        return <p>⏳ Chargement de tous les utilisateurs...</p>;
    }

    return (
        <div className="view-content">
            <h2>🌍 Tous les Utilisateurs ({users.length})</h2>
            <p>Accès : Administrateurs et Comptables. Modification et Suppression : Administrateurs uniquement.</p>
            
            {statusMessage && <p style={styles.successMessage}>✅ {statusMessage}</p>}
            {error && <p style={styles.errorMessage}>🛑 {error}</p>}
            
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Nom & Prénom</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Rôle</th>
                        <th style={styles.th}>Statut</th>
                        {isAdmin && <th style={styles.th}>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} style={styles.tr}>
                            <td style={styles.td}>{user.id}</td>
                            <td style={styles.td}>{user.nom} {user.prenom}</td>
                            <td style={styles.td}>{user.email}</td>
                            <td style={styles.td}><span style={{ ...styles.roleBadge, backgroundColor: getRoleColor(user.role) }}>{user.role}</span></td>
                            <td style={styles.td}>
                                <span style={{ ...styles.statusBadge, backgroundColor: user.est_actif ? '#28a745' : '#dc3545' }}>
                                    {user.est_actif ? 'Actif' : 'Inactif'}
                                </span>
                            </td>
                            {isAdmin && (
                                <td style={styles.td}>
                                    {/* Bouton pour changer le statut */}
                                    <button 
                                        onClick={() => handleToggleStatus(user.id, user.est_actif)}
                                        disabled={user.role === 'ADMIN' && user.id === adminUser.id} // Interdire l'auto-désactivation
                                        style={user.est_actif ? styles.deactivateButton : styles.activateButton}
                                    >
                                        {user.est_actif ? 'Désactiver' : 'Activer'}
                                    </button>
                                    
                                    {/* Bouton de suppression */}
                                    <button 
                                        onClick={() => handleDeleteUser(user.id, `${user.nom} ${user.prenom}`)}
                                        style={styles.deleteButton}
                                        disabled={user.id === adminUser.id} // Interdire l'auto-suppression
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// --- Styles et Utilitaires ---

const getRoleColor = (role) => {
    switch (role) {
        case 'ADMIN': return '#dc3545';
        case 'FORMATEUR': return '#007bff';
        case 'COORDINATEUR': return '#ffc107';
        case 'COMPTABLE': return '#28a745';
        default: return '#6c757d';
    }
};

const styles = {
    // ... (Styles du tableau et des badges repris de ActiveUsers.jsx) ...
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { backgroundColor: '#343a40', color: 'white', padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' },
    td: { padding: '12px', border: '1px solid #dee2e6', verticalAlign: 'middle' },
    roleBadge: { color: 'white', padding: '4px 8px', borderRadius: '15px', fontSize: '0.8em', fontWeight: 'bold', display: 'inline-block' },
    statusBadge: { color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8em', fontWeight: 'bold', display: 'inline-block' },
    
    successMessage: { color: 'green', fontWeight: 'bold', border: '1px solid green', padding: '10px', borderRadius: '4px' },
    errorMessage: { color: 'red', fontWeight: 'bold', border: '1px solid red', padding: '10px', borderRadius: '4px' },
    
    activateButton: { padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    deactivateButton: { padding: '5px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    deleteButton: { padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default AllUsers;
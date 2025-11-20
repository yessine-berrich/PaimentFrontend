import React, { useState, useEffect, useCallback } from 'react';
import { 
    getUsersByRole, 
    createSession, 
    getAllSessions,
    updateSession, 
    deleteSession  
} from '../../api/service'; 

const initialSessionData = {
    promotion: '',
    classe: '',
    specialite: '',
    niveau: 'Licence', 
    semestre: 'S5',    
    date_debut: '',
    date_fin: '',
    id_coordinateur: '',
};

function SessionManagement() {
    const token = localStorage.getItem('jwtToken');

    const [coordinators, setCoordinators] = useState([]);
    const [sessions, setSessions] = useState([]);
    
    // État du formulaire actuel
    const [formData, setFormData] = useState(initialSessionData); 
    
    // ID de la session en cours d'édition (null si c'est une création)
    const [editingId, setEditingId] = useState(null); 
    
    // Contrôle du dialogue modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    // --- Fonctions de Récupération de Données ---

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllSessions(token);
            setSessions(data);
        } catch (err) {
            setError(prev => prev || "Erreur lors du chargement des sessions existantes.");
        } finally {
            setLoading(false);
        }
    }, [token]);
    
    const fetchCoordinators = useCallback(async () => {
        try {
            const data = await getUsersByRole('COORDINATEUR', token);
            setCoordinators(data);
            if (data.length > 0) {
                // Sélectionner le premier coordinateur par défaut
                setFormData(prev => ({ ...prev, id_coordinateur: data[0].id.toString() }));
            }
        } catch (err) {
            setError("Impossible de charger la liste des Coordinateurs.");
        }
    }, [token]);


    useEffect(() => {
        if (token) {
            fetchCoordinators();
            fetchSessions();
        }
    }, [token, fetchCoordinators, fetchSessions]); 

    // --- Gestion du Formulaire ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setMessage(null);
        setError(null);
    };

    const handleOpenModal = (session = null) => {
        if (session) {
            setEditingId(session.id);
            // Charger les données de la session sélectionnée dans le formulaire
            setFormData({
                promotion: session.promotion || '',
                classe: session.classe || '',
                specialite: session.specialite || '',
                niveau: session.niveau || 'Licence',
                semestre: session.semestre || 'S5',
                date_debut: session.date_debut ? session.date_debut.split('T')[0] : '', 
                date_fin: session.date_fin ? session.date_fin.split('T')[0] : '',
                id_coordinateur: session.id_coordinateur ? session.id_coordinateur.toString() : (coordinators[0]?.id.toString() || ''), 
            });
            setMessage(`Modification de la session ID ${session.id}`);
        } else {
            setEditingId(null);
            setFormData(initialSessionData);
            if (coordinators.length > 0) {
                 setFormData(prev => ({ ...prev, id_coordinateur: coordinators[0].id.toString() }));
            }
            setMessage("Création d'une nouvelle session.");
        }
        setError(null);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData(initialSessionData);
        setMessage(null);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);
        
        // Validation basique
        if (new Date(formData.date_debut) >= new Date(formData.date_fin)) {
            setError("La date de début doit être antérieure à la date de fin.");
            setLoading(false);
            return;
        }

        try {
            let dataToSend = {
                ...formData,
                id_coordinateur: parseInt(formData.id_coordinateur, 10),
            };
            
            // Correction critique pour PATCH : Filtrer les champs vides
            if (editingId) {
                 dataToSend = Object.entries(dataToSend).reduce((acc, [key, value]) => {
                    // N'inclure que les valeurs qui ne sont pas des chaînes vides
                    if (value !== '' && value !== null && value !== undefined) {
                        acc[key] = value;
                    }
                    return acc;
                }, {});
                
                await updateSession(editingId, dataToSend, token);
                setMessage("Session modifiée avec succès !");
            } else {
                // CRÉATION (POST)
                await createSession(dataToSend, token);
                setMessage("Session créée avec succès !");
            }
            
            handleCloseModal(); 
            await fetchSessions(); 

        } catch (err) {
            const action = editingId ? "modification" : "création";
            // Afficher le message d'erreur du backend (ex: Validation failed)
            const errorMessage = err.response?.data?.message || `Échec de la ${action} de la session.`;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    const handleRemove = async (sessionId, promotion) => {
        if (!window.confirm(`Voulez-vous vraiment supprimer la session "${promotion}" ? Cette action est irréversible.`)) {
            return;
        }
        
        setLoading(true);
        setMessage(null);
        setError(null);
        
        try {
            await deleteSession(sessionId, token); 
            setMessage(`Session "${promotion}" supprimée avec succès.`);
            await fetchSessions(); 
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Échec de la suppression de la session.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    // --- Rendu ---
    
    if (loading && sessions.length === 0) {
        return <p>⏳ Chargement des données de gestion des sessions...</p>;
    }

    return (
        <div className="view-content" style={styles.container}>
            <h2>Gestion des Sessions 📅</h2>
            
            {message && <p style={styles.successMessage}>✅ {message}</p>}
            {error && <p style={styles.errorMessage}>🛑 {error}</p>}
            
            <button onClick={() => handleOpenModal()} style={{...styles.submitButton, backgroundColor: '#007bff'}}>
                + Créer une nouvelle session
            </button>

            <hr style={{margin: '30px 0'}} />

            {/* --- Dialogue Modal pour Création/Modification --- */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3>{editingId ? `Modification de l'ID ${editingId}` : 'Créer une nouvelle session'}</h3>
                        {/* Afficher l'erreur dans le modal si elle existe */}
                        {error && <p style={{color: 'red', fontWeight: 'bold'}}>{error}</p>}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            
                            {/* Ligne 1: Promotion, Classe */}
                            <div style={styles.formRow}>
                                <input name="promotion" type="text" placeholder="Promotion" value={formData.promotion} onChange={handleChange} required style={styles.input} />
                                <input name="classe" type="text" placeholder="Classe" value={formData.classe} onChange={handleChange} required style={styles.input} />
                            </div>

                            {/* Ligne 2: Spécialité, Niveau, Semestre */}
                            <div style={styles.formRow}>
                                <input name="specialite" type="text" placeholder="Spécialité" value={formData.specialite} onChange={handleChange} required style={styles.input} />
                                <select name="niveau" value={formData.niveau} onChange={handleChange} required style={styles.input}>
                                    <option value="Licence">Licence</option>
                                    <option value="Master">Master</option>
                                </select>
                                <select name="semestre" value={formData.semestre} onChange={handleChange} required style={styles.input}>
                                    <option value="S1">S1</option>
                                    <option value="S2">S2</option>
                                    <option value="S3">S3</option>
                                    <option value="S4">S4</option>
                                    <option value="S5">S5</option>
                                    <option value="S6">S6</option>
                                </select>
                            </div>

                            {/* Ligne 3: Dates */}
                            <div style={styles.formRow}>
                                <label style={styles.label}>Début: <input name="date_debut" type="date" value={formData.date_debut} onChange={handleChange} required style={styles.input} /></label>
                                <label style={styles.label}>Fin: <input name="date_fin" type="date" value={formData.date_fin} onChange={handleChange} required style={styles.input} /></label>
                            </div>

                            {/* Ligne 4: Coordinateur */}
                            <div style={styles.group}>
                                <label htmlFor="id_coordinateur" style={{fontWeight: 'bold'}}>Coordinateur Responsable:</label>
                                <select 
                                    id="id_coordinateur"
                                    name="id_coordinateur" 
                                    value={formData.id_coordinateur} 
                                    onChange={handleChange} 
                                    required 
                                    disabled={coordinators.length === 0}
                                    style={styles.input}
                                >
                                    {coordinators.length > 0 ? (
                                        coordinators.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.nom} {c.prenom} ({c.email})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">Chargement des Coordinateurs...</option>
                                    )}
                                </select>
                            </div>

                            <div style={styles.modalButtons}>
                                <button type="button" onClick={handleCloseModal} style={styles.cancelButton}>
                                    Annuler
                                </button>
                                <button type="submit" disabled={loading || coordinators.length === 0} style={styles.submitButton}>
                                    {editingId ? (loading ? "Sauvegarde en cours..." : "Sauvegarder") : (loading ? "Création en cours..." : "Créer la session")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Liste des Sessions Existantes --- */}
            <h3>Sessions existantes ({sessions.length})</h3>
            
            {sessions.length > 0 ? (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Promotion</th>
                            <th style={styles.th}>Classe/Spécialité</th>
                            <th style={styles.th}>Période</th>
                            <th style={styles.th}>Coordinateur ID</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map(s => (
                            <tr key={s.id}>
                                <td style={styles.td}>{s.id}</td>
                                <td style={styles.td}>{s.promotion}</td>
                                <td style={styles.td}>{s.classe} ({s.specialite})</td>
                                <td style={styles.td}>{s.date_debut.split('T')[0]} au {s.date_fin.split('T')[0]}</td>
                                <td style={styles.td}>{s.id_coordinateur}</td>
                                <td style={styles.td}>
                                    <button 
                                        onClick={() => handleOpenModal(s)}
                                        style={styles.editButton}
                                        disabled={loading}
                                    >
                                        Modifier
                                    </button>
                                    <button 
                                        onClick={() => handleRemove(s.id, s.promotion)}
                                        style={styles.deleteButton}
                                        disabled={loading}
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Aucune session trouvée.</p>
            )}
        </div>
    );
}

// Styles
const styles = {
    container: { maxWidth: '1000px', margin: '0 auto' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    formRow: { display: 'flex', gap: '15px' },
    group: { display: 'flex', flexDirection: 'column' },
    input: { padding: '10px', flex: 1, border: '1px solid #ddd', borderRadius: '4px' },
    label: { display: 'flex', flexDirection: 'column', flex: 1, fontSize: '0.9em' },
    submitButton: { padding: '12px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
    successMessage: { color: 'green', fontWeight: 'bold', border: '1px solid green', padding: '10px', borderRadius: '4px', marginBottom: '15px' },
    errorMessage: { color: 'red', fontWeight: 'bold', border: '1px solid red', padding: '10px', borderRadius: '4px', marginBottom: '15px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { backgroundColor: '#007bff', color: 'white', padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' },
    td: { padding: '8px 12px', border: '1px solid #dee2e6', verticalAlign: 'middle' },
    editButton: { padding: '5px 8px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px', fontSize: '0.8em' },
    deleteButton: { padding: '5px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.8em' },
    cancelButton: { padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' },
    
    // Styles du Modal
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
    },
    modalContent: {
        backgroundColor: 'white', padding: '30px', borderRadius: '8px', 
        width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto'
    },
    modalButtons: {
        display: 'flex', justifyContent: 'flex-end', marginTop: '20px'
    }
};

export default SessionManagement;
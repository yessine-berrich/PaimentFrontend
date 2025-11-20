import React, { useState, useEffect, useCallback } from 'react';
import './SessionManagement.css'; // <-- Utilisation d'un fichier CSS pour le style
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
    
    const [formData, setFormData] = useState(initialSessionData); 
    const [editingId, setEditingId] = useState(null); 
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
            if (data.length > 0 && formData.id_coordinateur === '') {
                // S'assurer qu'un coordinateur est sélectionné par défaut à l'initialisation
                setFormData(prev => ({ ...prev, id_coordinateur: data[0].id.toString() }));
            }
        } catch (err) {
            setError("Impossible de charger la liste des Coordinateurs.");
        }
    }, [token, formData.id_coordinateur]);


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
            // Stocker l'ID de la session à éditer (qui peut être un nombre ou une chaîne)
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
                // L'ID du coordinateur doit être une chaîne pour le champ select
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
        if (coordinators.length > 0) {
            setFormData(prev => ({ ...prev, id_coordinateur: coordinators[0].id.toString() }));
        }
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
                // Le coordinateur doit être un nombre
                id_coordinateur: parseInt(formData.id_coordinateur, 10),
            };
            
            if (editingId) {
                dataToSend = Object.entries(dataToSend).reduce((acc, [key, value]) => {
                    // N'inclure que les valeurs qui ne sont pas des chaînes vides
                    if (value !== '' && value !== null && value !== undefined) {
                        acc[key] = value;
                    }
                    return acc;
                }, {});
                
                // CORRECTION: S'assurer que l'ID pour la modification est un nombre
                const idToUpdate = parseInt(editingId, 10); 
                
                await updateSession(idToUpdate, dataToSend, token);
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
            // CORRECTION: Convertir sessionId en nombre entier pour l'API
            const idToDelete = parseInt(sessionId, 10);
            
            await deleteSession(idToDelete, token); 
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
        <div className="session-container">
            <h2>Gestion des Sessions 📅</h2>
            
            {/* Messages de feedback au niveau principal */}
            {message && <p className="feedback-message success-message">✅ {message}</p>}
            {error && !isModalOpen && <p className="feedback-message error-message">🛑 {error}</p>}
            
            <button 
                onClick={() => handleOpenModal()} 
                className="main-action-button create-button"
            >
                + Créer une nouvelle session
            </button>

            <hr className="separator" />

            {/* --- Dialogue Modal pour Création/Modification --- */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingId ? `Modification de l'ID ${editingId}` : 'Créer une nouvelle session'}</h3>
                        
                        {/* Afficher l'erreur DANS le modal si elle existe */}
                        {error && <p className="feedback-message error-message">{error}</p>}

                        <form onSubmit={handleSubmit} className="modal-form">
                            
                            {/* Ligne 1: Promotion, Classe */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="promotion">Promotion</label>
                                    <input id="promotion" name="promotion" type="text" placeholder="Ex: P2024" value={formData.promotion} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="classe">Classe</label>
                                    <input id="classe" name="classe" type="text" placeholder="Ex: L3-A" value={formData.classe} onChange={handleChange} required />
                                </div>
                            </div>

                            {/* Ligne 2: Spécialité, Niveau, Semestre */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="specialite">Spécialité</label>
                                    <input id="specialite" name="specialite" type="text" placeholder="Ex: Informatique" value={formData.specialite} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="niveau">Niveau</label>
                                    <select id="niveau" name="niveau" value={formData.niveau} onChange={handleChange} required>
                                        <option value="Licence">Licence</option>
                                        <option value="Master">Master</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="semestre">Semestre</label>
                                    <select id="semestre" name="semestre" value={formData.semestre} onChange={handleChange} required>
                                        <option value="S1">S1</option>
                                        <option value="S2">S2</option>
                                        <option value="S3">S3</option>
                                        <option value="S4">S4</option>
                                        <option value="S5">S5</option>
                                        <option value="S6">S6</option>
                                    </select>
                                </div>
                            </div>

                            {/* Ligne 3: Dates */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="date_debut">Date de Début</label>
                                    <input id="date_debut" name="date_debut" type="date" value={formData.date_debut} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="date_fin">Date de Fin</label>
                                    <input id="date_fin" name="date_fin" type="date" value={formData.date_fin} onChange={handleChange} required />
                                </div>
                            </div>

                            {/* Ligne 4: Coordinateur */}
                            <div className="form-group">
                                <label htmlFor="id_coordinateur">Coordinateur Responsable:</label>
                                <select 
                                    id="id_coordinateur"
                                    name="id_coordinateur" 
                                    value={formData.id_coordinateur} 
                                    onChange={handleChange} 
                                    required 
                                    disabled={coordinators.length === 0}
                                    className="full-width-select"
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

                            <div className="modal-buttons">
                                <button type="button" onClick={handleCloseModal} className="cancel-button">
                                    Annuler
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading || coordinators.length === 0} 
                                    className="main-action-button" 
                                    style={{backgroundColor: editingId ? '#007bff' : '#28a745'}}
                                >
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
                <table className="session-table">
                    <thead>
                        <tr>
                            <th className="th">ID</th>
                            <th className="th">Promotion</th>
                            <th className="th">Classe/Spécialité</th>
                            <th className="th">Niveau/Semestre</th>
                            <th className="th">Période</th>
                            <th className="th">Coordinateur ID</th>
                            <th className="th">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map(s => (
                            <tr key={s.id}>
                                <td>{s.id}</td>
                                <td>{s.promotion}</td>
                                <td>{s.classe} ({s.specialite})</td>
                                <td>{s.niveau} ({s.semestre})</td>
                                <td>{s.date_debut.split('T')[0]} au {s.date_fin.split('T')[0]}</td>
                                <td>{s.id_coordinateur}</td>
                                <td className="table-action-buttons">
                                    <button 
                                        onClick={() => handleOpenModal(s)}
                                        className="edit-button"
                                        disabled={loading}
                                    >
                                        Modifier
                                    </button>
                                    <button 
                                        onClick={() => handleRemove(s.id, s.promotion)}
                                        className="delete-button"
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
                <p className="no-data-message">Aucune session trouvée.</p>
            )}
        </div>
    );
}

export default SessionManagement;
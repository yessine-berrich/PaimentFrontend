import React, { useState, useEffect, useCallback } from 'react';
import './SessionManagement.css'; 
import { 
    getUsersByRole, 
    createSession, 
    getAllSessions,
    updateSession, 
    deleteSession,
    assignTrainersToSession 
} from '../../api/service'; 
import { userRole } from '../../utils/constants'; 

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
    const [allTrainers, setAllTrainers] = useState([]); 
    const [sessions, setSessions] = useState([]);
    
    const [formData, setFormData] = useState(initialSessionData); 
    const [editingId, setEditingId] = useState(null); 
    const [isModalOpen, setIsModalOpen] = useState(false); 

    // États pour l'affectation
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false); 
    const [sessionToAssign, setSessionToAssign] = useState(null); 
    const [selectedTrainerIds, setSelectedTrainerIds] = useState([]); 
    // const [currentAssignedIds, setCurrentAssignedIds] = useState([]); // Non utilisé, mais peut être utile pour le debug

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    // --- Fonctions de Récupération de Données ---

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Assurez-vous que l'API retourne la relation `sessionFormateurs`
            const data = await getAllSessions(token);
            setSessions(data);
        } catch (err) {
            setError(prev => prev || "Erreur lors du chargement des sessions existantes.");
        } finally {
            setLoading(false);
        }
    }, [token]);
    
    const fetchUsers = useCallback(async () => {
        try {
            // 1. Récupérer les coordinateurs
            const coordData = await getUsersByRole(userRole.COORDINATEUR, token);
            setCoordinators(coordData);
            
            // Initialiser le coordinateur par défaut si possible
            if (coordData.length > 0 && formData.id_coordinateur === '') {
                setFormData(prev => ({ ...prev, id_coordinateur: coordData[0].id.toString() }));
            }
            
            // 2. Récupérer tous les formateurs
            const trainerData = await getUsersByRole(userRole.FORMATEUR, token);
            setAllTrainers(trainerData);

        } catch (err) {
            setError(prev => prev || "Impossible de charger la liste des utilisateurs (Coordinateurs/Formateurs).");
        }
    }, [token, formData.id_coordinateur]);


    useEffect(() => {
        if (token) {
            fetchUsers();
            fetchSessions();
        }
    }, [token, fetchUsers, fetchSessions]); 

    // --- Gestion du Formulaire (Création/Modification) ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setMessage(null);
        setError(null);
    };

    const handleOpenModal = (session = null) => {
        if (session) {
            setEditingId(session.id);
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
            let defaultData = initialSessionData;
            if (coordinators.length > 0) {
                defaultData = { ...defaultData, id_coordinateur: coordinators[0].id.toString() };
            }
            setFormData(defaultData);
            setMessage("Création d'une nouvelle session.");
        }
        setError(null);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        let defaultData = initialSessionData;
        if (coordinators.length > 0) {
            defaultData = { ...defaultData, id_coordinateur: coordinators[0].id.toString() };
        }
        setFormData(defaultData);
        setMessage(null);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);
        
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
            
            if (editingId) {
                // Filtrer les champs vides pour n'envoyer que ce qui est modifié (PATCH)
                dataToSend = Object.entries(dataToSend).reduce((acc, [key, value]) => {
                    if (value !== '' && value !== null && value !== undefined) {
                        acc[key] = value;
                    }
                    return acc;
                }, {});
                
                const idToUpdate = parseInt(editingId, 10); 
                
                await updateSession(idToUpdate, dataToSend, token);
                setMessage("Session modifiée avec succès !");
            } else {
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

    // --- Gestion de l'Affectation des Formateurs ---

    const handleOpenAssignModal = (session) => {
        setSessionToAssign(session);
        
        // Récupérer les IDs des formateurs déjà affectés à cette session
        const assignedIds = (session.sessionFormateurs || []).map(sf => sf.id_formateur);
        // setCurrentAssignedIds(assignedIds); // Vous pouvez le laisser en commentaire
        setSelectedTrainerIds(assignedIds); // Initialiser l'état de sélection avec les formateurs déjà affectés
        
        setIsAssignModalOpen(true);
        setError(null);
        setMessage(null);
    };

    const handleCloseAssignModal = () => {
        setIsAssignModalOpen(false);
        setSessionToAssign(null);
        setSelectedTrainerIds([]);
        // setCurrentAssignedIds([]);
        setError(null);
    };
    
    const handleTrainerSelection = (trainerId) => {
        const idNum = parseInt(trainerId, 10);
        // Logique de bascule (toggle)
        setSelectedTrainerIds(prevIds => 
            prevIds.includes(idNum)
                ? prevIds.filter(id => id !== idNum) // Désélectionner
                : [...prevIds, idNum] // Sélectionner
        );
        setError(null);
    };

    const handleAssignSubmit = async () => {
        if (!sessionToAssign) return;

        setLoading(true);
        setError(null);
        setMessage(null);

        const trainersToAssign = selectedTrainerIds; 

        if (trainersToAssign.length === 0) {
            setError("Veuillez sélectionner au moins un formateur.");
            setLoading(false);
            return;
        }

        try {
            await assignTrainersToSession(sessionToAssign.id, trainersToAssign, token);
            setMessage(`Affectation des formateurs à la session ${sessionToAssign.promotion} réussie !`);
            
            handleCloseAssignModal();
            await fetchSessions(); 

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Échec de l'affectation des formateurs.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // --- Rendu ---
    
    if (loading && sessions.length === 0) {
        return <p>⏳ Chargement des données de gestion des sessions...</p>;
    }

    // Fonction d'aide pour afficher le nom du coordinateur
    const getCoordinatorName = (id_coordinateur) => {
        const coord = coordinators.find(c => c.id === id_coordinateur);
        return coord ? `${coord.nom} ${coord.prenom}` : `ID: ${id_coordinateur}`;
    };

    return (
        <div className="session-container">
            <h2>Gestion des Sessions 📅</h2>
            
            {/* Messages de feedback au niveau principal */}
            {message && <p className="feedback-message success-message">✅ {message}</p>}
            {error && !isModalOpen && !isAssignModalOpen && <p className="feedback-message error-message">🛑 {error}</p>}
            
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
            
            {/* --- Dialogue Modal pour AFFECTATION --- */}
            {isAssignModalOpen && sessionToAssign && (
                <div className="modal-overlay">
                    <div className="modal-content assignment-modal">
                        <h3>Affecter Formateurs à : {sessionToAssign.promotion}</h3>
                        
                        {error && <p className="feedback-message error-message">{error}</p>}
                        
                        <div className="assignment-body">
                            {allTrainers.length === 0 ? (
                                <p>Aucun formateur trouvé.</p>
                            ) : (
                                <div className="trainer-list-container">
                                    <h4>Sélectionnez un ou plusieurs formateurs :</h4>
                                    <div className="trainer-list">
                                        {allTrainers.map(trainer => {
                                            const isSelected = selectedTrainerIds.includes(trainer.id);
                                            return (
                                                // 🚨 CORRECTION : Le div parent gère le toggle pour une meilleure UX
                                                <div 
                                                    key={trainer.id} 
                                                    className={`trainer-item ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => handleTrainerSelection(trainer.id)}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected}
                                                        // Empêche le double-toggle et laisse le div parent gérer l'état
                                                        readOnly 
                                                    />
                                                    <span className="trainer-name">{trainer.nom} {trainer.prenom}</span>
                                                    <span className="trainer-email">({trainer.email})</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-buttons">
                            <button type="button" onClick={handleCloseAssignModal} className="cancel-button">
                                Annuler
                            </button>
                            <button 
                                onClick={handleAssignSubmit} 
                                disabled={loading || selectedTrainerIds.length === 0} 
                                className="main-action-button"
                            >
                                {loading ? "Affectation en cours..." : `Affecter (${selectedTrainerIds.length}) Formateur(s)`}
                            </button>
                        </div>
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
                            <th className="th">Coordinateur</th>
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
                                <td>{getCoordinatorName(s.id_coordinateur)}</td>
                                <td className="table-action-buttons">
                                    
                                    <button 
                                        onClick={() => handleOpenAssignModal(s)}
                                        className="assign-button" 
                                        disabled={loading}
                                    >
                                        Affecter Formateurs ({s.sessionFormateurs?.length || 0})
                                    </button>
                                    
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
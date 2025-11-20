import React, { useState, useContext, useEffect } from 'react';
// 👈 N'oubliez pas d'importer le CSS
import './Profile.css'; 

// Remplacez par le chemin réel si l'API est locale
// import { updateProfile } from '../../api/service'; 

// Simuler la fonction de mise à jour pour que le code soit auto-suffisant
const updateProfile = async (updateDto, token) => {
    return new Promise(resolve => setTimeout(() => {
        console.log('API called with DTO:', updateDto);
        resolve({
            /* Simuler la réponse de l'utilisateur mis à jour */
            email: updateDto.email || 'user@example.com',
            coordonneesBancaires: {
                rib: updateDto.rib || 'RIB_simule',
                banque: updateDto.banque || 'Banque_simulee',
            }
        });
    }, 1500));
};

function Profile({ adminUser }) {
    // Récupérer le token pour les appels PUT (Simulé ici)
    const token = 'simulated-jwt-token';
    
    // 1. État du formulaire initialisé avec les données de l'utilisateur
    const [formData, setFormData] = useState({
        email: adminUser.email || '',
        rib: adminUser.coordonneesBancaires?.rib || '',
        banque: adminUser.coordonneesBancaires?.banque || '',
        password: '',
        newPassword: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    // Synchroniser l'état local avec les props si elles changent
    useEffect(() => {
        setFormData({
            email: adminUser.email || '',
            rib: adminUser.coordonneesBancaires?.rib || '',
            banque: adminUser.coordonneesBancaires?.banque || '',
            password: '',
            newPassword: '',
        });
    }, [adminUser]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage('');
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError(null);

        // 1. Préparation du DTO
        const updateDto = {};
        if (formData.email && formData.email !== adminUser.email) {
            updateDto.email = formData.email;
        }
        if (formData.rib) {
            updateDto.rib = formData.rib;
        }
        if (formData.banque) {
            updateDto.banque = formData.banque;
        }
        if (formData.newPassword) {
            updateDto.password = formData.newPassword; 
        }
        
        if (Object.keys(updateDto).length === 0) {
            setLoading(false);
            setMessage('Aucune modification à sauvegarder.');
            return;
        }

        try {
            // 2. Appel de l'API de mise à jour
            await updateProfile(updateDto, token);
            
            // 3. Succès
            setMessage('Profil mis à jour avec succès !');
            setFormData(prev => ({ ...prev, password: '', newPassword: '' })); 
            
        } catch (err) {
            // 4. Gestion des erreurs
            // Utiliser une chaîne d'erreur simple pour la démo
            const errorMessage = err.message || 'Échec de la mise à jour du profil.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const bancaire = adminUser.coordonneesBancaires || {};

    return (
        <div className="view-content">
            <h2>👤 Mon Profil ({adminUser.role})</h2>
            
            {/* Remplacement des styles inline pour les messages */}
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            {/* Remplacement de style={styles.form} par className="profile-form" */}
            <form onSubmit={handleSubmit} className="profile-form">
                
                {/* --- Informations d'Identité (Lectures seule) --- */}
                {/* Remplacement de style={styles.group} par className="form-group" */}
                <div className="form-group">
                    <label>Nom :</label>
                    {/* Remplacement de style={styles.inputDisabled} par className="input-disabled" */}
                    <input type="text" value={adminUser.nom} disabled className="input-disabled" />
                </div>
                <div className="form-group">
                    <label>Prénom :</label>
                    <input type="text" value={adminUser.prenom} disabled className="input-disabled" />
                </div>
                
                {/* --- Informations de Contact (Modifiable) --- */}
                <div className="form-group">
                    <label htmlFor="email">Email (modifiez si nécessaire) :</label>
                    <input 
                        id="email"
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        className="form-input"
                    />
                </div>

                {/* --- Mots de passe (Modifiable) --- */}
                <h3>Modification du Mot de Passe</h3>
                <div className="form-group">
                    <label htmlFor="newPassword">Nouveau Mot de Passe :</label>
                    <input 
                        id="newPassword"
                        name="newPassword" 
                        type="password" 
                        placeholder="Laisser vide si inchangé"
                        value={formData.newPassword} 
                        onChange={handleChange} 
                        className="form-input"
                    />
                </div>

                {/* --- Coordonnées Bancaires (Modifiable) --- */}
                <h3>Coordonnées Bancaires</h3>
                {/* Style inline pour le paragraphe d'information remplacé par une classe ou un style spécifique */}
                <p>N° CIN : {bancaire.n_cin || 'Non disponible'}</p>
                
                <div className="form-group">
                    <label htmlFor="rib">RIB actuel (modifiable) :</label>
                    <input 
                        id="rib"
                        name="rib" 
                        type="text" 
                        value={formData.rib} 
                        onChange={handleChange} 
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="banque">Banque actuelle (modifiable) :</label>
                    <input 
                        id="banque"
                        name="banque" 
                        type="text" 
                        value={formData.banque} 
                        onChange={handleChange} 
                        className="form-input"
                    />
                </div>

                {/* Remplacement de style={styles.submitButton} par className="submit-button" */}
                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? "Sauvegarde en cours..." : "Sauvegarder les modifications"}
                </button>
            </form>
        </div>
    );
}


export default Profile;
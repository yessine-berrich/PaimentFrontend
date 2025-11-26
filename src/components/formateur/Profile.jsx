import React, { useState, useEffect } from 'react';
// Assurez-vous que le chemin d'accès à votre CSS et à l'API est correct
import '../admin/Profile.css'; // Chemin par défaut si Profile.css est dans un dossier 'styles'
import { updateProfile } from '../../api/service'; 

/**
 * Composant de gestion du profil utilisateur.
 * @param {object} props
 * @param {object | null} props.user - Les données de l'utilisateur connecté.
 * @param {function} props.onUserUpdate - Fonction pour mettre à jour l'état 'user' global.
 */
function Profile({ user, onUserUpdate }) {
    // Récupérer le token
    const token = localStorage.getItem('jwtToken'); 
    
    // 1. Initialisation de l'état du formulaire
    // 🚨 Utilisation du chaînage optionnel (?. ) pour éviter l'erreur "Cannot read properties of undefined"
    const [formData, setFormData] = useState({
        email: user?.email || '',
        rib: user?.coordonneesBancaires?.rib || '', 
        banque: user?.coordonneesBancaires?.banque || '',
        oldPassword: '',     
        newPassword: '',     
    });
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    // 2. Synchronisation: Met à jour l'état local du formulaire si la prop 'user' change.
    useEffect(() => {
        // 🚨 Utilisation du chaînage optionnel dans le useEffect
        setFormData({
            email: user?.email || '',
            rib: user?.coordonneesBancaires?.rib || '',
            banque: user?.coordonneesBancaires?.banque || '',
            oldPassword: '', 
            newPassword: '',
        });
    }, [user]); 


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

        // Si l'utilisateur est null, on arrête (sécurité supplémentaire)
        if (!user) {
            setError("Erreur : Les données utilisateur ne sont pas chargées.");
            setLoading(false);
            return;
        }

        // 1. Préparation du DTO pour l'API
        const updateDto = {};
        
        // Champs classiques : n'envoyer que ce qui a changé
        if (formData.email && formData.email !== user.email) {
            updateDto.email = formData.email;
        }
        if (formData.rib && formData.rib !== user.coordonneesBancaires?.rib) {
            updateDto.rib = formData.rib;
        }
        if (formData.banque && formData.banque !== user.coordonneesBancaires?.banque) {
            updateDto.banque = formData.banque;
        }
        
        // Gestion du mot de passe
        if (formData.newPassword) {
            if (!formData.oldPassword) {
                setLoading(false);
                setError('Veuillez entrer votre ancien mot de passe pour le changer.');
                return;
            }
            updateDto.password = formData.newPassword; 
            updateDto.oldPassword = formData.oldPassword; 
        }
        
        if (Object.keys(updateDto).length === 0) {
            setLoading(false);
            setMessage('Aucune modification à sauvegarder.');
            return;
        }

        try {
            // 2. Appel de l'API de mise à jour réelle
            const updatedDataPartial = await updateProfile(updateDto, token);
            
            // 3. Succès et Mise à jour de l'état global
            setMessage('Profil mis à jour avec succès !');
            // Réinitialiser les champs de mot de passe
            setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '' })); 
            
            // Mise à jour de la source de vérité (App.js)
            if (onUserUpdate) {
                const newUserState = {
                    ...user, 
                    ...updatedDataPartial, 
                    coordonneesBancaires: {
                        ...user.coordonneesBancaires, 
                        ...(updatedDataPartial.coordonneesBancaires || {}) 
                    }
                };
                onUserUpdate(newUserState); 
            }
            
        } catch (err) {
            // 4. Gestion des erreurs (Axios/API)
            console.error("Erreur lors de la mise à jour:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Échec de la mise à jour. Vérifiez vos informations.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Assurez-vous que 'user' existe avant d'essayer de lire ses propriétés dans le JSX
    if (!user) {
        return <p>Chargement des données du profil...</p>;
    }

    const bancaire = user.coordonneesBancaires || {}; 

    return (
        <div className="view-content">
            <h2>👤 Mon Profil ({user.role})</h2>
            
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit} className="profile-form">
                
                {/* --- Informations d'Identité (Lectures seule) --- */}
                <div className="form-group">
                    <label>Nom :</label>
                    <input type="text" value={user.nom || ''} disabled className="input-disabled" />
                </div>
                <div className="form-group">
                    <label>Prénom :</label>
                    <input type="text" value={user.prenom || ''} disabled className="input-disabled" />
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
                    <label htmlFor="oldPassword">Ancien Mot de Passe (obligatoire si changement) :</label>
                    <input 
                        id="oldPassword"
                        name="oldPassword" 
                        type="password" 
                        placeholder="Ancien Mot de Passe"
                        value={formData.oldPassword} 
                        onChange={handleChange} 
                        className="form-input"
                    />
                </div>
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

                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? "Sauvegarde en cours..." : "Sauvegarder les modifications"}
                </button>
            </form>
        </div>
    );
}

export default Profile;
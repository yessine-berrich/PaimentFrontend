import React, { useState, useContext, useEffect } from 'react';
import { updateProfile } from '../../api/service'; // Importer la fonction de mise à jour

// 💡 NOTE : Dans une application complète, vous utiliseriez un Context
// pour accéder au token et à la fonction de mise à jour globale.
// Ici, nous récupérons le token du localStorage pour l'appel API.

function Profile({ adminUser }) {
  // Récupérer le token pour les appels PUT
  const token = localStorage.getItem('jwtToken');
  
  // 1. État du formulaire initialisé avec les données de l'utilisateur
  const [formData, setFormData] = useState({
    email: adminUser.email || '',
    rib: adminUser.coordonneesBancaires?.rib || '', // Accès aux données bancaires
    banque: adminUser.coordonneesBancaires?.banque || '',
    password: '', // Le mot de passe n'est jamais affiché
    newPassword: '', // Champ pour le nouveau mot de passe
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  // Synchroniser l'état local avec les props si elles changent (important si l'App met à jour l'utilisateur)
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

    // 1. Préparation du DTO : n'envoyer que les champs qui ne sont pas vides
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
    // 🚨 Pour la mise à jour du mot de passe, NestJS peut exiger l'ancien mot de passe
    if (formData.newPassword) {
      // Nous envoyons le nouveau mot de passe sous la clé 'password' pour correspondre au DTO
      updateDto.password = formData.newPassword; 
    }
    
    // Si rien à mettre à jour
    if (Object.keys(updateDto).length === 0) {
      setLoading(false);
      setMessage('Aucune modification à sauvegarder.');
      return;
    }

    try {
      // 2. Appel de l'API de mise à jour
      const updatedUser = await updateProfile(updateDto, token);
      
      // 3. Succès
      setMessage('Profil mis à jour avec succès !');
      // Réinitialiser les champs sensibles
      setFormData(prev => ({ ...prev, password: '', newPassword: '' })); 
      
      // 💡 Optionnel : Déclencher une mise à jour dans App.jsx pour rafraîchir l'utilisateur global
      // (Cela nécessite une fonction passée en prop ou un système de contexte)

    } catch (err) {
      // 4. Gestion des erreurs
      const errorMessage = err.response?.data?.message || 'Échec de la mise à jour du profil.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 💡 Assurez-vous que l'objet user contient bien l'objet coordonneesBancaires
  const bancaire = adminUser.coordonneesBancaires || {};

  return (
    <div className="view-content">
      <h2>👤 Mon Profil ({adminUser.role})</h2>
      
      {message && <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>}
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        
        {/* --- Informations d'Identité (Lectures seule, sauf si la route le permet) --- */}
        <div style={styles.group}>
          <label>Nom :</label>
          <input type="text" value={adminUser.nom} disabled style={styles.inputDisabled} />
        </div>
        <div style={styles.group}>
          <label>Prénom :</label>
          <input type="text" value={adminUser.prenom} disabled style={styles.inputDisabled} />
        </div>
        
        {/* --- Informations de Contact (Modifiable) --- */}
        <div style={styles.group}>
          <label htmlFor="email">Email (modifiez si nécessaire) :</label>
          <input 
            id="email"
            name="email" 
            type="email" 
            value={formData.email} 
            onChange={handleChange} 
            style={styles.input}
          />
        </div>

        {/* --- Mots de passe (Modifiable) --- */}
        <h3>Modification du Mot de Passe</h3>
        <div style={styles.group}>
          <label htmlFor="newPassword">Nouveau Mot de Passe :</label>
          <input 
            id="newPassword"
            name="newPassword" 
            type="password" 
            placeholder="Laisser vide si inchangé"
            value={formData.newPassword} 
            onChange={handleChange} 
            style={styles.input}
          />
        </div>

        {/* --- Coordonnées Bancaires (Modifiable) --- */}
        <h3>Coordonnées Bancaires</h3>
        <p style={{ fontSize: '0.9em', color: '#555' }}>N° CIN : {bancaire.n_cin || 'Non disponible'}</p>
        
        <div style={styles.group}>
          <label htmlFor="rib">RIB actuel (modifiable) :</label>
          <input 
            id="rib"
            name="rib" 
            type="text" 
            value={formData.rib} 
            onChange={handleChange} 
            style={styles.input}
          />
        </div>
        <div style={styles.group}>
          <label htmlFor="banque">Banque actuelle (modifiable) :</label>
          <input 
            id="banque"
            name="banque" 
            type="text" 
            value={formData.banque} 
            onChange={handleChange} 
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={loading} style={styles.submitButton}>
          {loading ? "Sauvegarde en cours..." : "Sauvegarder les modifications"}
        </button>
      </form>
    </div>
  );
}

const styles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        maxWidth: '500px',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
    },
    group: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '10px',
        marginTop: '5px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    },
    inputDisabled: {
        padding: '10px',
        marginTop: '5px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#f1f1f1',
        color: '#666',
    },
    submitButton: {
        padding: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '20px',
    },
};

export default Profile;
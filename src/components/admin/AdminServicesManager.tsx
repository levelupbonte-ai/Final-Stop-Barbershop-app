import { useState, useEffect, FormEvent } from 'react';
import { 
  DollarSign, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  RotateCcw, 
  Scissors, 
  Clock, 
  Search, 
  AlertCircle,
  Sparkles,
  Tag
} from 'lucide-react';
import { 
  getCustomServices, 
  saveCustomService, 
  updateServicePrice, 
  deleteCustomService, 
  resetServicesToDefault 
} from '../../lib/firestoreService';
import { ServiceItem } from '../../data/services';

export default function AdminServicesManager() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDuration, setEditDuration] = useState<number>(30);
  const [editDesc, setEditDesc] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // New service form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState<number>(35);
  const [newDuration, setNewDuration] = useState<number>(30);
  const [newCategory, setNewCategory] = useState<string>('Coupes Hommes');
  const [newDesc, setNewDesc] = useState('');
  const [newBarber, setNewBarber] = useState<'Mika' | 'Lusca' | 'Both'>('Both');
  const [isAdding, setIsAdding] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const list = await getCustomServices();
      setServices(list);
    } catch (err) {
      console.error('Error fetching custom services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const categories = Array.from(new Set(services.map((s) => s.category || 'Général')));

  const filteredServices = services.filter((s) => {
    const sTitle = s.name || s.title || '';
    const matchesSearch = sTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleStartEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    const numPrice = typeof service.price === 'number' 
      ? service.price 
      : (service.numericPrice || Number(String(service.price).replace(/[^0-9]/g, '')) || 0);
    setEditPrice(numPrice);
    const numDur = service.durationMinutes || parseInt(String(service.duration).replace(/[^0-9]/g, '')) || 30;
    setEditDuration(numDur);
    setEditDesc(service.description || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPrice(0);
    setEditDuration(30);
    setEditDesc('');
  };

  const handleSavePrice = async (service: ServiceItem) => {
    setIsUpdating(true);
    setNotification(null);
    const displayName = service.name || service.title || 'Prestation';
    try {
      const priceStr = `$${editPrice}`;
      const durStr = `${editDuration} min`;
      await updateServicePrice(service.id, priceStr, editPrice, durStr, editDesc);
      setNotification({
        type: 'success',
        text: `Tarif pour "${displayName}" mis à jour : ${editPrice}$ (${editDuration} min). Synchronisé sur le site public !`
      });
      setEditingId(null);
      await loadServices();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: 'Erreur lors de la mise à jour du tarif. Veuillez réessayer.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNewService = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsAdding(true);
    setNotification(null);
    try {
      const newId = `custom_${Date.now()}_${newTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15)}`;
      const newService: ServiceItem = {
        id: newId,
        name: newTitle.trim(),
        title: newTitle.trim(),
        price: `$${newPrice}`,
        numericPrice: Number(newPrice),
        duration: `${newDuration} min`,
        durationMinutes: Number(newDuration),
        category: newCategory,
        description: newDesc.trim() || 'Prestation professionnelle réalisée par l\'équipe Final Stop.',
        barberPreference: newBarber,
        inclusions: ['Prestation professionnelle']
      };

      await saveCustomService(newService);
      setNotification({
        type: 'success',
        text: `Nouvelle prestation "${newTitle}" ajoutée au catalogue avec succès !`
      });

      // Reset form
      setNewTitle('');
      setNewPrice(35);
      setNewDuration(30);
      setNewDesc('');
      setShowAddForm(false);
      await loadServices();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: 'Erreur lors de la création de la prestation. Veuillez réessayer.'
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (service: ServiceItem) => {
    const displayName = service.name || service.title || 'Prestation';
    if (!window.confirm(`Supprimer définitivement la prestation "${displayName}" ?`)) return;
    try {
      await deleteCustomService(service.id);
      setNotification({
        type: 'success',
        text: `Prestation "${displayName}" supprimée.`
      });
      await loadServices();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: 'Erreur lors de la suppression de la prestation.'
      });
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Voulez-vous réinitialiser tous les tarifs aux valeurs officielles d\'origine ? Cette action effacera les modifications personnalisées.')) {
      return;
    }
    setIsLoading(true);
    try {
      await resetServicesToDefault();
      setNotification({
        type: 'success',
        text: 'Tous les tarifs ont été réinitialisés aux valeurs standards du salon.'
      });
      await loadServices();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: 'Erreur lors de la réinitialisation des tarifs.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="bg-[#141418] border border-white/10 p-5 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-gold" />
            <h3 className="text-lg font-serif font-bold text-white">
              Gestionnaire des Tarifs & Prestations
            </h3>
          </div>
          <p className="text-xs text-gray-400">
            Ajustez en direct les prix, durées et descriptions visibles par vos clients sur la grille tarifaire et le module de réservation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs font-mono uppercase tracking-wider rounded-xs flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une prestation</span>
          </button>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-bold text-xs font-mono uppercase rounded-xs flex items-center gap-1.5 cursor-pointer"
            title="Réinitialiser aux tarifs d'origine"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-xs text-xs font-mono flex items-center justify-between gap-3 ${
          notification.type === 'success' 
            ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300' 
            : 'bg-red-950/40 border border-red-500/40 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{notification.text}</span>
          </div>
          <button 
            type="button"
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-white cursor-pointer bg-transparent border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add New Service Collapsible Form */}
      {showAddForm && (
        <form onSubmit={handleAddNewService} className="bg-[#18181E] border border-gold/40 p-6 rounded-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="text-sm font-bold text-gold uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <span>Nouvelle Prestation / Forfait</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-white cursor-pointer bg-transparent border-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                Intitulé de la prestation *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Dégradé Laser + Soin Barbe"
                className="w-full bg-black/60 border border-white/15 focus:border-gold px-3 py-2 text-xs text-white rounded-xs outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                Prix en Dollars ($) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/15 focus:border-gold px-3 py-2 text-xs text-white rounded-xs outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                Durée (Minutes) *
              </label>
              <input
                type="number"
                min="5"
                step="5"
                required
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/15 focus:border-gold px-3 py-2 text-xs text-white rounded-xs outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                Barbier assigné
              </label>
              <select
                value={newBarber}
                onChange={(e) => setNewBarber(e.target.value as any)}
                className="w-full bg-black/60 border border-white/15 focus:border-gold px-3 py-2 text-xs text-white rounded-xs outline-none font-mono"
              >
                <option value="Both">Mika & Lusca (Tous)</option>
                <option value="Lusca">Lusca (Coupes & Barbes)</option>
                <option value="Mika">Mika (Tresses & Soins)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                Catégorie de prestation
              </label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Ex: Coupes Hommes, Tresses, Combos..."
                className="w-full bg-black/60 border border-white/15 focus:border-gold px-3 py-2 text-xs text-white rounded-xs outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                Description du soin / technique
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Ex: Finitions rasoir coupe-choux, serviette chaude et talc parfumé."
                className="w-full bg-black/60 border border-white/15 focus:border-gold px-3 py-2 text-xs text-white rounded-xs outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono uppercase rounded-xs cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="px-5 py-2 bg-gold hover:bg-gold-light text-black font-bold text-xs font-mono uppercase tracking-wider rounded-xs cursor-pointer shadow-md disabled:opacity-50"
            >
              {isAdding ? 'Enregistrement...' : 'Enregistrer la prestation'}
            </button>
          </div>
        </form>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une coupe, tresse ou soin..."
            className="w-full bg-[#141418] border border-white/15 focus:border-gold pl-9 pr-4 py-2 text-xs text-white rounded-xs outline-none font-mono placeholder-gray-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-[11px] font-mono uppercase rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-gold text-black font-bold'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            Tous ({services.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-[11px] font-mono uppercase rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-gold text-black font-bold'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-[#141418] border border-white/10 rounded-xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs font-mono text-gray-400">
            Chargement des prestations en cours...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-gray-400 space-y-2">
            <AlertCircle className="w-6 h-6 text-gold/60 mx-auto" />
            <p>Aucune prestation ne correspond à votre filtre.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-[11px] uppercase bg-black/40">
                  <th className="py-3 px-4">Prestation</th>
                  <th className="py-3 px-3">Catégorie</th>
                  <th className="py-3 px-3">Barbier</th>
                  <th className="py-3 px-3">Durée</th>
                  <th className="py-3 px-3">Tarif Actuel</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredServices.map((service) => {
                  const isEditing = editingId === service.id;

                  return (
                    <tr key={service.id} className="hover:bg-white/5 transition-colors">
                      {/* Title & Description */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white text-sm">
                          {service.name || service.title}
                        </p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Description..."
                            className="mt-1 w-full bg-black/60 border border-gold/40 px-2 py-1 text-[11px] text-gray-200 rounded-xs outline-none"
                          />
                        ) : (
                          <p className="text-[11px] text-gray-400 font-sans line-clamp-1 mt-0.5">
                            {service.description || 'Prestation salon standard'}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-gray-300">
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-xs text-[10px] text-gray-300">
                          {service.category || 'Général'}
                        </span>
                      </td>

                      {/* Barber Preference */}
                      <td className="py-3.5 px-3">
                        <span className="text-gold font-bold text-[11px]">
                          {service.barberPreference === 'Mika'
                            ? 'Mika (Tresses)'
                            : service.barberPreference === 'Lusca'
                            ? 'Lusca (Coupes)'
                            : 'Tous Barbiers'}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="5"
                              step="5"
                              value={editDuration}
                              onChange={(e) => setEditDuration(Number(e.target.value))}
                              className="w-16 bg-black/60 border border-gold px-2 py-1 text-xs text-white rounded-xs font-mono outline-none"
                            />
                            <span className="text-[10px] text-gray-400">min</span>
                          </div>
                        ) : (
                          <span className="text-gray-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span>{service.durationMinutes || 30} min</span>
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-gold font-bold">$</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={editPrice}
                              onChange={(e) => setEditPrice(Number(e.target.value))}
                              className="w-20 bg-black/60 border border-gold px-2 py-1 text-xs text-gold font-bold rounded-xs font-mono outline-none"
                            />
                          </div>
                        ) : (
                          <span className="text-gold font-bold text-sm bg-gold/10 border border-gold/30 px-2 py-0.5 rounded-xs">
                            ${service.price}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSavePrice(service)}
                              disabled={isUpdating}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xs flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                              title="Valider la modification"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Sauvegarder</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="p-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-xs cursor-pointer"
                              title="Annuler"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(service)}
                              className="p-1.5 bg-white/5 hover:bg-gold hover:text-black text-gray-300 border border-white/10 rounded-xs transition-colors cursor-pointer"
                              title="Modifier le tarif et la durée"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {service.id.startsWith('custom_') && (
                              <button
                                type="button"
                                onClick={() => handleDelete(service)}
                                className="p-1.5 bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 rounded-xs transition-colors cursor-pointer"
                                title="Supprimer la prestation personnalisée"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

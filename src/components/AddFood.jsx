import { useState, useMemo } from 'react'
import { Search, Plus, Clock, TrendingUp, Flame, Pill, Trash2, Edit2 } from 'lucide-react'
import './AddFood.css'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks', 'supplements']

function AddFood({ addEntry, addFood, foods, deleteFood, updateFood }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState('g')
  const [mealType, setMealType] = useState('breakfast')
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
    vitaminA: '',
    vitaminC: '',
    vitaminD: '',
    vitaminE: '',
    vitaminK: '',
    vitaminB6: '',
    vitaminB12: '',
    calcium: '',
    iron: '',
    magnesium: '',
    potassium: '',
    sodium: '',
    zinc: '',
    unit: 'g',
    isSupplement: false
  })
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [editingFood, setEditingFood] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Intelligent recommendations based on usage and search
  const recommendations = useMemo(() => {
    // Filter by meal type and search
    return foods
      .filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesMealType = mealType === 'supplements' ? f.isSupplement : !f.isSupplement
        return matchesSearch && matchesMealType
      })
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 10)
  }, [foods, searchTerm, mealType])

  const handleSelectFood = (food) => {
    setSelectedFood(food)
    setUnit(food.unit || 'g')
    setShowCustomForm(false)
  }

  const handleAddEntry = () => {
    if (!selectedFood || !amount) return

    const multiplier = parseFloat(amount) / 100
    const entry = {
      foodName: selectedFood.name,
      calories: selectedFood.calories * multiplier,
      protein: selectedFood.protein * multiplier,
      carbs: selectedFood.carbs * multiplier,
      fat: selectedFood.fat * multiplier,
      fiber: (selectedFood.fiber || 0) * multiplier,
      sugar: (selectedFood.sugar || 0) * multiplier,
      vitaminA: (selectedFood.vitaminA || 0) * multiplier,
      vitaminC: (selectedFood.vitaminC || 0) * multiplier,
      vitaminD: (selectedFood.vitaminD || 0) * multiplier,
      vitaminE: (selectedFood.vitaminE || 0) * multiplier,
      vitaminK: (selectedFood.vitaminK || 0) * multiplier,
      vitaminB6: (selectedFood.vitaminB6 || 0) * multiplier,
      vitaminB12: (selectedFood.vitaminB12 || 0) * multiplier,
      calcium: (selectedFood.calcium || 0) * multiplier,
      iron: (selectedFood.iron || 0) * multiplier,
      magnesium: (selectedFood.magnesium || 0) * multiplier,
      potassium: (selectedFood.potassium || 0) * multiplier,
      sodium: (selectedFood.sodium || 0) * multiplier,
      zinc: (selectedFood.zinc || 0) * multiplier,
      amount: parseFloat(amount),
      unit: unit,
      mealType: mealType,
      isSupplement: selectedFood.isSupplement || false,
      date: new Date().toISOString()
    }

    addEntry(entry)
    addFood(selectedFood)

    // Reset form
    setSelectedFood(null)
    setAmount('')
    setSearchTerm('')
  }

  const handleAddCustomFood = () => {
    if (!customFood.name || !customFood.calories) return

    const food = {
      name: customFood.name,
      calories: parseFloat(customFood.calories),
      protein: parseFloat(customFood.protein) || 0,
      carbs: parseFloat(customFood.carbs) || 0,
      fat: parseFloat(customFood.fat) || 0,
      fiber: parseFloat(customFood.fiber) || 0,
      sugar: parseFloat(customFood.sugar) || 0,
      vitaminA: parseFloat(customFood.vitaminA) || 0,
      vitaminC: parseFloat(customFood.vitaminC) || 0,
      vitaminD: parseFloat(customFood.vitaminD) || 0,
      vitaminE: parseFloat(customFood.vitaminE) || 0,
      vitaminK: parseFloat(customFood.vitaminK) || 0,
      vitaminB6: parseFloat(customFood.vitaminB6) || 0,
      vitaminB12: parseFloat(customFood.vitaminB12) || 0,
      calcium: parseFloat(customFood.calcium) || 0,
      iron: parseFloat(customFood.iron) || 0,
      magnesium: parseFloat(customFood.magnesium) || 0,
      potassium: parseFloat(customFood.potassium) || 0,
      sodium: parseFloat(customFood.sodium) || 0,
      zinc: parseFloat(customFood.zinc) || 0,
      unit: customFood.unit,
      isSupplement: customFood.isSupplement
    }

    if (editingFood) {
      updateFood(editingFood.id, food)
      setEditingFood(null)
    } else {
      addFood(food)
    }

    setSelectedFood(food)
    setUnit(food.unit)
    setShowCustomForm(false)
    setCustomFood({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sugar: '',
      vitaminA: '',
      vitaminC: '',
      vitaminD: '',
      vitaminE: '',
      vitaminK: '',
      vitaminB6: '',
      vitaminB12: '',
      calcium: '',
      iron: '',
      magnesium: '',
      potassium: '',
      sodium: '',
      zinc: '',
      unit: 'g',
      isSupplement: false
    })
  }

  const handleEditFood = (food, e) => {
    e.stopPropagation()
    setEditingFood(food)
    setCustomFood({
      name: food.name,
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbs: food.carbs.toString(),
      fat: food.fat.toString(),
      fiber: (food.fiber || 0).toString(),
      sugar: (food.sugar || 0).toString(),
      vitaminA: (food.vitaminA || 0).toString(),
      vitaminC: (food.vitaminC || 0).toString(),
      vitaminD: (food.vitaminD || 0).toString(),
      vitaminE: (food.vitaminE || 0).toString(),
      vitaminK: (food.vitaminK || 0).toString(),
      vitaminB6: (food.vitaminB6 || 0).toString(),
      vitaminB12: (food.vitaminB12 || 0).toString(),
      calcium: (food.calcium || 0).toString(),
      iron: (food.iron || 0).toString(),
      magnesium: (food.magnesium || 0).toString(),
      potassium: (food.potassium || 0).toString(),
      sodium: (food.sodium || 0).toString(),
      zinc: (food.zinc || 0).toString(),
      unit: food.unit,
      isSupplement: food.isSupplement || false
    })
    setShowCustomForm(true)
  }

  const handleDeleteFood = (foodId) => {
    deleteFood(foodId)
    setDeleteConfirm(null)
    if (selectedFood?.id === foodId) {
      setSelectedFood(null)
    }
  }

  return (
    <div className="add-food">
      {deleteConfirm && (
        <div className="delete-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Food?</h3>
            <p>Are you sure you want to delete this food from your database? This action cannot be undone.</p>
            <div className="delete-modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn-delete" onClick={() => handleDeleteFood(deleteConfirm)}>
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="add-food-header">
        <h2>Add Food Entry</h2>
        <p className="subtitle">Track your meals with precision</p>
      </div>

      <div className="meal-type-selector">
        {MEAL_TYPES.map(type => (
          <button
            key={type}
            className={`meal-btn ${mealType === type ? 'active' : ''} ${type === 'supplements' ? 'supplement-btn' : ''}`}
            onClick={() => setMealType(type)}
          >
            {type === 'supplements' && <Pill size={16} />}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="action-buttons">
        <button
          className="add-new-food-btn"
          onClick={() => {
            setShowCustomForm(true)
            setCustomFood({ ...customFood, isSupplement: mealType === 'supplements' })
          }}
        >
          <Plus size={20} />
          Add New {mealType === 'supplements' ? 'Supplement' : 'Food'}
        </button>
      </div>

      <div className="search-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder={mealType === 'supplements' ? 'Search supplements...' : 'Search foods...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showCustomForm ? (
        <div className="card custom-food-form">
          <h3>{editingFood ? 'Edit' : 'Add Custom'} {customFood.isSupplement ? 'Supplement' : 'Food'}</h3>

          <div className="form-section">
            <h4>Basic Information</h4>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Name"
                value={customFood.name}
                onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
              />
              <div className="input-group">
                <input
                  type="number"
                  placeholder="Calories"
                  value={customFood.calories}
                  onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                />
                <span className="input-suffix">per 100{customFood.unit}</span>
              </div>
              <select
                value={customFood.unit}
                onChange={(e) => setCustomFood({ ...customFood, unit: e.target.value })}
              >
                <option value="g">Grams (g)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="serving">Serving</option>
                <option value="pill">Pill/Capsule</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h4>Macronutrients</h4>
            <div className="form-grid">
              <input
                type="number"
                placeholder="Protein (g)"
                value={customFood.protein}
                onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
              />
              <input
                type="number"
                placeholder="Carbs (g)"
                value={customFood.carbs}
                onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
              />
              <input
                type="number"
                placeholder="Fat (g)"
                value={customFood.fat}
                onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })}
              />
              <input
                type="number"
                placeholder="Fiber (g)"
                value={customFood.fiber}
                onChange={(e) => setCustomFood({ ...customFood, fiber: e.target.value })}
              />
              <input
                type="number"
                placeholder="Sugar (g)"
                value={customFood.sugar}
                onChange={(e) => setCustomFood({ ...customFood, sugar: e.target.value })}
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Vitamins</h4>
            <div className="form-grid">
              <input
                type="number"
                placeholder="Vitamin A (μg)"
                value={customFood.vitaminA}
                onChange={(e) => setCustomFood({ ...customFood, vitaminA: e.target.value })}
              />
              <input
                type="number"
                placeholder="Vitamin C (mg)"
                value={customFood.vitaminC}
                onChange={(e) => setCustomFood({ ...customFood, vitaminC: e.target.value })}
              />
              <input
                type="number"
                placeholder="Vitamin D (μg)"
                value={customFood.vitaminD}
                onChange={(e) => setCustomFood({ ...customFood, vitaminD: e.target.value })}
              />
              <input
                type="number"
                placeholder="Vitamin E (mg)"
                value={customFood.vitaminE}
                onChange={(e) => setCustomFood({ ...customFood, vitaminE: e.target.value })}
              />
              <input
                type="number"
                placeholder="Vitamin K (μg)"
                value={customFood.vitaminK}
                onChange={(e) => setCustomFood({ ...customFood, vitaminK: e.target.value })}
              />
              <input
                type="number"
                placeholder="Vitamin B6 (mg)"
                value={customFood.vitaminB6}
                onChange={(e) => setCustomFood({ ...customFood, vitaminB6: e.target.value })}
              />
              <input
                type="number"
                placeholder="Vitamin B12 (μg)"
                value={customFood.vitaminB12}
                onChange={(e) => setCustomFood({ ...customFood, vitaminB12: e.target.value })}
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Minerals</h4>
            <div className="form-grid">
              <input
                type="number"
                placeholder="Calcium (mg)"
                value={customFood.calcium}
                onChange={(e) => setCustomFood({ ...customFood, calcium: e.target.value })}
              />
              <input
                type="number"
                placeholder="Iron (mg)"
                value={customFood.iron}
                onChange={(e) => setCustomFood({ ...customFood, iron: e.target.value })}
              />
              <input
                type="number"
                placeholder="Magnesium (mg)"
                value={customFood.magnesium}
                onChange={(e) => setCustomFood({ ...customFood, magnesium: e.target.value })}
              />
              <input
                type="number"
                placeholder="Potassium (mg)"
                value={customFood.potassium}
                onChange={(e) => setCustomFood({ ...customFood, potassium: e.target.value })}
              />
              <input
                type="number"
                placeholder="Sodium (mg)"
                value={customFood.sodium}
                onChange={(e) => setCustomFood({ ...customFood, sodium: e.target.value })}
              />
              <input
                type="number"
                placeholder="Zinc (mg)"
                value={customFood.zinc}
                onChange={(e) => setCustomFood({ ...customFood, zinc: e.target.value })}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={() => {
              setShowCustomForm(false)
              setEditingFood(null)
            }}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleAddCustomFood}>
              {editingFood ? 'Update' : 'Add'} {customFood.isSupplement ? 'Supplement' : 'Food'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {recommendations.length > 0 && (
            <div className="recommendations">
              <div className="rec-header">
                <TrendingUp size={18} />
                <span>Recommendations</span>
              </div>
              <div className="food-list">
                {recommendations.map(food => (
                  <div
                    key={food.id}
                    className={`food-item ${selectedFood?.id === food.id ? 'selected' : ''} ${food.isSupplement ? 'supplement-item' : ''}`}
                    onClick={() => handleSelectFood(food)}
                  >
                    <div className="food-info">
                      <h4>
                        {food.isSupplement && <Pill size={16} />}
                        {food.name}
                      </h4>
                      <div className="food-stats">
                        <span><Flame size={14} /> {food.calories} cal</span>
                        <span>P: {food.protein}g</span>
                        <span>C: {food.carbs}g</span>
                        <span>F: {food.fat}g</span>
                      </div>
                      <span className="food-unit">per 100{food.unit}</span>
                    </div>
                    <div className="food-actions">
                      {food.usageCount > 0 && (
                        <div className="usage-badge">
                          <Clock size={14} />
                          {food.usageCount}x
                        </div>
                      )}
                      <button
                        className="food-action-btn edit-btn"
                        onClick={(e) => handleEditFood(food, e)}
                        title="Edit food"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="food-action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirm(food.id)
                        }}
                        title="Delete food"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {selectedFood && (
        <div className="card amount-section">
          <h3>Selected: {selectedFood.name}</h3>
          <div className="amount-input-group">
            <div className="input-with-unit">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="1"
              />
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="serving">serving</option>
                <option value="pill">pill</option>
              </select>
            </div>
          </div>

          {amount && (
            <div className="calculated-nutrition">
              <h4>Nutrition ({amount}{unit})</h4>
              <div className="nutrition-grid">
                <div className="nutrition-item">
                  <span className="label">Calories</span>
                  <span className="value">
                    {(selectedFood.calories * parseFloat(amount) / 100).toFixed(0)} cal
                  </span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Protein</span>
                  <span className="value">
                    {(selectedFood.protein * parseFloat(amount) / 100).toFixed(1)}g
                  </span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Carbs</span>
                  <span className="value">
                    {(selectedFood.carbs * parseFloat(amount) / 100).toFixed(1)}g
                  </span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Fat</span>
                  <span className="value">
                    {(selectedFood.fat * parseFloat(amount) / 100).toFixed(1)}g
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            className="btn-primary btn-large"
            onClick={handleAddEntry}
            disabled={!amount}
          >
            <Plus size={20} />
            Add to {mealType}
          </button>
        </div>
      )}
    </div>
  )
}

export default AddFood
import { useEffect, useState } from 'react'
import { Trash2, AlertTriangle, Settings as SettingsIcon, CheckCircle2, RefreshCw, Download } from 'lucide-react'
import { GOAL_OPTIONS, getPresetValues } from '../constants/goalPresets'
import './Settings.css'

function Settings({ clearAllData, goals, updateGoals, defaultGoals, entries, foods, kfaHistory, exercises, achievements }) {
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [goalForm, setGoalForm] = useState({
    focus: goals?.focus ?? defaultGoals.focus ?? 'custom',
    calorieTarget: goals?.calorieTarget ?? defaultGoals.calorieTarget,
    proteinTarget: goals?.proteinTarget ?? defaultGoals.proteinTarget,
    netTarget: goals?.netTarget ?? defaultGoals.netTarget
  })

  useEffect(() => {
    setGoalForm({
      focus: goals?.focus ?? defaultGoals.focus ?? 'custom',
      calorieTarget: goals?.calorieTarget ?? defaultGoals.calorieTarget,
      proteinTarget: goals?.proteinTarget ?? defaultGoals.proteinTarget,
      netTarget: goals?.netTarget ?? defaultGoals.netTarget
    })
  }, [goals, defaultGoals])

  const handleDeleteAll = () => {
    if (confirmText === 'DELETE ALL') {
      clearAllData()
      setDeleteConfirm(false)
      setConfirmText('')
    }
  }

  const updateGoalField = (field, value) => {
    setGoalForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGoalSubmit = (event) => {
    event.preventDefault()
    updateGoals({
      focus: goalForm.focus,
      calorieTarget: Math.max(Number(goalForm.calorieTarget) || 0, 0),
      proteinTarget: Math.max(Number(goalForm.proteinTarget) || 0, 0),
      netTarget: Number(goalForm.netTarget) || 0
    })
  }

  const resetGoals = () => {
    setGoalForm({
      focus: defaultGoals.focus ?? 'custom',
      calorieTarget: defaultGoals.calorieTarget,
      proteinTarget: defaultGoals.proteinTarget,
      netTarget: defaultGoals.netTarget
    })
    updateGoals({ ...defaultGoals })
  }

  const handleFocusChange = (focus) => {
    const presetValues = getPresetValues(focus)
    setGoalForm(prev => ({
      ...prev,
      focus,
      ...presetValues
    }))
  }

  const exportData = () => {
    const exportData = {
      meta: {
        exportDate: new Date().toISOString(),
        version: "1.0.0",
        description: "Complete calorie tracker data export - nutrition, exercise, and body composition history",
        dataTypes: ["food_entries", "exercise_entries", "body_composition", "food_database", "goals", "achievements"]
      },
      user_profile: {
        goals: {
          focus: goals?.focus || 'custom',
          daily_calorie_target: goals?.calorieTarget || 0,
          daily_protein_target: goals?.proteinTarget || 0,
          net_calorie_target: goals?.netTarget || 0
        },
        achievements: {
          current_streak: achievements?.streak || 0,
          total_entries: achievements?.totalEntries || 0,
          perfect_days: achievements?.perfectDays || 0,
          current_level: achievements?.level || 1
        }
      },
      food_entries: entries.map(entry => ({
        id: entry.id,
        date: entry.date,
        meal_type: entry.mealType,
        food_name: entry.foodName,
        nutritional_info: {
          calories: entry.calories,
          protein_g: entry.protein,
          carbohydrates_g: entry.carbs,
          fat_g: entry.fat,
          fiber_g: entry.fiber || null,
          sugar_g: entry.sugar || null,
          sodium_mg: entry.sodium || null
        },
        vitamins_minerals: {
          vitamin_a_mcg: entry.vitaminA || null,
          vitamin_c_mg: entry.vitaminC || null,
          vitamin_d_mcg: entry.vitaminD || null,
          vitamin_e_mg: entry.vitaminE || null,
          vitamin_k_mcg: entry.vitaminK || null,
          vitamin_b6_mg: entry.vitaminB6 || null,
          vitamin_b12_mcg: entry.vitaminB12 || null,
          calcium_mg: entry.calcium || null,
          iron_mg: entry.iron || null,
          magnesium_mg: entry.magnesium || null,
          potassium_mg: entry.potassium || null,
          zinc_mg: entry.zinc || null
        },
        portion_info: {
          amount: entry.amount,
          unit: entry.unit
        }
      })),
      exercise_entries: exercises.map(exercise => ({
        id: exercise.id,
        date: exercise.date,
        exercise_name: exercise.name,
        exercise_type: exercise.type,
        duration_minutes: exercise.duration,
        calories_burned: exercise.calories,
        notes: exercise.notes || null
      })),
      body_composition_history: kfaHistory.map(kfa => ({
        id: kfa.id,
        date: kfa.date,
        body_fat_percentage: kfa.kfa,
        weight_kg: kfa.weight,
        notes: kfa.notes || null
      })),
      food_database: foods.map(food => ({
        id: food.id,
        name: food.name,
        is_supplement: food.isSupplement || false,
        usage_count: food.usageCount || 0,
        nutritional_info_per_100g: {
          calories: food.calories,
          protein_g: food.protein,
          carbohydrates_g: food.carbs,
          fat_g: food.fat,
          fiber_g: food.fiber || null,
          sugar_g: food.sugar || null,
          sodium_mg: food.sodium || null
        },
        vitamins_minerals_per_100g: {
          vitamin_a_mcg: food.vitaminA || null,
          vitamin_c_mg: food.vitaminC || null,
          vitamin_d_mcg: food.vitaminD || null,
          vitamin_e_mg: food.vitaminE || null,
          vitamin_k_mcg: food.vitaminK || null,
          vitamin_b6_mg: food.vitaminB6 || null,
          vitamin_b12_mcg: food.vitaminB12 || null,
          calcium_mg: food.calcium || null,
          iron_mg: food.iron || null,
          magnesium_mg: food.magnesium || null,
          potassium_mg: food.potassium || null,
          zinc_mg: food.zinc || null
        },
        default_unit: food.unit
      })),
      summary_statistics: {
        total_food_entries: entries.length,
        total_exercise_entries: exercises.length,
        total_body_measurements: kfaHistory.length,
        foods_in_database: foods.length,
        date_range: {
          first_entry: entries.length > 0 ? Math.min(...entries.map(e => new Date(e.date).getTime())) : null,
          last_entry: entries.length > 0 ? Math.max(...entries.map(e => new Date(e.date).getTime())) : null
        }
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `calorie-tracker-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="settings">
      {deleteConfirm && (
        <div className="delete-modal-overlay" onClick={() => setDeleteConfirm(false)}>
          <div className="delete-modal danger-modal" onClick={(e) => e.stopPropagation()}>
            <div className="danger-icon">
              <AlertTriangle size={48} />
            </div>
            <h3>Delete All Data?</h3>
            <p className="danger-text">
              This will permanently delete <strong>ALL</strong> of your data including:
            </p>
            <ul className="danger-list">
              <li>All food entries</li>
              <li>All KFA measurements</li>
              <li>Your foods database</li>
              <li>All achievements and statistics</li>
            </ul>
            <p className="danger-warning">
              <strong>This action cannot be undone!</strong>
            </p>
            <div className="confirm-input-group">
              <label htmlFor="confirm">Type <strong>DELETE ALL</strong> to confirm:</label>
              <input
                id="confirm"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE ALL"
                autoComplete="off"
              />
            </div>
            <div className="delete-modal-actions">
              <button className="btn-cancel" onClick={() => {
                setDeleteConfirm(false)
                setConfirmText('')
              }}>
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={handleDeleteAll}
                disabled={confirmText !== 'DELETE ALL'}
              >
                <Trash2 size={18} />
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="settings-header">
        <SettingsIcon size={32} />
        <div>
          <h2>Settings</h2>
          <p className="subtitle">Manage your application settings</p>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-title">
          <CheckCircle2 size={22} />
          <h3>Goal Configuration</h3>
        </div>
        <p className="section-description">
          Tailor your daily targets to match your training or cutting phase. These goals drive the dashboard progress cards.
        </p>

        <form className="goal-form" onSubmit={handleGoalSubmit}>
          <div className="goal-focus-select">
            <label htmlFor="settings-goal-focus">Focus</label>
            <select
              id="settings-goal-focus"
              value={goalForm.focus}
              onChange={(e) => handleFocusChange(e.target.value)}
            >
              {GOAL_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="goal-focus-helper">
              {GOAL_OPTIONS.find(option => option.value === goalForm.focus)?.description}
            </span>
          </div>

          <div className="goal-grid">
            <label className="goal-field">
              <span className="goal-label">Daily Calorie Intake</span>
              <div className="goal-input-wrapper">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={goalForm.calorieTarget}
                  onChange={(e) => updateGoalField('calorieTarget', e.target.value)}
                />
                <span className="goal-unit">kcal</span>
              </div>
              <span className="goal-help">Set your maintenance or bulking target.</span>
            </label>

            <label className="goal-field">
              <span className="goal-label">Daily Protein Target</span>
              <div className="goal-input-wrapper">
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={goalForm.proteinTarget}
                  onChange={(e) => updateGoalField('proteinTarget', e.target.value)}
                />
                <span className="goal-unit">g</span>
              </div>
              <span className="goal-help">Lean mass support goal per day.</span>
            </label>

            <label className="goal-field">
              <span className="goal-label">Net Calorie Goal</span>
              <div className="goal-input-wrapper">
                <input
                  type="number"
                  step="10"
                  value={goalForm.netTarget}
                  onChange={(e) => updateGoalField('netTarget', e.target.value)}
                />
                <span className="goal-unit">kcal</span>
              </div>
              <span className="goal-help">Use a negative value for deficit, positive for surplus.</span>
            </label>
          </div>

          <div className="goal-actions">
            <button type="button" className="btn-secondary" onClick={resetGoals}>
              <RefreshCw size={18} />
              Reset to defaults
            </button>
            <button type="submit" className="btn-primary">
              Save goals
            </button>
          </div>
        </form>
      </div>

      <div className="settings-section danger-section">
        <div className="section-header">
          <AlertTriangle size={24} />
          <h3>Danger Zone</h3>
        </div>
        <p className="section-description">
          Irreversible and destructive actions. Please proceed with caution.
        </p>
        <div className="danger-action">
          <div className="danger-action-info">
            <h4>Delete All Data</h4>
            <p>
              Permanently remove all your tracking data, including food entries, KFA measurements,
              foods database, and achievements. This action cannot be undone.
            </p>
          </div>
          <button className="btn-danger" onClick={() => setDeleteConfirm(true)}>
            <Trash2 size={20} />
            Delete All Data
          </button>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-title">
          <Download size={22} />
          <h3>Data Export</h3>
        </div>
        <p className="section-description">
          Export all your data in a structured JSON format optimized for analysis by AI/LLM tools.
          Includes complete nutrition history, exercise data, body composition measurements, and food database.
        </p>
        <div className="export-action">
          <div className="export-action-info">
            <h4>Export Complete Data</h4>
            <p>
              Downloads a comprehensive JSON file containing all your food entries, exercise history, 
              body composition data, food database, goals, and achievements. Perfect for backup or analysis.
            </p>
          </div>
          <button className="btn-primary" onClick={exportData}>
            <Download size={20} />
            Export Data
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>About</h3>
        <div className="about-info">
          <p><strong>Calorie Tracker</strong></p>
          <p>Version 1.0.0</p>
          <p>A modern calorie and nutrition tracking application</p>
        </div>
      </div>
    </div>
  )
}

export default Settings
